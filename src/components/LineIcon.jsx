import { SvgIcon } from "@mui/material";

// Every icon is one outline path drawn with the same stroke, so they read as a set.
export const iconPaths = {
  overview: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  classSize: "M4 20V10M10 20V4M16 20v-7M22 20V7",
  shifting: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  schools: "M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6M9 11h.01M15 11h.01",
  coverage: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  above: "M3 17l6-6 4 4 8-8M15 7h6v6",
  within: "M20 6L9 17l-5-5",
  below: "M3 7l6 6 4-4 8 8M15 17h6v-6",
  back: "M19 12H5M12 19l-7-7 7-7",
  // Shifting schedule icons
  single: "M12 6v6l4 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  double: "M8 6v12M16 6v12M4 9h16M4 15h16",
  triple: "M5 6v12M12 6v12M19 6v12M3 9h18M3 15h18",
};

export default function LineIcon({ path, ...props }) {
  return (
    <SvgIcon {...props}>
      <path d={path} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </SvgIcon>
  );
}
