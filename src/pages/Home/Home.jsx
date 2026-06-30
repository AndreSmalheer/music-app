import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import RecentlyPlayed from "../../components/RecentlyPlayed/RecentlyPlayed";
import Skeleton from "../../components/Skeleton/Skeleton";
import useLongPress from "../../hooks/useLongPress";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Settings, Music, DownloadCloud } from "lucide-react";
import {
  getArtists,
  getPlaylists,
  getSongs,
  getRecent,
  addRecent,
  searchYoutube,
  downloadFromYoutube,
} from "../../services/api";
import "./Home.css";
import ArtistItem from "../../components/items/ArtistItems";
import { useModal } from "../../context/ModalContext";
import { useDownload } from "../../context/DownloadContext";
import SongItem from "../../components/items/SongItem";
import PlaylistItem from "../../components/items/PlaylistItem";
import {
  MOOD_TILES,
  PLACEHOLDER_TRACKS,
  gradientFor,
} from "../../data/placeholderContent";
import HomeCard from "../../components/items/HomeCard";
import HomeTile from "../../components/items/HomeTile";

// Husselt een array (Fisher-Yates) zodat we elke keer een andere selectie
// "populaire" nummers kunnen tonen.
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ArrowBtn() {
  return <ArrowRight size={22} strokeWidth={2.5} />;
}

// Zoektermen voor de "vulling"-nummers. Bij elke refresh kiezen we er willekeurig
// één, zodat je steeds andere nummers ziet.
const SEED_QUERIES = [
  "top hits 2024",
  "pop hits",
  "hip hop 2024",
  "dance hits",
  "rock classics",
  "chill music",
  "indie pop",
  "nederlandse hits",
  "r&b hits",
  "latin hits",
  "viral songs",
  "throwback hits",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const { hasActiveDownloads } = useDownload();
  const [popular, setPopular] = useState([]);
  // Echte YouTube-tracks (mét echte cover-thumbnails) om de Home te vullen
  // zolang er nog geen eigen songs in de database staan.
  const [realTracks, setRealTracks] = useState([]);
  // Persoonlijke aanbevelingen, afgeleid van wat je laatst speelde.
  const [recommended, setRecommended] = useState([]);
  const [recentArtist, setRecentArtist] = useState("");
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const navigate = useNavigate();

  const menuOptions = ["Play", "Add to Library", "Share"];
  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, (option) => console.log(option)),
  );
  const tapFeedback = { scale: 0.98 };

  // Echte YouTube-tracks als vulling; valt terug op placeholders als YouTube
  // (nog) niets gaf, zodat de Home nooit leeg is.
  const filler = realTracks.length > 0 ? realTracks : PLACEHOLDER_TRACKS;

  const handleSongClick = (song) => {
    const queue = popular.length > 0 ? popular : filler;
    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
      queue,
    );

    navigate("/now-playing");

    // YouTube-track: stream-first afspelen, op de achtergrond opslaan + recent.
    if (song.youtubeId) {
      downloadFromYoutube({
        url: `https://www.youtube.com/watch?v=${song.youtubeId}`,
        title: song.title,
        artist: song.artist,
        thumbnail: song.cover,
      })
        .then((saved) => {
          if (saved?.id) addRecent(saved.id).catch(() => {});
        })
        .catch(() => {});
    } else if (song.id) {
      addRecent(song.id).catch(() => {});
    }
  };

  // Tik op een mood-tegel: zoek die mood op YouTube en speel 'm meteen af als
  // mix (queue = alle resultaten), zoals een radio. Niets wordt opgeslagen;
  // alleen het eerste nummer komt op de achtergrond in je recent/bibliotheek.
  const handleMoodTile = async (tile) => {
    try {
      const results = await searchYoutube(tile.query);
      const songs = results.filter((r) => r.type !== "youtube-artist");
      if (songs.length === 0) return;

      const first = songs[0];
      playSong(
        first.src,
        first.title,
        first.artist,
        first.cover,
        -1,
        first.youtubeId || null,
        songs,
      );

      navigate("/now-playing");

      if (first.youtubeId) {
        downloadFromYoutube({
          url: `https://www.youtube.com/watch?v=${first.youtubeId}`,
          title: first.title,
          artist: first.artist,
          thumbnail: first.cover,
        })
          .then((saved) => {
            if (saved?.id) addRecent(saved.id).catch(() => {});
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error("Mood-mix afspelen mislukt:", err);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [artistsData, playlistsData, songsData] = await Promise.all([
          getArtists(),
          getPlaylists(),
          getSongs(),
        ]);
        if (!active) return;
        setPlaylists(playlistsData);
        setArtists(shuffle(artistsData).slice(0, 6));
        setPopular(songsData.length > 0 ? shuffle(songsData).slice(0, 6) : []);
      } catch (err) {
        console.error("Home laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Echte nummers + covers van YouTube ophalen om de rijen te vullen. Bij elke
  // refresh een willekeurige zoekterm + gehusseld, dus je ziet steeds andere
  // nummers. Apart van de DB-fetch zodat de pagina meteen verschijnt.
  useEffect(() => {
    let active = true;
    searchYoutube(pickRandom(SEED_QUERIES))
      .then((results) => {
        if (!active) return;
        const songs = results.filter((r) => r.type !== "youtube-artist");
        setRealTracks(shuffle(songs));
      })
      .catch((err) => console.error("YouTube-vulling laden mislukt:", err));
    return () => {
      active = false;
    };
  }, []);

  // "Speciaal voor jou" personaliseren: kijk naar je laatst afgespeelde nummer
  // en haal meer nummers van die artiest op. Draait bij elke keer dat de Home
  // opent, dus na het afspelen van een nummer past dit zich aan.
  useEffect(() => {
    let active = true;
    getRecent()
      .then((recent) => {
        if (!active) return;
        const last = recent.find((t) => t && t.artist);
        if (!last) return;
        setRecentArtist(last.artist);
        return searchYoutube(last.artist);
      })
      .then((results) => {
        if (!active || !results) return;
        const songs = results.filter((r) => r.type !== "youtube-artist");
        setRecommended(shuffle(songs));
      })
      .catch((err) => console.error("Aanbevelingen laden mislukt:", err));
    return () => {
      active = false;
    };
  }, []);

  // "Speciaal voor jou" mixt je afspeellijsten en artiesten zodat de rij gevuld is.
  const recommendations = [
    ...playlists.map((p) => ({
      key: `pl-${p.id}`,
      title: p.title,
      sub: "Afspeellijst",
      cover: p.cover,
      gradient: gradientFor(p.title || p.id),
      onClick: () => navigate(`/playlist/${p.id}`),
    })),
    ...artists.map((a) => ({
      key: `ar-${a.id}`,
      title: a.name,
      sub: "Artiest",
      cover: a.img || a.cover,
      gradient: gradientFor(a.name || a.id),
      onClick: () => navigate(`/artist/${a.id}`),
    })),
  ];

  // Voorrang: eigen playlists/artiesten → persoonlijke aanbevelingen (op basis
  // van wat je speelde) → algemene vulling. Zo past "Speciaal voor jou" zich aan.
  const personalized = recommended;

  const displayRecommendations = personalized.map((track) => ({
    key: `rec-${track.youtubeId || track.id}`,
    title: track.title,
    sub: track.artist,
    cover: track.cover,
    gradient: track.gradient || gradientFor(track.title),
    track,
    onClick: () => handleSongClick(track),
  }));

  // Titel toont waarom het wordt aanbevolen zodra het gepersonaliseerd is.
  const specialTitle =
    recommendations.length === 0 && recommended.length > 0 && recentArtist
      ? `Omdat je naar ${recentArtist} luisterde`
      : "Speciaal voor jou";

  return (
    <div className="home-page">
      <div className="home-topbar">
        <h1 className="home-greeting">Goedemiddag</h1>
        <div className="home-topbar__actions">
          <button
            className="home-icon-btn"
            style={{ position: "relative" }}
            aria-label="Downloads"
            onClick={() => navigate("/downloads")}
          >
            <DownloadCloud size={24} strokeWidth={1.9} className={hasActiveDownloads ? "download-icon-pulse" : ""} />
            {hasActiveDownloads && <span className="download-badge-dot" />}
          </button>
          <button
            className="home-icon-btn"
            aria-label="Settings"
            onClick={() => navigate("/settings")}
          >
            <Settings size={24} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <div className="home-tiles">
        {MOOD_TILES.map((tile, i) => (
          <HomeTile
            key={tile.name}
            tile={tile}
            track={filler[i]}
            cover={filler[i]?.cover}
            tapFeedback={tapFeedback}
            handleMoodTile={handleMoodTile}
          />
        ))}
      </div>

      <RecentlyPlayed InculdeYt={true} fallbackTracks={filler} />

      <section className="home-carousel">
        <h2 className="home-carousel-title">{specialTitle}</h2>
        <section className="home-carousel">
          <div className="home-carousel__row">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="home-card">
                  <Skeleton width="148px" height="148px" borderRadius="6px" />
                  <Skeleton height="1rem" style={{ marginTop: "9px" }} />
                </div>
              ))
            ) : displayRecommendations.length > 0 ? (
              displayRecommendations.map((item) => (
                <HomeCard
                  key={item.key}
                  item={item}
                  tapFeedback={tapFeedback}
                  handleSongClick={handleSongClick}
                />
              ))
            ) : (
              <div className="home-card">
                <div className="home-card__cover home-card__fallback">
                  <Music size={34} strokeWidth={1.8} />
                </div>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

export default Home;
