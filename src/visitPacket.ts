import {
  assessBloodGlucose,
  assessBloodPressure,
  assessCancerFood,
  assessLabValue,
  calculateBmi,
  type GlucoseContext,
} from "./healthRules";

type Sex = "female" | "male" | "other";
type VitalType = "blood-pressure" | "glucose";
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
  "after-meal": "식후",
  bedtime: "취침 전",
  random: "수시",
};

export const visitPacketRangeLabels: Record<VisitPacketRange, string> = {
  "7d": "최근 7일",
  "30d": "최근 30일",
  "90d": "최근 90일",
  all: "전체",
};

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
    Number.parseFloat(state.profile.heightCm),
    Number.parseFloat(state.profile.weightKg),
  );

  const vitalLines = latestFirst(filterByRange(state.vitals, rangeStartDate))
    .slice(0, maxItems)
    .map((vital) => {
      if (vital.type === "blood-pressure" && vital.systolic && vital.diastolic) {
        const status = assessBloodPressure(vital.systolic, vital.diastolic);
        return `- ${vital.date}: 혈압 ${vital.systolic}/${vital.diastolic} mmHg - ${status.label}${optionalSuffix(vital.note, " / ")}`;
      }
      if (vital.type === "glucose" && vital.glucoseMgDl) {
        const context = vital.glucoseContext ?? "random";
        const status = assessBloodGlucose(vital.glucoseMgDl, context);
        return `- ${vital.date}: 혈당 ${vital.glucoseMgDl} mg/dL (${glucoseContextLabel[context]}) - ${status.label}${optionalSuffix(vital.note, " / ")}`;
      }
      return `- ${vital.date}: 미완성 활력 기록${optionalSuffix(vital.note, " / ")}`;
    });

  const labLines = latestFirst(filterByRange(state.labResults, rangeStartDate))
    .slice(0, maxItems)
    .map((lab) => {
      const assessment = assessLabValue(
        Number.parseFloat(lab.value),
        lab.lower ? Number.parseFloat(lab.lower) : undefined,
        lab.upper ? Number.parseFloat(lab.upper) : undefined,
      );
      const labRange = lab.lower || lab.upper ? ` (기준 ${lab.lower || "-"}-${lab.upper || "-"})` : "";
      return `- ${lab.date}: ${lab.name} ${lab.value} ${lab.unit}${labRange} - ${assessment.label}${optionalSuffix(lab.note, " / ")}`;
    });

  const symptomLines = latestFirst(filterByRange(state.symptoms, rangeStartDate))
    .slice(0, maxItems)
    .map(
      (symptom) =>
        `- ${symptom.date}: ${symptom.symptom} ${symptom.severity}/10${optionalSuffix(symptom.medication, " / 약: ")}${optionalSuffix(symptom.body, " / ")}${optionalSuffix(symptom.action, " / 다음 조치: ")}`,
    );

  const questionLines = latestFirst(filterByRange(state.questions, rangeStartDate))
    .slice(0, maxItems)
    .map(
      (question) =>
        `- ${question.date}: [${questionStatusLabel[question.status]}] ${question.topic} - ${question.question}${optionalSuffix(question.answer, " / 답변: ")}`,
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
        const matches = food.matches.map((match) => `${match.term}: ${match.reason}`).join("; ");
        return [`- ${options.foodQuery}: ${food.label} - ${food.summary}${optionalSuffix(matches, " / 근거: ")}`];
      })()
    : [];

  return [
    "# CareVault 진료 요약",
    "",
    `생성 시각: ${exportedAt}`,
    `범위: ${visitPacketRangeLabels[range]}`,
    "",
    "이 요약은 사용자가 입력한 기록을 진료 상담에 가져가기 위한 참고 메모입니다. 진단, 처방, 치료 지시가 아닙니다.",
    "",
    "## 프로필",
    "",
    `- 이름: ${state.profile.name}`,
    `- 나이/성별: ${state.profile.age || "미입력"} / ${sexLabel[state.profile.sex]}`,
    `- 키/몸무게: ${state.profile.heightCm || "미입력"} cm / ${state.profile.weightKg || "미입력"} kg`,
    `- BMI: ${bmi.value === null ? "계산 불가" : bmi.value.toFixed(1)} - ${bmi.label}`,
    `- 관리 플래그: ${[
      state.profile.cancerCareMode ? "암환자 관리" : "",
      state.profile.diabetes ? "당뇨" : "",
      state.profile.hypertension ? "고혈압" : "",
    ]
      .filter(Boolean)
      .join(", ") || "없음"}`,
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
