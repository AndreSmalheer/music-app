import { motion } from "framer-motion";
import { Music } from "lucide-react";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import { addSongToPlaylist, getPlaylists } from "../../services/api";

function HomeCard({ item, tapFeedback, handleSongClick }) {
  const { showOptions } = useModal();

  const menuOptions = ["Play", "Add to Playlist"];

  const showPlaylistOptions = async () => {
    if (!item.track?.id) return;

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

          await addSongToPlaylist(playlist.id, item.track);
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMenuOption = (option) => {
    switch (option) {
      case "Play":
        handleSongClick(item.track);
        break;

      case "Add to Playlist":
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
      className="home-card"
      {...longPressProps}
      whileTap={tapFeedback}
      onClick={item.onClick}
    >
      {item.cover ? (
        <img
          className="home-card__cover"
          src={item.cover}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.style.setProperty(
              "display",
              "flex",
            );
          }}
        />
      ) : null}

      <div
        className="home-card__cover home-card__fallback"
        style={{
          background: item.gradient,
          display: item.cover ? "none" : "flex",
        }}
      >
        <Music size={34} strokeWidth={1.8} />
      </div>

      <div className="home-card__title">{item.title}</div>
      <div className="home-card__sub">{item.sub}</div>
    </motion.button>
  );
}

export default HomeCard;
