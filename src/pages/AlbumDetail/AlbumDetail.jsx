import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import { ChevronLeft, Play, Shuffle, Music } from "lucide-react";
import { getAlbum } from "../../services/api";
import "./AlbumDetail.css";

const listVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.04, staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 550, damping: 36 },
  },
};

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coverError, setCoverError] = useState(false);

  const longPressProps = useLongPress(() =>
    showOptions(["Add to Playlist", "Share"], (opt) => console.log(opt)),
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setCoverError(false);
    (async () => {
      try {
        const data = await getAlbum(id);
        if (!active) return;
        setAlbum(data);
      } catch (err) {
        console.error("Album load failed:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const tracks = album?.tracks || [];

  const handlePlayTrack = (track, queue) => {
    if (!track) return;
    playSong(
      "",
      track.title,
      track.artist,
      track.cover || album?.cover || "",
      -1,
      track.youtubeId || null,
      queue || tracks,
      track.id,
    );
    navigate("/now-playing");
  };

  const handlePlayAll = () => {
    if (!tracks.length) return;
    handlePlayTrack(tracks[0], tracks);
  };

  const handleShuffle = () => {
    if (!tracks.length) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    handlePlayTrack(shuffled[0], shuffled);
  };

  return (
    <div className="album-detail-page">
      {/* Header */}
      <div className="album-detail-header">
        <button
          className="album-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="album-cover-wrap">
          {isLoading ? (
            <div className="album-cover-skeleton" />
          ) : !coverError && album?.cover ? (
            <motion.img
              src={album.cover}
              alt={album?.title}
              className="album-cover-img"
              initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="album-cover-fallback">
              <Music size={40} />
            </div>
          )}
        </div>

        {/* Meta */}
        <motion.div
          className="album-meta"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h1 className="album-title">{album?.title || "Album"}</h1>
          {album?.artist && (
            <p className="album-artist">{album.artist}</p>
          )}
          <p className="album-info">
            {[album?.type, album?.year, tracks.length ? `${tracks.length} tracks` : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="album-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <motion.button
            type="button"
            className="album-shuffle-btn"
            whileTap={{ scale: 0.9 }}
            onClick={handleShuffle}
            aria-label="Shuffle"
          >
            <Shuffle size={24} strokeWidth={1.8} />
          </motion.button>
          <motion.button
            type="button"
            className="album-play-btn"
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            aria-label="Play"
          >
            <Play size={24} fill="currentColor" stroke="none" />
          </motion.button>
        </motion.div>
      </div>

      {/* Track list */}
      <div className="album-tracklist">
        {isLoading ? (
          <div className="album-tracklist-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="album-track-skeleton-row" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={listVariants}
          >
            {tracks.map((track, i) => (
              <motion.div
                key={track.id || i}
                className="album-track-row"
                variants={rowVariants}
                {...longPressProps}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlayTrack(track, tracks)}
              >
                <span className="album-track-index">{track.trackNumber || i + 1}</span>
                <div className="album-track-info">
                  <p className="album-track-title">{track.title}</p>
                  {track.artist && track.artist !== album?.artist && (
                    <p className="album-track-artist">{track.artist}</p>
                  )}
                </div>
                <span className="album-track-duration">
                  {track.durationLabel || formatDuration(track.duration)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && tracks.length === 0 && (
          <div className="album-empty">
            <Music size={40} />
            <p>No tracks found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlbumDetail;
