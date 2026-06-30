import { motion } from "framer-motion";
import useLongPress from "../../hooks/useLongPress";
import { addSongToPlaylist, getPlaylists } from "../../services/api";

function LibraryRow({ item, type, navigate, playSongList, showOptions }) {
  const getMenuOptions = () => {
    switch (type) {
      case "playlist":
        return ["Open Playlist"];

      case "song":
      case "youtube":
        return ["Play", "Add to Playlist"];

      case "artist":
        return ["Open Artist"];

      default:
        return [];
    }
  };

  const showPlaylistOptions = async () => {
    const songId = item.track?.id || item.id;
    if (!songId) return;

    try {
      const playlists = await getPlaylists();

      const options = playlists.length
        ? playlists.map((p) => ({
            id: p.id,
            label: p.title,
          }))
        : [{ id: "no-playlists", label: "No playlists found" }];

      showOptions(options, async (selected) => {
        if (selected.id === "no-playlists") return;

        await addSongToPlaylist(selected.id, songId);
      });
    } catch (err) {
      console.error("playlist error:", err);
    }
  };

  const longPressProps = useLongPress(() =>
    showOptions(getMenuOptions(), (option) => {
      switch (option) {
        case "Open Playlist":
          navigate(`/playlist/${item.id}`);
          break;

        case "Open Artist":
          navigate(`/artist/${item.id}`);
          break;

        case "Play":
          playSongList?.(item);
          break;

        case "Add to Playlist":
          setTimeout(showPlaylistOptions, 100);
          break;

        default:
          break;
      }
    }),
  );

  // ---------------- PLAYLIST ----------------
  if (type === "playlist") {
    return (
      <motion.button
        className="library-row"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/playlist/${item.id}`)}
      >
        <img src={item.cover} className="library-row__cover" alt="" />

        <div className="library-row__info">
          <p className="library-row__title">{item.title}</p>
          <p className="library-row__subtitle">
            Afspeellijst · {item.songCount} nummers
          </p>
        </div>
      </motion.button>
    );
  }

  // ---------------- SONG / YOUTUBE ----------------
  if (type === "song" || type === "youtube") {
    return (
      <motion.button
        className="library-row"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => playSongList(item)}
      >
        <img src={item.cover} className="library-row__cover" alt="" />

        <div className="library-row__info">
          <p className="library-row__title">{item.title}</p>
          <p className="library-row__subtitle">{item.artist}</p>
        </div>
      </motion.button>
    );
  }

  // ---------------- ARTIST ----------------
  if (type === "artist") {
    return (
      <motion.button
        className="library-row"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/artist/${item.id}`)}
      >
        <img
          src={item.img || item.cover}
          className="library-row__cover library-row__cover--round"
          alt=""
        />

        <div className="library-row__info">
          <p className="library-row__title">{item.name}</p>
          <p className="library-row__subtitle">Artiest</p>
        </div>
      </motion.button>
    );
  }

  return null;
}

export default LibraryRow;
