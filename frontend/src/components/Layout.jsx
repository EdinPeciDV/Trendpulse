import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header>
        <h1>TrendPulse</h1>
        <nav>
          <Link to="/">Home</Link>{" | "}
          <Link to="/signals">Signals</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>© 2026 TrendPulse · Edin Peci</p>
      </footer>
    </div>
  );
}
