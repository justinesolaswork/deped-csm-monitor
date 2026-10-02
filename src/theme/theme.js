import { createTheme } from "@mui/material/styles";

const TOUCH = "@media (pointer: coarse)";
const TOUCH_TARGET = 44; // px, the smallest comfortable tap target

// Interface colors for each mode. Data colors (palette.js) are the same in both, so a color keeps its meaning.
const modes = {
  light: {
    primary: "#3366ff",
    page: "#f0f2f8",
    surface: "#ffffff",
    ink: "#1f2a44",
    inkMuted: "#5d6b82",
    divider: "#e6eaf2",
    appBar: "#3366ff",
    selectedTint: "#e5ecff",
    selectedInk: "#3366ff",
    selection: "#cdd9ff",
    chart: { grid: "#e3e8f2", track: "#e9edf7" },
    cardShadow: "0 1px 4px rgba(31, 42, 68, 0.08)",
    barShadow: "0 1px 4px rgba(31, 42, 68, 0.16)",
  },
  dark: {
    primary: "#7c9cff",
    page: "#0f1420",
    surface: "#182033",
    ink: "#e6ebf5",
    inkMuted: "#9aa8c0",
    divider: "#2a3550",
    appBar: "#243c8f",
    selectedTint: "rgba(124, 156, 255, 0.16)",
    selectedInk: "#a9bdff",
    selection: "#2f4380",
    chart: { grid: "#263049", track: "#232c42" },
    cardShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
    barShadow: "0 1px 4px rgba(0, 0, 0, 0.5)",
  },
};

/**
 * The look of the interface: colors, type and shared component styles. Data colors live in palette.js.
 * chartScale is the reader's text size as a multiplier; the charts read it because they draw
 * their text and rows in pixels, which the page's rem-based text size cannot reach.
 * mode is "light" or "dark".
 */
export function buildTheme(chartScale = 1, mode = "light") {
  const c = modes[mode] ?? modes.light;
  return createTheme({
    chartScale,
    chart: c.chart,
    palette: {
      mode,
      primary: { main: c.primary },
      background: { default: c.page, paper: c.surface },
      text: { primary: c.ink, secondary: c.inkMuted },
      divider: c.divider,
    },
    shape: { borderRadius: 6 },
    typography: {
      fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
      h4: { fontSize: "1.75rem", fontWeight: 600 },
      h6: { fontSize: "1rem", fontWeight: 600 },
      body2: { fontSize: "0.8125rem" },
      overline: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", lineHeight: 1.6 },
      button: { textTransform: "none", fontWeight: 500 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "::selection": { backgroundColor: c.selection },
          // Jumping to a section glides, unless the reader asked the system for less motion.
          "@media (prefers-reduced-motion: no-preference)": { html: { scrollBehavior: "smooth" } },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { boxShadow: c.cardShadow } },
      },
      MuiAppBar: { styleOverrides: { root: { boxShadow: c.barShadow }, colorPrimary: { backgroundColor: c.appBar } } },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: c.selectedTint, color: c.selectedInk },
          },
        },
      },
      // Touch screens get 44px targets; mouse users keep the dense desktop sizes.
      MuiChip: { styleOverrides: { root: { [TOUCH]: { height: TOUCH_TARGET } } } },
      MuiToggleButton: { styleOverrides: { root: { [TOUCH]: { minHeight: TOUCH_TARGET, minWidth: TOUCH_TARGET } } } },
      MuiButton: { styleOverrides: { root: { [TOUCH]: { minHeight: TOUCH_TARGET } } } },
      MuiIconButton: { styleOverrides: { root: { [TOUCH]: { minHeight: TOUCH_TARGET, minWidth: TOUCH_TARGET } } } },
      MuiTableSortLabel: { styleOverrides: { root: { [TOUCH]: { minHeight: TOUCH_TARGET } } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: c.divider, fontSize: "0.8125rem" },
          head: { color: c.inkMuted, fontWeight: 500, whiteSpace: "nowrap" },
        },
      },
    },
  });
}

export default buildTheme();
