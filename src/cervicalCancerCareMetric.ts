import type { CervicalCancerCareClipboardSummary } from "./cervicalCancerCareClipboard";

export type CervicalCancerCarePanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type CervicalCancerCarePanelSummary = {
  ariaLabel: string;
  items: CervicalCancerCarePanelSummaryItem[];
};

export function buildCervicalCancerCarePanelSummary(
  summary: CervicalCancerCareClipboardSummary,
): CervicalCancerCarePanelSummary {
  const items = [
    { id: "total", label: "전체", value: `${summary.totalItemCount}개` },
    { id: "priority", label: "우선", value: `${summary.priorityCount}개` },
    ...(summary.screeningSummaryCount
      ? [{ id: "screening", label: "검진요약", value: `${summary.screeningSummaryCount}개` }]
      : []),
    { id: "alert-record-field", label: "기록항목", value: `${summary.alertRecordFieldCount}개` },
    { id: "alert", label: "경고", value: `${summary.alertCount}개` },
    { id: "prompt", label: "질문", value: `${summary.promptCount}개` },
    {
      id: "record-recovery-prevention",
      label: "기록/회복/예방",
      value: `${summary.recordRecoveryPreventionCount}개`,
    },
    { id: "source", label: "공식 출처", value: `${summary.sourceCount}개` },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return { ariaLabel, items };
}
