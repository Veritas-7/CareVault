import {
  findSymptomSupportTemplate,
  isSymptomSupportCareQueueCandidate,
} from "./symptomSupportTemplates";
import { hasSymptomRecordSourceEvidence } from "./symptomRecordLabels";

export type SymptomPanelSummarySource = {
  action: string;
  body: string;
  medication?: string;
  severity: number;
  symptom: string;
};

export type SymptomPanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type SymptomPanelSummary = {
  ariaLabel: string;
  highSeverityCount: number;
  items: SymptomPanelSummaryItem[];
  queueCandidateCount: number;
  sourceBackedCount: number;
  stableSeverityCount: number;
  totalCount: number;
  watchSeverityCount: number;
};

function hasStructuredCervicalWarningDraft(symptom: SymptomPanelSummarySource) {
  return `${symptom.body}\n${symptom.action}`.includes("자궁경부암 경고 신호 기록 초안");
}

function isQueueCandidateSymptom(symptom: SymptomPanelSummarySource) {
  if (Number(symptom.severity) >= 7) return true;
  if (hasStructuredCervicalWarningDraft(symptom)) return true;

  const template = findSymptomSupportTemplate(
    [symptom.symptom, symptom.body, symptom.action, symptom.medication ?? ""].join(" "),
  );

  return template ? isSymptomSupportCareQueueCandidate(template) : false;
}

export function buildSymptomPanelSummary(
  symptoms: SymptomPanelSummarySource[],
): SymptomPanelSummary {
  const totalCount = symptoms.length;
  const highSeverityCount = symptoms.filter((symptom) => Number(symptom.severity) >= 7).length;
  const watchSeverityCount = symptoms.filter((symptom) => {
    const severity = Number(symptom.severity);
    return severity >= 4 && severity < 7;
  }).length;
  const stableSeverityCount = symptoms.filter((symptom) => Number(symptom.severity) < 4).length;
  const sourceBackedCount = symptoms.filter((symptom) =>
    hasSymptomRecordSourceEvidence(symptom),
  ).length;
  const queueCandidateCount = symptoms.filter(isQueueCandidateSymptom).length;
  const statusItems = [
    highSeverityCount ? { id: "high", label: "고위험", value: `${highSeverityCount}개` } : null,
    watchSeverityCount ? { id: "watch", label: "관찰", value: `${watchSeverityCount}개` } : null,
    stableSeverityCount ? { id: "stable", label: "안정", value: `${stableSeverityCount}개` } : null,
  ].filter((item): item is SymptomPanelSummaryItem => Boolean(item));
  const items = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    ...(statusItems.length ? statusItems : [{ id: "empty", label: "상태", value: "기록 없음" }]),
    {
      id: "source-backed",
      label: "근거",
      value: sourceBackedCount ? `포함 ${sourceBackedCount}개` : "없음",
    },
    {
      id: "queue-candidate",
      label: "큐 후보",
      value: queueCandidateCount ? `${queueCandidateCount}개` : "없음",
    },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    ariaLabel,
    highSeverityCount,
    items,
    queueCandidateCount,
    sourceBackedCount,
    stableSeverityCount,
    totalCount,
    watchSeverityCount,
  };
}
