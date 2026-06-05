export type QuestionStatus = "answered" | "deferred" | "open";

export type QuestionStatusButtonLabels = {
  ariaLabel: string;
  title: string;
  visibleLabel: string;
};

export const questionStatusLabel: Record<QuestionStatus, string> = {
  open: "확인 필요",
  answered: "답변 완료",
  deferred: "보류",
};

const questionStatusButtonVisibleLabel: Record<QuestionStatus, string> = {
  open: "확인 필요",
  answered: "답변 완료",
  deferred: "보류 처리",
};

function formatQuestionStatusContext(topic: string) {
  const trimmedTopic = topic.trim();
  if (!trimmedTopic) return "진료 전 질문";
  return trimmedTopic.endsWith("질문") ? trimmedTopic : `${trimmedTopic} 질문`;
}

export function buildQuestionStatusButtonLabels(
  topic: string,
  status: QuestionStatus,
): QuestionStatusButtonLabels {
  const context = formatQuestionStatusContext(topic);
  const statusLabel = questionStatusLabel[status];
  const visibleLabel = questionStatusButtonVisibleLabel[status];
  const actionLabel = `${context} 상태를 ${statusLabel}로 변경`;

  return {
    ariaLabel: actionLabel,
    title: actionLabel,
    visibleLabel,
  };
}

export function formatQuestionStatusUpdateStatus(topic: string, status: QuestionStatus) {
  return `${formatQuestionStatusContext(topic)} 상태: ${questionStatusLabel[status]}`;
}
