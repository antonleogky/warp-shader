import { usePanel } from "@/panel/PanelContext";
import { FieldGroup } from "@/panel/components/fields/FieldGroup";
import { SliderField } from "@/panel/components/fields/SliderField";
import { ColorPopoverField } from "@/panel/components/fields/ColorPopoverField";
import { FieldLabel } from "@/panel/components/fields/FieldLabel";
import { MAX_BEAM_COLORS, clamp, normalizeHex } from "@/panel/lib/color";
import { SETTING_HINTS } from "@/panel/lib/settingHints";
import { PANEL_SETTING_ROW } from "@/panel/lib/settingLayout";
import { cn } from "@/panel/lib/utils";

export function ColorSection({ sectionId = "color" }) {
  const { params, notifyChange, tick } = usePanel();

  const count = clamp(
    Math.round(params.beamColorCount ?? 4),
    1,
    MAX_BEAM_COLORS
  );

  const setBeamColor = (index, hex) => {
    if (!params.beamColors) params.beamColors = [];
    params.beamColors[index] = hex;
    notifyChange();
  };

  return (
    <>
      <FieldGroup
        sectionId={sectionId}
        title="Palette"
        hint="Which colors beams draw from."
      >
        <SliderField
          label="Active colors"
          hint={SETTING_HINTS.activeColors}
          min={1}
          max={MAX_BEAM_COLORS}
          step={1}
          value={count}
          onChange={(v) => {
            params.beamColorCount = v;
          }}
        />
        <div className={PANEL_SETTING_ROW}>
          <FieldLabel hint="Tap a swatch to edit that beam color." className="mb-2">
            Beam colors
          </FieldLabel>
          <div
            key={`beams-${tick}-${count}`}
            className={cn(
              "grid gap-3",
              count <= 2 && "grid-cols-2",
              count === 3 && "grid-cols-3",
              count >= 4 && "grid-cols-4"
            )}
          >
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="type-caption font-medium">{i + 1}</span>
                <ColorPopoverField
                  compact
                  color={
                    normalizeHex(params.beamColors?.[i] ?? "#ffffff") ??
                    "#ffffff"
                  }
                  onColorChange={(hex) => setBeamColor(i, hex)}
                />
              </div>
            ))}
          </div>
        </div>
      </FieldGroup>
      <FieldGroup title="Grade" hint="Overall intensity and glow after compositing.">
        <SliderField
          label="Brightness"
          hint={SETTING_HINTS.brightness}
          min={0.2}
          max={2.5}
          step={0.01}
          value={params.brightness}
          onChange={(v) => {
            params.brightness = v;
          }}
        />
        <SliderField
          label="Core white"
          hint={SETTING_HINTS.coreWhite}
          min={0}
          max={1}
          step={0.01}
          value={params.coreWhite}
          onChange={(v) => {
            params.coreWhite = v;
          }}
        />
        <SliderField
          label="Bloom"
          hint={SETTING_HINTS.bloom}
          min={0}
          max={2}
          step={0.01}
          value={params.bloomStrength}
          onChange={(v) => {
            params.bloomStrength = v;
          }}
        />
        <SliderField
          label="Exposure"
          hint={SETTING_HINTS.exposure}
          min={0.3}
          max={2.5}
          step={0.01}
          value={params.exposure}
          onChange={(v) => {
            params.exposure = v;
          }}
        />
        <SliderField
          label="Vignette"
          hint={SETTING_HINTS.vignette}
          min={0}
          max={1}
          step={0.01}
          value={params.vignette}
          onChange={(v) => {
            params.vignette = v;
          }}
        />
      </FieldGroup>
    </>
  );
}
