# ml

ML pipeline for TrendPulse.

## Setup

```
pip install -r ml/requirements.txt
```

## Build the feature set

Day 19 pulls raw history into `ml/data/*_historical.csv`. Day 20 turns that
into a model-ready table:

```
python ml/features.py --infile ml/data/bitcoin_usd_historical.csv
```

Writes `ml/data/features.csv` with:

- `daily_return`, `log_return` — percent and log returns of `price`
- `ma_7`, `ma_14` — rolling means
- `volatility_7` — rolling std of `daily_return`
- `target_up` — 1 if next day's price is higher, else 0 (NA on last row)

## Self-check

```
python ml/features_check.py
```

Prints `features self-check: OK` on success, exits non-zero on failure.
