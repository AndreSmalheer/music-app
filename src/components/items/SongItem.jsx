import { motion } from "framer-motion";
import useLongPress from "../../hooks/useLongPress";

function SongItem({ song, handlePlaySong, showOptions, variant = "list" }) {
  const menuOptions = ["Play", "Add to Playlist"];

  const handleMenuOption = (option) => {
    switch (option) {
      case "Play":
        handlePlaySong(song);

        break;

      case "Add to Playlist":
        setTimeout(() => {
          showOptions(
            ["Test playlist 1", "Test playlist 2"],

            (playlist) => {
              console.log("Add track:", song.title, "to", playlist);
            },
          );
        }, 100);

        break;

      default:
        console.log(option, song);

        break;
    }
  };

  const longPressProps = useLongPress(() =>
    showOptions(menuOptions, handleMenuOption),
  );

  // CARD STYLE
  if (variant === "card") {
    return (
      <motion.div
        className="track-card"
        {...longPressProps}
        whileTap={{
          scale: 0.98,
        }}
        onClick={() => handlePlaySong(song)}
      >
        <motion.img
          className="track-card__cover"
          src={song.cover || song.img}
          alt={song.title}
          layoutId={`cover-${song.id}`}
        />

        <p className="track-card__title">{song.title}</p>
      </motion.div>
    );
  }

  // SEARCH STYLE
  if (variant === "search") {
    return (
      <motion.div
        className="song"
        {...longPressProps}
        whileTap={{
          scale: 0.98,
        }}
        onClick={() => handlePlaySong(song)}
      >
        <div className="album-cover-search-result">
          <img
            src={song.img || song.cover}
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
      </motion.div>
    );
  }

  // DEFAULT LIST STYLE

  return (
    <motion.div
      className="see-all-recent-song"
      {...longPressProps}
      whileTap={{
        scale: 0.98,
      }}
      onClick={() => handlePlaySong(song)}
    >
      <div className="see-all-recent-song-album-cover">
        <img
          src={song.cover}
          alt={song.title}
          style={{
            width: "100%",

            height: "100%",

            objectFit: "cover",

            borderRadius: "6px",
          }}
        />
      </div>

      <div className="see-all-recent-song-song-info">
        <div className="see-all-recent-song-song-info-title">{song.title}</div>

        <div className="see-all-recent-song-song-info-artists">
          {song.artist}
        </div>
      </div>
    </motion.div>
  );
}

export default SongItem;
