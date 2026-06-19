import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  thumbnail: { type: String },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  createdAt: { type: Date, default: Date.now },
  isYoutubeArtist: { type: Boolean, default: false },
});

artistSchema.index({ name: 1, isYoutubeArtist: 1 }, { unique: true });

export default mongoose.model("Artist", artistSchema);
