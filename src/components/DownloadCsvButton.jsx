import { Button } from "@mui/material";
import LineIcon, { iconPaths } from "./LineIcon.jsx";

// A small "Download CSV" button for any table. onDownload builds and saves the file.
export default function DownloadCsvButton({ onDownload, disabled, label = "Download CSV" }) {
  return (
    <Button disabled={disabled} onClick={onDownload} size="small" startIcon={<LineIcon path={iconPaths.download} />} variant="outlined">
      {label}
    </Button>
  );
}
