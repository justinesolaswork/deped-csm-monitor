import { useState } from "react";
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import SchoolSegmentModal from "../components/SchoolSegmentModal.jsx";
import SummaryMetric from "../components/SummaryMetric.jsx";
import { iconPaths } from "../components/LineIcon.jsx";
import { shiftStrata, sizeStrata } from "../data/categories.js";
import { toStackRow, toUniqueSchoolRow, valueKey } from "../data/selectors.js";
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

// The headline KPI cards for class size and shifting. Can switch between class/grade counts and unique schools.
export default function OverviewMetrics({ scope }) {
  const [basis, setBasis] = useState("records");
  const [segment, setSegment] = useState(null);

  const isSchools = basis === "schools";
  const sizeRow = isSchools
    ? toUniqueSchoolRow(scope.name, scope.block.classSizeSchools, scope.block.coverage.withClassSize, sizeStrata)
    : toStackRow(scope.name, scope.block.classSize, sizeStrata);
  const shiftRow = isSchools
    ? toUniqueSchoolRow(scope.name, scope.block.shiftingSchools, scope.block.coverage.withShifting, shiftStrata)
    : toStackRow(scope.name, scope.block.shifting, shiftStrata);

  const regionNames = scope.level === "region" ? [scope.name] : scope.children.map((region) => region.name);

  return (
    <Box aria-label={`Class-size overview for ${scope.name}`} component="section" id="overview" sx={{ scrollMarginTop: STICKY_TOP_CSS }}>
      <Stack alignItems={{ sm: "center" }} direction={{ sm: "row", xs: "column" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Typography color="text.secondary" variant="body2">
          {isSchools
            ? "Unique schools with at least one class or grade in each category. A school can appear in more than one category."
            : "Total classes and grade-level shifting records. Switch to Unique schools to count distinct schools per category."}
        </Typography>
        <ToggleButtonGroup
          aria-label="Overview count basis"
          color="primary"
          exclusive
          onChange={(_, next) => next && setBasis(next)}
          size="small"
          sx={{ bgcolor: "background.paper", flexShrink: 0 }}
          value={basis}
        >
          <ToggleButton value="records">Classes &amp; records</ToggleButton>
          <ToggleButton value="schools">Unique schools</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Class size KPI cards */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "repeat(3, 1fr)", xs: "1fr" } }}>
        {sizeStrata.map(({ field, label, color }) => (
          <SummaryMetric
            actionLabel="View schools"
            color={color}
            description={meanings[field]}
            detail={
              isSchools
                ? `${formatPercent(sizeRow[valueKey(field, "share")])} of ${formatNumber(sizeRow.total)} schools`
                : `${formatPercent(sizeRow[valueKey(field, "share")])} of ${formatNumber(sizeRow.total)} classes`
            }
            icon={iconPaths[field]}
            key={field}
            label={label}
            onAction={() => setSegment({ measureKey: "classSize", field })}
            value={sizeRow[field]}
          />
        ))}
      </Box>

      {/* Shifting schedule KPI cards */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "repeat(3, 1fr)", xs: "1fr" }, mt: 3 }}>
        {shiftStrata.map(({ field, label, color }) => (
          <SummaryMetric
            actionLabel="View schools"
            color={color}
            description={meanings[field]}
            detail={
              isSchools
                ? `${formatPercent(shiftRow[valueKey(field, "share")])} of ${formatNumber(shiftRow.total)} schools`
                : `${formatPercent(shiftRow[valueKey(field, "share")])} of ${formatNumber(shiftRow.total)} grade records`
            }
            icon={iconPaths[field]}
            key={field}
            label={label}
            onAction={() => setSegment({ measureKey: "shifting", field })}
            value={shiftRow[field]}
          />
        ))}
      </Box>

      {segment && (
        <SchoolSegmentModal
          area={scope.name}
          areaIsRegion={scope.level === "region"}
          field={segment.field}
          measureKey={segment.measureKey}
          onClose={() => setSegment(null)}
          regionNames={regionNames}
        />
      )}
    </Box>
  );
}
