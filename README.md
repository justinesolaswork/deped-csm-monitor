# CSM Monitor

A dashboard for DepEd class size and shifting schedules, built from three official CSV snapshots dated 28 September 2026.

## Start the dashboard

Double-click **`start_dashboard.bat`**. A black window opens, then your browser opens the dashboard at http://localhost:5173/.

To stop it, close the black window.

You need [Node.js](https://nodejs.org) installed. Python is only needed when the data is rebuilt.

## How it fits together

```
data/*.csv  ──►  scripts/build_dashboard_data.py  ──►  src/data/dashboard_data.json  ──►  the dashboard
(3 big files)        (adds everything up)                 (one small summary file)         (draws it)
                                                          src/data/schools/*.json
                                                          (one school list per region)
```

The dashboard never reads the big CSV files directly. A Python script adds them up into one small summary file, and the dashboard draws that. The same script also writes one school list per region for the Schools breakdown table; the dashboard fetches the list for the chosen region, or every list for "All regions".

## What is in each folder

| Folder or file | What it is | Do you edit it? |
|---|---|---|
| `start_dashboard.bat` | Starts the dashboard | No |
| `data/` | The three official CSV snapshots | **Never.** They are the source of truth |
| `scripts/` | Python scripts that read the CSVs | Only to change how numbers are calculated |
| `src/` | The dashboard itself | Yes, this is where screens and charts live |
| `tests/` | Automatic checks that the numbers and logic are right | Add to it when you add logic |
| `exports/` | CSV lists exported for people | Generated, safe to delete |
| `node_modules/` | Downloaded libraries | No. It is recreated by `npm install` |

Inside `src/`:

| Folder | What lives there |
|---|---|
| `App.jsx` | The page: which sections appear, in what order |
| `sections/` | One file per dashboard section (class size, shifting, schools, ...) |
| `components/` | Reusable building blocks (the chart, the table, cards, the sidebar) |
| `data/` | The summary file, the per-region school lists (`schools/`), the list of categories and colors, and the calculations |
| `theme/` | Colors and fonts |
| `hooks/`, `lib/` | Small helpers (address-bar state, number formatting) |

## The documents

| File | Who it is for | What it says |
|---|---|---|
| `README.md` | You | This page |
| `CLAUDE.md` | The AI assistant | Rules it must follow and how the code is organized. It reads this every session |
| `PRODUCT.md` | The AI assistant | Who the dashboard is for and what it must do |
| `DESIGN.md` | The AI assistant | How the dashboard should look, so new screens match |
| `CSV_ANALYSIS.md` | You and the AI | What every column in the CSVs means, and known data problems |

If the AI does something you did not want, the fix is usually one sentence added to `CLAUDE.md`.

## Commands

Open a terminal in this folder (in VS Code: **Terminal → New Terminal**).

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dashboard (the same as the `.bat` file) |
| `npm run check` | **Checks everything**: Python tests, data is up to date, logic tests, and that the dashboard builds |
| `npm run data` | Rebuilds the summary file from the CSVs |
| `npm test` | Runs only the logic and data tests (fast) |

After any change, run `npm run check`. If it ends without the word `fail` or an error, nothing is broken.

## Asking the AI for changes

Describe what you want to **see**, and where. For example:

- "In the Schools breakdown table, add a column for the total number of classes."
- "Add a new section showing class size by grade level."
- "The Shifting chart should start sorted by triple shift."

Then ask it to run `npm run check` and to show you the result in the browser.

## Loading newer data

1. Put the three new CSV files in `data/`.
2. In `scripts/csm_data.py`, change the three file names under `SOURCES`.
3. Run `npm run data`, then `npm run check`.
4. The check will say the documented totals no longer match. That is expected: ask the AI to "update CSV_ANALYSIS.md and the expected figures in tests/data.test.js for the new snapshot".
