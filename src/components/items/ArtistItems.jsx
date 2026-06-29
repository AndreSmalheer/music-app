import { motion } from "framer-motion";
import useLongPress from "../../hooks/useLongPress";

function ArtistItem({ artist, navigate, showOptions, variant = "home" }) {
  const menuOptions = ["Open Artist"];

  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, (option) => {
      switch (option) {
        case "Open Artist":
          navigate(`/artist/${artist.id}`);
          break;

        default:
          break;
      }
    }),
  );

  if (variant === "artist") {
    return (
      <motion.div
        className="radio-song-item artist"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/artist/${artist.id}`)}
      >
        <img src={artist.img || "/covers/test-cover.jpg"} alt={artist.name} />

        <div className="info">
          <h3>{artist.name}</h3>
          <p>YouTube Artist</p>
        </div>
      </motion.div>
    );
  }

  if (variant === "list") {
    return (
      <motion.div
        className="artist-card-full-list"
        {...longPressProps}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/artist/${artist.id}`)}
      >
        <img
          src={artist.img || "/covers/test-cover.jpg"}
          alt={artist.name}
          className="artist-card-full-list__img"
        />

        <div className="artist-card-full-list__info">
          <p className="artist-card-full-list__name">{artist.name}</p>

          <p className="artist-card-full-list__subtitle">Artist</p>
        </div>
      </motion.div>
    );
  }

  // home variant

  return (
    <motion.div
      className="artist-card"
      {...longPressProps}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <img
        src={artist.img || "/covers/test-cover.jpg"}
        alt={artist.name}
        className="artist-card__img"
        loading="lazy"
      />

      <p className="artist-card__name">{artist.name}</p>
    </motion.div>
  );
}

export default ArtistItem;
