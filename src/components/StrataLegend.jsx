import { Box, Chip, Stack } from "@mui/material";

// The legend for a stacked chart. Each chip is also a switch that shows or hides its slice.
export default function StrataLegend({ ariaLabel, strata, hidden, onToggle }) {
  return (
    <Stack aria-label={ariaLabel} direction="row" flexWrap="wrap" role="group" spacing={1} sx={{ rowGap: 1 }} useFlexGap>
      {strata.map(({ field, label, color }) => {
        const active = !hidden.includes(field);
        return (
          <Chip
            aria-pressed={active}
            clickable
            icon={<Box sx={{ bgcolor: active ? color : "transparent", border: `2px solid ${color}`, borderRadius: "50%", height: 12, ml: "10px !important", width: 12 }} />}
            key={field}
            label={label}
            onClick={() => onToggle(field)}
            sx={{ bgcolor: active ? "background.paper" : "background.default", borderColor: active ? color : "divider", color: active ? "text.primary" : "text.secondary", textDecoration: active ? "none" : "line-through" }}
            variant="outlined"
          />
        );
      })}
    </Stack>
  );
}
