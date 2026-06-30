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
import Library from "./pages/Library/Library";
import Upload from "./pages/Upload/Upload";
import Settings from "./pages/Settings/Settings";
import Onboarding from "./pages/Onboarding/Onboarding";
import EditPlaylist from "./pages/EditPlaylist/EditPlaylist";
import DesktopUnsupported from "./components/DesktopUnsupported/DesktopUnsupported";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import ServerOffline from "./components/ServerOffline/ServerOffline";
import { useState } from "react";
import { ModalProvider } from "./context/ModalContext";
import { checkHealth } from "./services/api";
import Downloads from "./pages/Downloads/Downloads";
import { DownloadProvider, useDownload } from "./context/DownloadContext";
import { CheckCircle, AlertCircle } from "lucide-react";

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
  const { toast } = useDownload();

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
            <Route
              path="/library"
              element={
                <PageWrapper>
                  <Library />
                </PageWrapper>
              }
            />
            <Route
              path="/upload"
              element={
                <PageWrapper>
                  <Upload />
                </PageWrapper>
              }
            />
            <Route
              path="/downloads"
              element={
                <PageWrapper>
                  <Downloads />
                </PageWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      {!isOnboarding && <Footer />}

      <AnimatePresence>
        {toast && (
          <motion.div
            className="download-toast"
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ bottom: hasActiveTrack ? "170px" : "110px" }}
          >
            {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [onBoardingComplete, SetOnBoardingComplete] = useState(true);

  const performHealthCheck = async () => {
    const isOnline = await checkHealth();
    setServerOnline(isOnline);
    setLoading(false);
    return isOnline;
  };

  useEffect(() => {
    performHealthCheck();

    const interval = setInterval(performHealthCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      {!onBoardingComplete ? (
        <Onboarding />
      ) : !serverOnline ? (
        <ModalProvider>
          <ServerOffline onRetry={performHealthCheck} />
        </ModalProvider>
      ) : (
        <DownloadProvider>
          <MediaPlayer>
            <ModalProvider>
              <AppContent />
            </ModalProvider>
          </MediaPlayer>
        </DownloadProvider>
      )}
    </>
  );
}

export default App;
