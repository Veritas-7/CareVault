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
