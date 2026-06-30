import useLongPress from "../../hooks/useLongPress";
import {
  addSongToPlaylist,
  getPlaylists,
  deletePlaylist,
} from "../../services/api";
import { useState } from "react";
import { motion } from "framer-motion";
import { useDownload } from "../../context/DownloadContext";
import DownloadModal from "../DownloadModal/DownloadModal";

function LibraryRow({
  item,
  type,
  navigate,
  playSongList,
  showOptions,
  onDelete,
}) {
  const { downloads } = useDownload();
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const id = item.id || item._id;

  const isCurrentlyDownloading = downloads.some(
    (dl) => dl.url?.includes(item.youtubeId) && dl.status === "downloading",
  );

  const getMenuOptions = () => {
    switch (type) {
      case "playlist":
        return ["Open Playlist", "Delete Playlist"];
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
    const songId = item.track?.id || item.id || item._id;
    if (!songId) return;

    try {
      const playlists = await getPlaylists();

      const options = playlists.length
        ? playlists.map((p) => ({
            id: p.id || p._id,
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

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(id);

      setIsRemoved(true);
      onDelete?.({ id });
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    }
  };

  const longPressProps = useLongPress(() =>
    showOptions(getMenuOptions(), async (option) => {
      switch (option) {
        case "Open Playlist":
          navigate(`/playlist/${id}`);
          break;

        case "Delete Playlist":
          await handleDeletePlaylist();
          break;

        case "Open Artist":
          navigate(`/artist/${id}`);
          break;

        case "Play":
          playSongList?.(item);
          break;

        case "Add to Playlist":
          setTimeout(showPlaylistOptions, 100);
          break;

        case "Download":
          setDownloadOpen(true);
          break;

        case "Delete":
          onDelete?.(item);
          setIsRemoved(true);
          break;

        default:
          break;
      }
    }),
  );

  // ⬇️ IMPORTANT: conditional render ONLY here (after hooks)
  if (isRemoved) return null;

  // ---------------- PLAYLIST ----------------
  if (type === "playlist") {
    return (
      <motion.button
        className="library-row"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/playlist/${id}`)}
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

        <DownloadModal
          isOpen={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          track={item.track || item}
        />
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
        onClick={() => navigate(`/artist/${id}`)}
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
