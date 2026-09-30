import { PAIRS } from "../data/pairs.js";
import "./PairSelector.css";

export default function PairSelector({ value, onChange, pairs }) {
  return (
    <div className="pair-selector">
      <label htmlFor="pair-select" className="pair-selector__label">
        Pair
      </label>
      <select
        id="pair-select"
        className="pair-selector__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {pairs.map((pair) => (
          <option key={pair} value={pair}>
            {pair}
          </option>
        ))}
      </select>
    </div>
  );
}
