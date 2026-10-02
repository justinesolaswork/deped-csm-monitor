import { useMemo, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Panel from "../components/Panel.jsx";
import { shiftStrata, sizeStrata } from "../data/categories.js";
import { filterSchools, sortSchools, toSchoolRows } from "../data/selectors.js";
import { useNearViewport } from "../hooks/useNearViewport.js";
import { useRegionSchools } from "../hooks/useRegionSchools.js";
import { formatNumber } from "../lib/format.js";

const ALL_DIVISIONS = "";
const ROWS_PER_PAGE = [25, 50, 100];
const figures = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
// Text for screen readers only: out of sight, but still read aloud.
const hiddenText = { clip: "rect(0 0 0 0)", height: 1, overflow: "hidden", position: "absolute", whiteSpace: "nowrap", width: 1 };

// The two tables this section can show. The count columns come from the same categories as the charts.
const views = {
  classSize: {
    label: "Class size",
    caption: "Classes above, within and below (less than) standard in each school.",
    // Short headings ("Above") keep the table narrow; the caption spells them out.
    columns: sizeStrata.map(({ field, color }) => ({ field, color, label: field[0].toUpperCase() + field.slice(1) })),
  },
  shifting: {
    label: "Shifting",
    caption: "Grade levels in each school on a single, double or triple shift.",
    columns: shiftStrata.map(({ field, color }) => ({ field, color, label: field[0].toUpperCase() + field.slice(1) })),
  },
};

// School-level detail: one row per school in the chosen region (or in all regions), for class size or for shifting.
export default function SchoolsSection({ scope, regions, onSelectRegion }) {
  const [view, setView] = useState("classSize");
  const [nearRef, near] = useNearViewport();

  const viewToggle = (
    <ToggleButtonGroup aria-label="Schools breakdown shows" color="primary" exclusive onChange={(_, next) => next && setView(next)} size="small" value={view}>
      {Object.entries(views).map(([key, { label }]) => (
        <ToggleButton key={key} value={key}>
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );

  return (
    <Panel action={viewToggle} caption={`${views[view].caption} A dash means the school has no record.`} id="schools" title="Schools breakdown">
      {/* The school lists are large, so nothing loads until the reader scrolls near this card. */}
      <Box ref={nearRef}>
        <SchoolList enabled={near} onSelectRegion={onSelectRegion} regions={regions} scope={scope} view={views[view]} />
      </Box>
    </Panel>
  );
}

function SchoolList({ scope, regions, onSelectRegion, view, enabled }) {
  const hasRegion = scope.level === "region";
  // One region's schools, or every region's when "All regions" is chosen.
  const { status, files } = useRegionSchools(hasRegion ? [scope.name] : scope.children.map((region) => region.name), enabled);
  const [division, setDivision] = useState(ALL_DIVISIONS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ by: "name", dir: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE[0]);

  // A new region starts with no division, search or sort and the first page. This is done while rendering,
  // not by remounting the list, so the Region dropdown that was just used keeps keyboard focus.
  const [shownRegion, setShownRegion] = useState(scope.name);
  if (shownRegion !== scope.name) {
    setShownRegion(scope.name);
    setDivision(ALL_DIVISIONS);
    setSearch("");
    setSort({ by: "name", dir: "asc" });
    setPage(0);
  }

  // A sort on a column the other view does not have falls back to the school name.
  const sortable = ["id", "name", ...view.columns.map((column) => column.field)];
  const activeSort = sortable.includes(sort.by) ? sort : { by: "name", dir: "asc" };

  const allRows = useMemo(() => files.flatMap((file) => toSchoolRows(file, sizeStrata, shiftStrata)), [files]);
  const rows = useMemo(
    () => sortSchools(filterSchools(allRows, division, search), { by: activeSort.by, dir: activeSort.dir }),
    [allRows, division, search, activeSort.by, activeSort.dir],
  );
  // Filtering can leave fewer pages than before, so never point past the last one.
  const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const shownPage = Math.min(page, lastPage);
  const pageRows = rows.slice(shownPage * rowsPerPage, (shownPage + 1) * rowsPerPage);

  const sortBy = (by) => {
    const isText = by === "id" || by === "name";
    setSort(activeSort.by === by ? { by, dir: activeSort.dir === "asc" ? "desc" : "asc" } : { by, dir: isText ? "asc" : "desc" });
    setPage(0);
  };

  const heading = (by, text, { numeric = false, color } = {}) => (
    <TableCell align={numeric ? "right" : "left"} key={by} sortDirection={activeSort.by === by ? activeSort.dir : false}>
      <TableSortLabel active={activeSort.by === by} direction={activeSort.by === by ? activeSort.dir : numeric ? "desc" : "asc"} onClick={() => sortBy(by)}>
        <span>
          {color && <Box aria-hidden component="span" sx={{ bgcolor: color, borderRadius: "2px", display: "inline-block", height: 10, mr: 0.75, width: 10 }} />}
          {text}
        </span>
      </TableSortLabel>
    </TableCell>
  );

  const message = (text) => (
    // role="status" makes screen readers announce loading, errors and "No schools match" as they appear.
    <Typography color="text.secondary" role="status" sx={{ py: 4, textAlign: "center" }} variant="body2">
      {text}
    </Typography>
  );

  return (
    <>
      <Stack direction={{ sm: "row", xs: "column" }} flexWrap="wrap" spacing={2} sx={{ mb: 2 }} useFlexGap>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="schools-region-label">Region</InputLabel>
          <Select label="Region" labelId="schools-region-label" onChange={(event) => onSelectRegion(event.target.value)} value={scope.name}>
            {regions.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl disabled={!hasRegion} size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="schools-division-label" shrink>
            Division
          </InputLabel>
          <Select
            displayEmpty
            label="Division"
            labelId="schools-division-label"
            notched
            onChange={(event) => {
              setDivision(event.target.value);
              setPage(0);
            }}
            value={division}
          >
            <MenuItem value={ALL_DIVISIONS}>All divisions</MenuItem>
            {hasRegion &&
              scope.children.map(({ name }) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          label="Find a school"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="School ID or name"
          size="small"
          sx={{ flexGrow: 1, minWidth: 180 }}
          type="search"
          value={search}
        />
      </Stack>

      {status === "loading" && message("Loading schools…")}
      {status === "error" && message(`The school list for ${scope.name} could not be loaded. Refresh the page to try again.`)}

      {status === "ready" && (
        <>
          <TableContainer>
            <Table aria-label={`${view.label} by school in ${division || scope.name}`} size="small">
              <TableHead>
                <TableRow>
                  {heading("id", "School ID")}
                  {heading("name", "School")}
                  {view.columns.map(({ field, label, color }) => heading(field, label, { numeric: true, color }))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell sx={figures}>{row.id}</TableCell>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    {view.columns.map(({ field }) => (
                      <TableCell align="right" key={field} sx={figures}>
                        {row[field] === null ? (
                          <>
                            <span aria-hidden>—</span>
                            <Box component="span" sx={hiddenText}>
                              No record
                            </Box>
                          </>
                        ) : (
                          formatNumber(row[field])
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {rows.length === 0 && message("No schools match.")}
          <TablePagination
            component="div"
            count={rows.length}
            labelRowsPerPage="Schools per page"
            onPageChange={(_, next) => setPage(next)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            page={shownPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={ROWS_PER_PAGE}
          />
        </>
      )}
    </>
  );
}
