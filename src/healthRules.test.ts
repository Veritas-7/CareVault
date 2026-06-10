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

  it("recognizes NCC diet-practice snack replacement source sentence", () => {
    const sourceSentence =
      "간식으로 과자나 탄산음료 대신 고구마(중간 크기 1개 정도), 채소(예: 당근1/5개, 오이1/4개 정도) 및 과일 (예: 사과1/2개, 딸기 10개 정도)을 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDietPracticeFiber.label).toBe(
      "국가암정보센터 국민 암예방 수칙 실천지침 식이",
    );
    expect(foodGuidanceSources.nccDietPracticeFiber.url).toBe(
      "https://cancer.go.kr/download.do?uuid=646c1953-81f7-48ca-ad26-cdd0f382cfb8.pdf",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 식이 실천지침 과자·탄산음료 대체 간식 후보",
      sourceId: "nccDietPracticeFiber",
    });
    for (const shorterTerm of ["탄산음료", "고구마", "당근", "오이", "사과", "딸기"]) {
      expect(terms).not.toContain(shorterTerm);
    }
    expect(balancedGuideText).toContain(sourceSentence);
    expect(balancedGuideText).toContain(
      "매일 5가지 색(빨강, 초록, 노랑, 보라, 하양)의 채소와 과일을 먹습니다.",
    );
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 국민 암예방 수칙 실천지침 식이 - https://cancer.go.kr/download.do?uuid=646c1953-81f7-48ca-ad26-cdd0f382cfb8.pdf",
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

  it("recognizes NCC cervical-cancer no special forbidden or recommended food source sentence", () => {
    const sourceSentence =
      "자궁경부암 환자가 특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalDiet.label).toBe(
      "국가암정보센터 자궁경부암 식생활",
    );
    expect(foodGuidanceSources.nccCervicalDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 특수 금기·추천 음식 없음 확인 후보",
      sourceId: "nccCervicalDiet",
    });
    expect(terms).not.toContain("브로콜리");
    expect(terms).not.toContain("보충제");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer nutrition and rest source sentence", () => {
    const sourceSentence =
      "충분한 영양을 섭취하고 휴식을 취하는 것이 몸의 면역 기능 강화와 투병 생활에 도움이 될 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalDiet.label).toBe(
      "국가암정보센터 자궁경부암 식생활",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 충분한 영양·휴식 확인 후보",
      sourceId: "nccCervicalDiet",
    });
    expect(terms).not.toContain("특수영양 보충음료");
    expect(terms).not.toContain("암을 낫게 해주는 특별한 영양소");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer treatment-period eating support source sentence", () => {
    const sourceSentence =
      "영양은 암치료에 있어서 중요한 부분입니다. 치료 전, 치료기간 동안, 그리고 치료 후 올바른 음식섭취는 기분을 좋게 하고 강하게 만들어 줄 것입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalDiet.label).toBe(
      "국가암정보센터 자궁경부암 식생활",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 치료 전·중·후 올바른 음식섭취 확인 후보",
      sourceId: "nccCervicalDiet",
    });
    expect(terms).not.toContain("암을 낫게 해주는 특별한 영양소");
    expect(terms).not.toContain("충분한 영양 섭취를 위해서는 잘 먹는 것이 중요한데");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer appetite and pain-linked meal support source sentence", () => {
    const sourceSentence =
      "충분한 영양 섭취를 위해서는 잘 먹는 것이 중요한데, 우선 환자가 평소에 좋아했던 음식이나 먹고 싶어하던 음식을 제공하고, 통증 으로 식욕을 잃었다면 식사 전에 먼저 진통제 를 복용합니다. 음식은 항상 손이 쉽게 갈 수 있는 곳에 두고 식욕을 느낄 때마다 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalDiet.label).toBe(
      "국가암정보센터 자궁경부암 식생활",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "자궁경부암 통증·식욕저하 식사 전 약 복용 진료팀 확인 후보",
      sourceId: "nccCervicalDiet",
    });
    expect(terms).not.toContain("충분한 영양을 섭취하고 휴식을 취하는 것이 몸의 면역 기능 강화와 투병 생활에 도움이 될 수 있습니다.");
    expect(terms).not.toContain("식욕부진 간식");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer radiation or chemotherapy irritating-food source sentence", () => {
    const sourceSentence =
      "방사선 치료나 항암화학요법 중에는 장기능이 약해질 가능성이 있으므로 되도록 자극적인 음식은 피합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalDiet.label).toBe(
      "국가암정보센터 자궁경부암 식생활",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 방사선·항암치료 중 자극적 음식 피하기 확인 후보",
      sourceId: "nccCervicalDiet",
    });
    expect(terms).not.toContain("너무 뜨겁거나 매운 음식");
    expect(terms).not.toContain("매운 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer chemotherapy folk-remedy and supplement avoid source sentence", () => {
    const sourceSentence =
      "또한 항암화학요법을 받는 중에는 민간요법이나 건강보조식품은 삼갑니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalDiet.label).toBe(
      "국가암정보센터 자궁경부암 식생활",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "자궁경부암 항암화학요법 중 민간요법·건강보조식품 피하기 확인 후보",
      sourceId: "nccCervicalDiet",
    });
    expect(terms).not.toContain("민간요법");
    expect(terms).not.toContain("보충제");
    expect(terms).not.toContain("영양제");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer supplement interaction source sentence", () => {
    const sourceSentence =
      "민간요법이나 건강보조식품은 과학적으로 효능이 확인되지 않았으며 병원에서 투여하는 약제와 예상할 수 없는 상호작용으로 치료효과가 떨어지거나 부작용이 커질 수도 있기 때문입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalDiet.label).toBe(
      "국가암정보센터 자궁경부암 식생활",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "자궁경부암 민간요법·건강보조식품 약제 상호작용 확인 후보",
      sourceId: "nccCervicalDiet",
    });
    expect(terms).not.toContain("민간요법");
    expect(terms).not.toContain(
      "또한 항암화학요법을 받는 중에는 민간요법이나 건강보조식품은 삼갑니다.",
    );
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC complementary-therapy herb and supplement disclosure source sentence", () => {
    const sourceSentence =
      "여러분의 약초나 영양제 복용 사실을 여러분을 돌보고 있는 의료진에게 알리는 것은 부작용 의 위험을 최소화할 수 있는 하나의 방법입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccComplementaryTherapy.label).toBe(
      "국가암정보센터 보완대체요법 상담",
    );
    expect(foodGuidanceSources.nccComplementaryTherapy.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 보완대체요법 약초·영양제 복용 사실 의료진 공유 후보",
      sourceId: "nccComplementaryTherapy",
    });
    expect(terms).not.toContain("약초");
    expect(terms).not.toContain("영양제");
    expect(terms).not.toContain("보충제");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 보완대체요법 상담 - https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
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

  it("recognizes NCC cervical-cancer beta-carotene fresh-food source sentence", () => {
    const sourceSentence =
      "카로틴(carotene)과 거의 유사한 구조를 가진 물질을 카로테노이드라고 하며, 그 중 베타카로틴 은 당근, 시금치, 차, 미역 등 신선한 채소, 과일, 해조류에 풍부합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 베타카로틴 신선식품 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("당근");
    expect(terms).not.toContain("시금치");
    expect(terms).not.toContain("차");
    expect(terms).not.toContain("미역");
    expect(terms).not.toContain("신선한 채소");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer regular-screening and fresh-produce boundary sentence", () => {
    const sourceSentence =
      "그러므로 자궁경부암의 예방을 위해서는 조기 검진과 정기 검진이 가장 효과적인 방법이며, 일반적으로 건강한 생활을 위해서는 신선한 채소 및 과일을 충분히 섭취하는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(foodGuidanceSources.nccCervicalFoodPrevention.url).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 정기검진 우선·신선 채소과일 섭취 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("신선한 채소");
    expect(terms).not.toContain("과일");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical early-diagnosis prevention balanced produce sentence", () => {
    const sourceSentence =
      "채소와 과일을 충분하게 먹고, 다채로운 식단으로 균형 잡힌 식사하기";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalEarlyDiagnosisPrevention.label).toBe(
      "국립암센터 자궁경부암 조기 진단과 예방법",
    );
    expect(foodGuidanceSources.nccCervicalEarlyDiagnosisPrevention.url).toBe(
      "https://www.cancer.go.kr/download.do?uuid=adf8879c-4343-445e-b67d-0c60e5ac9b58.pdf",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국립암센터 자궁경부암 조기 진단과 예방법 균형식 생활수칙 후보",
      sourceId: "nccCervicalEarlyDiagnosisPrevention",
    });
    expect(terms).not.toContain("채소와 과일을 충분히 먹습니다");
    expect(terms).not.toContain("다채로운 식단으로 균형 잡힌 식사를 합니다");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국립암센터 자궁경부암 조기 진단과 예방법 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical early-diagnosis small-alcohol avoidance sentence", () => {
    const sourceSentence = "하루 한두 잔의 소량 음주도 피하기";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalEarlyDiagnosisPrevention.label).toBe(
      "국립암센터 자궁경부암 조기 진단과 예방법",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국립암센터 자궁경부암 조기 진단과 예방법 소량 음주 회피 생활수칙 후보",
      sourceId: "nccCervicalEarlyDiagnosisPrevention",
    });
    expect(terms).not.toContain("술");
    expect(terms).not.toContain("알코올");
    expect(terms).not.toContain("하루 한 두 잔의 술도 피합니다.");
    expect(terms).not.toContain("암 예방을 위해서 하루 한 두 잔의 술도 피하는 것이 좋습니다.");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국립암센터 자궁경부암 조기 진단과 예방법 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer final prevention summary with fresh-produce support sentence", () => {
    const sourceSentence =
      "이상에서 살펴본 바와 같이, 자궁경부암의 예방을 위해서는 정기적인 검진이 가장 효과적인 방법이며, 안전한 성생활을 유지하고, 금연을 하며, 신선한 채소 및 과일을 충분히 섭취하는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(foodGuidanceSources.nccCervicalFoodPrevention.url).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 정기검진·생활습관·신선 채소과일 섭취 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("신선한 채소");
    expect(terms).not.toContain("과일");
    expect(terms).not.toContain("금연");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer carotenoid and vitamin uncertainty sentence", () => {
    const sourceSentence =
      "자궁경부암의 예방 가능성이 있는 음식으로 카로테노이드(carotenoid), 비타민 A, 비타민 C, 비타민 E 등이 거론되나 아직 그 효과에 대해서는 명확하지 않은 상태입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 카로테노이드·비타민 예방 효과 불명확성 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("당근");
    expect(terms).not.toContain("비타민");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical practice-guide vitamin B12 carotenoid produce prevention sentence as evidence-boundary wording", () => {
    const sourceSentence =
      "채소와 과일을 충분히 섭취합니다. 영양성분 중 비타민 C, 비타민 E, 엽산, 비타민 B12, 카로티노이드 섭취는 자궁경부암을 예방한다고 알려져 있습니다. 이들 영양성분을 충분히 함유하고 있는 채소와 과일을 섭취하면 자궁경부암을 예방할 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalPracticeDiet.label).toBe(
      "국가암정보센터 자궁경부암 실천지침 식생활",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 비타민 B12·카로티노이드 채소과일 예방문구 확인 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("채소와 과일을 충분히 먹습니다");
    expect(terms).not.toContain("비타민 C");
    expect(terms).not.toContain("비타민 E");
    expect(terms).not.toContain("엽산");
    expect(terms).not.toContain("카로티노이드");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /치료 음식|완치|암을 낫게|특효|보장/,
    );
  });

  it("recognizes NCC cervical-cancer vitamin C risk-reduction uncertainty sentence", () => {
    const sourceSentence =
      "비타민 C의 섭취가 많은 집단의 자궁경부암 발생 빈도가 20~50 %까지 감소한다는 연구 결과가 나온 바 있습니다. 그러나 이후 연구에서 항상 예방 효과가 명확히 보도된 것은 아니었기 때문에 현재 미국암연구협회(American Institute for Cancer Research)에서는 “비타민 C의 다량의 섭취가 자궁경부암의 위험도를 줄일 가능성이 있다”라고 결론을 내렸습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 비타민 C 위험도 감소 가능성·불확실성 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("비타민 C");
    expect(terms).not.toContain("비타민");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer carotenoid risk-reduction possibility uncertainty sentence", () => {
    const sourceSentence =
      "그러나 이러한 연구 결과들이 항상 일치하는 것이 아니어서 현재 미국암연구협회(American Institute for Cancer Research)에서는 “카로테노이드의 다량의 섭취가 자궁경부암의 위험도를 줄일 가능성이 있다”라고 결론을 내렸습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 카로테노이드 위험도 감소 가능성·불확실성 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("카로테노이드");
    expect(terms).not.toContain("비타민");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer carotenoid historical study uncertainty sentence", () => {
    const sourceSentence =
      "1980년대에 이루어진 일부 연구결과에 의하면 카로테노이드를 많이 섭취하면 침윤성 자궁경부암의 빈도가 1/2에서 1/5까지도 줄어들고 베타카로틴의 혈중 농도가 낮을수록 자궁경부암 및 자궁경부 상피내암 등의 빈도가 높아진다는 보고도 있었습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 카로테노이드 관찰연구·불확실성 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("카로테노이드");
    expect(terms).not.toContain("베타카로틴");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer vitamin E prevention-possibility uncertainty sentence", () => {
    const sourceSentence =
      "일부 연구에서 비타민 E의 섭취가 많거나 혈중 농도가 높을수록 자궁경부암의 위험도가 낮은 경향을 보이기는 했지만 아직 확실히 결론을 내린 것은 아닙니다. 그러나 혈중 비타민 E의 농도가 자궁경부이형성증(정상조직과 암조직의 중간과정)의 정도가 심할수록 낮았다는 보고가 있으므로 자궁경부암의 예방 효과가 있을 가능성은 존재합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 비타민 E 예방 가능성·불확실성 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("비타민 E");
    expect(terms).not.toContain("비타민");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC cervical-cancer retinol and folate no-risk-reduction source sentence", () => {
    const sourceSentence =
      "그 밖에 레티놀(retinol)과 엽산(folate)도 자궁경부암의 예방과 관련한 연구를 진행했으나 자궁경부암과의 관련성이나 자궁경부암의 위험도를 줄일 가능성은 없는 것으로 나타났습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccCervicalFoodPrevention.label).toBe(
      "국가암정보센터 자궁경부암 예방과 음식",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 레티놀·엽산 예방 관련성 없음 확인 후보",
      sourceId: "nccCervicalFoodPrevention",
    });
    expect(terms).not.toContain("레티놀");
    expect(terms).not.toContain("엽산");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 예방과 음식 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
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

  it("recognizes additional cervical practice-guide table dishes without generic fallbacks", () => {
    const assessment = assessCancerFood(
      "총각김치, 느타리버섯볶음, 달래무무침, 닭고기덮밥, 왜된장국",
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

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["총각김치", "느타리버섯볶음", "달래무무침", "닭고기덮밥", "왜된장국"]);
    expect(matchesByTerm.총각김치).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 식단 김치 저염 확인 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    for (const term of ["느타리버섯볶음", "달래무무침", "닭고기덮밥", "왜된장국"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "자궁경부암 실천지침 식단 예시 후보",
        sourceId: "nccCervicalPracticeDiet",
      });
    }
    expect(terms).not.toContain("버섯");
    expect(terms).not.toContain("닭고기");
    expect(terms).not.toContain("국물");
    expect(balancedGuideText).toContain("느타리버섯볶음");
    expect(balancedGuideText).toContain("달래무무침");
    expect(balancedGuideText).toContain("닭고기덮밥");
    expect(balancedGuideText).toContain("왜된장국");
    expect(limitGuideText).toContain("총각김치");
    expect(formatFoodMatchEvidence(matchesByTerm.느타리버섯볶음)).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide kimchi table examples with the cervical source", () => {
    const assessment = assessCancerFood("자궁경부암 실천지침 식단: 열무김치, 배추김치");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const cervicalPracticeLimitItem = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.find((item) => item.label === "실천지침 대체 식단 예시");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["열무김치", "배추김치"]);
    for (const term of ["열무김치", "배추김치"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "watch",
        reason: "자궁경부암 실천지침 식단 김치 저염 확인 후보",
        sourceId: "nccCervicalPracticeDiet",
      });
    }
    expect(terms).not.toContain("저염 김치");
    expect(terms).not.toContain("짠 김치");
    expect(terms).not.toContain("김치 또는 장아찌류");
    expect(terms).not.toContain("염장식품");
    expect(cervicalPracticeLimitItem?.examples).toContain("열무김치");
    expect(cervicalPracticeLimitItem?.examples).toContain("배추김치");
    expect(formatFoodMatchEvidence(matchesByTerm.열무김치)).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide barley rice and grilled seaweed table dishes", () => {
    const assessment = assessCancerFood("보리밥, 김구이");
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual(["보리밥", "김구이"]);
    for (const term of ["보리밥", "김구이"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "자궁경부암 실천지침 식단 예시 후보",
        sourceId: "nccCervicalPracticeDiet",
      });
    }
    expect(terms).not.toContain("밥");
    expect(terms).not.toContain("김");
    expect(terms).not.toContain("구이");
    expect(balancedGuideText).toContain("보리밥");
    expect(balancedGuideText).toContain("김구이");
    expect(formatFoodMatchEvidence(matchesByTerm.보리밥)).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide fiber-rich fresh produce prevention phrases", () => {
    const commaPhrase = "식이섬유가 풍부한 신선한 채소, 과일 섭취";
    const middleDotPhrase = "식이 섬유가 풍부한 신선한 채소·과일 섭취";
    const assessment = assessCancerFood(`${commaPhrase}, ${middleDotPhrase}`);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([commaPhrase, middleDotPhrase]);
    for (const term of [commaPhrase, middleDotPhrase]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "자궁경부암 실천지침 식이섬유 풍부한 신선 채소·과일 섭취 후보",
        sourceId: "nccCervicalPracticeDiet",
      });
    }
    expect(terms).not.toContain("신선한 채소");
    expect(terms).not.toContain("과일");
    expect(terms).not.toContain("채소와 과일을 충분히 먹습니다");
    expect(balancedGuideText).toContain(commaPhrase);
    expect(balancedGuideText).toContain(middleDotPhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[middleDotPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide color-variety produce planning examples", () => {
    const colorVarietyPhrase =
      "파프리카, 피망, 시금치, 토마토, 당근, 양배추 등 식품이 지닌 색상을 고려하여 다양한 종류의 색상이 포함되도록 식품을 선택해 보십시오.";
    const assessment = assessCancerFood(`${colorVarietyPhrase}, 파프리카, 피망, 토마토`);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([colorVarietyPhrase, "파프리카", "피망", "토마토"]);
    expect(matchesByTerm[colorVarietyPhrase]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 색상 다양성 식품 선택 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    for (const term of ["파프리카", "피망", "토마토"]) {
      expect(matchesByTerm[term]).toMatchObject({
        level: "ok",
        reason: "자궁경부암 실천지침 색상 다양성 채소 예시 후보",
        sourceId: "nccCervicalPracticeDiet",
      });
    }
    expect(terms).not.toContain("당근");
    expect(terms).not.toContain("시금치");
    expect(terms).not.toContain("양배추");
    expect(balancedGuideText).toContain("파프리카");
    expect(balancedGuideText).toContain("피망");
    expect(balancedGuideText).toContain("토마토");
    expect(formatFoodMatchEvidence(matchesByTerm[colorVarietyPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide yogurt dressing and strawberry yogurt examples", () => {
    const yogurtDressingPhrase = "채소 섭취량 증가(채소샐러드는 요플레드레싱 사용)";
    const assessment = assessCancerFood(`${yogurtDressingPhrase}, 딸기 요플레`);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([yogurtDressingPhrase, "딸기 요플레"]);
    expect(matchesByTerm[yogurtDressingPhrase]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 채소샐러드 요플레드레싱 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm["딸기 요플레"]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 딸기 요플레 간식 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("채소샐러드");
    expect(terms).not.toContain("요플레");
    expect(terms).not.toContain("요거트");
    expect(terms).not.toContain("요구르트");
    expect(terms).not.toContain("드레싱");
    expect(terms).not.toContain("딸기");
    expect(balancedGuideText).toContain(yogurtDressingPhrase);
    expect(balancedGuideText).toContain("딸기 요플레");
    expect(formatFoodMatchEvidence(matchesByTerm["딸기 요플레"])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide smoking-support caffeine and alcohol replacement sentence", () => {
    const sourceSentence =
      "채식위주의 균형 잡힌 식사를 하고, 흡연욕구를 일으키는 카페인이나 알코올의 섭취를 줄일 수 있도록 평소 마시던 음료를 커피나 청량음료에서 따뜻한 차 등으로 바꾸기";
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
      reason: "자궁경부암 실천지침 금연 보조 카페인·알코올 음료 대체 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("차");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
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

  it("recognizes cervical practice-guide sodium-reduction soup wording", () => {
    const sodiumReductionPhrase = "소금 대신 간장 사용으로 나트륨 섭취량 감소";
    const soupBrothPhrase = "국 또는 찌개의 국물은 다 드시지 마십시오.";
    const assessment = assessCancerFood(
      `쇠고기뭇국, ${sodiumReductionPhrase}, ${soupBrothPhrase}`,
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

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual(["쇠고기뭇국", sodiumReductionPhrase, soupBrothPhrase]);
    expect(matchesByTerm.쇠고기뭇국).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 나트륨 감소 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[sodiumReductionPhrase]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 나트륨 감소 조리 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[soupBrothPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 국·찌개 국물 남기기 예시",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("국물");
    expect(balancedGuideText).toContain("쇠고기뭇국");
    expect(balancedGuideText).toContain(sodiumReductionPhrase);
    expect(limitGuideText).toContain(soupBrothPhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[soupBrothPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide salt and soy-sauce reduction phrases", () => {
    const soupReductionPhrase = "소금 및 간장 사용량 감소(소금 섭취량 감소)";
    const burdockReductionPhrase =
      "우엉조림 → 우엉볶음 : 간장 사용량 감소(소금 섭취량 감소)";
    const assessment = assessCancerFood(
      `북어콩나물국, ${soupReductionPhrase}, ${burdockReductionPhrase}`,
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
    expect(terms).toEqual(["북어콩나물국", soupReductionPhrase, burdockReductionPhrase]);
    expect(matchesByTerm.북어콩나물국).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 나트륨 감소 식단 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[soupReductionPhrase]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 소금·간장 사용량 감소 조리 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[burdockReductionPhrase]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 우엉볶음 나트륨 감소 대체 예시 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("우엉조림");
    expect(terms).not.toContain("우엉볶음");
    expect(terms).not.toContain("소금 추가");
    expect(terms).not.toContain("추가 간장");
    expect(balancedGuideText).toContain("북어콩나물국");
    expect(balancedGuideText).toContain(soupReductionPhrase);
    expect(balancedGuideText).toContain(burdockReductionPhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[burdockReductionPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide smoking-cessation diet phrases", () => {
    const irritantFoodPhrase =
      "맵고 짠 자극적인 음식이나 지방이 많은 느끼한 음식, 육식은 가급적 피하기";
    const snackPrepPhrase =
      "과식은 피하고 평소 섭취하는 열량의 80% 정도만 섭취하고, 금연을 위한 간식으로 당근, 오이, 다시마, 무가당 껌, 은단 등을 준비하기";
    const assessment = assessCancerFood(`${irritantFoodPhrase}, ${snackPrepPhrase}`);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([irritantFoodPhrase, snackPrepPhrase]);
    expect(matchesByTerm[irritantFoodPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 금연 식이요법 자극적·지방 많은 음식 제한 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[snackPrepPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 금연 간식·과식 제한 준비 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("당근");
    expect(terms).not.toContain("오이");
    expect(terms).not.toContain("다시마");
    expect(terms).not.toContain("껌");
    expect(terms).not.toContain("매운 음식");
    expect(limitGuideText).toContain(irritantFoodPhrase);
    expect(limitGuideText).toContain(snackPrepPhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[irritantFoodPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide fresh produce and fat-salt reduction planning phrases", () => {
    const fatSaltFreshPhrase =
      "가능한 지방 함량이 높은 식품이나 짠 음식 섭취를 줄이겠다는 생각을 가지며, 신선한 채소와 과일, 곡류 등을 자주 드시기 바랍니다.";
    const seasonalMoldPhrase =
      "가능한 제철 과일, 채소를 구입하십시오. 곰팡이 핀 음식은 피하시기 바랍니다.";
    const assessment = assessCancerFood(`${fatSaltFreshPhrase}, ${seasonalMoldPhrase}`);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([fatSaltFreshPhrase, seasonalMoldPhrase]);
    expect(matchesByTerm[fatSaltFreshPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 지방·짠 음식 줄이기와 신선식품 섭취 계획 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[seasonalMoldPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 제철 과일·채소 구입과 곰팡이 핀 음식 피하기 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("신선한 채소");
    expect(terms).not.toContain("제철 식품");
    expect(terms).not.toContain("곰팡이 핀 음식");
    expect(terms).not.toContain("짠 음식");
    expect(limitGuideText).toContain(fatSaltFreshPhrase);
    expect(limitGuideText).toContain(seasonalMoldPhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[seasonalMoldPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide gradual diet-change planning phrases", () => {
    const abruptChangePhrase =
      "한꺼번에 식생활 습관을 바꾸는 것은 위험합니다. 다음의 내용을 숙지하면서 식생활 개선을 시작하세요.";
    const stepwisePlanPhrase =
      "식생활을 한꺼번에 바꾸려고 하지 말고 내가 할 수 있는 것들을 확인하여 서서히 단계적으로 변화시킬 수 있는 계획표를 작성해 보십시오.";
    const varietyPlanPhrase = "식단 작성 시 다양한 종류의 식품을 섭취할 수 있도록 계획해 보십시오.";
    const regularMealPhrase =
      "건강을 생각해서 규칙적인 식생활과 더불어 즐거운 마음으로 식사를 하시기 바랍니다.";
    const assessment = assessCancerFood(
      `${abruptChangePhrase}, ${stepwisePlanPhrase}, ${varietyPlanPhrase}, ${regularMealPhrase}`,
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

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      abruptChangePhrase,
      stepwisePlanPhrase,
      varietyPlanPhrase,
      regularMealPhrase,
    ]);
    expect(matchesByTerm[abruptChangePhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 급격한 식생활 변경 주의 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[stepwisePlanPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 단계적 식생활 개선 계획 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[varietyPlanPhrase]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 다양한 식품 섭취 계획 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[regularMealPhrase]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 규칙적 식생활 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(limitGuideText).toContain(abruptChangePhrase);
    expect(limitGuideText).toContain(stepwisePlanPhrase);
    expect(balancedGuideText).toContain(varietyPlanPhrase);
    expect(balancedGuideText).toContain(regularMealPhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[stepwisePlanPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes cervical practice-guide meal example intro and core principles", () => {
    const mealExampleIntro =
      "암예방을 위한 식단의 예입니다. 다음에 제시된 식단을 다양하게 활용하시기 바랍니다.";
    const corePrinciplePhrase =
      "기본원칙 : 다채로운 식단으로 균형 잡힌 식사 / 채소, 과일을 충분히 섭취 / 짠 음식 및 탄 음식 섭취 제한";
    const assessment = assessCancerFood(`${mealExampleIntro}, ${corePrinciplePhrase}`);
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

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([mealExampleIntro, corePrinciplePhrase]);
    expect(matchesByTerm[mealExampleIntro]).toMatchObject({
      level: "ok",
      reason: "자궁경부암 실천지침 암예방 식단 예시 활용 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[corePrinciplePhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 식단 기본원칙 제한 포함 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(terms).not.toContain("다채로운 식단으로 균형 잡힌 식사");
    expect(terms).not.toContain("채소와 과일을 충분히 먹습니다");
    expect(terms).not.toContain("탄 음식");
    expect(balancedGuideText).toContain(mealExampleIntro);
    expect(limitGuideText).toContain(corePrinciplePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[corePrinciplePhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
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

  it("recognizes cervical practice-guide replacement reason phrases before shorter food terms", () => {
    const processedMeatToFruitPhrase =
      "햄구이 → 과일샐러드 : 육가공식품(훈제식품) 섭취량 감소, 과일 섭취량 증가";
    const sweetSnackToFruitPhrase = "초코칩쿠키 → 귤 : 과일 섭취량 증가";
    const pickledRadishToVegetablePhrase =
      "단무지 → 채소샐러드, 브로콜리회 : 채소 섭취량 증가(채소샐러드는 요플레드레싱 사용)";
    const assessment = assessCancerFood(
      `${processedMeatToFruitPhrase}, ${sweetSnackToFruitPhrase}, ${pickledRadishToVegetablePhrase}`,
    );
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([
      processedMeatToFruitPhrase,
      sweetSnackToFruitPhrase,
      pickledRadishToVegetablePhrase,
    ]);
    expect(matchesByTerm[processedMeatToFruitPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 햄구이 대체로 육가공식품 감소·과일 증가 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[sweetSnackToFruitPhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 초코칩쿠키 대체로 과일 증가 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    expect(matchesByTerm[pickledRadishToVegetablePhrase]).toMatchObject({
      level: "watch",
      reason: "자궁경부암 실천지침 단무지 대체로 채소 증가 후보",
      sourceId: "nccCervicalPracticeDiet",
    });
    for (const shorterTerm of [
      "햄구이",
      "과일샐러드",
      "초코칩쿠키",
      "귤",
      "단무지",
      "채소샐러드",
      "브로콜리회",
      "채소 섭취량 증가(채소샐러드는 요플레드레싱 사용)",
    ]) {
      expect(terms).not.toContain(shorterTerm);
    }
    expect(limitGuideText).toContain(processedMeatToFruitPhrase);
    expect(limitGuideText).toContain(sweetSnackToFruitPhrase);
    expect(limitGuideText).toContain(pickledRadishToVegetablePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[processedMeatToFruitPhrase])).toContain(
      "국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
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

  it("recognizes NCC after-treatment body weight and body fat maintenance source sentence", () => {
    const sourceSentence = "적정 체중과 체지방량을 유지합니다.";
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
      reason: "국가암정보센터 치료 후 건강한 식생활 체중·체지방 유지 후보",
      sourceId: "nccAfterTreatmentHealthyEating",
    });
    expect(terms).not.toContain("적정 체중");
    expect(terms).not.toContain("체지방량");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 치료 후 건강한 식생활 - https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
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

  it("recognizes NCC mouth-pain porridge examples source line", () => {
    const sourceLine = "죽류 : 흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽 등";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 부드러운 죽류 예시 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("흰죽");
    expect(terms).not.toContain("닭죽");
    expect(terms).not.toContain("호박죽");
    expect(terms).not.toContain("죽 : 야채죽, 전복죽, 계란죽, 닭죽, 깨죽, 호박죽, 단팥죽, 잣죽 등");
    expect(terms).not.toContain("체중감소 야채죽");
    expect(terms).not.toContain("체중감소 전복죽");
    expect(terms).not.toContain("체중감소 계란죽");
    expect(balancedGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain thin-rice-gruel examples source line", () => {
    const sourceLine = "미음 : 쌀미음, 조미음, 잣미음, 깨미음, 녹두미음 등";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 부드러운 미음 예시 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("쌀미음");
    expect(terms).not.toContain("설사 쌀미음");
    expect(terms).not.toContain("죽류 : 흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽 등");
    expect(balancedGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain non-sour fruit examples source line", () => {
    const sourceLine = "과일 : 바나나, 배, 수박, 과일통조림 등과 같이 시지 않은 과일";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 시지 않은 과일 예시 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("바나나");
    expect(terms).not.toContain("수박");
    expect(terms).not.toContain("과일통조림");
    expect(terms).not.toContain("설사 바나나");
    expect(terms).not.toContain("입맛 변화 오렌지");
    expect(terms).not.toContain("입맛 변화 레몬");
    expect(balancedGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain soft vegetable examples source line", () => {
    const sourceLine = "채소 : 부드러운 야채를 푹 익히거나 데쳐서";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 부드러운 채소 예시 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("부드러운 야채");
    expect(terms).not.toContain("데친 채소");
    expect(terms).not.toContain("채소류");
    expect(terms).not.toContain("신선한 채소");
    expect(balancedGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain soft meat-fish examples source line", () => {
    const sourceLine = "고기나 생선 : 고기는 부드럽게 조리하고, 생선은 곱게 다지거나 갈아서";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 입과 목 통증 시 부드러운 고기·생선 예시 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("치료 중 단백질 반찬 충분히");
    expect(terms).not.toContain("입맛 변화 생선");
    expect(terms).not.toContain("고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다.");
    expect(terms).not.toContain("간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.");
    expect(terms).not.toContain("고기나 생선즙이 떨어지지 않도록 보관");
    expect(balancedGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
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

  it("recognizes NCC mouth-pain citrus tomato irritating examples source line", () => {
    const sourceLine = "오렌지, 포도, 레몬, 토마토주스";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 입과 목 통증 시 입안 자극 과일·토마토주스 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("토마토주스");
    expect(terms).not.toContain("입맛 변화 오렌지");
    expect(terms).not.toContain("입맛 변화 레몬");
    expect(terms).not.toContain("새콤달콤한 소스");
    expect(limitGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain spice salted irritating examples source line", () => {
    const sourceLine = "향신료를 많이 사용하거나 소금에 절인 음식";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 입과 목 통증 시 향신료·소금절임 입안 자극 음식 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("너무 매운 음식");
    expect(terms).not.toContain("매운 음식");
    expect(terms).not.toContain("추가 소금");
    expect(terms).not.toContain("소금 저장식품");
    expect(terms).not.toContain("염장식품");
    expect(terms).not.toContain("짠 음식");
    expect(limitGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain toast cracker dried irritating examples source line", () => {
    const sourceLine = "토스트, 크래커 또는 말린 음식 등";
    const assessment = assessCancerFood(sourceLine);
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
    expect(terms).toEqual([sourceLine]);
    expect(matchesByTerm[sourceLine]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 입과 목 통증 시 토스트·크래커·말린 음식 입안 자극 음식 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(terms).not.toContain("말린 음식");
    expect(terms).not.toContain("이상한 냄새가 나는 음식");
    expect(limitGuideText).toContain(sourceLine);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceLine])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain warm broth salted source sentence", () => {
    const sourceSentence =
      "따뜻한 육수(고기국물)에 소금을 약간 첨가하여 마십니다. 이는 목의 염증을 가라앉게 해 주는데 도움이 됩니다.";
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
      reason: "국가암정보센터 입과 목 통증 시 따뜻한 육수 확인 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("구토 조절 후 육수");
    expect(terms).not.toContain("설사 육수");
    expect(terms).not.toContain("음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹도록 합니다.");
    expect(terms).not.toContain("추가 소금");
    expect(terms).not.toContain("소금 저장식품");
    expect(terms).not.toContain("짠 음식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain sore-mouth straw source sentence", () => {
    const sourceSentence = "입안이 쓰린 경우 빨대를 이용합니다.";
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
      reason: "국가암정보센터 입과 목 통증 시 입안 쓰림 빨대 이용 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain(
      "식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다.",
    );
    expect(terms).not.toContain("물 한 모금");
    expect(terms).not.toContain("물 조금씩 자주");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain small-spoon source sentence", () => {
    const sourceSentence = "아이들 스푼과 같이 작은 스푼을 이용합니다.";
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
      reason: "국가암정보센터 입과 목 통증 시 작은 스푼 이용 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("식기류");
    expect(terms).not.toContain("조리기구");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain after-eating oral rinse source sentence", () => {
    const sourceSentence = "음식을 먹은 후 입안은 깨끗이 헹구어 청결하게 유지합니다.";
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
      reason: "국가암정보센터 입과 목 통증 시 식후 구강 청결 유지 후보",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("치아와 잇몸이 아프면 치과치료를 받도록 합니다.");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게/);
  });

  it("recognizes NCC mouth-pain tooth and gum dental-care source sentence", () => {
    const sourceSentence = "치아와 잇몸이 아프면 치과치료를 받도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 입과 목 통증 시 치아·잇몸 통증 치과치료 확인 필요",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("음식을 먹은 후 입안은 깨끗이 헹구어 청결하게 유지합니다.");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|자가 치료/);
  });

  it("recognizes NCC mouth-pain oral pain and gum inflammation clinician-visit source sentence", () => {
    const sourceSentence =
      "만약 입안통증이나 잇몸에 염증이 있는 경우 의사선생님을 방문하여 항암치료 의 부작용 때문인지 치과질환인지 알아보도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 입과 목 통증 시 입안통증·잇몸 염증 의료진 방문 확인 필요",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("치아와 잇몸이 아프면 치과치료를 받도록 합니다.");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /치료 음식|완치|암을 낫게|자가 치료|항암치료 권장/,
    );
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

  it("recognizes NCC mouth-pain oxaliplatin cold-food caution source sentence", () => {
    const sourceSentence =
      "그러나 옥살로플라틴(Oxaliplatin) 등과 같은 말초신경염을 유발할 수 있는 항암제 를 투여 받는 경우는 온도변화에 민감하여 통증을 유발할 수 있으므로 차가운 음식은 피하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMouthPainDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(foodGuidanceSources.nccMouthPainDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 입과 목 통증 시 옥살로플라틴 온도 민감성 차가운 음식 회피 확인 필요",
      sourceId: "nccMouthPainDiet",
    });
    expect(terms).not.toContain("뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다.");
    expect(terms).not.toContain("얼음조각을 먹는 것도 도움이 됩니다.");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|항암제 복용 권장/);
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

  it("recognizes NCC dry-mouth severe-problem clinician dentist consultation source sentence", () => {
    const sourceSentence = "그러나 문제가 심각하면 의사선생님이나 치과선생님과 상의합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccDryMouthDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(foodGuidanceSources.nccDryMouthDiet.url).toBe(
      "https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 입안 건조증 심각 시 의료진·치과 상담 확인 필요",
      sourceId: "nccDryMouthDiet",
    });
    expect(terms).not.toContain("가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다.");
    expect(terms).not.toContain("딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있습니다.");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /치료 음식|완치|암을 낫게|자가 치료|치과치료 권장/,
    );
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

  it("recognizes NCC nausea low-stomach-burden parent source sentence", () => {
    const sourceSentence = "비교적 위에 부담이 적은 식품들을 섭취합니다.";
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
      reason: "국가암정보센터 메스꺼움 시 위 부담 적은 식품 선택 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("토스트, 크래커, 요거트, 샤베트");
    expect(terms).not.toContain("샤베트");
    expect(terms).not.toContain("복숭아통조림이나 다른 부드러운 과일과 채소");
    expect(terms).not.toContain("맑은 유동식, 얼음조각 등");
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("얼음조각");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장/);
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

  it("recognizes NCC nausea trigger-food parent warning source sentence", () => {
    const sourceSentence = "다음 음식들은 메스꺼움을 더욱 유발할 수 있으므로 피하도록 합니다.";
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
      reason: "국가암정보센터 메스꺼움 유발 가능 음식 제한 확인 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("사탕, 쿠키 또는 케익 등과 같이 매우 단 음식");
    expect(terms).not.toContain("매우 단 음식");
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(terms).not.toContain("이상한 냄새가 나는 음식 등");
    expect(terms).not.toContain("이상한 냄새가 나는 음식");
    expect(limitGuideText).toContain(sourceSentence);
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

  it("recognizes NCC nausea do-not-force specific food and alternative food source sentence", () => {
    const sourceSentence =
      "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다. 특정 음식에 대해 메스꺼움이 심할 때에도 억지로 먹지 않도록 합니다. 대신 먹기 좋은 다른 음식을 많이 먹도록 합니다.";
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
      reason: "국가암정보센터 메스꺼움 시 특정 음식 억지 섭취 피하고 대체 음식 선택 후보",
      sourceId: "nccNauseaDiet",
    });
    expect(terms).not.toContain("메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain("샤베트");
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("기름진 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|강제 섭취/);
  });

  it("recognizes NCC nausea-vomiting care meal beverage limit source sentence", () => {
    const sourceSentence =
      "물을 마시는 것은 포만감을 느끼게 할 수 있기 때문에 식사를 할 때는 너무 많은 국물이나 음료는 피하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움·구토 시 식사 중 과다 국물·음료 회피 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(
      "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다.",
    );
    expect(terms).not.toContain("국물 섭취");
    expect(terms).not.toContain("물");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|탈수 치료/);
  });

  it("recognizes NCC nausea-vomiting care small frequent slow intake source sentence", () => {
    const sourceSentence = "먼저 소량씩 천천히 그리고 자주 섭취하는 것이 좋습니다.";
    const broaderNauseaDietSentence =
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.";
    const diarrheaSmallMealSentence = "장이 약해져 있으므로 식사는 조금씩 자주 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 소량·천천히·자주 섭취 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(broaderNauseaDietSentence);
    expect(terms).not.toContain(diarrheaSmallMealSentence);
    expect(terms).not.toContain("식사 시에는 조금씩 자주 천천히");
    expect(terms).not.toContain("피로감 적은 양의 식사와 간식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|강제 섭취/);
  });

  it("recognizes NCC nausea-vomiting care patient food choice no-force source sentence", () => {
    const sourceSentence = "환자가 언제 무엇을 먹고 싶은지 선택하도록 하고, 음식을 강요하지 않도록 합니다.";
    const appetiteLossCaregiverSentence =
      "주위 분들도 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고 환자 스스로 먹을 수 있게끔 도와줍니다.";
    const nauseaNoForceSentence = "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.";
    const nauseaNoForceAlternativeSentence =
      "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다. 특정 음식에 대해 메스꺼움이 심할 때에도 억지로 먹지 않도록 합니다. 대신 먹기 좋은 다른 음식을 많이 먹도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 환자 음식 선택과 강요하지 않기 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(appetiteLossCaregiverSentence);
    expect(terms).not.toContain(nauseaNoForceSentence);
    expect(terms).not.toContain(nauseaNoForceAlternativeSentence);
    expect(terms).not.toContain("음식을 강요하지");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|강제 섭취/);
  });

  it("recognizes NCC nausea-vomiting care meal place ventilation source sentence", () => {
    const sourceSentence =
      "식사를 하는 장소는 환자에게 맞지 않는 음식 냄새가 나지 않고 환기가 잘 되는 곳이어야 합니다.";
    const broaderNauseaDietSentence =
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.";
    const roomVentilationSentence =
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

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 음식 냄새 적고 환기되는 식사 장소 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(broaderNauseaDietSentence);
    expect(terms).not.toContain(roomVentilationSentence);
    expect(terms).not.toContain("음식 냄새");
    expect(terms).not.toContain("환기가 잘 되는 쾌적한 장소");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|냄새 치료/);
  });

  it("recognizes NCC nausea-vomiting care favorite food aversion source sentence", () => {
    const sourceSentence =
      "메스꺼움을 느낄 때는 좋아하는 음식도 먹지 않게 되며, 그 음식을 영원히 싫어하게 될 수도 있습니다.";
    const fatigueFavoriteFoodSentence = "치료를 받지 않을 때에는 좋아하는 음식을 먹도록 합니다.";
    const treatmentFavoriteFoodSentence =
      "따라서 암환자의 건강식이란 좋아하는 음식에다 다른 여러 식품을 고루 곁들여 먹는 것이라 하겠습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움·구토 시 메스꺼움 중 좋아하는 음식 혐오화 주의 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(fatigueFavoriteFoodSentence);
    expect(terms).not.toContain(treatmentFavoriteFoodSentence);
    expect(terms).not.toContain("우울 좋아하는 음식");
    expect(terms).not.toContain("좋아하는 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|좋아하는 음식 치료/);
  });

  it("recognizes NCC nausea-vomiting care liquid-only drink source sentence", () => {
    const sourceSentence = "물종류만 먹을 수 있을때는 꿀물, 설탕물, 이온음료를 먹습니다.";
    const diarrheaElectrolyteSentence =
      "염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분과 칼륨이 들어있는 식품으로는 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등입니다.";
    const vomitingClearLiquidSentence =
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

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 물종류만 가능할 때 꿀물·설탕물·이온음료 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(diarrheaElectrolyteSentence);
    expect(terms).not.toContain(vomitingClearLiquidSentence);
    expect(terms).not.toContain("설사 스포츠 음료");
    expect(terms).not.toContain("구토 맑은 유동식");
    expect(terms).not.toContain("맑은 유동식");
    expect(terms).not.toContain("물");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|탈수 치료|당분 음료 치료/);
  });

  it("recognizes NCC nausea-vomiting care before-after meal fluids and dry food source sentence", () => {
    const sourceSentence = "식사전후 물과 음료수를 많이 마시지 않습니다. 마른 음식을 먹습니다.";
    const mealBeverageSentence =
      "물을 마시는 것은 포만감을 느끼게 할 수 있기 때문에 식사를 할 때는 너무 많은 국물이나 음료는 피하도록 합니다.";
    const appetiteWaterTimingSentence =
      "만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다.";
    const liquidOnlyDrinkSentence = "물종류만 먹을 수 있을때는 꿀물, 설탕물, 이온음료를 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움·구토 시 식사전후 과다 물·음료 피하고 마른 음식 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(mealBeverageSentence);
    expect(terms).not.toContain(appetiteWaterTimingSentence);
    expect(terms).not.toContain(liquidOnlyDrinkSentence);
    expect(terms).not.toContain("물");
    expect(terms).not.toContain("음료");
    expect(terms).not.toContain("마른 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|탈수 치료|수분 제한 치료/);
  });

  it("recognizes NCC nausea-vomiting care stop-until-vomiting-ends source sentence", () => {
    const sourceSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const vomitingDietActiveSentence = "구토증상이 있는 경우 먹거나 마시지 않도록 합니다.";
    const vomitingDietStepSentence =
      "구토증상이 있는 경우 먹거나 마시지 않도록 합니다. 구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움·구토 시 구토가 멈출 때까지 음식·음료 피하기 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(vomitingDietActiveSentence);
    expect(terms).not.toContain(vomitingDietStepSentence);
    expect(terms).not.toContain("구토증상이 있는 경우 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain("음료");
    expect(terms).not.toContain("음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|단식 치료|탈수 치료|수분 제한 치료/);
  });

  it("recognizes NCC nausea-vomiting care post-vomiting water and carbonated drink source sentence", () => {
    const sourceSentence =
      "구토 후 1~2시간 정도의 시간이 경과한 후에 수분 섭취를 하도록 합니다. 탄산음료는 되도록 피하고 물을 섭취하는 것이 좋습니다.";
    const stopUntilVomitingEndsSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const genericCarbonatedSentence = "과자나 탄산음료";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움·구토 후 1~2시간 뒤 물 섭취와 탄산음료 피하기 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(stopUntilVomitingEndsSentence);
    expect(terms).not.toContain(genericCarbonatedSentence);
    expect(terms).not.toContain("탄산음료");
    expect(terms).not.toContain("물");
    expect(terms).not.toContain("수분");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|탈수 치료|수분 제한 치료|무제한 수분/);
  });

  it("recognizes NCC nausea-vomiting care staged post-vomiting intake source sentence", () => {
    const sourceSentence =
      "적응이 되면 우유, 요구르트, 주스, 고단백 음료 등을 조금씩 추가하고, 죽에서 밥으로 서서히 바꾸어 갑니다.";
    const gentleFoodsSentence =
      "일반적으로 메스꺼움과 구토에는 비스킷, 토스트, 요구르트, 튀기지 않은 껍질이 있는 닭, 부드럽고 자극적이지 않은 복숭아 통조림과 같은 과일과 야채, 얼음 조각 등이 좋습니다.";
    const lowMicrobialSentence = "쥬스 우유 요구르트 저온살균 제품";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 후 적응 시 우유·요구르트·주스·고단백 음료와 죽-밥 단계 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(gentleFoodsSentence);
    expect(terms).not.toContain(lowMicrobialSentence);
    expect(terms).not.toContain("우유");
    expect(terms).not.toContain("요구르트");
    expect(terms).not.toContain("주스");
    expect(terms).not.toContain("고단백 음료");
    expect(terms).not.toContain("죽");
    expect(terms).not.toContain("밥");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|체중증가 치료|감염 예방 치료|저온살균 지시/);
  });

  it("recognizes NCC nausea-vomiting care persistent-vomiting fluid clinician-help source sentence", () => {
    const sourceSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const postVomitingWaterSentence =
      "구토 후 1~2시간 정도의 시간이 경과한 후에 수분 섭취를 하도록 합니다. 탄산음료는 되도록 피하고 물을 섭취하는 것이 좋습니다.";
    const vomitingDietConsultSentence = "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.";
    const diarrheaElectrolyteSentence =
      "염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분과 칼륨이 들어있는 식품으로는 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등입니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 메스꺼움·구토 지속 시 수분·전해질 유지와 체액 주사 의료진 도움 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(postVomitingWaterSentence);
    expect(terms).not.toContain(vomitingDietConsultSentence);
    expect(terms).not.toContain(diarrheaElectrolyteSentence);
    expect(terms).not.toContain("수분공급");
    expect(terms).not.toContain("전해질");
    expect(terms).not.toContain("의료진");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|탈수 치료|자가 주사|정맥 주사 지시|전해질 치료/);
  });

  it("recognizes NCC nausea-vomiting care low-intake repeated-vomiting clinician-consultation source sentence", () => {
    const sourceSentence =
      "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때";
    const persistentVomitingFluidSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const vomitingDietConsultSentence = "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.";
    const activeVomitingRestrictionSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 메스꺼움·구토 시 하루 4컵 이하 섭취·2일 이상 식사 어려움·반복 구토 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(persistentVomitingFluidSentence);
    expect(terms).not.toContain(vomitingDietConsultSentence);
    expect(terms).not.toContain(activeVomitingRestrictionSentence);
    expect(terms).not.toContain("음식");
    expect(terms).not.toContain("식사");
    expect(terms).not.toContain("구토");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|음식량 목표|강제 섭취|칼로리 처방|탈수 치료/);
  });

  it("recognizes NCC nausea-vomiting care post-vomiting throat-food cough clinician-consultation source sentence", () => {
    const sourceSentence = "구토 후 목에 음식물이 걸린 느낌과 기침이 계속되는 경우";
    const persistentVomitingFluidSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const lowIntakeRepeatedVomitingSentence =
      "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때";
    const activeVomitingRestrictionSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const mouthPainSoftFoodSentence = "부드럽고 삼키기 쉬운 음식을 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 메스꺼움·구토 후 목 음식물 걸림 느낌·기침 지속 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(persistentVomitingFluidSentence);
    expect(terms).not.toContain(lowIntakeRepeatedVomitingSentence);
    expect(terms).not.toContain(activeVomitingRestrictionSentence);
    expect(terms).not.toContain(mouthPainSoftFoodSentence);
    expect(terms).not.toContain("목");
    expect(terms).not.toContain("기침");
    expect(terms).not.toContain("구토");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|삼킴 훈련|연하 치료|흡인 치료|기침 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care 12-hour or hourly vomiting clinician-consultation source sentence", () => {
    const sourceSentence = "구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우";
    const throatFoodCoughSentence = "구토 후 목에 음식물이 걸린 느낌과 기침이 계속되는 경우";
    const persistentVomitingFluidSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const lowIntakeRepeatedVomitingSentence =
      "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때";
    const vomitingDietConsultSentence = "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.";
    const activeVomitingRestrictionSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 메스꺼움·구토 12시간 이상 지속 또는 한 시간 3번 이상 구토 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(throatFoodCoughSentence);
    expect(terms).not.toContain(persistentVomitingFluidSentence);
    expect(terms).not.toContain(lowIntakeRepeatedVomitingSentence);
    expect(terms).not.toContain(vomitingDietConsultSentence);
    expect(terms).not.toContain(activeVomitingRestrictionSentence);
    expect(terms).not.toContain("구토");
    expect(terms).not.toContain("12시간");
    expect(terms).not.toContain("3번");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|응급치료|응급처치|수액 치료|진토제 처방|구토 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care persistent nausea daily-activity clinician-consultation source sentence", () => {
    const sourceSentence = "오심이 며칠이상 지속되거나 오심 때문에 당신이 중요한 일을 하지 못할 때";
    const nauseaTriggerConsultSentence =
      "메스꺼움이 언제, 무엇 때문에 나타나는지를 체크하고 의사선생님이나 간호사와 상의합니다.";
    const nauseaAntiemeticConsultSentence =
      "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.";
    const hourlyVomitingSentence = "구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우";
    const vomitingDietConsultSentence = "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 오심 며칠 이상 지속 또는 중요한 일 수행 어려움 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(nauseaTriggerConsultSentence);
    expect(terms).not.toContain(nauseaAntiemeticConsultSentence);
    expect(terms).not.toContain(hourlyVomitingSentence);
    expect(terms).not.toContain(vomitingDietConsultSentence);
    expect(terms).not.toContain("오심");
    expect(terms).not.toContain("며칠");
    expect(terms).not.toContain("중요한 일");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|활동 처방|생활 제한 처방|진토제 처방|오심 치료|구토 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care projectile vomiting clinician-consultation source sentence", () => {
    const sourceSentence = "참지 못하는 구토가 멀리까지 분출되는 경우";
    const persistentNauseaDailyActivitySentence =
      "오심이 며칠이상 지속되거나 오심 때문에 당신이 중요한 일을 하지 못할 때";
    const hourlyVomitingSentence = "구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우";
    const vomitingDietConsultSentence = "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.";
    const activeVomitingRestrictionSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 참기 어려운 구토가 멀리까지 분출되는 경우 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(persistentNauseaDailyActivitySentence);
    expect(terms).not.toContain(hourlyVomitingSentence);
    expect(terms).not.toContain(vomitingDietConsultSentence);
    expect(terms).not.toContain(activeVomitingRestrictionSentence);
    expect(terms).not.toContain("구토");
    expect(terms).not.toContain("분출");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|응급치료|응급처치|진토제 처방|구토 치료|분출 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care severe weakness dizziness clinician-consultation source sentence", () => {
    const sourceSentence = "심하게 힘이 없거나 현기증이 있을 경우";
    const projectileVomitingSentence = "참지 못하는 구토가 멀리까지 분출되는 경우";
    const persistentNauseaDailyActivitySentence =
      "오심이 며칠이상 지속되거나 오심 때문에 당신이 중요한 일을 하지 못할 때";
    const fatigueCauseConsultSentence =
      "만일 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요합니다.";
    const activeVomitingRestrictionSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 심한 무력감 또는 현기증 발생 시 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(projectileVomitingSentence);
    expect(terms).not.toContain(persistentNauseaDailyActivitySentence);
    expect(terms).not.toContain(fatigueCauseConsultSentence);
    expect(terms).not.toContain(activeVomitingRestrictionSentence);
    expect(terms).not.toContain("힘이 없");
    expect(terms).not.toContain("현기증");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|응급치료|응급처치|진토제 처방|구토 치료|피로 치료|운동 처방|활동 처방|어지럼 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care repeated vomiting dark-yellow urine reduced-urination clinician-consultation source sentence", () => {
    const sourceSentence =
      "수차례 구토를 하고, 소변의 색이 진한 노란색이고 평상시의 소변 횟수만큼 화장실에 가지 못할 때";
    const severeWeaknessDizzinessSentence = "심하게 힘이 없거나 현기증이 있을 경우";
    const persistentVomitingFluidSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const lowIntakeRepeatedVomitingSentence =
      "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때";
    const activeVomitingRestrictionSentence = "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.";
    const postVomitingWaterSentence =
      "구토 후 1~2시간 정도 지난 후에 물을 먹도록 합니다. 탄산음료는 되도록 피하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 수차례 구토와 진한 노란 소변·소변 횟수 감소 시 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(severeWeaknessDizzinessSentence);
    expect(terms).not.toContain(persistentVomitingFluidSentence);
    expect(terms).not.toContain(lowIntakeRepeatedVomitingSentence);
    expect(terms).not.toContain(activeVomitingRestrictionSentence);
    expect(terms).not.toContain(postVomitingWaterSentence);
    expect(terms).not.toContain("소변");
    expect(terms).not.toContain("노란색");
    expect(terms).not.toContain("화장실");
    expect(terms).not.toContain("구토");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|탈수 치료|수액 처방|자가 수분 치료|전해질 처방|응급치료|응급처치|진토제 처방|구토 치료|소변 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care persistent vomiting head-fog dizziness confusion clinician-consultation source sentence", () => {
    const sourceSentence = "구토가 지속되고 머리가 띵하거나 어지럽거나, 혼란한 느낌이 들 때";
    const repeatedVomitingReducedUrinationSentence =
      "수차례 구토를 하고, 소변의 색이 진한 노란색이고 평상시의 소변 횟수만큼 화장실에 가지 못할 때";
    const severeWeaknessDizzinessSentence = "심하게 힘이 없거나 현기증이 있을 경우";
    const vomitingHourlySentence = "구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우";
    const persistentVomitingFluidSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 구토 지속과 머리 띵함·어지러움·혼란감 시 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(repeatedVomitingReducedUrinationSentence);
    expect(terms).not.toContain(severeWeaknessDizzinessSentence);
    expect(terms).not.toContain(vomitingHourlySentence);
    expect(terms).not.toContain(persistentVomitingFluidSentence);
    expect(terms).not.toContain("구토");
    expect(terms).not.toContain("어지럽");
    expect(terms).not.toContain("혼란");
    expect(terms).not.toContain("머리가 띵");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|탈수 치료|수액 처방|자가 수분 치료|전해질 처방|응급치료|응급처치|진토제 처방|구토 치료|어지럼 치료|혼란 치료|두통 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care coffee-colored vomit possible blood clinician-consultation source sentence", () => {
    const sourceSentence = "구토물이 커피색일 때 (혈액일 수 있음)";
    const persistentVomitingHeadFogSentence =
      "구토가 지속되고 머리가 띵하거나 어지럽거나, 혼란한 느낌이 들 때";
    const repeatedVomitingReducedUrinationSentence =
      "수차례 구토를 하고, 소변의 색이 진한 노란색이고 평상시의 소변 횟수만큼 화장실에 가지 못할 때";
    const persistentVomitingFluidSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const coffeeFoodLimitSentence =
      "반면, 기름지고, 튀긴 음식, 사탕이나 케익과 같이 너무 단 음식, 맵거나 뜨거운 음식, 강한 냄새가 나는 유제품, 붉은 고기, 커피 등은 피하도록 하는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 구토물이 커피색일 때 혈액 가능성 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(persistentVomitingHeadFogSentence);
    expect(terms).not.toContain(repeatedVomitingReducedUrinationSentence);
    expect(terms).not.toContain(persistentVomitingFluidSentence);
    expect(terms).not.toContain(coffeeFoodLimitSentence);
    expect(terms).not.toContain("커피");
    expect(terms).not.toContain("혈액");
    expect(terms).not.toContain("구토물");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|응급치료|응급처치|출혈 진단|출혈 치료|혈액검사|혈액 검사|커피 제한|커피 금지|커피 피하기|구토 치료|자가 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care prescribed antiemetic persistent symptoms clinician-consultation source sentence", () => {
    const sourceSentence =
      "의사가 처방한 진토제를 복용했는데도 오심 구토가 계속될 때";
    const antiemeticPlanningSentence =
      "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.";
    const antiemeticSideEffectSentence = "진토제 복용한 후 부작용 이 발생했을 때";
    const coffeeColoredVomitSentence = "구토물이 커피색일 때 (혈액일 수 있음)";
    const persistentNauseaDailyActivitySentence =
      "오심이 며칠이상 지속되거나 오심 때문에 당신이 중요한 일을 하지 못할 때";
    const persistentVomitingHeadFogSentence =
      "구토가 지속되고 머리가 띵하거나 어지럽거나, 혼란한 느낌이 들 때";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 처방 진토제 복용 후 오심·구토 지속 시 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(antiemeticPlanningSentence);
    expect(terms).not.toContain(antiemeticSideEffectSentence);
    expect(terms).not.toContain(coffeeColoredVomitSentence);
    expect(terms).not.toContain(persistentNauseaDailyActivitySentence);
    expect(terms).not.toContain(persistentVomitingHeadFogSentence);
    expect(terms).not.toContain("진토제");
    expect(terms).not.toContain("항구토제");
    expect(terms).not.toContain("오심");
    expect(terms).not.toContain("구토");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|항구토제 복용 권장|진토제 추가|진토제 복용 권장|복용량 조절|약 변경|약 중단|처방 변경|응급치료|응급처치|오심 치료|구토 치료|자가 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care antiemetic side-effect clinician-consultation source sentence", () => {
    const sourceSentence = "진토제 복용한 후 부작용 이 발생했을 때";
    const prescribedAntiemeticPersistentSymptomsSentence =
      "의사가 처방한 진토제를 복용했는데도 오심 구토가 계속될 때";
    const antiemeticPlanningSentence =
      "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.";
    const severeWeaknessDizzinessSentence = "심하게 힘이 없거나 현기증이 있을 경우";
    const persistentVomitingHeadFogSentence =
      "구토가 지속되고 머리가 띵하거나 어지럽거나, 혼란한 느낌이 들 때";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 진토제 복용 후 부작용 발생 시 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(prescribedAntiemeticPersistentSymptomsSentence);
    expect(terms).not.toContain(antiemeticPlanningSentence);
    expect(terms).not.toContain(severeWeaknessDizzinessSentence);
    expect(terms).not.toContain(persistentVomitingHeadFogSentence);
    expect(terms).not.toContain("진토제");
    expect(terms).not.toContain("항구토제");
    expect(terms).not.toContain("부작용");
    expect(terms).not.toContain("오심");
    expect(terms).not.toContain("구토");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|항구토제 복용 권장|진토제 추가|진토제 복용 권장|복용량 조절|약 변경|약 중단|처방 변경|부작용 치료|응급치료|응급처치|오심 치료|구토 치료|자가 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care severe nausea-vomiting unable-to-take-medicine clinician-consultation source sentence", () => {
    const sourceSentence =
      "심한 초심이나 구토 때문에 약을 먹을 수 없을 때, 또는 온종일 물을 제대로 마시지 못하거나 식사를 하지 못한 경우";
    const antiemeticSideEffectSentence = "진토제 복용한 후 부작용 이 발생했을 때";
    const prescribedAntiemeticPersistentSymptomsSentence =
      "의사가 처방한 진토제를 복용했는데도 오심 구토가 계속될 때";
    const lowIntakeRepeatedVomitingSentence =
      "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때";
    const persistentVomitingFluidElectrolyteSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason:
        "국가암정보센터 심한 오심·구토로 약 복용 불가 또는 종일 수분·식사 어려움 시 의료진 상담 필요",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(antiemeticSideEffectSentence);
    expect(terms).not.toContain(prescribedAntiemeticPersistentSymptomsSentence);
    expect(terms).not.toContain(lowIntakeRepeatedVomitingSentence);
    expect(terms).not.toContain(persistentVomitingFluidElectrolyteSentence);
    expect(terms).not.toContain("오심");
    expect(terms).not.toContain("구토");
    expect(terms).not.toContain("약");
    expect(terms).not.toContain("물");
    expect(terms).not.toContain("식사");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(
      /완치|암을 낫게|특효|보조식품 권장|약 복용 권장|약 추가|복용량 조절|약 변경|약 중단|처방 변경|수액 처방|정맥주사 지시|응급치료|응급처치|오심 치료|구토 치료|수분 치료|식사 치료|자가 치료/,
    );
  });

  it("recognizes NCC nausea-vomiting care post-meal upright rest source sentence", () => {
    const sourceSentence =
      "식사직후에 움직이는 것은 소화를 느리게 하므로 식후에는 잠시 쉬도록 하며, 식사 후 한 시간 정도 똑바로 앉아서 휴식을 취하는 것이 가장 좋습니다.";
    const broaderNauseaDietSentence =
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

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 식후 움직임 줄이고 바른 자세 휴식 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(broaderNauseaDietSentence);
    expect(terms).not.toContain("식후 1시간 정도는 휴식을 취하는 것이 좋습니다.");
    expect(terms).not.toContain("똑바로 앉아서");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|소화 치료/);
  });

  it("recognizes NCC nausea-vomiting care gentle foods source sentence", () => {
    const sourceSentence =
      "일반적으로 메스꺼움과 구토에는 비스킷, 토스트, 요구르트, 튀기지 않은 껍질이 있는 닭, 부드럽고 자극적이지 않은 복숭아 통조림과 같은 과일과 야채, 얼음 조각 등이 좋습니다.";
    const broaderNauseaDietSentence = "토스트, 크래커, 요거트, 샤베트";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 비스킷·토스트·요구르트·튀기지 않은 닭·부드러운 과일야채·얼음 조각 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(broaderNauseaDietSentence);
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("복숭아통조림");
    expect(terms).not.toContain("얼음조각");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|강제 섭취/);
  });

  it("recognizes NCC nausea-vomiting care mild soft digestible food source sentence", () => {
    const sourceSentence = "자극이 적고 부드럽고 소화가 잘 되는 음식을 먹습니다.";
    const gentleFoodsSentence =
      "일반적으로 메스꺼움과 구토에는 비스킷, 토스트, 요구르트, 튀기지 않은 껍질이 있는 닭, 부드럽고 자극적이지 않은 복숭아 통조림과 같은 과일과 야채, 얼음 조각 등이 좋습니다.";
    const mouthPainSoftFoodSentence = "부드러운 음식을 섭취하고 맵거나 거친 자극적인 음식을 피합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 자극 적고 부드럽고 소화 잘 되는 음식 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(gentleFoodsSentence);
    expect(terms).not.toContain(mouthPainSoftFoodSentence);
    expect(terms).not.toContain("부드러운 음식");
    expect(terms).not.toContain("흰죽");
    expect(terms).not.toContain("소화가 잘 되는 음식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|구내염 치료|소화 치료/);
  });

  it("recognizes NCC nausea-vomiting care cold foods and frozen drink source sentence", () => {
    const sourceSentence =
      "뜨거운 음식은 메스꺼움을 느끼게 할 수 있으므로, 음료나 음식은 차게 섭취하도록 하고, 좋아하는 음료수를 얼려서 마시는 것도 좋은 방법입니다.";
    const mouthPainHotFoodSentence =
      "뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 차가운 음식·음료와 얼린 음료 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain("향이 강하거나 뜨거운 음식");
    expect(terms).not.toContain("뜨거운 음식");
    expect(terms).not.toContain(mouthPainHotFoodSentence);
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|냉찜질 치료/);
  });

  it("recognizes NCC nausea-vomiting care morning toast and cracker source sentence", () => {
    const sourceSentence = "아침에 메스꺼움을 느낀다면, 일어나기 전에 토스트나 크래커를 먹도록 합니다.";
    const broaderNauseaDietSentence = "토스트, 크래커, 요거트, 샤베트";
    const mouthPainSourceLine = "토스트, 크래커 또는 말린 음식 등";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 메스꺼움·구토 시 아침 메스꺼움에 일어나기 전 토스트·크래커 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(broaderNauseaDietSentence);
    expect(terms).not.toContain(mouthPainSourceLine);
    expect(terms).not.toContain("토스트");
    expect(terms).not.toContain("크래커");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|강제 섭취/);
  });

  it("recognizes NCC nausea-vomiting care fatty fried spicy sweet food limit source sentence", () => {
    const sourceSentence = "기름진 음식, 튀긴 음식, 짜고 매운 음식, 지나치게 단 음식은 피합니다.";
    const broaderNauseaDietSentence = "다음 음식들은 메스꺼움을 더욱 유발할 수 있으므로 피하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccNauseaVomitingCare.label).toBe(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    );
    expect(foodGuidanceSources.nccNauseaVomitingCare.url).toBe(
      "https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 메스꺼움·구토 시 기름진·튀긴·짜고 매운·지나치게 단 음식 회피 후보",
      sourceId: "nccNauseaVomitingCare",
    });
    expect(terms).not.toContain(broaderNauseaDietSentence);
    expect(terms).not.toContain("기름진 음식");
    expect(terms).not.toContain("매우 단 음식");
    expect(terms).not.toContain("지나치게 단 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/완치|암을 낫게|특효|보조식품 권장|나트륨 치료/);
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

  it("recognizes NCC vomiting active intake restriction and clear-liquid source sentence", () => {
    const sourceSentence =
      "구토증상이 있는 경우 먹거나 마시지 않도록 합니다. 구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.";
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
      reason: "국가암정보센터 구토 중 섭취 중단 후 맑은 유동식 단계적 증량 확인 후보",
      sourceId: "nccVomitingDiet",
    });
    expect(terms).not.toContain("구토증상이 있는 경우 먹거나 마시지 않도록 합니다.");
    expect(terms).not.toContain(
      "구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.",
    );
    expect(terms).not.toContain("구토 조절 후 물");
    expect(terms).not.toContain("구토 조절 후 육수");
    expect(terms).not.toContain("구토 맑은 유동식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
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

  it("recognizes NCC taste-change dental check and oral rinse source sentence", () => {
    const sourceSentence =
      "음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고, 입안을 자주 헹구도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const careTeamGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "care-team")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccTasteChangeDiet.label).toBe(
      "국가암정보센터 증상별 식생활 - 입맛의 변화",
    );
    expect(foodGuidanceSources.nccTasteChangeDiet.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(assessment.level).toBe("risk");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "risk",
      reason: "국가암정보센터 입맛 변화 시 치과 문제 확인·입안 자주 헹굼 필요",
      sourceId: "nccTasteChangeDiet",
    });
    expect(terms).not.toContain("음식을 먹은 후 입안은 깨끗이 헹구어 청결하게 유지합니다.");
    expect(terms).not.toContain("입맛 변화 생선");
    expect(terms).not.toContain("레몬즙 양념");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|음식 허용/);
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

  it("recognizes NCC chemo side-effect diarrhea avoid-food source sentence", () => {
    const sourceSentence =
      "피해야 할 음식: 알코올, 카페인 함유 제품, 우유 및 유제품, 고지방식, 고섬유식, 과일 주스, 매운 음식 등 입니다.";
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
      reason: "국가암정보센터 항암 부작용 설사 시 알코올·카페인·고지방·고섬유 식품 피하기 후보",
      sourceId: "nccChemoSideEffectGuide",
    });
    expect(terms).not.toContain("알코올");
    expect(terms).not.toContain("우유 및 유제품");
    expect(terms).not.toContain("매운 음식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 항암 부작용 증상 관리 지침 - https://cancer.go.kr/download.do?uuid=d402e586-c237-419d-ae6f-da36d3b97109.pdf",
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

  it("recognizes NCC chemo side-effect constipation fiber-food source sentence", () => {
    const sourceSentence = "섬유질이 많은 음식(야채, 채소, 현미, 견과류 등)을 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const balancedGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "balanced")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccChemoSideEffectGuide.label).toBe(
      "국가암정보센터 항암 부작용 증상 관리 지침",
    );
    expect(assessment.level).toBe("ok");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 항암 부작용 변비 시 섬유질 많은 음식 후보",
      sourceId: "nccChemoSideEffectGuide",
    });
    expect(terms).not.toContain("변비 도정 덜 된 곡류");
    expect(terms).not.toContain("변비 생야채");
    expect(terms).not.toContain("호두");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 항암 부작용 증상 관리 지침 - https://cancer.go.kr/download.do?uuid=d402e586-c237-419d-ae6f-da36d3b97109.pdf",
    );
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

  it("recognizes NCC weight-change weight-loss carbohydrate snack examples source phrase", () => {
    const sourcePhrase = "사탕, 젤리, 크래커, 빵류, 과일, 주스 등";
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
      reason: "국가암정보센터 체중감소 시 탄수화물 간식 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("크래커");
    expect(terms).not.toContain("과일 간식");
    expect(terms).not.toContain("체중증가 사탕");
    expect(terms).not.toContain("체중증가 과자류");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(limitGuideText).toContain("가능한 고열량의 간식은 먹지 않도록 합니다.");
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

  it("recognizes NCC weight-change weight-loss meat fruit juice cooking examples source phrase", () => {
    const sourcePhrase = "고기를 과일 주스에 담그거나 과일 통조림과 함께 조리한다.";
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
      reason: "국가암정보센터 체중감소 시 고기 과일주스 조리 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 과일주스");
    expect(terms).not.toContain("체중감소 과일통조림");
    expect(terms).not.toContain("고기 싫을 때 생선");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss meat bitter taste seasoning examples source phrase", () => {
    const sourcePhrase = "마늘, 양파, 고추장, 카레, 케찹 등을 사용하여 고기의 쓴맛을 제거한다.";
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
      reason: "국가암정보센터 체중감소 시 고기 쓴맛 조리 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain(
      "고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다.",
    );
    expect(terms).not.toContain("레몬즙 양념");
    expect(terms).not.toContain("새콤달콤한 소스");
    expect(terms).not.toContain("고기 싫을 때 생선");
    expect(terms).not.toContain("매운 음식");
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(limitGuideText).toContain("가능한 고열량의 간식은 먹지 않도록 합니다.");
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss egg protein examples source phrase", () => {
    const sourcePhrase = "계란 : 계란후라이, 계란찜, 수란, 오믈렛, 메추리알조림 등";
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
      reason: "국가암정보센터 체중감소 시 계란 단백질 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 계란찜");
    expect(terms).not.toContain("치료 중 달걀 두부 우유");
    expect(terms).not.toContain("입맛 변화 계란");
    expect(terms).not.toContain("날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다.");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss bean tofu protein examples source phrase", () => {
    const sourcePhrase = "콩, 두부 : 콩밥, 두유, 연두부찜, 두부조림, 된장찌개, 콩자반 등";
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
      reason: "국가암정보센터 체중감소 시 콩·두부 단백질 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 두유");
    expect(terms).not.toContain("체중감소 두부조림");
    expect(terms).not.toContain("치료 중 달걀 두부 우유");
    expect(terms).not.toContain("입맛 변화 두부");
    expect(terms).not.toContain("입맛 변화 콩");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss fish protein examples source phrase", () => {
    const sourcePhrase = "생선 : 생선포, 생선전, 생선조림, 어묵, 마른 오징어 등";
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
      reason: "국가암정보센터 체중감소 시 생선 단백질 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 생선전");
    expect(terms).not.toContain("체중감소 어묵");
    expect(terms).not.toContain("입맛 변화 생선");
    expect(terms).not.toContain("고기 싫을 때 생선");
    expect(terms).not.toContain("치료 중 육류와 생선류");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss dairy protein examples source phrase", () => {
    const sourcePhrase = "유제품 : 우유, 요구르트, 요플레, 아이스크림, 밀크쉐이크, 치즈 등";
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
      reason: "국가암정보센터 체중감소 시 유제품 단백질 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중감소 요구르트");
    expect(terms).not.toContain("치료 중 우유와 유제품 하루 1컵");
    expect(terms).not.toContain("치료 중 요구르트 두유 치즈");
    expect(terms).not.toContain("입맛 변화 우유나 유제품");
    expect(terms).not.toContain("저온살균 우유");
    expect(terms).not.toContain("저온살균 요구르트");
    expect(terms).not.toContain("설사 우유 및 유제품");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourcePhrase);
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss milk powder drink source sentence", () => {
    const sourceSentence = "탈지분유나 분유를 우유에 타서 마신다.";
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
      reason: "국가암정보센터 체중감소 시 탈지분유·분유 우유 활용 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain(
      "우유, 두유 등 음료 : 설탕, 꿀, 초콜릿, 미숫가루, 분유 등을 타서 먹는다.",
    );
    expect(terms).not.toContain("체중감소 두유");
    expect(terms).not.toContain("치료 중 우유와 유제품 하루 1컵");
    expect(terms).not.toContain("입맛 변화 우유나 유제품");
    expect(terms).not.toContain("저온살균 우유");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss misutgaru milk soy drink source sentence", () => {
    const sourceSentence = "미숫가루를 만들 때 물 대신 우유 또는 두유를 이용한다.";
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
      reason: "국가암정보센터 체중감소 시 미숫가루 우유·두유 활용 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain(
      "우유, 두유 등 음료 : 설탕, 꿀, 초콜릿, 미숫가루, 분유 등을 타서 먹는다.",
    );
    expect(terms).not.toContain("탈지분유나 분유를 우유에 타서 마신다.");
    expect(terms).not.toContain("체중감소 두유");
    expect(terms).not.toContain("치료 중 우유와 유제품 하루 1컵");
    expect(terms).not.toContain("치료 중 요구르트 두유 치즈");
    expect(terms).not.toContain("입맛 변화 우유나 유제품");
    expect(terms).not.toContain("저온살균 우유");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss egg salad source sentence", () => {
    const sourceSentence = "야채샐러드에 삶은 계란을 다져 넣는다.";
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
      reason: "국가암정보센터 체중감소 시 야채샐러드 삶은 계란 활용 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("야채샐러드 : 마요네즈, 샐러드드레싱을 충분히 사용한다.");
    expect(terms).not.toContain("계란 : 계란후라이, 계란찜, 수란, 오믈렛, 메추리알조림 등");
    expect(terms).not.toContain("체중감소 계란찜");
    expect(terms).not.toContain("치료 중 달걀 두부 우유");
    expect(terms).not.toContain("입맛 변화 계란");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss egg batter source sentence", () => {
    const sourceSentence = "부침 등에 물 대신 계란을 많이 사용한다.";
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
      reason: "국가암정보센터 체중감소 시 부침 계란 활용 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("계란 : 계란후라이, 계란찜, 수란, 오믈렛, 메추리알조림 등");
    expect(terms).not.toContain("야채샐러드에 삶은 계란을 다져 넣는다.");
    expect(terms).not.toContain("체중감소 계란찜");
    expect(terms).not.toContain("치료 중 달걀 두부 우유");
    expect(terms).not.toContain("입맛 변화 계란");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-loss yogurt cracker bread source sentence", () => {
    const sourceSentence = "크래커나 빵을 요플레와 함께 먹는다.";
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
      reason: "국가암정보센터 체중감소 시 크래커·빵 요플레 활용 예시 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("유제품 : 우유, 요구르트, 요플레, 아이스크림, 밀크쉐이크, 치즈 등");
    expect(terms).not.toContain("부침 등에 물 대신 계란을 많이 사용한다.");
    expect(terms).not.toContain("입맛 변화 우유나 유제품");
    expect(terms).not.toContain("저온살균 우유");
    expect(terms).not.toContain("치료 중 요구르트 두유 치즈");
    expect(terms).not.toContain(
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    );
    expect(balancedGuideText).toContain(sourceSentence);
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

  it("recognizes NCC weight-change weight-gain high-salt food limit source sentence", () => {
    const sourceSentence =
      "소금이 우리 몸에서 수분을 축적시키는 작용을 하므로 염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등)은 제한하고 가능한 싱겁게 먹는 것이 좋습니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
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
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 체중증가 시 고염분 식품 제한 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중증가 가공식품");
    expect(terms).not.toContain("체중증가 김치");
    expect(terms).not.toContain("체중증가 젓갈");
    expect(terms).not.toContain("체중증가 장아찌류");
    expect(terms).not.toContain("젓갈류");
    expect(terms).not.toContain("염 저장식품");
    expect(terms).not.toContain("김치 또는 장아찌류");
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(limitGuideText).toContain(sourceSentence);
    expect(careTeamGuideText).toContain(
      "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다.",
    );
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC weight-change weight-gain appetite high-calorie low-nutrition source sentence", () => {
    const sourceSentence =
      "반면, 식욕이 증가된 경우에는 열량이 높고 영양가가 없는 식품들(예: 청량 음료, 초콜릿, 사탕, 과자류 등)은 제한하도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");
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
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 체중증가 시 식욕증가 고열량 저영양 식품 제한 후보",
      sourceId: "nccWeightChangeDiet",
    });
    expect(terms).not.toContain("체중증가 청량 음료");
    expect(terms).not.toContain("체중증가 초콜릿");
    expect(terms).not.toContain("체중증가 사탕");
    expect(terms).not.toContain("체중증가 과자류");
    expect(terms).not.toContain("체중증가 고열량 간식");
    expect(terms).not.toContain("매우 단 음식");
    expect(terms).not.toContain("딱딱한 사탕");
    expect(terms).not.toContain(
      "소금이 우리 몸에서 수분을 축적시키는 작용을 하므로 염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등)은 제한하고 가능한 싱겁게 먹는 것이 좋습니다.",
    );
    expect(limitGuideText).toContain(sourceSentence);
    expect(careTeamGuideText).toContain(
      "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다.",
    );
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
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

  it("recognizes NCC fatigue and depression nutritious-food source sentence", () => {
    const sourceSentence =
      "영양이 풍부한 음식을 충분히 섭취합니다. 불충분한 열량과 영양소 섭취가 피로의 원인이 될 수 있기 때문입니다.";
    const assessment = assessCancerFood(sourceSentence);
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
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 피로감·우울 시 영양이 풍부한 음식과 충분한 섭취 후보",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("피로감 영양이 풍부한 음식");
    expect(terms).not.toContain("피로감 적은 양의 식사와 간식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression best-time meal source sentence", () => {
    const sourceSentence = "하루 중 가장 좋은 시간에 가능한 많이 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
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
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 피로감·우울 시 하루 중 좋은 시간 식사 후보",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("피로감 하루 중 가장 좋은 시간에 많이 먹기");
    expect(terms).not.toContain("피로감 휴식 후 먹기");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression rest-after meal source sentence", () => {
    const sourceSentence = "낮잠이나 휴식 후에 먹는 것이 더 편안함을 느낄 수 있습니다.";
    const assessment = assessCancerFood(sourceSentence);
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
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 피로감·우울 시 낮잠이나 휴식 후 식사 후보",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("피로감 하루 중 가장 좋은 시간에 많이 먹기");
    expect(terms).not.toContain("피로감 휴식 후 먹기");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression small-meal source sentence", () => {
    const sourceSentence = "적은 양의 식사와 간식을 자주 먹습니다.";
    const assessment = assessCancerFood(sourceSentence);
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
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 피로감·우울 시 적은 양의 식사와 간식 후보",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("피로감 적은 양의 식사와 간식");
    expect(terms).not.toContain("피로감 휴식 후 먹기");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression family-friend help source sentence", () => {
    const sourceSentence = "가족이나 친구의 도움을 받도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
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
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 피로감·우울 시 가족·친구 식사 도움 후보",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("피로감 음식배달서비스");
    expect(terms).not.toContain("피로감 적은 양의 식사와 간식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression food-delivery source sentence", () => {
    const sourceSentence = "주변의 이용 가능한 음식배달서비스를 알아두고 이용합니다.";
    const assessment = assessCancerFood(sourceSentence);
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
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 피로감·우울 시 음식배달서비스 이용 후보",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("피로감 음식배달서비스");
    expect(terms).not.toContain("피로감 적은 양의 식사와 간식");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression favorite-food source sentence", () => {
    const sourceSentence = "치료를 받지 않을 때에는 좋아하는 음식을 먹도록 합니다.";
    const assessment = assessCancerFood(sourceSentence);
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
    expect(terms).toEqual([sourceSentence]);
    expect(matchesByTerm[sourceSentence]).toMatchObject({
      level: "ok",
      reason: "국가암정보센터 피로감·우울 시 치료를 받지 않을 때 좋아하는 음식 후보",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("우울 좋아하는 음식");
    expect(terms).not.toContain("피로감 음식배달서비스");
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
  });

  it("recognizes NCC fatigue and depression cause clinician discussion source sentence", () => {
    const sourceSentence =
      "만일 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요합니다.";
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
      reason: "국가암정보센터 피로감·우울 시 피로 원인 의료진 상담 필요",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(terms).not.toContain("피로감 영양이 풍부한 음식");
    expect(terms).not.toContain("피로감 하루 중 가장 좋은 시간에 많이 먹기");
    expect(terms).not.toContain("우울 좋아하는 음식");
    expect(careTeamGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
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

  it("recognizes MFDS food poisoning six-rule time and temperature food-safety guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const mfdsGuide = careTeamGuideItems?.find(
      (item) => item.label === "식약처 식중독 예방 6대수칙",
    );
    const safePracticeAssessment = assessCancerFood(
      "흐르는 물에 비누로 30초 이상 씻기, 육류 중심온도 75˚C(어패류는 85˚C) 1분 이상 익히기, 물은 끓여서 먹기, 냉장식품은 5˚C 이하, 냉동식품은 -18˚C 이하",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "조리한 음식이 상온에 오랜시간 방치되고, 조리후 2시간 초과 김밥을 먹을지 고민",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.mfdsFoodPoisoningPrevention).toMatchObject({
      label: "식품의약품안전처 식중독 예방 6대요령",
      url: "https://www.mfds.go.kr/brd/m_827/view.do?seq=3609",
    });
    expect(mfdsGuide).toMatchObject({
      label: "식약처 식중독 예방 6대수칙",
      sourceIds: ["mfdsFoodPoisoningPrevention"],
    });
    expect(mfdsGuide?.detail).toContain("흐르는 물에 비누로 30초 이상");
    expect(mfdsGuide?.detail).toContain("육류 중심온도 75˚C");
    expect(mfdsGuide?.detail).toContain("어패류는 85˚C");
    expect(mfdsGuide?.detail).toContain("냉장식품은 5˚C 이하");
    expect(mfdsGuide?.detail).toContain("냉동식품은 -18˚C 이하");
    expect(mfdsGuide?.detail).toContain("조리후 2시간 이내 섭취");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "흐르는 물에 비누로 30초 이상 씻기",
      "육류 중심온도 75˚C(어패류는 85˚C) 1분 이상 익히기",
      "물은 끓여서 먹기",
      "냉장식품은 5˚C 이하",
      "냉동식품은 -18˚C 이하",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "mfdsFoodPoisoningPrevention",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품의약품안전처 식중독 예방 6대요령 - https://www.mfds.go.kr/brd/m_827/view.do?seq=3609",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual(["상온에 오랜시간 방치", "조리후 2시간 초과"]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        reason: "식약처 식중독 예방 조리 후 상온 방치·2시간 초과 확인 필요",
        sourceId: "mfdsFoodPoisoningPrevention",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes KDCA vibrio sepsis high-risk seafood safety guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const kdcaGuide = careTeamGuideItems?.find(
      (item) => item.label === "질병관리청 비브리오 어패류 안전",
    );
    const safePracticeAssessment = assessCancerFood(
      "어패류는 충분히 익혀 먹습니다, 어패류는 흐르는 물에 깨끗이 씻은 후 85℃ 이상으로 가열 처리, 조개류를 끓여 요리할 때는 껍질이 열린 후 5분 이상 끓이고, 증기로 익히는 경우에는 9분이상 더 요리합니다, 어패류를 요리한 도마, 칼 등의 조리도구는 소독하여 사용합니다, 어패류를 다룰 때 장갑을 착용합니다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "비브리오 패혈증 때문에 면역저하 환자가 날것이나 덜 익힌 어패류를 먹거나 항암제 치료 중 어패류 생식을 고민하고 피부에 상처가 있는 사람은 바닷물과 접촉하지 않도록 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );
    const rawOysterAssessment = assessCancerFood("생굴");

    expect(foodGuidanceSources.kdcaVibrioSepsis).toMatchObject({
      label: "질병관리청 국가건강정보포털 비브리오 패혈증",
      url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5372",
    });
    expect(kdcaGuide).toMatchObject({
      label: "질병관리청 비브리오 어패류 안전",
      sourceIds: ["kdcaVibrioSepsis"],
    });
    expect(kdcaGuide?.detail).toContain("면역저하자");
    expect(kdcaGuide?.detail).toContain("항암제 치료 중");
    expect(kdcaGuide?.detail).toContain("날것이나 덜 익힌 어패류");
    expect(kdcaGuide?.detail).toContain("85℃ 이상");
    expect(kdcaGuide?.detail).toContain("껍질이 열린 후 5분 이상");
    expect(kdcaGuide?.detail).toContain("증기로 익히는 경우에는 9분이상");
    expect(kdcaGuide?.detail).toContain("피부에 상처가 있는");
    expect(kdcaGuide?.detail).toContain("장갑 착용");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "어패류는 충분히 익혀 먹습니다",
      "어패류는 흐르는 물에 깨끗이 씻은 후 85℃ 이상으로 가열 처리",
      "조개류를 끓여 요리할 때는 껍질이 열린 후 5분 이상 끓이고, 증기로 익히는 경우에는 9분이상 더 요리합니다",
      "어패류를 요리한 도마, 칼 등의 조리도구는 소독하여 사용합니다",
      "어패류를 다룰 때 장갑을 착용합니다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "kdcaVibrioSepsis",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "질병관리청 국가건강정보포털 비브리오 패혈증 - https://health.kdca.go.kr/healthinfo/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "비브리오 패혈증",
      "날것이나 덜 익힌 어패류",
      "항암제 치료 중 어패류 생식",
      "피부에 상처가 있는 사람은 바닷물과 접촉하지 않도록",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "kdcaVibrioSepsis",
      });
    }
    expect(rawOysterAssessment.matches[0]).toMatchObject({
      term: "생굴",
      level: "risk",
      sourceId: "nccImmuneLowDiet",
    });
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes KDCA norovirus food-safety and high-risk dehydration guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const kdcaGuide = careTeamGuideItems?.find(
      (item) => item.label === "질병관리청 노로바이러스 식중독 예방",
    );
    const safePracticeAssessment = assessCancerFood(
      "음식물은 충분히 익혀 먹기(85℃ 이상에서 1분 이상 가열), 식재료를 흐르는 물에 세척하여 85℃ 이상에서 충분히 익혀 먹기, 조리한 식품은 실온에 두지 말고 10℃ 이하의 냉장고에 보관",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "노로바이러스 식중독 때문에 면역저하자 노로바이러스 탈수 관찰이 필요하고 오염된 식재료를 조리하지 않고 섭취했을 때 또는 환자 구토물 접촉환경을 걱정",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.kdcaNorovirusFoodSafety).toMatchObject({
      label: "질병관리청 국가건강정보포털 노로바이러스 식중독 예방",
      url: "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=80",
    });
    expect(kdcaGuide).toMatchObject({
      label: "질병관리청 노로바이러스 식중독 예방",
      sourceIds: ["kdcaNorovirusFoodSafety"],
    });
    expect(kdcaGuide?.detail).toContain("면역저하자");
    expect(kdcaGuide?.detail).toContain("구토와 설사로 인한 탈수");
    expect(kdcaGuide?.detail).toContain("85℃ 이상에서 1분 이상");
    expect(kdcaGuide?.detail).toContain("10℃ 이하의 냉장고");
    expect(kdcaGuide?.detail).toContain("염소 소독");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "음식물은 충분히 익혀 먹기(85℃ 이상에서 1분 이상 가열)",
      "식재료를 흐르는 물에 세척하여 85℃ 이상에서 충분히 익혀 먹기",
      "조리한 식품은 실온에 두지 말고 10℃ 이하의 냉장고에 보관",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "kdcaNorovirusFoodSafety",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "질병관리청 국가건강정보포털 노로바이러스 식중독 예방 - https://health.kdca.go.kr/healthinfo/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "노로바이러스 식중독",
      "면역저하자 노로바이러스 탈수",
      "오염된 식재료를 조리하지 않고 섭취",
      "환자 구토물 접촉환경",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "kdcaNorovirusFoodSafety",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes FoodSafetyKorea norovirus contamination and disinfection guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyKoreaGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 노로바이러스 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "감염자의 변, 구토물에 접촉하지 않으며, 접촉한 경우에는 충분히 세척하고 소독을 하여야 한다, 조리자는 용변을 본 후나 조리하기 전에 반드시 손을 잘 씻고 소독을 하여야 한다, 과일과 채소는 철저히 씻어야 하며, 굴 등의 어패류는 중심온도 85℃에서 1분 이상 가열하여 먹는다, 질병 발생 후 오염된 표면은 소독제로 철저히 세척, 살균하고 바이러스에 감염된 옷과 이불 등은 즉시 비누를 사용하여 뜨거운 물로 세탁하여야 한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "노로바이러스는 껍질이 없는(Non-envelop) 바이러스이고 주로 분변-구강 경로(Fecal-oral route)를 통하여 감염되며 사람의 장관 내에서만 증식할 수 있고 연중 발생 가능하며 2차 발병률이 높다, 음식(패류, 샐러드, 과일, 냉장식품, 샌드위치, 상추, 냉장조리 햄, 빙과류)이나 노로바이러스 패류, 노로바이러스 샐러드, 노로바이러스 과일, 노로바이러스 냉장식품, 노로바이러스 샌드위치, 노로바이러스 상추, 노로바이러스 냉장조리 햄, 노로바이러스 빙과류, 노로바이러스 물, 특히 사람의 분변에 오염된 물이나 식품을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaNorovirusFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 노로바이러스",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyKoreaGuide).toMatchObject({
      label: "식품안전나라 노로바이러스 식중독 주의",
      sourceIds: ["foodSafetyKoreaNorovirusFoodPoisoning"],
    });
    expect(foodSafetyKoreaGuide?.detail).toContain("분변-구강 경로");
    expect(foodSafetyKoreaGuide?.detail).toContain("2차 발병률");
    expect(foodSafetyKoreaGuide?.detail).toContain("패류, 샐러드, 과일, 냉장식품");
    expect(foodSafetyKoreaGuide?.detail).toContain("감염자의 변, 구토물");
    expect(foodSafetyKoreaGuide?.detail).toContain("중심온도 85℃에서 1분 이상");
    expect(foodSafetyKoreaGuide?.detail).toContain("뜨거운 물로 세탁");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "감염자의 변, 구토물에 접촉하지 않으며, 접촉한 경우에는 충분히 세척하고 소독을 하여야 한다",
      "조리자는 용변을 본 후나 조리하기 전에 반드시 손을 잘 씻고 소독을 하여야 한다",
      "과일과 채소는 철저히 씻어야 하며, 굴 등의 어패류는 중심온도 85℃에서 1분 이상 가열하여 먹는다",
      "질병 발생 후 오염된 표면은 소독제로 철저히 세척, 살균하고 바이러스에 감염된 옷과 이불 등은 즉시 비누를 사용하여 뜨거운 물로 세탁하여야 한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaNorovirusFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 노로바이러스 - https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "껍질이 없는(Non-envelop) 바이러스",
      "분변-구강 경로(Fecal-oral route)를 통하여 감염",
      "사람의 장관 내에서만 증식",
      "연중 발생 가능하며 2차 발병률이 높다",
      "음식(패류, 샐러드, 과일, 냉장식품, 샌드위치, 상추, 냉장조리 햄, 빙과류)",
      "노로바이러스 패류",
      "노로바이러스 샐러드",
      "노로바이러스 과일",
      "노로바이러스 냉장식품",
      "노로바이러스 샌드위치",
      "노로바이러스 상추",
      "노로바이러스 냉장조리 햄",
      "노로바이러스 빙과류",
      "노로바이러스 물",
      "사람의 분변에 오염된 물이나 식품",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaNorovirusFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes KDCA natural-toxin food poisoning risk guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const kdcaGuide = careTeamGuideItems?.find(
      (item) => item.label === "질병관리청 자연독 식중독 주의",
    );
    const potatoPracticeAssessment = assessCancerFood(
      "감자의 독이 포함된 부위(싹이 난 부위나 녹색을 띠는 부위)를 잘라내야 합니다",
    );
    const riskAssessment = assessCancerFood(
      "복어독은 열에 강하기 때문에 120℃에서 1시간 이상 가열해도 파괴되지 않습니다, 복어요리 전문가가 조리하지 않은 복어, 야생 독버섯을 식용버섯으로 오인, 녹색을 띠는 감자, 곰팡이독은 세척하거나 열을 가하더라도 없어지지 않고",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.kdcaFoodPoisoningNaturalToxins).toMatchObject({
      label: "질병관리청 국가건강정보포털 식중독",
      url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5239",
    });
    expect(kdcaGuide).toMatchObject({
      label: "질병관리청 자연독 식중독 주의",
      sourceIds: ["kdcaFoodPoisoningNaturalToxins"],
    });
    expect(kdcaGuide?.detail).toContain("테트로도톡신");
    expect(kdcaGuide?.detail).toContain("복어독은 열에 강하기 때문에");
    expect(kdcaGuide?.detail).toContain("야생 독버섯");
    expect(kdcaGuide?.detail).toContain("솔라닌");
    expect(kdcaGuide?.detail).toContain("곰팡이독");

    expect(potatoPracticeAssessment.level).toBe("ok");
    expect(potatoPracticeAssessment.matches[0]).toMatchObject({
      term: "감자의 독이 포함된 부위(싹이 난 부위나 녹색을 띠는 부위)를 잘라내야 합니다",
      level: "ok",
      sourceId: "kdcaFoodPoisoningNaturalToxins",
    });
    expect(formatFoodMatchEvidence(potatoPracticeAssessment.matches[0])).toContain(
      "질병관리청 국가건강정보포털 식중독 - https://health.kdca.go.kr/healthinfo/",
    );

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "복어독은 열에 강하기 때문에 120℃에서 1시간 이상 가열해도 파괴되지 않습니다",
      "복어요리 전문가가 조리하지 않은 복어",
      "야생 독버섯을 식용버섯으로 오인",
      "녹색을 띠는 감자",
      "곰팡이독은 세척하거나 열을 가하더라도 없어지지 않고",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "kdcaFoodPoisoningNaturalToxins",
      });
    }
    expect(JSON.stringify([...potatoPracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes FoodSafetyKorea listeria refrigerated and unpasteurized food guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 리스테리아 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "살균 안 된 우유를 섭취하지 말아야 한다, 냉장 보관 온도(5℃ 이하) 관리를 철저하게 하여야 한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "리스테리아균은 냉장온도에서도 생존하여 증식할 수 있고, 살균처리하지 아니한 우유, 치즈(특히 소프트치즈), 소시지 및 건조 소시지, 리스테리아 원유, 리스테리아 핫도그, 리스테리아 아이스크림, 리스테리아 살균처리하지 아니한 우유, 리스테리아 살균 안 된 우유, 리스테리아 치즈, 리스테리아 소프트치즈, 리스테리아 소시지, 리스테리아 건조 소시지, 리스테리아 가금육, 리스테리아 가공 가금육, 리스테리아 비가공 가금육, 리스테리아 비가공 식육, 가공·비가공 가금육, 비가공 식육을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaListeriaFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 리스테리아",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 리스테리아 식중독 주의",
      sourceIds: ["foodSafetyKoreaListeriaFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("냉장온도에서도 생존하여 증식");
    expect(foodSafetyGuide?.detail).toContain("살균처리하지 아니한 우유");
    expect(foodSafetyGuide?.detail).toContain("소프트치즈");
    expect(foodSafetyGuide?.detail).toContain("핫도그");
    expect(foodSafetyGuide?.detail).toContain("원유");
    expect(foodSafetyGuide?.detail).toContain("아이스크림");
    expect(foodSafetyGuide?.detail).toContain("가공·비가공 가금육");
    expect(foodSafetyGuide?.detail).toContain("비가공 식육");
    expect(foodSafetyGuide?.detail).toContain("소시지 및 건조 소시지");
    expect(foodSafetyGuide?.examples).toContain("원유");
    expect(foodSafetyGuide?.examples).toContain("아이스크림");
    expect(foodSafetyGuide?.examples).toContain("가공·비가공 가금육");
    expect(foodSafetyGuide?.examples).toContain("비가공 식육");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "살균 안 된 우유를 섭취하지 말아야 한다",
      "냉장 보관 온도(5℃ 이하) 관리를 철저하게 하여야 한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaListeriaFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 리스테리아 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "리스테리아균",
      "냉장온도에서도 생존하여 증식",
      "살균처리하지 아니한 우유",
      "치즈(특히 소프트치즈)",
      "소시지 및 건조 소시지",
      "리스테리아 원유",
      "리스테리아 핫도그",
      "리스테리아 아이스크림",
      "리스테리아 살균처리하지 아니한 우유",
      "리스테리아 살균 안 된 우유",
      "리스테리아 치즈",
      "리스테리아 소프트치즈",
      "리스테리아 소시지",
      "리스테리아 건조 소시지",
      "리스테리아 가금육",
      "리스테리아 가공 가금육",
      "리스테리아 비가공 가금육",
      "리스테리아 비가공 식육",
      "가공·비가공 가금육",
      "비가공 식육",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaListeriaFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게|리스테리아를 예방합니다|감염을 막습니다/,
    );
  });

  it("recognizes FoodSafetyKorea campylobacter raw-meat and poultry food-safety guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 캠필로박터 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "생육을 만진 경우 손을 깨끗하게 씻고 소독하여 2차 오염 방지하여야 한다, 마시는 물도 끓여 마셔야 한다, 조리 기구는 물로 끓이거나 소독하여 건조시켜야 한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "캠필로박터균은 소, 돼지, 개, 고양이, 닭, 우유, 물이 원인이 될 수 있고 캠필로박터 소, 캠필로박터 돼지, 캠필로박터 닭, 캠필로박터 닭고기, 캠필로박터 우유, 캠필로박터 물, 캠필로박터 하천수, 캠필로박터 호수, 육류의 생식이나 불충분한 가열, 동물(조류 등)의 분변에 의한 오염, 식육(특히 닭고기)의 생식을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaCampylobacterFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 캠필로박터",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 캠필로박터 식중독 주의",
      sourceIds: ["foodSafetyKoreaCampylobacterFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("소, 돼지, 개, 고양이, 닭, 우유, 물");
    expect(foodSafetyGuide?.detail).toContain("육류의 생식이나 불충분한 가열");
    expect(foodSafetyGuide?.detail).toContain("동물(조류 등)의 분변");
    expect(foodSafetyGuide?.detail).toContain("식육(특히 닭고기)의 생식");
    expect(foodSafetyGuide?.detail).toContain("조리 기구는 물로 끓이거나 소독하여 건조");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "생육을 만진 경우 손을 깨끗하게 씻고 소독하여 2차 오염 방지하여야 한다",
      "마시는 물도 끓여 마셔야 한다",
      "조리 기구는 물로 끓이거나 소독하여 건조시켜야 한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaCampylobacterFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 캠필로박터 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "캠필로박터균",
      "소, 돼지, 개, 고양이, 닭, 우유, 물",
      "캠필로박터 소",
      "캠필로박터 돼지",
      "캠필로박터 닭",
      "캠필로박터 닭고기",
      "캠필로박터 우유",
      "캠필로박터 물",
      "캠필로박터 하천수",
      "캠필로박터 호수",
      "육류의 생식이나 불충분한 가열",
      "동물(조류 등)의 분변에 의한 오염",
      "식육(특히 닭고기)의 생식",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaCampylobacterFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes FoodSafetyKorea salmonella animal-protein and reheating guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 살모넬라균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "조리 후 식품을 가능한 한 신속히 섭취하도록 하며 남은 음식은 5℃ 이하 저온 보관한다, 식품을 75℃에서 1분 이상 가열 조리한 후 섭취한다, 조리에 사용된 기구 등은 세척·소독하여 2차 오염을 방지한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "살모넬라균은 2~3×0.6um 의 포자를 형성하지 않는 그람음성 간균이고 60℃에서 20분 동안 가열 하면 사멸하나, 균이 생체 내로 침입되면 장내에서 분열·증식되어 독소가 생산되며, 부적절하게 가열한 동물성 단백질식품(우유, 유제품, 고기와 그 가공품, 가금류의 알과 그 가공품, 어패류와 그 가공품)과 보균자의 손, 발 등 2차 오염에 의한 오염식품을 확인, 살모넬라 우유, 살모넬라 유제품, 살모넬라 고기, 살모넬라 고기 가공품, 살모넬라 가금류 알, 살모넬라 가금류 알 가공품, 살모넬라 어패류, 살모넬라 어패류 가공품, 살모넬라 식물성 단백질식품, 살모넬라 채소 복합조리식품, 살모넬라 생선묵, 살모넬라 생선요리, 살모넬라 면류, 살모넬라 야채, 살모넬라 샐러드, 살모넬라 마요네즈, 살모넬라 도시락 원인식품을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaSalmonellaFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 살모넬라균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 살모넬라균 식중독 주의",
      sourceIds: ["foodSafetyKoreaSalmonellaFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("2~3×0.6um 의 포자를 형성하지 않는 그람음성 간균");
    expect(foodSafetyGuide?.detail).toContain("60℃에서 20분");
    expect(foodSafetyGuide?.detail).toContain("부적절하게 가열한 동물성 단백질식품");
    expect(foodSafetyGuide?.detail).toContain("식물성 단백질식품");
    expect(foodSafetyGuide?.detail).toContain("채소 등 복합조리식품");
    expect(foodSafetyGuide?.detail).toContain("생선묵");
    expect(foodSafetyGuide?.detail).toContain("생선요리");
    expect(foodSafetyGuide?.detail).toContain("면류, 야채, 샐러드, 마요네즈, 도시락");
    expect(foodSafetyGuide?.detail).toContain("75℃에서 1분 이상");
    expect(foodSafetyGuide?.examples).toContain("식물성 단백질식품");
    expect(foodSafetyGuide?.examples).toContain("채소 등 복합조리식품");
    expect(foodSafetyGuide?.examples).toContain("생선묵");
    expect(foodSafetyGuide?.examples).toContain("생선요리");
    expect(foodSafetyGuide?.examples).toContain("면류, 야채, 샐러드, 마요네즈, 도시락");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "조리 후 식품을 가능한 한 신속히 섭취하도록 하며 남은 음식은 5℃ 이하 저온 보관한다",
      "식품을 75℃에서 1분 이상 가열 조리한 후 섭취한다",
      "조리에 사용된 기구 등은 세척·소독하여 2차 오염을 방지한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaSalmonellaFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 살모넬라균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "살모넬라균",
      "2~3×0.6um 의 포자를 형성하지 않는 그람음성 간균",
      "60℃에서 20분 동안 가열 하면 사멸",
      "균이 생체 내로 침입되면 장내에서 분열·증식되어 독소가 생산",
      "부적절하게 가열한 동물성 단백질식품(우유, 유제품, 고기와 그 가공품, 가금류의 알과 그 가공품, 어패류와 그 가공품)",
      "보균자의 손, 발 등 2차 오염에 의한 오염식품",
      "살모넬라 우유",
      "살모넬라 유제품",
      "살모넬라 고기",
      "살모넬라 고기 가공품",
      "살모넬라 가금류 알",
      "살모넬라 가금류 알 가공품",
      "살모넬라 어패류",
      "살모넬라 어패류 가공품",
      "살모넬라 식물성 단백질식품",
      "살모넬라 채소 복합조리식품",
      "살모넬라 생선묵",
      "살모넬라 생선요리",
      "살모넬라 면류",
      "살모넬라 야채",
      "살모넬라 샐러드",
      "살모넬라 마요네즈",
      "살모넬라 도시락",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaSalmonellaFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게|감염을 막습니다|살모넬라를 예방합니다/,
    );
  });

  it("recognizes MFDS salmonella egg cooking and cross-contamination guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const mfdsGuide = careTeamGuideItems?.find(
      (item) => item.label === "식약처 달걀 살모넬라 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "생달걀 또는 달걀물을 만진 후 비누로 30초 이상 손씻기, 생달걀과 일반 조리과정은 구분하고 칼·도마·집게·장갑 등은 분리 사용, 달걀 조리식품은 중심부까지 충분히 가열하기, 달걀 보관온도(0~10℃)를 준수, 작업대·용기·조리 기구는 사용 후 즉시 세척·소독",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "살모넬라 식중독 의심 사례에서 생달걀을 만진 손을 씻지 않고 다른 음식 조리, 가열 전 달걀물이 묻은 집게를 조리 완제품에도 혼용 사용, 충분히 익지 않은 육전 제공, 남은 달걀물의 재사용, 달걀물을 상온에서 장시간 보관, 조리 후 작업공간 세척·소독 미실시를 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.mfdsSalmonellaEggSafety).toMatchObject({
      label: "식품의약품안전처 달걀 조리식품 살모넬라 식중독 주의",
      url: "https://www.mfds.go.kr/brd/m_99/view.do?seq=50005",
    });
    expect(mfdsGuide).toMatchObject({
      label: "식약처 달걀 살모넬라 식중독 주의",
      sourceIds: ["mfdsSalmonellaEggSafety"],
    });
    expect(mfdsGuide?.detail).toContain("생달걀 또는 달걀물을 만진 후");
    expect(mfdsGuide?.detail).toContain("칼·도마·집게·장갑 등은 분리 사용");
    expect(mfdsGuide?.detail).toContain("달걀 조리식품은 중심부까지 충분히 가열");
    expect(mfdsGuide?.detail).toContain("달걀 보관온도(0~10℃)");
    expect(mfdsGuide?.detail).toContain("작업대·용기·조리 기구는 사용 후 즉시 세척·소독");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "생달걀 또는 달걀물을 만진 후 비누로 30초 이상 손씻기",
      "생달걀과 일반 조리과정은 구분하고 칼·도마·집게·장갑 등은 분리 사용",
      "달걀 조리식품은 중심부까지 충분히 가열하기",
      "달걀 보관온도(0~10℃)를 준수",
      "작업대·용기·조리 기구는 사용 후 즉시 세척·소독",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "mfdsSalmonellaEggSafety",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품의약품안전처 달걀 조리식품 살모넬라 식중독 주의 - https://www.mfds.go.kr/brd/m_99/view.do?seq=50005",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "살모넬라 식중독",
      "생달걀을 만진 손을 씻지 않고 다른 음식 조리",
      "가열 전 달걀물이 묻은 집게를 조리 완제품에도 혼용 사용",
      "충분히 익지 않은 육전",
      "남은 달걀물의 재사용",
      "달걀물을 상온에서 장시간 보관",
      "조리 후 작업공간 세척·소독 미실시",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "mfdsSalmonellaEggSafety",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes FoodSafetyKorea enterohemorrhagic E. coli cooking and cross-contamination guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 장출혈성 대장균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "조리기구(칼, 도마 등) 구분 사용으로 2차 오염을 방지하여야 한다, 생육과 조리된 음식을 구분하여 보관하여야 한다, 다진 고기는 중심부 온도가 75℃ 1분 이상 가열하여야 한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "장출혈성 대장균은 장관출혈성대장균 또는 장관출혈성 대장균이라고도 부르며, 베로독소(verotoxin)를 생성하고 장관출혈성대장균은 혈청형에 따라 O26, O103, O104, O146, O157 등이 있으며 대장균 O157:H7이 대표적이고, 대장균 O157:H7의 경우 10~100개의 균으로도 병원성을 나타내며, 주요 증상은 설사, 복통, 발열, 구토이고 심하면 출혈성 대장염, 용혈성요독증후군, 혈전성혈소판 감소증이 나타날 수 있으며, 환자와 보균자의 분변으로부터 직접·간접으로 오염되는 식품, 환자나 보균자의 분변, 소, 돼지와 개, 고양이 등의 분변, 보균자가 화장실을 비위생적으로 사용할 때, 하천수와 어패류 등에서 분리 검출되는 오염 경로와 장출혈성 대장균 베로독소, 장출혈성 대장균 혈청형 O26 O103 O104 O146 O157, 장출혈성 대장균 O157:H7 10~100개 균, 장출혈성 대장균 직접 간접 분변 오염 식품, 장출혈성 대장균 비위생적 화장실 사용, 장출혈성 대장균 설사 복통 발열 구토, 장출혈성 대장균 동물 분변, 장출혈성 대장균 하천수, 장출혈성 대장균 2차 오염, 장출혈성 대장균 햄, 장출혈성 대장균 치즈, 장출혈성 대장균 소시지, 장출혈성 대장균 채소샐러드, 장출혈성 대장균 분유, 장출혈성 대장균 두부, 장출혈성 대장균 음료수, 장출혈성 대장균 어패류, 장출혈성 대장균 도시락, 장출혈성 대장균 급식 원인식품을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 장출혈성 대장균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 장출혈성 대장균 식중독 주의",
      sourceIds: ["foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("장관출혈성대장균");
    expect(foodSafetyGuide?.detail).toContain("베로독소");
    expect(foodSafetyGuide?.detail).toContain("O26, O103, O104, O146, O157");
    expect(foodSafetyGuide?.detail).toContain("대장균 O157:H7");
    expect(foodSafetyGuide?.detail).toContain("10~100개의 균");
    expect(foodSafetyGuide?.detail).toContain("설사, 복통, 발열, 구토");
    expect(foodSafetyGuide?.detail).toContain("출혈성 대장염");
    expect(foodSafetyGuide?.detail).toContain("환자와 보균자의 분변으로부터 직접·간접");
    expect(foodSafetyGuide?.detail).toContain("소, 돼지와 개, 고양이 등의 분변");
    expect(foodSafetyGuide?.detail).toContain("햄, 치즈, 소시지");
    expect(foodSafetyGuide?.detail).toContain("채소샐러드");
    expect(foodSafetyGuide?.detail).toContain("분유, 두부, 음료수");
    expect(foodSafetyGuide?.detail).toContain("하천수와 어패류 등에서 분리 검출");
    expect(foodSafetyGuide?.detail).toContain("1차 및 2차 오염으로 감염될 수 있다");
    expect(foodSafetyGuide?.detail).toContain("도시락, 급식");
    expect(foodSafetyGuide?.detail).toContain("생육과 조리된 음식을 구분");
    expect(foodSafetyGuide?.detail).toContain("다진 고기는 중심부 온도가 75℃ 1분 이상");
    expect(foodSafetyGuide?.examples).toContain("햄, 치즈, 소시지");
    expect(foodSafetyGuide?.examples).toContain("채소샐러드");
    expect(foodSafetyGuide?.examples).toContain("분유, 두부, 음료수");
    expect(foodSafetyGuide?.examples).toContain("도시락, 급식");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "조리기구(칼, 도마 등) 구분 사용으로 2차 오염을 방지하여야 한다",
      "생육과 조리된 음식을 구분하여 보관하여야 한다",
      "다진 고기는 중심부 온도가 75℃ 1분 이상 가열하여야 한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 장출혈성 대장균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "장출혈성 대장균",
      "장관출혈성대장균",
      "장관출혈성 대장균",
      "베로독소(verotoxin)",
      "장관출혈성대장균은 혈청형에 따라 O26, O103, O104, O146, O157 등이 있으며",
      "대장균 O157:H7",
      "대장균 O157:H7의 경우 10~100개의 균으로도 병원성을 나타내며",
      "주요 증상은 설사, 복통, 발열, 구토",
      "출혈성 대장염, 용혈성요독증후군, 혈전성혈소판 감소증",
      "환자와 보균자의 분변으로부터 직접·간접으로 오염되는 식품",
      "환자나 보균자의 분변",
      "소, 돼지와 개, 고양이 등의 분변",
      "보균자가 화장실을 비위생적으로 사용할 때",
      "하천수와 어패류 등에서 분리 검출",
      "장출혈성 대장균 베로독소",
      "장출혈성 대장균 혈청형 O26 O103 O104 O146 O157",
      "장출혈성 대장균 O157:H7 10~100개 균",
      "장출혈성 대장균 직접 간접 분변 오염 식품",
      "장출혈성 대장균 비위생적 화장실 사용",
      "장출혈성 대장균 설사 복통 발열 구토",
      "장출혈성 대장균 동물 분변",
      "장출혈성 대장균 하천수",
      "장출혈성 대장균 2차 오염",
      "장출혈성 대장균 햄",
      "장출혈성 대장균 치즈",
      "장출혈성 대장균 소시지",
      "장출혈성 대장균 채소샐러드",
      "장출혈성 대장균 분유",
      "장출혈성 대장균 두부",
      "장출혈성 대장균 음료수",
      "장출혈성 대장균 어패류",
      "장출혈성 대장균 도시락",
      "장출혈성 대장균 급식",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게|감염을 막습니다|대장균을 예방합니다/,
    );
  });

  it("recognizes FoodSafetyKorea vibrio parahaemolyticus seafood and sashimi-tool guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 장염비브리오균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "어패류는 수돗물로 잘 씻고, 횟감용 칼, 도마는 구분하여 사용하여야 한다, 오염된 조리 기구는 세정, 열탕 처리하여 2차 오염을 방지하여야 한다, 가능한 한 생식을 피하고, 이 균은 60℃에서 5분, 55℃에서 10분의 가열로 쉽게 사멸하므로 반드시 식품을 가열한 후 섭취한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "장염비브리오균은 2~4%의 소금물에서 잘 생육하며 해수온도가 15℃ 이상이 되면 급격히 증식하고, 짧은 쉼표 모양을 나타내며, 어패류, 생선회, 수산식품(게장, 생선회, 오징어무침, 꼬막무침 등) 원인식품과 장염비브리오 어패류, 장염비브리오 생선회, 장염비브리오 수산식품, 장염비브리오 게장, 장염비브리오 오징어무침, 장염비브리오 꼬막무침, 장염비브리오 오징어, 장염비브리오 문어, 장염비브리오 고등어, 장염비브리오 조개, 장염비브리오 패류를 확인하고 어패류의 체표와 내장 및 아가미 등에 부착되는 경로를 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 장염비브리오균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 장염비브리오균 식중독 주의",
      sourceIds: ["foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("2~4%의 소금물");
    expect(foodSafetyGuide?.detail).toContain("해수온도가 15℃ 이상");
    expect(foodSafetyGuide?.detail).toContain("횟감용 칼, 도마는 구분");
    expect(foodSafetyGuide?.detail).toContain("60℃에서 5분, 55℃에서 10분");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "어패류는 수돗물로 잘 씻고, 횟감용 칼, 도마는 구분하여 사용하여야 한다",
      "오염된 조리 기구는 세정, 열탕 처리하여 2차 오염을 방지하여야 한다",
      "가능한 한 생식을 피하고, 이 균은 60℃에서 5분, 55℃에서 10분의 가열로 쉽게 사멸하므로 반드시 식품을 가열한 후 섭취한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 장염비브리오균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "장염비브리오균",
      "2~4%의 소금물에서 잘 생육",
      "해수온도가 15℃ 이상이 되면 급격히 증식",
      "짧은 쉼표 모양",
      "어패류, 생선회, 수산식품(게장, 생선회, 오징어무침, 꼬막무침 등)",
      "장염비브리오 어패류",
      "장염비브리오 생선회",
      "장염비브리오 수산식품",
      "장염비브리오 게장",
      "장염비브리오 오징어무침",
      "장염비브리오 꼬막무침",
      "장염비브리오 오징어",
      "장염비브리오 문어",
      "장염비브리오 고등어",
      "장염비브리오 조개",
      "장염비브리오 패류",
      "어패류의 체표와 내장 및 아가미 등에 부착",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes FoodSafetyKorea staphylococcus aureus toxin and food-handler wound guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 황색포도상구균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "식품 취급자는 손을 청결히 하며 손에 창상 또는 화농되거나 신체 다른 부위에 화농이 있으면 식품을 취급해서는 안된다, 식품제조에 필요한 모든 기구와 기기 등을 청결히 유지하여 2차 오염을 방지한다, 식품은 적당량을 조속히 조리한 후 모두 섭취하고, 식품이 남았을 경우에는 실온에 방치하지 말고 5℃ 이하에 냉장 보관한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "황색포도상구균은 장독소(enterotoxin)를 함유한 식품을 섭취할 때 일어나는 독소형 식중독균이고, 코 안이나 피부에 상재한 균이 식품에 혼입될 수 있으며, 손에 창상 또는 화농, 신체 다른 부위에 화농, 육류 및 그 가공품과 우유, 크림, 버터, 치즈, 밥, 김밥, 도시락, 두부를 확인, 황색포도상구균 육류, 황색포도상구균 육류 가공품, 황색포도상구균 우유, 황색포도상구균 밥, 황색포도상구균 김밥, 황색포도상구균 도시락, 황색포도상구균 두부, 황색포도상구균 과자류, 황색포도상구균 유제품, 황색포도상구균 크림, 황색포도상구균 버터, 황색포도상구균 치즈, 황색포도상구균 복합조리식품, 황색포도상구균 소스, 황색포도상구균 어육 연제품을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaStaphylococcusAureusFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 황색포도상구균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 황색포도상구균 식중독 주의",
      sourceIds: ["foodSafetyKoreaStaphylococcusAureusFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("장독소(enterotoxin)");
    expect(foodSafetyGuide?.detail).toContain("100℃에서 60분간");
    expect(foodSafetyGuide?.detail).toContain("과자류와 유제품");
    expect(foodSafetyGuide?.detail).toContain("복합조리식품");
    expect(foodSafetyGuide?.detail).toContain("소스");
    expect(foodSafetyGuide?.detail).toContain("어육 연제품");
    expect(foodSafetyGuide?.detail).toContain("손에 창상 또는 화농");
    expect(foodSafetyGuide?.detail).toContain("5℃ 이하에 냉장 보관");
    expect(foodSafetyGuide?.examples).toContain("과자류와 유제품");
    expect(foodSafetyGuide?.examples).toContain("복합조리식품");
    expect(foodSafetyGuide?.examples).toContain("소스");
    expect(foodSafetyGuide?.examples).toContain("어육 연제품");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "식품 취급자는 손을 청결히 하며 손에 창상 또는 화농되거나 신체 다른 부위에 화농이 있으면 식품을 취급해서는 안된다",
      "식품제조에 필요한 모든 기구와 기기 등을 청결히 유지하여 2차 오염을 방지한다",
      "식품은 적당량을 조속히 조리한 후 모두 섭취하고, 식품이 남았을 경우에는 실온에 방치하지 말고 5℃ 이하에 냉장 보관한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 황색포도상구균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "황색포도상구균",
      "장독소(enterotoxin)",
      "코 안이나 피부에 상재",
      "손에 창상 또는 화농",
      "신체 다른 부위에 화농",
      "육류 및 그 가공품과 우유, 크림, 버터, 치즈",
      "밥, 김밥, 도시락, 두부",
      "황색포도상구균 육류",
      "황색포도상구균 육류 가공품",
      "황색포도상구균 우유",
      "황색포도상구균 밥",
      "황색포도상구균 김밥",
      "황색포도상구균 도시락",
      "황색포도상구균 두부",
      "황색포도상구균 과자류",
      "황색포도상구균 유제품",
      "황색포도상구균 크림",
      "황색포도상구균 버터",
      "황색포도상구균 치즈",
      "황색포도상구균 복합조리식품",
      "황색포도상구균 소스",
      "황색포도상구균 어육 연제품",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게|감염을 막습니다|포도상구균을 예방합니다/,
    );
  });

  it("recognizes FoodSafetyKorea bacillus cereus room-temperature storage and rice-food guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 바실러스 세레우스균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "곡류, 채소류는 세척하여 사용하여야 한다, 조리된 음식은 장기간 실온방치를 금지하고, 5℃이하에서 냉장보관 한다, 저온보존이 부적절한 김밥 같은 식품은 조리 후 바로 섭취하여야 한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "바실러스 세레우스균은 설사형 독소(Diarrhetic toxin)와 구토형 독소(Emetic toxin)를 생산하며, 향신료 사용 요리, 육류 및 채소의 스프, 푸딩, 볶음밥, 토양 상재균 오염을 확인, 바실러스 향신료 사용 요리, 바실러스 육류 채소 스프, 바실러스 육류 스프, 바실러스 채소 스프, 바실러스 푸딩, 바실러스 쌀밥, 바실러스 김밥, 바실러스 볶음밥을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaBacillusCereusFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 바실러스 세레우스균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 바실러스 세레우스균 식중독 주의",
      sourceIds: ["foodSafetyKoreaBacillusCereusFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("135℃에서 4시간");
    expect(foodSafetyGuide?.detail).toContain("구토형 독소(Emetic toxin)");
    expect(foodSafetyGuide?.detail).toContain("향신료 사용 요리");
    expect(foodSafetyGuide?.detail).toContain("쌀밥, 볶음밥");
    expect(foodSafetyGuide?.detail).toContain("조리된 음식은 장기간 실온방치를 금지");
    expect(foodSafetyGuide?.detail).toContain("저온보존이 부적절한 김밥 같은 식품");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "곡류, 채소류는 세척하여 사용하여야 한다",
      "조리된 음식은 장기간 실온방치를 금지하고, 5℃이하에서 냉장보관 한다",
      "저온보존이 부적절한 김밥 같은 식품은 조리 후 바로 섭취하여야 한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaBacillusCereusFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 바실러스 세레우스균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "바실러스 세레우스균",
      "설사형 독소(Diarrhetic toxin)",
      "구토형 독소(Emetic toxin)",
      "향신료 사용 요리, 육류 및 채소의 스프, 푸딩",
      "볶음밥",
      "토양 상재균",
      "바실러스 향신료 사용 요리",
      "바실러스 육류 채소 스프",
      "바실러스 육류 스프",
      "바실러스 채소 스프",
      "바실러스 푸딩",
      "바실러스 쌀밥",
      "바실러스 김밥",
      "바실러스 볶음밥",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaBacillusCereusFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes FoodSafetyKorea clostridium perfringens bulk-storage and reheating guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 클로스트리디움 퍼프린젠스균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "식품을 대량으로 큰 용기에 보관하면 혐기조건이 될 수 있으므로 소량씩 용기에 넣어 보관한다, 부득이하게 남은 음식은 먹기 전에 충분히 가열한 후 섭취하여야 한다, 따뜻하게 배식하는 음식은 조리 후 배식까지 60℃ 이상을 유지해야 하며, 차갑게 배식하는 음식은 조리 후 재빨리 식혀 5℃ 이하에서 보관한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "클로스트리디움 퍼프린젠스균은 아포의 발아 시 독소를 생성하고 A형과 C형이 사람의 식중독에 관여하며, 돼지고기, 닭고기, 칠면조고기 등으로 조리한 식품 및 그 가공품인 동물성 단백질식품과 미리 가열 조리된 후 실온에서 5시간이상 방치된 식품을 확인, 퍼프린젠스 돼지고기 조리식품, 퍼프린젠스 닭고기 조리식품, 퍼프린젠스 칠면조고기 조리식품, 퍼프린젠스 돼지고기 가공품, 퍼프린젠스 닭고기 가공품, 퍼프린젠스 칠면조고기 가공품, 퍼프린젠스 동물성 단백질식품, 퍼프린젠스 5시간 실온방치 식품을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaClostridiumPerfringensFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 클로스트리디움 퍼프린젠스균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 클로스트리디움 퍼프린젠스균 식중독 주의",
      sourceIds: ["foodSafetyKoreaClostridiumPerfringensFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("아포의 발아 시 독소를 생성");
    expect(foodSafetyGuide?.detail).toContain("실온에서 5시간이상 방치");
    expect(foodSafetyGuide?.detail).toContain("소량씩 용기에 넣어 보관");
    expect(foodSafetyGuide?.detail).toContain("배식까지 60℃ 이상");
    expect(foodSafetyGuide?.detail).toContain("5℃ 이하에서 보관");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "식품을 대량으로 큰 용기에 보관하면 혐기조건이 될 수 있으므로 소량씩 용기에 넣어 보관한다",
      "부득이하게 남은 음식은 먹기 전에 충분히 가열한 후 섭취하여야 한다",
      "따뜻하게 배식하는 음식은 조리 후 배식까지 60℃ 이상을 유지해야 하며, 차갑게 배식하는 음식은 조리 후 재빨리 식혀 5℃ 이하에서 보관한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 클로스트리디움 퍼프린젠스균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "클로스트리디움 퍼프린젠스균",
      "아포의 발아 시 독소를 생성",
      "A형과 C형",
      "돼지고기, 닭고기, 칠면조고기 등으로 조리한 식품 및 그 가공품인 동물성 단백질식품",
      "미리 가열 조리된 후 실온에서 5시간이상 방치된 식품",
      "퍼프린젠스 돼지고기 조리식품",
      "퍼프린젠스 닭고기 조리식품",
      "퍼프린젠스 칠면조고기 조리식품",
      "퍼프린젠스 돼지고기 가공품",
      "퍼프린젠스 닭고기 가공품",
      "퍼프린젠스 칠면조고기 가공품",
      "퍼프린젠스 동물성 단백질식품",
      "퍼프린젠스 5시간 실온방치 식품",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /치료 음식|완치|암을 낫게|감염을 막습니다|퍼프린젠스를 예방합니다/,
    );
  });

  it("recognizes FoodSafetyKorea yersinia cold-growth and pork-handling guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 여시니아 엔테로콜리티카균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "돈육 취급 시 조리기구와 손을 깨끗이 세척·소독한다, 저온에서 생육이 억제되지 않으며 균이 0℃에서도 증식이 가능한 점을 고려할 때 냉장 및 냉동육과 그 제품의 유통과정에서도 주의하여야 한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "여시니아 엔테로콜리티카균은 0~5℃의 냉장고에서도 발육이 가능한 저온세균이고 진공포장에서도 증식할 수 있는 특성이 있으며, 오물, 오염된 물, 돼지고기, 양고기, 쇠고기, 생우유, 아이스크림 같은 주요 원인식품과 여시니아 오염된 물, 여시니아 돼지고기, 여시니아 양고기, 여시니아 쇠고기, 여시니아 생우유, 여시니아 아이스크림, 여시니아 냉장육, 여시니아 냉동육을 확인하고, 동물의 분변과 함께 배출되어 음료수나 식품에 오염되는 경로, 저온보관 상태에서도 균이 증식하는 상황을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 여시니아 엔테로콜리티카균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 여시니아 엔테로콜리티카균 식중독 주의",
      sourceIds: ["foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("0~5℃의 냉장고에서도 발육");
    expect(foodSafetyGuide?.detail).toContain("진공포장에서도 증식");
    expect(foodSafetyGuide?.detail).toContain("저온보관 상태에서도 균이 증식");
    expect(foodSafetyGuide?.detail).toContain("돈육 취급 시 조리기구와 손");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "돈육 취급 시 조리기구와 손을 깨끗이 세척·소독한다",
      "저온에서 생육이 억제되지 않으며 균이 0℃에서도 증식이 가능한 점을 고려할 때 냉장 및 냉동육과 그 제품의 유통과정에서도 주의하여야 한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 여시니아 엔테로콜리티카균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "여시니아 엔테로콜리티카균",
      "0~5℃의 냉장고에서도 발육이 가능한",
      "진공포장에서도 증식할 수 있는 특성",
      "오물, 오염된 물, 돼지고기, 양고기, 쇠고기, 생우유, 아이스크림",
      "여시니아 오염된 물",
      "여시니아 돼지고기",
      "여시니아 양고기",
      "여시니아 쇠고기",
      "여시니아 생우유",
      "여시니아 아이스크림",
      "여시니아 냉장육",
      "여시니아 냉동육",
      "동물의 분변과 함께 배출되어 음료수나 식품에 오염",
      "저온보관 상태에서도 균이 증식",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /감염을 막습니다|여시니아를 예방합니다|여시니아 감염을 막|치료 음식|완치|암을 낫게/,
    );
  });

  it("recognizes FoodSafetyKorea clostridium botulinum toxin and stored-food guidance", () => {
    const careTeamGuideItems = cancerFoodGuideCategories.find(
      (category) => category.id === "care-team",
    )?.items;
    const foodSafetyGuide = careTeamGuideItems?.find(
      (item) => item.label === "식품안전나라 클로스트리디움 보툴리늄균 식중독 주의",
    );
    const safePracticeAssessment = assessCancerFood(
      "채소와 곡물을 반드시 깨끗이 세척하고 생선 등 어류는 신선한 것으로 조리해야 한다, 통조림·병조림 및 기타 저장식품도 반드시 가열 후 섭취하여야 한다",
    );
    const safeTerms = safePracticeAssessment.matches.map((match) => match.term);
    const safeMatchesByTerm = Object.fromEntries(
      safePracticeAssessment.matches.map((match) => [match.term, match]),
    );
    const riskAssessment = assessCancerFood(
      "클로스트리디움 보툴리늄균은 그람양성의 편성혐기성 간균이며 세포 한쪽 끝에 난 원형의 아포를 형성하고, A형, B형, E형, 및 F형균이 사람에게 식중독을 일으키며, 독소는 80℃, 20분과 100℃, 1~2분 가열로 파괴되고, 통조림, 병조림, 레토르트 식품, 식육, 소시지 생선 같은 원인식품과 보툴리늄 통조림, 보툴리늄 병조림, 보툴리늄 레토르트 식품, 보툴리늄 식육, 보툴리늄 햄, 보툴리늄 소시지, 보툴리늄 육제품, 보툴리늄 생선, 보툴리늄 갑각류, 보툴리늄 저장식품, 보툴리늄 기타 저장식품을 확인하며, 환경조건이 혐기적일 때 아포가 발아하여 증식하면서 식중독을 발생시킬 정도의 독소를 생산하는 상황을 확인",
    );
    const riskTerms = riskAssessment.matches.map((match) => match.term);
    const riskMatchesByTerm = Object.fromEntries(
      riskAssessment.matches.map((match) => [match.term, match]),
    );

    expect(foodGuidanceSources.foodSafetyKoreaClostridiumBotulinumFoodPoisoning).toMatchObject({
      label: "식품안전나라 주요 식중독균별 특성 - 클로스트리디움 보툴리늄균",
      url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
    });
    expect(foodSafetyGuide).toMatchObject({
      label: "식품안전나라 클로스트리디움 보툴리늄균 식중독 주의",
      sourceIds: ["foodSafetyKoreaClostridiumBotulinumFoodPoisoning"],
    });
    expect(foodSafetyGuide?.detail).toContain("세포 한쪽 끝에 난 원형의 아포");
    expect(foodSafetyGuide?.detail).toContain("80℃, 20분과 100℃, 1~2분");
    expect(foodSafetyGuide?.detail).toContain("통조림, 병조림, 레토르트 식품");
    expect(foodSafetyGuide?.detail).toContain("통조림, 햄, 소시지, 육제품");
    expect(foodSafetyGuide?.detail).toContain("어류, 갑각류의 장관");
    expect(foodSafetyGuide?.detail).toContain("환경조건이 혐기적일 때 아포가 발아");
    expect(foodSafetyGuide?.detail).toContain("기타 저장식품도 반드시 가열 후 섭취");

    expect(safePracticeAssessment.level).toBe("ok");
    expect(safeTerms).toEqual([
      "채소와 곡물을 반드시 깨끗이 세척하고 생선 등 어류는 신선한 것으로 조리해야 한다",
      "통조림·병조림 및 기타 저장식품도 반드시 가열 후 섭취하여야 한다",
    ]);
    for (const term of safeTerms) {
      expect(safeMatchesByTerm[term]).toMatchObject({
        level: "ok",
        sourceId: "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
      });
      expect(formatFoodMatchEvidence(safeMatchesByTerm[term])).toContain(
        "식품안전나라 주요 식중독균별 특성 - 클로스트리디움 보툴리늄균 - https://www.foodsafetykorea.go.kr/portal/board/",
      );
    }

    expect(riskAssessment.level).toBe("risk");
    expect(riskTerms).toEqual([
      "클로스트리디움 보툴리늄균",
      "그람양성의 편성혐기성 간균",
      "세포 한쪽 끝에 난 원형의 아포",
      "A형, B형, E형, 및 F형균",
      "80℃, 20분과 100℃, 1~2분 가열로 파괴",
      "통조림, 병조림, 레토르트 식품, 식육, 소시지 생선",
      "보툴리늄 통조림",
      "보툴리늄 병조림",
      "보툴리늄 레토르트 식품",
      "보툴리늄 식육",
      "보툴리늄 햄",
      "보툴리늄 소시지",
      "보툴리늄 육제품",
      "보툴리늄 생선",
      "보툴리늄 갑각류",
      "보툴리늄 저장식품",
      "보툴리늄 기타 저장식품",
      "환경조건이 혐기적일 때 아포가 발아하여 증식하면서 식중독을 발생시킬 정도의 독소를 생산",
    ]);
    for (const term of riskTerms) {
      expect(riskMatchesByTerm[term]).toMatchObject({
        level: "risk",
        sourceId: "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
      });
    }
    expect(JSON.stringify([...safePracticeAssessment.matches, ...riskAssessment.matches])).not.toMatch(
      /감염을 막습니다|보툴리늄을 예방합니다|보툴리늄 감염을 막|치료 음식|완치|암을 낫게/,
    );
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

  it("recognizes immune-low foodborne disease risk reduction parent source sentence", () => {
    const sourceSentence =
      "다음 사항들을 참조하면 식품으로 인한 질병의 위험을 낮추는 데 도움이 될 것입니다.";
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
      reason: "면역저하 시 식품으로 인한 질병 위험 낮추기 후보",
      sourceId: "nccImmuneLowDiet",
    });
    for (const genericTerm of ["유통기한 확인", "완전히 익힌 음식", "저온살균 제품"]) {
      expect(terms).not.toContain(genericTerm);
    }
    expect(balancedGuideText).toContain(sourceSentence);
    expect(formatFoodMatchEvidence(matchesByTerm[sourceSentence])).toContain(
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

  it("recognizes NCC mucositis oral-irritant food source wording", () => {
    const sourcePhrase =
      "거칠거나 날 음식, 짠 음식, 산성 및 양념이 강한 음식물과 같이 자극되는 음식물은 피하고 견딜만한 양만 먹도록 한다.";
    const assessment = assessCancerFood(sourcePhrase);
    const terms = assessment.matches.map((match) => match.term);
    const matchesByTerm = Object.fromEntries(
      assessment.matches.map((match) => [match.term, match]),
    );
    const limitGuideText = cancerFoodGuideCategories
      .find((category) => category.id === "limit")
      ?.items.map((item) => `${item.label} ${item.detail} ${item.examples}`)
      .join(" ");

    expect(foodGuidanceSources.nccMucositisCare.label).toBe(
      "국가암정보센터 구강증상 - 입안의 염증(구내염)",
    );
    expect(foodGuidanceSources.nccMucositisCare.url).toBe(
      "https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
    );
    expect(assessment.level).toBe("watch");
    expect(terms).toEqual([sourcePhrase]);
    expect(matchesByTerm[sourcePhrase]).toMatchObject({
      level: "watch",
      reason: "국가암정보센터 구내염 시 거칠거나 날 음식·짠 음식·산성 및 강한 양념 음식 제한 후보",
      sourceId: "nccMucositisCare",
    });
    expect(terms).not.toContain("뜨거운 음식");
    expect(terms).not.toContain("매운 음식");
    expect(terms).not.toContain("입안을 자극하는 음식이나 음료는 피하도록 합니다.");
    expect(limitGuideText).toContain(sourcePhrase);
    expect(limitGuideText).toContain("부드러운 음식을 섭취하고 맵거나 거친 자극적인 음식을 피합니다.");
    expect(formatFoodMatchEvidence(matchesByTerm[sourcePhrase])).toContain(
      "국가암정보센터 구강증상 - 입안의 염증(구내염) - https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
    );
    expect(JSON.stringify(assessment.matches)).not.toMatch(/치료 음식|완치|암을 낫게|특효/);
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
