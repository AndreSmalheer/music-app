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

// Korte cache voor zoekresultaten (key -> { results, nextPageToken, expires }).
// Voorkomt dat dezelfde zoekopdracht yt-dlp/de API onnodig opnieuw aanroept
// (Home vuurt bv. bij elke load een zoekopdracht af).
const searchCache = new Map();
const SEARCH_TTL = 10 * 60 * 1000;

// Standaard YouTube-thumbnail uit een videoId — werkt altijd, ook als de bron
// (flat playlist van yt-dlp) zelf geen thumbnail-URL meegeeft.
function thumbForVideo(id) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

// --- Zoeken via de YouTube Data API v3 (quota-gebonden) ------------------
async function searchViaApi(q, pageToken) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY ontbreekt");

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

  if ((channelsRes && !channelsRes.ok) || !ytRes.ok) {
    throw new Error("YouTube API fout (mogelijk quota)");
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

  return {
    results: [...channelResults, ...videoResults],
    nextPageToken: data.nextPageToken || null,
  };
}

// --- Fast Piped & Invidious mirror pool helper ---------------------------
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.privacydev.net",
  "https://pipedapi.mha.fi",
  "https://piped-api.garudalinux.org",
];

function getInvidiousInstances() {
  const instances = [];
  const envUrl = process.env.INVIDIOUS_URL?.trim();
  if (envUrl) {
    instances.push(envUrl);
    if (
      envUrl.startsWith("https://") &&
      /https:\/\/\d+\.\d+\.\d+\.\d+/.test(envUrl)
    ) {
      instances.push(envUrl.replace("https://", "http://"));
    }
  }

  const publicInstances = [
    "https://inv.tux.pizza",
    "https://invidious.drgns.space",
    "https://invidious.nerdvpn.de",
    "https://yewtu.be",
    "https://invidious.privacydev.net",
  ];

  for (const inst of publicInstances) {
    if (!instances.includes(inst)) instances.push(inst);
  }
  return instances;
}

async function searchSingleInvidious(baseUrl, query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const videosUrl =
      `${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}` +
      `&type=video&page=${page}`;

    const channelsUrl =
      `${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}` +
      `&type=channel`;

    const headers = {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "application/json",
    };

    const [channelsRes, videosRes] = await Promise.all([
      page === 1
        ? fetch(channelsUrl, { headers, signal: controller.signal })
        : Promise.resolve(null),
      fetch(videosUrl, { headers, signal: controller.signal }),
    ]);

    clearTimeout(timeoutId);

    if ((channelsRes && !channelsRes.ok) || !videosRes.ok) {
      throw new Error(`Invidious search returned bad status from ${baseUrl}`);
    }

    const [channelsData, videosData] = await Promise.all([
      channelsRes ? channelsRes.json() : Promise.resolve([]),
      videosRes.json(),
    ]);

    const channelResults = (channelsData || []).map((channel) => ({
      youtubeChannelId: channel.authorId,
      title: channel.author,
      artist: channel.author,
      thumbnail:
        channel.authorThumbnails?.find((t) => t.width >= 100)?.url ||
        channel.authorThumbnails?.[channel.authorThumbnails.length - 1]?.url ||
        null,
      type: "youtube-artist",
    }));

    const videoResults = (videosData || []).map((video) => ({
      youtubeId: video.videoId,
      title: video.title,
      artist: video.author,
      thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
      type: "youtube",
      duration: video.lengthSeconds || 0,
    }));

    return {
      results: [...channelResults, ...videoResults],
      nextPageToken: page + 1,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function searchViaInvidious(query, page = 1) {
  const instances = getInvidiousInstances();
  try {
    return await Promise.any(
      instances.map((url) => searchSingleInvidious(url, query, page)),
    );
  } catch (err) {
    throw new Error("All Invidious search mirrors failed");
  }
}

// --- Zoeken via yt-dlp (geen quota; alleen video's, geen kanalen) ---------
async function searchViaYtdlp(q, max = 30) {
  const info = await getYoutubedl()(`ytsearch${max}:${q}`, {
    dumpSingleJson: true,
    flatPlaylist: true,
    noWarnings: true,
  });

  const entries = Array.isArray(info?.entries) ? info.entries : [];
  const results = entries
    .filter((e) => e && e.id)
    .map((e) => ({
      youtubeId: e.id,
      title: e.title || "Onbekend",
      artist: e.channel || e.uploader || "",
      thumbnail: thumbForVideo(e.id),
      type: "youtube",
      duration: e.duration || 0,
    }));

  return { results, nextPageToken: null };
}

// Eén video opzoeken (bij een geplakte YouTube-URL) via yt-dlp.
async function videoViaYtdlp(videoId) {
  const info = await getYoutubedl()(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      skipDownload: true,
    },
  );
  return {
    results: [
      {
        youtubeId: info?.id || videoId,
        title: info?.title || "Onbekend",
        artist: info?.channel || info?.uploader || "",
        thumbnail: thumbForVideo(info?.id || videoId),
        type: "youtube",
      },
    ],
    nextPageToken: null,
  };
}

async function videoViaInvidious(videoId) {
  const instances = getInvidiousInstances();
  try {
    return await Promise.any(
      instances.map(async (baseUrl) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const res = await fetch(`${baseUrl}/api/v1/videos/${videoId}`, {
            headers: {
              "User-Agent": DEFAULT_USER_AGENT,
              Accept: "application/json",
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const info = await res.json();
          return {
            results: [
              {
                youtubeId: info.videoId || videoId,
                title: info.title || "Onbekend",
                artist: info.author || "",
                thumbnail:
                  info.videoThumbnails?.find((t) => t.quality === "medium")
                    ?.url ?? thumbForVideo(videoId),
                type: "youtube",
              },
            ],
            nextPageToken: null,
          };
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      }),
    );
  } catch {
    return videoViaYtdlp(videoId);
  }
}

const matchCache = new Map();

// GET /api/youtube/match
// GET /api/youtube/match
router.get("/match", async (req, res, next) => {
  try {
    const title = (req.query.title || "").trim();
    const artist = (req.query.artist || "").trim();
    const duration = req.query.duration ? Number(req.query.duration) : null;
    const mbid = (req.query.mbid || "").trim();

    if (!title || !artist) {
      return res
        .status(400)
        .json({ error: "Missing title or artist parameter" });
    }

    const cacheKey = mbid || `${artist.toLowerCase()}::${title.toLowerCase()}`;

    // 1. Check in-memory match cache
    if (matchCache.has(cacheKey)) {
      console.log(`[YouTube Match] ⚡ In-memory cache hit for ${cacheKey}`);
      return res.json(matchCache.get(cacheKey));
    }

    // 2. Check SQL DB songs table for an existing matched song
    try {
      const Song = (await import("../models/Song.js")).default;
      const dbSong = await Song.findOne({ title, artist });
      if (dbSong && dbSong.youtubeId) {
        console.log(
          `[YouTube Match] ⚡ DB hit for ${artist} - ${title}: ${dbSong.youtubeId}`,
        );
        const match = {
          youtubeId: dbSong.youtubeId,
          duration: dbSong.duration || 0,
        };
        matchCache.set(cacheKey, match);
        return res.json(match);
      }
    } catch (dbErr) {
      console.warn(
        "[YouTube Match] Error checking DB for match:",
        dbErr.message,
      );
    }

    // 3. Search YouTube for "${artist} - ${title}"
    const q = `${artist} - ${title}`;
    let payload;
    try {
      payload = await searchViaInvidious(q, 1);
    } catch (err) {
      console.warn(
        `[YouTube Match] Invidious search failed for: ${q}. Falling back to yt-dlp.`,
      );
      payload = await searchViaYtdlp(q);
    }

    const results = payload.results || [];
    const videos = results.filter((r) => r.type !== "youtube-artist");
    if (videos.length === 0) {
      return res.status(404).json({ error: "No matching YouTube video found" });
    }

    // 4. Find the best match
    // Standard: take first result
    let bestMatch = videos[0];
    // Simple heuristic: look for titles containing "audio", "topic", "official audio" to prefer them
    for (const vid of videos) {
      const lowerTitle = vid.title.toLowerCase();
      if (
        lowerTitle.includes("audio") ||
        lowerTitle.includes("topic") ||
        lowerTitle.includes("official audio")
      ) {
        bestMatch = vid;
        break;
      }
    }

    console.log(
      `[YouTube Match] Selected video for ${artist} - ${title}: ${bestMatch.youtubeId} ("${bestMatch.title}")`,
    );

    const match = {
      youtubeId: bestMatch.youtubeId,
      duration: bestMatch.duration || 0,
    };

    // Cache the match in-memory
    matchCache.set(cacheKey, match);
    res.json(match);
  } catch (err) {
    next(err);
  }
});

// GET /api/youtube/search?q=
router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const pageToken = (req.query.pageToken || "").trim();
    const paged = req.query.paged === "true";
    const page = Number(req.query.pageToken || 1);

    const reply = (payload) => res.json(paged ? payload : payload.results);

    if (!q) return reply({ results: [], nextPageToken: null });

    const cacheKey = `${q}::${pageToken}`;
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return reply(cached.payload);

    const urlMatch = q.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );

    let payload;
    if (urlMatch) {
      payload = await videoViaInvidious(urlMatch[1]);
    } else {
      payload = await searchViaInvidious(q, page).catch((err) => {
        return searchViaYtdlp(q);
      });
    }

    searchCache.set(cacheKey, { payload, expires: Date.now() + SEARCH_TTL });
    reply(payload);
  } catch (err) {
    next(err);
  }
});

// ---- Audio-URL resolven + cachen --------------------------------------
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

// Piped API stream extractor
async function fetchAudioFromPipedInstance(baseUrl, videoId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${baseUrl}/streams/${videoId}`, {
      headers: { "User-Agent": DEFAULT_USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Piped status ${res.status}`);
    const info = await res.json();
    const audioStreams = info.audioStreams || [];
    if (audioStreams.length === 0) throw new Error("No audioStreams in Piped");

    const m4aStreams = audioStreams.filter(
      (s) =>
        s.format === "M4A" ||
        s.mimeType?.includes("mp4") ||
        s.mimeType?.includes("m4a"),
    );

    const targetList = m4aStreams.length > 0 ? m4aStreams : audioStreams;
    targetList.sort(
      (a, b) => (Number(b.bitrate) || 0) - (Number(a.bitrate) || 0),
    );

    const bestAudio = targetList[0];
    if (!bestAudio || !bestAudio.url)
      throw new Error("No valid stream URL in Piped");

    const ext =
      bestAudio.format?.toLowerCase() ||
      (bestAudio.mimeType?.includes("webm") ? "webm" : "m4a");
    const mime = bestAudio.mimeType
      ? bestAudio.mimeType.split(";")[0]
      : mimeForExt(ext);
    const duration = normalizeDuration(info.duration);

    let expires = Date.now() + 60 * 60 * 1000;
    const m = /[?&]expire=(\d+)/.exec(bestAudio.url);
    if (m) expires = Math.min(expires, parseInt(m[1], 10) * 1000 - 60 * 1000);

    return {
      url: bestAudio.url,
      ext,
      mime,
      duration,
      expires,
      source: `Piped (${baseUrl})`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Invidious API stream extractor
async function fetchAudioFromInvidiousInstance(baseUrl, videoId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${baseUrl}/api/v1/videos/${videoId}`, {
      headers: { "User-Agent": DEFAULT_USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Status ${res.status} from ${baseUrl}`);
    const info = await res.json();
    const formats = info.adaptiveFormats || [];
    const audioFormats = formats.filter(
      (f) =>
        f.type?.includes("audio/") ||
        f.mimeType?.includes("audio/") ||
        f.container === "m4a" ||
        f.container === "webm",
    );

    if (audioFormats.length === 0) throw new Error("No audio formats found");

    const m4aFormats = audioFormats.filter(
      (f) =>
        f.container === "m4a" ||
        f.type?.includes("mp4a") ||
        f.type?.includes("audio/mp4"),
    );

    const targetList = m4aFormats.length > 0 ? m4aFormats : audioFormats;
    targetList.sort(
      (a, b) => (Number(b.bitrate) || 0) - (Number(a.bitrate) || 0),
    );

    const bestAudio = targetList[0];
    if (!bestAudio || !bestAudio.url) throw new Error("No valid stream URL");

    const ext =
      bestAudio.container ||
      (bestAudio.type?.includes("webm") ? "webm" : "m4a");
    const mime = bestAudio.type
      ? bestAudio.type.split(";")[0]
      : mimeForExt(ext);
    const duration = normalizeDuration(info.lengthSeconds || info.duration);

    let expires = Date.now() + 60 * 60 * 1000;
    const m = /[?&]expire=(\d+)/.exec(bestAudio.url);
    if (m) expires = Math.min(expires, parseInt(m[1], 10) * 1000 - 60 * 1000);

    return {
      url: bestAudio.url,
      ext,
      mime,
      duration,
      expires,
      source: `Invidious (${baseUrl})`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Direct InnerTube API extractors (ANDROID_VR / TVHTML5 return unencrypted direct stream URLs)
async function fetchInnerTubeClient(clientName, clientVersion, videoId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          clientName === "ANDROID_VR"
            ? "com.google.android.apps.youtube.vr/1.59.19 (Linux; U; Android 12; en_US)"
            : "Mozilla/5.0 (SmartTV; ; ; ; ) AppleWebKit/537.36 (KHTML, like Gecko) TVHTML5/7.20250101.12.00 Chrome/114.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        videoId: videoId,
        context: {
          client: {
            clientName: clientName,
            clientVersion: clientVersion,
            hl: "en",
            gl: "US",
          },
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok)
      throw new Error(`InnerTube (${clientName}) status ${res.status}`);
    const data = await res.json();
    const formats = data?.streamingData?.adaptiveFormats || [];
    const audioFormats = formats.filter(
      (f) => f.mimeType && f.mimeType.startsWith("audio/") && f.url,
    );

    if (audioFormats.length === 0)
      throw new Error(
        `No direct audio URLs returned by InnerTube (${clientName})`,
      );

    const m4aFormats = audioFormats.filter(
      (f) => f.mimeType.includes("mp4a") || f.mimeType.includes("audio/mp4"),
    );

    const targetList = m4aFormats.length > 0 ? m4aFormats : audioFormats;
    targetList.sort(
      (a, b) => (Number(b.bitrate) || 0) - (Number(a.bitrate) || 0),
    );

    const bestAudio = targetList[0];
    const ext = bestAudio.mimeType.includes("webm") ? "webm" : "m4a";
    const mime = bestAudio.mimeType.split(";")[0];
    const duration = normalizeDuration(
      (Number(bestAudio.approxDurationMs) || 0) / 1000,
    );

    let expires = Date.now() + 60 * 60 * 1000;
    const m = /[?&]expire=(\d+)/.exec(bestAudio.url);
    if (m) expires = Math.min(expires, parseInt(m[1], 10) * 1000 - 60 * 1000);

    return {
      url: bestAudio.url,
      ext,
      mime,
      duration,
      expires,
      source: `YouTube Direct (${clientName})`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function audioViaInnerTube(videoId) {
  try {
    return await Promise.any([
      fetchInnerTubeClient("ANDROID_VR", "1.59.19", videoId),
      fetchInnerTubeClient("TVHTML5", "7.20250101.12.00", videoId),
    ]);
  } catch (err) {
    throw new Error("InnerTube direct clients failed");
  }
}

async function audioViaFastPool(videoId) {
  const directPromise = audioViaInnerTube(videoId);
  const pipedPromises = PIPED_INSTANCES.map((u) =>
    fetchAudioFromPipedInstance(u, videoId),
  );
  const invidiousPromises = getInvidiousInstances().map((u) =>
    fetchAudioFromInvidiousInstance(u, videoId),
  );

  try {
    return await Promise.any([
      directPromise,
      ...pipedPromises,
      ...invidiousPromises,
    ]);
  } catch (err) {
    throw new Error(
      "All fast stream resolvers (YouTube Direct, Piped & Invidious) failed",
    );
  }
}

// In-flight deduplicatie map om dubbel werk voor hetzelfde videoId te voorkomen
const inFlightPromises = new Map();

async function resolveViaYtdlp(videoId, startMs) {
  const info = await getYoutubedl()(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      noCallHome: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      socketTimeout: "5",
      format: "bestaudio[ext=m4a]/bestaudio",
    },
  );

  if (!info || !info.url) throw new Error("Geen audio-URL gevonden via yt-dlp");

  let expires = Date.now() + 60 * 60 * 1000;
  const m = /[?&]expire=(\d+)/.exec(info.url);
  if (m) expires = Math.min(expires, parseInt(m[1], 10) * 1000 - 60 * 1000);

  const resolved = {
    url: info.url,
    ext: info.ext,
    mime: mimeForExt(info.ext),
    duration: normalizeDuration(info.duration),
    expires,
    source: "yt-dlp",
  };
  console.log(
    `[Stream Resolved] 🐢 Audio for video ${videoId} extracted via yt-dlp fallback in ${Date.now() - startMs}ms`,
  );
  return resolved;
}

// Eén gedeelde resolve + cache + in-flight deduplicatie voor de hele backend
export async function resolveAudio(videoId) {
  // 1. Check completed cache
  const cached = formatCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    console.log(
      `[Stream Cache Hit] ⚡ Instant stream cache hit for video ${videoId}`,
    );
    return cached;
  }

  // 2. Check in-flight resolution (Deduplicate concurrent prefetch / click calls!)
  if (inFlightPromises.has(videoId)) {
    console.log(
      `[Stream Deduplicated] ⏳ Joined in-flight resolution for video ${videoId}`,
    );
    return await inFlightPromises.get(videoId);
  }

  // 3. Create shared single resolution task
  const startMs = Date.now();
  const resolutionPromise = (async () => {
    try {
      const streamResult = await audioViaFastPool(videoId);
      const tookMs = Date.now() - startMs;
      console.log(
        `[Stream Resolved] 🚀 Audio for video ${videoId} extracted via ${streamResult.source} in ${tookMs}ms`,
      );
      formatCache.set(videoId, streamResult);
      return streamResult;
    } catch (err) {
      console.warn(
        `Fast stream pool failed for video ${videoId}, falling back to single yt-dlp CLI:`,
        err.message,
      );
      try {
        const fallbackResult = await resolveViaYtdlp(videoId, startMs);
        formatCache.set(videoId, fallbackResult);
        return fallbackResult;
      } catch (ytErr) {
        console.error(
          `yt-dlp fallback also failed for video ${videoId}:`,
          ytErr.message,
        );
        throw ytErr;
      }
    } finally {
      inFlightPromises.delete(videoId);
    }
  })();

  inFlightPromises.set(videoId, resolutionPromise);
  return await resolutionPromise;
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

// GET /api/youtube/prefetch/:videoId — warmt de audio-URL-cache op
router.get("/prefetch/:videoId", async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) return res.status(400).json({ error: "Geen videoId" });
  console.log(`[Prefetch] ⚡ Pre-warming audio stream for video ${videoId}...`);
  try {
    await resolveAudio(videoId);
    console.log(`[Prefetch] ✅ Audio pre-warmed for video ${videoId}`);
    res.status(204).end();
  } catch (err) {
    console.warn(
      `[Prefetch] ⚠️ Pre-warm failed for video ${videoId}:`,
      err.message,
    );
    res.status(204).end();
  }
});

// POST /api/youtube/prefetch-batch — warmt meerdere video's in één keer op (parallel)
router.post("/prefetch-batch", async (req, res) => {
  const { videoIds } = req.body || {};
  if (!Array.isArray(videoIds) || videoIds.length === 0) {
    return res.status(400).json({ error: "videoIds array vereist" });
  }

  const slice = videoIds.slice(0, 5);
  console.log(
    `[Prefetch] 🚀 Batch pre-warming ${slice.length} top search result tracks: [${slice.join(", ")}]...`,
  );
  await Promise.allSettled(slice.map((id) => resolveAudio(id)));
  console.log(`[Prefetch] ✅ Batch pre-warming complete for search results.`);
  res.status(204).end();
});

// GET /api/youtube/stream/:videoId — proxyt YouTube-audio met Range-support
router.get("/stream/:videoId", async (req, res, next) => {
  try {
    const { videoId } = req.params;
    if (!videoId) return res.status(400).json({ error: "Geen videoId" });

    const { audio, upstream } = await fetchUpstream(videoId, req.headers.range);

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(502).json({ error: "Upstream stream fout" });
    }

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
