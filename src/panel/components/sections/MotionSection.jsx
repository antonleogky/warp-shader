import { usePanel } from "@/panel/PanelContext";
import { FieldGroup } from "@/panel/components/fields/FieldGroup";
import { ScrubField } from "@/panel/components/fields/ScrubField";
import { SETTING_HINTS } from "@/panel/lib/settingHints";

export function MotionSection({ sectionId = "motion" }) {
  const { params } = usePanel();

  return (
    <>
      <FieldGroup
        sectionId={sectionId}
        title="Loop"
        hint="Timing and how streaks travel along each beam."
      >
        <ScrubField
          label="Loop speed"
          hint={SETTING_HINTS.loopSpeed}
          min={0.05} max={2} step={0.01}
          value={params.speed}
          onChange={(v) => { params.speed = v; }}
        />
        <ScrubField
          label="Repeat period"
          hint={SETTING_HINTS.repeatPeriod}
          min={0.1} max={0.6} step={0.01}
          value={params.repeatPeriod}
          onChange={(v) => { params.repeatPeriod = v; }}
        />
        <ScrubField
          label="Streak length"
          hint={SETTING_HINTS.streakLength}
          min={0.03} max={0.25} step={0.005}
          value={params.streakLength}
          onChange={(v) => { params.streakLength = v; }}
        />
      </FieldGroup>

      <FieldGroup title="Spin" hint="Rotation applied to a subset of beams over time.">
        <ScrubField
          label="Spin speed"
          hint={SETTING_HINTS.jitterSpin}
          min={0} max={2} step={0.01}
          value={params.jitterSpin}
          onChange={(v) => { params.jitterSpin = v; }}
        />
        <ScrubField
          label="Spin beams"
          hint={SETTING_HINTS.jitterSpinMix}
          min={0} max={1} step={0.01}
          value={params.jitterSpinMix}
          onChange={(v) => { params.jitterSpinMix = v; }}
        />
      </FieldGroup>
    </>
  );
}
