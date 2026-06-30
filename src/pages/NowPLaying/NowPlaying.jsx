import "./NowPlaying.css";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useState, useContext, useEffect } from "react";
import { useModal } from "../../context/ModalContext";
import { useNavigate } from "react-router-dom";
import Slider from "../../components/Slider/Slider";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from "framer-motion";
import { useRef } from "react";
import { useDownload } from "../../context/DownloadContext";
import {
  Download,
  Check,
  Heart,
  ChevronDown,
  MoreVertical,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  Airplay,
  Share2,
  ListMusic,
  GripVertical,
} from "lucide-react";
import {
  addSongToPlaylist,
  getPlaylists,
  deleteSong,
} from "../../services/api";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const MotionButton = motion.button;
const MotionDiv = motion.div;

function QueueItem({ track, index, currentIndex }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={track}
      className={`queue-item ${index === currentIndex ? "now-playing" : ""}`}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      <img src={track.coverSrc} alt="" className="queue-item-image" />

      <div className="queue-item-info">
        <p className="queue-item-title">{track.title}</p>
        <p className="queue-item-artist">{track.artist}</p>
      </div>

      <div
        className="queue-item-reorder"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          controls.start(e);
        }}
      >
        <GripVertical size={22} strokeWidth={2} />
      </div>
    </Reorder.Item>
  );
}

function NowPlaying() {
  const {
    audioPlayerRef,
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    volume,
    queue,
    currentIndex,
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    handleVolumeChange,
    reorderQueue,
    repeatMode,
    shuffle,
    toggleRepeat,
    toggleShuffle,
  } = useContext(PlayerContext);

  const [favroute, setFavroute] = useState(false);
  const { showOptions } = useModal();
  const navigate = useNavigate();
  const [queueOpen, setQueueOpen] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const { downloads, startDownload } = useDownload();
  const isCurrentlyDownloading = downloads.some(
    (dl) =>
      dl.url.includes(currentTrack?.youtubeId) && dl.status === "downloading",
  );
  const loadedTrackRef = useRef(null);
  const modalControls = useDragControls();

  useEffect(() => {
    const audio = audioPlayerRef.current;

    if (!currentTrack?.youtubeId || !audio) {
      setYtLoading(false);
      loadedTrackRef.current = null;
      return;
    }

    const isAlreadyPlaying = audio.currentTime > 0 && !audio.paused;
    if (loadedTrackRef.current !== currentTrack.youtubeId) {
      if (!isAlreadyPlaying) {
        setYtLoading(true);
      }
      loadedTrackRef.current = currentTrack.youtubeId;
    } else if (isAlreadyPlaying) {
      setYtLoading(false);
    }

    const handleLoadStart = () => {
      setYtLoading(true);
    };

    const handlePlaying = () => {
      setYtLoading(false);
    };

    const handleCanPlay = () => {
      setYtLoading(false);
    };

    const handleError = () => {
      setYtLoading(false);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrack, audioPlayerRef]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("draggedIndex", index);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = parseInt(e.dataTransfer.getData("draggedIndex"), 10);
    if (dragIndex === dropIndex) return;

    const newQueue = [...queue];
    const draggedItem = newQueue[dragIndex];
    newQueue.splice(dragIndex, 1);
    newQueue.splice(dropIndex, 0, draggedItem);

    reorderQueue(newQueue);
  };

  const onRepeatClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleRepeat();
  };

  const showPlaylistOptions = async () => {
    try {
      const playlists = await getPlaylists();
      const options = playlists.map((playlist) => ({
        id: playlist.id,
        label: playlist.title,
      }));

      showOptions(
        options.length > 0
          ? options
          : [{ id: "no-playlists", label: "No playlists found" }],
        async (playlist) => {
          if (playlist.id === "no-playlists") return;

          try {
async (playlist) => {
  if (playlist.id === "no-playlists") return;

  try {
    await addSongToPlaylist(playlist.id, item.track);
  } catch (e) {
    console.error("Failed to add song to playlist:", e);
  }
}

          } catch (e) {
            console.error("Failed to add song to playlist:", e);
          }
        },
      );
    } catch (err) {
      console.error("Playlists laden mislukt:", err);
    }
  };

  async function addToFavouritePlaylist() {
    return;
  }

  const handleMenuOption = (option) => {
    switch (option) {
      case "Add to Playlist":
        setTimeout(showPlaylistOptions, 100);
        break;

      case "Delete":
        setSongToDelete(currentTrack);
        break;

      case "Download":
        setDownloadConfirmOpen(true);
        break;

      default:
        break;
    }
  };

  const openMenu = () => {
    showOptions(menuOptions, handleMenuOption);
  };

  const isActive = repeatMode !== "off";

  if (!currentTrack) {
    return (
      <div className="now-playing-page">
        <h1 className="now-playing-title">No song selected</h1>
      </div>
    );
  }

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "0:00";
    const absoluteTime = Math.max(0, time);
    const minutes = Math.floor(absoluteTime / 60);
    const seconds = Math.floor(absoluteTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const hasKnownDuration = Number.isFinite(duration) && duration > 0;
  const safeDuration = hasKnownDuration ? duration : 0;

  const menuOptions = currentTrack?.youtubeId
    ? ["Add to Playlist", "Download"]
    : ["Add to Playlist", "Delete"];

  const isYoutube = !!currentTrack.youtubeId;

  const handleDownload = () => {
    if (!currentTrack?.youtubeId || isCurrentlyDownloading) return;
    startDownload({
      url: `https://www.youtube.com/watch?v=${currentTrack.youtubeId}`,
      title: currentTrack.title,
      artist: currentTrack.artist,
      thumbnail:
        currentTrack.coverSrc || currentTrack.cover || currentTrack.img,
    });
    setDownloadConfirmOpen(false);
  };

  return (
    <>
      <div className="now-playing-page">
        <div className="np-topbar">
          <button
            type="button"
            className="np-top-btn"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronDown size={26} strokeWidth={2.1} />
          </button>

          <div className="np-top-label">
            <span className="np-top-eyebrow">SPEELT AF UIT</span>
            <span className="np-top-source">{currentTrack.artist}</span>
          </div>

          <button
            type="button"
            className="np-top-btn"
            onClick={openMenu}
            aria-label="More"
          >
            <MoreVertical size={24} strokeWidth={2} />
          </button>
        </div>

        {ytLoading ? (
          <div className="now-playing-loading">
            <div className="skeleton skeleton-album"></div>

            <div className="skeleton-info">
              <div className="skeleton-text">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-artist"></div>
              </div>

              <div className="skeleton skeleton-actions"></div>
            </div>

            <div className="skeleton skeleton-progress"></div>

            <div className="skeleton-controls">
              <div className="skeleton skeleton-control-btn small"></div>
              <div className="skeleton skeleton-control-btn"></div>
              <div className="skeleton skeleton-control-btn play"></div>
              <div className="skeleton skeleton-control-btn"></div>
              <div className="skeleton skeleton-control-btn small"></div>
            </div>

            <div className="skeleton skeleton-volume"></div>
          </div>
        ) : (
          <>
            <div className="np-cover-wrap">
              <img
                className="album-cover"
                src={currentTrack.coverSrc}
                alt="Album Cover"
              />
            </div>

            <div className="np-bottom">
              <div className="now-playing-info">
                <div className="now-playing-text">
                  <h1 className="now-playing-title">{currentTrack.title}</h1>
                  <h2 className="now-playing-artist">{currentTrack.artist}</h2>
                </div>

                <div className="now-playing-actions">
                  {/* {isYoutube ? (
                    <MotionButton
                      className="download-btn"
                      onClick={() => setDownloadConfirmOpen(true)}
                      whileTap={{ scale: 0.92 }}
                      aria-label="Download to library"
                    >
                      <Download size={26} strokeWidth={2} />
                    </MotionButton>
                  ) : (
                    <button
                      type="button"
                      className={`favroute-btn ${favroute ? "active" : ""}`}
                      onClick={() => setFavroute(!favroute)}
                      aria-label="Favorite"
                    >
                      <Heart
                        size={27}
                        strokeWidth={2}
                        fill={favroute ? "currentColor" : "none"}
                      />
                    </button>
                  )} */}
                  <button
                    type="button"
                    className={`favroute-btn ${favroute ? "active" : ""}`}
                    onClick={() => setFavroute(!favroute)}
                    aria-label="Favorite"
                  >
                    <Heart
                      size={27}
                      strokeWidth={2}
                      fill={favroute ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </div>

              <div className="progress-bar">
                <Slider
                  value={currentTime}
                  max={safeDuration || 1}
                  onChange={(val) => {
                    if (audioPlayerRef.current && hasKnownDuration) {
                      audioPlayerRef.current.currentTime = val;
                    }
                  }}
                  onDragEnd={() => {
                    if (!isPlaying) handlePlay();
                  }}
                />
                <div className="progress-bar-times">
                  <div className="progress-time progress-time-start">
                    {formatTime(currentTime)}
                  </div>
                  <div className="progress-time progress-time-end">
                    {hasKnownDuration
                      ? `-${formatTime(safeDuration - currentTime)}`
                      : "Live"}
                  </div>
                </div>
              </div>

              <div className="player-controls">
                <div className="control-group control-group--main">
                  <button
                    className={`control control--shuffle media-control-button ${
                      shuffle ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleShuffle();
                    }}
                    aria-label="Shuffle"
                  >
                    <Shuffle size={24} strokeWidth={2} />
                  </button>

                  <button
                    className="control control--previous media-control-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePrevious();
                    }}
                    aria-label="Previous"
                  >
                    <SkipBack size={30} strokeWidth={1.5} fill="currentColor" />
                  </button>

                  <button
                    className="control control--play-pause media-control-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isPlaying) {
                        handlePause();
                      } else {
                        handlePlay();
                      }
                    }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={30} strokeWidth={1.5} fill="currentColor" />
                    ) : (
                      <Play size={30} strokeWidth={1.5} fill="currentColor" />
                    )}
                  </button>

                  <button
                    className="control control--next media-control-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label="Next"
                  >
                    <SkipForward
                      size={30}
                      strokeWidth={1.5}
                      fill="currentColor"
                    />
                  </button>

                  <button
                    className={`control control--repeat media-control-button ${
                      isActive ? "active" : ""
                    }`}
                    onClick={onRepeatClick}
                    aria-label="Repeat"
                  >
                    {repeatMode === "repeat-one" ? (
                      <Repeat1 size={24} strokeWidth={2} />
                    ) : (
                      <Repeat size={24} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="audio-volume">
                <div className="volume-icon volume-icon--down">
                  <Volume1 size={20} strokeWidth={2} />
                </div>

                <Slider
                  value={volume}
                  max={1}
                  onChange={(val) => handleVolumeChange(val)}
                />

                <div className="volume-icon volume-icon--up">
                  <Volume2 size={20} strokeWidth={2} />
                </div>
              </div>

              <div className="player-utilities">
                <button
                  className="airplay-btn utiletie-btn"
                  aria-label="Airplay"
                >
                  <Airplay size={22} strokeWidth={1.8} />
                </button>

                <button className="share-btn utiletie-btn" aria-label="Share">
                  <Share2 size={22} strokeWidth={1.8} />
                </button>

                <button
                  className="queu-btn utiletie-btn"
                  onClick={() => setQueueOpen(true)}
                  aria-label="Queue"
                >
                  <ListMusic size={22} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {downloadConfirmOpen && (
          <MotionDiv
            className="download-overlay"
            onClick={() => setDownloadConfirmOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionDiv
              className="download-sheet"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="download-sheet__handle" />
              <h2 className="download-sheet__title">Download to library</h2>
              <p className="download-sheet__text">
                Save this track as a local file so it shows up in your library.
              </p>
              <div className="download-sheet__actions">
                <button
                  className="download-sheet__btn download-sheet__btn--cancel"
                  onClick={() => setDownloadConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="download-sheet__btn download-sheet__btn--confirm"
                  onClick={handleDownload}
                  disabled={isCurrentlyDownloading}
                >
                  {isCurrentlyDownloading ? "Downloading..." : "Download"}
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}

        {queueOpen && (
          <MotionDiv
            className="queue-overlay"
            onClick={() => setQueueOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionDiv
              className="queue-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragListener={false}
              dragControls={modalControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(event, info) => {
                if (info.offset.y > 100) setQueueOpen(false);
              }}
            >
              {" "}
              <div
                className="queue-header"
                onPointerDown={(e) => {
                  modalControls.start(e);
                }}
              >
                <div className="queue-handle"></div>
                <h2 className="queue-title">Queue</h2>
              </div>
              <div
                className="queue-content"
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
              >
                <Reorder.Group
                  as="div"
                  axis="y"
                  values={queue}
                  onReorder={reorderQueue}
                  className="queue-list"
                  layoutScroll
                >
                  {" "}
                  {queue.length > 0 ? (
                    queue.map((track, index) => (
                      <QueueItem
                        key={track.src}
                        track={track}
                        index={index}
                        currentIndex={currentIndex}
                      />
                    ))
                  ) : (
                    <div className="queue-empty-message">
                      Your queue is empty
                    </div>
                  )}
                </Reorder.Group>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!songToDelete}
        onClose={() => setSongToDelete(null)}
        onConfirm={async () => {
          if (!songToDelete) return;
          try {
            await deleteSong(songToDelete.id);
            // Stop playback and go back since the song is gone
            navigate(-1);
          } catch (err) {
            console.error("Fout bij het verwijderen van nummer:", err);
          } finally {
            setSongToDelete(null);
          }
        }}
        message={
          songToDelete
            ? `Weet je zeker dat je "${songToDelete.title}" wilt verwijderen? Dit verwijdert het ook uit je bibliotheek.`
            : ""
        }
      />
    </>
  );
}

export default NowPlaying;
