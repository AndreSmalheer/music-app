import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");

// Zorg dat de uploads-map bestaat
fs.mkdirSync(uploadDir, { recursive: true });

// Toegestane extensies per type. Alleen op mimetype vertrouwen is onveilig
// (die is client-gecontroleerd), dus we checken óók de extensie.
const AUDIO_EXTS = new Set([".mp3", ".m4a", ".aac", ".wav", ".ogg", ".flac"]);
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Unieke, veilige naam: tijd + willekeurig + gesaneerde extensie.
    // Nooit de originele bestandsnaam als pad gebruiken (path-traversal).
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const rand = Math.round(Math.random() * 1e9);
    cb(null, `${Date.now()}-${rand}${ext}`);
  },
});

// Filter dat mimetype én extensie controleert tegen een whitelist.
function makeFilter(allowedExts, mimePrefixes) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk = mimePrefixes.some((p) => file.mimetype.startsWith(p));
    const extOk = allowedExts.has(ext);
    if (mimeOk && extOk) return cb(null, true);
    cb(new Error("Bestandstype niet toegestaan"));
  };
}

// Audio + cover uploaden (songs). 50 MB per bestand.
const upload = multer({
  storage,
  fileFilter: makeFilter(
    new Set([...AUDIO_EXTS, ...IMAGE_EXTS]),
    ["audio/", "image/"],
  ),
  limits: { fileSize: 50 * 1024 * 1024, files: 2 },
});

// Alleen afbeeldingen (bv. playlist-thumbnail). 5 MB.
export const imageUpload = multer({
  storage,
  fileFilter: makeFilter(IMAGE_EXTS, ["image/"]),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export default upload;
