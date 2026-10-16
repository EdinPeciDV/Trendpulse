"""Prediction API for the TrendPulse baseline price-direction model.

Serves ml/models/baseline.joblib (written by train.py) behind a single
POST /predict endpoint: send one feature row, get back the predicted
next-bar direction ("up" / "down") and the model's confidence in it.

Run from the repo root:  uvicorn ml.api:app --reload
"""

from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

MODEL_PATH = Path(__file__).resolve().parent / "models" / "baseline.joblib"

bundle = joblib.load(MODEL_PATH)
model, FEATURES = bundle["model"], bundle["features"]

app = FastAPI(title="TrendPulse ML")


class FeatureRow(BaseModel):
    """One row of the engineered features from features.py."""

    daily_return: float
    log_return: float
    ma_7: float
    ma_14: float
    volatility_7: float
    total_volume: float


class Prediction(BaseModel):
    direction: str  # "up" | "down"
    confidence: float  # probability of the predicted direction, 0..1


@app.post("/predict", response_model=Prediction)
def predict(row: FeatureRow) -> Prediction:
    # Column order must match training, so build the frame from FEATURES.
    X = pd.DataFrame([row.model_dump()])[FEATURES]
    p_up = float(model.predict_proba(X)[0, 1])
    direction = "up" if p_up >= 0.5 else "down"
    confidence = p_up if direction == "up" else 1 - p_up
    return Prediction(direction=direction, confidence=round(confidence, 4))
