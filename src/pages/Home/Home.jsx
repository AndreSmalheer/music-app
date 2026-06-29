import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import RecentlyPlayed from "../../components/RecentlyPlayed/RecentlyPlayed";
import Skeleton from "../../components/Skeleton/Skeleton";
import useLongPress from "../../hooks/useLongPress";
import { motion } from "framer-motion";
import {
  getArtists,
  getPlaylists,
  getSongs,
  addRecent,
} from "../../services/api";
import "./Home.css";
import ArtistItem from "../../components/items/ArtistItems";
import { useModal } from "../../context/ModalContext";
import SongItem from "../../components/items/SongItem";
import PlaylistItem from "../../components/items/PlaylistItem";

// Husselt een array (Fisher-Yates) zodat we elke keer een andere selectie
// "populaire" nummers kunnen tonen.
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ArrowBtn() {
  return (
    <svg
      width="1586"
      height="1107"
      viewBox="0 0 1586 1107"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1586 553.049C1585.45 504.481 1561.43 458.046 1519.16 423.806L1033.17 26.845C1011.94 9.65095 983.228 0 953.299 0C923.371 0 894.658 9.65095 873.433 26.845C862.815 35.427 854.387 45.6373 848.636 56.8869C842.884 68.1365 839.923 80.2028 839.923 92.3897C839.923 104.577 842.884 116.643 848.636 127.892C854.387 139.142 862.815 149.352 873.433 157.934L1246.14 460.733H113.286C83.2405 460.733 54.4258 470.459 33.1806 487.771C11.9354 505.084 0 528.565 0 553.049C0 577.533 11.9354 601.014 33.1806 618.327C54.4258 635.639 83.2405 645.366 113.286 645.366H1246.14L873.433 949.087C852.101 966.348 840.057 989.808 839.951 1014.31C839.844 1038.8 851.685 1062.33 872.866 1079.71C894.048 1097.1 922.837 1106.91 952.899 1107C982.961 1107.09 1011.83 1097.44 1033.17 1080.18L1519.16 683.215C1561.71 648.749 1585.75 601.938 1586 553.049Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [popular, setPopular] = useState([]);
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const navigate = useNavigate();

  const menuOptions = ["Play", "Add to Library", "Share"];
  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, (option) => console.log(option)),
  );
  const tapFeedback = { scale: 0.98 };

  const handleSongClick = (song) => {
    playSong(
      song.src,
      song.title,
      song.artist,
      song.cover,
      -1,
      song.youtubeId || null,
    );
    if (song.id) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  const handleImgError = (e) => {
    e.currentTarget.style.visibility = "hidden";
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [artistsData, playlistsData, songsData] = await Promise.all([
          getArtists(),
          getPlaylists(),
          getSongs(),
        ]);
        if (!active) return;
        setPlaylists(playlistsData);
        setArtists(shuffle(artistsData).slice(0, 6));
        setPopular(shuffle(songsData).slice(0, 6));
      } catch (err) {
        console.error("Home laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home-page">
      <RecentlyPlayed />

      <section className="home-section">
        <div className="home-section__header">
          <h2 className="home-section__title">Popular nummers</h2>
        </div>

        <div className="popular-list">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="track-card">
                <Skeleton height="110px" borderRadius="11px" />

                <Skeleton
                  height="1rem"
                  style={{
                    marginTop: "10px",
                  }}
                />
              </div>
            ))
          ) : popular.length > 0 ? (
            popular.map((song) => (
              <SongItem
                key={song.id}
                song={song}
                handlePlaySong={handleSongClick}
                showOptions={showOptions}
                variant="card"
              />
            ))
          ) : (
            <div className="empty-track-card">
              <div className="empty-track-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <h2 className="home-section__title">Popular artiesten</h2>
          <button
            className="recently-played__arrow"
            aria-label="See all artists"
            onClick={() => navigate("/see-all-artists")}
          >
            <ArrowBtn />
          </button>
        </div>

        <div className="home-section__list">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="artist-card">
                <Skeleton width="85px" height="85px" borderRadius="50%" />
                <Skeleton
                  height="1rem"
                  style={{ marginTop: "10px", width: "60px" }}
                />
              </div>
            ))
          ) : artists.length > 0 ? (
            artists.map((artist) => (
              <ArtistItem
                key={artist.id}
                artist={artist}
                navigate={navigate}
                showOptions={showOptions}
                variant="home"
              />
            ))
          ) : (
            <div className="empty-artist-card">
              <div className="empty-artist-img" />
            </div>
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <h2 className="home-section__title">Your Playlists</h2>
          <button
            className="recently-played__arrow"
            aria-label="See all playlists"
            onClick={() => navigate("/see-all-playlists")}
          >
            <ArrowBtn />
          </button>
        </div>
        <div className="playlist-row">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="playlist-card" style={{ padding: "0" }}>
                <Skeleton width="56px" height="56px" borderRadius="0" />
                <Skeleton height="1rem" style={{ flex: 1, margin: "0 10px" }} />
              </div>
            ))
          ) : playlists.length > 0 ? (
            playlists.map((playlist) => (
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                navigate={navigate}
                showOptions={showOptions}
                variant="home"
              />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="empty-playlist-card" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
