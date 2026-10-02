// Checks that src/data/dashboard_data.json is trustworthy before the screen draws it. Run with: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { strataByMeasure } from "../src/data/categories.js";
import { schoolsFileName } from "../src/data/selectors.js";

const data = JSON.parse(readFileSync(new URL("../src/data/dashboard_data.json", import.meta.url), "utf8"));

// The figures documented in CSV_ANALYSIS.md for the 2026-09-28 snapshot.
// Loaded a newer snapshot? Update CSV_ANALYSIS.md first, then these numbers.
const DOCUMENTED = {
  classes: 704974,
  shiftingRecords: 269137,
  schools: 45934,
  withoutShifting: 5002,
  withoutClassSize: 1648,
  inNeitherView: 866,
  orphanSchoolIds: 86,
};

const MEASURES = ["classSize", "shifting", "offering"];
const sum = (counts) => Object.values(counts).reduce((total, value) => total + value, 0);
const allAreas = [data.national, data.unmatched, ...data.regions, ...data.regions.flatMap((region) => region.divisions)];

test("national totals match the figures documented in CSV_ANALYSIS.md", () => {
  const { national } = data;
  assert.equal(sum(national.classSize), DOCUMENTED.classes);
  assert.equal(sum(national.shifting), DOCUMENTED.shiftingRecords);
  assert.equal(sum(national.offering), DOCUMENTED.schools);
  assert.equal(national.coverage.schools, DOCUMENTED.schools);
  assert.equal(national.coverage.withoutShifting, DOCUMENTED.withoutShifting);
  assert.equal(national.coverage.withoutClassSize, DOCUMENTED.withoutClassSize);
  assert.equal(national.coverage.inNeitherView, DOCUMENTED.inNeitherView);
  assert.equal(national.coverage.orphanSchoolIds, DOCUMENTED.orphanSchoolIds);
});

test("every area has the same measures with the same categories", () => {
  for (const area of allAreas) {
    assert.equal(typeof area.name, "string");
    for (const measure of MEASURES) {
      assert.deepEqual(Object.keys(area[measure]), Object.keys(data.national[measure]), `${area.name}.${measure}`);
      for (const value of Object.values(area[measure])) assert.ok(Number.isInteger(value) && value >= 0);
    }
  }
});

test("regions plus rows outside the master list add up to the national totals", () => {
  for (const measure of MEASURES) {
    for (const [category, expected] of Object.entries(data.national[measure])) {
      const total = data.regions.reduce((acc, region) => acc + region[measure][category], data.unmatched[measure][category]);
      assert.equal(total, expected, `${measure} / ${category}`);
    }
  }
  const schools = data.regions.reduce((acc, region) => acc + region.coverage.schools, 0);
  assert.equal(schools, data.national.coverage.schools);
});

test("divisions add up to their region", () => {
  for (const region of data.regions) {
    assert.ok(region.divisions.length > 0, `${region.name} has no divisions`);
    for (const measure of [...MEASURES, "coverage"]) {
      for (const [category, expected] of Object.entries(region[measure])) {
        const total = region.divisions.reduce((acc, division) => acc + division[measure][category], 0);
        assert.equal(total, expected, `${region.name} / ${measure} / ${category}`);
      }
    }
  }
});

test("each area's schools match its offering counts and its coverage is consistent", () => {
  for (const area of [...data.regions, ...data.regions.flatMap((region) => region.divisions)]) {
    const { schools, withClassSize, withShifting, inNeitherView } = area.coverage;
    assert.equal(sum(area.offering), schools, area.name);
    assert.ok(withClassSize <= schools && withShifting <= schools && inNeitherView <= schools, area.name);
    assert.ok(inNeitherView <= schools - Math.max(withClassSize, withShifting), area.name);
  }
});

test("region and division names are unique, with casing variants merged", () => {
  const regions = data.regions.map((region) => region.name);
  assert.equal(new Set(regions.map((name) => name.toLowerCase())).size, regions.length);
  for (const region of data.regions) {
    const divisions = region.divisions.map((division) => division.name.toLowerCase());
    assert.equal(new Set(divisions).size, divisions.length, `duplicate division in ${region.name}`);
  }
});

test("every category in the data is one the dashboard knows how to show", () => {
  for (const [measure, strata] of Object.entries(strataByMeasure)) {
    assert.deepEqual(
      Object.keys(data.national[measure]).sort(),
      strata.map((stratum) => stratum.key).sort(),
      `${measure}: add any new category to src/data/categories.js`,
    );
  }
});

test("each region's school file lists every school and adds up to the region's totals", () => {
  for (const region of data.regions) {
    const url = new URL(`../src/data/schools/${schoolsFileName(region.name)}`, import.meta.url);
    const file = JSON.parse(readFileSync(url, "utf8"));
    assert.equal(file.region, region.name);
    assert.equal(file.schools.length, region.coverage.schools, region.name);
    assert.equal(new Set(file.schools.map((school) => school.id)).size, file.schools.length, `duplicate school in ${region.name}`);
    assert.equal(file.schools.filter((school) => school.classSize).length, region.coverage.withClassSize, region.name);
    assert.equal(file.schools.filter((school) => school.shifting).length, region.coverage.withShifting, region.name);

    const divisions = new Set(region.divisions.map((division) => division.name));
    for (const school of file.schools) assert.ok(divisions.has(school.division), `${school.id}: unknown division ${school.division}`);

    for (const [measure, keys] of [["classSize", file.classSizeKeys], ["shifting", file.shiftingKeys]]) {
      keys.forEach((key, position) => {
        const total = file.schools.reduce((acc, school) => acc + (school[measure]?.[position] ?? 0), 0);
        assert.equal(total, region[measure][key], `${region.name} / ${measure} / ${key}`);
      });
    }
  }
});

test("the snapshot date is present and well formed", () => {
  assert.match(data.meta.snapshotDate, /^\d{4}-\d{2}-\d{2}$/);
});
