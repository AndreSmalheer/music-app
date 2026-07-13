import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import "./Search.css";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import useDelayedLoading from "../../hooks/useDelayedLoading";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import {
  searchYoutubePage,
  downloadFromYoutube,
  createYoutubeArtist,
  addRecent,
} from "../../services/api";
import SongItem from "../../components/items/SongItem";
import ArtistItem from "../../components/items/ArtistItems";

const TAGS = ["All", "Songs", "Artists"];
const emptyResults = { topResults: [], songs: [], artists: [], youtube: [] };

// Genre-tegels: klikken vult de zoekterm met de genrenaam; de pagina zoekt
// daarmee direct op YouTube (zelfde flow als typen).
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

function Search() {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(emptyResults);
  const [isLoading, setIsLoading] = useState(false);
  const showLoading = useDelayedLoading(isLoading, 150);
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const navigate = useNavigate();
  const tapFeedback = { scale: 0.98 };
  const showTopResult = activeTag === "All";

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults(emptyResults);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Direct op YouTube zoeken — geen lokale DB-zoek meer die "geen
        // resultaat" gaf. Resultaten zijn een mix van video's en kanalen.
        const page = await searchYoutubePage(q);
        const songs = page.results.filter((r) => r.type !== "youtube-artist");
        const artists = page.results.filter((r) => r.type === "youtube-artist");
        setSearchResults({
          topResults: songs.slice(0, 1),
          songs,
          artists,
          youtube: songs,
        });
      } catch (err) {
        console.error("YouTube zoeken mislukt:", err);
        setSearchResults(emptyResults);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const showSongs = activeTag === "All" || activeTag === "Songs";
  const showArtists = activeTag === "All" || activeTag === "Artists";

  const handlePlaySong = (song) => {
    // Speel direct via streaming; metadata opslaan gebeurt op de achtergrond.
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
  };

  // YouTube-kanaal eerst in de DB opslaan, dan de artiestpagina openen.
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
          onChange={(e) => setQuery(e.target.value)}
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
                <h1>Searching...</h1>
              </motion.div>
            ) : searchResults.topResults.length === 0 &&
              searchResults.songs.length === 0 &&
              searchResults.artists.length === 0 &&
              searchResults.youtube.length === 0 ? (
              isLoading ? (
                <motion.div
                  key="delay-placeholder"
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ minHeight: "200px" }}
                />
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="search-placeholder"
                >
                  <h1>No results found</h1>
                </motion.div>
              )
            ) : (
              <motion.div
                key={activeTag}
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {" "}
                {showTopResult && (
                  <motion.div
                    variants={item}
                    className="top-result result-section"
                  >
                    <h3>Top Result</h3>

                    <div className="result-container">
                      {searchResults.topResults.map((song) => (
                        <SongItem
                          key={`top-${song.youtubeId}`}
                          song={song}
                          handlePlaySong={handlePlaySong}
                          showOptions={showOptions}
                          variant="card"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                {showSongs && (
                  <motion.div
                    variants={item}
                    className="result-section result-songs"
                  >
                    <h3>Songs</h3>

                    <div className="songs-container">
                      {searchResults.songs.map((song) => (
                        <SongItem
                          key={song.youtubeId}
                          song={song}
                          handlePlaySong={handlePlaySong}
                          showOptions={showOptions}
                          variant="search"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                {showArtists && (
                  <motion.div
                    variants={item}
                    className="result-section result-artist"
                  >
                    <h3 className="result-section-title">Artist</h3>

                    <div className="artists-container-result">
                      {searchResults.artists.map((artist) => (
                        <ArtistItem
                          key={artist.youtubeChannelId}
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
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default Search;
