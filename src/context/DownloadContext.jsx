import { createContext, useContext, useState, useEffect, useRef } from "react";
import { downloadYoutubeToLibrary } from "../services/api";

const DownloadContext = createContext();

export function DownloadProvider({ children }) {
  const [downloads, setDownloads] = useState([]);
  const [toast, setToast] = useState(null);

  // Listeners that want to know when a YouTube song is replaced by a local one.
  // Map<youtubeId, Set<callback>> — components subscribe via useOnSongReplaced().
  const replacedListeners = useRef(new Map());

  const subscribeReplaced = (youtubeId, cb) => {
    if (!replacedListeners.current.has(youtubeId)) {
      replacedListeners.current.set(youtubeId, new Set());
    }
    replacedListeners.current.get(youtubeId).add(cb);
    return () => {
      replacedListeners.current.get(youtubeId)?.delete(cb);
    };
  };

  // Notify all subscribers that youtubeId was replaced by localSong
  const notifyReplaced = (youtubeId, localSong) => {
    replacedListeners.current.get(youtubeId)?.forEach((cb) => cb(localSong));
    // Also fire "any" listeners (youtubeId === "*")
    replacedListeners.current.get("*")?.forEach((cb) =>
      cb({ youtubeId, localSong })
    );
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const startDownload = async ({ url, title, artist, thumbnail }) => {
    const downloadId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const abortController = new AbortController();

    const newDownload = {
      id: downloadId,
      url,
      title: title || "Unknown Song",
      artist: artist || "Unknown Artist",
      thumbnail,
      status: "downloading",
      progress: 0,
      abortController,
      addedAt: new Date(),
    };

    setDownloads((prev) => [newDownload, ...prev]);

    // Simulate progress from 0 → 92 % while the backend is working
    const progressInterval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((dl) => {
          if (dl.id === downloadId && dl.status === "downloading") {
            const increment = Math.floor(Math.random() * 12) + 4;
            const nextProgress = Math.min(dl.progress + increment, 92);
            return { ...dl, progress: nextProgress };
          }
          return dl;
        })
      );
    }, 800);

    try {
      const result = await downloadYoutubeToLibrary(
        { url, title, artist, thumbnail },
        abortController.signal
      );

      clearInterval(progressInterval);

      setDownloads((prev) =>
        prev.map((dl) =>
          dl.id === downloadId
            ? { ...dl, status: "completed", progress: 100, localSong: result }
            : dl
        )
      );

      // If the backend replaced an old YouTube entry, notify all listeners
      if (result?.replacedYoutubeId) {
        notifyReplaced(result.replacedYoutubeId, result);
      }

      setToast({
        type: "success",
        message: `"${title}" succesvol gedownload!`,
      });
    } catch (err) {
      clearInterval(progressInterval);

      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        console.log(`Download of "${title}" was aborted by user.`);
        setDownloads((prev) => prev.filter((dl) => dl.id !== downloadId));
      } else {
        console.error(`Download of "${title}" failed:`, err);
        setDownloads((prev) =>
          prev.map((dl) =>
            dl.id === downloadId
              ? { ...dl, status: "failed", error: err.message || "Download mislukt" }
              : dl
          )
        );

        setToast({
          type: "error",
          message: `Fout bij downloaden van "${title}": ${
            err.message || "Onbekende fout"
          }`,
        });
      }
    }
  };

  const cancelDownload = (id) => {
    setDownloads((prev) => {
      const download = prev.find((dl) => dl.id === id);
      if (download && download.status === "downloading") {
        download.abortController.abort();
      }
      return prev.filter((dl) => dl.id !== id);
    });
  };

  const clearCompleted = () => {
    setDownloads((prev) => prev.filter((dl) => dl.status === "downloading"));
  };

  const hasActiveDownloads = downloads.some((dl) => dl.status === "downloading");

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        startDownload,
        cancelDownload,
        clearCompleted,
        hasActiveDownloads,
        subscribeReplaced,
        toast,
        setToast,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export const useDownload = () => useContext(DownloadContext);
