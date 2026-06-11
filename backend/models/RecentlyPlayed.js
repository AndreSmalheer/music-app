import mongoose from "mongoose";

const recentlyPlayedSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
  playedAt: { type: Date, default: Date.now },
});

export default mongoose.model("RecentlyPlayed", recentlyPlayedSchema);
