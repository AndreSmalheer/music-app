import "./ServerOffline.css";
import { useModal } from "../../context/ModalContext";

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
      "Enter new server URL",
      (newUrl) => {
        console.log("New URL:", newUrl);
        // TODO: Handle URL change logic
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
