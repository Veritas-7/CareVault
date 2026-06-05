import { describe, expect, it } from "vitest";
import {
  buildLabFollowupQuestionButtonLabels,
  buildLabQuestionPrompt,
  getNextQuestionDate,
} from "./labQuestionPrompts";

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
    expect(prompt).toContain("기존 메모/근거: 발열 여부 관찰");
    expect(prompt).toContain("출처: 국가암정보센터 항암 부작용 증상 관리 지침 - https://");
    expect(prompt).toContain("확인해야 할까요?");
    expect(prompt).not.toContain("복용");
  });

  it("keeps preset source evidence visible in generated lab questions", () => {
    const prompt = buildLabQuestionPrompt(
      {
        date: "2026-06-03",
        name: "HDL-C",
        value: "38",
        unit: "mg/dL",
        lower: "40",
        upper: "",
        note: "대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://www.diabetes.or.kr/general/info/treat/treat_01.php",
      },
      {
        flag: "low",
        level: "watch",
        label: "기준보다 낮음",
        summary: "검사실 기준보다 낮습니다.",
      },
    );

    expect(prompt).toContain(
      "기존 메모/근거: 대한당뇨병학회 일반 목표 기준입니다. / 적용 기준: 여성 기준 적용",
    );
    expect(prompt).toContain("출처: 대한당뇨병학회 당뇨병 관리 목표 - https://");
    expect(prompt).toContain("확인해야 할까요?");
  });

  it("normalizes multiline ordinary lab notes in generated questions", () => {
    const prompt = buildLabQuestionPrompt(
      {
        date: "2026-06-03",
        name: "WBC",
        value: "3.4",
        unit: "10^3/uL",
        lower: "4.0",
        upper: "10.0",
        note: "면역저하 질문\n발열 여부 관찰",
      },
      {
        flag: "low",
        level: "watch",
        label: "기준보다 낮음",
        summary: "검사실 기준보다 낮습니다.",
      },
    );

    expect(prompt).toContain("기존 메모/근거: 면역저하 질문 / 발열 여부 관찰");
    expect(prompt).toContain("출처: 서울아산병원 전혈구검사 참고치 - https://");
  });

  it("builds item-specific follow-up question button labels with evidence context", () => {
    expect(buildLabFollowupQuestionButtonLabels("HDL-C", true)).toEqual({
      ariaLabel: "HDL-C 검사 질문 추가 · 메모와 근거 포함",
      title: "HDL-C 검사 질문 추가 · 메모와 근거 포함",
    });

    expect(buildLabFollowupQuestionButtonLabels("WBC", true)).toEqual({
      ariaLabel: "WBC 검사 질문 추가 · 메모와 근거 포함",
      title: "WBC 검사 질문 추가 · 메모와 근거 포함",
    });
  });

  it("uses a stable fallback for blank lab names in follow-up button labels", () => {
    expect(buildLabFollowupQuestionButtonLabels("  ", true)).toEqual({
      ariaLabel: "검사 수치 질문 추가 · 메모와 근거 포함",
      title: "검사 수치 질문 추가 · 메모와 근거 포함",
    });
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
