import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import Skeleton from "../../components/Skeleton/Skeleton";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import { getPlaylist, addRecent } from "../../services/api";
import "./PlaylistDetail.css";

function PlaylistDetail() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const [isDragging, setIsDragging] = useState(false);

  const menuOptions = [
    "Shuffle",
    "Edit Playlist",
    "Add Songs",
    "Delete",
    "Download",
  ];

  const { stop, ...longPressProps } = useLongPress(
    () => showOptions(menuOptions, (opt) => console.log(opt)),
    null,
    { disabled: isDragging },
  );
  const tapFeedback = { scale: 0.98 };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPlaylist(id);
        if (!active) return;
        setPlaylist(data);
        setSongs(data?.songs || []);
      } catch (err) {
        console.error("Playlist laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handlePlaySong = (song) => {
    if (!song) return;
    playSong(song.src, song.title, song.artist, song.cover, -1, song.youtubeId || null);
    if (song.id) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  const totalMinutes = Math.round(
    songs.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
  );

  return (
    <div className="playlist-detail-page">
      <div className="playlist-header">
        <div className="playlist-header-content">
          <img
            src={playlist?.cover || "/indieblog-best-album-covers-2010s-07 4.png"}
            alt="Playlist Cover"
            className="playlist-main-cover"
          />
          <div className="playlist-info">
            <h1 className="playlist-title">{playlist?.title || "Playlist"}</h1>
            <p className="playlist-description">
              A curated selection of the best visual design test tracks.
            </p>
            <div className="playlist-stats">
              <span>{songs.length} songs</span> • <span>{totalMinutes} mins</span>
            </div>
          </div>
        </div>

        <div className="playlist-actions">
          <motion.button
            className="btn-playlist-action play"
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlaySong(songs[0])}
          >
            Play
          </motion.button>
          <motion.button
            className="btn-playlist-action shuffle"
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlaySong(songs[0])}
          >
            Shuffle
          </motion.button>
        </div>
      </div>

      <div className="songs-list">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="song-row"
                style={{ padding: "12px", gap: "16px" }}
              >
                <Skeleton width="20px" height="14px" />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Skeleton height="16px" width="70%" />
                  <Skeleton height="13px" width="40%" />
                </div>
                <Skeleton width="30px" height="13px" />
              </div>
            ))
          : songs.map((song, index) => (
              <motion.div
                key={song.id}
                className="song-row"
                whileTap={tapFeedback}
                onClick={() => handlePlaySong(song)}
                {...longPressProps}
              >
                <span className="song-index">{index + 1}</span>
                <div className="song-row-info">
                  <p className="song-row-title">{song.title}</p>
                  <p className="song-row-artist">{song.artist}</p>
                </div>
                <span className="song-duration">{song.durationLabel}</span>
              </motion.div>
            ))}
      </div>
    </div>
  );
}

export default PlaylistDetail;
