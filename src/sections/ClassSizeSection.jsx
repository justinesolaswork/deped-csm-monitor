import BreakdownPanel from "../components/BreakdownPanel.jsx";
import { sizeStrata } from "../data/categories.js";
import { areaPhrase } from "../lib/format.js";

// Where classes sit against the standard. Starts sorted by the share above standard, worst first.
export default function ClassSizeSection({ scope, measure, onSelectRegion }) {
  return (
    <BreakdownPanel
      caption={`Classes above, within and less than standard, by ${areaPhrase(scope)}`}
      defaultSort={{ by: "above", dir: "desc" }}
      id="class-size"
      measure={measure}
      measureKey="classSize"
      onSelectRegion={onSelectRegion}
      scope={scope}
      strata={sizeStrata}
      title="Class-size profile"
      unit="classes"
    />
  );
}
