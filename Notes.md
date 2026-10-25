# Dev Notes
  Day 3: Set up project folders (frontend, ml, docs).
  Next: start the React app inside frontend.
- Backfilled note (Sep 27)

Day 16: RSI (Wilder's 14-period) landed in services/indicators/rsi.js
alongside the Day 15 SMA. Pure JS, index-aligned output like sma(),
exports rsi() + latestRsi(). Self-check in rsi.test.js.
Next: Day 17 signal rules (MA crossover + RSI overbought/oversold).

Day 17: MA crossover signal rule in services/signals/maCrossover.js.
Reads two SMA windows (default 10/20) and returns
{ signal: "buy"|"sell"|"hold", shortMA, longMA } — "buy" on cross-up,
"sell" on cross-down, "hold" otherwise or when there isn't enough data.
Barrel at services/signals/index.js so future rules land next to it.
Self-check in maCrossover.test.js.
Next: wire a signal into the Supabase signals table / UI.

Day 19: wired the rules to the UI via the Supabase `signals` table.
toSignalRow.js adapts per-rule outputs to the row shape useSignals reads
({ pair, type, price, change, confidence, created_at }), with per-rule
confidence (MA gap / RSI distance past threshold). publishSignals.js
runs both rules over the mock price series and either inserts rows into
Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env) or logs them
when env isn't configured.

To run:
  node services/signals/publishSignals.js       # dry run (logs rows)
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
    node services/signals/publishSignals.js     # real insert

Note: adapter emits lowercase types; the DB CHECK constraint is uppercase
(see 0001_init.sql), so publishSignals normalizes at insert time.
Next: swap the mock price source for the real `prices` table once it's
being populated.

Day 20: data cleaning + feature engineering in ml/features.py.
load_raw() reads a *_historical.csv (date, price, total_volume) with
parse_dates + ascending sort; clean() drops duplicate dates, coerces
numeric cols, forward-fills then drops NaN prices; engineer() adds
daily_return, ma_7, ma_14, volatility_7, and target_up (1 if next
day's price is higher). CLI --infile/--outfile writes ml/data/features.csv.

To run:
  python ml/features.py --infile ml/data/bitcoin_usd_historical.csv

Note: fetch_historical.py isn't in the repo yet, so ml/data/ is populated
externally for now. Schema is CoinGecko-shaped (date, price, total_volume).
Next: baseline logistic-regression on target_up as a sanity check.

Day 21: baseline price-direction model in ml/train.py.
The label lives in ml/labels.py: direction = 1 if the next bar's price
is higher, else 0. Features at row t only use data up to t and the last
row (no next price) is dropped, so there's no lookahead. train.py fits
a scaled logistic-regression on a time-ordered split (no shuffling) and
saves { model, features } to ml/models/baseline.joblib.
Next: proper evaluation against a dumb benchmark.

Day 22: evaluation + majority-class benchmark.
train.py now also prints a majority-class benchmark (always predict the
most common training label) — a model that can't beat it has learned
nothing. ml/evaluate.py reloads the saved model, rebuilds the same
held-out split and writes accuracy, F1, ROC AUC, confusion matrix and
the per-class report to ml/results/metrics.json. Honest read: on this
small sample the baseline sits at 50% and predicts "up" every time —
it's a plumbing check, not an edge.
Next: serve the model so the signal flow can ask it.

Day 23: FastAPI prediction endpoint in ml/api.py.
Loads ml/models/baseline.joblib once at startup and exposes
POST /predict: send one feature row, get back the predicted next-bar
direction ("up" / "down") and the model's confidence in it.

To run:
  uvicorn ml.api:app --reload

Day 24: model filter for rule signals in services/signals/modelFilter.js.
The rules still decide buy / sell / hold; the model only reviews them.
Verdicts: confirmed (model agrees), vetoed (model confidently disagrees
-> signal downgraded to hold), neutral (low-confidence disagreement or
rule already says hold), skipped (no prediction). The model never
creates a trade on its own, and it fails open: if ML_API_URL is unset
or the API is down, the signal passes through as "skipped".
Next: show the prediction + confidence in the UI.

Day 25: ML prediction on the signal cards.
New PredictionBadge component (frontend/src/components/PredictionBadge.jsx)
shows the model's next-bar direction (▲ up / ▼ down), its confidence, and
the Day 24 verdict as a chip (confirmed / vetoed / neutral). No prediction
or a "skipped" verdict renders a muted "model —".
Two confidences on each card now, kept clearly apart: "rule NN%" is the
rule's own confidence (MA gap / RSI distance), "model ▲ NN%" is the
classifier's probability for its predicted direction.
Mock signals carry prediction / predictionConfidence / modelVerdict;
useSignals reads model_direction / model_confidence / model_verdict
defensively but doesn't select them, since the live `signals` table has
no model columns yet.
Next: persist model fields to the DB, then deploy to Netlify.

Day 26: Netlify build config (netlify.toml at the repo root).
base = "frontend", command = "npm run build", publish = "dist", plus a
/* -> /index.html (200) fallback so react-router routes survive a refresh.
Gotcha: Netlify resolves `publish` relative to `base`, so "frontend/dist"
would point at frontend/frontend/dist. Checked with a clean `npm ci` +
build inside frontend/ (what Netlify runs). The deploy itself is done from
the Netlify UI: import the repo, accept netlify.toml, deploy.
Next: live demo link in the README once the site is up.

Day 27: unit tests for the direction label.
ml/test_labels.py checks add_direction_label on hand-picked prices:
up/down sequence, a flat next bar (0, not up), 0-1 rows (empty frame,
column still present), and custom price/label column names without
mutating the input. pytest pinned in ml/requirements.txt; the file also
runs as a plain script. ml/README now has a Tests section.
Next: make `python -m pytest` work from the repo root with no path args.

Day 28: one-command test run.
pytest.ini at the repo root (testpaths = ml), so plain `python -m pytest`
finds ml/test_labels.py without path args. Added a check that the label
column is an integer 0/1, so a dtype slip (bool/float) gets caught before
it reaches training. 5 label tests, all passing.
Next: tests for the feature builder.
