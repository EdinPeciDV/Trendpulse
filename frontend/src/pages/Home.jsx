export default function Home() {
  return (
    <main>
      <h1>TrendPulse</h1>
      <p>Crypto signals, powered by data.</p>
      <SignalsList signals={mockSignals} />
    </main>
  );
}
