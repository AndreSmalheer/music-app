import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/Skeleton/Skeleton";
import { ChevronLeft, Image } from "lucide-react";
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
        <button className="create-back" onClick={() => navigate(-1)} aria-label="Terug">
          <ChevronLeft size={26} strokeWidth={2.2} />
        </button>
        <h1>Nieuwe afspeellijst</h1>
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
            <motion.button
              type="button"
              className="playlist-cover-preview"
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('playlist-upload').click()}
            >
              {cover ? (
                <img src={cover} alt="Preview" />
              ) : (
                <div className="cover-placeholder">
                  <Image size={30} strokeWidth={1.7} />
                  <span>Kies hoes</span>
                </div>
              )}
              <input
                type="file"
                id="playlist-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </motion.button>
          </div>

          <div className="create-fields">
            <div className="create-input-group">
              <label>NAAM</label>
              <input
                type="text"
                className="create-field-name"
                placeholder="Mijn afspeellijst"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="create-input-group">
              <label>BESCHRIJVING</label>
              <textarea
                className="create-field-desc"
                placeholder="Voeg een beschrijving toe…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="1"
              />
            </div>
          </div>

          <div className="create-add-songs">
            <div className="create-add-title">Nummers toevoegen</div>
            <div className="create-add-list">
              {[1, 2, 3].map((n) => (
                <div className="create-add-row" key={n}>
                  <div className="create-add-cover" />
                  <div className="create-add-info">
                    <div className="create-add-name">Nummer toevoegen</div>
                    <div className="create-add-artist">Zoek in je bibliotheek</div>
                  </div>
                  <button type="button" className="create-add-btn" aria-label="Toevoegen">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            className="btn-create-confirm"
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={saving || !name.trim()}
          >
            {saving ? "Bezig met aanmaken…" : "Afspeellijst aanmaken"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default CreatePlaylist;
