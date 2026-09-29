import { useState } from "react";
import PairSelector from "../components/PairSelector.jsx";
import SignalsList from "../components/SignalsList.jsx";
import { mockSignals } from "../data/mockSignals.js";
import { DEFAULT_PAIR } from "../data/pairs.js";

export default function Signals() {
  const [selectedPair, setSelectedPair] = useState(DEFAULT_PAIR);
  const filtered = mockSignals.filter((s) => s.pair === selectedPair);

  return (
    <main>
      <PairSelector value={selectedPair} onChange={setSelectedPair} />
      <p>Showing signals for: {selectedPair}</p>
      <SignalsList signals={filtered} />
    </main>
  );
}
