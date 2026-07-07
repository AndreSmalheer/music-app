import "./MediaControls.css";
import { NavLink } from "react-router-dom";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

const LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 35,
};

function MediaControls({
  audioPlayerRef,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  isPlaying,
  isLoading,
  currentTrack,
  currentTime,
  duration,
}) {
  return (
    <NavLink to="/now-playing" className="media-controls-link">
      <motion.div
        className={`media-controls${isLoading ? " media-controls--loading" : ""}`}
        layoutId="player-container"
        layout
        transition={LAYOUT_TRANSITION}
      >
        <motion.div
          className="media-cover-image"
          layoutId="player-album-cover-wrap"
          layout
          transition={LAYOUT_TRANSITION}
        >
          <motion.img
            src={currentTrack?.coverSrc}
            alt=""
            layoutId="player-album-art"
            layout
            transition={LAYOUT_TRANSITION}
          />
          {isPlaying && (
            <div className="media-eq-overlay">
              <span className="media-eq-bar" />
              <span className="media-eq-bar media-eq-bar--2" />
              <span className="media-eq-bar media-eq-bar--3" />
            </div>
          )}
        </motion.div>

        <motion.div
          className="media-text"
          layoutId="player-text-info"
          layout
          transition={LAYOUT_TRANSITION}
        >
          <p className="media-song-title">
            {currentTrack?.title || "No track"}
          </p>
          <p className="media-artist-name">{currentTrack?.artist || ""}</p>
        </motion.div>

        <motion.button
          className="media-play-button"
          layoutId="player-play-btn"
          layout
          transition={LAYOUT_TRANSITION}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isLoading) return;
            if (isPlaying) {
              onPause();
            } else {
              onPlay();
            }
          }}
          aria-label={isLoading ? "Loading" : isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <span className="media-loading-spinner" />
          ) : isPlaying ? (
            <Pause size={22} fill="currentColor" strokeWidth={1.5} />
          ) : (
            <Play size={22} fill="currentColor" strokeWidth={1.5} />
          )}
        </motion.button>

        <motion.div
          className="media-progress"
          layoutId="player-progress"
          layout
          transition={LAYOUT_TRANSITION}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!audioPlayerRef.current || duration <= 0) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;

            audioPlayerRef.current.currentTime = percent * duration;
          }}
        >
          <div
            className="media-progress-fill"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </motion.div>
      </motion.div>
    </NavLink>
  );
}

export default MediaControls;
