import json
import math
import os
import statistics
import time
from datetime import datetime

import requests

RF_RATE = 0.07  # 7.0% — RBI 10-yr G-Sec benchmark (INR risk-free rate)

PORTFOLIO_ISINS = {
    "INF109K01S39": "ICICI Pru Regular Savings",
    "INF200K01TZ3": "SBI Multi Asset Allocation",
    "INF179KA1RW5": "HDFC Small Cap",
    "INF769K01BI1": "Mirae Asset Large & Midcap",
}
BENCHMARK_ISIN = "INF179KC1GG9"
BENCHMARK_NAME = "S&P BSE 500"

ALL_ISINS = list(PORTFOLIO_ISINS.keys()) + [BENCHMARK_ISIN]

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
HISTORY_PATH = os.path.join(DATA_DIR, "history.json")
PORTFOLIO_PATH = os.path.join(DATA_DIR, "portfolio.json")

AMFI_URL = "https://www.amfiindia.com/spages/NAVAll.txt"
MFAPI_URL = "https://api.mfapi.in/mf/{scheme_code}"


def fetch_with_retry(url, max_retries=3):
    for attempt in range(max_retries + 1):
        try:
            resp = requests.get(url, timeout=30)
            if resp.status_code == 200:
                return resp
            raise requests.HTTPError(f"HTTP {resp.status_code} for {url}")
        except (requests.RequestException, requests.HTTPError) as e:
            if attempt == max_retries:
                raise
            wait = 2 ** attempt
            print(f"  Retry {attempt + 1}/{max_retries} after {wait}s: {e}")
            time.sleep(wait)


def resolve_scheme_codes():
    print("Step 1 — Resolving scheme codes from AMFI...")
    resp = fetch_with_retry(AMFI_URL)
    lines = resp.text.splitlines()

    isin_to_scheme = {}
    for line in lines:
        parts = line.split(";")
        if len(parts) < 6:
            continue
        scheme_code = parts[0].strip()
        isin_div = parts[1].strip()
        isin_growth = parts[2].strip()
        if isin_div in ALL_ISINS:
            isin_to_scheme[isin_div] = scheme_code
        if isin_growth in ALL_ISINS:
            isin_to_scheme[isin_growth] = scheme_code

    missing = [isin for isin in ALL_ISINS if isin not in isin_to_scheme]
    if missing:
        raise ValueError(f"Could not resolve scheme codes for ISINs: {missing}")

    print(f"  Resolved {len(isin_to_scheme)} ISINs:")
    for isin, code in isin_to_scheme.items():
        name = PORTFOLIO_ISINS.get(isin, BENCHMARK_NAME)
        print(f"    {isin} → {code}  ({name})")
    return isin_to_scheme


def parse_date(date_str):
    return datetime.strptime(date_str, "%d-%m-%Y").strftime("%Y-%m-%d")


def fetch_nav_history(scheme_code):
    url = MFAPI_URL.format(scheme_code=scheme_code)
    resp = fetch_with_retry(url)
    payload = resp.json()
    entries = []
    for item in payload.get("data", []):
        nav_str = item.get("nav", "")
        if not nav_str or nav_str == "N.A.":
            continue
        try:
            nav_val = float(nav_str)
        except ValueError:
            continue
        entries.append({"date": parse_date(item["date"]), "nav": nav_val})
    entries.sort(key=lambda x: x["date"])
    return entries


def build_history(isin_to_scheme):
    print("\nStep 2 — Fetching full NAV history per fund...")
    history = {}
    for isin in ALL_ISINS:
        scheme_code = isin_to_scheme[isin]
        name = PORTFOLIO_ISINS.get(isin, BENCHMARK_NAME)
        print(f"  Fetching {name} (scheme {scheme_code})...", end=" ", flush=True)
        entries = fetch_nav_history(scheme_code)
        history[isin] = entries
        print(f"{len(entries)} data points")
    return history


def save_history(history):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(HISTORY_PATH, "w") as f:
        json.dump(history, f, separators=(",", ":"))
    print(f"\nStep 3 — Saved history.json ({len(history)} funds)")


def _compute_metrics(series):
    """Compute all headline metrics from an indexed series (base=100)."""
    n = len(series)
    if n < 2:
        return {}

    d0 = datetime.strptime(series[0]["date"], "%Y-%m-%d")
    d1 = datetime.strptime(series[-1]["date"], "%Y-%m-%d")
    days_elapsed = (d1 - d0).days
    years = days_elapsed / 365.0

    last = series[-1]
    p_cum = last["portfolio"] / 100.0 - 1
    b_cum = last["benchmark"] / 100.0 - 1

    # CAGR
    p_ann = (1 + p_cum) ** (1.0 / years) - 1
    b_ann = (1 + b_cum) ** (1.0 / years) - 1

    # Daily simple returns
    p_rets = [series[i]["portfolio"] / series[i - 1]["portfolio"] - 1 for i in range(1, n)]
    b_rets = [series[i]["benchmark"] / series[i - 1]["benchmark"] - 1 for i in range(1, n)]

    # Annualised volatility (daily std × √252 — trading-day convention)
    p_vol = statistics.stdev(p_rets) * math.sqrt(252)
    b_vol = statistics.stdev(b_rets) * math.sqrt(252)

    # Sharpe ratio
    p_sharpe = (p_ann - RF_RATE) / p_vol if p_vol else 0.0
    b_sharpe = (b_ann - RF_RATE) / b_vol if b_vol else 0.0

    # Maximum drawdown (peak-to-trough from base)
    def _mdd(vals):
        peak, worst = vals[0], 0.0
        for v in vals:
            peak = max(peak, v)
            worst = min(worst, (v - peak) / peak)
        return worst

    p_mdd = _mdd([s["portfolio"] for s in series])
    b_mdd = _mdd([s["benchmark"] for s in series])
    dd_ratio = abs(p_mdd / b_mdd) if b_mdd else 0.0

    # OLS beta & correlation (daily returns)
    p_mean = sum(p_rets) / len(p_rets)
    b_mean = sum(b_rets) / len(b_rets)
    cov = sum((p - p_mean) * (b - b_mean) for p, b in zip(p_rets, b_rets)) / (len(p_rets) - 1)
    var_b = sum((b - b_mean) ** 2 for b in b_rets) / (len(b_rets) - 1)
    var_p = sum((p - p_mean) ** 2 for p in p_rets) / (len(p_rets) - 1)
    beta = cov / var_b if var_b else 0.0
    correlation = cov / math.sqrt(var_p * var_b) if (var_p * var_b) else 0.0

    # Jensen's alpha (annualised)
    jensens_alpha = p_ann - (RF_RATE + beta * (b_ann - RF_RATE))

    return {
        "rf_rate_pct": round(RF_RATE * 100, 1),
        "days_elapsed": days_elapsed,
        "current_portfolio_index": round(last["portfolio"], 2),
        "current_benchmark_index": round(last["benchmark"], 2),
        "cumulative_return_pct": round(p_cum * 100, 2),
        "benchmark_cumulative_pct": round(b_cum * 100, 2),
        "portfolio_annualised_pct": round(p_ann * 100, 2),
        "benchmark_annualised_pct": round(b_ann * 100, 2),
        "portfolio_volatility_pct": round(p_vol * 100, 2),
        "benchmark_volatility_pct": round(b_vol * 100, 2),
        "portfolio_sharpe": round(p_sharpe, 2),
        "benchmark_sharpe": round(b_sharpe, 2),
        "portfolio_max_drawdown_pct": round(p_mdd * 100, 2),
        "benchmark_max_drawdown_pct": round(b_mdd * 100, 2),
        "drawdown_ratio": round(dd_ratio, 2),
        "jensens_alpha_pct": round(jensens_alpha * 100, 2),
        "beta": round(beta, 2),
        "correlation": round(correlation, 2),
        # legacy key kept so the chart tooltip still works
        "alpha_pct": round((p_cum - b_cum) * 100, 2),
    }


def compute_portfolio(history):
    print("\nStep 4 — Computing portfolio metrics...")

    fund_isins = list(PORTFOLIO_ISINS.keys())
    all_five = fund_isins + [BENCHMARK_ISIN]

    date_sets = {isin: set(e["date"] for e in history[isin]) for isin in all_five}
    valid_dates = sorted(
        date_sets[all_five[0]].intersection(*[date_sets[i] for i in all_five[1:]])
    )

    if not valid_dates:
        raise ValueError("No common dates found across all 5 funds — cannot compute series.")

    inception_date = valid_dates[0]
    print(f"  Inception date: {inception_date}")
    print(f"  Valid date count: {len(valid_dates)}")

    nav_by_date = {}
    for isin in all_five:
        nav_by_date[isin] = {e["date"]: e["nav"] for e in history[isin]}

    baselines = {isin: nav_by_date[isin][inception_date] for isin in all_five}

    series = []
    for date in valid_dates:
        normalized = [
            (nav_by_date[isin][date] / baselines[isin]) * 100
            for isin in fund_isins
        ]
        portfolio_val = sum(normalized) / len(fund_isins)
        benchmark_val = (nav_by_date[BENCHMARK_ISIN][date] / baselines[BENCHMARK_ISIN]) * 100
        series.append({
            "date": date,
            "portfolio": round(portfolio_val, 4),
            "benchmark": round(benchmark_val, 4),
        })

    metrics = _compute_metrics(series)

    portfolio_json = {
        "inception_date": inception_date,
        "last_updated": valid_dates[-1],
        "fund_names": PORTFOLIO_ISINS,
        "benchmark_name": BENCHMARK_NAME,
        "series": series,
        "metrics": metrics,
    }
    return portfolio_json


def save_portfolio(portfolio_json):
    with open(PORTFOLIO_PATH, "w") as f:
        json.dump(portfolio_json, f, indent=2)
    print(f"  Saved portfolio.json")


def print_summary(portfolio_json):
    m = portfolio_json["metrics"]
    print("\nStep 5 — Summary")
    print(f"  Inception date       : {portfolio_json['inception_date']}")
    print(f"  Last updated         : {portfolio_json['last_updated']}")
    print(f"  Days elapsed         : {m['days_elapsed']}")
    print(f"  Series points        : {len(portfolio_json['series'])}")
    print(f"  Risk-free rate       : {m['rf_rate_pct']}%")
    print(f"  Cumulative return    : {m['cumulative_return_pct']}%  |  Benchmark: {m['benchmark_cumulative_pct']}%")
    print(f"  Annualised (CAGR)    : {m['portfolio_annualised_pct']}%  |  Benchmark: {m['benchmark_annualised_pct']}%")
    print(f"  Volatility (ann.)    : {m['portfolio_volatility_pct']}%  |  Benchmark: {m['benchmark_volatility_pct']}%")
    print(f"  Sharpe ratio         : {m['portfolio_sharpe']}  |  Benchmark: {m['benchmark_sharpe']}")
    print(f"  Max drawdown         : {m['portfolio_max_drawdown_pct']}%  |  Benchmark: {m['benchmark_max_drawdown_pct']}%")
    print(f"  Drawdown ratio       : {m['drawdown_ratio']}×")
    print(f"  Jensen's alpha       : {m['jensens_alpha_pct']}%")
    print(f"  Beta · Correlation   : {m['beta']} · {m['correlation']}")
    print("\n✅ Done")


def main():
    isin_to_scheme = resolve_scheme_codes()
    history = build_history(isin_to_scheme)
    save_history(history)
    portfolio_json = compute_portfolio(history)
    save_portfolio(portfolio_json)
    print_summary(portfolio_json)


if __name__ == "__main__":
    main()
