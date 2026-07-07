import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext, useCallback } from "react";
import useDelayedLoading from "../../hooks/useDelayedLoading";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, Music, ListMusic, DownloadCloud } from "lucide-react";
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
import { useDownload } from "../../context/DownloadContext";
import OptionsMenu from "../../components/OptionsMenu/OptionsMenu";

const TABS = [
  { key: "youtube", label: "YouTube" },
  { key: "artists", label: "Artiesten" },
  { key: "uploads", label: "Uploads" },
  { key: "playlists", label: "Afspeellijsten" },
];

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 550,
      damping: 36,
    },
  },
};

function Library() {
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();

  const [isLoading, setIsLoading] = useState(true);
  const showLoading = useDelayedLoading(isLoading, 150);
  const [activeTab, setActiveTab] = useState("youtube");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const { hasActiveDownloads, subscribeReplaced } = useDownload();

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

  // Re-fetch artists when the artists tab is opened so that
  // YouTube artists (created by playing YT songs) show up without a refresh.
  useEffect(() => {
    if (activeTab !== "artists") return;
    let active = true;
    (async () => {
      try {
        const ar = await getArtists();
        if (active) setArtists(ar);
      } catch (err) {
        console.error("Artiesten herladen mislukt:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeTab]);

  // When a YouTube song is replaced by a local download, update UI state instantly
  useEffect(() => {
    const unsubscribe = subscribeReplaced("*", ({ youtubeId, localSong }) => {
      // Remove the old YouTube song from the youtube list
      setYoutubeSongs((prev) =>
        prev.filter(
          (s) => s.youtubeId !== youtubeId && s.sourceYoutubeId !== youtubeId,
        ),
      );

      // Add the new local song to the uploads list (avoid duplicates)
      if (localSong) {
        setSongs((prev) => {
          const exists = prev.some((s) => s.id === localSong.id);
          return exists ? prev : [localSong, ...prev];
        });
      }

      // Re-fetch artists from backend so both the YouTube artist removal
      // and the local artist addition are reflected accurately.
      getArtists()
        .then((ar) => setArtists(ar))
        .catch(() => {});
    });

    return unsubscribe;
  }, [subscribeReplaced]);

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

  const handleAddOption = (option) => {
    switch (option.label) {
      case "Mp3 uploaden":
        console.log("Navigating to upload");
        navigate("/upload");
        break;

      case "YouTube toevoegen":
        navigate("/radio");
        break;

      case "Nieuwe afspeellijst":
        navigate("/create-playlist");
        break;
    }
  };

  const addOptions = [
    {
      label: "Mp3 uploaden",
      icon: Upload,
    },
    {
      label: "YouTube toevoegen",
      icon: Music,
    },
    {
      label: "Nieuwe afspeellijst",
      icon: ListMusic,
    },
  ];

  const renderList = () => {
    if (isLoading) {
      if (!showLoading) {
        return <div className="library-list" style={{ minHeight: "200px" }} />;
      }
      return (
        <motion.div
          className="library-list"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="library-row" key={i}>
              <Skeleton width="58px" height="58px" borderRadius="6px" />
              <div className="library-row__info">
                <Skeleton width="150px" height="15px" />
                <Skeleton width="100px" height="13px" />
              </div>
            </div>
          ))}
        </motion.div>
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
        <motion.div
          className="library-list"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {playlists.map((item) => (
            <motion.div key={item.id} variants={rowVariants}>
              <LibraryRow
                item={item}
                type="playlist"
                navigate={navigate}
                showOptions={showOptions}
              />
            </motion.div>
          ))}
        </motion.div>
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
        <motion.div
          className="library-list"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {songs.map((song) => (
            <motion.div key={song.id} variants={rowVariants}>
              <LibraryRow
                item={song}
                type="song"
                navigate={navigate}
                playSongList={(song) => playSongList(song, songs)}
                showOptions={showOptions}
                onDelete={handleDeleteSong}
              />
            </motion.div>
          ))}{" "}
        </motion.div>
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
        <motion.div
          className="library-list"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {youtubeSongs.map((song) => (
            <motion.div key={song.id} variants={rowVariants}>
              <LibraryRow
                item={song}
                type="youtube"
                navigate={navigate}
                playSongList={(song) => playSongList(song, youtubeSongs)}
                showOptions={showOptions}
              />
            </motion.div>
          ))}{" "}
        </motion.div>
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
      <motion.div
        className="library-list"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {artists.map((artist) => (
          <motion.div key={artist.id} variants={rowVariants}>
            <LibraryRow
              item={artist}
              type="artist"
              navigate={navigate}
              showOptions={showOptions}
            />
          </motion.div>
        ))}{" "}
      </motion.div>
    );
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title">Jouw bibliotheek</h1>
        <div className="library-header-actions">
          <motion.button
            className="library-icon-btn"
            style={{ position: "relative" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/downloads")}
            aria-label="Downloads"
          >
            <DownloadCloud
              size={20}
              strokeWidth={1.9}
              className={hasActiveDownloads ? "download-icon-pulse" : ""}
            />
            {hasActiveDownloads && <span className="download-badge-dot" />}
          </motion.button>
          <motion.button
            className="library-add-btn"
            whileTap={{ scale: 0.9 }}
            onClick={() => setSheetOpen(true)}
            aria-label="Toevoegen"
          >
            <Plus size={26} strokeWidth={2} />
          </motion.button>
        </div>
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

      <AnimatePresence mode="wait">
        <motion.div
          key={isLoading ? (showLoading ? "loading" : "delay") : activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.08,
            ease: "easeOut",
          }}
        >
          {renderList()}
        </motion.div>
      </AnimatePresence>

      <OptionsMenu
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        options={addOptions}
        onOptionClick={handleAddOption}
      />

      <ConfirmModal
        isOpen={!!songToDelete}
        onClose={() => setSongToDelete(null)}
        onConfirm={async () => {
          if (!songToDelete) return;
          try {
            console.log(
              "Attempting to delete song via backend API, ID:",
              songToDelete.id,
            );
            await deleteSong(songToDelete.id);
            console.log(
              "Successfully deleted song from backend database and storage.",
            );

            // Remove from local state immediately
            setSongs((prev) => prev.filter((s) => s.id !== songToDelete.id));
            setPlaylists((prev) =>
              prev.map((pl) => {
                const updatedSongs = pl.songs.filter(
                  (s) => (typeof s === "object" ? s.id : s) !== songToDelete.id,
                );
                return {
                  ...pl,
                  songs: updatedSongs,
                  songCount: updatedSongs.length,
                };
              }),
            );
            setArtists((prev) =>
              prev
                .map((art) => ({
                  ...art,
                  songs: art.songs.filter(
                    (s) =>
                      (typeof s === "object" ? s.id : s) !== songToDelete.id,
                  ),
                }))
                .filter((art) => art.songs.length > 0),
            );
          } catch (err) {
            console.error("Fout bij het verwijderen van nummer:", err);
            alert(`Fout bij het verwijderen: ${err.message || err}`);
          } finally {
            setSongToDelete(null);
          }
        }}
        message={
          songToDelete
            ? `Weet je zeker dat je "${songToDelete.title}" wilt verwijderen?`
            : ""
        }
      />
    </div>
  );
}

export default Library;
