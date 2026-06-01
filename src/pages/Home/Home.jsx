import { useContext } from "react";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";

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
      <h1>Home</h1>

    <button onClick={() => playSong("music/test.mp3", "Test music", "super cool artist", "covers/test-cover.jpg")}>Play Test muziek</button>
    </>
  );
}

export default Home;
