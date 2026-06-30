import useLongPress from "../../hooks/useLongPress";
import { addSongToPlaylist, getPlaylists } from "../../services/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDownload } from "../../context/DownloadContext";

function LibraryRow({
  item,
  type,
  navigate,
  playSongList,
  showOptions,
  onDelete,
}) {
  const { downloads, startDownload } = useDownload();
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const isCurrentlyDownloading = downloads.some(
    (dl) => dl.url.includes(item.youtubeId) && dl.status === "downloading",
  );

  const getMenuOptions = () => {
    switch (type) {
      case "playlist":
        return ["Open Playlist"];

      case "song":
        return ["Play", "Add to Playlist", "Delete"];

      case "youtube":
        return ["Play", "Add to Playlist", "Download"];

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

        case "Download":
          setDownloadConfirmOpen(true);
          break;

        case "Delete":
          onDelete?.(item);
          break;

        default:
          break;
      }
    }),
  );

  const handleDownload = () => {
    if (!item.youtubeId || isCurrentlyDownloading) return;
    startDownload({
      url: `https://www.youtube.com/watch?v=${item.youtubeId}`,
      title: item.title,
      artist: item.artist,
      thumbnail: item.cover,
    });
    setDownloadConfirmOpen(false);
    return;
  };

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
      <>
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

        <AnimatePresence>
          {downloadConfirmOpen && (
            <motion.div
              className="download-overlay"
              onClick={() => setDownloadConfirmOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="download-sheet"
                onClick={(e) => e.stopPropagation()}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="download-sheet__handle" />
                <h2 className="download-sheet__title">Download to library</h2>
                <p className="download-sheet__text">
                  Save this track as a local file so it shows up in your
                  library.
                </p>

                <div className="download-sheet__actions">
                  <button
                    className="download-sheet__btn download-sheet__btn--cancel"
                    onClick={() => setDownloadConfirmOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="download-sheet__btn download-sheet__btn--confirm"
                    onClick={handleDownload}
                    disabled={isCurrentlyDownloading}
                  >
                    {isCurrentlyDownloading ? "Downloading..." : "Download"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
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
