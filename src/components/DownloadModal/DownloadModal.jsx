import { AnimatePresence, motion } from "framer-motion";
import { useDownload } from "../../context/DownloadContext";

function DownloadModal({ isOpen, onClose, track }) {
  const { downloads, startDownload } = useDownload();

  const isDownloading = downloads.some(
    (dl) => dl.url.includes(track?.youtubeId) && dl.status === "downloading",
  );

  const handleDownload = async () => {
    if (!track?.youtubeId || isDownloading) return;

    await startDownload({
      url: `https://www.youtube.com/watch?v=${track.youtubeId}`,
      title: track.title,
      artist: track.artist,
      thumbnail: track.coverSrc || track.cover || track.img,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="download-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
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
              Save this track so it appears in your library.
            </p>

            <div className="download-sheet__actions">
              <button
                className="download-sheet__btn download-sheet__btn--cancel"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="download-sheet__btn download-sheet__btn--confirm"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DownloadModal;
