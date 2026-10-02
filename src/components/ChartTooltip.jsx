import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { valueKey } from "../data/selectors.js";
import { formatNumber, formatPercent } from "../lib/format.js";

const figures = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

// Hover card for one bar. Lists every slice (hidden ones too) with the current measure first.
// Recharts passes `active` and `label`; the rest comes from StackedBarChart.
export default function ChartTooltip({ active, label, rows, strata, measure, unit, childLabel, onSelectRow }) {
  const row = active ? rows.find((item) => item.name === label) : null;
  if (!row) return null;

  const canClick = Boolean(onSelectRow);
  const hintText = childLabel === "region" ? `Click to drill down into ${row.name}` : `Click to inspect ${row.name} profile`;

  return (
    <Paper sx={{ border: 1, borderColor: "divider", boxShadow: "0 6px 20px rgba(31, 42, 68, 0.14)", minWidth: 250, px: 1.5, py: 1.25 }}>
      <Typography sx={{ fontWeight: 600, mb: 0.75 }} variant="body2">
        {row.name}
      </Typography>
      {row.total === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No {unit} recorded
        </Typography>
      ) : (
        strata.map(({ field, label: stratumLabel, color }) => {
          const share = formatPercent(row[valueKey(field, "share")]);
          const count = formatNumber(row[field]);
          return (
            <Stack alignItems="center" direction="row" key={field} spacing={1} sx={{ py: 0.25 }}>
              <Box sx={{ bgcolor: color, borderRadius: 1, flexShrink: 0, height: 3, width: 12 }} />
              <Typography color="text.secondary" sx={{ flexGrow: 1 }} variant="body2">
                {stratumLabel}
              </Typography>
              <Typography sx={{ ...figures, fontWeight: 600 }} variant="body2">
                {measure === "share" ? share : count}
              </Typography>
              <Typography color="text.secondary" sx={{ ...figures, minWidth: 52, textAlign: "right" }} variant="caption">
                {measure === "share" ? count : share}
              </Typography>
            </Stack>
          );
        })
      )}
      <Divider sx={{ my: 0.75 }} />
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography color="text.secondary" variant="body2">
          Total
        </Typography>
        <Typography sx={{ ...figures, fontWeight: 600 }} variant="body2">
          {formatNumber(row.total)} {unit}
        </Typography>
      </Stack>
      {canClick && (
        <Typography
          color="primary.main"
          variant="caption"
          sx={{ display: "block", mt: 1, pt: 0.75, borderTop: 1, borderColor: "divider", fontWeight: 600, textAlign: "center" }}
        >
          💡 {hintText}
        </Typography>
      )}
    </Paper>
  );
}

