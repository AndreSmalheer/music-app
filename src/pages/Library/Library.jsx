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
  deleteSong,
} from "../../services/api";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import "./Library.css";
import LibraryRow from "../../components/items/LibraryRow";
import { useModal } from "../../context/ModalContext";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const TABS = [
  { key: "playlists", label: "Afspeellijsten" },
  { key: "uploads", label: "Uploads" },
  { key: "youtube", label: "YouTube" },
  { key: "artists", label: "Artiesten" },
];

function Library() {
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("playlists");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);

  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [youtubeSongs, setYoutubeSongs] = useState([]);
  const [artists, setArtists] = useState([]);

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

  const handleDeleteSong = (song) => {
    setSongToDelete(song);
  };

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
            <LibraryRow
              key={item.id}
              item={item}
              type="playlist"
              navigate={navigate}
              showOptions={showOptions}
            />
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
            <LibraryRow
              key={song.id}
              item={song}
              type="song"
              navigate={navigate}
              playSongList={(song) => playSongList(song, songs)}
              showOptions={showOptions}
              onDelete={handleDeleteSong}
            />
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
            <LibraryRow
              key={song.id}
              item={song}
              type="youtube"
              navigate={navigate}
              playSongList={(song) => playSongList(song, youtubeSongs)}
              showOptions={showOptions}
            />
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
          <LibraryRow
            key={artist.id}
            item={artist}
            type="artist"
            navigate={navigate}
            showOptions={showOptions}
          />
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

      <ConfirmModal
        isOpen={!!songToDelete}
        onClose={() => setSongToDelete(null)}
        onConfirm={async () => {
          if (!songToDelete) return;
          try {
            console.log("Attempting to delete song via backend API, ID:", songToDelete.id);
            await deleteSong(songToDelete.id);
            console.log("Successfully deleted song from backend database and storage.");

            // Remove from local state immediately
            setSongs((prev) => prev.filter((s) => s.id !== songToDelete.id));
            setPlaylists((prev) =>
              prev.map((pl) => {
                const updatedSongs = pl.songs.filter((s) => (typeof s === "object" ? s.id : s) !== songToDelete.id);
                return {
                  ...pl,
                  songs: updatedSongs,
                  songCount: updatedSongs.length,
                };
              })
            );
            setArtists((prev) =>
              prev
                .map((art) => ({
                  ...art,
                  songs: art.songs.filter((s) => (typeof s === "object" ? s.id : s) !== songToDelete.id),
                }))
                .filter((art) => art.songs.length > 0)
            );
          } catch (err) {
            console.error("Fout bij het verwijderen van nummer:", err);
            alert(`Fout bij het verwijderen: ${err.message || err}`);
          } finally {
            setSongToDelete(null);
          }
        }}
        message={songToDelete ? `Weet je zeker dat je "${songToDelete.title}" wilt verwijderen?` : ""}
      />
    </div>
  );
}

export default Library;
