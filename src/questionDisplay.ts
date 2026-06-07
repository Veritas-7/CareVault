import {
  formatSourceEvidenceList,
  parseSourceEvidence,
  type SourceEvidence,
} from "./sourceEvidence";

export type QuestionDisplayParts = {
  body: string;
  sourceEvidence: string;
  sourceLabel: string;
  sourceUrl: string;
  sources: SourceEvidence[];
};

export type QuestionTimelineDisplayParts = QuestionDisplayParts & {
  detail: string;
};

export function buildQuestionDisplayParts(questionText: string): QuestionDisplayParts {
  const evidence = parseSourceEvidence(questionText);
  const sourceEvidence = formatSourceEvidenceList(evidence.sources);

  return {
    body: evidence.body || questionText,
    sourceEvidence,
    sourceLabel: evidence.sourceLabel,
    sourceUrl: evidence.sourceUrl,
    sources: evidence.sources,
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
