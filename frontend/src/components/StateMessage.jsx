import "./StateMessage.css";

// Reusable loading / empty / error block. Keep it presentational — callers
// decide which variant to show and pass an onRetry handler for the error case.
export default function StateMessage({ variant, title, message, onRetry }) {
  return (
    <div className={`state state--${variant}`} role="status" aria-live="polite">
      {variant === "loading" && <span className="state__spinner" aria-hidden="true" />}
      {variant === "error" && <span className="state__icon" aria-hidden="true">⚠</span>}
      {variant === "empty" && <span className="state__icon" aria-hidden="true">∅</span>}

      {title && <p className="state__title">{title}</p>}
      {message && <p className="state__message">{message}</p>}

      {onRetry && (
        <button type="button" className="state__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
