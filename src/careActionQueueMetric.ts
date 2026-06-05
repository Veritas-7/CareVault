import {
  countCareActionQueueTones,
  type CareAction,
} from "./careActionQueue";

export type CareActionQueuePanelSummaryItem = {
  id: "total" | "watch" | "neutral" | "source-backed";
  label: string;
  value: string;
};

export type CareActionQueuePanelSummary = {
  ariaLabel: string;
  items: CareActionQueuePanelSummaryItem[];
  totalCount: number;
  watchCount: number;
  neutralCount: number;
  sourceBackedCount: number;
};

export function buildCareActionQueuePanelSummary(
  actions: Array<Pick<CareAction, "tone" | "detail">>,
): CareActionQueuePanelSummary {
  const counts = countCareActionQueueTones(actions);
  const totalCount = counts.total;
  const watchCount = counts.watch;
  const neutralCount = counts.neutral;
  const sourceBackedCount = counts.sourceBacked;

  const items: CareActionQueuePanelSummaryItem[] = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    { id: "watch", label: "확인 필요", value: `${watchCount}개` },
    { id: "neutral", label: "일정/일반", value: `${neutralCount}개` },
    { id: "source-backed", label: "근거 포함", value: `${sourceBackedCount}개` },
  ];

  return {
    ariaLabel: `진료 준비 큐 요약 전체 ${totalCount}개 · 확인 필요 ${watchCount}개 · 일정/일반 ${neutralCount}개 · 근거 포함 ${sourceBackedCount}개`,
    items,
    totalCount,
    watchCount,
    neutralCount,
    sourceBackedCount,
  };
}
