import { useCallback, useRef, useState } from "react";

const useLongPress = (onLongPress, onClick, { delay = 500, disabled = false } = {}) => {
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const timerRef = useRef();
  const isLongPressTriggered = useRef(false);

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
  }, []);

  const start = useCallback(
    (event) => {
      if (disabled || event.type === 'mousedown') return;

      isLongPressTriggered.current = false;
      timerRef.current = setTimeout(() => {
        onLongPress(event);
        isLongPressTriggered.current = true;
        setIsLongPressActive(true);
      }, delay);
    },
    [onLongPress, delay, disabled]
  );

  const stop = useCallback(
    (event) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (!isLongPressTriggered.current && onClick) {
        onClick(event);
      }
      
      setIsLongPressActive(false);
    },
    [onClick]
  );

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onContextMenu: handleContextMenu,
  };
};

export default useLongPress;
