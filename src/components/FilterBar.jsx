import { Button, FormControl, InputLabel, MenuItem, Select, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { formatNumber } from "../lib/format.js";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

/**
 * The one row of controls that scopes everything below it: which region, and share or count.
 * It stays in view on wide screens so the scope can be changed from anywhere on the page.
 */
export default function FilterBar({ regions, scope, onRegionChange, measure, onMeasureChange }) {
  const nationalName = regions[0];

  return (
    <Stack
      alignItems={{ sm: "center" }}
      direction={{ sm: "row", xs: "column" }}
      flexWrap="wrap"
      spacing={2}
      sx={{
        bgcolor: "background.default",
        borderBottom: { md: 1 },
        borderColor: { md: "divider" },
        mb: 3,
        mx: { md: -3, xs: -2 },
        position: { md: "sticky" },
        px: { md: 3, xs: 2 },
        py: 2,
        top: 64,
        zIndex: (t) => t.zIndex.appBar - 1,
      }}
      useFlexGap
    >
      <FormControl size="small" sx={{ bgcolor: "background.paper", minWidth: 210 }}>
        <InputLabel id="region-label">Region</InputLabel>
        <Select label="Region" labelId="region-label" onChange={(event) => onRegionChange(event.target.value)} value={scope.name}>
          {regions.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {scope.level === "region" && (
        <Button onClick={() => onRegionChange(nationalName)} startIcon={<LineIcon path={iconPaths.back} />}>
          {nationalName}
        </Button>
      )}

      <Typography color="text.secondary" variant="body2">
        Show as
      </Typography>
      <ToggleButtonGroup
        aria-label="Show values as"
        color="primary"
        exclusive
        onChange={(_, next) => next && onMeasureChange(next)}
        size="small"
        sx={{ bgcolor: "background.paper", "& .MuiToggleButton-root": { height: 40, px: 2 } }}
        value={measure}
      >
        <ToggleButton title="Percent of each total" value="share">
          Share
        </ToggleButton>
        <ToggleButton title="Number of classes or records" value="count">
          Count
        </ToggleButton>
      </ToggleButtonGroup>

      <Typography color="text.secondary" sx={{ ml: { sm: "auto" } }} variant="body2">
        {formatNumber(scope.block.coverage.schools)} schools in master registry
      </Typography>
    </Stack>
  );
}
