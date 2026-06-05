import { describe, expect, it } from "vitest";
import {
  defaultQuestionPriority,
  formatQuestionDraftAddActionLabel,
  formatQuestionPriorityControlDescription,
  normalizeQuestionPriority,
  questionPriorityLabel,
  questionPrioritySortRank,
} from "./questionPriority";

describe("questionPriority", () => {
  it("keeps appointment triage labels explicit", () => {
    expect(questionPriorityLabel).toEqual({
      high: "이번 진료 우선",
      "next-visit": "다음 진료",
      routine: "일반 확인",
    });
  });

  it("normalizes missing or unknown priority to next visit", () => {
    expect(defaultQuestionPriority).toBe("next-visit");
    expect(normalizeQuestionPriority(undefined)).toBe("next-visit");
    expect(normalizeQuestionPriority("unknown")).toBe("next-visit");
    expect(normalizeQuestionPriority("high")).toBe("high");
  });

  it("sorts high-priority questions before routine questions", () => {
    expect(questionPrioritySortRank.high).toBeLessThan(questionPrioritySortRank["next-visit"]);
    expect(questionPrioritySortRank["next-visit"]).toBeLessThan(
      questionPrioritySortRank.routine,
    );
  });

  it("formats draft add action labels with the selected priority scope", () => {
    expect(formatQuestionDraftAddActionLabel("high")).toBe(
      "진료 전 질문 추가 · 우선순위 이번 진료 우선",
    );
    expect(formatQuestionDraftAddActionLabel("next-visit")).toBe(
      "진료 전 질문 추가 · 우선순위 다음 진료",
    );
    expect(formatQuestionDraftAddActionLabel("routine")).toBe(
      "진료 전 질문 추가 · 우선순위 일반 확인",
    );
  });

  it("formats saved question priority controls with topic and current priority", () => {
    expect(formatQuestionPriorityControlDescription("혈액검사 질문", "high")).toBe(
      "혈액검사 질문 우선순위 변경 · 현재 이번 진료 우선",
    );
    expect(formatQuestionPriorityControlDescription("  ", "next-visit")).toBe(
      "진료 전 질문 우선순위 변경 · 현재 다음 진료",
    );
    expect(formatQuestionPriorityControlDescription("식사 상담", "routine")).toBe(
      "식사 상담 우선순위 변경 · 현재 일반 확인",
    );
  });
});
