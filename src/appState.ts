import { type GlucoseContext } from "./healthRules";
import {
  createDefaultCaregiverShareSettings,
  normalizeCaregiverShareSettings,
  type CaregiverShareSettings,
} from "./caregiverShareSettings";
import {
  defaultQuestionPriority,
  normalizeQuestionPriority,
  type QuestionPriority,
} from "./questionPriority";
import { questionStatusLabel, type QuestionStatus } from "./questionStatus";
import { sanitizeProfileNumberInput } from "./profileValidation";
import { type DocumentHistoryEntry, type DocumentHistoryKind } from "./documentHistory";

export type Sex = "female" | "male" | "other";
export type VitalType = "blood-pressure" | "glucose" | "temperature";
export type DocumentCategory =
  | "lab"
  | "imaging"
  | "pathology"
  | "prescription"
  | "visit-note"
  | "insurance"
  | "other";
export type AttachmentStorage = "tauri-sandbox" | "browser-reference";
export type DocumentReviewStatus = "needs-review" | "care-question" | "waiting-result" | "done";
export type DocumentCategoryFilter = DocumentCategory | "all";
export type DocumentReviewStatusFilter = DocumentReviewStatus | "all";

export type Profile = {
  name: string;
  age: string;
  sex: Sex;
  heightCm: string;
  weightKg: string;
  waistCm: string;
  cancerCareMode: boolean;
  diabetes: boolean;
  hypertension: boolean;
};

export type VitalEntry = {
  id: string;
  date: string;
  type: VitalType;
  systolic?: number;
  diastolic?: number;
  glucoseMgDl?: number;
  glucoseContext?: GlucoseContext;
  temperatureC?: number;
  note: string;
};

export type VisitEntry = {
  id: string;
  date: string;
  hospital: string;
  reason: string;
  summary: string;
  plan: string;
  nextDate: string;
};

export type CareDocument = {
  id: string;
  date: string;
  title: string;
  category: DocumentCategory;
  body: string;
  tags: string;
  reviewStatus: DocumentReviewStatus;
  nextAction: string;
  attachmentName?: string;
  attachmentPath?: string;
  attachmentStorage?: AttachmentStorage;
  attachmentStatus?: string;
  history?: DocumentHistoryEntry[];
};

export type SymptomEntry = {
  id: string;
  date: string;
  symptom: string;
  severity: number;
  medication: string;
  body: string;
  action: string;
};

export type CareQuestion = {
  id: string;
  date: string;
  topic: string;
  question: string;
  priority: QuestionPriority;
  status: QuestionStatus;
  answer: string;
};

export type LabResult = {
  id: string;
  date: string;
  name: string;
  value: string;
  unit: string;
  lower: string;
  upper: string;
  note: string;
};

export type AppState = {
  profile: Profile;
  foodQuery: string;
  vitals: VitalEntry[];
  visits: VisitEntry[];
  documents: CareDocument[];
  deletedDocuments: CareDocument[];
  symptoms: SymptomEntry[];
  questions: CareQuestion[];
  labResults: LabResult[];
  caregiverShareSettings: CaregiverShareSettings;
};

export const today = new Date().toISOString().slice(0, 10);

export const defaultState: AppState = {
  profile: {
    name: "나의 건강 기록",
    age: "56",
    sex: "female",
    heightCm: "164",
    weightKg: "62",
    waistCm: "82",
    cancerCareMode: true,
    diabetes: true,
    hypertension: true,
  },
  foodQuery: "브로콜리, 현미밥, 베이컨, 자몽 주스",
  vitals: [
    {
      id: "bp-1",
      date: "2026-05-29",
      type: "blood-pressure",
      systolic: 132,
      diastolic: 84,
      note: "아침 안정 후 측정",
    },
    {
      id: "glu-1",
      date: "2026-05-30",
      type: "glucose",
      glucoseMgDl: 146,
      glucoseContext: "after-meal",
      note: "점심 식후 2시간",
    },
    {
      id: "bp-2",
      date: "2026-06-01",
      type: "blood-pressure",
      systolic: 126,
      diastolic: 78,
      note: "저녁 산책 후",
    },
  ],
  visits: [
    {
      id: "visit-1",
      date: "2026-06-01",
      hospital: "종양내과",
      reason: "정기 추적",
      summary: "최근 혈액검사 결과 확인. 식사량과 체중 변화를 계속 기록하기로 함.",
      plan: "2주 뒤 검사 결과 재확인",
      nextDate: "2026-06-15",
    },
  ],
  documents: [
    {
      id: "doc-1",
      date: "2026-06-01",
      title: "혈액검사 메모",
      category: "lab",
      body: "백혈구 수치와 간수치 변화를 다음 진료 때 질문할 것.",
      tags: "혈액검사,종양내과",
      reviewStatus: "care-question",
      nextAction: "백혈구 수치가 낮을 때 식사 제한 기준 질문",
      history: [
        {
          id: "history-doc-1-created",
          at: "2026-06-01T09:00:00.000Z",
          kind: "created",
          label: "서류 저장",
          detail: "혈액검사 메모 기록 생성",
        },
      ],
    },
  ],
  deletedDocuments: [],
  symptoms: [
    {
      id: "symptom-1",
      date: "2026-06-02",
      symptom: "오심",
      severity: 4,
      medication: "처방받은 항구토제 복용",
      body: "점심 이후 속이 메스꺼웠고 식사량이 줄었음.",
      action: "다음 진료 때 항구토제 조절 질문",
    },
  ],
  questions: [
    {
      id: "question-1",
      date: "2026-06-15",
      topic: "혈액검사",
      question: "백혈구 수치가 낮을 때 외식이나 날음식을 어느 정도 제한해야 하나?",
      priority: "high",
      status: "open",
      answer: "",
    },
  ],
  labResults: [
    {
      id: "lab-1",
      date: "2026-06-01",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "면역저하 식품 안전 질문과 연결",
    },
  ],
  caregiverShareSettings: createDefaultCaregiverShareSettings(),
};

export const emptyVital: VitalEntry = {
  id: "",
  date: today,
  type: "blood-pressure",
  systolic: 128,
  diastolic: 78,
  glucoseMgDl: 118,
  glucoseContext: "before-meal",
  temperatureC: 36.8,
  note: "",
};

export const vitalQuestionGlucoseContextLabel: Record<GlucoseContext, string> = {
  fasting: "공복",
  "before-meal": "식전",
  "after-meal": "식후 2시간",
  bedtime: "취침 전",
  random: "수시",
};

export const vitalTypeLabel: Record<VitalType, string> = {
  "blood-pressure": "혈압",
  glucose: "혈당",
  temperature: "체온",
};

export const emptyVisit: VisitEntry = {
  id: "",
  date: today,
  hospital: "",
  reason: "",
  summary: "",
  plan: "",
  nextDate: "",
};

export const emptyDocument: CareDocument = {
  id: "",
  date: today,
  title: "",
  category: "lab",
  body: "",
  tags: "",
  reviewStatus: "needs-review",
  nextAction: "",
};

export const emptySymptom: SymptomEntry = {
  id: "",
  date: today,
  symptom: "",
  severity: 3,
  medication: "",
  body: "",
  action: "",
};

export const emptyQuestion: CareQuestion = {
  id: "",
  date: today,
  topic: "",
  question: "",
  priority: defaultQuestionPriority,
  status: "open",
  answer: "",
};

export const emptyLabResult: LabResult = {
  id: "",
  date: today,
  name: "",
  value: "",
  unit: "",
  lower: "",
  upper: "",
  note: "",
};

export const sexLabel: Record<Sex, string> = {
  female: "여성",
  male: "남성",
  other: "기타/미지정",
};

export const documentLabel: Record<DocumentCategory, string> = {
  lab: "검사",
  imaging: "영상",
  pathology: "병리",
  prescription: "처방",
  "visit-note": "진료 메모",
  insurance: "보험/행정",
  other: "기타",
};

export const attachmentStorageLabel: Record<AttachmentStorage, string> = {
  "tauri-sandbox": "앱 보관",
  "browser-reference": "파일명 참조",
};

export const documentReviewStatusLabel: Record<DocumentReviewStatus, string> = {
  "needs-review": "검토 필요",
  "care-question": "의료진 질문",
  "waiting-result": "결과 대기",
  done: "정리 완료",
};

const sexIds = Object.keys(sexLabel) as Sex[];
const vitalTypeIds = Object.keys(vitalTypeLabel) as VitalType[];
const glucoseContextIds: GlucoseContext[] = [
  "fasting",
  "before-meal",
  "after-meal",
  "bedtime",
  "random",
];
const documentCategoryIds = Object.keys(documentLabel) as DocumentCategory[];
const attachmentStorageIds = Object.keys(attachmentStorageLabel) as AttachmentStorage[];
const documentReviewStatusIds = Object.keys(documentReviewStatusLabel) as DocumentReviewStatus[];
const documentHistoryKindIds: DocumentHistoryKind[] = [
  "created",
  "review-status",
  "next-action",
  "attachment-check",
  "attachment-replaced",
  "attachment-removed",
  "archived",
  "restored",
];
const questionStatusIds = Object.keys(questionStatusLabel) as QuestionStatus[];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeOptionalTextValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeDateValue(value: unknown, fallback = "") {
  const date = normalizeTextValue(value, fallback).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return fallback;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const normalizedDate = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);

  return normalizedDate === date ? date : fallback;
}

function normalizeIsoTimestampValue(value: unknown, fallback = "") {
  const timestamp = normalizeTextValue(value, fallback).trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp)) {
    return fallback;
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed.toISOString() === timestamp ? timestamp : fallback;
}

function normalizeBooleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeOptionalFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeOptionalPositiveFiniteNumber(value: unknown) {
  const numberValue = normalizeOptionalFiniteNumber(value);
  return numberValue !== undefined && numberValue > 0 ? numberValue : undefined;
}

function normalizeFiniteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeSeverityScore(value: unknown, fallback: number) {
  const severity = normalizeFiniteNumber(value, fallback);
  return Math.min(Math.max(Math.round(severity), 0), 10);
}

function normalizeEnumValue<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fallback: T,
) {
  return typeof value === "string" && allowedValues.includes(value as T)
    ? (value as T)
    : fallback;
}

function normalizeOptionalEnumValue<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
) {
  return typeof value === "string" && allowedValues.includes(value as T)
    ? (value as T)
    : undefined;
}

function normalizeRecordId(value: unknown, prefix: string, index: number) {
  const id = normalizeTextValue(value).trim();
  return id || `${prefix}-restored-${index + 1}`;
}

function normalizeRecordArray<T>(
  value: unknown,
  normalizeRecord: (record: Record<string, unknown>, index: number) => T,
): T[] {
  return Array.isArray(value)
    ? value.filter(isObjectRecord).map((record, index) => normalizeRecord(record, index))
    : [];
}

function normalizeProfile(value: unknown): Profile {
  const profile = isObjectRecord(value) ? value : {};

  return {
    name: normalizeTextValue(profile.name, defaultState.profile.name),
    age: sanitizeProfileNumberInput("age", profile.age, defaultState.profile.age),
    sex: normalizeEnumValue(profile.sex, sexIds, "other"),
    heightCm: sanitizeProfileNumberInput(
      "heightCm",
      profile.heightCm,
      defaultState.profile.heightCm,
    ),
    weightKg: sanitizeProfileNumberInput(
      "weightKg",
      profile.weightKg,
      defaultState.profile.weightKg,
    ),
    waistCm: sanitizeProfileNumberInput("waistCm", profile.waistCm, defaultState.profile.waistCm),
    cancerCareMode: normalizeBooleanValue(
      profile.cancerCareMode,
      defaultState.profile.cancerCareMode,
    ),
    diabetes: normalizeBooleanValue(profile.diabetes, defaultState.profile.diabetes),
    hypertension: normalizeBooleanValue(profile.hypertension, defaultState.profile.hypertension),
  };
}

function normalizeVitalEntry(vital: Record<string, unknown>, index: number): VitalEntry {
  return {
    id: normalizeRecordId(vital.id, "vital", index),
    date: normalizeDateValue(vital.date),
    type: normalizeEnumValue(vital.type, vitalTypeIds, "blood-pressure"),
    systolic: normalizeOptionalPositiveFiniteNumber(vital.systolic),
    diastolic: normalizeOptionalPositiveFiniteNumber(vital.diastolic),
    glucoseMgDl: normalizeOptionalPositiveFiniteNumber(vital.glucoseMgDl),
    glucoseContext: normalizeOptionalEnumValue(vital.glucoseContext, glucoseContextIds),
    temperatureC: normalizeOptionalPositiveFiniteNumber(vital.temperatureC),
    note: normalizeTextValue(vital.note),
  };
}

function normalizeVisitEntry(visit: Record<string, unknown>, index: number): VisitEntry {
  return {
    id: normalizeRecordId(visit.id, "visit", index),
    date: normalizeDateValue(visit.date),
    hospital: normalizeTextValue(visit.hospital),
    reason: normalizeTextValue(visit.reason),
    summary: normalizeTextValue(visit.summary),
    plan: normalizeTextValue(visit.plan),
    nextDate: normalizeDateValue(visit.nextDate),
  };
}

function normalizeDocumentHistoryEntry(
  history: Record<string, unknown>,
  index: number,
): DocumentHistoryEntry {
  return {
    id: normalizeRecordId(history.id, "history", index),
    at: normalizeIsoTimestampValue(history.at),
    kind: normalizeEnumValue(history.kind, documentHistoryKindIds, "created"),
    label: normalizeTextValue(history.label),
    detail: normalizeTextValue(history.detail),
  };
}

function normalizeDocumentHistory(value: unknown) {
  return normalizeRecordArray(value, normalizeDocumentHistoryEntry);
}

function normalizeDocumentEntry(document: Record<string, unknown>, index: number): CareDocument {
  return {
    id: normalizeRecordId(document.id, "document", index),
    date: normalizeDateValue(document.date),
    title: normalizeTextValue(document.title),
    category: normalizeEnumValue(document.category, documentCategoryIds, "other"),
    body: normalizeTextValue(document.body),
    tags: normalizeTextValue(document.tags),
    reviewStatus: normalizeEnumValue(
      document.reviewStatus,
      documentReviewStatusIds,
      "needs-review",
    ),
    nextAction: normalizeTextValue(document.nextAction),
    attachmentName: normalizeOptionalTextValue(document.attachmentName),
    attachmentPath: normalizeOptionalTextValue(document.attachmentPath),
    attachmentStorage: normalizeOptionalEnumValue(document.attachmentStorage, attachmentStorageIds),
    attachmentStatus: normalizeOptionalTextValue(document.attachmentStatus),
    history: normalizeDocumentHistory(document.history),
  };
}

function normalizeSymptomEntry(symptom: Record<string, unknown>, index: number): SymptomEntry {
  return {
    id: normalizeRecordId(symptom.id, "symptom", index),
    date: normalizeDateValue(symptom.date),
    symptom: normalizeTextValue(symptom.symptom),
    severity: normalizeSeverityScore(symptom.severity, emptySymptom.severity),
    medication: normalizeTextValue(symptom.medication),
    body: normalizeTextValue(symptom.body),
    action: normalizeTextValue(symptom.action),
  };
}

function normalizeQuestionEntry(question: Record<string, unknown>, index: number): CareQuestion {
  return {
    id: normalizeRecordId(question.id, "question", index),
    date: normalizeDateValue(question.date),
    topic: normalizeTextValue(question.topic),
    question: normalizeTextValue(question.question),
    priority: normalizeQuestionPriority(question.priority),
    status: normalizeEnumValue(question.status, questionStatusIds, "open"),
    answer: normalizeTextValue(question.answer),
  };
}

function normalizeLabResultEntry(labResult: Record<string, unknown>, index: number): LabResult {
  return {
    id: normalizeRecordId(labResult.id, "lab", index),
    date: normalizeDateValue(labResult.date),
    name: normalizeTextValue(labResult.name),
    value: normalizeTextValue(labResult.value),
    unit: normalizeTextValue(labResult.unit),
    lower: normalizeTextValue(labResult.lower),
    upper: normalizeTextValue(labResult.upper),
    note: normalizeTextValue(labResult.note),
  };
}

export function normalizeAppState(input: unknown): AppState {
  const persisted = isObjectRecord(input) ? (input as Partial<AppState>) : {};
  const documents = normalizeRecordArray(persisted.documents, normalizeDocumentEntry);
  const deletedDocuments = normalizeRecordArray(
    persisted.deletedDocuments,
    normalizeDocumentEntry,
  );

  return {
    ...defaultState,
    ...persisted,
    profile: normalizeProfile(persisted.profile),
    foodQuery:
      typeof persisted.foodQuery === "string" ? persisted.foodQuery : defaultState.foodQuery,
    vitals: normalizeRecordArray(persisted.vitals, normalizeVitalEntry),
    visits: normalizeRecordArray(persisted.visits, normalizeVisitEntry),
    documents,
    deletedDocuments,
    symptoms: normalizeRecordArray(persisted.symptoms, normalizeSymptomEntry),
    questions: normalizeRecordArray(persisted.questions, normalizeQuestionEntry),
    labResults: normalizeRecordArray(persisted.labResults, normalizeLabResultEntry),
    caregiverShareSettings: normalizeCaregiverShareSettings(
      isObjectRecord(persisted.caregiverShareSettings)
        ? persisted.caregiverShareSettings
        : undefined,
    ),
  };
}
