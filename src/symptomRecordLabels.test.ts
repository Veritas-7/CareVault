import { describe, expect, it } from "vitest";
import {
  formatSymptomRecordLabel,
  formatSymptomRecordSavedStatusLabel,
  formatSymptomRecordSaveActionLabel,
  hasSymptomRecordSourceEvidence,
} from "./symptomRecordLabels";

describe("symptomRecordLabels", () => {
  it("keeps ordinary symptom records generic", () => {
    expect(formatSymptomRecordLabel({ action: "진료 때 확인", body: "식후 악화" })).toBe(
      "증상 기록",
    );
  });

  it("labels generated cervical memo drafts", () => {
    expect(
      formatSymptomRecordLabel({
        action: "HPV 백신 가족 안내 내용을 다음 진료 때 진료팀에 확인",
        body: "자궁경부암 기록 메모 초안\n- 기록 항목: HPV 백신 가족 안내",
      }),
    ).toBe("자궁경부암 기록 메모");
  });

  it("labels structured cervical warning drafts", () => {
    expect(
      formatSymptomRecordLabel({
        action: "발생 시점과 동반 증상을 진료팀에 확인",
        body: "자궁경부암 경고 신호 기록 초안\n- 공식 증상 근거: 폐경 후 새 출혈",
      }),
    ).toBe("자궁경부암 경고 기록");
  });

  it("labels source-backed cervical warning symptoms without an explicit draft marker", () => {
    expect(
      formatSymptomRecordLabel({
        action:
          "발생 시기·양·유발 상황을 적고 진료팀 확인\n출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/example",
        body: "성교 후 출혈과 악취 분비물",
      }),
    ).toBe("자궁경부암 경고 기록");
    expect(
      formatSymptomRecordLabel({
        action:
          "혈뇨와 혈변 동반 여부 기록\n출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/example",
        body: "배뇨·배변 변화",
      }),
    ).toBe("자궁경부암 경고 기록");
  });

  it("does not treat non-warning cervical prevention sources as warning records", () => {
    expect(
      formatSymptomRecordLabel({
        action:
          "가족 접종 일정을 확인\n출처: 질병관리청 국가건강정보포털 자궁경부암 백신 - https://health.kdca.go.kr/example",
        body: "HPV 백신 가족 안내",
      }),
    ).toBe("증상 기록");
  });

  it("builds save button labels from the same record label rule", () => {
    expect(formatSymptomRecordSaveActionLabel({ action: "", body: "" })).toBe("증상 기록 추가");
    expect(
      formatSymptomRecordSaveActionLabel({
        action: "HPV 백신 가족 안내 내용을 다음 진료 때 진료팀에 확인",
        body: "자궁경부암 기록 메모 초안\n- 기록 항목: HPV 백신 가족 안내",
      }),
    ).toBe("자궁경부암 기록 메모 추가");
  });

  it("builds saved-status labels from the same record label rule", () => {
    expect(
      formatSymptomRecordSavedStatusLabel({
        action: "발생 시점과 동반 증상을 진료팀에 확인",
        body: "자궁경부암 경고 신호 기록 초안\n- 공식 증상 근거: 폐경 후 새 출혈",
      }),
    ).toBe("자궁경부암 경고 기록 추가됨");
  });

  it("detects source-backed symptom record drafts", () => {
    expect(
      hasSymptomRecordSourceEvidence({
        action: "다음 진료 때 확인",
        body: "HPV 백신 가족 안내\n출처: 질병관리청 국가건강정보포털 자궁경부암 백신 - https://health.kdca.go.kr/example",
      }),
    ).toBe(true);
    expect(
      hasSymptomRecordSourceEvidence({
        action: "진료 때 확인",
        body: "식후 악화",
      }),
    ).toBe(false);
  });
});
