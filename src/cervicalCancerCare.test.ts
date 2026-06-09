import { describe, expect, it } from "vitest";
import {
  buildCervicalCancerAlertSymptomDraft,
  buildCervicalCancerCareItemSymptomDraft,
  buildCervicalCancerCarePromptQuestion,
  buildCervicalCancerCarePromptQuestionDraft,
  buildCervicalCancerCareSourceLinkLabels,
  cervicalCancerCareAlertRecordFields,
  buildCervicalCancerScreeningQuestion,
  buildCervicalCancerScreeningSummary,
  cervicalCancerCareAlerts,
  cervicalCancerCareChecks,
  cervicalCancerCarePreventionGuides,
  cervicalCancerCarePriorityItems,
  cervicalCancerCarePrompts,
  cervicalCancerCareRecoveryGuides,
  cervicalCancerCareSources,
  formatCervicalCancerCareAlertDraftActionLabel,
  formatCervicalCancerCareItemDraftActionLabel,
  formatCervicalCancerCareListItemAriaLabel,
  formatCervicalCancerCarePromptDraftActionLabel,
  formatCervicalCancerCarePromptQuestionDraftReadyStatus,
  formatCervicalCancerCareSourceLinkLabel,
  formatCervicalCancerCareSourceEvidence,
  formatCervicalCancerCarePriorityEvidence,
  formatCervicalCancerCareAlertRecordFieldEvidence,
  formatCervicalCancerScreeningQuestionDraftReadyStatus,
  formatCervicalCancerScreeningSummaryEvidence,
  formatCervicalCancerCareAlertEvidence,
  formatCervicalCancerCareItemEvidence,
  getCervicalCancerCareSource,
} from "./cervicalCancerCare";

describe("cervicalCancerCare", () => {
  const careItems = [
    ...cervicalCancerCareAlerts,
    ...cervicalCancerCarePrompts,
    ...cervicalCancerCareChecks,
    ...cervicalCancerCareRecoveryGuides,
    ...cervicalCancerCarePreventionGuides,
  ];

  it("keeps official Korean cervical-cancer sources attached", () => {
    expect(Object.keys(cervicalCancerCareSources)).toEqual([
      "nccSymptoms",
      "nccOverview",
      "nccAnatomySite",
      "nccScreeningSchedule",
      "nccScreeningEligibility",
      "nccScreeningResultCost",
      "nccDefinitionTypes",
      "nccEarlyScreening",
      "nccRelatedStatistics",
      "nccEarlyDiagnosisPrevention",
      "nccRecovery",
      "nccRecurrenceFollowUp",
      "nccTreatmentStatus",
      "nccSexLife",
      "nccPregnancyBirth",
      "nccDiet",
      "nccTreatmentEating",
      "nccNauseaDiet",
      "nccVomitingDiet",
      "nccCancerLifeChildrenCommunication",
      "nccCancerLifePsychologicalStability",
      "nccComplementaryTherapyConsultation",
      "nccPainAssessment",
      "nccCancerFatigueCoping",
      "nccDyspneaCause",
      "nccCoughCause",
      "nccDiagnosisMethods",
      "nccStage",
      "nccTreatmentMethods",
      "nccChemotherapyUnderstanding",
      "nccChemotherapySideEffects",
      "nccDifferentialDiagnosis",
      "nccTreatmentSideEffects",
      "nccRadiationSideEffects",
      "nccLymphedema",
      "nccLymphedemaSymptoms",
      "nccLymphedemaCare",
      "kdcaHpv",
      "kdcaHpvNationalImmunization",
      "nccHpvInfection",
      "nccHpvVaccine",
      "nccCervicalPrevention",
      "nccCervicalRiskFactors",
      "nccCervicalPracticeGuideline",
    ]);
    expect(cervicalCancerCareSources.nccSymptoms.url).toContain("cancer.go.kr");
    expect(cervicalCancerCareSources.nccOverview.url).toContain("S1T211C213");
    expect(cervicalCancerCareSources.nccAnatomySite.url).toContain("menu_seq=4880");
    expect(cervicalCancerCareSources.nccLymphedemaCare.url).toContain("S1T429C431");
    expect(cervicalCancerCareSources.kdcaHpv.url).toContain("health.kdca.go.kr");
    expect(cervicalCancerCareSources.kdcaHpvNationalImmunization.url).toContain(
      "nip.kdca.go.kr",
    );
    expect(cervicalCancerCareSources.nccHpvInfection.url).toContain("S1T250C254");
    expect(cervicalCancerCareSources.nccChemotherapyUnderstanding.url).toContain("S1T289C290");
    expect(cervicalCancerCareSources.nccChemotherapySideEffects.url).toContain("S1T289C291");
    expect(cervicalCancerCareSources.nccHpvVaccine.url).toContain("menu_seq=4885");
    expect(cervicalCancerCareSources.nccCervicalPrevention.url).toContain("menu_seq=4885");
    expect(cervicalCancerCareSources.nccCervicalRiskFactors.url).toContain("menu_seq=4884");
    expect(cervicalCancerCareSources.nccCervicalPracticeGuideline.url).toContain("6fb06571");
    expect(cervicalCancerCareSources.nccDefinitionTypes.url).toContain("menu_seq=4881");
    expect(cervicalCancerCareSources.nccTreatmentStatus.url).toContain("menu_seq=4896");
    expect(cervicalCancerCareSources.nccDiagnosisMethods.url).toContain("menu_seq=4889");
    expect(cervicalCancerCareSources.nccStage.url).toContain("menu_seq=4890");
    expect(cervicalCancerCareSources.nccDifferentialDiagnosis.url).toContain("menu_seq=4891");
    expect(cervicalCancerCareSources.nccEarlyScreening.url).toContain("menu_seq=4886");
    expect(cervicalCancerCareSources.nccRelatedStatistics.url).toContain("menu_seq=4882");
    expect(cervicalCancerCareSources.nccCancerLifeChildrenCommunication.url).toContain(
      "S1T327C330",
    );
    expect(cervicalCancerCareSources.nccCancerLifePsychologicalStability.url).toContain(
      "S1T327C329",
    );
    expect(cervicalCancerCareSources.nccComplementaryTherapyConsultation.url).toContain(
      "S1T365C368",
    );
    expect(cervicalCancerCareSources.nccPainAssessment.url).toContain("S1T378C380");
    expect(cervicalCancerCareSources.nccCancerFatigueCoping.url).toContain("S1T420C421");
    expect(cervicalCancerCareSources.nccDyspneaCause.url).toContain("S1T411C414");
    expect(cervicalCancerCareSources.nccCoughCause.url).toContain("S1T410C412");
    expect(cervicalCancerCareSources.nccTreatmentEating.url).toContain("S1T471C472");
    expect(cervicalCancerCareSources.nccNauseaDiet.url).toContain("S1T479C481");
    expect(cervicalCancerCareSources.nccVomitingDiet.url).toContain("S1T479C482");
  });

  it("keeps every patient-visible cervical-care item linked to a known source", () => {
    expect(careItems.every((item) => cervicalCancerCareSources[item.sourceId])).toBe(true);
    expect(
      cervicalCancerCarePriorityItems
        .flatMap((item) => item.sourceIds)
        .every((sourceId) => cervicalCancerCareSources[sourceId]),
    ).toBe(true);
  });

  it("builds a source-backed priority checklist for copied and visible cervical-care notes", () => {
    expect(cervicalCancerCarePriorityItems).toHaveLength(3);
    expect(cervicalCancerCarePriorityItems.map((item) => item.label)).toEqual([
      "오늘 증상 기록",
      "다음 진료 질문",
      "치료 후 생활 상담",
    ]);

    const checklistText = cervicalCancerCarePriorityItems
      .map(formatCervicalCancerCarePriorityEvidence)
      .join("\n");

    expect(checklistText).toContain("출혈·분비물 변화");
    expect(checklistText).toContain("혈뇨/혈변 변화");
    expect(checklistText).toContain("국가암검진 2년 주기");
    expect(checklistText).toContain("산정특례기간 국가검진 유예 여부");
    expect(checklistText).toContain("의심 증상 진단검사 목록");
    expect(checklistText).toContain("골반 방사선 후 폐경·질협착");
    expect(checklistText).toContain("국립암센터 자궁경부암 조기 진단과 예방법");
    expect(checklistText).toContain("국가암정보센터 자궁경부암 일반적 증상");
    expect(checklistText).toContain("국가암정보센터 자궁경부암 치료방법");
    expect(checklistText).toContain("국가암정보센터 자궁경부암 식생활");
    expect(checklistText).toContain("근거:");
    expect(checklistText).toContain("https://www.cancer.go.kr/");
    expect(checklistText).not.toContain("치료하세요");
  });

  it("covers patient-visible warning signs without turning them into treatment orders", () => {
    const text = cervicalCancerCareAlerts.map((item) => `${item.title} ${item.detail}`).join(" ");

    expect(text).toContain("비정상 질출혈");
    expect(text).toContain("분비물");
    expect(text).toContain("골반통");
    expect(text).toContain("배뇨곤란");
    expect(cervicalCancerCareAlerts.every((item) => item.action.includes("진료팀"))).toBe(true);
  });

  it("summarizes warning-symptom record fields with official source evidence", () => {
    expect(cervicalCancerCareAlertRecordFields).toEqual([
      {
        label: "언제",
        detail: "새로 시작된 날짜, 반복 횟수, 치료·검사 후 며칠째인지",
        sourceIds: ["nccSymptoms", "nccTreatmentSideEffects"],
      },
      {
        label: "무엇이",
        detail: "출혈·분비물 색/냄새/양, 혈뇨·혈변, 배뇨·배변 변화",
        sourceIds: ["nccSymptoms", "nccTreatmentSideEffects"],
      },
      {
        label: "얼마나",
        detail: "통증 정도와 지속 시간, 복부팽만·구토·배변/가스 변화 동반 여부",
        sourceIds: ["nccSymptoms", "nccTreatmentSideEffects"],
      },
      {
        label: "같이",
        detail: "발열, 열감, 피부 붉어짐, 다리 부종·통증, 상처 동반 여부",
        sourceIds: ["nccLymphedemaCare", "nccTreatmentSideEffects"],
      },
    ]);
    expect(
      cervicalCancerCareAlertRecordFields
        .flatMap((item) => item.sourceIds)
        .every((sourceId) => cervicalCancerCareSources[sourceId]),
    ).toBe(true);

    const evidence = cervicalCancerCareAlertRecordFields
      .map(formatCervicalCancerCareAlertRecordFieldEvidence)
      .join("\n");
    expect(evidence).toContain("국가암정보센터 자궁경부암 일반적 증상");
    expect(evidence).toContain("국가암정보센터 자궁경부암 치료의 부작용");
    expect(evidence).toContain("국가암정보센터 림프부종 치료 전후관리");
    expect(evidence).toContain("근거:");
    expect(evidence).not.toContain("치료하세요");
  });

  it("turns cervical-cancer topics into clinician-question drafts", () => {
    expect(cervicalCancerCarePrompts).toHaveLength(36);
    expect(cervicalCancerCarePrompts.map((item) => item.topic)).toEqual([
      "자궁경부암 추적",
      "검진·진단검사 구분",
      "감별진단 확인",
      "병리조직 확인",
      "병기 설명 확인",
      "치료 후 회복",
      "치료 선택 기준",
      "항암화학요법 목적·일정 확인",
      "항암 부작용 개인차·효과 오해 확인",
      "재발·추적검사",
      "재발성 치료 선택 확인",
      "골반 방사선 후 폐경",
      "장·방광 후기 변화",
      "림프부종",
      "식생활·보조식품",
      "치료 중 균형식 확인",
      "메스꺼움·구토 식사 기록 준비",
      "구토 후 수분·식사 단계 기록 준비",
      "HPV·검진",
      "HPV 감염·파트너 상담",
      "임신·출산 계획",
      "성생활 재개 상담",
      "자녀·가족 설명 준비",
      "정서 안정·전문상담 준비",
      "보완대체요법 상담 준비",
      "암성 통증 평가 준비",
      "암관련 피로 대처 준비",
      "호흡곤란 변화 기록 준비",
      "기침·객혈 변화 기록 준비",
      "치료현황 통계 해석",
      "수술 합병증 확인",
      "방사선 급성 부작용 확인",
      "방사선 질 변화 상담",
      "전암성 병변 치료 확인",
      "침윤성 초기 치료 확인",
      "요약·진료 흐름",
    ]);
    expect(cervicalCancerCarePrompts.every((item) => item.question.endsWith("?"))).toBe(true);
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[1])).toContain(
      "출처: 국립암센터 자궁경부암 조기 진단과 예방법 - https://www.cancer.go.kr/download.do",
    );
    expect(cervicalCancerCarePrompts[1].question).toContain("검진");
    expect(cervicalCancerCarePrompts[1].question).toContain("진단검사");
    expect(cervicalCancerCarePrompts[1].question).toContain("질확대경");
    expect(cervicalCancerCarePrompts[1].question).toContain("조직검사");
    expect(cervicalCancerCarePrompts[1].question).toContain("골반 MRI");
    const differentialPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "감별진단 확인",
    )!;
    expect(differentialPrompt.sourceId).toBe("nccDifferentialDiagnosis");
    expect(differentialPrompt.question).toContain("자궁경부염");
    expect(differentialPrompt.question).toContain("질암");
    expect(differentialPrompt.question).toContain("자궁내막암");
    expect(differentialPrompt.question).toContain("자궁체부암");
    expect(differentialPrompt.question).toContain("골반 염증성질환");
    expect(differentialPrompt.question).toContain("제 증상과 검사 결과에서");
    expect(differentialPrompt.question).toContain("자궁경부세포검사");
    expect(differentialPrompt.question).toContain("질확대경검사 및 펀치 생검");
    expect(differentialPrompt.question).toContain("자궁경관 내 소파술");
    expect(differentialPrompt.question).toContain("CT·MRI");
    expect(buildCervicalCancerCarePromptQuestion(differentialPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 감별진단 - https://www.cancer.go.kr/",
    );
    const pathologyPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "병리조직 확인",
    )!;
    expect(pathologyPrompt.sourceId).toBe("nccDefinitionTypes");
    expect(pathologyPrompt.question).toContain("전암단계");
    expect(pathologyPrompt.question).toContain("상피내이형성증");
    expect(pathologyPrompt.question).toContain("자궁경부상피내암");
    expect(pathologyPrompt.question).toContain("기저막");
    expect(pathologyPrompt.question).toContain("침윤성 암");
    expect(pathologyPrompt.question).toContain("편평상피세포암");
    expect(pathologyPrompt.question).toContain("선암");
    expect(pathologyPrompt.question).toContain("혼합 암종");
    expect(pathologyPrompt.question).toContain("병리결과지");
    expect(pathologyPrompt.question).toContain("병기·치료 설명");
    expect(buildCervicalCancerCarePromptQuestion(pathologyPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 정의 및 종류 - https://www.cancer.go.kr/",
    );
    const stagePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "병기 설명 확인",
    )!;
    expect(stagePrompt.sourceId).toBe("nccStage");
    expect(stagePrompt.question).toContain("상피내암");
    expect(stagePrompt.question).toContain("암의 분류");
    expect(stagePrompt.question).toContain("1기");
    expect(stagePrompt.question).toContain("자궁경부에만 국한");
    expect(stagePrompt.question).toContain("2기");
    expect(stagePrompt.question).toContain("질벽 상부 2/3");
    expect(stagePrompt.question).toContain("자궁 옆 결합조직");
    expect(stagePrompt.question).toContain("3기");
    expect(stagePrompt.question).toContain("질의 하부 1/3");
    expect(stagePrompt.question).toContain("요관침윤");
    expect(stagePrompt.question).toContain("골반·대동맥주위 림프절");
    expect(stagePrompt.question).toContain("4기");
    expect(stagePrompt.question).toContain("방광이나 직장 점막");
    expect(stagePrompt.question).toContain("원격전이");
    expect(stagePrompt.question).toContain("진단서 병기");
    expect(stagePrompt.question).toContain("검사 근거");
    expect(buildCervicalCancerCarePromptQuestion(stagePrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 진행단계 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[5])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[6])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[6].question).toContain("병기");
    expect(cervicalCancerCarePrompts[6].question).toContain("출산 희망");
    const chemotherapyUnderstandingPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "항암화학요법 목적·일정 확인",
    )!;
    expect(chemotherapyUnderstandingPrompt.sourceId).toBe("nccChemotherapyUnderstanding");
    expect(chemotherapyUnderstandingPrompt.question).toContain("전신에 퍼져있는 암세포");
    expect(chemotherapyUnderstandingPrompt.question).toContain("암의 치료(완치)");
    expect(chemotherapyUnderstandingPrompt.question).toContain("암의 조절");
    expect(chemotherapyUnderstandingPrompt.question).toContain("완화");
    expect(chemotherapyUnderstandingPrompt.question).toContain("수술이나 방사선치료");
    expect(chemotherapyUnderstandingPrompt.question).toContain("보조화학요법");
    expect(chemotherapyUnderstandingPrompt.question).toContain("선행화학요법");
    expect(chemotherapyUnderstandingPrompt.question).toContain("동시화학요법");
    expect(chemotherapyUnderstandingPrompt.question).toContain("세포독성");
    expect(chemotherapyUnderstandingPrompt.question).toContain("표적항암제");
    expect(chemotherapyUnderstandingPrompt.question).toContain("면역항암제");
    expect(chemotherapyUnderstandingPrompt.question).toContain("진찰 및 혈액 검사");
    expect(buildCervicalCancerCarePromptQuestion(chemotherapyUnderstandingPrompt)).toContain(
      "출처: 국가암정보센터 항암화학요법의 이해 - https://www.cancer.go.kr/lay1/S1T289C290/contents.do",
    );
    const chemotherapySideEffectsPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "항암 부작용 개인차·효과 오해 확인",
    )!;
    expect(chemotherapySideEffectsPrompt.sourceId).toBe("nccChemotherapySideEffects");
    expect(chemotherapySideEffectsPrompt.question).toContain("부작용 유무와 치료 효과");
    expect(chemotherapySideEffectsPrompt.question).toContain("전혀 별개의 문제");
    expect(chemotherapySideEffectsPrompt.question).toContain("같은 항암제");
    expect(chemotherapySideEffectsPrompt.question).toContain("같은 용량");
    expect(chemotherapySideEffectsPrompt.question).toContain("환자마다");
    expect(chemotherapySideEffectsPrompt.question).toContain("몇 개월 또는 몇 년");
    expect(chemotherapySideEffectsPrompt.question).toContain("영구 지속");
    expect(chemotherapySideEffectsPrompt.question).toContain("폐·신장·심장·생식기관");
    expect(chemotherapySideEffectsPrompt.question).toContain("오심·구토");
    expect(chemotherapySideEffectsPrompt.question).toContain("구강 궤양");
    expect(chemotherapySideEffectsPrompt.question).toContain("설사·변비");
    expect(chemotherapySideEffectsPrompt.question).toContain("골수기능 저하");
    expect(chemotherapySideEffectsPrompt.question).toContain("탈모");
    expect(chemotherapySideEffectsPrompt.question).toContain("피부·손톱 변화");
    expect(chemotherapySideEffectsPrompt.question).toContain("말초신경병증");
    expect(chemotherapySideEffectsPrompt.question).toContain("투여 용량");
    expect(chemotherapySideEffectsPrompt.question).toContain("약물 종류 변경");
    expect(chemotherapySideEffectsPrompt.question).toContain("중단 여부");
    expect(chemotherapySideEffectsPrompt.question).toContain("임의 판단하지 않고");
    expect(buildCervicalCancerCarePromptQuestion(chemotherapySideEffectsPrompt)).toContain(
      "출처: 국가암정보센터 항암화학요법의 부작용 - https://www.cancer.go.kr/lay1/S1T289C291/contents.do",
    );
    const recurrencePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "재발·추적검사",
    )!;
    expect(recurrencePrompt.sourceId).toBe("nccRecurrenceFollowUp");
    expect(recurrencePrompt.question).toContain("첫 2년");
    expect(recurrencePrompt.question).toContain("3개월마다");
    expect(recurrencePrompt.question).toContain("이후 5년까지");
    expect(recurrencePrompt.question).toContain("체중감소");
    expect(recurrencePrompt.question).toContain("하지 부종");
    expect(recurrencePrompt.question).toContain("질출혈");
    expect(recurrencePrompt.question).toContain("기침·객혈·흉통");
    expect(recurrencePrompt.question).toContain("문진");
    expect(recurrencePrompt.question).toContain("골반내진");
    expect(recurrencePrompt.question).toContain("세포검사");
    expect(recurrencePrompt.question).toContain("CT·MRI·PET");
    expect(buildCervicalCancerCarePromptQuestion(recurrencePrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 재발 및 전이 - https://www.cancer.go.kr/",
    );
    const recurrentTreatmentPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "재발성 치료 선택 확인",
    )!;
    expect(recurrentTreatmentPrompt.sourceId).toBe("nccTreatmentMethods");
    expect(recurrentTreatmentPrompt.question).toContain("골반 내 국소 재발");
    expect(recurrentTreatmentPrompt.question).toContain("원격 재발");
    expect(recurrentTreatmentPrompt.question).toContain("재발 부위");
    expect(recurrentTreatmentPrompt.question).toContain("환자의 상태");
    expect(recurrentTreatmentPrompt.question).toContain("방사선요법");
    expect(recurrentTreatmentPrompt.question).toContain("동시항암화학방사선치료");
    expect(recurrentTreatmentPrompt.question).toContain("골반장기적출술");
    expect(recurrentTreatmentPrompt.question).toContain("요로전환술");
    expect(recurrentTreatmentPrompt.question).toContain("장전환술");
    expect(recurrentTreatmentPrompt.question).toContain("단독 병소");
    expect(recurrentTreatmentPrompt.question).toContain("외과적 절제술");
    expect(recurrentTreatmentPrompt.question).toContain("다발성 전이");
    expect(recurrentTreatmentPrompt.question).toContain("항암화학요법");
    expect(buildCervicalCancerCarePromptQuestion(recurrentTreatmentPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[11].question).toContain("난소부전");
    expect(cervicalCancerCarePrompts[11].question).toContain("폐경 증상");
    expect(cervicalCancerCarePrompts[11].question).toContain("질협착");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[11])).toContain(
      "출처: 국가암정보센터 방사선치료의 부작용 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[12])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[12].question).toContain("6개월 이상");
    expect(cervicalCancerCarePrompts[12].question).toContain("장폐색");
    expect(cervicalCancerCarePrompts[12].question).toContain("혈변");
    expect(cervicalCancerCarePrompts[12].question).toContain("혈뇨");
    expect(cervicalCancerCarePrompts[12].question).toContain("배변/가스 변화");
    expect(cervicalCancerCarePrompts[13].question).toContain("피부 붉어짐");
    expect(cervicalCancerCarePrompts[13].question).toContain("의료진에게 바로 연락");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[13])).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[14])).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[14].question).toContain("민간요법·건강보조식품");
    const treatmentEatingPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "치료 중 균형식 확인",
    )!;
    expect(treatmentEatingPrompt.sourceId).toBe("nccTreatmentEating");
    expect(treatmentEatingPrompt.question).toContain("영양 상태");
    expect(treatmentEatingPrompt.question).toContain("치료 효과");
    expect(treatmentEatingPrompt.question).toContain("삶의 질");
    expect(treatmentEatingPrompt.question).toContain("부작용");
    expect(treatmentEatingPrompt.question).toContain("감염의 위험");
    expect(treatmentEatingPrompt.question).toContain("손상된 세포");
    expect(treatmentEatingPrompt.question).toContain("암을 낫게 해주는 특별한 식품이나 영양소는 없");
    expect(treatmentEatingPrompt.question).toContain("충분한 열량과 단백질");
    expect(treatmentEatingPrompt.question).toContain("비타민 및 무기질");
    expect(treatmentEatingPrompt.question).toContain("여러 가지 음식을 골고루");
    expect(buildCervicalCancerCarePromptQuestion(treatmentEatingPrompt)).toContain(
      "출처: 국가암정보센터 치료 중 일반적인 식생활 - https://www.cancer.go.kr/lay1/S1T471C472/contents.do",
    );
    const nauseaDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "메스꺼움·구토 식사 기록 준비",
    )!;
    expect(nauseaDietPrompt.sourceId).toBe("nccNauseaDiet");
    expect(nauseaDietPrompt.question).toContain("수술, 화학요법, 방사선요법");
    expect(nauseaDietPrompt.question).toContain("치료 받은 직후");
    expect(nauseaDietPrompt.question).toContain("치료 2~3일 후");
    expect(nauseaDietPrompt.question).toContain("영양소를 충족");
    expect(nauseaDietPrompt.question).toContain("음식 냄새가 나지 않고 환기가 잘 되는");
    expect(nauseaDietPrompt.question).toContain("조금씩 자주 천천히");
    expect(nauseaDietPrompt.question).toContain("식후 1시간");
    expect(nauseaDietPrompt.question).toContain("항구토제");
    expect(nauseaDietPrompt.question).toContain("의사선생님과 상의");
    expect(nauseaDietPrompt.question).toContain("기름진 음식");
    expect(nauseaDietPrompt.question).toContain("향이 강하거나 뜨거운 음식");
    expect(nauseaDietPrompt.question).toContain("언제, 무엇 때문에");
    expect(buildCervicalCancerCarePromptQuestion(nauseaDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    const vomitingDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "구토 후 수분·식사 단계 기록 준비",
    )!;
    expect(vomitingDietPrompt.sourceId).toBe("nccVomitingDiet");
    expect(vomitingDietPrompt.question).toContain("구토증상이 있는 경우");
    expect(vomitingDietPrompt.question).toContain("먹거나 마시지");
    expect(vomitingDietPrompt.question).toContain("구토증상이 조절");
    expect(vomitingDietPrompt.question).toContain("물이나 육수");
    expect(vomitingDietPrompt.question).toContain("맑은 유동식");
    expect(vomitingDietPrompt.question).toContain("차츰 양을 증가");
    expect(vomitingDietPrompt.question).toContain("미음");
    expect(vomitingDietPrompt.question).toContain("부드러운 식사");
    expect(vomitingDietPrompt.question).toContain("조금씩 자주");
    expect(vomitingDietPrompt.question).toContain("우유가 들어있지 않은 제품");
    expect(vomitingDietPrompt.question).toContain("1~2일 이상");
    expect(vomitingDietPrompt.question).toContain("의사선생님과 상의");
    expect(buildCervicalCancerCarePromptQuestion(vomitingDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    const hpvScreeningPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "HPV·검진",
    )!;
    expect(hpvScreeningPrompt.question).toContain("접종 후에도 자궁경부암 선별검사");
    expect(buildCervicalCancerCarePromptQuestion(hpvScreeningPrompt)).toContain(
      "출처: 질병관리청 국가건강정보포털 자궁경부암 백신 - https://health.kdca.go.kr/",
    );
    const hpvInfectionPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "HPV 감염·파트너 상담",
    )!;
    expect(hpvInfectionPrompt.sourceId).toBe("nccHpvInfection");
    expect(hpvInfectionPrompt.question).toContain("주로 성접촉");
    expect(hpvInfectionPrompt.question).toContain("혈액·체액·장기이식");
    expect(hpvInfectionPrompt.question).toContain("증상 없이 자연소멸");
    expect(hpvInfectionPrompt.question).toContain("배우자/파트너");
    expect(hpvInfectionPrompt.question).toContain("검사·백신·콘돔·정기검진");
    expect(buildCervicalCancerCarePromptQuestion(hpvInfectionPrompt)).toContain(
      "출처: 국가암정보센터 사람유두종바이러스 감염 - https://www.cancer.go.kr/lay1/S1T250C254/contents.do",
    );
    const pregnancyBirthPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "임신·출산 계획",
    )!;
    expect(buildCervicalCancerCarePromptQuestion(pregnancyBirthPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 임신과 출산 - https://www.cancer.go.kr/",
    );
    const sexLifePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "성생활 재개 상담",
    )!;
    expect(sexLifePrompt.sourceId).toBe("nccSexLife");
    expect(sexLifePrompt.question).toContain("수술 후 6주");
    expect(sexLifePrompt.question).toContain("담당의 진찰");
    expect(sexLifePrompt.question).toContain("광범위자궁절제술");
    expect(sexLifePrompt.question).toContain("질의 길이");
    expect(sexLifePrompt.question).toContain("방사선 치료 중");
    expect(sexLifePrompt.question).toContain("방사선치료 후 약 2주-1개월");
    expect(sexLifePrompt.question).toContain("질 협착");
    expect(sexLifePrompt.question).toContain("건조함");
    expect(sexLifePrompt.question).toContain("국소 호르몬 연고");
    expect(sexLifePrompt.question).toContain("콘돔");
    expect(buildCervicalCancerCarePromptQuestion(sexLifePrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/",
    );
    const childFamilyPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "자녀·가족 설명 준비",
    )!;
    expect(childFamilyPrompt.sourceId).toBe("nccCancerLifeChildrenCommunication");
    expect(childFamilyPrompt.question).toContain("외모·일상 변화");
    expect(childFamilyPrompt.question).toContain("검사·치료 일정");
    expect(childFamilyPrompt.question).toContain("자녀가 질문하거나 감정을 표현");
    expect(childFamilyPrompt.question).toContain("암이 누구의 잘못도 아니며");
    expect(childFamilyPrompt.question).toContain("아이의 잘못");
    expect(childFamilyPrompt.question).toContain("자녀의 나이와 이해 정도");
    expect(childFamilyPrompt.question).toContain("진료팀과 보호자");
    expect(buildCervicalCancerCarePromptQuestion(childFamilyPrompt)).toContain(
      "출처: 국가암정보센터 암환자의 생활 - 자녀에게 알리는 방법 - https://www.cancer.go.kr/lay1/S1T327C330/contents.do",
    );
    const psychologicalStabilityPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "정서 안정·전문상담 준비",
    )!;
    expect(psychologicalStabilityPrompt.sourceId).toBe("nccCancerLifePsychologicalStability");
    expect(psychologicalStabilityPrompt.question).toContain("항암화학요법을 받을 때");
    expect(psychologicalStabilityPrompt.question).toContain("우울");
    expect(psychologicalStabilityPrompt.question).toContain("암 치료 자체에 대한 불안감");
    expect(psychologicalStabilityPrompt.question).toContain("일상의 삶이 바뀌는 것");
    expect(psychologicalStabilityPrompt.question).toContain("항암제 여러 부작용에 대한 두려움");
    expect(psychologicalStabilityPrompt.question).toContain("일지나 일기");
    expect(psychologicalStabilityPrompt.question).toContain("의사나 간호사에게 질문");
    expect(psychologicalStabilityPrompt.question).toContain("가족이나 친구");
    expect(psychologicalStabilityPrompt.question).toContain("다른 환자");
    expect(psychologicalStabilityPrompt.question).toContain("정신과 전문의 상담");
    expect(psychologicalStabilityPrompt.question).toContain("보호자의 공감적 경청");
    expect(psychologicalStabilityPrompt.question).toContain("진료팀과 보호자");
    expect(buildCervicalCancerCarePromptQuestion(psychologicalStabilityPrompt)).toContain(
      "출처: 국가암정보센터 암환자의 생활 - 심리적 안정을 위해 - https://www.cancer.go.kr/lay1/S1T327C329/contents.do",
    );
    const complementaryTherapyPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "보완대체요법 상담 준비",
    )!;
    expect(complementaryTherapyPrompt.sourceId).toBe("nccComplementaryTherapyConsultation");
    expect(complementaryTherapyPrompt.question).toContain("보완대체요법");
    expect(complementaryTherapyPrompt.question).toContain("주치의와 먼저 상의");
    expect(complementaryTherapyPrompt.question).toContain("안전과 안녕");
    expect(complementaryTherapyPrompt.question).toContain("장/단점");
    expect(complementaryTherapyPrompt.question).toContain("특정 크림이나 약물");
    expect(complementaryTherapyPrompt.question).toContain("침");
    expect(complementaryTherapyPrompt.question).toContain("약초나 영양제");
    expect(complementaryTherapyPrompt.question).toContain("부작용");
    expect(complementaryTherapyPrompt.question).toContain("요법가들의 직접적인 설명");
    expect(complementaryTherapyPrompt.question).toContain("현재 상태");
    expect(complementaryTherapyPrompt.question).toContain("앞으로 진행될 의학적 치료");
    expect(complementaryTherapyPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(complementaryTherapyPrompt)).toContain(
      "출처: 국가암정보센터 보완대체요법 상담 - https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
    );
    const painAssessmentPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "암성 통증 평가 준비",
    )!;
    expect(painAssessmentPrompt.sourceId).toBe("nccPainAssessment");
    expect(painAssessmentPrompt.question).toContain("제5의 활력 징후");
    expect(painAssessmentPrompt.question).toContain("정기적인 평가");
    expect(painAssessmentPrompt.question).toContain("악화 또는 완화");
    expect(painAssessmentPrompt.question).toContain("통증의 성격");
    expect(painAssessmentPrompt.question).toContain("위치와 방사통");
    expect(painAssessmentPrompt.question).toContain("0~10");
    expect(painAssessmentPrompt.question).toContain("시작 시간");
    expect(painAssessmentPrompt.question).toContain("지속 시간");
    expect(painAssessmentPrompt.question).toContain("돌발성 통증");
    expect(painAssessmentPrompt.question).toContain("골반통");
    expect(painAssessmentPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(painAssessmentPrompt)).toContain(
      "출처: 국가암정보센터 암성 통증평가 항목 - https://www.cancer.go.kr/lay1/S1T378C380/contents.do",
    );
    const fatigueCopingPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "암관련 피로 대처 준비",
    )!;
    expect(fatigueCopingPrompt.sourceId).toBe("nccCancerFatigueCoping");
    expect(fatigueCopingPrompt.question).toContain("피로의 정도");
    expect(fatigueCopingPrompt.question).toContain("정확하게 평가");
    expect(fatigueCopingPrompt.question).toContain("피로를 느낄 때의 상황");
    expect(fatigueCopingPrompt.question).toContain("우선순위");
    expect(fatigueCopingPrompt.question).toContain("중요하지 않은 활동");
    expect(fatigueCopingPrompt.question).toContain("주위 사람들의 도움");
    expect(fatigueCopingPrompt.question).toContain("주치의와 간호사");
    expect(fatigueCopingPrompt.question).toContain("현기증");
    expect(fatigueCopingPrompt.question).toContain("숨이 차고");
    expect(fatigueCopingPrompt.question).toContain("우울");
    expect(buildCervicalCancerCarePromptQuestion(fatigueCopingPrompt)).toContain(
      "출처: 국가암정보센터 암관련 피로대처 - https://www.cancer.go.kr/lay1/S1T420C421/contents.do",
    );
    const dyspneaCausePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "호흡곤란 변화 기록 준비",
    )!;
    expect(dyspneaCausePrompt.sourceId).toBe("nccDyspneaCause");
    expect(dyspneaCausePrompt.question).toContain("숨이 가쁜");
    expect(dyspneaCausePrompt.question).toContain("충분한 공기");
    expect(dyspneaCausePrompt.question).toContain("호흡은 노력을 요구");
    expect(dyspneaCausePrompt.question).toContain("가슴은 단단해지는");
    expect(dyspneaCausePrompt.question).toContain("쉬고 있거나 움직일 때");
    expect(dyspneaCausePrompt.question).toContain("가슴에 통증");
    expect(dyspneaCausePrompt.question).toContain("맥박수");
    expect(dyspneaCausePrompt.question).toContain("피부가 차고 축축");
    expect(dyspneaCausePrompt.question).toContain("콧구멍");
    expect(dyspneaCausePrompt.question).toContain("청색증");
    expect(dyspneaCausePrompt.question).toContain("갑자기 악화");
    expect(buildCervicalCancerCarePromptQuestion(dyspneaCausePrompt)).toContain(
      "출처: 국가암정보센터 호흡곤란 원인 - https://www.cancer.go.kr/lay1/S1T411C414/contents.do",
    );
    const coughCausePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "기침·객혈 변화 기록 준비",
    )!;
    expect(coughCausePrompt.sourceId).toBe("nccCoughCause");
    expect(coughCausePrompt.question).toContain("기도안에 이물질");
    expect(coughCausePrompt.question).toContain("분비물");
    expect(coughCausePrompt.question).toContain("호흡곤란");
    expect(coughCausePrompt.question).toContain("지속되거나 발작적");
    expect(coughCausePrompt.question).toContain("밤에 잠을 방해");
    expect(coughCausePrompt.question).toContain("피곤");
    expect(coughCausePrompt.question).toContain("통증");
    expect(coughCausePrompt.question).toContain("기절");
    expect(coughCausePrompt.question).toContain("구토");
    expect(coughCausePrompt.question).toContain("흉통");
    expect(coughCausePrompt.question).toContain("흉막 삼출");
    expect(coughCausePrompt.question).toContain("이물질 흡인");
    expect(coughCausePrompt.question).toContain("호흡기 감염");
    expect(coughCausePrompt.question).toContain("객혈");
    expect(buildCervicalCancerCarePromptQuestion(coughCausePrompt)).toContain(
      "출처: 국가암정보센터 기침 원인 - https://www.cancer.go.kr/lay1/S1T410C412/contents.do",
    );
    const treatmentStatusPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "치료현황 통계 해석",
    )!;
    expect(treatmentStatusPrompt.sourceId).toBe("nccTreatmentStatus");
    expect(treatmentStatusPrompt.question).toContain("2019-2023년");
    expect(treatmentStatusPrompt.question).toContain("5년 상대생존율 79.0%");
    expect(treatmentStatusPrompt.question).toContain("국한 94.5%");
    expect(treatmentStatusPrompt.question).toContain("국소 73.8%");
    expect(treatmentStatusPrompt.question).toContain("원격 29.1%");
    expect(treatmentStatusPrompt.question).toContain("모름 69.5%");
    expect(treatmentStatusPrompt.question).toContain("5년 이상 생존 확률");
    expect(treatmentStatusPrompt.question).toContain("개인 예후");
    expect(treatmentStatusPrompt.question).toContain("치료 반응");
    expect(treatmentStatusPrompt.question).toContain("재발·전이 여부");
    expect(buildCervicalCancerCarePromptQuestion(treatmentStatusPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 치료현황 - https://www.cancer.go.kr/",
    );
    const surgicalComplicationPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "수술 합병증 확인",
    )!;
    expect(surgicalComplicationPrompt.sourceId).toBe("nccTreatmentSideEffects");
    expect(surgicalComplicationPrompt.question).toContain("수술 직후 급성 합병증");
    expect(surgicalComplicationPrompt.question).toContain("출혈");
    expect(surgicalComplicationPrompt.question).toContain("장폐색");
    expect(surgicalComplicationPrompt.question).toContain("혈관손상");
    expect(surgicalComplicationPrompt.question).toContain("요관손상");
    expect(surgicalComplicationPrompt.question).toContain("직장 파열");
    expect(surgicalComplicationPrompt.question).toContain("폐렴");
    expect(surgicalComplicationPrompt.question).toContain("폐색전 증");
    expect(surgicalComplicationPrompt.question).toContain("방광이나 직장의 기능부전");
    expect(surgicalComplicationPrompt.question).toContain("배뇨나 배변 장애");
    expect(surgicalComplicationPrompt.question).toContain("림프 낭종");
    expect(surgicalComplicationPrompt.question).toContain("다리나 회음부 림프 부종");
    expect(surgicalComplicationPrompt.question).toContain("흡입도관 배액");
    expect(surgicalComplicationPrompt.question).toContain("제 수술명");
    expect(buildCervicalCancerCarePromptQuestion(surgicalComplicationPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    const acuteRadiationPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "방사선 급성 부작용 확인",
    )!;
    expect(acuteRadiationPrompt.sourceId).toBe("nccTreatmentSideEffects");
    expect(acuteRadiationPrompt.question).toContain("방사선치료로 인한 합병증");
    expect(acuteRadiationPrompt.question).toContain("장 점막");
    expect(acuteRadiationPrompt.question).toContain("방광점막");
    expect(acuteRadiationPrompt.question).toContain("급성 합병증");
    expect(acuteRadiationPrompt.question).toContain("장운동의 일시적인 증가");
    expect(acuteRadiationPrompt.question).toContain("점막의 손상");
    expect(acuteRadiationPrompt.question).toContain("설사");
    expect(acuteRadiationPrompt.question).toContain("방광염과 비슷한 증상");
    expect(acuteRadiationPrompt.question).toContain("방사선치료 회차");
    expect(acuteRadiationPrompt.question).toContain("소변 통증");
    expect(buildCervicalCancerCarePromptQuestion(acuteRadiationPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    const radiationVaginalPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "방사선 질 변화 상담",
    )!;
    expect(radiationVaginalPrompt.sourceId).toBe("nccTreatmentSideEffects");
    expect(radiationVaginalPrompt.question).toContain("방사선치료 후");
    expect(radiationVaginalPrompt.question).toContain("질의 위축 또는 경화");
    expect(radiationVaginalPrompt.question).toContain("호르몬치료");
    expect(radiationVaginalPrompt.question).toContain("국소치료");
    expect(radiationVaginalPrompt.question).toContain("예방과 치료");
    expect(radiationVaginalPrompt.question).toContain("방사선치료 범위");
    expect(radiationVaginalPrompt.question).toContain("질건조");
    expect(radiationVaginalPrompt.question).toContain("통증");
    expect(radiationVaginalPrompt.question).toContain("출혈");
    expect(radiationVaginalPrompt.question).toContain("성생활 변화");
    expect(radiationVaginalPrompt.question).toContain("호르몬 금기");
    expect(buildCervicalCancerCarePromptQuestion(radiationVaginalPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    const precancerTreatmentPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "전암성 병변 치료 확인",
    )!;
    expect(precancerTreatmentPrompt.sourceId).toBe("nccTreatmentMethods");
    expect(precancerTreatmentPrompt.question).toContain("전암성 병변");
    expect(precancerTreatmentPrompt.question).toContain("자궁경부이형성증");
    expect(precancerTreatmentPrompt.question).toContain("자궁경부상피내암");
    expect(precancerTreatmentPrompt.question).toContain("원추절제술");
    expect(precancerTreatmentPrompt.question).toContain("국소파괴요법");
    expect(precancerTreatmentPrompt.question).toContain("동결요법");
    expect(precancerTreatmentPrompt.question).toContain("고주파요법");
    expect(precancerTreatmentPrompt.question).toContain("레이저요법");
    expect(precancerTreatmentPrompt.question).toContain("단순자궁절제술");
    expect(precancerTreatmentPrompt.question).toContain("자궁 보존");
    expect(precancerTreatmentPrompt.question).toContain("조직경계");
    expect(precancerTreatmentPrompt.question).toContain("더 진행된 암");
    expect(buildCervicalCancerCarePromptQuestion(precancerTreatmentPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4893",
    );
    const earlyInvasiveTreatmentPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "침윤성 초기 치료 확인",
    )!;
    expect(earlyInvasiveTreatmentPrompt.sourceId).toBe("nccTreatmentMethods");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("침윤성 자궁경부암");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("환자의 연령과 건강상태");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("암의 파급정도");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("동반된 합병증");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("임신을 원한다면");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("광범위 자궁경부절제술");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("복강경을 이용한 림프절 절제술");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("자궁을 보존");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("1기와 2기 초기");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("광범위 자궁절제술");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("자궁주위 조직");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("질 상부");
    expect(earlyInvasiveTreatmentPrompt.question).toContain("골반림프절");
    expect(buildCervicalCancerCarePromptQuestion(earlyInvasiveTreatmentPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4893",
    );
    const overviewPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "요약·진료 흐름",
    )!;
    expect(overviewPrompt.sourceId).toBe("nccOverview");
    expect(overviewPrompt.question).toContain("발생부위와 조직형");
    expect(overviewPrompt.question).toContain("HPV·위험요인");
    expect(overviewPrompt.question).toContain("권고안 3년");
    expect(overviewPrompt.question).toContain("국가암검진사업 2년");
    expect(overviewPrompt.question).toContain("진단검사");
    expect(overviewPrompt.question).toContain("치료 선택 기준");
    expect(buildCervicalCancerCarePromptQuestion(overviewPrompt)).toContain(
      "출처: 국가암정보센터 자궁경부암 요약설명 - https://www.cancer.go.kr/lay1/program/S1T211C213/cancer/view.do?cancer_seq=4877",
    );
  });

  it("builds the late bowel-bladder prompt into editable question draft fields", () => {
    const prompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "장·방광 후기 변화",
    )!;
    const draft = buildCervicalCancerCarePromptQuestionDraft(prompt, "2026-06-15");

    expect(draft).toMatchObject({
      date: "2026-06-15",
      priority: "next-visit",
      status: "open",
      topic: "장·방광 후기 변화",
    });
    expect(draft.question).toContain("수술 후 배뇨·배변 장애");
    expect(draft.question).toContain("방사선치료 후 6개월 이상");
    expect(draft.question).toContain("장폐색");
    expect(draft.question).toContain("혈변");
    expect(draft.question).toContain("혈뇨");
    expect(draft.question).toContain("복부팽만·구토·배변/가스 변화");
    expect(draft.question).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(draft.question.match(/^출처:/gm)).toHaveLength(1);
    expect(formatCervicalCancerCarePromptQuestionDraftReadyStatus(prompt)).toBe(
      "자궁경부암 질문 초안 준비됨: 장·방광 후기 변화",
    );
  });

  it("avoids direct treatment instructions in cervical-cancer care copy", () => {
    const text = careItems.map((item) => Object.values(item).join(" ")).join(" ");
    const treatmentOrders = ["복용하세요", "중단하세요", "치료하세요", "운동하세요", "투약하세요", "처방하세요"];

    expect(treatmentOrders.every((term) => !text.includes(term))).toBe(true);
  });

  it("keeps self-check copy as observation guidance", () => {
    const anatomySiteGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "발생부위·구조 메모",
    );
    const pathologyTypeGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "병리조직 확인 메모",
    );
    const earlyScreeningGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "조기검진 준비·한계 메모",
    );
    const relatedStatisticsGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "발생통계 해석 메모",
    );
    const treatmentStatusGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "치료현황 통계 상담 메모",
    );
    const treatmentMethodBasisGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "치료방법 선택 근거 메모",
    );
    const diagnosisMethodPurposeGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "진단·병기검사 목적 메모",
    );
    const differentialDiagnosisGuide = cervicalCancerCareChecks.find(
      (item) => item.label === "감별진단 확인 메모",
    );

    expect(cervicalCancerCareChecks).toHaveLength(17);
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain("출혈·분비물 기록");
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain("추적검사 일정·결과");
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain("발생부위·구조 메모");
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain(
      "림프부종 감염·악화 신호",
    );
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain(
      "의심 증상 진단검사 준비",
    );
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain("병기 설명 메모");
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain(
      "배뇨·배변·출혈 변화 메모",
    );
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "림프부종 감염·악화 신호")
        ?.detail,
    ).toContain("피부 붉어짐");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "림프부종 감염·악화 신호")
        ?.detail,
    ).toContain("의료진에게 바로 연락");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "추적검사 일정·결과")?.detail,
    ).toContain("국가암검진 2년 주기");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "의심 증상 진단검사 준비")
        ?.detail,
    ).toContain("골반내진·자궁경부세포검사·HPV 검사");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "의심 증상 진단검사 준비")
        ?.detail,
    ).toContain("질확대경·조직검사·경질초음파·골반 MRI");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("전암 단계인 상피내암");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("암의 분류에 속하지");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("1기는 자궁경부에 국한");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("질 상부 2/3");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("자궁 옆 결합조직");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("질 하부 1/3");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("요관침윤");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("대동맥주위 림프절");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("방광이나 직장 점막");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("원격전이");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.sourceId,
    ).toBe("nccStage");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).not.toContain("자가 병기");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).not.toContain("진단됩니다");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("진료팀에 확인");
    expect(anatomySiteGuide).toMatchObject({
      label: "발생부위·구조 메모",
      sourceId: "nccAnatomySite",
    });
    expect(anatomySiteGuide?.detail).toContain("골반 안");
    expect(anatomySiteGuide?.detail).toContain("방광");
    expect(anatomySiteGuide?.detail).toContain("직장");
    expect(anatomySiteGuide?.detail).toContain("상하 약 7cm");
    expect(anatomySiteGuide?.detail).toContain("좌우 약 4cm");
    expect(anatomySiteGuide?.detail).toContain("자궁 상부 2/3");
    expect(anatomySiteGuide?.detail).toContain("자궁체부");
    expect(anatomySiteGuide?.detail).toContain("하부 1/3");
    expect(anatomySiteGuide?.detail).toContain("자궁경부");
    expect(anatomySiteGuide?.detail).toContain("질과 연결");
    expect(anatomySiteGuide?.detail).toContain("신축성 있는 조직");
    expect(anatomySiteGuide?.detail).toContain("요관");
    expect(anatomySiteGuide?.detail).toContain("림프관 및 림프절");
    expect(anatomySiteGuide?.detail).toContain("진료팀에 확인");
    expect(anatomySiteGuide?.detail).not.toContain("진단됩니다");
    expect(anatomySiteGuide?.detail).not.toContain("치료하세요");
    expect(pathologyTypeGuide).toMatchObject({
      label: "병리조직 확인 메모",
      sourceId: "nccDefinitionTypes",
    });
    expect(pathologyTypeGuide?.detail).toContain("자궁경부 상피내이형성증");
    expect(pathologyTypeGuide?.detail).toContain("자궁경부상피내암");
    expect(pathologyTypeGuide?.detail).toContain("기저막");
    expect(pathologyTypeGuide?.detail).toContain("침윤성 암");
    expect(pathologyTypeGuide?.detail).toContain("편평상피세포암");
    expect(pathologyTypeGuide?.detail).toContain("약 80%");
    expect(pathologyTypeGuide?.detail).toContain("선암");
    expect(pathologyTypeGuide?.detail).toContain("10-20%");
    expect(pathologyTypeGuide?.detail).toContain("혼합 암종");
    expect(pathologyTypeGuide?.detail).toContain("2-5%");
    expect(pathologyTypeGuide?.detail).toContain("진료팀에 확인");
    expect(pathologyTypeGuide?.detail).not.toContain("진단됩니다");
    expect(pathologyTypeGuide?.detail).not.toContain("치료하세요");
    expect(earlyScreeningGuide).toMatchObject({
      label: "조기검진 준비·한계 메모",
      sourceId: "nccEarlyScreening",
    });
    expect(earlyScreeningGuide?.detail).toContain("전구 질환인 자궁경부이형성증");
    expect(earlyScreeningGuide?.detail).toContain("상피내암 단계");
    expect(earlyScreeningGuide?.detail).toContain("자궁경부세포검사");
    expect(earlyScreeningGuide?.detail).toContain("위음성률이 50%");
    expect(earlyScreeningGuide?.detail).toContain("액상세포도말검사");
    expect(earlyScreeningGuide?.detail).toContain("생리 시작일로부터 10~20일");
    expect(earlyScreeningGuide?.detail).toContain("48시간 전");
    expect(earlyScreeningGuide?.detail).toContain("성관계, 탐폰 사용, 질 세척");
    expect(earlyScreeningGuide?.detail).toContain("질 내 약물 및 윤활제");
    expect(earlyScreeningGuide?.detail).toContain("증상이 있다면 출혈에 관계없이 검사");
    expect(earlyScreeningGuide?.detail).toContain("진료팀에 확인");
    expect(earlyScreeningGuide?.detail).not.toContain("정상입니다");
    expect(earlyScreeningGuide?.detail).not.toContain("검사를 건너뛰세요");
    expect(relatedStatisticsGuide).toMatchObject({
      label: "발생통계 해석 메모",
      sourceId: "nccRelatedStatistics",
    });
    expect(relatedStatisticsGuide?.detail).toContain("2026년에 발표된 중앙암등록본부");
    expect(relatedStatisticsGuide?.detail).toContain("2023년");
    expect(relatedStatisticsGuide?.detail).toContain("상피내암을 제외시킨 자궁경부암(C53)");
    expect(relatedStatisticsGuide?.detail).toContain("3,144건");
    expect(relatedStatisticsGuide?.detail).toContain("전체 암 발생의 1.1%");
    expect(relatedStatisticsGuide?.detail).toContain("여자의 암 중에서는 11위");
    expect(relatedStatisticsGuide?.detail).toContain("조발생률 6.1건");
    expect(relatedStatisticsGuide?.detail).toContain("40대가 22.8%");
    expect(relatedStatisticsGuide?.detail).toContain("50대가 22.6%");
    expect(relatedStatisticsGuide?.detail).toContain("60대가 19.1%");
    expect(relatedStatisticsGuide?.detail).toContain("암종이 96.6%");
    expect(relatedStatisticsGuide?.detail).toContain("편평세포암이 40.1%");
    expect(relatedStatisticsGuide?.detail).toContain("선암이 22.7%");
    expect(relatedStatisticsGuide?.detail).toContain("인구 통계");
    expect(relatedStatisticsGuide?.detail).toContain("개인 위험으로 단정하지 말고");
    expect(relatedStatisticsGuide?.detail).toContain("진료팀에 확인");
    expect(relatedStatisticsGuide?.detail).not.toContain("개인 위험입니다");
    expect(relatedStatisticsGuide?.detail).not.toContain("암에 걸립니다");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "배뇨·배변·출혈 변화 메모")?.detail,
    ).toContain("혈변·혈뇨");
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain(
      "장폐색·혈변·혈뇨 연락 메모",
    );
    expect(treatmentStatusGuide).toMatchObject({
      label: "치료현황 통계 상담 메모",
      sourceId: "nccTreatmentStatus",
    });
    expect(treatmentStatusGuide?.detail).toContain("2019-2023년");
    expect(treatmentStatusGuide?.detail).toContain("5년 상대생존율 79.0%");
    expect(treatmentStatusGuide?.detail).toContain("국한 94.5%");
    expect(treatmentStatusGuide?.detail).toContain("국소 73.8%");
    expect(treatmentStatusGuide?.detail).toContain("원격 29.1%");
    expect(treatmentStatusGuide?.detail).toContain("모름 69.5%");
    expect(treatmentStatusGuide?.detail).toContain("인구 통계");
    expect(treatmentStatusGuide?.detail).toContain("내 병기");
    expect(treatmentStatusGuide?.detail).toContain("치료 반응");
    expect(treatmentStatusGuide?.detail).toContain("진료팀에 확인");
    expect(treatmentStatusGuide?.detail).not.toContain("완치됩니다");
    expect(treatmentStatusGuide?.detail).not.toContain("치료하세요");
    expect(treatmentMethodBasisGuide).toMatchObject({
      label: "치료방법 선택 근거 메모",
      sourceId: "nccTreatmentMethods",
    });
    expect(treatmentMethodBasisGuide?.detail).toContain("수술");
    expect(treatmentMethodBasisGuide?.detail).toContain("방사선치료");
    expect(treatmentMethodBasisGuide?.detail).toContain("항암화학요법");
    expect(treatmentMethodBasisGuide?.detail).toContain("표적치료");
    expect(treatmentMethodBasisGuide?.detail).toContain("면역치료");
    expect(treatmentMethodBasisGuide?.detail).toContain("병기");
    expect(treatmentMethodBasisGuide?.detail).toContain("암 크기");
    expect(treatmentMethodBasisGuide?.detail).toContain("연령");
    expect(treatmentMethodBasisGuide?.detail).toContain("전신상태");
    expect(treatmentMethodBasisGuide?.detail).toContain("향후 출산 희망 여부");
    expect(treatmentMethodBasisGuide?.detail).toContain("전암성 병변");
    expect(treatmentMethodBasisGuide?.detail).toContain("초기 침윤성 자궁경부암");
    expect(treatmentMethodBasisGuide?.detail).toContain("많이 진행된 병변");
    expect(treatmentMethodBasisGuide?.detail).toContain("재발 부위");
    expect(treatmentMethodBasisGuide?.detail).toContain("림프절");
    expect(treatmentMethodBasisGuide?.detail).toContain("진료팀에 확인");
    expect(treatmentMethodBasisGuide?.detail).not.toContain("치료하세요");
    expect(diagnosisMethodPurposeGuide).toMatchObject({
      label: "진단·병기검사 목적 메모",
      sourceId: "nccDiagnosisMethods",
    });
    expect(diagnosisMethodPurposeGuide?.detail).toContain("암이 맞는지 확인");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("병기 설정 검사");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("의사의 진찰");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("자궁경부세포검사");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("질확대경검사");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("조직검사");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("원추절제술");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("방광경");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("에스결장경검사");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("경정맥 신우조영술");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("CT");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("MRI");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("PET");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("자궁경부 주위조직");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("림프절 전이");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("원격전이");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("재발");
    expect(diagnosisMethodPurposeGuide?.detail).toContain("진료팀에 확인");
    expect(diagnosisMethodPurposeGuide?.detail).not.toContain("진단됩니다");
    expect(diagnosisMethodPurposeGuide?.detail).not.toContain("검사를 받으세요");
    expect(differentialDiagnosisGuide).toMatchObject({
      label: "감별진단 확인 메모",
      sourceId: "nccDifferentialDiagnosis",
    });
    expect(differentialDiagnosisGuide?.detail).toContain("자궁경부염");
    expect(differentialDiagnosisGuide?.detail).toContain("질암");
    expect(differentialDiagnosisGuide?.detail).toContain("자궁내막암");
    expect(differentialDiagnosisGuide?.detail).toContain("자궁체부암");
    expect(differentialDiagnosisGuide?.detail).toContain("골반 염증성질환");
    expect(differentialDiagnosisGuide?.detail).toContain("자궁경부세포검사");
    expect(differentialDiagnosisGuide?.detail).toContain("질확대경검사");
    expect(differentialDiagnosisGuide?.detail).toContain("펀치 생검");
    expect(differentialDiagnosisGuide?.detail).toContain("자궁경관 내 소파술");
    expect(differentialDiagnosisGuide?.detail).toContain("CT");
    expect(differentialDiagnosisGuide?.detail).toContain("MRI");
    expect(differentialDiagnosisGuide?.detail).toContain("진료팀에 확인");
    expect(differentialDiagnosisGuide?.detail).not.toContain("진단됩니다");
    expect(differentialDiagnosisGuide?.detail).not.toContain("치료하세요");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "장폐색·혈변·혈뇨 연락 메모")
        ?.detail,
    ).toContain("복부팽만, 구토, 배변/가스 변화");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "장폐색·혈변·혈뇨 연락 메모")
        ?.detail,
    ).toContain("치료 종료 시점");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "장폐색·혈변·혈뇨 연락 메모")
        ?.sourceId,
    ).toBe("nccTreatmentSideEffects");
    expect(getCervicalCancerCareSource(cervicalCancerCareChecks[0].sourceId)?.label).toContain(
      "국가암정보센터",
    );
  });

  it("formats patient-visible source labels for warning cards", () => {
    expect(formatCervicalCancerCareSourceLinkLabel("nccSymptoms")).toBe(
      "출처: 국가암정보센터 자궁경부암 일반적 증상",
    );
    expect(formatCervicalCancerCareSourceLinkLabel("missing")).toBe(
      "출처: 공식 자궁경부암 케어 자료",
    );
    expect(formatCervicalCancerCareSourceEvidence("kdcaHpv")).toContain(
      "질병관리청 국가건강정보포털 자궁경부암 백신 - https://health.kdca.go.kr/",
    );
    expect(formatCervicalCancerCareSourceEvidence("kdcaHpvNationalImmunization")).toContain(
      "질병관리청 예방접종도우미 HPV 국가예방접종 사업 - https://nip.kdca.go.kr/",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccHpvInfection")).toContain(
      "국가암정보센터 사람유두종바이러스 감염 - https://www.cancer.go.kr/lay1/S1T250C254/contents.do",
    );
  });

  it("builds context-specific accessible labels for official source links", () => {
    expect(buildCervicalCancerCareSourceLinkLabels("nccSymptoms", "비정상 질출혈")).toEqual({
      ariaLabel: "비정상 질출혈 공식 출처 국가암정보센터 자궁경부암 일반적 증상 열기",
      title: "비정상 질출혈 공식 출처 국가암정보센터 자궁경부암 일반적 증상 열기",
      visibleLabel: "출처: 국가암정보센터 자궁경부암 일반적 증상",
    });
    expect(buildCervicalCancerCareSourceLinkLabels("nccScreeningSchedule", "검진 기준 빠른 확인")).toEqual({
      ariaLabel: "검진 기준 빠른 확인 공식 출처 국가암정보센터 국가암검진 검진주기 및 검진방법 열기",
      title: "검진 기준 빠른 확인 공식 출처 국가암정보센터 국가암검진 검진주기 및 검진방법 열기",
      visibleLabel: "출처: 국가암정보센터 국가암검진 검진주기 및 검진방법",
    });
    expect(buildCervicalCancerCareSourceLinkLabels("missing")).toEqual({
      ariaLabel: "자궁경부암 케어 공식 출처 공식 자궁경부암 케어 자료 열기",
      title: "자궁경부암 케어 공식 출처 공식 자궁경부암 케어 자료 열기",
      visibleLabel: "출처: 공식 자궁경부암 케어 자료",
    });
  });

  it("builds spaced accessible labels for cervical care side-list items", () => {
    expect(formatCervicalCancerCareListItemAriaLabel(cervicalCancerCareRecoveryGuides[0])).toBe(
      "원추절제술 후 생활 제한. 국가암정보센터는 원추 절제술 시술 후에는 수술 후 약 6~8주간 질 분비물이 많이 나올 수 있고, 간헐적 으로 질출혈이 생길 수 있습니다. 이 기간 동안 성관계, 수영이나 탕목욕, 무리한 운동을 피하고, 변비가 생기지 않도록 주의해야 합니다. 이 제한과 변비 예방 메모가 내 퇴원 안내서와 진료팀 지시에 어떻게 적용되는지 대조합니다. 출처: 국가암정보센터 자궁경부암 치료 후 생활.",
    );
    expect(
      formatCervicalCancerCareListItemAriaLabel({
        label: "직접 확인",
        detail: "문장 끝 정리。.",
        sourceId: "missing-source",
      }),
    ).toBe("직접 확인. 문장 끝 정리.");
  });

  it("builds item-specific draft action labels for cervical care buttons", () => {
    expect(formatCervicalCancerCareAlertDraftActionLabel(cervicalCancerCareAlerts[0])).toBe(
      "비정상 질출혈 자궁경부암 증상 기록 초안 만들기",
    );
    expect(formatCervicalCancerCarePromptDraftActionLabel(cervicalCancerCarePrompts[0])).toBe(
      "자궁경부암 추적 자궁경부암 질문 초안 만들기",
    );
    expect(formatCervicalCancerCareItemDraftActionLabel(cervicalCancerCareChecks[0])).toBe(
      "출혈·분비물 기록 자궁경부암 기록 메모 초안 만들기",
    );
  });

  it("builds symptom drafts from warning cards with source labels and URLs", () => {
    const draft = buildCervicalCancerAlertSymptomDraft(cervicalCancerCareAlerts[0]);

    expect(draft.symptom).toBe("비정상 질출혈");
    expect(draft.body).toContain("자궁경부암 경고 신호 기록 초안");
    expect(draft.body).toContain("- 공식 증상 근거: 폐경 후 새 출혈");
    expect(draft.body).toContain("폐경 후 새 출혈");
    expect(draft.body).toContain("- 기록 항목 가이드:");
    expect(draft.body).toContain(
      "  - 언제: 새로 시작된 날짜, 반복 횟수, 치료·검사 후 며칠째인지",
    );
    expect(draft.body).toContain(
      "  - 무엇이: 출혈·분비물 색/냄새/양, 혈뇨·혈변, 배뇨·배변 변화",
    );
    expect(draft.body).toContain(
      "  - 얼마나: 통증 정도와 지속 시간, 복부팽만·구토·배변/가스 변화 동반 여부",
    );
    expect(draft.body).toContain(
      "  - 같이: 발열, 열감, 피부 붉어짐, 다리 부종·통증, 상처 동반 여부",
    );
    expect(draft.body).toContain("- 내 기록:");
    expect(draft.body).toContain("- 발생 시점:");
    expect(draft.body).toContain("- 양·색·냄새/통증 정도:");
    expect(draft.body).toContain("- 유발 상황:");
    expect(draft.body).toContain("- 동반 증상:");
    expect(draft.body).toContain("- 진료팀에 확인할 기준: 발생 시기·양·유발 상황");
    expect(draft.body).toContain(
      "출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/",
    );
    expect(draft.body.match(/^출처:/gm)).toHaveLength(1);
    expect(draft.action).toContain("진료팀 확인");
    expect(Object.values(draft).join(" ")).not.toContain("치료하세요");
  });

  it("builds source-backed record drafts from cervical-care checklist items", () => {
    const draft = buildCervicalCancerCareItemSymptomDraft(cervicalCancerCareChecks[2]);

    expect(draft.symptom).toBe("림프부종 감염·악화 신호");
    expect(draft.action).toBe("림프부종 감염·악화 신호 내용을 다음 진료 때 진료팀에 확인");
    expect(draft.body).toContain("자궁경부암 기록 메모 초안");
    expect(draft.body).toContain("- 기록 항목: 림프부종 감염·악화 신호");
    expect(draft.body).toContain("- 공식 근거/기록 기준: 부은 쪽 다리의 피부 붉어짐");
    expect(draft.body).toContain("- 내 기록:");
    expect(draft.body).toContain("- 발생/확인 날짜:");
    expect(draft.body).toContain("- 변화 추세:");
    expect(draft.body).toContain("- 진료팀에 확인할 질문:");
    expect(draft.body).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/",
    );
    expect(Object.values(draft).join(" ")).not.toContain("치료하세요");
  });

  it("builds source-backed record drafts from recovery and prevention memo items", () => {
    const recoveryDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareRecoveryGuides.find((item) => item.label === "성생활 재개·통증 상담")!,
    );
    const preventionDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCarePreventionGuides.find((item) => item.label === "HPV 백신 가족 안내")!,
    );

    expect(recoveryDraft.symptom).toBe("성생활 재개·통증 상담");
    expect(recoveryDraft.body).toContain("자궁경부암 기록 메모 초안");
    expect(recoveryDraft.body).toContain("- 기록 항목: 성생활 재개·통증 상담");
    expect(recoveryDraft.body).toContain(
      "출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/",
    );
    expect(preventionDraft.symptom).toBe("HPV 백신 가족 안내");
    expect(preventionDraft.body).toContain("- 기록 항목: HPV 백신 가족 안내");
    expect(preventionDraft.body).toContain(
      "출처: 질병관리청 국가건강정보포털 자궁경부암 백신 - https://health.kdca.go.kr/",
    );
    expect(Object.values({ ...recoveryDraft, ...preventionDraft }).join(" ")).not.toContain(
      "치료하세요",
    );
  });

  it("formats item-level export evidence with source labels and URLs", () => {
    expect(formatCervicalCancerCareAlertEvidence(cervicalCancerCareAlerts[0])).toContain(
      "출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/",
    );
    expect(formatCervicalCancerCareItemEvidence(cervicalCancerCareRecoveryGuides[0])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
  });

  it("keeps recovery timing notes source-backed and clinician-confirmation oriented", () => {
    const sourceSentence =
      "원추 절제술 시술 후에는 수술 후 약 6~8주간 질 분비물이 많이 나올 수 있고, 간헐적 으로 질출혈이 생길 수 있습니다. 이 기간 동안 성관계, 수영이나 탕목욕, 무리한 운동을 피하고, 변비가 생기지 않도록 주의해야 합니다.";
    const radicalHysterectomySentence =
      "광범위 자궁절제술 후에는 수술 후 최소한 6주 동안에는 무거운 것을 들면 안되고, 부부관계를 피해야 하며, 갑작스러운 통증 이 올 수 있으므로 완전히 회복될 때까지는 운전을 하지 않는 것이 좋습니다.";
    const recurrenceSymptomsSentence =
      "재발 성 자궁경부암 의 증상은 매우 다양합니다. 체중감소, 하지 부종, 골반 혹은 허벅지 통증, 질출혈 혹은 질분비물의 증가, 진행 성 요관 폐색, 쇄골위 림프절 비대 등이 나타나며, 폐로 전이 하면 기침, 객혈, 때로는 흉통을 호소할 수 있습니다. 그러나 특징적인 증상이 없는 경우가 더 많습니다.";
    const cervicalDietBoundarySentence =
      "자궁경부암 환자가 특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다. 충분한 영양을 섭취하고 휴식을 취하는 것이 몸의 면역 기능 강화와 투병 생활에 도움이 될 수 있습니다.";
    const cervicalDietTreatmentCautionSentence =
      "방사선 치료나 항암화학요법 중에는 장기능이 약해질 가능성이 있으므로 되도록 자극적인 음식은 피합니다. 또한 항암화학요법을 받는 중에는 민간요법이나 건강보조식품은 삼갑니다.";
    const treatmentEatingSpecialFoodSentence =
      "암을 낫게 해주는 특별한 식품이나 영양소는 없으며, 균형 잡힌 식사로 좋은 영양 상태를 유지하는 것이 매우 중요합니다.";
    const treatmentEatingNutrientSentence =
      "그러기 위해서는 충분한 열량과 단백질, 비타민 및 무기질을 섭취해야 하며, 이는 여러 가지 음식을 골고루 먹음으로써 가능합니다.";
    const nauseaDietSideEffectSentence =
      "메스꺼움은 수술, 화학요법, 방사선요법 등의 일반적인 부작용 입니다.";
    const nauseaDietNutritionSentence =
      "원인이 무엇이든 간에 메스꺼움으로 인해 음식을 충분히 섭취할 수 없으면 우리 몸에 필요한 영양소를 충족시킬 수 없게 되므로 메스꺼움 증상을 잘 조절하는 것이 중요합니다.";
    const nauseaDietMealSettingSentence =
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.";
    const vomitingDietClearLiquidSentence =
      "구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.";
    const vomitingDietSoftMealSentence =
      "맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다.";
    const coughDefinitionSentence =
      "기침이란 기도안에 이물질이 있거나 분비물이 많을때 깨끗이 배출하기 위한 정상적인 반사작용이며 호흡곤란을 일으키거나 호흡곤란에 의해 유발되기도 합니다.";
    const pathologicCoughSentence =
      "병적인 기침은 환자가 불편을 느끼는 증상으로 지속되거나 발작적인 것을 말합니다.";
    const severeCoughBurdenSentence =
      "밤에 잠을 방해하거나, 피곤, 통증, 기절, 구토, 흉통, 복통, 두통을 일으키거나 가끔씩 늑골골절 등을 일으키는 괴로운 증상입니다.";
    const text = cervicalCancerCareRecoveryGuides
      .map((item) => `${item.label} ${item.detail}`)
      .join(" ");

    const coneRecoveryGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "원추절제술 후 생활 제한",
    );
    const radicalRecoveryGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "광범위 자궁절제술 후 회복",
    );
    const recurrenceSymptomGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "재발 의심 증상·기본 추적검사 메모",
    );
    const cervicalDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "식생활·보조식품 확인",
    );
    const treatmentEatingGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "치료 중 열량·단백질·영양소 메모",
    );
    const nauseaDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "메스꺼움·구토 식사환경 메모",
    );
    const vomitingDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "구토 후 유동식·부드러운 식사 메모",
    );
    const childFamilyCommunicationGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "자녀·가족 설명 메모",
    );
    const psychologicalStabilityGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "정서 안정·전문상담 메모",
    );
    const complementaryTherapyGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "보완대체요법·약초 공유 메모",
    );
    const painAssessmentGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암성 통증 평가 메모",
    );
    const fatigueCopingGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암관련 피로·수면·도움요청 메모",
    );
    const dyspneaCauseGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "호흡곤란·흉통 변화 메모",
    );
    const coughCauseGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "기침·가래·수면방해 메모",
    );

    expect(cervicalCancerCareRecoveryGuides).toHaveLength(20);
    expect(text).toContain("원추절제술");
    expect(text).toContain("6~8주");
    expect(coneRecoveryGuide?.detail).toContain(sourceSentence);
    expect(coneRecoveryGuide?.detail).toContain("변비가 생기지 않도록 주의");
    expect(formatCervicalCancerCareItemEvidence(coneRecoveryGuide!)).toContain(
      "국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4898",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(coneRecoveryGuide!).body).toContain(
      sourceSentence,
    );
    expect(text).toContain("광범위 자궁절제술");
    expect(text).toContain("최소한 6주");
    expect(radicalRecoveryGuide?.detail).toContain(radicalHysterectomySentence);
    expect(formatCervicalCancerCareItemEvidence(radicalRecoveryGuide!)).toContain(
      radicalHysterectomySentence,
    );
    expect(buildCervicalCancerCareItemSymptomDraft(radicalRecoveryGuide!).body).toContain(
      radicalHysterectomySentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(radicalRecoveryGuide!)).toContain(
      radicalHysterectomySentence,
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(radicalRecoveryGuide!)).join(" ")).not.toContain(
      "운전하세요",
    );
    expect(text).toContain("다리·발 운동");
    expect(text).toContain("림프부종 피부·감염 관리");
    expect(text).toContain("열감·통증");
    expect(text).toContain("의료진에게 바로 치료 기준");
    expect(text).toContain("재발·추적검사 주기 메모");
    expect(text).toContain("첫 2년 3개월마다");
    expect(text).toContain("이후 5년까지 6개월마다");
    expect(text).toContain("그 이후 매년");
    expect(recurrenceSymptomGuide).toMatchObject({
      label: "재발 의심 증상·기본 추적검사 메모",
      sourceId: "nccRecurrenceFollowUp",
    });
    expect(recurrenceSymptomGuide?.detail).toContain(recurrenceSymptomsSentence);
    expect(recurrenceSymptomGuide?.detail).toContain("체중감소");
    expect(recurrenceSymptomGuide?.detail).toContain("하지 부종");
    expect(recurrenceSymptomGuide?.detail).toContain("골반 혹은 허벅지 통증");
    expect(recurrenceSymptomGuide?.detail).toContain("질출혈 혹은 질분비물의 증가");
    expect(recurrenceSymptomGuide?.detail).toContain("진행 성 요관 폐색");
    expect(recurrenceSymptomGuide?.detail).toContain("쇄골위 림프절 비대");
    expect(recurrenceSymptomGuide?.detail).toContain("기침, 객혈, 때로는 흉통");
    expect(recurrenceSymptomGuide?.detail).toContain("특징적인 증상이 없는 경우");
    expect(formatCervicalCancerCareItemEvidence(recurrenceSymptomGuide!)).toContain(
      recurrenceSymptomsSentence,
    );
    expect(buildCervicalCancerCareItemSymptomDraft(recurrenceSymptomGuide!).body).toContain(
      recurrenceSymptomsSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(recurrenceSymptomGuide!)).toContain(
      recurrenceSymptomsSentence,
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(recurrenceSymptomGuide!)).join(" ")).not.toContain(
      "진단하세요",
    );
    expect(recurrenceSymptomGuide?.detail).toContain("문진");
    expect(recurrenceSymptomGuide?.detail).toContain("골반내진");
    expect(recurrenceSymptomGuide?.detail).toContain("신체검사");
    expect(recurrenceSymptomGuide?.detail).toContain("세포검사");
    expect(recurrenceSymptomGuide?.detail).toContain("가슴사진");
    expect(recurrenceSymptomGuide?.detail).toContain("종양 표지자");
    expect(recurrenceSymptomGuide?.detail).toContain("CT");
    expect(recurrenceSymptomGuide?.detail).toContain("MRI");
    expect(recurrenceSymptomGuide?.detail).toContain("PET");
    expect(recurrenceSymptomGuide?.detail).toContain("진료팀");
    expect(recurrenceSymptomGuide?.detail).not.toContain("검사하세요");
    expect(recurrenceSymptomGuide?.detail).not.toContain("치료하세요");
    expect(text).toContain("성생활 재개·통증 상담");
    expect(text).toContain("방사선 치료 중과 치료 후 약 2주~1개월");
    expect(text).toContain("질건조·질협착");
    expect(text).toContain("콘돔 사용 권고");
    expect(text).toContain("임신·출산 계획 상담");
    expect(text).toContain("환상투열요법");
    expect(text).toContain("광범위자궁경부절제수술");
    expect(text).toContain("유산 및 조산 위험");
    expect(text).toContain("식생활·보조식품 확인");
    expect(text).toContain("특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다");
    expect(text).toContain("민간요법·건강보조식품");
    expect(cervicalDietGuide).toMatchObject({
      label: "식생활·보조식품 확인",
      sourceId: "nccDiet",
    });
    expect(cervicalDietGuide?.detail).toContain(cervicalDietBoundarySentence);
    expect(cervicalDietGuide?.detail).toContain(cervicalDietTreatmentCautionSentence);
    expect(formatCervicalCancerCareItemEvidence(cervicalDietGuide!)).toContain(
      cervicalDietBoundarySentence,
    );
    expect(buildCervicalCancerCareItemSymptomDraft(cervicalDietGuide!).body).toContain(
      cervicalDietTreatmentCautionSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(cervicalDietGuide!)).toContain(
      cervicalDietBoundarySentence,
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(cervicalDietGuide!)).join(" ")).not.toMatch(
      /암을 낫게|치료 음식|특효|보조식품 권장/,
    );
    expect(treatmentEatingGuide).toMatchObject({
      label: "치료 중 열량·단백질·영양소 메모",
      sourceId: "nccTreatmentEating",
    });
    expect(treatmentEatingGuide?.detail).toContain("영양 상태는 질병의 이환율과 사망률");
    expect(treatmentEatingGuide?.detail).toContain("치료 효과");
    expect(treatmentEatingGuide?.detail).toContain("삶의 질");
    expect(treatmentEatingGuide?.detail).toContain("부작용을 잘 극복");
    expect(treatmentEatingGuide?.detail).toContain("감염의 위험");
    expect(treatmentEatingGuide?.detail).toContain("손상된 세포");
    expect(treatmentEatingGuide?.detail).toContain(treatmentEatingSpecialFoodSentence);
    expect(treatmentEatingGuide?.detail).toContain(treatmentEatingNutrientSentence);
    expect(formatCervicalCancerCareItemEvidence(treatmentEatingGuide!)).toContain(
      "국가암정보센터 치료 중 일반적인 식생활 - https://www.cancer.go.kr/lay1/S1T471C472/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(treatmentEatingGuide!).body).toContain(
      treatmentEatingNutrientSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(treatmentEatingGuide!)).toContain(
      "국가암정보센터 치료 중 일반적인 식생활",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(treatmentEatingGuide!)).join(" ")).not.toMatch(
      /암을 낫게 해주는 특별한 식품이 있습니다|치료 음식|특효|보조식품 권장|치료하세요/,
    );
    expect(nauseaDietGuide).toMatchObject({
      label: "메스꺼움·구토 식사환경 메모",
      sourceId: "nccNauseaDiet",
    });
    expect(nauseaDietGuide?.detail).toContain(nauseaDietSideEffectSentence);
    expect(nauseaDietGuide?.detail).toContain("치료 받은 직후");
    expect(nauseaDietGuide?.detail).toContain("치료 2~3일 후");
    expect(nauseaDietGuide?.detail).toContain(nauseaDietNutritionSentence);
    expect(nauseaDietGuide?.detail).toContain(nauseaDietMealSettingSentence);
    expect(nauseaDietGuide?.detail).toContain("의사선생님과 상의");
    expect(nauseaDietGuide?.detail).toContain("억지로 먹거나 마시지 않도록");
    expect(nauseaDietGuide?.detail).toContain("토스트");
    expect(nauseaDietGuide?.detail).toContain("크래커");
    expect(nauseaDietGuide?.detail).toContain("요거트");
    expect(nauseaDietGuide?.detail).toContain("샤베트");
    expect(nauseaDietGuide?.detail).toContain("복숭아통조림");
    expect(nauseaDietGuide?.detail).toContain("맑은 유동식");
    expect(nauseaDietGuide?.detail).toContain("얼음조각");
    expect(nauseaDietGuide?.detail).toContain("기름진 음식");
    expect(nauseaDietGuide?.detail).toContain("매우 단 음식");
    expect(nauseaDietGuide?.detail).toContain("향이 강하거나 뜨거운 음식");
    expect(nauseaDietGuide?.detail).toContain("언제, 무엇 때문에");
    expect(formatCervicalCancerCareItemEvidence(nauseaDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(nauseaDietGuide!).body).toContain(
      nauseaDietMealSettingSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(nauseaDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 메스꺼움",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(nauseaDietGuide!)).join(" ")).not.toMatch(
      /항구토제를 복용하세요|진토제를 복용하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(vomitingDietGuide).toMatchObject({
      label: "구토 후 유동식·부드러운 식사 메모",
      sourceId: "nccVomitingDiet",
    });
    expect(vomitingDietGuide?.detail).toContain("구토증상이 있는 경우 먹거나 마시지 않도록");
    expect(vomitingDietGuide?.detail).toContain(vomitingDietClearLiquidSentence);
    expect(vomitingDietGuide?.detail).toContain(vomitingDietSoftMealSentence);
    expect(vomitingDietGuide?.detail).toContain("우유를 소화시키기 힘들면");
    expect(vomitingDietGuide?.detail).toContain("우유가 들어있지 않은 제품");
    expect(vomitingDietGuide?.detail).toContain("1~2일 이상 심하게 계속");
    expect(vomitingDietGuide?.detail).toContain("의사선생님과 상의");
    expect(formatCervicalCancerCareItemEvidence(vomitingDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(vomitingDietGuide!).body).toContain(
      vomitingDietSoftMealSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(vomitingDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 구토",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(vomitingDietGuide!)).join(" ")).not.toMatch(
      /구토약을 복용하세요|진토제를 복용하세요|억지로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(coughCauseGuide).toMatchObject({
      label: "기침·가래·수면방해 메모",
      sourceId: "nccCoughCause",
    });
    expect(coughCauseGuide?.detail).toContain(coughDefinitionSentence);
    expect(coughCauseGuide?.detail).toContain(pathologicCoughSentence);
    expect(coughCauseGuide?.detail).toContain(severeCoughBurdenSentence);
    expect(coughCauseGuide?.detail).toContain("말기 암 환자의 기침은 흉막 삼출");
    expect(coughCauseGuide?.detail).toContain("이물질 흡인");
    expect(coughCauseGuide?.detail).toContain("호흡기 감염");
    expect(coughCauseGuide?.detail).toContain("좌심실 부전");
    expect(coughCauseGuide?.detail).toContain("천식");
    expect(coughCauseGuide?.detail).toContain("알러지");
    expect(coughCauseGuide?.detail).toContain("폐암");
    expect(formatCervicalCancerCareItemEvidence(coughCauseGuide!)).toContain(
      "국가암정보센터 기침 원인 - https://www.cancer.go.kr/lay1/S1T410C412/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(coughCauseGuide!).body).toContain(
      severeCoughBurdenSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(coughCauseGuide!)).toContain(
      "국가암정보센터 기침 원인",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(coughCauseGuide!)).join(" ")).not.toMatch(
      /기침약을 복용하세요|흡입기를 사용하세요|항생제를 받으세요|진단하세요|치료하세요|처방하세요/,
    );
    expect(childFamilyCommunicationGuide).toMatchObject({
      label: "자녀·가족 설명 메모",
      sourceId: "nccCancerLifeChildrenCommunication",
    });
    expect(childFamilyCommunicationGuide?.detail).toContain("혼란을 겪지 않도록");
    expect(childFamilyCommunicationGuide?.detail).toContain("나이에 걸맞은 수준");
    expect(childFamilyCommunicationGuide?.detail).toContain("가족 생활의 변화");
    expect(childFamilyCommunicationGuide?.detail).toContain("탈모");
    expect(childFamilyCommunicationGuide?.detail).toContain("극심한 피로감");
    expect(childFamilyCommunicationGuide?.detail).toContain("질문을 할 수 있게");
    expect(childFamilyCommunicationGuide?.detail).toContain("자신의 정서를 표현");
    expect(childFamilyCommunicationGuide?.detail).toContain("네 잘못 때문이 아니고");
    expect(childFamilyCommunicationGuide?.detail).toContain("진료팀과 보호자");
    expect(formatCervicalCancerCareItemEvidence(childFamilyCommunicationGuide!)).toContain(
      "국가암정보센터 암환자의 생활 - 자녀에게 알리는 방법 - https://www.cancer.go.kr/lay1/S1T327C330/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(childFamilyCommunicationGuide!).body).toContain(
      "자녀·가족 설명 메모",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(childFamilyCommunicationGuide!).body).toContain(
      "네 잘못 때문이 아니고",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(childFamilyCommunicationGuide!)).toContain(
      "국가암정보센터 암환자의 생활 - 자녀에게 알리는 방법",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(childFamilyCommunicationGuide!)).join(" ")).not.toMatch(
      /진단하세요|치료하세요|완치/,
    );
    expect(psychologicalStabilityGuide).toMatchObject({
      label: "정서 안정·전문상담 메모",
      sourceId: "nccCancerLifePsychologicalStability",
    });
    expect(psychologicalStabilityGuide?.detail).toContain("항암화학요법을 받을 때");
    expect(psychologicalStabilityGuide?.detail).toContain("우울해지기 쉽습니다");
    expect(psychologicalStabilityGuide?.detail).toContain("암 치료 자체에 대한 불안감");
    expect(psychologicalStabilityGuide?.detail).toContain("일상의 삶이 바뀌는 것");
    expect(psychologicalStabilityGuide?.detail).toContain("항암제 여러 부작용에 대한 두려움");
    expect(psychologicalStabilityGuide?.detail).toContain("일지나 일기");
    expect(psychologicalStabilityGuide?.detail).toContain("의사나 간호사에게 질문");
    expect(psychologicalStabilityGuide?.detail).toContain("가족이나 친구");
    expect(psychologicalStabilityGuide?.detail).toContain("다른 환자");
    expect(psychologicalStabilityGuide?.detail).toContain("정신과 전문의");
    expect(psychologicalStabilityGuide?.detail).toContain("공감의 자세");
    expect(psychologicalStabilityGuide?.detail).toContain("진료팀과 보호자에게 확인");
    expect(formatCervicalCancerCareItemEvidence(psychologicalStabilityGuide!)).toContain(
      "국가암정보센터 암환자의 생활 - 심리적 안정을 위해 - https://www.cancer.go.kr/lay1/S1T327C329/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(psychologicalStabilityGuide!).body).toContain(
      "정서 안정·전문상담 메모",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(psychologicalStabilityGuide!).body).toContain(
      "정신과 전문의 상담 기준",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(psychologicalStabilityGuide!)).toContain(
      "국가암정보센터 암환자의 생활 - 심리적 안정을 위해",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(psychologicalStabilityGuide!)).join(" ")).not.toMatch(
      /진단하세요|치료하세요|상담받으세요|운동하세요/,
    );
    expect(complementaryTherapyGuide).toMatchObject({
      label: "보완대체요법·약초 공유 메모",
      sourceId: "nccComplementaryTherapyConsultation",
    });
    expect(complementaryTherapyGuide?.detail).toContain("보완대체요법");
    expect(complementaryTherapyGuide?.detail).toContain("주치의와 먼저 상의");
    expect(complementaryTherapyGuide?.detail).toContain("안전과 안녕");
    expect(complementaryTherapyGuide?.detail).toContain("장/단점");
    expect(complementaryTherapyGuide?.detail).toContain("특정 크림이나 약물");
    expect(complementaryTherapyGuide?.detail).toContain("침");
    expect(complementaryTherapyGuide?.detail).toContain("약초나 영양제");
    expect(complementaryTherapyGuide?.detail).toContain("부작용");
    expect(complementaryTherapyGuide?.detail).toContain("요법가들의 직접적인 설명");
    expect(complementaryTherapyGuide?.detail).toContain("현재 상태");
    expect(complementaryTherapyGuide?.detail).toContain("앞으로 진행될 의학적 치료");
    expect(complementaryTherapyGuide?.detail).toContain("진료팀과 보호자에게 확인");
    expect(formatCervicalCancerCareItemEvidence(complementaryTherapyGuide!)).toContain(
      "국가암정보센터 보완대체요법 상담 - https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(complementaryTherapyGuide!).body).toContain(
      "보완대체요법·약초 공유 메모",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(complementaryTherapyGuide!).body).toContain(
      "약초나 영양제",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(complementaryTherapyGuide!)).toContain(
      "국가암정보센터 보완대체요법 상담",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(complementaryTherapyGuide!)).join(" ")).not.toMatch(
      /진단하세요|치료하세요|복용하세요|중단하세요|시술하세요/,
    );
    expect(painAssessmentGuide).toMatchObject({
      label: "암성 통증 평가 메모",
      sourceId: "nccPainAssessment",
    });
    expect(painAssessmentGuide?.detail).toContain("제5의 활력 징후");
    expect(painAssessmentGuide?.detail).toContain("정기적인 평가");
    expect(painAssessmentGuide?.detail).toContain("응급 상황에 준하는");
    expect(painAssessmentGuide?.detail).toContain("악화 또는 완화 요인");
    expect(painAssessmentGuide?.detail).toContain("통증의 성격");
    expect(painAssessmentGuide?.detail).toContain("위치와 방사통");
    expect(painAssessmentGuide?.detail).toContain("숫자통증등급 0~10");
    expect(painAssessmentGuide?.detail).toContain("시작 시간");
    expect(painAssessmentGuide?.detail).toContain("지속 시간");
    expect(painAssessmentGuide?.detail).toContain("돌발성 통증");
    expect(painAssessmentGuide?.detail).toContain("배뇨·기침·움직임·배변");
    expect(painAssessmentGuide?.detail).toContain("진통제 사용 여부와 효과");
    expect(formatCervicalCancerCareItemEvidence(painAssessmentGuide!)).toContain(
      "국가암정보센터 암성 통증평가 항목 - https://www.cancer.go.kr/lay1/S1T378C380/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(painAssessmentGuide!).body).toContain(
      "암성 통증 평가 메모",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(painAssessmentGuide!).body).toContain(
      "숫자통증등급 0~10",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(painAssessmentGuide!)).toContain(
      "국가암정보센터 암성 통증평가 항목",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(painAssessmentGuide!)).join(" ")).not.toMatch(
      /진단하세요|치료하세요|복용하세요|처방하세요|투약하세요/,
    );
    expect(fatigueCopingGuide).toMatchObject({
      label: "암관련 피로·수면·도움요청 메모",
      sourceId: "nccCancerFatigueCoping",
    });
    expect(fatigueCopingGuide?.detail).toContain("피로의 정도를 반드시 정확하게 평가");
    expect(fatigueCopingGuide?.detail).toContain("환자 본인과 가족의 노력");
    expect(fatigueCopingGuide?.detail).toContain("우선순위");
    expect(fatigueCopingGuide?.detail).toContain("중요하지 않은 활동");
    expect(fatigueCopingGuide?.detail).toContain("피로를 느낄 때의 상황");
    expect(fatigueCopingGuide?.detail).toContain("주위 사람들의 도움");
    expect(fatigueCopingGuide?.detail).toContain("손이 닿기 쉬운 곳");
    expect(fatigueCopingGuide?.detail).toContain("주치의와 간호사");
    expect(fatigueCopingGuide?.detail).toContain("현기증");
    expect(fatigueCopingGuide?.detail).toContain("자꾸 몽롱");
    expect(fatigueCopingGuide?.detail).toContain("숨이 차고");
    expect(fatigueCopingGuide?.detail).toContain("귀가 윙윙거리거나 두통");
    expect(fatigueCopingGuide?.detail).toContain("삶의 의욕");
    expect(formatCervicalCancerCareItemEvidence(fatigueCopingGuide!)).toContain(
      "국가암정보센터 암관련 피로대처 - https://www.cancer.go.kr/lay1/S1T420C421/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(fatigueCopingGuide!).body).toContain(
      "암관련 피로·수면·도움요청 메모",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(fatigueCopingGuide!).body).toContain(
      "피로를 느낄 때의 상황",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(fatigueCopingGuide!)).toContain(
      "국가암정보센터 암관련 피로대처",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(fatigueCopingGuide!)).join(" ")).not.toMatch(
      /진단하세요|치료하세요|운동하세요|상담받으세요/,
    );
    expect(dyspneaCauseGuide).toMatchObject({
      label: "호흡곤란·흉통 변화 메모",
      sourceId: "nccDyspneaCause",
    });
    expect(dyspneaCauseGuide?.detail).toContain("숨이 가쁜");
    expect(dyspneaCauseGuide?.detail).toContain("충분한 공기");
    expect(dyspneaCauseGuide?.detail).toContain("호흡은 노력을 요구");
    expect(dyspneaCauseGuide?.detail).toContain("가슴은 단단해지는");
    expect(dyspneaCauseGuide?.detail).toContain("쉬고 있거나 움직일 때");
    expect(dyspneaCauseGuide?.detail).toContain("가슴에 통증");
    expect(dyspneaCauseGuide?.detail).toContain("맥박수");
    expect(dyspneaCauseGuide?.detail).toContain("피부가 차고 축축");
    expect(dyspneaCauseGuide?.detail).toContain("콧구멍");
    expect(dyspneaCauseGuide?.detail).toContain("입술");
    expect(dyspneaCauseGuide?.detail).toContain("손톱");
    expect(dyspneaCauseGuide?.detail).toContain("청색증");
    expect(dyspneaCauseGuide?.detail).toContain("전에 없었던 호흡곤란");
    expect(dyspneaCauseGuide?.detail).toContain("갑자기 악화");
    expect(formatCervicalCancerCareItemEvidence(dyspneaCauseGuide!)).toContain(
      "국가암정보센터 호흡곤란 원인 - https://www.cancer.go.kr/lay1/S1T411C414/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(dyspneaCauseGuide!).body).toContain(
      "호흡곤란·흉통 변화 메모",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(dyspneaCauseGuide!).body).toContain(
      "쉬고 있거나 움직일 때",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(dyspneaCauseGuide!)).toContain(
      "국가암정보센터 호흡곤란 원인",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(dyspneaCauseGuide!)).join(" ")).not.toMatch(
      /진단하세요|치료하세요|산소를 줍니다|약을 줍니다|심호흡을 하게|처방하세요/,
    );
    expect(text).toContain("골반 방사선치료 난소기능·폐경 증상 상담");
    expect(text).toContain("홍조");
    expect(text).toContain("무월경");
    expect(text).toContain("성욕 감소");
    expect(text).toContain("골다공증");
    expect(text).toContain("질협착");
    expect(
      cervicalCancerCareRecoveryGuides.find(
        (item) => item.label === "골반 방사선치료 난소기능·폐경 증상 상담",
      )?.sourceId,
    ).toBe("nccRadiationSideEffects");
    expect(cervicalCancerCareRecoveryGuides.every((item) => item.sourceId)).toBe(true);
    expect(
      cervicalCancerCareRecoveryGuides.every((item) =>
        /진료팀|퇴원 안내서|기록|확인|대조/.test(item.detail),
      ),
    ).toBe(true);
    expect(text).toContain("진료팀");
  });

  it("adds prevention and screening notes without confusing them with treatment", () => {
    const text = cervicalCancerCarePreventionGuides
      .map((item) => `${item.label} ${item.detail}`)
      .join(" ");
    const hpvFamilyGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 백신 가족 안내",
    );
    const hpvTypeScopeGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 백신 종류·예방범위 확인",
    );
    const hpvMaleRelatedCancerGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 남성 접종·관련질환 확인",
    );
    const hpvRelatedDiseaseRangeGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 관련질환 범위 확인",
    );
    const hpvTreatmentBoundaryGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 치료효과·재발연구 확인",
    );
    const hpvAgeEffectGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 허가연령·노출전 효과 확인",
    );
    const hpvAdverseReactionGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 접종 후 이상반응·관찰 확인",
    );
    const hpvScheduleGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 접종 일정·관찰 확인",
    );
    const hpvSafetyGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 접종 전 임신·급성질환 확인",
    );
    const hpvDelayedDoseGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 접종 지연·추가접종 메모",
    );
    const hpvNationalProgramGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 국가예방접종 대상 메모",
    );
    const hpvInfectionGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 감염·전파 상담 메모",
    );
    const preventionRiskGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "흡연·성생활 위험요인 메모",
    );
    const preventionBundleGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "예방법 종합 체크 메모",
    );
    const immuneInfectionRiskGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "면역·감염·출산력 위험요인 메모",
    );
    const lifestyleEvidenceBoundaryGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "생활요인 근거 경계 메모",
    );
    const practiceDailyPreventionGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "실천지침 일상 예방 체크 메모",
    );

    expect(cervicalCancerCarePreventionGuides).toHaveLength(22);
    expect(text).toContain("20세 이상 여성");
    expect(text).toContain("산정특례기간");
    expect(text).toContain("2년 간격");
    expect(text).toContain("자궁경부세포검사");
    expect(text).toContain("생리 기간을 피해서");
    expect(text).toContain("HPV 검사를 함께 받을 수");
    expect(text).toContain("자궁적출 이력");
    expect(text).toContain("15일 이내");
    expect(text).toContain("전액 무료");
    expect(text).toContain("HPV 백신은 예방용");
    expect(text).toContain("치료 효과 확인 용도가 아닙니다");
    expect(text).toContain("선별검사는 변경 없이");
    expect(text).toContain("정기검진 유지");
    expect(hpvFamilyGuide?.detail).toContain("정기검진 유지");
    expect(hpvFamilyGuide?.detail).not.toContain("20~30분 관찰");
    expect(hpvTypeScopeGuide).toMatchObject({
      label: "HPV 백신 종류·예방범위 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvTypeScopeGuide?.detail).toContain("2가 백신");
    expect(hpvTypeScopeGuide?.detail).toContain("HPV 16, 18형");
    expect(hpvTypeScopeGuide?.detail).toContain("4가 백신");
    expect(hpvTypeScopeGuide?.detail).toContain("HPV 6, 11형");
    expect(hpvTypeScopeGuide?.detail).toContain("9가 백신");
    expect(hpvTypeScopeGuide?.detail).toContain("HPV 6, 11, 16, 18, 31, 33, 45, 52, 58형");
    expect(hpvTypeScopeGuide?.detail).toContain("전체 자궁경부암의 약 70%");
    expect(hpvTypeScopeGuide?.detail).toContain("방어효과");
    expect(hpvTypeScopeGuide?.detail).toContain("교차반응");
    expect(hpvTypeScopeGuide?.detail).toContain("유전자재조합 백신");
    expect(hpvTypeScopeGuide?.detail).toContain("병을 일으키는 DNA");
    expect(hpvTypeScopeGuide?.detail).toContain("감염의 위험");
    expect(hpvTypeScopeGuide?.detail).toContain("접종기관과 진료팀");
    expect(hpvTypeScopeGuide?.detail).not.toContain("100% 예방");
    expect(hpvTypeScopeGuide?.detail).not.toContain("접종하세요");
    expect(hpvTypeScopeGuide?.detail).not.toContain("맞으세요");
    expect(hpvTypeScopeGuide?.detail).not.toContain("치료하세요");
    expect(hpvMaleRelatedCancerGuide).toMatchObject({
      label: "HPV 남성 접종·관련질환 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("4가 및 9가 백신");
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("남성");
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("항문암");
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("성기암");
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("두경부 종양");
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("관련 질환 예방");
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("여성의 자궁경부암 예방 효과만큼 높지 않습니다");
    expect(hpvMaleRelatedCancerGuide?.detail).toContain("접종기관과 진료팀");
    expect(hpvMaleRelatedCancerGuide?.detail).not.toContain("접종하세요");
    expect(hpvMaleRelatedCancerGuide?.detail).not.toContain("맞으세요");
    expect(hpvMaleRelatedCancerGuide?.detail).not.toContain("치료하세요");
    expect(hpvMaleRelatedCancerGuide?.detail).not.toContain("남성도 반드시");
    expect(hpvRelatedDiseaseRangeGuide).toMatchObject({
      label: "HPV 관련질환 범위 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("대부분 무증상");
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("자연적으로 소멸");
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("지속적인 HPV 감염");
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("자궁경부암");
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("자궁경부 전암병변");
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("항문 생식기의 사마귀");
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("호흡기에 생기는 유두종 병변");
    expect(hpvRelatedDiseaseRangeGuide?.detail).toContain("진료팀 질문");
    expect(hpvRelatedDiseaseRangeGuide?.detail).not.toContain("진단하세요");
    expect(hpvRelatedDiseaseRangeGuide?.detail).not.toContain("치료하세요");
    expect(hpvRelatedDiseaseRangeGuide?.detail).not.toContain("암입니다");
    expect(hpvTreatmentBoundaryGuide).toMatchObject({
      label: "HPV 치료효과·재발연구 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvTreatmentBoundaryGuide?.detail).toContain("예방용 백신");
    expect(hpvTreatmentBoundaryGuide?.detail).toContain("상피내종양");
    expect(hpvTreatmentBoundaryGuide?.detail).toContain("자궁경부암");
    expect(hpvTreatmentBoundaryGuide?.detail).toContain("치료 효과는 없는");
    expect(hpvTreatmentBoundaryGuide?.detail).toContain("치료 후 재발 방지");
    expect(hpvTreatmentBoundaryGuide?.detail).toContain("연구는 현재 진행 중");
    expect(hpvTreatmentBoundaryGuide?.detail).toContain("진료팀 질문");
    expect(hpvTreatmentBoundaryGuide?.detail).not.toContain("치료합니다");
    expect(hpvTreatmentBoundaryGuide?.detail).not.toContain("재발 방지합니다");
    expect(hpvTreatmentBoundaryGuide?.detail).not.toContain("완치");
    expect(hpvTreatmentBoundaryGuide?.detail).not.toContain("접종하세요");
    expect(hpvAgeEffectGuide).toMatchObject({
      label: "HPV 허가연령·노출전 효과 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvAgeEffectGuide?.detail).toContain("사람유두종바이러스에 노출되기 전");
    expect(hpvAgeEffectGuide?.detail).toContain("성접촉을 시작하기 전에");
    expect(hpvAgeEffectGuide?.detail).toContain("가장 유리");
    expect(hpvAgeEffectGuide?.detail).toContain("9세부터 25~26세까지 접종 허가");
    expect(hpvAgeEffectGuide?.detail).toContain("허가 연령 이후");
    expect(hpvAgeEffectGuide?.detail).toContain("암 예방 효과는 입증되지");
    expect(hpvAgeEffectGuide?.detail).toContain("26세 이상");
    expect(hpvAgeEffectGuide?.detail).toContain("성생활을 시작하지 않았거나");
    expect(hpvAgeEffectGuide?.detail).toContain("HPV에 노출 기회가 적은");
    expect(hpvAgeEffectGuide?.detail).toContain("이론적으로 암예방 효과");
    expect(hpvAgeEffectGuide?.detail).toContain("진료팀 질문");
    expect(hpvAgeEffectGuide?.detail).not.toContain("반드시 접종");
    expect(hpvAgeEffectGuide?.detail).not.toContain("접종하세요");
    expect(hpvAgeEffectGuide?.detail).not.toContain("효과가 입증됐습니다");
    expect(hpvAgeEffectGuide?.detail).not.toContain("치료하세요");
    expect(hpvAdverseReactionGuide).toMatchObject({
      label: "HPV 접종 후 이상반응·관찰 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvAdverseReactionGuide?.detail).toContain("접종 부위 통증");
    expect(hpvAdverseReactionGuide?.detail).toContain("부종");
    expect(hpvAdverseReactionGuide?.detail).toContain("발적");
    expect(hpvAdverseReactionGuide?.detail).toContain("발열");
    expect(hpvAdverseReactionGuide?.detail).toContain("오심");
    expect(hpvAdverseReactionGuide?.detail).toContain("메스꺼움");
    expect(hpvAdverseReactionGuide?.detail).toContain("근육통");
    expect(hpvAdverseReactionGuide?.detail).toContain("약 80%");
    expect(hpvAdverseReactionGuide?.detail).toContain("일상 활동을 방해할 정도");
    expect(hpvAdverseReactionGuide?.detail).toContain("약 6%");
    expect(hpvAdverseReactionGuide?.detail).toContain("수일 내 회복");
    expect(hpvAdverseReactionGuide?.detail).toContain("심한(중증) 알레르기 반응");
    expect(hpvAdverseReactionGuide?.detail).toContain("호흡곤란");
    expect(hpvAdverseReactionGuide?.detail).toContain("아나필락시스");
    expect(hpvAdverseReactionGuide?.detail).toContain("실신");
    expect(hpvAdverseReactionGuide?.detail).toContain("앉거나 누운 상태");
    expect(hpvAdverseReactionGuide?.detail).toContain("20~30분 관찰");
    expect(hpvAdverseReactionGuide?.detail).toContain("접종기관과 진료팀");
    expect(hpvAdverseReactionGuide?.detail).not.toContain("괜찮습니다");
    expect(hpvAdverseReactionGuide?.detail).not.toContain("치료하세요");
    expect(hpvAdverseReactionGuide?.detail).not.toContain("응급실로 가세요");
    expect(hpvScheduleGuide).toMatchObject({
      label: "HPV 접종 일정·관찰 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvScheduleGuide?.detail).toContain("9세 이상");
    expect(hpvScheduleGuide?.detail).toContain("만 12세");
    expect(hpvScheduleGuide?.detail).toContain("6개월 간격");
    expect(hpvScheduleGuide?.detail).toContain("접종 후 20~30분 관찰");
    expect(hpvScheduleGuide?.detail).toContain("선별검사 유지");
    expect(hpvScheduleGuide?.detail).not.toContain("치료하세요");
    expect(hpvSafetyGuide).toMatchObject({
      label: "HPV 접종 전 임신·급성질환 확인",
      sourceId: "kdcaHpv",
    });
    expect(hpvSafetyGuide?.detail).toContain("임신 중의 백신 접종은 권장되지");
    expect(hpvSafetyGuide?.detail).toContain("나머지 접종은 출산 뒤로");
    expect(hpvSafetyGuide?.detail).toContain("중등도 또는 심한 급성기 질환");
    expect(hpvSafetyGuide?.detail).toContain("고열을 동반한 감염질환");
    expect(hpvSafetyGuide?.detail).toContain("증상이 호전될 때까지");
    expect(hpvSafetyGuide?.detail).toContain("접종기관과 진료팀");
    expect(hpvSafetyGuide?.detail).not.toContain("접종하세요");
    expect(hpvSafetyGuide?.detail).not.toContain("맞으세요");
    expect(hpvSafetyGuide?.detail).not.toContain("치료하세요");
    expect(hpvDelayedDoseGuide).toMatchObject({
      label: "HPV 접종 지연·추가접종 메모",
      sourceId: "nccHpvVaccine",
    });
    expect(hpvDelayedDoseGuide?.detail).toContain("접종시기를 놓친 경우");
    expect(hpvDelayedDoseGuide?.detail).toContain("처음부터 다시 시작하지는 않습니다");
    expect(hpvDelayedDoseGuide?.detail).toContain("남은 주사");
    expect(hpvDelayedDoseGuide?.detail).toContain("2차와 3차 접종 간격");
    expect(hpvDelayedDoseGuide?.detail).toContain("적어도 12주");
    expect(hpvDelayedDoseGuide?.detail).toContain("추가접종");
    expect(hpvDelayedDoseGuide?.detail).toContain("권고된 바가 없으므로");
    expect(hpvDelayedDoseGuide?.detail).not.toContain("맞으세요");
    expect(hpvNationalProgramGuide).toMatchObject({
      label: "HPV 국가예방접종 대상 메모",
      sourceId: "kdcaHpvNationalImmunization",
    });
    expect(hpvNationalProgramGuide?.detail).toContain("2026년 5월 6일");
    expect(hpvNationalProgramGuide?.detail).toContain("12세 남성 청소년");
    expect(hpvNationalProgramGuide?.detail).toContain("2014.1.1.~2014.12.31.");
    expect(hpvNationalProgramGuide?.detail).toContain("12~17세 여성 청소년");
    expect(hpvNationalProgramGuide?.detail).toContain("18~26세 저소득층 여성");
    expect(hpvNationalProgramGuide?.detail).toContain("고위험 유전형(16형,18형)");
    expect(hpvNationalProgramGuide?.detail).toContain("성경험 전에 접종을 완료");
    expect(hpvNationalProgramGuide?.detail).toContain("70~90%의 예방효과");
    expect(hpvNationalProgramGuide?.detail).toContain("대상 여부와 접종일정");
    expect(hpvNationalProgramGuide?.detail).not.toContain("접종하세요");
    expect(hpvInfectionGuide).toMatchObject({
      label: "HPV 감염·전파 상담 메모",
      sourceId: "nccHpvInfection",
    });
    expect(hpvInfectionGuide?.detail).toContain("주로 성접촉");
    expect(hpvInfectionGuide?.detail).toContain("혈액, 체액, 장기이식");
    expect(hpvInfectionGuide?.detail).toContain("증상 없이 자연소멸");
    expect(hpvInfectionGuide?.detail).toContain("고위험군 바이러스가 지속 감염");
    expect(hpvInfectionGuide?.detail).toContain("배우자의 성 상대자 수");
    expect(hpvInfectionGuide?.detail).toContain("감염을 비난이나 개인 원인으로 단정하지 말고");
    expect(hpvInfectionGuide?.detail).toContain("백신, 콘돔, 정기검진, HPV 검사 필요성");
    expect(hpvInfectionGuide?.detail).not.toContain("검사하세요");
    expect(preventionRiskGuide).toMatchObject({
      label: "흡연·성생활 위험요인 메모",
      sourceId: "nccCervicalPrevention",
    });
    expect(preventionRiskGuide?.detail).toContain("대부분 성접촉");
    expect(preventionRiskGuide?.detail).toContain("첫 성경험");
    expect(preventionRiskGuide?.detail).toContain("성상대자수");
    expect(preventionRiskGuide?.detail).toContain("콘돔");
    expect(preventionRiskGuide?.detail).toContain("논란");
    expect(preventionRiskGuide?.detail).toContain("흡연");
    expect(preventionRiskGuide?.detail).toContain("위험이 높아지므로");
    expect(preventionRiskGuide?.detail).toContain("경구피임약");
    expect(preventionRiskGuide?.detail).toContain("5년 이상");
    expect(preventionRiskGuide?.detail).toContain("진료팀");
    expect(preventionRiskGuide?.detail).not.toContain("끊으세요");
    expect(preventionBundleGuide).toMatchObject({
      label: "예방법 종합 체크 메모",
      sourceId: "nccCervicalPrevention",
    });
    expect(preventionBundleGuide?.detail).toContain("정기적으로 자궁경부 세포검진");
    expect(preventionBundleGuide?.detail).toContain("성상대자");
    expect(preventionBundleGuide?.detail).toContain("사람유두종바이러스 예방 백신접종");
    expect(preventionBundleGuide?.detail).toContain("금연");
    expect(preventionBundleGuide?.detail).toContain("채소와 과일을 충분하게");
    expect(preventionBundleGuide?.detail).toContain("5년 이상의 장기적인 경구피임약");
    expect(preventionBundleGuide?.detail).toContain("진료팀 질문");
    expect(preventionBundleGuide?.detail).not.toContain("복용을 중단");
    expect(immuneInfectionRiskGuide).toMatchObject({
      label: "면역·감염·출산력 위험요인 메모",
      sourceId: "nccCervicalRiskFactors",
    });
    expect(immuneInfectionRiskGuide?.detail).toContain("HIV");
    expect(immuneInfectionRiskGuide?.detail).toContain("면역");
    expect(immuneInfectionRiskGuide?.detail).toContain("클라미디아");
    expect(immuneInfectionRiskGuide?.detail).toContain("출산 횟수");
    expect(immuneInfectionRiskGuide?.detail).toContain("검진 접근");
    expect(immuneInfectionRiskGuide?.detail).toContain("진료팀");
    expect(immuneInfectionRiskGuide?.detail).not.toContain("치료하세요");
    expect(immuneInfectionRiskGuide?.detail).not.toContain("검사하세요");
    expect(lifestyleEvidenceBoundaryGuide).toMatchObject({
      label: "생활요인 근거 경계 메모",
      sourceId: "nccCervicalPracticeGuideline",
    });
    expect(lifestyleEvidenceBoundaryGuide?.detail).toContain("음주");
    expect(lifestyleEvidenceBoundaryGuide?.detail).toContain("비만");
    expect(lifestyleEvidenceBoundaryGuide?.detail).toContain("신체활동 부족");
    expect(lifestyleEvidenceBoundaryGuide?.detail).toContain("직업적·환경적 유해물질");
    expect(lifestyleEvidenceBoundaryGuide?.detail).toContain("연관성은 아직 입증되지");
    expect(lifestyleEvidenceBoundaryGuide?.detail).toContain("일반 암예방수칙");
    expect(lifestyleEvidenceBoundaryGuide?.detail).toContain("진료팀");
    expect(lifestyleEvidenceBoundaryGuide?.detail).not.toContain("음주가 자궁경부암 위험");
    expect(lifestyleEvidenceBoundaryGuide?.detail).not.toContain("비만이 자궁경부암 위험");
    expect(lifestyleEvidenceBoundaryGuide?.detail).not.toContain("운동하세요");
    expect(practiceDailyPreventionGuide).toMatchObject({
      label: "실천지침 일상 예방 체크 메모",
      sourceId: "nccCervicalPracticeGuideline",
    });
    expect(practiceDailyPreventionGuide?.detail).toContain("자궁경부암 예방, 일상 생활");
    expect(practiceDailyPreventionGuide?.detail).toContain("안전한 성생활");
    expect(practiceDailyPreventionGuide?.detail).toContain("성 상대자수 최소화");
    expect(practiceDailyPreventionGuide?.detail).toContain("식이 섬유가 풍부한 신선한 채소·과일");
    expect(practiceDailyPreventionGuide?.detail).toContain("금연");
    expect(practiceDailyPreventionGuide?.detail).toContain("진료팀 질문");
    expect(practiceDailyPreventionGuide?.detail).not.toContain("실천하세요");
    expect(practiceDailyPreventionGuide?.detail).not.toContain("치료하세요");
    expect(cervicalCancerCarePreventionGuides.every((item) => item.sourceId)).toBe(true);
  });

  it("keeps the current NCC oral-contraceptive long-term-use phrase as a separate prevention memo", () => {
    const oralContraceptiveGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "경구피임약 장기복용 상담 메모",
    );

    expect(oralContraceptiveGuide).toMatchObject({
      label: "경구피임약 장기복용 상담 메모",
      sourceId: "nccCervicalPrevention",
    });
    expect(oralContraceptiveGuide?.detail).toContain(
      "5년 이상의 장기적인 경구피임약 복용은 가능한 하지 않습니다.",
    );
    expect(oralContraceptiveGuide?.detail).toContain("이미 복용 중");
    expect(oralContraceptiveGuide?.detail).toContain("복용 기간");
    expect(oralContraceptiveGuide?.detail).toContain("처방 이유");
    expect(oralContraceptiveGuide?.detail).toContain("진료팀");
    expect(oralContraceptiveGuide?.detail).not.toContain("중단하세요");
  });

  it("summarizes cervical-cancer screening status for a female profile age 20 or older", () => {
    const summary = buildCervicalCancerScreeningSummary({
      age: "56",
      sex: "female",
    });
    const evidence = formatCervicalCancerScreeningSummaryEvidence(summary);

    expect(summary.status).toBe("국가암검진 대상 기준 해당");
    expect(summary.detail).toContain("2년 간격 자궁경부세포검사");
    expect(summary.action).toContain("진료팀에 확인");
    expect(summary.action).toContain("산정특례기간");
    expect(summary.sourceIds).toEqual(["nccScreeningEligibility", "nccScreeningSchedule"]);
    expect(evidence).toContain("국가암정보센터 국가암검진 대상자 선정 및 통보");
    expect(evidence).toContain("국가암정보센터 국가암검진 검진주기 및 검진방법");
    expect(evidence).toContain("https://www.cancer.go.kr/lay1/S1T553C554/contents.do");
    expect(evidence).toContain("https://www.cancer.go.kr/lay1/S1T553C555/contents.do");
    expect(evidence).not.toContain("근거: 출처:");
    expect(evidence).not.toContain("치료하세요");
  });

  it("turns the screening summary into a source-retaining clinician question", () => {
    const summary = buildCervicalCancerScreeningSummary({
      age: "56",
      sex: "female",
    });
    const question = buildCervicalCancerScreeningQuestion(summary);

    expect(question).toContain("국가암검진 대상 기준 해당");
    expect(question).toContain("2년 간격 자궁경부세포검사");
    expect(question).toContain("국가암검진 유예 여부");
    expect(question).toContain("산정특례기간");
    expect(question).toContain("병원 추적검사 일정");
    expect(question).toContain("https://www.cancer.go.kr/lay1/S1T553C554/contents.do");
    expect(question).toContain("https://www.cancer.go.kr/lay1/S1T553C555/contents.do");
    expect(formatCervicalCancerScreeningQuestionDraftReadyStatus(summary)).toBe(
      "자궁경부암 검진 질문 초안 준비됨 · 국가암검진 대상 기준 해당 · 근거 2개: 국가암정보센터 국가암검진 대상자 선정 및 통보, 국가암정보센터 국가암검진 검진주기 및 검진방법",
    );
    expect(question).not.toContain("근거: 출처:");
    expect(question).toContain("?");
    expect(question).not.toContain("치료하세요");
  });

  it("marks female profiles under age 20 as before the national screening age", () => {
    const summary = buildCervicalCancerScreeningSummary({
      age: "19",
      sex: "female",
    });

    expect(summary.status).toBe("국가암검진 대상 연령 전");
    expect(summary.detail).toContain("20세 이상 여성");
    expect(summary.action).toContain("진료팀 기준");
    expect(summary.sourceIds).toEqual(["nccScreeningEligibility"]);
  });

  it("asks for age before deciding national cervical-cancer screening status", () => {
    const summary = buildCervicalCancerScreeningSummary({
      age: "",
      sex: "female",
    });

    expect(summary.status).toBe("나이 입력 필요");
    expect(summary.detail).toContain("20세 이상 여성");
    expect(summary.detail).toContain("2년 간격 자궁경부세포검사");
    expect(summary.sourceIds).toEqual(["nccScreeningEligibility", "nccScreeningSchedule"]);
  });

  it("does not treat partial or non-integer age text as screening-eligible", () => {
    for (const age of ["20abc", "20.5", "-20", "0x20"]) {
      expect(buildCervicalCancerScreeningSummary({ age, sex: "female" })).toMatchObject({
        status: "나이 입력 필요",
        sourceIds: ["nccScreeningEligibility", "nccScreeningSchedule"],
      });
    }
  });

  it("keeps non-female profile screening copy as clinician-confirmation guidance", () => {
    const summary = buildCervicalCancerScreeningSummary({
      age: "56",
      sex: "male",
    });

    expect(summary.status).toBe("프로필 성별 기준 확인 필요");
    expect(summary.detail).toContain("20세 이상 여성 기준");
    expect(summary.action).toContain("개인 상황에 맞게 진료팀에 확인");
    expect(summary.sourceIds).toEqual(["nccScreeningEligibility"]);
  });
});
