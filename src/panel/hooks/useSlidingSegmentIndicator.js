import { useLayoutEffect, useState } from "react";

/**
 * @param {React.RefObject<HTMLElement | null>} listRef
 * @param {string} activeKey
 */
export function useSlidingSegmentIndicator(listRef, activeKey) {
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector(
        '[data-slot="tabs-trigger"][data-state="active"]'
      );
      if (!active) return;
      setIndicator({
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [listRef, activeKey]);

  return indicator;
}
