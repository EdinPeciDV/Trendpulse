"""Binary price-direction label for TrendPulse ML.

direction = 1 if the next period's price is higher than the current one,
else 0. The label at row t uses price at t+1, but features at row t only
use data up to t, so nothing from the future leaks into the inputs. The
final row has no next price and is dropped.
"""

import pandas as pd


def add_direction_label(df, price_col="price", label_col="direction"):
    df = df.copy()
    next_price = df[price_col].shift(-1)
    df[label_col] = (next_price > df[price_col]).astype(int)
    # Last row has no future price, so its label is undefined.
    df = df[next_price.notna()].reset_index(drop=True)
    return df


def load_labeled(path="ml/data/features.csv"):
    df = pd.read_csv(path, parse_dates=["date"]).sort_values("date")
    return add_direction_label(df.reset_index(drop=True))
