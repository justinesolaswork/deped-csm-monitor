// How numbers and dates are written on screen. Use these everywhere so the dashboard is consistent.

const numberFormat = new Intl.NumberFormat("en-US");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 704974 -> "704,974" */
export function formatNumber(value) {
  return numberFormat.format(value);
}

/** One decimal normally; two for shares under 1% so small values do not all read as "0.0%". */
export function formatPercent(value) {
  if (value === 0) return "0%";
  if (value < 0.01) return "<0.01%";
  return `${value.toFixed(value < 1 ? 2 : 1)}%`;
}

/** How a scope's rows are described in captions: "region", or "division in Region V". */
export function areaPhrase(scope) {
  return scope.childLabel === "division" ? `${scope.childLabel} in ${scope.name}` : scope.childLabel;
}

/** "2026-09-28" -> "28 Sep 2026" */
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/**
 * Turns the current breakdown rows into a CSV file and triggers a browser download.
 *   rows       – the sorted/filtered stack rows (from toStackRows + sortRows)
 *   strata     – all strata (hidden ones are excluded from the output)
 *   hidden     – array of stratum fields currently hidden by the legend toggle
 *   measure    – "share" | "count"
 *   unit       – "classes" | "records"
 *   areaLabel  – "Region" | "Division"
 *   filename   – suggested filename without extension
 */
export function downloadCsv({ rows, strata, hidden, measure, unit, areaLabel, filename }) {
  const visible = strata.filter(({ field }) => !hidden.includes(field));

  // Header row
  const headers = [
    areaLabel,
    ...visible.map(({ label }) => (measure === "share" ? `${label} (%)` : `${label} (${unit})`)),
    `Total ${unit}`,
  ];

  // Data rows
  const lines = rows.map((row) => {
    const cells = [
      `"${String(row.name).replace(/"/g, '""')}"`,
      ...visible.map(({ field }) => {
        if (measure === "share") {
          const pct = row[`${field}Share`];
          return Number(pct.toFixed(4));
        }
        return row[field];
      }),
      row.total,
    ];
    return cells.join(",");
  });

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
