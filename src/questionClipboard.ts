import { normalizeQuestionPriority, questionPriorityLabel } from "./questionPriority";
import { formatTextWithSourceEvidence, parseSourceEvidence } from "./sourceEvidence";

export type ClipboardQuestionStatus = "answered" | "deferred" | "open" | string;

export type QuestionClipboardInput = {
  answer?: string;
  date: string;
  priority?: unknown;
  question: string;
  status: ClipboardQuestionStatus;
  topic: string;
};

const questionStatusLabel: Record<string, string> = {
  open: "확인 필요",
  answered: "답변 완료",
  deferred: "보류",
};

function formatQuestionStatus(value: ClipboardQuestionStatus) {
  return questionStatusLabel[value] ?? value;
}

export function formatQuestionClipboardActionSummary(question: QuestionClipboardInput) {
  const priority = normalizeQuestionPriority(question.priority);
  const hasSourceEvidence = Boolean(parseSourceEvidence(question.question).sourceLabel);
  const hasAnswerMemo = Boolean(question.answer?.trim());

  return [
    question.date || "날짜 미입력",
    questionPriorityLabel[priority],
    formatQuestionStatus(question.status),
    hasSourceEvidence ? "근거 포함" : "근거 없음",
    ...(hasAnswerMemo ? ["답변 메모 포함"] : []),
  ].join(" · ");
}

export function formatQuestionClipboardCopyDescription(question: QuestionClipboardInput) {
  const topic = question.topic.trim() || "진료 질문";

  return `${topic} 질문 복사 · ${formatQuestionClipboardActionSummary(question)}`;
}

export function formatQuestionClipboardCopyStatus(question: QuestionClipboardInput) {
  const topic = question.topic.trim() || "진료 질문";

  return `${topic} 질문 복사됨 · ${formatQuestionClipboardActionSummary(question)}`;
}

export function formatQuestionClipboardText(question: QuestionClipboardInput) {
  const priority = normalizeQuestionPriority(question.priority);
  const lines = [
    "[진료 질문]",
    `요약: ${formatQuestionClipboardActionSummary(question)}`,
    `날짜: ${question.date}`,
    `주제: ${question.topic}`,
    `우선순위: ${questionPriorityLabel[priority]}`,
    `상태: ${formatQuestionStatus(question.status)}`,
    `질문: ${formatTextWithSourceEvidence(question.question)}`,
  ];

  const answer = question.answer?.trim();
  if (answer) {
    lines.push(`답변 메모: ${answer}`);
  }

  return lines.join("\n");
}
