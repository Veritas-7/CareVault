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
    ).toContain("생채소");
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
    expect(limitGuideText).toContain("익힌 상태 350~500g");
    expect(limitGuideText).toContain("너무 뜨겁거나 매운 음식의 섭취는 피합니다");
    expect(limitGuideText).toContain("너무 뜨겁거나 매운 음식 섭취 피하기");
    expect(limitGuideText).toContain("햄·소시지 등 육가공품");
    expect(limitGuideText).toContain("가급적 먹지 않기");
    expect(limitGuideText).toContain("육가공품");
    expect(limitGuideText).toContain("가공육");
    expect(limitGuideText).toContain("탄 음식은 먹지 않기");
    expect(limitGuideText).toContain("직접 구워 탄 음식");
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
