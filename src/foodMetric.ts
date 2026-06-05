import type { FoodMatch } from "./healthRules";

export type FoodPanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type FoodPanelSummary = {
  ariaLabel: string;
  careTeamCount: number;
  itemCount: number;
  items: FoodPanelSummaryItem[];
  limitCount: number;
  sourceCount: number;
  supportCount: number;
};

export function buildFoodPanelSummary(
  matches: FoodMatch[],
  extraSourceLabels: string[] = [],
): FoodPanelSummary {
  const itemCount = matches.length;
  const supportCount = matches.filter((match) => match.level === "ok").length;
  const limitCount = matches.filter((match) => match.level === "watch").length;
  const careTeamCount = matches.filter((match) => match.level === "risk").length;
  const sourceCount = new Set([
    ...matches.map((match) => match.sourceLabel),
    ...extraSourceLabels,
  ].filter(Boolean)).size;
  const categoryItems = [
    supportCount ? { id: "support", label: "식단 후보", value: `${supportCount}개` } : null,
    limitCount ? { id: "limit", label: "제한/주의", value: `${limitCount}개` } : null,
    careTeamCount ? { id: "care-team", label: "진료팀 확인", value: `${careTeamCount}개` } : null,
  ].filter((item): item is FoodPanelSummaryItem => Boolean(item));
  const items = [
    { id: "total", label: "매칭", value: itemCount ? `${itemCount}개` : "없음" },
    ...(categoryItems.length ? categoryItems : [{ id: "empty", label: "분류", value: "대기" }]),
    {
      id: "source-backed",
      label: "공식 출처",
      value: sourceCount ? `${sourceCount}개` : "없음",
    },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    ariaLabel,
    careTeamCount,
    itemCount,
    items,
    limitCount,
    sourceCount,
    supportCount,
  };
}
