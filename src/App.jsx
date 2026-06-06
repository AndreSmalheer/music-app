import "./App.css";
import { useRef, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import MediaPlayer from "./components/MediaPlayer/MediaPlayer";
import NowPlaying from "./pages/NowPLaying/NowPlaying";
import SeeAll from "./pages/SeeAll/SeeAll";

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

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add("capacitor");
    }
  }, []);

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
              <Route
                path="/now-playing"
                element={
                  <PageWrapper>
                    <NowPlaying />
                  </PageWrapper>
                }
              />

              <Route
                path="/see-all"
                element={
                  <PageWrapper>
                    <SeeAll />
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
