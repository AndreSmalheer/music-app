import { motion } from "framer-motion";
import { useState } from "react";
import { useConfirm } from "../../context/ConfirmModalContext";
import "./EditPlaylist.css";

const songsList = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  title: `Playlist Track ${i + 1}`,
  artist: "Artist Name",
  cover: "/indieblog-best-album-covers-2010s-07 4.png",
}));

function EditPlaylist() {
  const [songs, setSongs] = useState(songsList);
  const [isDragging, setIsDragging] = useState(false);
  const { showConfirm } = useConfirm();

  const handleDelete = (song) => {
    showConfirm(
      `Are you sure you want to delete "${song.title}"?`,
      () => {
        console.log("Deleted", song);
        setSongs(songs.filter(s => s.id !== song.id));
      }
    );
  };

  return (
    <div className="playlist-detail-page edit-playlist-page">
      <div className="playlist-header">
        <div className="playlist-header-content">
          <img
            src="/indieblog-best-album-covers-2010s-07 4.png"
            alt="Playlist Cover"
            className="playlist-main-cover"
          />
          <div className="playlist-info">
            <h1 className="playlist-title">Edit Playlist</h1>
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
