import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { STICKY_TOP_CSS } from "../layout.js";

// A card with the shared header: title, caption, optional action on the right, then a divider.
export default function Panel({ id, title, caption, action, children, sx }) {
  return (
    <Paper aria-labelledby={`${id}-title`} component="section" id={id} sx={{ scrollMarginTop: STICKY_TOP_CSS, ...sx }}>
      <Stack alignItems={{ sm: "center" }} direction={{ sm: "row", xs: "column" }} justifyContent="space-between" spacing={1} sx={{ px: 3, py: 2.5 }}>
        <Box>
          <Typography component="h2" id={`${id}-title`} variant="h6">
            {title}
          </Typography>
          {caption && (
            <Typography color="text.secondary" variant="body2">
              {caption}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Divider />
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}
