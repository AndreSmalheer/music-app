import "./App.css";
import { useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import MediaPlayer from "./components/MediaPlayer/MediaPlayer";

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

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <MediaPlayer>
        <Header />

        <div className="page">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <Home />
                  </PageWrapper>
                }
              />
              <Route
                path="/search"
                element={
                  <PageWrapper>
                    <Search />
                  </PageWrapper>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>

        <Footer />
      </MediaPlayer>
    </div>
  );
}

export default App;
