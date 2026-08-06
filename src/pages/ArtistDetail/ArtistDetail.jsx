import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import useLongPress from "../../hooks/useLongPress";
import { useModal } from "../../context/ModalContext";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { ChevronLeft, Play, Shuffle, Music } from "lucide-react";
import {
  getArtist,
  searchYoutubePage,
} from "../../services/api";
import "./ArtistDetail.css";

const rowVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

function ArtistCoverFallback({ name }) {
  const initials = (name || "?")
    .split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div className="artist-hero-fallback">
      <span>{initials}</span>
    </div>
  );
}

function AlbumCard({ album, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      className="artist-album-card"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      <div className="artist-album-cover-wrap">
        {!imgError ? (
          <img
            src={album.cover}
            alt={album.title}
            className="artist-album-cover-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="artist-album-cover-fallback">
            <Music size={24} />
          </div>
        )}
      </div>
      <p className="artist-album-title">{album.title}</p>
      <p className="artist-album-year">{album.year}</p>
    </motion.div>
  );
}

function ShowMoreButton({ expanded, total, onClick }) {
  return (
    <motion.button
      type="button"
      className="artist-show-more-btn"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      {expanded ? "Show less" : `Show all (${total})`}
    </motion.button>
  );
}

function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const { showOptions } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [bioExpanded, setBioExpanded] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const longPressProps = useLongPress(() =>
    showOptions(["Share", "Add to Playlist"], (opt) => console.log(opt)),
  );
  const tapFeedback = { scale: 0.98 };

  const isMbId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    (async () => {
      try {
        const data = await getArtist(id);
        if (!active) return;
        setArtist(data);

        // MusicBrainz artist — songs already included
        if (isMbId) {
          setTopTracks(data?.songs || []);
        } else if (data?.isYoutubeArtist) {
          const youtubePage = await searchYoutubePage(data.name);
          if (!active) return;
          setTopTracks(youtubePage.results.filter(t => t.type === "youtube"));
          setNextPageToken(youtubePage.nextPageToken);
        } else {
          setTopTracks(data?.songs || []);
        }
      } catch (err) {
        console.error("Artist load failed:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const handlePlaySong = (song, queue) => {
    if (!song) return;
    playSong(
      "",
      song.title,
      song.artist,
      song.cover || song.img || "",
      -1,
      song.youtubeId || null,
      queue || topTracks,
      song.id,
    );
    navigate("/now-playing");
  };

  const handleShuffle = () => {
    if (!topTracks.length) return;
    const shuffled = [...topTracks].sort(() => Math.random() - 0.5);
    handlePlaySong(shuffled[0], shuffled);
  };

  const handleShowMore = async () => {
    if (!artist?.isYoutubeArtist || !nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await searchYoutubePage(artist.name, nextPageToken);
      setTopTracks(prev => [...prev, ...page.results.filter(t => t.type === "youtube")]);
      setNextPageToken(page.nextPageToken);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const hasHeroImage = artist?.img || artist?.cover;
  const albums = artist?.albums || [];
  const singles = artist?.singles || [];
  const eps = artist?.eps || [];
  const chronology = artist?.chronology || [];
  const biography = artist?.biography;
  const isExpanded = (section) => !!expandedSections[section];
  const toggleSection = (section) => {
    setExpandedSections((current) => ({ ...current, [section]: !current[section] }));
  };
  const visibleTopTracks = isExpanded("tracks") ? topTracks : topTracks.slice(0, 5);
  const visibleAlbums = isExpanded("albums") ? albums : albums.slice(0, 6);
  const visibleSingles = isExpanded("singles") ? singles : singles.slice(0, 6);
  const visibleEps = isExpanded("eps") ? eps : eps.slice(0, 6);
  const visibleChronology = isExpanded("chronology") ? chronology : chronology.slice(0, 6);

  return (
    <div className="artist-detail-page">
      {/* Hero */}
      <div className="artist-hero">
        <button className="artist-back-btn" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={26} />
        </button>

        {isLoading ? (
          <div className="artist-hero-skeleton" />
        ) : hasHeroImage ? (
          <motion.img
            src={artist.img || artist.cover}
            alt={artist?.name}
            className="artist-hero-img"
            initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ) : (
          <ArtistCoverFallback name={artist?.name} />
        )}

        <div className="artist-hero-scrim" />

        <div className="artist-hero-overlay">
          {artist && (
            <motion.div
              key={artist.id || artist.name}
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
            >
              <h1 className="artist-hero-name">{artist.name || "Artist"}</h1>
              {isMbId && artist.country && (
                <p className="artist-hero-meta">{artist.country}</p>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Actions */}
      <motion.div
        className="artist-main-actions"
        initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.35 }}
      >
        <motion.button
          type="button"
          className="btn-artist-shuffle"
          whileTap={{ scale: 0.9 }}
          onClick={handleShuffle}
          aria-label="Shuffle"
        >
          <Shuffle size={26} strokeWidth={1.8} />
        </motion.button>
        <motion.button
          type="button"
          className="btn-artist-play"
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePlaySong(topTracks[0], topTracks)}
          aria-label="Play"
        >
          <Play size={26} fill="currentColor" stroke="none" />
        </motion.button>
      </motion.div>

      <div className="artist-content">
        {/* Top Tracks */}
        <section className="artist-section">
            <h2 className="artist-section-title">
              {isMbId ? "Top Tracks" : "Songs"}
            </h2>
            <div className="top-tracks-list">
              {topTracks.length > 0 && (
                <motion.div
                  key={topTracks.length}
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                >
                  {visibleTopTracks.map((track, i) => (
                    <motion.div
                      key={track.id || i}
                      className="artist-song-row"
                      variants={rowVariants}
                      {...longPressProps}
                      whileTap={tapFeedback}
                      onClick={() => handlePlaySong(track, topTracks)}
                    >
                      <span className="artist-song-index">{i + 1}</span>
                      <div
                        className="artist-song-cover"
                        style={track.cover ? { backgroundImage: `url(${track.cover})` } : undefined}
                      >
                        {!track.cover && <Music size={16} className="artist-song-cover-icon" />}
                      </div>
                      <div className="artist-song-info">
                        <p className="artist-song-title">{track.title}</p>
                        <p className="artist-song-artist">
                          {track.album ? `${track.artist} · ${track.album}` : track.artist}
                        </p>
                      </div>
                      <span className="artist-song-duration">{track.durationLabel}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
            {artist?.isYoutubeArtist && nextPageToken && (
              <button
                className="artist-show-more-btn"
                onClick={handleShowMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            )}
            {topTracks.length > 5 && (
              <ShowMoreButton expanded={isExpanded("tracks")} total={topTracks.length} onClick={() => toggleSection("tracks")} />
            )}
        </section>

        {/* Albums */}
        {albums.length > 0 && (
          <section className="artist-section">
            <h2 className="artist-section-title">Albums</h2>
            <div className="artist-albums-row">
              {visibleAlbums.map(album => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => navigate(`/album/${album.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Singles */}
        {singles.length > 0 && (
          <section className="artist-section">
            <h2 className="artist-section-title">Singles</h2>
            <div className="artist-albums-row">
              {visibleSingles.map(single => (
                <AlbumCard
                  key={single.id}
                  album={single}
                  onClick={() => navigate(`/album/${single.id}`)}
                />
              ))}
            </div>
            {singles.length > 6 && (
              <ShowMoreButton expanded={isExpanded("singles")} total={singles.length} onClick={() => toggleSection("singles")} />
            )}
          </section>
        )}

        {/* EPs */}
        {eps.length > 0 && (
          <section className="artist-section">
            <h2 className="artist-section-title">EPs</h2>
            <div className="artist-albums-row">
              {eps.map((ep) => (
                <AlbumCard
                  key={ep.id}
                  album={ep}
                  onClick={() => navigate(`/album/${ep.id}`)}
                />
              ))}
            </div>
            {albums.length > 6 && (
              <ShowMoreButton expanded={isExpanded("albums")} total={albums.length} onClick={() => toggleSection("albums")} />
            )}
          </section>
        )}

        {/* Chronology */}
        {chronology.length > 0 && (
          <section className="artist-section">
            <h2 className="artist-section-title">Release Chronology</h2>
            <div className="artist-chronology">
              {chronology.map((release, i) => (
                <motion.div
                  key={release.id}
                  className="chronology-item"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/album/${release.id}`)}
                >
                  <div className="chronology-dot" />
                  <div className="chronology-year">{release.year || "—"}</div>
                  <div className="chronology-cover-wrap">
                    <img
                      src={release.cover}
                      alt={release.title}
                      className="chronology-cover"
                      onError={e => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                  <div className="chronology-info">
                    <p className="chronology-title">{release.title}</p>
                    <span className="chronology-type">{release.type}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* About / Biography */}
        {biography && (
          <section className="artist-section about-section">
            <h2 className="artist-section-title">About</h2>
            <div className="artist-bio-card">
              <p className={`artist-bio-text ${bioExpanded ? "expanded" : ""}`}>
                {biography}
              </p>
              {biography.length > 300 && (
                <button
                  className="artist-bio-toggle"
                  onClick={() => setBioExpanded(prev => !prev)}
                >
                  {bioExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
            {hasHeroImage && (
              <img
                src={artist.img || artist.cover}
                alt={artist.name}
                className="artist-bio-photo"
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default ArtistDetail;

