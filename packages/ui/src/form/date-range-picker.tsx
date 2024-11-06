"use client";

import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import React, { type ComponentProps, useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { z } from "zod";

import { Button } from "../button";
import { Calendar } from "../calendar";
import {
  Dropdown,
  DropdownButton,
  DropdownHeading,
  DropdownMenu,
  DropdownRadioItem,
  DropdownSection,
} from "../dropdown";
import { cn } from "../lib/utils";
import { asControlledComponent } from "./as-controlled-component";
import { Input } from "./input";

export enum DateRangeFixedValues {
  LAST_24_HOURS = "LAST_24_HOURS",
  LAST_14_DAYS = "LAST_14_DAYS",
  LAST_30_DAYS = "LAST_30_DAYS",
  LAST_90_DAYS = "LAST_90_DAYS",
}

export const dateRangeValueSchema = z.union([
  z.nativeEnum(DateRangeFixedValues),
  z.object({
    from: z.date(),
    to: z.date(),
  }),
]);

interface SimpleDateRange {
  from?: Date | null;
  to?: Date | null;
}

/**
 * Convert a `DateRangeValues` to a `DateRange`.
 * Use this when you are manipulating the date range values in a headless context,
 * otherwise, simply make use of `useDateRangePicker`.
 * @param value The value to convert.
 */
export const toDateRange = (value: DateRangeValues): DateRange => {
  if (typeof value === "string") {
    return {
      from: (() => {
        const date = new Date();
        switch (value) {
          case DateRangeFixedValues.LAST_24_HOURS:
            date.setDate(date.getDate() - 1);
            break;
          case DateRangeFixedValues.LAST_14_DAYS:
            date.setDate(date.getDate() - 14);
            break;
          case DateRangeFixedValues.LAST_30_DAYS:
            date.setDate(date.getDate() - 30);
            break;
          case DateRangeFixedValues.LAST_90_DAYS:
            date.setDate(date.getDate() - 90);
            break;
        }
        return date;
      })(),
      to: new Date(),
    };
  } else {
    return value;
  }
};

export type DateRangeValues = z.infer<typeof dateRangeValueSchema>;

/**
 * This should be used in conjunction with `useDateRangePicker`
 * @param range The range from the result of `useDateRangePicker`.
 * @param setRange The setter from `useDateRangePicker`.
 */
const useDateRangeEffect = (
  range: DateRangeValues | undefined,
  setRange?: (range: DateRange | undefined) => void,
): void => {
  useEffect(() => {
    const dateRange = range ? toDateRange(range) : undefined;
    setRange?.(dateRange);
  }, [range]);
};

export const useDateRangePicker = (
  initialState: SimpleDateRange,
  hooks?: {
    onChange?: (range: DateRange | undefined) => void;
  },
) => {
  const { from, to } = initialState;
  const [range, setRange] = useState<DateRangeValues | undefined>(
    from && to ? { from, to } : undefined,
  );
  useDateRangeEffect(range, hooks?.onChange);
  return [range, setRange] as const;
};

export type DateRangePickerProps = {
  value?: DateRangeValues;
  onChange?: (date: DateRangeValues | undefined) => void;
  disabled?: boolean;
  label?: string;
  heading?: string;
  anchor?: ComponentProps<typeof DropdownMenu>["anchor"];
};
export const DateRangePicker = asControlledComponent(
  ({
    value,
    onChange,
    disabled,
    label = "Date",
    heading,
    anchor,
  }: DateRangePickerProps) => {
    const [showCalendar, setShowCalendar] = useState(false);

    const [range, setRange] = useState<DateRange | undefined>(
      typeof value !== "string" ? value : undefined,
    );

    return (
      <div data-slot="control" data-testid="date-range-picker">
        <Dropdown>
          {({ close }) => (
            <>
              <DropdownButton
                variant="secondary"
                disabled={disabled}
                onClick={() => setShowCalendar(false)}
                className="w-full justify-start"
              >
                <CalendarIcon />
                <span className="flex-1">
                  {typeof value === "string"
                    ? {
                        LAST_24_HOURS: "Last 24 hours",
                        LAST_14_DAYS: "Last 14 days",
                        LAST_30_DAYS: "Last 30 days",
                        LAST_90_DAYS: "Last 90 days",
                      }[value]
                    : typeof value === "object"
                      ? `${range?.from ? `${format(range.from, "PP")} -` : ""}${range?.to ? ` ${format(range.to, "PP")}` : ""}`
                      : label}
                </span>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu anchor={anchor}>
                <DropdownSection>
                  {showCalendar ? (
                    <>
                      <DropdownHeading>Custom date/range</DropdownHeading>
                      <div
                        className={cn(
                          "focus:outline-none",
                          "text-left text-sm/6 text-zinc-950 dark:text-white",
                          "col-span-full items-stretch",
                          "flex flex-col gap-2 p-3",
                        )}
                      >
                        <Input
                          icon={CalendarIcon}
                          value={`${range?.from ? `${format(range.from, "PP")} -` : ""}${range?.to ? ` ${format(range.to, "PP")}` : ""}`}
                          readOnly
                        />
                        <div className="flex flex-col items-stretch gap-2 p-4">
                          <Calendar
                            mode="range"
                            defaultMonth={range?.from ?? new Date()}
                            initialFocus
                            selected={range}
                            onSelect={setRange}
                          />
                          <div className="flex flex-row items-center gap-2">
                            <Button
                              className="flex-1"
                              variant="secondary"
                              onClick={() => {
                                setShowCalendar(false);
                                setRange(undefined);
                                onChange?.(undefined);
                                close();
                              }}
                            >
                              Clear
                            </Button>
                            <Button
                              className="flex-1"
                              variant="primary"
                              onClick={() => {
                                setShowCalendar(false);
                                onChange?.(
                                  range?.from !== undefined &&
                                    range?.to !== undefined
                                    ? {
                                        from: range.from,
                                        to: range.to,
                                      }
                                    : undefined,
                                );
                                close();
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {heading && <DropdownHeading>{heading}</DropdownHeading>}
                      {(
                        [
                          [DateRangeFixedValues.LAST_24_HOURS, "Last 24 hours"],
                          [DateRangeFixedValues.LAST_14_DAYS, "Last 14 days"],
                          [DateRangeFixedValues.LAST_30_DAYS, "Last 30 days"],
                          [DateRangeFixedValues.LAST_90_DAYS, "Last 90 days"],
                        ] as const
                      ).map(([key, label]) => (
                        <DropdownRadioItem
                          key={key}
                          checked={value === key}
                          onClick={() => {
                            value === key
                              ? onChange?.(undefined)
                              : onChange?.(key);
                          }}
                        >
                          {label}
                        </DropdownRadioItem>
                      ))}

                      <DropdownRadioItem
                        checked={typeof value === "object"}
                        onClick={(e) => {
                          e.preventDefault();
                          setRange(
                            typeof value !== "string" ? value : undefined,
                          );
                          setShowCalendar(true);
                        }}
                      >
                        <div className="flex flex-col">
                          <span>Custom date/range</span>
                          {typeof value === "object" && (
                            <span className="text-xs/[18px] font-normal">
                              {range?.from
                                ? `${format(range.from, "PP")} -`
                                : ""}
                              {range?.to ? ` ${format(range.to, "PP")}` : ""}
                            </span>
                          )}
                        </div>
                        <ChevronRightIcon
                          data-slot={undefined}
                          className="col-end-5 size-4 justify-self-end"
                        />
                      </DropdownRadioItem>
                    </>
                  )}
                </DropdownSection>
              </DropdownMenu>
            </>
          )}
        </Dropdown>
      </div>
    );
  },
  {
    defaultValue: undefined,
  },
);
