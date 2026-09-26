import SignalCard from "./SignalCard";
import "./SignalsList.css";

export default function SignalsList({ signals = [] }) {
  if (signals.length === 0) {
    return <p className="signals-empty">No signals yet.</p>;
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
