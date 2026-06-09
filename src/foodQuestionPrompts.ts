import type { FoodAssessment, FoodMatch } from "./healthRules";
import type { ImmuneFoodSafetyContext } from "./immuneFoodContext";
import { questionPriorityLabel, type QuestionPriority } from "./questionPriority";

type FoodQuestionSource = {
  sourceLabel: string;
  sourceUrl: string;
};

export type FoodQuestionDraftInput = {
  assessment: FoodAssessment;
  foodQuery: string;
  immuneContext: ImmuneFoodSafetyContext | null;
};

export type FoodQuestionDraft = {
  priority: QuestionPriority;
  question: string;
  sourceCount: number;
  topic: string;
};

export type FoodQuestionButtonLabels = {
  ariaLabel: string;
  title: string;
  visibleLabel: string;
};

function uniqueBySource(matches: FoodMatch[]) {
  const seen = new Set<string>();
  return matches.filter((match) => {
    const key = `${match.sourceLabel}\n${match.sourceUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarizeMatches(matches: FoodMatch[]) {
  return matches.map((match) => `${match.term}: ${match.reason}`).join("; ");
}

function addFoodQuestionSource(sources: FoodQuestionSource[], source: FoodQuestionSource) {
  if (!source.sourceLabel) return;
  if (
    sources.some(
      (existing) =>
        existing.sourceLabel === source.sourceLabel && existing.sourceUrl === source.sourceUrl,
    )
  ) {
    return;
  }
  sources.push(source);
}

function buildQuestionSourceLines(
  matches: FoodMatch[],
  immuneContext: ImmuneFoodSafetyContext | null,
) {
  const sources: FoodQuestionSource[] = [];
  if (immuneContext) {
    addFoodQuestionSource(sources, {
      sourceLabel: immuneContext.foodSafetySourceLabel,
      sourceUrl: immuneContext.foodSafetySourceUrl,
    });
  }

  for (const match of uniqueBySource(matches)) {
    addFoodQuestionSource(sources, {
      sourceLabel: match.sourceLabel,
      sourceUrl: match.sourceUrl,
    });
  }

  return sources
    .map((source) =>
      source.sourceUrl
        ? `출처: ${source.sourceLabel} - ${source.sourceUrl}`
        : `출처: ${source.sourceLabel}`,
    )
    .join("\n");
}

function countSources(matches: FoodMatch[], immuneContext: ImmuneFoodSafetyContext | null) {
  return new Set([
    ...matches.map((match) => match.sourceLabel),
    ...(immuneContext?.sourceLabels ?? []),
  ].filter(Boolean)).size;
}

export function buildFoodQuestionDraft({
  assessment,
  foodQuery,
  immuneContext,
}: FoodQuestionDraftInput): FoodQuestionDraft | null {
  const query = foodQuery.trim();
  const matches = assessment.matches;
  if (!query) return null;
  if (!matches.length && !immuneContext) return null;

  const matchedSummary = summarizeMatches(matches);
  const sourceLines = buildQuestionSourceLines(matches, immuneContext);
  const sourceCount = countSources(matches, immuneContext);
  const nonImmuneQuestionParts =
    assessment.level === "risk"
      ? [
          `현재 음식/식단(${query})에 의료진 확인 항목이 포함되어 있습니다.`,
          "약물 상호작용이나 치료 상호작용, 식품 안전 문제를 진료팀 기준으로 어떻게 확인하면 좋을까요?",
          matchedSummary ? `음식 판단 근거: ${matchedSummary}` : "",
          sourceLines,
        ]
      : [
          `현재 음식/식단(${query})에 공식 식단 대체 예시가 포함되어 있습니다.`,
          "섭취 빈도, 양, 대체 후보를 진료팀 기준으로 어떻게 확인하면 좋을까요?",
          matchedSummary ? `음식 판단 근거: ${matchedSummary}` : "",
          sourceLines,
        ];
  const questionParts = immuneContext
    ? [
        `${immuneContext.labValueLabel}가 입력 기준 하한 ${immuneContext.lowerLimitLabel}보다 낮게 기록되어 있습니다.`,
        `현재 음식/식단${query ? `(${query})` : ""}에서 날음식·비살균 식품, 30분 이상 상온 운반·냉장 보관, 남은 음식 3~4일 보관 한계, 조리 위생, 외식보다 직접 조리, 자몽/보충제/약물 상호작용을 어떻게 확인하면 좋을까요?`,
        matchedSummary ? `음식 판단 근거: ${matchedSummary}` : "",
        immuneContext.labSourceLabel
          ? `검사 근거: ${immuneContext.labSourceLabel}${
              immuneContext.labSourceUrl ? ` (${immuneContext.labSourceUrl})` : ""
            }`
          : "",
        sourceLines,
      ]
    : nonImmuneQuestionParts;

  return {
    priority: assessment.level === "risk" || immuneContext ? "high" : "next-visit",
    question: questionParts.filter(Boolean).join("\n"),
    sourceCount,
    topic: "식단·음식 안전",
  };
}

export function buildFoodQuestionButtonLabels(sourceCount: number): FoodQuestionButtonLabels {
  const sourceLabel = sourceCount ? ` · 근거 ${sourceCount}개 포함` : "";
  const actionLabel = `음식 판단 진료 질문 초안 만들기${sourceLabel}`;

  return {
    ariaLabel: actionLabel,
    title: actionLabel,
    visibleLabel: "질문 초안",
  };
}

function formatFoodQuestionDraftSummary(
  { assessment, foodQuery, immuneContext }: FoodQuestionDraftInput,
  draft?: FoodQuestionDraft | null,
) {
  const queryLabel = foodQuery.trim() || "음식 입력 없음";
  const sourceCount = draft?.sourceCount ?? countSources(assessment.matches, immuneContext);

  return [
    `입력 ${queryLabel}`,
    `일치 ${assessment.matches.length}개`,
    immuneContext ? `검사 연결 ${immuneContext.labValueLabel}` : "검사 연결 없음",
    `근거 ${sourceCount}개`,
  ].join(" · ");
}

export function formatFoodQuestionDraftReadyStatus(
  input: FoodQuestionDraftInput,
  draft: FoodQuestionDraft,
) {
  return `음식 판단 질문 초안 준비됨 · ${draft.topic} · 우선순위 ${questionPriorityLabel[
    draft.priority
  ]} · ${formatFoodQuestionDraftSummary(input, draft)}`;
}

export function formatFoodQuestionDraftUnavailableStatus(input: FoodQuestionDraftInput) {
  return `음식 판단 질문 초안 준비 실패 · ${formatFoodQuestionDraftSummary(input)}`;
}
