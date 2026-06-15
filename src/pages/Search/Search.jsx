import { motion } from "framer-motion";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import useLongPress from "../../hooks/useLongPress";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import { search as searchApi, searchYoutube, addRecent } from "../../services/api";

const TAGS = ["All", "Songs", "YouTube", "Artists", "Playlists"];
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

  // Debounced zoeken: 400ms na de laatste toetsaanslag.
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
        const [local, youtube] = await Promise.all([
          searchApi(q),
          searchYoutube(q),
        ]);
        setSearchResults({
          topResults: [...local.songs.slice(0, 1), ...youtube.slice(0, 1)],
          songs: local.songs,
          artists: local.artists,
          youtube,
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
  const showYoutube = activeTag === "All" || activeTag === "YouTube";

  const handlePlaySong = (song) => {
    playSong(song.src, song.title, song.artist, song.cover, -1, song.youtubeId || null);
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
      ></input>

      {!query.trim() ? (
        <div className="search-placeholder">
          <h1>Please search for something</h1>
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

          <div className="top-result result-section">
            <h3>Top Result</h3>

            {isLoading ? (
              <div className="result-container">
                <Skeleton width="100%" height="150px" borderRadius="12px" />
                <Skeleton width="100%" height="150px" borderRadius="12px" />
              </div>
            ) : searchResults.topResults.length > 0 ? (
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
            ) : (
              <EmptyState
                title="No results found"
                subtitle="Try searching for something else"
                alignLeft="true"
              />
            )}
          </div>

          {showSongs && (
            <div className="result-section result-songs">
              <h3>Songs</h3>

              <div className="songs-container">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="song"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "10px",
                      }}
                    >
                      <Skeleton width="50px" height="50px" borderRadius="6px" />
                      <div style={{ flex: 1 }}>
                        <Skeleton width="70%" height="1rem" />
                        <Skeleton
                          width="40%"
                          height="0.8rem"
                          style={{ marginTop: "0.5rem" }}
                        />
                      </div>
                    </div>
                  ))
                ) : searchResults.songs.length > 0 ? (
                  searchResults.songs.map((song) => (
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

                        <div className="search-song-artist">{song.artist}</div>
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
                  ))
                ) : (
                  <EmptyState
                    title="No songs found"
                    subtitle="Try searching for another song"
                    alignLeft="true"
                  />
                )}
              </div>
            </div>
          )}

          {showYoutube && (
            <div className="result-section result-songs">
              <h3>YouTube</h3>
              <div className="songs-container">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="song"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "10px",
                      }}
                    >
                      <Skeleton width="50px" height="50px" borderRadius="6px" />
                      <div style={{ flex: 1 }}>
                        <Skeleton width="70%" height="1rem" />
                        <Skeleton
                          width="40%"
                          height="0.8rem"
                          style={{ marginTop: "0.5rem" }}
                        />
                      </div>
                    </div>
                  ))
                ) : searchResults.youtube.length > 0 ? (
                  searchResults.youtube.map((song) => (
                    <motion.div
                      key={song.youtubeId}
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
                        <div className="search-song-artist">{song.artist}</div>
                      </div>
                      <div className="yt-badge">YT</div>
                    </motion.div>
                  ))
                ) : query.trim() ? (
                  <EmptyState
                    title="Geen YouTube resultaten"
                    subtitle="Probeer een andere zoekterm"
                    alignLeft="true"
                  />
                ) : null}
              </div>
            </div>
          )}

          {showArtists && (
            <div className="result-section result-artist">
              <h3 className="result-section-title">Artist</h3>

              <div className="artists-container-result">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="result-artist"
                      style={{ textAlign: "center" }}
                    >
                      <Skeleton
                        width="100px"
                        height="100px"
                        borderRadius="50%"
                        style={{ margin: "0 auto" }}
                      />
                      <Skeleton
                        width="60px"
                        height="1rem"
                        style={{ margin: "0.5rem auto" }}
                      />
                    </div>
                  ))
                ) : searchResults.artists.length > 0 ? (
                  searchResults.artists.map((artist) => (
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
                  ))
                ) : (
                  <div style={{ width: "100%" }}>
                    <EmptyState
                      title="No artists found"
                      subtitle="Try searching for another artist"
                      alignLeft="true"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Search;
