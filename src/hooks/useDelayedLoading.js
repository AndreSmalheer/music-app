import { useState, useEffect } from "react";

/**
 * A custom hook to delay the appearance of loading indicators/skeletons.
 * This prevents visual flashing/flickering for fast API calls.
 * 
 * @param {boolean} isLoading - The actual loading state from API/state.
 * @param {number} delay - The duration to wait before showing the loading state (ms).
 * @returns {boolean} Whether to display the loading state.
 */
export default function useDelayedLoading(isLoading, delay = 150) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, delay]);

  return showLoading;
}
