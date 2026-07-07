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

  const menuOptions = ["Play"];

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

          await addSongToPlaylist(playlist.id, track);
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

      default:
        break;
    }
  };

  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, handleMenuOption),
  );

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <motion.button
      className="home-tile"
      {...longPressProps}
      whileTap={tapFeedback}
      onClick={() => handleMoodTile(tile)}
    >
      {cover && !failed ? (
        <motion.img
          className="home-tile__cover"
          src={cover}
          alt={song.title}
          layoutId={`cover-${song.id}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{
            opacity: loaded ? 1 : 0,
            scale: loaded ? 1 : 1.04,
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <></>
      )}

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
