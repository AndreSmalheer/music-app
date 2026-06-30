import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X, Trash2, DownloadCloud, AlertCircle, CheckCircle } from "lucide-react";
import { useDownload } from "../../context/DownloadContext";
import "./Downloads.css";

function Downloads() {
  const navigate = useNavigate();
  const { downloads, cancelDownload, clearCompleted } = useDownload();

  const activeDownloads = downloads.filter((dl) => dl.status === "downloading");
  const finishedDownloads = downloads.filter((dl) => dl.status !== "downloading");

  return (
    <div className="downloads-page">
      <div className="downloads-header">
        <button className="downloads-back" onClick={() => navigate(-1)} aria-label="Terug">
          <ChevronLeft size={26} strokeWidth={2.2} />
        </button>
        <h1>Downloads</h1>
        {finishedDownloads.length > 0 && (
          <button
            className="downloads-clear-btn"
            onClick={clearCompleted}
            title="Voltooide downloads wissen"
            aria-label="Voltooide downloads wissen"
          >
            <Trash2 size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="downloads-content">
        {downloads.length === 0 ? (
          <div className="downloads-empty">
            <div className="downloads-empty-icon">
              <DownloadCloud size={48} strokeWidth={1.5} />
            </div>
            <h3>Geen actieve downloads</h3>
            <p>
              Start een download vanaf de afspeelpagina
            </p>
          </div>
        ) : (
          <div className="downloads-list">
            <AnimatePresence initial={false}>
              {downloads.map((dl) => {
                const isDownloading = dl.status === "downloading";
                const isCompleted = dl.status === "completed";
                const isFailed = dl.status === "failed";

                return (
                  <motion.div
                    key={dl.id}
                    className={`download-item ${isFailed ? "download-item--failed" : ""}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="download-item__main">
                      {dl.thumbnail ? (
                        <img
                          src={dl.thumbnail}
                          alt={dl.title}
                          className="download-item__cover"
                        />
                      ) : (
                        <div className="download-item__cover-fallback">
                          <DownloadCloud size={20} />
                        </div>
                      )}

                      <div className="download-item__info">
                        <h4 className="download-item__title">{dl.title}</h4>
                        <p className="download-item__artist">{dl.artist}</p>

                        {isDownloading && (
                          <span className="download-item__status">
                            Laden... {dl.progress}%
                          </span>
                        )}
                        {isCompleted && (
                          <span className="download-item__status download-item__status--completed">
                            <CheckCircle size={12} /> Voltooid
                          </span>
                        )}
                        {isFailed && (
                          <span className="download-item__status download-item__status--failed">
                            <AlertCircle size={12} /> Mislukt
                          </span>
                        )}
                      </div>

                      {isDownloading && (
                        <button
                          className="download-item__cancel-btn"
                          onClick={() => cancelDownload(dl.id)}
                          aria-label="Download annuleren"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    {isDownloading && (
                      <div className="download-item__progress-container">
                        <div
                          className="download-item__progress-bar"
                          style={{ width: `${dl.progress}%` }}
                        />
                      </div>
                    )}

                    {isFailed && dl.error && (
                      <p className="download-item__error-text">{dl.error}</p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default Downloads;
