# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Data analysts and researchers working with Philippine Department of Education (DepEd) school data. They explore the supplied snapshots to check class-size compliance and understand shifting patterns across regions, divisions and schools.

## Product Purpose

CSM Monitor lets analysts monitor class-size compliance: where classes fall below, within or above the standard, and how shifting schedules vary. Success is finding out quickly where compliance problems sit and trusting that the numbers match the source snapshots.

## Positioning

A read-only monitor built directly on the three official DepEd snapshots (school registry, class-size view, shifting/modality view), joined on `school_id`, with the source's data-quality quirks surfaced rather than hidden.

## Operating Context

- Data is a static snapshot dated 2026-09-28. There is no backend and no live feed.
- Three quoted UTF-8 (BOM) CSVs in `data/`: master registry (45,934 schools), shifting/modality (269,137 rows), class sizes (320,191 rows). See CSV_ANALYSIS.md.
- Python scripts in `scripts/` profile and cross-check the files and aggregate them into `src/data/dashboard_data.json`; the React frontend presents that file.

## Capabilities and Constraints

- Stack: React, Material UI, Recharts. Data is pre-aggregated by Python; the browser does not parse the raw CSVs.
- Aggregates exist per region and per division. School-level class-size and shifting counts exist per region in `src/data/schools/`. There is no district-level data in the frontend yet.
- `school_id` is the only reliable join key. A school can have different shifting and modality per grade. Multigrade (`MG 1`-`MG 3`) appears only in the shifting/modality file.
- Region casing must be normalized (`Region V` vs `REGION V`). Missing and orphan records are preserved in coverage views, not dropped.
- Class-size `number` is a count of classes.
- Undecided: compliance thresholds shown in the UI beyond the source's three size categories.

## Evidence on Hand

The three CSV snapshots and CSV_ANALYSIS.md. No testimonials, usage data or branding assets exist; do not fabricate any. Every figure in the UI comes from `src/data/dashboard_data.json` or the school lists in `src/data/schools/`, which `npm run check` verifies against the snapshots and the totals documented in CSV_ANALYSIS.md.

## Product Principles

1. Numbers must trace back to the source snapshots; never present mocked or scaled figures as real.
2. Show data gaps and quality issues as findings, not silent omissions.
3. Compliance (below / within / above standard) is the primary lens; coverage and shifting support it.
4. Built for analysts: favour density, comparison and drill-down over decoration.
5. Read-only and reproducible: no edits to the source data.
