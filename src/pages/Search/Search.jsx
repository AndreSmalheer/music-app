import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";

function YoutubeIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
import "./Search.css";
import EmptyState from "../../components/EmptyState/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import useDelayedLoading from "../../hooks/useDelayedLoading";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import {
  search,
  searchYoutubePage,
  downloadFromYoutube,
  createYoutubeArtist,
  addRecent,
  prefetchBatchYoutubeAudio,
} from "../../services/api";
import SongItem from "../../components/items/SongItem";
import ArtistItem from "../../components/items/ArtistItems";

const TAGS = ["All", "Songs", "Artists"];
const emptyResults = { topResults: [], songs: [], artists: [], youtube: [] };

const GENRES = [
  { name: "Pop", color: "#c0392b" },
  { name: "Hiphop", color: "#16a085" },
  { name: "Dance", color: "#8e44ad" },
  { name: "Rock", color: "#2980b9" },
  { name: "Chill", color: "#d35400" },
  { name: "Indie", color: "#27ae60" },
  { name: "Klassiek", color: "#34495e" },
  { name: "Nederpop", color: "#c0398b" },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
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

// Which mode the search results are in
// "local"   — showing local DB results
// "youtube" — showing YouTube results (after user clicked the button)
// "none"    — no results from local, show the YT button

function Search() {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(emptyResults);
  const [isLoading, setIsLoading] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [resultMode, setResultMode] = useState("local"); // "local" | "youtube" | "none"
  const showLoading = useDelayedLoading(isLoading || ytLoading, 150);
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const navigate = useNavigate();
  const showTopResult = activeTag === "All";
  const showSongs = activeTag === "All" || activeTag === "Songs";
  const showArtists = activeTag === "All" || activeTag === "Artists";

  // --- Local search on every query change ---
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults(emptyResults);
      setResultMode("local");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setResultMode("local");

    const timer = setTimeout(async () => {
      try {
        const data = await search(q);

        if (
          data.songs.length === 0 &&
          data.artists.length === 0 &&
          data.playlists.length === 0
        ) {
          // No local results — surface the "Search on YouTube" prompt
          setSearchResults(emptyResults);
          setResultMode("none");
        } else {
          setSearchResults({
            topResults: data.songs.slice(0, 1),
            songs: data.songs,
            artists: data.artists,
            youtube: [],
          });
          setResultMode("local");
        }
      } catch (err) {
        console.error("Local search failed:", err);
        setSearchResults(emptyResults);
        setResultMode("none");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // --- YouTube search (triggered by the button) ---
  const handleSearchYoutube = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    setYtLoading(true);
    try {
      const page = await searchYoutubePage(q);
      const songs = page.results.filter((r) => r.type !== "youtube-artist");
      const artists = page.results.filter((r) => r.type === "youtube-artist");

      setSearchResults({
        topResults: songs.slice(0, 1),
        songs,
        artists,
        youtube: songs,
      });
      setResultMode("youtube");

      // Pre-warm the top results, keeping the loader alive until done
      const topIds = songs
        .slice(0, 4)
        .map((s) => s.youtubeId)
        .filter(Boolean);
      if (topIds.length > 0) {
        console.log(
          "[Search UI] 🚀 Pre-warming YouTube top results before showing:",
          topIds,
        );
        const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
        await Promise.race([prefetchBatchYoutubeAudio(topIds), timeout]);
        console.log(
          "[Search UI] ✅ Pre-warm done — showing YouTube results now",
        );
      }
    } catch (err) {
      console.error("YouTube search failed:", err);
    } finally {
      setYtLoading(false);
    }
  }, [query]);

  // --- Playback ---
  const handlePlaySong = (song) => {
    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
      searchResults.songs,
    );

    navigate("/now-playing");

    if (song.youtubeId) {
      setTimeout(() => {
        downloadFromYoutube({
          url: `https://www.youtube.com/watch?v=${song.youtubeId}`,
          title: song.title,
          artist: song.artist,
          thumbnail: song.cover,
        })
          .then((savedSong) => {
            if (savedSong?.id) addRecent(savedSong.id).catch(() => {});
          })
          .catch((err) => console.error("YouTube track opslaan mislukt:", err));
      }, 100);
    }
  };

  const handleOpenYoutubeArtist = async (artist) => {
    try {
      const savedArtist = await createYoutubeArtist({
        name: artist.name || artist.artist || artist.title,
        thumbnail: artist.cover || artist.img,
        youtubeChannelId: artist.youtubeChannelId,
      });
      navigate(`/artist/${savedArtist.id}`);
    } catch (err) {
      console.error("YouTube artiest openen mislukt:", err);
    }
  };

  const hasResults =
    searchResults.topResults.length > 0 ||
    searchResults.songs.length > 0 ||
    searchResults.artists.length > 0;

  return (
    <div className="search-page">
      <h1 className="search-title">Zoeken</h1>

      <div className="search-field">
        <SearchIcon
          className="search-field__icon"
          size={21}
          strokeWidth={2.4}
        />
        <input
          className="search-container"
          placeholder="Artiesten, nummers of afspeellijsten"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResultMode("local");
          }}
        />
      </div>

      {!query.trim() ? (
        <motion.div
          className="genre-section"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.h2 className="genre-section__title" variants={item}>
            Bladeren door alles
          </motion.h2>

          <motion.div className="genre-grid" variants={container}>
            {GENRES.map((genre) => (
              <motion.button
                key={genre.name}
                variants={item}
                whileTap={{ scale: 0.98 }}
                className="genre-tile"
                style={{ background: genre.color }}
                onClick={() => setQuery(genre.name)}
              >
                <span className="genre-tile__name">{genre.name}</span>
                <div className="genre-tile__deco" />
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <>
          <div className="tags-container">
            {TAGS.map((tag) => (
              <div
                key={tag}
                className={`tag ${activeTag === tag ? "active" : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                <h2>{tag}</h2>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {showLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="search-placeholder"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid rgba(255, 255, 255, 0.1)",
                    borderTop: "4px solid var(--accent, #1db954)",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                  }}
                />
                <h1>{ytLoading ? "Searching YouTube..." : "Searching..."}</h1>
              </motion.div>
            ) : resultMode === "none" ? (
              /* ── No local results: invite the user to search YouTube ── */
              <motion.div
                key="no-local-results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="search-placeholder"
              >
                <p className="no-results-label">No results in your library</p>
                <motion.button
                  className="yt-search-btn"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSearchYoutube}
                >
                  <YoutubeIcon size={18} />
                  Search on YouTube
                </motion.button>
              </motion.div>
            ) : hasResults ? (
              /* ── Results grid (local or YouTube) ── */
              <motion.div
                key={activeTag + resultMode}
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {showTopResult && (
                  <motion.div
                    variants={item}
                    className="top-result result-section"
                  >
                    <h3>Top Result</h3>
                    <div className="result-container">
                      {searchResults.topResults.map((song) => (
                        <SongItem
                          key={`top-${song.youtubeId || song.id}`}
                          song={song}
                          handlePlaySong={handlePlaySong}
                          showOptions={showOptions}
                          variant="card"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                {showSongs && searchResults.songs.length > 0 && (
                  <motion.div
                    variants={item}
                    className="result-section result-songs"
                  >
                    <h3>Songs</h3>
                    <div className="songs-container">
                      {searchResults.songs.map((song) => (
                        <SongItem
                          key={song.youtubeId || song.id}
                          song={song}
                          handlePlaySong={handlePlaySong}
                          showOptions={showOptions}
                          variant="search"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                {showArtists && searchResults.artists.length > 0 && (
                  <motion.div
                    variants={item}
                    className="result-section result-artist"
                  >
                    <h3 className="result-section-title">Artist</h3>
                    <div className="artists-container-result">
                      {searchResults.artists.map((artist) => (
                        <ArtistItem
                          key={artist.youtubeChannelId || artist.id}
                          artist={artist}
                          navigate={() => handleOpenYoutubeArtist(artist)}
                          showOptions={showOptions}
                          variant="artist"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default Search;
