import SignalsList from "../components/SignalsList.jsx";
import { mockSignals } from "../data/mockSignals.js";

export default function Signals() {
  return (
    <main>
      <SignalsList signals={mockSignals} />
    </main>
  );
}
