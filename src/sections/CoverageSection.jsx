import { Typography } from "@mui/material";
import Panel from "../components/Panel.jsx";
import ShareList from "../components/ShareList.jsx";
import { coverageGaps } from "../data/selectors.js";
import { formatNumber } from "../lib/format.js";

const sum = (counts) => Object.values(counts).reduce((total, value) => total + value, 0);

// Data gaps shown as findings: registry schools missing from the views, and view rows with no registry school.
export default function CoverageSection({ scope, unmatched }) {
  const { schools } = scope.block.coverage;
  const orphans = unmatched.coverage.orphanSchoolIds;

  return (
    <Panel
      caption={`Of ${formatNumber(schools)} master-registry schools${scope.level === "region" ? ` in ${scope.name}` : ""}, those missing from the view files`}
      id="coverage"
      title="Data coverage"
    >
      <ShareList items={coverageGaps(scope.block.coverage)} />
      {/* Orphan rows belong to no region, so they are reported only for the whole country. */}
      {scope.level === "national" && orphans > 0 && (
        <Typography color="text.secondary" sx={{ borderColor: "divider", borderTop: 1, mt: 2.5, pt: 2 }} variant="body2">
          {formatNumber(orphans)} school IDs in the view files are not in the master registry. Their {formatNumber(sum(unmatched.classSize))} classes
          and {formatNumber(sum(unmatched.shifting))} shifting records count in the national totals but in no region.
        </Typography>
      )}
    </Panel>
  );
}
