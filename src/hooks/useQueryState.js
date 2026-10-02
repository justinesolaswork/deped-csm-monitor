import { useCallback, useEffect, useState } from "react";

/**
 * Keep one piece of state in the page address (for example ?region=Region+V), so that
 * refreshing, the browser's Back button and shared links all keep the same view.
 *
 *   key       the name in the address
 *   fallback  the value when the address has none (it is left out of the address)
 *   isValid   returns true for values the dashboard accepts; anything else uses the fallback
 *
 * Returns [value, setValue]. setValue(next, { replace: true }) changes the address
 * without adding a step for the Back button.
 */
export function useQueryState(key, fallback, isValid) {
  const read = useCallback(() => {
    const value = new URLSearchParams(window.location.search).get(key);
    return value !== null && isValid(value) ? value : fallback;
  }, [key, fallback, isValid]);

  const [value, setValue] = useState(read);

  useEffect(() => {
    const onHistoryMove = () => setValue(read());
    window.addEventListener("popstate", onHistoryMove);
    return () => window.removeEventListener("popstate", onHistoryMove);
  }, [read]);

  const update = useCallback(
    (next, { replace = false } = {}) => {
      const url = new URL(window.location.href);
      if (next === fallback) url.searchParams.delete(key);
      else url.searchParams.set(key, next);
      if (replace) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
      setValue(next);
    },
    [key, fallback],
  );

  return [value, update];
}
