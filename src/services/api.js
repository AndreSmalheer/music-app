// Centrale service-laag tussen de frontend en de backend-API.
// Alle componenten praten via deze functies met de backend — nergens anders fetch.
// Hier zit ook de enige plek waar backend-velden (_id, thumbnail, filePath) worden
// vertaald naar de korte UI-velden (id, cover/img, src).

// In dev stuurt Vite de /api/* calls via de proxy naar localhost:3001.
// In productie (Capacitor) moet VITE_API_URL naar de echte server wijzen.
const BASE_URL = import.meta.env.VITE_API_URL || "";

// ---- low-level helpers --------------------------------------------------

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* geen json body */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const getJSON = (path) => request(path);
const postJSON = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const putJSON = (path, body) =>
  request(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const del = (path) => request(path, { method: "DELETE" });

// Maakt van een relatief backend-pad (/uploads/..) een volledige URL.
// Laat http(s) en data: URLs ongemoeid.
export function assetUrl(p) {
  if (!p) return "";
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  return `${BASE_URL}${p}`;
}

// Seconden -> "m:ss"
export function formatDuration(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---- mappers (backend -> UI) -------------------------------------------

export function toUiTrack(song) {
  if (!song) return null;
  return {
    id: song._id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration ?? 0,
    durationLabel: formatDuration(song.duration ?? 0),
    cover: assetUrl(song.thumbnail),
    img: assetUrl(song.thumbnail),
    src: assetUrl(song.filePath),
    youtubeId: song.youtubeId,
    type: song.type,
  };
}

export function toUiArtist(artist) {
  if (!artist) return null;
  return {
    id: artist._id,
    name: artist.name,
    img: assetUrl(artist.thumbnail),
    cover: assetUrl(artist.thumbnail),
    songs: (artist.songs || []).map((s) =>
      typeof s === "object" ? toUiTrack(s) : s,
    ),
  };
}

export function toUiPlaylist(playlist) {
  if (!playlist) return null;
  return {
    id: playlist._id,
    title: playlist.name,
    name: playlist.name,
    cover: assetUrl(playlist.thumbnail),
    songCount: playlist.songs?.length || 0,
    songs: (playlist.songs || []).map((s) =>
      typeof s === "object" ? toUiTrack(s) : s,
    ),
  };
}

// ---- Health Check -----------------------------------------------------

export async function checkHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("Health check failed - Status:", res.status);
      return false;
    }

    const data = await res.json();
    return data && data.status === "ok";
  } catch (error) {
    clearTimeout(timeoutId);

    console.error("Health check error caught:", error.message);
    return false;
  }
}

// ---- Songs --------------------------------------------------------------

export async function getSongs() {
  const data = await getJSON("/api/songs");
  return data.map(toUiTrack);
}

export async function getSong(id) {
  return toUiTrack(await getJSON(`/api/songs/${id}`));
}

// formData: FormData met velden audio (File), cover (File, optioneel), title, artist, album
export async function uploadSong(formData) {
  const song = await request("/api/songs/upload", {
    method: "POST",
    body: formData, // browser zet zelf de multipart Content-Type
  });
  return toUiTrack(song);
}

export async function downloadFromYoutube({ url, title, artist, thumbnail }) {
  const song = await postJSON("/api/songs/download", {
    url,
    title,
    artist,
    thumbnail,
  });
  return toUiTrack(song);
}

export function deleteSong(id) {
  return del(`/api/songs/${id}`);
}

// ---- Playlists ----------------------------------------------------------

export async function getPlaylists() {
  const data = await getJSON("/api/playlists");
  return data.map(toUiPlaylist);
}

export async function getPlaylist(id) {
  return toUiPlaylist(await getJSON(`/api/playlists/${id}`));
}

export async function createPlaylist({ name, thumbnail, songs }) {
  return toUiPlaylist(
    await postJSON("/api/playlists", { name, thumbnail, songs }),
  );
}

export async function updatePlaylist(id, data) {
  // 'title' uit de UI mappen naar 'name' voor de backend
  const body = { ...data };
  if (body.title && !body.name) {
    body.name = body.title;
    delete body.title;
  }
  return toUiPlaylist(await putJSON(`/api/playlists/${id}`, body));
}

export function deletePlaylist(id) {
  return del(`/api/playlists/${id}`);
}

// ---- Artists ------------------------------------------------------------

export async function getArtists() {
  const data = await getJSON("/api/artists");
  return data.map(toUiArtist);
}

export async function getArtist(id) {
  return toUiArtist(await getJSON(`/api/artists/${id}`));
}

// ---- Recently played ----------------------------------------------------

export async function getRecent() {
  const data = await getJSON("/api/recent");
  // entries -> de song eruit halen (gepopulate door de backend)
  return data.map((entry) => toUiTrack(entry.song)).filter(Boolean);
}

export function addRecent(songId) {
  return postJSON("/api/recent", { song: songId });
}

// ---- Search -------------------------------------------------------------

export async function search(q) {
  const data = await getJSON(`/api/search?q=${encodeURIComponent(q)}`);

  return {
    songs: (data.songs || []).filter((song) => !song.youtubeId).map(toUiTrack),

    artists: (data.artists || []).map(toUiArtist),

    playlists: (data.playlists || []).map(toUiPlaylist),
  };
}

// ---- YouTube ------------------------------------------------------------

// Geeft een lijst van { youtubeId, title, artist, thumbnail, type: "youtube" }
export async function searchYoutube(q) {
  const data = await getJSON(`/api/youtube/search?q=${encodeURIComponent(q)}`);
  return data.map((item) => ({
    id: item.youtubeId,
    youtubeId: item.youtubeId,
    title: item.title,
    artist: item.artist,
    cover: item.thumbnail,
    img: item.thumbnail,
    src: "",
    type: "youtube",
    duration: 0,
    durationLabel: "",
  }));
}

export function getYoutubeStreamUrl(videoId) {
  return `${BASE_URL}/api/youtube/stream/${videoId}`;
}
