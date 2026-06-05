import { describe, expect, it } from "vitest";
import { buildVitalTimelineDisplayParts } from "./vitalTimelineDisplay";

describe("vitalTimelineDisplay", () => {
  it("builds linked timeline evidence for blood-pressure records", () => {
    expect(
      buildVitalTimelineDisplayParts({
        diastolic: 84,
        systolic: 132,
        type: "blood-pressure",
      }),
    ).toEqual({
      compactSourceEvidence: "근거: 질병관리청 국가건강정보포털 고혈압",
      sourceEvidence:
        "근거: 질병관리청 국가건강정보포털 고혈압 (https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28)",
      sourceLabel: "질병관리청 국가건강정보포털 고혈압",
      sourceUrl:
        "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28",
    });
  });

  it("builds linked timeline evidence for temperature fever records", () => {
    expect(
      buildVitalTimelineDisplayParts({
        temperatureC: 38.1,
        type: "temperature",
      }),
    ).toEqual({
      compactSourceEvidence: "근거: 국가암정보센터 감염 의료진 상담 기준",
      sourceEvidence:
        "근거: 국가암정보센터 감염 의료진 상담 기준 (https://www.cancer.go.kr/lay1/S1T435C439/contents.do)",
      sourceLabel: "국가암정보센터 감염 의료진 상담 기준",
      sourceUrl: "https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
    });
  });

  it("keeps incomplete vital records evidence-free", () => {
    expect(buildVitalTimelineDisplayParts({ type: "temperature" })).toEqual({
      compactSourceEvidence: "",
      sourceEvidence: "",
      sourceLabel: "",
      sourceUrl: "",
    });
  });
});
