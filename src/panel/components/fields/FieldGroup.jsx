import { RotateCcw } from "lucide-react";
import { SECTION_META } from "@/panel/lib/presets";
import { Button } from "@/panel/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/panel/components/ui/tooltip";
import { usePanel } from "@/panel/PanelContext";
import { cn } from "@/panel/lib/utils";

function SectionResetButton({ sectionId }) {
  const { actions } = usePanel();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="type-caption h-7 shrink-0 gap-1 rounded-full px-2 shadow-none"
          onClick={() => actions.onResetSection?.(sectionId)}
        >
          <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
          Reset
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-[200px]">
        Restore defaults for this section only
      </TooltipContent>
    </Tooltip>
  );
}

/** Subheading within a section tab; optional reset when `sectionId` is set. */
export function FieldGroup({
  title,
  hint,
  sectionId,
  children,
  className,
}) {
  const meta = sectionId ? SECTION_META[sectionId] : null;
  const heading = title ?? meta?.title;
  const subtitle = hint ?? meta?.description;

  return (
    <div className={cn("border-b border-border/70 py-2.5 last:border-b-0", className)}>
      <div className="mb-2 flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          {heading ? <p className="type-overline">{heading}</p> : null}
          {subtitle ? (
            <p className="type-caption mt-0.5 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {sectionId ? <SectionResetButton sectionId={sectionId} /> : null}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
