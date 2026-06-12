import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Laad .env altijd vanuit de backend-map, ongeacht vanwaar het proces gestart wordt
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import songsRouter from "./routes/songs.js";
import playlistsRouter from "./routes/playlists.js";
import artistsRouter from "./routes/artists.js";
import recentRouter from "./routes/recent.js";
import searchRouter from "./routes/search.js";
import youtubeRouter from "./routes/youtube.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true
}));
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
app.use("/api/youtube", youtubeRouter);

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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend draait op http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Kon niet starten:", err.message);
    process.exit(1);
  });
