"""Unit tests for ml/features.py (cleaning + feature engineering).

Run with:  python -m pytest ml/test_features.py
"""

import pandas as pd

from features import clean


def test_clean_drops_duplicate_dates_keeping_last():
    df = pd.DataFrame({
        "date": pd.to_datetime(["2026-01-01", "2026-01-01", "2026-01-02"]),
        "price": [1.0, 2.0, 3.0],
    })
    out = clean(df)
    assert out["price"].tolist() == [2.0, 3.0]
    assert out.index.tolist() == [0, 1]


def test_clean_coerces_bad_prices_and_forward_fills():
    df = pd.DataFrame({
        "date": pd.to_datetime(["2026-01-01", "2026-01-02", "2026-01-03"]),
        "price": ["10", "oops", "12"],
        "total_volume": ["5", "x", "7"],
    })
    out = clean(df)
    assert out["price"].tolist() == [10.0, 10.0, 12.0]
    assert out["total_volume"].isna().tolist() == [False, True, False]


def test_clean_drops_leading_rows_with_no_price():
    df = pd.DataFrame({
        "date": pd.to_datetime(["2026-01-01", "2026-01-02"]),
        "price": [None, 4.0],
    })
    out = clean(df)
    assert out["price"].tolist() == [4.0]
