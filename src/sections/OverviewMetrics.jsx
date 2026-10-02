import { Box, Stack, Typography } from "@mui/material";
import SummaryMetric from "../components/SummaryMetric.jsx";
import { iconPaths } from "../components/LineIcon.jsx";
import { shiftStrata, sizeStrata } from "../data/categories.js";
import { toStackRow, valueKey } from "../data/selectors.js";
import { STICKY_TOP_CSS } from "../layout.js";
import { formatNumber, formatPercent } from "../lib/format.js";

// What each category means, in plain words. Keyed by stratum field, so a new category must be added here too.
const meanings = {
  above: "More learners in the class than the standard class size allows.",
  within: "The class meets the standard class size.",
  below: "Fewer learners in the class than the standard class size.",
  single: "The school holds one daily class session for the grade.",
  double: "Two groups of learners share the classrooms, one in the morning and one in the afternoon.",
  triple: "Three groups of learners share the classrooms in turn through the day.",
};

// A short key to the terms used on the whole page. `unit` says what the number beside each term counts.
function Key({ title, strata, counts, unit }) {
  return (
    <Box>
      <Typography component="h3" sx={{ fontWeight: 600, mb: 0.75 }} variant="body2">
        {title}
      </Typography>
      <Stack component="dl" spacing={0.75} sx={{ m: 0 }}>
        {strata.map(({ field, key, label, color }) => (
          <Box key={field}>
            <Typography component="dt" sx={{ alignItems: "center", display: "flex", fontWeight: 500 }} variant="body2">
              <Box aria-hidden component="span" sx={{ bgcolor: color, borderRadius: "2px", flexShrink: 0, height: 10, mr: 1, width: 10 }} />
              {label}
              {counts && (
                <Typography color="text.secondary" component="span" sx={{ fontVariantNumeric: "tabular-nums", ml: 1 }} variant="body2">
                  · {formatNumber(counts[key] ?? 0)} {unit}
                </Typography>
              )}
            </Typography>
            <Typography color="text.secondary" component="dd" sx={{ m: 0, pl: 2.25 }} variant="body2">
              {meanings[field]}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// The headline cards (classes above, within and less than standard for the current scope), with a key to the terms.
export default function OverviewMetrics({ scope }) {
  const row = toStackRow(scope.name, scope.block.classSize, sizeStrata);

  return (
    <Box aria-label={`Class-size overview for ${scope.name}`} component="section" id="overview" sx={{ scrollMarginTop: STICKY_TOP_CSS }}>
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "repeat(3, 1fr)", xs: "1fr" } }}>
        {sizeStrata.map(({ field, label, color }) => (
          <SummaryMetric
            color={color}
            detail={`${formatPercent(row[valueKey(field, "share")])} of ${formatNumber(row.total)} classes`}
            icon={iconPaths[field]}
            key={field}
            label={label}
            value={row[field]}
          />
        ))}
      </Box>
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "repeat(2, 1fr)", xs: "1fr" }, mt: 3 }}>
        <Key counts={scope.block.classSize} strata={sizeStrata} title="Class size, against the standard" unit="classes" />
        <Key counts={scope.block.shifting} strata={shiftStrata} title="Shifting schedules" unit="grade records" />
      </Box>
    </Box>
  );
}
