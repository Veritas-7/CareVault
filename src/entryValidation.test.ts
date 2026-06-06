import { describe, expect, it } from "vitest";
import {
  formatDocumentRequiredFieldMessage,
  formatLabRequiredFieldMessage,
  formatQuestionRequiredFieldMessage,
  formatRecordFormFeedbackAriaLabel,
  formatRecordFormFeedbackClearedStatus,
  formatSymptomRequiredFieldMessage,
  formatVisitRequiredFieldMessage,
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
    expect(recordRequiredFieldMessages.symptom).toContain("몸 상태 메모");
    expect(recordRequiredFieldMessages.question).toContain("질문 주제");
    expect(recordRequiredFieldMessages.lab).toContain("검사 항목");
  });
});

describe("formatLabRequiredFieldMessage", () => {
  it("keeps the combined guidance when both required lab fields are blank", () => {
    expect(formatLabRequiredFieldMessage("", " ")).toBe(recordRequiredFieldMessages.lab);
  });

  it("narrows the guidance to the missing lab item or value", () => {
    expect(formatLabRequiredFieldMessage("", "3.4")).toBe("검사 항목을 입력해주세요.");
    expect(formatLabRequiredFieldMessage("CRP", "")).toBe("검사 값을 입력해주세요.");
  });

  it("returns no guidance when the lab item and value are both present", () => {
    expect(formatLabRequiredFieldMessage(" CRP ", " 1.2 ")).toBeNull();
  });
});

describe("formatVisitRequiredFieldMessage", () => {
  it("keeps the combined guidance when both required visit fields are blank", () => {
    expect(formatVisitRequiredFieldMessage("", " ")).toBe(recordRequiredFieldMessages.visit);
  });

  it("narrows the guidance to the missing visit hospital or reason", () => {
    expect(formatVisitRequiredFieldMessage("", "추적 상담")).toBe("병원/과를 입력해주세요.");
    expect(formatVisitRequiredFieldMessage("세브란스 종양내과", "")).toBe(
      "방문 이유를 입력해주세요.",
    );
  });

  it("returns no guidance when the visit hospital and reason are both present", () => {
    expect(formatVisitRequiredFieldMessage(" 세브란스 ", " 추적 상담 ")).toBeNull();
  });
});

describe("formatQuestionRequiredFieldMessage", () => {
  it("keeps the combined guidance when both required question fields are blank", () => {
    expect(formatQuestionRequiredFieldMessage("", " ")).toBe(recordRequiredFieldMessages.question);
  });

  it("narrows the guidance to the missing question topic or body", () => {
    expect(formatQuestionRequiredFieldMessage("", "부작용이 심하면 어떻게 하나요?")).toBe(
      "질문 주제를 입력해주세요.",
    );
    expect(formatQuestionRequiredFieldMessage("항암 부작용", "")).toBe(
      "질문 내용을 입력해주세요.",
    );
  });

  it("returns no guidance when the question topic and body are both present", () => {
    expect(formatQuestionRequiredFieldMessage(" 항암 부작용 ", " 피로 기준 질문 ")).toBeNull();
  });
});

describe("formatSymptomRequiredFieldMessage", () => {
  it("requires either a symptom name or a body note", () => {
    expect(formatSymptomRequiredFieldMessage("", " ")).toBe(recordRequiredFieldMessages.symptom);
  });

  it("allows a symptom name without a body note", () => {
    expect(formatSymptomRequiredFieldMessage(" 오심 ", "")).toBeNull();
  });

  it("allows a body note without a symptom name", () => {
    expect(formatSymptomRequiredFieldMessage("", " 식후 피로가 심해짐 ")).toBeNull();
  });
});

describe("formatDocumentRequiredFieldMessage", () => {
  it("keeps the combined guidance when both required document fields are blank", () => {
    expect(formatDocumentRequiredFieldMessage("", " ")).toBe(recordRequiredFieldMessages.document);
  });

  it("narrows the guidance to the missing document title or body", () => {
    expect(formatDocumentRequiredFieldMessage("", "검사 수치 메모")).toBe(
      "서류 제목을 입력해주세요.",
    );
    expect(formatDocumentRequiredFieldMessage("6월 혈액검사", "")).toBe(
      "서류 내용을 입력해주세요.",
    );
  });

  it("returns no guidance when the document title and body are both present", () => {
    expect(formatDocumentRequiredFieldMessage(" 6월 혈액검사 ", " WBC 추적 ")).toBeNull();
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
