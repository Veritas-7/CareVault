import { describe, expect, it } from "vitest";
import {
  latestDatedItem,
  latestDatedItemMatching,
  sortDatedItemsNewestFirst,
  sortDatedItemsOldestFirst,
} from "./recordOrdering";

describe("recordOrdering", () => {
  it("selects the later inserted record when dates match", () => {
    const first = { date: "2026-06-04", label: "증상 기록" };
    const second = { date: "2026-06-04", label: "자궁경부암 기록 메모" };

    expect(latestDatedItem([first, second])).toBe(second);
  });

  it("still prioritizes newer dates before same-date insertion order", () => {
    const newest = { date: "2026-06-05", label: "최신 날짜" };
    const laterInsertedOlderDate = { date: "2026-06-04", label: "나중에 입력된 과거 날짜" };

    expect(latestDatedItem([newest, laterInsertedOlderDate])).toBe(newest);
  });

  it("does not let malformed restored dates outrank valid dated records", () => {
    const validLatest = { date: "2026-06-05", label: "최신 정상 날짜" };
    const malformed = { date: "unknown", label: "복구된 잘못된 날짜" };
    const blank = { date: "   ", label: "빈 날짜" };

    expect(latestDatedItem([validLatest, malformed, blank])).toBe(validLatest);
  });

  it("selects the latest matching record by date before insertion order", () => {
    const newerGlucose = { date: "2026-06-05", label: "최신 혈당", type: "glucose" };
    const newerBp = { date: "2026-06-06", label: "최신 혈압", type: "blood-pressure" };
    const laterInsertedOlderGlucose = {
      date: "2026-06-01",
      label: "나중에 입력된 과거 혈당",
      type: "glucose",
    };

    expect(
      latestDatedItemMatching(
        [newerGlucose, newerBp, laterInsertedOlderGlucose],
        (item) => item.type === "glucose",
      ),
    ).toBe(newerGlucose);
  });

  it("sorts timeline records by date and then newest insertion order", () => {
    expect(
      sortDatedItemsNewestFirst([
        { date: "2026-06-04", label: "old same-day", order: 1 },
        { date: "2026-06-05", label: "newer date", order: 0 },
        { date: "2026-06-04", label: "new same-day", order: 2 },
      ]).map((item) => item.label),
    ).toEqual(["newer date", "new same-day", "old same-day"]);
  });

  it("sorts ascending dated records before malformed restored dates", () => {
    expect(
      sortDatedItemsOldestFirst([
        { date: "", label: "blank restored date", order: 0 },
        { date: "2026-06-04", label: "older valid", order: 1 },
        { date: "2026-06-04", label: "later same-day valid", order: 2 },
        { date: "2026-06-31", label: "malformed restored date", order: 3 },
        { date: "2026-06-05", label: "newer valid", order: 4 },
      ]).map((item) => item.label),
    ).toEqual([
      "older valid",
      "later same-day valid",
      "newer valid",
      "blank restored date",
      "malformed restored date",
    ]);
  });
});
