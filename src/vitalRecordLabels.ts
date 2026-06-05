import {
  assessBloodGlucose,
  assessBloodPressure,
  assessTemperature,
  type BloodGlucoseOptions,
  type GlucoseContext,
  type HealthAssessment,
} from "./healthRules";

type VitalRecordForLabels = {
  diastolic?: number;
  glucoseContext?: GlucoseContext;
  glucoseMgDl?: number;
  systolic?: number;
  temperatureC?: number;
  type: "blood-pressure" | "glucose" | "temperature";
};

const glucoseContextLabel: Record<GlucoseContext, string> = {
  fasting: "공복",
  "before-meal": "식전",
  "after-meal": "식후 2시간",
  bedtime: "취침 전",
  random: "무작위",
};

function isValidMeasurement(value: number | undefined): value is number {
  return Number.isFinite(value) && value !== undefined && value > 0;
}

export function assessVitalRecord(
  record: VitalRecordForLabels,
  options: BloodGlucoseOptions = {},
): HealthAssessment {
  if (record.type === "blood-pressure") {
    return assessBloodPressure(record.systolic ?? 0, record.diastolic ?? 0);
  }

  if (record.type === "temperature") {
    return assessTemperature(record.temperatureC ?? 0);
  }

  return assessBloodGlucose(record.glucoseMgDl ?? 0, record.glucoseContext ?? "random", options);
}

export function formatVitalRecordLabel(
  record: VitalRecordForLabels,
  options: BloodGlucoseOptions = {},
) {
  return assessVitalRecord(record, options).label;
}

export function formatVitalRecordSaveActionLabel(record: Pick<VitalRecordForLabels, "type">) {
  if (record.type === "blood-pressure") return "혈압 기록 추가";
  if (record.type === "temperature") return "체온 기록 추가";
  return "혈당 기록 추가";
}

export function formatVitalRecordSavedStatusLabel(
  record: VitalRecordForLabels,
  options: BloodGlucoseOptions = {},
) {
  return `${formatVitalRecordSaveActionLabel(record)}됨 · ${formatVitalRecordLabel(record, options)}`;
}

export function formatVitalMetricValue(record: VitalRecordForLabels) {
  if (record.type === "blood-pressure") {
    if (!isValidMeasurement(record.systolic) || !isValidMeasurement(record.diastolic)) {
      return "-";
    }

    return `${record.systolic}/${record.diastolic} mmHg`;
  }

  if (record.type === "temperature") {
    if (!isValidMeasurement(record.temperatureC)) {
      return "-";
    }

    return `${record.temperatureC}℃`;
  }

  if (!isValidMeasurement(record.glucoseMgDl)) {
    return "-";
  }

  return `${record.glucoseMgDl} mg/dL`;
}

export function formatVitalMetricRecordLabel(
  record: VitalRecordForLabels,
  options: BloodGlucoseOptions = {},
) {
  const assessmentLabel = formatVitalRecordLabel(record, options);

  if (
    record.type === "blood-pressure" ||
    record.type === "temperature" ||
    !isValidMeasurement(record.glucoseMgDl)
  ) {
    return assessmentLabel;
  }

  return `${glucoseContextLabel[record.glucoseContext ?? "random"]} · ${assessmentLabel}`;
}

export function formatVitalTimelineTitle(record: VitalRecordForLabels) {
  if (record.type === "blood-pressure") {
    if (!isValidMeasurement(record.systolic) || !isValidMeasurement(record.diastolic)) {
      return "혈압 입력값 없음";
    }

    return `혈압 ${record.systolic}/${record.diastolic} mmHg`;
  }

  if (record.type === "temperature") {
    if (!isValidMeasurement(record.temperatureC)) {
      return "체온 입력값 없음";
    }

    return `체온 ${record.temperatureC}℃`;
  }

  if (!isValidMeasurement(record.glucoseMgDl)) {
    return "혈당 입력값 없음";
  }

  return `혈당 ${record.glucoseMgDl} mg/dL (${glucoseContextLabel[record.glucoseContext ?? "random"]})`;
}
