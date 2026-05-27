import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/panel/components/ui/tooltip";
import { cn } from "@/panel/lib/utils";

export function FieldLabel({ children, hint, className }) {
  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-1.5", className)}>
      <span className="type-label truncate">{children}</span>
      {hint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="panel-tap inline-flex shrink-0 rounded-full text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              aria-label={`About ${children}`}
            >
              <CircleHelp className="size-3.5" strokeWidth={2} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px]">
            {hint}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
