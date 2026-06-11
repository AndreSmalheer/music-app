import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "./config/db.js";
import songsRouter from "./routes/songs.js";
import playlistsRouter from "./routes/playlists.js";
import artistsRouter from "./routes/artists.js";
import recentRouter from "./routes/recent.js";
import searchRouter from "./routes/search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Geüploade MP3's en covers statisch serveren onder /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/songs", songsRouter);
app.use("/api/playlists", playlistsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/recent", recentRouter);
app.use("/api/search", searchRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Niet gevonden" });
});

// Centrale error-handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Serverfout" });
});

// Start: eerst DB, dan pas luisteren
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend draait op http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Kon niet starten:", err.message);
    process.exit(1);
  });
