import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    thumbnail: { type: String }, // cover van de playlist
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { timestamps: true }, // voegt createdAt + updatedAt toe
);

export default mongoose.model("Playlist", playlistSchema);
