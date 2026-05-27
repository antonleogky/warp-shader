import { Tabs, TabsTrigger } from "@/panel/components/ui/tabs";
import { SlidingSegmentList } from "@/panel/components/SlidingSegmentList";
import { cn } from "@/panel/lib/utils";

/**
 * Segmented control with sliding pill indicator.
 */
export function SegmentedControl({
  value,
  defaultValue,
  onValueChange,
  options,
  className,
  listClassName,
  triggerClassName,
}) {
  const resolvedValue =
    value ?? defaultValue ?? options[0]?.value ?? "";

  return (
    <Tabs
      value={resolvedValue}
      onValueChange={onValueChange}
      className={cn("w-full flex-row gap-0", className)}
    >
      <SlidingSegmentList
        activeValue={resolvedValue}
        className={cn("grid w-full", listClassName)}
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((opt) => (
          <TabsTrigger key={opt.value} value={opt.value} className={triggerClassName}>
            {opt.label}
          </TabsTrigger>
        ))}
      </SlidingSegmentList>
    </Tabs>
  );
}
