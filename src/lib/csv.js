// Turn table rows into a CSV file the reader can open in Excel.

/** One CSV cell: text with a comma, quote or line break is wrapped in quotes; quotes inside are doubled. */
export function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** headers is a list of column titles; rows is a list of lists in the same order. */
export function toCsv(headers, rows) {
  return [headers, ...rows].map((line) => line.map(csvCell).join(",")).join("\r\n");
}

/** Save text as a file. The leading BOM makes Excel read names such as "Dasmariñas" correctly. */
export function downloadCsv(filename, text) {
  const url = URL.createObjectURL(new Blob(["\ufeff", text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** A safe file name from a title: "Class-size profile · Region V" -> "class-size-profile-region-v". */
export function csvFileName(...parts) {
  return parts.join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "table";
}
