import "./ServerOffline.css";

function ServerOffline({ onRetry }) {
  function handleRetry() {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="offline-container">
      <div className="offline-card">
        <h1 className="offline-title">Server Offline</h1>

        <p className="offline-text">
          We’re having trouble connecting to the server right now. Please check
          your connection or try again in a moment.
        </p>

        <button className="retry-button" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
}

export default ServerOffline;
