"""Shared helpers for the CSM Monitor scripts: where the CSV snapshots live and how to read them.

Every script in this folder imports from here, so file names and reading rules are defined once.
Standard library only.
"""
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

# The three source snapshots. To use a newer extract, put the files in data/ and update these names.
SOURCES = {
    "schools": "official_list_of_schools_202609281509.csv",
    "shifting": "unit5_shifting_modality_view_202609281508.csv",
    "class_sizes": "vw_organized_class_sizes_202609281455.csv",
}

ROMAN = {"I": 1, "V": 5, "X": 10}


def source_path(name):
    return DATA_DIR / SOURCES[name]


def open_source(name):
    """Open a snapshot the way the supplied files need: BOM-aware UTF-8, undecodable bytes replaced."""
    return open(source_path(name), newline="", encoding="utf-8-sig", errors="replace")


def read_rows(name):
    """Yield one snapshot's rows as dicts, one at a time, so the large files are never held in memory."""
    with open_source(name) as f:
        yield from csv.DictReader(f)


def school_ids(name):
    """The distinct non-blank school_id values in one snapshot."""
    ids = set()
    for row in read_rows(name):
        sid = (row.get("school_id") or "").strip()
        if sid:
            ids.add(sid)
    return ids


def clean(value):
    """Trim a text value and collapse repeated spaces."""
    return " ".join((value or "").split())


def normalize_region(value):
    """Group 'REGION V' with 'Region V'. A blank region becomes 'Unknown' instead of being dropped."""
    value = clean(value)
    if value.upper().startswith("REGION "):
        return "Region " + value[7:].strip().upper()
    return value or "Unknown"


def roman_to_int(numeral):
    total = 0
    for symbol, following in zip(numeral, numeral[1:] + " "):
        value = ROMAN[symbol]
        total += -value if ROMAN.get(following, 0) > value else value
    return total


def region_sort_key(name):
    """Named regions (CAR, NCR, ...) in A-Z order, then Region I, II, III ... in numeric order."""
    match = re.fullmatch(r"Region ([IVX]+)(-\w+)?", name)
    if not match:
        return (0, 0, name)
    return (1, roman_to_int(match.group(1)), match.group(2) or "")


def snapshot_date():
    """Latest extract date in the source file names (they end in YYYYMMDDHHMM), as YYYY-MM-DD."""
    stamps = [re.search(r"(\d{4})(\d{2})(\d{2})\d{4}\.csv$", name) for name in SOURCES.values()]
    return max("-".join(stamp.groups()) for stamp in stamps if stamp)
