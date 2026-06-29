import { motion } from "framer-motion";
import useLongPress from "../../hooks/useLongPress";
import {
  addSongToPlaylist,
  getPlaylists,
  removeSongFromPlaylist,
} from "../../services/api";
import { gradientFor } from "../../data/placeholderContent";

function SongItem({ song, handlePlaySong, showOptions, variant = "list" }) {
  const menuOptions = ["Play", "Add to Playlist"];

  const showPlaylistOptions = async () => {
    try {
      const playlists = await getPlaylists();
      const options = playlists.map((playlist) => ({
        id: playlist.id,
        label: playlist.title,
      }));

      showOptions(
        options.length > 0
          ? options
          : [{ id: "no-playlists", label: "No playlists found" }],
        async (playlist) => {
          if (playlist.id === "no-playlists") return;
          await addSongToPlaylist(playlist.id, song.id);
        },
      );
    } catch (err) {
      console.error("Playlists laden mislukt:", err);
    }
  };

  const handleMenuOption = (option) => {
    switch (option) {
      case "Play":
        handlePlaySong(song);

        break;

      case "Add to Playlist":
        setTimeout(showPlaylistOptions, 100);

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
    const cover = song.cover || song.img;
    return (
      <motion.div
        className="track-card"
        {...longPressProps}
        whileTap={{
          scale: 0.98,
        }}
        onClick={() => handlePlaySong(song)}
      >
        {cover ? (
          <motion.img
            className="track-card__cover"
            src={cover}
            alt={song.title}
            layoutId={`cover-${song.id}`}
            onError={(e) => {
              // Val terug op de gradient als de afbeelding niet laadt.
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.style.setProperty(
                "display",
                "block",
              );
            }}
          />
        ) : null}

        <div
          className="track-card__cover track-card__fallback"
          style={{
            background: song.gradient || gradientFor(song.title || song.id),
            display: cover ? "none" : "block",
          }}
        />

        <p className="track-card__title">{song.title}</p>
        {song.artist ? (
          <p className="track-card__artist">{song.artist}</p>
        ) : null}
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
