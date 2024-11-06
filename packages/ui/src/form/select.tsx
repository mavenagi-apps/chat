"use client";

import {
  Select as HeadlessSelect,
  type SelectProps as HeadlessSelectProps,
} from "@headlessui/react";
import { clsx } from "clsx";

import { cn } from "../lib/utils";
import { asControlledComponent } from "./as-controlled-component";

type SelectProps = HeadlessSelectProps;
export const Select = asControlledComponent<SelectProps, true>(
  ({ className, multiple, ...props }) => {
    return (
      <span
        data-slot="control"
        className={cn([
          // Basic layout
          "group relative block w-full",

          // Background color
          "bg-gray-50",

          // Focus ring
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:has-[[data-focus]]:ring-2 sm:after:has-[[data-focus]]:ring-violet-700",

          // Disabled state
          "has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-zinc-950/5 before:has-[[data-disabled]]:shadow-none",
          className,
        ])}
      >
        <HeadlessSelect
          multiple={multiple}
          {...props}
          className={clsx([
            // Basic layout
            "relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[1.5])-1px)] data-[hover]:cursor-pointer",

            // Horizontal padding
            multiple
              ? "px-[calc(theme(spacing.3)-1px)]"
              : "pl-[calc(theme(spacing.3)-1px)] pr-[calc(theme(spacing.9)-1px)]",

            // Options (multi-select)
            "[&_optgroup]:font-semibold",

            // Typography
            "text-sm/6 text-zinc-950 placeholder:text-zinc-500 dark:text-white dark:*:text-white",

            "bg-transparent",

            // Border
            "border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20",

            // Hide default focus styles
            "focus:outline-none",

            // Invalid state
            "data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:dark:border-red-600 data-[invalid]:data-[hover]:dark:border-red-600",

            // Disabled state
            "data-[disabled]:border-zinc-950/20 data-[disabled]:opacity-100 dark:data-[hover]:data-[disabled]:border-white/15 data-[disabled]:dark:border-white/15 data-[disabled]:dark:bg-white/[2.5%]",
          ])}
        />
        {!multiple && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="size-5 stroke-zinc-500 group-has-[[data-disabled]]:stroke-zinc-600 sm:size-4 dark:stroke-zinc-400 forced-colors:stroke-[CanvasText]"
              viewBox="0 0 16 16"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M5.75 10.75L8 13L10.25 10.75"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.25 5.25L8 3L5.75 5.25"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </span>
    );
  },
);
