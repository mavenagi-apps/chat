import { Front } from "@/types/front";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { isShiftActive } from "../utils";
import { DateTime } from "luxon";

const shift_9_to_5 = {
  start: "09:00",
  end: "17:00",
};

describe("utils.shifts", () => {
  describe("isShiftActive", () => {
    it("handles given time and takes into account timezones", () => {
      const test: [DateTime, { timezone: string; times: any }[], boolean][] =
        [];
      test.push([
        // Tuesday, January 21, 2025 1:00:00 PM PST
        DateTime.fromObject(
          { year: 2025, month: 1, day: 21, hour: 13, minute: 0 },
          { zone: "America/Los_Angeles" },
        ),
        [
          {
            timezone: "America/Los_Angeles",
            times: {
              sat: shift_9_to_5,
              sun: shift_9_to_5,
            },
          },
        ],
        false,
      ]);

      test.push([
        // Tuesday, January 21, 2025 1:00:00 PM PST
        DateTime.fromObject(
          { year: 2025, month: 1, day: 21, hour: 13, minute: 0 },
          { zone: "America/Los_Angeles" },
        ),
        [
          {
            timezone: "America/Los_Angeles",
            times: {
              mon: shift_9_to_5,
              tue: shift_9_to_5,
            },
          },
        ],
        true,
      ]);

      test.push([
        // Tuesday, January 21, 2025 9:00:00 PM EST
        // Tuesday, January 21, 2025 6:00:00 PM PST
        DateTime.fromObject(
          { year: 2025, month: 1, day: 21, hour: 21, minute: 0 },
          { zone: "America/New_York" },
        ),
        [
          {
            timezone: "America/New_York",
            times: {
              mon: shift_9_to_5,
              tue: shift_9_to_5,
            },
          },
          {
            timezone: "America/Los_Angeles",
            times: {
              mon: shift_9_to_5,
              tue: shift_9_to_5,
            },
          },
        ],
        false, // note: its too late for either EST or PST shift
      ]);

      test.push([
        // Tuesday, January 21, 2025 7:00:00 PM EST
        // Tuesday, January 21, 2025 4:00:00 PM PST
        DateTime.fromObject(
          { year: 2025, month: 1, day: 21, hour: 19, minute: 0 },
          { zone: "America/New_York" },
        ),
        [
          {
            timezone: "America/New_York",
            times: {
              mon: shift_9_to_5,
              tue: shift_9_to_5,
            },
          },
          {
            timezone: "America/Los_Angeles",
            times: {
              mon: shift_9_to_5,
              tue: shift_9_to_5,
            },
          },
        ],
        true, // note: PST shift is still available
      ]);

      for (let index = 0; index < test.length; index++) {
        const [date, shifts, isOpen] = test[index];
        const frontShifts = shifts.map((shift, i) => {
          return {
            _links: {
              self: "",
              related: {
                owner: "",
                teammates: "",
              },
            },
            id: "shf_1q30",
            name: "Weekend Shift",
            color: "blue",
            created_at: 1675664305.654,
            updated_at: 1737086400.53,
            ...shift,
          };
        });
        expect(
          isShiftActive(frontShifts, date.toJSDate()),
          JSON.stringify({ index, date, isOpen, shifts }),
        ).toBe(isOpen);
      }
    });
  });
});
