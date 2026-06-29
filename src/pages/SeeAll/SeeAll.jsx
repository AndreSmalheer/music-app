import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

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

      song.id,
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
          <button
            className="see-all-back"
            onClick={() => navigate(-1)}
            aria-label="Terug"
          >
            <ChevronLeft size={26} />
          </button>
          <Skeleton width="180px" height="28px" />
        </div>
      </div>
    );
  }

  return (
    <div className="see-all-page">
      <div className="see-all-header">
        <button
          className="see-all-back"
          onClick={() => navigate(-1)}
          aria-label="Terug"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="see-all-title">Onlangs afgespeeld</h1>
      </div>

      <div className="see-all-recent-songs-container">
        {songs.length > 0 ? (
          songs.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              handlePlaySong={handlePlaySong}
              showOptions={showOptions}
            />
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
