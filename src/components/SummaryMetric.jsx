import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { formatNumber } from "../lib/format.js";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

// KPI card: figure and icon on top, optional description, solid colored strip with the detail and optional action underneath.
export default function SummaryMetric({ label, value, detail, description, color, icon, actionLabel, onAction }) {
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
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        justifyContent="space-between"
        spacing={1}
        sx={{ bgcolor: color, color: "#fff", mt: "auto", px: 2.5, py: 1.25 }}
        useFlexGap
      >
        <Typography sx={{ color: "inherit", fontWeight: 500 }} variant="body2">
          {detail}
        </Typography>
        {onAction && actionLabel && (
          <Button
            aria-label={`${actionLabel} for ${label}`}
            onClick={onAction}
            size="small"
            startIcon={<LineIcon path={iconPaths.schools} sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: "rgba(255,255,255,0.55)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 600,
              lineHeight: 1.2,
              px: 1.25,
              py: 0.5,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)", borderColor: "#fff" },
            }}
            variant="outlined"
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
