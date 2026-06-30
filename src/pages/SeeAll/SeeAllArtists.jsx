import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import ArtistItem from "../../components/items/ArtistItems";
import { getArtists } from "../../services/api";
import { ChevronLeft } from "lucide-react";
import "./SeeAll.css";

function SeeAllArtists() {
  const { showOptions } = useModal();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getArtists();

        if (active) {
          setArtists(data);
        }
      } catch (err) {
        console.error("Artiesten laden mislukt:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="see-all-page">
        <div className="see-all-header">
          <Skeleton width="160px" height="28px" />
        </div>

        <div className="artists-list-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="artist-card-full-list"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Skeleton width="60px" height="60px" borderRadius="50%" />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
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
      <div className="see-all-header">
        <h1 className="see-all-title">Alle artiesten</h1>
      </div>

      {artists.length > 0 ? (
        <div className="artists-list-full">
          {artists.map((artist) => (
            <ArtistItem
              key={artist.id}
              artist={artist}
              navigate={navigate}
              showOptions={showOptions}
              variant="list"
            />
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
