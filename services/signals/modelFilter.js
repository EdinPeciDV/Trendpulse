// services/signals/modelFilter.js
//
// Day 24 — Let the ML model confirm or veto a rule-based signal.
//
// The rule (MA crossover, RSI threshold) decides buy / sell / hold. The
// baseline model behind ml/api.py predicts the next-bar direction. We then:
//   confirmed — buy + model "up", or sell + model "down": signal kept
//   vetoed    — buy + model "down", or sell + model "up", with model
//               confidence >= minConfidence: signal downgraded to "hold"
//   neutral   — the model disagrees but isn't confident enough, or the
//               rule already says "hold": signal kept
//   skipped   — no prediction available (ML_API_URL unset, API down,
//               not enough history, no volume): signal kept
//
// The model is a filter, never a source: it can only turn a buy/sell into
// a hold, not create a trade on its own.

const ML_TIMEOUT_MS = 2000;

/**
 * Build the feature row ml/api.py expects from a price series, using the
 * same definitions as ml/features.py (pct change, log return, 7/14-bar SMA,
 * 7-bar sample std of returns).
 *
 * @param {number[]} prices       oldest → newest
 * @param {number|null} totalVolume  latest bar's traded volume
 * @returns {object|null}  null when there isn't enough data
 */
export function featuresFromPrices(prices, totalVolume) {
  if (!Array.isArray(prices) || prices.length < 15) return null;
  if (!Number.isFinite(totalVolume)) return null;

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(prices[i] / prices[i - 1] - 1);
  }
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const last7 = returns.slice(-7);
  const m = mean(last7);
  const variance = last7.reduce((a, r) => a + (r - m) ** 2, 0) / (last7.length - 1);

  const n = prices.length;
  return {
    daily_return: returns[returns.length - 1],
    log_return: Math.log(prices[n - 1] / prices[n - 2]),
    ma_7: mean(prices.slice(-7)),
    ma_14: mean(prices.slice(-14)),
    volatility_7: Math.sqrt(variance),
    total_volume: totalVolume,
  };
}

/**
 * Ask the ML API for a prediction. Never throws: any failure → null, so a
 * missing or broken model service can't stop signals from publishing.
 *
 * @param {object|null} features
 * @param {string|undefined} apiUrl   e.g. "http://127.0.0.1:8000"
 * @returns {Promise<{direction:"up"|"down", confidence:number}|null>}
 */
export async function fetchPrediction(features, apiUrl) {
  if (!features || !apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
      signal: AbortSignal.timeout(ML_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body.direction !== "up" && body.direction !== "down") return null;
    return { direction: body.direction, confidence: Number(body.confidence) };
  } catch {
    return null;
  }
}

/**
 * Combine a rule result with a model prediction.
 *
 * @param {{signal:"buy"|"sell"|"hold"}} result   any rule's SignalResult
 * @param {{direction:"up"|"down", confidence:number}|null} prediction
 * @param {object} [opts]
 * @param {number} [opts.minConfidence=0.55]  model confidence needed to veto
 * @returns {object}  the result with `signal` possibly set to "hold", plus
 *                    `model` (the prediction or null) and `modelVerdict`
 */
export function applyModelFilter(result, prediction, opts = {}) {
  const { minConfidence = 0.55 } = opts;

  if (!prediction) return { ...result, model: null, modelVerdict: "skipped" };
  if (result.signal === "hold") {
    return { ...result, model: prediction, modelVerdict: "neutral" };
  }

  const agrees =
    (result.signal === "buy" && prediction.direction === "up") ||
    (result.signal === "sell" && prediction.direction === "down");

  if (agrees) return { ...result, model: prediction, modelVerdict: "confirmed" };
  if (prediction.confidence >= minConfidence) {
    return { ...result, signal: "hold", model: prediction, modelVerdict: "vetoed" };
  }
  return { ...result, model: prediction, modelVerdict: "neutral" };
}
