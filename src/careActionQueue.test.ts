import { describe, expect, it } from "vitest";
import {
  buildCareActionQueue,
  countCareActionQueueSources,
  countCareActionQueueTones,
  formatCareActionQueueClipboardText,
  formatCareActionQueueCopyDescription,
  formatCareActionQueueCopyFailedStatus,
  formatCareActionQueueCopyStatus,
  formatCareActionQueueCopyUnsupportedStatus,
  formatCareActionQueueSourceCountSummary,
  formatCareActionQueueToneCountSummary,
  type CareActionQueueState,
} from "./careActionQueue";
import { buildVitalStandardQuestionDraft } from "./healthStandards";
import { buildLabQuestionPrompt } from "./labQuestionPrompts";
import {
  buildCervicalCancerAlertSymptomDraft,
  buildCervicalCancerCareItemSymptomDraft,
  cervicalCancerCareAlerts,
  cervicalCancerCareChecks,
} from "./cervicalCancerCare";
import {
  buildSymptomSupportActionNote,
  findSymptomSupportTemplate,
} from "./symptomSupportTemplates";

const kdcaHypertensionUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28";
const kdcaLowBloodPressureUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5259";
const kdcaHypoglycemiaUrl =
  "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2350";
const nccInfectionUrl = "https://www.cancer.go.kr/lay1/S1T435C439/contents.do";
const kdaCareTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";
const kdaTargetUrl = "https://www.diabetes.or.kr/general/info/treat/treat_01.php";

const state: CareActionQueueState = {
  profile: {
    diabetes: true,
  },
  vitals: [
    {
      id: "bp-1",
      date: "2026-06-01",
      type: "blood-pressure",
      systolic: 132,
      diastolic: 84,
      note: "아침 안정 후 측정",
    },
    {
      id: "glu-1",
      date: "2026-06-02",
      type: "glucose",
      glucoseMgDl: 181,
      glucoseContext: "after-meal",
      note: "점심 식후 2시간",
    },
    {
      id: "bp-2",
      date: "2026-06-03",
      type: "blood-pressure",
      systolic: 118,
      diastolic: 76,
      note: "정상 혈압",
    },
  ],
  visits: [
    {
      id: "visit-1",
      date: "2026-06-01",
      hospital: "종양내과",
      reason: "정기 추적",
      summary: "검사 결과 확인",
      plan: "2주 뒤 재검",
      nextDate: "2026-06-15",
    },
  ],
  questions: [
    {
      id: "question-1",
      date: "2026-06-15",
      topic: "식사",
      question: "날음식 제한 기준은?",
      priority: "high",
      status: "open",
    },
    {
      id: "question-2",
      date: "2026-06-10",
      topic: "완료",
      question: "이미 답변된 질문",
      priority: "routine",
      status: "answered",
    },
  ],
  labResults: [
    {
      id: "lab-1",
      date: "2026-06-03",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "면역저하 질문",
    },
    {
      id: "lab-2",
      date: "2026-06-03",
      name: "PLT",
      value: "210",
      unit: "10^3/uL",
      lower: "150",
      upper: "400",
      note: "",
    },
  ],
  documents: [
    {
      id: "doc-1",
      date: "2026-06-02",
      title: "혈액검사 메모",
      body: "다음 진료 때 확인",
      tags: "혈액검사",
      reviewStatus: "care-question",
      nextAction: "식사 제한 기준 질문",
    },
    {
      id: "doc-2",
      date: "2026-06-02",
      title: "정리 완료 서류",
      body: "",
      tags: "",
      reviewStatus: "done",
      nextAction: "",
    },
  ],
  symptoms: [],
};

describe("careActionQueue", () => {
  it("collects open questions, abnormal vitals and labs, active documents, and upcoming visits", () => {
    const actions = buildCareActionQueue(state, "2026-06-03");
    expect(actions.map((action) => action.id)).toEqual([
      "question:question-1",
      "vital:bp-1",
      "vital:glu-1",
      "document:doc-1",
      "lab:lab-1",
      "visit:visit-1:2026-06-15",
    ]);
    expect(actions.find((action) => action.id === "lab:lab-1")).toMatchObject({
      label: "기준보다 낮음",
      title: "WBC 3.4 10^3/uL",
      detail:
        "면역저하 질문 / 검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요. / 근거: 서울아산병원 전혈구검사 참고치 (https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126)",
    });
    expect(actions.find((action) => action.id === "question:question-1")).toMatchObject({
      label: "질문 · 이번 진료 우선",
      sortRank: 0,
    });
    expect(actions.find((action) => action.id === "vital:bp-1")).toMatchObject({
      label: "고혈압 전단계 범위",
      source: "vital",
      title: "혈압 132/84 mmHg",
      detail: expect.stringContaining("아침 안정 후 측정 / 한국 성인 남녀 공통 기준 고혈압 전단계"),
    });
    expect(actions.find((action) => action.id === "vital:bp-1")?.detail).toContain(
      "근거: 질병관리청 국가건강정보포털 고혈압",
    );
    expect(actions.find((action) => action.id === "vital:glu-1")).toMatchObject({
      label: "식후 목표 초과",
      source: "vital",
      title: "혈당 181 mg/dL (식후 2시간)",
      detail: expect.stringContaining("점심 식후 2시간 / 성인 남녀 공통 식후 2시간 목표"),
    });
    expect(actions.find((action) => action.id === "vital:glu-1")?.detail).toContain(
      "근거: 대한당뇨병학회 당뇨병 관리 목표",
    );
    expect(actions.some((action) => action.id === "vital:bp-2")).toBe(false);
  });

  it("promotes parsed clinical document clues into care queue question detail", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [
          {
            id: "doc-parsed",
            date: "2026-06-04",
            title: "HWPX 추적 검사",
            body:
              "[첨부 텍스트 파싱: follow.hwpx · HWPX 본문 XML]\n자궁경부암 추적 중 혈압 149/93, HbA1c 7.4%, 당화혈색소 상담 필요.",
            tags: "",
            reviewStatus: "care-question",
            nextAction: "",
          },
        ],
        labResults: [],
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-04",
    );

    const documentAction = actions.find((action) => action.id === "document:doc-parsed");
    expect(documentAction).toMatchObject({
      label: "서류 질문",
      source: "document",
      title: "HWPX 추적 검사",
    });
    expect(documentAction?.detail).toContain("자궁경부암, 고혈압, 당뇨 관련 단서");
    expect(documentAction?.detail).toContain("당화혈색소");
    expect(documentAction?.detail).toContain("문서 측정 단서(원문): 혈압 149/93 mmHg · HbA1c 7.4%");
    expect(documentAction?.detail).toContain(
      "수치 해석, 반복 측정 시점, 약·식사·치료 영향은 진료팀 기준으로 확인합니다.",
    );
    expect(documentAction?.detail).toContain("파싱 원천: HWPX 본문 XML: follow.hwpx");
    expect(documentAction?.detail).not.toContain("처방");
    expect(documentAction?.detail).not.toContain("치료하세요");

    const clipboardText = formatCareActionQueueClipboardText(actions, "2026-06-04");
    expect(clipboardText).toContain("서류 질문");
    expect(clipboardText).toContain("당화혈색소");
    expect(clipboardText).toContain("혈압 149/93 mmHg");
    expect(clipboardText).toContain("HbA1c 7.4%");
    expect(clipboardText).toContain("HWPX 본문 XML: follow.hwpx");
  });

  it("sanitizes local paths from document-derived care queue details", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [
          {
            id: "doc-local-path",
            date: "2026-06-04",
            title: "재첨부 필요 서류",
            body: "원본 경로 /Users/wj/private/result.pdf 및 C:\\Users\\wj\\secret\\scan.pdf 확인",
            tags: "",
            reviewStatus: "needs-review",
            nextAction: "",
          },
        ],
        labResults: [],
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-04",
    );

    const documentAction = actions.find((action) => action.id === "document:doc-local-path");
    expect(documentAction?.detail).toContain("[local path]");
    expect(documentAction?.detail).not.toContain("/Users/wj/private");
    expect(documentAction?.detail).not.toContain("C:\\Users\\wj");

    const clipboardText = formatCareActionQueueClipboardText(actions, "2026-06-04");
    expect(clipboardText).toContain("[local path]");
    expect(clipboardText).not.toContain("/Users/wj/private");
    expect(clipboardText).not.toContain("C:\\Users\\wj");
  });

  it("keeps high-risk vital queue rows source-backed and adult-common", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            id: "bp-crisis",
            date: "2026-06-04",
            type: "blood-pressure",
            systolic: 182,
            diastolic: 121,
            note: "두통 동반 반복 측정",
          },
          {
            id: "glucose-low",
            date: "2026-06-04",
            type: "glucose",
            glucoseMgDl: 66,
            glucoseContext: "random",
            note: "식은땀과 떨림",
          },
        ],
      },
      "2026-06-04",
    );

    const bpAction = actions.find((action) => action.id === "vital:bp-crisis");
    expect(bpAction).toMatchObject({
      label: "고혈압 위기 가능 범위",
      sortRank: 0,
      title: "혈압 182/121 mmHg",
    });
    expect(bpAction?.detail).toContain("두통 동반 반복 측정");
    expect(bpAction?.detail).toContain("성인 남녀 공통 혈압 기준");
    expect(bpAction?.detail).toContain("즉시 의료진 또는 응급 진료");
    expect(bpAction?.detail).toContain("근거: 질병관리청 국가건강정보포털 고혈압");
    expect(bpAction?.detail).toContain(kdcaHypertensionUrl);

    const glucoseAction = actions.find((action) => action.id === "vital:glucose-low");
    expect(glucoseAction).toMatchObject({
      label: "저혈당 범위",
      sortRank: 0,
      title: "혈당 66 mg/dL (수시)",
    });
    expect(glucoseAction?.detail).toContain("식은땀과 떨림");
    expect(glucoseAction?.detail).toContain("성인 남녀 공통 혈당 기준");
    expect(glucoseAction?.detail).toContain("70 mg/dL 미만 저혈당 범위");
    expect(glucoseAction?.detail).toContain("증상, 의식상태");
    expect(glucoseAction?.detail).toContain("진료팀 연락 기준");
    expect(glucoseAction?.detail).toContain("근거: 질병관리청 국가건강정보포털 급성 합병증_저혈당");
    expect(glucoseAction?.detail).toContain(kdcaHypoglycemiaUrl);
  });

  it("separates low blood-pressure queue evidence from hypertension evidence", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            id: "bp-low",
            date: "2026-06-04",
            type: "blood-pressure",
            systolic: 88,
            diastolic: 58,
            note: "기립 시 어지러움",
          },
        ],
      },
      "2026-06-04",
    );

    const bpAction = actions.find((action) => action.id === "vital:bp-low");
    expect(bpAction).toMatchObject({
      label: "낮은 혈압 가능",
      sortRank: 1,
      title: "혈압 88/58 mmHg",
    });
    expect(bpAction?.detail).toContain("기립 시 어지러움");
    expect(bpAction?.detail).toContain("성인 남녀 공통 혈압 기준");
    expect(bpAction?.detail).toContain("근거: 질병관리청 국가건강정보포털 저혈압");
    expect(bpAction?.detail).toContain(kdcaLowBloodPressureUrl);
    expect(bpAction?.detail).not.toContain("질병관리청 국가건강정보포털 고혈압");
    expect(bpAction?.detail).not.toContain(kdcaHypertensionUrl);
  });

  it("adds cancer-patient fever temperature readings to the care queue", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        profile: { ...state.profile, cancerCareMode: true },
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [
          {
            id: "temp-fever",
            date: "2026-06-04",
            type: "temperature",
            temperatureC: 38.1,
            note: "오한 동반",
          },
        ],
      },
      "2026-06-04",
    );

    const action = actions.find((candidate) => candidate.id === "vital:temp-fever");
    expect(action).toMatchObject({
      label: "발열 연락 기준",
      sortRank: 0,
      title: "체온 38.1℃",
    });
    expect(action?.detail).toContain("오한 동반");
    expect(action?.detail).toContain("암환자 공통");
    expect(action?.detail).toContain("38℃ 이상");
    expect(action?.detail).toContain("근거: 국가암정보센터 감염 의료진 상담 기준");
    expect(action?.detail).toContain(nccInfectionUrl);
  });

  it("drops past visits and respects the requested limit", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        visits: [{ ...state.visits[0], nextDate: "2026-05-30" }],
      },
      "2026-06-03",
      2,
    );
    expect(actions).toHaveLength(2);
    expect(actions.some((action) => action.source === "visit")).toBe(false);
  });

  it("ignores malformed future-looking visit dates in the care queue", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [],
        visits: [{ ...state.visits[0], date: "2026-02-31", nextDate: "" }],
        vitals: [],
      },
      "2026-02-27",
    );

    expect(actions.some((action) => action.source === "visit")).toBe(false);
  });

  it("keeps partial lab number text from becoming a false abnormal queue item", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [
          {
            id: "lab-partial-number",
            date: "2026-06-03",
            name: "WBC",
            value: "3.4 low",
            unit: "10^3/uL",
            lower: "4.0",
            upper: "10.0",
            note: "원문 확인 필요",
          },
        ],
        questions: [],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "lab:lab-partial-number",
        label: "값 없음",
        tone: "neutral",
      }),
    ]);
    expect(actions[0].detail).toContain("검사 수치를 숫자로 입력하세요.");
    expect(actions[0].detail).not.toContain("검사실 기준보다 낮습니다.");
  });

  it("formats source-backed open question details as separated evidence", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [
          {
            id: "question-source-backed",
            date: "2026-06-20",
            topic: "부작용: 질건조·성교통/성생활 상담",
            question:
              "성생활 재개 시점을 어떻게 상담할까요?\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
            priority: "next-visit",
            status: "open",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "question:question-source-backed",
        detail:
          "성생활 재개 시점을 어떻게 상담할까요? / 근거: 국가암정보센터 자궁경부암 성생활 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373)",
      }),
    ]);
    expect(formatCareActionQueueClipboardText(actions, "2026-06-20")).not.toContain("출처:");
  });

  it("formats generated vital standard questions as separated care-queue evidence", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "주의혈압 범위",
      assessmentSummary: "한국 성인 남녀 공통 기준 주의혈압입니다. 추세가 오르는지 확인하세요.",
      measurementLabel: "혈압 128/78 mmHg",
      standardId: "blood-pressure",
    });
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [
          {
            id: "question-vital-source-backed",
            date: "2026-06-15",
            topic: vitalQuestion?.topic ?? "",
            question: vitalQuestion?.question ?? "",
            priority: "next-visit",
            status: "open",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "question:question-vital-source-backed",
        detail: expect.stringContaining("혈압 128/78 mmHg 기록"),
      }),
    ]);
    expect(actions[0].detail).toContain(`근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})`);
    expect(actions[0].detail).not.toContain("출처: 질병관리청 국가건강정보포털 고혈압");
    expect(formatCareActionQueueClipboardText(actions, "2026-06-15")).toContain(
      `근거: 질병관리청 국가건강정보포털 고혈압 (${kdcaHypertensionUrl})`,
    );
  });

  it("formats generated glucose standard questions as separated care-queue evidence", () => {
    const vitalQuestion = buildVitalStandardQuestionDraft({
      assessmentLabel: "식전 목표 범위",
      assessmentSummary:
        "대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식전 80-130 mg/dL 범위를 제시합니다.",
      measurementLabel: "혈당 118 mg/dL (식전)",
      standardId: "glucose-care",
    });
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [
          {
            id: "question-glucose-vital-source-backed",
            date: "2026-06-15",
            topic: vitalQuestion?.topic ?? "",
            question: vitalQuestion?.question ?? "",
            priority: "next-visit",
            status: "open",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "question:question-glucose-vital-source-backed",
        detail: expect.stringContaining("혈당 118 mg/dL (식전) 기록"),
      }),
    ]);
    expect(actions[0].detail).toContain(
      `근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaCareTargetUrl})`,
    );
    expect(actions[0].detail).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
    expect(formatCareActionQueueClipboardText(actions, "2026-06-15")).toContain(
      `근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaCareTargetUrl})`,
    );
  });

  it("formats generated lab follow-up question evidence in care queue details", () => {
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
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [
          {
            id: "question-lab-source-backed",
            date: "2026-06-15",
            topic: "검사 수치",
            question: labQuestion,
            priority: "high",
            status: "open",
          },
        ],
        symptoms: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "question:question-lab-source-backed",
        detail: expect.stringContaining(
          `기존 메모/근거: 대한당뇨병학회 일반 목표 기준입니다. / 적용 기준: 여성 기준 적용 / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`,
        ),
      }),
    ]);
    expect(actions[0].detail).not.toContain("출처: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("surfaces cervical warning symptom drafts for clinic review", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        symptoms: [
          {
            id: "symptom-1",
            date: "2026-06-04",
            symptom: "비정상 질출혈",
            severity: 3,
            medication: "",
            body: "폐경 후 새 출혈을 구분해 기록합니다.\n출처: 국가암정보센터 자궁경부암 일반적 증상",
            action: "발생 시기·양·유발 상황을 적고 진료팀 확인",
          },
        ],
      },
      "2026-06-03",
    );

    expect(actions[0]).toMatchObject({
      id: "symptom:symptom-1",
      label: "자궁경부암 경고 기록",
      source: "symptom",
      title: "비정상 질출혈 3/10",
      detail:
        "발생 시기·양·유발 상황을 적고 진료팀 확인 / 근거: 국가암정보센터 자궁경부암 일반적 증상 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888)",
    });
  });

  it("keeps structured cervical warning drafts from being relabeled by field-guide keywords", () => {
    const draft = buildCervicalCancerAlertSymptomDraft(cervicalCancerCareAlerts[0]);
    const actions = buildCareActionQueue(
      {
        ...state,
        symptoms: [
          {
            id: "structured-warning",
            date: "2026-06-04",
            symptom: draft.symptom,
            severity: 3,
            medication: "",
            body: draft.body,
            action: draft.action,
          },
        ],
      },
      "2026-06-03",
    );

    expect(actions[0]).toMatchObject({
      id: "symptom:structured-warning",
      label: "자궁경부암 경고 기록",
      title: "비정상 질출혈 3/10",
    });
    expect(actions[0].detail).toContain("근거: 국가암정보센터 자궁경부암 일반적 증상");
    expect(actions[0].detail).not.toContain("자궁경부암 치료의 부작용");
    expect(actions[0].label).not.toBe("장폐색 확인 기록");
  });

  it("formats inline source-backed cervical warning symptom details as evidence", () => {
    const sourceUrl =
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373";
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-inline-source",
            date: "2026-06-21",
            symptom: "질건조와 성교통",
            severity: 3,
            medication: "",
            body: "방사선치료 후 변화 기록",
            action:
              `진료 전 재개 시점과 윤활제 상담 질문을 적습니다 출처: 국가암정보센터 자궁경부암 성생활 - ${sourceUrl}`,
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-inline-source",
        detail:
          `진료 전 재개 시점과 윤활제 상담 질문을 적습니다 / 근거: 국가암정보센터 자궁경부암 성생활 (${sourceUrl})`,
      }),
    ]);
    expect(actions[0].detail).not.toContain("출처:");
  });

  it("surfaces high-severity symptoms even without cervical source labels", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        symptoms: [
          {
            id: "symptom-2",
            date: "2026-06-04",
            symptom: "통증",
            severity: 8,
            medication: "진통제 복용 기록",
            body: "밤에 심해짐",
            action: "",
          },
        ],
      },
      "2026-06-03",
    );

    expect(actions[0]).toMatchObject({
      id: "symptom:symptom-2",
      label: "고위험 증상",
      source: "symptom",
      title: "통증 8/10",
      detail: "밤에 심해짐",
    });
  });

  it("separates source-backed pain-assessment notes in high-severity care queue rows", () => {
    const painTemplate = findSymptomSupportTemplate("통증점수와 진통제 효과")!;
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-pain-source",
            date: "2026-06-04",
            symptom: "등 통증",
            severity: 8,
            medication: "",
            body: "밤에 악화",
            action: buildSymptomSupportActionNote(painTemplate),
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-pain-source",
        label: "고위험 증상",
        source: "symptom",
        title: "등 통증 8/10",
        detail: expect.stringContaining(
          "암 환자에게 있어서 통증 은 제 5의 활력 징후라고 할 수 있습니다.",
        ),
      }),
    ]);
    expect(actions[0].detail).toContain(
      "통증 부위, 신체 그림 표시, 0-10점 강도, 시작·경과·지속 시간",
    );
    expect(actions[0].detail).toContain(
      "근거: 국가암정보센터 통증평가 항목 (https://www.cancer.go.kr/lay1/S1T378C380/contents.do)",
    );
    expect(actions[0].detail).not.toContain("출처:");
  });

  it("surfaces source-backed fever and chills symptoms even below high severity", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-fever",
            date: "2026-06-04",
            symptom: "38도 발열과 오한",
            severity: 3,
            medication: "",
            body: "체온 38.2℃, 오한 30분 지속",
            action: "배뇨 통증과 카테터 부위 발적 여부를 같이 확인",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-fever",
        label: "감염 의심 기록",
        source: "symptom",
        title: "38도 발열과 오한 3/10",
        detail:
          "배뇨 통증과 카테터 부위 발적 여부를 같이 확인 / 근거: 국가암정보센터 감염 의료진 상담 기준 (https://www.cancer.go.kr/lay1/S1T435C439/contents.do)",
      }),
    ]);
    expect(formatCareActionQueueClipboardText(actions, "2026-06-04")).toContain(
      "증상 · 감염 의심 기록",
    );
    expect(formatCareActionQueueClipboardText(actions, "2026-06-04")).toContain(
      "국가암정보센터 감염 의료진 상담 기준",
    );
  });

  it("normalizes extra source lines in contact-threshold symptom queue details", () => {
    const kdcaVaccineUrl = "https://health.kdca.go.kr/vaccine";
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-fever-extra-source",
            date: "2026-06-04",
            symptom: "38도 발열과 오한",
            severity: 3,
            medication: "",
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
      "2026-06-03",
    );

    expect(actions[0]).toMatchObject({
      id: "symptom:symptom-fever-extra-source",
      detail:
        `배뇨 통증과 카테터 부위 발적 여부를 같이 확인 / 근거: 질병관리청 국가건강정보포털 자궁경부암 백신 (${kdcaVaccineUrl}) / 근거: 국가암정보센터 감염 의료진 상담 기준 (${nccInfectionUrl})`,
    });
    expect(actions[0].detail).not.toContain("출처:");
    expect(formatCareActionQueueClipboardText(actions, "2026-06-04")).not.toContain("출처:");
  });

  it("surfaces source-backed lymphedema symptoms even below high severity", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-lymphedema",
            date: "2026-06-04",
            symptom: "다리 붓기",
            severity: 4,
            medication: "",
            body: "피부 붉어짐과 열감, 갑자기 단단해지는 느낌",
            action: "부은 쪽 둘레와 상처 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-lymphedema",
        label: "림프부종 확인 기록",
        source: "symptom",
        title: "다리 붓기 4/10",
        detail:
          "부은 쪽 둘레와 상처 여부를 기록 / 근거: 국가암정보센터 림프부종 치료 전후관리 (https://www.cancer.go.kr/lay1/S1T429C431/contents.do)",
      }),
    ]);
  });

  it("surfaces generated cervical record-check drafts with separated care-queue evidence", () => {
    const lymphedemaDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "림프부종 감염·악화 신호")!,
    );
    const lateBowelBladderDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "장폐색·혈변·혈뇨 연락 메모")!,
    );
    const anatomySiteDraft = buildCervicalCancerCareItemSymptomDraft(
      cervicalCancerCareChecks.find((item) => item.label === "발생부위·구조 메모")!,
    );
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-cervical-check-draft",
            date: "2026-06-04",
            symptom: lymphedemaDraft.symptom,
            severity: 3,
            medication: "",
            body: lymphedemaDraft.body,
            action: lymphedemaDraft.action,
          },
          {
            id: "symptom-cervical-late-complication-draft",
            date: "2026-06-04",
            symptom: lateBowelBladderDraft.symptom,
            severity: 3,
            medication: "",
            body: lateBowelBladderDraft.body,
            action: lateBowelBladderDraft.action,
          },
          {
            id: "symptom-cervical-anatomy-site-draft",
            date: "2026-06-04",
            symptom: anatomySiteDraft.symptom,
            severity: 3,
            medication: "",
            body: anatomySiteDraft.body,
            action: anatomySiteDraft.action,
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-cervical-check-draft",
        label: "림프부종 확인 기록",
        source: "symptom",
        title: "림프부종 감염·악화 신호 3/10",
        detail: expect.stringContaining("림프부종 감염·악화 신호 내용을 다음 진료 때 진료팀에 확인"),
      }),
      expect.objectContaining({
        id: "symptom:symptom-cervical-late-complication-draft",
        label: "장폐색 확인 기록",
        source: "symptom",
        title: "장폐색·혈변·혈뇨 연락 메모 3/10",
        detail: expect.stringContaining(
          "장폐색·혈변·혈뇨 연락 메모 내용을 다음 진료 때 진료팀에 확인",
        ),
      }),
      expect.objectContaining({
        id: "symptom:symptom-cervical-anatomy-site-draft",
        label: "자궁경부암 기록 메모",
        source: "symptom",
        title: "발생부위·구조 메모 3/10",
        detail: expect.stringContaining("발생부위·구조 메모 내용을 다음 진료 때 진료팀에 확인"),
      }),
    ]);
    expect(actions[0].detail).toContain(
      "근거: 국가암정보센터 림프부종 치료 전후관리 (https://www.cancer.go.kr/lay1/S1T429C431/contents.do)",
    );
    expect(actions[0].detail).not.toContain("출처: 국가암정보센터 림프부종 치료 전후관리");
    expect(actions[1].detail).toContain("복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨");
    expect(actions[1].detail).toContain(
      "근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
    );
    expect(actions[1].detail).not.toContain("출처: 국가암정보센터 자궁경부암 치료의 부작용");
    expect(actions[2].detail).toContain("자궁 상부 2/3");
    expect(actions[2].detail).toContain("하부 1/3");
    expect(actions[2].detail).toContain("질과 연결");
    expect(actions[2].detail).toContain("요관");
    expect(actions[2].detail).toContain("림프관 및 림프절");
    expect(actions[2].detail).toContain(
      "근거: 국가암정보센터 자궁경부암 발생부위 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4880)",
    );
    expect(actions[2].detail).not.toContain("출처: 국가암정보센터 자궁경부암 발생부위");

    const clipboardText = formatCareActionQueueClipboardText(actions, "2026-06-04");
    expect(clipboardText).toContain("증상 · 장폐색 확인 기록");
    expect(clipboardText).toContain("증상 · 자궁경부암 기록 메모");
    expect(clipboardText).toContain("   메모: 장폐색·혈변·혈뇨 연락 메모 내용을 다음 진료 때 진료팀에 확인");
    expect(clipboardText).toContain(
      "   기록 기준: 국가암정보센터는 수술 직후 급성 합병증으로 장폐색을, 방사선치료가 끝난 6개월 이상 뒤 만성 합병증으로 장폐색과 혈변·혈뇨 가능성을 설명합니다. 복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨, 방광·직장 통증이 있으면 발생 시점과 치료 종료 시점을 함께 기록하고 연락 기준을 진료팀에 확인합니다.",
    );
    expect(clipboardText).toContain(
      "   근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
    );
    expect(clipboardText).not.toContain("출처: 국가암정보센터 자궁경부암 치료의 부작용");
    expect(clipboardText).toContain(
      "   근거: 국가암정보센터 자궁경부암 발생부위 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4880)",
    );
    expect(clipboardText).not.toContain("출처: 국가암정보센터 자궁경부암 발생부위");
  });

  it("surfaces source-backed cervical bleeding or discharge warnings even below high severity", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-cervical-general",
            date: "2026-06-04",
            symptom: "성교 후 출혈과 악취 분비물",
            severity: 3,
            medication: "",
            body: "생리기간이 아닌 출혈과 분비물 색, 냄새, 양 변화",
            action: "발생 시점과 운동·배변·질세척 후 발생 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-cervical-general",
        label: "자궁경부암 증상 변화 기록",
        source: "symptom",
        title: "성교 후 출혈과 악취 분비물 3/10",
        detail:
          "발생 시점과 운동·배변·질세척 후 발생 여부를 기록 / 근거: 국가암정보센터 자궁경부암 일반적 증상 (https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888)",
      }),
    ]);
    expect(formatCareActionQueueClipboardText(actions, "2026-06-04")).toContain(
      "증상 · 자궁경부암 증상 변화 기록",
    );
  });

  it("surfaces source-backed cervical urinary or bowel changes even below high severity", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-urinary-bowel",
            date: "2026-06-04",
            symptom: "혈뇨와 혈변",
            severity: 4,
            medication: "",
            body: "방사선치료 후 6개월 이상 지난 뒤 소변과 대변 색 변화",
            action: "날짜, 양, 통증, 발열 동반 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-urinary-bowel",
        label: "배뇨·배변 변화 기록",
        source: "symptom",
        title: "혈뇨와 혈변 4/10",
        detail:
          "날짜, 양, 통증, 발열 동반 여부를 기록 / 근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
      }),
    ]);
  });

  it("surfaces source-backed cervical bowel-obstruction changes even below high severity", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-bowel-obstruction",
            date: "2026-06-04",
            symptom: "장폐색과 복부팽만",
            severity: 4,
            medication: "",
            body: "방사선치료 후 6개월 이상 지난 뒤 배변과 가스 배출 변화",
            action: "복부팽만, 구토, 통증 동반 여부를 기록",
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "symptom:symptom-bowel-obstruction",
        label: "장폐색 확인 기록",
        source: "symptom",
        title: "장폐색과 복부팽만 4/10",
        detail:
          "복부팽만, 구토, 통증 동반 여부를 기록 / 근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
      }),
    ]);
  });

  it("deduplicates source-backed symptom action citations in queue details", () => {
    const sourceUrl =
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894";
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [],
        questions: [],
        symptoms: [
          {
            id: "symptom-bowel-obstruction-source-action",
            date: "2026-06-04",
            symptom: "장폐색과 복부팽만",
            severity: 4,
            medication: "",
            body: "방사선치료 후 6개월 이상 지난 뒤 배변과 가스 배출 변화",
            action:
              `복부팽만, 구토, 통증 동반 여부를 기록 출처: 국가암정보센터 자궁경부암 치료의 부작용 - ${sourceUrl}`,
          },
        ],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    const action = actions[0];

    expect(action).toMatchObject({
      id: "symptom:symptom-bowel-obstruction-source-action",
      detail:
        "복부팽만, 구토, 통증 동반 여부를 기록 / 근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894)",
    });
    expect(action.detail).not.toContain("출처:");
    expect(action.detail.split(sourceUrl)).toHaveLength(2);
  });

  it("adds a source-backed cervical screening quick-check when cancer-care mode is active", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        profile: {
          ...state.profile,
          age: "56",
          cancerCareMode: true,
          sex: "female",
        },
      },
      "2026-06-03",
    );

    expect(actions.find((action) => action.id === "cervical:screening-summary")).toMatchObject({
      date: "2026-06-03",
      detail: expect.stringContaining("국가암정보센터 국가암검진 대상자 선정 및 통보"),
      label: "국가암검진 대상 기준 해당",
      source: "cervical",
      title: "자궁경부암 검진 기준 빠른 확인",
      tone: "neutral",
    });
    expect(actions.find((action) => action.id === "cervical:screening-summary")?.detail).toContain(
      "https://www.cancer.go.kr/lay1/S1T553C554/contents.do",
    );
    expect(actions.find((action) => action.id === "cervical:screening-summary")?.detail).not.toContain(
      "근거: 출처:",
    );
    expect(actions.find((action) => action.id === "cervical:screening-summary")?.detail).toContain(
      "산정특례기간",
    );
    const clipboardText = formatCareActionQueueClipboardText(actions, "2026-06-03");
    expect(clipboardText).toContain("자궁경부암 · 국가암검진 대상 기준 해당");
    expect(clipboardText).toContain(
      "   기준: 국가암검진 대상 기준 해당: 20세 이상 여성은 국가암검진 기준상 2년 간격 자궁경부세포검사 대상입니다.",
    );
    expect(clipboardText).toContain(
      "확인: 같은 암종 진료 중이면 산정특례기간 기준 국가암검진 유예 여부와 병원 추적검사 일정을 진료팀에 확인합니다.",
    );
    expect(clipboardText).toContain(
      "   근거: 국가암정보센터 국가암검진 대상자 선정 및 통보",
    );
    expect(clipboardText).toContain("https://www.cancer.go.kr/lay1/S1T553C555/contents.do");
    expect(clipboardText).not.toContain("근거: 출처:");
  });

  it("keeps lab source evidence separated in queue details and clipboard text", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        documents: [],
        labResults: [
          {
            id: "lab-hdl",
            date: "2026-06-04",
            name: "HDL-C",
            value: "38",
            unit: "mg/dL",
            lower: "50",
            upper: "",
            note: `대한당뇨병학회 일반 목표 기준입니다.\n출처: 대한당뇨병학회 당뇨병 관리 목표 - ${kdaTargetUrl}`,
          },
        ],
        questions: [],
        visits: [],
        vitals: [],
      },
      "2026-06-03",
    );

    expect(actions).toEqual([
      expect.objectContaining({
        id: "lab:lab-hdl",
        detail:
          `대한당뇨병학회 일반 목표 기준입니다. / 검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요. / 근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`,
        label: "기준보다 낮음",
        source: "lab",
        title: "HDL-C 38 mg/dL",
      }),
    ]);
    expect(formatCareActionQueueClipboardText(actions, "2026-06-04")).toContain(
      `근거: 대한당뇨병학회 당뇨병 관리 목표 (${kdaTargetUrl})`,
    );
    expect(formatCareActionQueueClipboardText(actions, "2026-06-04")).not.toContain("출처:");
  });

  it("uses the cervical queue item to ask for age before deciding screening status", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        profile: {
          ...state.profile,
          age: "",
          cancerCareMode: true,
          sex: "female",
        },
      },
      "2026-06-03",
    );

    expect(actions.find((action) => action.id === "cervical:screening-summary")).toMatchObject({
      label: "나이 입력 필요",
      source: "cervical",
      title: "자궁경부암 검진 기준 빠른 확인",
      tone: "neutral",
    });
    expect(actions.find((action) => action.id === "cervical:screening-summary")?.detail).toContain(
      "20세 이상 여성",
    );
  });

  it("formats a clinic-ready queue clipboard text in sorted order", () => {
    const actions = buildCareActionQueue(state, "2026-06-03");
    expect(formatCareActionQueueClipboardText(actions, "2026-06-03")).toBe(
      [
        "[진료 준비 큐]",
        "작성일: 2026-06-03",
        "확인 항목: 6개",
        "상태 요약: 확인 필요 5개 · 일정/일반 1개 · 근거 포함 3개",
        "분류 요약: 질문 1 · 활력 2 · 검사 1 · 서류 1 · 방문 1",
        "",
        "1. 2026-06-15 · 질문 · 이번 진료 우선",
        "   식사",
        "   날음식 제한 기준은?",
        "2. 2026-06-01 · 활력 · 고혈압 전단계 범위",
        "   혈압 132/84 mmHg",
        "   메모: 아침 안정 후 측정",
        "   판정: 한국 성인 남녀 공통 기준 고혈압 전단계입니다. 생활요인과 추세를 함께 기록하세요.",
        "   근거: 질병관리청 국가건강정보포털 고혈압 (https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28)",
        "3. 2026-06-02 · 활력 · 식후 목표 초과",
        "   혈당 181 mg/dL (식후 2시간)",
        "   메모: 점심 식후 2시간",
        "   판정: 성인 남녀 공통 식후 2시간 목표를 넘었습니다. 식사 내용, 약, 활동량과 함께 추세를 확인하세요.",
        "   근거: 대한당뇨병학회 당뇨병 관리 목표 (https://www.diabetes.or.kr/general/info/treat/treat_01.php)",
        "4. 2026-06-02 · 서류 · 서류 질문",
        "   혈액검사 메모",
        "   식사 제한 기준 질문",
        "5. 2026-06-03 · 검사 · 기준보다 낮음",
        "   WBC 3.4 10^3/uL",
        "   메모: 면역저하 질문",
        "   판정: 검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요.",
        "   근거: 서울아산병원 전혈구검사 참고치 (https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126)",
        "6. 2026-06-15 · 예약 · 방문 예정",
        "   종양내과 · 정기 추적",
        "   2주 뒤 재검",
      ].join("\n"),
    );
  });

  it("formats an empty queue message for clipboard use", () => {
    expect(formatCareActionQueueClipboardText([], "2026-06-03")).toBe(
      [
        "[진료 준비 큐]",
        "작성일: 2026-06-03",
        "확인 항목: 0개",
        "상태 요약: 확인 필요 0개 · 일정/일반 0개 · 근거 포함 0개",
        "분류 요약: 분류 없음",
        "",
        "현재 자궁경부암 검진 확인, 증상 경고, 열려 있는 질문, 기준 밖 활력·검사, 서류 조치, 예정 방문이 없습니다.",
      ].join("\n"),
    );
  });

  it("counts queue items by source for dashboard scan chips", () => {
    expect(countCareActionQueueSources(buildCareActionQueue(state, "2026-06-03"))).toEqual({
      cervical: 0,
      document: 1,
      lab: 1,
      question: 1,
      symptom: 0,
      vital: 2,
      visit: 1,
    });
    expect(countCareActionQueueSources([])).toEqual({
      cervical: 0,
      document: 0,
      lab: 0,
      question: 0,
      symptom: 0,
      vital: 0,
      visit: 0,
    });
  });

  it("summarizes queue source counts for copy affordances and status text", () => {
    const actions = buildCareActionQueue(state, "2026-06-03");

    expect(formatCareActionQueueSourceCountSummary(actions)).toBe(
      "질문 1 · 활력 2 · 검사 1 · 서류 1 · 방문 1",
    );
    expect(countCareActionQueueTones(actions)).toEqual({
      neutral: 1,
      sourceBacked: 3,
      total: 6,
      watch: 5,
    });
    expect(formatCareActionQueueToneCountSummary(actions)).toBe(
      "확인 필요 5개 · 일정/일반 1개 · 근거 포함 3개",
    );
    expect(formatCareActionQueueCopyDescription(actions)).toBe(
      "진료 준비 큐 6개 항목 · 확인 필요 5개 · 일정/일반 1개 · 근거 포함 3개 · 질문 1 · 활력 2 · 검사 1 · 서류 1 · 방문 1 복사",
    );
    expect(formatCareActionQueueCopyStatus(actions)).toBe(
      "진료 준비 큐 복사됨 · 6개 항목 · 확인 필요 5개 · 일정/일반 1개 · 근거 포함 3개 · 질문 1 · 활력 2 · 검사 1 · 서류 1 · 방문 1",
    );
    expect(formatCareActionQueueCopyUnsupportedStatus(actions)).toBe(
      "진료 준비 큐 복사 미지원 · 브라우저 클립보드 없음 · 6개 항목 · 확인 필요 5개 · 일정/일반 1개 · 근거 포함 3개 · 질문 1 · 활력 2 · 검사 1 · 서류 1 · 방문 1",
    );
    expect(formatCareActionQueueCopyFailedStatus(actions)).toBe(
      "진료 준비 큐 복사 실패 · 6개 항목 · 확인 필요 5개 · 일정/일반 1개 · 근거 포함 3개 · 질문 1 · 활력 2 · 검사 1 · 서류 1 · 방문 1",
    );
    expect(formatCareActionQueueCopyDescription([])).toBe(
      "진료 준비 큐 0개 항목 · 확인 필요 0개 · 일정/일반 0개 · 근거 포함 0개 · 분류 없음 복사",
    );
  });
});
