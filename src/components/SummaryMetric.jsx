import { Box, Paper, Stack, Typography } from "@mui/material";
import { formatNumber } from "../lib/format.js";
import LineIcon from "./LineIcon.jsx";

// KPI card: figure and icon on top, optional description, solid colored strip with the detail underneath.
export default function SummaryMetric({ label, value, detail, description, color, icon }) {
  return (
    <Paper sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" sx={{ p: 2.5, pb: description ? 1 : 2 }}>
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
      {description && (
        <Typography color="text.secondary" sx={{ flex: 1, px: 2.5, pb: 1.5 }} variant="body2">
          {description}
        </Typography>
      )}
      <Typography sx={{ bgcolor: color, color: "#fff", display: "block", fontWeight: 500, mt: "auto", px: 2.5, py: 1.25 }} variant="body2">
        {detail}
      </Typography>
    </Paper>
  );
}
