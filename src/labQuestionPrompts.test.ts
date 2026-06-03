import { describe, expect, it } from "vitest";
import { buildLabQuestionPrompt, getNextQuestionDate } from "./labQuestionPrompts";

describe("labQuestionPrompts", () => {
  it("turns a low lab result into a clinician question without giving treatment advice", () => {
    const prompt = buildLabQuestionPrompt(
      {
        date: "2026-06-03",
        name: "ANC",
        value: "0.4",
        unit: "10^3/uL",
        lower: "1.5",
        upper: "",
        note: "발열 여부 관찰",
      },
      {
        flag: "low",
        level: "watch",
        label: "기준보다 낮음",
        summary: "검사실 기준보다 낮습니다.",
      },
    );

    expect(prompt).toContain("ANC 0.4 10^3/uL");
    expect(prompt).toContain("기준 1.5 10^3/uL 이상");
    expect(prompt).toContain("확인해야 할까요?");
    expect(prompt).not.toContain("복용");
  });

  it("uses the next upcoming appointment date for generated questions", () => {
    expect(
      getNextQuestionDate(
        [
          { date: "2026-05-01", nextDate: "2026-05-15" },
          { date: "2026-06-01", nextDate: "2026-06-15" },
        ],
        "2026-06-03",
      ),
    ).toBe("2026-06-15");
  });

  it("falls back to today when no future visit exists", () => {
    expect(getNextQuestionDate([{ date: "2026-05-01", nextDate: "2026-05-15" }], "2026-06-03")).toBe(
      "2026-06-03",
    );
  });
});
