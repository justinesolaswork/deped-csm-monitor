import BreakdownPanel from "../components/BreakdownPanel.jsx";
import { shiftStrata } from "../data/categories.js";
import { areaPhrase } from "../lib/format.js";

// Single shift is about 97% of records and would swamp the exceptions, so it starts hidden.
const HIDDEN_AT_START = ["single"];

export default function ShiftingSection({ scope, measure, onSelectRegion }) {
  return (
    <BreakdownPanel
      caption={`School-by-grade records by shift type and ${areaPhrase(scope)}. A school can run different shifts in different grades.`}
      defaultHidden={HIDDEN_AT_START}
      defaultSort={{ by: "double", dir: "desc" }}
      id="shifting"
      measure={measure}
      measureKey="shifting"
      onSelectRegion={onSelectRegion}
      scope={scope}
      strata={shiftStrata}
      title="Shifting schedules"
      unit="records"
    />
  );
}
