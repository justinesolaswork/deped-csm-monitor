// Selectors: pure functions that turn dashboard_data.json into the shapes the screen needs.
// No React and no side effects, so everything here is covered by `npm test`.

/** Names for the Region filter: the national option first, then every region. */
export function regionOptions(data) {
  return [data.national.name, ...data.regions.map((region) => region.name)];
}

/**
 * The slice of data the dashboard is looking at.
 * The national scope lists regions as its children; a region scope lists its divisions.
 * An unknown region name falls back to the national scope.
 */
export function getScope(data, regionName) {
  const region = data.regions.find((item) => item.name === regionName);
  if (region) {
    return { level: "region", name: region.name, block: region, children: region.divisions, childLabel: "division" };
  }
  return { level: "national", name: data.national.name, block: data.national, children: data.regions, childLabel: "region" };
}

/**
 * The same scope, but with every region as its rows, whichever region is selected.
 * For panels that compare regions rather than drill into divisions.
 */
export function withRegionRows(data, scope) {
  return { ...scope, children: data.regions, childLabel: "region" };
}

/** The key a chart reads for one stratum: "above" for counts, "aboveShare" for percentages. */
export function valueKey(field, measure) {
  return measure === "share" ? `${field}Share` : field;
}

/** One area's counts and percentage shares for each stratum, plus the total. */
export function toStackRow(name, counts, strata) {
  const total = strata.reduce((sum, { key }) => sum + (counts[key] ?? 0), 0);
  const row = { name, total };
  let shareSoFar = 0;
  strata.forEach(({ key, field }, index) => {
    const count = counts[key] ?? 0;
    // The last share is the remainder, so a full stack is exactly 100 despite floating-point error.
    const isLast = index === strata.length - 1;
    const share = total ? (isLast ? Math.max(0, 100 - shareSoFar) : (count / total) * 100) : 0;
    shareSoFar += share;
    row[field] = count;
    row[valueKey(field, "share")] = share;
  });
  return row;
}

/** One chart row per area (region or division) for a measure such as "classSize". */
export function toStackRows(areas, measureKey, strata) {
  return areas.map((area) => toStackRow(area.name, area[measureKey], strata));
}

/**
 * Order rows for display.
 * sort.by is "name" (the data's own order), "total", or a stratum field such as "above".
 * sort.dir is "asc" or "desc". Value sorts follow the current measure (share or count).
 */
export function sortRows(rows, sort, measure) {
  const ordered = [...rows];
  if (sort.by === "name") return sort.dir === "desc" ? ordered.reverse() : ordered;
  const key = sort.by === "total" ? "total" : valueKey(sort.by, measure);
  const direction = sort.dir === "desc" ? -1 : 1;
  // Array sort is stable, so rows with equal values keep the data's own order.
  return ordered.sort((a, b) => direction * (a[key] - b[key]));
}

/**
 * The sort to actually apply: if the chosen stratum is hidden, fall back to the first visible one.
 */
export function resolveSort(sort, strata, hidden) {
  const isStratum = strata.some(({ field }) => field === sort.by);
  if (!isStratum || !hidden.includes(sort.by)) return sort;
  const firstVisible = strata.find(({ field }) => !hidden.includes(field));
  return { by: firstVisible ? firstVisible.field : "total", dir: "desc" };
}

/** Show or hide one stratum, always keeping at least one visible. */
export function toggleHidden(hidden, field, strataCount) {
  if (hidden.includes(field)) return hidden.filter((item) => item !== field);
  return hidden.length === strataCount - 1 ? hidden : [...hidden, field];
}

/** The file in src/data/schools/ that lists one region's schools: "Region IV-A" -> "region-iv-a.json". */
export function schoolsFileName(regionName) {
  return `${regionName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;
}

/**
 * One table row per school from a region's school file.
 * Each row has id, name, division, then one count per class-size and shifting stratum,
 * named by its field. A count is null when the school has no record in that view.
 */
export function toSchoolRows(file, sizeStrata, shiftStrata) {
  // The file stores counts as lists; find each category's position in them once.
  const sizeColumns = sizeStrata.map(({ field, key }) => [field, file.classSizeKeys.indexOf(key)]);
  const shiftColumns = shiftStrata.map(({ field, key }) => [field, file.shiftingKeys.indexOf(key)]);
  const fill = (row, counts, columns) => {
    for (const [field, position] of columns) row[field] = counts ? (counts[position] ?? 0) : null;
  };
  return file.schools.map((school) => {
    const row = { id: school.id, name: school.name, division: school.division };
    fill(row, school.classSize, sizeColumns);
    fill(row, school.shifting, shiftColumns);
    return row;
  });
}

/** Keep the schools in one division ("" for all) whose ID or name contains the search text. */
export function filterSchools(rows, division, search) {
  const text = search.trim().toLowerCase();
  return rows.filter(
    (row) => (!division || row.division === division) && (!text || row.id.includes(text) || row.name.toLowerCase().includes(text)),
  );
}

// One shared collator: calling String.localeCompare with options builds a new one for every
// comparison, which took many seconds to sort the 46,000 schools of "All regions".
const collator = new Intl.Collator("en", { numeric: true });

/** Order school rows by any column. Schools with no record (null) always come last. */
export function sortSchools(rows, sort) {
  const direction = sort.dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const left = a[sort.by];
    const right = b[sort.by];
    if (left === null || right === null) return (left === null) - (right === null);
    if (typeof left === "number") return direction * (left - right);
    return direction * collator.compare(left, right);
  });
}

/** Schools in the master registry that are missing from the view files. */
export function coverageGaps(coverage) {
  const { schools, withClassSize, withShifting, inNeitherView } = coverage;
  const item = (label, value) => ({ label, value, share: schools ? (value / schools) * 100 : 0 });
  return [
    item("No class-size record", schools - withClassSize),
    item("No shifting record", schools - withShifting),
    item("In neither view", inNeitherView),
  ];
}
