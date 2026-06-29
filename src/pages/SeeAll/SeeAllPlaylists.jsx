import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import { getPlaylists } from "../../services/api";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { playPlaylistById } from "../../utils/playback";
import "./SeeAll.css";

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

// Eén playlist-kaart met eigen long-press menu (Open/Play/Shuffle).
function PlaylistCardFull({ playlist, navigate, showOptions, playSong }) {
  const menuOptions = ["Open", "Play", "Shuffle"];

  const playPlaylist = async (shuffle) => {
    try {
      await playPlaylistById(playlist.id, { playSong, navigate, shuffle });
    } catch (err) {
      console.error("Playlist afspelen mislukt:", err);
    }
  };

  const handleMenuOption = (option) => {
    switch (option) {
      case "Open":
        navigate(`/playlist/${playlist.id}`);
        break;
      case "Play":
        playPlaylist(false);
        break;
      case "Shuffle":
        playPlaylist(true);
        break;
      default:
        break;
    }
  };

  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, handleMenuOption),
  );

  return (
    <motion.div
      className="playlist-card-full"
      {...longPressProps}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <img
        src={playlist.cover}
        alt={playlist.title}
        className="playlist-card-full__cover"
      />

      <div className="playlist-card-full__info">
        <p className="playlist-card-full__title">{playlist.title}</p>
        <p className="playlist-card-full__subtitle">{playlist.songCount} songs</p>
      </div>
    </motion.div>
  );
}

function SeeAllPlaylists() {
  const { showOptions } = useModal();
  const { playSong } = useContext(PlayerContext);

  const [isLoading, setIsLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPlaylists();
        if (active) setPlaylists(data);
      } catch (err) {
        console.error("Playlists laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="see-all-page">
        <div className="see-all-header-row" style={{ marginBottom: "20px" }}>
          <Skeleton width="200px" height="32px" />
          <Skeleton width="32px" height="32px" borderRadius="8px" />
        </div>

        <div className="playlists-list-full">
       </div>
      </div>
    );
  }

  return (
    <div className="see-all-page">
      <div className="see-all-header-row">
        <h1 className="see-all-title">Your Playlists</h1>
        <motion.button
          className="btn-add-playlist"
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/create-playlist")}
        >
          <PlusIcon />
        </motion.button>
      </div>

      <div className="playlists-list-full">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <PlaylistCardFull
              key={playlist.id}
              playlist={playlist}
              navigate={navigate}
              showOptions={showOptions}
              playSong={playSong}
            />
          ))
        ) : (
          <EmptyState
            title="No playlists found"
            subtitle="Create your first playlist to get started"
          />
        )}
      </div>
    </div>
  );
}

export default SeeAllPlaylists;
