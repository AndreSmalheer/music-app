import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import "./Search.css";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
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

const TAGS = ["All", "Songs", "Artists", "Playlists"];
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
                        navigate={() => handleOpenYoutubeArtist(artist)}
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
