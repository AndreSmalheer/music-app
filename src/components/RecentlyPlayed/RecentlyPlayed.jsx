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

function ArrowBtn() {
  return (
    <svg
      width="1586"
      height="1107"
      viewBox="0 0 1586 1107"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1586 553.049C1585.45 504.481 1561.43 458.046 1519.16 423.806L1033.17 26.845C1011.94 9.65095 983.228 0 953.299 0C923.371 0 894.658 9.65095 873.433 26.845C862.815 35.427 854.387 45.6373 848.636 56.8869C842.884 68.1365 839.923 80.2028 839.923 92.3897C839.923 104.577 842.884 116.643 848.636 127.892C854.387 139.142 862.815 149.352 873.433 157.934L1246.14 460.733H113.286C83.2405 460.733 54.4258 470.459 33.1806 487.771C11.9354 505.084 0 528.565 0 553.049C0 577.533 11.9354 601.014 33.1806 618.327C54.4258 635.639 83.2405 645.366 113.286 645.366H1246.14L873.433 949.087C852.101 966.348 840.057 989.808 839.951 1014.31C839.844 1038.8 851.685 1062.33 872.866 1079.71C894.048 1097.1 922.837 1106.91 952.899 1107C982.961 1107.09 1011.83 1097.44 1033.17 1080.18L1519.16 683.215C1561.71 648.749 1585.75 601.938 1586 553.049Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RecentlyPlayed({
  tracks: tracksProp,
  InculdeYt = false,
  YtSearchStyling = false,
}) {
  const [isLoading, setIsLoading] = useState(true);
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
