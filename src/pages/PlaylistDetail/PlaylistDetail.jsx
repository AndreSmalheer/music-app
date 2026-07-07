import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import Skeleton from "../../components/Skeleton/Skeleton";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import {
  ChevronLeft,
  Shuffle,
  Play,
  MoreHorizontal,
  FileAudio,
} from "lucide-react";

const headerVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const listVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 550,
      damping: 36,
    },
  },
};

import {
  getPlaylist,
  addRecent,
  removeSongFromPlaylist,
} from "../../services/api";
import { playTrackList } from "../../utils/playback";
import "./PlaylistDetail.css";

function PlaylistSongRow({
  song,
  onPlaySong,
  onRemoveSong,
  isCurrent,
  type,
  variants,
}) {
  const { showOptions } = useModal();
  const tapFeedback = { scale: 0.98 };

  const openMenu = () =>
    showOptions(
      ["Play", "Download", "Remove from Playlist"],
      async (option) => {
        if (option === "Play") return onPlaySong(song);
        if (option === "Download") return;
        if (option === "Remove from Playlist") return onRemoveSong(song);
      },
    );

  const longPressProps = useLongPress(openMenu, () => onPlaySong(song));

  return (
    <div className="song-row">
      <motion.button
        type="button"
        className="song-row-main"
        whileTap={tapFeedback}
        variants={variants}
        {...longPressProps}
      >
        <div
          className="song-row-cover"
          style={
            song.cover ? { backgroundImage: `url(${song.cover})` } : undefined
          }
        />
        <div className="song-row-info">
          <p className={`song-row-title${isCurrent ? " current" : ""}`}>
            {song.title}
          </p>
          <p className="song-row-artist">{song.artist}</p>
        </div>
        {type === "mp3" && <FileAudio size={14} className="song-row-type" />}
        <span className="song-duration">{song.durationLabel}</span>
      </motion.button>

      <button
        type="button"
        className="song-row-kebab"
        onClick={openMenu}
        aria-label="More options"
      >
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
}

function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, currentTrack } = useContext(PlayerContext);

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalMinutes = Math.round(
    songs.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
  );

  useEffect(() => {
    let active = true;

    const start = Date.now();

    (async () => {
      try {
        const data = await getPlaylist(id);
        console.log(data);

        if (!active) return;

        setPlaylist(data);
        setSongs(data?.songs || []);
      } catch (err) {
        console.error("Playlist laden mislukt:", err);
      } finally {
        const elapsed = Date.now() - start;
        const wait = Math.max(1000 - elapsed, 0);

        setTimeout(() => {
          if (active) setIsLoading(false);
        }, wait);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const handlePlaySong = (song) => {
    if (!song) return;

    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
      songs,
    );

    if (song.id) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  const handlePlayAll = () => {
    playTrackList(songs, { playSong, navigate });
  };

  const handleShuffle = () => {
    playTrackList(songs, { playSong, navigate, shuffle: true });
  };

  const handleRemoveSong = async (song) => {
    try {
      await removeSongFromPlaylist(id, song.id);
      setSongs((prev) => prev.filter((s) => s.id !== song.id));
    } catch (err) {
      console.error("Song verwijderen mislukt:", err);
    }
  };

  const coverUrl = playlist?.cover?.trim() ? playlist.cover : null;

  return (
    <motion.div
      className="playlist-detail-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="playlist-header">
        <button
          className="playlist-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="playlist-header-content">
          {playlist && (
            <>
              <motion.div
                className="playlist-cover-wrap"
                initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Playlist Cover"
                    className="playlist-main-cover"
                  />
                ) : (
                  <div className="playlist-main-cover playlist-main-cover-empty" />
                )}
              </motion.div>

              <motion.div
                className="playlist-info"
                variants={headerVariants}
                initial="hidden"
                animate="show"
              >
                <h1 className="playlist-title">
                  {playlist.title || "Playlist"}
                </h1>
                <p className="playlist-description">
                  {playlist.description || ""}
                </p>
                <div className="playlist-stats">
                  Afspeellijst &middot; {songs.length} nummers &middot;{" "}
                  {totalMinutes} min
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <motion.div
        className="playlist-actions"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
      >
        <div className="playlist-actions-left">
          <motion.button
            className="playlist-action-icon"
            whileTap={{ scale: 0.9 }}
            onClick={handleShuffle}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <Shuffle size={26} strokeWidth={1.8} />
          </motion.button>
        </div>

        <motion.button
          className="btn-play-circle"
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAll}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.28,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <Play size={26} fill="currentColor" stroke="none" />
        </motion.button>
      </motion.div>

      <motion.div
        className="songs-list"
        initial="hidden"
        animate="show"
        variants={listVariants}
      >
        {songs.map((song, index) => (
          <PlaylistSongRow
            key={song.id || index}
            song={song}
            onPlaySong={handlePlaySong}
            onRemoveSong={handleRemoveSong}
            isCurrent={currentTrack?.src === song.src}
            type={song.type}
            variants={rowVariants}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export default PlaylistDetail;
