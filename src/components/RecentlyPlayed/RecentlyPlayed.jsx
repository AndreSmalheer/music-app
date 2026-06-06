import "./RecentlyPlayed.css";
import { useNavigate } from "react-router-dom";

const placeholderTracks = [
  {
    id: 1,
    title: "Can you feel it",
    cover: "/indieblog-best-album-covers-2010s-07 4.png",
  },
  {
    id: 2,
    title: "Can you feel it",
    cover: "/indieblog-best-album-covers-2010s-07 4.png",
  },
  {
    id: 3,
    title: "Can you feel it",
    cover: "/indieblog-best-album-covers-2010s-07 4.png",
  },
  {
    id: 4,
    title: "Can you feel it",
    cover: "/indieblog-best-album-covers-2010s-07 4.png",
  },
  {
    id: 5,
    title: "Can you feel it",
    cover: "/indieblog-best-album-covers-2010s-07 4.png",
  },
];

function ArrowBtn() {
  return (
    <svg
      width="1586"
      height="1107"
      viewBox="0 0 1586 1107"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1586 553.049C1585.45 504.481 1561.43 458.046 1519.16 423.806L1033.17 26.845C1011.94 9.65095 983.228 0 953.299 0C923.371 0 894.658 9.65095 873.433 26.845C862.815 35.427 854.387 45.6373 848.636 56.8869C842.884 68.1365 839.923 80.2028 839.923 92.3897C839.923 104.577 842.884 116.643 848.636 127.892C854.387 139.142 862.815 149.352 873.433 157.934L1246.14 460.733H113.286C83.2405 460.733 54.4258 470.459 33.1806 487.771C11.9354 505.084 0 528.565 0 553.049C0 577.533 11.9354 601.014 33.1806 618.327C54.4258 635.639 83.2405 645.366 113.286 645.366H1246.14L873.433 949.087C852.101 966.348 840.057 989.808 839.951 1014.31C839.844 1038.8 851.685 1062.33 872.866 1079.71C894.048 1097.1 922.837 1106.91 952.899 1107C982.961 1107.09 1011.83 1097.44 1033.17 1080.18L1519.16 683.215C1561.71 648.749 1585.75 601.938 1586 553.049Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RecentlyPlayed({ tracks = placeholderTracks }) {
  const navigate = useNavigate();

  return (
    <div className="recently-played">
      <div className="recently-played__header">
        <h2 className="recently-played__title">Recently Played</h2>
        <button
          className="recently-played__arrow"
          aria-label="See all"
          onClick={() => navigate("/see-all")}
        >
          <ArrowBtn />
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
