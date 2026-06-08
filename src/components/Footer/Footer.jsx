import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { NavLink } from "react-router-dom";
import MediaControls from "../MediaControls/MediaControls";
import { PlayerContext } from "../MediaPlayer/MediaPlayer";
import "./Footer.css";

function HomeIcon() {
  return (
    <svg
      width="47"
      height="47"
      viewBox="0 0 47 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_334_120)">
        <path
          d="M43.0833 11.2095V3.91669C43.0833 2.83569 42.208 1.95836 41.125 1.95836C40.042 1.95836 39.1667 2.83569 39.1667 3.91669V8.55011L28.9775 1.6744C25.6503 -0.569852 21.3498 -0.569852 18.0225 1.6744L4.31421 10.9256C1.61367 12.7488 0 15.7822 0 19.0429V37.2084C0 42.6075 4.39254 47 9.79167 47H15.6667C16.7496 47 17.625 46.1227 17.625 45.0417V29.375C17.625 28.296 18.5023 27.4167 19.5833 27.4167H27.4167C28.4977 27.4167 29.375 28.296 29.375 29.375V45.0417C29.375 46.1227 30.2504 47 31.3333 47H37.2083C42.6075 47 47 42.6075 47 37.2084V19.0429C47 15.9467 45.543 13.0543 43.0833 11.2095ZM43.0833 37.2084C43.0833 40.4474 40.4474 43.0834 37.2083 43.0834H33.2917V29.375C33.2917 26.1359 30.6558 23.5 27.4167 23.5H19.5833C16.3443 23.5 13.7083 26.1359 13.7083 29.375V43.0834H9.79167C6.55258 43.0834 3.91667 40.4474 3.91667 37.2084V19.0429C3.91667 17.0865 4.88408 15.2652 6.50558 14.1725L20.2139 4.92132C22.2114 3.57398 24.7886 3.57398 26.7841 4.92132L40.4925 14.1725C42.114 15.2652 43.0814 17.0865 43.0814 19.0429L43.0833 37.2084Z"
          fill="currentcolor"
        />
      </g>
      <defs>
        <clipPath id="clip0_334_120">
          <rect width="47" height="47" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="40"
      height="43"
      viewBox="0 0 40 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_334_122)">
        <path
          d="M39.5117 39.9416L29.5633 29.2471C32.2744 25.6828 33.6073 21.1346 33.2864 16.5434C32.9655 11.9522 31.0154 7.66926 27.8393 4.58041C24.6633 1.49156 20.5043 -0.166842 16.2227 -0.0517605C11.9412 0.0633215 7.86451 1.94308 4.83602 5.1987C1.80754 8.45432 0.0589293 12.8367 -0.0481237 17.4394C-0.155177 22.0421 1.38752 26.513 4.26087 29.9272C7.13422 33.3415 11.1184 35.4379 15.3893 35.7829C19.6602 36.1278 23.891 34.6949 27.2067 31.7806L37.155 42.475C37.4693 42.8014 37.8903 42.982 38.3273 42.9779C38.7643 42.9738 39.1824 42.7854 39.4914 42.4532C39.8004 42.121 39.9757 41.6716 39.9795 41.2019C39.9833 40.7321 39.8153 40.2795 39.5117 39.9416ZM16.6667 32.25C14.0296 32.25 11.4517 31.4093 9.25907 29.8344C7.06641 28.2594 5.35744 26.0208 4.34828 23.4018C3.33911 20.7827 3.07506 17.9007 3.58953 15.1203C4.104 12.34 5.37388 9.786 7.23858 7.78144C9.10328 5.77689 11.4791 4.41177 14.0655 3.85872C16.6519 3.30566 19.3328 3.58951 21.7691 4.67437C24.2055 5.75922 26.2878 7.59636 27.7529 9.95347C29.218 12.3106 30 15.0818 30 17.9166C29.996 21.7168 28.59 25.36 26.0904 28.0471C23.5908 30.7342 20.2017 32.2457 16.6667 32.25Z"
          fill="currentcolor"
        />
      </g>
      <defs>
        <clipPath id="clip0_334_122">
          <rect width="40" height="43" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 871 871"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M399.208 109.33C399.147 89.2868 415.344 72.9875 435.388 72.9247C455.431 72.862 471.73 89.0593 471.792 109.102L399.208 109.33Z"
        fill="currentColor"
      />
      <path
        d="M519.544 373.626L472.768 420.693L471.792 109.103L399.208 109.33L400.185 420.922L353.119 374.149C338.902 360.02 315.923 360.091 301.794 374.309C287.666 388.524 287.738 411.504 301.955 425.632L302.047 425.723L302.082 425.759L436.915 559.748L570.527 425.291L570.73 425.088L570.759 425.059L570.788 425.03L571.002 424.816L519.544 373.626Z"
        fill="currentColor"
      />
      <path
        d="M571.028 424.79C585.156 410.571 585.083 387.591 570.868 373.463C556.649 359.336 533.669 359.409 519.544 373.626L571.028 424.79Z"
        fill="currentColor"
      />
      <path
        d="M145.167 435.5C145.167 395.412 177.663 362.917 217.75 362.917C237.793 362.917 254.042 346.668 254.042 326.625C254.042 306.581 237.793 290.333 217.75 290.333C137.577 290.333 72.5833 355.327 72.5833 435.5V653.25C72.5833 733.422 137.577 798.417 217.75 798.417H616.958C717.174 798.417 798.417 717.174 798.417 616.958V435.5C798.417 355.327 733.422 290.333 653.25 290.333C633.206 290.333 616.958 306.581 616.958 326.625C616.958 346.668 633.206 362.917 653.25 362.917C693.338 362.917 725.833 395.412 725.833 435.5V616.958C725.833 677.09 677.09 725.833 616.958 725.833H217.75C177.663 725.833 145.167 693.338 145.167 653.25V435.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Footer() {
  const location = useLocation();
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

  const isNowPlayingPage = location.pathname === "/now-playing";
  const showMediaControls = !isNowPlayingPage && currentTrack;

  return (
    <div className="Footer-container">
      {showMediaControls && (
        <MediaControls
          audioPlayerRef={audioPlayerRef}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isPlaying={isPlaying}
          title={currentTrack.title}
          artist={currentTrack.artist}
          coverSrc={currentTrack.coverSrc}
        />
      )}

      <div className="Footer">
        <div className="footer-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "footer-btn active" : "footer-btn"
            }
          >
            <HomeIcon />
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive ? "footer-btn active" : "footer-btn"
            }
          >
            <SearchIcon />
          </NavLink>

          <NavLink
            to="/download"
            className={({ isActive }) =>
              isActive ? "footer-btn active" : "footer-btn"
            }
          >
            <DownloadIcon />
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Footer;
