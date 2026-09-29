import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <h1>TrendPulse</h1>
      <p>Crypto signals, powered by data.</p>
      <p>
        <Link to="/signals">View the latest signals →</Link>
      </p>
    </main>
  );
}
