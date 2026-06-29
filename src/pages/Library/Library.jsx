import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, Music, ListMusic } from "lucide-react";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import {
  getPlaylists,
  getLocalSongs,
  getSavedYoutubeSongs,
  getArtists,
} from "../../services/api";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import "./Library.css";

const TABS = [
  { key: "playlists", label: "Afspeellijsten" },
  { key: "uploads", label: "Uploads" },
  { key: "youtube", label: "YouTube" },
  { key: "artists", label: "Artiesten" },
];

function Library() {
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("playlists");
  const [sheetOpen, setSheetOpen] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [youtubeSongs, setYoutubeSongs] = useState([]);
  const [artists, setArtists] = useState([]);

  // Alle data in één keer ophalen.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pl, sg, yt, ar] = await Promise.all([
          getPlaylists(),
          getLocalSongs(),
          getSavedYoutubeSongs(),
          getArtists(),
        ]);
        if (!active) return;
        setPlaylists(pl);
        setSongs(sg);
        setYoutubeSongs(yt);
        setArtists(ar);
      } catch (err) {
        console.error("Bibliotheek laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Speel een upload af met de hele uploads-lijst als wachtrij, startend bij song.
  const playSongList = (song, list) => {
    const ordered = [song, ...list.filter((s) => s.id !== song.id)];
    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
      ordered,
      song.id,
    );
    navigate("/now-playing");
  };

  const addOptions = [
    {
      icon: Upload,
      title: "Mp3 uploaden",
      subtitle: "Vanaf je toestel",
      onClick: () => navigate("/upload"),
    },
    {
      icon: Music,
      title: "YouTube toevoegen",
      subtitle: "Via link of zoeken",
      onClick: () => navigate("/radio"),
    },
    {
      icon: ListMusic,
      title: "Nieuwe afspeellijst",
      subtitle: "Maak een lege lijst aan",
      onClick: () => navigate("/create-playlist"),
    },
  ];

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="library-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="library-row" key={i}>
              <Skeleton width="58px" height="58px" borderRadius="6px" />
              <div className="library-row__info">
                <Skeleton width="150px" height="15px" />
                <Skeleton width="100px" height="13px" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "playlists") {
      if (playlists.length === 0) {
        return (
          <EmptyState
            title="Geen afspeellijsten"
            subtitle="Maak je eerste afspeellijst aan"
          />
        );
      }
      return (
        <div className="library-list">
          {playlists.map((item) => (
            <motion.button
              key={item.id}
              className="library-row"
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/playlist/${item.id}`)}
            >
              <img
                src={item.cover}
                alt={item.title}
                className="library-row__cover"
              />
              <div className="library-row__info">
                <p className="library-row__title">{item.title}</p>
                <p className="library-row__subtitle">
                  Afspeellijst · {item.songCount} nummers
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    if (activeTab === "uploads") {
      if (songs.length === 0) {
        return (
          <EmptyState
            title="Geen uploads"
            subtitle="Upload een mp3 om te beginnen"
          />
        );
      }
      return (
        <div className="library-list">
          {songs.map((song) => (
            <motion.button
              key={song.id}
              className="library-row"
              whileTap={{ scale: 0.98 }}
              onClick={() => playSongList(song, songs)}
            >
              <img
                src={song.cover}
                alt={song.title}
                className="library-row__cover"
              />
              <div className="library-row__info">
                <p className="library-row__title">{song.title}</p>
                <p className="library-row__subtitle">{song.artist}</p>
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    if (activeTab === "youtube") {
      if (youtubeSongs.length === 0) {
        return (
          <EmptyState
            title="Geen YouTube nummers"
            subtitle="Speel of bewaar YouTube nummers om ze hier te zien"
          />
        );
      }
      return (
        <div className="library-list">
          {youtubeSongs.map((song) => (
            <motion.button
              key={song.id}
              className="library-row"
              whileTap={{ scale: 0.98 }}
              onClick={() => playSongList(song, youtubeSongs)}
            >
              <img
                src={song.cover}
                alt={song.title}
                className="library-row__cover"
              />
              <div className="library-row__info">
                <p className="library-row__title">{song.title}</p>
                <p className="library-row__subtitle">{song.artist}</p>
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    // artists
    if (artists.length === 0) {
      return (
        <EmptyState
          title="Geen artiesten"
          subtitle="Artiesten verschijnen zodra je nummers toevoegt"
        />
      );
    }
    return (
      <div className="library-list">
        {artists.map((artist) => (
          <motion.button
            key={artist.id}
            className="library-row"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/artist/${artist.id}`)}
          >
            <img
              src={artist.img || artist.cover}
              alt={artist.name}
              className="library-row__cover library-row__cover--round"
            />
            <div className="library-row__info">
              <p className="library-row__title">{artist.name}</p>
              <p className="library-row__subtitle">Artiest</p>
            </div>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title">Jouw bibliotheek</h1>
        <motion.button
          className="library-add-btn"
          whileTap={{ scale: 0.9 }}
          onClick={() => setSheetOpen(true)}
          aria-label="Toevoegen"
        >
          <Plus size={26} strokeWidth={2} />
        </motion.button>
      </div>

      <div className="library-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`library-tab ${
              activeTab === tab.key ? "library-tab--active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderList()}

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="library-sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="library-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="library-sheet__handle" />
              {addOptions.map(({ icon: Icon, title, subtitle, onClick }) => (
                <button
                  key={title}
                  className="library-sheet__option"
                  onClick={() => {
                    setSheetOpen(false);
                    onClick();
                  }}
                >
                  <Icon size={24} strokeWidth={1.9} />
                  <div>
                    <div className="library-sheet__option-title">{title}</div>
                    <div className="library-sheet__option-subtitle">
                      {subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Library;
