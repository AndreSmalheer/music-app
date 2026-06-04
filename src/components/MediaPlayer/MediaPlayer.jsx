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
  ) => {
    // console.log("Playing song:", src);

    if (!audioPlayerRef.current) return;

    audioPlayerRef.current.src = src;

    console.log(coverSrc);

    setCurrentTrack({
      title,
      artist,
      coverSrc,
    });

    updateMediaSession(title, artist, coverSrc);

    try {
      await audioPlayerRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Autoplay blocked or error:", err);
      setIsPlaying(false);
    }
  };

  const handleNext = () => console.log("next");
  const handlePrevious = () => console.log("previous");

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
  }, [handlePlay, handlePause, handleNext, handlePrevious]);

  const value = {
    audioPlayerRef,
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    playSong,
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
