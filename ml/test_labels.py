"""Unit tests for ml/labels.py (the next-bar direction label).

Run with:  python -m pytest ml/test_labels.py
       or:  python ml/test_labels.py   (no pytest needed)
"""

import sys

import pandas as pd

from labels import add_direction_label


def test_known_prices_give_next_bar_direction():
    df = pd.DataFrame({"price": [10.0, 12.0, 11.0, 15.0, 14.0]})
    out = add_direction_label(df)
    # 10->12 up, 12->11 down, 11->15 up, 15->14 down; last row has no next bar.
    assert out["direction"].tolist() == [1, 0, 1, 0]
    assert out["price"].tolist() == [10.0, 12.0, 11.0, 15.0]


def test_equal_next_price_is_not_up():
    # Boundary: a flat next bar counts as "not up" (0), not as up.
    out = add_direction_label(pd.DataFrame({"price": [5.0, 5.0, 6.0]}))
    assert out["direction"].tolist() == [0, 1]


def test_too_short_input_yields_empty_frame():
    # Edge: with one row (or none) there is no next price to label.
    for prices in ([7.0], []):
        out = add_direction_label(pd.DataFrame({"price": prices}))
        assert len(out) == 0
        assert "direction" in out.columns


def test_input_is_not_mutated_and_columns_are_configurable():
    df = pd.DataFrame({"close": [1.0, 2.0, 1.5]})
    out = add_direction_label(df, price_col="close", label_col="up")
    assert out["up"].tolist() == [1, 0]
    assert list(df.columns) == ["close"] and len(df) == 3
    assert out.index.tolist() == [0, 1]


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
    print(f"labels tests: {len(tests)} passed")
    sys.exit(0)
