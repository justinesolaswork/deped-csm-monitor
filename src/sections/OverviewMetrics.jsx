import { Box } from "@mui/material";
import SummaryMetric from "../components/SummaryMetric.jsx";
import { iconPaths } from "../components/LineIcon.jsx";
import { shiftStrata, sizeStrata } from "../data/categories.js";
import { toStackRow, valueKey } from "../data/selectors.js";
import { STICKY_TOP_CSS } from "../layout.js";
import { formatNumber, formatPercent } from "../lib/format.js";

// What each category means, in plain words. Keyed by stratum field.
const meanings = {
  above: "More learners in the class than the standard class size allows.",
  within: "The class meets the standard class size.",
  below: "Fewer learners in the class than the standard class size.",
  single: "The school holds one daily class session for the grade.",
  double: "Two groups of learners share the classrooms, one in the morning and one in the afternoon.",
  triple: "Three groups of learners share the classrooms in turn through the day.",
};

// The headline KPI cards for class size. Description lives inside each card.
export default function OverviewMetrics({ scope }) {
  const sizeRow = toStackRow(scope.name, scope.block.classSize, sizeStrata);
  const shiftRow = toStackRow(scope.name, scope.block.shifting, shiftStrata);

  return (
    <Box aria-label={`Class-size overview for ${scope.name}`} component="section" id="overview" sx={{ scrollMarginTop: STICKY_TOP_CSS }}>
      {/* Class size KPI cards */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "repeat(3, 1fr)", xs: "1fr" } }}>
        {sizeStrata.map(({ field, label, color }) => (
          <SummaryMetric
            color={color}
            description={meanings[field]}
            detail={`${formatPercent(sizeRow[valueKey(field, "share")])} of ${formatNumber(sizeRow.total)} classes`}
            icon={iconPaths[field]}
            key={field}
            label={label}
            value={sizeRow[field]}
          />
        ))}
      </Box>

      {/* Shifting schedule KPI cards */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "repeat(3, 1fr)", xs: "1fr" }, mt: 3 }}>
        {shiftStrata.map(({ field, label, color }) => (
          <SummaryMetric
            color={color}
            description={meanings[field]}
            detail={`${formatPercent(shiftRow[valueKey(field, "share")])} of ${formatNumber(shiftRow.total)} grade records`}
            icon={iconPaths[field]}
            key={field}
            label={label}
            value={shiftRow[field]}
          />
        ))}
      </Box>
    </Box>
  );
}
