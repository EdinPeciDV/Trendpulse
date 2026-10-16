"""Evaluate the saved baseline price-direction model on the held-out test split.

Loads ml/models/baseline.joblib, rebuilds the same time-ordered test split
train.py used (latest 20% of rows, no shuffling), and writes classification
metrics to ml/results/metrics.json. Does not retrain.

Run from the repo root:  python ml/evaluate.py
"""

import json
import sys
from datetime import date
from pathlib import Path

import joblib
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from labels import load_labeled  # noqa: E402
from train import LABEL, MODEL_PATH, TEST_FRACTION  # noqa: E402

RESULTS_PATH = Path("ml/results/metrics.json")


def main():
    bundle = joblib.load(MODEL_PATH)
    model, features = bundle["model"], bundle["features"]

    # Same filtering and split as train.py so the test rows are identical.
    df = load_labeled()
    df = df.dropna(subset=features).reset_index(drop=True)
    split = int(len(df) * (1 - TEST_FRACTION))
    test = df.iloc[split:]
    X_test, y_test = test[features], test[LABEL]

    y_pred = model.predict(X_test)
    report = classification_report(
        y_test, y_pred, labels=[0, 1], target_names=["down", "up"],
        output_dict=True, zero_division=0,
    )

    auc = None
    if hasattr(model, "predict_proba") and y_test.nunique() > 1:
        auc = float(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))

    metrics = {
        "date": date.today().isoformat(),
        "model": MODEL_PATH.as_posix(),
        "test_size": int(len(test)),
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "f1_up": report["up"]["f1-score"],
        "f1_macro": report["macro avg"]["f1-score"],
        "roc_auc": auc,
        "confusion_matrix": confusion_matrix(y_test, y_pred, labels=[0, 1]).tolist(),
        "classification_report": report,
    }

    RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(metrics, indent=2))

    print(f"test rows: {metrics['test_size']}")
    print(f"accuracy:  {metrics['accuracy']:.3f}")
    print(f"f1 (up):   {metrics['f1_up']:.3f}")
    print(f"f1 macro:  {metrics['f1_macro']:.3f}")
    print(f"roc auc:   {'n/a' if auc is None else f'{auc:.3f}'}")
    print("confusion matrix [rows=true down/up, cols=pred down/up]:")
    for row in metrics["confusion_matrix"]:
        print(f"  {row}")
    print(classification_report(
        y_test, y_pred, labels=[0, 1], target_names=["down", "up"], zero_division=0,
    ))
    print(f"wrote metrics to {RESULTS_PATH}")


if __name__ == "__main__":
    main()
