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
      "nccAppetiteLossDiet",
      "nccMouthPainDiet",
      "nccMucositisCare",
      "nccDryMouthDiet",
      "nccTasteChangeDiet",
      "nccDiarrheaDiet",
      "nccConstipationDiet",
      "nccWeightChangeDiet",
      "nccImmuneLowDiet",
      "nccFatigueDepressionDiet",
      "nccInfectionConsult",
	      "nccNeuropathyCare",
	      "nccSkinChangeCare",
		      "nccAnemiaCare",
			      "nccBleedingSymptoms",
			      "nccHairLossCare",
      "nccHiccupConsult",
      "nccCancerLifeChildrenCommunication",
      "nccCancerLifePsychologicalStability",
      "nccSurvivorDistressAdaptation",
      "nccMentalHealthStressCancerCause",
      "nccSurvivorPostTreatmentSlump",
      "nccMentalHealthInsomniaMedicationConcern",
      "nccMentalHealthPsychiatryConsultBenefits",
      "nccSurvivorAnxietyManagement",
      "nccSurvivorSleepManagement",
      "nccSurvivorExerciseManagement",
      "nccSurvivorNutritionLifestyle",
      "nccSurvivorHealthyManagementNutrition",
      "nccSurvivorWorkReturn",
      "nccComplementaryTherapyConsultation",
      "nccPainAssessment",
      "nccCancerFatigueCoping",
      "nccDyspneaCause",
      "nccDyspneaConsult",
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
    expect(cervicalCancerCareSources.nccSurvivorDistressAdaptation.url).toContain("S1T788C790");
    expect(cervicalCancerCareSources.nccMentalHealthStressCancerCause.url).toContain(
      "article_seq=22076",
    );
    expect(cervicalCancerCareSources.nccSurvivorPostTreatmentSlump.url).toContain(
      "article_seq=22077",
    );
    expect(cervicalCancerCareSources.nccMentalHealthInsomniaMedicationConcern.url).toContain(
      "article_seq=22078",
    );
    expect(cervicalCancerCareSources.nccMentalHealthPsychiatryConsultBenefits.url).toContain(
      "article_seq=22079",
    );
    expect(cervicalCancerCareSources.nccSurvivorAnxietyManagement.url).toContain("S1T788C791");
    expect(cervicalCancerCareSources.nccSurvivorSleepManagement.url).toContain("S1T748C794");
    expect(cervicalCancerCareSources.nccSurvivorExerciseManagement.url).toContain("S1T748C795");
    expect(cervicalCancerCareSources.nccSurvivorNutritionLifestyle.url).toContain("S1T748C796");
    expect(cervicalCancerCareSources.nccSurvivorHealthyManagementNutrition.url).toContain(
      "article_seq=22688",
    );
    expect(cervicalCancerCareSources.nccSurvivorWorkReturn.url).toContain("S1T748C798");
    expect(cervicalCancerCareSources.nccComplementaryTherapyConsultation.url).toContain(
      "S1T365C368",
    );
    expect(cervicalCancerCareSources.nccPainAssessment.url).toContain("S1T378C380");
    expect(cervicalCancerCareSources.nccCancerFatigueCoping.url).toContain("S1T420C421");
    expect(cervicalCancerCareSources.nccDyspneaCause.url).toContain("S1T411C414");
    expect(cervicalCancerCareSources.nccDyspneaConsult.url).toContain("S1T411C415");
    expect(cervicalCancerCareSources.nccCoughCause.url).toContain("S1T410C412");
    expect(cervicalCancerCareSources.nccTreatmentEating.url).toContain("S1T471C472");
    expect(cervicalCancerCareSources.nccNauseaDiet.url).toContain("S1T479C481");
    expect(cervicalCancerCareSources.nccVomitingDiet.url).toContain("S1T479C482");
    expect(cervicalCancerCareSources.nccAppetiteLossDiet.url).toContain("S1T479C480");
    expect(cervicalCancerCareSources.nccMouthPainDiet.url).toContain("S1T479C483");
    expect(cervicalCancerCareSources.nccMucositisCare.url).toContain("S1T390C393");
    expect(cervicalCancerCareSources.nccDryMouthDiet.url).toContain("S1T479C485");
    expect(cervicalCancerCareSources.nccTasteChangeDiet.url).toContain("S1T479C484");
    expect(cervicalCancerCareSources.nccDiarrheaDiet.url).toContain("S1T479C488");
    expect(cervicalCancerCareSources.nccConstipationDiet.url).toContain("S1T479C487");
    expect(cervicalCancerCareSources.nccWeightChangeDiet.url).toContain("S1T479C486");
    expect(cervicalCancerCareSources.nccImmuneLowDiet.url).toContain("S1T479C489");
	    expect(cervicalCancerCareSources.nccFatigueDepressionDiet.url).toContain("S1T479C490");
    expect(cervicalCancerCareSources.nccInfectionConsult.url).toContain("S1T435C439");
	    expect(cervicalCancerCareSources.nccNeuropathyCare.url).toContain("S1T458C460");
		    expect(cervicalCancerCareSources.nccSkinChangeCare.url).toContain("S1T454C456");
		    expect(cervicalCancerCareSources.nccAnemiaCare.url).toContain("S1T440C444");
			    expect(cervicalCancerCareSources.nccBleedingSymptoms.url).toContain("S1T445C448");
			    expect(cervicalCancerCareSources.nccHairLossCare.url).toContain("S1T451C453");
			    expect(cervicalCancerCareSources.nccHiccupConsult.url).toContain("S1T466C468");
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
				    expect(cervicalCancerCarePrompts).toHaveLength(66);
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
      "식욕부진 식사·간식 기록 준비",
      "입과 목 통증 식사·구강상태 기록 준비",
      "구내염 구강관리 확인",
      "입안 건조 식사·수분 기록 준비",
      "입맛 변화 단백질·향 기록 준비",
      "설사 수분·전해질 음식 기록 준비",
      "변비 수분·섬유소·활동 기록 준비",
      "체중변화 열량·단백질·원인 기록 준비",
      "면역기능 저하 식품안전 기록 준비",
      "피로감·우울 식사·활동 기록 준비",
      "발열·오한 감염 상담 기준 확인",
	      "손발저림·감각이상 안전 확인",
	      "피부변화·손발홍반·손발톱 확인",
		      "빈혈·혈색소·어지럼 기록 확인",
			      "출혈·멍·코피·혈변 기록 확인",
			      "탈모·두피 보호 기록 확인",
			      "딸꾹질 지속 상담 기준 확인",
			      "HPV·검진",
      "HPV 감염·파트너 상담",
      "임신·출산 계획",
      "성생활 재개 상담",
      "자녀·가족 설명 준비",
      "정서 안정·전문상담 준비",
      "디스트레스 신호·자가평가 상담 준비",
      "스트레스·암 원인 오해 상담 준비",
      "치료 후 슬럼프·우울 상담 준비",
      "불면증·정신과 약 중독 우려 상담 준비",
      "정신건강의학과 진료 도움 확인 준비",
      "불안 신체증상·주의전환 상담 준비",
      "불면·수면일지 상담 준비",
      "운동강도·근력운동 상담 준비",
      "치료 후 영양·식생활 상담 준비",
      "치료 후 고용량 영양식품·우유 질문 준비",
      "치료 후 이차암 검진 구분 준비",
      "직업복귀·근무조정 상담 준비",
      "보완대체요법 상담 준비",
      "암성 통증 평가 준비",
      "암관련 피로 대처 준비",
      "호흡곤란 변화 기록 준비",
      "호흡곤란·흉통 상담 기준 확인",
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
    const appetiteLossDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "식욕부진 식사·간식 기록 준비",
    )!;
    expect(appetiteLossDietPrompt.sourceId).toBe("nccAppetiteLossDiet");
    expect(appetiteLossDietPrompt.question).toContain("암 자체와 항암치료");
    expect(appetiteLossDietPrompt.question).toContain("공포나 우울감");
    expect(appetiteLossDietPrompt.question).toContain("조금씩 자주");
    expect(appetiteLossDietPrompt.question).toContain("간식을 가까이");
    expect(appetiteLossDietPrompt.question).toContain("먹고 싶을 때");
    expect(appetiteLossDietPrompt.question).toContain("몸 상태가 좋을 때");
    expect(appetiteLossDietPrompt.question).toContain("평소에 좋아하던 음식");
    expect(appetiteLossDietPrompt.question).toContain("충분한 휴식을 취한 아침");
    expect(appetiteLossDietPrompt.question).toContain("죽, 미음, 쥬스, 스프");
    expect(appetiteLossDietPrompt.question).toContain("식사 시 수분섭취");
    expect(appetiteLossDietPrompt.question).toContain("식전이나 식후 30~60분");
    expect(appetiteLossDietPrompt.question).toContain("식사하는 시간, 장소, 분위기");
    expect(appetiteLossDietPrompt.question).toContain("가벼운 산책");
    expect(appetiteLossDietPrompt.question).toContain("식사전후에 입안을 청결");
    expect(appetiteLossDietPrompt.question).toContain("특수영양 보충음료");
    expect(appetiteLossDietPrompt.question).toContain("억지로 먹으라고 지나치게 강요하지");
    expect(buildCervicalCancerCarePromptQuestion(appetiteLossDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    const mouthPainDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "입과 목 통증 식사·구강상태 기록 준비",
    )!;
    expect(mouthPainDietPrompt.sourceId).toBe("nccMouthPainDiet");
    expect(mouthPainDietPrompt.question).toContain("방사선요법, 화학요법 또는 감염");
    expect(mouthPainDietPrompt.question).toContain("입안 통증");
    expect(mouthPainDietPrompt.question).toContain("잇몸의 손상");
    expect(mouthPainDietPrompt.question).toContain("인후염 또는 식도염");
    expect(mouthPainDietPrompt.question).toContain("항암치료의 부작용 때문인지 치과질환인지");
    expect(mouthPainDietPrompt.question).toContain("부드럽고 촉촉한 음식");
    expect(mouthPainDietPrompt.question).toContain("씹고 삼키기 쉬운");
    expect(mouthPainDietPrompt.question).toContain("죽류");
    expect(mouthPainDietPrompt.question).toContain("미음");
    expect(mouthPainDietPrompt.question).toContain("시지 않은 과일");
    expect(mouthPainDietPrompt.question).toContain("오렌지, 포도, 레몬, 토마토주스");
    expect(mouthPainDietPrompt.question).toContain("향신료");
    expect(mouthPainDietPrompt.question).toContain("소금에 절인 음식");
    expect(mouthPainDietPrompt.question).toContain("토스트, 크래커 또는 말린 음식");
    expect(mouthPainDietPrompt.question).toContain("작은 크기");
    expect(mouthPainDietPrompt.question).toContain("빨대");
    expect(mouthPainDietPrompt.question).toContain("작은 스푼");
    expect(mouthPainDietPrompt.question).toContain("뜨거운 음식");
    expect(mouthPainDietPrompt.question).toContain("옥살로플라틴");
    expect(mouthPainDietPrompt.question).toContain("차가운 음식");
    expect(mouthPainDietPrompt.question).toContain("입안은 깨끗이 헹구어");
    expect(buildCervicalCancerCarePromptQuestion(mouthPainDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    const mucositisCarePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "구내염 구강관리 확인",
    )!;
    expect(mucositisCarePrompt.sourceId).toBe("nccMucositisCare");
    expect(mucositisCarePrompt.question).toContain("입안의 염증");
    expect(mucositisCarePrompt.question).toContain("구강을 깨끗하고 촉촉하게");
    expect(mucositisCarePrompt.question).toContain("칫솔모가 부드러운");
    expect(mucositisCarePrompt.question).toContain("틀니");
    expect(mucositisCarePrompt.question).toContain("발포성 틀니용 세정제");
    expect(mucositisCarePrompt.question).toContain("1.5%과산화수소");
    expect(mucositisCarePrompt.question).toContain("6-7분");
    expect(mucositisCarePrompt.question).toContain("치실 또는 양치질 후");
    expect(mucositisCarePrompt.question).toContain("구강함수액");
    expect(mucositisCarePrompt.question).toContain("생리식염수 500cc");
    expect(mucositisCarePrompt.question).toContain("베이킹 소다 10g");
    expect(mucositisCarePrompt.question).toContain("6%이하의 알코올");
    expect(mucositisCarePrompt.question).toContain("항암화학요법 시작 전");
    expect(mucositisCarePrompt.question).toContain("잇몸 상태");
    expect(mucositisCarePrompt.question).toContain("의료진과 미리 상의");
    expect(mucositisCarePrompt.question).toContain("구강을 자주 헹궈");
    expect(mucositisCarePrompt.question).toContain("알코올 성분 구강세정제");
    expect(mucositisCarePrompt.question).toContain("의치는 꼭 필요한 경우");
    expect(mucositisCarePrompt.question).toContain("입안 통증");
    expect(mucositisCarePrompt.question).toContain("붉어짐");
    expect(mucositisCarePrompt.question).toContain("궤양");
    expect(mucositisCarePrompt.question).toContain("출혈");
    expect(mucositisCarePrompt.question).toContain("삼킴 어려움");
    expect(mucositisCarePrompt.question).toContain("24시간 이상");
    expect(buildCervicalCancerCarePromptQuestion(mucositisCarePrompt)).toContain(
      "출처: 국가암정보센터 입안의 염증(구내염) 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
    );
    const dryMouthDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "입안 건조 식사·수분 기록 준비",
    )!;
    expect(dryMouthDietPrompt.sourceId).toBe("nccDryMouthDiet");
    expect(dryMouthDietPrompt.question).toContain("침분비를 감소시켜 입안을 마르게");
    expect(dryMouthDietPrompt.question).toContain("음식물을 씹고 삼키는 것이 더욱 어려워");
    expect(dryMouthDietPrompt.question).toContain("음식의 맛도 변할 수");
    expect(dryMouthDietPrompt.question).toContain("가까운 장소에 물");
    expect(dryMouthDietPrompt.question).toContain("조금씩 자주");
    expect(dryMouthDietPrompt.question).toContain("부드럽고 곱게 간 식품");
    expect(dryMouthDietPrompt.question).toContain("육수나 국물");
    expect(dryMouthDietPrompt.question).toContain("소스나 드레싱");
    expect(dryMouthDietPrompt.question).toContain("식사 중간에 자주 물이나 음료");
    expect(dryMouthDietPrompt.question).toContain("빨대");
    expect(dryMouthDietPrompt.question).toContain("딱딱한 사탕");
    expect(dryMouthDietPrompt.question).toContain("껌");
    expect(dryMouthDietPrompt.question).toContain("아주 달거나 신음식");
    expect(dryMouthDietPrompt.question).toContain("입안이 헐거나 목구멍이 아플 경우");
    expect(dryMouthDietPrompt.question).toContain("의사선생님이나 치과선생님과 상의");
    expect(buildCervicalCancerCarePromptQuestion(dryMouthDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 입안의 건조증 - https://www.cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    const tasteChangeDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "입맛 변화 단백질·향 기록 준비",
    )!;
    expect(tasteChangeDietPrompt.sourceId).toBe("nccTasteChangeDiet");
    expect(tasteChangeDietPrompt.question).toContain("암이나 항암치료");
    expect(tasteChangeDietPrompt.question).toContain("치과적인 문제");
    expect(tasteChangeDietPrompt.question).toContain("음식의 맛이나 냄새");
    expect(tasteChangeDietPrompt.question).toContain("고기나 생선 등의 고단백식품");
    expect(tasteChangeDietPrompt.question).toContain("쓴맛이나 금속성 맛");
    expect(tasteChangeDietPrompt.question).toContain("음식의 맛이 없어질 수");
    expect(tasteChangeDietPrompt.question).toContain("치료가 끝나면 사라질");
    expect(tasteChangeDietPrompt.question).toContain("보기가 좋고 냄새도 좋은 식품");
    expect(tasteChangeDietPrompt.question).toContain("고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품");
    expect(tasteChangeDietPrompt.question).toContain("향이 좋은 양념류");
    expect(tasteChangeDietPrompt.question).toContain("와인, 레몬즙");
    expect(tasteChangeDietPrompt.question).toContain("새콤달콤한 소스");
    expect(tasteChangeDietPrompt.question).toContain("신맛이 금속성의 맛");
    expect(tasteChangeDietPrompt.question).toContain("오렌지나 레몬");
    expect(tasteChangeDietPrompt.question).toContain("입과 목에 통증");
    expect(tasteChangeDietPrompt.question).toContain("염증을 자극하거나 불편");
    expect(tasteChangeDietPrompt.question).toContain("치과적인 문제가 없는지");
    expect(tasteChangeDietPrompt.question).toContain("입안을 자주 헹구");
    expect(buildCervicalCancerCarePromptQuestion(tasteChangeDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    const diarrheaDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "설사 수분·전해질 음식 기록 준비",
    )!;
    expect(diarrheaDietPrompt.sourceId).toBe("nccDiarrheaDiet");
    expect(diarrheaDietPrompt.question).toContain("항암치료");
    expect(diarrheaDietPrompt.question).toContain("복부와 골반 부위의 방사선치료");
    expect(diarrheaDietPrompt.question).toContain("감염, 음식에 대한 민감성, 불안 및 스트레스");
    expect(diarrheaDietPrompt.question).toContain("음식이 장을 빨리 통과");
    expect(diarrheaDietPrompt.question).toContain("비타민, 무기질, 수분");
    expect(diarrheaDietPrompt.question).toContain("탈수");
    expect(diarrheaDietPrompt.question).toContain("맑은 유동식");
    expect(diarrheaDietPrompt.question).toContain("1~2일 이상");
    expect(diarrheaDietPrompt.question).toContain("12~24시간");
    expect(diarrheaDietPrompt.question).toContain("수분을 충분히");
    expect(diarrheaDietPrompt.question).toContain("염분과 칼륨");
    expect(diarrheaDietPrompt.question).toContain("육수");
    expect(diarrheaDietPrompt.question).toContain("스포츠 음료");
    expect(diarrheaDietPrompt.question).toContain("바나나");
    expect(diarrheaDietPrompt.question).toContain("복숭아");
    expect(diarrheaDietPrompt.question).toContain("토마토");
    expect(diarrheaDietPrompt.question).toContain("으깬 감자");
    expect(diarrheaDietPrompt.question).toContain("조금씩 자주");
    expect(diarrheaDietPrompt.question).toContain("섬유소가 적은 식품");
    expect(diarrheaDietPrompt.question).toContain("흰밥, 흰죽, 미음, 흰빵");
    expect(diarrheaDietPrompt.question).toContain("삶거나 으깬 감자");
    expect(diarrheaDietPrompt.question).toContain("맑은 고깃국, 생선, 닭고기, 두부, 계란");
    expect(diarrheaDietPrompt.question).toContain("너무 뜨겁거나 찬 음식");
    expect(diarrheaDietPrompt.question).toContain("생야채, 생과일의 껍질, 씨");
    expect(diarrheaDietPrompt.question).toContain("브로콜리, 옥수수, 말린 콩");
    expect(diarrheaDietPrompt.question).toContain("카페인과 알코올");
    expect(diarrheaDietPrompt.question).toContain("커피, 홍차, 초콜릿, 탄산음료");
    expect(diarrheaDietPrompt.question).toContain("콩, 양배추, 탄산음료, 껌");
    expect(diarrheaDietPrompt.question).toContain("우유 및 유제품");
    expect(diarrheaDietPrompt.question).toContain("유당이 설사를 악화");
    expect(diarrheaDietPrompt.question).toContain("너무 심하거나 피가 섞이거나 2일 이상");
    expect(diarrheaDietPrompt.question).toContain("의사선생님과 상의");
    expect(buildCervicalCancerCarePromptQuestion(diarrheaDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    const constipationDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "변비 수분·섬유소·활동 기록 준비",
    )!;
    expect(constipationDietPrompt.sourceId).toBe("nccConstipationDiet");
    expect(constipationDietPrompt.question).toContain("수분 및 음식섭취가 불충분");
    expect(constipationDietPrompt.question).toContain("오랫동안 누워있는 경우");
    expect(constipationDietPrompt.question).toContain("항암제");
    expect(constipationDietPrompt.question).toContain("진통제");
    expect(constipationDietPrompt.question).toContain("수분을 충분히");
    expect(constipationDietPrompt.question).toContain("하루에 8~10컵 이상");
    expect(constipationDietPrompt.question).toContain("변을 부드럽게");
    expect(constipationDietPrompt.question).toContain("아침 기상 직후");
    expect(constipationDietPrompt.question).toContain("차가운 물");
    expect(constipationDietPrompt.question).toContain("장운동");
    expect(constipationDietPrompt.question).toContain("음식 섭취량이 너무 적지 않도록");
    expect(constipationDietPrompt.question).toContain("도정이 덜 된 곡류");
    expect(constipationDietPrompt.question).toContain("생과일");
    expect(constipationDietPrompt.question).toContain("생야채");
    expect(constipationDietPrompt.question).toContain("섬유소가 많은 식품");
    expect(constipationDietPrompt.question).toContain("가벼운 산책이나 걷기");
    expect(constipationDietPrompt.question).toContain("자신에게 맞는 운동");
    expect(constipationDietPrompt.question).toContain("누워만 있는 경우");
    expect(constipationDietPrompt.question).toContain("배를 부드럽게 문질러");
    expect(constipationDietPrompt.question).toContain("계속적으로 변비가 조절되지");
    expect(constipationDietPrompt.question).toContain("의사선생님과 상의");
    expect(buildCervicalCancerCarePromptQuestion(constipationDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    const weightChangeDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "체중변화 열량·단백질·원인 기록 준비",
    )!;
    expect(weightChangeDietPrompt.sourceId).toBe("nccWeightChangeDiet");
    expect(weightChangeDietPrompt.question).toContain("체중의 감소를 흔하게 경험");
    expect(weightChangeDietPrompt.question).toContain("허약하게 만들고");
    expect(weightChangeDietPrompt.question).toContain("암에 대한 저항력");
    expect(weightChangeDietPrompt.question).toContain("치료효과");
    expect(weightChangeDietPrompt.question).toContain("열량과 단백질");
    expect(weightChangeDietPrompt.question).toContain("김밥, 초밥, 주먹밥, 볶음밥");
    expect(weightChangeDietPrompt.question).toContain("야채죽, 전복죽, 계란죽");
    expect(weightChangeDietPrompt.question).toContain("감자, 고구마, 떡, 만두, 빵");
    expect(weightChangeDietPrompt.question).toContain("설탕, 꿀, 쨈, 버터, 땅콩버터");
    expect(weightChangeDietPrompt.question).toContain("우유, 두유");
    expect(weightChangeDietPrompt.question).toContain("사탕, 젤리, 크래커, 빵류, 과일, 주스");
    expect(weightChangeDietPrompt.question).toContain("계란");
    expect(weightChangeDietPrompt.question).toContain("콩, 두부");
    expect(weightChangeDietPrompt.question).toContain("생선");
    expect(weightChangeDietPrompt.question).toContain("유제품");
    expect(weightChangeDietPrompt.question).toContain("체중이 증가하였다고 바로 체중조절");
    expect(weightChangeDietPrompt.question).toContain("의사선생님과 상의하여 원인을");
    expect(weightChangeDietPrompt.question).toContain("약물에 의한 체내 수분 보유");
    expect(weightChangeDietPrompt.question).toContain("식욕의 이상 증가");
    expect(weightChangeDietPrompt.question).toContain("가공식품, 김치, 젓갈, 장아찌류");
    expect(weightChangeDietPrompt.question).toContain("청량 음료, 초콜릿, 사탕, 과자류");
    expect(weightChangeDietPrompt.question).toContain("과일과 야채 그리고 곡류");
    expect(weightChangeDietPrompt.question).toContain("지방이 없는 부위의 육류제품");
    expect(weightChangeDietPrompt.question).toContain("저지방 우유 및 유제품");
    expect(weightChangeDietPrompt.question).toContain("끓이고 찌는 형태");
    expect(weightChangeDietPrompt.question).toContain("버터, 마요네즈, 감미료");
    expect(weightChangeDietPrompt.question).toContain("고열량의 간식");
    expect(weightChangeDietPrompt.question).toContain("많이 먹었다고 생각되면 운동");
    expect(buildCervicalCancerCarePromptQuestion(weightChangeDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    const immuneLowDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "면역기능 저하 식품안전 기록 준비",
    )!;
    expect(immuneLowDietPrompt.sourceId).toBe("nccImmuneLowDiet");
    expect(immuneLowDietPrompt.question).toContain("백혈구수가 감소");
    expect(immuneLowDietPrompt.question).toContain("감염에 대해 특별히 주의");
    expect(immuneLowDietPrompt.question).toContain("익힌 음식");
    expect(immuneLowDietPrompt.question).toContain("WBC/ANC");
    expect(immuneLowDietPrompt.question).toContain("완전히 익힌 음식");
    expect(immuneLowDietPrompt.question).toContain("유효기간");
    expect(immuneLowDietPrompt.question).toContain("저온살균 제품");
    expect(immuneLowDietPrompt.question).toContain("냉장·냉동 보관");
    expect(immuneLowDietPrompt.question).toContain("고기·생선·닭고기 분리 보관");
    expect(immuneLowDietPrompt.question).toContain("냉장고에서 녹이고");
    expect(immuneLowDietPrompt.question).toContain("남은 음식");
    expect(immuneLowDietPrompt.question).toContain("채소와 과일");
    expect(immuneLowDietPrompt.question).toContain("손톱 밑");
    expect(immuneLowDietPrompt.question).toContain("조리 기구·식기·수저 소독");
    expect(immuneLowDietPrompt.question).toContain("식기·도마·칼 분리");
    expect(immuneLowDietPrompt.question).toContain("외식보다 직접 요리");
    expect(immuneLowDietPrompt.question).toContain("날계란");
    expect(immuneLowDietPrompt.question).toContain("덜 익힌 계란");
    expect(immuneLowDietPrompt.question).toContain("생굴, 회, 육회, 생선회, 생조개, 초밥");
    expect(immuneLowDietPrompt.question).toContain("3~4일 지난 남은 음식");
    expect(immuneLowDietPrompt.question).toContain("곰팡이가 핀 음식");
    expect(immuneLowDietPrompt.question).toContain("녹슨 캔");
    expect(immuneLowDietPrompt.question).toContain("녹은 냉동제품");
    expect(immuneLowDietPrompt.question).toContain("비살균 우유·주스·요구르트");
    expect(buildCervicalCancerCarePromptQuestion(immuneLowDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://www.cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    const fatigueDepressionDietPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "피로감·우울 식사·활동 기록 준비",
    )!;
    expect(fatigueDepressionDietPrompt.sourceId).toBe("nccFatigueDepressionDiet");
    expect(fatigueDepressionDietPrompt.question).toContain("치료기간 동안 피로감");
    expect(fatigueDepressionDietPrompt.question).toContain("제대로 먹지 못한 것");
    expect(fatigueDepressionDietPrompt.question).toContain("운동 저하");
    expect(fatigueDepressionDietPrompt.question).toContain("혈구수 부족");
    expect(fatigueDepressionDietPrompt.question).toContain("우울");
    expect(fatigueDepressionDietPrompt.question).toContain("불면");
    expect(fatigueDepressionDietPrompt.question).toContain("약물 부작용");
    expect(fatigueDepressionDietPrompt.question).toContain("의사선생님과 원인");
    expect(fatigueDepressionDietPrompt.question).toContain("감정과 공포");
    expect(fatigueDepressionDietPrompt.question).toContain("치료방법, 부작용");
    expect(fatigueDepressionDietPrompt.question).toContain("충분한 휴식");
    expect(fatigueDepressionDietPrompt.question).toContain("낮에 잠깐씩 낮잠");
    expect(fatigueDepressionDietPrompt.question).toContain("짧고 간단한 활동");
    expect(fatigueDepressionDietPrompt.question).toContain("영양이 풍부한 음식");
    expect(fatigueDepressionDietPrompt.question).toContain("불충분한 열량과 영양소");
    expect(fatigueDepressionDietPrompt.question).toContain("하루 중 가장 좋은 시간");
    expect(fatigueDepressionDietPrompt.question).toContain("낮잠이나 휴식 후");
    expect(fatigueDepressionDietPrompt.question).toContain("적은 양의 식사와 간식");
    expect(fatigueDepressionDietPrompt.question).toContain("가족이나 친구의 도움");
    expect(fatigueDepressionDietPrompt.question).toContain("음식배달서비스");
    expect(fatigueDepressionDietPrompt.question).toContain("좋아하는 음식");
    expect(fatigueDepressionDietPrompt.question).toContain("산책이나 규칙적인 운동");
    expect(fatigueDepressionDietPrompt.question).toContain("피로를 악화시키는 행위");
    expect(fatigueDepressionDietPrompt.question).toContain("아이보기, 밥하기, 집안일");
    expect(buildCervicalCancerCarePromptQuestion(fatigueDepressionDietPrompt)).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    const infectionConsultPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "발열·오한 감염 상담 기준 확인",
    )!;
    expect(infectionConsultPrompt.sourceId).toBe("nccInfectionConsult");
    expect(infectionConsultPrompt.question).toContain("항문 상처");
    expect(infectionConsultPrompt.question).toContain("오한");
    expect(infectionConsultPrompt.question).toContain("열이 38℃ 이상");
    expect(infectionConsultPrompt.question).toContain("예방주사와 치과진료");
    expect(infectionConsultPrompt.question).toContain("오심·구토·설사");
    expect(infectionConsultPrompt.question).toContain("흉통이나 호흡곤란");
    expect(infectionConsultPrompt.question).toContain("배뇨시 쓰리거나 빈뇨");
    expect(infectionConsultPrompt.question).toContain("뇨의 색변화나 냄새");
    expect(infectionConsultPrompt.question).toContain("구강내 궤양이나 흰색의 반점");
    expect(infectionConsultPrompt.question).toContain("체온 측정 시각");
    expect(infectionConsultPrompt.question).toContain("진료팀에 알려야 하는지");
    expect(buildCervicalCancerCarePromptQuestion(infectionConsultPrompt)).toContain(
      "출처: 국가암정보센터 감염 의료진 상담 기준 - https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
    );
    expect(Object.values(buildCervicalCancerCarePromptQuestionDraft(infectionConsultPrompt, "2026-06-15")).join(" ")).not.toMatch(
      /감염으로 진단하세요|항생제를 복용하세요|해열제를 복용하세요|응급실로 가세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    const neuropathyCarePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "손발저림·감각이상 안전 확인",
    )!;
    expect(neuropathyCarePrompt.sourceId).toBe("nccNeuropathyCare");
    expect(neuropathyCarePrompt.question).toContain("신경계 손상");
    expect(neuropathyCarePrompt.question).toContain("손비비기");
    expect(neuropathyCarePrompt.question).toContain("주먹을 쥐었다가 폈다");
    expect(neuropathyCarePrompt.question).toContain("뜨거운 것은 화상");
    expect(neuropathyCarePrompt.question).toContain("손, 발을 항상 깨끗이 씻고");
    expect(neuropathyCarePrompt.question).toContain("손톱, 발톱을 짧게");
    expect(neuropathyCarePrompt.question).toContain("다른 사람의 도움");
    expect(neuropathyCarePrompt.question).toContain("부드러운 면");
    expect(neuropathyCarePrompt.question).toContain("신발 앞부분이 뾰족한");
    expect(neuropathyCarePrompt.question).toContain("맨발");
    expect(neuropathyCarePrompt.question).toContain("추위나 찬 것");
    expect(neuropathyCarePrompt.question).toContain("물의 온도");
    expect(neuropathyCarePrompt.question).toContain("전기면도기");
    expect(neuropathyCarePrompt.question).toContain("직접 운전");
    expect(neuropathyCarePrompt.question).toContain("의료진과 상의");
    expect(neuropathyCarePrompt.question).toContain("감각이 떨어");
    expect(neuropathyCarePrompt.question).toContain("손끝, 발끝");
    expect(neuropathyCarePrompt.question).toContain("무감각");
    expect(neuropathyCarePrompt.question).toContain("통증");
    expect(neuropathyCarePrompt.question).toContain("따끔거리는 감각");
    expect(neuropathyCarePrompt.question).toContain("청력");
    expect(neuropathyCarePrompt.question).toContain("복통, 구토, 변비");
    expect(buildCervicalCancerCarePromptQuestion(neuropathyCarePrompt)).toContain(
      "출처: 국가암정보센터 신경계이상 증상 및 주의사항 - https://www.cancer.go.kr/lay1/S1T458C460/contents.do",
    );
    const skinChangeCarePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "피부변화·손발홍반·손발톱 확인",
    )!;
    expect(skinChangeCarePrompt.sourceId).toBe("nccSkinChangeCare");
    expect(skinChangeCarePrompt.question).toContain("피부와 눈의 공막");
    expect(skinChangeCarePrompt.question).toContain("진한 오렌지색의 소변");
    expect(skinChangeCarePrompt.question).toContain("파랗거나 보랏빛 피부 또는 타박상");
    expect(skinChangeCarePrompt.question).toContain("피부의 발적");
    expect(skinChangeCarePrompt.question).toContain("가려움증");
    expect(skinChangeCarePrompt.question).toContain("여드름");
    expect(skinChangeCarePrompt.question).toContain("미지근한 물");
    expect(skinChangeCarePrompt.question).toContain("순한 비누");
    expect(skinChangeCarePrompt.question).toContain("오랜시간 동안 뜨거운 물");
    expect(skinChangeCarePrompt.question).toContain("알코올");
    expect(skinChangeCarePrompt.question).toContain("오전 10시부터 오후 3시");
    expect(skinChangeCarePrompt.question).toContain("손바닥과 발바닥");
    expect(skinChangeCarePrompt.question).toContain("물집");
    expect(skinChangeCarePrompt.question).toContain("표피박리");
    expect(skinChangeCarePrompt.question).toContain("수용성 크림이나 로션");
    expect(skinChangeCarePrompt.question).toContain("비비거나 긁거나 마사지");
    expect(skinChangeCarePrompt.question).toContain("검은색으로 변하거나 흰색 줄");
    expect(skinChangeCarePrompt.question).toContain("손발톱 뿌리부분");
	    expect(buildCervicalCancerCarePromptQuestion(skinChangeCarePrompt)).toContain(
	      "출처: 국가암정보센터 피부변화 증상별 대처방법 - https://www.cancer.go.kr/lay1/S1T454C456/contents.do",
	    );
	    const anemiaCarePrompt = cervicalCancerCarePrompts.find(
	      (item) => item.topic === "빈혈·혈색소·어지럼 기록 확인",
	    )!;
	    expect(anemiaCarePrompt.sourceId).toBe("nccAnemiaCare");
	    expect(anemiaCarePrompt.question).toContain("항암 치료가 적혈구에 영향을");
	    expect(anemiaCarePrompt.question).toContain("담당 의사에게 묻고");
	    expect(anemiaCarePrompt.question).toContain("빈혈 관련 증상");
	    expect(anemiaCarePrompt.question).toContain("심각한 피로나 허약함");
	    expect(anemiaCarePrompt.question).toContain("숨 가쁨");
	    expect(anemiaCarePrompt.question).toContain("혼동이나 집중하기 힘들어짐");
	    expect(anemiaCarePrompt.question).toContain("핏기 없는 입술, 잇몸, 눈꺼풀, 손톱 뿌리, 손바닥");
	    expect(anemiaCarePrompt.question).toContain("빠른 심박동수");
	    expect(anemiaCarePrompt.question).toContain("춥게 느껴지는 것");
	    expect(anemiaCarePrompt.question).toContain("슬퍼지거나 우울");
	    expect(anemiaCarePrompt.question).toContain("적혈구 수와 헤모글로빈");
	    expect(anemiaCarePrompt.question).toContain("에너지 수준");
	    expect(anemiaCarePrompt.question).toContain("하루 일과를 조정");
	    expect(anemiaCarePrompt.question).toContain("가족 또는 친구들에게 일을 분배");
	    expect(anemiaCarePrompt.question).toContain("과도한 운동");
	    expect(anemiaCarePrompt.question).toContain("충분한 휴식");
	    expect(anemiaCarePrompt.question).toContain("균형 잡힌 음식");
	    expect(anemiaCarePrompt.question).toContain("하루 6--8잔의 물");
	    expect(anemiaCarePrompt.question).toContain("운전, 아이 돌보기, 외출");
	    expect(anemiaCarePrompt.question).toContain("천천히 일어나");
	    expect(anemiaCarePrompt.question).toContain("충분한 수면");
	    expect(anemiaCarePrompt.question).toContain("짧은 낮잠");
		    expect(buildCervicalCancerCarePromptQuestion(anemiaCarePrompt)).toContain(
		      "출처: 국가암정보센터 빈혈 관리 - https://www.cancer.go.kr/lay1/S1T440C444/contents.do",
		    );
		    const bleedingSymptomsPrompt = cervicalCancerCarePrompts.find(
		      (item) => item.topic === "출혈·멍·코피·혈변 기록 확인",
		    )!;
		    expect(bleedingSymptomsPrompt.sourceId).toBe("nccBleedingSymptoms");
		    expect(bleedingSymptomsPrompt.question).toContain("의식상태의 변화");
		    expect(bleedingSymptomsPrompt.question).toContain("핀으로 찌른 것처럼 작고 붉은 발진");
		    expect(bleedingSymptomsPrompt.question).toContain("멍이 쉽게 생");
		    expect(bleedingSymptomsPrompt.question).toContain("눈의 흰동자에 출혈");
		    expect(bleedingSymptomsPrompt.question).toContain("시력저하");
		    expect(bleedingSymptomsPrompt.question).toContain("코피");
		    expect(bleedingSymptomsPrompt.question).toContain("입안의 혈액성 수포");
		    expect(bleedingSymptomsPrompt.question).toContain("잇몸출혈");
		    expect(bleedingSymptomsPrompt.question).toContain("침에 피");
		    expect(bleedingSymptomsPrompt.question).toContain("가래에 피");
		    expect(bleedingSymptomsPrompt.question).toContain("호흡곤란");
		    expect(bleedingSymptomsPrompt.question).toContain("구토 물에 피");
		    expect(bleedingSymptomsPrompt.question).toContain("혈변");
		    expect(bleedingSymptomsPrompt.question).toContain("검은 색의 묽은 변");
		    expect(bleedingSymptomsPrompt.question).toContain("복부통증");
		    expect(bleedingSymptomsPrompt.question).toContain("복부팽창");
		    expect(bleedingSymptomsPrompt.question).toContain("혈뇨");
		    expect(bleedingSymptomsPrompt.question).toContain("소변을 볼 때 통증");
		    expect(bleedingSymptomsPrompt.question).toContain("빈뇨");
		    expect(bleedingSymptomsPrompt.question).toContain("비정상적인 다량의 질출혈");
		    expect(buildCervicalCancerCarePromptQuestion(bleedingSymptomsPrompt)).toContain(
		      "출처: 국가암정보센터 출혈 증상 - https://www.cancer.go.kr/lay1/S1T445C448/contents.do",
		    );
			    expect(Object.values(buildCervicalCancerCarePromptQuestionDraft(bleedingSymptomsPrompt, "2026-06-15")).join(" ")).not.toMatch(
			      /출혈로 진단하세요|수혈하세요|지혈제를 복용하세요|응고검사를 지시하세요|항암을 중단하세요|방사선을 중단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
			    );
			    const hairLossCarePrompt = cervicalCancerCarePrompts.find(
			      (item) => item.topic === "탈모·두피 보호 기록 확인",
			    )!;
			    expect(hairLossCarePrompt.sourceId).toBe("nccHairLossCare");
			    expect(hairLossCarePrompt.question).toContain("머리를 거칠게 감지");
			    expect(hairLossCarePrompt.question).toContain("두피를 청결하게");
			    expect(hairLossCarePrompt.question).toContain("부드러운 샴푸와 크림린스");
			    expect(hairLossCarePrompt.question).toContain("헤어 드라이기");
			    expect(hairLossCarePrompt.question).toContain("가장 약한 열");
			    expect(hairLossCarePrompt.question).toContain("간격이 넓고 부드러운 빗");
			    expect(hairLossCarePrompt.question).toContain("불안감");
			    expect(hairLossCarePrompt.question).toContain("모자, 스카프");
			    expect(hairLossCarePrompt.question).toContain("선크림");
			    expect(hairLossCarePrompt.question).toContain("가발");
			    expect(hairLossCarePrompt.question).toContain("갑자기 두피 피부가 노출");
			    expect(hairLossCarePrompt.question).toContain("감정변화");
			    expect(buildCervicalCancerCarePromptQuestion(hairLossCarePrompt)).toContain(
			      "출처: 국가암정보센터 탈모 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T451C453/contents.do",
			    );
				    expect(Object.values(buildCervicalCancerCarePromptQuestionDraft(hairLossCarePrompt, "2026-06-15")).join(" ")).not.toMatch(
				      /탈모를 치료하세요|두피약을 바르세요|선크림을 처방하세요|가발을 처방하세요|항암을 중단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
				    );
				    const hiccupConsultPrompt = cervicalCancerCarePrompts.find(
				      (item) => item.topic === "딸꾹질 지속 상담 기준 확인",
				    )!;
				    expect(hiccupConsultPrompt.sourceId).toBe("nccHiccupConsult");
				    expect(hiccupConsultPrompt.question).toContain("하루이상 딸꾹질이 지속");
				    expect(hiccupConsultPrompt.question).toContain("호흡곤란");
				    expect(hiccupConsultPrompt.question).toContain("위장이 커져있거나 팽만");
				    expect(hiccupConsultPrompt.question).toContain("잠을 이룰수 없을 정도");
				    expect(hiccupConsultPrompt.question).toContain("딸꾹질로 인해 고통");
				    expect(hiccupConsultPrompt.question).toContain("지속 시간");
				    expect(hiccupConsultPrompt.question).toContain("진료팀에 알려야 하는지");
				    expect(buildCervicalCancerCarePromptQuestion(hiccupConsultPrompt)).toContain(
				      "출처: 국가암정보센터 딸꾹질 의료진 상담 상황 - https://www.cancer.go.kr/lay1/S1T466C468/contents.do",
				    );
				    expect(Object.values(buildCervicalCancerCarePromptQuestionDraft(hiccupConsultPrompt, "2026-06-15")).join(" ")).not.toMatch(
				      /딸꾹질을 치료하세요|약을 복용하세요|물을 마시세요|숨을 참으세요|종이봉투|눈을 누르세요|설탕을 먹으세요|레몬을 먹으세요|항암을 중단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
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
    const survivorDistressPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "디스트레스 신호·자가평가 상담 준비",
    )!;
    expect(survivorDistressPrompt.sourceId).toBe("nccSurvivorDistressAdaptation");
    expect(survivorDistressPrompt.question).toContain("변화된 삶에 적응하기");
    expect(survivorDistressPrompt.question).toContain("디스트레스");
    expect(survivorDistressPrompt.question).toContain("몸과 마음에 나타나는 모든 괴로움");
    expect(survivorDistressPrompt.question).toContain("20~40%");
    expect(survivorDistressPrompt.question).toContain("10명 중 2명에서 4명");
    expect(survivorDistressPrompt.question).toContain("다스리기 어려운 고통스러운 신체 증상");
    expect(survivorDistressPrompt.question).toContain("외모에 원하지 않은 변화");
    expect(survivorDistressPrompt.question).toContain("역할이나 관계");
    expect(survivorDistressPrompt.question).toContain("돌보아야 하는 아이");
    expect(survivorDistressPrompt.question).toContain("암 관리에 대한 정보가 부족");
    expect(survivorDistressPrompt.question).toContain("걱정, 두려움, 불안");
    expect(survivorDistressPrompt.question).toContain("잠들기 어렵거나 잠에서 쉽게 깹");
    expect(survivorDistressPrompt.question).toContain("사람들과 사이가 안 좋아지거나 혼자");
    expect(survivorDistressPrompt.question).toContain("죽고 싶다는 생각");
    expect(survivorDistressPrompt.question).toContain("자녀보육");
    expect(survivorDistressPrompt.question).toContain("경제적 문제");
    expect(survivorDistressPrompt.question).toContain("우울/슬픔");
    expect(survivorDistressPrompt.question).toContain("재발/죽음에 대한 불안");
    expect(survivorDistressPrompt.question).toContain("식사");
    expect(survivorDistressPrompt.question).toContain("피로");
    expect(survivorDistressPrompt.question).toContain("기억력/집중력");
    expect(survivorDistressPrompt.question).toContain("통증");
    expect(survivorDistressPrompt.question).toContain("관심과 도움이 필요하다는 신호");
    expect(buildCervicalCancerCarePromptQuestion(survivorDistressPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 마음관리 - 변화된 삶에 적응하기 - https://www.cancer.go.kr/lay1/S1T788C790/contents.do",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(survivorDistressPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /디스트레스를 진단하세요|치료하세요|처방하세요|자살하세요|혼자 견디세요|암관리를 중단하세요/,
    );
    const stressCancerCausePrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "스트레스·암 원인 오해 상담 준비",
    )!;
    expect(stressCancerCausePrompt.sourceId).toBe("nccMentalHealthStressCancerCause");
    expect(stressCancerCausePrompt.question).toContain("스트레스를 많이 받아서 암에 걸린 걸까요");
    expect(stressCancerCausePrompt.question).toContain("누군가를 탓하고 싶은 마음");
    expect(stressCancerCausePrompt.question).toContain("스트레스를 불러일으킨 상황이나 사람을 탓");
    expect(stressCancerCausePrompt.question).toContain("직접적인 발암인자");
    expect(stressCancerCausePrompt.question).toContain("암이 생기게 한 원인이라고 할 수는 없습니다");
    expect(stressCancerCausePrompt.question).toContain("면역력을 약화");
    expect(stressCancerCausePrompt.question).toContain("악성세포의 성장");
    expect(stressCancerCausePrompt.question).toContain("스트레스를 피하는 것보다");
    expect(stressCancerCausePrompt.question).toContain("건전한 스트레스 해소법");
    expect(stressCancerCausePrompt.question).toContain("적당한 운동");
    expect(stressCancerCausePrompt.question).toContain("건강한 식생활");
    expect(stressCancerCausePrompt.question).toContain("좋은 대인관계");
    expect(stressCancerCausePrompt.question).toContain("건전한 신앙생활");
    expect(stressCancerCausePrompt.question).toContain("원인 단정이나 책임 전가로 쓰지 않");
    expect(buildCervicalCancerCarePromptQuestion(stressCancerCausePrompt)).toContain(
      "출처: 국가암정보센터 암환자 정신건강 - 스트레스와 암 원인 오해 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22076&condition=&cpage=4&keyword=&mode=view&rn=46&rows=12",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(stressCancerCausePrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /스트레스 때문에 암에 걸렸습니다|스트레스가 직접적인 암 원인입니다|누군가를 탓하세요|운동하세요|식생활을 바꾸세요|신앙생활을 하세요|면역력이 회복됩니다|악성세포 성장이 줄어듭니다|치료하세요|처방하세요|진단하세요/,
    );
    const survivorSlumpPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "치료 후 슬럼프·우울 상담 준비",
    )!;
    expect(survivorSlumpPrompt.sourceId).toBe("nccSurvivorPostTreatmentSlump");
    expect(survivorSlumpPrompt.question).toContain("암치료 후 슬럼프");
    expect(survivorSlumpPrompt.question).toContain("수술과 항암화학요법");
    expect(survivorSlumpPrompt.question).toContain("방사선치료");
    expect(survivorSlumpPrompt.question).toContain("초기 치료가 일단락");
    expect(survivorSlumpPrompt.question).toContain("한참 후에 우울증");
    expect(survivorSlumpPrompt.question).toContain("좌절감");
    expect(survivorSlumpPrompt.question).toContain("고립감");
    expect(survivorSlumpPrompt.question).toContain("허무감");
    expect(survivorSlumpPrompt.question).toContain("혼자서 관리해야 한다는 부담감");
    expect(survivorSlumpPrompt.question).toContain("재발이나 전이에 대한 막연한 두려움");
    expect(survivorSlumpPrompt.question).toContain("우울한 기분이나 의욕 상실");
    expect(survivorSlumpPrompt.question).toContain("한 달 이상");
    expect(survivorSlumpPrompt.question).toContain("정신건강의학과 상담");
    expect(survivorSlumpPrompt.question).toContain("전문가의 도움");
    expect(buildCervicalCancerCarePromptQuestion(survivorSlumpPrompt)).toContain(
      "출처: 국가암정보센터 암환자 정신건강 - 암치료 후 슬럼프 - https://cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22077&condition=&cpage=4&keyword=&rn=45&rows=12",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(survivorSlumpPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(/우울증을 진단하세요|항우울제를 처방하세요|치료하세요|혼자 관리하세요|상담받으세요|괜찮으니 참으세요/);
    const insomniaMedicationConcernPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "불면증·정신과 약 중독 우려 상담 준비",
    )!;
    expect(insomniaMedicationConcernPrompt.sourceId).toBe("nccMentalHealthInsomniaMedicationConcern");
    expect(insomniaMedicationConcernPrompt.question).toContain("암 진단 후 불면증");
    expect(insomniaMedicationConcernPrompt.question).toContain("정신건강의학과에 대한 편견");
    expect(insomniaMedicationConcernPrompt.question).toContain("약을 한 번 먹으면 끊지 못한다는 통념");
    expect(insomniaMedicationConcernPrompt.question).toContain("진료기록");
    expect(insomniaMedicationConcernPrompt.question).toContain("취직이나 보험");
    expect(insomniaMedicationConcernPrompt.question).toContain("적절한 서비스를 받지 못");
    expect(insomniaMedicationConcernPrompt.question).toContain("가벼운 불면");
    expect(insomniaMedicationConcernPrompt.question).toContain("약 없이 상담");
    expect(insomniaMedicationConcernPrompt.question).toContain("수면제");
    expect(insomniaMedicationConcernPrompt.question).toContain("항우울제");
    expect(insomniaMedicationConcernPrompt.question).toContain("항불안제");
    expect(insomniaMedicationConcernPrompt.question).toContain("증상 조절 목적");
    expect(insomniaMedicationConcernPrompt.question).toContain("대부분 단기간에 끊");
    expect(insomniaMedicationConcernPrompt.question).toContain("상담·처방 필요성");
    expect(insomniaMedicationConcernPrompt.question).toContain("중단 계획");
    expect(insomniaMedicationConcernPrompt.question).toContain("협진 질문");
    expect(buildCervicalCancerCarePromptQuestion(insomniaMedicationConcernPrompt)).toContain(
      "출처: 국가암정보센터 암환자 정신건강 - 불면증과 정신과 약 중독 우려 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22078&condition=&cpage=2&keyword=&mode=view&rn=49&rows=12",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(insomniaMedicationConcernPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /수면제를 복용하세요|정신과 약을 복용하세요|약물 치료하세요|중독되지 않습니다|중독됩니다|치료하세요|처방하세요|진단하세요|적극적으로 정신건강의학과를 이용하세요/,
    );
    const psychiatryConsultBenefitsPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "정신건강의학과 진료 도움 확인 준비",
    )!;
    expect(psychiatryConsultBenefitsPrompt.sourceId).toBe("nccMentalHealthPsychiatryConsultBenefits");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("주치의 선생님이 정신건강의학과 진료를 권");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("암환자의 절반 가까이");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("투병 중에 정신건강의학적인 문제");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("불면이나 우울, 불안");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("심하거나 오래 지속");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("정신신경 면역학적 기전");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("면역력");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("심리사회적 서비스");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("필수적인 요소");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("정신적 스트레스");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("삶의 질");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("생존율");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("개인 예후 개선으로 단정하지 않");
    expect(psychiatryConsultBenefitsPrompt.question).toContain("협진 목표");
    expect(buildCervicalCancerCarePromptQuestion(psychiatryConsultBenefitsPrompt)).toContain(
      "출처: 국가암정보센터 암환자 정신건강 - 정신건강의학과 진료 도움 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22079&condition=&cpage=2&keyword=&mode=view&rn=48&rows=12",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(psychiatryConsultBenefitsPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /정신건강의학과 진료를 받으세요|상담받으세요|치료하세요|처방하세요|진단하세요|생존율이 높아집니다|면역력이 회복됩니다|약을 복용하세요|개인 예후가 좋아집니다/,
    );
    const survivorAnxietyPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "불안 신체증상·주의전환 상담 준비",
    )!;
    expect(survivorAnxietyPrompt.sourceId).toBe("nccSurvivorAnxietyManagement");
    expect(survivorAnxietyPrompt.question).toContain("내 안의 불안 다스리기");
    expect(survivorAnxietyPrompt.question).toContain("몸의 경보장치");
    expect(survivorAnxietyPrompt.question).toContain("심장이 빨리 뛰고");
    expect(survivorAnxietyPrompt.question).toContain("가슴이 두근");
    expect(survivorAnxietyPrompt.question).toContain("땀");
    expect(survivorAnxietyPrompt.question).toContain("몸이 떨리");
    expect(survivorAnxietyPrompt.question).toContain("숨이 가쁘거나 답답");
    expect(survivorAnxietyPrompt.question).toContain("어지럽거나 쓰러질 것 같은 느낌");
    expect(survivorAnxietyPrompt.question).toContain("일상생활에 방해");
    expect(survivorAnxietyPrompt.question).toContain("잠들기 어렵");
    expect(survivorAnxietyPrompt.question).toContain("집중하지 못하거나 결정을 내리지 못");
    expect(survivorAnxietyPrompt.question).toContain("솔직하게 털어놓기");
    expect(survivorAnxietyPrompt.question).toContain("주의 전환");
    expect(survivorAnxietyPrompt.question).toContain("복식호흡");
    expect(survivorAnxietyPrompt.question).toContain("심상유도");
    expect(buildCervicalCancerCarePromptQuestion(survivorAnxietyPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 마음관리 - 내 안의 불안 다스리기 - https://www.cancer.go.kr/lay1/S1T788C791/contents.do",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(survivorAnxietyPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /불안을 치료하세요|호흡훈련을 하세요|주의전환을 하세요|약을 복용하세요|진단하세요|처방하세요|치료하세요|괜찮으니 참으세요/,
    );
    const sleepManagementPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "불면·수면일지 상담 준비",
    )!;
    expect(sleepManagementPrompt.sourceId).toBe("nccSurvivorSleepManagement");
    expect(sleepManagementPrompt.question).toContain("암 환자의 약 30~50%");
    expect(sleepManagementPrompt.question).toContain("복용하는 약물");
    expect(sleepManagementPrompt.question).toContain("암 치료 때문에 수면 습관");
    expect(sleepManagementPrompt.question).toContain("수면 효율");
    expect(sleepManagementPrompt.question).toContain("실제로 잠을 자는 시간");
    expect(sleepManagementPrompt.question).toContain("잠자리에 누워 있는 총시간");
    expect(sleepManagementPrompt.question).toContain("일정한 시각에 일어");
    expect(sleepManagementPrompt.question).toContain("저녁 카페인");
    expect(sleepManagementPrompt.question).toContain("잠들기 전 2시간 안");
    expect(sleepManagementPrompt.question).toContain("휴대 전화");
    expect(sleepManagementPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(sleepManagementPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 수면관리 - https://www.cancer.go.kr/lay1/S1T748C794/contents.do",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(sleepManagementPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /수면제를 복용하세요|약물 치료하세요|인지 행동 치료를 받으세요|치료하세요|처방하세요|진단하세요/,
    );
    const exerciseManagementPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "운동강도·근력운동 상담 준비",
    )!;
    expect(exerciseManagementPrompt.sourceId).toBe("nccSurvivorExerciseManagement");
    expect(exerciseManagementPrompt.question).toContain("규칙적인 운동참여");
    expect(exerciseManagementPrompt.question).toContain("체력증진");
    expect(exerciseManagementPrompt.question).toContain("피로도 감소");
    expect(exerciseManagementPrompt.question).toContain("삶의 질");
    expect(exerciseManagementPrompt.question).toContain("주당 150분 이상의 중강도 신체활동");
    expect(exerciseManagementPrompt.question).toContain("주 2회 이상의 근력운동");
    expect(exerciseManagementPrompt.question).toContain("숨이 약간 차지만");
    expect(exerciseManagementPrompt.question).toContain("옆 사람과 대화가 가능한 정도");
    expect(exerciseManagementPrompt.question).toContain("편안한 운동복");
    expect(exerciseManagementPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(exerciseManagementPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 운동 - https://www.cancer.go.kr/lay1/S1T748C795/contents.do",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(exerciseManagementPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /운동하세요|근력운동을 하세요|유산소 운동을 하세요|치료하세요|처방하세요|진단하세요|재발을 막습니다|사망률을 낮춥니다/,
    );
    const survivorNutritionPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "치료 후 영양·식생활 상담 준비",
    )!;
    expect(survivorNutritionPrompt.sourceId).toBe("nccSurvivorNutritionLifestyle");
    expect(survivorNutritionPrompt.question).toContain("적정체중");
    expect(survivorNutritionPrompt.question).toContain("균형잡힌 식사");
    expect(survivorNutritionPrompt.question).toContain("다양한 색의 과일, 채소, 전곡류");
    expect(survivorNutritionPrompt.question).toContain("육가공품");
    expect(survivorNutritionPrompt.question).toContain("탄 음식");
    expect(survivorNutritionPrompt.question).toContain("짠 음식");
    expect(survivorNutritionPrompt.question).toContain("하루 한 두 잔의 술");
    expect(survivorNutritionPrompt.question).toContain("건강보조식품, 민간요법");
    expect(survivorNutritionPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(survivorNutritionPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 영양·식생활 - https://www.cancer.go.kr/lay1/S1T748C796/contents.do",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(survivorNutritionPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /식단을 처방하세요|육가공품을 절대 먹지 마세요|술을 마시면 안 됩니다|보조식품을 복용하세요|재발을 막습니다|치료하세요|처방하세요|진단하세요/,
    );
    const survivorHealthyManagementNutritionPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "치료 후 고용량 영양식품·우유 질문 준비",
    )!;
    expect(survivorHealthyManagementNutritionPrompt.sourceId).toBe(
      "nccSurvivorHealthyManagementNutrition",
    );
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("암생존자 예방접종 및 슬기로운 건강관리");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("너무 고용량");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("뭔가 좋다는 영양 식품");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("안 드시는 것이 가장 안전");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("기름기가 적은 고단백 식품");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("탄수화물도");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("우유 드셔도 되나요");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("드셔도 됩니다");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("특정한 음식을");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("고용량으로 그것만 꾸준히");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("너무 달고 기름진 음식");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("탄 음식");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("가공육 가공식품");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("불필요한 영양제 민간요법");
    expect(survivorHealthyManagementNutritionPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(survivorHealthyManagementNutritionPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리 - https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(
      Object.values(
        buildCervicalCancerCarePromptQuestionDraft(
          survivorHealthyManagementNutritionPrompt,
          "2026-06-15",
        ),
      ).join(" "),
    ).not.toMatch(
      /우유를 드세요|고단백 식품을 드세요|영양제를 끊으세요|민간요법을 하지 마세요|재발을 막습니다|치료하세요|처방하세요|진단하세요/,
    );
    const survivorSecondCancerScreeningPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "치료 후 이차암 검진 구분 준비",
    )!;
    expect(survivorSecondCancerScreeningPrompt.sourceId).toBe(
      "nccSurvivorHealthyManagementNutrition",
    );
    expect(survivorSecondCancerScreeningPrompt.question).toContain("이차암은 원발암");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("새로운 부위");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("암 생존자에게");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("다른 암을 겪지 않은 사람보다");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("10% 에서 20%정도");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("자궁경부암");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("흡연");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("폐암 검진");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("저선량 흉부 CT");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("치료받은 병원");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("다른 부위");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("국가 검진");
    expect(survivorSecondCancerScreeningPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(survivorSecondCancerScreeningPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리 - https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(
      Object.values(
        buildCervicalCancerCarePromptQuestionDraft(
          survivorSecondCancerScreeningPrompt,
          "2026-06-15",
        ),
      ).join(" "),
    ).not.toMatch(
      /폐암 검진을 받으세요|국가암검진을 받으세요|금연하세요|이차암을 예방합니다|재발을 막습니다|치료하세요|처방하세요|진단하세요/,
    );
    const survivorWorkPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "직업복귀·근무조정 상담 준비",
    )!;
    expect(survivorWorkPrompt.sourceId).toBe("nccSurvivorWorkReturn");
    expect(survivorWorkPrompt.question).toContain("직업복귀");
    expect(survivorWorkPrompt.question).toContain("긍정적 영향");
    expect(survivorWorkPrompt.question).toContain("경제 상태");
    expect(survivorWorkPrompt.question).toContain("삶의 질");
    expect(survivorWorkPrompt.question).toContain("반드시 직장을 그만두어야 할 필요는 없습니다");
    expect(survivorWorkPrompt.question).toContain("치료계획");
    expect(survivorWorkPrompt.question).toContain("몸 상태");
    expect(survivorWorkPrompt.question).toContain("직업의 종류");
    expect(survivorWorkPrompt.question).toContain("의료진과 상의");
    expect(survivorWorkPrompt.question).toContain("직장 복귀시기");
    expect(survivorWorkPrompt.question).toContain("치료방법");
    expect(survivorWorkPrompt.question).toContain("예상 치료기간");
    expect(survivorWorkPrompt.question).toContain("부작용");
    expect(survivorWorkPrompt.question).toContain("스트레스 반응");
    expect(survivorWorkPrompt.question).toContain("근무시간 조정");
    expect(survivorWorkPrompt.question).toContain("유연근무제");
    expect(survivorWorkPrompt.question).toContain("재택근무");
    expect(survivorWorkPrompt.question).toContain("증빙서류");
    expect(survivorWorkPrompt.question).toContain("회식");
    expect(survivorWorkPrompt.question).toContain("음주");
    expect(survivorWorkPrompt.question).toContain("자극적인 음식");
    expect(buildCervicalCancerCarePromptQuestion(survivorWorkPrompt)).toContain(
      "출처: 국가암정보센터 암생존자 직업복귀 - https://www.cancer.go.kr/lay1/S1T748C798/contents.do",
    );
    expect(
      Object.values(buildCervicalCancerCarePromptQuestionDraft(survivorWorkPrompt, "2026-06-15")).join(" "),
    ).not.toMatch(
      /복귀하세요|일하세요|퇴사하지 마세요|그만두세요|치료하세요|처방하세요|진단하세요|술을 마셔도 됩니다|매운 음식을 먹어도 됩니다/,
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
    const dyspneaConsultPrompt = cervicalCancerCarePrompts.find(
      (item) => item.topic === "호흡곤란·흉통 상담 기준 확인",
    )!;
    expect(dyspneaConsultPrompt.sourceId).toBe("nccDyspneaConsult");
    expect(dyspneaConsultPrompt.question).toContain("기침이나 구토");
    expect(dyspneaConsultPrompt.question).toContain("가래의 양과 양상 및 냄새");
    expect(dyspneaConsultPrompt.question).toContain("호흡곤란이나 흉통");
    expect(dyspneaConsultPrompt.question).toContain("노랗거나 녹색이며 걸쭉");
    expect(dyspneaConsultPrompt.question).toContain("혈액이 섞인 가래");
    expect(dyspneaConsultPrompt.question).toContain("피부가 창백하거나 파랗거나");
    expect(dyspneaConsultPrompt.question).toContain("열");
    expect(dyspneaConsultPrompt.question).toContain("콧구멍이 넓게 벌어질 때");
    expect(dyspneaConsultPrompt.question).toContain("그르렁소리");
    expect(dyspneaConsultPrompt.question).toContain("진료팀");
    expect(buildCervicalCancerCarePromptQuestion(dyspneaConsultPrompt)).toContain(
      "출처: 국가암정보센터 호흡곤란 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T411C415/contents.do",
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
    expect(formatCervicalCancerCareSourceEvidence("nccSurvivorSleepManagement")).toContain(
      "국가암정보센터 암생존자 수면관리 - https://www.cancer.go.kr/lay1/S1T748C794/contents.do",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccSurvivorDistressAdaptation")).toContain(
      "국가암정보센터 암생존자 마음관리 - 변화된 삶에 적응하기 - https://www.cancer.go.kr/lay1/S1T788C790/contents.do",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccMentalHealthStressCancerCause")).toContain(
      "국가암정보센터 암환자 정신건강 - 스트레스와 암 원인 오해 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22076&condition=&cpage=4&keyword=&mode=view&rn=46&rows=12",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccSurvivorPostTreatmentSlump")).toContain(
      "국가암정보센터 암환자 정신건강 - 암치료 후 슬럼프 - https://cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22077&condition=&cpage=4&keyword=&rn=45&rows=12",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccMentalHealthInsomniaMedicationConcern")).toContain(
      "국가암정보센터 암환자 정신건강 - 불면증과 정신과 약 중독 우려 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22078&condition=&cpage=2&keyword=&mode=view&rn=49&rows=12",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccMentalHealthPsychiatryConsultBenefits")).toContain(
      "국가암정보센터 암환자 정신건강 - 정신건강의학과 진료 도움 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22079&condition=&cpage=2&keyword=&mode=view&rn=48&rows=12",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccSurvivorAnxietyManagement")).toContain(
      "국가암정보센터 암생존자 마음관리 - 내 안의 불안 다스리기 - https://www.cancer.go.kr/lay1/S1T788C791/contents.do",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccSurvivorExerciseManagement")).toContain(
      "국가암정보센터 암생존자 운동 - https://www.cancer.go.kr/lay1/S1T748C795/contents.do",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccSurvivorNutritionLifestyle")).toContain(
      "국가암정보센터 암생존자 영양·식생활 - https://www.cancer.go.kr/lay1/S1T748C796/contents.do",
    );
    expect(formatCervicalCancerCareSourceEvidence("nccSurvivorWorkReturn")).toContain(
      "국가암정보센터 암생존자 직업복귀 - https://www.cancer.go.kr/lay1/S1T748C798/contents.do",
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
    const appetiteLossSnackSentence =
      "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다.";
    const appetiteLossFluidTimingSentence =
      "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다. 만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다.";
    const mouthPainSoftFoodSentence =
      "부드럽고 촉촉한 음식을 준비합니다. 씹고 삼키기 쉬운 음식을 먹습니다.";
    const mouthPainIrritatingFoodSentence =
      "입안을 자극하는 음식이나 음료는 피하도록 합니다.";
    const mouthPainTemperatureSentence =
      "뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다. 얼음조각을 먹는 것도 도움이 됩니다.";
    const mucositisCleanMoistSentence = "구강을 깨끗하고 촉촉하게 유지하는 방법";
    const mucositisDentureSentence =
      "틀니는 발포성 틀니용 세정제나 1.5%과산화수소 용액에 6-7분 동안 담가둡니다.";
    const mucositisRinseCandidateSentence =
      "구강함수액은 생리식염수 500cc 와 베이킹 소다 10g을 섞은 물, 6%이하의 알코올 이 섞인 구강청정제, 1.5%과산화수소 수용액 또는 물과 과산화수소의 비가 3:1 이 되도록 만들어 사용합니다.";
    const dryMouthCauseSentence =
      "머리와 목 주위에 대한 항암화학요법 이나 방사선치료 는 침분비를 감소시켜 입안을 마르게 할 수 있습니다.";
    const dryMouthChewSwallowSentence =
      "입안이 건조해 지면, 음식물을 씹고 삼키는 것이 더욱 어려워지고 음식의 맛도 변할 수 있습니다.";
    const dryMouthWaterSentence =
      "가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다.";
    const dryMouthSweetSourCautionSentence =
      "아주 달거나 신음식을 먹으면 침분비가 많아집니다. 단, 입안이 헐거나 목구멍이 아플 경우에는 피하도록 합니다.";
    const dryMouthSipStrawSentence =
      "식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다.";
    const tasteChangeCauseSentence =
      "암이나 항암치료, 혹은 치과적인 문제 때문에 음식의 맛이나 냄새에 민감해 질 수 있습니다.";
    const tasteChangeProteinSentence =
      "특히, 고기나 생선 등의 고단백식품들에 대해서는 쓴맛이나 금속성 맛을 느끼게 되고 음식의 맛이 없어질 수 있습니다.";
    const tasteChangeAlternativeSentence =
      "만약 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품을 이용합니다.";
    const tasteChangeSeasoningSentence =
      "고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다.";
    const tasteChangeMetallicSentence =
      "신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있으므로 오렌지나 레몬같이 시큼한 식품을 사용합니다. 그러나 입과 목에 통증 이 있다면, 이런 식품들이 염증을 자극하거나 불편하게 하므로 주의합니다.";
    const tasteChangeDentalSentence =
      "음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고, 입안을 자주 헹구도록 합니다.";
    const diarrheaCauseSentence =
      "설사는 항암치료, 복부와 골반 부위의 방사선치료, 감염, 음식에 대한 민감성, 불안 및 스트레스 등에 의해 발생할 수 있습니다.";
    const diarrheaAbsorptionSentence =
      "설사가 있을 경우에는 음식이 장을 빨리 통과하기 때문에 비타민, 무기질, 수분이 충분히 흡수되지 못합니다.";
    const diarrheaClearLiquidSentence =
      "갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다.";
    const diarrheaFluidElectrolyteSentence =
      "수분을 충분히 섭취하여 설사로 손실된 부분을 보충합니다. 염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다.";
    const diarrheaLowFiberSentence =
      "섬유소가 적은 식품을 먹습니다. (예) 흰밥, 흰죽, 미음, 흰빵, 삶거나 으깬 감자, 맑은 고깃국, 생선, 닭고기, 두부, 계란 등";
    const diarrheaDairySentence =
      "우유 및 유제품을 먹을 때에는 주의합니다. 이는 우유에 들어있는 유당이 설사를 악화시킬 수 있기 때문입니다. 그러나 일반적으로 적은 양의 우유나 유제품은 소화시킬 수 있습니다.";
    const diarrheaClinicianSentence =
      "설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다.";
    const constipationCauseSentence =
      "변비는 수분 및 음식섭취가 불충분하거나 오랫동안 누워있는 경우에 생길 수 있습니다. 그리고 항암제 나 진통제 등의 부작용 으로 생기기도 합니다.";
    const constipationFluidSentence =
      "수분을 충분히 섭취합니다.(하루에 8~10컵 이상) 이는 변을 부드럽게 합니다. 특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다.";
    const constipationFiberSentence =
      "도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취합니다.";
    const constipationMovementSentence =
      "가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다. 누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다.";
    const constipationClinicianSentence =
      "계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 합니다.";
    const weightLossContextSentence =
      "암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있습니다. 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨립니다.";
    const weightLossCalorieProteinSentence =
      "그러므로 체중감소를 예방하기 위해서 열량과 단백질 등을 충분히 섭취해야 합니다.";
    const weightGainCauseSentence =
      "치료를 받는 동안 체중이 증가하는 사람들도 있습니다. 체중증가는 복용하고 있는 약물에 의한 체내 수분 보유나 식욕의 이상 증가 등으로 생길 수 있습니다.";
    const weightGainConsultSentence =
      "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다.";
    const neuropathyHotSafetySentence =
      "뜨거운 것은 화상을 입을 위험이 있으므로, 주의하여 사용하셔야 합니다.";
    const neuropathySymptomSentence =
      "손가락, 손, 발가락, 발의 감각이 떨어질 수 있습니다. 손끝, 발끝이 저리고 무감각해지고 약해지고 통증 까지 수반할 수 있습니다.";
	    const skinObservationSentence =
	      "피부와 눈의 공막에 노란빛, 진한 오렌지색의 소변, 희거나 회색빛의 소변, 파랗거나 보랏빛 피부 또는 타박상, 호흡곤란, 피부의 발적 이나 붉게 된 것, 부종 이 있으면서 변색된 것, 가려움증을 관찰합니다.";
	    const anemiaTreatmentEffectSentence =
	      "받고 있는 항암 치료가 적혈구에 영향을 미칠 수 있는지 확인해 둡니다.";
	    const anemiaSymptomDiarySentence =
	      "빈혈 관련 증상을 숙지하고 일지에 정리하여 진료 시 담당 의사에게 모든 관련증상을 이야기합니다.";
	    const anemiaActivityCautionSentence =
	      "어지럼증이 있을 시에는 운전, 아이 돌보기, 외출과 같은 활동은 주의를 요합니다.";
	    const bleedingSkinSentence =
	      "핀으로 찌른 것처럼 작고 붉은 발진 이 피부에 퍼져 있으며 팔과 다리에 주로 나타납니다.";
	    const bleedingMouthNoseSentence =
	      "코피, 입안의 혈액성 수포, 잇몸출혈, 구강 궤양 의 출혈이 있을 수 있고 침에 피가 섞여 나오기도 합니다.";
	    const bleedingDigestiveSentence =
	      "구토 물에 피가 섞여 나오거나 혈변, 검은 색의 묽은 변을 볼 수 있습니다.";
		    const bleedingUrinaryReproductiveSentence =
		      "혈뇨, 소변을 볼 때 통증이나 타는 듯한 느낌, 빈뇨(소변을 자주 봄), 비정상적인 다량의 질출혈(또는 폐경기 이후의 질출혈) 등이 있습니다.";
		    const hairLossGentleCareSentence =
		      "머리를 거칠게 감지 않도록 하며 말릴 때는 살살 두들겨서 말립니다.";
		    const hairLossHeatCombSentence =
		      "헤어 드라이기와 같은 열기구의 사용은 되도록 줄입니다. 꼭 필요한 경우에는 가장 약한 열로 하도록 합니다.";
		    const hairLossEmotionSentence =
		      "탈모로 인한 불안감을 의료진 및 가족들에게 표현하고 탈모를 경험하는 다른 환자들과의 대화를 통하여 감정을 나누는 것도 좋습니다.";
			    const hairLossScalpProtectionSentence =
			      "외출 시에는 모자, 스카프 등을 사용하며, 완전 탈모 시에는 두피를 보호하기 위하여 선크림(햇빛 차단제)을 사용합니다.";
			    const hiccupPersistentSentence = "하루이상 딸꾹질이 지속될 경우";
			    const hiccupDyspneaSentence = "호흡곤란이 일어날 경우";
			    const hiccupBloatingSentence = "위장이 커져있거나 팽만되어 있는 것으로 보이는 경우";
			    const hiccupSleepSentence = "잠을 이룰수 없을 정도로 딸꾹질이 나올 때";
			    const hiccupPainSentence = "딸꾹질로 인해 고통을 느낄 때";
			    const dyspneaSputumObservationSentence =
			      "기침이나 구토 가 있으면 가래의 양과 양상 및 냄새를 관찰합니다. (투명하거나 하얗고 거품이 있는 것이 정상입니다. )";
			    const dyspneaConsultHeaderSentence = "이런 경우에는 의사와 상의하십시오.";
			    const dyspneaChestPainSentence = "호흡곤란이나 흉통이 있을 때";
			    const coloredSputumSentence = "노랗거나 녹색이며 걸쭉하고 혈액이 섞인 가래가 있을 때";
			    const paleBlueClammySkinSentence =
			      "피부가 창백하거나 파랗거나 혹은 차가우며 축축할 때";
			    const feverSentence = "열이 있을 때";
			    const nostrilFlaringSentence = "호흡하는 동안 콧구멍이 넓게 벌어질 때";
			    const noisyBreathingSentence = "호흡시 그르렁소리가 날 때";
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
    const appetiteLossDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "식욕부진 간식·수분 타이밍 메모",
    );
    const mouthPainDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "입과 목 통증 부드러운 식사 메모",
    );
    const mucositisCareGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "구내염 구강청결·틀니·헹굼 메모",
    );
    const dryMouthDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "입안 건조 수분·촉촉한 식사 메모",
    );
    const tasteChangeDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "입맛 변화 단백질·향 메모",
    );
    const diarrheaDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "설사 수분·전해질·자극음식 메모",
    );
    const constipationDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "변비 수분·섬유소·활동 메모",
    );
    const weightChangeDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "체중변화 열량·단백질·원인 메모",
    );
    const immuneLowDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "면역저하 익힌음식·위생·보관 메모",
    );
    const fatigueDepressionDietGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "피로감·우울 영양·휴식·도움요청 메모",
    );
    const infectionConsultGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "발열·오한·감염 상담 메모",
    );
    const neuropathyCareGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "손발저림·감각·화상예방 메모",
    );
	    const skinChangeCareGuide = cervicalCancerCareRecoveryGuides.find(
	      (item) => item.label === "피부변화·손발홍반·손발톱 메모",
	    );
	    const anemiaCareGuide = cervicalCancerCareRecoveryGuides.find(
	      (item) => item.label === "빈혈·혈색소·어지럼 메모",
	    );
		    const bleedingSymptomsGuide = cervicalCancerCareRecoveryGuides.find(
		      (item) => item.label === "출혈·멍·코피·혈변 메모",
		    );
			    const hairLossCareGuide = cervicalCancerCareRecoveryGuides.find(
			      (item) => item.label === "탈모·두피 보호·가발 준비 메모",
			    );
			    const hiccupConsultGuide = cervicalCancerCareRecoveryGuides.find(
			      (item) => item.label === "딸꾹질 지속·호흡곤란 상담 메모",
			    );
				    const childFamilyCommunicationGuide = cervicalCancerCareRecoveryGuides.find(
	      (item) => item.label === "자녀·가족 설명 메모",
	    );
    const psychologicalStabilityGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "정서 안정·전문상담 메모",
    );
    const survivorDistressGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암생존자 디스트레스 자가평가 메모",
    );
    const stressCancerCauseGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "스트레스 원인 오해·관리 메모",
    );
    const survivorSlumpGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암치료 후 슬럼프·우울상담 메모",
    );
    const insomniaMedicationConcernGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "불면증·정신과 약 중독 우려 메모",
    );
    const psychiatryConsultBenefitsGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "정신건강의학과 진료 도움 확인 메모",
    );
    const sleepManagementGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "불면·수면효율·습관 메모",
    );
    const survivorAnxietyGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암생존자 불안신호·주의전환 메모",
    );
    const exerciseManagementGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암생존자 운동강도·근력운동 메모",
    );
    const survivorNutritionGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암생존자 균형식·가공육·보조식품 메모",
    );
    const survivorHealthyManagementNutritionGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암생존자 고용량 영양식품·우유 질문 메모",
    );
    const survivorSecondCancerScreeningGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암생존자 이차암 검진·흡연력 메모",
    );
    const survivorWorkGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "암생존자 직업복귀·근무조정 메모",
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
    const dyspneaConsultGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "호흡곤란·흉통·가래 상담 메모",
    );
    const coughCauseGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "기침·가래·수면방해 메모",
    );

				    expect(cervicalCancerCareRecoveryGuides).toHaveLength(50);
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
    expect(appetiteLossDietGuide).toMatchObject({
      label: "식욕부진 간식·수분 타이밍 메모",
      sourceId: "nccAppetiteLossDiet",
    });
    expect(appetiteLossDietGuide?.detail).toContain("암 자체와 항암치료");
    expect(appetiteLossDietGuide?.detail).toContain("공포나 우울감");
    expect(appetiteLossDietGuide?.detail).toContain(appetiteLossSnackSentence);
    expect(appetiteLossDietGuide?.detail).toContain("먹고 싶을 때, 먹을 수 있을 때");
    expect(appetiteLossDietGuide?.detail).toContain("몸 상태가 좋을 때");
    expect(appetiteLossDietGuide?.detail).toContain("평소에 좋아하던 음식");
    expect(appetiteLossDietGuide?.detail).toContain("메뉴를 다양하게");
    expect(appetiteLossDietGuide?.detail).toContain("충분한 휴식을 취한 아침");
    expect(appetiteLossDietGuide?.detail).toContain("죽, 미음, 쥬스, 스프, 우유 및 유제품");
    expect(appetiteLossDietGuide?.detail).toContain(appetiteLossFluidTimingSentence);
    expect(appetiteLossDietGuide?.detail).toContain("식사하는 시간, 장소, 분위기");
    expect(appetiteLossDietGuide?.detail).toContain("가벼운 산책");
    expect(appetiteLossDietGuide?.detail).toContain("식사전후에 입안을 청결");
    expect(appetiteLossDietGuide?.detail).toContain("특수영양 보충음료");
    expect(appetiteLossDietGuide?.detail).toContain("억지로 먹으라고 지나치게 강요하지");
    expect(formatCervicalCancerCareItemEvidence(appetiteLossDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(appetiteLossDietGuide!).body).toContain(
      appetiteLossFluidTimingSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(appetiteLossDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 식욕부진",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(appetiteLossDietGuide!)).join(" ")).not.toMatch(
      /식욕촉진제를 복용하세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(mouthPainDietGuide).toMatchObject({
      label: "입과 목 통증 부드러운 식사 메모",
      sourceId: "nccMouthPainDiet",
    });
    expect(mouthPainDietGuide?.detail).toContain("방사선요법, 화학요법 또는 감염");
    expect(mouthPainDietGuide?.detail).toContain("입안 통증, 잇몸의 손상, 인후염 또는 식도염");
    expect(mouthPainDietGuide?.detail).toContain("항암치료의 부작용 때문인지 치과질환인지");
    expect(mouthPainDietGuide?.detail).toContain(mouthPainSoftFoodSentence);
    expect(mouthPainDietGuide?.detail).toContain("죽류");
    expect(mouthPainDietGuide?.detail).toContain("흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽");
    expect(mouthPainDietGuide?.detail).toContain("쌀미음, 조미음, 잣미음, 깨미음, 녹두미음");
    expect(mouthPainDietGuide?.detail).toContain("고기는 부드럽게 조리");
    expect(mouthPainDietGuide?.detail).toContain("생선은 곱게 다지거나 갈아서");
    expect(mouthPainDietGuide?.detail).toContain("부드러운 야채를 푹 익히거나 데쳐서");
    expect(mouthPainDietGuide?.detail).toContain("바나나, 배, 수박, 과일통조림");
    expect(mouthPainDietGuide?.detail).toContain(mouthPainIrritatingFoodSentence);
    expect(mouthPainDietGuide?.detail).toContain("오렌지, 포도, 레몬, 토마토주스");
    expect(mouthPainDietGuide?.detail).toContain("향신료를 많이 사용하거나 소금에 절인 음식");
    expect(mouthPainDietGuide?.detail).toContain("토스트, 크래커 또는 말린 음식");
    expect(mouthPainDietGuide?.detail).toContain("부드럽고 연해질 때까지");
    expect(mouthPainDietGuide?.detail).toContain("작은 크기로 자릅니다");
    expect(mouthPainDietGuide?.detail).toContain("믹서로 곱게");
    expect(mouthPainDietGuide?.detail).toContain("빨대");
    expect(mouthPainDietGuide?.detail).toContain("작은 스푼");
    expect(mouthPainDietGuide?.detail).toContain(mouthPainTemperatureSentence);
    expect(mouthPainDietGuide?.detail).toContain("옥살로플라틴");
    expect(mouthPainDietGuide?.detail).toContain("온도변화");
    expect(mouthPainDietGuide?.detail).toContain("차가운 음식은 피");
    expect(mouthPainDietGuide?.detail).toContain("따뜻한 육수");
    expect(mouthPainDietGuide?.detail).toContain("소금을 약간");
    expect(mouthPainDietGuide?.detail).toContain("치아와 잇몸");
    expect(mouthPainDietGuide?.detail).toContain("입안은 깨끗이 헹구어");
    expect(formatCervicalCancerCareItemEvidence(mouthPainDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(mouthPainDietGuide!).body).toContain(
      mouthPainTemperatureSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(mouthPainDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(mouthPainDietGuide!)).join(" ")).not.toMatch(
      /진통제를 복용하세요|구강치료하세요|치과치료를 받으세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(mucositisCareGuide).toMatchObject({
      label: "구내염 구강청결·틀니·헹굼 메모",
      sourceId: "nccMucositisCare",
    });
    expect(mucositisCareGuide?.detail).toContain("입안의 염증(구내염)");
    expect(mucositisCareGuide?.detail).toContain(mucositisCleanMoistSentence);
    expect(mucositisCareGuide?.detail).toContain("칫솔모가 부드러운");
    expect(mucositisCareGuide?.detail).toContain(mucositisDentureSentence);
    expect(mucositisCareGuide?.detail).toContain("잘 헹구어");
    expect(mucositisCareGuide?.detail).toContain("치실 또는 양치질 후");
    expect(mucositisCareGuide?.detail).toContain(mucositisRinseCandidateSentence);
    expect(mucositisCareGuide?.detail).toContain("항암화학요법 시작 전");
    expect(mucositisCareGuide?.detail).toContain("잇몸 상태");
    expect(mucositisCareGuide?.detail).toContain("의료진과 미리 상의");
    expect(mucositisCareGuide?.detail).toContain("구강을 자주 헹궈");
    expect(mucositisCareGuide?.detail).toContain("알코올 성분 구강세정제");
    expect(mucositisCareGuide?.detail).toContain("의치를 꼭 필요한 경우만 착용");
    expect(mucositisCareGuide?.detail).toContain("입안 통증");
    expect(mucositisCareGuide?.detail).toContain("붉어짐");
    expect(mucositisCareGuide?.detail).toContain("궤양");
    expect(mucositisCareGuide?.detail).toContain("출혈");
    expect(mucositisCareGuide?.detail).toContain("삼킴 어려움");
    expect(mucositisCareGuide?.detail).toContain("24시간 이상 먹거나 마실 수 없는 경우");
    expect(formatCervicalCancerCareItemEvidence(mucositisCareGuide!)).toContain(
      "국가암정보센터 입안의 염증(구내염) 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(mucositisCareGuide!).body).toContain(
      "입안 통증",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(mucositisCareGuide!)).toContain(
      "국가암정보센터 입안의 염증(구내염) 도움이 되는 방법",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(mucositisCareGuide!)).join(" ")).not.toMatch(
      /항생제를 복용하세요|마취제를 사용하세요|진통제를 사용하세요|구강함수액을 사용하세요|과산화수소를 사용하세요|구강치료하세요|치과치료를 받으세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|항암을 중단하세요|방사선을 중단하세요|암을 낫게|특효/,
    );
    expect(dryMouthDietGuide).toMatchObject({
      label: "입안 건조 수분·촉촉한 식사 메모",
      sourceId: "nccDryMouthDiet",
    });
    expect(dryMouthDietGuide?.detail).toContain(dryMouthCauseSentence);
    expect(dryMouthDietGuide?.detail).toContain(dryMouthChewSwallowSentence);
    expect(dryMouthDietGuide?.detail).toContain(dryMouthWaterSentence);
    expect(dryMouthDietGuide?.detail).toContain("부드럽고 곱게 간 식품");
    expect(dryMouthDietGuide?.detail).toContain("육수나 국물 등에 담그거나 적셔서");
    expect(dryMouthDietGuide?.detail).toContain("소스나 드레싱");
    expect(dryMouthDietGuide?.detail).toContain(dryMouthSipStrawSentence);
    expect(dryMouthDietGuide?.detail).toContain("딱딱한 사탕을 빨거나 껌을 씹는");
    expect(dryMouthDietGuide?.detail).toContain("입술 연고");
    expect(dryMouthDietGuide?.detail).toContain(dryMouthSweetSourCautionSentence);
    expect(dryMouthDietGuide?.detail).toContain("의사선생님이나 치과선생님과 상의");
    expect(formatCervicalCancerCareItemEvidence(dryMouthDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증 - https://www.cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(dryMouthDietGuide!).body).toContain(
      dryMouthSipStrawSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(dryMouthDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 입안의 건조증",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(dryMouthDietGuide!)).join(" ")).not.toMatch(
      /침분비제를 복용하세요|구강치료하세요|치과치료를 받으세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(tasteChangeDietGuide).toMatchObject({
      label: "입맛 변화 단백질·향 메모",
      sourceId: "nccTasteChangeDiet",
    });
    expect(tasteChangeDietGuide?.detail).toContain(tasteChangeCauseSentence);
    expect(tasteChangeDietGuide?.detail).toContain(tasteChangeProteinSentence);
    expect(tasteChangeDietGuide?.detail).toContain("치료가 끝나면 사라질");
    expect(tasteChangeDietGuide?.detail).toContain("보기가 좋고 냄새도 좋은 식품");
    expect(tasteChangeDietGuide?.detail).toContain(tasteChangeAlternativeSentence);
    expect(tasteChangeDietGuide?.detail).toContain(tasteChangeSeasoningSentence);
    expect(tasteChangeDietGuide?.detail).toContain(tasteChangeMetallicSentence);
    expect(tasteChangeDietGuide?.detail).toContain(tasteChangeDentalSentence);
    expect(formatCervicalCancerCareItemEvidence(tasteChangeDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(tasteChangeDietGuide!).body).toContain(
      tasteChangeMetallicSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(tasteChangeDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 입맛의 변화",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(tasteChangeDietGuide!)).join(" ")).not.toMatch(
      /와인을 마시세요|레몬을 먹어 치료|치과치료를 받으세요|입맛약을 복용하세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(diarrheaDietGuide).toMatchObject({
      label: "설사 수분·전해질·자극음식 메모",
      sourceId: "nccDiarrheaDiet",
    });
    expect(diarrheaDietGuide?.detail).toContain(diarrheaCauseSentence);
    expect(diarrheaDietGuide?.detail).toContain(diarrheaAbsorptionSentence);
    expect(diarrheaDietGuide?.detail).toContain("탈수의 원인이 될 수");
    expect(diarrheaDietGuide?.detail).toContain(
      "맑은 유동식은 적절한 영양소를 공급할 수 없으므로 1~2일 이상 먹이지 않도록",
    );
    expect(diarrheaDietGuide?.detail).toContain(diarrheaClearLiquidSentence);
    expect(diarrheaDietGuide?.detail).toContain(diarrheaFluidElectrolyteSentence);
    expect(diarrheaDietGuide?.detail).toContain("육수나 스포츠 음료");
    expect(diarrheaDietGuide?.detail).toContain("바나나, 복숭아, 토마토, 으깬 감자");
    expect(diarrheaDietGuide?.detail).toContain("조금씩 자주");
    expect(diarrheaDietGuide?.detail).toContain(diarrheaLowFiberSentence);
    expect(diarrheaDietGuide?.detail).toContain(
      "너무 뜨겁거나 찬 음식은 피하고 실온의 음식을",
    );
    expect(diarrheaDietGuide?.detail).toContain("생야채, 생과일의 껍질, 씨");
    expect(diarrheaDietGuide?.detail).toContain("브로콜리, 옥수수, 말린 콩");
    expect(diarrheaDietGuide?.detail).toContain("카페인과 알코올");
    expect(diarrheaDietGuide?.detail).toContain("커피, 홍차, 초콜릿, 탄산음료");
    expect(diarrheaDietGuide?.detail).toContain("콩, 양배추, 탄산음료, 껌");
    expect(diarrheaDietGuide?.detail).toContain(diarrheaDairySentence);
    expect(diarrheaDietGuide?.detail).toContain(diarrheaClinicianSentence);
    expect(formatCervicalCancerCareItemEvidence(diarrheaDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(diarrheaDietGuide!).body).toContain(
      diarrheaFluidElectrolyteSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(diarrheaDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 설사",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(diarrheaDietGuide!)).join(" ")).not.toMatch(
      /지사제를 복용하세요|설사약을 복용하세요|탈수를 치료하세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(constipationDietGuide).toMatchObject({
      label: "변비 수분·섬유소·활동 메모",
      sourceId: "nccConstipationDiet",
    });
    expect(constipationDietGuide?.detail).toContain(constipationCauseSentence);
    expect(constipationDietGuide?.detail).toContain(constipationFluidSentence);
    expect(constipationDietGuide?.detail).toContain("음식 섭취량이 너무 적지 않도록");
    expect(constipationDietGuide?.detail).toContain(constipationFiberSentence);
    expect(constipationDietGuide?.detail).toContain(constipationMovementSentence);
    expect(constipationDietGuide?.detail).toContain(constipationClinicianSentence);
    expect(formatCervicalCancerCareItemEvidence(constipationDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(constipationDietGuide!).body).toContain(
      constipationFiberSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(constipationDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 변비",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(constipationDietGuide!)).join(" ")).not.toMatch(
      /변비약을 복용하세요|하제를 복용하세요|관장을 하세요|수분부족을 치료하세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(weightChangeDietGuide).toMatchObject({
      label: "체중변화 열량·단백질·원인 메모",
      sourceId: "nccWeightChangeDiet",
    });
    expect(weightChangeDietGuide?.detail).toContain(weightLossContextSentence);
    expect(weightChangeDietGuide?.detail).toContain(weightLossCalorieProteinSentence);
    expect(weightChangeDietGuide?.detail).toContain("김밥, 초밥, 주먹밥, 볶음밥");
    expect(weightChangeDietGuide?.detail).toContain("야채죽, 전복죽, 계란죽, 닭죽");
    expect(weightChangeDietGuide?.detail).toContain("감자, 고구마, 떡, 만두, 빵, 과일");
    expect(weightChangeDietGuide?.detail).toContain("설탕, 꿀, 쨈, 버터, 땅콩버터");
    expect(weightChangeDietGuide?.detail).toContain("우유, 두유 등 음료");
    expect(weightChangeDietGuide?.detail).toContain("사탕, 젤리, 크래커, 빵류, 과일, 주스");
    expect(weightChangeDietGuide?.detail).toContain("계란 : 계란후라이, 계란찜");
    expect(weightChangeDietGuide?.detail).toContain("콩, 두부 : 콩밥, 두유");
    expect(weightChangeDietGuide?.detail).toContain("생선 : 생선포, 생선전");
    expect(weightChangeDietGuide?.detail).toContain("유제품 : 우유, 요구르트");
    expect(weightChangeDietGuide?.detail).toContain(weightGainCauseSentence);
    expect(weightChangeDietGuide?.detail).toContain(weightGainConsultSentence);
    expect(weightChangeDietGuide?.detail).toContain("염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등)");
    expect(weightChangeDietGuide?.detail).toContain("열량이 높고 영양가가 없는 식품들(예: 청량 음료, 초콜릿, 사탕, 과자류 등)");
    expect(weightChangeDietGuide?.detail).toContain("과일과 야채 그리고 곡류의 섭취를 증가");
    expect(weightChangeDietGuide?.detail).toContain("지방이 없는 부위의 육류제품과 저지방 우유 및 유제품");
    expect(weightChangeDietGuide?.detail).toContain("끓이고 찌는 형태의 요리방법");
    expect(weightChangeDietGuide?.detail).toContain("버터, 마요네즈, 감미료 등을 추가로 사용하지");
    expect(weightChangeDietGuide?.detail).toContain("가능한 고열량의 간식은 먹지");
    expect(weightChangeDietGuide?.detail).toContain("많이 먹었다고 생각되면 운동");
    expect(formatCervicalCancerCareItemEvidence(weightChangeDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(weightChangeDietGuide!).body).toContain(
      weightGainConsultSentence,
    );
    expect(formatCervicalCancerCareListItemAriaLabel(weightChangeDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 체중변화",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(weightChangeDietGuide!)).join(" ")).not.toMatch(
      /체중조절을 바로 시작하세요|감량식을 처방하세요|증량식을 처방하세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(immuneLowDietGuide).toMatchObject({
      label: "면역저하 익힌음식·위생·보관 메모",
      sourceId: "nccImmuneLowDiet",
    });
    expect(immuneLowDietGuide?.detail).toContain("백혈구수가 감소");
    expect(immuneLowDietGuide?.detail).toContain("감염에 대해 특별히 주의");
    expect(immuneLowDietGuide?.detail).toContain("익힌 음식을");
    expect(immuneLowDietGuide?.detail).toContain("완전히 익힌 음식");
    expect(immuneLowDietGuide?.detail).toContain("유효기간 확인");
    expect(immuneLowDietGuide?.detail).toContain("쥬스, 우유, 요구르트");
    expect(immuneLowDietGuide?.detail).toContain("저온살균 제품");
    expect(immuneLowDietGuide?.detail).toContain("상하기 쉬운 음식");
    expect(immuneLowDietGuide?.detail).toContain("고기, 생선, 닭고기");
    expect(immuneLowDietGuide?.detail).toContain("고기나 생선즙");
    expect(immuneLowDietGuide?.detail).toContain("냉장고에서 녹이고");
    expect(immuneLowDietGuide?.detail).toContain("해동한 후 즉시 요리");
    expect(immuneLowDietGuide?.detail).toContain("남은 음식");
    expect(immuneLowDietGuide?.detail).toContain("채소와 과일");
    expect(immuneLowDietGuide?.detail).toContain("손톱 밑부분");
    expect(immuneLowDietGuide?.detail).toContain("머리카락");
    expect(immuneLowDietGuide?.detail).toContain("조리에 사용되는 기구, 식기, 수저");
    expect(immuneLowDietGuide?.detail).toContain("식기, 도마, 칼");
    expect(immuneLowDietGuide?.detail).toContain("생고기, 닭고기, 생선");
    expect(immuneLowDietGuide?.detail).toContain("외식보다는 직접 요리");
    expect(immuneLowDietGuide?.detail).toContain("날계란이나 덜 익힌 계란");
    expect(immuneLowDietGuide?.detail).toContain("생굴, 회, 육회, 생선회, 생조개, 초밥");
    expect(immuneLowDietGuide?.detail).toContain("다진 고기");
    expect(immuneLowDietGuide?.detail).toContain("딸기 등 꼼꼼히 씻기 어려운 과일");
    expect(immuneLowDietGuide?.detail).toContain("3~4일이 지나면 버리기");
    expect(immuneLowDietGuide?.detail).toContain("곰팡이가 핀 음식");
    expect(immuneLowDietGuide?.detail).toContain("상한 음식");
    expect(immuneLowDietGuide?.detail).toContain("상온 30분 이상 운반");
    expect(immuneLowDietGuide?.detail).toContain("녹슨 캔이나 움푹해진 캔");
    expect(immuneLowDietGuide?.detail).toContain("녹은 냉동제품");
    expect(immuneLowDietGuide?.detail).toContain("비살균 우유·주스·요구르트");
    expect(formatCervicalCancerCareItemEvidence(immuneLowDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://www.cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(immuneLowDietGuide!).body).toContain(
      "제 WBC/ANC",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(immuneLowDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(immuneLowDietGuide!)).join(" ")).not.toMatch(
      /항생제를 복용하세요|격리하세요|백혈구.*올리는|면역.*치료|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(fatigueDepressionDietGuide).toMatchObject({
      label: "피로감·우울 영양·휴식·도움요청 메모",
      sourceId: "nccFatigueDepressionDiet",
    });
    expect(fatigueDepressionDietGuide?.detail).toContain("치료기간 동안 피로감");
    expect(fatigueDepressionDietGuide?.detail).toContain("제대로 먹지 못한 것");
    expect(fatigueDepressionDietGuide?.detail).toContain("운동 저하");
    expect(fatigueDepressionDietGuide?.detail).toContain("혈구수 부족");
    expect(fatigueDepressionDietGuide?.detail).toContain("우울");
    expect(fatigueDepressionDietGuide?.detail).toContain("불면");
    expect(fatigueDepressionDietGuide?.detail).toContain("약물 부작용");
    expect(fatigueDepressionDietGuide?.detail).toContain("의사선생님과 원인");
    expect(fatigueDepressionDietGuide?.detail).toContain("감정과 공포");
    expect(fatigueDepressionDietGuide?.detail).toContain("치료방법, 부작용");
    expect(fatigueDepressionDietGuide?.detail).toContain("충분한 휴식");
    expect(fatigueDepressionDietGuide?.detail).toContain("낮에 잠깐씩 낮잠");
    expect(fatigueDepressionDietGuide?.detail).toContain("짧고 간단한 활동");
    expect(fatigueDepressionDietGuide?.detail).toContain("영양이 풍부한 음식");
    expect(fatigueDepressionDietGuide?.detail).toContain("불충분한 열량과 영양소");
    expect(fatigueDepressionDietGuide?.detail).toContain("하루 중 가장 좋은 시간");
    expect(fatigueDepressionDietGuide?.detail).toContain("낮잠이나 휴식 후");
    expect(fatigueDepressionDietGuide?.detail).toContain("적은 양의 식사와 간식");
    expect(fatigueDepressionDietGuide?.detail).toContain("가족이나 친구의 도움");
    expect(fatigueDepressionDietGuide?.detail).toContain("음식배달서비스");
    expect(fatigueDepressionDietGuide?.detail).toContain("좋아하는 음식");
    expect(fatigueDepressionDietGuide?.detail).toContain("산책이나 규칙적인 운동");
    expect(fatigueDepressionDietGuide?.detail).toContain("피로를 악화시키는 행위");
    expect(fatigueDepressionDietGuide?.detail).toContain("아이보기, 밥하기, 집안일");
    expect(formatCervicalCancerCareItemEvidence(fatigueDepressionDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(fatigueDepressionDietGuide!).body).toContain(
      "피로 시작 시점",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(fatigueDepressionDietGuide!)).toContain(
      "국가암정보센터 증상별 식생활 - 피로감과 우울",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(fatigueDepressionDietGuide!)).join(" ")).not.toMatch(
      /항우울제를 복용하세요|수면제를 복용하세요|운동하세요|억지로 먹이세요|강제로 먹이세요|우울증으로 진단하세요|빈혈로 진단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(infectionConsultGuide).toMatchObject({
      label: "발열·오한·감염 상담 메모",
      sourceId: "nccInfectionConsult",
    });
    expect(infectionConsultGuide?.detail).toContain("항문 상처");
    expect(infectionConsultGuide?.detail).toContain("오한 또는 38℃ 이상 열");
    expect(infectionConsultGuide?.detail).toContain("응급실 기준");
    expect(infectionConsultGuide?.detail).toContain("예방주사와 치과진료");
    expect(infectionConsultGuide?.detail).toContain("오심·구토·설사");
    expect(infectionConsultGuide?.detail).toContain("흉통이나 호흡곤란");
    expect(infectionConsultGuide?.detail).toContain("배뇨시 쓰리거나 빈뇨");
    expect(infectionConsultGuide?.detail).toContain("뇨의 색변화나 냄새");
    expect(infectionConsultGuide?.detail).toContain("구강내 궤양이나 흰색의 반점");
    expect(infectionConsultGuide?.detail).toContain("체온 측정 시각");
    expect(infectionConsultGuide?.detail).toContain("진료팀에 알려야 하는지");
    expect(formatCervicalCancerCareItemEvidence(infectionConsultGuide!)).toContain(
      "국가암정보센터 감염 의료진 상담 기준 - https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(infectionConsultGuide!).body).toContain(
      "발열·오한·감염 상담 메모",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(infectionConsultGuide!).body).toContain(
      "체온 측정 시각",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(infectionConsultGuide!)).toContain(
      "국가암정보센터 감염 의료진 상담 기준",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(infectionConsultGuide!)).join(" ")).not.toMatch(
      /감염으로 진단하세요|항생제를 복용하세요|해열제를 복용하세요|응급실로 가세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(neuropathyCareGuide).toMatchObject({
      label: "손발저림·감각·화상예방 메모",
      sourceId: "nccNeuropathyCare",
    });
    expect(neuropathyCareGuide?.detail).toContain("손비비기");
    expect(neuropathyCareGuide?.detail).toContain("주먹을 쥐었다가 폈다");
    expect(neuropathyCareGuide?.detail).toContain(neuropathyHotSafetySentence);
    expect(neuropathyCareGuide?.detail).toContain("손, 발을 항상 깨끗이 씻고");
    expect(neuropathyCareGuide?.detail).toContain("손톱, 발톱을 짧게");
    expect(neuropathyCareGuide?.detail).toContain("다른 사람의 도움");
    expect(neuropathyCareGuide?.detail).toContain("부드러운 면");
    expect(neuropathyCareGuide?.detail).toContain("신발 앞부분이 뾰족한");
    expect(neuropathyCareGuide?.detail).toContain("맨발");
    expect(neuropathyCareGuide?.detail).toContain("추위나 찬 것");
    expect(neuropathyCareGuide?.detail).toContain("물의 온도");
    expect(neuropathyCareGuide?.detail).toContain("전기면도기");
    expect(neuropathyCareGuide?.detail).toContain("직접 운전");
    expect(neuropathyCareGuide?.detail).toContain(neuropathySymptomSentence);
    expect(neuropathyCareGuide?.detail).toContain("아프고 따끔거리는 감각");
    expect(neuropathyCareGuide?.detail).toContain("청력이 변화");
    expect(neuropathyCareGuide?.detail).toContain("복통, 구토, 변비");
    expect(formatCervicalCancerCareItemEvidence(neuropathyCareGuide!)).toContain(
      "국가암정보센터 신경계이상 증상 및 주의사항 - https://www.cancer.go.kr/lay1/S1T458C460/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(neuropathyCareGuide!).body).toContain(
      "손발저림",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(neuropathyCareGuide!)).toContain(
      "국가암정보센터 신경계이상 증상 및 주의사항",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(neuropathyCareGuide!)).join(" ")).not.toMatch(
      /신경병증으로 진단하세요|뜨겁게 찜질하세요|운전해도 됩니다|전기면도기를 꼭 사용하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
    );
    expect(skinChangeCareGuide).toMatchObject({
      label: "피부변화·손발홍반·손발톱 메모",
      sourceId: "nccSkinChangeCare",
    });
    expect(skinChangeCareGuide?.detail).toContain(skinObservationSentence);
    expect(skinChangeCareGuide?.detail).toContain("여드름");
    expect(skinChangeCareGuide?.detail).toContain("미지근한 물");
    expect(skinChangeCareGuide?.detail).toContain("순한 비누");
    expect(skinChangeCareGuide?.detail).toContain("오랜시간 동안 뜨거운 물");
    expect(skinChangeCareGuide?.detail).toContain("알코올");
    expect(skinChangeCareGuide?.detail).toContain("긁는 것");
    expect(skinChangeCareGuide?.detail).toContain("피부를 문지르지");
    expect(skinChangeCareGuide?.detail).toContain("면 같은 부드러운 섬유");
    expect(skinChangeCareGuide?.detail).toContain("가능하면 피부를 공기에 노출");
    expect(skinChangeCareGuide?.detail).toContain("오전 10시부터 오후 3시");
    expect(skinChangeCareGuide?.detail).toContain("손바닥과 발바닥");
    expect(skinChangeCareGuide?.detail).toContain("물집");
    expect(skinChangeCareGuide?.detail).toContain("표피박리");
    expect(skinChangeCareGuide?.detail).toContain("수용성 크림이나 로션");
    expect(skinChangeCareGuide?.detail).toContain("비비거나 긁거나 마사지");
    expect(skinChangeCareGuide?.detail).toContain("빨갛게 붓거나 물집");
    expect(skinChangeCareGuide?.detail).toContain("검은색으로 변하거나 흰색 줄");
    expect(skinChangeCareGuide?.detail).toContain("깨지거나, 건조해지고, 갈라지고, 들릴");
    expect(skinChangeCareGuide?.detail).toContain("손발톱 뿌리부분");
    expect(formatCervicalCancerCareItemEvidence(skinChangeCareGuide!)).toContain(
      "국가암정보센터 피부변화 증상별 대처방법 - https://www.cancer.go.kr/lay1/S1T454C456/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(skinChangeCareGuide!).body).toContain(
      "피부 발진",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(skinChangeCareGuide!)).toContain(
      "국가암정보센터 피부변화 증상별 대처방법",
    );
	    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(skinChangeCareGuide!)).join(" ")).not.toMatch(
	      /피부질환으로 진단하세요|약을 먹습니다|처방한 약을 바르세요|얼음찜질을 하세요|햇빛을 쬐세요|방사선을 중단하세요|항암을 중단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
	    );
	    expect(anemiaCareGuide).toMatchObject({
	      label: "빈혈·혈색소·어지럼 메모",
	      sourceId: "nccAnemiaCare",
	    });
	    expect(anemiaCareGuide?.detail).toContain(anemiaTreatmentEffectSentence);
	    expect(anemiaCareGuide?.detail).toContain("담당 의사에게 묻고");
	    expect(anemiaCareGuide?.detail).toContain(anemiaSymptomDiarySentence);
	    expect(anemiaCareGuide?.detail).toContain("심각한 피로나 허약함");
	    expect(anemiaCareGuide?.detail).toContain("숨 가쁨");
	    expect(anemiaCareGuide?.detail).toContain("혼동이나 집중하기 힘들어짐");
	    expect(anemiaCareGuide?.detail).toContain("핏기 없는 입술, 잇몸, 눈꺼풀, 손톱 뿌리, 손바닥");
	    expect(anemiaCareGuide?.detail).toContain("빠른 심박동수");
	    expect(anemiaCareGuide?.detail).toContain("춥게 느껴지는 것");
	    expect(anemiaCareGuide?.detail).toContain("슬퍼지거나 우울");
	    expect(anemiaCareGuide?.detail).toContain("적혈구 수와 헤모글로빈 수치");
	    expect(anemiaCareGuide?.detail).toContain("에너지 수준");
	    expect(anemiaCareGuide?.detail).toContain("하루 일과를 조정");
	    expect(anemiaCareGuide?.detail).toContain("가족 또는 친구들에게 일을 분배");
	    expect(anemiaCareGuide?.detail).toContain("과도한 운동");
	    expect(anemiaCareGuide?.detail).toContain("충분한 휴식");
	    expect(anemiaCareGuide?.detail).toContain("균형 잡힌 음식");
	    expect(anemiaCareGuide?.detail).toContain("하루 6--8잔의 물");
	    expect(anemiaCareGuide?.detail).toContain(anemiaActivityCautionSentence);
	    expect(anemiaCareGuide?.detail).toContain("천천히 일어나");
	    expect(anemiaCareGuide?.detail).toContain("충분한 수면");
	    expect(anemiaCareGuide?.detail).toContain("짧은 낮잠");
	    expect(formatCervicalCancerCareItemEvidence(anemiaCareGuide!)).toContain(
	      "국가암정보센터 빈혈 관리 - https://www.cancer.go.kr/lay1/S1T440C444/contents.do",
	    );
	    expect(buildCervicalCancerCareItemSymptomDraft(anemiaCareGuide!).body).toContain(
	      "빈혈 관련 증상",
	    );
	    expect(formatCervicalCancerCareListItemAriaLabel(anemiaCareGuide!)).toContain(
	      "국가암정보센터 빈혈 관리",
	    );
		    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(anemiaCareGuide!)).join(" ")).not.toMatch(
		      /빈혈로 진단하세요|수혈하세요|철분제를 복용하세요|조혈제를 맞으세요|운전해도 됩니다|운동하세요|물을 억지로 마시세요|억지로 먹이세요|강제로 먹이세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
		    );
		    expect(bleedingSymptomsGuide).toMatchObject({
		      label: "출혈·멍·코피·혈변 메모",
		      sourceId: "nccBleedingSymptoms",
		    });
		    expect(bleedingSymptomsGuide?.detail).toContain("의식상태의 변화");
		    expect(bleedingSymptomsGuide?.detail).toContain(bleedingSkinSentence);
		    expect(bleedingSymptomsGuide?.detail).toContain("멍이 쉽게 생깁니다");
		    expect(bleedingSymptomsGuide?.detail).toContain("눈의 흰동자에 출혈");
		    expect(bleedingSymptomsGuide?.detail).toContain("시력저하");
		    expect(bleedingSymptomsGuide?.detail).toContain(bleedingMouthNoseSentence);
		    expect(bleedingSymptomsGuide?.detail).toContain("가래에 피 섞여 나오거나");
		    expect(bleedingSymptomsGuide?.detail).toContain("호흡곤란");
		    expect(bleedingSymptomsGuide?.detail).toContain(bleedingDigestiveSentence);
		    expect(bleedingSymptomsGuide?.detail).toContain("복부통증");
		    expect(bleedingSymptomsGuide?.detail).toContain("복부팽창");
		    expect(bleedingSymptomsGuide?.detail).toContain(bleedingUrinaryReproductiveSentence);
		    expect(formatCervicalCancerCareItemEvidence(bleedingSymptomsGuide!)).toContain(
		      "국가암정보센터 출혈 증상 - https://www.cancer.go.kr/lay1/S1T445C448/contents.do",
		    );
		    expect(buildCervicalCancerCareItemSymptomDraft(bleedingSymptomsGuide!).body).toContain(
		      "출혈 관련 증상",
		    );
		    expect(formatCervicalCancerCareListItemAriaLabel(bleedingSymptomsGuide!)).toContain(
		      "국가암정보센터 출혈 증상",
		    );
			    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(bleedingSymptomsGuide!)).join(" ")).not.toMatch(
			      /출혈로 진단하세요|수혈하세요|지혈제를 복용하세요|응고검사를 지시하세요|항암을 중단하세요|방사선을 중단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
			    );
			    expect(hairLossCareGuide).toMatchObject({
			      label: "탈모·두피 보호·가발 준비 메모",
			      sourceId: "nccHairLossCare",
			    });
			    expect(hairLossCareGuide?.detail).toContain(hairLossGentleCareSentence);
			    expect(hairLossCareGuide?.detail).toContain("두피를 청결하게 관리");
			    expect(hairLossCareGuide?.detail).toContain("부드러운 샴푸와 크림린스");
			    expect(hairLossCareGuide?.detail).toContain(hairLossHeatCombSentence);
			    expect(hairLossCareGuide?.detail).toContain("공기 중에서 자연스럽게");
			    expect(hairLossCareGuide?.detail).toContain("간격이 넓고 부드러운 빗");
			    expect(hairLossCareGuide?.detail).toContain(hairLossEmotionSentence);
			    expect(hairLossCareGuide?.detail).toContain(hairLossScalpProtectionSentence);
			    expect(hairLossCareGuide?.detail).toContain("자신에게 잘 맞는 가발");
			    expect(hairLossCareGuide?.detail).toContain("아직 머리카락이 빠지기 전에");
			    expect(hairLossCareGuide?.detail).toContain("갑자기 두피 피부가 노출");
			    expect(hairLossCareGuide?.detail).toContain("감정변화");
			    expect(formatCervicalCancerCareItemEvidence(hairLossCareGuide!)).toContain(
			      "국가암정보센터 탈모 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T451C453/contents.do",
			    );
			    expect(buildCervicalCancerCareItemSymptomDraft(hairLossCareGuide!).body).toContain(
			      "탈모·두피 보호·가발 준비 메모",
			    );
			    expect(formatCervicalCancerCareListItemAriaLabel(hairLossCareGuide!)).toContain(
			      "국가암정보센터 탈모 도움이 되는 방법",
			    );
				    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(hairLossCareGuide!)).join(" ")).not.toMatch(
				      /탈모를 치료하세요|두피약을 바르세요|선크림을 처방하세요|가발을 처방하세요|항암을 중단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
				    );
				    expect(hiccupConsultGuide).toMatchObject({
				      label: "딸꾹질 지속·호흡곤란 상담 메모",
				      sourceId: "nccHiccupConsult",
				    });
				    expect(hiccupConsultGuide?.detail).toContain(hiccupPersistentSentence);
				    expect(hiccupConsultGuide?.detail).toContain(hiccupDyspneaSentence);
				    expect(hiccupConsultGuide?.detail).toContain(hiccupBloatingSentence);
				    expect(hiccupConsultGuide?.detail).toContain(hiccupSleepSentence);
				    expect(hiccupConsultGuide?.detail).toContain(hiccupPainSentence);
				    expect(hiccupConsultGuide?.detail).toContain("딸꾹질 시작 시점");
				    expect(hiccupConsultGuide?.detail).toContain("수면 방해");
				    expect(hiccupConsultGuide?.detail).toContain("진료팀 확인 메모");
				    expect(formatCervicalCancerCareItemEvidence(hiccupConsultGuide!)).toContain(
				      "국가암정보센터 딸꾹질 의료진 상담 상황 - https://www.cancer.go.kr/lay1/S1T466C468/contents.do",
				    );
				    expect(buildCervicalCancerCareItemSymptomDraft(hiccupConsultGuide!).body).toContain(
				      "딸꾹질 지속·호흡곤란 상담 메모",
				    );
				    expect(formatCervicalCancerCareListItemAriaLabel(hiccupConsultGuide!)).toContain(
				      "국가암정보센터 딸꾹질 의료진 상담 상황",
				    );
				    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(hiccupConsultGuide!)).join(" ")).not.toMatch(
				      /딸꾹질을 치료하세요|약을 복용하세요|물을 마시세요|숨을 참으세요|종이봉투|눈을 누르세요|설탕을 먹으세요|레몬을 먹으세요|항암을 중단하세요|치료하세요|처방하세요|진단하세요|암을 낫게|특효/,
				    );
				    expect(dyspneaConsultGuide).toMatchObject({
				      label: "호흡곤란·흉통·가래 상담 메모",
				      sourceId: "nccDyspneaConsult",
				    });
				    expect(dyspneaConsultGuide?.detail).toContain(dyspneaSputumObservationSentence);
				    expect(dyspneaConsultGuide?.detail).toContain(dyspneaConsultHeaderSentence);
				    expect(dyspneaConsultGuide?.detail).toContain(dyspneaChestPainSentence);
				    expect(dyspneaConsultGuide?.detail).toContain(coloredSputumSentence);
				    expect(dyspneaConsultGuide?.detail).toContain(paleBlueClammySkinSentence);
				    expect(dyspneaConsultGuide?.detail).toContain(feverSentence);
				    expect(dyspneaConsultGuide?.detail).toContain(nostrilFlaringSentence);
				    expect(dyspneaConsultGuide?.detail).toContain(noisyBreathingSentence);
				    expect(dyspneaConsultGuide?.detail).toContain("시작 시점");
				    expect(dyspneaConsultGuide?.detail).toContain("가래 색·점도·혈액");
				    expect(formatCervicalCancerCareItemEvidence(dyspneaConsultGuide!)).toContain(
				      "국가암정보센터 호흡곤란 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T411C415/contents.do",
				    );
				    expect(buildCervicalCancerCareItemSymptomDraft(dyspneaConsultGuide!).body).toContain(
				      "호흡곤란·흉통·가래 상담 메모",
				    );
				    expect(buildCervicalCancerCareItemSymptomDraft(dyspneaConsultGuide!).body).toContain(
				      dyspneaChestPainSentence,
				    );
				    expect(formatCervicalCancerCareListItemAriaLabel(dyspneaConsultGuide!)).toContain(
				      "국가암정보센터 호흡곤란 도움이 되는 방법",
				    );
				    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(dyspneaConsultGuide!)).join(" ")).not.toMatch(
				      /산소를 줍니다|처방된 약|항생제 치료를 받게 됩니다|진단하세요|치료하세요|약을 처방하세요|처방하세요/,
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
    expect(survivorDistressGuide).toMatchObject({
      label: "암생존자 디스트레스 자가평가 메모",
      sourceId: "nccSurvivorDistressAdaptation",
    });
    expect(survivorDistressGuide?.detail).toContain("몸과 마음에 나타나는 모든 괴로움");
    expect(survivorDistressGuide?.detail).toContain("20~40%");
    expect(survivorDistressGuide?.detail).toContain("다스리기 어려운 고통스러운 신체 증상");
    expect(survivorDistressGuide?.detail).toContain("외모에 원하지 않은 변화");
    expect(survivorDistressGuide?.detail).toContain("역할이나 관계");
    expect(survivorDistressGuide?.detail).toContain("돌보아야 하는 아이");
    expect(survivorDistressGuide?.detail).toContain("새로운 직장");
    expect(survivorDistressGuide?.detail).toContain("암 관리에 대한 정보가 부족");
    expect(survivorDistressGuide?.detail).toContain("걱정, 두려움, 불안");
    expect(survivorDistressGuide?.detail).toContain("잠들기 어렵거나 잠에서 쉽게 깹");
    expect(survivorDistressGuide?.detail).toContain("죽고 싶다는 생각");
    expect(survivorDistressGuide?.detail).toContain("자녀보육");
    expect(survivorDistressGuide?.detail).toContain("경제적 문제");
    expect(survivorDistressGuide?.detail).toContain("우울/슬픔");
    expect(survivorDistressGuide?.detail).toContain("재발/죽음에 대한 불안");
    expect(survivorDistressGuide?.detail).toContain("식사");
    expect(survivorDistressGuide?.detail).toContain("피로");
    expect(survivorDistressGuide?.detail).toContain("기억력/집중력");
    expect(survivorDistressGuide?.detail).toContain("통증");
    expect(survivorDistressGuide?.detail).toContain("관심과 도움이 필요하다는 신호");
    expect(formatCervicalCancerCareItemEvidence(survivorDistressGuide!)).toContain(
      "국가암정보센터 암생존자 마음관리 - 변화된 삶에 적응하기 - https://www.cancer.go.kr/lay1/S1T788C790/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(survivorDistressGuide!).body).toContain(
      "암생존자 디스트레스 자가평가 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(survivorDistressGuide!)).toContain(
      "국가암정보센터 암생존자 마음관리 - 변화된 삶에 적응하기",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(survivorDistressGuide!)).join(" ")).not.toMatch(
      /디스트레스를 진단하세요|치료하세요|처방하세요|자살하세요|혼자 견디세요|암관리를 중단하세요/,
    );
    expect(stressCancerCauseGuide).toMatchObject({
      label: "스트레스 원인 오해·관리 메모",
      sourceId: "nccMentalHealthStressCancerCause",
    });
    expect(stressCancerCauseGuide?.detail).toContain("스트레스를 많이 받아서 암에 걸린 걸까요");
    expect(stressCancerCauseGuide?.detail).toContain("누군가를 탓하고 싶은 마음");
    expect(stressCancerCauseGuide?.detail).toContain("스트레스를 불러일으킨 상황이나 사람을 탓");
    expect(stressCancerCauseGuide?.detail).toContain("직접적인 발암인자");
    expect(stressCancerCauseGuide?.detail).toContain("암이 생기게 한 원인이라고 할 수는 없습니다");
    expect(stressCancerCauseGuide?.detail).toContain("면역력을 약화");
    expect(stressCancerCauseGuide?.detail).toContain("악성세포의 성장");
    expect(stressCancerCauseGuide?.detail).toContain("스트레스를 피하는 것보다");
    expect(stressCancerCauseGuide?.detail).toContain("건전한 스트레스 해소법");
    expect(stressCancerCauseGuide?.detail).toContain("적당한 운동");
    expect(stressCancerCauseGuide?.detail).toContain("건강한 식생활");
    expect(stressCancerCauseGuide?.detail).toContain("좋은 대인관계");
    expect(stressCancerCauseGuide?.detail).toContain("건전한 신앙생활");
    expect(stressCancerCauseGuide?.detail).toContain("원인 단정이나 책임 전가로 쓰지 않습니다");
    expect(formatCervicalCancerCareItemEvidence(stressCancerCauseGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 스트레스와 암 원인 오해 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22076&condition=&cpage=4&keyword=&mode=view&rn=46&rows=12",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(stressCancerCauseGuide!).body).toContain(
      "스트레스 원인 오해·관리 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(stressCancerCauseGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 스트레스와 암 원인 오해",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(stressCancerCauseGuide!)).join(" ")).not.toMatch(
      /스트레스 때문에 암에 걸렸습니다|스트레스가 직접적인 암 원인입니다|누군가를 탓하세요|운동하세요|식생활을 바꾸세요|신앙생활을 하세요|면역력이 회복됩니다|악성세포 성장이 줄어듭니다|치료하세요|처방하세요|진단하세요/,
    );
    expect(survivorSlumpGuide).toMatchObject({
      label: "암치료 후 슬럼프·우울상담 메모",
      sourceId: "nccSurvivorPostTreatmentSlump",
    });
    expect(survivorSlumpGuide?.detail).toContain("암 진단 후에 수술과 항암화학요법");
    expect(survivorSlumpGuide?.detail).toContain("방사선치료");
    expect(survivorSlumpGuide?.detail).toContain("초기 치료가 일단락");
    expect(survivorSlumpGuide?.detail).toContain("한참 후에 우울증");
    expect(survivorSlumpGuide?.detail).toContain("좌절감");
    expect(survivorSlumpGuide?.detail).toContain("절망감");
    expect(survivorSlumpGuide?.detail).toContain("고립감");
    expect(survivorSlumpGuide?.detail).toContain("고독감");
    expect(survivorSlumpGuide?.detail).toContain("허무감");
    expect(survivorSlumpGuide?.detail).toContain("혼자서 관리해야 한다는 부담감");
    expect(survivorSlumpGuide?.detail).toContain("재발이나 전이에 대한 막연한 두려움");
    expect(survivorSlumpGuide?.detail).toContain("우울한 기분이나 의욕 상실");
    expect(survivorSlumpGuide?.detail).toContain("한 달 이상");
    expect(survivorSlumpGuide?.detail).toContain("정신건강의학과 상담");
    expect(survivorSlumpGuide?.detail).toContain("전문가의 도움");
    expect(survivorSlumpGuide?.detail).toContain("진료를 대신하거나 항우울제 처방을 지시하지 않습니다");
    expect(formatCervicalCancerCareItemEvidence(survivorSlumpGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 암치료 후 슬럼프 - https://cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22077&condition=&cpage=4&keyword=&rn=45&rows=12",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(survivorSlumpGuide!).body).toContain(
      "암치료 후 슬럼프·우울상담 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(survivorSlumpGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 암치료 후 슬럼프",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(survivorSlumpGuide!)).join(" ")).not.toMatch(
      /우울증을 진단하세요|항우울제를 처방하세요|치료하세요|혼자 관리하세요|상담받으세요|괜찮으니 참으세요/,
    );
    expect(insomniaMedicationConcernGuide).toMatchObject({
      label: "불면증·정신과 약 중독 우려 메모",
      sourceId: "nccMentalHealthInsomniaMedicationConcern",
    });
    expect(insomniaMedicationConcernGuide?.detail).toContain("암 진단 후 잠을 잘 못 잘 때");
    expect(insomniaMedicationConcernGuide?.detail).toContain("정신건강의학과 약을 먹으면 중독되는지");
    expect(insomniaMedicationConcernGuide?.detail).toContain("정신건강의학과에 대한 편견");
    expect(insomniaMedicationConcernGuide?.detail).toContain("약을 한 번 먹으면 끊지 못한다는 통념");
    expect(insomniaMedicationConcernGuide?.detail).toContain("진료기록과 취직·보험 걱정");
    expect(insomniaMedicationConcernGuide?.detail).toContain("적절한 서비스를 받지 못");
    expect(insomniaMedicationConcernGuide?.detail).toContain("가벼운 불면");
    expect(insomniaMedicationConcernGuide?.detail).toContain("약 없이 상담");
    expect(insomniaMedicationConcernGuide?.detail).toContain("수면제");
    expect(insomniaMedicationConcernGuide?.detail).toContain("항우울제");
    expect(insomniaMedicationConcernGuide?.detail).toContain("항불안제");
    expect(insomniaMedicationConcernGuide?.detail).toContain("증상 조절 목적");
    expect(insomniaMedicationConcernGuide?.detail).toContain("대부분 단기간에 끊");
    expect(insomniaMedicationConcernGuide?.detail).toContain("중단 계획");
    expect(insomniaMedicationConcernGuide?.detail).toContain("중독 가능성을 단정하지 않습니다");
    expect(formatCervicalCancerCareItemEvidence(insomniaMedicationConcernGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 불면증과 정신과 약 중독 우려 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22078&condition=&cpage=2&keyword=&mode=view&rn=49&rows=12",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(insomniaMedicationConcernGuide!).body).toContain(
      "불면증·정신과 약 중독 우려 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(insomniaMedicationConcernGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 불면증과 정신과 약 중독 우려",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(insomniaMedicationConcernGuide!)).join(" ")).not.toMatch(
      /수면제를 복용하세요|정신과 약을 복용하세요|약물 치료하세요|중독되지 않습니다|중독됩니다|치료하세요|처방하세요|진단하세요|적극적으로 정신건강의학과를 이용하세요/,
    );
    expect(psychiatryConsultBenefitsGuide).toMatchObject({
      label: "정신건강의학과 진료 도움 확인 메모",
      sourceId: "nccMentalHealthPsychiatryConsultBenefits",
    });
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("주치의가 정신건강의학과 진료를 권했을 때");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("암환자의 절반 가까이");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("투병 중에 정신건강의학적 문제");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("불면이나 우울, 불안");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("심하거나 오래 지속");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("정신신경 면역학적 기전");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("면역력");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("심리사회적 서비스");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("암 의료에서 필수적인 요소");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("정신적 스트레스 선별");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("삶의 질");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("생존율");
    expect(psychiatryConsultBenefitsGuide?.detail).toContain("개인 예후 개선으로 단정하지 않습니다");
    expect(formatCervicalCancerCareItemEvidence(psychiatryConsultBenefitsGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 정신건강의학과 진료 도움 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22079&condition=&cpage=2&keyword=&mode=view&rn=48&rows=12",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(psychiatryConsultBenefitsGuide!).body).toContain(
      "정신건강의학과 진료 도움 확인 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(psychiatryConsultBenefitsGuide!)).toContain(
      "국가암정보센터 암환자 정신건강 - 정신건강의학과 진료 도움",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(psychiatryConsultBenefitsGuide!)).join(" ")).not.toMatch(
      /정신건강의학과 진료를 받으세요|상담받으세요|치료하세요|처방하세요|진단하세요|생존율이 높아집니다|면역력이 회복됩니다|약을 복용하세요|개인 예후가 좋아집니다/,
    );
    expect(survivorAnxietyGuide).toMatchObject({
      label: "암생존자 불안신호·주의전환 메모",
      sourceId: "nccSurvivorAnxietyManagement",
    });
    expect(survivorAnxietyGuide?.detail).toContain("몸의 경보장치");
    expect(survivorAnxietyGuide?.detail).toContain("심장이 빨리 뛰고");
    expect(survivorAnxietyGuide?.detail).toContain("가슴이 두근");
    expect(survivorAnxietyGuide?.detail).toContain("땀");
    expect(survivorAnxietyGuide?.detail).toContain("몸이 떨리");
    expect(survivorAnxietyGuide?.detail).toContain("숨이 가쁘거나 답답");
    expect(survivorAnxietyGuide?.detail).toContain("어지럽거나 쓰러질 것 같은 느낌");
    expect(survivorAnxietyGuide?.detail).toContain("일상생활에 방해");
    expect(survivorAnxietyGuide?.detail).toContain("잠들기 어렵");
    expect(survivorAnxietyGuide?.detail).toContain("집중하지 못하거나 결정을 내리지 못");
    expect(survivorAnxietyGuide?.detail).toContain("솔직하게 털어놓기");
    expect(survivorAnxietyGuide?.detail).toContain("주의 전환");
    expect(survivorAnxietyGuide?.detail).toContain("복식호흡");
    expect(survivorAnxietyGuide?.detail).toContain("심상유도");
    expect(formatCervicalCancerCareItemEvidence(survivorAnxietyGuide!)).toContain(
      "국가암정보센터 암생존자 마음관리 - 내 안의 불안 다스리기 - https://www.cancer.go.kr/lay1/S1T788C791/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(survivorAnxietyGuide!).body).toContain(
      "암생존자 불안신호·주의전환 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(survivorAnxietyGuide!)).toContain(
      "국가암정보센터 암생존자 마음관리 - 내 안의 불안 다스리기",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(survivorAnxietyGuide!)).join(" ")).not.toMatch(
      /불안을 치료하세요|호흡훈련을 하세요|주의전환을 하세요|약을 복용하세요|진단하세요|처방하세요|치료하세요|괜찮으니 참으세요/,
    );
    expect(sleepManagementGuide).toMatchObject({
      label: "불면·수면효율·습관 메모",
      sourceId: "nccSurvivorSleepManagement",
    });
    expect(sleepManagementGuide?.detail).toContain("암 환자의 약 30~50%");
    expect(sleepManagementGuide?.detail).toContain("복용하는 약물");
    expect(sleepManagementGuide?.detail).toContain("암 치료 때문에 수면 습관");
    expect(sleepManagementGuide?.detail).toContain("수면효율");
    expect(sleepManagementGuide?.detail).toContain("실제로 잠을 자는 시간");
    expect(sleepManagementGuide?.detail).toContain("잠자리에 누워 있는 총시간");
    expect(sleepManagementGuide?.detail).toContain("항상 일정한 시각");
    expect(sleepManagementGuide?.detail).toContain("저녁에는 섭취하지");
    expect(sleepManagementGuide?.detail).toContain("잠들기 전 2시간 안");
    expect(sleepManagementGuide?.detail).toContain("휴대 전화 사용");
    expect(sleepManagementGuide?.detail).toContain("진료팀 확인");
    expect(formatCervicalCancerCareItemEvidence(sleepManagementGuide!)).toContain(
      "국가암정보센터 암생존자 수면관리 - https://www.cancer.go.kr/lay1/S1T748C794/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(sleepManagementGuide!).body).toContain(
      "불면·수면효율·습관 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(sleepManagementGuide!)).toContain(
      "국가암정보센터 암생존자 수면관리",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(sleepManagementGuide!)).join(" ")).not.toMatch(
      /수면제를 복용하세요|약물 치료하세요|인지 행동 치료를 받으세요|치료하세요|처방하세요|진단하세요/,
    );
    expect(exerciseManagementGuide).toMatchObject({
      label: "암생존자 운동강도·근력운동 메모",
      sourceId: "nccSurvivorExerciseManagement",
    });
    expect(exerciseManagementGuide?.detail).toContain("규칙적인 운동참여");
    expect(exerciseManagementGuide?.detail).toContain("체력증진");
    expect(exerciseManagementGuide?.detail).toContain("피로도 감소");
    expect(exerciseManagementGuide?.detail).toContain("삶의 질");
    expect(exerciseManagementGuide?.detail).toContain("주당 150분 이상의 중강도 신체활동");
    expect(exerciseManagementGuide?.detail).toContain("주 2회 이상의 근력운동");
    expect(exerciseManagementGuide?.detail).toContain("숨이 약간 차지만 옆 사람과 대화가 가능한 정도");
    expect(exerciseManagementGuide?.detail).toContain("정보교육과 스트레칭, 전신 근력운동");
    expect(exerciseManagementGuide?.detail).toContain("편안한 운동복");
    expect(exerciseManagementGuide?.detail).toContain("진료팀 확인");
    expect(formatCervicalCancerCareItemEvidence(exerciseManagementGuide!)).toContain(
      "국가암정보센터 암생존자 운동 - https://www.cancer.go.kr/lay1/S1T748C795/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(exerciseManagementGuide!).body).toContain(
      "암생존자 운동강도·근력운동 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(exerciseManagementGuide!)).toContain(
      "국가암정보센터 암생존자 운동",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(exerciseManagementGuide!)).join(" ")).not.toMatch(
      /운동하세요|근력운동을 하세요|유산소 운동을 하세요|치료하세요|처방하세요|진단하세요|재발을 막습니다|사망률을 낮춥니다/,
    );
    expect(survivorNutritionGuide).toMatchObject({
      label: "암생존자 균형식·가공육·보조식품 메모",
      sourceId: "nccSurvivorNutritionLifestyle",
    });
    expect(survivorNutritionGuide?.detail).toContain("적정체중");
    expect(survivorNutritionGuide?.detail).toContain("골고루 균형잡힌 식사");
    expect(survivorNutritionGuide?.detail).toContain("다양한 색의 과일, 채소, 전곡류");
    expect(survivorNutritionGuide?.detail).toContain("육가공품");
    expect(survivorNutritionGuide?.detail).toContain("탄 음식");
    expect(survivorNutritionGuide?.detail).toContain("짠 음식");
    expect(survivorNutritionGuide?.detail).toContain("하루 한 두 잔의 술");
    expect(survivorNutritionGuide?.detail).toContain("건강보조식품, 민간요법");
    expect(survivorNutritionGuide?.detail).toContain("진료팀 확인");
    expect(formatCervicalCancerCareItemEvidence(survivorNutritionGuide!)).toContain(
      "국가암정보센터 암생존자 영양·식생활 - https://www.cancer.go.kr/lay1/S1T748C796/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(survivorNutritionGuide!).body).toContain(
      "암생존자 균형식·가공육·보조식품 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(survivorNutritionGuide!)).toContain(
      "국가암정보센터 암생존자 영양·식생활",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(survivorNutritionGuide!)).join(" ")).not.toMatch(
      /식단을 처방하세요|육가공품을 절대 먹지 마세요|술을 마시면 안 됩니다|보조식품을 복용하세요|재발을 막습니다|치료하세요|처방하세요|진단하세요/,
    );
    expect(survivorHealthyManagementNutritionGuide).toMatchObject({
      label: "암생존자 고용량 영양식품·우유 질문 메모",
      sourceId: "nccSurvivorHealthyManagementNutrition",
    });
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("너무 고용량");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("뭔가 좋다는 영양 식품");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("안 드시는 것이 가장 안전");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("기름기가 적은 고단백 식품");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("탄수화물도");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("우유 드셔도 되나요");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("드셔도 됩니다");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("고용량으로 그것만 꾸준히");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("너무 달고 기름진 음식");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("탄 음식");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("가공육 가공식품");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("불필요한 영양제 민간요법");
    expect(survivorHealthyManagementNutritionGuide?.detail).toContain("진료팀 확인");
    expect(formatCervicalCancerCareItemEvidence(survivorHealthyManagementNutritionGuide!)).toContain(
      "국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리 - https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(survivorHealthyManagementNutritionGuide!).body).toContain(
      "암생존자 고용량 영양식품·우유 질문 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(survivorHealthyManagementNutritionGuide!)).toContain(
      "국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리",
    );
    expect(
      Object.values(
        buildCervicalCancerCareItemSymptomDraft(survivorHealthyManagementNutritionGuide!),
      ).join(" "),
    ).not.toMatch(
      /우유를 드세요|고단백 식품을 드세요|영양제를 끊으세요|민간요법을 하지 마세요|재발을 막습니다|치료하세요|처방하세요|진단하세요/,
    );
    expect(survivorSecondCancerScreeningGuide).toMatchObject({
      label: "암생존자 이차암 검진·흡연력 메모",
      sourceId: "nccSurvivorHealthyManagementNutrition",
    });
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("이차암은 원발암");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("새로운 부위");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("다른 암을 겪지 않은 사람보다");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("10% 에서 20%정도");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("자궁경부암");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("흡연");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("폐암 검진");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("저선량 흉부 CT");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("치료받은 병원");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("다른 부위의 이차암");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("국가 검진");
    expect(survivorSecondCancerScreeningGuide?.detail).toContain("진료팀 확인");
    expect(formatCervicalCancerCareItemEvidence(survivorSecondCancerScreeningGuide!)).toContain(
      "국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리 - https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(survivorSecondCancerScreeningGuide!).body).toContain(
      "암생존자 이차암 검진·흡연력 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(survivorSecondCancerScreeningGuide!)).toContain(
      "국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리",
    );
    expect(
      Object.values(
        buildCervicalCancerCareItemSymptomDraft(survivorSecondCancerScreeningGuide!),
      ).join(" "),
    ).not.toMatch(
      /폐암 검진을 받으세요|국가암검진을 받으세요|금연하세요|이차암을 예방합니다|재발을 막습니다|치료하세요|처방하세요|진단하세요/,
    );
    expect(survivorWorkGuide).toMatchObject({
      label: "암생존자 직업복귀·근무조정 메모",
      sourceId: "nccSurvivorWorkReturn",
    });
    expect(survivorWorkGuide?.detail).toContain("직업복귀");
    expect(survivorWorkGuide?.detail).toContain("경제 상태");
    expect(survivorWorkGuide?.detail).toContain("삶의 질");
    expect(survivorWorkGuide?.detail).toContain("반드시 직장을 그만두어야 한다는 뜻은 아니며");
    expect(survivorWorkGuide?.detail).toContain("치료계획");
    expect(survivorWorkGuide?.detail).toContain("몸 상태");
    expect(survivorWorkGuide?.detail).toContain("직업의 종류");
    expect(survivorWorkGuide?.detail).toContain("직장 복귀시기");
    expect(survivorWorkGuide?.detail).toContain("치료방법");
    expect(survivorWorkGuide?.detail).toContain("예상 치료기간");
    expect(survivorWorkGuide?.detail).toContain("부작용");
    expect(survivorWorkGuide?.detail).toContain("스트레스 반응");
    expect(survivorWorkGuide?.detail).toContain("근무시간 조정");
    expect(survivorWorkGuide?.detail).toContain("유연근무제");
    expect(survivorWorkGuide?.detail).toContain("재택근무");
    expect(survivorWorkGuide?.detail).toContain("증빙서류");
    expect(survivorWorkGuide?.detail).toContain("회식");
    expect(survivorWorkGuide?.detail).toContain("음주");
    expect(survivorWorkGuide?.detail).toContain("자극적인 음식");
    expect(formatCervicalCancerCareItemEvidence(survivorWorkGuide!)).toContain(
      "국가암정보센터 암생존자 직업복귀 - https://www.cancer.go.kr/lay1/S1T748C798/contents.do",
    );
    expect(buildCervicalCancerCareItemSymptomDraft(survivorWorkGuide!).body).toContain(
      "암생존자 직업복귀·근무조정 메모",
    );
    expect(formatCervicalCancerCareListItemAriaLabel(survivorWorkGuide!)).toContain(
      "국가암정보센터 암생존자 직업복귀",
    );
    expect(Object.values(buildCervicalCancerCareItemSymptomDraft(survivorWorkGuide!)).join(" ")).not.toMatch(
      /복귀하세요|일하세요|퇴사하지 마세요|그만두세요|치료하세요|처방하세요|진단하세요|술을 마셔도 됩니다|매운 음식을 먹어도 됩니다/,
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
