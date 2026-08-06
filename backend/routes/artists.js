import { Router } from "express";
import Artist from "../models/Artist.js";

const router = Router();

const MB_ROOT = "https://musicbrainz.org/ws/2";
const HEADERS = {
  "User-Agent": "MusicApp/1.0.0 ( contact@example.com )",
  "Accept": "application/json"
};

const artistCache = new Map();
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

async function fetchWikipediaSummary(artistName) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(artistName)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "MusicApp/1.0.0 (contact@example.com)" }
    });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const firstResult = searchData.query?.search?.[0];
    if (!firstResult) return null;

    const title = firstResult.title;
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl, {
      headers: { "User-Agent": "MusicApp/1.0.0 (contact@example.com)" }
    });
    if (!summaryRes.ok) return null;
    const summaryData = await summaryRes.json();
    return {
      bio: summaryData.extract || null,
      img: summaryData.thumbnail?.source || null
    };
  } catch (err) {
    console.error(`[Wikipedia] Error fetching bio for ${artistName}:`, err.message);
    return null;
  }
}

// GET /api/artists - all artists
router.get("/", async (req, res, next) => {
  try {
    const source = req.query.source || "local";
    const filter =
      source === "youtube" || source === "yt"
        ? { isYoutubeArtist: true }
        : source === "all"
          ? {}
          : { isYoutubeArtist: { $ne: true } };

    const artists = await Artist.find(filter).sort({ name: 1 });
    res.json(artists);
  } catch (err) {
    next(err);
  }
});

// POST /api/artists/youtube - create/reuse a YouTube artist
router.post("/youtube", async (req, res, next) => {
  try {
    const { name, thumbnail, youtubeChannelId } = req.body;
    if (!name) return res.status(400).json({ error: "Naam is verplicht" });

    const update = {
      $setOnInsert: { name, isYoutubeArtist: true },
    };

    if (thumbnail || youtubeChannelId) {
      update.$set = {};
      if (thumbnail) update.$set.thumbnail = thumbnail;
      if (youtubeChannelId) update.$set.youtubeChannelId = youtubeChannelId;
    }

    const artist = await Artist.findOneAndUpdate(
      { name, isYoutubeArtist: true },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(201).json(await artist);
  } catch (err) {
    next(err);
  }
});

// GET /api/artists/:id - get an artist incl. songs
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a MusicBrainz UUID
    const isMbId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isMbId) {
      // Check cache
      if (artistCache.has(id)) {
        const cached = artistCache.get(id);
        if (cached.expires > Date.now()) {
          return res.json(cached.data);
        }
      }

      // 1. Fetch artist details
      const detailUrl = `${MB_ROOT}/artist/${id}?fmt=json`;
      const artistData = await fetchMB(detailUrl);
      const name = artistData.name;

      // 2. Fetch release groups, recordings, and Wikipedia bio in parallel
      const rgUrl = `${MB_ROOT}/release-group?artist=${id}&limit=100&fmt=json`;
      const recUrl = `${MB_ROOT}/recording?query=arid:${id}&limit=50&fmt=json`;

      const [rgData, recData, wikiData] = await Promise.all([
        fetchMB(rgUrl).catch(() => ({ "release-groups": [] })),
        fetchMB(recUrl).catch(() => ({ recordings: [] })),
        fetchWikipediaSummary(name).catch(() => null)
      ]);

      // 3. Process recordings (Top Tracks), deduplicating by title
      const recordings = recData.recordings || [];
      const seenTitles = new Set();
      const deduplicated = [];
      for (const r of recordings) {
        const lowerTitle = r.title.toLowerCase();
        if (!seenTitles.has(lowerTitle)) {
          seenTitles.add(lowerTitle);
          deduplicated.push(r);
        }
      }

      const topTracks = deduplicated.slice(0, 10).map(r => {
        const artistName = (r["artist-credit"] || []).map(c => c.name).join("");
        const release = r.releases && r.releases[0];
        const releaseYear = release && release["release-group"] && release["release-group"]["first-release-date"]
          ? release["release-group"]["first-release-date"].slice(0, 4)
          : release && release["date"] ? release["date"].slice(0, 4) : "";
        const albumName = release ? release.title : "";
        const releaseGroupId = release?.["release-group"]?.id;
        const coverUrl = releaseGroupId
          ? `https://coverartarchive.org/release-group/${releaseGroupId}/front-250`
          : release
            ? `https://coverartarchive.org/release/${release.id}/front-250`
            : null;
        
        const durationSec = r.length ? Math.round(r.length / 1000) : 0;
        const m = Math.floor(durationSec / 60);
        const s = String(durationSec % 60).padStart(2, "0");
        const durationLabel = `${m}:${s}`;

        return {
          id: r.id,
          title: r.title,
          artist: artistName,
          album: albumName,
          cover: coverUrl,
          img: coverUrl,
          duration: durationSec,
          durationLabel: durationLabel,
          youtubeId: null,
          type: "musicbrainz"
        };
      });

      // 4. Process release groups
      const releaseGroups = rgData["release-groups"] || [];
      const sortedReleaseGroups = [...releaseGroups].sort((a, b) => {
        const dateA = a["first-release-date"] || "0000";
        const dateB = b["first-release-date"] || "0000";
        return dateB.localeCompare(dateA); // chronology: descending
      });

      const formatReleaseGroup = g => {
        const artistName = (g["artist-credit"] || []).map(c => c.name).join("");
        const releaseYear = g["first-release-date"] ? g["first-release-date"].slice(0, 4) : "";
        return {
          id: g.id,
          title: g.title,
          artist: artistName,
          cover: `https://coverartarchive.org/release-group/${g.id}/front-250`,
          img: `https://coverartarchive.org/release-group/${g.id}/front-250`,
          year: releaseYear,
          type: g["primary-type"]?.toLowerCase() || "album"
        };
      };

      const chronology = sortedReleaseGroups.map(formatReleaseGroup);
      const albums = releaseGroups
        .filter(g => g["primary-type"]?.toLowerCase() === "album")
        .map(formatReleaseGroup);
      const singles = releaseGroups
        .filter(g => g["primary-type"]?.toLowerCase() === "single")
        .map(formatReleaseGroup);
      const eps = releaseGroups
        .filter(g => g["primary-type"]?.toLowerCase() === "ep")
        .map(formatReleaseGroup);

      const payload = {
        id,
        name,
        isYoutubeArtist: false,
        type: "artist",
        biography: wikiData?.bio || null,
        img: wikiData?.img || albums[0]?.cover || null,
        cover: wikiData?.img || albums[0]?.cover || null,
        songs: topTracks,
        albums,
        singles,
        eps,
        chronology
      };

      artistCache.set(id, {
        data: payload,
        expires: Date.now() + CACHE_TTL
      });

      return res.json(payload);
    }

    // Default local database lookup
    const artist = await Artist.findById(id).populate("songs");
    if (!artist)
      return res.status(404).json({ error: "Artiest niet gevonden" });
    res.json(artist);
  } catch (err) {
    next(err);
  }
});

export default router;
