---
name: CSM Monitor
description: A calm, dense analyst dashboard for DepEd class size and shifting.
colors:
  primary: "#3366ff"
  page: "#f0f2f8"
  surface: "#ffffff"
  ink: "#1f2a44"
  ink-muted: "#5d6b82"
  divider: "#e6eaf2"
  selected-tint: "#e5ecff"
  text-selection: "#cdd9ff"
  primary-dark: "#7c9cff"
  page-dark: "#0f1420"
  surface-dark: "#182033"
  ink-dark: "#e6ebf5"
  ink-muted-dark: "#9aa8c0"
  divider-dark: "#2a3550"
  app-bar-dark: "#243c8f"
  selected-tint-dark: "#7c9cff29"
  text-selection-dark: "#2f4380"
  chart-grid-dark: "#263049"
  chart-track-dark: "#232c42"
  chart-grid: "#e3e8f2"
  chart-track: "#e9edf7"
  above-standard: "#1976d2"
  within-standard: "#008556"
  below-standard: "#d93a3f"
  single-shift: "#a7b5c3"
  double-shift: "#0f9fb0"
  triple-shift: "#c75a00"
typography:
  headline:
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
  title:
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  app-name:
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
  body:
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
  label:
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  pill: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  app-bar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    height: "64px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  nav-item-selected:
    backgroundColor: "{colors.selected-tint}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
  legend-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "32px"
  legend-chip-off:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink-muted}"
---

# Design System: CSM Monitor

## Overview

CSM Monitor is a working tool for analysts, not a showcase. White cards sit on a cool grey page under one blue top bar. Color is spent almost entirely on data: the interface itself stays blue, white and grey so that a red, green or purple mark always means something.

Density is deliberate. Body text is 13px, chart rows are 28px, and every chart has an exact-number table one click away. On touch screens (coarse pointer) chips, toggle buttons, buttons, icon buttons and column-sort headings grow to 44px tall so they can be tapped; mouse users keep the dense sizes.

**Key Characteristics:**
- One typeface (Poppins) at a tight scale.
- Flat white cards with a single soft shadow; no gradients, no glass.
- Data colors are fixed per meaning and checked for color-blind safety.
- Every chart can be sorted, filtered by its legend, and read as a table.

## Colors

A blue interface with a separate, fixed vocabulary of data colors.

### Primary
- **Monitor Blue** (`primary`): the top bar, the selected navigation item, toggles, links and proportion bars.

### Neutral
- **Cool Page Grey** (`page`): the page behind the cards.
- **Card White** (`surface`): cards, inputs, and the 2px gaps between chart slices.
- **Deep Navy Ink** (`ink`) and **Slate Ink** (`ink-muted`): primary and secondary text. Slate Ink is 5.4:1 on white.
- **Hairline** (`divider`), **Grid** (`chart-grid`), **Track** (`chart-track`): lines and unfilled bar tracks.

### Data colors
- **Class size:** `above-standard` (red), `within-standard` (green), `below-standard` (purple). Blue is reserved for the interface, so no data colour is ever the same as a toggle, link or selected item.
- **Shifts:** `single-shift` is a quiet grey because it is the normal case; `double-shift` (teal) and `triple-shift` (orange) are the exceptions.

### Dark mode
The interface colors have a dark set (the `-dark` tokens above): a deep navy page, slightly lighter cards, soft blue-white ink, a lighter blue for links and toggles, and a deep navy top bar. **Data colors do not change between modes**, so red, green, purple and the shift colors mean the same thing everywhere. Checked against the dark card color: text is 6.8:1 or better, and every data color is at least 3:1 (the minimum for graphics). White text on the colored KPI strips is unchanged.

### Named Rules
**The One Meaning Rule.** A data color means the same thing in every card, chip, chart and table. Never reuse one for a different category.

**The Checked Palette Rule.** Before adding or changing a data color, run the dataviz skill's `validate_palette.js` against white. Neighbouring slices need color-blind separation of at least 8 and normal-vision separation of at least 15; a ramp is checked with `--ordinal`. White text on a color needs 4.5:1.

**The Ink Text Rule.** Text in charts, tooltips and tables is ink, never the data color. A colored swatch beside the text carries the identity. The KPI figures are the one exception.

## Typography

**Body Font:** Poppins (with system-ui, Segoe UI)

**Character:** One geometric sans at every level. Hierarchy comes from weight (400, 500, 600), not from size jumps.

### Hierarchy
- **Headline** (600, 1.75rem): KPI figures only.
- **Title** (600, 1rem): card titles; the app name at 1.25rem.
- **Body** (400, 0.8125rem): captions, legends, table cells, tooltips. Axis labels are 12-13px.
- **Label** (600, 0.6875rem, 0.06em tracking, uppercase): the sidebar brand line only.

### Named Rules
**The Aligned Figures Rule.** Numbers in tables, tooltips and lists use `font-variant-numeric: tabular-nums`. KPI figures do not.

## Layout

A fixed 64px top bar and a fixed 240px sidebar frame a single scrolling column. Cards are spaced 24px apart with 24px padding. The class-size and shifting charts each take the full width. The Schools table sits beside the narrow data-coverage card (2:1) from 1200px; below that they stack.

The filter bar (region, share or count) is the page's scope filter. It sits above everything it scopes and stays pinned under the top bar from 900px up. Below 900px the sidebar becomes a row of tabs under the top bar and the filter bar scrolls with the page. The only controls inside a card are the ones for finding rows in a long list (see Schools table).

## Elevation & Depth

Flat. Cards carry one ambient shadow and never lift on hover. The top bar has a slightly stronger version, and the chart tooltip a deeper one because it floats over content.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 4px rgba(31, 42, 68, 0.08)`): every card.
- **Top bar** (`box-shadow: 0 1px 4px rgba(31, 42, 68, 0.16)`).
- **Tooltip** (`box-shadow: 0 6px 20px rgba(31, 42, 68, 0.14)`).

## Shapes

Gently rounded (6px) cards, inputs and navigation items. Legend chips are pills. The small color squares beside column headings are rounded 2px. Chart bars are square at the baseline and rounded 4px at the far end of the whole stack. Slices are separated by a 2px gap in the card color, never by an outline.

## Components

### Breakdown panel
The signature component. A card with: a one-line summary of the current scope, legend chips, a "Sort by" select, then a stacked bar chart or a table (toggled top right).
- **Bars:** 16px thick in 28px rows, solid hairline vertical grid, no axis lines.
- **Hover:** the row is tinted with `chart-track` and a tooltip lists every slice, value first.
- **Rows:** the class-size and shifting panels always list the 17 regions, even with one region selected; the summary line above the chart describes the selected region. Clicking a row (or Enter) selects that region for the whole dashboard, and a hint line says so.

### Schools table
A plain table, not a chart, for looking up individual schools: School ID, School, then three count columns. A Class size / Shifting toggle (top right) swaps the count columns; they carry the same swatches as the charts (above, within, below; single, double, triple).
- **Controls:** Region (mirrors the filter bar's), Division (enabled once a region is chosen) and a "Find a school" search by ID or name, in one row above the table. These are the one allowed kind of in-card control: they find rows in a list of about 46,000 and change nothing else on the page.
- **Rows:** 25 per page (50 or 100 optional), sortable by any column. "All regions" lists every school.
- **No record:** a school with no rows in a view shows a dash and always sorts last. Screen readers hear "No record".
- **Loading:** the school files are large, so they load only when the card is near the screen. A status line says "Loading schools…".

### Chips
- **Style:** outlined pill, border in the slice's color, filled dot.
- **State:** off = page-grey fill, hollow dot, struck-through label. At least one chip stays on.

### Cards / Containers
- **Corner Style:** 6px. **Background:** white. **Shadow:** Card. **Internal Padding:** 24px, with a 16px by 24px header above a hairline.

### KPI card
Figure and icon in the category color above a solid strip of that color with white 13px text.

### Navigation
Sidebar items are 13px, weight 500, with an outline icon. The current section has the `selected-tint` fill and blue text, and follows scrolling. At the foot of the sidebar a hairline-topped "You are viewing" block repeats the selected region, its school count and the snapshot date, so the scope is visible while reading.

### Top bar
The bar carries a small bar-chart mark, the app name, a **Text size** slider, a light/dark button and the snapshot chip (on phones the date moves into the page heading). The slider has four steps (Small, Medium, Large, XL; 87.5%, 100%, 112.5% and 125% of the browser's text size), shows the step names under it from 900px, and the choice is remembered in the reader's browser. Text, rows and chart labels all grow with it. The slider is white on the blue bar. The sun/moon button beside it switches between light and dark; the first visit follows the device's setting and the choice is remembered in the reader's browser.

### Page heading
Under the filter bar, one title line ("Class size and shifting · region") and one sentence say what the page shows and which cards follow the chosen region.

## Do's and Don'ts

### Do:
- **Do** build new charted breakdowns with `BreakdownPanel` so legend, sort, table and drill-down behave the same everywhere.
- **Do** give every chart a table view and a legend; never rely on color alone.
- **Do** keep gridlines solid and one step off the surface (`chart-grid`).
- **Do** start a dominant category hidden when it would swamp the rest (single shift).

### Don't:
- **Don't** add a scope filter inside a single card; region and measure belong in the filter bar. A search or narrowing control for finding rows in a long list (the Schools table) is the exception.
- **Don't** use a data color for decoration or for a second meaning.
- **Don't** draw borders around bars, use dashed gridlines, or put two value axes on one chart.
- **Don't** add gradients, glass effects or hover lift to cards.
