import { normalizeQuestionPriority } from "./questionPriority";
import { parseSourceEvidence } from "./sourceEvidence";

export type QuestionMetricSource = {
  answer?: string;
  priority?: unknown;
  question: string;
  status: string;
};

export type QuestionMetricSummary = {
  highPriorityOpenCount: number;
  nextVisitOpenCount: number;
  openCount: number;
  priorityText: string;
  routineOpenCount: number;
  sourceBackedOpenCount: number;
  sourceText: string;
  statusText: string;
};

export type QuestionListSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type QuestionListSummary = {
  answerMemoCount: number;
  answeredCount: number;
  ariaLabel: string;
  deferredCount: number;
  items: QuestionListSummaryItem[];
  openCount: number;
  sourceBackedCount: number;
  totalCount: number;
};

export function buildQuestionMetricSummary(
  questions: QuestionMetricSource[],
): QuestionMetricSummary {
  const openQuestions = questions.filter((question) => question.status === "open");
  const highPriorityOpenCount = openQuestions.filter(
    (question) => normalizeQuestionPriority(question.priority) === "high",
  ).length;
  const nextVisitOpenCount = openQuestions.filter(
    (question) => normalizeQuestionPriority(question.priority) === "next-visit",
  ).length;
  const routineOpenCount = openQuestions.filter(
    (question) => normalizeQuestionPriority(question.priority) === "routine",
  ).length;
  const sourceBackedOpenCount = openQuestions.filter((question) =>
    Boolean(parseSourceEvidence(question.question).sourceLabel),
  ).length;

  const priorityText = [
    highPriorityOpenCount ? `이번 진료 ${highPriorityOpenCount}` : "",
    nextVisitOpenCount ? `다음 진료 ${nextVisitOpenCount}` : "",
    routineOpenCount ? `일반 ${routineOpenCount}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    highPriorityOpenCount,
    nextVisitOpenCount,
    openCount: openQuestions.length,
    priorityText: priorityText || "열린 질문 없음",
    routineOpenCount,
    sourceBackedOpenCount,
    sourceText: sourceBackedOpenCount ? `근거 포함 ${sourceBackedOpenCount}` : "근거 질문 없음",
    statusText: openQuestions.length ? "다음 진료 전 확인" : "열린 질문 없음",
  };
}

export function buildQuestionListSummary(questions: QuestionMetricSource[]): QuestionListSummary {
  const totalCount = questions.length;
  const openCount = questions.filter((question) => question.status === "open").length;
  const answeredCount = questions.filter((question) => question.status === "answered").length;
  const deferredCount = questions.filter((question) => question.status === "deferred").length;
  const sourceBackedCount = questions.filter((question) =>
    Boolean(parseSourceEvidence(question.question).sourceLabel),
  ).length;
  const answerMemoCount = questions.filter((question) => Boolean(question.answer?.trim())).length;
  const statusItems = [
    openCount ? { id: "open", label: "확인 필요", value: `${openCount}개` } : null,
    answeredCount ? { id: "answered", label: "답변 완료", value: `${answeredCount}개` } : null,
    deferredCount ? { id: "deferred", label: "보류", value: `${deferredCount}개` } : null,
  ].filter((item): item is QuestionListSummaryItem => Boolean(item));
  const items = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    ...(statusItems.length ? statusItems : [{ id: "empty", label: "상태", value: "질문 없음" }]),
    {
      id: "source-backed",
      label: "근거",
      value: sourceBackedCount ? `포함 ${sourceBackedCount}개` : "없음",
    },
    {
      id: "answer-memo",
      label: "답변 메모",
      value: answerMemoCount ? `포함 ${answerMemoCount}개` : "없음",
    },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    answerMemoCount,
    answeredCount,
    ariaLabel,
    deferredCount,
    items,
    openCount,
    sourceBackedCount,
    totalCount,
  };
}
