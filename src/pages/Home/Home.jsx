import { useContext } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import RecentlyPlayed from "../../components/RecentlyPlayed/RecentlyPlayed";

function Home() {
  const {
    audioPlayerRef,
    isPlaying,
    currentTrack,
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    playSong,
  } = useContext(PlayerContext);

  return (
    <>
      <RecentlyPlayed />
      <button onClick={() => playSong("music/test.mp3", "Test music", "super cool artist", "covers/test-cover.jpg")}>Play Test muziek</button>
    </>
  );
}

export default Home;
