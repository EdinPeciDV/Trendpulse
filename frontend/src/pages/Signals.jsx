import { useState } from "react";
import PairSelector from "../components/PairSelector.jsx";
import PriceChart from "../components/PriceChart.jsx";
import SignalsList from "../components/SignalsList.jsx";
import { useSignals } from "../hooks/useSignals.js";
import { DEFAULT_PAIR } from "../data/pairs.js";

export default function Signals() {
  const [selectedPair, setSelectedPair] = useState(DEFAULT_PAIR);
  const { status, signals, error, reload } = useSignals(selectedPair);

  return (
    <main>
      <PairSelector value={selectedPair} onChange={setSelectedPair} />
      <PriceChart pair={selectedPair} />
      <SignalsList
        signals={signals}
        status={status}
        error={error}
        onRetry={reload}
      />
    </main>
  );
}
