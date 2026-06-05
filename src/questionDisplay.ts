import { formatSourceEvidence, parseSourceEvidence } from "./sourceEvidence";

export type QuestionDisplayParts = {
  body: string;
  sourceEvidence: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type QuestionTimelineDisplayParts = QuestionDisplayParts & {
  detail: string;
};

export function buildQuestionDisplayParts(questionText: string): QuestionDisplayParts {
  const evidence = parseSourceEvidence(questionText);
  const sourceEvidence = formatSourceEvidence(evidence.sourceLabel, evidence.sourceUrl);

  return {
    body: evidence.body || questionText,
    sourceEvidence,
    sourceLabel: evidence.sourceLabel,
    sourceUrl: evidence.sourceUrl,
  };
}

export function buildQuestionTimelineDisplayParts(
  questionText: string,
  statusLabel: string,
): QuestionTimelineDisplayParts {
  const display = buildQuestionDisplayParts(questionText);

  return {
    ...display,
    detail: `${statusLabel}: ${display.body}`,
  };
}

export function formatQuestionAnswerMemoDisplay(answer?: string | null) {
  return answer?.trim() ?? "";
}

function formatQuestionTopicContext(topic: string) {
  const trimmedTopic = topic.trim();
  if (!trimmedTopic) return "진료 전 질문";
  return trimmedTopic.endsWith("질문") ? trimmedTopic : `${trimmedTopic} 질문`;
}

export function formatQuestionSourceEvidenceLabel(topic: string, sourceLabel: string) {
  const sourceContext = sourceLabel.trim() || "공식 출처";
  return `${formatQuestionTopicContext(topic)} 근거 ${sourceContext}`;
}

export function formatQuestionSourceEvidenceOpenLabel(topic: string, sourceLabel: string) {
  return `${formatQuestionSourceEvidenceLabel(topic, sourceLabel)} 열기`;
}

export function formatQuestionAnswerMemoLabel(topic: string) {
  return `${formatQuestionTopicContext(topic)} 답변 메모`;
}
