// The text sizes a reader can choose. `scale` multiplies the browser's own text size (16px normally),
// so Medium is the default look and the others grow or shrink everything written in rem.
export const fontSizes = [
  { label: "Small", scale: 0.875 },
  { label: "Medium", scale: 1 },
  { label: "Large", scale: 1.125 },
  { label: "XL", scale: 1.25 },
];

export const DEFAULT_FONT_INDEX = 1;

/** A saved or typed value -> a valid position in fontSizes. Anything unusable gives the default. */
export function parseFontIndex(value) {
  if (value === null || value === undefined || value === "") return DEFAULT_FONT_INDEX;
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 && index < fontSizes.length ? index : DEFAULT_FONT_INDEX;
}
