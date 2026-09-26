import "./SignalsList.css";

// Formats a price sensibly whether it's $63k or $0.44
function formatPrice(price) {
  const digits = price < 1 ? 4 : 2;
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

// "08:15" style time from an ISO string
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SignalCard({ signal }) {
  const { pair, type, price, change, confidence, time } = signal;
  const changeUp = change >= 0;

  return (
    <div className="signal-card">
      <div className="signal-card__top">
        <span className="signal-card__pair">{pair}</span>
        <span className={`signal-badge signal-badge--${type.toLowerCase()}`}>{type}</span>
      </div>

      <div className="signal-card__price">{formatPrice(price)}</div>

      <div className="signal-card__meta">
        <span className={changeUp ? "change change--up" : "change change--down"}>
          {changeUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
        </span>
        <span className="signal-card__conf">conf {Math.round(confidence * 100)}%</span>
        <span className="signal-card__time">{formatTime(time)}</span>
      </div>
    </div>
  );
}
