import { useEffect, useState } from "react";
import { parseColorMode } from "../lib/colorMode.js";

const STORAGE_KEY = "csm-color-mode";

/**
 * Light or dark, remembered in this browser. The first visit follows the device setting.
 * Returns [mode, setMode]. It also tells the browser which look is active (colorScheme),
 * so scrollbars and form controls match.
 */
export function useColorMode() {
  const [mode, setMode] = useState(() => {
    let saved = null;
    let systemPrefersDark = false;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked, for example in a private window: fall back to the device setting.
    }
    try {
      systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      // No matchMedia: stay light.
    }
    return parseColorMode(saved, systemPrefersDark);
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
