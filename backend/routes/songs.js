import { Router } from "express";
import fs from "node:fs";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import upload from "../middleware/upload.js";
import { resolveAudio } from "./youtube.js";

// Zoekt artiest op naam + bron op, maakt hem aan als hij niet bestaat, en voegt songId toe.
async function syncArtist(artistName, songId, { isYoutubeArtist = false, thumbnail } = {}) {
  if (!artistName || artistName === "Unknown") return;

  const update = {
    $addToSet: { songs: songId },
    $setOnInsert: { name: artistName, isYoutubeArtist },
  };

  if (thumbnail) {
    update.$set = { thumbnail };
  }

  await Artist.findOneAndUpdate(
    { name: artistName, isYoutubeArtist },
    update,
    { upsert: true, new: true },
  );
}

function normalizeDuration(duration) {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value > 24 * 60 * 60) return Math.round(value / 1000);
  return Math.round(value);
}

async function downloadAudioToFile(videoId, filePath) {
  const { url } = await resolveAudio(videoId);
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error("Kon YouTube-audio niet downloaden");
  }

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await pipeline(Readable.fromWeb(response.body), createWriteStream(filePath));
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
        duration: normalizeDuration(req.body.duration),
      });

      await syncArtist(song.artist, song._id, {
        isYoutubeArtist: false,
        thumbnail: song.thumbnail,
      });
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
    if (!youtubeId) {
      return res.status(400).json({ error: "Geen geldige YouTube video-id gevonden" });
    }

    const { duration } = await resolveAudio(youtubeId);

    const song = await Song.findOneAndUpdate(
      { youtubeId },
      {
        $set: {
          title: title || "Unknown",
          artist: artist || "Unknown",
          type: "youtube",
          youtubeId,
          thumbnail,
          duration,
        },
        $setOnInsert: {
          addedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (song.artist && song.artist !== "Unknown") {
      await syncArtist(song.artist, song._id, {
        isYoutubeArtist: true,
        thumbnail: song.thumbnail,
      });
    }

    res.status(201).json(song);
  } catch (err) {
    next(err);
  }
});

// POST /api/songs/download-local — YouTube-URL → lokaal bestand + Song in library
router.post("/download-local", async (req, res, next) => {
  try {
    const { url, title, artist, thumbnail } = req.body;
    if (!url) return res.status(400).json({ error: "Geen YouTube-URL ontvangen" });

    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    const youtubeId = match ? match[1] : undefined;
    if (!youtubeId) {
      return res.status(400).json({ error: "Geen geldige YouTube video-id gevonden" });
    }

    const existing = await Song.findOne({ sourceYoutubeId: youtubeId });
    const publicMusicDir = path.join(__dirname, "..", "..", "public", "music", "downloads");

    if (existing?.filePath) {
      const existingPath = path.join(__dirname, "..", "..", "public", existing.filePath.replace(/^\//, ""));
      if (fs.existsSync(existingPath)) {
        res.status(200).json(existing);
        return;
      }
    }

    const { ext, duration } = await resolveAudio(youtubeId);
    const fileName = `${youtubeId}.${ext || "m4a"}`;
    const absoluteFilePath = path.join(publicMusicDir, fileName);
    const relativeFilePath = `/music/downloads/${fileName}`;

    await downloadAudioToFile(youtubeId, absoluteFilePath);

    const song = await Song.findOneAndUpdate(
      { sourceYoutubeId: youtubeId },
      {
        $set: {
          title: title || "Unknown",
          artist: artist || "Unknown",
          album: undefined,
          type: "mp3",
          filePath: relativeFilePath,
          sourceYoutubeId: youtubeId,
          youtubeId: undefined,
          thumbnail,
          duration,
        },
        $setOnInsert: {
          addedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (song.artist && song.artist !== "Unknown") {
      await syncArtist(song.artist, song._id, {
        isYoutubeArtist: false,
        thumbnail: song.thumbnail,
      });
    }

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

    if (song.filePath?.startsWith("/music/")) {
      const filePath = path.join(__dirname, "..", "..", "public", song.filePath.replace(/^\//, ""));
      fs.promises.unlink(filePath).catch(() => {});
    }

    // Song uit artiest verwijderen en artiest verwijderen als deze geen nummers meer heeft
    if (song.artist && song.artist !== "Unknown") {
      const isYoutubeArtist = song.type === "youtube" || !!song.youtubeId;
      const updatedArtist = await Artist.findOneAndUpdate(
        { name: song.artist, isYoutubeArtist },
        { $pull: { songs: song._id } },
        { new: true }
      );

      if (updatedArtist && updatedArtist.songs.length === 0) {
        await Artist.findByIdAndDelete(updatedArtist._id);
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
