"""Self-check for ml/features.py.

Run with:  python ml/features_check.py
Exits non-zero on failure so it can be wired into CI later.
"""

import sys
from io import StringIO

import pandas as pd

from features import clean, engineer, load_raw


def _sample_csv():
    # 20 rows, with one duplicate date (row 5) and one NaN price (row 7)
    rows = [
        ("2024-01-01", 40000.0, 1.0e9),
        ("2024-01-02", 40100.0, 1.1e9),
        ("2024-01-03", 40250.0, 1.2e9),
        ("2024-01-04", 40180.0, 1.3e9),
        ("2024-01-05", 40400.0, 1.4e9),
        ("2024-01-05", 40400.0, 1.4e9),  # duplicate
        ("2024-01-06", 40550.0, 1.5e9),
        ("2024-01-07", "",      1.6e9),  # NaN price -> ffilled
        ("2024-01-08", 40700.0, 1.7e9),
        ("2024-01-09", 40820.0, 1.8e9),
        ("2024-01-10", 40900.0, 1.9e9),
        ("2024-01-11", 41050.0, 2.0e9),
        ("2024-01-12", 41200.0, 2.1e9),
        ("2024-01-13", 41150.0, 2.2e9),
        ("2024-01-14", 41300.0, 2.3e9),
        ("2024-01-15", 41450.0, 2.4e9),
        ("2024-01-16", 41600.0, 2.5e9),
        ("2024-01-17", 41550.0, 2.6e9),
        ("2024-01-18", 41700.0, 2.7e9),
        ("2024-01-19", 41820.0, 2.8e9),
    ]
    buf = StringIO("date,price,total_volume\n" + "\n".join(
        f"{d},{p},{v}" for d, p, v in rows
    ))
    return buf


def main():
    df = load_raw(_sample_csv())
    assert list(df.columns) == ["date", "price", "total_volume"], df.columns
    assert df["date"].is_monotonic_increasing, "load_raw must sort ascending"

    df = clean(df)
    assert df["date"].is_unique, "clean must drop duplicate dates"
    assert df["price"].notna().all(), "clean must leave no NaN prices"
    assert pd.api.types.is_numeric_dtype(df["price"]), "price must be numeric"
    assert pd.api.types.is_numeric_dtype(df["total_volume"]), "total_volume must be numeric"

    df = engineer(df)
    for col in ("daily_return", "ma_7", "ma_14", "volatility_7", "target_up"):
        assert col in df.columns, f"missing {col}"

    # After the 14-day warmup, feature cols should be fully populated.
    tail = df.iloc[14:]
    for col in ("daily_return", "ma_7", "ma_14", "volatility_7"):
        assert tail[col].isna().sum() == 0, f"NaN in {col} after warmup"

    # target_up is undefined on the last row only.
    assert df["target_up"].iloc[:-1].notna().all(), "target_up missing before last row"
    assert pd.isna(df["target_up"].iloc[-1]), "last row target_up should be NA"
    assert set(df["target_up"].iloc[:-1].astype(int).unique()) <= {0, 1}, "target_up must be 0/1"

    print("features self-check: OK")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print(f"features self-check: FAIL — {e}", file=sys.stderr)
        sys.exit(1)
