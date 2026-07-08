"""
Monthly trailing-3Y snapshot generator.

For each month-end date, computes trailing 3-year metrics for the portfolio
(and the S&P BSE 500 benchmark side-by-side) and appends the record to
data/monthly_snapshots.json.

Metrics captured per snapshot (matching a standard fund fact-card):
  - Starting NAV / Ending NAV (portfolio index and benchmark index)
  - Trailing 3-Year Return (CAGR)
  - Volatility (3Y, annualised)
  - Sharpe Ratio (3Y, Rf = 7%)
  - Beta (3Y)
  - Correlation (3Y)
  - Jensen's Alpha (3Y, annualised)
  - Max Drawdown (3Y)
  - Taxable status (equity mutual fund taxation — LTCG/STCG applicable)

Usage:
  python scripts/monthly_snapshot.py                   # snapshot for prior month-end
  python scripts/monthly_snapshot.py 2026-06-30        # snapshot for a specific date
  python scripts/monthly_snapshot.py --backfill        # backfill all past month-ends

The file is idempotent — re-running for an existing snapshot date updates it in place.
"""

import json
import math
import os
import statistics
import sys
from datetime import datetime, date, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PORTFOLIO_PATH = os.path.join(DATA_DIR, "portfolio.json")
SNAPSHOTS_PATH = os.path.join(DATA_DIR, "monthly_snapshots.json")

RF_RATE = 0.07
BENCHMARK_NAME = "S&P BSE 500"
TAXABLE_NOTE = "Yes — Indian mutual-fund taxation (LTCG 12.5% > ₹1.25L / STCG 20% for equity; slab-rate for debt-heavy underlying schemes)"


def load_series():
    pj = json.load(open(PORTFOLIO_PATH))
    return pj["series"]


def nearest_trading_day(series, target_date, direction):
    """direction='ge' → first trading day >= target; 'le' → last trading day <= target."""
    if direction == "ge":
        return next((s for s in series if s["date"] >= target_date), None)
    return next((s for s in reversed(series) if s["date"] <= target_date), None)


def month_end(year, month):
    """Return YYYY-MM-DD of the last calendar day of the given month."""
    if month == 12:
        first_next = date(year + 1, 1, 1)
    else:
        first_next = date(year, month + 1, 1)
    return (first_next - timedelta(days=1)).strftime("%Y-%m-%d")


def compute_snapshot(series, end_date_str):
    """Compute trailing-3Y metrics ending at end_date_str."""
    end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")
    start_target = end_dt.replace(year=end_dt.year - 3).strftime("%Y-%m-%d")

    s_start = nearest_trading_day(series, start_target, "ge")
    s_end = nearest_trading_day(series, end_date_str, "le")

    if not s_start or not s_end:
        return None
    if s_start["date"] >= s_end["date"]:
        return None

    window = [s for s in series if s_start["date"] <= s["date"] <= s_end["date"]]
    n = len(window)
    if n < 60:
        return None

    d0 = datetime.strptime(s_start["date"], "%Y-%m-%d")
    d1 = datetime.strptime(s_end["date"], "%Y-%m-%d")
    years = (d1 - d0).days / 365.0

    p_cum = s_end["portfolio"] / s_start["portfolio"] - 1
    b_cum = s_end["benchmark"] / s_start["benchmark"] - 1
    p_cagr = (1 + p_cum) ** (1 / years) - 1
    b_cagr = (1 + b_cum) ** (1 / years) - 1

    pr = [window[i]["portfolio"] / window[i - 1]["portfolio"] - 1 for i in range(1, n)]
    br = [window[i]["benchmark"] / window[i - 1]["benchmark"] - 1 for i in range(1, n)]

    p_vol = statistics.stdev(pr) * math.sqrt(252)
    b_vol = statistics.stdev(br) * math.sqrt(252)

    p_sharpe = (p_cagr - RF_RATE) / p_vol if p_vol else 0.0
    b_sharpe = (b_cagr - RF_RATE) / b_vol if b_vol else 0.0

    pm = sum(pr) / len(pr)
    bm = sum(br) / len(br)
    cov = sum((p - pm) * (b - bm) for p, b in zip(pr, br)) / (len(pr) - 1)
    varb = sum((b - bm) ** 2 for b in br) / (len(br) - 1)
    varp = sum((p - pm) ** 2 for p in pr) / (len(pr) - 1)
    beta = cov / varb if varb else 0.0
    corr = cov / math.sqrt(varp * varb) if (varp * varb) else 0.0
    alpha = p_cagr - (RF_RATE + beta * (b_cagr - RF_RATE))

    def _mdd(vals):
        peak, worst = vals[0], 0.0
        for v in vals:
            peak = max(peak, v)
            worst = min(worst, (v - peak) / peak)
        return worst

    p_mdd = _mdd([s["portfolio"] for s in window])
    b_mdd = _mdd([s["benchmark"] for s in window])

    return {
        "snapshot_month": end_date_str[:7],
        "window_start": s_start["date"],
        "window_end": s_end["date"],
        "years": round(years, 4),
        "trading_days": n,
        "rf_rate_pct": round(RF_RATE * 100, 2),
        "benchmark_name": BENCHMARK_NAME,
        "portfolio": {
            "starting_nav_index": round(s_start["portfolio"], 4),
            "ending_nav_index": round(s_end["portfolio"], 4),
            "cumulative_return_pct": round(p_cum * 100, 2),
            "trailing_3y_return_pct": round(p_cagr * 100, 2),
            "volatility_3y_pct": round(p_vol * 100, 2),
            "sharpe_ratio_3y": round(p_sharpe, 2),
            "beta_3y": round(beta, 2),
            "correlation_3y": round(corr, 2),
            "jensens_alpha_3y_pct": round(alpha * 100, 2),
            "max_drawdown_3y_pct": round(p_mdd * 100, 2),
        },
        "benchmark": {
            "starting_nav_index": round(s_start["benchmark"], 4),
            "ending_nav_index": round(s_end["benchmark"], 4),
            "cumulative_return_pct": round(b_cum * 100, 2),
            "trailing_3y_return_pct": round(b_cagr * 100, 2),
            "volatility_3y_pct": round(b_vol * 100, 2),
            "sharpe_ratio_3y": round(b_sharpe, 2),
            "max_drawdown_3y_pct": round(b_mdd * 100, 2),
        },
        "taxable": TAXABLE_NOTE,
    }


def load_snapshots():
    if not os.path.exists(SNAPSHOTS_PATH):
        return []
    with open(SNAPSHOTS_PATH) as f:
        return json.load(f)


def save_snapshots(snapshots):
    snapshots = sorted(snapshots, key=lambda s: s["snapshot_month"])
    with open(SNAPSHOTS_PATH, "w") as f:
        json.dump(snapshots, f, indent=2)


def upsert(snapshots, new_snap):
    snapshots = [s for s in snapshots if s["snapshot_month"] != new_snap["snapshot_month"]]
    snapshots.append(new_snap)
    return snapshots


def default_end_date(series):
    """Last day of the previous complete month, capped to what's available in series."""
    latest = datetime.strptime(series[-1]["date"], "%Y-%m-%d").date()
    if latest.month == 1:
        y, m = latest.year - 1, 12
    else:
        y, m = latest.year, latest.month - 1
    end = month_end(y, m)
    return end


def print_summary(snap):
    p, b = snap["portfolio"], snap["benchmark"]
    print(f"\n=== Trailing 3Y snapshot: {snap['window_start']} → {snap['window_end']} "
          f"({snap['years']} yrs, {snap['trading_days']} trading days) ===")
    print(f"  Portfolio             |  {snap['benchmark_name']}")
    print(f"  Starting NAV index :  {p['starting_nav_index']:>10.2f}  |  {b['starting_nav_index']:>10.2f}")
    print(f"  Ending NAV index   :  {p['ending_nav_index']:>10.2f}  |  {b['ending_nav_index']:>10.2f}")
    print(f"  Cumulative return  :  {p['cumulative_return_pct']:>9.2f}%  |  {b['cumulative_return_pct']:>9.2f}%")
    print(f"  Trailing 3Y (CAGR) :  {p['trailing_3y_return_pct']:>9.2f}%  |  {b['trailing_3y_return_pct']:>9.2f}%")
    print(f"  Volatility (3Y)    :  {p['volatility_3y_pct']:>9.2f}%  |  {b['volatility_3y_pct']:>9.2f}%")
    print(f"  Sharpe Ratio (3Y)  :  {p['sharpe_ratio_3y']:>10.2f}  |  {b['sharpe_ratio_3y']:>10.2f}")
    print(f"  Beta (3Y)          :  {p['beta_3y']:>10.2f}")
    print(f"  Correlation (3Y)   :  {p['correlation_3y']:>10.2f}")
    print(f"  Jensen's Alpha (3Y):  {p['jensens_alpha_3y_pct']:>9.2f}%")
    print(f"  Max Drawdown (3Y)  :  {p['max_drawdown_3y_pct']:>9.2f}%  |  {b['max_drawdown_3y_pct']:>9.2f}%")
    print(f"  Taxable            :  {snap['taxable']}")


def month_iter(start_ym, end_ym):
    y, m = start_ym
    while (y, m) <= end_ym:
        yield y, m
        m += 1
        if m > 12:
            m = 1
            y += 1


def main():
    series = load_series()
    snapshots = load_snapshots()
    args = sys.argv[1:]

    if "--backfill" in args:
        first_series = datetime.strptime(series[0]["date"], "%Y-%m-%d").date()
        earliest = date(first_series.year + 3, first_series.month, 1)
        latest = datetime.strptime(default_end_date(series), "%Y-%m-%d").date()
        added = 0
        for y, m in month_iter((earliest.year, earliest.month), (latest.year, latest.month)):
            end = month_end(y, m)
            snap = compute_snapshot(series, end)
            if snap:
                snapshots = upsert(snapshots, snap)
                added += 1
                print(f"  ✓ {snap['snapshot_month']}  end={snap['window_end']}  "
                      f"3Y-CAGR={snap['portfolio']['trailing_3y_return_pct']}%")
        save_snapshots(snapshots)
        print(f"\nBackfilled {added} monthly snapshot(s) → {SNAPSHOTS_PATH}")
        return

    end_date = args[0] if args else default_end_date(series)
    snap = compute_snapshot(series, end_date)
    if not snap:
        print(f"Cannot compute snapshot for {end_date} — insufficient history.")
        sys.exit(1)
    snapshots = upsert(snapshots, snap)
    save_snapshots(snapshots)
    print_summary(snap)
    print(f"\n✅ Saved to {SNAPSHOTS_PATH}")


if __name__ == "__main__":
    main()
