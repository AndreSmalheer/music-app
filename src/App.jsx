import "./App.css";
import { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";

function Player() {
  const audioRef = useRef(null);

  const handlePlay = async () => {
    try {
      await audioRef.current.play();

      navigator.mediaSession.metadata = new MediaMetadata({
        title: "test",
        artist: "test",
        album: "test",
        artwork: [
          {
            src: "/indieblog-best-album-covers-2010s-07 4.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
      console.log("Playing...");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🎵 Audio Test</h1>

      <button onClick={handlePlay} style={{ padding: 20, fontSize: 18 }}>
        Play Audio
      </button>

      <audio
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Header />

      <div className="page">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
