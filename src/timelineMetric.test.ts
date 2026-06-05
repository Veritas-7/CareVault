import { describe, expect, it } from "vitest";
import { buildTimelinePanelSummary } from "./timelineMetric";

describe("timelineMetric", () => {
  it("builds timeline summary chips from mixed record counts and source-backed records", () => {
    expect(
      buildTimelinePanelSummary({
        documentCount: 1,
        labCount: 2,
        questionCount: 1,
        sourceBackedCount: 3,
        symptomCount: 2,
        visitCount: 1,
        vitalCount: 3,
      }),
    ).toEqual({
      ariaLabel:
        "전체 10개 · 활력 3개 · 방문 1개 · 서류 1개 · 증상 2개 · 질문 1개 · 검사 2개 · 근거 포함 3개",
      items: [
        { id: "total", label: "전체", value: "10개" },
        { id: "vital", label: "활력", value: "3개" },
        { id: "visit", label: "방문", value: "1개" },
        { id: "document", label: "서류", value: "1개" },
        { id: "symptom", label: "증상", value: "2개" },
        { id: "question", label: "질문", value: "1개" },
        { id: "lab", label: "검사", value: "2개" },
        { id: "source-backed", label: "근거 포함", value: "3개" },
      ],
      totalCount: 10,
    });
  });

  it("builds an empty timeline summary", () => {
    expect(
      buildTimelinePanelSummary({
        documentCount: 0,
        labCount: 0,
        questionCount: 0,
        sourceBackedCount: 0,
        symptomCount: 0,
        visitCount: 0,
        vitalCount: 0,
      }),
    ).toEqual({
      ariaLabel: "전체 0개 · 유형 기록 없음 · 근거 포함 없음",
      items: [
        { id: "total", label: "전체", value: "0개" },
        { id: "empty", label: "유형", value: "기록 없음" },
        { id: "source-backed", label: "근거 포함", value: "없음" },
      ],
      totalCount: 0,
    });
  });
});
