import { useEffect, useState } from "react";
import { schoolsFileName } from "../data/selectors.js";

// One loader per region file. Vite keeps each file out of the main bundle and fetches it on demand.
const loaders = import.meta.glob("../data/schools/*.json", { import: "default" });

/**
 * Load the school lists for the given regions (one region, or all of them), only when asked for.
 * Nothing is fetched until `enabled` is true, so a card far down the page costs nothing until it is near.
 * Returns { status, files }: status is "loading", "ready" or "error"; files has one entry per region.
 */
export function useRegionSchools(regionNames, enabled = true) {
  const [state, setState] = useState({ status: "loading", files: [] });
  // The names as one piece of text, so the effect only re-runs when the regions really change.
  const wanted = regionNames.join("|");

  useEffect(() => {
    if (!enabled) return undefined;
    const load = wanted.split("|").map((name) => loaders[`../data/schools/${schoolsFileName(name)}`]);
    if (load.some((loader) => !loader)) {
      setState({ status: "error", files: [] });
      return undefined;
    }
    // If the regions change before the files arrive, the late answer is ignored.
    let current = true;
    setState({ status: "loading", files: [] });
    Promise.all(load.map((loader) => loader())).then(
      (files) => current && setState({ status: "ready", files }),
      () => current && setState({ status: "error", files: [] }),
    );
    return () => {
      current = false;
    };
  }, [wanted, enabled]);

  return state;
}
