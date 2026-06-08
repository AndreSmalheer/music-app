import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import "./SeeAll.css";
import OptionsMenu from "../../components/OptionsMenu/OptionsMenu";
import useLongPress from "../../hooks/useLongPress";
import Skeleton from "../../components/Skeleton/Skeleton";

function SeeAll() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const longPressProps = useLongPress(() => setOptionsOpen(true));
  const tapFeedback = { scale: 0.98 };

  const menuOptions = [
    "Add to Playlist",
    "Go to Album",
    "View Artist",
    "Share Song",
  ];

  if (isLoading) {
    return (
      <div className="see-all-page">
        <Skeleton width="150px" height="32px" style={{ marginBottom: "20px" }} />
        <div className="see-all-recent-songs-container">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="see-all-recent-song" style={{ gap: "10px", display: "flex", alignItems: "center" }}>
              <Skeleton width="60px" height="60px" borderRadius="6px" />
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <Skeleton width="150px" height="20px" />
                <Skeleton width="100px" height="16px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="see-all-page">
      <h1 className="see-all-title">Recent Songs</h1>

      <div className="see-all-recent-songs-container">
        <motion.div 
          className="see-all-recent-song" 
          {...longPressProps}
          whileTap={tapFeedback}
        >
          <div className="see-all-recent-song-album-cover">
            <img src="/covers/test-cover.jpg" alt="Song" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}} />
          </div>

          <div className="see-all-recent-song-song-info">
            <div className="see-all-recent-song-song-info-title">Title</div>
            <div className="see-all-recent-song-song-info-artists">Artist</div>
          </div>

          <div className="options-container-see-all" onClick={() => setOptionsOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </motion.div>

        <motion.div 
          className="see-all-recent-song" 
          {...longPressProps}
          whileTap={tapFeedback}
        >
          <div className="see-all-recent-song-album-cover">
            <img src="/covers/test-cover.jpg" alt="Song" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}} />
          </div>

          <div className="see-all-recent-song-song-info">
            <div className="see-all-recent-song-song-info-title">Title</div>
            <div className="see-all-recent-song-song-info-artists">Artist</div>
          </div>

          <div className="options-container-see-all" onClick={() => setOptionsOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </motion.div>

        <motion.div 
          className="see-all-recent-song" 
          {...longPressProps}
          whileTap={tapFeedback}
        >
          <div className="see-all-recent-song-album-cover">
            <img src="/covers/test-cover.jpg" alt="Song" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}} />
          </div>

          <div className="see-all-recent-song-song-info">
            <div className="see-all-recent-song-song-info-title">Title</div>
            <div className="see-all-recent-song-song-info-artists">Artist</div>
          </div>

          <div className="options-container-see-all" onClick={() => setOptionsOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </motion.div>
      </div>

      <OptionsMenu
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={menuOptions}
        onOptionClick={(option) => console.log(option)}
      />
    </div>
  );
}

export default SeeAll;
