// Centrale service-laag tussen de frontend en de backend-API.
// Alle componenten praten via deze functies met de backend — nergens anders fetch.
// Hier zit ook de enige plek waar backend-velden (_id, thumbnail, filePath) worden
// vertaald naar de korte UI-velden (id, cover/img, src).

// In dev stuurt Vite de /api/* calls via de proxy naar localhost:3001.
// In productie (Capacitor) moet VITE_API_URL naar de echte server wijzen.
export let BASE_URL =
  localStorage.getItem("SERVER_URL") || import.meta.env.VITE_API_URL || "";

export function setBaseUrl(url) {
  localStorage.setItem("SERVER_URL", url);
  BASE_URL = url;
}

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
  const normalizedSeconds = normalizeDuration(seconds);
  const m = Math.floor(normalizedSeconds / 60);
  const s = Math.floor(normalizedSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function normalizeDuration(duration = 0) {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) return 0;

  // Some clients report milliseconds; the API stores seconds.
  if (value > 24 * 60 * 60) return Math.round(value / 1000);

  return Math.round(value);
}

// ---- mappers (backend -> UI) -------------------------------------------

export function toUiTrack(song) {
  if (!song) return null;
  const isYoutubeTrack = !!song.youtubeId;
  return {
    id: song._id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: normalizeDuration(song.duration),
    durationLabel: formatDuration(song.duration),
    cover: assetUrl(song.thumbnail),
    img: assetUrl(song.thumbnail),
    src: isYoutubeTrack
      ? getYoutubeStreamUrl(song.youtubeId)
      : assetUrl(song.filePath),
    youtubeId: song.youtubeId,
    sourceYoutubeId: song.sourceYoutubeId,
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
    isYoutubeArtist: !!artist.isYoutubeArtist,
    youtubeChannelId: artist.youtubeChannelId,
    type: artist.isYoutubeArtist ? "youtube-artist" : "artist",
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

export async function getLocalSongs() {
  const data = await getJSON("/api/songs");
  return data.filter((song) => !song.youtubeId).map(toUiTrack);
}

export async function getSavedYoutubeSongs() {
  const data = await getJSON("/api/songs");
  return data.filter((song) => !!song.youtubeId).map(toUiTrack);
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

export async function downloadYoutubeToLibrary(
  { url, title, artist, thumbnail },
  signal,
) {
  const song = await request("/api/songs/download-local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title, artist, thumbnail }),
    signal,
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

export async function addSongToPlaylist(playlistId, songId) {
  const playlist = await getPlaylist(playlistId);

  const songs = playlist.songs.map((s) => (typeof s === "string" ? s : s.id));

  if (!songs.includes(songId)) {
    songs.push(songId);
  }

  return updatePlaylist(playlistId, { songs });
}

export async function removeSongFromPlaylist(playlistId, songId) {
  const playlist = await getPlaylist(playlistId);
  const songs = playlist.songs.map((song) =>
    typeof song === "object" ? song.id : song,
  );

  const updatedSongs = songs.filter((id) => id !== songId);

  return updatePlaylist(playlistId, { songs: updatedSongs });
}

export function deletePlaylist(id) {
  return del(`/api/playlists/${id}`);
}

// ---- Artists ------------------------------------------------------------

export async function getArtists() {
  const data = await getJSON("/api/artists");
  return data.map(toUiArtist);
}

export async function getYoutubeArtists() {
  const data = await getJSON("/api/artists?source=youtube");
  return data.map(toUiArtist);
}

export async function getArtist(id) {
  return toUiArtist(await getJSON(`/api/artists/${id}`));
}

export async function createYoutubeArtist({
  name,
  thumbnail,
  youtubeChannelId,
}) {
  return toUiArtist(
    await postJSON("/api/artists/youtube", {
      name,
      thumbnail,
      youtubeChannelId,
    }),
  );
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
    songs: (data.songs || []).map(toUiTrack),

    artists: (data.artists || [])
      .filter((artist) => !artist.isYoutubeArtist)
      .map(toUiArtist),

    playlists: (data.playlists || []).map(toUiPlaylist),
  };
}

// ---- YouTube ------------------------------------------------------------

function toUiYoutubeResult(item) {
  return item.type === "youtube-artist"
    ? {
        id: item.youtubeChannelId,
        youtubeChannelId: item.youtubeChannelId,
        name: item.artist || item.title,
        title: item.artist || item.title,
        artist: item.artist || item.title,
        cover: item.thumbnail,
        img: item.thumbnail,
        type: "youtube-artist",
        isYoutubeArtist: true,
      }
    : {
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
      };
}

// Geeft een lijst van { youtubeId, title, artist, thumbnail, type: "youtube" }
export async function searchYoutube(q) {
  const data = await getJSON(`/api/youtube/search?q=${encodeURIComponent(q)}`);
  return data.map(toUiYoutubeResult);
}

export async function searchYoutubePage(q, pageToken = "") {
  const pageTokenParam = pageToken
    ? `&pageToken=${encodeURIComponent(pageToken)}`
    : "";
  const data = await getJSON(
    `/api/youtube/search?q=${encodeURIComponent(q)}&paged=true${pageTokenParam}`,
  );

  return {
    results: (data.results || []).map(toUiYoutubeResult),
    nextPageToken: data.nextPageToken || null,
  };
}

export function getYoutubeStreamUrl(videoId) {
  return `${BASE_URL}/api/youtube/stream/${videoId}`;
}
