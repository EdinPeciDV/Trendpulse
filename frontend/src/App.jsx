export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>TrendPulse</h1>
      <h2>Live signals</h2>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>BTC / USDT</span>
          <span className="badge badge-buy">BUY</span>
        </div>
        <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>
          MA crossover · <span className="text-up">+2.4%</span>
        </p>
      </div>
    </div>
  );
}