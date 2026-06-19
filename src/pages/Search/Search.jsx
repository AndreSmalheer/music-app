import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import useLongPress from "../../hooks/useLongPress";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import {
  search as searchApi,
  addRecent,
} from "../../services/api";

const TAGS = ["All", "Songs", "Artists", "Playlists"];
const emptyResults = { topResults: [], songs: [], artists: [], youtube: [] };

function Search() {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(emptyResults);
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const navigate = useNavigate();
  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, (opt) => console.log(opt)),
  );
  const tapFeedback = { scale: 0.98 };

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
        const local = await searchApi(q);
        console.log(local);
        setSearchResults({
          topResults: [...local.songs.slice(0, 1)],
          songs: local.songs,
          artists: local.artists,
          youtube: [],
        });
      } catch (err) {
        console.error("Zoeken mislukt:", err);
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
    console.log(song);
    if (song.youtubeId) {
      console.log("Yt song");
    }

    console.log("local song");

    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
    );
    if (song.id && !song.youtubeId) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  const menuOptions = [
    "Add to Playlist",
    "Go to Album",
    "View Artist",
    "Share Song",
    "Sleep Timer",
  ];

  return (
    <div className="search-page">
      <input
        className="search-container"
        placeholder="type here..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!query.trim() ? (
        <div className="search-placeholder">
          <h1>Zoek naar iets</h1>
        </div>
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

          {isLoading ? (
            <div className="search-placeholder">
              <h1>Searching...</h1>
            </div>
          ) : searchResults.topResults.length === 0 &&
            searchResults.songs.length === 0 &&
            searchResults.artists.length === 0 &&
            searchResults.youtube.length === 0 ? (
            <div className="search-placeholder">
              <h1>No results found</h1>

              <button
                className="search-yt-button"
                onClick={() =>
                  navigate(`/radio?query=${encodeURIComponent(query)}`)
                }
              >
                Search on yt
              </button>
            </div>
          ) : (
            <>
              <div className="top-result result-section">
                <h3>Top Result</h3>

                <div className="result-container">
                  {searchResults.topResults.map((result) => (
                    <motion.div
                      key={result.id}
                      className="serach-result-album-cover"
                      {...longPressProps}
                      whileTap={tapFeedback}
                    >
                      <img
                        src={result.img}
                        alt={result.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {showSongs && (
                <div className="result-section result-songs">
                  <h3>Songs</h3>

                  <div className="songs-container">
                    {searchResults.songs.map((song) => (
                      <motion.div
                        key={song.id}
                        className="song"
                        {...longPressProps}
                        whileTap={tapFeedback}
                        onClick={() => handlePlaySong(song)}
                      >
                        <div className="album-cover-search-result">
                          <img
                            src={song.img}
                            alt={song.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        </div>

                        <div className="search-song-info">
                          <h2 className="search-song-title">{song.title}</h2>

                          <div className="search-song-artist">
                            {song.artist}
                          </div>
                        </div>

                        <div
                          className="options-container"
                          onClick={(e) => {
                            e.stopPropagation();
                            showOptions(menuOptions, (opt) => console.log(opt));
                          }}
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {showArtists && (
                <div className="result-section result-artist">
                  <h3 className="result-section-title">Artist</h3>

                  <div className="artists-container-result">
                    {searchResults.artists.map((artist) => (
                      <motion.div
                        key={artist.id}
                        className="result-artist"
                        {...longPressProps}
                        whileTap={tapFeedback}
                        onClick={() => navigate(`/artist/${artist.id}`)}
                      >
                        <div className="result-artist-img">
                          <img
                            src={artist.img}
                            alt={artist.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        </div>

                        <h3 className="result-artist-text">{artist.name}</h3>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Search;
