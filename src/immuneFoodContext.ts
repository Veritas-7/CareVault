import {
  assessLabTextValue,
  foodGuidanceSources,
  parseFiniteNumberText,
  type LabFlag,
} from "./healthRules";
import { buildLabSourceEvidenceParts, resolveLabPresetSourceEvidence } from "./labSourceEvidence";

export type ImmuneFoodLabResult = {
  date: string;
  name: string;
  value: string;
  unit: string;
  lower: string;
  upper: string;
  note: string;
};

export type ImmuneFoodSafetyContext = {
  ariaLabel: string;
  foodSafetySourceLabel: string;
  foodSafetySourceUrl: string;
  label: string;
  labName: string;
  labSourceLabel: string;
  labSourceUrl: string;
  labValueLabel: string;
  lowerLimitLabel: string;
  sourceCount: number;
  sourceLabels: string[];
  summary: string;
};

function formatValueWithUnit(value: string, unit: string) {
  return [value, unit].map((part) => part.trim()).filter(Boolean).join(" ");
}

function isImmuneLabName(name: string) {
  const preset = resolveLabPresetSourceEvidence(name);
  return preset?.presetId === "wbc" || preset?.presetId === "anc";
}

function getLabFlag(lab: ImmuneFoodLabResult): LabFlag {
  return assessLabTextValue(lab.value, lab.lower, lab.upper).flag;
}

function isValidIsoDate(value: string) {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const normalized = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);

  return normalized === trimmed;
}

function sortContextCandidates(a: ImmuneFoodLabResult, b: ImmuneFoodLabResult) {
  const dateOrder = b.date.localeCompare(a.date);
  if (dateOrder !== 0) return dateOrder;
  if (a.name.toLowerCase().includes("anc")) return -1;
  if (b.name.toLowerCase().includes("anc")) return 1;
  return a.name.localeCompare(b.name);
}

function findImmuneFoodLabContext(labs: ImmuneFoodLabResult[]) {
  return [...labs]
    .filter((lab) => {
      const lower = parseFiniteNumberText(lab.lower);
      return (
        lower !== undefined &&
        isValidIsoDate(lab.date) &&
        isImmuneLabName(lab.name) &&
        getLabFlag(lab) === "low"
      );
    })
    .sort(sortContextCandidates)[0];
}

export function buildImmuneFoodSafetyContext(
  labs: ImmuneFoodLabResult[],
): ImmuneFoodSafetyContext | null {
  const lab = findImmuneFoodLabContext(labs);
  if (!lab) return null;

  const labSourceEvidence = buildLabSourceEvidenceParts(lab);
  const foodSafetySource = foodGuidanceSources.nccImmuneLowDiet;
  const labValueLabel = `${lab.date} ${lab.name} ${formatValueWithUnit(lab.value, lab.unit)}`;
  const lowerLimitLabel = formatValueWithUnit(lab.lower, lab.unit);
  const sourceLabels = Array.from(
    new Set([labSourceEvidence.sourceLabel, foodSafetySource.label].filter(Boolean)),
  );
  const sourceCount = sourceLabels.length;
  const summary = `${labValueLabel}가 입력 기준 하한 ${lowerLimitLabel}보다 낮게 기록되었습니다. 면역저하 시 날음식·비살균 식품, 30분 이상 상온 운반 후 냉장 보관, 남은 음식 3~4일 보관 한계, 조리 위생은 진료팀 기준으로 확인하세요.`;

  return {
    ariaLabel: `면역저하 검사 연결 ${labValueLabel} · 공식 출처 ${sourceCount}개`,
    foodSafetySourceLabel: foodSafetySource.label,
    foodSafetySourceUrl: foodSafetySource.url,
    label: "면역저하 검사 연결",
    labName: lab.name,
    labSourceLabel: labSourceEvidence.sourceLabel,
    labSourceUrl: labSourceEvidence.sourceUrl,
    labValueLabel,
    lowerLimitLabel,
    sourceCount,
    sourceLabels,
    summary,
  };
}

export function formatImmuneFoodSafetyContextText(
  context: ImmuneFoodSafetyContext | null,
) {
  if (!context) return "";

  const sources = [
    context.labSourceLabel && context.labSourceUrl
      ? `${context.labSourceLabel} (${context.labSourceUrl})`
      : "",
    `${context.foodSafetySourceLabel} (${context.foodSafetySourceUrl})`,
  ].filter(Boolean);

  return `${context.label}: ${context.summary} / 근거: ${sources.join("; ")}`;
}
