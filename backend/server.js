import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Laad .env altijd vanuit de backend-map, ongeacht vanwaar het proces gestart wordt
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { connectDB } from "./config/db.js";
import { mongoSanitize, generalLimiter } from "./middleware/security.js";
import songsRouter from "./routes/songs.js";
import playlistsRouter from "./routes/playlists.js";
import artistsRouter from "./routes/artists.js";
import recentRouter from "./routes/recent.js";
import searchRouter from "./routes/search.js";
import youtubeRouter from "./routes/youtube.js";

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

// Achter een reverse proxy (bv. deploy) klopt req.ip dankzij deze setting.
app.set("trust proxy", 1);

// ---- Security headers ----------------------------------------------------
// CSP en COEP staan uit: dit is een JSON-API + native (Capacitor) client, geen
// door de browser geserveerde HTML. Cross-Origin-Resource-Policy MOET op
// "cross-origin" zodat de Capacitor-webview (andere origin) covers/audio kan laden.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ---- CORS ----------------------------------------------------------------
// Beperk tot een allowlist als ALLOWED_ORIGINS gezet is (komma-gescheiden).
// Zonder die env staat CORS open — handig voor lokaal/LAN-dev, maar zet in
// productie ALLOWED_ORIGINS voor je eigen client-origins.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Geen origin = same-origin, curl, of native app → toestaan.
      if (!origin || allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Niet toegestane origin (CORS)"));
    },
  }),
);
if (isProd && allowedOrigins.length === 0) {
  console.warn(
    "⚠️  CORS staat volledig open. Zet ALLOWED_ORIGINS in productie.",
  );
}

// Body-parser met expliciete limiet tegen grote-payload-DoS.
app.use(express.json({ limit: "1mb" }));
// NoSQL-operators uit body/query strippen (injectie-afweer).
app.use(mongoSanitize);
// Algemene rate limiter (streaming + statische bestanden uitgezonderd).
app.use(generalLimiter);

// Geüploade MP3's en covers statisch serveren onder /uploads.
// nosniff + geen inline-uitvoering: uploads worden nooit als document gerenderd.
const staticOpts = {
  setHeaders: (res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'");
  },
};
app.use("/uploads", express.static(path.join(__dirname, "uploads"), staticOpts));
app.use(
  "/music",
  express.static(path.join(__dirname, "..", "public", "music"), staticOpts),
);

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
app.use((err, req, res, _next) => {
  // Mongoose: ongeldige id of validatiefout → 400 i.p.v. 500.
  if (err?.name === "CastError") {
    return res.status(400).json({ error: "Ongeldige id" });
  }
  if (err?.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  // Multer: te groot/te veel bestanden of afgekeurd bestandstype.
  if (err?.name === "MulterError") {
    return res.status(400).json({ error: `Upload-fout: ${err.message}` });
  }
  if (err?.message?.startsWith("Bestandstype")) {
    return res.status(400).json({ error: err.message });
  }
  if (err?.message?.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  const status = err.status || 500;
  console.error(err);
  // In productie geen interne 500-details lekken naar de client.
  const message =
    status === 500 && isProd ? "Serverfout" : err.message || "Serverfout";
  res.status(status).json({ error: message });
});

// Start: eerst DB, dan pas luisteren
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Backend draait op http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Kon niet starten:", err.message);
    process.exit(1);
  });
