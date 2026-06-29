import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Image, Trash2 } from "lucide-react";
import { useModal } from "../../context/ModalContext";
import { getPlaylist, updatePlaylist } from "../../services/api";
import "./EditPlaylist.css";

function EditPlaylist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const { showConfirm } = useModal();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPlaylist(id);
        if (!active) return;
        setPlaylist(data);
        setSongs(data?.songs || []);
      } catch (err) {
        console.error("Playlist laden mislukt:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = (song) => {
    showConfirm(
      `Are you sure you want to delete "${song.title}"?`,
      async () => {
        const remaining = songs.filter((s) => s.id !== song.id);
        setSongs(remaining);
        try {
          await updatePlaylist(id, { songs: remaining.map((s) => s.id) });
        } catch (err) {
          console.error("Opslaan mislukt:", err);
        }
      }
    );
  };

  return (
    <div className="playlist-detail-page edit-playlist-page">
      <div className="edit-header">
        <button className="edit-back" onClick={() => navigate(-1)} aria-label="Terug">
          <ChevronLeft size={26} strokeWidth={2.2} />
        </button>
        <h1>Afspeellijst bewerken</h1>
      </div>

      <div className="edit-content">
        <div className="edit-cover-section">
          <div className="edit-cover-preview">
            {playlist?.cover ? (
              <img src={playlist.cover} alt="Playlist Cover" />
            ) : (
              <div className="edit-cover-placeholder">
                <Image size={30} strokeWidth={1.7} />
                <span>Hoes</span>
              </div>
            )}
          </div>
        </div>

        <div className="edit-fields">
          <div className="edit-input-group">
            <span className="edit-label">NAAM</span>
            <div className="edit-field-name">{playlist?.title || "Afspeellijst bewerken"}</div>
          </div>

          <div className="edit-input-group">
            <span className="edit-label">BESCHRIJVING</span>
            <div className="edit-field-desc">Wijzig de volgorde of verwijder nummers.</div>
          </div>
        </div>

        <div className="edit-songs">
          <div className="edit-songs-title">Nummers</div>
          <div className="edit-songs-list">
            {songs.map((song, index) => (
              <motion.div
                key={song.id}
                className="edit-song-wrapper"
              >
                <div
                  className="edit-delete-action"
                  onClick={() => handleDelete(song)}
                >
                  <Trash2 size={18} strokeWidth={2} />
                </div>
                <motion.div
                  className="edit-song-row"
                  drag="x"
                  dragDirectionLock
                  dragConstraints={{ left: -80, right: 0 }}
                  dragSnapToOrigin={true}
                  dragMomentum={false}
                  style={{ touchAction: "pan-y" }}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={(event, info) => {
                    setTimeout(() => setIsDragging(false), 50);
                    if (info.offset.x < -60) {
                      handleDelete(song);
                    }
                  }}
                >
                  <span className="edit-song-index">{index + 1}</span>
                  <div className="edit-song-info">
                    <p className="edit-song-title">{song.title}</p>
                    <p className="edit-song-artist">{song.artist}</p>
                  </div>
                  <button
                    type="button"
                    className="edit-song-remove"
                    aria-label="Verwijderen"
                    onClick={() => handleDelete(song)}
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          className="btn-edit-confirm"
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
        >
          Opslaan
        </motion.button>
      </div>
    </div>
  );
}

export default EditPlaylist;
