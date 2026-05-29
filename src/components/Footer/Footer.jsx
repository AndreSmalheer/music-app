import "./Footer.css";

function Footer() {
  return (
    <div className="Footer-container">
      <div className="Footer">
        <div className="footer-nav">
          <button className="footer-btn" id="home-btn">
            <img src="/icons/house.png" />
          </button>
          <button className="footer-btn" id="search-btn">
            <img src="/icons/Search.png" />
          </button>
          <button className="footer-btn" id="radio-btn">
            <img src="/icons/radio.png" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Footer;
