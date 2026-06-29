import { motion } from "framer-motion";
import { useContext } from "react";
import useLongPress from "../../hooks/useLongPress";
import { PlayerContext } from "../MediaPlayer/MediaPlayer";
import { playPlaylistById } from "../../utils/playback";

function PlaylistItem({ playlist, navigate, showOptions, variant = "home" }) {
  const { playSong } = useContext(PlayerContext);
  const menuOptions = ["Open", "Play", "Shuffle"];

  const playPlaylist = async (shuffle) => {
    try {
      await playPlaylistById(playlist.id, { playSong, navigate, shuffle });
    } catch (err) {
      console.error("Playlist afspelen mislukt:", err);
    }
  };

  const handleMenuOption = (option) => {
    switch (option) {
      case "Open":
        navigate(`/playlist/${playlist.id}`);
        break;

      case "Play":
        playPlaylist(false);
        break;

      case "Shuffle":
        playPlaylist(true);
        break;

      default:
        break;
    }
  };

  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, handleMenuOption),
  );

  if (variant === "home") {
    return (
      <motion.div
        className="playlist-card"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/playlist/${playlist.id}`)}
      >
        <img
          src={playlist.cover}
          alt={playlist.title}
          className="playlist-card__cover"
        />

        <p className="playlist-card__title">{playlist.title}</p>
      </motion.div>
    );
  }

  if (variant === "list") {
    return (
      <motion.div
        className="playlist-list-item"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/playlist/${playlist.id}`)}
      >
        <img src={playlist.cover} alt={playlist.title} />

        <div>
          <h3>{playlist.title}</h3>
        </div>
      </motion.div>
    );
  }

  return null;
}

export default PlaylistItem;
