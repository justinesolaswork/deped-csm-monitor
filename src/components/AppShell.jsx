import { useState } from "react";
import { AppBar, Box, Chip, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Slider, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { SIDEBAR_WIDTH } from "../layout.js";
import { fontSizes } from "../lib/fontSize.js";
import { formatDate, formatNumber } from "../lib/format.js";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

const TABS_HEIGHT = 48;

const fontMarks = fontSizes.map(({ label }, value) => ({ value, label }));

/**
 * The frame around the dashboard: top bar, section navigation and the main content area.
 * The sidebar auto-hides on desktop and slides in on hover without shifting the main panel.
 * sections is the list of { id, label, icon } to link to; each id must exist on the page.
 * scopeName and schoolCount fill the "You are viewing" block at the foot of the sidebar.
 * fontIndex and onFontIndexChange drive the text-size slider in the top bar; colorMode ("light" or "dark")
 * and onColorModeChange drive the button beside it.
 */
export default function AppShell({ sections, snapshotDate, scopeName, schoolCount, fontIndex, onFontIndexChange, colorMode, onColorModeChange, children }) {
  const [activeId, choose] = useActiveSection(sections.map((section) => section.id));
  // Controls sidebar visibility on desktop (hover zone triggers this)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 2 }}>
        <Toolbar>
          <LineIcon aria-hidden path={iconPaths.classSize} sx={{ mr: 1 }} />
          <Typography component="h1" sx={{ flexGrow: 1, fontSize: "1.25rem", fontWeight: 600 }}>
            CSM Monitor
          </Typography>
          {/* Text size: four steps, remembered in this browser. Step names show under the slider from 900px up. */}
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
                "& .MuiSlider-markLabel": { color: "rgba(255, 255, 255, 0.85)", display: { md: "block", xs: "none" }, fontSize: "0.6875rem" },
                "& .MuiSlider-mark": { backgroundColor: "rgba(255, 255, 255, 0.6)" },
                "& .MuiSlider-rail": { opacity: 0.4 },
                "& .Mui-focusVisible": { boxShadow: "0 0 0 6px rgba(255, 255, 255, 0.35)" },
              }}
              value={fontIndex}
              valueLabelDisplay="off"
            />
          </Box>
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
                <Box component="span" sx={{ display: { sm: "inline", xs: "none" } }}>
                  Snapshot ·{" "}
                </Box>
                {formatDate(snapshotDate)}
              </>
            }
            size="small"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.18)", color: "#fff", display: { sm: "inline-flex", xs: "none" }, fontWeight: 500 }}
          />
        </Toolbar>
        {/* Narrow screens have no room for the sidebar, so the sections become a row of tabs. */}
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

      {/* ── Desktop auto-hide sidebar ─────────────────────────────────────────
          The sidebar is position:fixed and overlays the main panel (no ml offset).
          A thin invisible hover-zone sits on the left edge and triggers the open state.
          The sidebar itself also keeps the state open while the pointer is inside it.
          A backdrop dims the page when the sidebar is visible.
      ─────────────────────────────────────────────────────────────────────── */}

      {/* Hover trigger zone — always visible on the left edge, 12px wide */}
      <Box
        aria-hidden
        onMouseEnter={() => setSidebarOpen(true)}
        sx={{
          bottom: 0,
          display: { md: "block", xs: "none" },
          left: 0,
          position: "fixed",
          top: 64,
          width: 12,
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      />

      {/* Dimming backdrop — click to close */}
      <Box
        aria-hidden
        onClick={() => setSidebarOpen(false)}
        sx={{
          bgcolor: "rgba(0,0,0,0.25)",
          bottom: 0,
          display: { md: "block", xs: "none" },
          left: 0,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          position: "fixed",
          right: 0,
          top: 0,
          transition: "opacity 250ms ease",
          zIndex: (t) => t.zIndex.drawer,
        }}
      />

      {/* Sidebar panel */}
      <Box
        aria-label="Sections"
        component="nav"
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        sx={{
          bgcolor: "background.paper",
          borderColor: "divider",
          borderRight: 1,
          bottom: 0,
          display: { md: "flex", xs: "none" },
          flexDirection: "column",
          left: 0,
          overflowY: "auto",
          position: "fixed",
          px: 1.5,
          top: 64,
          transform: sidebarOpen ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: "transform 260ms cubic-bezier(0.4, 0, 0.2, 1)",
          width: SIDEBAR_WIDTH,
          zIndex: (t) => t.zIndex.drawer + 1,
          // Subtle shadow so the sidebar feels elevated above content
          boxShadow: sidebarOpen ? 8 : 0,
        }}
      >
        <Typography color="primary" sx={{ display: "block", pt: 2.5, px: 1.5 }} variant="overline">
          DepEd
        </Typography>
        <Typography color="text.secondary" sx={{ display: "block", pb: 1, px: 1.5 }} variant="caption">
          Class size &amp; shifting
        </Typography>
        <List disablePadding>
          {sections.map(({ id, label, icon }) => (
            <ListItemButton
              aria-current={id === activeId ? "location" : undefined}
              component="a"
              href={`#${id}`}
              key={id}
              onClick={() => { choose(id); setSidebarOpen(false); }}
              selected={id === activeId}
              sx={{ mb: 0.5 }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                <LineIcon fontSize="small" path={icon} />
              </ListItemIcon>
              <ListItemText primary={label} slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500 } } }} />
            </ListItemButton>
          ))}
        </List>
        {/* What the page is currently showing, kept in view while reading. */}
        <Box sx={{ borderColor: "divider", borderTop: 1, mt: "auto", mx: 1.5, py: 2 }}>
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

      {/* Main content — always full width, no left margin offset */}
      <Box component="main" sx={{ bgcolor: "background.default", minHeight: "100vh", pb: { md: 3, xs: 2 }, px: { md: 3, xs: 2 } }}>
        {/* Spacers the height of the fixed top bar (and, on narrow screens, its tabs). */}
        <Toolbar />
        <Box sx={{ display: { md: "none" }, height: TABS_HEIGHT }} />
        {children}
      </Box>
    </>
  );
}
