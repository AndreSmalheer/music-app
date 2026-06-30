import { motion } from "framer-motion";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import {
  addSongToPlaylist,
  getPlaylists,
  searchYoutube,
  downloadFromYoutube,
} from "../../services/api";

function HomeTile({ tile, track, cover, tapFeedback, handleMoodTile }) {
  const { showOptions } = useModal();

  const menuOptions = ["Play", "Add to Playlists"];

  const showPlaylistOptions = async () => {
    if (!track?.id) return;

    try {
      const playlists = await getPlaylists();

      const options = playlists.map((playlist) => ({
        id: playlist.id,
        label: playlist.title,
      }));

      showOptions(
        options.length
          ? options
          : [{ id: "no-playlists", label: "No playlists found" }],
        async (playlist) => {
          if (playlist.id === "no-playlists") return;

          await addSongToPlaylist(playlist.id, track.id);
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMenuOption = (option) => {
    switch (option) {
      case "Play":
        handleMoodTile(tile);
        break;

      case "Add to Playlists":
        setTimeout(showPlaylistOptions, 100);
        break;

      default:
        break;
    }
  };

  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, handleMenuOption),
  );

  return (
    <motion.button
      className="home-tile"
      {...longPressProps}
      whileTap={tapFeedback}
      onClick={() => handleMoodTile(tile)}
    >
      {cover ? (
        <img
          className="home-tile__cover"
          src={cover}
          alt=""
          onError={(e) => {
            // Val terug op de gradient als de afbeelding niet laadt.
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.style.setProperty(
              "display",
              "block",
            );
          }}
        />
      ) : null}

      <span
        className="home-tile__cover"
        style={{
          background: tile.gradient,
          display: cover ? "none" : "block",
        }}
      />

      <span className="home-tile__title">{tile.name}</span>
    </motion.button>
  );
}

export default HomeTile;
