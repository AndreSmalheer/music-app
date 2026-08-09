import { useRef, useState, createContext, useEffect } from "react";
import {
  getYoutubeStreamUrl,
  prefetchYoutubeAudio,
  matchYoutubeTrack,
  createYoutubeSong,
  addRecent,
} from "../../services/api";

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
  const [ytLoading, setYtLoading] = useState(false);

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

    setYtLoading(true);

    // Populate the player before the MusicBrainz-to-YouTube lookup finishes.
    // This lets Now Playing show its loading UI instead of a misleading
    // "No song selected" state while the stream is being resolved.
    setCurrentTrack({
      id: trackId,
      src: "",
      title,
      artist,
      coverSrc,
      youtubeId,
    });

    let resolvedYoutubeId = youtubeId;
    let resolvedSrc = src;

    // If this is a MusicBrainz song (no youtubeId, no src), fetch the match
    if (!resolvedYoutubeId && !resolvedSrc && title !== "Unknown") {
      try {
        const matchData = await matchYoutubeTrack(title, artist, trackId || "");
        resolvedYoutubeId = matchData.youtubeId;
        resolvedSrc = getYoutubeStreamUrl(resolvedYoutubeId);
      } catch (err) {
        console.error(
          "[MediaPlayer] Failed to match MusicBrainz track to YouTube:",
          err,
        );
        setYtLoading(false);
        handleAudioError();
        return;
      }
    }

    const finalSrc = resolvedYoutubeId
      ? getYoutubeStreamUrl(resolvedYoutubeId)
      : resolvedSrc;
    const resolvedTrackId =
      trackId ||
      newQueue?.find((song) => {
        const songSrc = song.youtubeId
          ? getYoutubeStreamUrl(song.youtubeId)
          : song.src;
        return songSrc === finalSrc || song.id === trackId;
      })?.id ||
      null;

    audioPlayerRef.current.pause();
    audioPlayerRef.current.removeAttribute("src");
    audioPlayerRef.current.load();
    setDuration(0);
    setCurrentTime(0);

    audioPlayerRef.current.src = finalSrc;
    audioPlayerRef.current.load();

    const track = {
      id: resolvedTrackId || trackId,
      src: finalSrc,
      title,
      artist,
      coverSrc,
      youtubeId: resolvedYoutubeId,
    };

    setCurrentTrack(track);

    if (newQueue) {
      const formattedQueue = newQueue.map((song) => ({
        id: song.id || null,
        src: song.youtubeId
          ? getYoutubeStreamUrl(song.youtubeId)
          : song.src || "",
        title: song.title,
        artist: song.artist,
        coverSrc: song.cover || song.img || "",
        youtubeId: song.youtubeId || null,
      }));

      const findIdx = formattedQueue.findIndex(
        (song) =>
          (song.id && song.id === (resolvedTrackId || trackId)) ||
          (song.src && song.src === finalSrc),
      );

      setQueue(formattedQueue);
      setCurrentIndex(findIdx !== -1 ? findIdx : 0);
    } else if (index !== -1) {
      setCurrentIndex(index);
    } else {
      setQueue((prev) => {
        const exists = prev.findIndex(
          (t) => (t.id && t.id === track.id) || t.src === finalSrc,
        );

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

      if (resolvedYoutubeId) {
        createYoutubeSong({
          youtubeId: resolvedYoutubeId,
          title,
          artist,
          cover: coverSrc,
          duration: 0,
        })
          .then((savedSong) => {
            if (savedSong?.id) {
              addRecent(savedSong.id).catch(() => {});
            }
          })
          .catch((err) => {
            console.warn(
              "[MediaPlayer] Recently played register failed:",
              err.message,
            );
          });
      }
    } catch (err) {
      console.log("Autoplay blocked or error:", err);
      setIsPlaying(false);
      setYtLoading(false);
    }
  };

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      const nextTrack = queue[currentIndex + 1];
      if (nextTrack?.youtubeId) {
        prefetchYoutubeAudio(nextTrack.youtubeId);
      }
    }
  }, [currentIndex, queue]);

  const getNextIndex = () => {
    if (queue.length === 0) return -1;
    if (shuffle && queue.length > 1) {
      let r = currentIndex;
      while (r === currentIndex) r = Math.floor(Math.random() * queue.length);
      return r;
    }
    if (currentIndex < queue.length - 1) return currentIndex + 1;
    if (repeatMode === "repeat") return 0;
    return -1;
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

  const handleAudioError = () => {
    console.error(
      "Audio kon niet geladen/afgespeeld worden:",
      currentTrack?.title,
    );
    setIsPlaying(false);
    setYtLoading(false);
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

  const onMetadataUpdate = () => {
    const audio = audioPlayerRef.current;
    if (!audio) return;

    const d = audio.duration;
    if (!Number.isFinite(d) || d <= 0) return;

    setDuration(d);
    setCurrentTime(audio.currentTime || 0);
  };

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack?.src]);

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
    ytLoading,
  };

  return (
    <PlayerContext.Provider value={value}>
      <audio
        ref={audioPlayerRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onMetadataUpdate}
        onDurationChange={onMetadataUpdate}
        onEnded={handleEnded}
        onError={handleAudioError}
        onPlaying={() => setYtLoading(false)}
        onCanPlay={() => setYtLoading(false)}
        onPause={() => setYtLoading(false)}
      />

      {isPlaying && audioPlayerRef.current && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            padding: "12px",
            background: "rgba(0,0,0,0.9)",
            color: "#fff",
            borderRadius: 6,
            zIndex: 99999,
            fontSize: 12,
            fontFamily: "monospace",
            lineHeight: 1.4,
            maxWidth: 420,
            whiteSpace: "pre-wrap",
          }}
        >
          <div>
            <strong>PLAYER DEBUG</strong>
          </div>
          <div>Title: {currentTrack?.title}</div>
          <div>YouTube ID: {currentTrack?.youtubeId || "none"}</div>

          <hr />

          <div>React currentTime: {currentTime}</div>
          <div>React duration: {duration}</div>

          <hr />

          <div>audio.currentTime: {audioPlayerRef.current.currentTime}</div>
          <div>audio.duration: {audioPlayerRef.current.duration}</div>
          <div>
            audio.seekable.end:
            {audioPlayerRef.current.seekable.length
              ? ` ${audioPlayerRef.current.seekable.end(audioPlayerRef.current.seekable.length - 1)}`
              : " none"}
          </div>
          <div>
            audio.buffered.end:
            {audioPlayerRef.current.buffered.length
              ? ` ${audioPlayerRef.current.buffered.end(audioPlayerRef.current.buffered.length - 1)}`
              : " none"}
          </div>

          <hr />

          <div>readyState: {audioPlayerRef.current.readyState}</div>
          <div>networkState: {audioPlayerRef.current.networkState}</div>
          <div>paused: {String(audioPlayerRef.current.paused)}</div>
          <div>ended: {String(audioPlayerRef.current.ended)}</div>
          <div>seeking: {String(audioPlayerRef.current.seeking)}</div>
          <div>playbackRate: {audioPlayerRef.current.playbackRate}</div>

          <hr />

          <div>
            Difference (React vs audio duration):{" "}
            {(duration - (audioPlayerRef.current.duration || 0)).toFixed(3)}
          </div>

          <div>Remaining (React): {(duration - currentTime).toFixed(3)}</div>

          <div>
            Remaining (audio):{" "}
            {(
              (audioPlayerRef.current.duration || 0) -
              audioPlayerRef.current.currentTime
            ).toFixed(3)}
          </div>

          <div>User Agent:</div>
          <div style={{ fontSize: 10, wordBreak: "break-word" }}>
            {navigator.userAgent}
          </div>
        </div>
      )}

      {children}
    </PlayerContext.Provider>
  );
}

export default MediaPlayer;
