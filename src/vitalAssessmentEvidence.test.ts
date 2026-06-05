import { describe, expect, it } from "vitest";
import { buildVitalAssessmentEvidence } from "./vitalAssessmentEvidence";

describe("vitalAssessmentEvidence", () => {
  it("keeps low-glucose evidence on the hypoglycemia source even outside diabetes mode", () => {
    const evidence = buildVitalAssessmentEvidence({
      type: "glucose",
      glucoseMgDl: 66,
      glucoseContext: "random",
    });

    expect(evidence).toMatchObject({
      standardId: "hypoglycemia",
      standard: {
        label: "저혈당 확인 기준",
        sourceLabel: "질병관리청 국가건강정보포털 급성 합병증_저혈당",
      },
    });
    expect(evidence?.assessment.summary).toContain("70 mg/dL 미만");
  });

  it("keeps marked-hyperglycemia evidence on the KDCA high-glucose source", () => {
    const evidence = buildVitalAssessmentEvidence(
      {
        type: "glucose",
        glucoseMgDl: 250,
        glucoseContext: "random",
      },
      { diabetes: true },
    );

    expect(evidence).toMatchObject({
      standardId: "marked-hyperglycemia",
      standard: {
        label: "현저한 고혈당 확인 기준",
        sourceLabel: "질병관리청 국가건강정보포털 고혈당",
      },
    });
    expect(evidence?.assessment.summary).toContain("250 mg/dL 이상");
  });

  it("keeps temperature evidence on the cancer-patient infection fever source", () => {
    const evidence = buildVitalAssessmentEvidence({
      type: "temperature",
      temperatureC: 38.1,
    });

    expect(evidence).toMatchObject({
      standardId: "infection-fever",
      standard: {
        label: "체온·감염 연락 기준",
        sourceLabel: "국가암정보센터 감염 의료진 상담 기준",
      },
    });
    expect(evidence?.assessment.summary).toContain("38℃ 이상");
  });
});
