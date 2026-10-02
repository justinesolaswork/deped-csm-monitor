import { useState } from "react";
import { AppBar, Box, Chip, Collapse, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Slider, Tab, Tabs, Toolbar, Tooltip, Typography } from "@mui/material";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { SIDEBAR_WIDTH } from "../layout.js";
import { fontSizes } from "../lib/fontSize.js";
import { formatDate, formatNumber } from "../lib/format.js";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

const TABS_HEIGHT = 48;
const SIDEBAR_COLLAPSED_WIDTH = 64; // icon-only rail width

const fontMarks = fontSizes.map(({ label }, value) => ({ value, label }));

// Chevron icon paths
const CHEVRON_LEFT  = "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z";
const CHEVRON_RIGHT = "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z";

/**
 * The frame around the dashboard: top bar, collapsible sidebar and the main content area.
 * The sidebar toggles between a full labelled list and an icon-only rail.
 * The main content shifts its left margin smoothly so nothing overlaps.
 */
export default function AppShell({ sections, snapshotDate, scopeName, schoolCount, fontIndex, onFontIndexChange, colorMode, onColorModeChange, children }) {
  const [activeId, choose] = useActiveSection(sections.map((s) => s.id));
  const [expanded, setExpanded] = useState(true); // true = full, false = icon-only rail

  const sidebarW = expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <>
      {/* ── Top App Bar ──────────────────────────────────────────────────── */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <LineIcon aria-hidden path={iconPaths.classSize} sx={{ mr: 1 }} />
          <Typography component="h1" sx={{ flexGrow: 1, fontSize: "1.25rem", fontWeight: 600 }}>
            CSM Monitor
          </Typography>

          {/* Text size slider */}
          <Box sx={{ alignItems: "center", display: "flex", gap: 2, mr: { sm: 3, xs: 2 }, width: { md: 330, sm: 150, xs: 88 } }}>
            <Typography aria-hidden sx={{ display: { md: "block", xs: "none" }, fontWeight: 500, whiteSpace: "nowrap" }} variant="body2">
              Text size
            </Typography>
            <Slider
              aria-label="Text size"
              getAriaValueText={(value) => fontSizes[value].label}
              marks={fontMarks}
              max={fontSizes.length - 1}
              min={0}
              onChange={(_, value) => onFontIndexChange(value)}
              size="small"
              step={1}
              sx={{
                color: "common.white",
                "& .MuiSlider-markLabel": { color: "rgba(255,255,255,0.85)", display: { md: "block", xs: "none" }, fontSize: "0.6875rem" },
                "& .MuiSlider-mark": { backgroundColor: "rgba(255,255,255,0.6)" },
                "& .MuiSlider-rail": { opacity: 0.4 },
                "& .Mui-focusVisible": { boxShadow: "0 0 0 6px rgba(255,255,255,0.35)" },
              }}
              value={fontIndex}
              valueLabelDisplay="off"
            />
          </Box>

          {/* Dark/light mode */}
          <IconButton
            aria-label={colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            color="inherit"
            onClick={() => onColorModeChange(colorMode === "dark" ? "light" : "dark")}
            sx={{ mr: { sm: 2, xs: 0 } }}
            title={colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <LineIcon path={colorMode === "dark" ? iconPaths.sun : iconPaths.moon} />
          </IconButton>

          <Chip
            label={
              <>
                <Box component="span" sx={{ display: { sm: "inline", xs: "none" } }}>Snapshot ·{" "}</Box>
                {formatDate(snapshotDate)}
              </>
            }
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", display: { sm: "inline-flex", xs: "none" }, fontWeight: 500 }}
          />
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
            <Tab component="a" href={`#${id}`} key={id} label={label} sx={{ minHeight: TABS_HEIGHT, opacity: 1, "&.Mui-selected": { fontWeight: 600 } }} value={id} />
          ))}
        </Tabs>
      </AppBar>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Box
        aria-label="Sections"
        component="nav"
        sx={{
          bgcolor: "background.paper",
          borderColor: "divider",
          borderRight: 1,
          bottom: 0,
          display: { md: "flex", xs: "none" },
          flexDirection: "column",
          left: 0,
          overflowX: "hidden",
          overflowY: "auto",
          position: "fixed",
          top: 64,
          transition: "width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
          width: sidebarW,
          zIndex: (t) => t.zIndex.drawer,
        }}
      >
        {/* Toggle button row */}
        <Box
          sx={{
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: expanded ? "space-between" : "center",
            px: expanded ? 2 : 0,
            py: 1.5,
            minHeight: 52,
          }}
        >
          {expanded && (
            <Box>
              <Typography color="primary" sx={{ display: "block", lineHeight: 1.2 }} variant="overline">
                DepEd
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Class size &amp; shifting
              </Typography>
            </Box>
          )}
          <Tooltip title={expanded ? "Collapse sidebar" : "Expand sidebar"} placement="right">
            <IconButton
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              id="sidebar-toggle-btn"
              onClick={() => setExpanded((v) => !v)}
              size="small"
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                color: "text.secondary",
                flexShrink: 0,
                "&:hover": { bgcolor: "action.hover", color: "primary.main" },
              }}
            >
              <LineIcon fontSize="small" path={expanded ? CHEVRON_LEFT : CHEVRON_RIGHT} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Nav items */}
        <List disablePadding sx={{ mt: 1, flex: 1 }}>
          {sections.map(({ id, label, icon }) => (
            <Tooltip key={id} title={expanded ? "" : label} placement="right" arrow>
              <ListItemButton
                aria-current={id === activeId ? "location" : undefined}
                component="a"
                href={`#${id}`}
                onClick={() => choose(id)}
                selected={id === activeId}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  minHeight: 44,
                  mx: 1,
                  px: expanded ? 1.5 : 1,
                  justifyContent: expanded ? "flex-start" : "center",
                  transition: "padding 260ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    justifyContent: "center",
                    minWidth: expanded ? 36 : "auto",
                    transition: "min-width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <LineIcon fontSize="small" path={icon} />
                </ListItemIcon>

                {/* Label fades in/out with the sidebar */}
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500, whiteSpace: "nowrap" } } }}
                  sx={{
                    maxWidth: expanded ? 160 : 0,
                    opacity: expanded ? 1 : 0,
                    overflow: "hidden",
                    transition: "opacity 200ms ease, max-width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
                    m: 0,
                  }}
                />
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* "You are viewing" footer — only shown when expanded */}
        <Box
          sx={{
            borderColor: "divider",
            borderTop: 1,
            mx: 1.5,
            opacity: expanded ? 1 : 0,
            overflow: "hidden",
            py: 2,
            transition: "opacity 180ms ease",
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

      {/* ── Main content — shifts with sidebar width ──────────────────────── */}
      <Box
        component="main"
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          ml: { md: `${sidebarW}px`, xs: 0 },
          pb: { md: 3, xs: 2 },
          px: { md: 3, xs: 2 },
          transition: "margin-left 260ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Toolbar />
        <Box sx={{ display: { md: "none" }, height: TABS_HEIGHT }} />
        {children}
      </Box>
    </>
  );
}
