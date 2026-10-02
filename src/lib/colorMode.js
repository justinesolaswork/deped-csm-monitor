// The two looks a reader can choose between.
export const colorModes = ["light", "dark"];

/**
 * A saved value -> "light" or "dark". With nothing usable saved, follow the device's own setting
 * (systemPrefersDark), so the dashboard starts the way the reader's other apps look.
 */
export function parseColorMode(saved, systemPrefersDark = false) {
  if (colorModes.includes(saved)) return saved;
  return systemPrefersDark ? "dark" : "light";
}
