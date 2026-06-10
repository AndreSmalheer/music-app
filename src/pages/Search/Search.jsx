import { motion } from "framer-motion";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import useLongPress from "../../hooks/useLongPress";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useModal } from "../../context/ModalContext";

const TAGS = ["All", "Songs", "Albums", "Artists", "Playlists"];
const searchResults = {
  topResults: [],
  songs: [],
  artists: [],
};

function Search() {
  const [activeTag, setActiveTag] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const navigate = useNavigate();

  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, (opt) => console.log(opt)),
  );
  const tapFeedback = { scale: 0.98 };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlaySong = (title, artist) => {
    playSong(
      "music/test.mp3",
      title,
      artist,
      "/indieblog-best-album-covers-2010s-07 4.png",
    );
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
      <input className="search-container" placeholder="type here..."></input>

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
                onClick={() => handlePlaySong(song.title, song.artist)}
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
    </div>
  );
}

export default Search;
