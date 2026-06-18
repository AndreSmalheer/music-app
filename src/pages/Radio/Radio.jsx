import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RecentlyPlayed from "../../components/RecentlyPlayed/RecentlyPlayed";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { searchYoutube } from "../../services/api";
import "./Radio.css";

function Radio() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = useContext(PlayerContext);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const youtubeResults = await searchYoutube(q);
        setResults(youtubeResults);
      } catch (err) {
        console.error("YouTube search failed:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handlePlaySong = (song) => {
    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
    );
    navigate("/now-playing");
  };

  return (
    <div className="radio-page">
      <div className="radio-search-container">
        <input
          type="text"
          placeholder="Search YouTube..."
          className="radio-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query.trim() && <RecentlyPlayed />}

      <section className="radio-section">
        <div className="radio-section__header">
          <h2 className="radio-section__title">
            {query.trim() ? "Search Results" : "Recent YouTube Artists"}
          </h2>
        </div>

        <div className="radio-results-container">
          {isLoading ? (
            <p className="radio-searching-text">Searching...</p>
          ) : results.length > 0 ? (
            results.map((song) => (
              <div
                key={song.youtubeId}
                className="radio-song-item"
                onClick={() => handlePlaySong(song)}
              >
                <img src={song.img} alt={song.title} />
                <div className="info">
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
              </div>
            ))
          ) : query.trim() ? (
            <p>No results found.</p>
          ) : (
            <div className="radio-section__list"></div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Radio;
