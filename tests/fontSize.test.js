// Checks for the text-size choices. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_FONT_INDEX, fontSizes, parseFontIndex } from "../src/lib/fontSize.js";

test("fontSizes: four steps, small to XL, Medium is the plain browser size", () => {
  assert.deepEqual(fontSizes.map((size) => size.label), ["Small", "Medium", "Large", "XL"]);
  assert.equal(fontSizes[DEFAULT_FONT_INDEX].label, "Medium");
  assert.equal(fontSizes[DEFAULT_FONT_INDEX].scale, 1);
  const scales = fontSizes.map((size) => size.scale);
  assert.deepEqual([...scales].sort((a, b) => a - b), scales);
});

test("parseFontIndex: valid positions pass through, anything else gives the default", () => {
  assert.equal(parseFontIndex("0"), 0);
  assert.equal(parseFontIndex("3"), 3);
  for (const bad of [null, undefined, "", "4", "-1", "1.5", "big", NaN]) {
    assert.equal(parseFontIndex(bad), DEFAULT_FONT_INDEX, String(bad));
  }
});
