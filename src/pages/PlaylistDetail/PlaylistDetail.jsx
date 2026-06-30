import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import Skeleton from "../../components/Skeleton/Skeleton";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import {
  ChevronLeft,
  Download,
  Shuffle,
  Play,
  MoreHorizontal,
  FileAudio,
} from "lucide-react";

import {
  getPlaylist,
  addRecent,
  removeSongFromPlaylist,
} from "../../services/api";
import { playTrackList } from "../../utils/playback";
import "./PlaylistDetail.css";

function PlaylistSongRow({
  song,
  index,
  onPlaySong,
  onRemoveSong,
  isCurrent,
  type,
}) {
  const { showOptions } = useModal();
  const tapFeedback = { scale: 0.98 };
  console.log(type);
  const openMenu = () =>
    showOptions(["Play", "Remove from Playlist"], async (option) => {
      if (option === "Play") {
        onPlaySong(song);
        return;
      }

      if (option === "Remove from Playlist") {
        await onRemoveSong(song);
      }
    });
  const longPressProps = useLongPress(openMenu, () => onPlaySong(song));

  return (
    <div className="song-row">
      <motion.button
        type="button"
        className="song-row-main"
        whileTap={tapFeedback}
        {...longPressProps}
      >
        <div
          className="song-row-cover"
          style={
            song.cover ? { backgroundImage: `url(${song.cover})` } : undefined
          }
        />
        <div className="song-row-info">
          <p className={`song-row-title${isCurrent ? " current" : ""}`}>
            {song.title}
          </p>
          <p className="song-row-artist">{song.artist}</p>
        </div>

        {type === "mp3" && <FileAudio size={14} className="song-row-type" />}

        <span className="song-duration">{song.durationLabel}</span>
      </motion.button>
      <button
        type="button"
        className="song-row-kebab"
        onClick={openMenu}
        aria-label="More options"
      >
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
}

function PlaylistDetail() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const navigate = useNavigate();
  const { playSong, currentTrack } = useContext(PlayerContext);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPlaylist(id);
        console.log(data);
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
    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
      songs,
    );
    if (song.id) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  // Speel de hele playlist vanaf het begin.
  const handlePlayAll = () => {
    playTrackList(songs, { playSong, navigate });
  };

  // Speel de playlist in willekeurige volgorde.
  const handleShuffle = () => {
    playTrackList(songs, { playSong, navigate, shuffle: true });
  };

  const handleRemoveSong = async (song) => {
    try {
      await removeSongFromPlaylist(id, song.id);
      setSongs((currentSongs) =>
        currentSongs.filter((currentSong) => currentSong.id !== song.id),
      );
    } catch (err) {
      console.error("Song verwijderen uit playlist mislukt:", err);
    }
  };

  const totalMinutes = Math.round(
    songs.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
  );

  return (
    <div className="playlist-detail-page">
      <div className="playlist-header">
        <button
          type="button"
          className="playlist-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="playlist-header-content">
          <img
            src={
              playlist?.cover || "/indieblog-best-album-covers-2010s-07 4.png"
            }
            alt="Playlist Cover"
            className="playlist-main-cover"
          />
          <div className="playlist-info">
            <h1 className="playlist-title">{playlist?.title || "Playlist"}</h1>
            <p className="playlist-description">
              A curated selection of the best visual design test tracks.
            </p>
            <div className="playlist-stats">
              Afspeellijst &middot; {songs.length} nummers &middot;{" "}
              {totalMinutes} min
            </div>
          </div>
        </div>
      </div>

      <div className="playlist-actions">
        <div className="playlist-actions-left">
          <motion.button
            type="button"
            className="playlist-action-icon"
            whileTap={{ scale: 0.9 }}
            onClick={handleShuffle}
            aria-label="Shuffle"
          >
            <Shuffle size={26} strokeWidth={1.8} />
          </motion.button>
        </div>
        <motion.button
          className="btn-play-circle"
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAll}
          aria-label="Play"
        >
          <Play size={26} fill="currentColor" stroke="none" />
        </motion.button>
      </div>

      <div className="songs-list">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="song-row"
                style={{ padding: "9px 18px", gap: "14px" }}
              >
                <Skeleton width="48px" height="48px" borderRadius="4px" />
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
              <PlaylistSongRow
                key={song.id}
                song={song}
                index={index}
                onPlaySong={handlePlaySong}
                onRemoveSong={handleRemoveSong}
                isCurrent={currentTrack?.src === song.src}
                type={song.type}
              />
            ))}
      </div>
    </div>
  );
}

export default PlaylistDetail;
