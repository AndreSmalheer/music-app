import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  thumbnail: { type: String }, // artiestenfoto
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Artist", artistSchema);
