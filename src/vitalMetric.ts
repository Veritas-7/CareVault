import type { BloodGlucoseOptions, GlucoseContext } from "./healthRules";
import { assessVitalRecord } from "./vitalRecordLabels";

export type VitalPanelSummarySource = {
  diastolic?: number;
  glucoseContext?: GlucoseContext;
  glucoseMgDl?: number;
  systolic?: number;
  temperatureC?: number;
  type: "blood-pressure" | "glucose" | "temperature";
};

export type VitalPanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type VitalPanelSummary = {
  ariaLabel: string;
  bloodPressureCount: number;
  glucoseCount: number;
  items: VitalPanelSummaryItem[];
  neutralCount: number;
  okCount: number;
  riskCount: number;
  temperatureCount: number;
  totalCount: number;
  watchCount: number;
};

export function buildVitalPanelSummary(
  records: VitalPanelSummarySource[],
  options: BloodGlucoseOptions = {},
): VitalPanelSummary {
  const totalCount = records.length;
  const bloodPressureCount = records.filter((record) => record.type === "blood-pressure").length;
  const glucoseCount = records.filter((record) => record.type === "glucose").length;
  const temperatureCount = records.filter((record) => record.type === "temperature").length;
  const assessments = records.map((record) => assessVitalRecord(record, options));
  const okCount = assessments.filter((assessment) => assessment.level === "ok").length;
  const watchCount = assessments.filter((assessment) => assessment.level === "watch").length;
  const riskCount = assessments.filter((assessment) => assessment.level === "risk").length;
  const neutralCount = assessments.filter((assessment) => assessment.level === "neutral").length;
  const typeItems = [
    bloodPressureCount ? { id: "blood-pressure", label: "혈압", value: `${bloodPressureCount}개` } : null,
    glucoseCount ? { id: "glucose", label: "혈당", value: `${glucoseCount}개` } : null,
    temperatureCount ? { id: "temperature", label: "체온", value: `${temperatureCount}개` } : null,
  ].filter((item): item is VitalPanelSummaryItem => Boolean(item));
  const statusItems = [
    riskCount ? { id: "risk", label: "고위험", value: `${riskCount}개` } : null,
    watchCount ? { id: "watch", label: "관찰", value: `${watchCount}개` } : null,
    okCount ? { id: "ok", label: "기준 내", value: `${okCount}개` } : null,
    neutralCount ? { id: "neutral", label: "확인 필요", value: `${neutralCount}개` } : null,
  ].filter((item): item is VitalPanelSummaryItem => Boolean(item));
  const items = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    ...(typeItems.length ? typeItems : [{ id: "type-empty", label: "유형", value: "기록 없음" }]),
    ...(statusItems.length
      ? statusItems
      : [{ id: "status-empty", label: "상태", value: "기록 없음" }]),
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    ariaLabel,
    bloodPressureCount,
    glucoseCount,
    items,
    neutralCount,
    okCount,
    riskCount,
    temperatureCount,
    totalCount,
    watchCount,
  };
}
