"""
Convert an investing.com BSE 500 historical CSV to data/bse500_index.csv.

Usage:
    python scripts/import_bse500.py path/to/BSE500_Historical_Data.csv

The investing.com CSV must have columns: Date, Price
Date format expected: DD-MM-YYYY  (e.g. "02-02-2023")
Price format:         comma-separated number (e.g. "25,167.54")
"""

import csv
import os
import sys
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUT_PATH = os.path.join(DATA_DIR, "bse500_index.csv")


def parse_investing_csv(path):
    result = {}
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_date = row.get("Date", "").strip().strip('"')
            raw_price = row.get("Price", "").strip().strip('"').replace(",", "")
            if not raw_date or not raw_price:
                continue
            try:
                date = datetime.strptime(raw_date, "%d-%m-%Y").strftime("%Y-%m-%d")
                close = float(raw_price)
                result[date] = close
            except (ValueError, KeyError):
                continue
    return result


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    src = sys.argv[1]
    if not os.path.exists(src):
        print(f"File not found: {src}")
        sys.exit(1)

    data = parse_investing_csv(src)
    if not data:
        print("No valid rows parsed. Check that the CSV has Date and Price columns.")
        sys.exit(1)

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUT_PATH, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["date", "close"])
        for d in sorted(data.keys()):
            writer.writerow([d, data[d]])

    print(f"Wrote {len(data)} rows to {OUT_PATH}  ({min(data.keys())} → {max(data.keys())})")


if __name__ == "__main__":
    main()
