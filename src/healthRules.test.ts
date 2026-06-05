import { describe, expect, it } from "vitest";
import {
  assessBloodGlucose,
  assessBloodPressure,
  assessCancerFood,
  assessLabValue,
  assessTemperature,
  assessWaistCircumference,
  buildFoodMatchSourceLinkLabels,
  calculateBmi,
  formatFoodMatchEvidence,
  foodGuidanceSources,
} from "./healthRules";

describe("healthRules", () => {
  it("classifies adult BMI using Korean adult categories", () => {
    expect(calculateBmi(170, 65).label).toBe("정상 체중 범위");
    expect(calculateBmi(170, 68).label).toBe("비만전단계");
    expect(calculateBmi(170, 73).label).toBe("1단계 비만");
    expect(calculateBmi(170, 88).label).toBe("2단계 비만");
    expect(calculateBmi(170, 103).label).toBe("3단계 비만");
  });

  it("classifies Korean adult waist circumference by sex", () => {
    expect(assessWaistCircumference(84.9, "female").label).toBe("복부비만 기준 미만");
    expect(assessWaistCircumference(85, "female").label).toBe("복부비만 기준 해당");
    expect(assessWaistCircumference(90, "male").label).toBe("복부비만 기준 해당");
    expect(assessWaistCircumference(90, "other").label).toBe("성별 기준 미지정");
  });

  it("classifies blood pressure into Korean adult ranges", () => {
    expect(assessBloodPressure(118, 76).label).toBe("정상 혈압 범위");
    expect(assessBloodPressure(124, 76).label).toBe("주의혈압 범위");
    expect(assessBloodPressure(132, 84).label).toBe("고혈압 전단계 범위");
    expect(assessBloodPressure(145, 94).label).toBe("고혈압 1단계 범위");
    expect(assessBloodPressure(162, 100).label).toBe("고혈압 2단계 범위");
    expect(assessBloodPressure(182, 100).label).toBe("고혈압 위기 가능 범위");
    expect(assessBloodPressure(88, 58)).toMatchObject({
      label: "낮은 혈압 가능",
      standardId: "low-blood-pressure",
    });
    expect(assessBloodPressure(132, 84).standardId).toBe("blood-pressure");
  });

  it("states blood pressure and glucose assessments are adult common standards", () => {
    expect(assessBloodPressure(132, 84).summary).toContain("성인 남녀 공통");
    expect(assessBloodPressure(118, 76).summary).toContain("성인 남녀 공통");
    expect(assessBloodPressure(88, 58).summary).toContain("성인 남녀 공통");
    expect(assessBloodGlucose(126, "before-meal", { diabetes: true }).summary).toContain(
      "성인 남녀 공통",
    );
    expect(assessBloodGlucose(181, "after-meal", { diabetes: true }).summary).toContain(
      "성인 남녀 공통",
    );
    expect(assessBloodGlucose(66, "random").summary).toContain("성인 남녀 공통");
    expect(assessBloodGlucose(66, "random").summary).toContain("70 mg/dL 미만 저혈당 범위");
    expect(assessBloodGlucose(66, "random").standardId).toBe("hypoglycemia");
    expect(assessBloodGlucose(250, "random").standardId).toBe("marked-hyperglycemia");
    expect(assessBloodGlucose(250, "random").summary).toContain("250 mg/dL 이상");
    expect(assessBloodGlucose(139, "after-meal").summary).toContain("성인 남녀 공통");
    expect(assessBloodGlucose(99, "fasting").summary).toContain("성인 남녀 공통");
  });

  it("classifies diabetes care glucose targets by context", () => {
    expect(assessBloodGlucose(126, "before-meal", { diabetes: true }).level).toBe("ok");
    expect(assessBloodGlucose(181, "after-meal", { diabetes: true }).level).toBe("watch");
    expect(assessBloodGlucose(66, "random").label).toBe("저혈당 범위");
  });

  it("routes cancer-patient fever temperatures to the infection contact standard", () => {
    expect(assessTemperature(36.8)).toMatchObject({
      label: "체온 기록 범위",
      level: "ok",
      standardId: "infection-fever",
    });
    expect(assessTemperature(38.1)).toMatchObject({
      label: "발열 연락 기준",
      level: "risk",
      standardId: "infection-fever",
    });
    expect(assessTemperature(38.1).summary).toContain("암환자 공통");
    expect(assessTemperature(38.1).summary).toContain("38℃ 이상");
  });

  it("classifies screening glucose using Korean diabetes thresholds", () => {
    expect(assessBloodGlucose(99, "fasting").label).toBe("정상 공복/식전 범위");
    expect(assessBloodGlucose(100, "fasting").label).toBe("공복혈당장애 범위");
    expect(assessBloodGlucose(126, "fasting").label).toBe("당뇨병 진단 기준 범위");
    expect(assessBloodGlucose(139, "after-meal").label).toBe("정상 식후 2시간 범위");
    expect(assessBloodGlucose(140, "after-meal").label).toBe("내당능장애 범위");
    expect(assessBloodGlucose(200, "after-meal").label).toBe("당뇨병 진단 기준 범위");
  });

  it("flags cancer food support, limit, and clinician-check items", () => {
    expect(assessCancerFood("브로콜리와 현미").level).toBe("ok");
    expect(assessCancerFood("베이컨과 탄산음료").level).toBe("watch");
    expect(assessCancerFood("자몽 주스와 보충제").level).toBe("risk");
  });

  it("attaches official Korean source labels to cancer-food matches", () => {
    const assessment = assessCancerFood("브로콜리, 베이컨, 자몽 주스, 보충제");
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.nccPreventionDiet.label).toBe("국가암정보센터 암예방 식이");
    expect(matchesByTerm.브로콜리.sourceLabel).toBe("국가암정보센터 암예방 식이");
    expect(matchesByTerm.베이컨.sourceLabel).toBe("국가암정보센터 암예방 식이");
    expect(matchesByTerm.자몽.sourceLabel).toBe("질병관리청 국가건강정보포털 식이영양");
    expect(matchesByTerm.보충제.sourceLabel).toBe("국가암정보센터 보완대체요법 상담");
    expect(assessment.matches.every((match) => match.sourceUrl.startsWith("https://"))).toBe(true);
    expect(formatFoodMatchEvidence(matchesByTerm.자몽)).toContain(
      "질병관리청 국가건강정보포털 식이영양 - https://",
    );
  });

  it("uses the immune-function diet source for raw or unpasteurized food safety checks", () => {
    const assessment = assessCancerFood("생굴, 회, 날계란, 비살균 우유");
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.nccImmuneLowDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    );
    expect(matchesByTerm.생굴.sourceLabel).toBe(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    );
    expect(matchesByTerm.회.sourceLabel).toBe(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    );
    expect(matchesByTerm.날계란.sourceUrl).toBe(
      "https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(matchesByTerm.비살균.sourceUrl).toBe(
      "https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(formatFoodMatchEvidence(matchesByTerm.회)).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
  });

  it("builds item-specific accessible labels for food source links", () => {
    const match = assessCancerFood("생굴").matches[0];

    expect(buildFoodMatchSourceLinkLabels(match)).toEqual({
      ariaLabel:
        "생굴 음식 판단 근거 국가암정보센터 증상별 식생활 - 면역기능의 저하 열기 - 면역저하 시 익히지 않은 음식 주의",
      title:
        "생굴 음식 판단 근거 국가암정보센터 증상별 식생활 - 면역기능의 저하 열기 - 면역저하 시 익히지 않은 음식 주의",
      visibleLabel: "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    });
  });

  it("classifies lab values against user-entered reference ranges", () => {
    expect(assessLabValue(4.2, 4, 10).flag).toBe("normal");
    expect(assessLabValue(3.1, 4, 10).label).toBe("기준보다 낮음");
    expect(assessLabValue(14, 4, 10).label).toBe("기준보다 높음");
    expect(assessLabValue(14).flag).toBe("unknown");
  });
});
