import { Box, Paper, Stack, Typography } from "@mui/material";
import { formatNumber } from "../lib/format.js";
import LineIcon from "./LineIcon.jsx";

// KPI card: figure and icon on top, solid colored strip with the detail underneath.
export default function SummaryMetric({ label, value, detail, color, icon }) {
  return (
    <Paper sx={{ overflow: "hidden" }}>
      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" sx={{ p: 2.5, pb: 2 }}>
        <Box>
          <Typography sx={{ color }} variant="h4">
            {formatNumber(value)}
          </Typography>
          <Typography sx={{ fontWeight: 500, mt: 0.5 }} variant="body2">
            {label}
          </Typography>
        </Box>
        <LineIcon path={icon} sx={{ color, fontSize: 30 }} />
      </Stack>
      <Typography sx={{ bgcolor: color, color: "#fff", display: "block", fontWeight: 500, px: 2.5, py: 1.25 }} variant="body2">
        {detail}
      </Typography>
    </Paper>
  );
}
