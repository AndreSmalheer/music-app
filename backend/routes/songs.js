import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import upload from "../middleware/upload.js";

// Zoekt artiest op naam op, maakt hem aan als hij niet bestaat, en voegt songId toe.
async function syncArtist(artistName, songId) {
  if (!artistName || artistName === "Unknown") return;
  await Artist.findOneAndUpdate(
    { name: artistName },
    { $addToSet: { songs: songId } },
    { upsert: true, new: true },
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// GET /api/songs — alle songs
router.get("/", async (req, res, next) => {
  try {
    const songs = await Song.find().sort({ addedAt: -1 });
    res.json(songs);
  } catch (err) {
    next(err);
  }
});

// GET /api/songs/:id — één song
router.get("/:id", async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: "Song niet gevonden" });
    res.json(song);
  } catch (err) {
    next(err);
  }
});

// POST /api/songs/upload — MP3 + optionele cover uploaden
// form-data velden: audio (file), cover (file, optioneel), title, artist, album
router.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const audioFile = req.files?.audio?.[0];
      if (!audioFile) {
        return res.status(400).json({ error: "Geen audiobestand ontvangen" });
      }
      const coverFile = req.files?.cover?.[0];

      const song = await Song.create({
        title: req.body.title || audioFile.originalname,
        artist: req.body.artist || "Unknown",
        album: req.body.album,
        type: "mp3",
        filePath: `/uploads/${audioFile.filename}`,
        thumbnail: coverFile ? `/uploads/${coverFile.filename}` : undefined,
        duration: Number(req.body.duration) || 0,
      });

      await syncArtist(song.artist, song._id);
      res.status(201).json(song);
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/songs/download — YouTube-URL → MP3
// TODO: implementeer de daadwerkelijke download (bijv. yt-dlp + ffmpeg).
// Voor nu slaat dit alleen de metadata op zodat de frontend al gekoppeld kan worden.
router.post("/download", async (req, res, next) => {
  try {
    const { url, title, artist, thumbnail } = req.body;
    if (!url) return res.status(400).json({ error: "Geen YouTube-URL ontvangen" });

    // YouTube video-id uit de URL halen
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    const youtubeId = match ? match[1] : undefined;

    const song = await Song.create({
      title: title || "Unknown",
      artist: artist || "Unknown",
      type: "youtube",
      youtubeId,
      thumbnail,
    });

    await syncArtist(song.artist, song._id);
    res.status(201).json(song);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/songs/:id — song + bijbehorend bestand verwijderen
router.delete("/:id", async (req, res, next) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ error: "Song niet gevonden" });

    // Bestand van schijf verwijderen als het lokaal staat
    if (song.filePath?.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", song.filePath);
      fs.promises.unlink(filePath).catch(() => {});
    }

    // Song uit artiest verwijderen
    if (song.artist && song.artist !== "Unknown") {
      await Artist.findOneAndUpdate(
        { name: song.artist },
        { $pull: { songs: song._id } },
      );
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
