import { useRef, useState, createContext, useEffect } from "react";

export const PlayerContext = createContext();

function MediaPlayer({ children }) {
  const audioPlayerRef = useRef(null);

  const updateMediaSession = (title, artist, coverSrc) => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      artwork: [
        {
          src: coverSrc || "/default.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handleVolumeChange = (newVolume) => {
    const v = Math.max(0, Math.min(1, newVolume));
    setVolume(v);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = v;
    }
  };

  const handlePlay = async () => {
    try {
      await audioPlayerRef.current?.play();
      setIsPlaying(true);

      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("nexttrack", handleNext);
        navigator.mediaSession.setActionHandler(
          "previoustrack",
          handlePrevious,
        );
      }
    } catch (err) {
      console.log("Play error:", err);
    }
  };

  const handlePause = () => {
    audioPlayerRef.current?.pause();
    setIsPlaying(false);
  };

  const playSong = async (
    src,
    title = "Unknown",
    artist = "Unknown",
    coverSrc = "",
    index = -1,
    youtubeId = null,
  ) => {
    if (!audioPlayerRef.current) return;

    // YouTube tracks hebben geen lokale audio — audio element leeg laten
    if (!youtubeId) {
      audioPlayerRef.current.src = src;
    } else {
      audioPlayerRef.current.src = "";
    }

    const track = {
      src,
      title,
      artist,
      coverSrc,
      youtubeId,
    };

    setCurrentTrack(track);

    if (index !== -1) {
      setCurrentIndex(index);
    } else {
      setQueue((prev) => {
        const exists = prev.findIndex((t) => t.src === src);
        if (exists !== -1) {
          setCurrentIndex(exists);
          return prev;
        }
        const newQueue = [...prev, track];
        setCurrentIndex(newQueue.length - 1);
        return newQueue;
      });
    }

    updateMediaSession(title, artist, coverSrc);

    // YouTube tracks spelen via iframe in NowPlaying — audio element niet nodig
    if (youtubeId) {
      setIsPlaying(true);
      return;
    }

    try {
      await audioPlayerRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Autoplay blocked or error:", err);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const track = queue[nextIndex];
      playSong(track.src, track.title, track.artist, track.coverSrc, nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const track = queue[prevIndex];
      playSong(track.src, track.title, track.artist, track.coverSrc, prevIndex);
    }
  };

  const reorderQueue = (newQueue) => {
    setQueue(newQueue);
    if (currentTrack) {
      const newIndex = newQueue.findIndex((t) => t.src === currentTrack.src);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioPlayerRef.current?.currentTime || 0);
  };

  const onLoadedMetadata = () => {
    setDuration(audioPlayerRef.current?.duration || 0);
  };

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const setHandlers = () => {
      navigator.mediaSession.setActionHandler("play", handlePlay);
      navigator.mediaSession.setActionHandler("pause", handlePause);

      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
      navigator.mediaSession.setActionHandler("previoustrack", handlePrevious);
    };

    setHandlers();
  }, [handlePlay, handlePause, handleNext, handlePrevious, queue, currentIndex]);

  const value = {
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
    playSong,
    reorderQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      <audio
        ref={audioPlayerRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export default MediaPlayer;
