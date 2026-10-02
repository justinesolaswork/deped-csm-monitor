import { useState } from "react";
import {
  AppBar,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  Slider,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { SIDEBAR_WIDTH } from "../layout.js";
import { fontSizes } from "../lib/fontSize.js";
import { formatDate, formatNumber } from "../lib/format.js";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

const TABS_HEIGHT = 48;
const SIDEBAR_RAIL_WIDTH = 64;

const fontMarks = fontSizes.map(({ label }, value) => ({ value, label }));

// Gear / settings icon path
const SETTINGS_PATH =
  "M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.33-1.82a.55.55 0 0 0 .13-.7l-2.2-3.82a.55.55 0 0 0-.67-.24l-2.75 1.1a8 8 0 0 0-1.87-1.09l-.41-2.92A.54.54 0 0 0 14 3h-4a.54.54 0 0 0-.54.46l-.41 2.92A8 8 0 0 0 7.18 7.47L4.43 6.37a.55.55 0 0 0-.67.24L1.56 10.43a.54.54 0 0 0 .13.7l2.33 1.82c-.04.34-.06.69-.06 1.05s.02.71.06 1.05l-2.33 1.82a.54.54 0 0 0-.13.7l2.2 3.82c.13.25.42.34.67.24l2.75-1.1a8 8 0 0 0 1.87 1.09l.41 2.92c.07.28.3.46.54.46h4c.25 0 .47-.18.54-.46l.41-2.92a8 8 0 0 0 1.87-1.09l2.75 1.1c.25.1.54.01.67-.24l2.2-3.82a.54.54 0 0 0-.13-.7l-2.33-1.82z";

/**
 * The frame around the dashboard: top bar, auto-expanding sidebar rail and the main content area.
 *
 * The text-size slider, dark/light toggle and snapshot date are hidden inside a
 * settings popover (⚙ gear icon) in the top-right corner so the toolbar stays clean.
 *
 * Desktop sidebar: 64px icon-only rail that auto-expands to 240px on hover.
 * Mobile: horizontal tabs in the top bar.
 */
export default function AppShell({
  sections,
  snapshotDate,
  scopeName,
  schoolCount,
  fontIndex,
  onFontIndexChange,
  colorMode,
  onColorModeChange,
  children,
}) {
  const [activeId, choose] = useActiveSection(sections.map((s) => s.id));
  const [hovered, setHovered] = useState(false);

  // Settings popover anchor
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const settingsOpen = Boolean(settingsAnchor);

  return (
    <>
      {/* ── Top App Bar ──────────────────────────────────────────────────── */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <LineIcon aria-hidden path={iconPaths.classSize} sx={{ mr: 1 }} />
          <Typography component="h1" sx={{ flexGrow: 1, fontSize: "1.25rem", fontWeight: 600 }}>
            DepEd Class Size &amp; Modality Monitor
          </Typography>

          {/* ⚙ Settings button — opens the popover */}
          <Tooltip title="Settings">
            <IconButton
              aria-controls={settingsOpen ? "settings-popover" : undefined}
              aria-expanded={settingsOpen}
              aria-haspopup="true"
              aria-label="Open settings"
              color="inherit"
              id="settings-btn"
              onClick={(e) => setSettingsAnchor(e.currentTarget)}
            >
              <LineIcon path={SETTINGS_PATH} />
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Mobile section tabs */}
        <Tabs
          aria-label="Sections"
          onChange={(_, id) => choose(id)}
          role="navigation"
          scrollButtons={false}
          sx={{ display: { md: "none" }, minHeight: TABS_HEIGHT, "& .MuiTabs-indicator": { bgcolor: "#fff", height: 3 } }}
          textColor="inherit"
          value={activeId}
          variant="scrollable"
        >
          {sections.map(({ id, label }) => (
            <Tab
              component="a"
              href={`#${id}`}
              key={id}
              label={label}
              sx={{ minHeight: TABS_HEIGHT, opacity: 1, "&.Mui-selected": { fontWeight: 600 } }}
              value={id}
            />
          ))}
        </Tabs>
      </AppBar>

      {/* ── Settings Popover ─────────────────────────────────────────────── */}
      <Popover
        anchorEl={settingsAnchor}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        id="settings-popover"
        onClose={() => setSettingsAnchor(null)}
        open={settingsOpen}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 280, mt: 0.5 } } }}
      >
        <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
          <Typography sx={{ fontWeight: 600 }} variant="body2">
            Settings
          </Typography>
        </Box>
        <Divider sx={{ mt: 1 }} />

        {/* Text size */}
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography color="text.secondary" gutterBottom variant="caption">
            Text size
          </Typography>
          <Slider
            aria-label="Text size"
            getAriaValueText={(v) => fontSizes[v].label}
            marks={fontMarks}
            max={fontSizes.length - 1}
            min={0}
            onChange={(_, v) => onFontIndexChange(v)}
            size="small"
            step={1}
            sx={{ "& .MuiSlider-markLabel": { fontSize: "0.6875rem" } }}
            value={fontIndex}
            valueLabelDisplay="off"
          />
        </Box>

        <Divider />

        {/* Dark / light mode */}
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            px: 2.5,
            py: 1.5,
          }}
        >
          <Typography variant="body2">
            {colorMode === "dark" ? "Dark mode" : "Light mode"}
          </Typography>
          <Tooltip title={colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              aria-label={colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => onColorModeChange(colorMode === "dark" ? "light" : "dark")}
              size="small"
            >
              <LineIcon path={colorMode === "dark" ? iconPaths.sun : iconPaths.moon} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Snapshot date */}
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Typography color="text.secondary" variant="caption">
            Snapshot date
          </Typography>
          <Typography sx={{ fontWeight: 500 }} variant="body2">
            {formatDate(snapshotDate)}
          </Typography>
        </Box>
      </Popover>

      {/* ── Sidebar rail ─────────────────────────────────────────────────────
          64px icon-only rail; expands to 240px on hover as an overlay.
          Main content margin-left is permanently 64px — zero layout shift.
      ──────────────────────────────────────────────────────────────────────── */}
      <Box
        aria-label="Sections"
        component="nav"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          bgcolor: "background.paper",
          borderColor: "divider",
          borderRight: 1,
          bottom: 0,
          boxShadow: hovered ? 6 : 0,
          display: { md: "flex", xs: "none" },
          flexDirection: "column",
          left: 0,
          overflowX: "hidden",
          overflowY: "auto",
          position: "fixed",
          top: 64,
          transition: "width 260ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 260ms ease",
          width: hovered ? SIDEBAR_WIDTH : SIDEBAR_RAIL_WIDTH,
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        {/* Brand row */}
        <Box
          sx={{
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            gap: 1.5,
            minHeight: 56,
            overflow: "hidden",
            px: 1.5,
            py: 1,
          }}
        >
          <LineIcon aria-hidden path={iconPaths.classSize} sx={{ color: "primary.main", flexShrink: 0, fontSize: 22 }} />
          <Box
            sx={{
              maxWidth: hovered ? 180 : 0,
              opacity: hovered ? 1 : 0,
              overflow: "hidden",
              transition: "opacity 180ms ease 60ms, max-width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
              whiteSpace: "nowrap",
            }}
          >
            <Typography color="primary" sx={{ display: "block", lineHeight: 1.2 }} variant="overline">
              DepEd
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Class size &amp; shifting
            </Typography>
          </Box>
        </Box>

        {/* Nav items */}
        <List disablePadding sx={{ flex: 1, mt: 1 }}>
          {sections.map(({ id, label, icon }) => (
            <Tooltip key={id} title={hovered ? "" : label} placement="right" arrow>
              <ListItemButton
                aria-current={id === activeId ? "location" : undefined}
                component="a"
                href={`#${id}`}
                onClick={() => choose(id)}
                selected={id === activeId}
                sx={{
                  borderRadius: 1.5,
                  justifyContent: "flex-start",
                  mb: 0.5,
                  minHeight: 44,
                  mx: 1,
                  px: 1,
                }}
              >
                <ListItemIcon sx={{ color: "inherit", flexShrink: 0, justifyContent: "center", minWidth: 36 }}>
                  <LineIcon fontSize="small" path={icon} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500, whiteSpace: "nowrap" } } }}
                  sx={{
                    m: 0,
                    maxWidth: hovered ? 160 : 0,
                    opacity: hovered ? 1 : 0,
                    overflow: "hidden",
                    transition: "opacity 180ms ease 60ms, max-width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* "You are viewing" footer */}
        <Box
          sx={{
            borderColor: "divider",
            borderTop: 1,
            maxHeight: hovered ? 120 : 0,
            mx: 1.5,
            opacity: hovered ? 1 : 0,
            overflow: "hidden",
            py: hovered ? 2 : 0,
            transition: "opacity 180ms ease 60ms, max-height 260ms cubic-bezier(0.4, 0, 0.2, 1), padding 260ms ease",
            whiteSpace: "nowrap",
          }}
        >
          <Typography color="text.secondary" sx={{ display: "block" }} variant="overline">
            You are viewing
          </Typography>
          <Typography sx={{ fontWeight: 600 }} variant="body2">
            {scopeName}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {formatNumber(schoolCount)} schools
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Snapshot · {formatDate(snapshotDate)}
          </Typography>
        </Box>
      </Box>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          ml: { md: `${SIDEBAR_RAIL_WIDTH}px`, xs: 0 },
          pb: { md: 3, xs: 2 },
          px: { md: 3, xs: 2 },
        }}
      >
        <Toolbar />
        <Box sx={{ display: { md: "none" }, height: TABS_HEIGHT }} />
        {children}
      </Box>
    </>
  );
}
