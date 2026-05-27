import { useRef } from "react";
import { usePanel } from "@/panel/PanelContext";
import { FieldGroup } from "@/panel/components/fields/FieldGroup";
import { SliderField } from "@/panel/components/fields/SliderField";
import { ColorPopoverField } from "@/panel/components/fields/ColorPopoverField";
import { SegmentedControl } from "@/panel/components/SegmentedControl";
import { Button } from "@/panel/components/ui/button";
import { SETTING_HINTS } from "@/panel/lib/settingHints";
import {
  applyBackgroundMode,
  getBackgroundMode,
} from "@/panel/lib/backgroundMode";
import { PANEL_SETTING_ROW } from "@/panel/lib/settingLayout";
import { cn } from "@/panel/lib/utils";

export function BackgroundSection({ sectionId = "background" }) {
  const { params, notifyChange } = usePanel();
  const fileRef = useRef(null);
  const mode = getBackgroundMode(params);

  const patch = (partial) => {
    Object.assign(params, partial);
    notifyChange();
  };

  return (
    <>
      <FieldGroup
        sectionId={sectionId}
        title="Plate"
        hint="Solid fill, transparency, or a reference image behind the warp."
      >
        <div className="pb-0.5">
          <SegmentedControl
            value={mode}
            onValueChange={(v) => {
              applyBackgroundMode(params, v);
              if (v === "image" && !params.backgroundImageDataUrl) {
                fileRef.current?.click();
              }
              notifyChange();
            }}
            options={[
              { value: "color", label: "Color" },
              { value: "clear", label: "Clear" },
              { value: "image", label: "Image" },
            ]}
          />
        </div>

        {mode === "color" && (
          <>
            <ColorPopoverField
              label="Fill"
              hint={SETTING_HINTS.bgFill}
              color={params.backgroundColor}
              onColorChange={(hex) => patch({ backgroundColor: hex })}
            />
            <SliderField
              label="Opacity"
              hint={SETTING_HINTS.bgOpacity}
              min={0}
              max={100}
              step={1}
              value={Math.round((params.backgroundAlpha ?? 1) * 100)}
              onChange={(pct) => {
                params.backgroundAlpha = pct / 100;
              }}
            />
          </>
        )}

        {mode === "image" && (
          <div className={cn("space-y-2.5", PANEL_SETTING_ROW)}>
            {params.backgroundImageDataUrl ? (
              <div
                className={cn(
                  "h-[100px] w-full rounded-lg border border-border bg-cover bg-center shadow-sm"
                )}
                style={{
                  backgroundImage: `url(${params.backgroundImageDataUrl})`,
                }}
              />
            ) : (
              <div className="type-caption flex h-[100px] items-center justify-center rounded-[var(--radius-control)] border border-dashed border-border bg-muted/30">
                No image yet — upload below
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 flex-1 shadow-none"
                onClick={() => fileRef.current?.click()}
              >
                {params.backgroundImageDataUrl ? "Replace" : "Upload image"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 rounded-full"
                disabled={!params.backgroundImageDataUrl}
                onClick={() =>
                  patch({
                    backgroundImageDataUrl: "",
                    backgroundUseImage: false,
                  })
                }
              >
                Remove
              </Button>
            </div>
            <SliderField
              label="Image opacity"
              hint="How strongly the plate shows through behind the beams."
              min={0}
              max={100}
              step={1}
              value={Math.round((params.backgroundAlpha ?? 1) * 100)}
              onChange={(pct) => {
                params.backgroundAlpha = pct / 100;
              }}
            />
          </div>
        )}

        {mode === "clear" && (
          <p className="type-caption py-1 text-muted-foreground">
            Transparent plate — checkerboard shows through on export preview.
          </p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              patch({
                backgroundImageDataUrl: String(reader.result),
                backgroundUseImage: true,
              });
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
      </FieldGroup>
    </>
  );
}
