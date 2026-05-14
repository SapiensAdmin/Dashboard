# Fund of Funds — Live Performance Dashboard

A lightweight, equally-weighted Fund of Funds (FoF) performance tracker that plots four Indian mutual funds against the S&P BSE 500 benchmark. NAV data is fetched daily from AMFI/mfapi.in via GitHub Actions and committed to the repo; the frontend reads the pre-computed JSON at build time so there is no backend.

## Live URL

[will fill in after Vercel deploy]

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Manual Data Refresh

```bash
pip install -r scripts/requirements.txt
python scripts/fetch_navs.py
```

This fetches today's NAVs, rewrites `data/history.json` and `data/portfolio.json`, and prints a summary to stdout.

## Automated Updates

GitHub Actions runs `.github/workflows/daily-fetch.yml` every weekday at **9:00 PM IST** (15:30 UTC). It runs the Python fetcher and auto-commits any changed JSON files with the message `chore: daily NAV update [skip ci]`.

## How to Replace the Logo

Replace `public/logo.svg` with your own SVG (recommended 64×64 or any square aspect ratio). No code changes needed — the `<img src="/logo.svg">` in `Header.jsx` picks it up automatically.

## Tech Stack

- **Frontend:** Vite + React (JavaScript) + Tailwind CSS v3
- **Charts:** Recharts
- **Data fetcher:** Python 3.11 (`requests` only)
- **Automation:** GitHub Actions
- **Fonts:** Inter + IBM Plex Mono (Google Fonts)
