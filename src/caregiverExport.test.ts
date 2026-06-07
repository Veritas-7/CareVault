import { describe, expect, it } from "vitest";
import {
  buildCaregiverExportContentFingerprint,
  buildCaregiverExportHtml,
  caregiverExportSectionDefaults,
  isCaregiverExportContentFingerprintStale,
  type CaregiverExportState,
} from "./caregiverExport";
import { buildLabQuestionPrompt } from "./labQuestionPrompts";
import {
  buildSymptomSupportActionNote,
  findSymptomSupportTemplate,
} from "./symptomSupportTemplates";
import {
  buildCervicalCancerAlertSymptomDraft,
  buildCervicalCancerCareItemSymptomDraft,
  cervicalCancerCareAlerts,
  cervicalCancerCareChecks,
  cervicalCancerCarePreventionGuides,
} from "./cervicalCancerCare";
import { buildVitalStandardQuestionDraft } from "./healthStandards";

const kdcaHypertensionUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28";
const kdcaHypoglycemiaUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2350";
const nccInfectionUrl = "https://www.cancer.go.kr/lay1/S1T435C439/contents.do";
const kdaCareTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const kdaTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const cervicalWarningDraft = buildCervicalCancerAlertSymptomDraft(cervicalCancerCareAlerts[0]);

const state: CaregiverExportState = {
  profile: {
    name: "QA 사용자",
    age: "56",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    waistCm: "82",
    cancerCareMode: true,
  },
  vitals: [
    {
      date: "2026-06-01",
      type: "blood-pressure",
      systolic: 132,
      diastolic: 84,
      note: "아침 측정",
    },
  ],
  visits: [
    {
      date: "2026-06-02",
      hospital: "서울암센터",
      reason: "항암 후 추적",
      summary: "혈액검사 예정",
      plan: "질문 정리",
      nextDate: "2026-06-10",
    },
  ],
  documents: [
    {
      date: "2026-06-03",
      title: '검사 결과 "A"',
      category: "lab",
      reviewStatus: "needs-review",
      nextAction: "다음 진료 질문",
      attachmentName: "result.pdf",
      attachmentStatus: "파일 확인됨",
    },
  ],
  symptoms: [
    {
      date: "2026-06-03",
      symptom: "오심",
      severity: 5,
      body: "식후 악화",
      action: "진료 때 확인",
    },
    {
      date: "2026-06-03",
      symptom: cervicalWarningDraft.symptom,
      severity: 3,
      body: cervicalWarningDraft.body,
      action: cervicalWarningDraft.action,
    },
  ],
  questions: [
    {
      date: "2026-06-10",
      topic: "부작용",
      question: "오심 조절을 어떻게 볼까요?",
      priority: "high",
      status: "open",
      answer: "",
    },
  ],
  labResults: [
    {
      date: "2026-06-01",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "낮음",
    },
  ],
  foodQuery: "브로콜리, 자몽 주스",
};

describe("caregiverExport", () => {
  it("fingerprints caregiver export content without local attachment paths", () => {
    const stateWithLocalAttachmentPath = {
      ...state,
      documents: [
        {
          ...state.documents[0],
          attachmentPath: "/Users/wj/private/result.pdf",
        },
      ],
    } as unknown as CaregiverExportState;
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithLocalAttachmentPath);
    const pathOnlyChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithLocalAttachmentPath,
      documents: [
        {
          ...stateWithLocalAttachmentPath.documents[0],
          attachmentPath: "/Users/wj/another-private-path/result.pdf",
        },
      ],
    } as unknown as CaregiverExportState);
    const foodChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithLocalAttachmentPath,
      foodQuery: "브로콜리, 자몽 주스, 생굴",
    });
    const questionChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithLocalAttachmentPath,
      questions: [
        {
          ...stateWithLocalAttachmentPath.questions[0],
          question: "오심과 생굴 섭취 기준을 어떻게 볼까요?",
        },
      ],
    });
    const foodDisabledFingerprint = buildCaregiverExportContentFingerprint(
      stateWithLocalAttachmentPath,
      { food: false },
    );
    const foodDisabledChangedFingerprint = buildCaregiverExportContentFingerprint(
      {
        ...stateWithLocalAttachmentPath,
        foodQuery: "브로콜리, 자몽 주스, 생굴",
      },
      { food: false },
    );

    expect(pathOnlyChangedFingerprint).toBe(fingerprint);
    expect(foodChangedFingerprint).not.toBe(fingerprint);
    expect(questionChangedFingerprint).not.toBe(fingerprint);
    expect(foodDisabledChangedFingerprint).toBe(foodDisabledFingerprint);
    expect(fingerprint).not.toContain("/Users/wj/private");
    expect(fingerprint).not.toContain("attachmentPath");
  });

  it("trims caregiver food queries in content fingerprints", () => {
    const fingerprint = buildCaregiverExportContentFingerprint({
      ...state,
      foodQuery: "  브로콜리, 자몽 주스  ",
    });
    const trimmedFingerprint = buildCaregiverExportContentFingerprint({
      ...state,
      foodQuery: "브로콜리, 자몽 주스",
    });

    expect(trimmedFingerprint).toBe(fingerprint);
  });

  it("ignores completed document changes in caregiver content fingerprints", () => {
    const stateWithCompletedDocument: CaregiverExportState = {
      ...state,
      documents: [
        ...state.documents,
        {
          date: "2026-06-04",
          title: "정리 완료된 예전 서류",
          category: "memo",
          reviewStatus: "done",
          nextAction: "이미 정리됨",
        },
      ],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithCompletedDocument);
    const completedDocumentChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithCompletedDocument,
      documents: [
        stateWithCompletedDocument.documents[0],
        {
          ...stateWithCompletedDocument.documents[1],
          title: "렌더링되지 않는 완료 서류 제목 변경",
          nextAction: "렌더링되지 않는 완료 서류 조치 변경",
        },
      ],
    });

    expect(completedDocumentChangedFingerprint).toBe(fingerprint);
  });

  it("ignores document category changes when an exported next action is present", () => {
    const fingerprint = buildCaregiverExportContentFingerprint(state);
    const nextActionDocumentCategoryChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...state,
      documents: [
        {
          ...state.documents[0],
          category: "memo",
        },
      ],
    });

    expect(nextActionDocumentCategoryChangedFingerprint).toBe(fingerprint);
  });

  it("ignores document attachment status changes when no filename is exported", () => {
    const stateWithoutDocumentAttachmentName: CaregiverExportState = {
      ...state,
      documents: [
        {
          date: state.documents[0].date,
          title: state.documents[0].title,
          category: state.documents[0].category,
          reviewStatus: state.documents[0].reviewStatus,
          nextAction: state.documents[0].nextAction,
          attachmentStatus: "파일 선택 전",
        },
      ],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithoutDocumentAttachmentName);
    const attachmentStatusChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithoutDocumentAttachmentName,
      documents: [
        {
          ...stateWithoutDocumentAttachmentName.documents[0],
          attachmentStatus: "렌더링되지 않는 첨부 상태 변경",
        },
      ],
    });

    expect(attachmentStatusChangedFingerprint).toBe(fingerprint);
  });

  it("ignores closed question changes in caregiver content fingerprints", () => {
    const stateWithClosedQuestion: CaregiverExportState = {
      ...state,
      questions: [
        ...state.questions,
        {
          date: "2026-06-11",
          topic: "완료된 질문",
          question: "이미 답변된 질문",
          priority: "routine",
          status: "answered",
          answer: "진료 때 확인 완료",
        },
      ],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithClosedQuestion);
    const closedQuestionChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithClosedQuestion,
      questions: [
        stateWithClosedQuestion.questions[0],
        {
          ...stateWithClosedQuestion.questions[1],
          question: "렌더링되지 않는 완료 질문 변경",
          answer: "렌더링되지 않는 완료 답변 변경",
        },
      ],
    });

    expect(closedQuestionChangedFingerprint).toBe(fingerprint);
  });

  it("ignores internal open-question ids in caregiver content fingerprints", () => {
    const stateWithQuestionId = {
      ...state,
      questions: [
        {
          id: "question-internal-1",
          ...state.questions[0],
        },
      ],
    } as unknown as CaregiverExportState;
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithQuestionId);
    const questionIdChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithQuestionId,
      questions: [
        {
          ...stateWithQuestionId.questions[0],
          id: "question-internal-2",
        },
      ],
    } as unknown as CaregiverExportState);

    expect(questionIdChangedFingerprint).toBe(fingerprint);
  });

  it("checks caregiver content freshness against the preview section snapshot", () => {
    const previewSections = {
      food: true,
    };
    const previewFingerprint = buildCaregiverExportContentFingerprint(state, previewSections);

    expect(
      isCaregiverExportContentFingerprintStale(state, previewFingerprint, previewSections),
    ).toBe(false);
    expect(
      isCaregiverExportContentFingerprintStale(state, previewFingerprint, { food: false }),
    ).toBe(true);
    expect(
      isCaregiverExportContentFingerprintStale(
        {
          ...state,
          foodQuery: `${state.foodQuery}, 생굴`,
        },
        previewFingerprint,
        previewSections,
      ),
    ).toBe(true);
  });

  it("ignores visit summary changes when an exported visit plan is present", () => {
    const fingerprint = buildCaregiverExportContentFingerprint(state);
    const summaryOnlyChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...state,
      visits: [
        {
          ...state.visits[0],
          summary: "계획이 있으면 보호자 공유본에 직접 렌더링되지 않는 방문 요약 변경",
        },
      ],
    });

    expect(summaryOnlyChangedFingerprint).toBe(fingerprint);
  });

  it("ignores undated visit changes in caregiver content fingerprints", () => {
    const stateWithUndatedVisit: CaregiverExportState = {
      ...state,
      visits: [
        ...state.visits,
        {
          date: "",
          hospital: "날짜 없는 병원",
          reason: "렌더링되지 않는 방문 사유",
          summary: "렌더링되지 않는 방문 요약",
          plan: "렌더링되지 않는 방문 계획",
          nextDate: "",
        },
      ],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithUndatedVisit);
    const undatedVisitChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithUndatedVisit,
      visits: [
        stateWithUndatedVisit.visits[0],
        {
          ...stateWithUndatedVisit.visits[1],
          hospital: "렌더링되지 않는 날짜 없는 병원 변경",
          plan: "렌더링되지 않는 날짜 없는 방문 계획 변경",
        },
      ],
    });

    expect(undatedVisitChangedFingerprint).toBe(fingerprint);
  });

  it("ignores malformed visit changes in caregiver content fingerprints", () => {
    const stateWithMalformedVisit: CaregiverExportState = {
      ...state,
      visits: [
        ...state.visits,
        {
          date: "2026-02-31",
          hospital: "깨진 날짜 병원",
          reason: "렌더링되지 않는 방문 사유",
          summary: "렌더링되지 않는 방문 요약",
          plan: "렌더링되지 않는 방문 계획",
          nextDate: "",
        },
      ],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithMalformedVisit);
    const malformedVisitChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithMalformedVisit,
      visits: [
        stateWithMalformedVisit.visits[0],
        {
          ...stateWithMalformedVisit.visits[1],
          hospital: "렌더링되지 않는 깨진 날짜 병원 변경",
          plan: "렌더링되지 않는 깨진 날짜 방문 계획 변경",
        },
      ],
    });

    expect(malformedVisitChangedFingerprint).toBe(fingerprint);
  });

  it("ignores internal lab ids in caregiver content fingerprints", () => {
    const stateWithLabId = {
      ...state,
      labResults: [
        {
          id: "lab-internal-1",
          ...state.labResults[0],
        },
      ],
    } as unknown as CaregiverExportState;
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithLabId);
    const labIdChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithLabId,
      labResults: [
        {
          ...stateWithLabId.labResults[0],
          id: "lab-internal-2",
        },
      ],
    } as unknown as CaregiverExportState);

    expect(labIdChangedFingerprint).toBe(fingerprint);
  });

  it("ignores old normal lab note changes outside caregiver-rendered lab scope", () => {
    const recentNormalLabs = Array.from({ length: 5 }, (_, index) => ({
      date: `2026-06-${String(10 - index).padStart(2, "0")}`,
      name: `정상 검사 ${index + 1}`,
      value: "5.0",
      unit: "mg/dL",
      lower: "4.0",
      upper: "6.0",
      note: "정상 범위",
    }));
    const oldNormalLab = {
      date: "2026-05-01",
      name: "오래된 정상 검사",
      value: "5.0",
      unit: "mg/dL",
      lower: "4.0",
      upper: "6.0",
      note: "렌더링되지 않는 오래된 정상 메모",
    };
    const stateWithHiddenNormalLab: CaregiverExportState = {
      ...state,
      labResults: [...recentNormalLabs, ...state.labResults, oldNormalLab],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithHiddenNormalLab);
    const hiddenNormalLabChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithHiddenNormalLab,
      labResults: [
        ...recentNormalLabs,
        state.labResults[0],
        {
          ...oldNormalLab,
          note: "렌더링되지 않는 오래된 정상 메모 변경",
        },
      ],
    });

    expect(hiddenNormalLabChangedFingerprint).toBe(fingerprint);
  });

  it("ignores old normal vital note changes outside caregiver-rendered vital scope", () => {
    const recentNormalVitals = Array.from({ length: 5 }, (_, index) => ({
      date: `2026-06-${String(10 - index).padStart(2, "0")}`,
      type: "blood-pressure",
      systolic: 110,
      diastolic: 70,
      note: "정상 혈압",
    }));
    const oldNormalVital = {
      date: "2026-05-01",
      type: "blood-pressure",
      systolic: 110,
      diastolic: 70,
      note: "렌더링되지 않는 오래된 정상 혈압 메모",
    };
    const stateWithHiddenNormalVital: CaregiverExportState = {
      ...state,
      vitals: [...recentNormalVitals, ...state.vitals, oldNormalVital],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithHiddenNormalVital);
    const hiddenNormalVitalChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithHiddenNormalVital,
      vitals: [
        ...recentNormalVitals,
        state.vitals[0],
        {
          ...oldNormalVital,
          note: "렌더링되지 않는 오래된 정상 혈압 메모 변경",
        },
      ],
    });

    expect(hiddenNormalVitalChangedFingerprint).toBe(fingerprint);
  });

  it("ignores non-rendered latest vital fields outside the vital type", () => {
    const stateWithMixedLatestVital: CaregiverExportState = {
      ...state,
      vitals: [
        {
          date: "2026-06-12",
          type: "blood-pressure",
          systolic: 118,
          diastolic: 74,
          glucoseMgDl: 111,
          glucoseContext: "after-meal",
          temperatureC: 37.1,
          note: "혈압 기록",
        },
        ...state.vitals,
      ],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithMixedLatestVital);
    const hiddenVitalFieldsChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithMixedLatestVital,
      vitals: [
        {
          ...stateWithMixedLatestVital.vitals[0],
          glucoseMgDl: 188,
          glucoseContext: "fasting",
          temperatureC: 38.1,
        },
        ...state.vitals,
      ],
    });

    expect(hiddenVitalFieldsChangedFingerprint).toBe(fingerprint);
  });

  it("tracks rendered latest vital field changes", () => {
    const stateWithLatestVital: CaregiverExportState = {
      ...state,
      vitals: [
        {
          date: "2026-06-12",
          type: "blood-pressure",
          systolic: 118,
          diastolic: 74,
          note: "혈압 기록",
        },
        ...state.vitals,
      ],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithLatestVital);
    const latestVitalChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithLatestVital,
      vitals: [
        {
          ...stateWithLatestVital.vitals[0],
          systolic: 142,
        },
        ...state.vitals,
      ],
    });

    expect(latestVitalChangedFingerprint).not.toBe(fingerprint);
  });

  it("ignores old low-risk symptom changes outside caregiver-rendered symptom scope", () => {
    const recentLowRiskSymptoms = Array.from({ length: 5 }, (_, index) => ({
      date: `2026-06-${String(10 - index).padStart(2, "0")}`,
      symptom: `최근 일반 증상 ${index + 1}`,
      severity: 2,
      body: "최근 경과",
      action: "관찰",
    }));
    const oldLowRiskSymptom = {
      date: "2026-05-01",
      symptom: "가벼운 불편감",
      severity: 2,
      body: "렌더링되지 않는 오래된 일반 증상 메모",
      action: "휴식 후 관찰",
    };
    const stateWithHiddenLowRiskSymptom: CaregiverExportState = {
      ...state,
      symptoms: [...recentLowRiskSymptoms, ...state.symptoms, oldLowRiskSymptom],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithHiddenLowRiskSymptom);
    const hiddenLowRiskSymptomChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithHiddenLowRiskSymptom,
      symptoms: [
        ...recentLowRiskSymptoms,
        ...state.symptoms,
        {
          ...oldLowRiskSymptom,
          body: "렌더링되지 않는 오래된 일반 증상 메모 변경",
          action: "렌더링되지 않는 오래된 일반 증상 조치 변경",
        },
      ],
    });

    expect(hiddenLowRiskSymptomChangedFingerprint).toBe(fingerprint);
  });

  it("ignores old high-risk symptom body changes when caregiver queue renders the action detail", () => {
    const recentLowRiskSymptoms = Array.from({ length: 5 }, (_, index) => ({
      date: `2026-06-${String(10 - index).padStart(2, "0")}`,
      symptom: `최근 일반 증상 ${index + 1}`,
      severity: 2,
      body: "최근 경과",
      action: "관찰",
    }));
    const oldHighRiskSymptom = {
      date: "2026-05-01",
      symptom: "호흡곤란",
      severity: 8,
      body: "큐 상세에 직접 렌더링되지 않는 오래된 증상 메모",
      action: "의료진에게 호흡곤란 악화 여부 상담",
    };
    const stateWithHiddenHighRiskBody: CaregiverExportState = {
      ...state,
      symptoms: [...recentLowRiskSymptoms, ...state.symptoms, oldHighRiskSymptom],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithHiddenHighRiskBody);
    const hiddenHighRiskBodyChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithHiddenHighRiskBody,
      symptoms: [
        ...recentLowRiskSymptoms,
        ...state.symptoms,
        {
          ...oldHighRiskSymptom,
          body: "큐 상세에 직접 렌더링되지 않는 오래된 증상 메모 변경",
        },
      ],
    });

    expect(hiddenHighRiskBodyChangedFingerprint).toBe(fingerprint);
  });

  it("tracks old high-risk symptom action changes in the caregiver queue scope", () => {
    const recentLowRiskSymptoms = Array.from({ length: 5 }, (_, index) => ({
      date: `2026-06-${String(10 - index).padStart(2, "0")}`,
      symptom: `최근 일반 증상 ${index + 1}`,
      severity: 2,
      body: "최근 경과",
      action: "관찰",
    }));
    const oldHighRiskSymptom = {
      date: "2026-05-01",
      symptom: "호흡곤란",
      severity: 8,
      body: "호흡곤란 악화",
      action: "의료진에게 호흡곤란 악화 여부 상담",
    };
    const stateWithQueueHighRiskSymptom: CaregiverExportState = {
      ...state,
      symptoms: [...recentLowRiskSymptoms, ...state.symptoms, oldHighRiskSymptom],
    };
    const fingerprint = buildCaregiverExportContentFingerprint(stateWithQueueHighRiskSymptom);
    const queueHighRiskActionChangedFingerprint = buildCaregiverExportContentFingerprint({
      ...stateWithQueueHighRiskSymptom,
      symptoms: [
        ...recentLowRiskSymptoms,
        ...state.symptoms,
        {
          ...oldHighRiskSymptom,
          action: "당일 진료팀에 호흡곤란 악화 여부를 문의",
        },
      ],
    });

    expect(queueHighRiskActionChangedFingerprint).not.toBe(fingerprint);
  });

  it("fingerprints only exported profile fields when caregiver profile is redacted", () => {
    const redactedFingerprint = buildCaregiverExportContentFingerprint(
      state,
      caregiverExportSectionDefaults,
      { redactProfile: true },
    );
    const redactedProfileOnlyChangedFingerprint = buildCaregiverExportContentFingerprint(
      {
        ...state,
        profile: {
          ...state.profile,
          heightCm: "170",
          name: "다른 보호자 공유 대상",
          waistCm: "90",
          weightKg: "70",
        },
      },
      caregiverExportSectionDefaults,
      { redactProfile: true },
    );
    const visibleProfileChangedFingerprint = buildCaregiverExportContentFingerprint(
      {
        ...state,
        profile: {
          ...state.profile,
          name: "다른 보호자 공유 대상",
        },
      },
      caregiverExportSectionDefaults,
      { redactProfile: false },
    );
    const redactedScreeningChangedFingerprint = buildCaregiverExportContentFingerprint(
      {
        ...state,
        profile: {
          ...state.profile,
          age: "19",
        },
      },
      caregiverExportSectionDefaults,
      { redactProfile: true },
    );

    expect(redactedProfileOnlyChangedFingerprint).toBe(redactedFingerprint);
    expect(visibleProfileChangedFingerprint).not.toBe(
      buildCaregiverExportContentFingerprint(state, caregiverExportSectionDefaults, {
        redactProfile: false,
      }),
    );
    expect(redactedScreeningChangedFingerprint).not.toBe(redactedFingerprint);
  });

  it("ignores diabetes changes for redacted caregiver previews when vitals are excluded", () => {
    const sectionsWithoutVitals = {
      ...caregiverExportSectionDefaults,
      vitals: false,
    };
    const redactedFingerprint = buildCaregiverExportContentFingerprint(
      state,
      sectionsWithoutVitals,
      { redactProfile: true },
    );
    const diabetesOnlyChangedFingerprint = buildCaregiverExportContentFingerprint(
      {
        ...state,
        profile: {
          ...state.profile,
          diabetes: true,
        },
      },
      sectionsWithoutVitals,
      { redactProfile: true },
    );

    expect(diabetesOnlyChangedFingerprint).toBe(redactedFingerprint);
  });

  it("builds a read-only caregiver HTML summary", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z");

    expect(html).toContain("<title>CareVault 보호자 공유본</title>");
    expect(html).toContain("56세 · 여성 · 164cm / 62kg");
    expect(html).toContain("허리 82cm");
    expect(html).toContain("서울암센터");
    expect(html).toContain("오심 조절을 어떻게 볼까요?");
    expect(html).toContain("이번 진료 우선");
    expect(html).toContain("면역저하 검사 연결");
    expect(html).toContain("2026-06-01 WBC 3.4 10^3/uL");
    expect(html).toContain("국가암정보센터 증상별 식생활 - 면역기능의 저하");
    expect(html).toContain("첨부 파일명만 포함");
    expect(html).toContain("result.pdf");
    expect(html).toContain("진단, 처방, 치료 지시가 아니며");
  });

  it("omits malformed visit dates from caregiver upcoming visits", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        visits: [
          ...state.visits,
          {
            date: "2026-02-31",
            hospital: "깨진 날짜 병원",
            reason: "복원 오류",
            summary: "렌더링되지 않아야 하는 요약",
            plan: "렌더링되지 않아야 하는 계획",
            nextDate: "",
          },
        ],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("서울암센터");
    expect(html).not.toContain("깨진 날짜 병원");
    expect(html).not.toContain("렌더링되지 않아야 하는 계획");
  });

  it("omits malformed recent clinical row dates from caregiver summaries", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        symptoms: [
          ...state.symptoms,
          {
            date: "2026-06-31",
            symptom: "깨진 날짜 증상",
            severity: 1,
            body: "렌더링되지 않아야 하는 증상",
            action: "",
          },
        ],
        labResults: [
          ...state.labResults,
          {
            date: "2026-02-31",
            name: "WBC",
            value: "5.4",
            unit: "10^3/uL",
            lower: "4.0",
            upper: "10.0",
            note: "렌더링되지 않아야 하는 검사",
          },
        ],
        vitals: [
          ...state.vitals,
          {
            date: "2026-13-01",
            type: "blood-pressure",
            systolic: 118,
            diastolic: 76,
            note: "렌더링되지 않아야 하는 혈압",
          },
        ],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("2026-06-01 WBC 3.4 10^3/uL");
    expect(html).toContain("혈압 132/84 mmHg");
    expect(html).toContain("오심");
    expect(html).not.toContain("깨진 날짜 증상");
    expect(html).not.toContain("렌더링되지 않아야 하는 증상");
    expect(html).not.toContain("렌더링되지 않아야 하는 검사");
    expect(html).not.toContain("렌더링되지 않아야 하는 혈압");
    expect(html).not.toContain("2026-06-31");
    expect(html).not.toContain("2026-02-31");
    expect(html).not.toContain("2026-13-01");
  });

  it("omits malformed active task dates from caregiver summaries and care queue", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        questions: [
          ...state.questions,
          {
            date: "2026-06-31",
            topic: "깨진 날짜 질문",
            question: "렌더링되지 않아야 하는 질문",
            priority: "high",
            status: "open",
            answer: "",
          },
        ],
        documents: [
          ...state.documents,
          {
            date: "2026-02-31",
            title: "깨진 날짜 서류",
            category: "lab",
            reviewStatus: "needs-review",
            nextAction: "렌더링되지 않아야 하는 서류 조치",
            attachmentName: "bad-date.pdf",
            attachmentStatus: "파일 확인됨",
          },
        ],
        labResults: [
          ...state.labResults,
          {
            date: "2026-13-01",
            name: "ANC",
            value: "0.4",
            unit: "10^3/uL",
            lower: "1.5",
            upper: "8.0",
            note: "렌더링되지 않아야 하는 큐 검사",
          },
        ],
        symptoms: [
          ...state.symptoms,
          {
            date: "2026-11-31",
            symptom: "고열",
            severity: 8,
            body: "렌더링되지 않아야 하는 큐 증상",
            action: "진료팀 확인",
          },
        ],
        vitals: [
          ...state.vitals,
          {
            date: "2026-12-32",
            type: "temperature",
            temperatureC: 39.1,
            note: "렌더링되지 않아야 하는 큐 체온",
          },
        ],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("오심 조절을 어떻게 볼까요?");
    expect(html).toContain("검사 결과 &quot;A&quot;");
    expect(html).toContain("2026-06-01 WBC 3.4 10^3/uL");
    expect(html).not.toContain("깨진 날짜 질문");
    expect(html).not.toContain("렌더링되지 않아야 하는 질문");
    expect(html).not.toContain("깨진 날짜 서류");
    expect(html).not.toContain("렌더링되지 않아야 하는 서류 조치");
    expect(html).not.toContain("렌더링되지 않아야 하는 큐 검사");
    expect(html).not.toContain("렌더링되지 않아야 하는 큐 증상");
    expect(html).not.toContain("렌더링되지 않아야 하는 큐 체온");
    expect(html).not.toContain("2026-06-31");
    expect(html).not.toContain("2026-02-31");
    expect(html).not.toContain("2026-13-01");
    expect(html).not.toContain("2026-11-31");
    expect(html).not.toContain("2026-12-32");
  });

  it("opens every caregiver export source link outside the share document", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z");
    const anchors = html.match(/<a\b[^>]*>/g) ?? [];

    expect(anchors.length).toBeGreaterThan(0);
    expect(
      anchors.filter(
        (anchor) =>
          !anchor.includes('target="_blank"') || !anchor.includes('rel="noreferrer"'),
      ),
    ).toEqual([]);
  });

  it("keeps vital units and glucose measurement context in caregiver rows", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        profile: { ...state.profile, diabetes: true },
        vitals: [
          ...state.vitals,
          {
            date: "2026-06-04",
            type: "glucose",
            glucoseMgDl: 181,
            glucoseContext: "after-meal",
            note: "점심 식후 2시간",
          },
        ],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("혈압 132/84 mmHg");
    expect(html).toContain("2026-06-04 혈당 181 mg/dL (식후 2시간)");
    expect(html).toContain("점심 식후 2시간");
    expect(html).toContain(
      '<span class="source-label">성인 남녀 공통 한국 성인 혈압</span> 고혈압 전단계 범위',
    );
    expect(html).toContain(
      `근거: <a href="${kdcaHypertensionUrl}" target="_blank" rel="noreferrer">질병관리청 국가건강정보포털 고혈압</a>`,
    );
    expect(html).toContain(
      '<span class="source-label">성인 남녀 공통 당뇨 추적 혈당</span> 식후 목표 초과',
    );
    expect(html).toContain(
      `근거: <a href="${kdaCareTargetUrl}" target="_blank" rel="noreferrer">대한당뇨병학회 당뇨병 관리 목표</a>`,
    );
  });

  it("includes a caregiver care queue derived from enabled share sections", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z");

    expect(html).toContain("<h2>진료 준비 큐</h2>");
    expect(html).toContain("포함된 공유 섹션의 저장 기록과 프로필 기반 검진 빠른 확인에서 가져온 항목입니다.");
    expect(html).toContain("새 진단, 처방, 치료 지시가 아닙니다.");
    expect(html).toContain("증상 · 자궁경부암 경고 기록");
    expect(html).toContain("비정상 질출혈");
    expect(html).toContain("자궁경부암 경고 신호 기록 초안");
    expect(html).toContain("양·색·냄새/통증 정도");
    expect(html).toContain("동반 증상");
    expect(html).toContain("menu_seq=4888");
    expect(html).toContain("질문 · 이번 진료 우선");
    expect(html).toContain("활력 · 고혈압 전단계 범위");
    expect(html).toContain("혈압 132/84 mmHg");
    expect(html).toContain("검사 · 기준보다 낮음");
    expect(html).toContain("자궁경부암 · 국가암검진 대상 기준 해당");
    expect(html).toContain("자궁경부암 검진 기준 빠른 확인");
    expect(html).toContain("https://www.cancer.go.kr/lay1/S1T553C554/contents.do");
  });

  it("includes source-backed fever or chills symptoms in caregiver care queues", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "38도 발열과 오한",
            severity: 3,
            body: "체온 38.2℃와 오한 지속",
            action: "배뇨 통증과 카테터 부위 발적 여부 확인",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("증상 · 감염 의심 기록");
    expect(html).toContain("38도 발열과 오한 3/10");
    expect(html).toContain("국가암정보센터 감염 의료진 상담 기준");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/S1T435C439/contents.do" target="_blank" rel="noreferrer">국가암정보센터 감염 의료진 상담 기준</a>',
    );
  });

  it("keeps repeated caregiver care queue evidence link labels clean", () => {
    const kdcaVaccineUrl = "https://health.kdca.go.kr/vaccine";
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-04",
            symptom: "38도 발열과 오한",
            severity: 3,
            body: "체온 38.2℃, 오한 30분 지속",
            action: [
              "배뇨 통증과 카테터 부위 발적 여부를 같이 확인",
              `출처: 질병관리청 국가건강정보포털 자궁경부암 백신 - ${kdcaVaccineUrl}`,
              `출처: 국가암정보센터 감염 의료진 상담 기준 - ${nccInfectionUrl}`,
            ].join("\n"),
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-04T10:00:00.000Z",
    );

    expect(html).toContain("증상 · 감염 의심 기록");
    expect(html).toContain(
      `<a href="${kdcaVaccineUrl}" target="_blank" rel="noreferrer">질병관리청 국가건강정보포털 자궁경부암 백신</a>`,
    );
    expect(html).toContain(
      `<a href="${nccInfectionUrl}" target="_blank" rel="noreferrer">국가암정보센터 감염 의료진 상담 기준</a>`,
    );
    expect(html).toContain(
      `근거: <a href="${kdcaVaccineUrl}" target="_blank" rel="noreferrer">질병관리청 국가건강정보포털 자궁경부암 백신</a> / <a href="${nccInfectionUrl}" target="_blank" rel="noreferrer">국가암정보센터 감염 의료진 상담 기준</a>`,
    );
    expect(html).not.toContain("> / 근거: 국가암정보센터 감염 의료진 상담 기준</a>");
    expect(html).not.toContain(">/ 근거: 국가암정보센터 감염 의료진 상담 기준</a>");
    expect(html).not.toContain("출처: 국가암정보센터 감염 의료진 상담 기준");
  });

  it("includes source-backed cancer-pain symptoms in caregiver care queues", () => {
    const painTemplate = findSymptomSupportTemplate("통증점수와 진통제 효과")!;
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "등 통증",
            severity: 8,
            body: "밤에 악화",
            action: buildSymptomSupportActionNote(painTemplate),
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("증상 · 고위험 증상");
    expect(html).toContain("등 통증 8/10");
    expect(html).toContain("국가암정보센터 통증평가 항목");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/S1T378C380/contents.do" target="_blank" rel="noreferrer">국가암정보센터 통증평가 항목</a>',
    );
    expect(html).not.toContain("출처: 국가암정보센터 통증평가 항목");
  });

  it("includes source-backed cervical general-warning symptoms in caregiver care queues", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "성교 후 출혈과 악취 분비물",
            severity: 3,
            body: "생리기간이 아닌 출혈과 분비물 색, 냄새, 양 변화",
            action: "발생 시점과 운동·배변·질세척 후 발생 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("증상 · 자궁경부암 증상 변화 기록");
    expect(html).toContain("성교 후 출혈과 악취 분비물 3/10");
    expect(html).toContain("국가암정보센터 자궁경부암 일반적 증상");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&amp;menu_seq=4888" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 일반적 증상</a>',
    );
  });

  it("includes source-backed cervical urinary or bowel changes in caregiver care queues", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "혈뇨와 혈변",
            severity: 4,
            body: "방사선치료 후 6개월 이상 지난 뒤 소변과 대변 색 변화",
            action: "날짜, 양, 통증, 발열 동반 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("증상 · 배뇨·배변 변화 기록");
    expect(html).toContain("혈뇨와 혈변 4/10");
    expect(html).toContain("국가암정보센터 자궁경부암 치료의 부작용");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&amp;menu_seq=4894" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 치료의 부작용</a>',
    );
  });

  it("formats source-backed questions with separated evidence in caregiver exports", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-20",
            topic: "부작용: 질건조·성교통/성생활 상담",
            question:
              "성생활 재개 시점을 어떻게 상담할까요?\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373\n출처: 국가암정보센터 보완대체요법 상담 - https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
            priority: "next-visit",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("성생활 재개 시점을 어떻게 상담할까요?");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&amp;menu_seq=5373" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 성생활</a>',
    );
    expect(html).toContain(
      '<a href="https://www.cancer.go.kr/lay1/S1T365C368/contents.do" target="_blank" rel="noreferrer">국가암정보센터 보완대체요법 상담</a>',
    );
    expect(html).not.toContain("출처: 국가암정보센터 자궁경부암 성생활");
    expect(html).not.toContain("출처: 국가암정보센터 보완대체요법 상담");
  });

  it("formats generated lab follow-up question evidence in caregiver exports", () => {
    const labQuestion = buildLabQuestionPrompt(
      {
        date: "2026-06-03",
        name: "HDL-C",
        value: "38",
        unit: "mg/dL",
        lower: "50",
        upper: "",
        note: `대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용\n출처: 대한당뇨병학회 당뇨병 관리 목표 - ${kdaTargetUrl}`,
      },
      {
        flag: "low",
        label: "기준보다 낮음",
        level: "watch",
        summary: "검사실 기준보다 낮습니다.",
      },
    );
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-15",
            topic: "검사 수치",
            question: labQuestion,
            priority: "high",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain(
      "2026-06-03 HDL-C 38 mg/dL가 기준 50 mg/dL 이상보다 낮게 기록됐습니다.",
    );
    expect(html).toContain(
      "기존 메모/근거: 대한당뇨병학회 일반 목표 기준입니다. / 적용 기준: 여성 기준 적용",
    );
    expect(html).toContain(
      `근거: <a href="${kdaTargetUrl.replace(/&/g, "&amp;")}" target="_blank" rel="noreferrer">대한당뇨병학회 당뇨병 관리 목표</a>`,
    );
    expect(html).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("formats generated vital standard question evidence in caregiver exports", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "주의혈압 범위",
      assessmentSummary: "한국 성인 남녀 공통 기준 주의혈압입니다. 추세가 오르는지 확인하세요.",
      measurementLabel: "혈압 128/78 mmHg",
      standardId: "blood-pressure",
    });
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-15",
            topic: vitalQuestion?.topic ?? "",
            question: vitalQuestion?.question ?? "",
            priority: "next-visit",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("혈압 기준 확인");
    expect(html).toContain("혈압 128/78 mmHg 기록");
    expect(html).toContain(
      `근거: <a href="${kdcaHypertensionUrl}" target="_blank" rel="noreferrer">질병관리청 국가건강정보포털 고혈압</a>`,
    );
    expect(html).not.toContain("출처: 질병관리청 국가건강정보포털 고혈압");
  });

  it("formats generated glucose standard question evidence in caregiver exports", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "식전 목표 범위",
      assessmentSummary:
        "대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식전 80-130 mg/dL 범위를 제시합니다.",
      measurementLabel: "혈당 118 mg/dL (식전)",
      standardId: "glucose-care",
    });
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [
          {
            date: "2026-06-15",
            topic: vitalQuestion?.topic ?? "",
            question: vitalQuestion?.question ?? "",
            priority: "next-visit",
            status: "open",
            answer: "",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("혈당 기준 확인");
    expect(html).toContain("혈당 118 mg/dL (식전) 기록");
    expect(html).toContain(
      `근거: <a href="${kdaCareTargetUrl}" target="_blank" rel="noreferrer">대한당뇨병학회 당뇨병 관리 목표</a>`,
    );
    expect(html).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("formats source-backed recent symptom notes as separated caregiver evidence", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-21",
            symptom: "질건조와 성교통",
            severity: 3,
            body:
              "방사선치료 후 질건조와 통증이 언제 시작됐는지 기록합니다.\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
            action:
              "진료 전 재개 시점과 윤활제 상담 질문을 적습니다 출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("방사선치료 후 질건조와 통증이 언제 시작됐는지 기록합니다.");
    expect(html).toContain('<span class="source-label">증상 기록</span>');
    expect(html).toContain("진료 전 재개 시점과 윤활제 상담 질문을 적습니다");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&amp;menu_seq=5373" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 성생활</a>',
    );
    expect(html).not.toContain("출처: 국가암정보센터 자궁경부암 성생활");
  });

  it("labels generated cervical prevention memo records in caregiver recent symptoms", () => {
    const draft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCarePreventionGuides.find((item) => item.label === "HPV 백신 가족 안내")!,
    );
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-21",
            symptom: draft.symptom,
            severity: 3,
            body: draft.body,
            action: draft.action,
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("HPV 백신 가족 안내 3/10");
    expect(html).toContain('<span class="source-label">자궁경부암 기록 메모</span>');
    expect(html).toContain("접종 후에도 자궁경부암 선별검사는 변경 없이");
    expect(html).toContain("HPV 백신 가족 안내 내용을 다음 진료 때 진료팀에 확인");
    expect(html).toContain(
      '근거: <a href="https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=3987" target="_blank" rel="noreferrer">질병관리청 국가건강정보포털 자궁경부암 백신</a>',
    );
    expect(html).not.toContain("출처: 질병관리청 국가건강정보포털 자궁경부암 백신");
  });

  it("labels markerless source-backed cervical warning records in caregiver recent symptoms", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-21",
            symptom: "성교 후 출혈과 악취 분비물",
            severity: 3,
            body: "생리기간이 아닌 출혈과 분비물 색, 냄새, 양 변화",
            action:
              "발생 시점과 운동·배변·질세척 후 발생 여부를 기록\n출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("성교 후 출혈과 악취 분비물 3/10");
    expect(html).toContain('<span class="source-label">자궁경부암 경고 기록</span>');
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&amp;menu_seq=4888" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 일반적 증상</a>',
    );
    expect(html).not.toContain("자궁경부암 경고 신호 기록 초안");
  });

  it("includes source-backed cervical bowel-obstruction changes in caregiver care queues", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: "장폐색과 복부팽만",
            severity: 4,
            body: "방사선치료 후 6개월 이상 지난 뒤 배변과 가스 배출 변화",
            action: "복부팽만, 구토, 통증 동반 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("증상 · 장폐색 확인 기록");
    expect(html).toContain("장폐색과 복부팽만 4/10");
    expect(html).toContain("국가암정보센터 자궁경부암 치료의 부작용");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&amp;menu_seq=4894" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 치료의 부작용</a>',
    );
  });

  it("includes generated cervical record-check drafts in caregiver care queues", () => {
    const lymphedemaDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "림프부종 감염·악화 신호")!,
    );
    const lateBowelBladderDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "장폐색·혈변·혈뇨 연락 메모")!,
    );
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [
          {
            date: "2026-06-03",
            symptom: lymphedemaDraft.symptom,
            severity: 3,
            body: lymphedemaDraft.body,
            action: lymphedemaDraft.action,
          },
          {
            date: "2026-06-03",
            symptom: lateBowelBladderDraft.symptom,
            severity: 3,
            body: lateBowelBladderDraft.body,
            action: lateBowelBladderDraft.action,
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("증상 · 림프부종 확인 기록");
    expect(html).toContain("림프부종 감염·악화 신호 3/10");
    expect(html).toContain("림프부종 감염·악화 신호 내용을 다음 진료 때 진료팀에 확인");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/S1T429C431/contents.do" target="_blank" rel="noreferrer">국가암정보센터 림프부종 치료 전후관리</a>',
    );
    expect(html).not.toContain("출처: 국가암정보센터 림프부종 치료 전후관리");
    expect(html).toContain("증상 · 장폐색 확인 기록");
    expect(html).toContain("장폐색·혈변·혈뇨 연락 메모 3/10");
    expect(html).toContain("장폐색·혈변·혈뇨 연락 메모 내용을 다음 진료 때 진료팀에 확인");
    expect(html).toContain("복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&amp;menu_seq=4894" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 치료의 부작용</a>',
    );
    expect(html).not.toContain("출처: 국가암정보센터 자궁경부암 치료의 부작용");
  });

  it("keeps source-backed lab queue details separated in caregiver care queues", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        labResults: [
          {
            date: "2026-06-04",
            name: "HDL-C",
            value: "38",
            unit: "mg/dL",
            lower: "50",
            upper: "",
            note: `대한당뇨병학회 일반 목표 기준입니다.\n적용 기준: 여성 기준 적용\n출처: 대한당뇨병학회 당뇨병 관리 목표 - ${kdaTargetUrl}`,
          },
        ],
        profile: { ...state.profile, cancerCareMode: false },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-04T10:00:00.000Z",
    );

    expect(html).toContain("검사 · 기준보다 낮음");
    expect(html).toContain("HDL-C 38 mg/dL");
    expect(html).toContain("기준 50 mg/dL 이상");
    expect(html).toContain("적용 기준: 여성 기준 적용");
    expect(html).toContain(
      `대한당뇨병학회 일반 목표 기준입니다.<br>적용 기준: 여성 기준 적용 / 검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요. / 근거: <a href="${kdaTargetUrl.replace(/&/g, "&amp;")}" target="_blank" rel="noreferrer">대한당뇨병학회 당뇨병 관리 목표</a>`,
    );
    expect(html).toContain(
      `대한당뇨병학회 일반 목표 기준입니다.<br>적용 기준: 여성 기준 적용 / 근거: <a href="${kdaTargetUrl.replace(/&/g, "&amp;")}" target="_blank" rel="noreferrer">대한당뇨병학회 당뇨병 관리 목표</a>`,
    );
    expect(html).not.toContain(`근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`);
    expect(html).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("keeps high-risk vital queue details source-backed in caregiver care queues", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: false, diabetes: true },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            date: "2026-06-04",
            type: "blood-pressure",
            systolic: 182,
            diastolic: 121,
            note: "두통 동반 반복 측정",
          },
          {
            date: "2026-06-04",
            type: "glucose",
            glucoseMgDl: 66,
            glucoseContext: "random",
            note: "식은땀과 떨림",
          },
        ],
      },
      "2026-06-04T10:00:00.000Z",
    );

    expect(html).toContain("활력 · 고혈압 위기 가능 범위");
    expect(html).toContain("혈압 182/121 mmHg");
    expect(html).toContain("두통 동반 반복 측정");
    expect(html).toContain("성인 남녀 공통 혈압 기준에서 고혈압 위기 가능 범위");
    expect(html).toContain("즉시 의료진 또는 응급 진료");
    expect(html).toContain(
      `근거: <a href="${kdcaHypertensionUrl}" target="_blank" rel="noreferrer">질병관리청 국가건강정보포털 고혈압</a>`,
    );
    expect(html).toContain("활력 · 저혈당 범위");
    expect(html).toContain("혈당 66 mg/dL (수시)");
    expect(html).toContain("식은땀과 떨림");
    expect(html).toContain("성인 남녀 공통 혈당 기준에서 70 mg/dL 미만 저혈당 범위");
    expect(html).toContain("증상, 의식상태, 약·식사·활동 변화");
    expect(html).toContain("진료팀 연락 기준");
    expect(html).toContain(
      `근거: <a href="${kdcaHypoglycemiaUrl}" target="_blank" rel="noreferrer">질병관리청 국가건강정보포털 급성 합병증_저혈당</a>`,
    );
  });

  it("keeps cancer-patient fever temperature rows source-backed in caregiver HTML", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        documents: [],
        foodQuery: "",
        labResults: [],
        profile: { ...state.profile, cancerCareMode: true },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            date: "2026-06-04",
            type: "temperature",
            temperatureC: 38.1,
            note: "오한 동반",
          },
        ],
      },
      "2026-06-04T10:00:00.000Z",
    );

    expect(html).toContain("활력 · 발열 연락 기준");
    expect(html).toContain("체온 38.1℃");
    expect(html).toContain("오한 동반");
    expect(html).toContain("암환자 공통 기준에서 체온 38℃ 이상");
    expect(html).toContain("응급실/진료팀 연락 기준");
    expect(html).toContain(
      `근거: <a href="${nccInfectionUrl}" target="_blank" rel="noreferrer">국가암정보센터 감염 의료진 상담 기준</a>`,
    );
    expect(html).toContain(
      `<strong>2026-06-04 체온 38.1℃</strong><br><span class="source-label">암환자 공통 체온·감염 연락 기준</span> 발열 연락 기준`,
    );
  });

  it("adds print styling and source labels for shared review", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z");

    expect(html).toContain("@media print");
    expect(html).toContain("break-inside: avoid");
    expect(html).toContain("사용자 입력 기준 범위");
    expect(html).toContain("공식 출처 기반 음식 규칙");
    expect(html).toContain("의료진 확인 필요");
    expect(html).toContain(
      '자몽 - 약물 상호작용 확인 필요 (<a href="https://health.kdca.go.kr/',
    );
  });

  it("explains Korean health standard coverage in caregiver exports", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z");

    expect(html).toContain("<h2>기준 적용 범위</h2>");
    expect(html).toContain("<strong>기준 사용 경계:</strong> 성인 기준 참고용입니다.");
    expect(html).toContain("진료팀 기준을 우선합니다.");
    expect(html).toContain("한국 성인 BMI");
    expect(html).toContain("판정 적용");
    expect(html).toContain("남녀 공통: BMI·혈압·혈당·저혈당·현저한 고혈당·체온 기준");
    expect(html).toContain("성별 분리: 허리둘레 남성 90cm/여성 85cm");
    expect(html).toContain("현재 성별 적용:");
    expect(html).toContain("여성 85cm 이상이면 복부비만 기준 해당");
    expect(html).toContain("여성 프리셋은 50 mg/dL 이상");
    expect(html).toContain(
      "<h3>신체계측·혈압·혈당·신기능·전해질·지질·간기능·단백·칼슘·인산·요산·혈액·체온 숫자 범위</h3>",
    );
    expect(html).toContain("<strong>BMI 기준</strong>");
    expect(html).toContain("남녀 공통 · &lt;18.5 kg/m²");
    expect(html).toContain("남녀 공통 · 18.5-22.9 kg/m²");
    expect(html).toContain("남녀 공통 · 1단계 25-29.9, 2단계 30-34.9, 3단계 35 이상 kg/m²");
    expect(html).toContain("<strong>허리둘레 기준</strong>");
    expect(html).toContain("남성 기준 · 90cm 이상");
    expect(html).toContain("여성 기준 · 85cm 이상");
    expect(html).toContain("<strong>혈압 기준</strong>");
    expect(html).toContain(">질병관리청 국가건강정보포털 고혈압</a>");
    expect(html).toContain("남녀 공통 · &lt;120/&lt;80 mmHg");
    expect(html).toContain("남녀 공통 · 주의 120-129/&lt;80");
    expect(html).toContain("남녀 공통 · 1기 140/90 이상");
    expect(html).toContain("<strong>당뇨 추적 혈당 목표</strong>");
    expect(html).toContain("남녀 공통 · 80-130 mg/dL");
    expect(html).toContain("저혈당 확인 기준");
    expect(html).toContain("질병관리청 국가건강정보포털 급성 합병증_저혈당");
    expect(html).toContain("남녀 공통 · 70 mg/dL 미만이면 증상·의식상태");
    expect(html).toContain("현저한 고혈당 확인 기준");
    expect(html).toContain("질병관리청 국가건강정보포털 고혈당");
    expect(html).toContain("남녀 공통 · 250 mg/dL 이상이면 현저한 고혈당");
    expect(html).toContain("<strong>혈당 선별 기준</strong>");
    expect(html).toContain("남녀 공통 · 정상 &lt;100");
    expect(html).toContain("남녀 공통 · 증상과 함께 200 mg/dL 이상");
    expect(html).toContain("<strong>A1C 검사 기준</strong>");
    expect(html).toContain("남녀 공통 · 당화혈색소 &lt;5.7%");
    expect(html).toContain("남녀 공통 · 6.5% 이상이면 당뇨병 진단 기준 가능성 확인");
    expect(html).toContain("남녀 공통 · 성인 2형 당뇨병 일반 목표 6.5% 미만");
    expect(html).toContain("<strong>BUN/Cr 신기능 기준</strong>");
    expect(html).toContain("남녀 공통 · 10-26 mg/dL");
    expect(html).toContain("남녀 공통 · 성인 0.7-1.4 mg/dL");
    expect(html).toContain("남녀 공통 · 단독 진단이 아니라 탈수·근육량·약물·소변검사·eGFR");
    expect(html).toContain("<strong>eGFR 신장여과율 기준</strong>");
    expect(html).toContain(">질병관리청 국가건강정보포털 만성콩팥병</a>");
    expect(html).toContain("남녀 공통 · 60 mL/min/1.73m² 이상이어도 단백뇨·혈뇨");
    expect(html).toContain("남녀 공통 · 60 미만이 3개월 이상 지속되면 만성콩팥병 기준 가능성 진료팀 확인");
    expect(html).toContain("남녀 공통 · 알부민뇨·혈뇨·소변검사·혈청 Cr");
    expect(html).toContain("<strong>UACR 알부민뇨 기준</strong>");
    expect(html).toContain("남녀 공통 · 알부민뇨 30 mg/g 미만");
    expect(html).toContain("남녀 공통 · 30-300 mg/g 범위는 반복 정량검사와 eGFR 함께 확인");
    expect(html).toContain("남녀 공통 · 300 mg/g 이상이면 말기 신부전 진행 위험 평가 진료팀 확인");
    expect(html).toContain("<strong>Na/K 전해질 기준</strong>");
    expect(html).toContain("남녀 공통 · 135-145 mmol/L");
    expect(html).toContain("남녀 공통 · 3.5-5.5 mmol/L");
    expect(html).toContain("남녀 공통 · 단독 진단이 아니라 구토·설사·탈수·신장 상태");
    expect(html).toContain("<strong>지질 검사 기준</strong>");
    expect(html).toContain(">질병관리청 국가건강정보포털 이상지질혈증 관리</a>");
    expect(html).toContain("남녀 공통 · 총콜레스테롤 &lt;200");
    expect(html).toContain("남녀 공통 · 총콜레스테롤 240 이상");
    expect(html).toContain("남녀 공통 · 고위험군은 매년 지질검사, 수치 이상 시 전문의 상담으로 맞춤 치료계획 확인");
    expect(html).toContain("<strong>HDL 성별 기준</strong>");
    expect(html).toContain("남성 기준 · 40 mg/dL 이상");
    expect(html).toContain("여성 기준 · 50 mg/dL 이상");
    expect(html).toContain("성별 분리 · 남성 40 미만 또는 여성 50 미만");
    expect(html).toContain("<strong>GGT 성별 기준</strong>");
    expect(html).toContain(">질병관리청 국가건강정보포털 임상 화학 검사</a>");
    expect(html).toContain("남성 기준 · 11-63 IU/L");
    expect(html).toContain("여성 기준 · 8-35 IU/L");
    expect(html).toContain("성별 분리 · 간담도·음주·약물 영향");
    expect(html).toContain("<strong>AST/ALT 간기능 기준</strong>");
    expect(html).toContain(">질병관리청 국가건강정보포털 간기능검사</a>");
    expect(html).toContain("남녀 공통 · 0-40 IU/L");
    expect(html).toContain("남녀 공통 · 단독 진단이 아니라 증상·약물·영상");
    expect(html).toContain("<strong>알부민/총단백 기준</strong>");
    expect(html).toContain("남녀 공통 · 3.3-5.2 g/dL");
    expect(html).toContain("남녀 공통 · 6.0-8.0 g/dL");
    expect(html).toContain("남녀 공통 · 단독 진단이 아니라 간질환·신장질환·영양 결핍");
    expect(html).toContain("<strong>칼슘 기준</strong>");
    expect(html).toContain("남녀 공통 · 8.8-10.5 mg/dL");
    expect(html).toContain("남녀 공통 · 단독 진단이 아니라 뼈 전이 암·갑상선기능항진증");
    expect(html).toContain("남녀 공통 · 부갑상선저하증·신부전·비타민D");
    expect(html).toContain("<strong>인산 기준</strong>");
    expect(html).toContain("남녀 공통 · 성인 2.5-4.5 mg/dL");
    expect(html).toContain("남녀 공통 · 단독 진단이 아니라 신부전·부갑상선기능저하증");
    expect(html).toContain("남녀 공통 · 고칼슘혈증·이뇨제·장기간 제산제");
    expect(html).toContain("<strong>요산 기준</strong>");
    expect(html).toContain("남녀 공통 입력 보조 · 3-7 mg/dL");
    expect(html).toContain("남녀 공통 · 단독 진단이 아니라 전이암·다발골수종");
    expect(html).toContain("<strong>헤모글로빈 입력 보조</strong>");
    expect(html).toContain(">서울아산병원 혈색소 검사 참고치</a>");
    expect(html).toContain("남성 입력 보조 · 13.0-17.0 g/dL");
    expect(html).toContain("여성 입력 보조 · 12.0-16.0 g/dL");
    expect(html).toContain("성별·검사실·치료 상태에 따라 달라질 수 있어 병원 결과지 기준을 우선");
    expect(html).toContain("<strong>ANC 감염 위험 기준</strong>");
    expect(html).toContain(">국가암정보센터 항암 부작용 증상 관리 지침</a>");
    expect(html).toContain("암환자 공통 · ANC &lt;500 cells/mm²");
    expect(html).toContain("암환자 공통 · 항암제 주사 후 보통 7-14일");
    expect(html).toContain("암환자 공통 · 기침·호흡곤란");
    expect(html).toContain("<strong>혈소판 출혈 위험 기준</strong>");
    expect(html).toContain("암환자 공통 · 혈소판 &lt;75,000/mm³");
    expect(html).toContain("암환자 공통 · 혈소판 &lt;50,000/mm³ 수준");
    expect(html).toContain("암환자 공통 · 10분 이상 압박해도 계속되는 출혈");
    expect(html).toContain("<strong>체온·감염 연락 기준</strong>");
    expect(html).toContain("암환자 공통 · 오한 또는 체온 38℃ 이상");
    expect(html).toContain("암환자 공통 · 오심·구토·설사");
    expect(html).toContain("암환자 공통 · 체온, 측정 시간");
    expect(html).toContain("<h3>적용 범위와 근거</h3>");
    expect(html).toContain("남성 90cm, 여성 85cm");
    expect(html).toContain("식전과 식후 2시간 일반 조절목표");
    expect(html).toContain("사용자 기준 우선");
    expect(html).toContain("기타 검사실 기준");
    expect(html).toContain("근거: <a href=\"https://general.kosso.or.kr/");
    expect(html).toContain(">대한비만학회 비만 진료지침 2022</a>");
    expect(html).toContain(">질병관리청 국가건강정보포털 당뇨병</a>");
    expect(html).toContain("<strong>지질 검사 공통 프리셋</strong>");
    expect(html).toContain("총콜레스테롤·LDL·중성지방 성인 공통 입력 보조값");
    expect(html).toContain(">질병관리청 국가건강정보포털 이상지질혈증 관리</a>");
    expect(html).toContain("<strong>HDL 콜레스테롤 프리셋</strong>");
    expect(html).toContain("HDL 남성 40 mg/dL 이상, 여성 50 mg/dL 이상 분리");
    expect(html).toContain("<strong>GGT 감마지티피 프리셋</strong>");
    expect(html).toContain("GGT 남성 11-63 IU/L, 여성 8-35 IU/L 분리");
    expect(html).toContain("<strong>BUN/Cr 신기능 프리셋</strong>");
    expect(html).toContain("BUN 10-26 mg/dL, 성인 Cr 0.7-1.4 mg/dL");
    expect(html).toContain("<strong>eGFR 신장여과율 프리셋</strong>");
    expect(html).toContain("eGFR 60 미만이 3개월 이상 지속되거나 알부민뇨");
    expect(html).toContain("<strong>UACR 알부민뇨 프리셋</strong>");
    expect(html).toContain("알부민뇨 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 단계");
    expect(html).toContain("<strong>Na/K 전해질 프리셋</strong>");
    expect(html).toContain("나트륨 135-145 mmol/L, 칼륨 3.5-5.5 mmol/L");
    expect(html).toContain("<strong>AST/ALT 간기능 프리셋</strong>");
    expect(html).toContain("AST·ALT 성인 남녀 공통 0-40 IU/L 입력 보조");
    expect(html).toContain("<strong>알부민/총단백 프리셋</strong>");
    expect(html).toContain("혈청 알부민 3.3-5.2 g/dL과 총단백 6.0-8.0 g/dL");
    expect(html).toContain("<strong>칼슘 프리셋</strong>");
    expect(html).toContain("칼슘 8.8-10.5 mg/dL 보조값");
    expect(html).toContain("<strong>인산 프리셋</strong>");
    expect(html).toContain("성인 인산 2.5-4.5 mg/dL 보조값");
    expect(html).toContain("<strong>요산 프리셋</strong>");
    expect(html).toContain("요산 3-7 mg/dL 보조값");
    expect(html).toContain("<strong>헤모글로빈 성별 프리셋</strong>");
    expect(html).toContain("헤모글로빈 남성 13.0-17.0 g/dL, 여성 12.0-16.0 g/dL 분리");
    expect(html).toContain("<strong>ANC 감염 위험 프리셋</strong>");
    expect(html).toContain("ANC 500 미만과 발열·오한·호흡기 증상");
    expect(html).toContain("<strong>혈소판 출혈 위험 기준</strong>");
    expect(html).toContain("혈소판 감소와 코피·검은 변·혈뇨·비정상 질출혈");
  });

  it("includes source-backed cervical-cancer care notes in cancer-care caregiver exports", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z");

    expect(html).toContain("<h2>자궁경부암 케어 참고</h2>");
    expect(html).toContain("진단이나 치료 지시가 아니라");
    expect(html).toContain("<strong>우선 확인 체크리스트</strong>");
    expect(html).toContain("오늘 증상 기록: 출혈·분비물 변화");
    expect(html).toContain("다음 진료 질문: 병원 추적검사 일정과 국가암검진 2년 주기");
    expect(html).toContain("의심 증상 진단검사 목록");
    expect(html).toContain(">국립암센터 자궁경부암 조기 진단과 예방법</a>");
    expect(html).toContain("치료 후 생활 상담: 림프부종 피부 변화");
    expect(html).toContain("골반 방사선 후 폐경·질협착");
    expect(html).toContain("검진 기준 빠른 확인");
    expect(html).toContain("국가암검진 대상 기준 해당");
    expect(html).toContain("2년 간격 자궁경부세포검사");
    expect(html).toContain("산정특례기간");
    expect(html).toContain("<strong>경고 신호 기록 항목</strong>");
    expect(html).toContain("언제: 새로 시작된 날짜, 반복 횟수, 치료·검사 후 며칠째인지");
    expect(html).toContain("무엇이: 출혈·분비물 색/냄새/양, 혈뇨·혈변, 배뇨·배변 변화");
    expect(html).toContain("얼마나: 통증 정도와 지속 시간, 복부팽만·구토·배변/가스 변화 동반 여부");
    expect(html).toContain("같이: 발열, 열감, 피부 붉어짐, 다리 부종·통증, 상처 동반 여부");
    expect(html).not.toContain("근거: 출처:");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/S1T553C554/contents.do" target="_blank" rel="noreferrer">국가암정보센터 국가암검진 대상자 선정 및 통보</a>',
    );
    expect(html).not.toContain(
      "근거: 국가암정보센터 국가암검진 대상자 선정 및 통보 (https://www.cancer.go.kr/lay1/S1T553C554/contents.do)",
    );
    expect(html).toContain("추적검사 일정·결과");
    expect(html).toContain("국가암검진 2년 주기");
    expect(html).toContain("의심 증상 진단검사 준비");
    expect(html).toContain("질확대경·조직검사·경질초음파·골반 MRI");
    expect(html).toContain("병기 설명 메모");
    expect(html).toContain("0기는 자궁경부 상피내암");
    expect(html).toContain("방광·직장점막 침범 또는 원격전이");
    expect(html).toContain("배뇨·배변·출혈 변화 메모");
    expect(html).toContain("혈변·혈뇨");
    expect(html).toContain(">국가암정보센터 자궁경부암 치료의 부작용</a>");
    expect(html).toContain("결과통보·비용 확인");
    expect(html).toContain("15일 이내");
    expect(html).toContain("전액 무료");
    expect(html).toContain(">국가암정보센터 국가암검진 대상자 선정 및 통보</a>");
    expect(html).toContain(">국가암정보센터 국가암검진 검진주기 및 검진방법</a>");
    expect(html).toContain("비정상 질출혈");
    expect(html).toContain("진료 질문 초안");
    expect(html).toContain("검진·진단검사 구분");
    expect(html).toContain("골반내진, 자궁경부세포검사, HPV 검사, 질확대경, 조직검사");
    expect(html).toContain("경질초음파, 골반 MRI");
    expect(html).toContain(
      'href="https://www.cancer.go.kr/download.do?uuid=adf8879c-4343-445e-b67d-0c60e5ac9b58.pdf"',
    );
    expect(html).toContain("치료 선택 기준");
    expect(html).toContain("제 병기, 암 크기, 전신상태, 연령, 향후 출산 희망 여부");
    expect(html).toContain(">국가암정보센터 자궁경부암 치료방법</a>");
    expect(html).toContain("골반 방사선 후 폐경");
    expect(html).toContain("난소부전, 홍조·무월경 같은 폐경 증상");
    expect(html).toContain("질협착, 성욕 변화, 골다공증 위험");
    expect(html).toContain(">국가암정보센터 방사선치료의 부작용</a>");
    expect(html).toContain("장·방광 후기 변화");
    expect(html).toContain("6개월 이상 지난 뒤 장폐색, 혈변, 혈뇨 가능성");
    expect(html).toContain("배변/가스 변화");
    expect(html).toContain("장폐색·혈변·혈뇨 연락 메모");
    expect(html).toContain("복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨");
    expect(html).toContain("연락 기준을 진료팀에 확인");
    expect(html).toContain(
      'href="https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&amp;menu_seq=4894"',
    );
    expect(html).toContain("식생활·보조식품");
    expect(html).toContain("민간요법·건강보조식품");
    expect(html).toContain("피부 붉어짐");
    expect(html).toContain("의료진에게 바로 연락");
    expect(html).toContain(">국가암정보센터 림프부종 치료 전후관리</a>");
    expect(html).toContain(">국가암정보센터 자궁경부암 식생활</a>");
    expect(html).toContain("림프부종");
    expect(html).toContain("회복 일정 메모");
    expect(html).toContain("원추절제술 후 생활 제한");
    expect(html).toContain("림프부종 피부·감염 관리");
    expect(html).toContain("열감·통증");
    expect(html).toContain("부종 악화 가능성");
    expect(html).toContain(
      '출처: <a href="https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&amp;menu_seq=4898" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 치료 후 생활</a>',
    );
    expect(html).toContain(
      '출처: <a href="https://www.cancer.go.kr/lay1/S1T429C433/contents.do" target="_blank" rel="noreferrer">국가암정보센터 림프부종 운동 관리</a>',
    );
    expect(html).toContain("광범위 자궁절제술 후 회복");
    expect(html).toContain("재발·추적검사 주기 메모");
    expect(html).toContain("첫 2년 3개월마다");
    expect(html).toContain(">국가암정보센터 자궁경부암 재발 및 전이</a>");
    expect(html).toContain("골반 방사선치료 난소기능·폐경 증상 상담");
    expect(html).toContain("성생활 재개·통증 상담");
    expect(html).toContain("질건조·질협착");
    expect(html).toContain(">국가암정보센터 자궁경부암 성생활</a>");
    expect(html).toContain("임신·출산 계획 상담");
    expect(html).toContain("광범위자궁경부절제수술");
    expect(html).toContain(">국가암정보센터 자궁경부암 임신과 출산</a>");
    expect(html).toContain("식생활·보조식품 확인");
    expect(html).toContain("특별히 피하거나 추천하는 음식은 없고");
    expect(html).toContain("검진·예방 메모");
    expect(html).toContain("20세 이상 여성");
    expect(html).toContain("2년 간격");
    expect(html).toContain("자궁경부세포검사 전 확인");
    expect(html).toContain("생리 기간을 피해서");
    expect(html).toContain("HPV 검사를 함께 받을 수");
    expect(html).toContain("HPV 백신은 예방용");
    expect(html).toContain("접종 후에도 자궁경부암 선별검사");
    expect(html).toContain("선별검사는 변경 없이");
    expect(html).toContain(">국가암정보센터 국가암검진 검진주기 및 검진방법</a>");
    expect(html).toContain(">국가암정보센터 자궁경부암 일반적 증상</a>");
    expect(html).toContain(">질병관리청 국가건강정보포털 자궁경부암 백신</a>");
  });

  it("omits cervical-cancer care notes when cancer-care mode is disabled", () => {
    const html = buildCaregiverExportHtml(
      { ...state, profile: { ...state.profile, cancerCareMode: false } },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).not.toContain("<h2>자궁경부암 케어 참고</h2>");
    expect(html).not.toContain("<strong>공식 출처</strong>");
    expect(html).toContain(
      '근거: <a href="https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&amp;menu_seq=4888" target="_blank" rel="noreferrer">국가암정보센터 자궁경부암 일반적 증상</a>',
    );
  });

  it("escapes HTML and excludes local file paths", () => {
    const html = buildCaregiverExportHtml(
      {
        ...state,
        profile: { ...state.profile, name: "<script>alert(1)</script>" },
        foodQuery: "<b>자몽</b>",
      },
      "2026-06-03T10:00:00.000Z",
    );

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;자몽&lt;/b&gt;");
    expect(html).toContain("검사 결과 &quot;A&quot;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<b>자몽</b>");
    expect(html).not.toContain("/tmp/");
    expect(html).not.toContain("attachmentPath");
  });

  it("omits disabled caregiver share sections", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z", {
      sections: {
        ...caregiverExportSectionDefaults,
        questions: false,
        food: false,
        vitals: false,
      },
    });

    expect(html).toContain("다가오는 진료");
    expect(html).toContain("서울암센터");
    expect(html).not.toContain("열린 질문");
    expect(html).not.toContain("오심 조절을 어떻게 볼까요?");
    expect(html).not.toContain("음식 확인 메모");
    expect(html).not.toContain("자몽 주스");
    expect(html).not.toContain("최근 혈압·혈당");
    expect(html).not.toContain("혈압 132/84");
  });

  it("keeps the caregiver care queue scoped to enabled share sections", () => {
    const html = buildCaregiverExportHtml(
      { ...state, profile: { ...state.profile, cancerCareMode: false } },
      "2026-06-03T10:00:00.000Z",
      {
        sections: {
          ...caregiverExportSectionDefaults,
          documents: false,
          labs: false,
          questions: false,
          symptoms: false,
        },
      },
    );

    expect(html).toContain("<h2>진료 준비 큐</h2>");
    expect(html).not.toContain("증상 · 자궁경부암 경고 기록");
    expect(html).not.toContain("질문 · 이번 진료 우선");
    expect(html).not.toContain("검사 · 기준보다 낮음");
    expect(html).not.toContain("서류 · 서류 검토");
    expect(html).toContain("활력 · 고혈압 전단계 범위");
    expect(html).toContain("예약 · 방문 예정");
  });

  it("can redact profile details from the caregiver header", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z", {
      redactProfile: true,
    });

    expect(html).toContain("<h1>CareVault 보호자 공유본</h1>");
    expect(html).toContain("프로필 식별정보 가림");
    expect(html).not.toContain("QA 사용자 보호자 공유본");
    expect(html).not.toContain("56세");
    expect(html).not.toContain("164cm");
    expect(html).toContain("서울암센터");
  });

  it("adds an escaped caregiver cover memo when provided", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z", {
      coverMemo: "오늘은 식사량만 봐주세요.\n<script>alert(1)</script>",
    });

    expect(html).toContain("<h2>전달 메모</h2>");
    expect(html).toContain("오늘은 식사량만 봐주세요.<br>&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("서울암센터");
  });

  it("adds an escaped caregiver preset intent to the header", () => {
    const html = buildCaregiverExportHtml(state, "2026-06-03T10:00:00.000Z", {
      presetDescription: "질문 <확인>",
      presetLabel: "진료 준비",
    });

    expect(html).toContain("공유 의도:");
    expect(html).toContain("진료 준비");
    expect(html).toContain("질문 &lt;확인&gt;");
    expect(html).not.toContain("질문 <확인>");
  });
});
