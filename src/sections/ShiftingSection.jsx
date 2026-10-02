import BreakdownPanel from "../components/BreakdownPanel.jsx";
import { shiftStrata } from "../data/categories.js";
import { areaPhrase } from "../lib/format.js";

export default function ShiftingSection({ scope, measure, onSelectRegion, onSelectDivision }) {
  return (
    <BreakdownPanel
      caption={`School-by-grade records by shift type and ${areaPhrase(scope)}. A school can run different shifts in different grades.`}
      defaultSort={{ by: "double", dir: "desc" }}
      id="shifting"
      measure={measure}
      measureKey="shifting"
      onSelectRegion={onSelectRegion}
      onSelectDivision={onSelectDivision}
      scope={scope}
      strata={shiftStrata}
      title="Shifting schedules"
      unit="records"
    />
  );
}
