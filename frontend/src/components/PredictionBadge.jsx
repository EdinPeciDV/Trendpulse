import "./PredictionBadge.css";

// The ML model's view of a signal: next-bar direction, its confidence, and
// whether it confirmed / vetoed / left the rule signal alone (Day 24 filter).
// No prediction (API down, not enough history) renders a muted placeholder.
export default function PredictionBadge({ direction, confidence, verdict }) {
  if (direction == null || verdict === "skipped") {
    return <span className="prediction prediction--empty">model —</span>;
  }

  const up = direction === "up";

  return (
    <span className="prediction">
      <span className="prediction__label">model</span>
      <span className={up ? "prediction__dir prediction__dir--up" : "prediction__dir prediction__dir--down"}>
        {up ? "▲" : "▼"} {Math.round(confidence * 100)}%
      </span>
      {verdict && (
        <span className={`prediction__verdict prediction__verdict--${verdict}`}>{verdict}</span>
      )}
    </span>
  );
}
