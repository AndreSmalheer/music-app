import "./Skeleton.css";

function Skeleton({ width, height, borderRadius, style }) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || "100%",
        height: height || "1rem",
        borderRadius: borderRadius || "4px",
        ...style,
      }}
    />
  );
}

export default Skeleton;
