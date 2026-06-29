// Herbruikbare afspeel-helpers zodat playlist-knoppen (Play/Shuffle) overal
// hetzelfde werken: hele lijst als wachtrij meegeven aan playSong.
import { getPlaylist, addRecent } from "../services/api";

// Fisher-Yates shuffle (geeft een nieuwe array terug, muteert de input niet).
export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Speelt een lijst tracks af: eerste nummer start, hele lijst wordt de wachtrij
// (zodat volgende/vorige/shuffle werken). Optioneel eerst husselen.
export function playTrackList(tracks, { playSong, navigate, shuffle = false } = {}) {
  if (!tracks || tracks.length === 0) return;

  const list = shuffle ? shuffleArray(tracks) : tracks;
  const first = list[0];

  playSong(
    first.src,
    first.title,
    first.artist,
    first.cover,
    -1,
    first.youtubeId || null,
    list,
    first.id,
  );

  if (first.id) addRecent(first.id).catch(() => {});
  if (navigate) navigate("/now-playing");
}

// Haalt een playlist op en speelt zijn nummers af (eventueel geshuffeld).
export async function playPlaylistById(id, options) {
  const data = await getPlaylist(id);
  playTrackList(data?.songs || [], options);
}
