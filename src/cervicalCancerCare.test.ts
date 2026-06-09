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
      "nccDiagnosisMethods",
      "nccStage",
      "nccTreatmentMethods",
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
    expect(cervicalCancerCarePrompts).toHaveLength(14);
    expect(cervicalCancerCarePrompts.map((item) => item.topic)).toEqual([
      "자궁경부암 추적",
      "검진·진단검사 구분",
      "감별진단 확인",
      "치료 후 회복",
      "치료 선택 기준",
      "재발·추적검사",
      "골반 방사선 후 폐경",
      "장·방광 후기 변화",
      "림프부종",
      "식생활·보조식품",
      "HPV·검진",
      "HPV 감염·파트너 상담",
      "임신·출산 계획",
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
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[3])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[4])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[4].question).toContain("병기");
    expect(cervicalCancerCarePrompts[4].question).toContain("출산 희망");
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
    expect(cervicalCancerCarePrompts[6].question).toContain("난소부전");
    expect(cervicalCancerCarePrompts[6].question).toContain("폐경 증상");
    expect(cervicalCancerCarePrompts[6].question).toContain("질협착");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[6])).toContain(
      "출처: 국가암정보센터 방사선치료의 부작용 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[7])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[7].question).toContain("6개월 이상");
    expect(cervicalCancerCarePrompts[7].question).toContain("장폐색");
    expect(cervicalCancerCarePrompts[7].question).toContain("혈변");
    expect(cervicalCancerCarePrompts[7].question).toContain("혈뇨");
    expect(cervicalCancerCarePrompts[7].question).toContain("배변/가스 변화");
    expect(cervicalCancerCarePrompts[8].question).toContain("피부 붉어짐");
    expect(cervicalCancerCarePrompts[8].question).toContain("의료진에게 바로 연락");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[8])).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[9])).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[9].question).toContain("민간요법·건강보조식품");
    expect(cervicalCancerCarePrompts[10].question).toContain("접종 후에도 자궁경부암 선별검사");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[10])).toContain(
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
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[12])).toContain(
      "출처: 국가암정보센터 자궁경부암 임신과 출산 - https://www.cancer.go.kr/",
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
      "원추절제술 후 생활 제한. 6~8주 질분비물·간헐 출혈 가능 기간에 성관계, 수영/탕목욕, 무리한 운동, 변비 주의가 내게 적용되는지 퇴원 안내서와 진료팀 지시로 대조합니다. 출처: 국가암정보센터 자궁경부암 치료 후 생활.",
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
    const text = cervicalCancerCareRecoveryGuides
      .map((item) => `${item.label} ${item.detail}`)
      .join(" ");

    const recurrenceSymptomGuide = cervicalCancerCareRecoveryGuides.find(
      (item) => item.label === "재발 의심 증상·기본 추적검사 메모",
    );

    expect(cervicalCancerCareRecoveryGuides).toHaveLength(10);
    expect(text).toContain("원추절제술");
    expect(text).toContain("6~8주");
    expect(text).toContain("광범위 자궁절제술");
    expect(text).toContain("최소 6주");
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
    expect(recurrenceSymptomGuide?.detail).toContain("체중감소");
    expect(recurrenceSymptomGuide?.detail).toContain("하지 부종");
    expect(recurrenceSymptomGuide?.detail).toContain("골반 혹은 허벅지 통증");
    expect(recurrenceSymptomGuide?.detail).toContain("질출혈 혹은 질분비물의 증가");
    expect(recurrenceSymptomGuide?.detail).toContain("진행성 요관 폐색");
    expect(recurrenceSymptomGuide?.detail).toContain("쇄골위 림프절 비대");
    expect(recurrenceSymptomGuide?.detail).toContain("기침·객혈·흉통");
    expect(recurrenceSymptomGuide?.detail).toContain("특징적인 증상이 없는 경우");
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
    expect(text).toContain("특별히 피하거나 추천하는 음식은 없고");
    expect(text).toContain("민간요법·건강보조식품");
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
    const hpvScheduleGuide = cervicalCancerCarePreventionGuides.find(
      (item) => item.label === "HPV 접종 일정·관찰 확인",
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

    expect(cervicalCancerCarePreventionGuides).toHaveLength(15);
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
