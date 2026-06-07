import {
  exportSourceLabels,
  formatLabReferenceRangeLabel,
  getLabRangeSourceLabel,
} from "./exportSourceLabels";
import {
  assessCancerFood,
  assessLabTextValue,
  formatFoodMatchEvidence,
  type GlucoseContext,
} from "./healthRules";
import {
  buildHealthStandardCoverageLines,
  buildProfileSexStandardNotes,
  buildVitalStandardRangeSections,
  koreanHealthStandardApplicabilitySummary,
  koreanHealthStandardUseBoundary,
} from "./healthStandards";
import { formatLabNoteWithSourceEvidence } from "./labSourceEvidence";
import {
  formatSourceEvidence,
  formatTextWithSourceEvidence,
  parseSourceEvidence,
} from "./sourceEvidence";
import {
  buildCervicalCancerCarePromptQuestion,
  cervicalCancerCareAlerts,
  cervicalCancerCareAlertRecordFields,
  cervicalCancerCareChecks,
  cervicalCancerCarePreventionGuides,
  cervicalCancerCarePriorityItems,
  cervicalCancerCarePrompts,
  cervicalCancerCareRecoveryGuides,
  cervicalCancerCareSources,
  buildCervicalCancerScreeningSummary,
  formatCervicalCancerCareAlertRecordFieldEvidence,
  formatCervicalCancerCareAlertEvidence,
  formatCervicalCancerCareItemEvidence,
  formatCervicalCancerCarePriorityEvidence,
  formatCervicalCancerScreeningSummaryEvidence,
} from "./cervicalCancerCare";
import {
  normalizeQuestionPriority,
  questionPriorityLabel,
  type QuestionPriority,
} from "./questionPriority";
import { buildCareActionQueue, formatCareActionQueueLabel } from "./careActionQueue";
import { formatSymptomRecordLabel } from "./symptomRecordLabels";
import {
  buildVitalAssessmentEvidence,
  formatVitalAssessmentSource,
} from "./vitalAssessmentEvidence";
import {
  buildImmuneFoodSafetyContext,
  formatImmuneFoodSafetyContextText,
} from "./immuneFoodContext";

type DocumentReviewStatus = "needs-review" | "care-question" | "waiting-result" | "done";
type QuestionStatus = "open" | "answered" | "deferred";

type CsvDocument = {
  date: string;
  title: string;
  category: string;
  body: string;
  tags: string;
  reviewStatus: DocumentReviewStatus;
  nextAction: string;
  attachmentName?: string;
  attachmentStatus?: string;
};

export type CsvExportState = {
  profile: {
    name: string;
    age: string;
    sex: string;
    heightCm: string;
    weightKg: string;
    waistCm?: string;
    cancerCareMode: boolean;
    diabetes: boolean;
    hypertension: boolean;
  };
  foodQuery: string;
  vitals: Array<{
    date: string;
    type: string;
    systolic?: number;
    diastolic?: number;
    glucoseMgDl?: number;
    glucoseContext?: GlucoseContext;
    temperatureC?: number;
    note: string;
  }>;
  visits: Array<{
    date: string;
    hospital: string;
    reason: string;
    summary: string;
    plan: string;
    nextDate: string;
  }>;
  documents: CsvDocument[];
  deletedDocuments: CsvDocument[];
  symptoms: Array<{
    date: string;
    symptom: string;
    severity: number;
    medication: string;
    body: string;
    action: string;
  }>;
  questions: Array<{
    date: string;
    topic: string;
    question: string;
    priority?: QuestionPriority;
    status: QuestionStatus;
    answer: string;
  }>;
  labResults: Array<{
    date: string;
    name: string;
    value: string;
    unit: string;
    lower: string;
    upper: string;
    note: string;
  }>;
};

const csvRecordArrayKeys = [
  "vitals",
  "visits",
  "documents",
  "deletedDocuments",
  "symptoms",
  "questions",
  "labResults",
] as const;

export type CsvExportScopeSummary = {
  hasCancerCareReferences: boolean;
  hasFoodCheck: boolean;
  recordCount: number;
};

const headers = ["section", "date", "title", "value", "status", "detail"] as const;

function csvCell(value: string | number | boolean | undefined) {
  const text = value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function row(values: ReadonlyArray<string | number | boolean | undefined>) {
  return values.map(csvCell).join(",");
}

function joinDetail(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(" | ");
}

function csvIsoDate(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const normalized = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);

  return normalized === trimmed ? trimmed : "";
}

const profileSexLabels: Record<string, string> = {
  female: "여성",
  male: "남성",
  other: "기타/미지정",
};

function profileSexLabel(sex: string) {
  return profileSexLabels[sex] ?? sex;
}

const glucoseContextLabel: Record<GlucoseContext, string> = {
  fasting: "공복",
  "before-meal": "식전",
  "after-meal": "식후 2시간",
  bedtime: "취침 전",
  random: "수시",
};

export function buildCsvExportScopeSummary(state: CsvExportState): CsvExportScopeSummary {
  return {
    hasCancerCareReferences: state.profile.cancerCareMode,
    hasFoodCheck: Boolean(state.foodQuery.trim()),
    recordCount: csvRecordArrayKeys.reduce((count, key) => count + state[key].length, 0),
  };
}

export function buildCsvExportFingerprint(state: CsvExportState) {
  return JSON.stringify({
    deletedDocuments: state.deletedDocuments.map((document) => ({
      attachmentName: document.attachmentName,
      attachmentStatus: document.attachmentStatus,
      body: document.body,
      category: document.category,
      date: document.date,
      nextAction: document.nextAction,
      reviewStatus: document.reviewStatus,
      tags: document.tags,
      title: document.title,
    })),
    documents: state.documents.map((document) => ({
      attachmentName: document.attachmentName,
      attachmentStatus: document.attachmentStatus,
      body: document.body,
      category: document.category,
      date: document.date,
      nextAction: document.nextAction,
      reviewStatus: document.reviewStatus,
      tags: document.tags,
      title: document.title,
    })),
    foodQuery: state.foodQuery,
    labResults: state.labResults.map(formatLabResultFingerprint),
    profile: state.profile,
    questions: state.questions.map(formatQuestionFingerprint),
    symptoms: state.symptoms.map(formatSymptomFingerprint),
    visits: state.visits.map(formatVisitFingerprint),
    vitals: state.vitals.map(formatVitalFingerprint),
  });
}

function formatVitalFingerprint(vital: CsvExportState["vitals"][number]) {
  return {
    date: vital.date,
    diastolic: vital.diastolic,
    glucoseContext: vital.glucoseContext,
    glucoseMgDl: vital.glucoseMgDl,
    note: vital.note,
    systolic: vital.systolic,
    temperatureC: vital.temperatureC,
    type: vital.type,
  };
}

function formatVisitFingerprint(visit: CsvExportState["visits"][number]) {
  return {
    date: visit.date,
    hospital: visit.hospital,
    nextDate: visit.nextDate,
    plan: visit.plan,
    reason: visit.reason,
    summary: visit.summary,
  };
}

function formatLabResultFingerprint(lab: CsvExportState["labResults"][number]) {
  return {
    date: lab.date,
    lower: lab.lower,
    name: lab.name,
    note: lab.note,
    unit: lab.unit,
    upper: lab.upper,
    value: lab.value,
  };
}

function formatSymptomFingerprint(symptom: CsvExportState["symptoms"][number]) {
  return {
    action: symptom.action,
    body: symptom.body,
    date: symptom.date,
    medication: symptom.medication,
    severity: symptom.severity,
    symptom: symptom.symptom,
  };
}

function formatQuestionFingerprint(question: CsvExportState["questions"][number]) {
  return {
    answer: question.answer,
    date: question.date,
    priority: normalizeQuestionPriority(question.priority),
    question: question.question,
    status: question.status,
    topic: question.topic,
  };
}

export function formatCsvExportScopeSummary(state: CsvExportState) {
  const summary = buildCsvExportScopeSummary(state);
  return [
    `기록 ${summary.recordCount}개`,
    "케어큐 최대 8개",
    summary.hasCancerCareReferences ? "자궁경부암 참고 포함" : "자궁경부암 참고 없음",
    summary.hasFoodCheck ? "음식 판단 포함" : "음식 판단 없음",
    "기준/출처 포함",
    "로컬 경로 제외",
  ].join(" · ");
}

export function formatCsvExportDescription(state: CsvExportState) {
  return `CSV 내보내기 · ${formatCsvExportScopeSummary(state)}`;
}

export function formatCsvExportStatus(state: CsvExportState) {
  return `CSV 내보냄 · ${formatCsvExportScopeSummary(state)}`;
}

export function formatCsvPreviewDescription(state: CsvExportState) {
  return `CSV 미리보기 · ${formatCsvExportScopeSummary(state)}`;
}

export function formatCsvPreviewStatus(state: CsvExportState) {
  return `CSV 미리보기 생성 · ${formatCsvExportScopeSummary(state)}`;
}

export function buildCareVaultCsv(state: CsvExportState, exportedAt: string) {
  const rows = [
    row(headers),
    row(["meta", "", "exportedAt", exportedAt, "", ""]),
    row([
      "profile",
      "",
      state.profile.name,
      `${state.profile.age}세 / ${state.profile.heightCm}cm / ${state.profile.weightKg}kg${
        state.profile.waistCm ? ` / 허리 ${state.profile.waistCm}cm` : ""
      }`,
      profileSexLabel(state.profile.sex),
      joinDetail([
        state.profile.cancerCareMode ? "암환자 관리" : "일반 관리",
        state.profile.diabetes ? "당뇨 추적" : undefined,
        state.profile.hypertension ? "혈압 추적" : undefined,
      ]),
    ]),
  ];
  const careActions = buildCareActionQueue(state, exportedAt.slice(0, 10), 8);

  careActions.forEach((action) => {
    rows.push(
      row([
        "care_queue",
        csvIsoDate(action.date),
        formatCareActionQueueLabel(action),
        action.title,
        action.tone,
        action.detail,
      ]),
    );
  });

  state.vitals.forEach((vital) => {
    const evidence = buildVitalAssessmentEvidence(vital, { diabetes: state.profile.diabetes });
    const contextLabel =
      vital.type === "glucose" ? glucoseContextLabel[vital.glucoseContext ?? "random"] : "";
    const source = evidence ? formatVitalAssessmentSource(evidence) : "";
    const status = evidence
      ? [
          evidence.assessment.label,
          vital.type === "glucose" ? contextLabel : undefined,
          evidence.standard
            ? `${evidence.standard.sexApplicability} ${evidence.standard.label}`
            : undefined,
        ]
          .filter(Boolean)
          .join(" · ")
      : contextLabel;
    const detail = joinDetail([
      vital.note,
      evidence?.assessment.summary,
      source ? `근거: ${source}` : undefined,
    ]);
    const title =
      vital.type === "blood-pressure" ? "혈압" : vital.type === "temperature" ? "체온" : "혈당";
    const value =
      vital.type === "blood-pressure"
        ? `${vital.systolic ?? ""}/${vital.diastolic ?? ""} mmHg`
        : vital.type === "temperature"
          ? `${vital.temperatureC ?? ""}℃`
          : `${vital.glucoseMgDl ?? ""} mg/dL`;

    rows.push(
      row([
        "vital",
        csvIsoDate(vital.date),
        title,
        value,
        status,
        detail,
      ]),
    );
  });

  state.visits.forEach((visit) => {
    rows.push(
      row([
        "visit",
        csvIsoDate(visit.date),
        visit.hospital,
        visit.reason,
        csvIsoDate(visit.nextDate) ? `다음 예약 ${csvIsoDate(visit.nextDate)}` : "",
        joinDetail([visit.summary, visit.plan]),
      ]),
    );
  });

  state.labResults.forEach((lab) => {
    const assessment = assessLabTextValue(lab.value, lab.lower, lab.upper);
    const range = formatLabReferenceRangeLabel(lab.lower, lab.upper, lab.unit);
    const rangeSource = getLabRangeSourceLabel(lab.lower, lab.upper);
    rows.push(
      row([
        "lab",
        csvIsoDate(lab.date),
        lab.name,
        `${lab.value}${lab.unit ? ` ${lab.unit}` : ""}`,
        range ? `${rangeSource} ${range}` : rangeSource,
        joinDetail([assessment.label, formatLabNoteWithSourceEvidence(lab.note, lab.name)]),
      ]),
    );
  });

  state.symptoms.forEach((symptom) => {
    rows.push(
      row([
        "symptom",
        csvIsoDate(symptom.date),
        symptom.symptom,
        `${symptom.severity}/10`,
        joinDetail([formatSymptomRecordLabel(symptom), symptom.medication]),
        joinDetail([
          formatTextWithSourceEvidence(symptom.body),
          formatTextWithSourceEvidence(symptom.action),
        ]),
      ]),
    );
  });

  state.questions.forEach((question) => {
    const priority = normalizeQuestionPriority(question.priority);
    const questionEvidence = parseSourceEvidence(question.question);
    rows.push(
      row([
        "question",
        csvIsoDate(question.date),
        question.topic,
        questionEvidence.body,
        question.status,
        joinDetail([
          questionPriorityLabel[priority],
          question.answer,
          formatSourceEvidence(questionEvidence.sourceLabel, questionEvidence.sourceUrl),
        ]),
      ]),
    );
  });

  const pushDocument = (section: "document" | "deleted_document", document: CsvDocument) => {
    rows.push(
      row([
        section,
        csvIsoDate(document.date),
        document.title,
        document.category,
        document.reviewStatus,
        joinDetail([
          document.nextAction,
          document.tags,
          document.attachmentName ? `첨부: ${document.attachmentName}` : undefined,
          document.attachmentStatus,
          document.body,
        ]),
      ]),
    );
  };

  state.documents.forEach((document) => pushDocument("document", document));
  state.deletedDocuments.forEach((document) => pushDocument("deleted_document", document));

  rows.push(
    row([
      "standard_boundary",
      "",
      "기준 사용 경계",
      "성인 기준 참고",
      "",
      koreanHealthStandardUseBoundary,
    ]),
  );

  koreanHealthStandardApplicabilitySummary.forEach((item) => {
    rows.push(row(["standard_applicability", "", "성별 기준 요약", item.label, "", item.detail]));
  });

  buildProfileSexStandardNotes(state.profile.sex).forEach((item) => {
    rows.push(row(["standard_profile_sex", "", "현재 프로필 성별 적용", item.label, "", item.detail]));
  });

  buildVitalStandardRangeSections().forEach((section) => {
    section.lines.forEach((line) => {
      rows.push(
        row([
          "standard_numeric_range",
          "",
          section.label,
          line.label,
          section.sourceLabel,
          `${line.detail}${section.sourceUrl.startsWith("https://") ? ` | ${section.sourceUrl}` : ""}`,
        ]),
      );
    });
  });

  buildHealthStandardCoverageLines().forEach((line) => {
    rows.push(row(["standard_coverage", "", "기준 적용 범위", line, "", ""]));
  });

  if (state.profile.cancerCareMode) {
    const cervicalScreeningSummary = buildCervicalCancerScreeningSummary(state.profile);

    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "우선 확인 체크리스트",
        "국가암정보센터·KDCA",
        cervicalCancerCarePriorityItems.map(formatCervicalCancerCarePriorityEvidence).join(" / "),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "검진 기준 빠른 확인",
        cervicalScreeningSummary.status,
        formatCervicalCancerScreeningSummaryEvidence(cervicalScreeningSummary),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "경고 신호 기록 항목",
        "국가암정보센터·KDCA",
        cervicalCancerCareAlertRecordFields
          .map(formatCervicalCancerCareAlertRecordFieldEvidence)
          .join(" / "),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "진료팀에 확인할 신호",
        "국가암정보센터·KDCA",
        cervicalCancerCareAlerts.map(formatCervicalCancerCareAlertEvidence).join(" / "),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "진료 질문 초안",
        "국가암정보센터·KDCA",
        cervicalCancerCarePrompts
          .map(
            (prompt) =>
              `${prompt.topic}: ${buildCervicalCancerCarePromptQuestion(prompt).replace(/\n/g, " ")}`,
          )
          .join(" / "),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "기록 체크",
        "국가암정보센터·KDCA",
        cervicalCancerCareChecks.map(formatCervicalCancerCareItemEvidence).join(" / "),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "회복 일정 메모",
        "국가암정보센터·KDCA",
        cervicalCancerCareRecoveryGuides.map(formatCervicalCancerCareItemEvidence).join(" / "),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "검진·예방 메모",
        "국가암정보센터·KDCA",
        cervicalCancerCarePreventionGuides.map(formatCervicalCancerCareItemEvidence).join(" / "),
      ]),
    );
    rows.push(
      row([
        "cervical_care_reference",
        "",
        "자궁경부암 케어 참고",
        "공식 출처",
        "국가암정보센터·KDCA",
        Object.values(cervicalCancerCareSources)
          .map((source) => `${source.label} (${source.url})`)
          .join("; "),
      ]),
    );
  }

  if (state.foodQuery.trim()) {
    const food = assessCancerFood(state.foodQuery);
    const matches = food.matches.map(formatFoodMatchEvidence).join("; ");
    const immuneFoodContext = buildImmuneFoodSafetyContext(state.labResults);
    rows.push(
      row([
        "food_check",
        "",
        "음식 판단 입력",
        state.foodQuery,
        exportSourceLabels.foodLocalRules,
        joinDetail([
          food.label,
          food.summary,
          formatImmuneFoodSafetyContextText(immuneFoodContext),
          matches ? `근거: ${matches}` : undefined,
        ]),
      ]),
    );
  }

  return `${rows.join("\n")}\n`;
}
