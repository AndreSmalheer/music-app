import { Router } from "express";
import { create } from "youtube-dl-exec";
import { Readable } from "node:stream";

const router = Router();

// Belangrijk: lazily aanmaken. In ES modules draaien de imports van server.js
// VOORDAT server.js zelf dotenv config() aanroept. Als we hier op moduleniveau
// process.env.YTDLP_PATH zouden lezen, is die nog leeg en valt yt-dlp terug op
// PATH ('yt-dlp'). Door dit pas bij het eerste request te doen, is .env geladen.
let _youtubedl;
function getYoutubedl() {
  if (!_youtubedl) {
    // Gebruik het expliciete pad uit .env (YTDLP_PATH), anders 'yt-dlp' van PATH
    _youtubedl = create(process.env.YTDLP_PATH || "yt-dlp");
  }
  return _youtubedl;
}

// GET /api/youtube/search?q=  — zoekt YouTube muziekvideo's via de Data API v3
router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const pageToken = (req.query.pageToken || "").trim();
    const paged = req.query.paged === "true";

    if (!q) {
      return res.json([]);
    }

    const key = process.env.YOUTUBE_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "YOUTUBE_API_KEY ontbreekt",
      });
    }

    const urlMatch = q.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );

    if (urlMatch) {
      const videoId = urlMatch[1];

      const url =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?part=snippet&id=${videoId}&key=${key}`;

      const ytRes = await fetch(url);

      if (!ytRes.ok) {
        const err = await ytRes.json().catch(() => ({}));

        return res.status(ytRes.status).json({
          error: err?.error?.message || "YouTube API fout",
        });
      }

      const data = await ytRes.json();

      const results = (data.items || []).map((item) => ({
        youtubeId: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url,
        type: "youtube",
      }));

      return res.json(results);
    }

    const videosUrl =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&type=video&videoCategoryId=10` +
      `&q=${encodeURIComponent(q)}` +
      `&maxResults=15` +
      `${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}` +
      `&key=${key}`;

    const channelsUrl =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&type=channel` +
      `&q=${encodeURIComponent(q)}` +
      `&maxResults=5&key=${key}`;

    const [channelsRes, ytRes] = await Promise.all([
      pageToken ? Promise.resolve(null) : fetch(channelsUrl),
      fetch(videosUrl),
    ]);

    if (channelsRes && !channelsRes.ok) {
      const err = await channelsRes.json().catch(() => ({}));

      return res.status(channelsRes.status).json({
        error: err?.error?.message || "YouTube API fout",
      });
    }

    if (!ytRes.ok) {
      const err = await ytRes.json().catch(() => ({}));

      return res.status(ytRes.status).json({
        error: err?.error?.message || "YouTube API fout",
      });
    }

    const [channelsData, data] = await Promise.all([
      channelsRes ? channelsRes.json() : Promise.resolve({ items: [] }),
      ytRes.json(),
    ]);

    const channelResults = (channelsData.items || []).map((item) => ({
      youtubeChannelId: item.id.channelId,
      title: item.snippet.channelTitle || item.snippet.title,
      artist: item.snippet.channelTitle || item.snippet.title,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      type: "youtube-artist",
    }));

    const videoResults = (data.items || []).map((item) => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      type: "youtube",
    }));

    const results = [...channelResults, ...videoResults];

    if (paged) {
      return res.json({
        results,
        nextPageToken: data.nextPageToken || null,
      });
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// ---- Audio-URL resolven + cachen --------------------------------------
//
// Voor een werkende tijdbalk/seeking moet de browser de totale lengte kennen
// (Content-Length) én Range-requests kunnen doen. yt-dlp's eigen pipe-stream
// geeft dat niet. Daarom vragen we yt-dlp alleen om de DIRECTE audio-URL van
// de YouTube-CDN (googlevideo) — die ondersteunt Content-Length + Range — en
// proxyen we die zelf, met de Range-header van de browser doorgegeven.

const formatCache = new Map(); // videoId -> { url, mime, expires }

function mimeForExt(ext) {
  if (ext === "m4a" || ext === "mp4") return "audio/mp4";
  if (ext === "webm") return "audio/webm";
  if (ext === "mp3") return "audio/mpeg";
  return "audio/mpeg";
}

function normalizeDuration(duration) {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value > 24 * 60 * 60) return Math.round(value / 1000);
  return Math.round(value);
}

// Eén gedeelde resolve + cache voor de hele backend (stream én song-download
// importeren dit). Zo draait yt-dlp maar één keer per video i.p.v. dubbel.
export async function resolveAudio(videoId) {
  const cached = formatCache.get(videoId);
  if (cached && cached.expires > Date.now()) return cached;

  // m4a (aac) heeft de voorkeur: breed ondersteund (ook Safari/iOS) en seekbaar.
  const info = await getYoutubedl()(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      format: "bestaudio[ext=m4a]/bestaudio",
    },
  );

  if (!info || !info.url) throw new Error("Geen audio-URL gevonden");

  // Verloop: gebruik 'expire' uit de URL (unix-seconden) indien aanwezig,
  // anders max 1 uur cachen.
  let expires = Date.now() + 60 * 60 * 1000;
  const m = /[?&]expire=(\d+)/.exec(info.url);
  if (m) expires = Math.min(expires, parseInt(m[1], 10) * 1000 - 60 * 1000);

  const resolved = {
    url: info.url,
    ext: info.ext,
    mime: mimeForExt(info.ext),
    duration: normalizeDuration(info.duration),
    expires,
  };
  formatCache.set(videoId, resolved);
  return resolved;
}

// Haalt de upstream-stream op; bij een verlopen URL (403/410) één keer opnieuw resolven.
async function fetchUpstream(videoId, rangeHeader, allowRetry = true) {
  const audio = await resolveAudio(videoId);
  const headers = {};
  if (rangeHeader) headers.Range = rangeHeader;

  const upstream = await fetch(audio.url, { headers });
  if ((upstream.status === 403 || upstream.status === 410) && allowRetry) {
    formatCache.delete(videoId);
    return fetchUpstream(videoId, rangeHeader, false);
  }
  return { audio, upstream };
}

// GET /api/youtube/prefetch/:videoId — warmt alleen de audio-URL-cache op
// (geen body). De frontend roept dit aan voor het volgende nummer in de wachtrij
// zodat skip/auto-advance direct speelt i.p.v. ~4s op yt-dlp te wachten.
router.get("/prefetch/:videoId", async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) return res.status(400).json({ error: "Geen videoId" });
  try {
    await resolveAudio(videoId);
    res.status(204).end();
  } catch {
    // Stilletjes falen: prefetch is best-effort, de echte stream probeert opnieuw.
    res.status(204).end();
  }
});

// GET /api/youtube/stream/:videoId — proxyt YouTube-audio met Range-support,
// zodat de tijdbalk werkt en je kunt seeken.
router.get("/stream/:videoId", async (req, res, next) => {
  try {
    const { videoId } = req.params;
    if (!videoId) return res.status(400).json({ error: "Geen videoId" });

    const { audio, upstream } = await fetchUpstream(videoId, req.headers.range);

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(502).json({ error: "Upstream stream fout" });
    }

    // Status spiegelen: 200 (hele body) of 206 (partial → seeking).
    res.status(upstream.status);
    for (const h of [
      "content-length",
      "content-range",
      "accept-ranges",
      "content-type",
    ]) {
      const v = upstream.headers.get(h);
      if (v) res.setHeader(h, v);
    }
    if (!upstream.headers.get("accept-ranges"))
      res.setHeader("Accept-Ranges", "bytes");
    if (!upstream.headers.get("content-type"))
      res.setHeader("Content-Type", audio.mime);

    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.on("error", () => {
      if (res.headersSent) res.end();
    });
    // Stop de stream als de client de verbinding verbreekt (bv. ander nummer).
    req.on("close", () => nodeStream.destroy());

    nodeStream.pipe(res);
  } catch (err) {
    if (err?.code === "ENOENT" && !res.headersSent) {
      return res.status(500).json({
        error:
          "yt-dlp niet gevonden. Installeer het of zet YTDLP_PATH in backend/.env.",
      });
    }
    console.error("yt-dlp Stream Error:", err);
    if (!res.headersSent) return res.status(500).json({ error: "Stream fout" });
    res.end();
  }
});

export default router;
