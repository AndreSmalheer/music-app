import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/Skeleton/Skeleton";
import { createPlaylist } from "../../services/api";
import "./CreatePlaylist.css";

function CreatePlaylist() {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      // cover is een base64 data-URL uit de file-input; we slaan 'm op als thumbnail.
      const playlist = await createPlaylist({ name: name.trim(), thumbnail: cover });
      navigate(`/playlist/${playlist.id}`);
    } catch (err) {
      console.error("Playlist aanmaken mislukt:", err);
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCover(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="create-playlist-page">
      <div className="create-header">
        <h1>New Playlist</h1>
      </div>

      {isLoading ? (
        <div style={{ padding: "0 16px" }}>
          <Skeleton height="200px" borderRadius="12px" style={{ marginBottom: '24px' }} />
          <Skeleton height="60px" borderRadius="12px" style={{ marginBottom: '16px' }} />
          <Skeleton height="100px" borderRadius="12px" style={{ marginBottom: '24px' }} />
          <Skeleton height="50px" borderRadius="12px" />
        </div>
      ) : (
        <div className="create-content">
          <div className="cover-upload-section">
            <motion.div 
              className="playlist-cover-preview"
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('playlist-upload').click()}
            >
              {cover ? (
                <img src={cover} alt="Preview" />
              ) : (
                <div className="cover-placeholder">
                  <CameraIcon />
                  <span>Upload Cover</span>
                </div>
              )}
              <input 
                type="file" 
                id="playlist-upload" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </motion.div>
          </div>

          <div className="create-fields">
            <div className="create-input-group">
              <label>Name</label>
              <input 
                type="text" 
                placeholder="Give your playlist a name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="create-input-group">
              <label>Description (Optional)</label>
              <textarea 
                placeholder="What's this playlist about?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              />
            </div>
          </div>

          <div className="create-actions">
            <motion.button 
              className="btn-create-cancel"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
            >
              Cancel
            </motion.button>
            <motion.button
              className="btn-create-confirm"
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              disabled={saving || !name.trim()}
            >
              {saving ? "Creating..." : "Create Playlist"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );
}

export default CreatePlaylist;
