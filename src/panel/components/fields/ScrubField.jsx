// ── SCRUB FIELD ───────────────────────────────────────────────────────────────
// A horizontal scrubbing input: drag left/right to change value.
// - Label on left, current value on right, inside a dark pill.
// - Subtle left-to-right fill tracks position in the range.
// - Bounce animation when the limit (min or max) is hit.
// - Tooltip on hover shows the hint string (no ? icon needed).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { usePanel } from "@/panel/PanelContext";
import { clamp } from "@/panel/lib/color";
import { PANEL_SETTING_PY } from "@/panel/lib/settingLayout";
import { cn } from "@/panel/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/panel/components/ui/tooltip";

function formatValue(value, step) {
  if (step >= 1) return String(Math.round(value));
  const decimals = Math.min(4, Math.max(2, Math.ceil(-Math.log10(step)) + 1));
  return Number(value).toFixed(decimals);
}

/**
 * @param {{
 *   label: string;
 *   value: number;
 *   onChange: (v: number) => void;
 *   min: number;
 *   max: number;
 *   step?: number;
 *   hint?: string;
 *   className?: string;
 * }} props
 */
export function ScrubField({ label, value, onChange, min, max, step = 0.01, hint, className }) {
  const { notifyChange } = usePanel();
  const barRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startVal = useRef(0);
  const barWidth = useRef(200);
  const atLimit = useRef(false);   // true while pointer is pinned at min or max
  const isInt = step >= 1;

  // Local copy so the display updates immediately during drag
  const [local, setLocal] = useState(value);
  const [bounce, setBounce] = useState({ active: false, dir: "left" });

  // Keep local in sync when value changes from outside (preset apply, reset, etc.)
  useEffect(() => {
    if (!isDragging.current) setLocal(value);
  }, [value]);

  const fillPct = Math.round(((local - min) / (max - min)) * 100);
  const display = formatValue(local, step);

  const commit = (raw, flush = false) => {
    const snapped = isInt ? Math.round(raw) : Math.round(raw / step) * step;
    const v = clamp(snapped, min, max);
    setLocal(v);
    onChange(v);
    if (flush) notifyChange();
  };

  const triggerBounce = (dir) => {
    // Each call flips active off then on so the animation restarts
    setBounce({ active: false, dir });
    requestAnimationFrame(() => setBounce({ active: true, dir }));
  };

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    e.preventDefault();
    barRef.current.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startVal.current = local;
    barWidth.current = barRef.current.getBoundingClientRect().width || 200;
    atLimit.current = false;
    isDragging.current = true;
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    const raw = startVal.current + (dx / barWidth.current) * (max - min);

    if (raw < min) {
      if (!atLimit.current) { atLimit.current = true; triggerBounce("left"); }
      commit(min);
    } else if (raw > max) {
      if (!atLimit.current) { atLimit.current = true; triggerBounce("right"); }
      commit(max);
    } else {
      atLimit.current = false;
      commit(raw);
    }
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    notifyChange();
  };

  return (
    <div className={cn(PANEL_SETTING_PY, className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={barRef}
            role="slider"
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={local}
            className={cn("scrub-field", bounce.active && `scrub-bounce-${bounce.dir}`)}
            style={{ "--fill-pct": `${fillPct}%` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onLostPointerCapture={onPointerUp}
            onAnimationEnd={() => setBounce((b) => ({ ...b, active: false }))}
          >
            <span className="scrub-field__label">{label}</span>
            <span className="scrub-field__value">{display}</span>
          </div>
        </TooltipTrigger>
        {hint ? (
          <TooltipContent side="top" className="max-w-[240px]">
            {hint}
          </TooltipContent>
        ) : null}
      </Tooltip>
    </div>
  );
}
