"""Compare school_id coverage between the master list and the two view files.

Read-only over the source CSVs. Standard library only. Run from the project root:
    python scripts/cross_check.py
"""
from csm_data import school_ids

master = school_ids("schools")
shifting = school_ids("shifting")
sizes = school_ids("class_sizes")

print(f"master:   {len(master):,}")
print(f"shifting: {len(shifting):,}")
print(f"sizes:    {len(sizes):,}")
print()
print(f"master - shifting (no modality data): {len(master - shifting):,}")
print(f"master - sizes    (no class size data): {len(master - sizes):,}")
print(f"master - (shifting|sizes) (in neither view): {len(master - (shifting | sizes)):,}")
print(f"(shifting|sizes) - master (orphan ids): {len((shifting | sizes) - master):,}")
print(f"shifting & sizes (in both views): {len(shifting & sizes):,}")
print(f"shifting - sizes: {len(shifting - sizes):,}")
print(f"sizes - shifting: {len(sizes - shifting):,}")
