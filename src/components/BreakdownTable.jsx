import { Box, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@mui/material";
import { valueKey } from "../data/selectors.js";
import { formatNumber, formatPercent } from "../lib/format.js";

const figures = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

/**
 * The same rows as StackedBarChart, as exact numbers.
 * Clicking a column heading sorts by it; clicking the same heading again reverses the order.
 */
export default function BreakdownTable({ ariaLabel, areaLabel, rows, strata, hidden, measure, unit, sort, onSort, onSelectRow }) {
  const visible = strata.filter(({ field }) => !hidden.includes(field));

  const heading = (by, text, swatch) => (
    <TableCell align={by === "name" ? "left" : "right"} key={by} sortDirection={sort.by === by ? sort.dir : false}>
      <TableSortLabel active={sort.by === by} direction={sort.by === by ? sort.dir : by === "name" ? "asc" : "desc"} onClick={() => onSort(by)}>
        {/* One span, so the swatch stays in front of its label whichever side the sort arrow is on. */}
        <span>
          {swatch && <Box aria-hidden component="span" sx={{ bgcolor: swatch, borderRadius: "2px", display: "inline-block", height: 10, mr: 0.75, width: 10 }} />}
          {text}
        </span>
      </TableSortLabel>
    </TableCell>
  );

  return (
    <TableContainer>
      <Table aria-label={ariaLabel} size="small">
        <TableHead>
          <TableRow>
            {heading("name", areaLabel)}
            {visible.map(({ field, label, color }) => heading(field, label, color))}
            {heading("total", `Total ${unit}`)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow hover key={row.name}>
              <TableCell component="th" scope="row" sx={{ whiteSpace: "nowrap" }}>
                {onSelectRow ? (
                  <Link component="button" onClick={() => onSelectRow(row.name)} sx={{ font: "inherit", textAlign: "left" }} type="button" underline="hover">
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
              </TableCell>
              {visible.map(({ field }) => (
                <TableCell align="right" key={field} sx={figures}>
                  {measure === "share" ? formatPercent(row[valueKey(field, "share")]) : formatNumber(row[field])}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ ...figures, fontWeight: 600 }}>
                {formatNumber(row.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
