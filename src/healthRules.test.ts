import { describe, expect, it } from "vitest";
import {
  assessBloodGlucose,
  assessBloodPressure,
  assessCancerFood,
  assessLabTextValue,
  assessLabValue,
  assessTemperature,
  assessWaistCircumference,
  buildFoodMatchSourceLinkLabels,
  calculateBmi,
  cancerFoodGuideCategories,
  formatFoodMatchEvidence,
  foodGuidanceSources,
  parseFiniteNumberText,
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

    expect(foodGuidanceSources.nccPreventionDiet.label).toBe("국가암정보센터 건강한 식생활");
    expect(foodGuidanceSources.nccPreventionDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
    );
    expect(matchesByTerm.브로콜리.sourceLabel).toBe("국가암정보센터 건강한 식생활");
    expect(matchesByTerm.브로콜리.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
    );
    expect(matchesByTerm.베이컨.sourceLabel).toBe("국가암정보센터 건강한 식생활");
    expect(matchesByTerm.자몽.sourceLabel).toBe("질병관리청 국가건강정보포털 식이영양");
    expect(matchesByTerm.보충제.sourceLabel).toBe("국가암정보센터 보완대체요법 상담");
    expect(assessment.matches.every((match) => match.sourceUrl.startsWith("https://"))).toBe(true);
    expect(formatFoodMatchEvidence(matchesByTerm.자몽)).toContain(
      "질병관리청 국가건강정보포털 식이영양 - https://",
    );
  });

  it("recognizes NCC weight-maintenance fatty and sweet food limit source sentence", () => {
    const sourceSentence = "기름진 음식과 단 음식은 피하고, 가능한 싱겁게 먹는다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightMaintenanceDiet.label).toBe(
      "국가암정보센터 적정 체중과 체지방 유지",
    );
    expect(foodGuidanceSources.nccWeightMaintenanceDiet.url).toBe(
      "https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 적정 체중과 체지방 유지 식사조절 후보",
      sourceId: "nccWeightMaintenanceDiet",
    });
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("매우 단 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 적정 체중과 체지방 유지 - https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC weight-maintenance vegetable and fruit amount source sentence", () => {
    const sourceSentence = "채소는 충분히, 과일을 적당량 먹는다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightMaintenanceDiet.label).toBe(
      "국가암정보센터 적정 체중과 체지방 유지",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 적정 체중과 체지방 유지 채소·과일 섭취 후보",
      sourceId: "nccWeightMaintenanceDiet",
    });
    expect(terms).not.toContain("채소류");
    expect(terms).not.toContain("과일류는 매일 1회 이상 간식으로 섭취합니다");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 적정 체중과 체지방 유지 - https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC weight-maintenance varied timely eating source sentence", () => {
    const sourceSentence = "다양한 음식을 제때에, 골고루 먹는다";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightMaintenanceDiet.label).toBe(
      "국가암정보센터 적정 체중과 체지방 유지",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 적정 체중과 체지방 유지 규칙적 균형식 후보",
      sourceId: "nccWeightMaintenanceDiet",
    });
    expect(terms).not.toContain("다채로운 식단 균형 잡힌 식사");
    expect(terms).not.toContain("여러 가지 음식을 골고루");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 적정 체중과 체지방 유지 - https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC weight-maintenance alcohol avoid source sentence", () => {
    const sourceSentence = "술은 마시지 않는다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightMaintenanceDiet.label).toBe(
      "국가암정보센터 적정 체중과 체지방 유지",
    );
    expect(foodGuidanceSources.nccWeightMaintenanceDiet.url).toBe(
      "https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 적정 체중과 체지방 유지 음주 제한 후보",
      sourceId: "nccWeightMaintenanceDiet",
    });
    expect(terms).not.toContain("술");
    expect(terms).not.toContain("하루 한 두 잔의 술도 피합니다.");
    expect(terms).not.toContain("치료 후 하루 한 두 잔 술도 피하기");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 적정 체중과 체지방 유지 - https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC weight-maintenance slow eating source sentence", () => {
    const sourceSentence = "과식을 피하기 위해 천천히 먹는다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightMaintenanceDiet.label).toBe(
      "국가암정보센터 적정 체중과 체지방 유지",
    );
    expect(foodGuidanceSources.nccWeightMaintenanceDiet.url).toBe(
      "https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 적정 체중과 체지방 유지 천천히 식사 후보",
      sourceId: "nccWeightMaintenanceDiet",
    });
    expect(terms).not.toContain("과식");
    expect(terms).not.toContain("천천히 먹기");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 적정 체중과 체지방 유지 - https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC weight-maintenance clinical nutrition consult source sentence", () => {
    const sourceSentence =
      "단, 식사조절과 운동으로 적정 체중 유지가 어렵거나 고혈압, 당뇨병, 고지혈증 등 만성질환이 있는 경우 담당의사 및 임상영양사의 상담을 받도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightMaintenanceDiet.label).toBe(
      "국가암정보센터 적정 체중과 체지방 유지",
    );
    expect(foodGuidanceSources.nccWeightMaintenanceDiet.url).toBe(
      "https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 적정 체중과 체지방 유지 만성질환·체중유지 상담 필요",
      sourceId: "nccWeightMaintenanceDiet",
    });
    expect(terms).not.toContain(
      "단, 암 치료가 끝난 후 부작용 등으로 적절한 식사 섭취가 힘들거나 고혈압, 당뇨병, 고지혈증 등으로 식사조절이 필요한 경우 담당의사 및 임상영양사의 상담을 받도록 합니다.",
    );
    expect(terms).not.toContain("치료 후 부작용으로 식사 섭취 힘듦");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 적정 체중과 체지방 유지 - https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC healthy-eating daily vegetable guidance terms", () => {
    const assessment = assessCancerFood("채소류, 매끼니 채소, 매일 채소");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["채소류", "매끼니 채소", "매일 채소"]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the NCC healthy-eating vegetable and fruit heading", () => {
    const assessment = assessCancerFood(
      "채소와 과일을 충분히 먹습니다; 채소와 과일 충분히 먹기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "채소와 과일을 충분히 먹습니다",
      "채소와 과일 충분히 먹기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 채소와 과일 충분히 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(balancedGuideText).toContain("채소와 과일을 충분히 먹습니다");
    expect(balancedGuideText).toContain("채소와 과일 충분히 먹기");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the NCC healthy-eating balanced diet heading", () => {
    const assessment = assessCancerFood(
      "다채로운 식단으로 균형 잡힌 식사를 합니다; 다채로운 식단 균형 잡힌 식사",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "다채로운 식단으로 균형 잡힌 식사를 합니다",
      "다채로운 식단 균형 잡힌 식사",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 다채로운 식단 균형 식사 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(balancedGuideText).toContain("다채로운 식단으로 균형 잡힌 식사를 합니다");
    expect(balancedGuideText).toContain("다채로운 식단 균형 잡힌 식사");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating unrefined grain and legume guidance terms", () => {
    const assessment = assessCancerFood("도정하지 않은 곡류, 두류, 두류 가공품, 두유, 두부");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["도정하지 않은 곡류", "두류", "두류 가공품", "두유", "두부"]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 도정하지 않은 곡류·두류 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating unrefined grain sentence", () => {
    const assessment = assessCancerFood(
      "다양한 종류의 잡곡과 도정하지 않은 곡류를 섭취합니다; 잡곡 도정하지 않은 곡류 섭취",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "다양한 종류의 잡곡과 도정하지 않은 곡류를 섭취합니다",
      "잡곡 도정하지 않은 곡류 섭취",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 잡곡·도정하지 않은 곡류 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating daily legume guidance phrases", () => {
    const assessment = assessCancerFood(
      "두류 매일 섭취, 두류 가공품 매일 섭취, 두유 두부 매일 섭취",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "두류 매일 섭취",
      "두류 가공품 매일 섭취",
      "두유 두부 매일 섭취",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 두류·두류 가공품 매일 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating daily legume sentence", () => {
    const assessment = assessCancerFood(
      "두류와 두류 가공품 (두유, 두부 등)을 매일 섭취합니다; 두류 두류 가공품 두유 두부 매일 섭취",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "두류와 두류 가공품 (두유, 두부 등)을 매일 섭취합니다",
      "두류 두류 가공품 두유 두부 매일 섭취",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 두류·두류 가공품 매일 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating low-fat milk one-cup-about phrases", () => {
    const assessment = assessCancerFood(
      "저지방 우유 하루 1잔 정도, 하루 1잔 정도 저지방 우유",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "저지방 우유 하루 1잔 정도",
      "하루 1잔 정도 저지방 우유",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 정도 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating low-fat milk sentence", () => {
    const assessment = assessCancerFood(
      "저지방 우유를 하루 1잔 정도 마십니다; 저지방 우유 하루 1잔 정도 마시기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "저지방 우유를 하루 1잔 정도 마십니다",
      "저지방 우유 하루 1잔 정도 마시기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 정도 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating low-fat milk daily guidance terms", () => {
    const assessment = assessCancerFood(
      "하루 1잔 저지방 우유, 저지방 우유 하루 1잔, 저지방 우유 1잔, 저지방 우유",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "하루 1잔 저지방 우유",
      "저지방 우유 하루 1잔",
      "저지방 우유 1잔",
      "저지방 우유",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating daily fruit snack guidance terms", () => {
    const assessment = assessCancerFood(
      "매일 1회 이상 과일, 과일 매일 1회 이상, 과일 간식, 매일 과일 간식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "매일 1회 이상 과일",
      "과일 매일 1회 이상",
      "과일 간식",
      "매일 과일 간식",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating daily fruit sentence", () => {
    const assessment = assessCancerFood(
      "과일류는 매일 1회 이상 간식으로 섭취합니다; 과일류 매일 1회 이상 간식 섭취",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "과일류는 매일 1회 이상 간식으로 섭취합니다",
      "과일류 매일 1회 이상 간식 섭취",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating hot or spicy food limit terms", () => {
    const assessment = assessCancerFood(
      "너무 뜨겁거나 매운 음식, 너무 뜨거운 음식, 뜨거운 음식, 너무 매운 음식, 매운 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "너무 뜨겁거나 매운 음식",
      "너무 뜨거운 음식",
      "뜨거운 음식",
      "너무 매운 음식",
      "매운 음식",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 피하기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating hot or spicy food avoid phrases", () => {
    const assessment = assessCancerFood(
      "너무 뜨겁거나 매운 음식의 섭취는 피합니다, 너무 뜨겁거나 매운 음식 섭취 피하기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "너무 뜨겁거나 매운 음식의 섭취는 피합니다",
      "너무 뜨겁거나 매운 음식 섭취 피하기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 섭취 피하기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating seasoning and added salt or soy sauce limit terms", () => {
    const assessment = assessCancerFood(
      "인공조미료, 화학조미료, 추가 소금, 소금 추가, 추가 간장, 간장 추가",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "인공조미료",
      "화학조미료",
      "추가 소금",
      "소금 추가",
      "추가 간장",
      "간장 추가",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 인공조미료·추가 소금/간장 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating artificial seasoning limit sentence", () => {
    const assessment = assessCancerFood(
      "인공조미료(화학조미료 포함)의 사용을 제한하며 음식을 싱겁게 만들어 먹습니다; 인공조미료 화학조미료 사용 제한 싱겁게 만들어 먹기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "인공조미료(화학조미료 포함)의 사용을 제한하며 음식을 싱겁게 만들어 먹습니다",
      "인공조미료 화학조미료 사용 제한 싱겁게 만들어 먹기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 인공조미료 제한·싱겁게 만들기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating added salt or soy sauce avoid phrases", () => {
    const assessment = assessCancerFood(
      "음식을 먹을 때 추가로 소금이나 간장을 사용하지 않습니다, 소금이나 간장 사용하지 않기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "음식을 먹을 때 추가로 소금이나 간장을 사용하지 않습니다",
      "소금이나 간장 사용하지 않기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 추가 소금이나 간장 사용하지 않기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating salted storage and soup-broth limit terms", () => {
    const assessment = assessCancerFood(
      "젓갈류, 염 저장식품, 소금 저장식품, 김치 또는 장아찌류, 국이나 찌개의 국물, 찌개 국물, 국물 섭취",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "젓갈류",
      "염 저장식품",
      "소금 저장식품",
      "김치 또는 장아찌류",
      "국이나 찌개의 국물",
      "찌개 국물",
      "국물 섭취",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating salted storage food limit sentence", () => {
    const assessment = assessCancerFood(
      "젓갈류와 염(소금) 저장식품(김치 또는 장아찌류 등)의 섭취는 제한합니다; 젓갈류 염 소금 저장식품 김치 장아찌류 섭취 제한",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "젓갈류와 염(소금) 저장식품(김치 또는 장아찌류 등)의 섭취는 제한합니다",
      "젓갈류 염 소금 저장식품 김치 장아찌류 섭취 제한",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 젓갈류·염 저장식품 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating soup broth limit sentence", () => {
    const assessment = assessCancerFood(
      "국이나 찌개의 국물 섭취는 제한합니다; 국이나 찌개 국물 섭취 제한",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "국이나 찌개의 국물 섭취는 제한합니다",
      "국이나 찌개 국물 섭취 제한",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 국/찌개 국물 섭취 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating low-salt kimchi guidance terms", () => {
    const assessment = assessCancerFood(
      "저염 김치, 짜지 않은 김치, 싱겁게 만든 김치, 짜지 않은 김치류",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["저염 김치", "짜지 않은 김치", "싱겁게 만든 김치", "짜지 않은 김치류"]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 짜지 않은 김치류 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating low-salt kimchi preparation phrases", () => {
    const assessment = assessCancerFood(
      "김치류는 짜지 않게 만들어 먹습니다, 김치류 짜지 않게 만들기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "김치류는 짜지 않게 만들어 먹습니다",
      "김치류 짜지 않게 만들기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 김치류 짜지 않게 만들기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the NCC healthy-eating low-salt food heading", () => {
    const assessment = assessCancerFood(
      "음식을 짜지 않게 먹습니다; 음식을 짜지 않게 먹기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["음식을 짜지 않게 먹습니다", "음식을 짜지 않게 먹기"]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 음식을 짜지 않게 먹기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(balancedGuideText).toContain("음식을 짜지 않게 먹습니다");
    expect(balancedGuideText).toContain("음식을 짜지 않게 먹기");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
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
    expect(matchesByTerm["비살균 우유"].sourceUrl).toBe(
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

  it("exposes official-source cancer food guide categories without cure-food claims", () => {
    expect(cancerFoodGuideCategories.map((category) => category.id)).toEqual([
      "balanced",
      "limit",
      "care-team",
    ]);
    expect(
      cancerFoodGuideCategories.flatMap((category) =>
        category.items.flatMap((item) => item.sourceIds),
      ),
    ).toContain("nccCervicalDiet");
    expect(
      cancerFoodGuideCategories.flatMap((category) =>
        category.items.flatMap((item) => item.sourceIds),
      ),
    ).toContain("nccImmuneLowDiet");
    expect(
      cancerFoodGuideCategories.flatMap((category) =>
        category.items.flatMap((item) => item.sourceIds),
      ),
    ).toContain("nccCervicalFoodPrevention");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items[0]
        .detail,
    ).toContain("특별히 피하거나 추천하는 음식은 없");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("당근");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("잡곡밥");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("아욱된장국");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("미역국");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("샐러드(달걀)");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("귀리빵");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("통밀 식빵");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("생채");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("등푸른 생선");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("콩");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("저염 김치");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("김치류는 짜지 않게 만들어 먹습니다");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("김치류 짜지 않게 만들기");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("생채소");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("채소류(생채소, 나물, 샐러드, 쌈류 등)를 매일, 매끼니 충분히 먹습니다");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("채소류 생채소 나물 샐러드 쌈류 매일 매끼니 충분히");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("과일류는 매일 1회 이상 간식으로 섭취합니다");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("과일류 매일 1회 이상 간식 섭취");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("다양한 종류의 잡곡과 도정하지 않은 곡류를 섭취합니다");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("잡곡 도정하지 않은 곡류 섭취");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("쌈류");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("매일 매끼니 충분히");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("두류 매일 섭취");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("두유 두부 매일 섭취");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("두류와 두류 가공품 (두유, 두부 등)을 매일 섭취합니다");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("두류 두류 가공품 두유 두부 매일 섭취");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("저지방 우유 하루 1잔 정도");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("하루 1잔 정도 저지방 우유");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("모차렐라");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("저지방 우유를 하루 1잔 정도 마십니다");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("저지방 우유 하루 1잔 정도 마시기");
    const limitGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "limit",
    )?.items;
    const processedMeatGuide = limitGuideItems?.find(
      (item) => item.label === "가공육·탄 음식·튀김",
    );
    const limitGuideText = limitGuideItems
      ?.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    expect(limitGuideItems?.flatMap((item) => item.sourceIds)).toContain(
      "nccCervicalPracticeDiet",
    );
    expect(limitGuideText).toContain("햄구이");
    expect(limitGuideText).toContain("초코칩쿠키");
    expect(limitGuideText).toContain("단무지");
    expect(limitGuideText).toContain("국물");
    expect(limitGuideText).toContain("우엉조림");
    expect(limitGuideText).toContain("쌀밥");
    expect(limitGuideText).toContain("배추김치");
    expect(limitGuideText).toContain("열무김치");
    expect(limitGuideText).toContain("가당 제품");
    expect(limitGuideText).toContain("소고기");
    expect(limitGuideText).toContain("돼지고기");
    expect(limitGuideText).toContain("붉은색 육류 주 3인분");
    expect(limitGuideText).toContain(
      "붉은색 육류 섭취 시 1회에 1인분씩, 주 3인분(익힌 상태로 350~500g)을 넘지 않도록 합니다",
    );
    expect(limitGuideText).toContain("붉은색 육류 1회 1인분 주 3인분 350~500g 이하");
    expect(limitGuideText).toContain("익힌 상태 350~500g");
    expect(limitGuideText).toContain("너무 뜨겁거나 매운 음식의 섭취는 피합니다");
    expect(limitGuideText).toContain("너무 뜨겁거나 매운 음식 섭취 피하기");
    expect(limitGuideText).toContain(
      "인공조미료(화학조미료 포함)의 사용을 제한하며 음식을 싱겁게 만들어 먹습니다",
    );
    expect(limitGuideText).toContain("인공조미료 화학조미료 사용 제한 싱겁게 만들어 먹기");
    expect(limitGuideText).toContain("음식을 먹을 때 추가로 소금이나 간장을 사용하지 않습니다");
    expect(limitGuideText).toContain("소금이나 간장 사용하지 않기");
    expect(limitGuideText).toContain(
      "젓갈류와 염(소금) 저장식품(김치 또는 장아찌류 등)의 섭취는 제한합니다",
    );
    expect(limitGuideText).toContain("젓갈류 염 소금 저장식품 김치 장아찌류 섭취 제한");
    expect(limitGuideText).toContain("국이나 찌개의 국물 섭취는 제한합니다");
    expect(limitGuideText).toContain("국이나 찌개 국물 섭취 제한");
    expect(limitGuideText).toContain("햄·소시지 등 육가공품");
    expect(limitGuideText).toContain("햄, 소시지 등의 육가공품을 가급적 먹지 않습니다");
    expect(limitGuideText).toContain("햄 소시지 등의 육가공품 가급적 먹지 않기");
    expect(limitGuideText).toContain("가급적 먹지 않기");
    expect(limitGuideText).toContain("육가공품");
    expect(limitGuideText).toContain("가공육");
    expect(limitGuideText).toContain("탄 음식은 먹지 않기");
    expect(limitGuideText).toContain("숯불로 굽거나 직접 구워 탄 음식의 섭취는 삼가합니다");
    expect(limitGuideText).toContain("숯불로 굽거나 직접 구워 탄 음식 섭취 삼가");
    expect(limitGuideText).toContain("숯불로 굽거나 직접 구워서 탄 음식의 섭취는 삼가합니다");
    expect(limitGuideText).toContain("숯불로 굽거나 직접 구워서 탄 음식 섭취 삼가");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain(
      "육류 섭취 시 이를 구워 먹기(숯불구이, 직접 구이 등)보다는 삶거나 끓여서(수육, 보쌈 등) 먹습니다",
    );
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "balanced")?.items
        .map((item) => `${item.label} ${item.detail} ${item.examples}`)
        .join(" "),
    ).toContain("육류 구워 먹기보다는 삶거나 끓여서 수육 보쌈 먹기");
    expect(limitGuideText).toContain("직접 구워 탄 음식");
    expect(limitGuideText).toContain("지방 함량이 많은 부위의 육류 섭취는 제한합니다");
    expect(limitGuideText).toContain("지방 함량이 많은 육류 부위 섭취 제한");
    expect(limitGuideText).toContain("직화 구이");
    expect(limitGuideText).toContain("튀김 조리");
    expect(processedMeatGuide?.sourceIds).toContain("nccPreventionMealExamples");
    expect(
      cancerFoodGuideCategories.find((category) => category.id === "care-team")?.items
        .map((item) => item.label)
        .join(" "),
    ).toContain("날음식·비살균");
    expect(JSON.stringify(cancerFoodGuideCategories)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical-specific fresh food examples without cure claims", () => {
    const assessment = assessCancerFood("당근, 미역, 차, 시금치");
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("ok");
    expect(matchesByTerm.당근).toMatchObject({
      level: "ok",
      reason: "자궁경부암 예방 관련 신선식품 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(matchesByTerm.미역).toMatchObject({
      level: "ok",
      reason: "자궁경부암 예방 관련 신선식품 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(matchesByTerm.차).toMatchObject({
      level: "ok",
      reason: "자궁경부암 예방 관련 신선식품 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(matchesByTerm.시금치).toMatchObject({
      level: "ok",
      reason: "자궁경부암 예방 관련 신선식품 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(assessment.summary).toContain("암을 치료하지");
    expect(formatFoodMatchEvidence(matchesByTerm.당근)).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/",
    );
  });

  it("recognizes NCC cervical risk-factor low fruit and vegetable intake wording", () => {
    const assessment = assessCancerFood(
      "과일과 채소의 섭취가 적은 식이, 과일 채소 섭취 부족, 채소와 과일을 거의 안 먹음",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalRiskFactors.label).toBe(
      "국가암정보센터 자궁경부암 위험요인",
    );
    expect(foodGuidanceSources.nccCervicalRiskFactors.url).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4884",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "과일과 채소의 섭취가 적은 식이",
      "과일 채소 섭취 부족",
      "채소와 과일을 거의 안 먹음",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 자궁경부암 위험요인 채소·과일 섭취 부족 확인 후보",
        sourceId: "nccCervicalRiskFactors",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 자궁경부암 위험요인 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4884",
      );
    }
    expect(limitGuideText).toContain("채소·과일 섭취 부족 확인");
    expect(limitGuideText).toContain("과일과 채소의 섭취가 적은 식이");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating daily vegetable guidance terms", () => {
    const assessment = assessCancerFood(
      "생채소, 샐러드, 쌈류, 매일 매끼니 충분히",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["생채소", "샐러드", "쌈류", "매일 매끼니 충분히"]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating daily vegetable sentence", () => {
    const assessment = assessCancerFood(
      "채소류(생채소, 나물, 샐러드, 쌈류 등)를 매일, 매끼니 충분히 먹습니다; 채소류 생채소 나물 샐러드 쌈류 매일 매끼니 충분히",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "채소류(생채소, 나물, 샐러드, 쌈류 등)를 매일, 매끼니 충분히 먹습니다",
      "채소류 생채소 나물 샐러드 쌈류 매일 매끼니 충분히",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical prevention practice-guide meal examples without treatment claims", () => {
    const assessment = assessCancerFood("과일샐러드, 채소샐러드, 우엉볶음, 귤");
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.nccCervicalPracticeDiet.label).toBe(
      "국가암정보센터 자궁경부암 실천지침 식생활",
    );
    expect(assessment.level).toBe("ok");
    expect(matchesByTerm.과일샐러드).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.채소샐러드).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.우엉볶음).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.귤).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(assessment.summary).toContain("암을 치료하지");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
    expect(formatFoodMatchEvidence(matchesByTerm.과일샐러드)).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
  });

  it("recognizes exact cervical practice-guide dish examples over generic food terms", () => {
    const assessment = assessCancerFood("브로콜리회, 시금치나물");
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(matchesByTerm.브로콜리회).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.시금치나물).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.브로콜리).toBeUndefined();
    expect(matchesByTerm.시금치).toBeUndefined();
    expect(matchesByTerm.나물).toBeUndefined();
    expect(matchesByTerm.회).toBeUndefined();
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide grain and sodium-reduction replacements", () => {
    const assessment = assessCancerFood("쌀밥, 흰쌀밥, 잡곡밥, 우엉조림, 우엉볶음");
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(assessment.summary).toContain("대체 예시");
    expect(matchesByTerm.쌀밥).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 식이섬유 증가 대체 전 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.흰쌀밥).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 식이섬유 증가 대체 전 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.잡곡밥).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.우엉조림).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 나트륨 감소 대체 전 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.우엉볶음).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide limit examples without contradicting replacements", () => {
    const assessment = assessCancerFood(
      "햄구이, 초코칩쿠키, 단무지, 국물, 과일샐러드, 채소샐러드",
    );
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(matchesByTerm.햄구이).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 식단 제한 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.초코칩쿠키).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 식단 제한 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.단무지).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 식단 제한 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.국물).toMatchObject({
      level: "watch",
      reason: "국·찌개 국물 제한 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.과일샐러드).toMatchObject({
      level: "ok",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.채소샐러드).toMatchObject({
      level: "ok",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(formatFoodMatchEvidence(matchesByTerm.햄구이)).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes concrete official-source food examples across support, limit, and care-team checks", () => {
    const assessment = assessCancerFood(
      "잡곡밥, 닭고기, 플레인 요구르트, 탄 고기, 젓갈, 초밥, 덜 익힌 계란, 약초",
    );
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("risk");
    expect(matchesByTerm.잡곡밥).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm.닭고기).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["플레인 요구르트"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["탄 고기"]).toMatchObject({
      level: "watch",
      reason: "직화·탄 음식 조리법 피하기",
      sourceId: "nccPreventionDiet",
    });
    expect(matchesByTerm.젓갈).toMatchObject({
      level: "watch",
      reason: "염장 식품은 조금만 섭취",
      sourceId: "nccPreventionDiet",
    });
    expect(matchesByTerm.초밥).toMatchObject({
      level: "risk",
      reason: "면역저하 시 익히지 않은 음식 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(matchesByTerm["덜 익힌 계란"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 날계란·덜 익힌 계란 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(matchesByTerm.약초).toMatchObject({
      level: "risk",
      reason: "보완대체요법·약초 복용 사실 진료팀 공유",
      sourceId: "nccComplementaryTherapy",
    });
    expect(formatFoodMatchEvidence(matchesByTerm.초밥)).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
  });

  it("recognizes NCC treatment nutrient carbohydrate and hydration examples", () => {
    const assessment = assessCancerFood("감자, 고구마, 옥수수, 물 6~8컵, 하루 6~8컵 물");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["감자", "고구마", "옥수수", "물 6~8컵", "하루 6~8컵 물"]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보",
        sourceId: "nccTreatmentNutrients",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
      );
    }
    expect(balancedGuideText).toContain("감자");
    expect(balancedGuideText).toContain("고구마");
    expect(balancedGuideText).toContain("옥수수");
    expect(balancedGuideText).toContain("물 6~8컵");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient water role source sentence", () => {
    const sourceSentence =
      "물은 중요한 영양소로 생각되지 않는 게 보통이지만, 사실은 혈액과 신체 조직의 핵심적인 성분이면서 영양소와 노폐물을 운반하고 체온을 유지해 주는 등 생명 유지에 필수적인 요소입니다. 수분의 섭취가 부족하거나, 구토‧설사나 고열이 지속되거나, 땀을 과도하게 흘릴 경우에는 탈수가 일어날 수 있습니다. 일반적으로 성인은 하루에 6~8컵 정도의 물이 필요합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 영양소 수분 생명 유지·탈수 예방 후보",
      sourceId: "nccTreatmentNutrients",
    });
    expect(terms).not.toContain("물 6~8컵");
    expect(terms).not.toContain("하루 6~8컵 물");
    expect(terms).not.toContain("변비 물 8~10컵");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient carbohydrate energy source sentence", () => {
    const sourceSentence =
      "탄수화물(carbohydrate)은 우리 몸에 열량을 공급하는 주요 에너지원으로, 이것이 부족하면 기초 체력이 저하하고 피곤해지며 체중이 줄게 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보",
      sourceId: "nccTreatmentNutrients",
    });
    expect(terms).not.toContain("감자");
    expect(terms).not.toContain("고구마");
    expect(terms).not.toContain("옥수수");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient carbohydrate food source sentence", () => {
    const sourceSentence =
      "탄수화물이 풍부하게 들어 있는 음식은 밥, 국수, 빵, 떡, 감자, 고구마, 옥수수 등입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 영양소 탄수화물 식품 예시 후보",
      sourceId: "nccTreatmentNutrients",
    });
    expect(terms).not.toContain("감자");
    expect(terms).not.toContain("고구마");
    expect(terms).not.toContain("옥수수");
    expect(terms).not.toContain("물 6~8컵");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient protein role source sentence", () => {
    const sourceSentence =
      "단백질(protein)은 체세포의 주성분으로서 우리 몸을 구성하고 유지하는 역할을 하며, 각종 효소와 호르몬, 항체 등의 성분이 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 영양소 단백질 구성·유지 후보",
      sourceId: "nccTreatmentNutrients",
    });
    expect(terms).not.toContain("치료 중 단백질 식품");
    expect(terms).not.toContain("치료 중 육류와 생선류");
    expect(terms).not.toContain("치료 중 달걀 두부 우유");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient protein food source sentence", () => {
    const sourceSentence =
      "단백질이 많이 든 식품으로는 쇠고기, 돼지고기, 닭고기 등의 육류와 생선류, 조개류, 달걀, 두부, 우유 등이 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 영양소 단백질 식품 예시 후보",
      sourceId: "nccTreatmentNutrients",
    });
    expect(terms).not.toContain("치료 중 단백질 식품");
    expect(terms).not.toContain("치료 중 육류와 생선류");
    expect(terms).not.toContain("치료 중 조개류");
    expect(terms).not.toContain("치료 중 달걀 두부 우유");
    expect(terms).not.toContain("두부");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient fat energy source sentence", () => {
    const sourceSentence =
      "지방(fat)은 탄수화물과 같이 우리 몸에 열량을 공급하는 주요 에너지원으로 참기름, 들기름, 콩기름, 버터 등에 함유되어 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 영양소 지방 에너지원 후보",
      sourceId: "nccTreatmentNutrients",
    });
    expect(terms).not.toContain("치료 중 참기름 들기름 콩기름 버터");
    expect(terms).not.toContain("치료 중 단백질 식품");
    expect(terms).not.toContain("치료 중 채소와 과일");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient vitamin mineral role source sentence", () => {
    const sourceSentence =
      "우리 몸의 생리 기능을 조절하는 대표적인 영양소로 비타민과 무기질(vitamins and minerals)이 있습니다. 신체의 성장‧발달과 건강 유지에 필수적이므로, 필요량은 적지만 규칙적으로 섭취하는 것이 좋습니다. 채소와 과일 등에 많이 들어 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 영양소 비타민·무기질 조절 후보",
      sourceId: "nccTreatmentNutrients",
    });
    expect(terms).not.toContain("치료 중 채소와 과일");
    expect(terms).not.toContain("치료 중 단백질 식품");
    expect(terms).not.toContain("치료 중 참기름 들기름 콩기름 버터");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment nutrient protein fat and vitamin mineral examples", () => {
    const assessment = assessCancerFood(
      "치료 중 단백질 식품, 치료 중 육류와 생선류, 치료 중 조개류, 치료 중 달걀 두부 우유, 치료 중 참기름 들기름 콩기름 버터, 치료 중 채소와 과일",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "치료 중 단백질 식품",
      "치료 중 육류와 생선류",
      "치료 중 조개류",
      "치료 중 달걀 두부 우유",
      "치료 중 참기름 들기름 콩기름 버터",
      "치료 중 채소와 과일",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 치료 중 영양소 단백질·지방·비타민/무기질 식품 후보",
        sourceId: "nccTreatmentNutrients",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 치료 중 영양소 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
      );
    }
    expect(balancedGuideText).toContain("치료 중 단백질 식품");
    expect(balancedGuideText).toContain("치료 중 참기름 들기름 콩기름 버터");
    expect(balancedGuideText).toContain("치료 중 채소와 과일");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment eating balance and no-special-food guidance", () => {
    const assessment = assessCancerFood(
      "치료 중 균형 잡힌 식사, 치료 중 충분한 열량과 단백질, 치료 중 비타민 및 무기질, 여러 가지 음식을 골고루, 암을 낫게 해주는 특별한 식품, 암을 낫게 해주는 특별한 영양소",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTreatmentEating.label).toBe(
      "국가암정보센터 치료 중 일반적인 식생활",
    );
    expect(foodGuidanceSources.nccTreatmentEating.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T471C472/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "치료 중 균형 잡힌 식사",
      "치료 중 충분한 열량과 단백질",
      "치료 중 비타민 및 무기질",
      "여러 가지 음식을 골고루",
      "암을 낫게 해주는 특별한 식품",
      "암을 낫게 해주는 특별한 영양소",
    ]);
    for (const term of [
      "치료 중 균형 잡힌 식사",
      "치료 중 충분한 열량과 단백질",
      "치료 중 비타민 및 무기질",
      "여러 가지 음식을 골고루",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 치료 중 균형식·충분한 영양 섭취 후보",
        sourceId: "nccTreatmentEating",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 치료 중 일반적인 식생활 - https://www.cancer.go.kr/lay1/S1T471C472/contents.do",
      );
    }
    for (const term of ["암을 낫게 해주는 특별한 식품", "암을 낫게 해주는 특별한 영양소"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "국가암정보센터 치료 중 특별식품·특별영양소 cure claim 확인 필요",
        sourceId: "nccTreatmentEating",
      });
    }
    expect(balancedGuideText).toContain("치료 중 균형 잡힌 식사");
    expect(balancedGuideText).toContain("치료 중 충분한 열량과 단백질");
    expect(careTeamGuideText).toContain("특별한 항암 식품");
    expect(careTeamGuideText).toContain("특별한 항암 영양소");
  });

  it("recognizes NCC no special cancer-curing food or nutrient source sentence", () => {
    const sourceSentence = "암을 치유하는 특별한 음식이나 영양소는 없습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 중 특별식품·특별영양소 cure claim 확인 필요",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("특별한 항암 식품");
    expect(terms).not.toContain("특별한 항암 영양소");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC balanced healthy-eating source sentence", () => {
    const sourceSentence =
      "건강식이란 균형 잡힌 식사를 말합니다. 즉, 다양한 음식을 골고루 먹는 것입니다. 그래야 충분한 열량과 단백질, 비타민과 무기질을 섭취하여 좋은 영양 상태를 유지할 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("치료 중 균형 잡힌 식사");
    expect(terms).not.toContain("여러 가지 음식을 골고루");
    expect(terms).not.toContain("치료 중 충분한 열량과 단백질");
    expect(terms).not.toContain("치료 중 비타민 및 무기질");
    expect(terms).not.toContain("치료 중 충분한 열량 단백질 비타민 무기질");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC treatment right-eating calorie nutrient and rumor-food guidance", () => {
    const assessment = assessCancerFood(
      "치료 중 적정 열량과 필수 영양소, 치료 중 충분한 열량 단백질 비타민 무기질, 치료 중 고칼로리 고단백질 음식, 치료 중 좋아하는 음식과 여러 식품, 치료 중 다양한 음식 골고루, 몸에 좋다고 소문난 식품, 특정 식품이나 영양소 편중, 백혈구 수치를 올리는 특별한 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTreatmentRightEating.label).toBe(
      "국가암정보센터 치료 중 올바르게 식사하기",
    );
    expect(foodGuidanceSources.nccTreatmentRightEating.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "치료 중 적정 열량과 필수 영양소",
      "치료 중 충분한 열량 단백질 비타민 무기질",
      "치료 중 고칼로리 고단백질 음식",
      "치료 중 좋아하는 음식과 여러 식품",
      "치료 중 다양한 음식 골고루",
      "몸에 좋다고 소문난 식품",
      "특정 식품이나 영양소 편중",
      "백혈구 수치를 올리는 특별한 음식",
    ]);
    for (const term of [
      "치료 중 적정 열량과 필수 영양소",
      "치료 중 충분한 열량 단백질 비타민 무기질",
      "치료 중 고칼로리 고단백질 음식",
      "치료 중 좋아하는 음식과 여러 식품",
      "치료 중 다양한 음식 골고루",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
        sourceId: "nccTreatmentRightEating",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
      );
    }
    for (const term of [
      "몸에 좋다고 소문난 식품",
      "특정 식품이나 영양소 편중",
      "백혈구 수치를 올리는 특별한 음식",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
        sourceId: "nccTreatmentRightEating",
      });
    }
    expect(balancedGuideText).toContain("치료 중 고칼로리 고단백질 음식");
    expect(balancedGuideText).toContain("치료 중 좋아하는 음식과 여러 식품");
    expect(careTeamGuideText).toContain("몸에 좋다고 소문난 식품");
    expect(careTeamGuideText).toContain("백혈구 수치를 올리는 특별한 음식");
  });

  it("recognizes NCC no special food for raising WBC source sentence", () => {
    const assessment = assessCancerFood("백혈구 수치를 올리는 특별한 음식은 없습니다");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual(["백혈구 수치를 올리는 특별한 음식은 없습니다"]);
    expect(matchesByTerm["백혈구 수치를 올리는 특별한 음식은 없습니다"]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("백혈구 수치를 올리는 특별한 음식");
    expect(careTeamGuideText).toContain("백혈구 수치를 올리는 특별한 음식은 없습니다");
    expect(
      formatFoodMatchEvidence(matchesByTerm["백혈구 수치를 올리는 특별한 음식은 없습니다"]),
    ).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC no special WBC food natural recovery source sentence pair", () => {
    const sourceSentence =
      "백혈구 수치를 올리는 특별한 음식은 없습니다. 이 수치는 시간이 지나면 자연히 회복됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("백혈구 수치를 올리는 특별한 음식은 없습니다");
    expect(terms).not.toContain("백혈구 수치를 올리는 특별한 음식");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC rumored-food calorie-essential-nutrient neglect caution source sentence", () => {
    const sourceSentence =
      "암환자에게 식생활이 중요하다는 것은 누구나 압니다. 그러나 대부분의 사람들은 몸에 좋다고 소문난 식품이나 영양소에만 관심을 기울이고, 적정 열량(칼로리)과 필수 영양소의 섭취는 제대로 고려하지 않는 수가 많습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("몸에 좋다고 소문난 식품");
    expect(terms).not.toContain("몸에 좋다고 소문난 영양소");
    expect(terms).not.toContain("특정 식품이나 영양소 편중");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC biased food or nutrient intake warning source sentence", () => {
    const assessment = assessCancerFood(
      "암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다",
    ]);
    expect(
      matchesByTerm[
        "암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다"
      ],
    ).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("특정 식품이나 영양소 편중");
    expect(careTeamGuideText).toContain(
      "암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다",
    );
    expect(
      formatFoodMatchEvidence(
        matchesByTerm[
          "암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다"
        ],
      ),
    ).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC high-calorie high-protein varied-food source sentence", () => {
    const sourceSentence =
      "고칼로리, 고단백질의 식품을 비롯한 다양한 음식을 골고루 섭취하는 것이 도움이 됩니다";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("치료 중 고칼로리 고단백질 음식");
    expect(terms).not.toContain("치료 중 다양한 음식 골고루");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating infection-risk reduction source sentence", () => {
    const sourceSentence = "감염의 위험을 감소시켜 줍니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain(
      "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating side-effect recovery source sentence", () => {
    const sourceSentence = "치료에 의한 부작용을 더 잘 극복하게 해줍니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("감염의 위험을 감소시켜 줍니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating active treatment participation source sentence", () => {
    const sourceSentence = "환자가 좋은 영양 상태로 치료에 적극 참여할 수 있게 해줍니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("치료에 의한 부작용을 더 잘 극복하게 해줍니다.");
    expect(terms).not.toContain("감염의 위험을 감소시켜 줍니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating anticancer-treatment cell-recovery source sentence", () => {
    const sourceSentence = "항암치료 로 손상된 세포의 재생을 도와줍니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("환자가 좋은 영양 상태로 치료에 적극 참여할 수 있게 해줍니다.");
    expect(terms).not.toContain("치료에 의한 부작용을 더 잘 극복하게 해줍니다.");
    expect(terms).not.toContain("감염의 위험을 감소시켜 줍니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating treatment-effect quality-of-life source sentence", () => {
    const sourceSentence = "따라서 치료 효과에도, 삶의 질에도 좋은 영향을 줄 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("항암치료 로 손상된 세포의 재생을 도와줍니다.");
    expect(terms).not.toContain("환자가 좋은 영양 상태로 치료에 적극 참여할 수 있게 해줍니다.");
    expect(terms).not.toContain("치료에 의한 부작용을 더 잘 극복하게 해줍니다.");
    expect(terms).not.toContain("감염의 위험을 감소시켜 줍니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating calorie-nutrient treatment-stamina source sentence", () => {
    const sourceSentence =
      "충분한 열량과 다양한 영양소를 섭취해야 암과 그 치료를 감당하고 부작용도 극복할 수 있는 체력이 만들어집니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("치료 중 충분한 열량 단백질 비타민 무기질");
    expect(terms).not.toContain("따라서 치료 효과에도, 삶의 질에도 좋은 영향을 줄 수 있습니다.");
    expect(terms).not.toContain("치료에 의한 부작용을 더 잘 극복하게 해줍니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating high-calorie high-protein fast-recovery source sentence", () => {
    const sourceSentence = "특히 고칼로리, 고단백질의 음식은 치료 효과를 높이고 빠른 회복을 돕습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain(
      "충분한 열량과 다양한 영양소를 섭취해야 암과 그 치료를 감당하고 부작용도 극복할 수 있는 체력이 만들어집니다.",
    );
    expect(terms).not.toContain(
      "고칼로리, 고단백질의 식품을 비롯한 다양한 음식을 골고루 섭취하는 것이 도움이 됩니다",
    );
    expect(terms).not.toContain("따라서 치료 효과에도, 삶의 질에도 좋은 영향을 줄 수 있습니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating preferred-food variety source sentence", () => {
    const sourceSentence =
      "따라서 암환자의 건강식이란 좋아하는 음식에다 다른 여러 식품을 고루 곁들여 먹는 것이라 하겠습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("치료 중 좋아하는 음식과 여러 식품");
    expect(terms).not.toContain("치료 중 다양한 음식 골고루");
    expect(terms).not.toContain(
      "특히 고칼로리, 고단백질의 음식은 치료 효과를 높이고 빠른 회복을 돕습니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC meal concern medical and dietitian consultation source sentence", () => {
    const sourceSentence =
      "암환자의 식사와 관련하여 고민이 있다면 의료진, 영양사와 상담하십시오. 적절한 영양 섭취에 관해 상담을 해드릴 것입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 중 의료진·영양사 식사 상담 필요",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("몸에 좋다고 소문난 식품");
    expect(terms).not.toContain("백혈구 수치를 올리는 특별한 음식");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC eating difficulty immune-low nutrition counseling source sentence", () => {
    const sourceSentence =
      "음식을 들기가 전반적으로 힘들고 면역력까지 저하된 경우에는 개별적으로 영양 상담을 받아야 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 중 의료진·영양사 식사 상담 필요",
      sourceId: "nccTreatmentRightEating",
    });
    expect(terms).not.toContain("몸에 좋다고 소문난 식품");
    expect(terms).not.toContain("백혈구 수치를 올리는 특별한 음식");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy eating support principle source paragraph", () => {
    const sourceSentence =
      "식사는 암 치료의 보조 요법이라고 할 수 있을 만큼 중요합니다. 암환자에게 제일가는 식사 원칙은 '잘 먹는 것' 입니다. 이를 위해서는 환자의 식욕과 선호에만 의존할 수 없습니다. 건강을 위해 올바른 식사를 하도록 적극 도와주려는 보호자들의 의지가 필요합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 보호자 지원 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 규칙적인 아침 점심 저녁");
    expect(terms).not.toContain("치료 중 다양한 음식 골고루");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC regular meals and varied side dishes source sentence", () => {
    const sourceSentence = "규칙적으로 아침, 점심, 저녁 식사를 하며, 반찬을 골고루 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 규칙적인 아침 점심 저녁");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC protein side dishes source sentence", () => {
    const sourceSentence =
      "끼니마다 고기나 생선, 달걀, 두부, 콩, 치즈 등 단백질 반찬을 충분히 곁들입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 단백질 반찬 충분히");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC rice bread crackers rice-cake and porridge source sentence", () => {
    const sourceSentence =
      "밥은 매끼 반 그릇에서 한 그릇 정도 먹고, 간식으로 빵 종류와 크래커, 떡 등을 조금씩 먹습니다. 죽을 먹어야 하는 경우에는 하루 4~5번 이상 자주 드는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 밥 반 그릇에서 한 그릇");
    expect(terms).not.toContain("치료 중 죽 하루 4~5번 이상");
    expect(terms).not.toContain("크래커");
    expect(terms).not.toContain("떡");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC two vegetable side dishes source sentence", () => {
    const sourceSentence = "채소 반찬은 매끼 두 가지 이상을 충분히 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 채소 반찬 매끼 두 가지 이상");
    expect(terms).not.toContain("채소 반찬");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC minced or blended food source sentence for chewing and swallowing difficulty", () => {
    const sourceSentence = "씹거나 삼키기 힘든 경우에는 다지거나 갈아서 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 씹거나 삼키기 힘듦");
    expect(terms).not.toContain("치료 중 다지거나 갈아서 먹기");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC fruit one or two times daily source sentence", () => {
    const sourceSentence = "한 가지 이상의 과일을 하루에 한두 번 정도 먹는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 과일 하루 한두 번");
    expect(terms).not.toContain("과일류");
    expect(terms).not.toContain("매일 과일");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC milk and dairy one cup daily source sentence", () => {
    const sourceSentence = "우유와 유제품은 하루 1컵(200ml) 이상 마십니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 우유와 유제품 하루 1컵");
    expect(terms).not.toContain("우유나 유제품");
    expect(terms).not.toContain("저지방 유제품");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC yogurt soy milk and cheese substitute source sentence", () => {
    const sourceSentence =
      "우유가 맞지 않을 경우엔 요구르트, 두유, 치즈 따위를 대신 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 요구르트 두유 치즈");
    expect(terms).not.toContain("요구르트");
    expect(terms).not.toContain("두유");
    expect(terms).not.toContain("치즈");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC oil seasoning source sentence", () => {
    const sourceSentence =
      "식용유, 참기름, 버터 등의 기름은 볶음이나 나물 요리에 양념으로 사용합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("치료 중 참기름 들기름 콩기름 버터");
    expect(terms).not.toContain("참기름");
    expect(terms).not.toContain("버터");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC seasoning moderation source sentence", () => {
    const sourceSentence =
      "양념과 조미료를 적당히 사용하되 너무 맵거나 짜지 않게 요리합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("음식을 짜지 않게 먹습니다");
    expect(terms).not.toContain("음식을 짜지 않게 먹기");
    expect(terms).not.toContain("인공조미료");
    expect(terms).not.toContain("화학조미료");
    expect(terms).not.toContain("너무 매운 음식");
    expect(terms).not.toContain("매운 음식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC soup drink and dessert moderation source sentence", () => {
    const sourceSentence = "국, 음료, 후식은 적당히 먹는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
      sourceId: "nccTreatmentHealthyEatingTips",
    });
    expect(terms).not.toContain("국이나 찌개의 국물 섭취는 제한합니다");
    expect(terms).not.toContain("국이나 찌개 국물 섭취 제한");
    expect(terms).not.toContain("국물 섭취");
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC treatment healthy-eating practical meal examples", () => {
    const assessment = assessCancerFood(
      "치료 중 규칙적인 아침 점심 저녁, 치료 중 밥 반 그릇에서 한 그릇, 치료 중 죽 하루 4~5번 이상, 치료 중 단백질 반찬 충분히, 치료 중 채소 반찬 매끼 두 가지 이상, 치료 중 과일 하루 한두 번, 치료 중 우유와 유제품 하루 1컵, 치료 중 요구르트 두유 치즈",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTreatmentHealthyEatingTips.label).toBe(
      "국가암정보센터 치료 중 건강식을 먹는 요령",
    );
    expect(foodGuidanceSources.nccTreatmentHealthyEatingTips.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "치료 중 규칙적인 아침 점심 저녁",
      "치료 중 밥 반 그릇에서 한 그릇",
      "치료 중 죽 하루 4~5번 이상",
      "치료 중 단백질 반찬 충분히",
      "치료 중 채소 반찬 매끼 두 가지 이상",
      "치료 중 과일 하루 한두 번",
      "치료 중 우유와 유제품 하루 1컵",
      "치료 중 요구르트 두유 치즈",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 치료 중 건강식 실천 식품 후보",
        sourceId: "nccTreatmentHealthyEatingTips",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
      );
    }
    expect(balancedGuideText).toContain("치료 중 단백질 반찬 충분히");
    expect(balancedGuideText).toContain("치료 중 채소 반찬 매끼 두 가지 이상");
    expect(balancedGuideText).toContain("치료 중 우유와 유제품 하루 1컵");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|특효|완치/);
  });

  it("recognizes NCC after-treatment healthy eating source sentence", () => {
    const sourceSentence =
      "암에 대한 모든 치료들이 끝난 후에는 건강한 식생활을 위한 식사지침을 따르도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 건강한 식생활");
    expect(terms).not.toContain("치료 후 다채로운 식단과 균형잡힌 식사");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/암을 낫게|완치|재발을 막/);
  });

  it("recognizes NCC after-treatment recurrence food myth source sentence", () => {
    const sourceSentence =
      "어떤 특정 식품이나 음식에 의해 암의 재발을 막는다는 연구보고는 없습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 후 재발 예방 특정식품 근거 없음",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("특정 식품이나 영양소 편중");
    expect(terms).not.toContain("몸에 좋다고 소문난 식품");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효/);
  });

  it("recognizes NCC after-treatment supplement evidence source sentence", () => {
    const sourceSentence =
      "시중에 암 예방 효과가 있다고 알려진 여러 식품들이나 건강 보조식품들은 아직 안정성이나 효과에 대해 과학적으로 입증된 근거가 없으므로 선택 시 주의가 필요합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 후 건강보조식품 과학적 근거 주의",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 건강보조식품 민간요법 주의");
    expect(terms).not.toContain("보충제");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효/);
  });

  it("recognizes NCC after-treatment diet difficulty consultation source sentence", () => {
    const sourceSentence =
      "단, 암 치료가 끝난 후 부작용 등으로 적절한 식사 섭취가 힘들거나 고혈압, 당뇨병, 고지혈증 등으로 식사조절이 필요한 경우 담당의사 및 임상영양사의 상담을 받도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 치료 후 식사 어려움·보조식품 상담 필요",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 부작용으로 식사 섭취 힘듦");
    expect(terms).not.toContain("치료 후 건강보조식품 민간요법 주의");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment diverse foods nutrient source sentence", () => {
    const sourceSentence =
      "우리 몸에 필요한 영양소는 다양한 식품과 음식을 통하여 섭취해야 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 건강한 식생활");
    expect(terms).not.toContain("치료 후 다채로운 식단과 균형잡힌 식사");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment balanced meal source sentence", () => {
    const sourceSentence =
      "균형잡힌 식사란 나에게 맞는 적당량으로, 매끼 적당량의 곡류와 고기, 생선, 계란, 두부 등의 다양한 단백질 식품을 1~2가지, 2~3가지의 채소류를 포함한 식사를 하고 우유 및 유제품류, 과일류를 하루 1~2회 간식으로 섭취합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 다채로운 식단과 균형잡힌 식사");
    expect(terms).not.toContain("치료 후 다양한 단백질 식품과 채소류");
    expect(terms).not.toContain("치료 후 우유 및 유제품류 과일류");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment colorful fruit vegetable whole-grain source sentence", () => {
    const sourceSentence =
      "다양한 색의 과일, 채소와 전곡류를 충분하게 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 과일 채소 전곡류 충분히");
    expect(terms).not.toContain("과일");
    expect(terms).not.toContain("채소류");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment fruit and vegetable nutrient benefit source sentence", () => {
    const sourceSentence =
      "과일과 채소에 들어있는 비타민, 무기질, 식이섬유소, 항산화 영양소 등이 암 예방 및 건강 증진에 도움이 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 과일 채소 전곡류 충분히");
    expect(terms).not.toContain("과일");
    expect(terms).not.toContain("채소류");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment fruit and vegetable frequency source sentence", () => {
    const sourceSentence =
      "다양한 종류와 색깔을 선택하고 채소는 매끼 2~3가지 이상, 과일은 매일 1~2회 섭취합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 과일 채소 전곡류 충분히");
    expect(terms).not.toContain("과일");
    expect(terms).not.toContain("채소류");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment whole-grain selection source sentence", () => {
    const sourceSentence =
      "도정이나 가공이 덜 된 전곡류(현미,보리 등의 잡곡류)의 식품을 선택합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 과일 채소 전곡류 충분히");
    expect(terms).not.toContain("현미");
    expect(terms).not.toContain("잡곡");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment healthy eating and limit guidance", () => {
    const assessment = assessCancerFood(
      "치료 후 건강한 식생활, 치료 후 다채로운 식단과 균형잡힌 식사, 치료 후 다양한 단백질 식품과 채소류, 치료 후 우유 및 유제품류 과일류, 치료 후 과일 채소 전곡류 충분히, 치료 후 가공육 제한, 치료 후 탄 음식 피하기, 치료 후 짠 음식 피하기, 치료 후 하루 한 두 잔 술도 피하기, 치료 후 부작용으로 식사 섭취 힘듦, 치료 후 건강보조식품 민간요법 주의",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAfterTreatmentHealthyEating.label).toBe(
      "국가암정보센터 치료 후 건강한 식생활",
    );
    expect(foodGuidanceSources.nccAfterTreatmentHealthyEating.url).toBe(
      "https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "치료 후 건강한 식생활",
      "치료 후 다채로운 식단과 균형잡힌 식사",
      "치료 후 다양한 단백질 식품과 채소류",
      "치료 후 우유 및 유제품류 과일류",
      "치료 후 과일 채소 전곡류 충분히",
      "치료 후 가공육 제한",
      "치료 후 탄 음식 피하기",
      "치료 후 짠 음식 피하기",
      "치료 후 하루 한 두 잔 술도 피하기",
      "치료 후 부작용으로 식사 섭취 힘듦",
      "치료 후 건강보조식품 민간요법 주의",
    ]);
    for (const term of [
      "치료 후 건강한 식생활",
      "치료 후 다채로운 식단과 균형잡힌 식사",
      "치료 후 다양한 단백질 식품과 채소류",
      "치료 후 우유 및 유제품류 과일류",
      "치료 후 과일 채소 전곡류 충분히",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
        sourceId: "nccAfterTreatmentHealthyEating",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
      );
    }
    for (const term of [
      "치료 후 가공육 제한",
      "치료 후 탄 음식 피하기",
      "치료 후 짠 음식 피하기",
      "치료 후 하루 한 두 잔 술도 피하기",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
        sourceId: "nccAfterTreatmentHealthyEating",
      });
    }
    for (const term of [
      "치료 후 부작용으로 식사 섭취 힘듦",
      "치료 후 건강보조식품 민간요법 주의",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "국가암정보센터 치료 후 식사 어려움·보조식품 상담 필요",
        sourceId: "nccAfterTreatmentHealthyEating",
      });
    }
    expect(balancedGuideText).toContain("치료 후 과일 채소 전곡류 충분히");
    expect(limitGuideText).toContain("치료 후 가공육 제한");
    expect(careTeamGuideText).toContain("치료 후 부작용으로 식사 섭취 힘듦");
  });

  it("recognizes NCC after-treatment processed meat source sentence", () => {
    const sourceSentence =
      "햄, 베이컨, 소시지 등의 가공육은 되도록 피합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("햄");
    expect(terms).not.toContain("베이컨");
    expect(terms).not.toContain("소시지");
    expect(terms).not.toContain("가공육");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment lean meat and charred food source sentence", () => {
    const sourceSentence =
      "육류는 적정량 (탁구공 1~2개 크기)으로 살코기 위주로 섭취하며, 조리 시 직화구이를 피하고 탄 음식을 먹지 않습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 탄 음식 피하기");
    expect(terms).not.toContain("직화구이");
    expect(terms).not.toContain("탄 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment salty food source sentence", () => {
    const sourceSentence = "짠 음식의 섭취를 피하고, 싱겁게 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 짠 음식 피하기");
    expect(terms).not.toContain("짠 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment low-sodium cooking source sentence", () => {
    const sourceSentence =
      "음식을 만들 때는 소금, 간장 등 짠맛이 나는 양념의 사용을 줄이고, 싱겁게 조리합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 짠 음식 피하기");
    expect(terms).not.toContain("소금");
    expect(terms).not.toContain("간장");
    expect(terms).not.toContain("짠 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment soup solids and salted foods source sentence", () => {
    const sourceSentence =
      "국이나 찌개 섭취 시에는 건더기 위주로 섭취하며, 김치, 젓갈, 장아찌, 피클 등 염장 식품의 섭취를 줄입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("국이나 찌개의 국물 섭취는 제한합니다");
    expect(terms).not.toContain("국이나 찌개 국물 섭취 제한");
    expect(terms).not.toContain("젓갈");
    expect(terms).not.toContain("장아찌");
    expect(terms).not.toContain("염장");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment alcohol avoidance source sentence", () => {
    const sourceSentence = "하루 한 두 잔의 술도 피합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("치료 후 하루 한 두 잔 술도 피하기");
    expect(terms).not.toContain("술");
    expect(terms).not.toContain("술·알코올");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC after-treatment alcohol prevention detail source sentence", () => {
    const sourceSentence =
      "암 예방을 위해서 하루 한 두 잔의 술도 피하는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("하루 한 두 잔의 술도 피합니다.");
    expect(terms).not.toContain("치료 후 하루 한 두 잔 술도 피하기");
    expect(terms).not.toContain("술");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC mouth-pain soft and irritating food examples", () => {
    const assessment = assessCancerFood(
      "흰죽, 닭죽, 호박죽, 쌀미음, 바나나, 수박, 과일통조림, 토마토주스, 토스트, 크래커, 말린 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "흰죽",
      "닭죽",
      "호박죽",
      "쌀미음",
      "바나나",
      "수박",
      "과일통조림",
      "토마토주스",
      "토스트",
      "크래커",
      "말린 음식",
    ]);
    for (const term of ["흰죽", "닭죽", "호박죽", "쌀미음", "바나나", "수박", "과일통조림"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보",
        sourceId: "nccMouthPainDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
      );
    }
    for (const term of ["토마토주스", "토스트", "크래커", "말린 음식"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보",
        sourceId: "nccMouthPainDiet",
      });
    }
    expect(balancedGuideText).toContain("흰죽");
    expect(balancedGuideText).toContain("과일통조림");
    expect(limitGuideText).toContain("토마토주스");
    expect(limitGuideText).toContain("크래커");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain soft-moist source sentence", () => {
    const sourceSentence = "부드럽고 촉촉한 음식을 준비합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 부드럽고 촉촉한 음식 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("흰죽");
    expect(terms).not.toContain("쌀미음");
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain easy-chew-swallow source sentence", () => {
    const sourceSentence = "씹고 삼키기 쉬운 음식을 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 씹고 삼키기 쉬운 음식 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("흰죽");
    expect(terms).not.toContain("쌀미음");
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain irritating food-drink source sentence", () => {
    const sourceSentence = "입안을 자극하는 음식이나 음료는 피하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 입과 목 통증 시 입안 자극 음식·음료 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("토마토주스");
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(terms).not.toContain("말린 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain soft-cooking small-size source sentence", () => {
    const sourceSentence =
      "요리를 할 때는 부드럽고 연해질 때까지 하도록 하며, 음식을 작은 크기로 자릅니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 부드러운 조리와 작은 크기 음식 준비 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("흰죽");
    expect(terms).not.toContain("쌀미음");
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain blended-food source sentence", () => {
    const sourceSentence = "경우에 따라서는 믹서로 곱게 갈도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 믹서로 곱게 간 음식 준비 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("흰죽");
    expect(terms).not.toContain("쌀미음");
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain hot-food temperature source sentence", () => {
    const sourceSentence =
      "뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 입과 목 통증 시 뜨거운 음식 자극과 상온 음식 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("뜨거운 음식");
    expect(terms).not.toContain("너무 뜨거운 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(terms).not.toContain("얼음조각");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain ice-chip source sentence", () => {
    const sourceSentence = "얼음조각을 먹는 것도 도움이 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 얼음조각 섭취 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("얼음조각");
    expect(terms).not.toContain("맑은 유동식, 얼음조각 등");
    expect(terms).not.toContain("샤베트");
    expect(terms).not.toContain("뜨거운 음식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth moisture and saliva-stimulation food examples", () => {
    const assessment = assessCancerFood(
      "물 조금씩 자주, 물 한 모금, 소스나 드레싱, 딱딱한 사탕, 껌, 껌 씹기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "물 조금씩 자주",
      "물 한 모금",
      "소스나 드레싱",
      "딱딱한 사탕",
      "껌",
      "껌 씹기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 입안 건조증 시 침 분비·삼킴 도움 후보",
        sourceId: "nccDryMouthDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
      );
    }
    expect(balancedGuideText).toContain("물 조금씩 자주");
    expect(balancedGuideText).toContain("소스나 드레싱");
    expect(balancedGuideText).toContain("딱딱한 사탕");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth nearby-water source sentence", () => {
    const sourceSentence = "가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입안 건조증 시 가까운 물과 잦은 소량 수분 섭취 후보",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("물 조금씩 자주");
    expect(terms).not.toContain("물 한 모금");
    expect(terms).not.toContain("소스나 드레싱");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth moist-food source sentence", () => {
    const sourceSentence =
      "삼키기 쉽게 하기 위해 음식에 소스나 드레싱을 첨가하여 촉촉하게 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입안 건조증 시 소스나 드레싱으로 촉촉한 음식 후보",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("소스나 드레싱");
    expect(terms).not.toContain("물 한 모금");
    expect(terms).not.toContain("딱딱한 사탕");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth broth-soaking source sentence", () => {
    const sourceSentence = "음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입안 건조증 시 육수나 국물에 적셔 먹는 촉촉한 음식 후보",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("국물");
    expect(terms).not.toContain("국물 섭취");
    expect(terms).not.toContain("국이나 찌개의 국물");
    expect(terms).not.toContain("국이나 찌개의 국물 섭취는 제한합니다");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth meal-sip straw source sentence", () => {
    const sourceSentence =
      "식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입안 건조증 시 식사 중간 수분 한 모금과 빨대 도움 후보",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("물 한 모금");
    expect(terms).not.toContain("물 조금씩 자주");
    expect(terms).not.toContain("소스나 드레싱");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth saliva candy-gum source sentence", () => {
    const sourceSentence =
      "딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입안 건조증 시 딱딱한 사탕과 껌을 통한 침 분비 도움 후보",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("딱딱한 사탕");
    expect(terms).not.toContain("껌");
    expect(terms).not.toContain("껌 씹기");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth sweet-sour caution source sentence", () => {
    const sourceSentence =
      "아주 달거나 신음식을 먹으면 침분비가 많아집니다. 단, 입안이 헐거나 목구멍이 아플 경우에는 피하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 입안 건조증 시 단맛·신맛 침 분비와 구강·목 통증 시 회피 확인 후보",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("매우 단 음식");
    expect(terms).not.toContain("사탕, 쿠키 또는 케익 등과 같이 매우 단 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC dry-mouth soft-blended food source sentence", () => {
    const sourceSentence = "부드럽고 곱게 간 식품을 먹도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입안 건조증 시 부드럽고 곱게 간 식품 후보",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("경우에 따라서는 믹서로 곱게 갈도록 합니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC nausea easier foods and nausea-triggering food examples", () => {
    const assessment = assessCancerFood(
      "샤베트, 복숭아통조림, 맑은 유동식, 얼음조각, 기름진 음식, 매우 단 음식, 향이 강하거나 뜨거운 음식, 이상한 냄새가 나는 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "샤베트",
      "복숭아통조림",
      "맑은 유동식",
      "얼음조각",
      "기름진 음식",
      "매우 단 음식",
      "향이 강하거나 뜨거운 음식",
      "이상한 냄새가 나는 음식",
    ]);
    for (const term of ["샤베트", "복숭아통조림", "맑은 유동식", "얼음조각"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보",
        sourceId: "nccNauseaDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
      );
    }
    for (const term of [
      "기름진 음식",
      "매우 단 음식",
      "향이 강하거나 뜨거운 음식",
      "이상한 냄새가 나는 음식",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보",
        sourceId: "nccNauseaDiet",
      });
    }
    expect(balancedGuideText).toContain("샤베트");
    expect(balancedGuideText).toContain("맑은 유동식");
    expect(limitGuideText).toContain("매우 단 음식");
    expect(limitGuideText).toContain("향이 강하거나 뜨거운 음식");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC nausea toast cracker yogurt and sherbet source line", () => {
    const sourceSentence = "토스트, 크래커, 요거트, 샤베트";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움 시 위 부담 적은 토스트·크래커·요거트·샤베트 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(terms).not.toContain("요거트");
    expect(terms).not.toContain("샤베트");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea soft fruit and vegetable source sentence", () => {
    const sourceSentence = "복숭아통조림이나 다른 부드러운 과일과 채소";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움 시 위 부담 적은 부드러운 과일·채소 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("복숭아통조림");
    expect(terms).not.toContain("샤베트");
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("얼음조각");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea clear liquid and ice source phrase", () => {
    const sourceSentence = "맑은 유동식, 얼음조각 등";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움 시 위 부담 적은 맑은 유동식·얼음조각 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("얼음조각");
    expect(terms).not.toContain("샤베트");
    expect(terms).not.toContain("토스트, 크래커, 요거트, 샤베트");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea very-sweet-food source sentence", () => {
    const sourceSentence = "사탕, 쿠키 또는 케익 등과 같이 매우 단 음식";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움 유발 가능 매우 단 음식 확인 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("매우 단 음식");
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(terms).not.toContain("이상한 냄새가 나는 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea odd-smell-food source sentence", () => {
    const sourceSentence = "이상한 냄새가 나는 음식 등";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움 유발 가능 이상한 냄새 음식 확인 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("이상한 냄새가 나는 음식");
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("사탕, 쿠키 또는 케익 등과 같이 매우 단 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea do-not-force intake source sentence", () => {
    const sourceSentence = "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움 시 억지 섭취 피하기 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("샤베트");
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("기름진 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea treatment-before-eating source sentence", () => {
    const sourceSentence =
      "항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움 시 치료 전 식사 피하기 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("매우 단 음식");
    expect(terms).not.toContain("식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다.");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea antiemetic consultation source sentence", () => {
    const sourceSentence =
      "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 메스꺼움 항구토제 사용 의료진 상담 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain(
      "항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다.",
    );
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("항구토제");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|항구토제 복용 권장/);
  });

  it("recognizes NCC nausea hunger-before-eating source sentence", () => {
    const sourceSentence = "배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움 시 배고프기 전 식사 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain(
      "항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다.",
    );
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("매우 단 음식");
    expect(terms).not.toContain(
      "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea meal-environment source sentence", () => {
    const sourceSentence =
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움 시 식사 환경·식후 휴식 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다.");
    expect(terms).not.toContain("메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain(
      "항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다.",
    );
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea room ventilation source sentence", () => {
    const sourceSentence =
      "이상한 냄새가 나거나 너무 후덥지근한 방은 피하도록 하며, 음식냄새가 나지 않도록 자주 환기시킵니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움 시 냄새·후덥지근한 방 피하기 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain(
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.",
    );
    expect(terms).not.toContain("이상한 냄새가 나는 음식 등");
    expect(terms).not.toContain("이상한 냄새가 나는 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea water-and-clothing source sentence", () => {
    const sourceSentence =
      "물은 포만감을 줄 수 있기 때문에 천천히 조금씩 마시고, 식사 시에도 조금만 마시도록 합니다. 옷은 몸이 조이지 않도록 느슨하게 입습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움 시 물 천천히·느슨한 옷 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain(
      "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다.",
    );
    expect(terms).not.toContain(
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.",
    );
    expect(terms).not.toContain("배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다.");
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC nausea trigger-check consultation source sentence", () => {
    const sourceSentence =
      "메스꺼움이 언제, 무엇 때문에 나타나는지를 체크하고 의사선생님이나 간호사와 상의합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(foodGuidanceSources.nccNauseaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 메스꺼움 유발 요인 기록·의료진 상담 필요",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다.");
    expect(terms).not.toContain(
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.",
    );
    expect(terms).not.toContain(
      "물은 포만감을 줄 수 있기 때문에 천천히 조금씩 마시고, 식사 시에도 조금만 마시도록 합니다. 옷은 몸이 조이지 않도록 느슨하게 입습니다.",
    );
    expect(terms).not.toContain("메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain(
      "항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다.",
    );
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC vomiting staged liquid and soft-food examples", () => {
    const assessment = assessCancerFood(
      "구토 조절 후 물, 구토 조절 후 육수, 구토 맑은 유동식, 구토 후 미음, 구토 후 부드러운 식사, 우유가 들어있지 않은 제품",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccVomitingDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 구토",
    );
    expect(foodGuidanceSources.nccVomitingDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "구토 조절 후 물",
      "구토 조절 후 육수",
      "구토 맑은 유동식",
      "구토 후 미음",
      "구토 후 부드러운 식사",
      "우유가 들어있지 않은 제품",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보",
        sourceId: "nccVomitingDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
      );
    }
    expect(balancedGuideText).toContain("구토 조절 후 물");
    expect(balancedGuideText).toContain("구토 맑은 유동식");
    expect(balancedGuideText).toContain("우유가 들어있지 않은 제품");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC vomiting clear-liquid source sentence", () => {
    const sourceSentence =
      "구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccVomitingDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 구토",
    );
    expect(foodGuidanceSources.nccVomitingDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 구토 조절 후 맑은 유동식 증량 확인 후보",
      sourceId: "nccVomitingDiet",
    });
    expect(terms).not.toContain("구토 조절 후 물");
    expect(terms).not.toContain("구토 조절 후 육수");
    expect(terms).not.toContain("구토 맑은 유동식");
    expect(terms).not.toContain(
      "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC vomiting soft-food general-meal source sentence", () => {
    const sourceSentence =
      "맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다. 우유를 소화시키기 힘들면 우유가 들어있지 않은 제품을 이용하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccVomitingDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 구토",
    );
    expect(foodGuidanceSources.nccVomitingDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 구토 조절 후 미음·일반식 전환 확인 후보",
      sourceId: "nccVomitingDiet",
    });
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("우유가 들어있지 않은 제품");
    expect(terms).not.toContain(
      "구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.",
    );
    expect(terms).not.toContain(
      "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC vomiting active-intake restriction source sentence", () => {
    const sourceSentence = "구토증상이 있는 경우 먹거나 마시지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccVomitingDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 구토",
    );
    expect(foodGuidanceSources.nccVomitingDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 구토 중 먹거나 마시지 않기 확인 후보",
      sourceId: "nccVomitingDiet",
    });
    expect(terms).not.toContain(
      "구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.",
    );
    expect(terms).not.toContain(
      "맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다. 우유를 소화시키기 힘들면 우유가 들어있지 않은 제품을 이용하도록 합니다.",
    );
    expect(terms).not.toContain(
      "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.",
    );
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC vomiting clinician consultation source sentence", () => {
    const sourceSentence = "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccVomitingDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 구토",
    );
    expect(foodGuidanceSources.nccVomitingDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 구토 1~2일 이상 지속 의료진 상담 필요",
      sourceId: "nccVomitingDiet",
    });
    expect(terms).not.toContain("구토 조절 후 물");
    expect(terms).not.toContain("구토 맑은 유동식");
    expect(terms).not.toContain("구토 후 부드러운 식사");
    expect(terms).not.toContain(
      "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.",
    );
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC taste-change protein alternatives and seasoning examples", () => {
    const assessment = assessCancerFood(
      "입맛 변화 생선, 입맛 변화 계란, 입맛 변화 두부, 입맛 변화 콩, 입맛 변화 우유나 유제품, 고기 싫을 때 생선, 레몬즙 양념, 새콤달콤한 소스, 입맛 변화 오렌지, 입맛 변화 레몬",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTasteChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입맛의 변화",
    );
    expect(foodGuidanceSources.nccTasteChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "입맛 변화 생선",
      "입맛 변화 계란",
      "입맛 변화 두부",
      "입맛 변화 콩",
      "입맛 변화 우유나 유제품",
      "고기 싫을 때 생선",
      "레몬즙 양념",
      "새콤달콤한 소스",
      "입맛 변화 오렌지",
      "입맛 변화 레몬",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보",
        sourceId: "nccTasteChangeDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
      );
    }
    expect(balancedGuideText).toContain("입맛 변화 생선");
    expect(balancedGuideText).toContain("레몬즙 양념");
    expect(balancedGuideText).toContain("새콤달콤한 소스");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC taste-change appealing food source sentence", () => {
    const sourceSentence = "보기가 좋고 냄새도 좋은 식품을 선택하고 준비합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTasteChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입맛의 변화",
    );
    expect(foodGuidanceSources.nccTasteChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입맛 변화 시 보기 좋고 냄새 좋은 식품 준비 후보",
      sourceId: "nccTasteChangeDiet",
    });
    expect(terms).not.toContain("입맛 변화 생선");
    expect(terms).not.toContain("레몬즙 양념");
    expect(terms).not.toContain("새콤달콤한 소스");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC taste-change protein alternative source sentence", () => {
    const sourceSentence =
      "만약 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품을 이용합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTasteChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입맛의 변화",
    );
    expect(foodGuidanceSources.nccTasteChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입맛 변화 시 고기 대체 단백질 식품 후보",
      sourceId: "nccTasteChangeDiet",
    });
    expect(terms).not.toContain("입맛 변화 생선");
    expect(terms).not.toContain("입맛 변화 계란");
    expect(terms).not.toContain("입맛 변화 두부");
    expect(terms).not.toContain("입맛 변화 콩");
    expect(terms).not.toContain("입맛 변화 우유나 유제품");
    expect(terms).not.toContain("고기 싫을 때 생선");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC taste-change seasoning source sentence", () => {
    const sourceSentence =
      "고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTasteChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입맛의 변화",
    );
    expect(foodGuidanceSources.nccTasteChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입맛 변화 시 향이 좋은 양념류·새콤달콤한 소스 후보",
      sourceId: "nccTasteChangeDiet",
    });
    expect(terms).not.toContain("레몬즙 양념");
    expect(terms).not.toContain("새콤달콤한 소스");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC taste-change metallic taste citrus caution source sentence", () => {
    const sourceSentence =
      "신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있으므로 오렌지나 레몬같이 시큼한 식품을 사용합니다. 그러나 입과 목에 통증 이 있다면, 이런 식품들이 염증을 자극하거나 불편하게 하므로 주의합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTasteChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입맛의 변화",
    );
    expect(foodGuidanceSources.nccTasteChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입맛 변화 시 금속성 맛 신맛 식품·입목 통증 주의 후보",
      sourceId: "nccTasteChangeDiet",
    });
    expect(terms).not.toContain("입맛 변화 오렌지");
    expect(terms).not.toContain("입맛 변화 레몬");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC appetite-loss snack and liquid-food examples", () => {
    const assessment = assessCancerFood(
      "식욕부진 간식, 식욕부진 죽, 식욕부진 미음, 식욕부진 쥬스, 식욕부진 주스, 식욕부진 스프, 특수영양 보충음료",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "식욕부진 간식",
      "식욕부진 죽",
      "식욕부진 미음",
      "식욕부진 쥬스",
      "식욕부진 주스",
      "식욕부진 스프",
      "특수영양 보충음료",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보",
        sourceId: "nccAppetiteLossDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
      );
    }
    expect(balancedGuideText).toContain("식욕부진 간식");
    expect(balancedGuideText).toContain("식욕부진 죽");
    expect(balancedGuideText).toContain("특수영양 보충음료");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC appetite-loss eat-when-able source sentence", () => {
    const sourceSentence =
      "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 먹을 수 있을 때 식사 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("식욕부진 간식");
    expect(terms).not.toContain("식욕부진 죽");
    expect(terms).not.toContain("피로감 하루 중 가장 좋은 시간에 많이 먹기");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss favorite-foods variety source sentence", () => {
    const sourceSentence =
      "평소에 좋아하던 음식을 먹거나, 음식 형태에 변화를 주어 메뉴를 다양하게 해서 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 좋아하는 음식·메뉴 다양화 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("우울 좋아하는 음식");
    expect(terms).not.toContain("식욕부진 간식");
    expect(terms).not.toContain(
      "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss best-time source sentence", () => {
    const sourceSentence =
      "몸의 상태가 가장 좋을 때 많이 먹도록 합니다. 일반적으로 충분한 휴식을 취한 아침이 가장 좋다고 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 몸 상태가 좋은 때 식사 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("피로감 하루 중 가장 좋은 시간에 많이 먹기");
    expect(terms).not.toContain("피로감 휴식 후 먹기");
    expect(terms).not.toContain(
      "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss meal-environment source sentence", () => {
    const sourceSentence =
      "식사하는 시간, 장소, 분위기를 바꾸어 봅니다. 음악을 들으며 식사를 하거나 식탁보나 식기를 바꾸어 보는 것도 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 식사 환경 변경 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("식욕부진 간식");
    expect(terms).not.toContain(
      "평소에 좋아하던 음식을 먹거나, 음식 형태에 변화를 주어 메뉴를 다양하게 해서 먹습니다.",
    );
    expect(terms).not.toContain(
      "몸의 상태가 가장 좋을 때 많이 먹도록 합니다. 일반적으로 충분한 휴식을 취한 아침이 가장 좋다고 합니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss special-nutrition-drink source sentence", () => {
    const sourceSentence =
      "식사섭취가 계속적으로 힘들 경우에는 특수영양 보충음료를 이용합니다. (예) 그린비아, 뉴케어, 메디푸드, 엔슈어 등";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 특수영양 보충음료 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("특수영양 보충음료");
    expect(terms).not.toContain("식욕부진 간식");
    expect(terms).not.toContain(
      "식사하는 시간, 장소, 분위기를 바꾸어 봅니다. 음악을 들으며 식사를 하거나 식탁보나 식기를 바꾸어 보는 것도 좋습니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss snack-liquid source sentence", () => {
    const sourceSentence = "간식으로 죽, 미음, 쥬스, 스프, 우유 및 유제품 등을 활용하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 간식·유동식 활용 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("식욕부진 죽");
    expect(terms).not.toContain("식욕부진 미음");
    expect(terms).not.toContain("식욕부진 쥬스");
    expect(terms).not.toContain("식욕부진 스프");
    expect(terms).not.toContain("특수영양 보충음료");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss frequent-snack-access source sentence", () => {
    const sourceSentence =
      "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. (예) 과자, 빵, 과일, 우유 및 유제품, 두유, 치즈 등";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 조금씩 자주 먹는 간식 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("식욕부진 간식");
    expect(terms).not.toContain("식욕부진 죽");
    expect(terms).not.toContain("식욕부진 주스");
    expect(terms).not.toContain(
      "간식으로 죽, 미음, 쥬스, 스프, 우유 및 유제품 등을 활용하도록 합니다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss mouth-cleaning source sentence", () => {
    const sourceSentence = "입맛을 돋우기 위해서 식사전후에 입안을 청결하게 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 식사 전후 입안 청결 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("물 조금씩 자주");
    expect(terms).not.toContain("물 한 모금");
    expect(terms).not.toContain("껌 씹기");
    expect(terms).not.toContain("입맛 변화 오렌지");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss caregiver eating-support source sentence", () => {
    const sourceSentence =
      "주위 분들도 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고 환자 스스로 먹을 수 있게끔 도와줍니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 보호자 식사 지원 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("식욕부진 간식");
    expect(terms).not.toContain("특수영양 보충음료");
    expect(terms).not.toContain(
      "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.",
    );
    expect(terms).not.toContain("피로감 음식배달서비스");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss light-walk exercise source sentence", () => {
    const sourceSentence =
      "가벼운 산책 등 규칙적인 운동도 입맛을 증진시키는데 도움을 줄 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식욕부진 시 가벼운 산책·규칙적 운동 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain(
      "주위 분들도 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고 환자 스스로 먹을 수 있게끔 도와줍니다.",
    );
    expect(terms).not.toContain("입맛을 돋우기 위해서 식사전후에 입안을 청결하게 합니다.");
    expect(terms).not.toContain(
      "식사하는 시간, 장소, 분위기를 바꾸어 봅니다. 음악을 들으며 식사를 하거나 식탁보나 식기를 바꾸어 보는 것도 좋습니다.",
    );
    expect(terms).not.toContain("피로감 음식배달서비스");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss mealtime fluid source sentence", () => {
    const sourceSentence = "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 식욕부진 시 식사 중 수분 조절 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain("물 한 모금");
    expect(terms).not.toContain("물 조금씩 자주");
    expect(terms).not.toContain("특수영양 보충음료");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC appetite-loss water-timing source sentence", () => {
    const sourceSentence =
      "만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccAppetiteLossDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(foodGuidanceSources.nccAppetiteLossDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 식욕부진 시 많은 양의 물 섭취 시간 조절 후보",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(terms).not.toContain(
      "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다.",
    );
    expect(terms).not.toContain("물 한 모금");
    expect(terms).not.toContain("물 조금씩 자주");
    expect(terms).not.toContain("변비 하루 8~10컵 물");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
  });

  it("recognizes NCC diarrhea clear-liquid 12-24h source sentence", () => {
    const sourceSentence =
      "갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 설사 시 12~24시간 맑은 유동식 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("구토 맑은 유동식");
    expect(terms).not.toContain("설사 육수");
    expect(terms).not.toContain("설사 스포츠 음료");
    expect(terms).not.toContain("메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea room-temperature drink source sentence", () => {
    const sourceSentence =
      "너무 뜨겁거나 차가운 식품이나 음료는 피하고, 대신 상온의 음료를 마시도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 설사 시 너무 뜨겁거나 차가운 식품·음료 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("너무 뜨겁거나 매운 음식");
    expect(terms).not.toContain("뜨거운 음식");
    expect(terms).not.toContain("설사 커피");
    expect(terms).not.toContain("설사 우유 및 유제품");
    expect(terms).not.toContain(
      "갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다.",
    );
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea caffeine limit source sentence", () => {
    const sourceSentence =
      "커피와 초콜릿 등과 같은 카페인을 함유한 식품과 음료는 제한합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 설사 시 카페인 식품·음료 제한 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("설사 커피");
    expect(terms).not.toContain("설사 초콜릿");
    expect(terms).not.toContain("체중증가 초콜릿");
    expect(terms).not.toContain(
      "너무 뜨겁거나 차가운 식품이나 음료는 피하고, 대신 상온의 음료를 마시도록 합니다.",
    );
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea dairy lactose caution source sentence", () => {
    const sourceSentence =
      "우유 및 유제품을 먹을 때에는 주의합니다. 이는 우유에 들어있는 유당이 설사를 악화시킬 수 있기 때문입니다. 그러나 일반적으로 적은 양의 우유나 유제품은 소화시킬 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 설사 시 우유·유제품 유당 주의 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("설사 우유 및 유제품");
    expect(terms).not.toContain(
      "간식으로 죽, 미음, 쥬스, 스프, 우유 및 유제품 등을 활용하도록 합니다.",
    );
    expect(terms).not.toContain(
      "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. (예) 과자, 빵, 과일, 우유 및 유제품, 두유, 치즈 등",
    );
    expect(terms).not.toContain("커피와 초콜릿 등과 같은 카페인을 함유한 식품과 음료는 제한합니다.");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea high-fiber vegetable source phrase", () => {
    const sourcePhrase = "브로콜리, 옥수수, 말린 콩 등과 같은 고섬유 채소 등";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 설사 시 고섬유 채소 제한 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("옥수수");
    expect(terms).not.toContain("설사 브로콜리");
    expect(terms).not.toContain("설사 옥수수");
    expect(terms).not.toContain("설사 말린 콩");
    expect(terms).not.toContain("설사 생야채");
    expect(limitGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea fruit peel seed fiber source phrase", () => {
    const sourcePhrase = "생과일의 껍질, 씨, 끈적한 섬유소 부분";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 설사 시 생과일 껍질·씨·끈적한 섬유소 제한 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("설사 생과일 껍질");
    expect(terms).not.toContain("변비 생과일");
    expect(terms).not.toContain("브로콜리, 옥수수, 말린 콩 등과 같은 고섬유 채소 등");
    expect(limitGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea fatty food raw vegetable source phrase", () => {
    const sourcePhrase = "기름진 음식, 생야채";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 설사 시 기름진 음식·생야채 제한 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("설사 생야채");
    expect(terms).not.toContain("생과일의 껍질, 씨, 끈적한 섬유소 부분");
    expect(limitGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea hydration loss replacement source sentence", () => {
    const sourceSentence = "수분을 충분히 섭취하여 설사로 손실된 부분을 보충합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 설사 시 수분 손실 보충 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("설사 육수");
    expect(terms).not.toContain("설사 스포츠 음료");
    expect(terms).not.toContain("물 6~8컵");
    expect(terms).not.toContain("하루 6~8컵 물");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea electrolyte loss replacement source sentence", () => {
    const sourceSentence =
      "염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분과 칼륨이 들어있는 식품으로는 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 설사 시 염분·칼륨 손실 보충 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("설사 육수");
    expect(terms).not.toContain("설사 스포츠 음료");
    expect(terms).not.toContain("설사 바나나");
    expect(terms).not.toContain("물 6~8컵");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea small frequent meal source sentence", () => {
    const sourceSentence = "장이 약해져 있으므로 식사는 조금씩 자주 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 설사 시 장 약화·소량 빈번 식사 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain(
      "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. (예) 과자, 빵, 과일, 우유 및 유제품, 두유, 치즈 등",
    );
    expect(terms).not.toContain("식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea soft digestible food source sentence", () => {
    const sourceSentence = "소화되기 쉽고 부드러운 음식을 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 설사 시 소화 쉬운 부드러운 음식 확인 후보",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain("설사 흰죽");
    expect(terms).not.toContain("설사 쌀미음");
    expect(terms).not.toContain("구토 후 부드러운 식사");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea clinician consultation source sentence", () => {
    const sourceSentence =
      "설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 설사 심함·혈변·2일 이상 지속 의료진 상담 필요",
      sourceId: "nccDiarrheaDiet",
    });
    expect(terms).not.toContain(
      "갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다.",
    );
    expect(terms).not.toContain("설사 우유 및 유제품");
    expect(terms).not.toContain("설사 커피");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC diarrhea hydration soft-food and trigger examples", () => {
    const assessment = assessCancerFood(
      "설사 육수, 설사 스포츠 음료, 설사 바나나, 설사 으깬 감자, 설사 복숭아, 설사 토마토, 설사 흰죽, 설사 쌀미음, 설사 생야채, 설사 생과일 껍질, 설사 브로콜리, 설사 옥수수, 설사 말린 콩, 설사 커피, 설사 초콜릿, 설사 우유 및 유제품",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDiarrheaDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(foodGuidanceSources.nccDiarrheaDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "설사 육수",
      "설사 스포츠 음료",
      "설사 바나나",
      "설사 으깬 감자",
      "설사 복숭아",
      "설사 토마토",
      "설사 흰죽",
      "설사 쌀미음",
      "설사 생야채",
      "설사 생과일 껍질",
      "설사 브로콜리",
      "설사 옥수수",
      "설사 말린 콩",
      "설사 커피",
      "설사 초콜릿",
      "설사 우유 및 유제품",
    ]);
    for (const term of [
      "설사 육수",
      "설사 스포츠 음료",
      "설사 바나나",
      "설사 으깬 감자",
      "설사 복숭아",
      "설사 토마토",
      "설사 흰죽",
      "설사 쌀미음",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보",
        sourceId: "nccDiarrheaDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
      );
    }
    for (const term of [
      "설사 생야채",
      "설사 생과일 껍질",
      "설사 브로콜리",
      "설사 옥수수",
      "설사 말린 콩",
      "설사 커피",
      "설사 초콜릿",
      "설사 우유 및 유제품",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보",
        sourceId: "nccDiarrheaDiet",
      });
    }
    expect(balancedGuideText).toContain("설사 스포츠 음료");
    expect(balancedGuideText).toContain("설사 쌀미음");
    expect(limitGuideText).toContain("설사 생야채");
    expect(limitGuideText).toContain("설사 커피");
    expect(limitGuideText).toContain("설사 우유 및 유제품");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation hydration and fiber-food examples", () => {
    const assessment = assessCancerFood(
      "변비 물 8~10컵, 변비 하루 8~10컵 물, 변비 아침 찬물, 변비 도정 덜 된 곡류, 변비 생과일, 변비 생야채, 변비 섬유소 많은 식품",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "변비 물 8~10컵",
      "변비 하루 8~10컵 물",
      "변비 아침 찬물",
      "변비 도정 덜 된 곡류",
      "변비 생과일",
      "변비 생야채",
      "변비 섬유소 많은 식품",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 변비 시 수분·섬유소 섭취 후보",
        sourceId: "nccConstipationDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
      );
    }
    expect(balancedGuideText).toContain("변비 물 8~10컵");
    expect(balancedGuideText).toContain("변비 도정 덜 된 곡류");
    expect(balancedGuideText).toContain("변비 생야채");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation hydration source sentence", () => {
    const sourceSentence =
      "수분을 충분히 섭취합니다.(하루에 8~10컵 이상) 이는 변을 부드럽게 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 변비 시 8~10컵 이상 수분 섭취 확인 후보",
      sourceId: "nccConstipationDiet",
    });
    expect(terms).not.toContain("변비 물 8~10컵");
    expect(terms).not.toContain("변비 하루 8~10컵 물");
    expect(terms).not.toContain("변비 아침 찬물");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation morning cold-water source sentence", () => {
    const sourceSentence =
      "특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 변비 시 아침 기상 직후 차가운 물 확인 후보",
      sourceId: "nccConstipationDiet",
    });
    expect(terms).not.toContain("변비 물 8~10컵");
    expect(terms).not.toContain("변비 하루 8~10컵 물");
    expect(terms).not.toContain("변비 아침 찬물");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation fiber-food source sentence", () => {
    const sourceSentence =
      "도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 변비 시 섬유소 많은 식품 충분 섭취 확인 후보",
      sourceId: "nccConstipationDiet",
    });
    expect(terms).not.toContain("변비 도정 덜 된 곡류");
    expect(terms).not.toContain("변비 생과일");
    expect(terms).not.toContain("변비 생야채");
    expect(terms).not.toContain("변비 섬유소 많은 식품");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation food-intake amount source sentence", () => {
    const sourceSentence = "음식 섭취량이 너무 적지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 변비 시 음식 섭취량 부족 예방 확인 후보",
      sourceId: "nccConstipationDiet",
    });
    expect(terms).not.toContain("변비 도정 덜 된 곡류");
    expect(terms).not.toContain("변비 생과일");
    expect(terms).not.toContain("변비 섬유소 많은 식품");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation light-activity source sentence", () => {
    const sourceSentence =
      "가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 변비 시 가벼운 산책·걷기 확인 후보",
      sourceId: "nccConstipationDiet",
    });
    expect(terms).not.toContain(
      "가벼운 산책 등 규칙적인 운동도 입맛을 증진시키는데 도움을 줄 수 있습니다.",
    );
    expect(terms).not.toContain("변비 아침 찬물");
    expect(terms).not.toContain("변비 섬유소 많은 식품");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation abdominal-massage source sentence", () => {
    const sourceSentence =
      "누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 변비 시 부드러운 복부 마사지 확인 후보",
      sourceId: "nccConstipationDiet",
    });
    expect(terms).not.toContain(
      "특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다.",
    );
    expect(terms).not.toContain(
      "가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다.",
    );
    expect(terms).not.toContain("변비 아침 찬물");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC constipation clinician consultation source sentence", () => {
    const sourceSentence =
      "계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccConstipationDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(foodGuidanceSources.nccConstipationDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 변비 지속·조절 어려움 의료진 상담 필요",
      sourceId: "nccConstipationDiet",
    });
    expect(terms).not.toContain(
      "설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다.",
    );
    expect(terms).not.toContain(
      "누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다.",
    );
    expect(terms).not.toContain("변비 아침 찬물");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC weight-change calorie protein and high-calorie limit examples", () => {
    const assessment = assessCancerFood(
      "체중감소 김밥, 체중감소 주먹밥, 체중감소 야채죽, 체중감소 전복죽, 체중감소 계란죽, 체중감소 잣죽, 체중감소 감자, 체중감소 고구마, 체중감소 떡, 체중감소 만두, 체중감소 과일주스, 체중감소 과일통조림, 체중감소 땅콩버터, 체중감소 계란찜, 체중감소 두유, 체중감소 두부조림, 체중감소 생선전, 체중감소 어묵, 체중감소 요구르트, 체중증가 가공식품, 체중증가 김치, 체중증가 젓갈, 체중증가 장아찌류, 체중증가 청량 음료, 체중증가 초콜릿, 체중증가 사탕, 체중증가 과자류, 체중증가 고열량 간식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "체중감소 김밥",
      "체중감소 주먹밥",
      "체중감소 야채죽",
      "체중감소 전복죽",
      "체중감소 계란죽",
      "체중감소 잣죽",
      "체중감소 감자",
      "체중감소 고구마",
      "체중감소 떡",
      "체중감소 만두",
      "체중감소 과일주스",
      "체중감소 과일통조림",
      "체중감소 땅콩버터",
      "체중감소 계란찜",
      "체중감소 두유",
      "체중감소 두부조림",
      "체중감소 생선전",
      "체중감소 어묵",
      "체중감소 요구르트",
      "체중증가 가공식품",
      "체중증가 김치",
      "체중증가 젓갈",
      "체중증가 장아찌류",
      "체중증가 청량 음료",
      "체중증가 초콜릿",
      "체중증가 사탕",
      "체중증가 과자류",
      "체중증가 고열량 간식",
    ]);
    for (const term of [
      "체중감소 김밥",
      "체중감소 주먹밥",
      "체중감소 야채죽",
      "체중감소 전복죽",
      "체중감소 계란죽",
      "체중감소 잣죽",
      "체중감소 감자",
      "체중감소 고구마",
      "체중감소 떡",
      "체중감소 만두",
      "체중감소 과일주스",
      "체중감소 과일통조림",
      "체중감소 땅콩버터",
      "체중감소 계란찜",
      "체중감소 두유",
      "체중감소 두부조림",
      "체중감소 생선전",
      "체중감소 어묵",
      "체중감소 요구르트",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 체중감소 시 열량·단백질 보충 후보",
        sourceId: "nccWeightChangeDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
      );
    }
    for (const term of ["체중증가 가공식품", "체중증가 김치", "체중증가 젓갈", "체중증가 장아찌류"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 체중증가 시 고염분 식품 확인 후보",
        sourceId: "nccWeightChangeDiet",
      });
    }
    for (const term of [
      "체중증가 청량 음료",
      "체중증가 초콜릿",
      "체중증가 사탕",
      "체중증가 과자류",
      "체중증가 고열량 간식",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보",
        sourceId: "nccWeightChangeDiet",
      });
    }
    expect(balancedGuideText).toContain("체중감소 주먹밥");
    expect(balancedGuideText).toContain("체중감소 두부조림");
    expect(balancedGuideText).toContain("체중감소 요구르트");
    expect(limitGuideText).toContain("체중증가 가공식품");
    expect(limitGuideText).toContain("체중증가 청량 음료");
    expect(limitGuideText).toContain("체중증가 고열량 간식");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC weight-change weight-loss calorie protein source sentence", () => {
    const sourceSentence =
      "암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있습니다. 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨립니다. 그러므로 체중감소를 예방하기 위해서 열량과 단백질 등을 충분히 섭취해야 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 열량·단백질 충분 섭취 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 김밥");
    expect(terms).not.toContain("체중감소 주먹밥");
    expect(terms).not.toContain("체중감소 계란찜");
    expect(terms).not.toContain("체중감소 요구르트");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss rice examples source phrase", () => {
    const sourcePhrase = "밥 : 김밥, 초밥, 주먹밥, 볶음밥 등";
    const assessment = assessCancerFood(sourcePhrase);
    const standaloneSushiAssessment = assessCancerFood("초밥");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const standaloneSushiMatchesByTerm = Object.fromEntries(
      standaloneSushiAssessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 밥 조리 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 김밥");
    expect(terms).not.toContain("체중감소 주먹밥");
    expect(terms).not.toContain("초밥");
    expect(standaloneSushiAssessment.level).toBe("risk");
    expect(standaloneSushiMatchesByTerm.초밥).toMatchObject({
      level: "risk",
      reason: "면역저하 시 익히지 않은 음식 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss porridge examples source phrase", () => {
    const sourcePhrase =
      "죽 : 야채죽, 전복죽, 계란죽, 닭죽, 깨죽, 호박죽, 단팥죽, 잣죽 등";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 죽 조리 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 야채죽");
    expect(terms).not.toContain("체중감소 전복죽");
    expect(terms).not.toContain("체중감소 계란죽");
    expect(terms).not.toContain("체중감소 잣죽");
    expect(terms).not.toContain("닭죽");
    expect(terms).not.toContain("호박죽");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss snack examples source phrase", () => {
    const sourcePhrase = "감자, 고구마, 떡, 만두, 빵, 과일, 과일주스, 과일통조림 등";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 간식 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 감자");
    expect(terms).not.toContain("체중감소 고구마");
    expect(terms).not.toContain("체중감소 떡");
    expect(terms).not.toContain("체중감소 만두");
    expect(terms).not.toContain("체중감소 과일주스");
    expect(terms).not.toContain("체중감소 과일통조림");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss bread rice-cake calorie examples source phrase", () => {
    const sourcePhrase = "빵이나 떡 : 설탕, 꿀, 쨈, 버터, 땅콩버터 등을 발라 먹는다.";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 빵·떡 열량 보충 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 떡");
    expect(terms).not.toContain("체중감소 땅콩버터");
    expect(terms).not.toContain("치료 중 참기름 들기름 콩기름 버터");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss potato butter calorie examples source phrase", () => {
    const sourcePhrase = "감자 : 버터를 발라 구워 먹는다.";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 감자 열량 보충 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 감자");
    expect(terms).not.toContain("치료 중 참기름 들기름 콩기름 버터");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss namul oil calorie examples source phrase", () => {
    const sourcePhrase =
      "나물요리 : 볶거나 무침을 할 때 식용유, 참기름, 들기름 등을 넉넉히 사용한다.";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 나물 열량 보충 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain(
      "식용유, 참기름, 버터 등의 기름은 볶음이나 나물 요리에 양념으로 사용합니다.",
    );
    expect(terms).not.toContain("치료 중 참기름 들기름 콩기름 버터");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss vegetable salad dressing calorie examples source phrase", () => {
    const sourcePhrase = "야채샐러드 : 마요네즈, 샐러드드레싱을 충분히 사용한다.";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 야채샐러드 열량 보충 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("버터, 마요네즈, 감미료 등을 추가로 사용하지 않도록 합니다.");
    expect(terms).not.toContain("샐러드(채소)");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss milk soy drink calorie examples source phrase", () => {
    const sourcePhrase =
      "우유, 두유 등 음료 : 설탕, 꿀, 초콜릿, 미숫가루, 분유 등을 타서 먹는다.";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 우유·두유 음료 열량 보충 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 두유");
    expect(terms).not.toContain("치료 중 우유와 유제품 하루 1컵");
    expect(terms).not.toContain("치료 중 요구르트 두유 치즈");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss fruit canned shake calorie examples source phrase", () => {
    const sourcePhrase =
      "과일 : 과일 대신 과일 통조림을 먹거나 우유, 아이스크림과 혼합하여 쉐이크를 만들어서 먹는다.";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 과일 열량 보충 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 과일통조림");
    expect(terms).not.toContain(
      "우유, 두유 등 음료 : 설탕, 꿀, 초콜릿, 미숫가루, 분유 등을 타서 먹는다.",
    );
    expect(terms).not.toContain("치료 중 우유와 유제품 하루 1컵");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss carbohydrate snack source sentence", () => {
    const sourceSentence =
      "지방보다는 탄수화물이 많이 포함된 간식을 드시면 포만감이 빨리 사라지므로 더 편안함을 느낄 수 있다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 탄수화물 간식 활용 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 과일주스");
    expect(terms).not.toContain("체중감소 과일통조림");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(limitGuideText).toContain("가능한 고열량의 간식은 먹지 않도록 합니다.");
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss protein snack source sentence", () => {
    const sourceSentence =
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 단백질 간식 활용 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 만두");
    expect(terms).not.toContain("체중감소 계란찜");
    expect(terms).not.toContain("체중감소 두유");
    expect(terms).not.toContain("체중감소 어묵");
    expect(terms).not.toContain("체중감소 요구르트");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(limitGuideText).toContain("가능한 고열량의 간식은 먹지 않도록 합니다.");
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss protein snack examples source phrase", () => {
    const sourcePhrase = "만두, 피자, 샌드위치, 계란샐러드, 카스테라 등";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중감소 시 단백질 간식 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 만두");
    expect(terms).not.toContain("체중감소 계란찜");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(balancedGuideText).toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(limitGuideText).toContain("가능한 고열량의 간식은 먹지 않도록 합니다.");
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-gain cause consultation source sentence", () => {
    const sourceSentence =
      "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 체중증가 시 원인 확인 의료진 상담 필요",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중증가 가공식품");
    expect(terms).not.toContain("체중증가 김치");
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC weight-change weight-gain balanced food choice source sentence", () => {
    const sourceSentence =
      "과일과 야채 그리고 곡류의 섭취를 증가시킵니다. 가능한 한 지방이 없는 부위의 육류제품과 저지방 우유 및 유제품을 이용합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중증가 시 과일·야채·곡류 및 저지방 식품 선택 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중증가 가공식품");
    expect(terms).not.toContain("체중증가 김치");
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(limitGuideText).toContain("체중증가 고열량 간식");
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-gain boil steam cooking source sentence", () => {
    const sourceSentence = "끓이고 찌는 형태의 요리방법을 이용합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 체중증가 시 끓이고 찌는 조리방법 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(terms).not.toContain("체중증가 과자류");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(limitGuideText).toContain("가능한 고열량의 간식은 먹지 않도록 합니다.");
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-gain added butter mayo sweetener limit source sentence", () => {
    const sourceSentence = "버터, 마요네즈, 감미료 등을 추가로 사용하지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 체중증가 시 버터·마요네즈·감미료 추가 사용 제한 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("버터");
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-gain high-calorie snack limit source sentence", () => {
    const sourceSentence = "가능한 고열량의 간식은 먹지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccWeightChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(foodGuidanceSources.nccWeightChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 체중증가 시 고열량 간식 제한 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(terms).not.toContain("체중증가 과자류");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression meal support examples", () => {
    const assessment = assessCancerFood(
      "피로감 영양이 풍부한 음식, 피로감 하루 중 가장 좋은 시간에 많이 먹기, 피로감 휴식 후 먹기, 피로감 적은 양의 식사와 간식, 피로감 음식배달서비스, 우울 좋아하는 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccFatigueDepressionDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 피로감과 우울",
    );
    expect(foodGuidanceSources.nccFatigueDepressionDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "피로감 영양이 풍부한 음식",
      "피로감 하루 중 가장 좋은 시간에 많이 먹기",
      "피로감 휴식 후 먹기",
      "피로감 적은 양의 식사와 간식",
      "피로감 음식배달서비스",
      "우울 좋아하는 음식",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 피로감·우울 시 영양 보충·식사 빈도 후보",
        sourceId: "nccFatigueDepressionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
      );
    }
    expect(balancedGuideText).toContain("피로감 영양이 풍부한 음식");
    expect(balancedGuideText).toContain("피로감 적은 양의 식사와 간식");
    expect(balancedGuideText).toContain("우울 좋아하는 음식");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention meal example dishes without cure claims", () => {
    const assessment = assessCancerFood(
      "아욱된장국, 호박나물, 콩나물무침, 고등어구이, 배추김치",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["아욱된장국", "호박나물", "콩나물무침", "고등어구이", "배추김치"]);
    expect(terms).not.toContain("나물");
    expect(terms).not.toContain("콩나물");
    expect(terms).not.toContain("고등어");
    expect(matchesByTerm.아욱된장국).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.호박나물).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.콩나물무침).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.고등어구이).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.배추김치).toMatchObject({
      level: "watch",
      reason: "암예방 식단 염장식품 소량 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm.아욱된장국)).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention protein guidance terms without duplicating dish examples", () => {
    const assessment = assessCancerFood("단백질 식품, 적정량 단백질, 고등어구이");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["단백질 식품", "적정량 단백질", "고등어구이"]);
    expect(terms).not.toContain("생선");
    expect(terms).not.toContain("고등어");
    expect(matchesByTerm["단백질 식품"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 식품 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["적정량 단백질"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 식품 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.고등어구이).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm["단백질 식품"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention red-meat portion watch examples", () => {
    const assessment = assessCancerFood("소고기, 돼지고기, 붉은 육류, 불고기");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["소고기", "돼지고기", "붉은 육류", "불고기"]);
    expect(matchesByTerm.소고기).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 암예방 식단 붉은 육류 주 3인분 이하 적정량 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.돼지고기).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 암예방 식단 붉은 육류 주 3인분 이하 적정량 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["붉은 육류"]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 암예방 식단 붉은 육류 주 3인분 이하 적정량 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.불고기).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm.소고기)).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating red-meat weekly limit guidance terms", () => {
    const assessment = assessCancerFood(
      "붉은색 육류, 붉은색 육류 주 3인분, 붉은 육류 주 3인분, 붉은 육류 350~500g, 익힌 상태 350~500g",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "붉은색 육류",
      "붉은색 육류 주 3인분",
      "붉은 육류 주 3인분",
      "붉은 육류 350~500g",
      "익힌 상태 350~500g",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating red meat portion limit sentence", () => {
    const assessment = assessCancerFood(
      "붉은색 육류 섭취 시 1회에 1인분씩, 주 3인분(익힌 상태로 350~500g)을 넘지 않도록 합니다; 붉은색 육류 1회 1인분 주 3인분 350~500g 이하",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "붉은색 육류 섭취 시 1회에 1인분씩, 주 3인분(익힌 상태로 350~500g)을 넘지 않도록 합니다",
      "붉은색 육류 1회 1인분 주 3인분 350~500g 이하",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention processed-meat watch examples", () => {
    const assessment = assessCancerFood("햄, 소시지, 가공육류, 가공육, 육가공품, 베이컨");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["햄", "소시지", "가공육류", "가공육", "육가공품", "베이컨"]);
    for (const term of ["햄", "소시지", "가공육류", "가공육", "육가공품"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 암예방 식단 가공육류 가급적 적게 섭취 예시",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(matchesByTerm.베이컨).toMatchObject({
      level: "watch",
      reason: "가공육",
      sourceId: "nccPreventionDiet",
    });
    expect(formatFoodMatchEvidence(matchesByTerm.햄)).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating processed-meat avoid guidance terms", () => {
    const assessment = assessCancerFood(
      "햄·소시지, 햄 소시지, 햄 소시지 육가공품, 육가공품 가급적 먹지 않기, 육가공품 가급적 먹지 않습니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "햄·소시지",
      "햄 소시지",
      "햄 소시지 육가공품",
      "육가공품 가급적 먹지 않기",
      "육가공품 가급적 먹지 않습니다",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating processed meat avoid sentence", () => {
    const assessment = assessCancerFood(
      "햄, 소시지 등의 육가공품을 가급적 먹지 않습니다; 햄 소시지 등의 육가공품 가급적 먹지 않기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "햄, 소시지 등의 육가공품을 가급적 먹지 않습니다",
      "햄 소시지 등의 육가공품 가급적 먹지 않기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention direct-flame and fried cooking watch examples", () => {
    const assessment = assessCancerFood("직화 구이, 직화구이, 튀김 조리, 튀긴 음식, 튀김, 탄 음식");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["직화 구이", "직화구이", "튀김 조리", "튀긴 음식", "튀김", "탄 음식"]);
    for (const term of ["직화 구이", "직화구이", "튀김 조리", "튀긴 음식", "튀김"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(matchesByTerm["탄 음식"]).toMatchObject({
      level: "watch",
      reason: "직화·탄 음식 조리법 피하기",
      sourceId: "nccPreventionDiet",
    });
    expect(formatFoodMatchEvidence(matchesByTerm["직화 구이"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating burnt-food avoid guidance terms", () => {
    const assessment = assessCancerFood(
      "탄 음식은 먹지 않기, 탄 음식은 먹지 않습니다, 숯불로 구운 탄 음식, 직접 구워 탄 음식, 탄 음식 섭취 삼가",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "탄 음식은 먹지 않기",
      "탄 음식은 먹지 않습니다",
      "숯불로 구운 탄 음식",
      "직접 구워 탄 음식",
      "탄 음식 섭취 삼가",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 탄 음식 섭취 삼가기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating charcoal or direct-burnt food avoid sentence phrases", () => {
    const assessment = assessCancerFood(
      "숯불로 굽거나 직접 구워서 탄 음식의 섭취는 삼가합니다, 숯불로 굽거나 직접 구워서 탄 음식 섭취 삼가",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "숯불로 굽거나 직접 구워서 탄 음식의 섭취는 삼가합니다",
      "숯불로 굽거나 직접 구워서 탄 음식 섭취 삼가",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 숯불·직접 구이 탄 음식 섭취 삼가기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating charcoal or direct-burnt food avoid source sentence", () => {
    const assessment = assessCancerFood(
      "숯불로 굽거나 직접 구워 탄 음식의 섭취는 삼가합니다, 숯불로 굽거나 직접 구워 탄 음식 섭취 삼가",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "숯불로 굽거나 직접 구워 탄 음식의 섭취는 삼가합니다",
      "숯불로 굽거나 직접 구워 탄 음식 섭취 삼가",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 숯불·직접 구이 탄 음식 섭취 삼가기 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC healthy-eating boiled meat support and direct grilling or fatty meat limit terms", () => {
    const supportAssessment = assessCancerFood("수육, 보쌈");
    const supportTerms = supportAssessment.matches.map((match) => match.term);
    const supportMatchesByTerm = Object.fromEntries(
      supportAssessment.matches.map((match) => [match.term, match]),
    );
    const watchAssessment = assessCancerFood(
      "숯불구이, 직접 구이, 직접구이, 지방 함량이 많은 부위, 지방 많은 부위",
    );
    const watchTerms = watchAssessment.matches.map((match) => match.term);
    const watchMatchesByTerm = Object.fromEntries(
      watchAssessment.matches.map((match) => [match.term, match]),
    );

    expect(supportAssessment.level).toBe("ok");
    expect(supportTerms).toEqual(["수육", "보쌈"]);
    for (const term of supportTerms) {
      expect(supportMatchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 삶거나 끓인 육류 조리 예시 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(supportMatchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }

    expect(watchAssessment.level).toBe("watch");
    expect(watchTerms).toEqual([
      "숯불구이",
      "직접 구이",
      "직접구이",
      "지방 함량이 많은 부위",
      "지방 많은 부위",
    ]);
    for (const term of watchTerms) {
      expect(watchMatchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 숯불·직접 구이와 지방 많은 부위 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(watchMatchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify([...supportAssessment.matches, ...watchAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes the exact NCC healthy-eating boiled meat cooking sentence", () => {
    const assessment = assessCancerFood(
      "육류 섭취 시 이를 구워 먹기(숯불구이, 직접 구이 등)보다는 삶거나 끓여서(수육, 보쌈 등) 먹습니다; 육류 구워 먹기보다는 삶거나 끓여서 수육 보쌈 먹기",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "육류 섭취 시 이를 구워 먹기(숯불구이, 직접 구이 등)보다는 삶거나 끓여서(수육, 보쌈 등) 먹습니다",
      "육류 구워 먹기보다는 삶거나 끓여서 수육 보쌈 먹기",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 건강한 식생활 삶거나 끓인 육류 조리 예시 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes the exact NCC healthy-eating fatty meat part limit sentence", () => {
    const assessment = assessCancerFood(
      "지방 함량이 많은 부위의 육류 섭취는 제한합니다, 지방 함량이 많은 육류 부위 섭취 제한",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "지방 함량이 많은 부위의 육류 섭취는 제한합니다",
      "지방 함량이 많은 육류 부위 섭취 제한",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "국가암정보센터 건강한 식생활 지방 많은 육류 부위 제한 후보",
        sourceId: "nccPreventionDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 건강한 식생활 - https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
      );
    }
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention protein-choice support examples", () => {
    const assessment = assessCancerFood("생선, 달걀, 콩, 닭고기, 등푸른 생선, 고등어");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["생선", "달걀", "콩", "닭고기", "등푸른 생선", "고등어"]);
    expect(matchesByTerm.생선).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.달걀).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.콩).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.닭고기).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["등푸른 생선"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 등푸른 생선 주 2회 이상 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.고등어).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 등푸른 생선 주 2회 이상 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm["등푸른 생선"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention vegetable-side-dish support examples", () => {
    const assessment = assessCancerFood("채소 반찬, 생채, 나물, 채소 쌈");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["채소 반찬", "생채", "나물", "채소 쌈"]);
    for (const term of ["채소 반찬", "생채", "나물", "채소 쌈"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 암예방 식단 채소 반찬 충분히 섭취 예시 후보",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(formatFoodMatchEvidence(matchesByTerm["채소 반찬"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention fresh seasonal vegetable guidance terms", () => {
    const assessment = assessCancerFood("신선한 채소, 다양한 색의 채소, 제철 식품");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["신선한 채소", "다양한 색의 채소", "제철 식품"]);
    for (const term of ["신선한 채소", "다양한 색의 채소", "제철 식품"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 암예방 식단 신선·제철 채소 선택 예시 후보",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(formatFoodMatchEvidence(matchesByTerm["신선한 채소"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention group-meal example dishes without cure claims", () => {
    const assessment = assessCancerFood("미역국, 상추쌈, 버섯나물, 불고기, 열무김치");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["미역국", "상추쌈", "버섯나물", "불고기", "열무김치"]);
    expect(terms).not.toContain("미역");
    expect(terms).not.toContain("상추");
    expect(terms).not.toContain("버섯");
    expect(terms).not.toContain("나물");
    expect(matchesByTerm.미역국).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.상추쌈).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.버섯나물).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.불고기).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.열무김치).toMatchObject({
      level: "watch",
      reason: "암예방 식단 염장식품 소량 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm.미역국)).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention snack-salad example foods without cure claims", () => {
    const assessment = assessCancerFood(
      "통밀빵, 샐러드(채소), 샐러드(달걀), 샐러드(치즈), 모차렐라, 리코타 치즈, 방울토마토, 블루베리, 플레인 요구르트",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "통밀빵",
      "샐러드(채소)",
      "샐러드(달걀)",
      "샐러드(치즈)",
      "모차렐라",
      "리코타 치즈",
      "방울토마토",
      "블루베리",
      "플레인 요구르트",
    ]);
    expect(terms).not.toContain("달걀");
    expect(terms).not.toContain("치즈");
    expect(terms).not.toContain("토마토");
    expect(matchesByTerm.통밀빵).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 통곡물 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["샐러드(채소)"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 신선채소 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["샐러드(달걀)"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 단백질 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["샐러드(치즈)"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.모차렐라).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["리코타 치즈"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.방울토마토).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 신선채소 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm.블루베리).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 과일 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["플레인 요구르트"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm["샐러드(달걀)"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention daily fruit guidance terms without cure claims", () => {
    const assessment = assessCancerFood("과일류, 매일 과일");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["과일류", "매일 과일"]);
    for (const term of ["과일류", "매일 과일"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 암예방 샐러드 매일 과일 예시 후보",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(formatFoodMatchEvidence(matchesByTerm.과일류)).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention mixed-grain guidance terms without duplicating rice matches", () => {
    const assessment = assessCancerFood("다양한 잡곡, 잡곡, 잡곡밥");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["다양한 잡곡", "잡곡", "잡곡밥"]);
    for (const term of ["다양한 잡곡", "잡곡"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 암예방 식단 다양한 잡곡밥 예시 후보",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(matchesByTerm.잡곡밥).toMatchObject({
      level: "ok",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(formatFoodMatchEvidence(matchesByTerm["다양한 잡곡"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention oat bread whole-grain examples without cure claims", () => {
    const assessment = assessCancerFood("귀리빵, 귀리 식빵, 귀리");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["귀리빵", "귀리 식빵", "귀리"]);
    for (const term of ["귀리빵", "귀리 식빵", "귀리"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 암예방 샐러드 통곡물 예시 후보",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(formatFoodMatchEvidence(matchesByTerm.귀리빵)).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention whole-wheat bread examples without cure claims", () => {
    const assessment = assessCancerFood("통밀 식빵, 통밀빵, 통밀");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["통밀 식빵", "통밀빵", "통밀"]);
    for (const term of ["통밀 식빵", "통밀빵", "통밀"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "국가암정보센터 암예방 샐러드 통곡물 예시 후보",
        sourceId: "nccPreventionMealExamples",
      });
    }
    expect(formatFoodMatchEvidence(matchesByTerm["통밀 식빵"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention snack-salad added-sugar dairy limits", () => {
    const assessment = assessCancerFood(
      "가당 제품, 가당 유제품, 가당 요구르트, 가당 요거트, 플레인 요구르트",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      "가당 제품",
      "가당 유제품",
      "가당 요구르트",
      "가당 요거트",
      "플레인 요구르트",
    ]);
    expect(matchesByTerm["가당 제품"]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["가당 유제품"]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["가당 요구르트"]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["가당 요거트"]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["플레인 요구르트"]).toMatchObject({
      level: "ok",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm["가당 제품"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC prevention snack-salad low-fat dairy support terms", () => {
    const assessment = assessCancerFood(
      "저지방 유제품, 저지방 요구르트, 저지방 요거트, 플레인 요거트",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "저지방 유제품",
      "저지방 요구르트",
      "저지방 요거트",
      "플레인 요거트",
    ]);
    expect(matchesByTerm["저지방 유제품"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["저지방 요구르트"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["저지방 요거트"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["플레인 요거트"]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보",
      sourceId: "nccPreventionMealExamples",
    });
    expect(formatFoodMatchEvidence(matchesByTerm["저지방 유제품"])).toContain(
      "국가암정보센터 암예방 식단 예시 - https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("keeps longer risk food phrases from producing contradictory shorter support chips", () => {
    const assessment = assessCancerFood("생선회, 날달걀, 통밀빵, 비살균 우유");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual(["생선회", "날달걀", "통밀빵", "비살균 우유"]);
    expect(terms).not.toContain("생선");
    expect(terms).not.toContain("회");
    expect(terms).not.toContain("달걀");
    expect(terms).not.toContain("통밀");
    expect(terms).not.toContain("비살균");
    expect(matchesByTerm["생선회"]).toMatchObject({
      level: "risk",
      sourceId: "nccImmuneLowDiet",
    });
    expect(matchesByTerm.날달걀).toMatchObject({
      level: "risk",
      sourceId: "nccImmuneLowDiet",
    });
    expect(matchesByTerm.통밀빵).toMatchObject({
      level: "ok",
      sourceId: "nccPreventionMealExamples",
    });
    expect(matchesByTerm["비살균 우유"]).toMatchObject({
      level: "risk",
      sourceId: "nccImmuneLowDiet",
    });
  });

  it("recognizes immune-low uncooked-food source sentence as one care-team risk phrase", () => {
    const sourcePhrase = "육회, 생선회, 생조개, 초밥 등 익히지 않은 음식은 드시지 않습니다";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourcePhrase]);
    expect(terms).not.toContain("육회");
    expect(terms).not.toContain("생선회");
    expect(terms).not.toContain("생조개");
    expect(terms).not.toContain("초밥");
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 익히지 않은 음식 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(careTeamGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low food handling risk phrases from official guidance", () => {
    const assessment = assessCancerFood(
      "다진 고기, 씻지 않은 딸기, 오래된 남은 음식, 상한 음식",
    );
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );

    expect(assessment.level).toBe("risk");
    expect(matchesByTerm["다진 고기"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 갈아둔 고기는 충분히 익힘 확인",
      sourceId: "nccImmuneLowDiet",
    });
    expect(matchesByTerm["씻지 않은 딸기"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 씻기 어려운 과일 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(matchesByTerm["오래된 남은 음식"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 오래 보관한 남은 음식 폐기 기준 확인",
      sourceId: "nccImmuneLowDiet",
    });
    expect(matchesByTerm["상한 음식"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 냄새·모양 이상 식품 사용 금지 기준 확인",
      sourceId: "nccImmuneLowDiet",
    });
    expect(Object.keys(matchesByTerm)).not.toContain("딸기");
  });

  it("recognizes immune-low purchase storage and pasteurized product phrases", () => {
    const assessment = assessCancerFood(
      "완전히 익힌 음식, 저온살균 요구르트, 유통기한 확인, 냉장고에서 해동, 상온 30분 이상 운반, 녹슨 캔, 움푹해진 캔, 냉동제품 녹음, 3~4일 지난 남은 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "완전히 익힌 음식",
      "저온살균 요구르트",
      "유통기한 확인",
      "냉장고에서 해동",
      "상온 30분 이상 운반",
      "녹슨 캔",
      "움푹해진 캔",
      "냉동제품 녹음",
      "3~4일 지난 남은 음식",
    ]);
    for (const term of ["완전히 익힌 음식", "저온살균 요구르트"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 익힌 음식·저온살균 제품 선택 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    for (const term of ["유통기한 확인", "냉장고에서 해동"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 구매·해동 안전 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(matchesByTerm["상온 30분 이상 운반"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 상온 운반 후 즉시 냉장 확인",
      sourceId: "nccImmuneLowDiet",
    });
    for (const term of ["녹슨 캔", "움푹해진 캔", "냉동제품 녹음"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "면역저하 시 손상 캔·해동 냉동제품 구매 주의",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(matchesByTerm["3~4일 지난 남은 음식"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 3~4일 지난 남은 음식 폐기 기준 확인",
      sourceId: "nccImmuneLowDiet",
    });
    expect(balancedGuideText).toContain("완전히 익힌 음식");
    expect(balancedGuideText).toContain("저온살균 요구르트");
    expect(careTeamGuideText).toContain("상온 30분 이상 운반");
    expect(careTeamGuideText).toContain("녹슨 캔");
    expect(careTeamGuideText).toContain("3~4일 지난 남은 음식");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low damaged-can and thawed-frozen-product purchase wording", () => {
    const assessment = assessCancerFood(
      "녹슬거나 움푹해진 캔, 냉동제품이 녹아 있다면 구입하지 않도록",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "녹슬거나 움푹해진 캔",
      "냉동제품이 녹아 있다면 구입하지 않도록",
    ]);
    for (const term of ["녹슬거나 움푹해진 캔", "냉동제품이 녹아 있다면 구입하지 않도록"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "면역저하 시 손상 캔·해동 냉동제품 구매 주의",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(careTeamGuideText).toContain("녹슬거나 움푹해진 캔");
    expect(careTeamGuideText).toContain("냉동제품이 녹아 있다면 구입하지 않도록");
    expect(formatFoodMatchEvidence(matchesByTerm["녹슬거나 움푹해진 캔"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low leftover discard and abnormal food condition wording", () => {
    const assessment = assessCancerFood(
      "냉장고에 보관하던 남은 음식도 3~4일이 지나면 버립니다, 식품의 냄새가 이상하거나 모양이 이상한 경우에는 절대 사용하지 않습니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "냉장고에 보관하던 남은 음식도 3~4일이 지나면 버립니다",
      "식품의 냄새가 이상하거나 모양이 이상한 경우에는 절대 사용하지 않습니다",
    ]);
    expect(matchesByTerm["냉장고에 보관하던 남은 음식도 3~4일이 지나면 버립니다"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 3~4일 지난 남은 음식 폐기 기준 확인",
      sourceId: "nccImmuneLowDiet",
    });
    expect(
      matchesByTerm["식품의 냄새가 이상하거나 모양이 이상한 경우에는 절대 사용하지 않습니다"],
    ).toMatchObject({
      level: "risk",
      reason: "면역저하 시 냄새·모양 이상 식품 사용 금지 기준 확인",
      sourceId: "nccImmuneLowDiet",
    });
    expect(careTeamGuideText).toContain(
      "냉장고에 보관하던 남은 음식도 3~4일이 지나면 버립니다",
    );
    expect(careTeamGuideText).toContain(
      "식품의 냄새가 이상하거나 모양이 이상한 경우에는 절대 사용하지 않습니다",
    );
    expect(
      formatFoodMatchEvidence(
        matchesByTerm["식품의 냄새가 이상하거나 모양이 이상한 경우에는 절대 사용하지 않습니다"],
      ),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low purchase freshness and direct-ground meat safety wording", () => {
    const assessment = assessCancerFood(
      "유통기한 꼭 확인, 신선도 유지, 대량 구입하지 않기, 소량씩 구입, 직접 갈아주는 곳에서 구입, 가는 과정에서 오염 가능",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "유통기한 꼭 확인",
      "신선도 유지",
      "대량 구입하지 않기",
      "소량씩 구입",
      "직접 갈아주는 곳에서 구입",
      "가는 과정에서 오염 가능",
    ]);
    for (const term of [
      "유통기한 꼭 확인",
      "신선도 유지",
      "대량 구입하지 않기",
      "소량씩 구입",
      "직접 갈아주는 곳에서 구입",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 식품 구입 신선도·소량 구입 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(matchesByTerm["가는 과정에서 오염 가능"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 갈아둔 고기 오염 가능성 확인",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("고기");
    expect(balancedGuideText).toContain("대량 구입하지 않기");
    expect(balancedGuideText).toContain("직접 갈아주는 곳에서 구입");
    expect(careTeamGuideText).toContain("가는 과정에서 오염 가능");
    expect(formatFoodMatchEvidence(matchesByTerm["유통기한 꼭 확인"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low purchase-safety source wording", () => {
    const assessment = assessCancerFood(
      "신선도 유지를 위해 음식은 대량 구입하시지 마시고 소량씩 구입해서 드시기 바랍니다, 식품의 유통기한을 꼭 확인합니다, 갈은 고기를 살 경우에는 직접 갈아주는 곳에서 구입합니다, 가는 과정에서 고기의 표면적이 넓어져 세균 등에 오염될 가능성이 커지기 때문입니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "신선도 유지를 위해 음식은 대량 구입하시지 마시고 소량씩 구입해서 드시기 바랍니다",
      "식품의 유통기한을 꼭 확인합니다",
      "갈은 고기를 살 경우에는 직접 갈아주는 곳에서 구입합니다",
      "가는 과정에서 고기의 표면적이 넓어져 세균 등에 오염될 가능성이 커지기 때문입니다",
    ]);
    for (const term of [
      "신선도 유지를 위해 음식은 대량 구입하시지 마시고 소량씩 구입해서 드시기 바랍니다",
      "식품의 유통기한을 꼭 확인합니다",
      "갈은 고기를 살 경우에는 직접 갈아주는 곳에서 구입합니다",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 식품 구입 신선도·소량 구입 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(
      matchesByTerm["가는 과정에서 고기의 표면적이 넓어져 세균 등에 오염될 가능성이 커지기 때문입니다"],
    ).toMatchObject({
      level: "risk",
      reason: "면역저하 시 갈아둔 고기 오염 가능성 확인",
      sourceId: "nccImmuneLowDiet",
    });
    for (const genericTerm of [
      "신선도 유지",
      "유통기한 꼭 확인",
      "직접 갈아주는 곳에서 구입",
      "갈은 고기",
      "가는 과정에서 오염 가능",
    ]) {
      expect(terms).not.toContain(genericTerm);
    }
    expect(balancedGuideText).toContain(
      "신선도 유지를 위해 음식은 대량 구입하시지 마시고 소량씩 구입해서 드시기 바랍니다",
    );
    expect(balancedGuideText).toContain(
      "갈은 고기를 살 경우에는 직접 갈아주는 곳에서 구입합니다",
    );
    expect(careTeamGuideText).toContain(
      "가는 과정에서 고기의 표면적이 넓어져 세균 등에 오염될 가능성이 커지기 때문입니다",
    );
    expect(
      formatFoodMatchEvidence(
        matchesByTerm["식품의 유통기한을 꼭 확인합니다"],
      ),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low room-temperature transport and immediate refrigeration wording", () => {
    const assessment = assessCancerFood(
      "30분 이상 상온에서 운반, 곧바로 냉장고에 넣어 차갑게, 상온 운반 후 즉시 냉장",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "30분 이상 상온에서 운반",
      "곧바로 냉장고에 넣어 차갑게",
      "상온 운반 후 즉시 냉장",
    ]);
    expect(matchesByTerm["30분 이상 상온에서 운반"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 상온 운반 후 즉시 냉장 확인",
      sourceId: "nccImmuneLowDiet",
    });
    for (const term of ["곧바로 냉장고에 넣어 차갑게", "상온 운반 후 즉시 냉장"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 상온 운반 후 즉시 냉장 실행 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(balancedGuideText).toContain("곧바로 냉장고에 넣어 차갑게");
    expect(balancedGuideText).toContain("상온 운반 후 즉시 냉장");
    expect(careTeamGuideText).toContain("30분 이상 상온에서 운반");
    expect(formatFoodMatchEvidence(matchesByTerm["상온 운반 후 즉시 냉장"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low storage and thawing safety practices from official guidance", () => {
    const assessment = assessCancerFood(
      "상하기 쉬운 음식 냉장고 냉동고 보관, 요리하기 전의 고기 생선 닭고기 분리 보관, 고기나 생선즙이 떨어지지 않도록 보관, 냉동고 식품 랩이나 팩 포장, 해동한 후 즉시 요리, 남은 음식 즉시 냉장 보관",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "상하기 쉬운 음식 냉장고 냉동고 보관",
      "요리하기 전의 고기 생선 닭고기 분리 보관",
      "고기나 생선즙이 떨어지지 않도록 보관",
      "냉동고 식품 랩이나 팩 포장",
      "해동한 후 즉시 요리",
      "남은 음식 즉시 냉장 보관",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 식품 보관·해동 안전 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(terms).not.toContain("생선");
    expect(terms).not.toContain("닭고기");
    expect(balancedGuideText).toContain("상하기 쉬운 음식 냉장고 냉동고 보관");
    expect(balancedGuideText).toContain("고기나 생선즙이 떨어지지 않도록 보관");
    expect(balancedGuideText).toContain("남은 음식 즉시 냉장 보관");
    expect(formatFoodMatchEvidence(matchesByTerm["해동한 후 즉시 요리"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low storage and thawing source wording", () => {
    const assessment = assessCancerFood(
      "상하기 쉬운 음식은 냉장고, 혹은 냉동고에 보관합니다, 냉동고에 식품을 보관할 때는 랩이나 팩에 포장합니다, 고기는 냉장고에서 녹입니다, 해동한 후 즉시 요리하는 것이 좋습니다, 남은 음식은 포장하여 즉시 냉장 보관합니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "상하기 쉬운 음식은 냉장고, 혹은 냉동고에 보관합니다",
      "냉동고에 식품을 보관할 때는 랩이나 팩에 포장합니다",
      "고기는 냉장고에서 녹입니다",
      "해동한 후 즉시 요리하는 것이 좋습니다",
      "남은 음식은 포장하여 즉시 냉장 보관합니다",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 식품 보관·해동 안전 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(balancedGuideText).toContain("고기는 냉장고에서 녹입니다");
    expect(balancedGuideText).toContain("남은 음식은 포장하여 즉시 냉장 보관합니다");
    expect(formatFoodMatchEvidence(matchesByTerm["고기는 냉장고에서 녹입니다"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low separated raw meat storage source wording", () => {
    const assessment = assessCancerFood(
      "요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다. 그리고 다른 식품에 고기나 생선즙이 떨어지지 않도록 보관합니다.",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다",
      "다른 식품에 고기나 생선즙이 떨어지지 않도록 보관합니다",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 식품 보관·해동 안전 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    for (const genericTerm of [
      "요리하기 전의 고기 생선 닭고기 분리 보관",
      "고기나 생선즙이 떨어지지 않도록 보관",
      "생선",
      "닭고기",
    ]) {
      expect(terms).not.toContain(genericTerm);
    }
    expect(balancedGuideText).toContain(
      "요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다",
    );
    expect(balancedGuideText).toContain(
      "다른 식품에 고기나 생선즙이 떨어지지 않도록 보관합니다",
    );
    expect(
      formatFoodMatchEvidence(
        matchesByTerm[
          "요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다"
        ],
      ),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low fruit and vegetable washing practices from official guidance", () => {
    const assessment = assessCancerFood(
      "채소와 과일 먹기 전 세척, 과일이나 채소 썰기 전 세척, 딸기 등 꼼꼼히 씻기 어려운 과일",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "채소와 과일 먹기 전 세척",
      "과일이나 채소 썰기 전 세척",
      "딸기 등 꼼꼼히 씻기 어려운 과일",
    ]);
    for (const term of ["채소와 과일 먹기 전 세척", "과일이나 채소 썰기 전 세척"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 과일·채소 세척 안전 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(matchesByTerm["딸기 등 꼼꼼히 씻기 어려운 과일"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 씻기 어려운 과일 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("딸기");
    expect(balancedGuideText).toContain("채소와 과일 먹기 전 세척");
    expect(balancedGuideText).toContain("과일이나 채소 썰기 전 세척");
    expect(careTeamGuideText).toContain("딸기 등 꼼꼼히 씻기 어려운 과일");
    expect(formatFoodMatchEvidence(matchesByTerm["채소와 과일 먹기 전 세척"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low fruit and vegetable washing source wording", () => {
    const assessment = assessCancerFood(
      "채소와 과일은 먹기 전에 깨끗이 씻어 드시기 바랍니다, 딸기 등 꼼꼼히 씻기 어려운 과일은 주의해서 드시고, 과일이나 채소는 썰기 전에 깨끗이 씻어야 합니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "채소와 과일은 먹기 전에 깨끗이 씻어 드시기 바랍니다",
      "딸기 등 꼼꼼히 씻기 어려운 과일은 주의해서 드시고",
      "과일이나 채소는 썰기 전에 깨끗이 씻어야 합니다",
    ]);
    for (const term of [
      "채소와 과일은 먹기 전에 깨끗이 씻어 드시기 바랍니다",
      "과일이나 채소는 썰기 전에 깨끗이 씻어야 합니다",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 과일·채소 세척 안전 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(matchesByTerm["딸기 등 꼼꼼히 씻기 어려운 과일은 주의해서 드시고"]).toMatchObject(
      {
        level: "risk",
        reason: "면역저하 시 씻기 어려운 과일 주의",
        sourceId: "nccImmuneLowDiet",
      },
    );
    expect(terms).not.toContain("딸기");
    expect(balancedGuideText).toContain("채소와 과일은 먹기 전에 깨끗이 씻어 드시기 바랍니다");
    expect(balancedGuideText).toContain("과일이나 채소는 썰기 전에 깨끗이 씻어야 합니다");
    expect(careTeamGuideText).toContain("딸기 등 꼼꼼히 씻기 어려운 과일은 주의해서 드시고");
    expect(
      formatFoodMatchEvidence(
        matchesByTerm["채소와 과일은 먹기 전에 깨끗이 씻어 드시기 바랍니다"],
      ),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low pasteurized drink choices and moldy-food discard wording", () => {
    const assessment = assessCancerFood(
      "저온살균 우유, 저온살균 주스, 저온살균 제품, 곰팡이가 핀 음식, 곰팡이 핀 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "저온살균 우유",
      "저온살균 주스",
      "저온살균 제품",
      "곰팡이가 핀 음식",
      "곰팡이 핀 음식",
    ]);
    for (const term of ["저온살균 우유", "저온살균 주스", "저온살균 제품"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 저온살균 우유·주스·요구르트 제품 선택 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    for (const term of ["곰팡이가 핀 음식", "곰팡이 핀 음식"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "면역저하 시 곰팡이가 핀 음식 폐기 기준 확인",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(balancedGuideText).toContain("저온살균 우유");
    expect(balancedGuideText).toContain("저온살균 주스");
    expect(careTeamGuideText).toContain("곰팡이가 핀 음식");
    expect(formatFoodMatchEvidence(matchesByTerm["저온살균 우유"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low WBC decrease cooked-food source context", () => {
    const assessment = assessCancerFood(
      "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다",
    ]);
    expect(
      matchesByTerm[
        "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다"
      ],
    ).toMatchObject({
      level: "ok",
      reason: "면역저하 시 백혈구 감소·익힌 음식 확인 후보",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("완전히 익힌 음식");
    expect(balancedGuideText).toContain(
      "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다",
    );
    expect(
      formatFoodMatchEvidence(
        matchesByTerm[
          "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다"
        ],
      ),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low validity-period checks and pasteurized juice spelling variants", () => {
    const assessment = assessCancerFood(
      "사용하기 전에 유효기간 확인, 유효기간 확인, 저온살균 쥬스, 쥬스 우유 요구르트 저온살균 제품, 비살균 쥬스, 비살균 요구르트",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "사용하기 전에 유효기간 확인",
      "유효기간 확인",
      "저온살균 쥬스",
      "쥬스 우유 요구르트 저온살균 제품",
      "비살균 쥬스",
      "비살균 요구르트",
    ]);
    for (const term of [
      "사용하기 전에 유효기간 확인",
      "유효기간 확인",
      "저온살균 쥬스",
      "쥬스 우유 요구르트 저온살균 제품",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 유효기간·저온살균 제품 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    for (const term of ["비살균 쥬스", "비살균 요구르트"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "면역저하 시 저온살균 제품 여부 확인 필요",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(terms).not.toContain("비살균");
    expect(balancedGuideText).toContain("사용하기 전에 유효기간 확인");
    expect(balancedGuideText).toContain("저온살균 쥬스");
    expect(careTeamGuideText).toContain("비살균 요구르트");
    expect(formatFoodMatchEvidence(matchesByTerm["저온살균 쥬스"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low pasteurized product source wording", () => {
    const assessment = assessCancerFood(
      "쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다"]);
    expect(matchesByTerm["쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다"]).toMatchObject({
      level: "ok",
      reason: "면역저하 시 유효기간·저온살균 제품 확인 후보",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("쥬스 우유 요구르트 저온살균 제품");
    expect(terms).not.toContain("저온살균 제품");
    expect(balancedGuideText).toContain("쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다");
    expect(
      formatFoodMatchEvidence(
        matchesByTerm["쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다"],
      ),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low validity-period source wording", () => {
    const assessment = assessCancerFood(
      "모든 식품은 사용하기 전에 반드시 유효기간을 확인합니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["모든 식품은 사용하기 전에 반드시 유효기간을 확인합니다"]);
    expect(matchesByTerm["모든 식품은 사용하기 전에 반드시 유효기간을 확인합니다"]).toMatchObject({
      level: "ok",
      reason: "면역저하 시 유효기간·저온살균 제품 확인 후보",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("사용하기 전에 유효기간 확인");
    expect(terms).not.toContain("유효기간 확인");
    expect(balancedGuideText).toContain("모든 식품은 사용하기 전에 반드시 유효기간을 확인합니다");
    expect(
      formatFoodMatchEvidence(
        matchesByTerm["모든 식품은 사용하기 전에 반드시 유효기간을 확인합니다"],
      ),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low cooking hygiene safety practices from official guidance", () => {
    const assessment = assessCancerFood(
      "손톱 밑까지 깨끗이 씻기, 음식물에 머리카락 들어가지 않게, 조리 기구 식기 수저 소독, 식기 도마 칼 분리 사용, 생고기 닭고기 생선 즙이 다른 식품에 떨어지지 않게, 외식보다는 직접 요리",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "손톱 밑까지 깨끗이 씻기",
      "음식물에 머리카락 들어가지 않게",
      "조리 기구 식기 수저 소독",
      "식기 도마 칼 분리 사용",
      "생고기 닭고기 생선 즙이 다른 식품에 떨어지지 않게",
      "외식보다는 직접 요리",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 조리 위생·교차오염 예방 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
      );
    }
    expect(terms).not.toContain("생고기");
    expect(terms).not.toContain("닭고기");
    expect(terms).not.toContain("생선");
    expect(balancedGuideText).toContain("손톱 밑까지 깨끗이 씻기");
    expect(balancedGuideText).toContain("식기 도마 칼 분리 사용");
    expect(balancedGuideText).toContain("외식보다는 직접 요리");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low direct-cooking source wording", () => {
    const assessment = assessCancerFood("외식보다는 직접 요리하여 드시는 것이 안전합니다");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["외식보다는 직접 요리하여 드시는 것이 안전합니다"]);
    expect(matchesByTerm["외식보다는 직접 요리하여 드시는 것이 안전합니다"]).toMatchObject({
      level: "ok",
      reason: "면역저하 시 조리 위생·교차오염 예방 확인 후보",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("외식보다는 직접 요리");
    expect(balancedGuideText).toContain("외식보다는 직접 요리하여 드시는 것이 안전합니다");
    expect(formatFoodMatchEvidence(matchesByTerm["외식보다는 직접 요리하여 드시는 것이 안전합니다"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low handwashing and hair-control source wording", () => {
    const assessment = assessCancerFood(
      "음식을 만지거나 요리를 하려면 손을 깨끗이 씻도록 합니다, 손톱 밑부분까지 깨끗이 씻도록 합니다, 음식물에 머리카락이 들어가지 않도록 합니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "음식을 만지거나 요리를 하려면 손을 깨끗이 씻도록 합니다",
      "손톱 밑부분까지 깨끗이 씻도록 합니다",
      "음식물에 머리카락이 들어가지 않도록 합니다",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 조리 위생·교차오염 예방 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
      );
    }
    expect(balancedGuideText).toContain("음식을 만지거나 요리를 하려면 손을 깨끗이 씻도록 합니다");
    expect(balancedGuideText).toContain("음식물에 머리카락이 들어가지 않도록 합니다");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low utensil separation and raw-juice source wording", () => {
    const assessment = assessCancerFood(
      "조리에 사용되는 기구, 식기, 수저는 반드시 소독합니다, 고기, 생선, 과일, 채소 등에 사용되는 식기, 도마, 칼 등은 가능한 분리해서 사용하거나 소독한 다음 사용합니다, 생고기, 닭고기, 생선 등에서 나오는 즙이 다른 식품이나 음식에 떨어지지 않도록 조심합니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([
      "조리에 사용되는 기구, 식기, 수저는 반드시 소독합니다",
      "고기, 생선, 과일, 채소 등에 사용되는 식기, 도마, 칼 등은 가능한 분리해서 사용하거나 소독한 다음 사용합니다",
      "생고기, 닭고기, 생선 등에서 나오는 즙이 다른 식품이나 음식에 떨어지지 않도록 조심합니다",
    ]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 조리 위생·교차오염 예방 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
      );
    }
    expect(terms).not.toContain("조리 기구 식기 수저 소독");
    expect(terms).not.toContain("식기 도마 칼 분리 사용");
    expect(balancedGuideText).toContain("조리에 사용되는 기구, 식기, 수저는 반드시 소독합니다");
    expect(balancedGuideText).toContain("생고기, 닭고기, 생선 등에서 나오는 즙이 다른 식품이나 음식에 떨어지지 않도록 조심합니다");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low cooking doneness and egg-in-food safety wording", () => {
    const assessment = assessCancerFood(
      "고기 닭고기 생선 완전히 익히기, 갈아둔 고기 충분히 익히기, 다른 재료들과 섞기 전에 충분히 익히기, 날계란이나 덜 익힌 계란이 들어간 음식",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "고기 닭고기 생선 완전히 익히기",
      "갈아둔 고기 충분히 익히기",
      "다른 재료들과 섞기 전에 충분히 익히기",
      "날계란이나 덜 익힌 계란이 들어간 음식",
    ]);
    for (const term of [
      "고기 닭고기 생선 완전히 익히기",
      "갈아둔 고기 충분히 익히기",
      "다른 재료들과 섞기 전에 충분히 익히기",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 고기·생선 완전 가열 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(matchesByTerm["날계란이나 덜 익힌 계란이 들어간 음식"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 날계란·덜 익힌 계란이 들어간 음식 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("닭고기");
    expect(terms).not.toContain("생선");
    expect(terms).not.toContain("갈아둔 고기");
    expect(terms).not.toContain("덜 익힌 계란");
    expect(balancedGuideText).toContain("고기 닭고기 생선 완전히 익히기");
    expect(balancedGuideText).toContain("갈아둔 고기 충분히 익히기");
    expect(careTeamGuideText).toContain("날계란이나 덜 익힌 계란이 들어간 음식");
    expect(formatFoodMatchEvidence(matchesByTerm["갈아둔 고기 충분히 익히기"])).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes immune-low cooking doneness and egg source wording", () => {
    const assessment = assessCancerFood(
      "고기, 닭고기, 생선 등은 완전히 익히도록 합니다, 만약 갈아둔 고기를 요리하거나 고명으로 얹고자 할 때에는 다른 재료들과 섞기 전에 충분히 익히도록 합니다, 날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다",
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([
      "고기, 닭고기, 생선 등은 완전히 익히도록 합니다",
      "만약 갈아둔 고기를 요리하거나 고명으로 얹고자 할 때에는 다른 재료들과 섞기 전에 충분히 익히도록 합니다",
      "날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다",
    ]);
    for (const term of [
      "고기, 닭고기, 생선 등은 완전히 익히도록 합니다",
      "만약 갈아둔 고기를 요리하거나 고명으로 얹고자 할 때에는 다른 재료들과 섞기 전에 충분히 익히도록 합니다",
    ]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "면역저하 시 고기·생선 완전 가열 확인 후보",
        sourceId: "nccImmuneLowDiet",
      });
    }
    expect(matchesByTerm["날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다"]).toMatchObject({
      level: "risk",
      reason: "면역저하 시 날계란·덜 익힌 계란이 들어간 음식 주의",
      sourceId: "nccImmuneLowDiet",
    });
    expect(terms).not.toContain("닭고기");
    expect(terms).not.toContain("생선");
    expect(terms).not.toContain("갈아둔 고기");
    expect(terms).not.toContain("날계란");
    expect(terms).not.toContain("덜 익힌 계란");
    expect(balancedGuideText).toContain("고기, 닭고기, 생선 등은 완전히 익히도록 합니다");
    expect(balancedGuideText).toContain(
      "만약 갈아둔 고기를 요리하거나 고명으로 얹고자 할 때에는 다른 재료들과 섞기 전에 충분히 익히도록 합니다",
    );
    expect(careTeamGuideText).toContain("날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다");
    expect(
      formatFoodMatchEvidence(matchesByTerm["고기, 닭고기, 생선 등은 완전히 익히도록 합니다"]),
    ).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("does not match one-syllable food warnings inside unrelated Korean words", () => {
    const postSurgeryAssessment = assessCancerFood("수술 후 식사로 통밀빵과 닭고기");
    const postSurgeryTerms = postSurgeryAssessment.matches.map((match) => match.term);
    const recoveryAssessment = assessCancerFood("회복 중 식사로 닭고기");
    const recoveryTerms = recoveryAssessment.matches.map((match) => match.term);

    expect(postSurgeryAssessment.level).toBe("ok");
    expect(postSurgeryTerms).toEqual(["통밀빵", "닭고기"]);
    expect(postSurgeryTerms).not.toContain("술");
    expect(recoveryAssessment.level).toBe("ok");
    expect(recoveryTerms).toEqual(["닭고기"]);
    expect(recoveryTerms).not.toContain("회");

    const alcoholAssessment = assessCancerFood("술, 맥주");
    const alcoholTerms = alcoholAssessment.matches.map((match) => match.term);

    expect(alcoholAssessment.level).toBe("watch");
    expect(alcoholTerms).toEqual(["술", "맥주"]);
  });

  it("recognizes KDCA alcohol-type wording used in drink amount records", () => {
    const assessment = assessCancerFood("소주, 막걸리, 와인, 양주, 고도주");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.kdcaAlcohol.label).toBe(
      "질병관리청 국가건강정보포털 위험음주",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["소주", "막걸리", "와인", "양주", "고도주"]);
    for (const term of terms) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "질병관리청 위험음주 표준잔·금주 권고 확인 후보",
        sourceId: "kdcaAlcohol",
      });
      expect(formatFoodMatchEvidence(matchesByTerm[term])).toContain(
        "질병관리청 국가건강정보포털 위험음주 - https://health.kdca.go.kr/",
      );
    }
    expect(limitGuideText).toContain("소주");
    expect(limitGuideText).toContain("막걸리");
    expect(limitGuideText).toContain("양주");
    expect(limitGuideText).toContain("고도주");
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("classifies lab values against user-entered reference ranges", () => {
    expect(assessLabValue(4.2, 4, 10).flag).toBe("normal");
    expect(assessLabValue(3.1, 4, 10).label).toBe("기준보다 낮음");
    expect(assessLabValue(14, 4, 10).label).toBe("기준보다 높음");
    expect(assessLabValue(14).flag).toBe("unknown");
  });

  it("strictly parses lab number text before classification", () => {
    expect(parseFiniteNumberText(" 3.4 ")).toBe(3.4);
    expect(parseFiniteNumberText(".5")).toBe(0.5);
    expect(parseFiniteNumberText("1e3")).toBe(1000);
    expect(parseFiniteNumberText("3.4 low")).toBeUndefined();
    expect(parseFiniteNumberText("4abc")).toBeUndefined();
    expect(parseFiniteNumberText("0x10")).toBeUndefined();
    expect(parseFiniteNumberText("Infinity")).toBeUndefined();
    expect(parseFiniteNumberText("")).toBeUndefined();

    expect(assessLabTextValue("3.4", "4", "10").label).toBe("기준보다 낮음");
    expect(assessLabTextValue("3.4 low", "4", "10")).toMatchObject({
      flag: "unknown",
      label: "값 없음",
    });
    expect(assessLabTextValue("3.4", "4abc", "10")).toMatchObject({
      flag: "normal",
      label: "기준 범위 내",
    });
  });
});
