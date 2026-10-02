import { useEffect, useRef, useState } from "react";

/**
 * True once the element attached to `ref` is within `margin` of the screen, and it stays true after.
 * Used to hold back heavy loading until the reader scrolls close to a card.
 * Browsers without IntersectionObserver get true straight away.
 */
export function useNearViewport(margin = "600px") {
  const ref = useRef(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (near || !ref.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [near, margin]);

  return [ref, near];
}
