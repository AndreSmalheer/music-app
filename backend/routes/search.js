import { Router } from "express";
import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import Playlist from "../models/Playlist.js";

const router = Router();

// GET /api/search?q= — zoekt in songs, artists en playlists
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ songs: [], artists: [], playlists: [] });

    // case-insensitive deelmatch
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [songs, artists, playlists] = await Promise.all([
      Song.find({
        $or: [{ title: rx }, { artist: rx }, { album: rx }],
      }).limit(20),
      Artist.find({ name: rx, isYoutubeArtist: { $ne: true } }).limit(20),
      Playlist.find({ name: rx }).limit(20),
    ]);

    res.json({ songs, artists, playlists });
  } catch (err) {
    next(err);
  }
});

export default router;
