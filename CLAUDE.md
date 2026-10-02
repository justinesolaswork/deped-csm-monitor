# CLAUDE.md

## Project Overview

CSM Monitor is a read-only dashboard over three Philippine Department of Education (DepEd) CSV snapshots, showing class size and shifting schedules. Learning modality (the `mode` column) is in the source data but deliberately not shown. Python scripts aggregate the CSVs into one JSON file; a React app draws it. The owner is a beginner, so explain changes in plain language and keep the code easy to follow. `README.md` is the owner's guide; keep it accurate when commands or folders change.

## How data flows

```
data/*.csv  ->  scripts/build_dashboard_data.py  ->  src/data/dashboard_data.json  ->  src/ (React)
                                                 ->  src/data/schools/<region>.json
```

The frontend never parses the raw CSVs. To show something new, add it to the build script first, then read it from the JSON.

## Tech Stack

- **React 19 + Vite**: the frontend. Plain JavaScript (`.jsx`), no TypeScript.
- **Material UI**: layout, controls, tables and the theme.
- **Recharts** (3.6 or newer): charts. All bar charts go through `src/components/StackedBarChart.jsx`.
- **Impeccable**: the design skill. It reads `PRODUCT.md` and `DESIGN.md`; follow both for any UI work.
- **Python standard library**: every script in `scripts/`. No third-party packages.
- **Node's built-in test runner** (`node --test`): no test library to install.

## Repository Layout

- `start_dashboard.bat`: double-click launcher (`npm run dev -- --open`).
- `data/`: the three source CSV snapshots. Read-only.
- `scripts/csm_data.py`: shared helpers. File names, CSV reading rules and region normalization live here once.
- `scripts/build_dashboard_data.py`: writes `src/data/dashboard_data.json` and one school list per region in `src/data/schools/`. `--check` verifies they are up to date without writing.
- `scripts/analyze_csvs.py`: profiles columns, row counts and distributions.
- `scripts/cross_check.py`: compares `school_id` coverage across the three files.
- `scripts/export_non_single_shift.py`: example export to `exports/`.
- `scripts/test_csm_data.py`: unit tests for the helpers.
- `src/App.jsx`: page composition and the two shared choices (region, measure).
- `src/sections/`: one file per dashboard section.
- `src/components/`: reusable pieces. `BreakdownPanel` = legend + sort + chart or table for one measure.
- `src/data/categories.js`: every category's source key, label and color.
- `src/data/selectors.js`: pure functions that shape the JSON for the screen.
- `src/data/schools/`: generated per-region school lists (class-size and shifting counts per school). `useRegionSchools` loads the chosen region's list, or all of them for "All regions".
- `src/theme/`: `theme.js` (interface) and `palette.js` (data colors).
- `tests/`: `selectors.test.js` (logic) and `data.test.js` (the JSON against documented totals).
- `CSV_ANALYSIS.md`: data dictionary, relationships and quality notes.

## Commands

Run from the project root:

```powershell
npm run check   # everything: Python tests, data up to date, node tests, production build
npm run dev     # start the dashboard
npm run data    # regenerate src/data/dashboard_data.json and src/data/schools/
npm test        # node tests only
python scripts/analyze_csvs.py
python scripts/cross_check.py
```

## Adding a chart section

1. If it needs new numbers, add them to every area block in `scripts/build_dashboard_data.py` and run `npm run data`.
2. Add its categories to `src/data/categories.js` (and to `strataByMeasure` if it is a new measure).
3. Create `src/sections/<Name>Section.jsx`. For a breakdown by region and division, render `<BreakdownPanel>`; copy `ShiftingSection.jsx`.
4. Add it to `src/App.jsx`: render it, and add an entry with the same `id` to `sections`.
5. Add tests for any new selector, then run `npm run check`.

## Frontend Conventions

- Region and measure are the shared page state. They live in the address bar via `useQueryState`. Text size (`useFontSize`) and light/dark mode (`useColorMode`) are personal settings kept in `localStorage`; text size sets the page's base text size and the theme's `chartScale`, which the charts use for their pixel sizes. `buildTheme(scale, mode)` in `src/theme/theme.js` holds every interface color for both modes; data colors in `palette.js` are the same in both. Chart gridline and hover colors come from `theme.chart`, never from `palette.js`. Per-panel state (hidden slices, sort, chart or table) stays inside `BreakdownPanel`.
- Charts show the current scope's children: regions for "All regions", divisions for a selected region. Class size and shifting are the exception: they take `withRegionRows(scope)` and always list regions.
- The Schools breakdown is a per-school table, not a chart: Region and Division filters, a Class size / Shifting toggle, and `—` for a school with no record in that view.
- Keep calculations in `selectors.js` as pure functions with tests. Components only display.
- Format numbers with `src/lib/format.js`. Do not call `toFixed` or `Intl` in components.
- Every chart needs a table view and must not rely on color alone.
- New data colors must pass the checks described in `DESIGN.md` before use.

## Data Conventions

- Treat `school_id` as the only reliable join key between files.
- Read the CSVs through `csm_data.read_rows()` (`utf-8-sig`, `newline=""`, `errors="replace"`).
- The master file is the school dimension table. The two view files have several rows per school.
- The class-size `number` field is a count of classes: sum it, never count rows.
- Multigrade (`MG 1`-`MG 3`) records occur in the shifting/modality file but not in the class-size file.
- Do not assume a school has one shifting value or modality across all grades.
- Normalize region casing before grouping (`REGION V` = `Region V`) and merge division spellings that differ only by casing (`ALBAY` = `Albay`).
- Division names repeat across regions (`San Carlos City`, `San Fernando City`); always key a division by region and name.
- Preserve missing and orphan records rather than silently dropping them. Rows whose school is not in the master list go to the `unmatched` block.

## Change Guidelines

- Keep scripts dependency-free and read-only over `data/`.
- Do not modify, rename or move the source CSV snapshots unless explicitly requested.
- Avoid loading whole CSVs into memory; the largest have hundreds of thousands of rows.
- `src/data/dashboard_data.json` and `src/data/schools/*.json` are generated. Never edit them by hand.
- Update `CSV_ANALYSIS.md` when changing file assumptions, join rules, data definitions or known quality findings.
- Keep exports in `exports/` and document how they were produced.
- Do not add an npm or Python dependency without asking the owner.

## Validation

Run `npm run check` after every change and report its result. For UI changes, also open the dashboard and look at the affected section at desktop and phone width. When totals change, compare them with `CSV_ANALYSIS.md` and run `python scripts/cross_check.py`.
