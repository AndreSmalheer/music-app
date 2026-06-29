import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";
import { downloadFromYoutube } from "../../services/api";
import "./Download.css";

function Download() {
  const [url, setUrl] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedCover, setSelectedCover] = useState("covers/test-cover.jpg");
  const [metadata, setMetadata] = useState({
    title: "Awesome Song Name",
    artist: "Great Artist",
  });
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (url.trim() === "") return;
    if (url.includes("youtube.com/") || url.includes("youtu.be/")) {
      setShowMetadata(true);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await downloadFromYoutube({
        url,
        title: metadata.title,
        artist: metadata.artist,
        // alleen een echte gekozen cover (base64) meesturen
        thumbnail: selectedCover.startsWith("data:") ? selectedCover : undefined,
      });
      // gelukt: terug naar home
      navigate("/");
    } catch (err) {
      console.error("Opslaan mislukt:", err);
      setError("Download mislukt. Controleer de URL en probeer opnieuw.");
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedCover(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="download-page">
      <div className="download-header">
        <h1>Download</h1>
      </div>

      <div className="download-input-row">
        <input
          type="text"
          className="download-input"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <motion.button
          className="btn-submit"
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
        >
          Submit
        </motion.button>
      </div>

      <AnimatePresence>
        {showMetadata && (
          <motion.div
            className="metadata-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="cover-edit-section">
              <div className="download-cover-wrapper">
                <img
                  src={selectedCover}
                  alt="Metadata Cover"
                  className="download-album-cover"
                />
              </div>

              <input
                type="file"
                id="cover-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              <motion.button
                className="btn-edit-cover"
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById("cover-upload").click()}
              >
                <Pencil size={20} strokeWidth={2} />
                <span>Edit Cover</span>
              </motion.button>
            </div>

            <div className="metadata-fields">
              <div className="input-group">
                <label>Title</label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) =>
                    setMetadata({ ...metadata, title: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>Artist</label>
                <input
                  type="text"
                  value={metadata.artist}
                  onChange={(e) =>
                    setMetadata({ ...metadata, artist: e.target.value })
                  }
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "#ff4d4f",
                  fontSize: "14px",
                  marginTop: "8px",
                }}
              >
                {error}
              </p>
            )}

            <div className="download-actions">
              <motion.button
                className="btn-cancel"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMetadata(false)}
              >
                Cancel
              </motion.button>
              <motion.button
                className="btn-save"
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Download;
