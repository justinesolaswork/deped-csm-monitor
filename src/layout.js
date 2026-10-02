// Shared layout measurements, so the shell, the sticky filter bar and section anchors agree.

export const SIDEBAR_WIDTH = 240;

// Space taken at the top of the window by the app bar plus, on wide screens, the sticky filter
// bar (and on narrow screens, the section tabs). Jumping to a section stops just below it.
export const STICKY_TOP = { xs: 116, md: 152 };

// The same offsets for CSS, grown with the reader's text size (--font-scale is set by useFontSize),
// because a larger text size makes the sticky filter bar taller.
export const STICKY_TOP_CSS = {
  xs: `calc(${STICKY_TOP.xs}px * var(--font-scale, 1))`,
  md: `calc(${STICKY_TOP.md}px * var(--font-scale, 1))`,
};

// MUI's "md" breakpoint: at this width the sidebar appears and the filter bar becomes sticky.
export const WIDE_SCREEN_QUERY = "(min-width: 900px)";
