import { useMemo, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { resolveSort, sortRows, toStackRow, toStackRows, toggleHidden, valueKey } from "../data/selectors.js";
import { areaPhrase, formatNumber, formatPercent } from "../lib/format.js";
import BreakdownTable from "./BreakdownTable.jsx";
import Panel from "./Panel.jsx";
import StackedBarChart from "./StackedBarChart.jsx";
import StrataLegend from "./StrataLegend.jsx";

const capitalize = (text) => text[0].toUpperCase() + text.slice(1);
// "Above standard" reads as "above standard" mid-sentence; "ES and JHS" keeps its capitals.
const inSentence = (label) => (/^[A-Z][a-z]/.test(label) ? label[0].toLowerCase() + label.slice(1) : label);

// One line for the whole scope. With many strata, only the three largest are named.
function summarize(row, strata, unit) {
  if (!row.total) return `no ${unit} recorded`;
  const named = strata.length > 3 ? [...strata].sort((a, b) => row[b.field] - row[a.field]).slice(0, 3) : strata;
  const parts = named.map(({ field, label }) => `${formatPercent(row[valueKey(field, "share")])} ${inSentence(label)}`);
  return `${parts.join(" · ")} (${formatNumber(row.total)} ${unit})`;
}

/**
 * A dashboard card that breaks one measure down by area, as a stacked chart or a table.
 * It shows the scope's children: regions for the whole country, divisions for one region
 * (or regions throughout, when the scope comes from withRegionRows).
 *
 *   measureKey   which counts to read from each area, e.g. "classSize"
 *   strata       the slices, from src/data/categories.js
 *   unit         what is being counted, e.g. "classes"
 *   measure      "share" or "count", set once for the whole dashboard
 *   onSelectRegion  called with a region name when the reader picks one to drill into
 */
export default function BreakdownPanel({ id, title, caption, scope, measureKey, strata, unit, measure, defaultHidden = [], defaultSort, onSelectRegion }) {
  const [hidden, setHidden] = useState(defaultHidden);
  const [sort, setSort] = useState(defaultSort);
  const [view, setView] = useState("chart");

  const activeSort = resolveSort(sort, strata, hidden);
  const rows = useMemo(
    () => sortRows(toStackRows(scope.children, measureKey, strata), { by: activeSort.by, dir: activeSort.dir }, measure),
    [scope, measureKey, strata, activeSort.by, activeSort.dir, measure],
  );
  const scopeRow = useMemo(() => toStackRow(scope.name, scope.block[measureKey], strata), [scope, measureKey, strata]);
  const visible = strata.filter(({ field }) => !hidden.includes(field));

  const areaLabel = capitalize(scope.childLabel);
  const description = `${title} by ${areaPhrase(scope)}`;
  // Only region rows can be picked: choosing one sets the dashboard's region.
  const selectRow = scope.childLabel === "region" ? onSelectRegion : undefined;

  const sortBy = (by) => {
    const fresh = by === "name" ? "asc" : "desc";
    setSort(activeSort.by === by ? { by, dir: activeSort.dir === "asc" ? "desc" : "asc" } : { by, dir: fresh });
  };

  const viewToggle = (
    <ToggleButtonGroup aria-label={`${title} view`} color="primary" exclusive onChange={(_, next) => next && setView(next)} size="small" value={view}>
      <ToggleButton value="chart">Chart</ToggleButton>
      <ToggleButton value="table">Table</ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <Panel action={viewToggle} caption={caption} id={id} title={title}>
      <Typography sx={{ fontWeight: 600, mb: 2 }} variant="body2">
        {scope.name}: {summarize(scopeRow, strata, unit)}
      </Typography>

      <Stack alignItems={{ md: "center" }} direction={{ md: "row", xs: "column" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
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
          hidden={hidden}
          measure={measure}
          onSelectRow={selectRow}
          rows={rows}
          strata={strata}
          unit={unit}
        />
      ) : (
        <BreakdownTable
          areaLabel={areaLabel}
          ariaLabel={description}
          hidden={hidden}
          measure={measure}
          onSelectRow={selectRow}
          onSort={sortBy}
          rows={rows}
          sort={activeSort}
          strata={strata}
          unit={unit}
        />
      )}

      {selectRow && (
        <Typography color="text.secondary" sx={{ display: "block", mt: 1.5 }} variant="caption">
          Select a region to focus the dashboard on it.
        </Typography>
      )}
    </Panel>
  );
}
