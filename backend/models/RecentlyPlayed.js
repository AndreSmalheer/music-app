import mongoose from "mongoose";

const recentlyPlayedSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
  lastPlayed: { type: Date, default: Date.now },
  playedAt: { type: Date, default: Date.now },
});

export default mongoose.model("RecentlyPlayed", recentlyPlayedSchema);
