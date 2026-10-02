import { Box, Stack, Typography } from "@mui/material";
import { formatNumber, formatPercent } from "../lib/format.js";

// A short list of values, each with a thin bar for its share. Used for data coverage.
export default function ShareList({ items }) {
  return (
    <Stack spacing={2.5}>
      {items.map(({ label, value, share }) => (
        <Box key={label}>
          <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 0.75 }}>
            <Typography variant="body2">{label}</Typography>
            <Typography sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }} variant="body2">
              <Box component="span" sx={{ fontWeight: 600 }}>
                {formatNumber(value)}
              </Box>{" "}
              · {formatPercent(share)}
            </Typography>
          </Stack>
          {/* The bar repeats the numbers above, so it is hidden from screen readers. */}
          <Box aria-hidden sx={{ bgcolor: (theme) => theme.chart.track, borderRadius: 2, height: 4 }}>
            <Box sx={{ bgcolor: "primary.main", borderRadius: 2, height: "100%", minWidth: value > 0 ? 4 : 0, width: `${share}%` }} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
