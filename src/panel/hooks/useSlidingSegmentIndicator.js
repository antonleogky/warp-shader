import { useLayoutEffect, useRef, useState } from "react";

/**
 * Tracks the position of the active segment pill and returns indicator state.
 *
 * Two effects are used deliberately:
 *  1. Mount / activeKey change — measures the active tab and updates position.
 *     On first mount the update is immediate (no animation). On subsequent
 *     tab changes the state update is deferred one rAF so the browser paints
 *     the old position first, giving the CSS transition something to animate.
 *  2. Resize — snaps the pill instantly (no animation) on container resize.
 *
 * @param {React.RefObject<HTMLElement | null>} listRef
 * @param {string} activeKey
 */
export function useSlidingSegmentIndicator(listRef, activeKey) {
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
    // Suppress transitions on first paint so the pill appears at the correct
    // position instantly. Cleared one frame later via rAF.
    skipTransition: true,
  });

  const initializedRef = useRef(false);

  // ── Mount + tab change ──────────────────────────────────────────────────
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const active = list.querySelector(
      '[data-slot="tabs-trigger"][data-state="active"]'
    );
    if (!active) return;

    // Capture measurements while DOM is in layout phase (offsetLeft is exact)
    const newLeft  = active.offsetLeft;
    const newWidth = active.offsetWidth;

    if (!initializedRef.current) {
      // First render: snap to position instantly, then re-enable transitions.
      initializedRef.current = true;
      setIndicator({ left: newLeft, width: newWidth, ready: true, skipTransition: true });
      const id = requestAnimationFrame(() =>
        setIndicator((prev) => ({ ...prev, skipTransition: false }))
      );
      return () => cancelAnimationFrame(id);
    }

    // Subsequent tab changes: defer the state update one frame.
    // The browser paints the OLD pill position first; the next frame applies
    // the new position and the CSS transition animates between them.
    const id = requestAnimationFrame(() =>
      setIndicator((prev) => ({ ...prev, left: newLeft, width: newWidth }))
    );
    return () => cancelAnimationFrame(id);
  }, [listRef, activeKey]);

  // ── Resize: snap instantly, no animation ────────────────────────────────
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const snapToActive = () => {
      const active = list.querySelector(
        '[data-slot="tabs-trigger"][data-state="active"]'
      );
      if (!active) return;
      setIndicator((prev) => ({
        ...prev,
        left:  active.offsetLeft,
        width: active.offsetWidth,
      }));
    };

    const observer = new ResizeObserver(snapToActive);
    observer.observe(list);
    window.addEventListener("resize", snapToActive);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", snapToActive);
      // Reset on unmount so a remount treats itself as a fresh first render.
      initializedRef.current = false;
    };
  }, [listRef]);

  return indicator;
}
