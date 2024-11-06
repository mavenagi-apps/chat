"use client";

import { HiInformationCircle } from "react-icons/hi";

import { Popover, PopoverButton, PopoverPanel } from "./popover";

export type TooltipProps = {
  description: string;
  className?: string;
  anchor?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top start"
    | "top end"
    | "right start"
    | "right end"
    | "bottom start"
    | "bottom end"
    | "left start"
    | "left end"
    | undefined;
};
export const Tooltip = ({ description, className, anchor }: TooltipProps) => {
  return (
    <Popover className={className}>
      <PopoverButton
        variant="secondary"
        className="rounded-lg border-0 text-gray-400 hover:bg-gray-100"
      >
        <HiInformationCircle />
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: anchor }}
        className="max-w-[300px] p-4 text-xs/[18px] font-normal text-gray-700"
      >
        {description}
      </PopoverPanel>
    </Popover>
  );
};
