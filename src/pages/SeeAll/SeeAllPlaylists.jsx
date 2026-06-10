import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import "./SeeAll.css";

const playlists = [];

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function SeeAllPlaylists() {
  const { showOptions } = useModal();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const longPressProps = useLongPress(() => showOptions(menuOptions, (opt) => console.log(opt)));
  const tapFeedback = { scale: 0.98 };

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
            <motion.div
              key={playlist.id}
              className="playlist-card-full"
              {...longPressProps}
              whileTap={tapFeedback}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <img
                src={playlist.cover}
                alt={playlist.title}
                className="playlist-card-full__cover"
              />

              <div className="playlist-card-full__info">
                <p className="playlist-card-full__title">{playlist.title}</p>
                <p className="playlist-card-full__subtitle">24 songs</p>
              </div>
            </motion.div>
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
