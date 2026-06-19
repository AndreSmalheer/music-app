import "./ServerOffline.css";
import { useModal } from "../../context/ModalContext";
import { setBaseUrl } from "../../services/api";

function ServerOffline({ onRetry }) {
  const { showInput } = useModal();

  function handleRetry() {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }

  function handleChangeUrl() {
    showInput(
      "Change Server URL",
      "http://",
      (newUrl) => {
        if (newUrl) {
          let formattedUrl = newUrl.trim();
          if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = "http://" + formattedUrl;
          }
          setBaseUrl(formattedUrl);
          if (onRetry) {
            onRetry();
          }
        }
      }
    );
  }

  return (
    <div className="offline-container">
      <div className="offline-card">
        <h1 className="offline-title">Server Offline</h1>

        <p className="offline-text">
          We’re having trouble connecting to the server right now. Please check
          your connection or try again in a moment.
        </p>

        <div className="offline-actions">
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
          <button className="change-url-button" onClick={handleChangeUrl}>
            Change Server URL
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServerOffline;
