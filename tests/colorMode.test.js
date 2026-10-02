// Checks for the light and dark choice. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseColorMode } from "../src/lib/colorMode.js";

test("parseColorMode: a saved choice wins over the device setting", () => {
  assert.equal(parseColorMode("dark", false), "dark");
  assert.equal(parseColorMode("light", true), "light");
});

test("parseColorMode: with nothing usable saved, follow the device", () => {
  for (const saved of [null, undefined, "", "blue"]) {
    assert.equal(parseColorMode(saved, true), "dark");
    assert.equal(parseColorMode(saved, false), "light");
  }
  assert.equal(parseColorMode(null), "light");
});
