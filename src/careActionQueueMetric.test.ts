import { describe, expect, it } from "vitest";
import { buildCareActionQueuePanelSummary } from "./careActionQueueMetric";

describe("buildCareActionQueuePanelSummary", () => {
  it("summarizes care queue tone and source-backed counts", () => {
    const summary = buildCareActionQueuePanelSummary([
      {
        tone: "watch",
        detail: "두통 동반 반복 측정 / 근거: 질병관리청 국가건강정보포털 고혈압",
      },
      {
        tone: "watch",
        detail: "질문 우선 확인",
      },
      {
        tone: "neutral",
        detail: "예정 방문 / 근거: 저장된 방문 기록",
      },
    ]);

    expect(summary).toMatchObject({
      ariaLabel: "진료 준비 큐 요약 전체 3개 · 확인 필요 2개 · 일정/일반 1개 · 근거 포함 2개",
      totalCount: 3,
      watchCount: 2,
      neutralCount: 1,
      sourceBackedCount: 2,
    });
    expect(summary.items).toEqual([
      { id: "total", label: "전체", value: "3개" },
      { id: "watch", label: "확인 필요", value: "2개" },
      { id: "neutral", label: "일정/일반", value: "1개" },
      { id: "source-backed", label: "근거 포함", value: "2개" },
    ]);
  });

  it("keeps an explicit empty summary", () => {
    const summary = buildCareActionQueuePanelSummary([]);

    expect(summary.ariaLabel).toBe(
      "진료 준비 큐 요약 전체 0개 · 확인 필요 0개 · 일정/일반 0개 · 근거 포함 0개",
    );
    expect(summary.items.map((item) => item.value)).toEqual(["0개", "0개", "0개", "0개"]);
  });
});
