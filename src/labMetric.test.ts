import { describe, expect, it } from "vitest";
import { buildLabPanelSummary } from "./labMetric";

describe("labMetric", () => {
  it("builds saved-lab panel summary chips from lab flags, evidence, and question candidates", () => {
    expect(
      buildLabPanelSummary([
        {
          lower: "4",
          name: "WBC",
          note: "검사실 결과지 기준 우선",
          upper: "10",
          value: "3.2",
        },
        {
          lower: "0",
          name: "HbA1c",
          note:
            "대한당뇨병학회 기준 참고\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://www.diabetes.or.kr/example",
          upper: "5.7",
          value: "6.1",
        },
        {
          lower: "8.8",
          name: "Custom mineral",
          note: "",
          upper: "10.5",
          value: "9.1",
        },
        {
          lower: "",
          name: "Custom marker",
          note: "",
          upper: "",
          value: "120",
        },
      ]),
    ).toEqual({
      abnormalCount: 2,
      ariaLabel:
        "전체 4개 · 낮음 1개 · 높음 1개 · 기준 없음 1개 · 범위 내 1개 · 근거 포함 2개 · 질문 후보 3개",
      highCount: 1,
      items: [
        { id: "total", label: "전체", value: "4개" },
        { id: "low", label: "낮음", value: "1개" },
        { id: "high", label: "높음", value: "1개" },
        { id: "unknown", label: "기준 없음", value: "1개" },
        { id: "normal", label: "범위 내", value: "1개" },
        { id: "source-backed", label: "근거", value: "포함 2개" },
        { id: "question-candidate", label: "질문 후보", value: "3개" },
      ],
      lowCount: 1,
      normalCount: 1,
      questionCandidateCount: 3,
      sourceBackedCount: 2,
      totalCount: 4,
      unknownCount: 1,
    });
  });

  it("builds an empty saved-lab panel summary", () => {
    expect(buildLabPanelSummary([])).toEqual({
      abnormalCount: 0,
      ariaLabel: "전체 0개 · 상태 검사 없음 · 근거 없음 · 질문 후보 없음",
      highCount: 0,
      items: [
        { id: "total", label: "전체", value: "0개" },
        { id: "empty", label: "상태", value: "검사 없음" },
        { id: "source-backed", label: "근거", value: "없음" },
        { id: "question-candidate", label: "질문 후보", value: "없음" },
      ],
      lowCount: 0,
      normalCount: 0,
      questionCandidateCount: 0,
      sourceBackedCount: 0,
      totalCount: 0,
      unknownCount: 0,
    });
  });

  it("does not classify partial lab number text as an abnormal numeric value", () => {
    expect(
      buildLabPanelSummary([
        {
          lower: "4",
          name: "WBC",
          note: "",
          upper: "10",
          value: "3.2 low",
        },
      ]),
    ).toMatchObject({
      abnormalCount: 0,
      highCount: 0,
      lowCount: 0,
      normalCount: 0,
      questionCandidateCount: 1,
      totalCount: 1,
      unknownCount: 1,
    });
  });
});
