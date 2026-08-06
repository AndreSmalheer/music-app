import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import "./Search.css";
import { motion, AnimatePresence } from "framer-motion";
import useDelayedLoading from "../../hooks/useDelayedLoading";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import { search } from "../../services/api";
import SongItem from "../../components/items/SongItem";
import ArtistItem from "../../components/items/ArtistItems";

const TAGS = ["All", "Songs", "Artists", "Albums", "Playlists"];
const emptyResults = { topResults: [], songs: [], artists: [], albums: [], playlists: [] };

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

  // --- MusicBrainz Search ---
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
        const data = await search(q);
        setSearchResults(data);
      } catch (err) {
        console.error("MusicBrainz search failed:", err);
        setSearchResults(emptyResults);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset tag when search query changes
  useEffect(() => {
    setActiveTag("All");
  }, [query]);

  const handlePlaySong = (song) => {
    playSong(
      "",
      song.title,
      song.artist,
      song.cover || song.img || "",
      -1,
      null, // Resolved on-the-fly in playSong!
      searchResults.songs,
      song.id // MusicBrainz Recording ID
    );
    navigate("/now-playing");
  };

  const handleOpenArtist = (artist) => {
    navigate(`/artist/${artist.id}`);
  };

  const handleOpenAlbum = (album) => {
    navigate(`/album/${album.id}`);
  };

  const handleOpenPlaylist = (playlist) => {
    navigate(`/playlist/${playlist.id}`);
  };

  const hasResults =
    searchResults.topResults.length > 0 ||
    searchResults.songs.length > 0 ||
    searchResults.artists.length > 0 ||
    searchResults.albums.length > 0 ||
    searchResults.playlists.length > 0;

  // Filter lists based on tags
  const displayedSongs = activeTag === "All" ? searchResults.songs.slice(0, 4) : searchResults.songs;
  const displayedArtists = activeTag === "All" ? searchResults.artists.slice(0, 5) : searchResults.artists;
  const displayedAlbums = activeTag === "All" ? searchResults.albums.slice(0, 6) : searchResults.albums;
  const displayedPlaylists = activeTag === "All" ? searchResults.playlists.slice(0, 6) : searchResults.playlists;
  const topResult = searchResults.topResults[0];

  return (
    <div className="search-page">
      <h1 className="search-title">Zoeken</h1>

      <div className="search-field">
        <SearchIcon className="search-field__icon" size={21} strokeWidth={2.4} />
        <input
          className="search-container"
          placeholder="Artiesten, nummers of albums"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query.trim() ? (
        <motion.div className="genre-section" initial="hidden" animate="show" variants={container}>
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
                    borderTop: "4px solid var(--accent, #e8730f)",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                  }}
                />
                <h1>Searching MusicBrainz...</h1>
              </motion.div>
            ) : hasResults ? (
              <motion.div key={activeTag} variants={container} initial="hidden" animate="show" exit="hidden">
                {activeTag === "All" && searchResults.topResults.length > 0 && (
                  <motion.div variants={item} className="result-section top-result-section">
                    <h3>Top Result</h3>
                    <div className="top-result-container">
                      {topResult.type === "artist" ? (
                        <div
                          className="top-result-card top-result-artist"
                          onClick={() => handleOpenArtist(topResult)}
                        >
                          {topResult.img && (
                            <img
                              className="top-result-avatar top-result-avatar-image"
                              src={topResult.img}
                              alt={topResult.name}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                                event.currentTarget.nextElementSibling.style.display = "flex";
                              }}
                            />
                          )}
                          <div
                            className="top-result-avatar"
                            style={{ display: topResult.img ? "none" : "flex" }}
                          >
                            {topResult.name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                          </div>
                          <h2 className="top-result-name">{topResult.name}</h2>
                          <span className="top-result-type">Artist</span>
                        </div>
                      ) : (
                        <SongItem
                          song={searchResults.topResults[0]}
                          handlePlaySong={handlePlaySong}
                          showOptions={showOptions}
                          variant="card"
                        />
                      )}
                    </div>
                  </motion.div>
                )}

                {(activeTag === "All" || activeTag === "Songs") && displayedSongs.length > 0 && (
                  <motion.div variants={item} className="result-section result-songs">
                    <h3>Songs</h3>
                    <div className="songs-container">
                      {displayedSongs.map((song) => (
                        <SongItem
                          key={song.id}
                          song={song}
                          handlePlaySong={handlePlaySong}
                          showOptions={showOptions}
                          variant="search"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {(activeTag === "All" || activeTag === "Artists") && displayedArtists.length > 0 && (
                  <motion.div variants={item} className="result-section result-artists-section">
                    <h3>Artists</h3>
                    <div className="artists-container-result">
                      {displayedArtists.map((artist) => (
                        <ArtistItem
                          key={artist.id}
                          artist={artist}
                          navigate={() => handleOpenArtist(artist)}
                          showOptions={showOptions}
                          variant="artist"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {(activeTag === "All" || activeTag === "Albums") && displayedAlbums.length > 0 && (
                  <motion.div variants={item} className="result-section result-albums-section">
                    <h3>Albums</h3>
                    <div className="albums-grid">
                      {displayedAlbums.map((album) => (
                        <div key={album.id} className="album-search-card" onClick={() => handleOpenAlbum(album)}>
                          <div className="album-search-cover-wrap">
                            {album.cover && (
                              <img
                                src={album.cover}
                                alt={album.title}
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                          </div>
                          <h4 className="album-search-title">{album.title}</h4>
                          <p className="album-search-artist">{album.artist} &middot; {album.year}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {(activeTag === "All" || activeTag === "Playlists") && displayedPlaylists.length > 0 && (
                  <motion.div variants={item} className="result-section result-playlists-section">
                    <h3>Playlists</h3>
                    <div className="playlists-grid">
                      {displayedPlaylists.map((pl) => (
                        <div key={pl.id} className="playlist-search-card" onClick={() => handleOpenPlaylist(pl)}>
                          <div className="playlist-search-cover-wrap">
                            {pl.cover ? (
                              <img src={pl.cover} alt={pl.name} />
                            ) : (
                              <div className="playlist-search-cover-fallback" />
                            )}
                          </div>
                          <h4 className="playlist-search-title">{pl.name}</h4>
                          <p className="playlist-search-songs">{pl.songCount} songs</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="search-placeholder"
              >
                <h1>No results found</h1>
                <p>Try searching for artists, songs, or albums.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default Search;
