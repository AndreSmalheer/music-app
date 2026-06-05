import "./NowPlaying.css";
import { PlayerContext } from "../../components/MediaPlayer/MediaPlayer";
import { useContext, useRef, useEffect, useState } from "react";

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

function PrevBtn() {
  return (
    <svg viewBox="0 0 1045 767" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M880.076 7.62939e-06C923.802 0.0234767 965.731 17.7039 996.654 49.1579C1027.58 80.612 1044.97 123.268 1045 167.756V599.332C1045.01 630.316 1036.58 660.697 1020.64 687.099C1004.7 713.502 981.883 734.894 954.718 748.899C927.553 762.904 897.105 768.975 866.754 766.437C836.403 763.898 807.337 752.851 782.785 734.521L618.209 611.606C616.057 641.461 606.087 670.185 589.334 694.793C572.581 719.402 549.656 738.997 522.942 751.542C496.229 764.087 466.7 769.125 437.426 766.131C408.151 763.138 380.198 752.223 356.472 734.521L67.2555 518.733C46.4077 503.157 29.4562 482.807 17.7722 459.329C6.08827 435.851 3.8147e-05 409.904 3.8147e-05 383.588C3.8147e-05 357.272 6.08827 331.326 17.7722 307.848C29.4562 284.37 46.4077 264.02 67.2555 248.444L356.472 32.6561C380.192 14.9563 408.138 4.04082 437.405 1.04341C466.673 -1.954 496.196 3.07595 522.907 15.6109C549.619 28.1459 572.545 47.7287 589.303 72.3253C606.062 96.9218 616.043 125.635 618.209 155.482L782.785 32.5676C810.979 11.4483 845.064 0.0385844 880.076 7.62939e-06ZM574.963 286.905C563.413 286.905 552.336 282.236 544.169 273.927C536.001 265.617 531.413 254.347 531.413 242.595V167.756C531.402 153.158 527.418 138.848 519.903 126.412C512.388 113.977 501.635 103.901 488.836 97.303C476.037 90.7048 461.692 87.8415 447.392 89.0305C433.091 90.2194 419.394 95.4141 407.818 104.039L118.645 319.827C108.807 327.164 100.807 336.757 95.2919 347.827C89.7772 358.897 86.9035 371.133 86.9035 383.544C86.9035 395.955 89.7772 408.191 95.2919 419.261C100.807 430.331 108.807 439.924 118.645 447.261L407.818 663.049C419.394 671.674 433.091 676.869 447.392 678.058C461.692 679.247 476.037 676.383 488.836 669.785C501.635 663.187 512.388 653.112 519.903 640.676C527.418 628.24 531.402 613.93 531.413 599.332V524.493C531.418 516.309 533.652 508.286 537.865 501.314C542.078 494.343 548.107 488.694 555.282 484.996C562.458 481.297 570.5 479.693 578.517 480.361C586.534 481.029 594.213 483.943 600.701 488.779L834.304 663.049C845.881 671.674 859.578 676.869 873.879 678.058C888.179 679.247 902.524 676.383 915.323 669.785C928.121 663.187 938.874 653.112 946.39 640.676C953.905 628.24 957.889 613.93 957.9 599.332L957.9 167.756C957.889 153.158 953.905 138.848 946.39 126.412C938.874 113.977 928.121 103.901 915.323 97.303C902.524 90.7048 888.179 87.8415 873.879 89.0305C859.578 90.2194 845.881 95.4141 834.304 104.039L600.788 278.309C593.301 283.903 584.252 286.915 574.963 286.905Z"
        fill="currentcolor"
      />
    </svg>
  );
}

function NextBtn() {
  return (
    <svg viewBox="0 0 1045 767" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M164.924 767C121.198 766.977 79.2692 749.296 48.3461 717.842C17.423 686.388 0.0346206 643.732 5.86353e-06 599.244L5.86353e-06 167.668C-0.00811757 136.684 8.42466 106.303 24.3619 79.9006C40.2991 53.4979 63.1171 32.1062 90.2819 18.101C117.447 4.09582 147.895 -1.97474 178.246 0.563445C208.597 3.10163 237.663 14.1492 262.215 32.4794L426.792 155.394C428.943 125.539 438.913 96.8151 455.666 72.2066C472.419 47.5981 495.344 28.0032 522.058 15.4581C548.771 2.91289 578.3 -2.12478 607.574 0.868519C636.849 3.86181 664.802 14.7768 688.528 32.4794L977.745 248.267C998.592 263.843 1015.54 284.193 1027.23 307.671C1038.91 331.149 1045 357.096 1045 383.412C1045 409.728 1038.91 435.674 1027.23 459.152C1015.54 482.63 998.592 502.98 977.745 518.556L688.528 734.344C664.808 752.044 636.862 762.959 607.595 765.957C578.327 768.954 548.804 763.924 522.093 751.389C495.381 738.854 472.455 719.271 455.697 694.675C438.938 670.078 428.957 641.365 426.792 611.518L262.215 734.432C234.021 755.552 199.936 766.961 164.924 767ZM470.037 480.095C481.587 480.095 492.664 484.764 500.831 493.073C508.999 501.383 513.587 512.653 513.587 524.405V599.244C513.598 613.842 517.582 628.152 525.097 640.588C532.612 653.023 543.365 663.099 556.164 669.697C568.963 676.295 583.308 679.159 597.608 677.97C611.909 676.781 625.606 671.586 637.182 662.961L926.355 447.173C936.193 439.836 944.193 430.243 949.708 419.173C955.223 408.103 958.097 395.867 958.097 383.456C958.097 371.045 955.223 358.809 949.708 347.739C944.193 336.669 936.193 327.076 926.355 319.739L637.182 103.951C625.606 95.326 611.909 90.1313 597.608 88.9423C583.308 87.7534 568.963 90.6167 556.164 97.2149C543.365 103.813 532.612 113.888 525.097 126.324C517.582 138.76 513.598 153.07 513.587 167.668V242.507C513.582 250.691 511.348 258.714 507.135 265.686C502.922 272.657 496.893 278.306 489.718 282.004C482.542 285.703 474.5 287.307 466.483 286.639C458.466 285.971 450.787 283.057 444.299 278.221L210.696 103.951C199.119 95.326 185.422 90.1313 171.121 88.9423C156.821 87.7534 142.476 90.6167 129.677 97.2149C116.879 103.813 106.126 113.888 98.6103 126.324C91.0951 138.76 87.1112 153.07 87.1003 167.668L87.1003 599.244C87.1112 613.842 91.0951 628.152 98.6103 640.588C106.126 653.023 116.879 663.099 129.677 669.697C142.476 676.295 156.821 679.159 171.121 677.97C185.422 676.781 199.119 671.586 210.696 662.961L444.212 488.691C451.699 483.097 460.748 480.085 470.037 480.095Z"
        fill="currentcolor"
      />
    </svg>
  );
}

function PlayBtn() {
  return (
    <svg viewBox="0 0 422 444" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M377.579 147.369L171.674 17.8694C155.592 7.7755 136.563 1.69657 116.696 0.306645C96.8295 -1.08328 76.9019 2.27011 59.1231 9.99498C41.3443 17.7199 26.4089 29.5144 15.9729 44.0707C5.53698 58.627 0.00833148 75.3763 0 92.4614V351.461C0.00355632 368.554 5.53252 385.312 15.9733 399.875C26.414 414.438 41.3583 426.236 59.1474 433.96C76.9365 441.685 96.8748 445.034 116.75 443.635C136.624 442.235 155.658 436.144 171.739 426.035L377.644 296.535C391.312 287.943 402.426 276.713 410.088 263.754C417.749 250.795 421.742 236.471 421.742 221.943C421.742 207.415 417.749 193.091 410.088 180.132C402.426 167.173 391.312 155.942 377.644 147.351L377.579 147.369ZM352.024 266.694L146.119 396.194C136.472 402.237 125.062 405.874 113.152 406.702C101.243 407.53 89.2979 405.517 78.6403 400.886C67.9827 396.256 59.0279 389.188 52.767 380.464C46.5061 371.741 43.1834 361.703 43.1667 351.461V92.4614C43.0469 82.2003 46.3069 72.1184 52.5722 63.3743C58.8374 54.6301 67.8537 47.5783 78.5849 43.0294C87.7123 39.0499 97.8058 36.971 108.046 36.9614C121.771 37.0063 135.116 40.8258 146.119 47.8579L352.024 177.358C360.215 182.514 366.875 189.25 371.465 197.021C376.056 204.792 378.448 213.38 378.448 222.091C378.448 230.801 376.056 239.39 371.465 247.161C366.875 254.932 360.215 261.668 352.024 266.824V266.694Z"
        fill="currentcolor"
      />
    </svg>
  );
}

function PauseBtn() {
  return (
    <svg viewBox="0 0 447 542" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M133.929 483.929C133.929 494.633 123.951 503.286 111.607 503.286H66.9643C54.6205 503.286 44.6429 494.633 44.6429 483.929V58.0714C44.6429 47.3863 54.6205 38.7143 66.9643 38.7143H111.607C123.951 38.7143 133.929 47.3863 133.929 58.0714V483.929ZM133.929 0H44.6429C20 0 0 17.344 0 38.7143V503.286C0 524.656 20 542 44.6429 542H133.929C158.571 542 178.571 524.656 178.571 503.286V38.7143C178.571 17.344 158.571 0 133.929 0ZM401.786 483.929C401.786 494.633 391.808 503.286 379.464 503.286H334.821C322.478 503.286 312.5 494.633 312.5 483.929V58.0714C312.5 47.3863 322.478 38.7143 334.821 38.7143H379.464C391.808 38.7143 401.786 47.3863 401.786 58.0714V483.929ZM401.786 0H312.5C287.857 0 267.857 17.344 267.857 38.7143V503.286C267.857 524.656 287.857 542 312.5 542H401.786C426.429 542 446.429 524.656 446.429 503.286V38.7143C446.429 17.344 426.429 0 401.786 0Z"
        fill="currentcolor"
      />
    </svg>
  );
}

function ShuffleBtn() {
  return (
    <svg
      width="462"
      height="454"
      viewBox="0 0 462 454"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_375_120)">
        <g clip-path="url(#clip0_375_120)">
          <path
            d="M446.934 313.695L384.679 251.44C382.944 249.593 380.855 248.112 378.537 247.088C376.218 246.063 373.717 245.515 371.183 245.475C368.649 245.436 366.132 245.906 363.783 246.859C361.434 247.811 359.3 249.225 357.508 251.018C355.717 252.811 354.304 254.946 353.353 257.296C352.403 259.646 351.934 262.163 351.975 264.697C352.016 267.231 352.566 269.732 353.593 272.049C354.619 274.367 356.101 276.455 357.95 278.189L401.269 321.583C377.72 321.637 354.399 316.978 332.678 307.882C310.957 298.785 291.275 285.435 274.792 268.617C272.962 266.931 270.811 265.63 268.469 264.792C266.126 263.953 263.639 263.594 261.154 263.735C258.67 263.876 256.239 264.515 254.007 265.614C251.774 266.712 249.785 268.248 248.157 270.13L247.911 270.508C244.731 274.208 243.103 278.993 243.367 283.865C243.632 288.736 245.768 293.318 249.33 296.651C269.189 316.735 292.87 332.636 318.976 343.417C345.081 354.197 373.082 359.637 401.326 359.417L357.95 402.793C355.973 404.493 354.369 406.583 353.239 408.932C352.109 411.282 351.476 413.839 351.381 416.444C351.286 419.05 351.73 421.647 352.687 424.072C353.643 426.498 355.09 428.699 356.937 430.539C358.785 432.378 360.993 433.816 363.422 434.762C365.851 435.708 368.45 436.141 371.055 436.035C373.66 435.929 376.215 435.286 378.559 434.145C380.904 433.005 382.987 431.392 384.679 429.408L446.934 367.154C454.015 360.06 457.992 350.447 457.992 340.424C457.992 330.402 454.015 320.788 446.934 313.695Z"
            fill="currentcolor"
          />
          <path
            d="M401.269 132.417L357.95 175.736C357.581 176.234 357.24 176.752 356.928 177.287C353.876 181.009 352.37 185.761 352.723 190.562C353.075 195.363 355.259 199.844 358.823 203.08C362.387 206.316 367.058 208.059 371.87 207.948C376.682 207.837 381.268 205.881 384.679 202.484L416.951 170.25L446.953 140.267C452.025 135.155 455.533 128.701 457.064 121.664C458.596 114.628 458.087 107.3 455.598 100.542C453.76 95.3693 450.801 90.6666 446.934 86.7707L384.679 24.5917C382.952 22.7153 380.863 21.2075 378.539 20.1589C376.214 19.1103 373.702 18.5425 371.152 18.4897C368.603 18.4368 366.069 18.9001 363.703 19.8515C361.337 20.8029 359.187 22.2229 357.384 24.0262C355.581 25.8294 354.161 27.9786 353.21 30.3446C352.258 32.7106 351.795 35.2445 351.848 37.7941C351.901 40.3437 352.468 42.8563 353.517 45.1808C354.566 47.5054 356.073 49.5939 357.95 51.3209L401.326 94.6779C308.01 94.9049 256.859 145.261 210.475 198.228C167.875 150.142 117.386 102.15 32.0156 95.4535L22.9167 94.5833C17.8997 94.5833 13.0881 96.5763 9.54056 100.124C5.993 103.671 4 108.483 4 113.5C4.09686 118.487 6.12095 123.242 9.64774 126.769C13.1745 130.296 17.93 132.32 22.9167 132.417C24.2787 132.417 28.3457 133.041 28.3457 133.041C102.045 138.621 144.343 180.124 185.487 227C144.589 273.648 102.575 315.908 29.4807 320.827L21.9141 321.224C16.9347 321.535 12.2828 323.811 8.98182 327.552C5.68081 331.293 4.00107 336.192 4.31212 341.172C4.62318 346.151 6.89955 350.803 10.6405 354.104C14.3814 357.405 19.2804 359.085 24.2597 358.773C27.2107 358.641 32.0156 358.528 34.3802 358.338C129.342 351.018 180.852 290.238 226.782 237.101C273.165 183.492 316.976 132.757 401.269 132.417Z"
            fill="currentcolor"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_375_120"
          x="-0.113525"
          y="0"
          width="462"
          height="462"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            result="effect1_dropShadow_375_120"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_375_120"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_375_120">
          <rect
            width="454"
            height="454"
            fill="white"
            transform="translate(3.88647)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

function Repeat1() {
  return (
    <svg
      width="711"
      height="711"
      viewBox="0 0 711 711"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_376_124)">
        <g clip-path="url(#clip0_376_124)">
          <path
            d="M326.208 439.375V334.335L317.626 342.917C306.173 354.37 287.661 354.37 276.207 342.917C264.754 331.464 264.754 312.952 276.207 301.499L334.791 242.916C343.168 234.509 355.705 231.96 366.719 236.559C377.674 241.07 384.792 251.791 384.792 263.625V439.375C384.792 455.573 371.669 468.666 355.5 468.666C339.331 468.666 326.208 455.573 326.208 439.375ZM677.708 322.208C661.51 322.208 648.417 335.301 648.417 351.5C648.417 448.426 569.593 527.25 472.667 527.25H91.875L159.041 460.084C170.494 448.631 170.494 430.119 159.041 418.666C147.588 407.212 129.075 407.212 117.622 418.666L21.1649 515.123C-1.68258 537.941 -1.68258 575.142 21.1649 597.96L117.622 694.417C123.334 700.129 130.833 703 138.332 703C145.83 703 153.329 700.129 159.041 694.417C170.494 682.964 170.494 664.452 159.041 652.999L91.875 585.833H472.667C601.872 585.833 707 480.705 707 351.5C707 335.301 693.907 322.208 677.708 322.208ZM33.2917 380.791C49.4607 380.791 62.5833 367.698 62.5833 351.5C62.5833 254.574 141.407 175.75 238.333 175.75H619.125L551.959 242.916C540.506 254.369 540.506 272.881 551.959 284.334C557.671 290.046 565.17 292.916 572.668 292.916C580.167 292.916 587.666 290.046 593.378 284.334L689.835 187.876C712.683 165.058 712.683 127.858 689.835 105.04L593.378 8.58221C581.925 -2.87083 563.412 -2.87083 551.959 8.58221C540.506 20.0353 540.506 38.5476 551.959 50.0006L619.125 117.166H238.333C109.128 117.166 4 222.294 4 351.5C4 367.698 17.1227 380.791 33.2917 380.791Z"
            fill="currentcolor"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_376_124"
          x="0"
          y="0"
          width="711"
          height="711"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            result="effect1_dropShadow_376_124"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_376_124"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_376_124">
          <rect
            width="703"
            height="703"
            fill="white"
            transform="translate(4)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

function Repeat() {
  return (
    <svg
      width="711"
      height="711"
      viewBox="0 0 711 711"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_376_124)">
        <g clip-path="url(#clip0_376_124)">
          <path
            d="M677.708 322.208C661.51 322.208 648.417 335.301 648.417 351.5C648.417 448.426 569.593 527.25 472.667 527.25H91.875L159.041 460.084C170.494 448.631 170.494 430.118 159.041 418.665C147.588 407.212 129.075 407.212 117.622 418.665L21.1649 515.123C-1.68258 537.941 -1.68258 575.141 21.1649 597.96L117.622 694.417C123.334 700.129 130.833 703 138.332 703C145.83 703 153.329 700.129 159.041 694.417C170.494 682.964 170.494 664.452 159.041 652.999L91.875 585.833H472.667C601.872 585.833 707 480.705 707 351.5C707 335.301 693.907 322.208 677.708 322.208ZM33.2917 380.791C49.4607 380.791 62.5833 367.698 62.5833 351.5C62.5833 254.573 141.407 175.749 238.333 175.749H619.125L551.959 242.915C540.506 254.368 540.506 272.881 551.959 284.334C557.671 290.046 565.17 292.916 572.668 292.916C580.167 292.916 587.666 290.046 593.378 284.334L689.835 187.876C712.683 165.058 712.683 127.858 689.835 105.039L593.378 8.58197C581.925 -2.87107 563.412 -2.87107 551.959 8.58197C540.506 20.035 540.506 38.5473 551.959 50.0004L619.125 117.166H238.333C109.128 117.166 4 222.294 4 351.5C4 367.698 17.1227 380.791 33.2917 380.791Z"
            fill="currentcolor"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_376_124"
          x="0"
          y="0"
          width="711"
          height="711"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            result="effect1_dropShadow_376_124"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_376_124"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_376_124">
          <rect
            width="703"
            height="703"
            fill="white"
            transform="translate(4)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

function NowPlaying() {
  const {
    audioPlayerRef,
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    playSong,
  } = useContext(PlayerContext);
  const isDragging = useRef(false);
  const progressBarRef = useRef(null);
  const fillRef = useRef(null);
  const latestX = useRef(null);
  const rafId = useRef(null);
  const [repeatMode, setRepeatMode] = useState("off");
  const [shuffle, setShuffle] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleRepeat = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setRepeatMode((prev) => {
      if (prev === "off") return "repeat";
      if (prev === "repeat") return "repeat-one";
      return "off";
    });
  };

  const isActive = repeatMode !== "off";

  if (!currentTrack) {
    return (
      <div className="now-playing-page">
        <h1 className="now-playing-title">No song selected</h1>
      </div>
    );
  }

  const formatTime = (time) => {
    const absoluteTime = Math.max(0, time);
    if (isNaN(absoluteTime)) return "0:00";
    const minutes = Math.floor(absoluteTime / 60);
    const seconds = Math.floor(absoluteTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const seekToPosition = (clientX) => {
    if (!audioPlayerRef.current || duration === 0 || !progressBarRef.current)
      return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    );

    if (fillRef.current) {
      fillRef.current.style.width = `${percentage * 100}%`;
    }

    audioPlayerRef.current.currentTime = percentage * duration;
  };

  const handlePointerDown = (e) => {
    isDragging.current = true;
    latestX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.setAttribute("data-dragging", "true");
    rafId.current = requestAnimationFrame(seekLoop);
    seekToPosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    seekToPosition(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    latestX.current = null;
    cancelAnimationFrame(rafId.current);
    e.currentTarget.setAttribute("data-dragging", "false");
    seekToPosition(e.clientX);
    if (!isPlaying) handlePlay();
  };

  const seekLoop = () => {
    if (latestX.current !== null) {
      seekToPosition(latestX.current);
    }
    if (isDragging.current) {
      rafId.current = requestAnimationFrame(seekLoop);
    }
  };

  useEffect(() => {
    const el = progressBarRef.current;
    if (!el) return;

    const onMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      latestX.current = e.clientX;
    };

    el.addEventListener("pointermove", onMove, { passive: false });
    return () => el.removeEventListener("pointermove", onMove);
  }, [duration]);

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
          <div
            className="progress-bar-track"
            ref={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={(e) => {
              isDragging.current = false;
              e.currentTarget.setAttribute("data-dragging", "false");
            }}
            style={{ touchAction: "none", cursor: "pointer" }}
          >
            <div
              className="progress-bar-fill"
              ref={fillRef}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-bar-times">
            <div className="progress-time progress-time-start">
              {formatTime(currentTime)}
            </div>
            <div className="progress-time progress-time-end">
              -{formatTime(duration - currentTime)}
            </div>
          </div>
        </div>

        <div className="player-controls">
          <div className="control control--repeat"></div>

          <div className="control-group control-group--main">
            <button
              className={`control control--repeat media-control-button ${
                isActive ? "active" : ""
              }`}
              onClick={toggleRepeat}
              aria-label="Repeat"
            >
              {repeatMode === "repeat-one" ? <Repeat1 /> : <Repeat />}
            </button>

            <button
              className="control control--previous media-control-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevious();
              }}
              aria-label="Previous"
            >
              <PrevBtn />
            </button>

            <button
              className="control control--play-pause media-control-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (isPlaying) {
                  handlePause();
                } else {
                  handlePlay();
                }
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseBtn /> : <PlayBtn />}
            </button>

            <button
              className="control control--next media-control-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next"
            >
              <NextBtn />
            </button>

            <button
              className={`control control--shuffle media-control-button ${
                shuffle ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShuffle((prev) => !prev);
              }}
              aria-label="Shuffle"
            >
              <ShuffleBtn />
            </button>
          </div>

          <div className="control control--shuffle"></div>
        </div>
      </div>
    </>
  );
}

export default NowPlaying;
