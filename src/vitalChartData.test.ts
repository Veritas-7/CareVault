import { describe, expect, it } from "vitest";
import {
  buildVitalChartAccessibleRows,
  buildVitalChartData,
  buildVitalChartSummary,
  formatVitalChartTooltipValue,
  vitalChartLegendItems,
} from "./vitalChartData";

describe("vitalChartData", () => {
  it("exposes chart legend metadata for visible line labels", () => {
    expect(vitalChartLegendItems).toEqual([
      { color: "#1f7a8c", dataKey: "systolic", label: "수축기 혈압", unit: "mmHg" },
      { color: "#6d5dfc", dataKey: "diastolic", label: "이완기 혈압", unit: "mmHg" },
      { color: "#d97706", dataKey: "glucose", label: "혈당", unit: "mg/dL" },
    ]);
  });

  it("builds date-ordered chart points with BP units and glucose context metadata", () => {
    const points = buildVitalChartData([
      {
        date: "2026-06-05",
        glucoseContext: "after-meal",
        glucoseMgDl: 181,
        type: "glucose",
      },
      {
        date: "2026-06-04",
        diastolic: 82,
        systolic: 132,
        type: "blood-pressure",
      },
    ]);

    expect(points).toEqual([
      {
        bloodPressureAssessment:
          "고혈압 전단계 범위 · 성인 남녀 공통 한국 성인 혈압 · 질병관리청 국가건강정보포털 고혈압",
        date: "06-04",
        dateLabel: "2026-06-04",
        diastolic: 82,
        glucose: undefined,
        glucoseAssessment: undefined,
        glucoseContextLabel: undefined,
        order: 1,
        systolic: 132,
      },
      {
        bloodPressureAssessment: undefined,
        date: "06-05",
        dateLabel: "2026-06-05",
        diastolic: undefined,
        glucose: 181,
        glucoseAssessment:
          "내당능장애 범위 · 성인 남녀 공통 혈당 선별 기준 · 질병관리청 국가건강정보포털 당뇨병",
        glucoseContextLabel: "식후 2시간",
        order: 0,
        systolic: undefined,
      },
    ]);
  });

  it("accepts temperature records while keeping the chart scoped to BP and glucose", () => {
    expect(
      buildVitalChartData([
        { date: "2026-06-04", temperatureC: 38.1, type: "temperature" },
        { date: "2026-06-05", glucoseMgDl: 181, type: "glucose" },
      ]),
    ).toEqual([
      {
        bloodPressureAssessment: undefined,
        date: "06-05",
        dateLabel: "2026-06-05",
        diastolic: undefined,
        glucose: 181,
        glucoseAssessment:
          "측정 시점 확인 필요 · 성인 남녀 공통 혈당 선별 기준 · 질병관리청 국가건강정보포털 당뇨병",
        glucoseContextLabel: "수시",
        order: 0,
        systolic: undefined,
      },
    ]);
  });

  it("formats chart tooltip values with Korean labels and units", () => {
    expect(formatVitalChartTooltipValue("systolic", 132)).toBe("수축기 132 mmHg");
    expect(formatVitalChartTooltipValue("diastolic", 82)).toBe("이완기 82 mmHg");
    expect(formatVitalChartTooltipValue("glucose", 181)).toBe("혈당 181 mg/dL");
    expect(formatVitalChartTooltipValue("glucose", undefined)).toBe("");
  });

  it("summarizes chart period, units, counts, and latest vital values without hover", () => {
    const points = buildVitalChartData([
      {
        date: "2026-06-05",
        glucoseContext: "after-meal",
        glucoseMgDl: 181,
        type: "glucose",
      },
      {
        date: "2026-06-04",
        diastolic: 82,
        systolic: 132,
        type: "blood-pressure",
      },
    ]);

    expect(buildVitalChartSummary(points)).toEqual([
      { label: "기간", value: "2026-06-04 - 2026-06-05" },
      { label: "단위", value: "혈압 mmHg / 혈당 mg/dL" },
      { label: "기록", value: "혈압 1개 · 혈당 1개" },
      { label: "최근 혈압", value: "132/82 mmHg" },
      { label: "최근 혈당", value: "181 mg/dL (식후 2시간)" },
    ]);
  });

  it("builds accessible chart source rows with date, units, and glucose context", () => {
    const points = buildVitalChartData(
      [
        {
          date: "2026-06-05",
          glucoseContext: "after-meal",
          glucoseMgDl: 181,
          type: "glucose",
        },
        {
          date: "2026-06-04",
          diastolic: 82,
          systolic: 132,
          type: "blood-pressure",
        },
        {
          date: "2026-06-06",
          systolic: 126,
          type: "blood-pressure",
        },
      ],
      { diabetes: true },
    );

    expect(buildVitalChartAccessibleRows(points)).toEqual([
      {
        assessment:
          "판정: 고혈압 전단계 범위 · 성인 남녀 공통 한국 성인 혈압 · 질병관리청 국가건강정보포털 고혈압",
        bloodPressure: "132/82 mmHg",
        date: "2026-06-04",
        glucose: "혈당 없음",
        summary:
          "2026-06-04 · 132/82 mmHg · 혈당 없음 · 판정: 고혈압 전단계 범위 · 성인 남녀 공통 한국 성인 혈압 · 질병관리청 국가건강정보포털 고혈압",
      },
      {
        assessment:
          "판정: 식후 목표 초과 · 성인 남녀 공통 당뇨 추적 혈당 · 대한당뇨병학회 당뇨병 관리 목표",
        bloodPressure: "혈압 없음",
        date: "2026-06-05",
        glucose: "181 mg/dL (식후 2시간)",
        summary:
          "2026-06-05 · 혈압 없음 · 181 mg/dL (식후 2시간) · 판정: 식후 목표 초과 · 성인 남녀 공통 당뇨 추적 혈당 · 대한당뇨병학회 당뇨병 관리 목표",
      },
      {
        assessment: "판정 대기",
        bloodPressure: "수축기 126 mmHg",
        date: "2026-06-06",
        glucose: "혈당 없음",
        summary: "2026-06-06 · 수축기 126 mmHg · 혈당 없음 · 판정 대기",
      },
    ]);
  });

  it("keeps latest vital chips useful with partial or missing chart series", () => {
    const points = buildVitalChartData([
      {
        date: "2026-06-05",
        glucoseContext: "fasting",
        glucoseMgDl: 96,
        type: "glucose",
      },
      {
        date: "2026-06-06",
        diastolic: 58,
        type: "blood-pressure",
      },
    ]);

    expect(buildVitalChartSummary(points)).toEqual([
      { label: "기간", value: "2026-06-05 - 2026-06-06" },
      { label: "단위", value: "혈압 mmHg / 혈당 mg/dL" },
      { label: "기록", value: "혈압 1개 · 혈당 1개" },
      { label: "최근 혈압", value: "이완기 58 mmHg" },
      { label: "최근 혈당", value: "96 mg/dL (공복)" },
    ]);
  });

  it("keeps an empty chart summary useful", () => {
    expect(buildVitalChartSummary([])).toEqual([
      { label: "기간", value: "기록 대기" },
      { label: "단위", value: "혈압 mmHg / 혈당 mg/dL" },
      { label: "기록", value: "혈압 0개 · 혈당 0개" },
      { label: "최근 혈압", value: "혈압 기록 대기" },
      { label: "최근 혈당", value: "혈당 기록 대기" },
    ]);
  });
});
