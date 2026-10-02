import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import { shiftStrata, sizeStrata } from "../data/categories.js";
import { filterSchools, schoolsInSegment, sortSchools, toSchoolRows } from "../data/selectors.js";
import { useRegionSchools } from "../hooks/useRegionSchools.js";
import { formatNumber } from "../lib/format.js";

const ROWS_PER_PAGE = [25, 50, 100];
const figures = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

/**
 * Lists every school that has at least one class (or grade level) in the clicked slice of a bar,
 * with that school's counts for all slices of the same measure.
 * area is the bar's name: a region, or a division inside regionName.
 */
export default function SchoolSegmentModal({ area, areaIsRegion, field, measureKey, regionName, onClose }) {
  const strata = measureKey === "shifting" ? shiftStrata : sizeStrata;
  const clicked = strata.find((stratum) => stratum.field === field);
  const { status, files } = useRegionSchools([regionName]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ by: field, dir: "desc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE[0]);

  const all = useMemo(
    () => schoolsInSegment(files.flatMap((file) => toSchoolRows(file, sizeStrata, shiftStrata)), areaIsRegion ? "" : area, field),
    [files, areaIsRegion, area, field],
  );
  const rows = useMemo(() => sortSchools(filterSchools(all, "", search), sort), [all, search, sort]);
  const shownPage = Math.min(page, Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1));
  const pageRows = rows.slice(shownPage * rowsPerPage, (shownPage + 1) * rowsPerPage);

  const sortBy = (by) => {
    const text = by === "id" || by === "name" || by === "division";
    setSort(sort.by === by ? { by, dir: sort.dir === "asc" ? "desc" : "asc" } : { by, dir: text ? "asc" : "desc" });
    setPage(0);
  };
  const heading = (by, text, { numeric = false, color } = {}) => (
    <TableCell align={numeric ? "right" : "left"} key={by} sortDirection={sort.by === by ? sort.dir : false}>
      <TableSortLabel active={sort.by === by} direction={sort.by === by ? sort.dir : numeric ? "desc" : "asc"} onClick={() => sortBy(by)}>
        <span>
          {color && <Box aria-hidden component="span" sx={{ bgcolor: color, borderRadius: "2px", display: "inline-block", height: 10, mr: 0.75, width: 10 }} />}
          {text}
        </span>
      </TableSortLabel>
    </TableCell>
  );

  const unit = measureKey === "shifting" ? "grade levels" : "classes";
  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open scroll="paper">
      <DialogTitle>
        <Typography component="span" sx={{ display: "block", fontWeight: 700 }} variant="h6">
          {area}: {clicked.label}
        </Typography>
        <Typography color="text.secondary" component="span" sx={{ display: "block" }} variant="body2">
          {status === "ready" ? `${formatNumber(all.length)} schools with ${unit} in this slice` : "Loading schools…"}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {status === "error" && (
          <Typography color="text.secondary" role="status" sx={{ py: 4, textAlign: "center" }} variant="body2">
            The school list for {regionName} could not be loaded. Refresh the page to try again.
          </Typography>
        )}
        {status === "ready" && (
          <>
            <TextField
              fullWidth
              label="Find a school"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="School ID or name"
              size="small"
              sx={{ mb: 2 }}
              type="search"
              value={search}
            />
            <TableContainer>
              <Table aria-label={`Schools in ${area}, ${clicked.label}`} size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {heading("id", "School ID")}
                    {heading("name", "School")}
                    {areaIsRegion && heading("division", "Division")}
                    {strata.map(({ field: f, label, color }) => heading(f, label, { numeric: true, color }))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell sx={figures}>{row.id}</TableCell>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      {areaIsRegion && <TableCell>{row.division}</TableCell>}
                      {strata.map(({ field: f }) => (
                        <TableCell align="right" key={f} sx={{ ...figures, fontWeight: f === field ? 700 : 400 }}>
                          {row[f] === null ? "—" : formatNumber(row[f])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length === 0 && (
              <Typography color="text.secondary" role="status" sx={{ py: 3, textAlign: "center" }} variant="body2">
                No schools match.
              </Typography>
            )}
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
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
