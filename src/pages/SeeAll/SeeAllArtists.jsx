import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import "./SeeAll.css";

const artists = [];

function SeeAllArtists() {
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
        <Skeleton width="150px" height="32px" style={{ marginBottom: "20px" }} />
        <div className="artists-list-full">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="artist-card-full-list" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Skeleton width="60px" height="60px" borderRadius="50%" />
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <Skeleton width="120px" height="20px" />
                <Skeleton width="80px" height="16px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="see-all-page">
      <h1 className="see-all-title">All Artists</h1>

      {artists.length > 0 ? (
        <div className="artists-list-full">
          {artists.map((artist) => (
            <motion.div
              key={artist.id}
              className="artist-card-full-list"
              {...longPressProps}
              whileTap={tapFeedback}
              onClick={() => navigate(`/artist/${artist.id}`)}
            >
              <img src={artist.img} alt={artist.name} className="artist-card-full-list__img" />
              <div className="artist-card-full-list__info">
                <p className="artist-card-full-list__name">{artist.name}</p>
                <p className="artist-card-full-list__subtitle">Artist</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No artists found"
          subtitle="It seems you haven't added any artists to your library yet."
        />
      )}
    </div>
  );
}

export default SeeAllArtists;
