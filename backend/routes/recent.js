import { Router } from "express";
import RecentlyPlayed from "../models/RecentlyPlayed.js";

const router = Router();

// GET /api/recent — laatst afgespeelde songs (nieuwste eerst, max 20)
router.get("/", async (req, res, next) => {
  try {
    const recent = await RecentlyPlayed.find()
      .sort({ playedAt: -1 })
      .limit(20)
      .populate("song");
    res.json(recent);
  } catch (err) {
    next(err);
  }
});

// POST /api/recent — song toevoegen aan recently played
router.post("/", async (req, res, next) => {
  try {
    const { song } = req.body;
    if (!song) return res.status(400).json({ error: "song (id) is verplicht" });

    const entry = await RecentlyPlayed.create({ song, playedAt: new Date() });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

export default router;
