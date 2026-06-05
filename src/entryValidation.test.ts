import { describe, expect, it } from "vitest";
import { hasRequiredTextValues, recordRequiredFieldMessages } from "./entryValidation";

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
