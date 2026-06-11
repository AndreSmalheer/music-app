import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");

// Zorg dat de uploads-map bestaat
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // unieke naam: tijd + willekeurig + originele extensie
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

// Sta alleen audio en afbeeldingen toe (MP3 + cover)
function fileFilter(req, file, cb) {
  const ok = file.mimetype.startsWith("audio/") || file.mimetype.startsWith("image/");
  if (ok) return cb(null, true);
  cb(new Error("Alleen audio- of afbeeldingsbestanden toegestaan"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

export default upload;
