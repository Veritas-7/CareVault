import { assessLabValue } from "./healthRules";

export type CareActionSource = "visit" | "question" | "lab" | "document";
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
};

export type CareActionQueueState = {
  visits: Array<{
    id: string;
    date: string;
    hospital: string;
    reason: string;
    summary: string;
    plan: string;
    nextDate: string;
  }>;
  questions: Array<{
    id: string;
    date: string;
    topic: string;
    question: string;
    status: QuestionStatus;
  }>;
  labResults: Array<{
    id: string;
    date: string;
    name: string;
    value: string;
    unit: string;
    lower: string;
    upper: string;
    note: string;
  }>;
  documents: Array<{
    id: string;
    date: string;
    title: string;
    body: string;
    tags: string;
    reviewStatus: DocumentReviewStatus;
    nextAction: string;
  }>;
};

const documentStatusLabel: Record<ActiveDocumentReviewStatus, string> = {
  "needs-review": "서류 검토",
  "care-question": "서류 질문",
  "waiting-result": "결과 대기",
};

type CareActionDocument = CareActionQueueState["documents"][number];
type ActiveCareActionDocument = CareActionDocument & {
  reviewStatus: ActiveDocumentReviewStatus;
};

function hasActiveReviewStatus(document: CareActionDocument): document is ActiveCareActionDocument {
  return document.reviewStatus !== "done";
}

function firstText(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? "";
}

function compareActions(left: CareAction, right: CareAction) {
  const toneRank: Record<CareActionTone, number> = { watch: 0, neutral: 1 };
  return toneRank[left.tone] - toneRank[right.tone] || left.date.localeCompare(right.date);
}

export function buildCareActionQueue(
  state: CareActionQueueState,
  todayIso: string,
  maxItems = 8,
): CareAction[] {
  const questionActions = state.questions
    .filter((question) => question.status === "open")
    .map<CareAction>((question) => ({
      id: `question:${question.id}`,
      date: question.date,
      source: "question",
      tone: "watch",
      label: "열린 질문",
      title: question.topic,
      detail: question.question,
    }));

  const labActions = state.labResults.flatMap<CareAction>((lab) => {
    const assessment = assessLabValue(
      Number.parseFloat(lab.value),
      lab.lower ? Number.parseFloat(lab.lower) : undefined,
      lab.upper ? Number.parseFloat(lab.upper) : undefined,
    );
    if (assessment.flag === "normal") return [];

    return [
      {
        id: `lab:${lab.id}`,
        date: lab.date,
        source: "lab",
        tone: assessment.flag === "unknown" ? "neutral" : "watch",
        label: assessment.label,
        title: `${lab.name} ${lab.value}${lab.unit ? ` ${lab.unit}` : ""}`.trim(),
        detail: firstText(lab.note, assessment.summary),
      },
    ];
  });

  const documentActions = state.documents
    .filter(hasActiveReviewStatus)
    .map<CareAction>((document) => ({
      id: `document:${document.id}`,
      date: document.date,
      source: "document",
      tone: document.reviewStatus === "waiting-result" ? "neutral" : "watch",
      label: documentStatusLabel[document.reviewStatus],
      title: document.title,
      detail: firstText(document.nextAction, document.body, document.tags),
    }));

  const visitActions = state.visits.flatMap<CareAction>((visit) => {
    const date = visit.nextDate || visit.date;
    if (!date || date < todayIso) return [];

    return [
      {
        id: `visit:${visit.id}:${date}`,
        date,
        source: "visit",
        tone: "neutral",
        label: "방문 예정",
        title: `${visit.hospital} · ${visit.reason}`,
        detail: firstText(visit.plan, visit.summary),
      },
    ];
  });

  return [...questionActions, ...labActions, ...documentActions, ...visitActions]
    .sort(compareActions)
    .slice(0, maxItems);
}
