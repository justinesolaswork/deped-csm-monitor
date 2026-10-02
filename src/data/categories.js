// The categories the dashboard shows, and how each one is labelled and colored.
//
// A "stratum" is one colored slice of a stacked bar:
//   key   = the exact text used in the source data (and in dashboard_data.json)
//   field = the short name used in code
//   label = what people read on screen
// The order here is the order of the slices in every chart, legend and table.
import { palette } from "../theme/palette.js";

export const sizeStrata = [
  { key: "Above Standard", field: "above", label: "Above standard", color: palette.above },
  { key: "Within Standard", field: "within", label: "Within standard", color: palette.within },
  { key: "Less than Standard", field: "below", label: "Less than standard", color: palette.below },
];

export const shiftStrata = [
  { key: "Single Shift", field: "single", label: "Single shift", color: palette.single },
  { key: "Double Shift", field: "double", label: "Double shift", color: palette.double },
  { key: "Triple Shift", field: "triple", label: "Triple shift", color: palette.triple },
];

// Which strata describe which measure in dashboard_data.json. Used by the data checks in tests/.
export const strataByMeasure = {
  classSize: sizeStrata,
  shifting: shiftStrata,
};
