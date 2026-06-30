import { useRef, useState, createContext, useEffect } from "react";
import { getYoutubeStreamUrl } from "../../services/api";

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
  const [repeatMode, setRepeatMode] = useState("off");
  const [shuffle, setShuffle] = useState(false);
  const [originalQueue, setOriginalQueue] = useState(null);

  const toggleRepeat = () =>
    setRepeatMode((prev) =>
      prev === "off" ? "repeat" : prev === "repeat" ? "repeat-one" : "off",
    );

  const shuffleArray = (array) => {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));

      [newArray[i], newArray[randomIndex]] = [
        newArray[randomIndex],
        newArray[i],
      ];
    }

    return newArray;
  };

  const toggleShuffle = () => {
    setShuffle((prev) => {
      const newShuffle = !prev;

      if (newShuffle) {
        setQueue((currentQueue) => {
          setOriginalQueue(currentQueue);

          const beforeCurrent = currentQueue.slice(0, currentIndex + 1);
          const afterCurrent = currentQueue.slice(currentIndex + 1);

          const shuffled = shuffleArray(afterCurrent);

          return [...beforeCurrent, ...shuffled];
        });
      } else {
        setQueue((currentQueue) => {
          if (originalQueue) {
            return originalQueue;
          }

          return currentQueue;
        });
      }

      return newShuffle;
    });
  };

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
    newQueue = null,
    trackId = null,
  ) => {
    if (!audioPlayerRef.current) return;

    const finalSrc = youtubeId ? getYoutubeStreamUrl(youtubeId) : src;
    const resolvedTrackId =
      trackId ||
      newQueue?.find((song) => {
        const songSrc = song.youtubeId ? getYoutubeStreamUrl(song.youtubeId) : song.src;
        return songSrc === finalSrc;
      })?.id ||
      null;

    audioPlayerRef.current.src = finalSrc;

    const track = {
      id: resolvedTrackId,
      src: finalSrc,
      title,
      artist,
      coverSrc,
      youtubeId,
    };

    setCurrentTrack(track);

    if (newQueue) {
      const formattedQueue = newQueue.map((song) => ({
        id: song.id || null,
        src: song.youtubeId ? getYoutubeStreamUrl(song.youtubeId) : song.src,
        title: song.title,
        artist: song.artist,
        coverSrc: song.cover,
        youtubeId: song.youtubeId || null,
      }));

      const currentIndex = formattedQueue.findIndex(
        (song) => song.src === finalSrc,
      );

      setQueue(formattedQueue);
      setCurrentIndex(currentIndex !== -1 ? currentIndex : 0);
    } else if (index !== -1) {
      setCurrentIndex(index);
    } else {
      setQueue((prev) => {
        const exists = prev.findIndex((t) => t.src === finalSrc);

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

    try {
      await audioPlayerRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Autoplay blocked or error:", err);
      setIsPlaying(false);
    }
  };

  // Bepaalt welke index als volgende speelt; houdt rekening met shuffle en repeat.
  const getNextIndex = () => {
    if (queue.length === 0) return -1;
    if (shuffle && queue.length > 1) {
      let r = currentIndex;
      while (r === currentIndex) r = Math.floor(Math.random() * queue.length);
      return r;
    }
    if (currentIndex < queue.length - 1) return currentIndex + 1;
    if (repeatMode === "repeat") return 0; // hele wachtrij opnieuw
    return -1; // einde
  };

  const playIndex = (index) => {
    const track = queue[index];
    if (!track) return;
    playSong(
      track.src,
      track.title,
      track.artist,
      track.coverSrc,
      index,
      track.youtubeId,
      null,
      track.id,
    );
  };

  const handleNext = () => {
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) playIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;
    // Meer dan 3s gespeeld? Dan eerst dit nummer herstarten (zoals Spotify).
    if (audioPlayerRef.current && audioPlayerRef.current.currentTime > 3) {
      audioPlayerRef.current.currentTime = 0;
      return;
    }
    if (currentIndex > 0) {
      playIndex(currentIndex - 1);
    } else if (repeatMode === "repeat") {
      playIndex(queue.length - 1);
    } else if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
    }
  };

  // Wordt aangeroepen als een nummer is afgelopen.
  const handleEnded = () => {
    if (repeatMode === "repeat-one") {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.play().catch(() => {});
      }
      return;
    }
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
      playIndex(nextIndex);
    } else {
      setIsPlaying(false);
    }
  };

  // Surface laadfouten (bv. ontbrekend MP3-bestand of onbereikbare stream).
  const handleAudioError = () => {
    console.error(
      "Audio kon niet geladen/afgespeeld worden:",
      currentTrack?.title,
    );
    setIsPlaying(false);
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
  }, [
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    queue,
    currentIndex,
    shuffle,
    repeatMode,
  ]);

  const value = {
    audioPlayerRef,
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    volume,
    queue,
    currentIndex,
    repeatMode,
    shuffle,
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    handleVolumeChange,
    toggleRepeat,
    toggleShuffle,
    playSong,
    reorderQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      <audio
        ref={audioPlayerRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={handleEnded}
        onError={handleAudioError}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export default MediaPlayer;
