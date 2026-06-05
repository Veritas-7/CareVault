import { describe, expect, it } from "vitest";
import {
  buildQuestionStatusButtonLabels,
  formatQuestionStatusUpdateStatus,
  questionStatusLabel,
} from "./questionStatus";

describe("questionStatus", () => {
  it("builds item-specific accessible labels for saved question status buttons", () => {
    expect(buildQuestionStatusButtonLabels("혈액검사", "answered")).toEqual({
      ariaLabel: "혈액검사 질문 상태를 답변 완료로 변경",
      title: "혈액검사 질문 상태를 답변 완료로 변경",
      visibleLabel: "답변 완료",
    });
    expect(buildQuestionStatusButtonLabels("  ", "deferred")).toEqual({
      ariaLabel: "진료 전 질문 상태를 보류로 변경",
      title: "진료 전 질문 상태를 보류로 변경",
      visibleLabel: "보류 처리",
    });
    expect(buildQuestionStatusButtonLabels("혈액검사 질문", "open")).toEqual({
      ariaLabel: "혈액검사 질문 상태를 확인 필요로 변경",
      title: "혈액검사 질문 상태를 확인 필요로 변경",
      visibleLabel: "확인 필요",
    });
  });

  it("keeps Korean question status labels stable", () => {
    expect(questionStatusLabel).toEqual({
      open: "확인 필요",
      answered: "답변 완료",
      deferred: "보류",
    });
  });

  it("formats saved question status update feedback with target context", () => {
    expect(formatQuestionStatusUpdateStatus("혈액검사", "answered")).toBe(
      "혈액검사 질문 상태: 답변 완료",
    );
    expect(formatQuestionStatusUpdateStatus("혈액검사 질문", "open")).toBe(
      "혈액검사 질문 상태: 확인 필요",
    );
    expect(formatQuestionStatusUpdateStatus("  ", "deferred")).toBe(
      "진료 전 질문 상태: 보류",
    );
  });
});
