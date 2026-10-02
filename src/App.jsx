import { useMemo } from "react";
import { Box, CssBaseline, Stack, ThemeProvider, Typography } from "@mui/material";
import AppShell from "./components/AppShell.jsx";
import FilterBar from "./components/FilterBar.jsx";
import { iconPaths } from "./components/LineIcon.jsx";
import data from "./data/dashboard_data.json";
import { getScope, regionOptions, withRegionRows } from "./data/selectors.js";
import { useColorMode } from "./hooks/useColorMode.js";
import { useFontSize } from "./hooks/useFontSize.js";
import { useQueryState } from "./hooks/useQueryState.js";
import { fontSizes } from "./lib/fontSize.js";
import { formatDate } from "./lib/format.js";
import ClassSizeSection from "./sections/ClassSizeSection.jsx";
import CoverageSection from "./sections/CoverageSection.jsx";
import OverviewMetrics from "./sections/OverviewMetrics.jsx";
import SchoolsSection from "./sections/SchoolsSection.jsx";
import ShiftingSection from "./sections/ShiftingSection.jsx";
import { buildTheme } from "./theme/theme.js";

const regions = regionOptions(data);
const NATIONAL = regions[0];
const isRegion = (value) => regions.includes(value);
const isMeasure = (value) => value === "share" || value === "count";

// The navigation. Each id must match the id of a section rendered below.
const sections = [
  { id: "overview", label: "Overview", icon: iconPaths.overview },
  { id: "class-size", label: "Class size", icon: iconPaths.classSize },
  { id: "shifting", label: "Shifting", icon: iconPaths.shifting },
  { id: "schools", label: "Schools", icon: iconPaths.schools },
  { id: "coverage", label: "Data coverage", icon: iconPaths.coverage },
];

// A wide card beside a narrow one; they stack on smaller screens.
const twoColumns = { alignItems: "start", display: "grid", gap: 3, gridTemplateColumns: { lg: "minmax(0, 2fr) minmax(0, 1fr)", xs: "minmax(0, 1fr)" } };

/**
 * The whole dashboard. It owns the two choices every section shares:
 *   region   "All regions" or one region (the schools table lists the schools in it)
 *   measure  "share" (percent) or "count"
 * Both live in the page address, so refresh, Back and shared links keep the view.
 */
export default function App() {
  const [region, setRegion] = useQueryState("region", NATIONAL, isRegion);
  const [measure, setMeasure] = useQueryState("measure", "share", isMeasure);
  const scope = useMemo(() => getScope(data, region), [region]);
  const [fontIndex, setFontIndex] = useFontSize();
  const [colorMode, setColorMode] = useColorMode();
  const theme = useMemo(() => buildTheme(fontSizes[fontIndex].scale, colorMode), [fontIndex, colorMode]);
  // Class size and shifting always compare regions, even with one region selected.
  const regionScope = useMemo(() => withRegionRows(data, scope), [scope]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell
        colorMode={colorMode}
        fontIndex={fontIndex}
        onColorModeChange={setColorMode}
        onFontIndexChange={setFontIndex}
        schoolCount={scope.block.coverage.schools}
        scopeName={scope.name}
        sections={sections}
        snapshotDate={data.meta.snapshotDate}
      >
        <FilterBar
          measure={measure}
          onMeasureChange={(next) => setMeasure(next, { replace: true })}
          onRegionChange={setRegion}
          regions={regions}
          scope={scope}
        />
        <Stack spacing={3}>
          <Box>
            <Typography component="h2" variant="h6">
              Class size and shifting · {scope.name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              The overview, data coverage and schools follow the region you pick. The class-size and shifting charts always compare every region.
            </Typography>
            {/* The top bar has no room for the snapshot date on phones, so it is repeated here. */}
            <Typography color="text.secondary" sx={{ display: { sm: "none" } }} variant="body2">
              Snapshot · {formatDate(data.meta.snapshotDate)}
            </Typography>
          </Box>
          <OverviewMetrics scope={scope} />
          <ClassSizeSection measure={measure} onSelectRegion={setRegion} scope={regionScope} />
          <ShiftingSection measure={measure} onSelectRegion={setRegion} scope={regionScope} />
          <Box sx={twoColumns}>
            <SchoolsSection onSelectRegion={setRegion} regions={regions} scope={scope} />
            <CoverageSection scope={scope} unmatched={data.unmatched} />
          </Box>
        </Stack>
      </AppShell>
    </ThemeProvider>
  );
}
