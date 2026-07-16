import { Router } from "express";
import Playlist from "../models/Playlist.js";
import { imageUpload } from "../middleware/upload.js";
import { validateObjectIdParam } from "../middleware/security.js";

const router = Router();

// Alleen deze velden mogen via de API op een playlist gezet worden.
// Voorkomt mass-assignment (client die extra/onbedoelde velden meestuurt).
const ALLOWED_FIELDS = ["name", "description", "thumbnail", "songs"];

function pickAllowed(body = {}) {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

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
router.get("/:id", validateObjectIdParam(), async (req, res, next) => {
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
router.post("/", imageUpload.single("thumbnail"), async (req, res, next) => {
  try {
    const { name, description, songs } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Naam is verplicht" });
    }

    // songs kan als JSON-string binnenkomen (multipart form). Veilig parsen.
    let songIds = [];
    if (songs) {
      try {
        const parsed = typeof songs === "string" ? JSON.parse(songs) : songs;
        if (Array.isArray(parsed)) songIds = parsed;
      } catch {
        return res.status(400).json({ error: "Ongeldige songs-lijst" });
      }
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: typeof description === "string" ? description : "",
      thumbnail: req.file ? `/uploads/${req.file.filename}` : "",
      songs: songIds,
    });

    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
});

// UPDATE playlist
router.put("/:id", validateObjectIdParam(), async (req, res, next) => {
  try {
    const updates = pickAllowed(req.body);
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
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
router.delete("/:id", validateObjectIdParam(), async (req, res, next) => {
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
