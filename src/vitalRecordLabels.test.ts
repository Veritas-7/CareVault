import { describe, expect, it } from "vitest";
import {
  assessVitalRecord,
  formatVitalMetricRecordLabel,
  formatVitalMetricValue,
  formatVitalRecordLabel,
  formatVitalRecordSavedStatusLabel,
  formatVitalRecordSaveActionLabel,
  formatVitalTimelineTitle,
} from "./vitalRecordLabels";

describe("vitalRecordLabels", () => {
  it("labels saved blood-pressure timeline rows with units and Korean assessment", () => {
    const record = {
      date: "2026-06-04",
      id: "bp-test",
      note: "",
      type: "blood-pressure" as const,
      systolic: 132,
      diastolic: 82,
    };

    expect(formatVitalTimelineTitle(record)).toBe("혈압 132/82 mmHg");
    expect(formatVitalMetricValue(record)).toBe("132/82 mmHg");
    expect(formatVitalRecordLabel(record)).toBe("고혈압 전단계 범위");
    expect(formatVitalMetricRecordLabel(record)).toBe("고혈압 전단계 범위");
    expect(formatVitalRecordSaveActionLabel(record)).toBe("혈압 기록 추가");
    expect(formatVitalRecordSavedStatusLabel(record)).toBe("혈압 기록 추가됨 · 고혈압 전단계 범위");
    expect(assessVitalRecord(record).level).toBe("watch");
  });

  it("labels saved glucose timeline rows with measurement context and profile-aware assessment", () => {
    const record = {
      date: "2026-06-04",
      glucoseContext: "after-meal" as const,
      glucoseMgDl: 191,
      id: "glu-test",
      note: "",
      type: "glucose" as const,
    };

    expect(formatVitalTimelineTitle(record)).toBe("혈당 191 mg/dL (식후 2시간)");
    expect(formatVitalMetricValue(record)).toBe("191 mg/dL");
    expect(formatVitalRecordLabel(record, { diabetes: true })).toBe("식후 목표 초과");
    expect(formatVitalRecordLabel(record, { diabetes: false })).toBe("내당능장애 범위");
    expect(formatVitalMetricRecordLabel(record, { diabetes: true })).toBe(
      "식후 2시간 · 식후 목표 초과",
    );
    expect(formatVitalRecordSaveActionLabel(record)).toBe("혈당 기록 추가");
    expect(formatVitalRecordSavedStatusLabel(record, { diabetes: true })).toBe(
      "혈당 기록 추가됨 · 식후 목표 초과",
    );
  });

  it("labels saved temperature timeline rows with cancer-patient fever assessment", () => {
    const record = {
      date: "2026-06-04",
      id: "temp-test",
      note: "",
      temperatureC: 38.1,
      type: "temperature" as const,
    };

    expect(formatVitalTimelineTitle(record)).toBe("체온 38.1℃");
    expect(formatVitalMetricValue(record)).toBe("38.1℃");
    expect(formatVitalRecordLabel(record)).toBe("발열 연락 기준");
    expect(formatVitalMetricRecordLabel(record)).toBe("발열 연락 기준");
    expect(formatVitalRecordSaveActionLabel(record)).toBe("체온 기록 추가");
    expect(formatVitalRecordSavedStatusLabel(record)).toBe("체온 기록 추가됨 · 발열 연락 기준");
    expect(assessVitalRecord(record).level).toBe("risk");
  });

  it("keeps incomplete legacy vital records from rendering misleading numbers", () => {
    expect(formatVitalTimelineTitle({ type: "blood-pressure", systolic: 128 })).toBe(
      "혈압 입력값 없음",
    );
    expect(formatVitalMetricValue({ type: "blood-pressure", systolic: 128 })).toBe("-");
    expect(formatVitalRecordLabel({ type: "glucose" })).toBe("정보 부족");
    expect(formatVitalMetricRecordLabel({ type: "glucose" })).toBe("정보 부족");
    expect(formatVitalTimelineTitle({ type: "temperature" })).toBe("체온 입력값 없음");
    expect(formatVitalMetricValue({ type: "temperature" })).toBe("-");
  });
});
