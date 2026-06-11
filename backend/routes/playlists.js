import { Router } from "express";
import Playlist from "../models/Playlist.js";

const router = Router();

// GET /api/playlists — alle playlists
router.get("/", async (req, res, next) => {
  try {
    const playlists = await Playlist.find().sort({ updatedAt: -1 });
    res.json(playlists);
  } catch (err) {
    next(err);
  }
});

// GET /api/playlists/:id — één playlist incl. songs
router.get("/:id", async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).json({ error: "Playlist niet gevonden" });
    res.json(playlist);
  } catch (err) {
    next(err);
  }
});

// POST /api/playlists — nieuwe playlist
router.post("/", async (req, res, next) => {
  try {
    const { name, thumbnail, songs } = req.body;
    if (!name) return res.status(400).json({ error: "Naam is verplicht" });

    const playlist = await Playlist.create({ name, thumbnail, songs: songs || [] });
    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
});

// PUT /api/playlists/:id — playlist updaten (naam, cover, songs)
router.put("/:id", async (req, res, next) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!playlist) return res.status(404).json({ error: "Playlist niet gevonden" });
    res.json(playlist);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/playlists/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist niet gevonden" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
