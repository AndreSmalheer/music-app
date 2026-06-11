import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import { getPlaylist, updatePlaylist } from "../../services/api";
import "./EditPlaylist.css";

function EditPlaylist() {
  const { id } = useParams();
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
      <div className="playlist-header">
        <div className="playlist-header-content">
          <img
            src={playlist?.cover || "/indieblog-best-album-covers-2010s-07 4.png"}
            alt="Playlist Cover"
            className="playlist-main-cover"
          />
          <div className="playlist-info">
            <h1 className="playlist-title">{playlist?.title || "Edit Playlist"}</h1>
            <p className="playlist-description">Reorder or remove tracks from your playlist.</p>
          </div>
        </div>
      </div>

      <div className="songs-list">
        {songs.map((song, index) => (
          <motion.div
            key={song.id}
            className="song-row-wrapper"
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
              marginBottom: '4px'
            }}
          >
            <div
              className="delete-action"
              style={{
                position: 'absolute',
                top: 0,
                right: 7,
                borderRadius: 10,
                height: '100%',
                width: 82,
                background: '#ff3b30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
              }}
              onClick={() => handleDelete(song)}
            >
              Delete
            </div>
            <motion.div
              className="song-row"
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: -80, right: 0 }}
              dragSnapToOrigin={true}
              dragMomentum={false}
              style={{
                background: 'var(--bg-primary)',
                position: 'relative',
                zIndex: 1,
                touchAction: 'pan-y'
              }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(event, info) => {
                setTimeout(() => setIsDragging(false), 50);
                if (info.offset.x < -60) {
                  handleDelete(song);
                }
              }}
            >
              <div className="drag-handle" style={{ marginRight: '10px' }}>☰</div>
              <span className="song-index" style={{ marginRight: '10px' }}>{index + 1}</span>
              <div className="song-row-info" style={{ flex: 1 }}>
                <p className="song-row-title">{song.title}</p>
                <p className="song-row-artist">{song.artist}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}

export default EditPlaylist;
