import { describe, expect, it } from "vitest";
import {
  defaultQuestionPriority,
  formatQuestionDraftAddActionLabel,
  formatQuestionDraftAddedStatus,
  formatQuestionPriorityControlDescription,
  formatQuestionPriorityUpdateStatus,
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
    expect(formatQuestionDraftAddActionLabel("next-visit", false)).toBe(
      "진료 전 질문 추가 · 질문 주제와 내용 필요 · 우선순위 다음 진료",
    );
    expect(formatQuestionDraftAddActionLabel("next-visit", true, "QA 확인 질문")).toBe(
      "진료 전 질문 추가 · QA 확인 질문 입력 준비됨 · 우선순위 다음 진료",
    );
    expect(formatQuestionDraftAddActionLabel("routine", true, "검사 결과")).toBe(
      "진료 전 질문 추가 · 검사 결과 질문 입력 준비됨 · 우선순위 일반 확인",
    );
  });

  it("formats question draft added feedback with topic and priority scope", () => {
    expect(formatQuestionDraftAddedStatus("혈액검사", "high")).toBe(
      "혈액검사 질문 추가됨 · 우선순위 이번 진료 우선",
    );
    expect(formatQuestionDraftAddedStatus("혈액검사 질문", "next-visit")).toBe(
      "혈액검사 질문 추가됨 · 우선순위 다음 진료",
    );
    expect(formatQuestionDraftAddedStatus("  ", "routine")).toBe(
      "진료 전 질문 추가됨 · 우선순위 일반 확인",
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

  it("formats saved question priority update feedback with target context", () => {
    expect(formatQuestionPriorityUpdateStatus("혈액검사 질문", "high")).toBe(
      "혈액검사 질문 우선순위: 이번 진료 우선",
    );
    expect(formatQuestionPriorityUpdateStatus("식사 상담", "routine")).toBe(
      "식사 상담 우선순위: 일반 확인",
    );
    expect(formatQuestionPriorityUpdateStatus("  ", "next-visit")).toBe(
      "진료 전 질문 우선순위: 다음 진료",
    );
  });
});
