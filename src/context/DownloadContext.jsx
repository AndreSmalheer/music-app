import { createContext, useContext, useState, useEffect } from "react";
import { downloadYoutubeToLibrary } from "../services/api";

const DownloadContext = createContext();

export function DownloadProvider({ children }) {
  const [downloads, setDownloads] = useState([]);
  const [toast, setToast] = useState(null);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const startDownload = async ({ url, title, artist, thumbnail }) => {
    // Generate a unique ID for this download task
    const downloadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
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

    // Simulate progress from 0% to 92% over time
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
      await downloadYoutubeToLibrary(
        { url, title, artist, thumbnail },
        abortController.signal
      );
      
      clearInterval(progressInterval);
      
      setDownloads((prev) =>
        prev.map((dl) => {
          if (dl.id === downloadId) {
            return { ...dl, status: "completed", progress: 100 };
          }
          return dl;
        })
      );

      // Trigger global success toast
      setToast({
        type: "success",
        message: `"${title}" succesvol gedownload!`,
      });
    } catch (err) {
      clearInterval(progressInterval);

      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        console.log(`Download of "${title}" was aborted by user.`);
        // Remove from list if aborted
        setDownloads((prev) => prev.filter((dl) => dl.id !== downloadId));
      } else {
        console.error(`Download of "${title}" failed:`, err);
        setDownloads((prev) =>
          prev.map((dl) => {
            if (dl.id === downloadId) {
              return {
                ...dl,
                status: "failed",
                error: err.message || "Download mislukt",
              };
            }
            return dl;
          })
        );

        // Trigger global error toast
        setToast({
          type: "error",
          message: `Fout bij downloaden van "${title}": ${err.message || "Onbekende fout"}`,
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
        toast,
        setToast,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export const useDownload = () => useContext(DownloadContext);
