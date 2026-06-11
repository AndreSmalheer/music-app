import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { downloadFromYoutube } from "../../services/api";
import "./Download.css";

function EditIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function Download() {
  const [url, setUrl] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  const [saving, setSaving] = useState(false);
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
                <EditIcon />
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
