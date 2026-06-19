// Seed-script: vult MongoDB met wat testdata zodat de UI niet leeg is.
// Kopieert ook de test-assets (mp3 + covers) naar backend/uploads/ zodat de
// backend ze echt serveert en de songs afspeelbaar zijn.
//
// Gebruik:  cd backend && node scripts/seed.js
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import Playlist from "../models/Playlist.js";
import RecentlyPlayed from "../models/RecentlyPlayed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "..", "public");
const uploadsDir = path.join(__dirname, "..", "uploads");

// Kopieer een test-asset uit /public naar /backend/uploads (als hij bestaat)
function copyAsset(relFromPublic, destName) {
  const src = path.join(publicDir, relFromPublic);
  const dest = path.join(uploadsDir, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    return `/uploads/${destName}`;
  }
  console.warn(`⚠️  asset niet gevonden, oversla: ${relFromPublic}`);
  return undefined;
}

async function seed() {
  await connectDB();

  fs.mkdirSync(uploadsDir, { recursive: true });

  // Test-assets klaarzetten in uploads/
  const mp3 = copyAsset("music/test.mp3", "test.mp3");
  const cover1 = copyAsset("covers/test-cover.jpg", "cover1.jpg");
  const cover2 = copyAsset("indieblog-best-album-covers-2010s-07 4.png", "cover2.png");

  // Schoonvegen zodat seeden idempotent is
  await Promise.all([
    Song.deleteMany({}),
    Artist.deleteMany({}),
    Playlist.deleteMany({}),
    RecentlyPlayed.deleteMany({}),
  ]);

  // Artiesten
  const [aurora, midnight] = await Artist.create([
    { name: "Aurora Skies", thumbnail: cover1 },
    { name: "Midnight Echo", thumbnail: cover2 },
  ]);

  // Songs (allemaal afspeelbaar via de gekopieerde test.mp3)
  const songs = await Song.create([
    { title: "Golden Hour", artist: "Aurora Skies", album: "Daylight", type: "mp3", filePath: mp3, thumbnail: cover1, duration: 213 },
    { title: "Paper Planes", artist: "Aurora Skies", album: "Daylight", type: "mp3", filePath: mp3, thumbnail: cover1, duration: 198 },
    { title: "Neon Rain", artist: "Midnight Echo", album: "Afterglow", type: "mp3", filePath: mp3, thumbnail: cover2, duration: 240 },
    { title: "City Lights", artist: "Midnight Echo", album: "Afterglow", type: "mp3", filePath: mp3, thumbnail: cover2, duration: 176 },
    { title: "Slow Motion", artist: "Aurora Skies", album: "Daylight", type: "mp3", filePath: mp3, thumbnail: cover1, duration: 205 },
  ]);

  // Songs aan artiesten koppelen
  aurora.songs = songs.filter((s) => s.artist === "Aurora Skies").map((s) => s._id);
  midnight.songs = songs.filter((s) => s.artist === "Midnight Echo").map((s) => s._id);
  await Promise.all([aurora.save(), midnight.save()]);

  // Playlist met een paar songs
  await Playlist.create({
    name: "Chill Mix",
    thumbnail: cover2,
    songs: songs.slice(0, 3).map((s) => s._id),
  });

  // Recently played (3 entries, nieuwste laatst toegevoegd)
  await RecentlyPlayed.create([
    {
      song: songs[0]._id,
      playedAt: new Date(Date.now() - 3 * 3600e3),
      lastPlayed: new Date(Date.now() - 3 * 3600e3),
    },
    {
      song: songs[2]._id,
      playedAt: new Date(Date.now() - 2 * 3600e3),
      lastPlayed: new Date(Date.now() - 2 * 3600e3),
    },
    {
      song: songs[4]._id,
      playedAt: new Date(Date.now() - 1 * 3600e3),
      lastPlayed: new Date(Date.now() - 1 * 3600e3),
    },
  ]);

  console.log("✅ Seed klaar:");
  console.log(`   ${await Artist.countDocuments()} artiesten`);
  console.log(`   ${await Song.countDocuments()} songs`);
  console.log(`   ${await Playlist.countDocuments()} playlists`);
  console.log(`   ${await RecentlyPlayed.countDocuments()} recently played`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed mislukt:", err);
  process.exit(1);
});
