import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true }, // artiestennaam als tekst
  album: { type: String },
  type: { type: String, enum: ["mp3", "youtube"], default: "mp3" },
  filePath: { type: String }, // pad/URL naar MP3 in uploads/ (type mp3)
  youtubeId: { type: String }, // YouTube video-id als bron (type youtube)
  thumbnail: { type: String }, // URL naar cover
  duration: { type: Number, default: 0 }, // seconden
  addedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Song", songSchema);
