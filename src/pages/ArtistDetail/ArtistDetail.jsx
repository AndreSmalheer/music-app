import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import {
  getArtist,
  addRecent,
  downloadFromYoutube,
  searchYoutubePage,
} from "../../services/api";
import "./ArtistDetail.css";

const albums = [
  {
    id: 1,
    title: "The Masterpiece",
    year: "2024",
    cover: "/covers/test-cover.jpg",
  },
  {
    id: 2,
    title: "Echoes of Silence",
    year: "2022",
    cover: "/indieblog-best-album-covers-2010s-07 4.png",
  },
  {
    id: 3,
    title: "Midnight City",
    year: "2021",
    cover: "/covers/test-cover.jpg",
  },
  {
    id: 4,
    title: "Neon Nights",
    year: "2019",
    cover: "/indieblog-best-album-covers-2010s-07 4.png",
  },
];

function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const longPressProps = useLongPress(() =>
    showOptions(["Go to Radio", "Share", "Add to Playlist", "Report"], (opt) =>
      console.log(opt),
    ),
  );
  const tapFeedback = { scale: 0.98 };

  const shuffleTracks = (tracks) => {
    const shuffled = [...tracks];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const random = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[random]] = [shuffled[random], shuffled[i]];
    }

    return shuffled;
  };

  const handleShuffle = () => {
    const shuffled = [...topTracks].sort(() => Math.random() - 0.5);

    playSong(
      shuffled[0].src,
      shuffled[0].title,
      shuffled[0].artist,
      shuffled[0].cover,
      -1,
      shuffled[0].youtubeId || null,
      shuffled,
    );

    navigate("/now-playing");
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getArtist(id);
        if (!active) return;
        setArtist(data);

        if (data?.isYoutubeArtist) {
          const youtubePage = await searchYoutubePage(data.name);
          if (!active) return;
          setTopTracks(
            youtubePage.results.filter((track) => track.type === "youtube"),
          );
          setNextPageToken(youtubePage.nextPageToken);
        } else {
          setTopTracks(data?.songs || []);
          setNextPageToken(null);
        }
      } catch (err) {
        console.error("Artiest laden mislukt:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handlePlaySong = async (song) => {
    if (!song) return;

    if (song.type === "youtube" && song.youtubeId) {
      try {
        const savedSong = await downloadFromYoutube({
          url: `https://www.youtube.com/watch?v=${song.youtubeId}`,
          title: song.title,
          artist: song.artist,
          thumbnail: song.cover,
        });

        playSong(
          savedSong.src,
          savedSong.title,
          savedSong.artist,
          savedSong.cover,
          -1,
          savedSong.youtubeId || null,
        );

        if (savedSong.id) addRecent(savedSong.id).catch(() => {});
        navigate("/now-playing");
      } catch (err) {
        console.error("YouTube track opslaan mislukt:", err);
      }

      return;
    }

    playSong(song.src, song.title, song.artist, song.cover, -1, null);
    if (song.id) addRecent(song.id).catch(() => {});
    navigate("/now-playing");
  };

  const handleShowMore = async () => {
    if (!artist?.isYoutubeArtist || !nextPageToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const youtubePage = await searchYoutubePage(artist.name, nextPageToken);
      setTopTracks((currentTracks) => [
        ...currentTracks,
        ...youtubePage.results.filter((track) => track.type === "youtube"),
      ]);
      setNextPageToken(youtubePage.nextPageToken);
    } catch (err) {
      console.error("Meer YouTube tracks laden mislukt:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="artist-detail-page">
      {isLoading ? (
        <div className="artist-hero">
          <Skeleton height="300px" borderRadius="0" />
          <div className="artist-hero-overlay">
            <Skeleton width="60%" height="2rem" />
            <Skeleton
              width="40%"
              height="1rem"
              style={{ marginTop: "0.5rem" }}
            />
          </div>
        </div>
      ) : (
        <div className="artist-hero">
          <img
            src={artist?.img || "/covers/test-cover.jpg"}
            alt="Artist Profile"
            className="artist-hero-img"
          />
          <div className="artist-hero-overlay">
            <h1 className="artist-hero-name">{artist?.name || "Artist"}</h1>
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
            onClick={handleShuffle}
          >
            Shuffle
          </motion.button>
        </div>

        <section className="artist-section">
          <h2 className="artist-section-title">Nummers</h2>
          <div className="top-tracks-list">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="artist-song-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
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
                    <img
                      src={track.cover}
                      alt=""
                      className="artist-song-cover"
                    />
                    <div className="artist-song-info">
                      <p className="artist-song-title">{track.title}</p>
                    </div>
                    <span className="artist-song-duration">
                      {track.durationLabel}
                    </span>
                  </motion.div>
                ))}
          </div>
          {artist?.isYoutubeArtist && nextPageToken && (
            <button
              className="artist-show-more-btn"
              onClick={handleShowMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Show More"}
            </button>
          )}
        </section>

        {/* <section className="artist-section">
          <h2 className="artist-section-title">Discography</h2>
          <div className="artist-albums-row">
            {albums.map((album) => (
              <motion.div
                key={album.id}
                className="artist-album-card"
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={album.cover}
                  alt={album.title}
                  className="artist-album-cover-img"
                />
                <p className="artist-album-title">{album.title}</p>
                <p className="artist-album-year">{album.year}</p>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* <section className="artist-section about-section">
          <h2 className="artist-section-title">About</h2>
          <div className="artist-bio-card">
            <p>
              Artist Name is a multi-platinum award winning artist known for
              their innovative sound and captivating performances. This visual
              bio section explains their journey through the music industry.
            </p>
          </div>
        </section> */}
      </div>
    </div>
  );
}

export default ArtistDetail;
