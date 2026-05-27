import { useEffect, useRef, useState } from "react";
import { Input } from "@/panel/components/ui/input";
import { Slider } from "@/panel/components/ui/slider";
import { usePanel } from "@/panel/PanelContext";
import { clamp } from "@/panel/lib/color";
import { PANEL_SETTING_ROW } from "@/panel/lib/settingLayout";
import { cn } from "@/panel/lib/utils";
import { FieldLabel } from "@/panel/components/fields/FieldLabel";

function formatDisplay(value, step) {
  if (step >= 1) return Math.round(value);
  const decimals = Math.min(5, Math.max(2, Math.ceil(-Math.log10(step)) + 1));
  return Number(Number(value).toFixed(decimals));
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  hint,
  className,
}) {
  const { notifyChange } = usePanel();
  const isInt = step >= 1;
  const formatted = formatDisplay(value, step);
  const [text, setText] = useState(String(formatted));
  const [live, setLive] = useState(Number(formatted));
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!draggingRef.current) {
      const next = Number(formatted);
      setLive(next);
      setText(String(formatted));
    }
  }, [formatted]);

  const apply = (raw, { flush = false } = {}) => {
    const n = Number(raw);
    if (Number.isNaN(n)) {
      setText(String(formatDisplay(live, step)));
      return;
    }
    const v = clamp(n, min, max);
    const next = isInt ? Math.round(v) : v;
    setLive(next);
    onChange(next);
    setText(String(formatDisplay(next, step)));
    if (flush) notifyChange();
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    notifyChange();
  };

  return (
    <div
      className={cn(
        PANEL_SETTING_ROW,
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <FieldLabel hint={hint}>{label}</FieldLabel>
        <Input
          type="text"
          inputMode="decimal"
          data-setting-value=""
          className="panel-setting-input type-mono h-8 w-[5.25rem] min-w-[5.25rem] shrink-0 border-0 bg-transparent px-1.5 text-right shadow-none focus-visible:border-0 focus-visible:ring-0"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => apply(text, { flush: true })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              apply(text, { flush: true });
              e.currentTarget.blur();
            }
          }}
        />
      </div>
      <Slider
        aria-label={label}
        value={[live]}
        min={min}
        max={max}
        step={step}
        data-panel-slider-dragging={dragging ? "" : undefined}
        onPointerDown={() => {
          draggingRef.current = true;
          setDragging(true);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onValueChange={([v]) => apply(v, { flush: false })}
        className="panel-slider w-full py-0"
      />
    </div>
  );
}
