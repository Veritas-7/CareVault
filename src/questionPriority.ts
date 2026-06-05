export type QuestionPriority = "high" | "next-visit" | "routine";

export const defaultQuestionPriority: QuestionPriority = "next-visit";

export const questionPriorityLabel: Record<QuestionPriority, string> = {
  high: "이번 진료 우선",
  "next-visit": "다음 진료",
  routine: "일반 확인",
};

export const questionPrioritySortRank: Record<QuestionPriority, number> = {
  high: 0,
  "next-visit": 1,
  routine: 2,
};

export function normalizeQuestionPriority(value: unknown): QuestionPriority {
  return value === "high" || value === "next-visit" || value === "routine"
    ? value
    : defaultQuestionPriority;
}
