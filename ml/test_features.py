"""Unit tests for ml/features.py (cleaning + feature engineering).

Run with:  python -m pytest ml/test_features.py
"""

import math

import pandas as pd

from features import clean, engineer


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


def _prices(values):
    return pd.DataFrame({"price": [float(v) for v in values]})


def test_engineer_returns_and_moving_averages():
    out = engineer(_prices(range(1, 15)))  # 1..14
    assert math.isnan(out["daily_return"][0])
    assert out["daily_return"][1] == 1.0  # 1 -> 2 is +100%
    assert math.isclose(out["log_return"][1], math.log(2))
    assert out["ma_7"][:6].isna().all()
    assert out["ma_7"][6] == 4.0  # mean of 1..7
    assert out["ma_14"][13] == 7.5  # mean of 1..14


def test_engineer_target_up_and_last_row_is_na():
    out = engineer(_prices([3, 5, 4, 4]))
    assert out["target_up"][:3].tolist() == [1, 0, 0]
    assert pd.isna(out["target_up"].iloc[-1])


def test_engineer_does_not_mutate_input():
    df = _prices([1, 2, 3])
    engineer(df)
    assert list(df.columns) == ["price"]
