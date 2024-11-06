"use client";

import {
  Popover as HeadlessPopover,
  PopoverButton as HeadlessPopoverButton,
  type PopoverButtonProps as HeadlessPopoverButtonProps,
  PopoverPanel as HeadlessPopoverPanel,
  type PopoverPanelProps as HeadlessPopoverPanelProps,
  type PopoverProps as HeadlessPopoverProps,
} from "@headlessui/react";
import { type ElementType } from "react";

import { Button } from "./button";
import { cn } from "./lib/utils";

export type PopoverProps = HeadlessPopoverProps;
export const Popover = ({ ...props }: PopoverProps) => {
  return <HeadlessPopover {...props} />;
};

export const PopoverButton = <TTag extends ElementType = typeof Button>({
  as,
  ...props
}: HeadlessPopoverButtonProps<TTag>) => {
  // @ts-expect-error `as`
  return <HeadlessPopoverButton as={as ?? Button} {...props} />;
};

export type PopoverPanelProps = HeadlessPopoverPanelProps;
export const PopoverPanel = ({
  className,
  anchor,
  ...props
}: PopoverPanelProps) => {
  return (
    <HeadlessPopoverPanel
      anchor={{
        ...(anchor as any),
        gap: (anchor as any)?.gap ?? 10,
        to: (anchor as any)?.to ?? "bottom",
      }}
      className={cn(
        "isolate overflow-auto rounded-lg bg-white shadow outline outline-1 outline-transparent ring-1 ring-zinc-950/10 focus:outline-none dark:bg-gray-700 dark:ring-inset dark:ring-white/10",
        className,
      )}
      {...props}
    />
  );
};
