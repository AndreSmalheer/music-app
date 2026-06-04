import "./RecentlyPlayed.css";

const placeholderTracks = [
  { id: 1, title: "Can you feel it", cover: "/indieblog-best-album-covers-2010s-07 4.png" },
  { id: 2, title: "Can you feel it", cover: "/indieblog-best-album-covers-2010s-07 4.png" },
  { id: 3, title: "Can you feel it", cover: "/indieblog-best-album-covers-2010s-07 4.png" },
  { id: 4, title: "Can you feel it", cover: "/indieblog-best-album-covers-2010s-07 4.png" },
  { id: 5, title: "Can you feel it", cover: "/indieblog-best-album-covers-2010s-07 4.png" },
];

function RecentlyPlayed({ tracks = placeholderTracks }) {
  return (
    <div className="recently-played">
      <div className="recently-played__header">
        <h2 className="recently-played__title">Recently Played</h2>
        <button className="recently-played__arrow" aria-label="See all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="recently-played__list">
        {tracks.map((track) => (
          <div key={track.id} className="track-card">
            <img
              className="track-card__cover"
              src={track.cover}
              alt={track.title}
            />
            <p className="track-card__title">{track.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyPlayed;
