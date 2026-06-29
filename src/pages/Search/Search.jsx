import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import "./Search.css";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";
import { search as searchApi, addRecent } from "../../services/api";
import SongItem from "../../components/items/SongItem";
import ArtistItem from "../../components/items/ArtistItems";

const TAGS = ["All", "Songs", "Artists", "Playlists"];
const emptyResults = { topResults: [], songs: [], artists: [], youtube: [] };

// Genre-tegels: klikken zoekt op de genrenaam via de bestaande zoekfunctie.
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

function Search() {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(emptyResults);
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const navigate = useNavigate();
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
    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
      searchResults.songs,
      song.id,
    );
    if (song.id && !song.youtubeId) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  return (
    <div className="search-page">
      <h1 className="search-title">Zoeken</h1>

      <div className="search-field">
        <SearchIcon className="search-field__icon" size={21} strokeWidth={2.4} />
        <input
          className="search-container"
          placeholder="Artiesten, nummers of afspeellijsten"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query.trim() ? (
        <div className="genre-section">
          <h2 className="genre-section__title">Bladeren door alles</h2>

          <div className="genre-grid">
            {GENRES.map((genre) => (
              <button
                key={genre.name}
                className="genre-tile"
                style={{ background: genre.color }}
                onClick={() => setQuery(genre.name)}
              >
                <span className="genre-tile__name">{genre.name}</span>
                <div className="genre-tile__deco" />
              </button>
            ))}
          </div>
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
                  {searchResults.topResults.map((song) => (
                    <SongItem
                      key={song.id}
                      song={song}
                      handlePlaySong={handlePlaySong}
                      showOptions={showOptions}
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {showSongs && (
                <div className="result-section result-songs">
                  <h3>Songs</h3>

                  <div className="songs-container">
                    {searchResults.songs.map((song) => (
                      <SongItem
                        key={song.id}
                        song={song}
                        handlePlaySong={handlePlaySong}
                        showOptions={showOptions}
                        variant="search"
                      />
                    ))}
                  </div>
                </div>
              )}

              {showArtists && (
                <div className="result-section result-artist">
                  <h3 className="result-section-title">Artist</h3>

                  <div className="artists-container-result">
                    {searchResults.artists.map((artist) => (
                      <ArtistItem
                        key={artist.id}
                        artist={artist}
                        navigate={navigate}
                        showOptions={showOptions}
                        variant="artist"
                      />
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
