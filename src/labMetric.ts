import { assessLabValue } from "./healthRules";
import { buildLabSourceEvidenceParts } from "./labSourceEvidence";

export type LabPanelSummarySource = {
  lower: string;
  name: string;
  note: string;
  upper: string;
  value: string;
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
  return assessLabValue(
    Number.parseFloat(result.value),
    result.lower ? Number.parseFloat(result.lower) : undefined,
    result.upper ? Number.parseFloat(result.upper) : undefined,
  );
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
