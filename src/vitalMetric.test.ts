import { describe, expect, it } from "vitest";
import { buildVitalPanelSummary } from "./vitalMetric";

describe("vitalMetric", () => {
  it("builds saved-vital panel summary chips from record type and assessment levels", () => {
    expect(
      buildVitalPanelSummary(
        [
          { diastolic: 76, systolic: 118, type: "blood-pressure" },
          { diastolic: 84, systolic: 132, type: "blood-pressure" },
          { diastolic: 121, systolic: 182, type: "blood-pressure" },
          { glucoseContext: "random", glucoseMgDl: 66, type: "glucose" },
          { glucoseContext: "fasting", glucoseMgDl: 88, type: "glucose" },
          { glucoseContext: "after-meal", glucoseMgDl: 160, type: "glucose" },
          { glucoseContext: "random", glucoseMgDl: 0, type: "glucose" },
          { temperatureC: 38.1, type: "temperature" },
        ],
        { diabetes: false },
      ),
    ).toEqual({
      ariaLabel:
        "전체 8개 · 혈압 3개 · 혈당 4개 · 체온 1개 · 고위험 3개 · 관찰 2개 · 기준 내 2개 · 확인 필요 1개",
      bloodPressureCount: 3,
      glucoseCount: 4,
      items: [
        { id: "total", label: "전체", value: "8개" },
        { id: "blood-pressure", label: "혈압", value: "3개" },
        { id: "glucose", label: "혈당", value: "4개" },
        { id: "temperature", label: "체온", value: "1개" },
        { id: "risk", label: "고위험", value: "3개" },
        { id: "watch", label: "관찰", value: "2개" },
        { id: "ok", label: "기준 내", value: "2개" },
        { id: "neutral", label: "확인 필요", value: "1개" },
      ],
      neutralCount: 1,
      okCount: 2,
      riskCount: 3,
      temperatureCount: 1,
      totalCount: 8,
      watchCount: 2,
    });
  });

  it("builds an empty saved-vital panel summary", () => {
    expect(buildVitalPanelSummary([])).toEqual({
      ariaLabel: "전체 0개 · 유형 기록 없음 · 상태 기록 없음",
      bloodPressureCount: 0,
      glucoseCount: 0,
      items: [
        { id: "total", label: "전체", value: "0개" },
        { id: "type-empty", label: "유형", value: "기록 없음" },
        { id: "status-empty", label: "상태", value: "기록 없음" },
      ],
      neutralCount: 0,
      okCount: 0,
      riskCount: 0,
      temperatureCount: 0,
      totalCount: 0,
      watchCount: 0,
    });
  });
});
