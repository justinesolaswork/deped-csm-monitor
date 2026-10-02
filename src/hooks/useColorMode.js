import { useEffect, useState } from "react";
import { parseColorMode } from "../lib/colorMode.js";

const STORAGE_KEY = "csm-color-mode";

/**
 * Light or dark, remembered in this browser. The first visit is always light.
 * Returns [mode, setMode]. It also tells the browser which look is active (colorScheme),
 * so scrollbars and form controls match.
 */
export function useColorMode() {
  const [mode, setMode] = useState(() => {
    let saved = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked, for example in a private window: stay light.
    }
    return parseColorMode(saved, false);
  });

  useEffect(() => {
    document.documentElement.style.colorScheme = mode;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // The look still applies for this visit; it just will not be remembered.
    }
  }, [mode]);

  return [mode, setMode];
}
