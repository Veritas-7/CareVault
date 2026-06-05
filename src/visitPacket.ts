import {
  assessCancerFood,
  assessLabTextValue,
  calculateBmi,
  formatFoodMatchEvidence,
  parseFiniteNumberText,
  type GlucoseContext,
} from "./healthRules";
import {
  exportSourceLabels,
  formatLabReferenceRangeLabel,
  getLabRangeSourceLabel,
} from "./exportSourceLabels";
import {
  buildProfileSexStandardNotes,
  buildHealthStandardCoverageLines,
  buildVitalStandardRangeSections,
  koreanHealthStandardApplicabilitySummary,
  koreanHealthStandardUseBoundary,
} from "./healthStandards";
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
import {
  buildCareActionQueue,
  formatCareActionQueueLabel,
} from "./careActionQueue";
import {
  buildImmuneFoodSafetyContext,
  formatImmuneFoodSafetyContextText,
} from "./immuneFoodContext";
import { formatLabNoteWithSourceEvidence } from "./labSourceEvidence";
import { formatTextWithSourceEvidence } from "./sourceEvidence";
import { formatSymptomRecordLabel } from "./symptomRecordLabels";
import {
  buildVitalAssessmentEvidence,
  formatVitalAssessmentSource,
  formatVitalAssessmentStatus,
} from "./vitalAssessmentEvidence";

type Sex = "female" | "male" | "other";
type VitalType = "blood-pressure" | "glucose" | "temperature";
type DocumentCategory =
  | "lab"
  | "imaging"
  | "pathology"
  | "prescription"
  | "visit-note"
  | "insurance"
  | "other";
type DocumentReviewStatus = "needs-review" | "care-question" | "waiting-result" | "done";
type QuestionStatus = "open" | "answered" | "deferred";
export type VisitPacketRange = "7d" | "30d" | "90d" | "all";

export type VisitPacketState = {
  profile: {
    name: string;
    age: string;
    sex: Sex;
    heightCm: string;
    weightKg: string;
    waistCm?: string;
    cancerCareMode: boolean;
    diabetes: boolean;
    hypertension: boolean;
  };
  vitals: Array<{
    date: string;
    type: VitalType;
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
  documents: Array<{
    date: string;
    title: string;
    category: DocumentCategory;
    body: string;
    tags: string;
    reviewStatus?: DocumentReviewStatus;
    nextAction?: string;
    attachmentName?: string;
    attachmentPath?: string;
  }>;
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

type VisitPacketOptions = {
  exportedAt?: string;
  foodQuery?: string;
  maxItems?: number;
  range?: VisitPacketRange;
};

const sexLabel: Record<Sex, string> = {
  female: "여성",
  male: "남성",
  other: "기타/미지정",
};

const documentLabel: Record<DocumentCategory, string> = {
  lab: "검사",
  imaging: "영상",
  pathology: "병리",
  prescription: "처방",
  "visit-note": "진료 메모",
  insurance: "보험/행정",
  other: "기타",
};

const documentReviewStatusLabel: Record<DocumentReviewStatus, string> = {
  "needs-review": "검토 필요",
  "care-question": "의료진 질문",
  "waiting-result": "결과 대기",
  done: "정리 완료",
};

const questionStatusLabel: Record<QuestionStatus, string> = {
  open: "확인 필요",
  answered: "답변 완료",
  deferred: "보류",
};

const glucoseContextLabel: Record<GlucoseContext, string> = {
  fasting: "공복",
  "before-meal": "식전",
  "after-meal": "식후 2시간",
  bedtime: "취침 전",
  random: "수시",
};

export const visitPacketRangeLabels: Record<VisitPacketRange, string> = {
  "7d": "최근 7일",
  "30d": "최근 30일",
  "90d": "최근 90일",
  all: "전체",
};

export function formatVisitPacketExportDescription(range: VisitPacketRange) {
  return `진료 요약 내보내기 · 범위 ${visitPacketRangeLabels[range]}`;
}

export function formatVisitPacketExportStatus(range: VisitPacketRange) {
  return `진료 요약 내보냄 · 범위 ${visitPacketRangeLabels[range]}`;
}

export function formatVisitPacketPreviewDescription(range: VisitPacketRange) {
  return `진료 요약 미리보기 · 범위 ${visitPacketRangeLabels[range]}`;
}

export function formatVisitPacketPreviewStatus(range: VisitPacketRange) {
  return `진료 요약 미리보기 생성 · 범위 ${visitPacketRangeLabels[range]}`;
}

export function buildVisitPacketExportFingerprint(
  state: VisitPacketState,
  foodQuery = "",
) {
  return JSON.stringify({
    documents: state.documents.map((document) => ({
      attachmentName: document.attachmentName,
      body: document.body,
      category: document.category,
      date: document.date,
      nextAction: document.nextAction,
      reviewStatus: document.reviewStatus,
      tags: document.tags,
      title: document.title,
    })),
    foodQuery,
    labResults: state.labResults,
    profile: state.profile,
    questions: state.questions,
    symptoms: state.symptoms,
    visits: state.visits,
    vitals: state.vitals,
  });
}

const visitPacketRangeDays: Partial<Record<VisitPacketRange, number>> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function latestFirst<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function getRangeStartDate(exportedAt: string, range: VisitPacketRange) {
  const days = visitPacketRangeDays[range];
  if (!days) return null;

  const asOf = new Date(exportedAt);
  if (Number.isNaN(asOf.getTime())) return null;

  const start = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - days + 1);
  return start.toISOString().slice(0, 10);
}

function filterByRange<T extends { date: string }>(items: T[], startDate: string | null) {
  if (!startDate) return items;
  return items.filter((item) => item.date >= startDate);
}

function orNone(lines: string[]) {
  return lines.length ? lines : ["- 기록 없음"];
}

function optionalSuffix(value: string, prefix = "") {
  const trimmed = value.trim();
  return trimmed ? `${prefix}${trimmed}` : "";
}

export function buildVisitPacketMarkdown(
  state: VisitPacketState,
  options: VisitPacketOptions = {},
) {
  const exportedAt = options.exportedAt ?? new Date().toISOString();
  const maxItems = options.maxItems ?? 8;
  const range = options.range ?? "all";
  const rangeStartDate = getRangeStartDate(exportedAt, range);
  const bmi = calculateBmi(
    parseFiniteNumberText(state.profile.heightCm) ?? Number.NaN,
    parseFiniteNumberText(state.profile.weightKg) ?? Number.NaN,
  );

  const vitalLines = latestFirst(filterByRange(state.vitals, rangeStartDate))
    .slice(0, maxItems)
    .map((vital) => {
      if (vital.type === "blood-pressure" && vital.systolic && vital.diastolic) {
        const evidence = buildVitalAssessmentEvidence(vital, {
          diabetes: state.profile.diabetes,
        });
        const source = evidence ? formatVitalAssessmentSource(evidence) : "";
        const status = evidence ? formatVitalAssessmentStatus(evidence) : "판정 대기";
        return `- ${vital.date}: 혈압 ${vital.systolic}/${vital.diastolic} mmHg - ${status}${optionalSuffix(
          vital.note,
          " / ",
        )}${optionalSuffix(source, " / 근거: ")}`;
      }
      if (vital.type === "glucose" && vital.glucoseMgDl) {
        const context = vital.glucoseContext ?? "random";
        const evidence = buildVitalAssessmentEvidence(vital, {
          diabetes: state.profile.diabetes,
        });
        const source = evidence ? formatVitalAssessmentSource(evidence) : "";
        const status = evidence ? formatVitalAssessmentStatus(evidence) : "판정 대기";
        return `- ${vital.date}: 혈당 ${vital.glucoseMgDl} mg/dL (${glucoseContextLabel[context]}) - ${status}${optionalSuffix(
          vital.note,
          " / ",
        )}${optionalSuffix(source, " / 근거: ")}`;
      }
      if (vital.type === "temperature" && vital.temperatureC) {
        const evidence = buildVitalAssessmentEvidence(vital, {
          diabetes: state.profile.diabetes,
        });
        const source = evidence ? formatVitalAssessmentSource(evidence) : "";
        const status = evidence ? formatVitalAssessmentStatus(evidence) : "판정 대기";
        return `- ${vital.date}: 체온 ${vital.temperatureC}℃ - ${status}${optionalSuffix(
          vital.note,
          " / ",
        )}${optionalSuffix(source, " / 근거: ")}`;
      }
      return `- ${vital.date}: 미완성 활력 기록${optionalSuffix(vital.note, " / ")}`;
    });

  const labLines = latestFirst(filterByRange(state.labResults, rangeStartDate))
    .slice(0, maxItems)
    .map((lab) => {
      const assessment = assessLabTextValue(lab.value, lab.lower, lab.upper);
      const labRangeLabel = formatLabReferenceRangeLabel(lab.lower, lab.upper, lab.unit);
      const labRange = labRangeLabel ? ` (기준 ${labRangeLabel})` : "";
      const sourceLabel = getLabRangeSourceLabel(lab.lower, lab.upper);
      return `- ${lab.date}: ${lab.name} ${lab.value} ${lab.unit}${labRange} - [${sourceLabel}] ${assessment.label}${optionalSuffix(formatLabNoteWithSourceEvidence(lab.note, lab.name), " / ")}`;
    });

  const symptomLines = latestFirst(filterByRange(state.symptoms, rangeStartDate))
    .slice(0, maxItems)
    .map(
      (symptom) =>
        `- ${symptom.date}: [${formatSymptomRecordLabel(symptom)}] ${symptom.symptom} ${symptom.severity}/10${optionalSuffix(symptom.medication, " / 약: ")}${optionalSuffix(formatTextWithSourceEvidence(symptom.body), " / ")}${optionalSuffix(formatTextWithSourceEvidence(symptom.action), " / 다음 조치: ")}`,
    );

  const questionLines = latestFirst(filterByRange(state.questions, rangeStartDate))
    .slice(0, maxItems)
    .map(
      (question) => {
        const priority = normalizeQuestionPriority(question.priority);
        return `- ${question.date}: [${questionStatusLabel[question.status]} · ${questionPriorityLabel[priority]}] ${question.topic} - ${formatTextWithSourceEvidence(question.question)}${optionalSuffix(question.answer, " / 답변: ")}`;
      },
    );

  const visitLines = latestFirst(filterByRange(state.visits, rangeStartDate))
    .slice(0, maxItems)
    .map(
      (visit) =>
        `- ${visit.date}: ${visit.hospital} / ${visit.reason}${optionalSuffix(visit.summary, " / 요약: ")}${optionalSuffix(visit.plan, " / 계획: ")}${optionalSuffix(visit.nextDate, " / 다음 일정: ")}`,
    );

  const documentLines = latestFirst(filterByRange(state.documents, rangeStartDate))
    .slice(0, maxItems)
    .map((document) => {
      const attachment = document.attachmentName ? ` / 첨부: ${document.attachmentName}` : "";
      const reviewStatus = document.reviewStatus
        ? ` / 상태: ${documentReviewStatusLabel[document.reviewStatus]}`
        : "";
      return `- ${document.date}: [${documentLabel[document.category]}] ${document.title}${reviewStatus}${optionalSuffix(document.nextAction ?? "", " / 다음 조치: ")}${attachment}${optionalSuffix(document.tags, " / 태그: ")}${optionalSuffix(document.body, " / 메모: ")}`;
    });

  const foodLines = options.foodQuery?.trim()
    ? (() => {
        const food = assessCancerFood(options.foodQuery ?? "");
        const matches = food.matches.map(formatFoodMatchEvidence).join("; ");
        const immuneFoodContext = buildImmuneFoodSafetyContext(
          filterByRange(state.labResults, rangeStartDate),
        );
        return [
          `- ${options.foodQuery}: [${exportSourceLabels.foodLocalRules}] ${food.label} - ${food.summary}${optionalSuffix(formatImmuneFoodSafetyContextText(immuneFoodContext), " / ")}${optionalSuffix(matches, " / 근거: ")}`,
        ];
      })()
    : [];
  const standardApplicabilityLines = koreanHealthStandardApplicabilitySummary.map(
    (item) => `- ${item.label}: ${item.detail}`,
  );
  const profileSexStandardLines = buildProfileSexStandardNotes(state.profile.sex).map(
    (item) => `- ${item.label}: ${item.detail}`,
  );
  const vitalStandardRangeLines = buildVitalStandardRangeSections().flatMap((section) => [
    `- ${section.label} · 근거: ${section.sourceLabel}${
      section.sourceUrl.startsWith("https://") ? ` (${section.sourceUrl})` : ""
    }`,
    ...section.lines.map((line) => `  - ${line.label}: ${line.detail}`),
  ]);
  const standardCoverageLines = buildHealthStandardCoverageLines().map((line) => `- ${line}`);
  const careActionState = {
    documents: filterByRange(state.documents, rangeStartDate),
    labResults: filterByRange(state.labResults, rangeStartDate),
    profile: state.profile,
    questions: filterByRange(state.questions, rangeStartDate),
    symptoms: filterByRange(state.symptoms, rangeStartDate),
    vitals: filterByRange(state.vitals, rangeStartDate),
    visits: filterByRange(state.visits, rangeStartDate),
  };
  const careActionLines = buildCareActionQueue(
    careActionState,
    exportedAt.slice(0, 10),
    maxItems,
  ).map(
    (action) =>
      `- ${action.date}: [${formatCareActionQueueLabel(action)}] ${action.title}${optionalSuffix(
        action.detail,
        " / ",
      )}`,
  );
  const cervicalCareLines = state.profile.cancerCareMode
    ? [
        `- 우선 확인 체크리스트: ${cervicalCancerCarePriorityItems
          .map(formatCervicalCancerCarePriorityEvidence)
          .join(" / ")}`,
        `- 검진 기준 빠른 확인: ${formatCervicalCancerScreeningSummaryEvidence(
          buildCervicalCancerScreeningSummary(state.profile),
        )}`,
        `- 경고 신호 기록 항목: ${cervicalCancerCareAlertRecordFields
          .map(formatCervicalCancerCareAlertRecordFieldEvidence)
          .join(" / ")}`,
        `- 진료팀에 확인할 신호: ${cervicalCancerCareAlerts
          .map(formatCervicalCancerCareAlertEvidence)
          .join(" / ")}`,
        `- 진료 질문 초안: ${cervicalCancerCarePrompts
          .map((prompt) =>
            `${prompt.topic}: ${buildCervicalCancerCarePromptQuestion(prompt).replace(/\n/g, " ")}`,
          )
          .join(" / ")}`,
        `- 기록 체크: ${cervicalCancerCareChecks
          .map(formatCervicalCancerCareItemEvidence)
          .join(" / ")}`,
        `- 회복 일정 메모: ${cervicalCancerCareRecoveryGuides
          .map(formatCervicalCancerCareItemEvidence)
          .join(" / ")}`,
        `- 검진·예방 메모: ${cervicalCancerCarePreventionGuides
          .map(formatCervicalCancerCareItemEvidence)
          .join(" / ")}`,
        `- 공식 출처: ${Object.values(cervicalCancerCareSources)
          .map((source) => `${source.label} (${source.url})`)
          .join("; ")}`,
      ]
    : [];

  return [
    "# CareVault 진료 요약",
    "",
    `생성 시각: ${exportedAt}`,
    `범위: ${visitPacketRangeLabels[range]}`,
    "",
    "이 요약은 사용자가 입력한 기록을 진료 상담에 가져가기 위한 참고 메모입니다. 진단, 처방, 치료 지시가 아닙니다.",
    "",
    "## 기준 적용 범위",
    "",
    "CareVault가 자동 판정하는 항목과 입력 보조 항목을 구분합니다. 검사실 기준은 사용자가 입력한 결과지 기준을 우선합니다.",
    `주의: ${koreanHealthStandardUseBoundary}`,
    "",
    "성별 기준 요약",
    "",
    ...standardApplicabilityLines,
    "",
    "현재 프로필 성별 적용",
    "",
    ...profileSexStandardLines,
    "",
    "신체계측·혈압·혈당·신기능·전해질·지질·간기능·단백·칼슘·인산·요산·혈액·체온 숫자 범위",
    "",
    ...vitalStandardRangeLines,
    "",
    ...standardCoverageLines,
    "",
    "## 프로필",
    "",
    `- 이름: ${state.profile.name}`,
    `- 나이/성별: ${state.profile.age || "미입력"} / ${sexLabel[state.profile.sex]}`,
    `- 키/몸무게/허리둘레: ${state.profile.heightCm || "미입력"} cm / ${state.profile.weightKg || "미입력"} kg / ${state.profile.waistCm || "미입력"} cm`,
    `- BMI: ${bmi.value === null ? "계산 불가" : bmi.value.toFixed(1)} - ${bmi.label}`,
    `- 관리 플래그: ${[
      state.profile.cancerCareMode ? "암환자 관리" : "",
      state.profile.diabetes ? "당뇨" : "",
      state.profile.hypertension ? "고혈압" : "",
    ]
      .filter(Boolean)
      .join(", ") || "없음"}`,
    "",
    ...(cervicalCareLines.length
      ? [
          "## 자궁경부암 케어 참고",
          "",
          "진료 준비용 기록 참고입니다. 진단, 처방, 치료 지시가 아닙니다.",
          "",
          ...cervicalCareLines,
          "",
        ]
      : []),
    "## 진료 준비 큐",
    "",
    "저장된 기록에서 가져온 확인 항목입니다. 새 진단이나 치료 지시가 아닙니다.",
    "",
    ...orNone(careActionLines),
    "",
    "## 최근 혈압/혈당",
    "",
    ...orNone(vitalLines),
    "",
    "## 검사 수치",
    "",
    ...orNone(labLines),
    "",
    "## 증상·부작용",
    "",
    ...orNone(symptomLines),
    "",
    "## 진료 전 질문",
    "",
    ...orNone(questionLines),
    "",
    "## 병원 방문·예약",
    "",
    ...orNone(visitLines),
    "",
    "## 서류 메모",
    "",
    ...orNone(documentLines),
    "",
    "## 음식 판단 메모",
    "",
    ...orNone(foodLines),
    "",
  ].join("\n");
}
