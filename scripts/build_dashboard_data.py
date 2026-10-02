"""Aggregate the three DepEd CSV snapshots into the JSON files the frontend reads.

Read-only over the source CSVs. Standard library only. Run from the project root:
    python scripts/build_dashboard_data.py           # rebuild the JSON
    python scripts/build_dashboard_data.py --check   # only verify the JSON on disk is up to date

It writes two things:

src/data/dashboard_data.json: one "block" per area, nested national > regions > divisions. Every
block has the same keys (name, classSize, shifting, offering, coverage), so the frontend
can treat any area the same way.

src/data/schools/<region>.json: one file per region listing every school in the master list with
its class-size and shifting counts. The dashboard loads a file only when its region is chosen.
"""
import json
import re
import sys
from collections import Counter, defaultdict

from csm_data import ROOT, SOURCES, clean, normalize_region, read_rows, region_sort_key, snapshot_date

OUT = ROOT / "src" / "data" / "dashboard_data.json"
SCHOOLS_DIR = ROOT / "src" / "data" / "schools"
SCHOOL_MEASURES = ("classSize", "shifting")
ALL_REGIONS = "All regions"
UNMATCHED = "Not in master list"
MEASURES = ("classSize", "shifting", "offering")


def new_tally():
    return {key: Counter() for key in (*MEASURES, "coverage")}


def load_schools():
    """Read the master list: each school's area, offering and name, plus the display name of every division."""
    schools = {}  # school_id -> ((region, division key), offering, school name)
    spellings = defaultdict(Counter)  # (region, division key) -> how often each spelling occurs
    for row in read_rows("schools"):
        division = clean(row["division"]) or "Unknown"
        area = (normalize_region(row["region"]), division.casefold())
        spellings[area][division] += 1
        schools[row["school_id"].strip()] = (area, clean(row["mcoc"]) or "Unknown", clean(row["school_name"]))
    # 'ALBAY' and 'Albay' are one division; show whichever spelling is more common.
    names = {area: counts.most_common(1)[0][0] for area, counts in spellings.items()}
    return schools, names


def tally_divisions(schools):
    """Add up every measure per division. Rows whose school is not in the master list go to `unmatched`.

    Also keeps class-size and shifting counts per school, for the per-region school files.
    """
    divisions = defaultdict(new_tally)
    unmatched = new_tally()
    per_school = {measure: defaultdict(Counter) for measure in SCHOOL_MEASURES}  # measure -> school_id -> counts
    sized, shifted = set(), set()

    def tally_for(school_id):
        school = schools.get(school_id)
        return divisions[school[0]] if school else unmatched

    for row in read_rows("class_sizes"):
        school_id = row["school_id"].strip()
        sized.add(school_id)
        # 'number' is a count of classes, so it is summed rather than counted as one row.
        tally_for(school_id)["classSize"][row["size"]] += int(row["number"])
        per_school["classSize"][school_id][row["size"]] += int(row["number"])

    for row in read_rows("shifting"):
        school_id = row["school_id"].strip()
        shifted.add(school_id)
        tally_for(school_id)["shifting"][row["shifting"]] += 1
        per_school["shifting"][school_id][row["shifting"]] += 1

    for school_id, (area, offering, _) in schools.items():
        tally = divisions[area]
        tally["offering"][offering] += 1
        coverage = tally["coverage"]
        coverage["schools"] += 1
        coverage["withClassSize"] += school_id in sized
        coverage["withShifting"] += school_id in shifted
        coverage["inNeitherView"] += school_id not in sized and school_id not in shifted

    unmatched["coverage"]["orphanSchoolIds"] = len((sized | shifted) - schools.keys())
    return divisions, unmatched, per_school


def add_up(tallies):
    total = new_tally()
    for tally in tallies:
        for key, counter in tally.items():
            total[key].update(counter)
    return total


def block(name, tally, categories):
    """One area as plain JSON: every category present (zero-filled) and in the same order everywhere."""
    out = {"name": name}
    for measure in MEASURES:
        out[measure] = {category: tally[measure][category] for category in categories[measure]}
    out["coverage"] = dict(tally["coverage"])
    return out


def school_file_name(region):
    """'Region IV-A' -> 'region-iv-a.json'. src/data/selectors.js builds the same name to find the file."""
    return re.sub(r"[^a-z0-9]+", "-", region.lower()).strip("-") + ".json"


def school_files(schools, division_names, per_school, categories):
    """The text of each region's school file, keyed by file name.

    Counts are lists in the order of classSizeKeys / shiftingKeys, which keeps the files small.
    A school with no rows in a view gets null there, so "no record" is not shown as zero.
    """
    by_region = defaultdict(list)
    for school_id, (area, _, name) in schools.items():
        entry = {"id": school_id, "name": name, "division": division_names[area]}
        for measure in SCHOOL_MEASURES:
            counts = per_school[measure].get(school_id)
            entry[measure] = [counts[category] for category in categories[measure]] if counts else None
        by_region[area[0]].append(entry)

    files = {}
    for region, entries in by_region.items():
        entries.sort(key=lambda entry: (entry["division"].casefold(), entry["name"].casefold(), entry["id"]))
        # One school per line: compact, but still readable and easy to compare between builds.
        lines = ",\n".join("    " + json.dumps(entry, separators=(",", ":")) for entry in entries)
        head = {"region": region, "classSizeKeys": categories["classSize"], "shiftingKeys": categories["shifting"]}
        files[school_file_name(region)] = json.dumps(head, indent=2)[:-2] + ',\n  "schools": [\n' + lines + "\n  ]\n}\n"
    return files


def build():
    """Returns the dashboard data, and every output file as {path: text}."""
    schools, division_names = load_schools()
    divisions, unmatched, per_school = tally_divisions(schools)

    by_region = defaultdict(list)  # region -> [(division name, tally)]
    for (region, key), tally in divisions.items():
        by_region[region].append((division_names[(region, key)], tally))
    regions = {region: add_up(tally for _, tally in items) for region, items in by_region.items()}
    national = add_up([*regions.values(), unmatched])

    # Largest category first, so the order is stable and does not depend on row order in the CSVs.
    categories = {
        measure: [name for name, _ in sorted(national[measure].items(), key=lambda item: (-item[1], item[0]))]
        for measure in MEASURES
    }

    national_block = block(ALL_REGIONS, national, categories)
    coverage = national["coverage"]
    national_block["coverage"] = {
        "schools": coverage["schools"],
        "withClassSize": coverage["withClassSize"],
        "withShifting": coverage["withShifting"],
        "inNeitherView": coverage["inNeitherView"],
        "withoutShifting": coverage["schools"] - coverage["withShifting"],
        "withoutClassSize": coverage["schools"] - coverage["withClassSize"],
        "orphanSchoolIds": coverage["orphanSchoolIds"],
    }

    region_blocks = []
    for region in sorted(regions, key=region_sort_key):
        region_block = block(region, regions[region], categories)
        region_block["divisions"] = [
            block(name, tally, categories) for name, tally in sorted(by_region[region], key=lambda item: item[0].casefold())
        ]
        region_blocks.append(region_block)

    data = {
        "meta": {
            "snapshotDate": snapshot_date(),
            "generatedBy": "scripts/build_dashboard_data.py",
            "sources": SOURCES,
            "notes": [
                "classSize values are sums of the 'number' column (count of classes), not row counts.",
                "shifting values are school-by-grade records.",
                "offering and coverage values are counts of schools in the master list.",
                f"Rows whose school_id is absent from the master list are grouped under '{UNMATCHED}'.",
                "Region casing is normalized (e.g. 'REGION V' -> 'Region V').",
                "Division spellings that differ only by casing or spacing are merged (e.g. 'ALBAY' -> 'Albay').",
            ],
        },
        "national": national_block,
        "regions": region_blocks,
        "unmatched": block(UNMATCHED, unmatched, categories),
    }
    outputs = {OUT: json.dumps(data, indent=2) + "\n"}
    for name, text in school_files(schools, division_names, per_school, categories).items():
        outputs[SCHOOLS_DIR / name] = text
    return data, outputs


def main():
    data, outputs = build()
    # School files left over from an older snapshot (for example a renamed region).
    leftovers = [path for path in SCHOOLS_DIR.glob("*.json") if path not in outputs]

    if "--check" in sys.argv[1:]:
        stale = [path for path, text in outputs.items() if not path.exists() or path.read_text(encoding="utf-8") != text]
        if stale or leftovers:
            for path in [*stale, *leftovers]:
                print(f"OUT OF DATE: {path.relative_to(ROOT)} does not match the CSV snapshots.")
            print("Fix: python scripts/build_dashboard_data.py")
            return 1
        print(f"Up to date: {OUT.relative_to(ROOT)} and {len(outputs) - 1} school files")
    else:
        for path in leftovers:
            path.unlink()
        for path, text in outputs.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8", newline="\n")
        size = sum(path.stat().st_size for path in outputs if path != OUT)
        print(f"Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size:,} bytes)")
        print(f"Wrote {len(outputs) - 1} school files in {SCHOOLS_DIR.relative_to(ROOT)} ({size:,} bytes)")

    national = data["national"]
    print("Classes by size:", national["classSize"], "total", sum(national["classSize"].values()))
    print("Coverage:", national["coverage"])
    print(f"Areas: {len(data['regions'])} regions, {sum(len(r['divisions']) for r in data['regions'])} divisions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
