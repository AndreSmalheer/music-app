import { motion } from "framer-motion";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import OptionsMenu from "../../components/OptionsMenu/OptionsMenu";
import Skeleton from "../../components/Skeleton/Skeleton";
import useLongPress from "../../hooks/useLongPress";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";

const TAGS = ["All", "Songs", "Albums", "Artists", "Playlists"];

function Search() {
  const [activeTag, setActiveTag] = useState("All");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = useContext(PlayerContext);
  const navigate = useNavigate();

  const longPressProps = useLongPress(() => setOptionsOpen(true));
  const tapFeedback = { scale: 0.98 };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlaySong = (title, artist) => {
    playSong("music/test.mp3", title, artist, "/indieblog-best-album-covers-2010s-07 4.png");
    navigate("/now-playing");
  };

  const menuOptions = [
    "Add to Playlist",
    "Go to Album",
    "View Artist",
    "Share Song",
    "Sleep Timer",
  ];

  return (
    <>
      <div className="search-page">
        <input className="search-container" placeholder="type here..."></input>

        <div className="tags-container">
          {TAGS.map((tag) => (
            <div
              key={tag}
              className={`tag ${activeTag === tag ? "active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              <h2>{tag}</h2>
            </div>
          ))}
        </div>

        <div className="top-result result-section">
          <h3>Top Result</h3>

          {isLoading ? (
            <div className="result-container">
              <Skeleton width="100%" height="150px" borderRadius="12px" />
              <Skeleton width="100%" height="150px" borderRadius="12px" />
            </div>
          ) : (
            <div className="result-container">
              <motion.div 
                className="serach-result-album-cover" 
                {...longPressProps}
                whileTap={tapFeedback}
              >
                <img src="/covers/test-cover.jpg" alt="Result" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
              </motion.div>

              <motion.div 
                className="serach-result-album-cover" 
                {...longPressProps}
                whileTap={tapFeedback}
              >
                <img src="/indieblog-best-album-covers-2010s-07 4.png" alt="Result" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
              </motion.div>
            </div>
          )}
        </div>

        <div className="result-section result-songs">
          <h3>Songs</h3>

          <div className="songs-container">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="song" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "10px" }}>
                  <Skeleton width="50px" height="50px" borderRadius="6px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="70%" height="1rem" />
                    <Skeleton width="40%" height="0.8rem" style={{ marginTop: "0.5rem" }} />
                  </div>
                </div>
              ))
            ) : (
              <>
                <motion.div 
                  className="song" 
                  {...longPressProps}
                  whileTap={tapFeedback}
                  onClick={() => handlePlaySong("Song Title", "Artist")}
                >
                  <div className="album-cover-search-result">
                    <img src="/covers/test-cover.jpg" alt="Song" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}} />
                  </div>

                  <div className="search-song-info">
                    <h2 className="search-song-title">Title</h2>

                    <div className="search-song-artist">Artist</div>
                  </div>

                  <div
                    className="options-container"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsOpen(true);
                    }}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
                <motion.div 
                  className="song" 
                  {...longPressProps}
                  whileTap={tapFeedback}
                  onClick={() => handlePlaySong("Song Title", "Artist")}
                >
                  <div className="album-cover-search-result">
                    <img src="/covers/test-cover.jpg" alt="Song" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}} />
                  </div>

                  <div className="search-song-info">
                    <h2 className="search-song-title">Title</h2>

                    <div className="search-song-artist">Artist</div>
                  </div>

                  <div
                    className="options-container"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsOpen(true);
                    }}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <div className="result-section result-artist">
          <h3 className="result-section-title">Artist</h3>

          <div className="artists-container-result">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="result-artist" style={{ textAlign: "center" }}>
                  <Skeleton width="100px" height="100px" borderRadius="50%" style={{ margin: "0 auto" }} />
                  <Skeleton width="60px" height="1rem" style={{ margin: "0.5rem auto" }} />
                </div>
              ))
            ) : (
              <>
                <motion.div 
                  className="result-artist" 
                  {...longPressProps}
                  whileTap={tapFeedback}
                  onClick={() => navigate("/artist/1")}
                >
                  <div className="result-artist-img">
                    <img src="/covers/test-cover.jpg" alt="Artist" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                  </div>

                  <h3 className="result-artist-text">Artist</h3>
                </motion.div>

                <motion.div 
                  className="result-artist" 
                  {...longPressProps}
                  whileTap={tapFeedback}
                  onClick={() => navigate("/artist/1")}
                >
                  <div className="result-artist-img">
                    <img src="/covers/test-cover.jpg" alt="Artist" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                  </div>

                  <h3 className="result-artist-text">Artist</h3>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      <OptionsMenu
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={menuOptions}
        onOptionClick={(option) => console.log(option)}
      />
    </>
  );
}

export default Search;
