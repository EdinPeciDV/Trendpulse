import SignalCard from "./SignalCard";
import StateMessage from "./StateMessage.jsx";
import "./SignalsList.css";

// status defaults to "success" so any existing caller that just passes
// `signals` keeps working unchanged.
export default function SignalsList({
  signals = [],
  status = "success",
  error = null,
  onRetry,
}) {
  if (status === "loading") {
    return <StateMessage variant="loading" title="Loading signals…" />;
  }

  if (status === "error") {
    return (
      <StateMessage
        variant="error"
        title="Something went wrong"
        message={error ?? "Couldn't load signals."}
        onRetry={onRetry}
      />
    );
  }

  if (signals.length === 0) {
    return (
      <StateMessage
        variant="empty"
        title="No signals yet"
        message="Nothing for this pair right now — check back soon."
      />
    );
  }

  return (
    <section className="signals">
      <h2 className="signals__heading">Latest Signals</h2>
      <div className="signals__grid">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </section>
  );
}
