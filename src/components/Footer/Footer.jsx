import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Library } from "lucide-react";
import MediaControls from "../MediaControls/MediaControls";
import { PlayerContext } from "../MediaPlayer/MediaPlayer";
import "./Footer.css";

function Footer() {
  const location = useLocation();
  const {
    audioPlayerRef,
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
  } = useContext(PlayerContext);

  const isNowPlayingPage = location.pathname === "/now-playing";
  const showMediaControls = !isNowPlayingPage && currentTrack;

  const navItem = ({ isActive }) =>
    isActive ? "footer-btn active" : "footer-btn";

  return (
    <div className="Footer-container">
      {showMediaControls && (
        <MediaControls
          audioPlayerRef={audioPlayerRef}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          currentTime={currentTime}
          duration={duration}
        />
      )}

      <nav className="Footer">
        <NavLink to="/" className={navItem} end>
          <Home size={24} strokeWidth={1.9} />
          <span className="footer-label">Home</span>
        </NavLink>

        <NavLink to="/search" className={navItem}>
          <Search size={24} strokeWidth={1.9} />
          <span className="footer-label">Zoeken</span>
        </NavLink>

        <NavLink to="/library" className={navItem}>
          <Library size={24} strokeWidth={1.9} />
          <span className="footer-label">Bibliotheek</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default Footer;
