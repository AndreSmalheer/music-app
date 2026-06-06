import { useRef, useEffect } from "react";
import "./Slider.css";

function Slider({ value, max, onChange, onDragStart, onDragEnd, className }) {
  const isDragging = useRef(false);
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const latestX = useRef(null);
  const rafId = useRef(null);

  const getPercentage = (clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const updatePosition = (clientX) => {
    const percentage = getPercentage(clientX);
    if (fillRef.current) {
      fillRef.current.style.width = `${percentage * 100}%`;
    }
    onChange(percentage * max);
  };

  const seekLoop = () => {
    if (latestX.current !== null) {
      updatePosition(latestX.current);
    }
    if (isDragging.current) {
      rafId.current = requestAnimationFrame(seekLoop);
    }
  };

  const handlePointerDown = (e) => {
    isDragging.current = true;
    latestX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.setAttribute("data-dragging", "true");
    rafId.current = requestAnimationFrame(seekLoop);
    updatePosition(e.clientX);
    onDragStart?.();
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    latestX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    latestX.current = null;
    cancelAnimationFrame(rafId.current);
    e.currentTarget.setAttribute("data-dragging", "false");
    updatePosition(e.clientX);
    onDragEnd?.();
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      latestX.current = e.clientX;
    };

    el.addEventListener("pointermove", onMove, { passive: false });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      className={`progress-bar-track ${className || ""}`}
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={(e) => {
        isDragging.current = false;
        e.currentTarget.setAttribute("data-dragging", "false");
        onDragEnd?.();
      }}
      style={{ touchAction: "none", cursor: "pointer" }}
    >
      <div
        className="progress-bar-fill"
        ref={fillRef}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

export default Slider;
