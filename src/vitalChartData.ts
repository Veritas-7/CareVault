import {
  type BloodGlucoseOptions,
  type GlucoseContext,
} from "./healthRules";
import {
  buildVitalAssessmentEvidence,
  formatVitalAssessmentStatus,
} from "./vitalAssessmentEvidence";

type VitalRecordForChart = {
  date: string;
  diastolic?: number;
  glucoseContext?: GlucoseContext;
  glucoseMgDl?: number;
  systolic?: number;
  temperatureC?: number;
  type: "blood-pressure" | "glucose" | "temperature";
};

export type VitalChartPoint = {
  bloodPressureAssessment?: string;
  date: string;
  dateLabel: string;
  diastolic?: number;
  glucose?: number;
  glucoseAssessment?: string;
  glucoseContextLabel?: string;
  order: number;
  systolic?: number;
};

export type VitalChartSummaryItem = {
  label: string;
  value: string;
};

export type VitalChartLegendItem = {
  color: string;
  dataKey: "systolic" | "diastolic" | "glucose";
  label: string;
  unit: string;
};

export type VitalChartAccessibleRow = {
  assessment: string;
  bloodPressure: string;
  date: string;
  glucose: string;
  summary: string;
};

export const vitalChartLegendItems: VitalChartLegendItem[] = [
  { color: "#1f7a8c", dataKey: "systolic", label: "수축기 혈압", unit: "mmHg" },
  { color: "#6d5dfc", dataKey: "diastolic", label: "이완기 혈압", unit: "mmHg" },
  { color: "#d97706", dataKey: "glucose", label: "혈당", unit: "mg/dL" },
];

const glucoseContextLabel: Record<GlucoseContext, string> = {
  fasting: "공복",
  "before-meal": "식전",
  "after-meal": "식후 2시간",
  bedtime: "취침 전",
  random: "수시",
};

function isPositiveMeasurement(value: number | undefined): value is number {
  return Number.isFinite(value) && value !== undefined && value > 0;
}

function formatBloodPressureAssessment(record: VitalRecordForChart) {
  if (record.type !== "blood-pressure") return undefined;

  const evidence = buildVitalAssessmentEvidence(record);
  if (!evidence) return undefined;

  const status = formatVitalAssessmentStatus(evidence);
  return evidence.standard?.sourceLabel ? `${status} · ${evidence.standard.sourceLabel}` : status;
}

function formatGlucoseAssessment(
  record: VitalRecordForChart,
  options: BloodGlucoseOptions,
) {
  if (record.type !== "glucose") return undefined;

  const evidence = buildVitalAssessmentEvidence(record, options);
  if (!evidence) return undefined;

  const status = formatVitalAssessmentStatus(evidence);
  return evidence.standard?.sourceLabel ? `${status} · ${evidence.standard.sourceLabel}` : status;
}

export function buildVitalChartData(
  records: readonly VitalRecordForChart[],
  options: BloodGlucoseOptions = {},
): VitalChartPoint[] {
  return records
    .filter((record) => record.type !== "temperature")
    .map((record, index) => ({
      bloodPressureAssessment: formatBloodPressureAssessment(record),
      date: record.date.slice(5),
      dateLabel: record.date,
      diastolic:
        record.type === "blood-pressure" && isPositiveMeasurement(record.diastolic)
          ? record.diastolic
          : undefined,
      glucose:
        record.type === "glucose" && isPositiveMeasurement(record.glucoseMgDl)
          ? record.glucoseMgDl
          : undefined,
      glucoseAssessment: formatGlucoseAssessment(record, options),
      glucoseContextLabel:
        record.type === "glucose" && isPositiveMeasurement(record.glucoseMgDl)
          ? glucoseContextLabel[record.glucoseContext ?? "random"]
          : undefined,
      order: index,
      systolic:
        record.type === "blood-pressure" && isPositiveMeasurement(record.systolic)
          ? record.systolic
          : undefined,
    }))
    .sort((a, b) => a.dateLabel.localeCompare(b.dateLabel) || a.order - b.order);
}

export function formatVitalChartTooltipValue(dataKey: string | number, value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }

  if (dataKey === "systolic") {
    return `수축기 ${value} mmHg`;
  }

  if (dataKey === "diastolic") {
    return `이완기 ${value} mmHg`;
  }

  if (dataKey === "glucose") {
    return `혈당 ${value} mg/dL`;
  }

  return String(value);
}

function formatLatestBloodPressure(point: VitalChartPoint | undefined) {
  if (!point) return "혈압 기록 대기";

  if (point.systolic !== undefined && point.diastolic !== undefined) {
    return `${point.systolic}/${point.diastolic} mmHg`;
  }

  if (point.systolic !== undefined) {
    return `수축기 ${point.systolic} mmHg`;
  }

  if (point.diastolic !== undefined) {
    return `이완기 ${point.diastolic} mmHg`;
  }

  return "혈압 기록 대기";
}

function formatAccessibleBloodPressure(point: VitalChartPoint) {
  const bloodPressure = formatLatestBloodPressure(point);
  return bloodPressure === "혈압 기록 대기" ? "혈압 없음" : bloodPressure;
}

function formatLatestGlucose(point: VitalChartPoint | undefined) {
  if (!point || point.glucose === undefined) return "혈당 기록 대기";

  return point.glucoseContextLabel
    ? `${point.glucose} mg/dL (${point.glucoseContextLabel})`
    : `${point.glucose} mg/dL`;
}

function formatAccessibleGlucose(point: VitalChartPoint) {
  const glucose = formatLatestGlucose(point);
  return glucose === "혈당 기록 대기" ? "혈당 없음" : glucose;
}

function formatAccessibleAssessment(point: VitalChartPoint) {
  const assessments = [point.bloodPressureAssessment, point.glucoseAssessment].filter(Boolean);
  return assessments.length ? `판정: ${assessments.join(" · ")}` : "판정 대기";
}

export function buildVitalChartAccessibleRows(
  points: readonly VitalChartPoint[],
): VitalChartAccessibleRow[] {
  return points.map((point) => {
    const bloodPressure = formatAccessibleBloodPressure(point);
    const glucose = formatAccessibleGlucose(point);
    const assessment = formatAccessibleAssessment(point);

    return {
      assessment,
      bloodPressure,
      date: point.dateLabel,
      glucose,
      summary: `${point.dateLabel} · ${bloodPressure} · ${glucose} · ${assessment}`,
    };
  });
}

export function buildVitalChartSummary(points: readonly VitalChartPoint[]): VitalChartSummaryItem[] {
  if (points.length === 0) {
    return [
      { label: "기간", value: "기록 대기" },
      { label: "단위", value: "혈압 mmHg / 혈당 mg/dL" },
      { label: "기록", value: "혈압 0개 · 혈당 0개" },
      { label: "최근 혈압", value: "혈압 기록 대기" },
      { label: "최근 혈당", value: "혈당 기록 대기" },
    ];
  }

  const bloodPressureCount = points.filter(
    (point) => point.systolic !== undefined || point.diastolic !== undefined,
  ).length;
  const glucoseCount = points.filter((point) => point.glucose !== undefined).length;
  const latestBloodPressurePoint = [...points]
    .reverse()
    .find((point) => point.systolic !== undefined || point.diastolic !== undefined);
  const latestGlucosePoint = [...points].reverse().find((point) => point.glucose !== undefined);
  const firstDate = points[0]?.dateLabel ?? "";
  const lastDate = points[points.length - 1]?.dateLabel ?? "";

  return [
    {
      label: "기간",
      value: firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`,
    },
    { label: "단위", value: "혈압 mmHg / 혈당 mg/dL" },
    { label: "기록", value: `혈압 ${bloodPressureCount}개 · 혈당 ${glucoseCount}개` },
    { label: "최근 혈압", value: formatLatestBloodPressure(latestBloodPressurePoint) },
    { label: "최근 혈당", value: formatLatestGlucose(latestGlucosePoint) },
  ];
}
