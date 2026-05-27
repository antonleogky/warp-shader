import { useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { FieldLabel } from "@/panel/components/fields/FieldLabel";
import { Label } from "@/panel/components/ui/label";
import { Input } from "@/panel/components/ui/input";
import { Button } from "@/panel/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/panel/components/ui/popover";
import {
  clamp,
  hexToRgba,
  normalizeHex,
  rgbaToHex,
} from "@/panel/lib/color";
import { PANEL_SETTING_PY } from "@/panel/lib/settingLayout";
import { cn } from "@/panel/lib/utils";

export function ColorPopoverField({
  label,
  hint,
  color,
  alpha,
  onColorChange,
  onAlphaChange,
  showAlpha = false,
  compact = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const hex = normalizeHex(color ?? "#ffffff") ?? "#ffffff";
  const rgba = useMemo(
    () => hexToRgba(hex, alpha ?? 1),
    [hex, alpha]
  );

  const applyHex = (next) => {
    const norm = normalizeHex(next);
    if (norm) onColorChange(norm);
  };

  const applyChannel = (key, raw) => {
    if (key === "a" && onAlphaChange) {
      onAlphaChange(clamp(Number(raw), 0, 100) / 100);
      return;
    }
    const n = clamp(Math.round(Number(raw)), 0, 255);
    const next = { ...rgba, [key]: n };
    applyHex(rgbaToHex(next.r, next.g, next.b));
  };

  const picker = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {compact ? (
          <button
            type="button"
            className="panel-tap size-9 shrink-0 rounded-[var(--radius-control)] border border-border shadow-sm transition-[box-shadow,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{
              backgroundColor: hex,
              opacity: showAlpha ? (alpha ?? 1) : 1,
            }}
            aria-label={`Color ${hex}`}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            className="type-mono h-9 gap-2 rounded-full px-3 font-normal uppercase shadow-none"
          >
            <span
              className="size-5 shrink-0 rounded-full border border-border"
              style={{
                backgroundColor: hex,
                opacity: showAlpha ? (alpha ?? 1) : 1,
              }}
            />
            <span className="type-caption uppercase">
              {hex.replace("#", "")}
            </span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] rounded-[var(--radius-shell)] p-3"
        align={compact ? "center" : "end"}
      >
        <div className="space-y-3">
          <div className="[&_.react-colorful]:h-[160px] [&_.react-colorful]:w-full [&_.react-colorful]:rounded-[var(--radius-control)]">
            <HexColorPicker color={hex} onChange={applyHex} />
          </div>
          <div className="flex items-center gap-2">
            <span className="type-caption">#</span>
            <Input
              data-setting-value=""
              className="panel-setting-input type-mono border-0 bg-transparent uppercase shadow-none focus-visible:border-0 focus-visible:ring-0"
              value={hex.replace("#", "")}
              onChange={(e) => applyHex(`#${e.target.value}`)}
              spellCheck={false}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["r", "g", "b", ...(showAlpha ? ["a"] : [])]).map((ch) => (
              <div key={ch} className="space-y-1">
                <Label className="type-overline normal-case">{ch}</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  data-setting-value=""
                  className="panel-setting-input type-mono h-8 border-0 bg-transparent px-1.5 shadow-none focus-visible:border-0 focus-visible:ring-0"
                  min={ch === "a" ? 0 : 0}
                  max={ch === "a" ? 100 : 255}
                  value={rgba[ch]}
                  onChange={(e) => applyChannel(ch, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (compact) {
    return <div className={className}>{picker}</div>;
  }

  return (
    <div
      className={cn(
        cn("flex items-center justify-between gap-3", PANEL_SETTING_PY),
        className
      )}
    >
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {picker}
    </div>
  );
}
