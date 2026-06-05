import { describe, expect, it } from "vitest";
import { buildSymptomDisplayParts } from "./symptomDisplay";

describe("symptomDisplay", () => {
  it("splits source-backed action notes into a visible body and evidence row", () => {
    expect(
      buildSymptomDisplayParts({
        action:
          "발생 시점과 양을 기록해 진료팀에 확인\n출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/example",
        body: "성교 후 출혈",
      }),
    ).toEqual({
      body: "발생 시점과 양을 기록해 진료팀에 확인",
      compactSourceEvidence: "근거: 국가암정보센터 자궁경부암 일반적 증상",
      sourceEvidence:
        "근거: 국가암정보센터 자궁경부암 일반적 증상 (https://www.cancer.go.kr/example)",
      sourceLabel: "국가암정보센터 자궁경부암 일반적 증상",
      sourceUrl: "https://www.cancer.go.kr/example",
    });
  });

  it("uses body source evidence when the visible action has no source line", () => {
    expect(
      buildSymptomDisplayParts({
        action: "다음 진료 때 확인",
        body:
          "림프부종 악화 신호\n출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/lymphedema",
      }),
    ).toEqual({
      body: "다음 진료 때 확인",
      compactSourceEvidence: "근거: 국가암정보센터 림프부종 치료 전후관리",
      sourceEvidence:
        "근거: 국가암정보센터 림프부종 치료 전후관리 (https://www.cancer.go.kr/lymphedema)",
      sourceLabel: "국가암정보센터 림프부종 치료 전후관리",
      sourceUrl: "https://www.cancer.go.kr/lymphedema",
    });
  });

  it("keeps ordinary symptom notes unchanged", () => {
    expect(
      buildSymptomDisplayParts({
        action: "",
        body: "식후 메스꺼움",
      }),
    ).toEqual({
      body: "식후 메스꺼움",
      compactSourceEvidence: "",
      sourceEvidence: "",
      sourceLabel: "",
      sourceUrl: "",
    });
  });
});
