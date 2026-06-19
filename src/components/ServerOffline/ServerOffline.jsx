import { useState } from "react";
import "./ServerOffline.css";
import { useModal } from "../../context/ModalContext";
import { BASE_URL, setBaseUrl } from "../../services/api";

function ServerOffline({ onRetry }) {
  const { showInput } = useModal();
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  async function handleRetry() {
    setStatusMessage("");
    if (onRetry) {
      const isOnline = await onRetry();
      if (!isOnline) {
        setIsSuccess(false);
        setStatusMessage("Failed to connect to the server. Please try again.");
        setTimeout(() => {
          setStatusMessage("");
        }, 3000);
      }
    } else {
      window.location.reload();
    }
  }

  function handleChangeUrl() {
    showInput(
      "Change Server URL",
      "http://",
      async (newUrl) => {
        if (newUrl) {
          let formattedUrl = newUrl.trim();
          if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = "http://" + formattedUrl;
          }
          setBaseUrl(formattedUrl);
          setIsSuccess(true);
          setStatusMessage(`Server URL updated to ${formattedUrl} successfully!`);
          setTimeout(() => {
            setStatusMessage("");
          }, 3000);

          if (onRetry) {
            const isOnline = await onRetry();
            if (!isOnline) {
              setIsSuccess(false);
              setStatusMessage("Failed to connect to the server with the new URL.");
              setTimeout(() => {
                setStatusMessage("");
              }, 3000);
            }
          }
        }
      },
      BASE_URL
    );
  }

  return (
    <div className="offline-container">
      <div>
        <div className="offline-card">
          <h1 className="offline-title">Server Offline</h1>

          <p className="offline-text">
            We’re having trouble connecting to the server right now. Please
            check your connection or try again in a moment.
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

        {statusMessage && (
          <p
            className="offline-status-message"
            style={{ color: isSuccess ? "#4caf50" : "#f44336" }}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default ServerOffline;
