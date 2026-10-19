# TrendPulse

> **Note:** This is the open, demo version of TrendPulse. It runs on sample
> data and is not wired to a live backend — the production app with live
> signals is private.

> Crypto market signals dashboard — live prices, technical indicators, and ML-driven price-direction predictions.

TrendPulse pulls market data for crypto pairs, computes technical indicators (moving averages, RSI), generates buy/sell signals, and layers on a machine-learning model that predicts short-term price direction. Built as a full-stack learning project.

## Planned stack

- **Frontend:** React (Vite), chart library for price visualization
- **Backend / data:** Supabase (Postgres + edge functions)
- **ML pipeline:** Python (pandas, scikit-learn), FastAPI for serving predictions
- **Deploy:** Netlify (frontend)

## Roadmap

- [x] Frontend scaffold — Vite + React, routing, landing page
- [x] Layout, navigation, and core UI components
- [x] Signals list and price chart (mock data)
- [x] Theme and styling
- [x] Supabase project + schema (prices, signals)
- [x] Fetch live market data and store it
- [x] Wire frontend to real Supabase data
- [x] Indicators: moving average, RSI
- [x] Signal rules (e.g. MA crossover)
- [x] Python ML pipeline — data pull, cleaning, features
- [x] Baseline model (price direction up/down) + evaluation
- [x] Prediction endpoint and integration into signal flow
- [x] Show predictions + confidence in the UI
- [ ] Deploy to Netlify + live demo link
- [ ] Screenshots / GIF in README
- [ ] Full README (features, architecture, run steps)
- [ ] Tests for one module
- [ ] Launch polish (pin repo, profile README, blurb)

## Status

🚧 In active development. Follow along — commits land daily.

## License

[MIT](LICENSE) © Edin Peci
