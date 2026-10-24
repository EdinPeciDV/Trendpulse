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

### Majority-class benchmark

`train.py` also prints the accuracy of always predicting the most common
training label, and whether the model beats it:

```
test accuracy:  0.500
majority-class benchmark (predict 0): 0.500
beats benchmark: False
```

On the current small sample the baseline does not beat the benchmark, so the
reported test accuracy is not yet evidence of a learned signal.

Next: add features and grow the training window until the model clears the
benchmark.

## Model Evaluation

```
python ml/evaluate.py
```

Loads `ml/models/baseline.joblib`, rebuilds the same time-ordered test split
as `train.py` (no retraining), prints a summary, and writes
`ml/results/metrics.json` (accuracy, per-class precision/recall/F1, confusion
matrix, ROC AUC).

Results as of 2026-10-16, on 16 held-out test rows:

| metric      | value |
|-------------|-------|
| accuracy    | 0.500 |
| F1 (up)     | 0.667 |
| F1 (macro)  | 0.333 |
| ROC AUC     | 0.469 |

The model predicts "up" for every test row (confusion matrix `[[0, 8], [0, 8]]`),
so the up-class F1 comes from that class making up half of the test set, not
from any skill. An AUC below 0.5 confirms the baseline has no ranking signal yet.

## Prediction API

```
pip install -r ml/requirements.txt
uvicorn ml.api:app --reload
```

`POST /predict` takes one feature row (the six `train.py` features) and returns
the predicted next-bar direction plus the model's probability for it:

```
curl -X POST localhost:8000/predict -H "Content-Type: application/json" \
  -d '{"daily_return":0.0133,"log_return":0.0132,"ma_7":39646.37,"ma_14":39205.39,"volatility_7":0.0171,"total_volume":1718414710}'
# {"direction":"up","confidence":0.6817}
```

## Used by the signal flow

`services/signals/modelFilter.js` calls `/predict` for each rule signal when
`ML_API_URL` is set (e.g. `http://127.0.0.1:8000`):

- **confirmed**: model agrees with the buy/sell, signal kept
- **vetoed**: model disagrees with confidence >= 0.55, signal becomes "hold"
- **neutral**: weak disagreement, or the rule already says "hold"
- **skipped**: no prediction (URL unset, API down, too little history)

The model never creates a trade. If the API is unreachable, signals pass
through unchanged as "skipped".

```
ML_API_URL=http://127.0.0.1:8000 node services/signals/modelFilter.test.js
```

## Tests

Unit tests for the direction label live in `ml/test_labels.py`:

```
python -m pytest ml/test_labels.py
```

They cover known up/down sequences, a flat next bar (counts as "not up"),
too-short input, and custom column names. No pytest? Run
`python ml/test_labels.py` directly.
