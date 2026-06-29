import {
  useRef,
  useState,
  createContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getYoutubeStreamUrl, prefetchYoutube } from "../../services/api";

export const PlayerContext = createContext();
// Aparte context puur voor de speel-voortgang (currentTime/duration). Deze
// verandert ~4x/sec tijdens het afspelen. Door 'm los te trekken van de
// hoofd-context re-rendert alleen wie de tijdbalk toont (NowPlaying), en niet
// de Footer + elke pagina. Dat scheelt een hoop onnodige re-renders → minder lag.
export const PlayerProgressContext = createContext();

function MediaPlayer({ children }) {
  const audioPlayerRef = useRef(null);

  const updateMediaSession = useCallback((title, artist, coverSrc) => {
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
  }, []);

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

  // Spiegelt de laatste state in een ref zodat de (stabiele) handlers altijd
  // verse waarden lezen zonder dat hun identiteit elke render verandert.
  // Update na commit: de handlers lezen 'm alleen bij user-/audio-events.
  const latest = useRef({});
  useEffect(() => {
    latest.current = {
      queue,
      currentIndex,
      shuffle,
      repeatMode,
      originalQueue,
      currentTrack,
      isPlaying,
    };
  });

  const toggleRepeat = useCallback(
    () =>
      setRepeatMode((prev) =>
        prev === "off" ? "repeat" : prev === "repeat" ? "repeat-one" : "off",
      ),
    [],
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

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const newShuffle = !prev;

      if (newShuffle) {
        setQueue((currentQueue) => {
          setOriginalQueue(currentQueue);

          const idx = latest.current.currentIndex;
          const beforeCurrent = currentQueue.slice(0, idx + 1);
          const afterCurrent = currentQueue.slice(idx + 1);

          const shuffled = shuffleArray(afterCurrent);

          return [...beforeCurrent, ...shuffled];
        });
      } else {
        setQueue((currentQueue) => {
          if (latest.current.originalQueue) {
            return latest.current.originalQueue;
          }

          return currentQueue;
        });
      }

      return newShuffle;
    });
  }, []);

  const handleVolumeChange = useCallback((newVolume) => {
    const v = Math.max(0, Math.min(1, newVolume));
    setVolume(v);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = v;
    }
  }, []);

  const handlePlay = useCallback(async () => {
    try {
      await audioPlayerRef.current?.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Play error:", err);
    }
  }, []);

  const handlePause = useCallback(() => {
    audioPlayerRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const playSong = useCallback(
    async (
      src,
      title = "Unknown",
      artist = "Unknown",
      coverSrc = "",
      index = -1,
      youtubeId = null,
      newQueue = null,
    ) => {
      if (!audioPlayerRef.current) return;

      const finalSrc = youtubeId ? getYoutubeStreamUrl(youtubeId) : src;

      audioPlayerRef.current.src = finalSrc;

      const track = {
        src: finalSrc,
        title,
        artist,
        coverSrc,
        youtubeId,
      };

      setCurrentTrack(track);

      if (newQueue) {
        const formattedQueue = newQueue.map((song) => ({
          src: song.youtubeId ? getYoutubeStreamUrl(song.youtubeId) : song.src,
          title: song.title,
          artist: song.artist,
          coverSrc: song.cover,
          youtubeId: song.youtubeId || null,
        }));

        const matchIndex = formattedQueue.findIndex(
          (song) => song.src === finalSrc,
        );

        setQueue(formattedQueue);
        setCurrentIndex(matchIndex !== -1 ? matchIndex : 0);
      } else if (index !== -1) {
        setCurrentIndex(index);
      } else {
        setQueue((prev) => {
          const exists = prev.findIndex((t) => t.src === finalSrc);

          if (exists !== -1) {
            setCurrentIndex(exists);
            return prev;
          }

          const appended = [...prev, track];

          setCurrentIndex(appended.length - 1);

          return appended;
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
    },
    [updateMediaSession],
  );

  // Bepaalt welke index als volgende speelt; houdt rekening met shuffle en repeat.
  const getNextIndex = useCallback(() => {
    const { queue: q, currentIndex: ci, shuffle: sh, repeatMode: rm } =
      latest.current;
    if (q.length === 0) return -1;
    if (sh && q.length > 1) {
      let r = ci;
      while (r === ci) r = Math.floor(Math.random() * q.length);
      return r;
    }
    if (ci < q.length - 1) return ci + 1;
    if (rm === "repeat") return 0; // hele wachtrij opnieuw
    return -1; // einde
  }, []);

  const playIndex = useCallback(
    (index) => {
      const track = latest.current.queue[index];
      if (!track) return;
      playSong(
        track.src,
        track.title,
        track.artist,
        track.coverSrc,
        index,
        track.youtubeId,
      );
    },
    [playSong],
  );

  const handleNext = useCallback(() => {
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) playIndex(nextIndex);
  }, [getNextIndex, playIndex]);

  const handlePrevious = useCallback(() => {
    const { queue: q, currentIndex: ci, repeatMode: rm } = latest.current;
    if (q.length === 0) return;
    // Meer dan 3s gespeeld? Dan eerst dit nummer herstarten (zoals Spotify).
    if (audioPlayerRef.current && audioPlayerRef.current.currentTime > 3) {
      audioPlayerRef.current.currentTime = 0;
      return;
    }
    if (ci > 0) {
      playIndex(ci - 1);
    } else if (rm === "repeat") {
      playIndex(q.length - 1);
    } else if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
    }
  }, [playIndex]);

  // Wordt aangeroepen als een nummer is afgelopen.
  const handleEnded = useCallback(() => {
    if (latest.current.repeatMode === "repeat-one") {
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
  }, [getNextIndex, playIndex]);

  // Surface laadfouten (bv. ontbrekend MP3-bestand of onbereikbare stream).
  const handleAudioError = useCallback(() => {
    console.error(
      "Audio kon niet geladen/afgespeeld worden:",
      latest.current.currentTrack?.title,
    );
    setIsPlaying(false);
  }, []);

  const reorderQueue = useCallback((newQueue) => {
    setQueue(newQueue);
    const track = latest.current.currentTrack;
    if (track) {
      const newIndex = newQueue.findIndex((t) => t.src === track.src);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      }
    }
  }, []);

  // Warm de cache voor het volgende YouTube-nummer alvast op, zodat skip en
  // auto-advance vrijwel direct spelen i.p.v. ~4s op yt-dlp te wachten.
  useEffect(() => {
    const next = queue[currentIndex + 1];
    if (next?.youtubeId) prefetchYoutube(next.youtubeId);
  }, [queue, currentIndex]);

  const onTimeUpdate = useCallback(() => {
    setCurrentTime(audioPlayerRef.current?.currentTime || 0);
  }, []);

  const onLoadedMetadata = useCallback(() => {
    setDuration(audioPlayerRef.current?.duration || 0);
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    // De handlers zijn stabiel en lezen verse state via de ref, dus één keer
    // registreren is genoeg.
    navigator.mediaSession.setActionHandler("play", handlePlay);
    navigator.mediaSession.setActionHandler("pause", handlePause);
    navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    navigator.mediaSession.setActionHandler("previoustrack", handlePrevious);
  }, [handlePlay, handlePause, handleNext, handlePrevious]);

  // Hoofd-context: bevat GEEN currentTime/duration, zodat consumers niet
  // 4x/sec mee re-renderen. Verandert alleen bij echte besturings-state.
  const value = useMemo(
    () => ({
      audioPlayerRef,
      isPlaying,
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
    }),
    [
      isPlaying,
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
    ],
  );

  const progressValue = useMemo(
    () => ({ currentTime, duration }),
    [currentTime, duration],
  );

  return (
    <PlayerContext.Provider value={value}>
      <PlayerProgressContext.Provider value={progressValue}>
        <audio
          ref={audioPlayerRef}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={handleEnded}
          onError={handleAudioError}
        />
        {children}
      </PlayerProgressContext.Provider>
    </PlayerContext.Provider>
  );
}

export default MediaPlayer;
