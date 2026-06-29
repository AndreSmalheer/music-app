import { motion } from "framer-motion";
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
  InculdeYt = true,
  YtSearchStyling = false,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [tracks, setTracks] = useState(tracksProp || []);

  const navigate = useNavigate();

  const { playSong } = useContext(PlayerContext);
  const { showOptions, showConfirm } = useModal();

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
        track.id,
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
      <div className="recently-played__header">
        <h2 className="recently-played__title">Onlangs afgespeeld</h2>

        <button
          className="recently-played__arrow"
          aria-label="See all"
          onClick={() => navigate(`/see-all?includeYt=${InculdeYt}`)}
        >
          <ArrowBtn />
        </button>
      </div>

      <div className="recently-played__list">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="track-card">
              <Skeleton height="140px" borderRadius="12px" />

              <Skeleton height="1rem" style={{ marginTop: "10px" }} />
            </div>
          ))
        ) : tracks.length > 0 ? (
          tracks
            .slice(0, 3)
            .map((track) => (
              <SongItem
                key={track.id}
                song={track}
                handlePlaySong={handleTrackClick}
                showOptions={showOptions}
                showConfirm={showConfirm}
                onDeleteSong={(deletedTrack) =>
                  setTracks((currentTracks) =>
                    currentTracks.filter((track) => track.id !== deletedTrack.id),
                  )
                }
                variant="card"
              />
            ))
        ) : (
          <div className="empty-track-card">
            <div className="empty-track-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentlyPlayed;
