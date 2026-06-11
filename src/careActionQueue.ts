import {
  assessBloodGlucose,
  assessBloodPressure,
  assessLabTextValue,
  assessTemperature,
  type GlucoseContext,
} from "./healthRules";
import {
  formatHealthStandardSource,
  getHealthStandardCoverage,
} from "./healthStandards";
import {
  normalizeQuestionPriority,
  questionPriorityLabel,
  questionPrioritySortRank,
  type QuestionPriority,
} from "./questionPriority";
import {
  buildCervicalCancerScreeningSummary,
  formatCervicalCancerScreeningSummaryEvidence,
} from "./cervicalCancerCare";
import { buildLabSourceEvidenceParts, formatLabSourceEvidence } from "./labSourceEvidence";
import { buildDocumentCareQuestionDraft } from "./documentKnowledge";
import { formatTextWithSourceEvidence } from "./sourceEvidence";
import {
  findSymptomSupportTemplate,
  type SymptomSupportTemplate,
} from "./symptomSupportTemplates";

export type CareActionSource =
  | "visit"
  | "question"
  | "lab"
  | "document"
  | "symptom"
  | "vital"
  | "cervical";
export type CareActionTone = "watch" | "neutral";

type QuestionStatus = "open" | "answered" | "deferred";
type DocumentReviewStatus = "needs-review" | "care-question" | "waiting-result" | "done";
type ActiveDocumentReviewStatus = Exclude<DocumentReviewStatus, "done">;

export type CareAction = {
  id: string;
  date: string;
  source: CareActionSource;
  tone: CareActionTone;
  label: string;
  title: string;
  detail: string;
  sortRank?: number;
};

export type CareActionQueueState = {
  profile?: {
    age?: string;
    cancerCareMode?: boolean;
    diabetes?: boolean;
    sex?: string;
  };
  vitals?: Array<{
    id?: string;
    date: string;
    type: "blood-pressure" | "glucose" | string;
    systolic?: number;
    diastolic?: number;
    glucoseMgDl?: number;
    glucoseContext?: GlucoseContext;
    temperatureC?: number;
    note: string;
  }>;
  visits: Array<{
    id?: string;
    date: string;
    hospital: string;
    reason: string;
    summary: string;
    plan: string;
    nextDate: string;
  }>;
  questions: Array<{
    id?: string;
    date: string;
    topic: string;
    question: string;
    priority?: QuestionPriority;
    status: QuestionStatus;
  }>;
  labResults: Array<{
    id?: string;
    date: string;
    name: string;
    value: string;
    unit: string;
    lower: string;
    upper: string;
    note: string;
  }>;
  documents: Array<{
    id?: string;
    date: string;
    title: string;
    body?: string;
    tags?: string;
    reviewStatus?: DocumentReviewStatus;
    nextAction?: string;
  }>;
  symptoms: Array<{
    id?: string;
    date: string;
    symptom: string;
    severity: number;
    medication?: string;
    body: string;
    action: string;
  }>;
};

export type CareActionQueueSourceCounts = Record<CareActionSource, number>;

export type CareActionQueueToneCounts = {
  total: number;
  watch: number;
  neutral: number;
  sourceBacked: number;
};

const documentStatusLabel: Record<ActiveDocumentReviewStatus, string> = {
  "needs-review": "서류 검토",
  "care-question": "서류 질문",
  "waiting-result": "결과 대기",
};

const clipboardSourceLabel: Record<CareActionSource, string> = {
  cervical: "자궁경부암",
  document: "서류",
  lab: "검사",
  question: "질문",
  symptom: "증상",
  vital: "활력",
  visit: "예약",
};

export const careActionQueueSourceLabel: Record<CareActionSource, string> = {
  cervical: "자궁경부",
  document: "서류",
  lab: "검사",
  question: "질문",
  symptom: "증상",
  vital: "활력",
  visit: "방문",
};

export const careActionQueueSourceOrder: CareActionSource[] = [
  "symptom",
  "cervical",
  "question",
  "vital",
  "lab",
  "document",
  "visit",
];

const glucoseContextLabel: Record<GlucoseContext, string> = {
  fasting: "공복",
  "before-meal": "식전",
  "after-meal": "식후 2시간",
  bedtime: "취침 전",
  random: "수시",
};

type CareActionDocument = CareActionQueueState["documents"][number];
type ActiveCareActionDocument = CareActionDocument & {
  reviewStatus: ActiveDocumentReviewStatus;
};

function hasActiveReviewStatus(document: CareActionDocument): document is ActiveCareActionDocument {
  return Boolean(document.reviewStatus && document.reviewStatus !== "done");
}

function formatDocumentActionDetail(document: ActiveCareActionDocument) {
  return firstText(
    document.nextAction,
    buildDocumentCareQuestionDraft(document),
    document.body,
    document.tags,
  );
}

function firstText(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? "";
}

function joinText(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).filter(Boolean).join(" / ");
}

function getValidIsoDate(date: string | undefined) {
  const trimmed = date?.trim() ?? "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return undefined;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const normalized = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
  return normalized === trimmed ? trimmed : undefined;
}

function standardEvidence(standardId: string) {
  const standard = getHealthStandardCoverage(standardId);
  return standard ? `근거: ${formatHealthStandardSource(standard)}` : undefined;
}

function formatLabActionDetail(
  lab: Pick<CareActionQueueState["labResults"][number], "name" | "note">,
  summary: string,
) {
  const evidence = buildLabSourceEvidenceParts(lab);
  return joinText(
    evidence.noteBody,
    summary,
    formatLabSourceEvidence(evidence.sourceLabel, evidence.sourceUrl),
  );
}

function compareActions(left: CareAction, right: CareAction) {
  const toneRank: Record<CareActionTone, number> = { watch: 0, neutral: 1 };
  return (
    toneRank[left.tone] - toneRank[right.tone] ||
    (left.sortRank ?? 1) - (right.sortRank ?? 1) ||
    left.date.localeCompare(right.date)
  );
}

export function formatCareActionQueueLabel(action: CareAction) {
  const label = action.source === "question" ? action.label.replace(/^질문 · /, "") : action.label;
  return `${clipboardSourceLabel[action.source]} · ${label}`;
}

function isCervicalWarningSymptom(symptom: CareActionQueueState["symptoms"][number]) {
  return `${symptom.symptom} ${symptom.body} ${symptom.action}`.includes(
    "국가암정보센터 자궁경부암",
  );
}

function isStructuredCervicalWarningDraft(symptom: CareActionQueueState["symptoms"][number]) {
  return `${symptom.body}\n${symptom.action}`.includes("자궁경부암 경고 신호 기록 초안");
}

function isStructuredCervicalRecordMemoDraft(symptom: CareActionQueueState["symptoms"][number]) {
  return `${symptom.body}\n${symptom.action}`.includes("자궁경부암 기록 메모 초안");
}

const contactThresholdSymptomLabels = {
  "cervical-bowel-obstruction": "장폐색 확인 기록",
  "cervical-general-warning": "자궁경부암 증상 변화 기록",
  "cervical-urinary-bowel-bleeding": "배뇨·배변 변화 기록",
  "infection-fever": "감염 의심 기록",
  lymphedema: "림프부종 확인 기록",
} as const;

type ContactThresholdSymptomId = keyof typeof contactThresholdSymptomLabels;

function isContactThresholdSymptomId(value: string): value is ContactThresholdSymptomId {
  return value in contactThresholdSymptomLabels;
}

function getContactThresholdSymptomTemplate(
  symptom: CareActionQueueState["symptoms"][number],
): SymptomSupportTemplate | undefined {
  const symptomText = isStructuredCervicalWarningDraft(symptom)
    ? joinText(symptom.symptom, symptom.action, symptom.medication)
    : joinText(symptom.symptom, symptom.body, symptom.medication);
  const template =
    findSymptomSupportTemplate(symptomText) ??
    findSymptomSupportTemplate(joinText(symptomText, symptom.action));
  return template && isContactThresholdSymptomId(template.id) ? template : undefined;
}

function formatSymptomTemplateEvidence(template: SymptomSupportTemplate) {
  return `근거: ${template.sourceLabel} (${template.sourceUrl})`;
}

function stripSymptomTemplateCitation(text: string | undefined, template: SymptomSupportTemplate) {
  const citation = `출처: ${template.sourceLabel} - ${template.sourceUrl}`;
  return (text ?? "").replace(citation, "").trim();
}

function normalizeSymptomDetailText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function formatSymptomTextWithoutTemplateCitation(
  text: string | undefined,
  template: SymptomSupportTemplate,
) {
  return normalizeSymptomDetailText(
    formatTextWithSourceEvidence(stripSymptomTemplateCitation(text, template)),
  );
}

function extractCervicalRecordMemoBasis(text: string | undefined) {
  return text
    ?.split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("- 공식 근거/기록 기준: "))
    ?.replace("- 공식 근거/기록 기준: ", "")
    .trim();
}

function extractSourceEvidenceLine(text: string | undefined) {
  return text
    ?.split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("출처:"));
}

function formatSymptomActionDetail(
  symptom: CareActionQueueState["symptoms"][number],
  template: SymptomSupportTemplate | undefined,
) {
  if (!template) {
    const memoBasis = extractCervicalRecordMemoBasis(symptom.body);
    const sourceEvidenceLine = extractSourceEvidenceLine(symptom.body);
    const sourceEvidence = sourceEvidenceLine
      ? formatTextWithSourceEvidence(sourceEvidenceLine)
      : undefined;
    return joinText(
      formatTextWithSourceEvidence(firstText(symptom.action, symptom.body, symptom.medication)),
      memoBasis,
      sourceEvidence,
    );
  }

  const actionText = formatSymptomTextWithoutTemplateCitation(symptom.action, template);
  const bodyText = formatSymptomTextWithoutTemplateCitation(symptom.body, template);
  const memoBasis = extractCervicalRecordMemoBasis(symptom.body);
  return joinText(
    firstText(
      actionText,
      bodyText,
      formatSymptomTextWithoutTemplateCitation(symptom.medication, template),
    ),
    memoBasis && memoBasis !== actionText ? memoBasis : undefined,
    formatSymptomTemplateEvidence(template),
  );
}

export function buildCareActionQueue(
  state: CareActionQueueState,
  todayIso: string,
  maxItems = 8,
): CareAction[] {
  const cervicalScreeningActions =
    state.profile?.cancerCareMode
      ? [
          (() => {
            const summary = buildCervicalCancerScreeningSummary({
              age: state.profile?.age ?? "",
              sex: state.profile?.sex ?? "other",
            });
            return {
              id: "cervical:screening-summary",
              date: todayIso,
              source: "cervical",
              tone: "neutral",
              label: summary.status,
              title: "자궁경부암 검진 기준 빠른 확인",
              detail: formatCervicalCancerScreeningSummaryEvidence(summary),
              sortRank: 2,
            } satisfies CareAction;
          })(),
        ]
      : [];

  const vitalActions = (state.vitals ?? []).flatMap<CareAction>((vital, index) => {
    const date = getValidIsoDate(vital.date);
    if (!date) return [];

    if (vital.type === "blood-pressure" && vital.systolic && vital.diastolic) {
      const assessment = assessBloodPressure(vital.systolic, vital.diastolic);
      if (assessment.level === "ok" || assessment.level === "neutral") return [];

      return [
        {
          id: `vital:${vital.id ?? `${date}:${index}`}`,
          date,
          source: "vital",
          tone: "watch",
          label: assessment.label,
          title: `혈압 ${vital.systolic}/${vital.diastolic} mmHg`,
          detail: joinText(
            vital.note,
            assessment.summary,
            standardEvidence(assessment.standardId ?? "blood-pressure"),
          ),
          sortRank: assessment.level === "risk" ? 0 : 1,
        },
      ];
    }

    if (vital.type === "glucose" && vital.glucoseMgDl) {
      const context = vital.glucoseContext ?? "random";
      const assessment = assessBloodGlucose(vital.glucoseMgDl, context, {
        diabetes: state.profile?.diabetes,
      });
      if (assessment.level === "ok" || assessment.level === "neutral") return [];

      return [
        {
          id: `vital:${vital.id ?? `${date}:${index}`}`,
          date,
          source: "vital",
          tone: "watch",
          label: assessment.label,
          title: `혈당 ${vital.glucoseMgDl} mg/dL (${glucoseContextLabel[context]})`,
          detail: joinText(
            vital.note,
            assessment.summary,
            standardEvidence(
              assessment.standardId ?? (state.profile?.diabetes ? "glucose-care" : "glucose-screening"),
            ),
          ),
          sortRank: assessment.level === "risk" ? 0 : 1,
        },
      ];
    }

    if (vital.type === "temperature" && vital.temperatureC) {
      const assessment = assessTemperature(vital.temperatureC);
      if (assessment.level === "ok" || assessment.level === "neutral") return [];

      return [
        {
          id: `vital:${vital.id ?? `${date}:${index}`}`,
          date,
          source: "vital",
          tone: "watch",
          label: assessment.label,
          title: `체온 ${vital.temperatureC}℃`,
          detail: joinText(
            vital.note,
            assessment.summary,
            standardEvidence(assessment.standardId ?? "infection-fever"),
          ),
          sortRank: assessment.level === "risk" ? 0 : 1,
        },
      ];
    }

    return [];
  });

  const questionActions = state.questions.flatMap<CareAction>((question, index) => {
    const date = getValidIsoDate(question.date);
    if (question.status !== "open" || !date) return [];

    const priority = normalizeQuestionPriority(question.priority);
    return [
      {
        id: `question:${question.id ?? `${date}:${index}`}`,
        date,
        source: "question",
        tone: priority === "routine" ? "neutral" : "watch",
        label: `질문 · ${questionPriorityLabel[priority]}`,
        title: question.topic,
        detail: formatTextWithSourceEvidence(question.question),
        sortRank: questionPrioritySortRank[priority],
      },
    ];
  });

  const labActions = state.labResults.flatMap<CareAction>((lab, index) => {
    const date = getValidIsoDate(lab.date);
    if (!date) return [];

    const assessment = assessLabTextValue(lab.value, lab.lower, lab.upper);
    if (assessment.flag === "normal") return [];

    return [
      {
        id: `lab:${lab.id ?? `${date}:${index}`}`,
        date,
        source: "lab",
        tone: assessment.flag === "unknown" ? "neutral" : "watch",
        label: assessment.label,
        title: `${lab.name} ${lab.value}${lab.unit ? ` ${lab.unit}` : ""}`.trim(),
        detail: formatLabActionDetail(lab, assessment.summary),
      },
    ];
  });

  const documentActions = state.documents.flatMap<CareAction>((document, index) => {
    const date = getValidIsoDate(document.date);
    if (!hasActiveReviewStatus(document) || !date) return [];

    return [
      {
        id: `document:${document.id ?? `${date}:${index}`}`,
        date,
        source: "document",
        tone: document.reviewStatus === "waiting-result" ? "neutral" : "watch",
        label: documentStatusLabel[document.reviewStatus],
        title: document.title,
        detail: formatDocumentActionDetail(document),
      },
    ];
  });

  const symptomActions = state.symptoms.flatMap<CareAction>((symptom, index) => {
    const date = getValidIsoDate(symptom.date);
    if (!date) return [];

    const isCervicalWarning = isCervicalWarningSymptom(symptom);
    const isStructuredCervicalWarning = isStructuredCervicalWarningDraft(symptom);
    const isStructuredCervicalRecordMemo = isStructuredCervicalRecordMemoDraft(symptom);
    const contactThresholdTemplate = getContactThresholdSymptomTemplate(symptom);
    const isHighSeverity = Number(symptom.severity) >= 7;
    if (!isCervicalWarning && !isHighSeverity && !contactThresholdTemplate) return [];

    const shouldUseContactThresholdLabel =
      contactThresholdTemplate
      && !isStructuredCervicalWarning
      && (!isCervicalWarning || contactThresholdTemplate.id !== "cervical-general-warning");
    const label = shouldUseContactThresholdLabel
      ? contactThresholdSymptomLabels[contactThresholdTemplate.id as ContactThresholdSymptomId]
      : isStructuredCervicalRecordMemo
        ? "자궁경부암 기록 메모"
        : isCervicalWarning
          ? "자궁경부암 경고 기록"
          : "고위험 증상";

    return [
      {
        id: `symptom:${symptom.id ?? `${date}:${index}`}`,
        date,
        source: "symptom",
        tone: "watch",
        label,
        title: `${symptom.symptom} ${symptom.severity}/10`,
        detail: formatSymptomActionDetail(symptom, contactThresholdTemplate),
        sortRank: 0,
      },
    ];
  });

  const validToday = getValidIsoDate(todayIso);
  const visitActions = state.visits.flatMap<CareAction>((visit, index) => {
    const date = getValidIsoDate(visit.nextDate) ?? getValidIsoDate(visit.date);
    if (!date || !validToday || date < validToday) return [];

    return [
      {
        id: `visit:${visit.id ?? `${visit.date}:${index}`}:${date}`,
        date,
        source: "visit",
        tone: "neutral",
        label: "방문 예정",
        title: `${visit.hospital} · ${visit.reason}`,
        detail: firstText(visit.plan, visit.summary),
      },
    ];
  });

  return [
    ...symptomActions,
    ...questionActions,
    ...vitalActions,
    ...labActions,
    ...documentActions,
    ...visitActions,
    ...cervicalScreeningActions,
  ]
    .sort(compareActions)
    .slice(0, maxItems);
}

export function countCareActionQueueSources(actions: CareAction[]): CareActionQueueSourceCounts {
  return actions.reduce<CareActionQueueSourceCounts>(
    (counts, action) => ({
      ...counts,
      [action.source]: counts[action.source] + 1,
    }),
    {
      cervical: 0,
      document: 0,
      lab: 0,
      question: 0,
      symptom: 0,
      vital: 0,
      visit: 0,
    },
  );
}

export function countCareActionQueueTones(
  actions: Array<Pick<CareAction, "tone" | "detail">>,
): CareActionQueueToneCounts {
  return actions.reduce<CareActionQueueToneCounts>(
    (counts, action) => ({
      total: counts.total + 1,
      watch: counts.watch + (action.tone === "watch" ? 1 : 0),
      neutral: counts.neutral + (action.tone === "neutral" ? 1 : 0),
      sourceBacked: counts.sourceBacked + (action.detail.includes("근거:") ? 1 : 0),
    }),
    {
      total: 0,
      watch: 0,
      neutral: 0,
      sourceBacked: 0,
    },
  );
}

export function formatCareActionQueueToneCountSummary(
  actions: Array<Pick<CareAction, "tone" | "detail">>,
) {
  const counts = countCareActionQueueTones(actions);
  return `확인 필요 ${counts.watch}개 · 일정/일반 ${counts.neutral}개 · 근거 포함 ${counts.sourceBacked}개`;
}

export function formatCareActionQueueSourceCountSummary(actions: CareAction[]) {
  const counts = countCareActionQueueSources(actions);
  const parts = careActionQueueSourceOrder
    .filter((source) => counts[source] > 0)
    .map((source) => `${careActionQueueSourceLabel[source]} ${counts[source]}`);

  return parts.length ? parts.join(" · ") : "분류 없음";
}

export function formatCareActionQueueCopySummary(actions: CareAction[]) {
  return `${actions.length}개 항목 · ${formatCareActionQueueToneCountSummary(actions)} · ${formatCareActionQueueSourceCountSummary(actions)}`;
}

export function formatCareActionQueueCopyDescription(actions: CareAction[]) {
  return `진료 준비 큐 ${formatCareActionQueueCopySummary(actions)} 복사`;
}

export function formatCareActionQueueCopyStatus(actions: CareAction[]) {
  return `진료 준비 큐 복사됨 · ${formatCareActionQueueCopySummary(actions)}`;
}

export function formatCareActionQueueCopyUnsupportedStatus(actions: CareAction[]) {
  return `진료 준비 큐 복사 미지원 · 브라우저 클립보드 없음 · ${formatCareActionQueueCopySummary(
    actions,
  )}`;
}

export function formatCareActionQueueCopyFailedStatus(actions: CareAction[]) {
  return `진료 준비 큐 복사 실패 · ${formatCareActionQueueCopySummary(actions)}`;
}

function formatCareActionQueueClipboardDetailLabel(action: CareAction, detail: string, index: number) {
  if (detail.startsWith("근거:")) return "근거";
  if (action.source === "cervical") return "기준";
  if (index === 0) return "메모";
  if (action.source === "vital" || action.source === "lab") return "판정";
  if (action.source === "symptom") return "기록 기준";
  return "상세";
}

function splitParentheticalEvidence(detail: string) {
  const match = detail.match(/^(.*)\s+\(근거:\s*(.+)\)$/);
  return match ? [match[1].trim(), `근거: ${match[2].trim()}`] : [detail];
}

function formatCareActionQueueClipboardDetailLines(action: CareAction) {
  const detail = action.detail.trim();
  if (!detail) return ["   상세 메모 없음"];

  const parts = detail
    .split(" / ")
    .flatMap((part) => splitParentheticalEvidence(part.trim()))
    .filter(Boolean);
  if (parts.length <= 1) return [`   ${detail}`];

  return parts.map((part, index) => {
    const label = formatCareActionQueueClipboardDetailLabel(action, part, index);
    const text = label === "근거" ? part.replace(/^근거:\s*/, "") : part;
    return `   ${label}: ${text}`;
  });
}

export function formatCareActionQueueClipboardText(actions: CareAction[], todayIso: string) {
  const lines = [
    "[진료 준비 큐]",
    `작성일: ${todayIso}`,
    `확인 항목: ${actions.length}개`,
    `상태 요약: ${formatCareActionQueueToneCountSummary(actions)}`,
    `분류 요약: ${formatCareActionQueueSourceCountSummary(actions)}`,
  ];

  if (!actions.length) {
    return [
      ...lines,
      "",
      "현재 자궁경부암 검진 확인, 증상 경고, 열려 있는 질문, 기준 밖 활력·검사, 서류 조치, 예정 방문이 없습니다.",
    ].join("\n");
  }

  return [
    ...lines,
    "",
    ...actions.flatMap((action, index) => [
      `${index + 1}. ${action.date} · ${formatCareActionQueueLabel(action)}`,
      `   ${action.title}`,
      ...formatCareActionQueueClipboardDetailLines(action),
    ]),
  ].join("\n");
}
