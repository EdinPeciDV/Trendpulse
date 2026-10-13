# ml

ML pipeline for TrendPulse.

## Data pipeline

```
fetch historical  ->  clean  ->  feature-engineer  ->  model-ready CSV
```

- Raw pulls land in `ml/data/raw/` (one `*_historical.csv` per asset).
- Cleaning + feature engineering writes to `ml/data/processed/features.csv`.
- Everything under `ml/data/` is gitignored except the `.gitkeep` markers.

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

## Train the baseline model

```
python ml/train.py
```

- `ml/labels.py` adds `direction`: 1 if the next price is higher, else 0.
  The last row has no future price and is dropped.
- Split is time-ordered: the earliest 80% of rows train, the latest 20% test.
- Model is `StandardScaler` + `LogisticRegression`; prints train/test accuracy.
- Saves the fitted pipeline to `ml/models/baseline.joblib` (committed, it is small).
