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
      sources: [
        {
          sourceLabel: "국가암정보센터 자궁경부암 일반적 증상",
          sourceUrl: "https://www.cancer.go.kr/example",
        },
      ],
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
      sources: [
        {
          sourceLabel: "국가암정보센터 림프부종 치료 전후관리",
          sourceUrl: "https://www.cancer.go.kr/lymphedema",
        },
      ],
      sourceUrl: "https://www.cancer.go.kr/lymphedema",
    });
  });

  it("keeps every source from the visible action and symptom body available for UI rows", () => {
    const display = buildSymptomDisplayParts({
      action:
        "발생 시점과 양을 기록해 진료팀에 확인\n출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/symptoms",
      body:
        "성교 후 출혈\n출처: 질병관리청 국가건강정보포털 자궁경부암 - https://health.kdca.go.kr/cervical",
    });

    expect(display).toEqual({
      body: "발생 시점과 양을 기록해 진료팀에 확인",
      compactSourceEvidence: "근거: 국가암정보센터 자궁경부암 일반적 증상",
      sourceEvidence:
        "근거: 국가암정보센터 자궁경부암 일반적 증상 (https://www.cancer.go.kr/symptoms); 질병관리청 국가건강정보포털 자궁경부암 (https://health.kdca.go.kr/cervical)",
      sourceLabel: "국가암정보센터 자궁경부암 일반적 증상",
      sources: [
        {
          sourceLabel: "국가암정보센터 자궁경부암 일반적 증상",
          sourceUrl: "https://www.cancer.go.kr/symptoms",
        },
        {
          sourceLabel: "질병관리청 국가건강정보포털 자궁경부암",
          sourceUrl: "https://health.kdca.go.kr/cervical",
        },
      ],
      sourceUrl: "https://www.cancer.go.kr/symptoms",
    });
    expect(display.body).not.toContain("출처:");
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
      sources: [],
      sourceUrl: "",
    });
  });
});
