import type { CareQuestion } from "./appState";

type GeneratedQuestionDraft = Pick<
  CareQuestion,
  "date" | "priority" | "question" | "status" | "topic"
>;

function hasDraftContent(draft: CareQuestion) {
  return Boolean(draft.topic.trim() || draft.question.trim() || draft.answer.trim());
}

export function mergeGeneratedQuestionDraft(
  current: CareQuestion,
  generated: GeneratedQuestionDraft,
): CareQuestion {
  const hasExistingDraft = hasDraftContent(current);
  const currentQuestion = current.question.trim();
  const generatedQuestion = generated.question.trim();
  const nextQuestion =
    hasExistingDraft && currentQuestion
      ? current.question.includes(generatedQuestion)
        ? current.question
        : `${currentQuestion}\n${generatedQuestion}`
      : generated.question;

  return {
    ...current,
    date: hasExistingDraft ? current.date : generated.date,
    priority: hasExistingDraft ? current.priority : generated.priority,
    question: nextQuestion,
    status: generated.status,
    topic: hasExistingDraft && current.topic.trim() ? current.topic : generated.topic,
  };
}
