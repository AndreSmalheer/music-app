import { config } from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Artist from "../models/Artist.js";
import Playlist from "../models/Playlist.js";
import RecentlyPlayed from "../models/RecentlyPlayed.js";
import Song from "../models/Song.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI ontbreekt in backend/.env");
}

await mongoose.connect(uri);

const results = await Promise.all([
  Song.deleteMany({}),
  Artist.deleteMany({}),
  Playlist.deleteMany({}),
  RecentlyPlayed.deleteMany({}),
]);

console.log(
  JSON.stringify(
    {
      songs: results[0].deletedCount,
      artists: results[1].deletedCount,
      playlists: results[2].deletedCount,
      recentlyPlayed: results[3].deletedCount,
    },
    null,
    2,
  ),
);

await mongoose.disconnect();
