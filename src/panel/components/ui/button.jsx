import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/panel/lib/utils";

/** @see https://ui.shadcn.com/docs/components/radix/button */
const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap outline-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "type-control h-10 rounded-full px-5 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-full px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "type-control h-9 gap-1.5 rounded-full px-4 has-[>svg]:px-3",
        lg: "type-control h-11 rounded-full px-6 has-[>svg]:px-5",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
      tap: {
        true: "panel-tap",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      tap: true,
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  tap = true,
  asChild = false,
  static: isStatic = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({
          variant,
          size,
          tap: tap && !isStatic,
          className,
        })
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
