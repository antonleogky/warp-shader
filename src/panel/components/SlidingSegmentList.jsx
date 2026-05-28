import { useRef } from "react";
import { TabsList } from "@/panel/components/ui/tabs";
import { useSlidingSegmentIndicator } from "@/panel/hooks/useSlidingSegmentIndicator";
import { cn } from "@/panel/lib/utils";

/**
 * Segment track with a sliding pill indicator (iOS-style).
 */
export function SlidingSegmentList({
  activeValue,
  className,
  style,
  children,
  ...props
}) {
  const listRef = useRef(null);
  const indicator = useSlidingSegmentIndicator(listRef, activeValue);

  return (
    <TabsList
      ref={listRef}
      variant="segment"
      data-sliding-segment=""
      className={cn("relative", className)}
      style={style}
      {...props}
    >
      <span
        aria-hidden
        className="segment-slide-indicator pointer-events-none absolute top-1 bottom-1 rounded-full bg-background shadow-sm"
        style={{
          left: indicator.left,
          width: indicator.width,
          opacity: indicator.ready ? 1 : 0,
          // Suppress all transitions on first mount/remount so the pill
          // snaps to position instantly. CSS transitions re-enable one
          // frame later (see useSlidingSegmentIndicator).
          transition: indicator.skipTransition ? "none" : undefined,
        }}
      />
      {children}
    </TabsList>
  );
}
