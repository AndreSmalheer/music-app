import { Router } from "express";
import { create } from 'youtube-dl-exec';

const router = Router();
const youtubedl = create('yt-dlp');

// GET /api/youtube/search?q=  — zoekt YouTube muziekvideo's via de Data API v3
router.get("/search", async (req, res, next) => {
// ... (rest of search route unchanged)
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(500).json({ error: "YOUTUBE_API_KEY ontbreekt" });

    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&type=video&videoCategoryId=10` +
      `&q=${encodeURIComponent(q)}&maxResults=15&key=${key}`;

    const ytRes = await fetch(url);
    if (!ytRes.ok) {
      const err = await ytRes.json().catch(() => ({}));
      return res.status(ytRes.status).json({ error: err?.error?.message || "YouTube API fout" });
    }

    const data = await ytRes.json();

    const results = (data.items || []).map((item) => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      type: "youtube",
    }));

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/youtube/stream/:videoId — streamt audio van YouTube
router.get("/stream/:videoId", async (req, res, next) => {
  try {
    const { videoId } = req.params;
    if (!videoId) return res.status(400).json({ error: "Geen videoId" });

    // yt-dlp streamt meestal webm (opus) of m4a (aac). 
    // We kunnen de browser laten beslissen hoe het te decoderen, maar audio/mpeg is een veilige gok voor de meeste audio tags.
    // Eigenlijk is het beter om de content-type niet hard te coderen als we de bron niet zeker weten,
    // maar audio/mpeg werkt vaak zelfs voor andere formats in moderne browsers.
    res.setHeader("Content-Type", "audio/mpeg");

    const subprocess = youtubedl.exec(videoId, {
      output: '-',
      format: 'bestaudio',
    });

    subprocess.stdout.pipe(res);

    subprocess.stderr.on('data', (data) => {
      // Optioneel: log yt-dlp output voor debugging
      // console.log(`yt-dlp: ${data}`);
    });

    subprocess.on('error', (err) => {
      console.error("yt-dlp Stream Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream fout" });
      }
    });

    // Zorg ervoor dat het proces stopt als de client de verbinding verbreekt
    req.on('close', () => {
      subprocess.kill();
    });
  } catch (err) {
    next(err);
  }
});

export default router;
