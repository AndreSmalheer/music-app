import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import Skeleton from "../../components/Skeleton/Skeleton";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import {
  ChevronLeft,
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

function PlaylistSongRow({ song, onPlaySong, onRemoveSong, isCurrent, type }) {
  const { showOptions } = useModal();
  const tapFeedback = { scale: 0.98 };

  const openMenu = () =>
    showOptions(
      ["Play", "Download", "Remove from Playlist"],
      async (option) => {
        if (option === "Play") return onPlaySong(song);
        if (option === "Download") return;
        if (option === "Remove from Playlist") return onRemoveSong(song);
      },
    );

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
  const navigate = useNavigate();
  const { playSong, currentTrack } = useContext(PlayerContext);

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalMinutes = Math.round(
    songs.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
  );

  useEffect(() => {
    let active = true;

    const start = Date.now();

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
        const elapsed = Date.now() - start;
        const wait = Math.max(1000 - elapsed, 0);

        setTimeout(() => {
          if (active) setIsLoading(false);
        }, wait);
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

  const handlePlayAll = () => {
    playTrackList(songs, { playSong, navigate });
  };

  const handleShuffle = () => {
    playTrackList(songs, { playSong, navigate, shuffle: true });
  };

  const handleRemoveSong = async (song) => {
    try {
      await removeSongFromPlaylist(id, song.id);
      setSongs((prev) => prev.filter((s) => s.id !== song.id));
    } catch (err) {
      console.error("Song verwijderen mislukt:", err);
    }
  };

  const coverUrl = playlist?.cover?.trim() ? playlist.cover : null;

  return (
    <div className="playlist-detail-page">
      <div className="playlist-header">
        <button
          className="playlist-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="playlist-header-content">
          <div className="playlist-cover-wrap">
            {isLoading ? (
              <Skeleton width="188px" height="188px" borderRadius="6px" />
            ) : coverUrl ? (
              <img
                src={coverUrl}
                alt="Playlist Cover"
                className="playlist-main-cover"
              />
            ) : (
              <div className="playlist-main-cover playlist-main-cover-empty" />
            )}
          </div>

          {isLoading ? (
            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
              }}
            >
              <Skeleton width="180px" height="28px" />
              <Skeleton width="260px" height="14px" />
              <Skeleton width="140px" height="13px" />
            </div>
          ) : (
            <div className="playlist-info">
              <h1 className="playlist-title">
                {playlist?.title || "Playlist"}
              </h1>
              <p className="playlist-description">
                {playlist?.description || ""}
              </p>
              <div className="playlist-stats">
                Afspeellijst &middot; {songs.length} nummers &middot;{" "}
                {totalMinutes} min
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="playlist-actions">
        <div className="playlist-actions-left">
          <motion.button
            className="playlist-action-icon"
            whileTap={{ scale: 0.9 }}
            onClick={handleShuffle}
          >
            <Shuffle size={26} strokeWidth={1.8} />
          </motion.button>
        </div>

        <motion.button
          className="btn-play-circle"
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAll}
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
                key={song.id || index}
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
