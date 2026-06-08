import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import "./ArtistDetail.css";

const topTracks = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  title: `Popular Track ${i + 1}`,
  artist: "Artist Name",
  duration: "3:45",
  cover: "/indieblog-best-album-covers-2010s-07 4.png",
}));

const albums = [
  { id: 1, title: "The Masterpiece", year: "2024", cover: "/covers/test-cover.jpg" },
  { id: 2, title: "Echoes of Silence", year: "2022", cover: "/indieblog-best-album-covers-2010s-07 4.png" },
  { id: 3, title: "Midnight City", year: "2021", cover: "/covers/test-cover.jpg" },
  { id: 4, title: "Neon Nights", year: "2019", cover: "/indieblog-best-album-covers-2010s-07 4.png" },
];

function ArtistDetail() {
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const longPressProps = useLongPress(() => showOptions(["Go to Radio", "Share", "Add to Playlist", "Report"], (opt) => console.log(opt)));
  const tapFeedback = { scale: 0.98 };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlaySong = (song) => {
    playSong("music/test.mp3", song.title, song.artist, song.cover);
    navigate("/now-playing");
  };

  return (
    <div className="artist-detail-page">
      {isLoading ? (
        <div className="artist-hero">
          <Skeleton height="300px" borderRadius="0" />
          <div className="artist-hero-overlay">
            <Skeleton width="60%" height="2rem" />
            <Skeleton width="40%" height="1rem" style={{ marginTop: "0.5rem" }} />
          </div>
        </div>
      ) : (
        <div className="artist-hero">
          <img
            src="/covers/test-cover.jpg"
            alt="Artist Profile"
            className="artist-hero-img"
          />
          <div className="artist-hero-overlay">
            <h1 className="artist-hero-name">Artist Name</h1>
            <p className="artist-hero-listeners">1,234,567 Monthly Listeners</p>
          </div>
        </div>
      )}

      <div className="artist-content">
        <div className="artist-main-actions">
          <motion.button
            className="btn-artist-play"
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlaySong(topTracks[0])}
          >
            Play
          </motion.button>
          <motion.button
            className="btn-artist-shuffle"
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlaySong(topTracks[0])}
          >
            Shuffle
          </motion.button>
        </div>

        <section className="artist-section">
          <h2 className="artist-section-title">Popular</h2>
          <div className="top-tracks-list">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="artist-song-row" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Skeleton width="20px" height="20px" />
                    <Skeleton width="50px" height="50px" />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="80%" />
                    </div>
                    <Skeleton width="40px" />
                  </div>
                ))
              : topTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    className="artist-song-row"
                    {...longPressProps}
                    whileTap={tapFeedback}
                    onClick={() => handlePlaySong(track)}
                  >
                    <span className="artist-song-index">{index + 1}</span>
                    <img src={track.cover} alt="" className="artist-song-cover" />
                    <div className="artist-song-info">
                      <p className="artist-song-title">{track.title}</p>
                    </div>
                    <span className="artist-song-duration">{track.duration}</span>
                  </motion.div>
                ))}
          </div>
        </section>

        <section className="artist-section">
          <h2 className="artist-section-title">Discography</h2>
          <div className="artist-albums-row">
            {albums.map((album) => (
              <motion.div
                key={album.id}
                className="artist-album-card"
                whileTap={{ scale: 0.95 }}
              >
                <img src={album.cover} alt={album.title} className="artist-album-cover-img" />
                <p className="artist-album-title">{album.title}</p>
                <p className="artist-album-year">{album.year}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="artist-section about-section">
          <h2 className="artist-section-title">About</h2>
          <div className="artist-bio-card">
            <p>Artist Name is a multi-platinum award winning artist known for their innovative sound and captivating performances. This visual bio section explains their journey through the music industry.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ArtistDetail;
