import { cn } from "@/panel/lib/utils";

/**
 * Section field label. hint prop is accepted but intentionally not shown
 * as a tooltip — labels are plain text only.
 */
export function FieldLabel({ children, hint: _hint, className }) {
  return (
    <span className={cn("type-label flex min-w-0 flex-1 truncate", className)}>
      {children}
    </span>
  );
}
