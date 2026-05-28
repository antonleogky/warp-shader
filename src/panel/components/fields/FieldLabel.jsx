import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/panel/components/ui/tooltip";
import { cn } from "@/panel/lib/utils";

/**
 * Section field label. Shows a tooltip on hover when `hint` is provided.
 * No ? icon — the label itself is the hover target.
 */
export function FieldLabel({ children, hint, className }) {
  const label = (
    <span className={cn("type-label flex min-w-0 flex-1 truncate", className)}>
      {children}
    </span>
  );

  if (!hint) return label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "type-label flex min-w-0 flex-1 cursor-default truncate",
            className
          )}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px]">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}
