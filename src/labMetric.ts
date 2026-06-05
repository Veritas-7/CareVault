import { assessLabTextValue } from "./healthRules";
import { buildLabSourceEvidenceParts } from "./labSourceEvidence";

export type LabPanelSummarySource = {
  lower: string;
  name: string;
  note: string;
  upper: string;
  value: string;
};

export type LabResultSavedStatusSource = LabPanelSummarySource & {
  unit: string;
};

export type LabDraftResetStatusSource = LabResultSavedStatusSource & {
  date: string;
};

export type LabPanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type LabPanelSummary = {
  abnormalCount: number;
  ariaLabel: string;
  highCount: number;
  items: LabPanelSummaryItem[];
  lowCount: number;
  normalCount: number;
  questionCandidateCount: number;
  sourceBackedCount: number;
  totalCount: number;
  unknownCount: number;
};

function assessLabSummarySource(result: LabPanelSummarySource) {
  return assessLabTextValue(result.value, result.lower, result.upper);
}

function formatLabResultValue(result: Pick<LabResultSavedStatusSource, "unit" | "value">) {
  const value = result.value.trim() || "값 없음";
  const unit = result.unit.trim();
  return unit && value !== "값 없음" ? `${value} ${unit}` : value;
}

export function formatLabResultSavedStatusLabel(result: LabResultSavedStatusSource) {
  const name = result.name.trim();
  const prefix = name ? `${name} 검사 수치 추가됨` : "검사 수치 추가됨";
  const assessment = assessLabSummarySource(result);
  const evidenceContext = buildLabSourceEvidenceParts(result).sourceLabel ? "근거 포함" : "근거 없음";

  return `${prefix} · ${formatLabResultValue(result)} · 판정 ${assessment.label} · ${evidenceContext}`;
}

export function formatLabAddActionLabel(
  draft: Pick<LabResultSavedStatusSource, "name" | "unit" | "value">,
) {
  const name = draft.name.trim();
  const value = draft.value.trim();

  if (!name || !value) {
    return "검사 수치 추가 · 검사명과 수치 필요";
  }

  return `검사 수치 추가 · ${name} ${formatLabResultValue(draft)} 입력 준비됨`;
}

export function formatLabDraftResetStatusLabel(
  draft: LabDraftResetStatusSource,
  presetLabel: string | undefined,
  resetDate: string,
) {
  const presetContext = presetLabel?.trim()
    ? `프리셋 ${presetLabel.trim()} 해제`
    : "직접 입력 모드";
  const targetDate = resetDate.trim() || draft.date.trim() || "오늘";
  const name = draft.name.trim();
  const value = formatLabResultValue(draft);

  if (!name && value === "값 없음") {
    return `검사 입력 초기화됨 · ${presetContext} · 이전 입력 없음 · 날짜 ${targetDate}`;
  }

  const previousInput = name ? `${name} ${value}` : value;
  const assessment = assessLabSummarySource(draft);
  const evidenceContext = buildLabSourceEvidenceParts(draft).sourceLabel
    ? "근거 포함"
    : "근거 없음";

  return [
    "검사 입력 초기화됨",
    presetContext,
    `이전 ${previousInput}`,
    `판정 ${assessment.label}`,
    evidenceContext,
    `날짜 ${targetDate}`,
  ].join(" · ");
}

export function buildLabPanelSummary(results: LabPanelSummarySource[]): LabPanelSummary {
  const assessments = results.map(assessLabSummarySource);
  const totalCount = results.length;
  const lowCount = assessments.filter((assessment) => assessment.flag === "low").length;
  const highCount = assessments.filter((assessment) => assessment.flag === "high").length;
  const normalCount = assessments.filter((assessment) => assessment.flag === "normal").length;
  const unknownCount = assessments.filter((assessment) => assessment.flag === "unknown").length;
  const abnormalCount = lowCount + highCount;
  const sourceBackedCount = results.filter((result) =>
    Boolean(buildLabSourceEvidenceParts(result).sourceLabel),
  ).length;
  const questionCandidateCount = assessments.filter(
    (assessment) => assessment.flag !== "normal",
  ).length;
  const statusItems = [
    lowCount ? { id: "low", label: "낮음", value: `${lowCount}개` } : null,
    highCount ? { id: "high", label: "높음", value: `${highCount}개` } : null,
    unknownCount ? { id: "unknown", label: "기준 없음", value: `${unknownCount}개` } : null,
    normalCount ? { id: "normal", label: "범위 내", value: `${normalCount}개` } : null,
  ].filter((item): item is LabPanelSummaryItem => Boolean(item));
  const items = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    ...(statusItems.length ? statusItems : [{ id: "empty", label: "상태", value: "검사 없음" }]),
    {
      id: "source-backed",
      label: "근거",
      value: sourceBackedCount ? `포함 ${sourceBackedCount}개` : "없음",
    },
    {
      id: "question-candidate",
      label: "질문 후보",
      value: questionCandidateCount ? `${questionCandidateCount}개` : "없음",
    },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    abnormalCount,
    ariaLabel,
    highCount,
    items,
    lowCount,
    normalCount,
    questionCandidateCount,
    sourceBackedCount,
    totalCount,
    unknownCount,
  };
}
