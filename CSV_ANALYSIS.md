# CSV Data Documentation

**Data source:** Philippine Department of Education (DepEd)
**Files snapshot date:** 2026-09-28
**Purpose:** Reference documentation for the three CSV files and how they relate to each other.

---

## Files Overview

| File | Rows | Columns | Description |
|---|---:|---:|---|
| `official_list_of_schools_202609281509.csv` | 45,934 | 18 | Master registry of all DepEd schools |
| `unit5_shifting_modality_view_202609281508.csv` | 269,137 | 5 | Shifting schedule and delivery mode per school & grade |
| `vw_organized_class_sizes_202609281455.csv` | 320,191 | 5 | Class size category counts per school & grade |

Total: 635,262 data rows (excluding headers).

All files are quoted CSVs (`"` delimiters, `\r\n` line endings, UTF-8 with BOM). They live in `data/` and are never edited.

---

## 1. `official_list_of_schools_202609281509.csv`

One row per school. This is the master dimension table; both view files reference it via `school_id`.

### Columns

| Column | Type | Notes |
|---|---|---|
| `region` | string | e.g. `Region I`, `NCR`, `CAR`, `MIMAROPA` |
| `division` | string | e.g. `Ilocos Norte`, `Tacurong City` |
| `district` | string | Local administrative grouping |
| `school_id` | integer | **Primary key.** All 45,934 values unique |
| `school_name` | string | |
| `street_address` | string | Dirty data present: `N/A`, `n/a`, `#NAME?`, `0`, `-` |
| `mother_school_id` | integer | Set for annex/extension schools; blank for standalone. Links a school to its parent institution |
| `school_head_name` | string | Format varies (`LAST, FIRST` and free-form) |
| `school_head_position_name` | string | Inconsistent spellings: `Principal I` / `Principal 1` / `PRINCIPAL 1` |
| `province` | string | Uppercase; 83 distinct values |
| `municipality` | string | Uppercase |
| `legislative_district` | string | e.g. `1st District` |
| `barangay` | string | |
| `sector` | string | `Public` (45,928 rows) or blank (6 rows) |
| `school_subclass` | string | `DepED Managed`, `Mother school`, `Annex or Extension school(s)` |
| `school_type` | string | `School with no Annexes`, `Mother school`, `Annex or Extension school(s)`... |
| `implementing_unit` | string | |
| `mcoc` | string | Main Offering Classification Code (see below) |

### Key distributions

**By region** (top 10 of 18 values):

| Region | Schools |
|---|---:|
| Region VIII | 4,196 |
| Region V | 3,883 |
| Region III | 3,761 |
| Region IV-A | 3,590 |
| Region IX | 3,024 |
| Region I | 2,865 |
| Region VI | 2,840 |
| Region VII | 2,840 |
| Region II | 2,546 |
| Region X | 2,539 |

Note: 6 rows use `REGION V` (uppercase) instead of `Region V` — normalize when grouping by region.

**By MCOC (offering type):**

| MCOC | Schools | % |
|---|---:|---:|
| PURELY ES | 34,944 | 76.1% |
| JHS WITH SHS | 6,651 | 14.5% |
| ES AND JHS | 1,765 | 3.8% |
| PURELY JHS | 1,384 | 3.0% |
| ALL OFFERING | 905 | 2.0% |
| PURELY SHS | 283 | 0.6% |
| ES WITH SHS | 2 | <0.1% |

**By province** (top 10 of 83): Cebu (1,683), Leyte (1,526), Pangasinan (1,448), Iloilo (1,285), Negros Occidental (1,234), Camarines Sur (1,197), Bohol (1,157), Zamboanga del Sur (1,115), Isabela (1,103), Quezon (1,047).

---

## 2. `unit5_shifting_modality_view_202609281508.csv`

One row per school × grade. Records class scheduling and teaching modality.

### Columns

| Column | Type | Notes |
|---|---|---|
| `iern` | string | Mostly blank; legacy/auxiliary identifier |
| `school_id` | integer | FK → master list. 40,941 distinct values |
| `grade` | string | `Kinder`, `Grade 1–12`, `MG 1–3` (multigrade) |
| `shifting` | string | `Single Shift`, `Double Shift`, `Triple Shift` |
| `mode` | string | Delivery modality (see below) |

### Key distributions

**By shifting:**

| Shifting | Rows | % |
|---|---:|---:|
| Single Shift | 262,220 | 97.4% |
| Double Shift | 6,707 | 2.5% |
| Triple Shift | 210 | 0.1% |

**By mode:**

| Mode | Rows | % |
|---|---:|---:|
| In-Person Classes | 268,405 | 99.7% |
| Blended (3 days in-person, 2 days distance) | 496 | 0.2% |
| Blended (4 days in-person, 1 day distance) | 167 | 0.1% |
| Full Distance Learning | 69 | <0.1% |

**By grade** (16 values): Kinder 33,404; Grades 1–6 ≈28,000 each; Grades 7–10 ≈9,400–9,600 each; Grades 11–12 ≈7,000 each; MG 1 (6,129), MG 2 (4,430), MG 3 (3,178). Multigrade rows exist **only** in this file.

---

## 3. `vw_organized_class_sizes_202609281455.csv`

One row per school × grade × size-category. Records how many classes fall into each size bucket.

### Columns

| Column | Type | Notes |
|---|---|---|
| `iern` | string | Mostly blank |
| `school_id` | integer | FK → master list. 44,372 distinct values |
| `grade` | string | `Kinder`, `Grade 1–12` (no multigrade rows) |
| `size` | string | `Less than Standard` / `Within Standard` / `Above Standard` |
| `number` | integer | Count of classes in that bucket |

### Key distributions

**By size category:**

| Size | Rows | % |
|---|---:|---:|
| Less than Standard | 237,693 | 74.2% |
| Within Standard | 54,651 | 17.1% |
| Above Standard | 27,847 | 8.7% |

**Total classes nationwide** (sum of `number`): **704,974**

**By grade:** Kinder 41,606; Grades 1–6 ≈33,000–35,000 each; Grades 7–10 ≈13,000–14,500 each; Grades 11–12 ≈9,800 each.

---

## Data Quality Notes

1. **Coverage gaps vs master list (45,934 schools):**
   - 5,002 schools have no modality/shifting record
   - 1,648 schools have no class size record
   - 866 schools appear in **neither** view
   - 86 `school_id`s in the views are **not** in the master list (orphans — validate against latest master extract)
2. **Region and division casing:** 6 rows (school IDs 800001-800006) use `REGION V` instead of `Region V`. The same 6 rows spell their division `ALBAY` instead of `Albay` (556 rows) and leave `sector`, `school_subclass`, `school_type` and `implementing_unit` blank. Grouping without normalizing would create a second "Region V" and a second "Albay". After merging there are 17 regions and 221 divisions.
   - **Division names repeat across regions:** `San Carlos City` (NIR and Region I) and `San Fernando City` (Region I and Region III). Always key a division by region and name.
3. **Address junk values:** `N/A`, `n/a`, `#NAME?`, `0`, `-`, `not applicable` in `street_address`; also `n/anone`.
4. **Position titles inconsistent:** `Principal I` / `Principal 1` / `PRINCIPAL 1` / `TIC` / `Teacher-In-Charge` spellings vary.
5. **`iern` column** is almost entirely empty in both view files — likely a deprecated field.
6. **Multigrade (MG 1–3) rows** only exist in the shifting/modality view, not in class sizes.
7. **View files may be snapshots** at different times — `sizes - shifting` = 4,213 schools have size data but no modality record, consistent with different extract timing.

---

## How to Join

```sql
-- Modality + shifting per school (master list enriched)
SELECT m.*, s.shifting, s.mode
FROM master m
LEFT JOIN shifting s ON s.school_id = m.school_id;

-- Class size profile per school
SELECT m.*, c.size, SUM(c.number) AS classes
FROM master m
JOIN sizes c ON c.school_id = m.school_id
GROUP BY m.school_id, c.size;

-- Schools missing modality data
SELECT m.school_id, m.school_name, m.region
FROM master m
LEFT JOIN shifting s ON s.school_id = m.school_id
WHERE s.school_id IS NULL;
```

**Join keys:**
- `school_id` is the sole reliable key across all three files.
- Grade alignment: the class-size file has no `MG` grades; if joining by `school_id + grade`, multigrade rows will not match anything in the size file.
- One school can report multiple `shifting` values across grades (e.g., single shift Kinder but double shift Grade 6) — aggregate at the school level only after deciding the rule (e.g., "worst-case shifting" = max shifts across grades).

---

## Reproducibility

The scripts live in `scripts/` and share `csm_data.py` (file names, CSV reading rules, region normalization):

- `analyze_csvs.py` — profiles all three files (row counts, distributions)
- `cross_check.py` — computes `school_id` overlaps and coverage gaps
- `build_dashboard_data.py` — writes `src/data/dashboard_data.json` for the frontend. For the nation, each region and each division it gives: class counts (sum of `number`) by size category, shifting record counts, schools by offering (`mcoc`), and coverage. It reproduces the totals above (704,974 classes; 866 / 5,002 / 1,648 / 86 coverage figures). Class-size category figures there are sums of `number`, unlike the per-category *row* counts in section 3. It also writes `src/data/schools/<region>.json`, one file per region listing every master-list school with its class counts by size category and its shifting record counts; a school with no rows in a view has `null` there. Schools absent from the master list (the 86 orphan IDs) have no region and are not listed.
- `export_non_single_shift.py` — writes `exports/non_single_shift_mindoro_calapan.csv`: schools in Oriental Mindoro, Occidental Mindoro and Calapan City with any double or triple shift. `exports/List of schools in Oriental Mindoro, Occidental Mindoro, and Calapan City.csv` is that output, renamed.

Rows whose `school_id` is not in the master list (86 IDs: 1,072 classes, 73 shifting records) are kept in an `unmatched` block. They count in the national totals but belong to no region.

Run from the project root:

```bash
python scripts/analyze_csvs.py
python scripts/cross_check.py
python scripts/build_dashboard_data.py           # rebuild the JSON
python scripts/build_dashboard_data.py --check   # verify the JSON matches the CSVs
npm run check                                    # all checks, including the totals in this document
```
