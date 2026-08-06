import { Router } from "express";
import Playlist from "../models/Playlist.js";

const router = Router();

const MB_ROOT = "https://musicbrainz.org/ws/2";
const HEADERS = {
  "User-Agent": "MusicApp/1.0.0 ( contact@example.com )",
  "Accept": "application/json"
};

// In-memory cache for search results
const searchCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
let nextMusicBrainzRequestAt = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchMB(url, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      // MusicBrainz asks clients not to exceed one request per second. This
      // shared gate also keeps searches triggered while typing from competing.
      const now = Date.now();
      const waitMs = Math.max(0, nextMusicBrainzRequestAt - now);
      nextMusicBrainzRequestAt = Math.max(nextMusicBrainzRequestAt, now) + 1100;
      if (waitMs) await wait(waitMs);

      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 503) {
        console.warn(`[MusicBrainz] 503 rate limited. Retrying in ${delayMs}ms...`);
        await wait(delayMs);
        continue;
      }
      if (!res.ok) {
        throw new Error(`MusicBrainz HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await wait(delayMs);
    }
  }
}

// GET /api/search?q= — searches in MusicBrainz and local playlists
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ topResults: [], songs: [], artists: [], albums: [], playlists: [] });

    // Check cache
    const cached = searchCache.get(q);
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }

    // Search MusicBrainz in parallel
    const artistUrl = `${MB_ROOT}/artist?query=artist:${encodeURIComponent(q)}&fmt=json&limit=10`;
    const recUrl = `${MB_ROOT}/recording?query=recording:${encodeURIComponent(q)}&fmt=json&limit=15`;

    // Local playlists match regex
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const artistData = await fetchMB(artistUrl).catch(() => ({ artists: [] }));
    const matchedArtist = (artistData.artists || []).find(
      (artist) => artist.name.toLowerCase() === q.toLowerCase(),
    ) || artistData.artists?.[0];

    // `releasegroup:mgk` searches album titles named “mgk”; it does not find
    // Machine Gun Kelly's albums. Browsing by the resolved artist gives us the
    // actual album release groups, whose IDs work with Cover Art Archive.
    const rgUrl = matchedArtist
      ? `${MB_ROOT}/release-group?artist=${encodeURIComponent(matchedArtist.id)}&type=album&fmt=json&limit=10`
      : `${MB_ROOT}/release-group?query=${encodeURIComponent(q)}&fmt=json&limit=10`;

    const [rgData, recData, playlists] = await Promise.all([
      fetchMB(rgUrl).catch(() => ({ "release-groups": [] })),
      fetchMB(recUrl).catch(() => ({ recordings: [] })),
      // Our SQL-backed Query is awaitable but is not a native Promise, so it
      // does not expose `.catch()`. Convert it before using the fallback.
      Promise.resolve(Playlist.find({ name: rx }).limit(10)).catch(() => []),
    ]);

    // Map Albums (Release Groups)
    const albums = (rgData["release-groups"] || []).map(g => {
      const artistName = (g["artist-credit"] || []).map(c => c.name).join("");
      const releaseYear = g["first-release-date"] ? g["first-release-date"].slice(0, 4) : "";
      return {
        id: g.id,
        title: g.title,
        artist: artistName,
        cover: `https://coverartarchive.org/release-group/${g.id}/front-250`,
        img: `https://coverartarchive.org/release-group/${g.id}/front-250`,
        year: releaseYear,
        type: "album",
      };
    });

    // MusicBrainz does not provide artist portraits. Use the artist's first
    // canonical release-group cover instead of an unrelated default avatar.
    const artistCover = albums[0]?.cover || null;
    const artists = (artistData.artists || []).map(a => ({
      id: a.id,
      name: a.name,
      img: a.id === matchedArtist?.id ? artistCover : null,
      type: "artist",
      country: a.country || "",
      disambiguation: a.disambiguation || "",
    }));

    // Map Songs (Recordings)
    const songs = (recData.recordings || []).map(r => {
      const artistName = (r["artist-credit"] || []).map(c => c.name).join("");
      const release = r.releases && r.releases[0];
      const releaseYear = release && release["release-group"] && release["release-group"]["first-release-date"]
        ? release["release-group"]["first-release-date"].slice(0, 4)
        : release && release["date"] ? release["date"].slice(0, 4) : "";
      const albumName = release ? release.title : "";
      // A recording's first release is often an edition without artwork. Its
      // release group points to MusicBrainz's canonical album artwork instead.
      const releaseGroupId = release?.["release-group"]?.id;
      const coverUrl = releaseGroupId
        ? `https://coverartarchive.org/release-group/${releaseGroupId}/front-250`
        : release
          ? `https://coverartarchive.org/release/${release.id}/front-250`
          : null;
      return {
        id: r.id,
        title: r.title,
        artist: artistName,
        album: albumName,
        cover: coverUrl,
        img: coverUrl,
        duration: r.length ? Math.round(r.length / 1000) : 0,
        year: releaseYear,
        type: "song",
      };
    });

    // Build Top Result (prefer closest artist name match, else first artist, else first song)
    let topResults = [];
    const exactArtist = artists.find(a => a.name.toLowerCase() === q.toLowerCase());
    if (exactArtist) {
      topResults = [exactArtist];
    } else if (artists.length > 0) {
      topResults = [artists[0]];
    } else if (songs.length > 0) {
      topResults = [songs[0]];
    }

    const payload = {
      topResults,
      songs,
      artists,
      albums,
      playlists: playlists.map(p => ({
        id: p._id,
        title: p.name,
        name: p.name,
        description: p.description || "",
        cover: p.thumbnail ? p.thumbnail : "",
        songCount: p.songs?.length || 0,
        type: "playlist"
      }))
    };

    // Cache the result
    searchCache.set(q, {
      data: payload,
      expires: Date.now() + CACHE_TTL
    });

    res.json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;
