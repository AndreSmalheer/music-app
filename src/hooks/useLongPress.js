import { useCallback, useRef, useState } from "react";

const useLongPress = (
  onLongPress,
  onClick,
  { delay = 500, disabled = false } = {},
) => {
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const timerRef = useRef();
  const isLongPressTriggered = useRef(false);

  const startX = useRef(0);
  const startY = useRef(0);

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
  }, []);

  const start = useCallback(
    (event) => {
      if (disabled || event.type === "mousedown") return;

      isLongPressTriggered.current = false;

      if (event.touches?.length) {
        startX.current = event.touches[0].clientX;
        startY.current = event.touches[0].clientY;
      }

      timerRef.current = setTimeout(() => {
        onLongPress(event);
        isLongPressTriggered.current = true;
        setIsLongPressActive(true);
      }, delay);
    },
    [onLongPress, delay, disabled],
  );

  const move = useCallback((event) => {
    if (!event.touches?.length) return;

    const dx = Math.abs(event.touches[0].clientX - startX.current);
    const dy = Math.abs(event.touches[0].clientY - startY.current);

    if (dx > 10 || dy > 10) {
      clear();
    }
  }, []);

  const stop = useCallback(
    (event) => {
      clear();

      if (!isLongPressTriggered.current && onClick) {
        onClick(event);
      }

      setIsLongPressActive(false);
    },
    [onClick],
  );

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: stop,
    onTouchCancel: stop,
    onContextMenu: handleContextMenu,
  };
};

export default useLongPress;
