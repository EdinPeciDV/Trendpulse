"""Train a baseline price-direction model (up/down) for TrendPulse.

Loads ml/data/features.csv, adds the direction label, does a time-ordered
train/test split (no shuffling), fits a scaled LogisticRegression, prints
accuracy, and saves the fitted pipeline to ml/models/baseline.joblib.

Run from the repo root:  python ml/train.py
"""

import sys
from pathlib import Path

import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

sys.path.insert(0, str(Path(__file__).resolve().parent))
from labels import load_labeled  # noqa: E402

FEATURES = ["daily_return", "log_return", "ma_7", "ma_14", "volatility_7", "total_volume"]
LABEL = "direction"
TEST_FRACTION = 0.2
MODEL_PATH = Path("ml/models/baseline.joblib")


def main():
    df = load_labeled()
    # Rolling windows leave NaNs in the earliest rows; drop them.
    df = df.dropna(subset=FEATURES).reset_index(drop=True)

    split = int(len(df) * (1 - TEST_FRACTION))
    train, test = df.iloc[:split], df.iloc[split:]
    X_train, y_train = train[FEATURES], train[LABEL]
    X_test, y_test = test[FEATURES], test[LABEL]

    model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    model.fit(X_train, y_train)

    print(f"rows: train={len(train)} test={len(test)}")
    print(f"train accuracy: {model.score(X_train, y_train):.3f}")
    print(f"test accuracy:  {model.score(X_test, y_test):.3f}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "features": FEATURES}, MODEL_PATH)
    print(f"saved model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
