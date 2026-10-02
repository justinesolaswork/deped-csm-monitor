import { useEffect, useState } from "react";
import { DEFAULT_FONT_INDEX, fontSizes, parseFontIndex } from "../lib/fontSize.js";

const STORAGE_KEY = "csm-font-size";

/**
 * The reader's chosen text size, remembered in this browser (it is a personal setting, so it is
 * not put in the page address like region and measure are).
 * Returns [index, setIndex]. Index is a position in fontSizes.
 * It also sets the page's base text size and a --font-scale variable that sticky offsets use.
 */
export function useFontSize() {
  const [index, setIndex] = useState(() => {
    try {
      return parseFontIndex(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_FONT_INDEX; // storage blocked, for example in a private window
    }
  });

  useEffect(() => {
    const { scale } = fontSizes[index];
    document.documentElement.style.fontSize = `${scale * 100}%`;
    document.documentElement.style.setProperty("--font-scale", String(scale));
    try {
      window.localStorage.setItem(STORAGE_KEY, String(index));
    } catch {
      // The size still applies for this visit; it just will not be remembered.
    }
  }, [index]);

  return [index, setIndex];
}
