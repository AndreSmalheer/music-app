import { Router } from "express";
import Artist from "../models/Artist.js";

const router = Router();

// GET /api/artists - alle artiesten
router.get("/", async (req, res, next) => {
  try {
    const source = req.query.source || "local";
    const filter =
      source === "youtube" || source === "yt"
        ? { isYoutubeArtist: true }
        : source === "all"
          ? {}
          : { isYoutubeArtist: { $ne: true } };

    const artists = await Artist.find(filter).sort({ name: 1 });
    res.json(artists);
  } catch (err) {
    next(err);
  }
});

// POST /api/artists/youtube - maak/hergebruik een YouTube-artiest
router.post("/youtube", async (req, res, next) => {
  try {
    const { name, thumbnail, youtubeChannelId } = req.body;
    if (!name) return res.status(400).json({ error: "Naam is verplicht" });

    const update = {
      $setOnInsert: { name, isYoutubeArtist: true },
    };

    if (thumbnail || youtubeChannelId) {
      update.$set = {};
      if (thumbnail) update.$set.thumbnail = thumbnail;
      if (youtubeChannelId) update.$set.youtubeChannelId = youtubeChannelId;
    }

    const artist = await Artist.findOneAndUpdate(
      { name, isYoutubeArtist: true },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).populate("songs");

    res.status(201).json(artist);
  } catch (err) {
    next(err);
  }
});

// GET /api/artists/:id - een artiest incl. songs
router.get("/:id", async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id).populate("songs");
    if (!artist) return res.status(404).json({ error: "Artiest niet gevonden" });
    res.json(artist);
  } catch (err) {
    next(err);
  }
});

export default router;
