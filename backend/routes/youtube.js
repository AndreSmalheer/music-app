import { Router } from "express";

const router = Router();

// GET /api/youtube/search?q=  — zoekt YouTube muziekvideo's via de Data API v3
router.get("/search", async (req, res, next) => {
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

export default router;
