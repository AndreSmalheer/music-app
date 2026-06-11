import { Router } from "express";
import Artist from "../models/Artist.js";

const router = Router();

// GET /api/artists — alle artiesten
router.get("/", async (req, res, next) => {
  try {
    const artists = await Artist.find().sort({ name: 1 });
    res.json(artists);
  } catch (err) {
    next(err);
  }
});

// GET /api/artists/:id — één artiest incl. songs
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
