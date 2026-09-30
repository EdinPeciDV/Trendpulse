import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getSeries } from "../data/mockPrices.js";
import "./PriceChart.css";

export default function PriceChart({ pair }) {
  const data = getSeries(pair);

  if (data.length === 0) {
    return (
      <section className="price-chart">
        <h2 className="price-chart__heading">Price</h2>
        <p className="price-chart__empty">No price data for {pair}.</p>
      </section>
    );
  }

  return (
    <section className="price-chart">
      <h2 className="price-chart__heading">{pair} — last 30h (mock)</h2>
      <div className="price-chart__canvas">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              stroke="var(--border)"
              minTickGap={24}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              stroke="var(--border)"
              width={64}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-h)",
              }}
              labelStyle={{ color: "var(--muted)" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
