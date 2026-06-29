import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import RecentlyPlayed from "../../components/RecentlyPlayed/RecentlyPlayed";
import Skeleton from "../../components/Skeleton/Skeleton";
import useLongPress from "../../hooks/useLongPress";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Settings } from "lucide-react";
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
  return <ArrowRight size={22} strokeWidth={2.5} />;
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
      popular,
      song.id,
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
      <div className="home-topbar">
        <h1 className="home-greeting">Goedemiddag</h1>
        <div className="home-topbar__actions">
          <button
            className="home-icon-btn"
            aria-label="Settings"
            onClick={() => navigate("/settings")}
          >
            <Settings size={24} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <div className="home-tiles">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="home-tile">
                <Skeleton width="56px" height="56px" borderRadius="0" />
                <Skeleton height="1rem" style={{ flex: 1, margin: "0 11px" }} />
              </div>
            ))
          : popular.slice(0, 6).map((song) => (
              <motion.button
                key={song.id}
                className="home-tile"
                whileTap={tapFeedback}
                onClick={() => handleSongClick(song)}
              >
                <img
                  className="home-tile__cover"
                  src={song.cover}
                  alt=""
                  onError={handleImgError}
                />
                <span className="home-tile__title">{song.title}</span>
              </motion.button>
            ))}
      </div>

      <RecentlyPlayed />

      <section className="home-carousel">
        <h2 className="home-carousel-title">Speciaal voor jou</h2>
        <div className="home-carousel__row">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="home-card">
                <Skeleton width="148px" height="148px" borderRadius="6px" />
                <Skeleton height="1rem" style={{ marginTop: "9px" }} />
              </div>
            ))
          ) : playlists.length > 0 ? (
            playlists.map((playlist) => (
              <motion.button
                key={playlist.id}
                className="home-card"
                whileTap={tapFeedback}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <img
                  className="home-card__cover"
                  src={playlist.cover}
                  alt=""
                  onError={handleImgError}
                />
                <div className="home-card__title">{playlist.title}</div>
                <div className="home-card__sub">Afspeellijst</div>
              </motion.button>
            ))
          ) : (
            <div className="home-card">
              <div className="home-card__cover home-card__cover--empty" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
