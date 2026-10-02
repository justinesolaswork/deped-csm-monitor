import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { sizeStrata, shiftStrata } from "../data/categories.js";
import { formatNumber, formatPercent } from "../lib/format.js";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

const figures = { fontVariantNumeric: "tabular-nums", fontWeight: 600 };

export default function DrilldownModal({ open, onClose, target, parentRegion, onFocusRegion, onFocusDivision }) {
  if (!target) return null;

  const { name, classSize, shifting, coverage } = target;
  const isDivision = Boolean(parentRegion);
  const totalSchools = coverage?.schools ?? 0;

  // Class size totals
  const totalClasses = Object.values(classSize || {}).reduce((a, b) => a + b, 0);
  const aboveCount = classSize?.["Above Standard"] ?? 0;
  const withinCount = classSize?.["Within Standard"] ?? 0;
  const belowCount = classSize?.["Less than Standard"] ?? 0;

  // Shifting totals
  const totalShifts = Object.values(shifting || {}).reduce((a, b) => a + b, 0);
  const singleShift = shifting?.["Single Shift"] ?? 0;
  const doubleShift = shifting?.["Double Shift"] ?? 0;
  const tripleShift = shifting?.["Triple Shift"] ?? 0;

  const multiShiftCount = doubleShift + tripleShift;
  const multiShiftPct = totalShifts ? (multiShiftCount / totalShifts) * 100 : 0;

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "background.neutral", pb: 2, pt: 2.5, px: 3 }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Box>
            <Stack alignItems="center" direction="row" spacing={1.5} sx={{ mb: 0.5 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                {name}
              </Typography>
              <Chip
                color={isDivision ? "secondary" : "primary"}
                label={isDivision ? `Division · ${parentRegion}` : "Region"}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Detailed Class Size & Modality Breakdown Profile
            </Typography>
          </Box>
          <IconButton aria-label="Close drilldown modal" onClick={onClose} size="small">
            <LineIcon path={iconPaths.close || "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Overview Metrics Cards */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                  Master Registry Schools
                </Typography>
                <Typography variant="h4" sx={{ ...figures, mt: 0.5, color: "primary.main" }}>
                  {formatNumber(totalSchools)}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  Active educational institutions
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                  Overcrowded Classes
                </Typography>
                <Typography variant="h4" sx={{ ...figures, mt: 0.5, color: aboveCount > 0 ? "error.main" : "success.main" }}>
                  {formatNumber(aboveCount)}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {totalClasses ? formatPercent((aboveCount / totalClasses) * 100) : "0%"} of {formatNumber(totalClasses)} classes
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                  Shifting Schedules
                </Typography>
                <Typography variant="h4" sx={{ ...figures, mt: 0.5, color: multiShiftCount > 0 ? "warning.main" : "text.primary" }}>
                  {formatNumber(multiShiftCount)}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {formatPercent(multiShiftPct)} multi-shift grade records
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Class Size Distribution */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Class Size Profile ({formatNumber(totalClasses)} total classes)
            </Typography>
            {totalClasses === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No class size data recorded for this area.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {/* Visual Bar Stack: Less than Standard (red), Within Standard (green), Above Standard (blue) */}
                <Box sx={{ display: "flex", height: 16, borderRadius: 1, overflow: "hidden", mb: 1 }}>
                  <Box
                    sx={{
                      width: `${(belowCount / totalClasses) * 100}%`,
                      bgcolor: sizeStrata.find((s) => s.field === "below")?.color || "#d93a3f",
                    }}
                    title={`Less than Standard: ${formatNumber(belowCount)} (${formatPercent((belowCount / totalClasses) * 100)})`}
                  />
                  <Box
                    sx={{
                      width: `${(withinCount / totalClasses) * 100}%`,
                      bgcolor: sizeStrata.find((s) => s.field === "within")?.color || "#008556",
                    }}
                    title={`Within Standard: ${formatNumber(withinCount)} (${formatPercent((withinCount / totalClasses) * 100)})`}
                  />
                  <Box
                    sx={{
                      width: `${(aboveCount / totalClasses) * 100}%`,
                      bgcolor: sizeStrata.find((s) => s.field === "above")?.color || "#1976d2",
                    }}
                    title={`Above Standard: ${formatNumber(aboveCount)} (${formatPercent((aboveCount / totalClasses) * 100)})`}
                  />
                </Box>

                {sizeStrata.map(({ field, label, color }) => {
                  const count = field === "above" ? aboveCount : field === "within" ? withinCount : belowCount;
                  const pct = totalClasses ? (count / totalClasses) * 100 : 0;
                  return (
                    <Stack key={field} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "2px", bgcolor: color }} />
                        <Typography variant="body2">{label}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ ...figures }}>
                          {formatNumber(count)} classes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 50, textAlign: "right", ...figures }}>
                          {formatPercent(pct)}
                        </Typography>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Paper>

          {/* Shifting Schedule Distribution */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Shifting Modality Profile ({formatNumber(totalShifts)} grade level records)
            </Typography>
            {totalShifts === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No shifting modality data recorded for this area.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {/* Visual Bar Stack */}
                <Box sx={{ display: "flex", height: 16, borderRadius: 1, overflow: "hidden", mb: 1 }}>
                  <Box
                    sx={{
                      width: `${(singleShift / totalShifts) * 100}%`,
                      bgcolor: shiftStrata.find((s) => s.field === "single")?.color || "#455a64",
                    }}
                    title={`Single Shift: ${formatNumber(singleShift)} (${formatPercent((singleShift / totalShifts) * 100)})`}
                  />
                  <Box
                    sx={{
                      width: `${(doubleShift / totalShifts) * 100}%`,
                      bgcolor: shiftStrata.find((s) => s.field === "double")?.color || "#ed6c02",
                    }}
                    title={`Double Shift: ${formatNumber(doubleShift)} (${formatPercent((doubleShift / totalShifts) * 100)})`}
                  />
                  <Box
                    sx={{
                      width: `${(tripleShift / totalShifts) * 100}%`,
                      bgcolor: shiftStrata.find((s) => s.field === "triple")?.color || "#c62828",
                    }}
                    title={`Triple Shift: ${formatNumber(tripleShift)} (${formatPercent((tripleShift / totalShifts) * 100)})`}
                  />
                </Box>

                {shiftStrata.map(({ field, label, color }) => {
                  const count = field === "single" ? singleShift : field === "double" ? doubleShift : tripleShift;
                  const pct = totalShifts ? (count / totalShifts) * 100 : 0;
                  return (
                    <Stack key={field} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "2px", bgcolor: color }} />
                        <Typography variant="body2">{label}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ ...figures }}>
                          {formatNumber(count)} records
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 50, textAlign: "right", ...figures }}>
                          {formatPercent(pct)}
                        </Typography>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Paper>

          {/* Data Coverage Summary */}
          {coverage && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Data Coverage & Registry Sync
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography color="text.secondary" variant="caption">
                    With Class Size
                  </Typography>
                  <Typography variant="body2" sx={{ ...figures }}>
                    {formatNumber(coverage.withClassSize)} ({totalSchools ? formatPercent((coverage.withClassSize / totalSchools) * 100) : "0%"})
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography color="text.secondary" variant="caption">
                    With Shifting
                  </Typography>
                  <Typography variant="body2" sx={{ ...figures }}>
                    {formatNumber(coverage.withShifting)} ({totalSchools ? formatPercent((coverage.withShifting / totalSchools) * 100) : "0%"})
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography color="text.secondary" variant="caption">
                    In Neither View
                  </Typography>
                  <Typography variant="body2" sx={{ ...figures, color: coverage.inNeitherView > 0 ? "error.main" : "text.secondary" }}>
                    {formatNumber(coverage.inNeitherView)} schools missing both views
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "background.neutral", justifyContent: "space-between" }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Stack direction="row" spacing={1.5}>
          {isDivision ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onClose();
                if (onFocusDivision) onFocusDivision(name, parentRegion);
              }}
              startIcon={<LineIcon path={iconPaths.schools || "M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"} />}
            >
              Inspect {name} Schools
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onClose();
                if (onFocusRegion) onFocusRegion(name);
              }}
              startIcon={<LineIcon path={iconPaths.search || "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"} />}
            >
              Focus Dashboard on {name}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
