// Checks for the pure functions the screen is built on. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { shiftStrata, sizeStrata } from "../src/data/categories.js";
import {
  coverageGaps,
  filterSchools,
  getScope,
  regionOptions,
  resolveSort,
  schoolsFileName,
  schoolsInSegment,
  sortRows,
  sortSchools,
  toSchoolRows,
  toStackRow,
  toStackRows,
  toggleHidden,
  valueKey,
  withRegionRows,
} from "../src/data/selectors.js";
import { formatDate, formatNumber, formatPercent } from "../src/lib/format.js";

const area = (name, above, within, below) => ({
  name,
  classSize: { "Above Standard": above, "Within Standard": within, "Less than Standard": below },
});

const data = {
  national: area("All regions", 30, 60, 210),
  regions: [
    { ...area("North", 10, 20, 70), divisions: [area("North A", 4, 8, 28), area("North B", 6, 12, 42)] },
    { ...area("South", 20, 40, 140), divisions: [area("South A", 20, 40, 140)] },
  ],
};

test("regionOptions lists the national option first, then every region", () => {
  assert.deepEqual(regionOptions(data), ["All regions", "North", "South"]);
});

test("getScope: the national scope lists regions as children", () => {
  const scope = getScope(data, "All regions");
  assert.equal(scope.level, "national");
  assert.equal(scope.childLabel, "region");
  assert.deepEqual(scope.children.map((child) => child.name), ["North", "South"]);
  assert.equal(scope.block, data.national);
});

test("getScope: a region scope lists its divisions as children", () => {
  const scope = getScope(data, "North");
  assert.equal(scope.level, "region");
  assert.equal(scope.childLabel, "division");
  assert.deepEqual(scope.children.map((child) => child.name), ["North A", "North B"]);
});

test("getScope: an unknown region falls back to the national scope", () => {
  assert.equal(getScope(data, "Atlantis").level, "national");
  assert.equal(getScope(data, undefined).level, "national");
});

test("withRegionRows: a region scope keeps its own block but lists every region", () => {
  const scope = withRegionRows(data, getScope(data, "North"));
  assert.equal(scope.level, "region");
  assert.equal(scope.name, "North");
  assert.equal(scope.childLabel, "region");
  assert.deepEqual(scope.children.map((child) => child.name), ["North", "South"]);
});

test("toStackRow: counts, total and shares", () => {
  const row = toStackRow("North", data.regions[0].classSize, sizeStrata);
  assert.deepEqual(
    { name: row.name, total: row.total, above: row.above, within: row.within, below: row.below },
    { name: "North", total: 100, above: 10, within: 20, below: 70 },
  );
  assert.equal(row.aboveShare, 10);
  assert.equal(row.withinShare, 20);
  assert.equal(row.belowShare, 70);
});

test("toStackRow: shares add up to exactly 100 even when the division is not exact", () => {
  const row = toStackRow("Thirds", { "Above Standard": 1, "Within Standard": 1, "Less than Standard": 1 }, sizeStrata);
  assert.equal(row.aboveShare + row.withinShare + row.belowShare, 100);
});

test("toStackRow: an area with no records gives zero shares, not NaN", () => {
  const row = toStackRow("Empty", {}, sizeStrata);
  assert.deepEqual([row.total, row.aboveShare, row.withinShare, row.belowShare], [0, 0, 0, 0]);
});

test("toStackRows: one row per area, in the data's order", () => {
  const rows = toStackRows(data.regions, "classSize", sizeStrata);
  assert.deepEqual(rows.map((row) => [row.name, row.total]), [["North", 100], ["South", 200]]);
});

test("valueKey picks the count or the share field", () => {
  assert.equal(valueKey("above", "count"), "above");
  assert.equal(valueKey("above", "share"), "aboveShare");
});

test("sortRows: by name keeps or reverses the data order", () => {
  const rows = [{ name: "a" }, { name: "b" }, { name: "c" }];
  assert.deepEqual(sortRows(rows, { by: "name", dir: "asc" }, "share").map((r) => r.name), ["a", "b", "c"]);
  assert.deepEqual(sortRows(rows, { by: "name", dir: "desc" }, "share").map((r) => r.name), ["c", "b", "a"]);
  assert.deepEqual(rows.map((r) => r.name), ["a", "b", "c"], "the input must not be reordered");
});

test("sortRows: a stratum sort follows the measure, and ties keep the data order", () => {
  const rows = [
    { name: "big-low-share", above: 50, aboveShare: 5, total: 1000 },
    { name: "small-high-share", above: 20, aboveShare: 40, total: 50 },
    { name: "tie", above: 20, aboveShare: 5, total: 400 },
  ];
  const names = (sort, measure) => sortRows(rows, sort, measure).map((r) => r.name);
  assert.deepEqual(names({ by: "above", dir: "desc" }, "share"), ["small-high-share", "big-low-share", "tie"]);
  assert.deepEqual(names({ by: "above", dir: "desc" }, "count"), ["big-low-share", "small-high-share", "tie"]);
  assert.deepEqual(names({ by: "above", dir: "asc" }, "count"), ["small-high-share", "tie", "big-low-share"]);
  assert.deepEqual(names({ by: "total", dir: "desc" }, "share"), ["big-low-share", "tie", "small-high-share"]);
});

test("resolveSort: falls back to the first visible stratum when the chosen one is hidden", () => {
  assert.deepEqual(resolveSort({ by: "single", dir: "desc" }, shiftStrata, ["single"]), { by: "double", dir: "desc" });
  assert.deepEqual(resolveSort({ by: "double", dir: "asc" }, shiftStrata, ["single"]), { by: "double", dir: "asc" });
  assert.deepEqual(resolveSort({ by: "name", dir: "asc" }, shiftStrata, ["single"]), { by: "name", dir: "asc" });
  assert.deepEqual(resolveSort({ by: "total", dir: "desc" }, shiftStrata, ["single"]), { by: "total", dir: "desc" });
});

test("toggleHidden: hides, shows, and always keeps one stratum visible", () => {
  assert.deepEqual(toggleHidden([], "above", 3), ["above"]);
  assert.deepEqual(toggleHidden(["above"], "above", 3), []);
  assert.deepEqual(toggleHidden(["above", "within"], "below", 3), ["above", "within"]);
});

test("coverageGaps: schools missing from each view", () => {
  const gaps = coverageGaps({ schools: 200, withClassSize: 190, withShifting: 150, inNeitherView: 4 });
  assert.deepEqual(gaps, [
    { label: "No class-size record", value: 10, share: 5 },
    { label: "No shifting record", value: 50, share: 25 },
    { label: "In neither view", value: 4, share: 2 },
  ]);
});

const schoolFile = {
  region: "North",
  classSizeKeys: ["Less than Standard", "Within Standard", "Above Standard"],
  shiftingKeys: ["Single Shift", "Double Shift", "Triple Shift"],
  schools: [
    { id: "100002", name: "Bato ES", division: "North A", classSize: [5, 2, 1], shifting: [4, 3, 0] },
    { id: "100010", name: "Agos NHS", division: "North B", classSize: null, shifting: [6, 0, 1] },
    { id: "100001", name: "Cawayan ES", division: "North A", classSize: [0, 3, 4], shifting: null },
  ],
};

test("schoolsFileName: a region name becomes its file name", () => {
  assert.equal(schoolsFileName("Region IV-A"), "region-iv-a.json");
  assert.equal(schoolsFileName("NCR"), "ncr.json");
});

test("toSchoolRows: counts by field, null where a school has no record", () => {
  const rows = toSchoolRows(schoolFile, sizeStrata, shiftStrata);
  assert.deepEqual(rows[0], { id: "100002", name: "Bato ES", division: "North A", above: 1, within: 2, below: 5, single: 4, double: 3, triple: 0 });
  assert.deepEqual([rows[1].above, rows[1].within, rows[1].below], [null, null, null]);
  assert.deepEqual([rows[2].single, rows[2].double, rows[2].triple], [null, null, null]);
});

test("filterSchools: by division and by ID or name", () => {
  const rows = toSchoolRows(schoolFile, sizeStrata, shiftStrata);
  const ids = (list) => list.map((row) => row.id);
  assert.deepEqual(ids(filterSchools(rows, "", "")), ["100002", "100010", "100001"]);
  assert.deepEqual(ids(filterSchools(rows, "North A", "")), ["100002", "100001"]);
  assert.deepEqual(ids(filterSchools(rows, "", " agos ")), ["100010"]);
  assert.deepEqual(ids(filterSchools(rows, "North A", "0001")), ["100001"]);
});

test("sortSchools: text and number columns, with no-record schools last either way", () => {
  const rows = toSchoolRows(schoolFile, sizeStrata, shiftStrata);
  const ids = (sort) => sortSchools(rows, sort).map((row) => row.id);
  assert.deepEqual(ids({ by: "name", dir: "asc" }), ["100010", "100002", "100001"]);
  assert.deepEqual(ids({ by: "id", dir: "desc" }), ["100010", "100002", "100001"]);
  assert.deepEqual(ids({ by: "above", dir: "desc" }), ["100001", "100002", "100010"]);
  assert.deepEqual(ids({ by: "above", dir: "asc" }), ["100002", "100001", "100010"]);
});

test("strata: fields and keys are unique, and every stratum has a color", () => {
  for (const strata of [sizeStrata, shiftStrata]) {
    assert.equal(new Set(strata.map((s) => s.field)).size, strata.length);
    assert.equal(new Set(strata.map((s) => s.key)).size, strata.length);
    for (const stratum of strata) assert.match(stratum.color, /^#[0-9a-f]{6}$/);
  }
});

test("formatting", () => {
  assert.equal(formatNumber(704974), "704,974");
  assert.equal(formatPercent(0), "0%");
  assert.equal(formatPercent(0.004), "<0.01%");
  assert.equal(formatPercent(0.078), "0.08%");
  assert.equal(formatPercent(10.79), "10.8%");
  assert.equal(formatPercent(100), "100.0%");
  assert.equal(formatDate("2026-09-28"), "28 Sep 2026");
});

test("schoolsInSegment: keeps schools with a count in the slice, optionally for one division", () => {
  const rows = [
    { id: "1", division: "A", above: 2 },
    { id: "2", division: "A", above: 0 },
    { id: "3", division: "B", above: null },
    { id: "4", division: "B", above: 5 },
  ];
  assert.deepEqual(schoolsInSegment(rows, "", "above").map((r) => r.id), ["1", "4"]);
  assert.deepEqual(schoolsInSegment(rows, "B", "above").map((r) => r.id), ["4"]);
});

test("csv: cells with commas, quotes and line breaks are quoted", async () => {
  const { csvCell, toCsv, csvFileName } = await import("../src/lib/csv.js");
  assert.equal(csvCell('He said "hi", ok'), '"He said ""hi"", ok"');
  assert.equal(csvCell(null), "");
  assert.equal(csvCell(12), "12");
  assert.equal(toCsv(["a", "b"], [["x,y", 2]]), 'a,b\r\n"x,y",2');
  assert.equal(csvFileName("Class-size profile", "Region V"), "class-size-profile-region-v");
});
