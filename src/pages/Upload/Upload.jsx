import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload as UploadIcon, Music } from "lucide-react";
import { uploadSong } from "../../services/api";
import "./Upload.css";

// Haalt de bestandsnaam zonder extensie eruit ("Song.mp3" -> "Song").
function stripExtension(name) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Elke entry: { file, name, pct, status: "queued" | "uploading" | "done" | "error" }
  const [items, setItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (fileList) => {
    const audioFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("audio/") || /\.(mp3|wav|flac)$/i.test(f.name),
    );
    if (audioFiles.length === 0) return;

    setError("");
    setItems((prev) => [
      ...prev,
      ...audioFiles.map((file) => ({
        file,
        name: file.name,
        pct: 0,
        status: "queued",
      })),
    ]);
  };

  const handleInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = ""; // zelfde bestand opnieuw kunnen kiezen
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
  };

  const updateItem = (index, patch) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const handleUpload = async () => {
    if (uploading || items.length === 0) return;
    setUploading(true);
    setError("");

    let hadError = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "done") continue;

      updateItem(i, { status: "uploading", pct: 40 });

      try {
        const formData = new FormData();
        formData.append("audio", item.file);
        formData.append("title", stripExtension(item.name));
        formData.append("artist", "Onbekend");

        await uploadSong(formData);
        updateItem(i, { status: "done", pct: 100 });
      } catch {
        hadError = true;
        updateItem(i, { status: "error", pct: 0 });
      }
    }

    setUploading(false);

    if (hadError) {
      setError("Een of meer bestanden konden niet worden geüpload. Probeer het opnieuw.");
      return;
    }

    navigate("/library");
  };

  return (
    <div className="upload-page">
      <header className="upload-header">
        <button
          className="upload-back"
          onClick={() => navigate(-1)}
          aria-label="Terug"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="upload-title">Mp3 uploaden</h1>
      </header>

      <div
        className={`upload-dropzone${dragOver ? " is-dragover" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="upload-dropzone-icon">
          <UploadIcon size={28} />
        </div>
        <div className="upload-dropzone-title">Sleep je bestanden hierheen</div>
        <div className="upload-dropzone-sub">
          of tik om te bladeren &middot; MP3, WAV, FLAC
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={handleInputChange}
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="upload-section-title">In de wachtrij</div>
          <div className="upload-queue">
            {items.map((item, i) => (
              <div className="upload-item" key={`${item.name}-${i}`}>
                <div className="upload-item-icon">
                  <Music size={19} />
                </div>
                <div className="upload-item-body">
                  <div className="upload-item-row">
                    <span className="upload-item-name">{item.name}</span>
                    <span className="upload-item-pct">
                      {item.status === "error" ? "Mislukt" : `${item.pct}%`}
                    </span>
                  </div>
                  <div className="upload-progress">
                    <div
                      className={`upload-progress-bar${
                        item.status === "error" ? " is-error" : ""
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {error && <div className="upload-error">{error}</div>}

      <button
        className="upload-submit"
        onClick={handleUpload}
        disabled={uploading || items.length === 0}
      >
        {uploading ? "Bezig met uploaden…" : "Uploaden naar bibliotheek"}
      </button>
    </div>
  );
}

export default Upload;
