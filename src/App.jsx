import "./App.css";
import { useRef, useEffect, useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import MediaPlayer, {
  PlayerContext,
} from "./components/MediaPlayer/MediaPlayer";
import NowPlaying from "./pages/NowPLaying/NowPlaying";
import SeeAll from "./pages/SeeAll/SeeAll";
import SeeAllArtists from "./pages/SeeAll/SeeAllArtists";
import SeeAllPlaylists from "./pages/SeeAll/SeeAllPlaylists";
import CreatePlaylist from "./pages/SeeAll/CreatePlaylist";
import PlaylistDetail from "./pages/PlaylistDetail/PlaylistDetail";
import ArtistDetail from "./pages/ArtistDetail/ArtistDetail";
import Download from "./pages/Download/Download";
import Radio from "./pages/Radio/Radio";
import Settings from "./pages/Settings/Settings";
import Onboarding from "./pages/Onboarding/Onboarding";
import EditPlaylist from "./pages/EditPlaylist/EditPlaylist";
import DesktopUnsupported from "./components/DesktopUnsupported/DesktopUnsupported";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import ServerOffline from "./components/ServerOffline/ServerOffline";
import { useState } from "react";
import { ModalProvider } from "./context/ModalContext";
import { checkHealth } from "./services/api";

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{ height: "100%" }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const location = useLocation();
  const { currentTrack } = useContext(PlayerContext);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add("capacitor");
    }
    const checkIsDesktop = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  if (isDesktop) return <DesktopUnsupported />;

  const isNowPlayingPage = location.pathname === "/now-playing";
  const isOnboarding = location.pathname === "/onboarding";
  const hasActiveTrack = !!currentTrack && !isNowPlayingPage;

  return (
    <div className={`App ${hasActiveTrack ? "has-player" : ""}`}>
      {!isOnboarding && <Header />}

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

            <Route
              path="/see-all-artists"
              element={
                <PageWrapper>
                  <SeeAllArtists />
                </PageWrapper>
              }
            />

            <Route
              path="/see-all-playlists"
              element={
                <PageWrapper>
                  <SeeAllPlaylists />
                </PageWrapper>
              }
            />

            <Route
              path="/playlist/:id"
              element={
                <PageWrapper>
                  <PlaylistDetail />
                </PageWrapper>
              }
            />

            <Route
              path="/artist/:id"
              element={
                <PageWrapper>
                  <ArtistDetail />
                </PageWrapper>
              }
            />

            <Route
              path="/create-playlist"
              element={
                <PageWrapper>
                  <CreatePlaylist />
                </PageWrapper>
              }
            />

            <Route path="/download" element={<Download />} />

            <Route
              path="/settings"
              element={
                <PageWrapper>
                  <Settings />
                </PageWrapper>
              }
            />
            <Route
              path="/onboarding"
              element={
                <PageWrapper>
                  <Onboarding />
                </PageWrapper>
              }
            />
            <Route
              path="/edit-playlist/:id"
              element={
                <PageWrapper>
                  <EditPlaylist />
                </PageWrapper>
              }
            />
            <Route
              path="/radio"
              element={
                <PageWrapper>
                  <Radio />
                </PageWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      {!isOnboarding && <Footer />}
    </div>
  );
}

function App() {
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  const performHealthCheck = async () => {
    const isOnline = await checkHealth();
    setServerOnline(isOnline);
    setLoading(false);
  };

  useEffect(() => {
    performHealthCheck();

    const interval = setInterval(performHealthCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      {!serverOnline ? (
        <ModalProvider>
          <ServerOffline onRetry={performHealthCheck} />
        </ModalProvider>
      ) : (
        <MediaPlayer>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </MediaPlayer>
      )}
    </>
  );
}

export default App;
