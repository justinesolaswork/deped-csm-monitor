import { useCallback, useEffect, useRef, useState } from "react";
import { STICKY_TOP, WIDE_SCREEN_QUERY } from "../layout.js";

const TOLERANCE = 8; // px of slack when comparing positions

/**
 * Which section of the page the reader is looking at, so the navigation can highlight it.
 * Returns [activeId, choose]. Call choose(id) when a navigation item is clicked.
 */
export function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(ids[0]);
  const chosen = useRef(null); // the section last picked from the navigation
  const arrived = useRef(false); // whether scrolling has reached that section yet
  const key = ids.join("|");

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scale = parseFloat(document.documentElement.style.getPropertyValue("--font-scale")) || 1;
      const line = (window.matchMedia(WIDE_SCREEN_QUERY).matches ? STICKY_TOP.md : STICKY_TOP.xs) * scale + TOLERANCE;
      const sections = key
        .split("|")
        .map((id) => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top }))
        .filter((section) => section.top !== undefined);
      if (!sections.length) return;

      // Current = the lowest section whose top has reached the line under the sticky header.
      // At the very bottom of the page the last sections can never reach it, so take those instead.
      const atBottom = window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - TOLERANCE;
      const reached = atBottom ? sections : sections.filter((section) => section.top <= line);
      if (!reached.length) return setActiveId(sections[0].id);

      // Sections that sit side by side share a top. Prefer the one picked from the navigation,
      // until the reader has arrived there and then scrolled away again.
      const lowest = Math.max(...reached.map((section) => section.top));
      const candidates = reached.filter((section) => lowest - section.top < TOLERANCE).map((section) => section.id);
      if (candidates.includes(chosen.current)) {
        arrived.current = true;
        return setActiveId(chosen.current);
      }
      if (arrived.current) {
        chosen.current = null;
        arrived.current = false;
      }
      setActiveId((current) => (candidates.includes(current) ? current : candidates[0]));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  const choose = useCallback((id) => {
    chosen.current = id;
    arrived.current = false;
    setActiveId(id);
  }, []);

  return [activeId, choose];
}
