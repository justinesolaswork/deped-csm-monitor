"""Profile the three CSV snapshots: columns, row counts and the key distributions.

Read-only over the source CSVs. Standard library only. Run from the project root:
    python scripts/analyze_csvs.py
"""
import csv
from collections import Counter

from csm_data import SOURCES, open_source

# The columns worth tallying in each snapshot.
PROFILED_COLUMNS = {
    "schools": ["region", "mcoc", "sector", "school_id", "province"],
    "shifting": ["shifting", "mode", "grade", "school_id"],
    "class_sizes": ["size", "grade", "number", "school_id"],
}


def profile(name):
    """Read a snapshot once: its header, row count and a value count for each profiled column."""
    counts = {column: Counter() for column in PROFILED_COLUMNS[name]}
    rows = 0
    with open_source(name) as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames
        for row in reader:
            rows += 1
            for column, counter in counts.items():
                counter[row.get(column)] += 1
    return header, rows, counts


def show(title, counter, limit=None, quoted=False):
    print(f"{title}:")
    for value, n in counter.most_common(limit):
        print(f"  {n:>7,}  {value!r}" if quoted else f"  {n:>7,}  {value}")


def distinct_ids(counter):
    return [sid for sid in counter if sid]


def total_classes(number_counts):
    """Sum the class counts, skipping any value that is not a whole number."""
    total = 0
    for value, rows in number_counts.items():
        try:
            total += int(value) * rows
        except (ValueError, TypeError):
            pass
    return total


for name, filename in SOURCES.items():
    header, rows, counts = profile(name)
    print("=" * 70)
    print(f"FILE: {filename}")
    print("=" * 70)
    print(f"Columns ({len(header)}): {header}")
    print(f"Data rows: {rows:,}")
    ids = distinct_ids(counts["school_id"])

    if name == "schools":
        show("\nSchools by region", counts["region"])
        show("\nBy MCOC (school offering)", counts["mcoc"], limit=10)
        show("\nBy sector", counts["sector"])
        rows_with_id = sum(counts["school_id"][sid] for sid in ids)
        print(f"\nUnique school_ids: {len(ids):,} (of {rows_with_id:,})")
        print(f"Distinct provinces: {len(counts['province'])}")
        show("Top 10 provinces", counts["province"], limit=10)

    elif name == "shifting":
        show("\nBy shifting", counts["shifting"], quoted=True)
        show("\nBy mode", counts["mode"], quoted=True)
        show("\nBy grade", counts["grade"], quoted=True)
        print(f"\nUnique school_ids: {len(ids):,}")

    elif name == "class_sizes":
        show("\nBy size category", counts["size"], quoted=True)
        show("\nBy grade", counts["grade"], quoted=True)
        # 'number' is a count of classes, so the total is a sum, not a row count.
        print(f"\nSum of 'number' (total classes): {total_classes(counts['number']):,}")
        print(f"Unique school_ids: {len(ids):,}")

print("\nDone.")
