import { usePanel } from "@/panel/PanelContext";
import { FieldGroup } from "@/panel/components/fields/FieldGroup";
import { SliderField } from "@/panel/components/fields/SliderField";
import { FieldLabel } from "@/panel/components/fields/FieldLabel";
import { Button } from "@/panel/components/ui/button";
import { SETTING_HINTS } from "@/panel/lib/settingHints";
import { PANEL_SETTING_PY } from "@/panel/lib/settingLayout";
import { cn } from "@/panel/lib/utils";
import { Shuffle } from "lucide-react";

export function ShapeSection({ sectionId = "shape" }) {
  const { params, notifyChange } = usePanel();

  return (
    <>
      <FieldGroup
        sectionId={sectionId}
        title="Beams"
        hint="How many streaks, how thick, and the hole."
      >
        <SliderField
          label="Streak count"
          hint={SETTING_HINTS.streakCount}
          min={16}
          max={128}
          step={1}
          value={params.streakCount}
          onChange={(v) => {
            params.streakCount = v;
          }}
        />
        <SliderField
          label="Thickness"
          hint={SETTING_HINTS.thickness}
          min={0.004}
          max={0.06}
          step={0.001}
          value={params.thickness}
          onChange={(v) => {
            params.thickness = v;
          }}
        />
        <SliderField
          label="Corner radius"
          hint={SETTING_HINTS.cornerRadius}
          min={0}
          max={1}
          step={0.01}
          value={params.cornerRadius}
          onChange={(v) => {
            params.cornerRadius = v;
          }}
        />
        <SliderField
          label="Center void"
          hint={SETTING_HINTS.centerVoid}
          min={0}
          max={0.25}
          step={0.005}
          value={params.centerVoidRadius}
          onChange={(v) => {
            params.centerVoidRadius = v;
          }}
        />
      </FieldGroup>
      <FieldGroup title="Layout" hint="Static spread and random placement of beams.">
        <SliderField
          label="Angle scatter"
          hint={SETTING_HINTS.jitter}
          min={0}
          max={1}
          step={0.01}
          value={params.jitter}
          onChange={(v) => {
            params.jitter = v;
          }}
        />
        <SliderField
          label="Seed"
          hint={SETTING_HINTS.seed}
          min={0}
          max={100}
          step={0.1}
          value={params.seed}
          onChange={(v) => {
            params.seed = v;
          }}
        />
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            PANEL_SETTING_PY
          )}
        >
          <FieldLabel hint="Pick a new random arrangement without changing colors.">
            Layout
          </FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-3 shadow-none"
            onClick={() => {
              params.seed = Math.round(Math.random() * 1000) / 10;
              notifyChange();
            }}
          >
            <Shuffle className="size-3.5" />
            Shuffle
          </Button>
        </div>
      </FieldGroup>
    </>
  );
}
