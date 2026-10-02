"""Export schools in selected divisions that run any non-single shift (double/triple) in at least one grade.

Read-only over the source CSVs. Standard library only. Run from the project root:
    python scripts/export_non_single_shift.py
Output: exports/non_single_shift_mindoro_calapan.csv (one row per school).
To export other divisions, change DIVISIONS and OUT below.
"""
import csv
from collections import defaultdict

from csm_data import ROOT, read_rows

DIVISIONS = {"Oriental Mindoro", "Occidental Mindoro", "Calapan City"}
OUT = ROOT / "exports" / "non_single_shift_mindoro_calapan.csv"
GRADE_ORDER = ["Kinder"] + [f"Grade {n}" for n in range(1, 13)] + [f"MG {n}" for n in range(1, 4)]

schools = {r["school_id"]: r for r in read_rows("schools") if r["division"].strip() in DIVISIONS}

grades = defaultdict(lambda: defaultdict(list))  # school_id -> shift -> [grades]
records = defaultdict(int)
for r in read_rows("shifting"):
    if r["school_id"] in schools:
        grades[r["school_id"]][r["shifting"]].append(r["grade"])
        records[r["school_id"]] += 1


def ordered(values):
    return sorted(values, key=lambda g: GRADE_ORDER.index(g) if g in GRADE_ORDER else len(GRADE_ORDER))


rows = []
for sid, by_shift in grades.items():
    double, triple = ordered(by_shift.get("Double Shift", [])), ordered(by_shift.get("Triple Shift", []))
    if not (double or triple):
        continue
    s = schools[sid]
    rows.append({
        "school_id": sid,
        "school_name": s["school_name"],
        "division": s["division"],
        "district": s["district"],
        "municipality": s["municipality"],
        "barangay": s["barangay"],
        "highest_shift": "Triple Shift" if triple else "Double Shift",
        "double_shift_grades": "; ".join(double),
        "triple_shift_grades": "; ".join(triple),
        "grade_records": records[sid],
        "non_single_shift_grade_records": len(double) + len(triple),
    })

rows.sort(key=lambda r: (r["division"], r["district"], r["school_name"]))
OUT.parent.mkdir(exist_ok=True)
# utf-8-sig so Excel opens it correctly, matching the source files' BOM.
with open(OUT, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0]), quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(rows)

with_records = len(grades)
print(f"Schools in selected divisions: {len(schools)} ({with_records} with shifting records, {len(schools) - with_records} with none)")
print(f"Schools with double/triple shift: {len(rows)} -> {OUT.relative_to(ROOT)}")
for d in sorted(DIVISIONS):
    print(f"  {d}: {sum(r['division'] == d for r in rows)}")
print(f"  of which any triple shift: {sum(bool(r['triple_shift_grades']) for r in rows)}")
