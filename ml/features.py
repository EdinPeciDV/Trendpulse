"""Data cleaning + feature engineering for TrendPulse ML.

Reads a historical price CSV produced by fetch_historical.py and writes
a features CSV ready for modeling.
"""

import argparse
from pathlib import Path

import pandas as pd


def load_raw(path):
    df = pd.read_csv(path, parse_dates=["date"])
    df = df.sort_values("date").reset_index(drop=True)
    return df


def clean(df):
    df = df.drop_duplicates(subset="date", keep="last")
    for col in ("price", "total_volume"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    df["price"] = df["price"].ffill()
    df = df.dropna(subset=["price"]).reset_index(drop=True)
    return df


def engineer(df):
    df = df.copy()
    df["daily_return"] = df["price"].pct_change()
    df["ma_7"] = df["price"].rolling(window=7).mean()
    df["ma_14"] = df["price"].rolling(window=14).mean()
    df["volatility_7"] = df["daily_return"].rolling(window=7).std()
    df["target_up"] = (df["price"].shift(-1) > df["price"]).astype(int)
    # The last row has no next-day price, so its target is undefined.
    df.loc[df.index[-1], "target_up"] = pd.NA
    return df


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--infile", required=True, help="raw historical CSV")
    parser.add_argument(
        "--outfile",
        default="ml/data/features.csv",
        help="output features CSV (default: ml/data/features.csv)",
    )
    args = parser.parse_args()

    df = load_raw(args.infile)
    df = clean(df)
    df = engineer(df)

    out = Path(args.outfile)
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    print(f"wrote {len(df)} rows to {out}")


if __name__ == "__main__":
    main()
