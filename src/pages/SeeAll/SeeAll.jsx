import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import "./SeeAll.css";

import { useModal } from "../../context/ModalContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import SongItem from "../../components/items/SongItem";

import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";

import { getRecent, addRecent } from "../../services/api";

function SeeAll() {
  const { showOptions } = useModal();

  const { playSong } = useContext(PlayerContext);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const includeYt = searchParams.get("includeYt") === "true";

  const [isLoading, setIsLoading] = useState(true);

  const [songs, setSongs] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getRecent();

        if (!includeYt) {
          const filtered = data.filter((song) => !song.youtubeId);

          if (active) setSongs(filtered);
        } else {
          if (active) setSongs(data);
        }
      } catch (err) {
        console.error("Recent songs laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [includeYt]);

  const handlePlaySong = (song) => {
    playSong(
      song.src,

      song.title,

      song.artist,

      song.cover,

      -1,

      song.youtubeId || null,

      songs,
    );

    if (song.id) {
      addRecent(song.id).catch(() => {});
    }

    navigate("/now-playing");
  };

  if (isLoading) {
    return (
      <div className="see-all-page">
        <div className="see-all-header">
          <Skeleton width="180px" height="28px" />
        </div>

        <div className="see-all-recent-songs-container">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "70px",
                marginBottom: "10px",
                borderRadius: "12px",
                background: "rgb(45, 45, 45)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="see-all-page">
      <div className="see-all-header">
        <h1 className="see-all-title">Onlangs afgespeeld</h1>
      </div>

      <div className="see-all-recent-songs-container">
        <AnimatePresence mode="wait">
          {songs.length > 0 ? (
            <motion.div
              key="songs"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {" "}
              {songs.map((song) => (
                <motion.div
                  key={song.id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 18,
                      filter: "blur(6px)",
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.3,
                        ease: "easeOut",
                      },
                    },
                  }}
                >
                  <SongItem
                    song={song}
                    handlePlaySong={handlePlaySong}
                    showOptions={showOptions}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <EmptyState
                title="No songs found"
                subtitle="Start listening to music to see recent songs"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SeeAll;
