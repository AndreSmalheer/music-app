import RecentlyPlayed from "../../components/RecentlyPlayed/RecentlyPlayed";
import "./Radio.css";

function Radio() {
  const recentYouTubeArtists = [
    { id: 1, name: "Lo-fi Beats", img: "/covers/test-cover.jpg" },
    { id: 2, name: "Jazz Piano", img: "/covers/test-cover.jpg" },
    { id: 3, name: "Deep Focus", img: "/covers/test-cover.jpg" },
  ];

  return (
    <div className="radio-page">
      <div className="radio-search-container">
        <input
          type="text"
          placeholder="Search YouTube..."
          className="radio-search-input"
        />
      </div>

      <RecentlyPlayed />

      <section className="radio-section">
        <div className="radio-section__header">
          <h2 className="radio-section__title">Recent YouTube Artists</h2>
        </div>
        <div className="radio-section__list">
          {recentYouTubeArtists.map((artist) => (
            <div key={artist.id} className="radio-artist-card">
              <img src={artist.img} alt={artist.name} className="radio-artist-card__img" />
              <p className="radio-artist-card__name">{artist.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Radio;
