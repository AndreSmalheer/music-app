import { motion, AnimatePresence } from "framer-motion";
import useDelayedLoading from "../../hooks/useDelayedLoading";
import "./RecentlyPlayed.css";
import { useNavigate } from "react-router-dom";
import { useCallback, useState, useContext, useEffect } from "react";
import { useModal } from "../../context/ModalContext";
import Skeleton from "../Skeleton/Skeleton";
import useLongPress from "../../hooks/useLongPress";
import { PlayerContext } from "../MediaPlayer/MediaPlayer";
import { getRecent, addRecent } from "../../services/api";
import SongItem from "../items/SongItem";
import { ArrowRight } from "lucide-react";

function ArrowBtn() {
  return <ArrowRight size={22} strokeWidth={2.5} />;
}

function RecentlyPlayed({
  tracks: tracksProp,
  fallbackTracks = [],
  InculdeYt = false,
  YtSearchStyling = false,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const showLoading = useDelayedLoading(isLoading, 150);
  const [tracks, setTracks] = useState(tracksProp || []);

  const navigate = useNavigate();

  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();

  useEffect(() => {
    if (tracksProp) {
      setTracks(tracksProp);
      setIsLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const data = await getRecent();

        if (!InculdeYt) {
          const filtered = data.filter((track) => !track.youtubeId);

          if (active) setTracks(filtered);
        } else {
          if (active) setTracks(data);
        }
      } catch (err) {
        console.error("Recently played laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [tracksProp, InculdeYt]);

  const handleTrackClick = useCallback(
    (track) => {
      playSong(
        track.src,
        track.title,
        track.artist,
        track.cover,
        -1,
        track.youtubeId || null,
        tracks,
      );

      if (track.id) {
        addRecent(track.id).catch(() => {});
      }

      navigate("/now-playing");
    },
    [playSong, navigate, tracks],
  );

  return (
    <div
      className={`recently-played ${
        YtSearchStyling ? "yt-search-styling" : ""
      }`}
    >
      {/* <div className="recently-played__header">
        <h2 className="recently-played__title">Onlangs afgespeeld</h2>

        <button
          className="recently-played__arrow"
          aria-label="See all"
          onClick={() => navigate(`/see-all?includeYt=${InculdeYt}`)}
        >
          <ArrowBtn />
        </button>
      </div> */}

      <AnimatePresence mode="wait">
        {showLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="recently-played__list home-tiles"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="home-tile">
                <Skeleton height="140px" borderRadius="12px" />
                <Skeleton height="1rem" style={{ marginTop: "10px" }} />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="recently-played__list home-tiles"
          >
            {(() => {
              const list = tracks.length > 0 ? tracks : fallbackTracks;
              return list.length > 0 ? (
                <>
                  {list.slice(0, 6).map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                        delay: index * 0.08,
                      }}
                    >
                      <SongItem
                        song={track}
                        handlePlaySong={handleTrackClick}
                        showOptions={showOptions}
                        variant="tile"
                      />
                    </motion.div>
                  ))}
                  <div
                    className="home-tile-see-all-tile"
                    onClick={() => navigate(`/see-all?includeYt=${InculdeYt}`)}
                  >
                    <h3>See All</h3>
                  </div>
                </>
              ) : (
                <div className="empty-track-card home-tile">
                  <div className="empty-track-cover" />
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RecentlyPlayed;
