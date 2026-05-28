import { useLayoutEffect, useRef, useState } from "react";

/**
 * @param {React.RefObject<HTMLElement | null>} listRef
 * @param {string} activeKey
 */
export function useSlidingSegmentIndicator(listRef, activeKey) {
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
    // skipTransition: true on the very first measurement so the pill appears
    // at the correct position instantly (no left/width animation on mount or
    // remount). Cleared one frame later so subsequent segment clicks animate.
    skipTransition: false,
  });

  // Tracks whether this instance has already shown its first measurement.
  // Reset on unmount so a remount (e.g. switching back to the Bg tab) is
  // treated as a fresh mount and also skips the entry animation.
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector(
        '[data-slot="tabs-trigger"][data-state="active"]'
      );
      if (!active) return;

      const isFirst = !initializedRef.current;
      initializedRef.current = true;

      setIndicator({
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
        skipTransition: isFirst,
      });

      if (isFirst) {
        // Re-enable transitions after the first painted frame.
        const id = requestAnimationFrame(() => {
          setIndicator((prev) => ({ ...prev, skipTransition: false }));
        });
        return () => cancelAnimationFrame(id);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      // Reset so the next mount skips the entry animation too.
      initializedRef.current = false;
    };
  }, [listRef, activeKey]);

  return indicator;
}
