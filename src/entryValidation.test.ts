import { describe, expect, it } from "vitest";
import {
  formatRecordFormFeedbackAriaLabel,
  formatRecordFormFeedbackClearedStatus,
  hasRequiredTextValues,
  recordRequiredFieldMessages,
  recordFormFeedbackLabels,
  resolveRecordFormFeedbackClearedSaveLabel,
  shouldClearRecordFormFeedback,
} from "./entryValidation";

describe("hasRequiredTextValues", () => {
  it("accepts non-empty trimmed field values", () => {
    expect(hasRequiredTextValues("종양내과", " 정기 추적 ")).toBe(true);
  });

  it("rejects blank or missing field values", () => {
    expect(hasRequiredTextValues("종양내과", "   ")).toBe(false);
    expect(hasRequiredTextValues("종양내과", undefined)).toBe(false);
  });
});

describe("recordRequiredFieldMessages", () => {
  it("keeps user-facing guidance for each guarded add flow", () => {
    expect(recordRequiredFieldMessages.visit).toContain("병원/과");
    expect(recordRequiredFieldMessages.document).toContain("서류 제목");
    expect(recordRequiredFieldMessages.symptom).toContain("증상");
    expect(recordRequiredFieldMessages.question).toContain("질문 주제");
    expect(recordRequiredFieldMessages.lab).toContain("검사 항목");
  });
});

describe("formatRecordFormFeedbackAriaLabel", () => {
  it("scopes local validation feedback to the form that needs attention", () => {
    expect(
      formatRecordFormFeedbackAriaLabel("visit", recordRequiredFieldMessages.visit),
    ).toBe("병원 방문 기록 필수 항목 안내 · 병원/과와 방문 이유를 입력해주세요.");
    expect(recordFormFeedbackLabels.document).toBe("서류 수기 보관");
    expect(recordFormFeedbackLabels.vital).toContain("혈압");
  });
});

describe("shouldClearRecordFormFeedback", () => {
  it("clears an existing local feedback row only after the guarded form becomes valid", () => {
    expect(shouldClearRecordFormFeedback(recordRequiredFieldMessages.visit, true)).toBe(true);
    expect(shouldClearRecordFormFeedback(recordRequiredFieldMessages.visit, false)).toBe(false);
    expect(shouldClearRecordFormFeedback(undefined, true)).toBe(false);
  });
});

describe("formatRecordFormFeedbackClearedStatus", () => {
  it("uses scoped ready feedback without claiming the record was saved", () => {
    expect(formatRecordFormFeedbackClearedStatus("visit")).toBe("병원 방문 기록 필수 입력 확인됨");
    expect(formatRecordFormFeedbackClearedStatus("document")).toBe(
      "서류 수기 보관 필수 입력 확인됨",
    );
    expect(formatRecordFormFeedbackClearedStatus("lab")).not.toContain("저장");
  });
});

describe("resolveRecordFormFeedbackClearedSaveLabel", () => {
  it("replaces only the stale required-field save chip message", () => {
    expect(
      resolveRecordFormFeedbackClearedSaveLabel(
        "visit",
        recordRequiredFieldMessages.visit,
        recordRequiredFieldMessages.visit,
      ),
    ).toBe("병원 방문 기록 필수 입력 확인됨");

    expect(
      resolveRecordFormFeedbackClearedSaveLabel(
        "visit",
        recordRequiredFieldMessages.visit,
        "질문 추가됨",
      ),
    ).toBe("질문 추가됨");

    expect(resolveRecordFormFeedbackClearedSaveLabel("visit", undefined, "SQLite 자동 저장됨")).toBe(
      "SQLite 자동 저장됨",
    );
  });
});
