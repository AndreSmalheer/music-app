import "./MediaControls.css";
import { NavLink } from "react-router-dom";
import { SkipBack, SkipForward, Play, Pause } from "lucide-react";

function MediaControls({
  audioPlayerRef,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  isPlaying,
  title,
  artist,
  coverSrc,
}) {
  return (
    <NavLink to="/now-playing" className="media-controls-link">
      <div className="media-controls">
        <div className="media-cover-image">
          <img src={coverSrc} alt="" />
          {isPlaying && (
            <div className="media-eq-overlay">
              <span className="media-eq-bar" />
              <span className="media-eq-bar media-eq-bar--2" />
              <span className="media-eq-bar media-eq-bar--3" />
            </div>
          )}
        </div>

        <div className="media-text">
          <p className="media-song-title">{title || "No track"}</p>
          <p className="media-artist-name">{artist || ""}</p>
        </div>

        <button
          className="media-play-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isPlaying) {
              onPause();
            } else {
              onPlay();
            }
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={22} fill="currentColor" strokeWidth={1.5} />
          ) : (
            <Play size={22} fill="currentColor" strokeWidth={1.5} />
          )}
        </button>

        <div className="media-progress">
          <div className="media-progress-fill" />
        </div>
      </div>
    </NavLink>
  );
}

export default MediaControls;
