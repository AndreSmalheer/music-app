import { useState } from "react";
import "./Search.css";
import OptionsMenu from "../../components/OptionsMenu/OptionsMenu";

const TAGS = ["All", "Songs", "Albums", "Artists", "Playlists"];

function Search() {
  const [activeTag, setActiveTag] = useState("All");
  const [optionsOpen, setOptionsOpen] = useState(false);

  const menuOptions = [
    "Add to Playlist",
    "Go to Album",
    "View Artist",
    "Share Song",
    "Sleep Timer",
  ];

  return (
    <>
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

          <div className="result-container">
            <div className="serach-result-album-cover"></div>

            <div className="serach-result-album-cover"></div>
          </div>
        </div>

        <div className="result-section result-songs">
          <h3>Songs</h3>

          <div className="songs-container">
            <div className="song">
              <div className="album-cover-search-result"></div>

              <div className="search-song-info">
                <h2 className="search-song-title">Title</h2>

                <div className="search-song-artist">Artist</div>
              </div>

              <div
                className="options-container"
                onClick={() => setOptionsOpen(true)}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="song">
              <div className="album-cover-search-result"></div>

              <div className="search-song-info">
                <h2 className="search-song-title">Title</h2>

                <div className="search-song-artist">Artist</div>
              </div>

              <div
                className="options-container"
                onClick={() => setOptionsOpen(true)}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="result-section result-artist">
          <h3 className="result-section-title">Artist</h3>

          <div className="artists-container-result">
            <div className="result-artist">
              <div className="result-artist-img"></div>

              <h3 className="result-artist-text">Artist</h3>
            </div>

            <div className="result-artist">
              <div className="result-artist-img"></div>

              <h3 className="result-artist-text">Artist</h3>
            </div>
          </div>
        </div>
      </div>

      <OptionsMenu
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={menuOptions}
        onOptionClick={(option) => console.log(option)}
      />
    </>
  );
}

export default Search;
