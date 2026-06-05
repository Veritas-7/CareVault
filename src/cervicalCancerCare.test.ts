import { describe, expect, it } from "vitest";
import {
  buildCervicalCancerAlertSymptomDraft,
  buildCervicalCancerCareItemSymptomDraft,
  buildCervicalCancerCarePromptQuestion,
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
  formatCervicalCancerCareSourceLinkLabel,
  formatCervicalCancerCareSourceEvidence,
  formatCervicalCancerCarePriorityEvidence,
  formatCervicalCancerCareAlertRecordFieldEvidence,
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
      "nccScreeningSchedule",
      "nccScreeningEligibility",
      "nccScreeningResultCost",
      "nccEarlyDiagnosisPrevention",
      "nccRecovery",
      "nccRecurrenceFollowUp",
      "nccSexLife",
      "nccPregnancyBirth",
      "nccDiet",
      "nccTreatmentMethods",
      "nccTreatmentSideEffects",
      "nccRadiationSideEffects",
      "nccLymphedema",
      "nccLymphedemaSymptoms",
      "nccLymphedemaCare",
      "kdcaHpv",
    ]);
    expect(cervicalCancerCareSources.nccSymptoms.url).toContain("cancer.go.kr");
    expect(cervicalCancerCareSources.nccLymphedemaCare.url).toContain("S1T429C431");
    expect(cervicalCancerCareSources.kdcaHpv.url).toContain("health.kdca.go.kr");
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
    expect(cervicalCancerCarePrompts).toHaveLength(10);
    expect(cervicalCancerCarePrompts.map((item) => item.topic)).toEqual([
      "자궁경부암 추적",
      "검진·진단검사 구분",
      "치료 후 회복",
      "치료 선택 기준",
      "골반 방사선 후 폐경",
      "장·방광 후기 변화",
      "림프부종",
      "식생활·보조식품",
      "HPV·검진",
      "임신·출산 계획",
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
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[2])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료 후 생활 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[3])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료방법 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[3].question).toContain("병기");
    expect(cervicalCancerCarePrompts[3].question).toContain("출산 희망");
    expect(cervicalCancerCarePrompts[4].question).toContain("난소부전");
    expect(cervicalCancerCarePrompts[4].question).toContain("폐경 증상");
    expect(cervicalCancerCarePrompts[4].question).toContain("질협착");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[4])).toContain(
      "출처: 국가암정보센터 방사선치료의 부작용 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[5])).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[5].question).toContain("6개월 이상");
    expect(cervicalCancerCarePrompts[5].question).toContain("장폐색");
    expect(cervicalCancerCarePrompts[5].question).toContain("혈변");
    expect(cervicalCancerCarePrompts[5].question).toContain("혈뇨");
    expect(cervicalCancerCarePrompts[5].question).toContain("배변/가스 변화");
    expect(cervicalCancerCarePrompts[6].question).toContain("피부 붉어짐");
    expect(cervicalCancerCarePrompts[6].question).toContain("의료진에게 바로 연락");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[6])).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[7])).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/",
    );
    expect(cervicalCancerCarePrompts[7].question).toContain("민간요법·건강보조식품");
    expect(cervicalCancerCarePrompts[8].question).toContain("접종 후에도 자궁경부암 선별검사");
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[8])).toContain(
      "출처: 질병관리청 국가건강정보포털 자궁경부암 백신 - https://health.kdca.go.kr/",
    );
    expect(buildCervicalCancerCarePromptQuestion(cervicalCancerCarePrompts[9])).toContain(
      "출처: 국가암정보센터 자궁경부암 임신과 출산 - https://www.cancer.go.kr/",
    );
  });

  it("avoids direct treatment instructions in cervical-cancer care copy", () => {
    const text = careItems.map((item) => Object.values(item).join(" ")).join(" ");
    const treatmentOrders = ["복용하세요", "중단하세요", "치료하세요", "운동하세요", "투약하세요", "처방하세요"];

    expect(treatmentOrders.every((term) => !text.includes(term))).toBe(true);
  });

  it("keeps self-check copy as observation guidance", () => {
    expect(cervicalCancerCareChecks).toHaveLength(9);
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain("출혈·분비물 기록");
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain("추적검사 일정·결과");
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
    ).toContain("0기는 자궁경부 상피내암");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("방광·직장점막 침범 또는 원격전이");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "병기 설명 메모")?.detail,
    ).toContain("진료팀에 확인");
    expect(
      cervicalCancerCareChecks.find((item) => item.label === "배뇨·배변·출혈 변화 메모")?.detail,
    ).toContain("혈변·혈뇨");
    expect(cervicalCancerCareChecks.map((item) => item.label)).toContain(
      "장폐색·혈변·혈뇨 연락 메모",
    );
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
  });

  it("builds context-specific accessible labels for official source links", () => {
    expect(buildCervicalCancerCareSourceLinkLabels("nccSymptoms", "비정상 질출혈")).toEqual({
      ariaLabel: "비정상 질출혈 공식 출처 국가암정보센터 자궁경부암 일반적 증상 열기",
      title: "비정상 질출혈 공식 출처: 국가암정보센터 자궁경부암 일반적 증상",
      visibleLabel: "출처: 국가암정보센터 자궁경부암 일반적 증상",
    });
    expect(buildCervicalCancerCareSourceLinkLabels("nccScreeningSchedule", "검진 기준 빠른 확인")).toEqual({
      ariaLabel: "검진 기준 빠른 확인 공식 출처 국가암정보센터 국가암검진 검진주기 및 검진방법 열기",
      title: "검진 기준 빠른 확인 공식 출처: 국가암정보센터 국가암검진 검진주기 및 검진방법",
      visibleLabel: "출처: 국가암정보센터 국가암검진 검진주기 및 검진방법",
    });
    expect(buildCervicalCancerCareSourceLinkLabels("missing")).toEqual({
      ariaLabel: "자궁경부암 케어 공식 출처 공식 자궁경부암 케어 자료 열기",
      title: "자궁경부암 케어 공식 출처: 공식 자궁경부암 케어 자료",
      visibleLabel: "출처: 공식 자궁경부암 케어 자료",
    });
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

    expect(cervicalCancerCareRecoveryGuides).toHaveLength(9);
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

    expect(cervicalCancerCarePreventionGuides).toHaveLength(5);
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
    expect(cervicalCancerCarePreventionGuides.every((item) => item.sourceId)).toBe(true);
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
