import { useEffect, useState } from "react";
import { BackgroundSection } from "@/panel/components/sections/BackgroundSection";
import { MotionSection } from "@/panel/components/sections/MotionSection";
import { ShapeSection } from "@/panel/components/sections/ShapeSection";
import { ColorSection } from "@/panel/components/sections/ColorSection";
import { ExportBar } from "@/panel/components/ExportBar";
import { SegmentedControl } from "@/panel/components/SegmentedControl";
import { SlidingSegmentList } from "@/panel/components/SlidingSegmentList";
import { Tabs, TabsContent, TabsTrigger } from "@/panel/components/ui/tabs";
import { usePanel } from "@/panel/PanelContext";
import { PRESET_OPTIONS, detectLookPreset } from "@/panel/lib/presets";
import { cn } from "@/panel/lib/utils";

const SECTIONS = [
  { id: "background", label: "Bg", Panel: BackgroundSection },
  { id: "color", label: "Color", Panel: ColorSection },
  { id: "motion", label: "Motion", Panel: MotionSection },
  { id: "shape", label: "Shape", Panel: ShapeSection },
];

export function DesignSidebar() {
  const { params, actions } = usePanel();
  const [section, setSection] = useState("background");
  const [activeLook, setActiveLook] = useState(() => detectLookPreset(params));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
  }, []);

  return (
    <div className={cn("flex h-full flex-col", ready && "panel--ready")}>
      <header
        className="panel-stagger px-5 pb-3 pt-5"
        style={{ "--stagger-index": 0 }}
      >
        <h1 className="type-display">Warp Shader</h1>
      </header>

      <div className="panel-stagger" style={{ "--stagger-index": 1 }}>
        <ExportBar />
      </div>

      <Tabs
        value={section}
        defaultValue="background"
        onValueChange={setSection}
        className={cn(
          "panel-stagger flex min-h-0 flex-1 flex-col gap-0",
          "data-[orientation=horizontal]:flex-col"
        )}
        style={{ "--stagger-index": 2 }}
      >
        <div className="border-b border-border px-5 py-3" style={{ backgroundColor: "var(--surface-mid)" }}>
          <SlidingSegmentList
            activeValue={section}
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${SECTIONS.length}, minmax(0, 1fr))`,
            }}
          >
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.label}
              </TabsTrigger>
            ))}
          </SlidingSegmentList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3">
          {SECTIONS.map((s) => (
            <TabsContent
              key={s.id}
              value={s.id}
              className="panel-section-in mt-0 outline-none"
            >
              <s.Panel sectionId={s.id} />
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <footer
        className="panel-stagger shrink-0 border-t border-border bg-background px-5 py-4"
        style={{ "--stagger-index": 4 }}
      >
        <p className="type-overline mb-2">Looks</p>
        <SegmentedControl
          value={activeLook}
          onValueChange={(id) => {
            actions.onApplyPreset?.(id);
            setActiveLook(id);
          }}
          options={PRESET_OPTIONS.map((p) => ({
            value: p.id,
            label: p.label,
          }))}
        />
        <p className="type-caption mt-3 text-center">
          <kbd className="type-mono-muted rounded-full border border-border bg-muted/50 px-2 py-0.5">
            R
          </kbd>{" "}
          record ·{" "}
          <kbd className="type-mono-muted rounded-full border border-border bg-muted/50 px-2 py-0.5">
            S
          </kbd>{" "}
          save JSON
        </p>
      </footer>
    </div>
  );
}
