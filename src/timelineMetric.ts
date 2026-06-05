export type TimelinePanelSummaryInput = {
  documentCount: number;
  labCount: number;
  questionCount: number;
  sourceBackedCount: number;
  symptomCount: number;
  visitCount: number;
  vitalCount: number;
};

export type TimelinePanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type TimelinePanelSummary = {
  ariaLabel: string;
  items: TimelinePanelSummaryItem[];
  totalCount: number;
};

export function buildTimelinePanelSummary(
  input: TimelinePanelSummaryInput,
): TimelinePanelSummary {
  const totalCount =
    input.vitalCount
    + input.visitCount
    + input.documentCount
    + input.symptomCount
    + input.questionCount
    + input.labCount;
  const typeItems = [
    input.vitalCount ? { id: "vital", label: "활력", value: `${input.vitalCount}개` } : null,
    input.visitCount ? { id: "visit", label: "방문", value: `${input.visitCount}개` } : null,
    input.documentCount
      ? { id: "document", label: "서류", value: `${input.documentCount}개` }
      : null,
    input.symptomCount ? { id: "symptom", label: "증상", value: `${input.symptomCount}개` } : null,
    input.questionCount
      ? { id: "question", label: "질문", value: `${input.questionCount}개` }
      : null,
    input.labCount ? { id: "lab", label: "검사", value: `${input.labCount}개` } : null,
  ].filter((item): item is TimelinePanelSummaryItem => Boolean(item));
  const items = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    ...(typeItems.length ? typeItems : [{ id: "empty", label: "유형", value: "기록 없음" }]),
    {
      id: "source-backed",
      label: "근거 포함",
      value: input.sourceBackedCount ? `${input.sourceBackedCount}개` : "없음",
    },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    ariaLabel,
    items,
    totalCount,
  };
}
