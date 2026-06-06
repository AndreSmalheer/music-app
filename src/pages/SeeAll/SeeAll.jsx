import { useState } from "react";
import "./SeeAll.css";
import OptionsMenu from "../../components/OptionsMenu/OptionsMenu";

function SeeAll() {
  const [optionsOpen, setOptionsOpen] = useState(false);

  const menuOptions = [
    "Add to Playlist",
    "Go to Album",
    "View Artist",
    "Share Song",
  ];

  return (
    <div className="see-all-page">
      <h1 className="see-all-title">Recent Songs</h1>

      <div className="see-all-recent-songs-container">
        <div className="see-all-recent-song">
          <div className="see-all-recent-song-album-cover"></div>

          <div className="see-all-recent-song-song-info">
            <div className="see-all-recent-song-song-info-title">Title</div>
            <div className="see-all-recent-song-song-info-artists">Artist</div>
          </div>

          <div className="options-container-see-all" onClick={() => setOptionsOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="see-all-recent-song">
          <div className="see-all-recent-song-album-cover"></div>

          <div className="see-all-recent-song-song-info">
            <div className="see-all-recent-song-song-info-title">Title</div>
            <div className="see-all-recent-song-song-info-artists">Artist</div>
          </div>

          <div className="options-container-see-all" onClick={() => setOptionsOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="see-all-recent-song">
          <div className="see-all-recent-song-album-cover"></div>

          <div className="see-all-recent-song-song-info">
            <div className="see-all-recent-song-song-info-title">Title</div>
            <div className="see-all-recent-song-song-info-artists">Artist</div>
          </div>

          <div className="options-container-see-all" onClick={() => setOptionsOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <OptionsMenu
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={menuOptions}
        onOptionClick={(option) => console.log(option)}
      />
    </div>
  );
}

export default SeeAll;
