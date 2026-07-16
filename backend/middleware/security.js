// Gedeelde security-helpers: input-validatie + NoSQL-injectie afweer.
// Op één plek zodat alle routes dezelfde regels gebruiken.
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

// ---- Validatie -----------------------------------------------------------

// Is dit een geldige MongoDB ObjectId? (voorkomt CastError → 500 + rare queries)
export function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

// YouTube video-id's zijn altijd exact 11 tekens uit [A-Za-z0-9_-].
// Valideren voorkomt dat willekeurige input in yt-dlp/URL's terechtkomt.
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
export function isValidVideoId(id) {
  return typeof id === "string" && VIDEO_ID_RE.test(id);
}

// Express-middleware: geeft 400 als :id geen geldige ObjectId is.
export function validateObjectIdParam(paramName = "id") {
  return (req, res, next) => {
    if (!isValidObjectId(req.params[paramName])) {
      return res.status(400).json({ error: "Ongeldige id" });
    }
    next();
  };
}

// ---- NoSQL-injectie afweer ----------------------------------------------
//
// express.json() parseert JSON-objecten, dus een client kan {"song": {"$gt": ""}}
// sturen. Zonder filtering belanden zulke operator-objecten in Mongoose-queries.
// We strippen recursief alle keys die met '$' beginnen of een '.' bevatten.
function stripOperators(value) {
  if (Array.isArray(value)) {
    return value.map(stripOperators);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = stripOperators(val);
    }
    return clean;
  }
  return value;
}

export function mongoSanitize(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = stripOperators(req.body);
  }
  // req.query is in Express 4 muteerbaar; sanitize alleen de waarden.
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      req.query[key] = stripOperators(req.query[key]);
    }
  }
  next();
}

// ---- Rate limiting -------------------------------------------------------

// Ruime, algemene limiter tegen brute-force/vloed. Streaming en statische
// bestanden worden overgeslagen (die vuren veel losse Range-requests af).
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Te veel verzoeken, probeer later opnieuw" },
  skip: (req) =>
    req.path.startsWith("/api/youtube/stream") ||
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/music"),
});

// Strikte limiter voor dure schrijf-/downloadacties (yt-dlp, disk, uploads).
export const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Te veel download-/uploadverzoeken, wacht even" },
});
