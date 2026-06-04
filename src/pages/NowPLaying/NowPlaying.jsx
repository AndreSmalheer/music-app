import "./NowPlaying.css";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useContext } from "react";

function FavrouteIcon() {
  return (
    <svg
      width="454"
      height="454"
      viewBox="0 0 454 454"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_365_124)">
        <path
          d="M450.898 166.353C447.028 154.037 439.298 143.292 428.849 135.709C418.401 128.126 405.79 124.106 392.88 124.245H310.233L285.131 46.0054C281.183 33.6899 273.427 22.9463 262.979 15.3238C252.531 7.70136 239.933 3.59399 227 3.59399C214.067 3.59399 201.469 7.70136 191.021 15.3238C180.573 22.9463 172.817 33.6899 168.869 46.0054L143.767 124.245H61.1197C48.2516 124.263 35.7183 128.347 25.3101 135.915C14.9019 143.482 7.15126 154.144 3.16515 166.379C-0.820957 178.615 -0.8386 191.797 3.11474 204.043C7.06808 216.288 14.7902 226.972 25.1781 234.567L92.4457 283.75L66.8704 362.954C62.7373 375.238 62.685 388.529 66.7211 400.846C70.7573 413.162 78.6658 423.845 89.2677 431.3C99.688 438.995 112.316 443.117 125.269 443.053C138.222 442.988 150.808 438.739 161.151 430.941L227 382.476L292.868 430.884C303.269 438.535 315.829 442.69 328.741 442.753C341.653 442.816 354.252 438.783 364.728 431.234C375.203 423.685 383.015 413.008 387.04 400.74C391.066 388.471 391.097 375.242 387.13 362.954L361.554 283.75L428.898 234.567C439.404 227.067 447.217 216.384 451.179 204.099C455.141 191.813 455.043 178.578 450.898 166.353ZM406.576 204.016L328.185 261.315C324.965 263.664 322.57 266.97 321.34 270.761C320.11 274.552 320.109 278.634 321.337 282.426L351.131 374.55C352.639 379.223 352.626 384.253 351.094 388.918C349.563 393.582 346.592 397.641 342.608 400.511C338.624 403.38 333.833 404.913 328.923 404.888C324.014 404.863 319.238 403.281 315.284 400.371L238.199 343.621C234.952 341.236 231.029 339.95 227 339.95C222.971 339.95 219.048 341.236 215.801 343.621L138.716 400.371C134.764 403.321 129.975 404.935 125.044 404.98C120.113 405.024 115.296 403.497 111.291 400.62C107.286 397.743 104.302 393.665 102.77 388.978C101.239 384.29 101.24 379.237 102.774 374.55L132.663 282.426C133.891 278.634 133.89 274.552 132.66 270.761C131.43 266.97 129.035 263.664 125.815 261.315L47.4241 204.016C43.4762 201.126 40.5428 197.062 39.0429 192.404C37.5429 187.747 37.5531 182.735 39.0721 178.083C40.591 173.432 43.5409 169.38 47.5005 166.506C51.4601 163.631 56.2268 162.082 61.1197 162.078H157.595C161.6 162.078 165.501 160.807 168.738 158.447C171.974 156.088 174.378 152.763 175.603 148.95L204.924 57.5635C206.429 52.887 209.379 48.8087 213.35 45.9155C217.32 43.0224 222.106 41.4636 227.019 41.4636C231.932 41.4636 236.718 43.0224 240.688 45.9155C244.658 48.8087 247.608 52.887 249.114 57.5635L278.434 148.95C279.66 152.763 282.064 156.088 285.3 158.447C288.537 160.807 292.438 162.078 296.443 162.078H392.918C397.811 162.082 402.578 163.631 406.537 166.506C410.497 169.38 413.447 173.432 414.966 178.083C416.485 182.735 416.495 187.747 414.995 192.404C413.495 197.062 410.562 201.126 406.614 204.016H406.576Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_365_124">
          <rect width="454" height="454" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function OptionsIcon() {
  return (
    <svg
      width="299"
      height="81"
      viewBox="0 0 299 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_365_120)">
        <rect
          x="4"
          width="72.64"
          height="72.64"
          rx="36.32"
          fill="currentColor"
        />
        <rect
          x="112.96"
          width="72.64"
          height="72.64"
          rx="36.32"
          fill="currentColor"
        />
        <rect
          x="221.92"
          width="72.64"
          height="72.64"
          rx="36.32"
          fill="currentColor"
        />
      </g>

      <defs>
        <filter
          id="filter0_d_365_120"
          x="0"
          y="0"
          width="298.56"
          height="80.6399"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_365_120"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_365_120"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

function NowPlaying() {
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
      <div className="now-playing-page">
        <img
          className="album-cover"
          src={currentTrack.coverSrc}
          alt="Album Cover"
        ></img>

        <div className="now-playing-info">
          <div className="now-playing-text">
            <h1 className="now-playing-title">{currentTrack.title}</h1>
            <h2 className="now-playing-artist">{currentTrack.artist}</h2>
          </div>

          <div className="now-playing-actions">
            <div className="favroute-btn">
              <FavrouteIcon />
            </div>

            <div className="options-btn">
              <OptionsIcon />
            </div>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-bar-track">
            <div className="progress-bar-fill"></div>
          </div>

          <div className="progress-bar-times">
            <div className="progress-time progress-time-start">0:00</div>
            <div className="progress-time progress-time-end">-0:00</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NowPlaying;
