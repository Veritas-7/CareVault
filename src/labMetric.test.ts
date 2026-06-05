import { describe, expect, it } from "vitest";
import {
  buildLabPanelSummary,
  formatLabDraftResetStatusLabel,
  formatLabResultSavedStatusLabel,
} from "./labMetric";

describe("labMetric", () => {
  it("builds lab-result saved status feedback from value, assessment, and source evidence", () => {
    expect(
      formatLabResultSavedStatusLabel({
        lower: "4",
        name: "WBC",
        note: "",
        unit: "10^3/uL",
        upper: "10",
        value: "3.2",
      }),
    ).toBe("WBC 검사 수치 추가됨 · 3.2 10^3/uL · 판정 기준보다 낮음 · 근거 포함");
  });

  it("keeps custom lab saved status concise when there is no source evidence", () => {
    expect(
      formatLabResultSavedStatusLabel({
        lower: "8.8",
        name: "Custom mineral",
        note: "",
        unit: "mg/dL",
        upper: "10.5",
        value: "9.1",
      }),
    ).toBe(
      "Custom mineral 검사 수치 추가됨 · 9.1 mg/dL · 판정 기준 범위 내 · 근거 없음",
    );
  });

  it("uses stable lab saved status fallbacks for missing name, value, and unit", () => {
    expect(
      formatLabResultSavedStatusLabel({
        lower: "",
        name: "   ",
        note: "",
        unit: "  ",
        upper: "",
        value: "",
      }),
    ).toBe("검사 수치 추가됨 · 값 없음 · 판정 값 없음 · 근거 없음");
  });

  it("formats lab reset feedback with preset context and cleared draft summary", () => {
    expect(
      formatLabDraftResetStatusLabel(
        {
          date: "2026-06-01",
          lower: "4",
          name: "WBC",
          note: "",
          unit: "10^3/uL",
          upper: "10",
          value: "3.2",
        },
        "백혈구",
        "2026-06-05",
      ),
    ).toBe(
      "검사 입력 초기화됨 · 프리셋 백혈구 해제 · 이전 WBC 3.2 10^3/uL · 판정 기준보다 낮음 · 근거 포함 · 날짜 2026-06-05",
    );
    expect(
      formatLabDraftResetStatusLabel(
        {
          date: "2026-06-01",
          lower: "",
          name: "",
          note: "",
          unit: "",
          upper: "",
          value: "",
        },
        "",
        "",
      ),
    ).toBe("검사 입력 초기화됨 · 직접 입력 모드 · 이전 입력 없음 · 날짜 2026-06-01");
  });

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
