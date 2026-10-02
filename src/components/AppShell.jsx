import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  ButtonBase,
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
const OPEN_MS = 220;
const EASE = "cubic-bezier(0.2, 0, 0, 1)";
// Labels only fade; their space is always reserved, so nothing re-flows while the rail opens.
const fade = { opacity: 0, transition: `opacity 140ms ease`, "@media (prefers-reduced-motion: reduce)": { transition: "none" } };
const fadeIn = { ...fade, opacity: 1, transition: `opacity 160ms ease 70ms` };

const fontMarks = fontSizes.map(({ label }, value) => ({ value, label }));


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
  // Pinned keeps the rail open. It still overlays the page, so the main panel never moves.
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;
  // The toggle sits in the top bar and the panel below it; a short grace period lets the pointer cross the gap.
  const closeTimer = useRef(null);
  const openByHover = () => {
    clearTimeout(closeTimer.current);
    setHovered(true);
  };
  const closeByHover = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHovered(false), 140);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  // A solid blue panel with white ink, deeper than the top bar so the two read as separate layers.
  const rail = {
    bg: dark ? "rgba(24, 32, 51, 0.7)" : "rgba(255, 255, 255, 0.7)",
    ink: theme.palette.text.primary,
    inkSoft: theme.palette.text.secondary,
    line: theme.palette.divider,
    active: dark ? "rgba(124, 156, 255, 0.2)" : "rgba(51, 102, 255, 0.12)",
    accent: theme.palette.primary.main,
  };
  // The frosted-glass look shared by the sidebar and the handle.
  const glass = { backdropFilter: "blur(16px) saturate(160%)", WebkitBackdropFilter: "blur(16px) saturate(160%)" };

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
              {/* Standard Material Design filled settings/gear icon */}
              <Box
                aria-hidden
                component="svg"
                sx={{ fill: "currentColor", fontSize: 24, height: "1em", width: "1em" }}
                viewBox="0 0 24 24"
              >
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
              </Box>
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Mobile section tabs */}
        <Tabs
          aria-label="Sections"
          onChange={(_, id) => choose(id)}
          role="navigation"
          scrollButtons={false}
          sx={{ display: { md: "none" }, minHeight: TABS_HEIGHT, "& .MuiTabs-indicator": { bgcolor: "primary.main", height: 3 } }}
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

      {/* ── Sidebar ──────────────────────────────────────────────────────────
          Hidden until opened; then a 240px panel that overlays the page.
          The page never has a sidebar margin, so nothing moves when it opens.
          visibility:hidden while closed keeps its links out of the Tab order and away from screen readers.
      ──────────────────────────────────────────────────────────────────────── */}
      {/* Left edge: a thin line the full height, with a small handle. Hovering anywhere along it opens the sidebar;
          the handle is also the button for keyboard and touch users (click pins the sidebar open). */}
      <Box
        onMouseEnter={openByHover}
        onMouseLeave={closeByHover}
        sx={{
          bottom: 0,
          display: { md: "block", xs: "none" },
          left: 0,
          position: "fixed",
          top: 64,
          width: 28,
          zIndex: (t) => t.zIndex.drawer,
          "&::before": { bgcolor: rail.accent, bottom: 0, content: '""', left: 0, opacity: 0.45, position: "absolute", top: 0, width: 4 },
        }}
      >
        <ButtonBase
          aria-controls="sections-nav"
          aria-expanded={pinned}
          aria-label="Open sidebar"
          onClick={() => setPinned(true)}
          sx={{
            alignItems: "center",
            ...glass,
            bgcolor: rail.bg,
            border: 1,
            borderColor: rail.line,
            borderLeft: 0,
            borderRadius: "0 10px 10px 0",
            color: rail.ink,
            display: "flex",
            height: 68,
            justifyContent: "center",
            left: 0,
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            transformOrigin: "left center",
            transition: `transform 140ms ${EASE}`,
            width: 24,
            "&:hover, &:focus-visible": { transform: "translateY(-50%) scaleX(1.17)" },
            "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2, transform: "translateY(-50%) scaleX(1.17)" },
          }}
        >
          <LineIcon sx={{ fontSize: 22 }} path={iconPaths.chevronRight} />
        </ButtonBase>
      </Box>

      <Box
        aria-label="Sections"
        component="nav"
        id="sections-nav"
        onMouseEnter={openByHover}
        onMouseLeave={closeByHover}
        sx={{
          ...glass,
          bgcolor: rail.bg,
          borderRight: 1,
          borderColor: rail.line,
          bottom: 0,
          boxShadow: open ? 6 : 0,
          clipPath: open ? "inset(0 -24px 0 0)" : "inset(0 100% 0 0)",
          color: rail.ink,
          display: { md: "flex", xs: "none" },
          flexDirection: "column",
          left: 0,
          overflowX: "hidden",
          overflowY: "auto",
          position: "fixed",
          top: 64,
          transition: `clip-path ${OPEN_MS}ms ${EASE}, box-shadow ${OPEN_MS}ms ${EASE}, visibility 0s linear ${open ? "0s" : `${OPEN_MS}ms`}`,
          visibility: open ? "visible" : "hidden",
          width: SIDEBAR_WIDTH,
          willChange: "clip-path",
          zIndex: (t) => t.zIndex.drawer + 1,
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        {/* Pin: keeps the sidebar open. Unpinned, it closes when the pointer leaves. */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pt: 0.5 }}>
          <Tooltip title={pinned ? "Unpin sidebar" : "Keep sidebar open"}>
            <IconButton
              aria-label={pinned ? "Unpin sidebar" : "Keep sidebar open"}
              aria-pressed={pinned}
              onClick={() => setPinned((value) => !value)}
              size="small"
              sx={{ bgcolor: pinned ? rail.active : "transparent", color: rail.ink, "&:hover": { bgcolor: rail.active } }}
            >
              <LineIcon fontSize="small" path={iconPaths.pin} sx={{ transform: pinned ? "none" : "rotate(45deg)" }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Nav items */}
        <List disablePadding sx={{ flex: 1, mt: 1, pointerEvents: open ? "auto" : "none" }}>
          {sections.map(({ id, label, icon }) => (
            <Tooltip key={id} title="" placement="right" arrow>
              <ListItemButton
                aria-current={id === activeId ? "location" : undefined}
                component="a"
                href={`#${id}`}
                onClick={() => choose(id)}
                selected={id === activeId}
                sx={{
                  borderRadius: 1.5,
                  color: rail.inkSoft,
                  justifyContent: "flex-start",
                  mb: 0.5,
                  minHeight: 44,
                  mx: 1,
                  px: 1,
                  "&:hover": { bgcolor: rail.active, color: rail.ink },
                  "&.Mui-selected, &.Mui-selected:hover": { bgcolor: rail.active, color: rail.accent, "& .MuiTypography-root": { fontWeight: 700 } },
                  "&:focus-visible": { outline: `2px solid ${rail.accent}`, outlineOffset: -2 },
                }}
              >
                <ListItemIcon sx={{ ...(open ? fadeIn : fade), color: "inherit", flexShrink: 0, justifyContent: "center", minWidth: 36 }}>
                  <LineIcon fontSize="small" path={icon} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500, whiteSpace: "nowrap" } } }}
                  sx={{
                    m: 0,
                    ...(open ? fadeIn : fade),
                  }}
                />
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* "You are viewing" footer */}
        <Box
          sx={{
            borderColor: rail.line,
            borderTop: 1,
            mx: 1.5,
            py: 2,
            ...(open ? fadeIn : fade),
            whiteSpace: "nowrap",
          }}
        >
          <Typography sx={{ color: rail.inkSoft, display: "block" }} variant="overline">
            You are viewing
          </Typography>
          <Typography sx={{ fontWeight: 600 }} variant="body2">
            {scopeName}
          </Typography>
          <Typography sx={{ color: rail.inkSoft }} variant="body2">
            {formatNumber(schoolCount)} schools
          </Typography>
          <Typography sx={{ color: rail.inkSoft }} variant="body2">
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
