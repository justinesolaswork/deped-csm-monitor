import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { resolveSort, sortRows, toStackRow, toStackRows, toggleHidden, valueKey } from "../data/selectors.js";
import { areaPhrase, downloadCsv, formatNumber, formatPercent } from "../lib/format.js";
import BreakdownTable from "./BreakdownTable.jsx";
import DrilldownModal from "./DrilldownModal.jsx";
import LineIcon, { iconPaths } from "./LineIcon.jsx";
import Panel from "./Panel.jsx";
import StackedBarChart from "./StackedBarChart.jsx";
import SchoolSegmentModal from "./SchoolSegmentModal.jsx";
import StrataLegend from "./StrataLegend.jsx";

const capitalize = (text) => text[0].toUpperCase() + text.slice(1);
const inSentence = (label) => (/^[A-Z][a-z]/.test(label) ? label[0].toLowerCase() + label.slice(1) : label);

function summarize(row, strata, unit) {
  if (!row.total) return `no ${unit} recorded`;
  const named = strata.length > 3 ? [...strata].sort((a, b) => row[b.field] - row[a.field]).slice(0, 3) : strata;
  const parts = named.map(({ field, label }) => `${formatPercent(row[valueKey(field, "share")])} ${inSentence(label)}`);
  return `${parts.join(" · ")} (${formatNumber(row.total)} ${unit})`;
}

/**
 * A dashboard card that breaks one measure down by area, as a stacked chart or a table.
 * Supports full drilldown from National (Regions) down to Region (Divisions) and Division modal details.
 */
export default function BreakdownPanel({
  id,
  title,
  caption,
  scope,
  measureKey,
  strata,
  unit,
  measure,
  defaultHidden = [],
  defaultSort,
  onSelectRegion,
  onSelectDivision,
}) {
  const [hidden, setHidden] = useState(defaultHidden);
  const [sort, setSort] = useState(defaultSort);
  const [view, setView] = useState("chart");

  // Modal drilldown state for division / region inspection
  const [inspectTarget, setInspectTarget] = useState(null);
  // The bar slice whose schools are listed in a modal: { area, field }
  const [segment, setSegment] = useState(null);

  const activeSort = resolveSort(sort, strata, hidden);
  const rows = useMemo(
    () => sortRows(toStackRows(scope.children, measureKey, strata), { by: activeSort.by, dir: activeSort.dir }, measure),
    [scope, measureKey, strata, activeSort.by, activeSort.dir, measure],
  );
  const scopeRow = useMemo(() => toStackRow(scope.name, scope.block[measureKey], strata), [scope, measureKey, strata]);
  const visible = strata.filter(({ field }) => !hidden.includes(field));

  const areaLabel = capitalize(scope.childLabel);
  const description = `${title} by ${areaPhrase(scope)}`;

  // Interactive row selection handler
  const handleSelectRow = (rowName) => {
    if (scope.childLabel === "region") {
      // Drill down into region
      if (onSelectRegion) onSelectRegion(rowName);
    } else if (scope.childLabel === "division") {
      // Find matching division object in scope
      const divObj = scope.children.find((item) => item.name === rowName);
      if (divObj) {
        setInspectTarget(divObj);
      } else if (onSelectDivision) {
        onSelectDivision(rowName);
      }
    }
  };

  const handleSelectSegment = (area, field) => setSegment({ area, field });

  const handleFocusDivision =(divisionName) => {
    // Scroll to schools table and focus division
    const schoolsSection = document.getElementById("schools");
    if (schoolsSection) {
      schoolsSection.scrollIntoView({ behavior: "smooth" });
    }
    if (onSelectDivision) {
      onSelectDivision(divisionName);
    }
  };

  const sortBy = (by) => {
    const fresh = by === "name" ? "asc" : "desc";
    setSort(activeSort.by === by ? { by, dir: activeSort.dir === "asc" ? "desc" : "asc" } : { by, dir: fresh });
  };

  // Derive a clean filename from the panel title and current scope name.
  const safeName = (s) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  const handleDownload = () =>
    downloadCsv({
      rows,
      strata,
      hidden,
      measure,
      unit,
      areaLabel,
      filename: `${safeName(title)}-${safeName(scope.name)}`,
    });

  const viewToggle = (
    <Stack alignItems="center" direction="row" spacing={1}>
      <ToggleButtonGroup aria-label={`${title} view`} color="primary" exclusive onChange={(_, next) => next && setView(next)} size="small" value={view}>
        <ToggleButton value="chart">Chart</ToggleButton>
        <ToggleButton value="table">Table</ToggleButton>
      </ToggleButtonGroup>
      <Tooltip title={`Download current ${title.toLowerCase()} data as CSV`}>
        <Button
          id={`${id}-download-csv`}
          onClick={handleDownload}
          size="small"
          startIcon={<LineIcon path="M12 16l-5-5 1.4-1.4 2.6 2.6V4h2v8.2l2.6-2.6L17 11l-5 5zM5 20v-2h14v2H5z" />}
          variant="outlined"
        >
          CSV
        </Button>
      </Tooltip>
    </Stack>
  );

  return (
    <>
      <Panel action={viewToggle} caption={caption} id={id} title={title}>
        <Stack direction={{ sm: "row", xs: "column" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 600 }} variant="body2">
            {scope.name}: {summarize(scopeRow, strata, unit)}
          </Typography>

          {scope.level === "region" && (
            <Chip
              color="primary"
              variant="outlined"
              size="small"
              onClick={() => onSelectRegion("All regions")}
              onDelete={() => onSelectRegion("All regions")}
              deleteIcon={<LineIcon path={iconPaths.back} />}
              label={`Drilled into ${scope.name} (${scope.children.length} divisions)`}
              sx={{ fontWeight: 600, cursor: "pointer" }}
            />
          )}
        </Stack>

        <Stack alignItems={{ md: "center" }} direction={{ md: "row", xs: "column" }} justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
          <StrataLegend
            ariaLabel={`Show or hide ${title.toLowerCase()} categories`}
            hidden={hidden}
            onToggle={(field) => setHidden((current) => toggleHidden(current, field, strata.length))}
            strata={strata}
          />
          <FormControl size="small" sx={{ flexShrink: 0, minWidth: 190 }}>
            <InputLabel id={`${id}-sort-label`}>Sort by</InputLabel>
            <Select
              label="Sort by"
              labelId={`${id}-sort-label`}
              onChange={(event) => setSort({ by: event.target.value, dir: event.target.value === "name" ? "asc" : "desc" })}
              value={activeSort.by}
            >
              <MenuItem value="name">{areaLabel} name</MenuItem>
              {visible.map(({ field, label }) => (
                <MenuItem key={field} value={field}>
                  {label}
                </MenuItem>
              ))}
              <MenuItem value="total">Total {unit}</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {view === "chart" ? (
          <StackedBarChart
            ariaLabel={`${description}. Switch to Table for exact values.`}
            childLabel={scope.childLabel}
            hidden={hidden}
            measure={measure}
            onSelectRow={handleSelectRow}
            onSelectSegment={handleSelectSegment}
            rows={rows}
            strata={strata}
            unit={unit}
          />
        ) : (
          <BreakdownTable
            areaLabel={areaLabel}
            ariaLabel={description}
            childLabel={scope.childLabel}
            hidden={hidden}
            measure={measure}
            onSelectRow={handleSelectRow}
            onSort={sortBy}
            rows={rows}
            sort={activeSort}
            strata={strata}
            unit={unit}
          />
        )}

        <Typography color="text.secondary" sx={{ display: "block", mt: 1.5 }} variant="caption">
          {scope.childLabel === "region"
            ? "💡 Select a region name to see its divisions, or a colored slice to list its schools."
            : "💡 Select a division name to inspect its profile, or a colored slice to list its schools."}
        </Typography>
      </Panel>

      {segment && (
        <SchoolSegmentModal
          area={segment.area}
          areaIsRegion={scope.childLabel === "region"}
          field={segment.field}
          measureKey={measureKey}
          onClose={() => setSegment(null)}
          regionName={scope.childLabel === "region" ? segment.area : scope.name}
        />
      )}

      {inspectTarget && (
        <DrilldownModal
          onClose={() => setInspectTarget(null)}
          onFocusDivision={handleFocusDivision}
          onFocusRegion={onSelectRegion}
          open={Boolean(inspectTarget)}
          parentRegion={scope.level === "region" ? scope.name : null}
          target={inspectTarget}
        />
      )}
    </>
  );
}
