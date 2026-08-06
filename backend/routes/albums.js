import { Router } from "express";

const router = Router();

const MB_ROOT = "https://musicbrainz.org/ws/2";
const HEADERS = {
  "User-Agent": "MusicApp/1.0.0 ( contact@example.com )",
  "Accept": "application/json"
};

const albumCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function fetchMB(url, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 503) {
        console.warn(`[MusicBrainz] 503 rate limited. Retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      if (!res.ok) {
        throw new Error(`MusicBrainz HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

// GET /api/albums/:id — gets details of a release group including tracklist from MusicBrainz
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing ID" });

    if (albumCache.has(id)) {
      const cached = albumCache.get(id);
      if (cached.expires > Date.now()) {
        return res.json(cached.data);
      }
    }

    // 1. Get release-group details and releases
    const rgUrl = `${MB_ROOT}/release-group/${id}?inc=releases&fmt=json`;
    const rgData = await fetchMB(rgUrl);
    const releases = rgData.releases || [];

    if (releases.length === 0) {
      return res.status(404).json({ error: "No releases found for this album" });
    }

    // 2. Fetch tracks from the first release
    const firstRelease = releases[0];
    const relUrl = `${MB_ROOT}/release/${firstRelease.id}?inc=recordings+artist-credits&fmt=json`;
    const relData = await fetchMB(relUrl);

    // Parse tracks
    const tracks = (relData.media && relData.media[0] && relData.media[0].tracks) || [];
    const albumArtist = (rgData["artist-credit"] || []).map(c => c.name).join("");
    const releaseYear = rgData["first-release-date"] ? rgData["first-release-date"].slice(0, 4) : "";

    const mappedTracks = tracks.map(t => {
      const trackArtist = (t["artist-credit"] || []).map(c => c.name).join("");
      const durationSec = t.length ? Math.round(t.length / 1000) : 0;
      const m = Math.floor(durationSec / 60);
      const s = String(durationSec % 60).padStart(2, "0");
      const durationLabel = `${m}:${s}`;

      return {
        id: t.recording.id,
        title: t.title,
        artist: trackArtist || albumArtist,
        album: rgData.title,
        cover: `https://coverartarchive.org/release-group/${id}/front-250`,
        img: `https://coverartarchive.org/release-group/${id}/front-250`,
        duration: durationSec,
        durationLabel: durationLabel,
        youtubeId: null,
        type: "musicbrainz"
      };
    });

    const payload = {
      id: rgData.id,
      title: rgData.title,
      artist: albumArtist,
      cover: `https://coverartarchive.org/release-group/${id}/front-500`,
      img: `https://coverartarchive.org/release-group/${id}/front-500`,
      year: releaseYear,
      tracks: mappedTracks,
      songCount: mappedTracks.length
    };

    albumCache.set(id, {
      data: payload,
      expires: Date.now() + CACHE_TTL
    });

    res.json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;
