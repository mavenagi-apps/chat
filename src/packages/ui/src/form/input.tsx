import { forwardRef } from "react";
import { cn } from "@magi/ui";

export const Input = forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>((props, ref) => {
  return (
    <input
      ref={ref}
      className={cn(baseInputStyles, props.className)}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const baseInputStyles = [
  // Basic layout
  "relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3])-1px)] py-[calc(theme(spacing[1.5])-1px)]",

  // Typography
  "text-sm/[21px] text-zinc-950 placeholder:text-zinc-500",

  // Border
  "border border-zinc-950/10 data-[hover]:border-zinc-950/20",

  // Background color
  "bg-transparent",

  // Hide default focus styles
  "focus:outline-none",

  // Invalid state
  "data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500",

  // Disabled state
  "data-[disabled]:border-zinc-950/20",
];
