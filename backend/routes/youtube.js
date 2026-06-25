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

    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&type=video&videoCategoryId=10` +
      `&q=${encodeURIComponent(q)}` +
      `&maxResults=15&key=${key}`;

    const ytRes = await fetch(url);

    if (!ytRes.ok) {
      const err = await ytRes.json().catch(() => ({}));

      return res.status(ytRes.status).json({
        error: err?.error?.message || "YouTube API fout",
      });
    }

    const data = await ytRes.json();

    const results = (data.items || []).map((item) => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      type: "youtube",
    }));

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

async function resolveAudio(videoId) {
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

  const resolved = { url: info.url, mime: mimeForExt(info.ext), expires };
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
