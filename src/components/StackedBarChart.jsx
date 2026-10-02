import { useCallback, useEffect, useRef } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Bar, BarChart, BarStack, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, useActiveTooltipLabel } from "recharts";
import { valueKey } from "../data/selectors.js";
import { formatNumber } from "../lib/format.js";
import ChartTooltip from "./ChartTooltip.jsx";

const ROW_HEIGHT = 28; // one bar plus the air around it
const BAR_SIZE = 16;
const AXIS_BAND = 34; // room for the value labels under the plot
const SHORT_NAME = 16; // longest area name shown in full on a phone

// Sits inside the chart and reports which row the pointer or arrow keys are on.
function ActiveRowTracker({ onChange }) {
  const label = useActiveTooltipLabel();
  useEffect(() => onChange(label), [label, onChange]);
  return null;
}

/**
 * Horizontal stacked bars, one row per area.
 * rows come from toStackRows(); strata says which slices exist; hidden lists the slices switched off.
 * When onSelectRow is given, a row can be chosen with a click or with Enter.
 */
export default function StackedBarChart({ ariaLabel, rows, strata, hidden, measure, unit, onSelectRow, childLabel }) {
  const theme = useTheme();
  const scale = theme.chartScale ?? 1; // the reader's text size, so rows and labels grow with it
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));
  const activeRow = useRef(null);
  const trackActiveRow = useCallback((label) => {
    activeRow.current = label ?? null;
  }, []);

  // Only visible slices are drawn; a hidden slice must not leave a hole in the stack.
  const visible = strata.filter(({ field }) => !hidden.includes(field));
  // A full stack always ends at 100%. With slices hidden, let the axis zoom to what is left.
  const isFullShare = measure === "share" && visible.length === strata.length;

  // Room for the longest area name, so no label is cut off.
  const shorten = (name) => (isPhone && name.length > SHORT_NAME ? `${name.slice(0, SHORT_NAME - 1).trimEnd()}…` : name);
  const longestName = Math.max(0, ...rows.map((row) => shorten(row.name).length));
  const axisWidth = Math.min(220 * scale, Math.max(64, Math.ceil(longestName * 7.6 * scale) + 14));

  const select = (name) => {
    if (onSelectRow && name != null) onSelectRow(String(name));
  };

  return (
    <Box
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (event.key === "Enter") select(activeRow.current);
      }}
      role="group"
      sx={{
        cursor: onSelectRow ? "pointer" : "default",
        height: rows.length * ROW_HEIGHT * scale + AXIS_BAND * scale,
        // Themed focus ring for keyboard users only; a mouse click leaves no outline.
        "& .recharts-surface:focus": { outline: "none" },
        "& .recharts-surface:focus-visible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      }}
    >
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          barSize={BAR_SIZE * scale}
          data={rows}
          layout="vertical"
          margin={{ bottom: 0, left: 0, right: 20, top: 0 }}
          onClick={(state) => select(state?.activeLabel)}
        >
          <CartesianGrid horizontal={false} stroke={theme.chart.grid} />
          <XAxis
            allowDataOverflow={isFullShare}
            axisLine={false}
            domain={isFullShare ? [0, 100] : [0, "auto"]}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 * scale }}
            tickFormatter={(value) => (measure === "share" ? `${Number(value.toFixed(2))}%` : formatNumber(value))}
            ticks={isFullShare ? [0, 25, 50, 75, 100] : undefined}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="name"
            interval={0}
            tick={{ fill: theme.palette.text.primary, fontSize: 13 * scale }}
            tickFormatter={shorten}
            tickLine={false}
            type="category"
            width={axisWidth}
          />
          <Tooltip
            content={<ChartTooltip childLabel={childLabel} measure={measure} onSelectRow={onSelectRow} rows={rows} strata={strata} unit={unit} />}
            cursor={{ fill: theme.chart.track }}
            isAnimationActive={false}
            wrapperStyle={{ outline: "none", zIndex: 2 }}
          />
          <ActiveRowTracker onChange={trackActiveRow} />
          {/* The surface-colored stroke leaves a 2px gap between slices; only the end of the whole bar is rounded. */}
          <BarStack radius={[0, 4, 4, 0]}>
            {visible.map(({ field, label, color }) => (
              <Bar dataKey={valueKey(field, measure)} fill={color} key={field} name={label} stroke={theme.palette.background.paper} strokeWidth={2} />
            ))}
          </BarStack>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
