import { describe, expect, it } from "vitest";
import {
  buildSymptomSupportQuestion,
  findSymptomSupportTemplate,
} from "./symptomSupportTemplates";

describe("symptomSupportTemplates", () => {
  it("matches common cancer-treatment side-effect keywords", () => {
    expect(findSymptomSupportTemplate("식사 후 오심이 심함")?.id).toBe("nausea");
    expect(findSymptomSupportTemplate("입안 상처와 구내염")?.id).toBe("mouth-sore");
    expect(findSymptomSupportTemplate("diarrhea after medication")?.id).toBe("diarrhea");
  });

  it("returns no template when the symptom is not mapped", () => {
    expect(findSymptomSupportTemplate("특이 증상 없음")).toBeUndefined();
  });

  it("builds clinician-facing questions without treatment instructions", () => {
    const template = findSymptomSupportTemplate("변비");

    expect(template).toBeDefined();
    expect(buildSymptomSupportQuestion(template!, "변비")).toContain("변비 기록과 관련해");
    expect(template!.safetyNote).toContain("진료 전 확인용");
  });
});
