import { useState } from "react";
import { AppBar, Box, Chip, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Slider, Tab, Tabs, Toolbar, Tooltip, Typography } from "@mui/material";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { SIDEBAR_WIDTH } from "../layout.js";
import { fontSizes } from "../lib/fontSize.js";
import { formatDate, formatNumber } from "../lib/format.js";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

const TABS_HEIGHT = 48;
/** Width of the always-visible icon rail. Main content margin is fixed to this so the page never shifts. */
const SIDEBAR_RAIL_WIDTH = 64;

const fontMarks = fontSizes.map(({ label }, value) => ({ value, label }));

/**
 * The frame around the dashboard: top bar, auto-expanding sidebar rail and the main content area.
 *
 * Desktop behaviour:
 *   - A 64px icon-only rail is always visible.
 *   - Hovering the rail expands it to the full 240px label view (overlays content, no layout shift).
 *   - Moving the pointer away collapses it back to the rail.
 *   - No toggle button — fully automatic.
 *
 * Mobile behaviour:
 *   - Sidebar is hidden; sections are exposed as horizontal tabs in the top bar.
 */
export default function AppShell({ sections, snapshotDate, scopeName, schoolCount, fontIndex, onFontIndexChange, colorMode, onColorModeChange, children }) {
  const [activeId, choose] = useActiveSection(sections.map((s) => s.id));
  const [hovered, setHovered] = useState(false);

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

          {/* Dark / light toggle */}
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

      {/* ── Sidebar rail ─────────────────────────────────────────────────────
          Always occupies SIDEBAR_RAIL_WIDTH on screen. On hover it expands to
          SIDEBAR_WIDTH and slides over the main content (position:fixed + z-index).
          The main content margin-left is permanently SIDEBAR_RAIL_WIDTH so it
          never moves regardless of hover state.
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
        {/* Brand row — label fades in beside icon when expanded */}
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
          {/* Static icon acts as the brand mark in collapsed state */}
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

                {/* Label — fades in when hovered */}
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

        {/* "You are viewing" footer — fades in when expanded */}
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

      {/* ── Main content ─────────────────────────────────────────────────────
          Fixed margin-left = SIDEBAR_RAIL_WIDTH. The sidebar expands as an
          overlay so this value never needs to change — zero layout shift.
      ──────────────────────────────────────────────────────────────────────── */}
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
