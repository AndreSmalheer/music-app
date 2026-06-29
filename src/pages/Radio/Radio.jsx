import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RecentlyPlayed from "../../components/RecentlyPlayed/RecentlyPlayed";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import {
  addRecent,
  createYoutubeArtist,
  downloadFromYoutube,
  getYoutubeArtists,
  searchYoutubePage,
} from "../../services/api";
import "./Radio.css";
import { useModal } from "../../context/ModalContext";
import useLongPress from "../../hooks/useLongPress";
import ArtistItem from "../../components/items/ArtistItems";
import SongItem from "../../components/items/SongItem";

function Radio() {
  const [searchParams] = useSearchParams();
  const { showOptions } = useModal();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState([]);
  const [youtubeArtists, setYoutubeArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { playSong } = useContext(PlayerContext);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setResults([]);
      setIsLoading(false);
      setNextPageToken(null);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const youtubePage = await searchYoutubePage(q);

        setResults(youtubePage.results);
        setNextPageToken(youtubePage.nextPageToken);
        setShowMore(false);
      } catch (err) {
        console.error("YouTube search failed:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;

    getYoutubeArtists()
      .then((artists) => {
        if (active) setYoutubeArtists(artists);
      })
      .catch((err) => {
        console.error("YouTube artists laden mislukt:", err);
        if (active) setYoutubeArtists([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handlePlaySong = async (song) => {
    if (song.type === "youtube-artist") {
      handleOpenYoutubeArtist(song);
      return;
    }

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

      if (savedSong.id) {
        addRecent(savedSong.id).catch(() => {});
      }

      navigate("/now-playing");
    } catch (err) {
      console.error("YouTube track opslaan mislukt:", err);
    }
  };

  const handleOpenYoutubeArtist = async (artist) => {
    try {
      const savedArtist = await createYoutubeArtist({
        name: artist.name || artist.artist || artist.title,
        thumbnail: artist.cover || artist.img,
        youtubeChannelId: artist.youtubeChannelId,
      });

      navigate(`/artist/${savedArtist.id}`);
    } catch (err) {
      console.error("YouTube artiest openen mislukt:", err);
    }
  };

  const visibleArtists = showMore
    ? youtubeArtists
    : youtubeArtists.slice(0, 10);

  const visibleResults = results;

  const handleShowMore = async () => {
    if (!nextPageToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const youtubePage = await searchYoutubePage(query, nextPageToken);

      setResults((prev) => [...prev, ...youtubePage.results]);
      setNextPageToken(youtubePage.nextPageToken);
    } catch (err) {
      console.error("More YouTube results failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="radio-page">
      <div className="radio-search-container">
        <input
          type="text"
          placeholder="Search YouTube..."
          className="radio-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query.trim() && (
        <RecentlyPlayed InculdeYt={true} YtSearchStyling={true} />
      )}

      <section className="radio-section">
        <div className="radio-section__header">
          <h2 className="radio-section__title">
            {query.trim() ? "Search Results" : "Recent YouTube Artists"}
          </h2>
        </div>

        <div className="radio-results-container">
          {isLoading ? (
            <p className="radio-searching-text">Searching...</p>
          ) : results.length > 0 ? (
            visibleResults.map((item) =>
              item.type === "youtube-artist" ? (
                <ArtistItem
                  key={item.youtubeChannelId || item.id}
                  artist={item}
                  navigate={() => handleOpenYoutubeArtist(item)}
                  showOptions={showOptions}
                  variant="artist"
                />
              ) : (
                <SongItem
                  key={item.youtubeId}
                  song={item}
                  handlePlaySong={handlePlaySong}
                  showOptions={showOptions}
                  variant="radio"
                />
              ),
            )
          ) : query.trim() ? (
            <p className="no-result-text">No results found.</p>
          ) : youtubeArtists.length > 0 ? (
            visibleArtists.map((artist) => (
              <ArtistItem
                key={artist.id}
                artist={artist}
                navigate={navigate}
                showOptions={showOptions}
                variant="artist"
              />
            ))
          ) : (
            <div className="radio-section__list"></div>
          )}
        </div>
      </section>

      {query.trim() && nextPageToken && (
        <button
          className="show-more-btn"
          onClick={handleShowMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? "Loading..." : "Show More"}
        </button>
      )}
    </div>
  );
}

export default Radio;
