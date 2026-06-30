import { Router } from "express";
import Playlist from "../models/Playlist.js";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// GET all playlists
router.get("/", async (req, res, next) => {
  try {
    const playlists = await Playlist.find().sort({ updatedAt: -1 });
    res.json(playlists);
  } catch (err) {
    next(err);
  }
});

// GET single playlist
router.get("/:id", async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist)
      return res.status(404).json({ error: "Playlist niet gevonden" });

    res.json(playlist);
  } catch (err) {
    next(err);
  }
});

// CREATE playlist
router.post("/", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const { name, description, songs } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Naam is verplicht" });
    }

    const playlist = await Playlist.create({
      name,
      description: description || "",
      thumbnail: req.file ? `/uploads/${req.file.filename}` : "",
      songs: songs ? JSON.parse(songs) : [],
    });

    res.status(201).json(playlist);
  } catch (err) {
    console.error("🔴 ERROR:", err);
    next(err);
  }
});

// UPDATE playlist
router.put("/:id", async (req, res, next) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!playlist)
      return res.status(404).json({ error: "Playlist niet gevonden" });

    res.json(playlist);
  } catch (err) {
    next(err);
  }
});

// DELETE playlist
router.delete("/:id", async (req, res, next) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);

    if (!playlist)
      return res.status(404).json({ error: "Playlist niet gevonden" });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
