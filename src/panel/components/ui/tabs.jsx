import * as React from "react";
import { cva } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/panel/lib/utils";

/** @see https://ui.shadcn.com/docs/components/radix/tabs */

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default:
          "h-9 rounded-lg bg-muted p-[3px] group-data-[orientation=vertical]/tabs:h-fit",
        line: "h-9 gap-1 rounded-none bg-transparent group-data-[orientation=vertical]/tabs:h-fit",
        segment:
          "segment-track h-10 w-full gap-0 rounded-full bg-muted/60 p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TabsList = React.forwardRef(function TabsList(
  { className, variant = "default", ...props },
  ref
) {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
});

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        /* default + line */
        "flex-1 border border-transparent px-2 py-1 text-sm font-medium text-foreground/60 transition-all",
        "group-data-[variant=default]/tabs-list:h-[calc(100%-1px)] group-data-[variant=line]/tabs-list:h-[calc(100%-1px)]",
        "group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=line]/tabs-list:rounded-md",
        "hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm",
        "dark:group-data-[variant=default]/tabs-list:data-[state=active]:border-input dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-input/30",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bg-foreground group-data-[variant=line]/tabs-list:after:opacity-0 group-data-[variant=line]/tabs-list:after:transition-opacity",
        "group-data-[orientation=horizontal]/tabs:group-data-[variant=line]/tabs-list:after:inset-x-0 group-data-[orientation=horizontal]/tabs:group-data-[variant=line]/tabs-list:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:group-data-[variant=line]/tabs-list:after:h-0.5",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        /* segment — fills track inset; no fixed h-9 or outer shadow */
        "group-data-[variant=segment]/tabs-list:panel-pill group-data-[variant=segment]/tabs-list:type-control",
        "group-data-[variant=segment]/tabs-list:segment-trigger group-data-[variant=segment]/tabs-list:min-w-0 group-data-[variant=segment]/tabs-list:flex-1",
        "group-data-[variant=segment]/tabs-list:rounded-full group-data-[variant=segment]/tabs-list:truncate group-data-[variant=segment]/tabs-list:border-0 group-data-[variant=segment]/tabs-list:px-2.5 group-data-[variant=segment]/tabs-list:py-0",
        "group-data-[variant=segment]/tabs-list:text-sm group-data-[variant=segment]/tabs-list:font-medium group-data-[variant=segment]/tabs-list:shadow-none",
        "group-data-[variant=segment]/tabs-list:text-muted-foreground group-data-[variant=segment]/tabs-list:hover:text-foreground",
        "group-data-[variant=segment]/tabs-list:relative group-data-[variant=segment]/tabs-list:z-[1]",
        "group-data-[variant=segment]/tabs-list:bg-transparent group-data-[variant=segment]/tabs-list:data-[state=active]:bg-transparent",
        "group-data-[variant=segment]/tabs-list:data-[state=active]:text-foreground group-data-[variant=segment]/tabs-list:data-[state=active]:shadow-none",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
