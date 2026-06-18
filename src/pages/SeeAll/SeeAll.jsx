import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./SeeAll.css";
import { useModal } from "../../context/ModalContext";
import useLongPress from "../../hooks/useLongPress";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { getRecent, addRecent } from "../../services/api";

function SeeAll() {
  const { showOptions } = useModal();
  const { playSong } = useContext(PlayerContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getRecent();
        if (active) setSongs(data);
      } catch (err) {
        console.error("Recent songs laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handlePlaySong = (song) => {
    playSong(song.src, song.title, song.artist, song.cover, -1, song.youtubeId || null);
    if (song.id) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  const longPressProps = useLongPress(() => showOptions(menuOptions, (opt) => console.log(opt)));
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
        {songs.length > 0 ? (
          songs.map((song) => (
            <motion.div
              key={song.id}
              className="see-all-recent-song"
              {...longPressProps}
              whileTap={tapFeedback}
              onClick={() => handlePlaySong(song)}
            >
              <div className="see-all-recent-song-album-cover">
                <img
                  src={song.cover}
                  alt={song.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div className="see-all-recent-song-song-info">
                <div className="see-all-recent-song-song-info-title">
                  {song.title}
                </div>
                <div className="see-all-recent-song-song-info-artists">
                  {song.artist}
                </div>
              </div>

              <div
                className="options-container-see-all"
                onClick={(e) => {
                  e.stopPropagation();
                  showOptions(menuOptions, (opt) => console.log(opt));
                }}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState
            title="No songs found"
            subtitle="Start listening to music to see recent songs"
          />
        )}
      </div>
    </div>
  );
}

export default SeeAll;
