# TrendPulse

> Crypto market signals dashboard — live prices, technical indicators, and ML-driven price-direction predictions.

TrendPulse pulls market data for crypto pairs, computes technical indicators (moving averages, RSI), generates buy/sell signals, and layers on a machine-learning model that predicts short-term price direction. Built as a full-stack learning project.

## Planned stack

- **Frontend:** React (Vite), chart library for price visualization
- **Backend / data:** Supabase (Postgres + edge functions)
- **ML pipeline:** Python (pandas, scikit-learn), FastAPI for serving predictions
- **Deploy:** Netlify (frontend)

## Roadmap

- [ ] Frontend scaffold — Vite + React, routing, landing page
- [ ] Layout, navigation, and core UI components
- [ ] Signals list and price chart (mock data)
- [ ] Theme and styling
- [ ] Supabase project + schema (prices, signals)
- [ ] Fetch live market data and store it
- [ ] Wire frontend to real Supabase data
- [ ] Indicators: moving average, RSI
- [ ] Signal rules (e.g. MA crossover)
- [ ] Python ML pipeline — data pull, cleaning, features
- [ ] Baseline model (price direction up/down) + evaluation
- [ ] Prediction endpoint and integration into signal flow
- [ ] Show predictions + confidence in the UI
- [ ] Deploy, screenshots, full README, tests

## Status

🚧 In active development. Follow along — commits land daily.

## License

[MIT](LICENSE) © Edin Peci
