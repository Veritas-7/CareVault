import {
  buildCervicalCancerCarePromptQuestion,
  buildCervicalCancerScreeningSummary,
  cervicalCancerCareAlerts,
  cervicalCancerCareAlertRecordFields,
  cervicalCancerCareChecks,
  cervicalCancerCarePreventionGuides,
  cervicalCancerCarePriorityItems,
  cervicalCancerCarePrompts,
  cervicalCancerCareRecoveryGuides,
  cervicalCancerCareSources,
  formatCervicalCancerCareAlertRecordFieldEvidence,
  formatCervicalCancerCareAlertEvidence,
  formatCervicalCancerCareItemEvidence,
  formatCervicalCancerCarePriorityEvidence,
  formatCervicalCancerScreeningSummaryEvidence,
  type CervicalCancerScreeningProfile,
} from "./cervicalCancerCare";

export type CervicalCancerCareClipboardSummary = {
  alertCount: number;
  alertRecordFieldCount: number;
  preventionCount: number;
  priorityCount: number;
  promptCount: number;
  recordRecoveryPreventionCount: number;
  recoveryCount: number;
  screeningSummaryCount: number;
  sourceCount: number;
  totalItemCount: number;
};

export function buildCervicalCancerCareClipboardSummary(
  profile?: CervicalCancerScreeningProfile,
): CervicalCancerCareClipboardSummary {
  const screeningSummaryCount = profile ? 1 : 0;
  const recordRecoveryPreventionCount =
    cervicalCancerCareChecks.length
    + cervicalCancerCareRecoveryGuides.length
    + cervicalCancerCarePreventionGuides.length;

  return {
    alertCount: cervicalCancerCareAlerts.length,
    alertRecordFieldCount: cervicalCancerCareAlertRecordFields.length,
    preventionCount: cervicalCancerCarePreventionGuides.length,
    priorityCount: cervicalCancerCarePriorityItems.length,
    promptCount: cervicalCancerCarePrompts.length,
    recordRecoveryPreventionCount,
    recoveryCount: cervicalCancerCareRecoveryGuides.length,
    screeningSummaryCount,
    sourceCount: Object.values(cervicalCancerCareSources).length,
    totalItemCount:
      cervicalCancerCarePriorityItems.length
      + cervicalCancerCareAlertRecordFields.length
      + screeningSummaryCount
      + cervicalCancerCareAlerts.length
      + cervicalCancerCarePrompts.length
      + recordRecoveryPreventionCount,
  };
}

export function formatCervicalCancerCareClipboardCompactSummary(
  summary: CervicalCancerCareClipboardSummary,
) {
  return [
    `총 ${summary.totalItemCount}개 항목`,
    `우선 ${summary.priorityCount}개`,
    ...(summary.screeningSummaryCount ? [`검진요약 ${summary.screeningSummaryCount}개`] : []),
    `기록항목 ${summary.alertRecordFieldCount}개`,
    `경고 ${summary.alertCount}개`,
    `질문 ${summary.promptCount}개`,
    `기록/회복/예방 ${summary.recordRecoveryPreventionCount}개`,
    `출처 ${summary.sourceCount}개`,
  ].join(" · ");
}

export function formatCervicalCancerCareClipboardDescription(
  summary: CervicalCancerCareClipboardSummary,
) {
  return `자궁경부암 케어 노트 공식 출처 포함 복사 · ${formatCervicalCancerCareClipboardCompactSummary(summary)}`;
}

export function formatCervicalCancerCareClipboardStatus(
  summary: CervicalCancerCareClipboardSummary,
) {
  return `자궁경부암 케어 노트 복사됨 · ${formatCervicalCancerCareClipboardCompactSummary(summary)}`;
}

export function formatCervicalCancerCareClipboardUnsupportedStatus(
  summary: CervicalCancerCareClipboardSummary,
) {
  return `자궁경부암 케어 노트 복사 미지원 · 브라우저 클립보드 없음 · ${formatCervicalCancerCareClipboardCompactSummary(
    summary,
  )}`;
}

export function formatCervicalCancerCareClipboardFailedStatus(
  summary: CervicalCancerCareClipboardSummary,
) {
  return `자궁경부암 케어 노트 복사 실패 · ${formatCervicalCancerCareClipboardCompactSummary(
    summary,
  )}`;
}

export function formatCervicalCancerCareClipboardText(
  profile?: CervicalCancerScreeningProfile,
) {
  const screeningSummary = profile
    ? buildCervicalCancerScreeningSummary(profile)
    : null;
  const summary = buildCervicalCancerCareClipboardSummary(profile);

  return [
    "[자궁경부암 케어 노트]",
    "용도: 진료 전 기록과 질문 준비를 위한 공식 출처 기반 메모",
    "주의: 진단·처방·치료 지시가 아니라 진료팀 확인을 돕는 기록입니다.",
    "",
    "우선 확인 체크리스트",
    ...cervicalCancerCarePriorityItems.map(
      (item) => `- ${formatCervicalCancerCarePriorityEvidence(item)}`,
    ),
    "",
    "경고 신호 기록 항목",
    ...cervicalCancerCareAlertRecordFields.map(
      (item) => `- ${formatCervicalCancerCareAlertRecordFieldEvidence(item)}`,
    ),
    "",
    ...(screeningSummary
      ? [
          "검진 기준 빠른 확인",
          `- ${formatCervicalCancerScreeningSummaryEvidence(screeningSummary)}`,
          "",
        ]
      : []),
    "진료팀에 확인할 신호",
    ...cervicalCancerCareAlerts.map((item) => `- ${formatCervicalCancerCareAlertEvidence(item)}`),
    "",
    "진료 질문 초안",
    ...cervicalCancerCarePrompts.map(
      (item) => `- ${item.topic}: ${buildCervicalCancerCarePromptQuestion(item)}`,
    ),
    "",
    "기록 체크",
    ...cervicalCancerCareChecks.map((item) => `- ${formatCervicalCancerCareItemEvidence(item)}`),
    "",
    "회복 일정 메모",
    ...cervicalCancerCareRecoveryGuides.map(
      (item) => `- ${formatCervicalCancerCareItemEvidence(item)}`,
    ),
    "",
    "검진·예방 메모",
    ...cervicalCancerCarePreventionGuides.map(
      (item) => `- ${formatCervicalCancerCareItemEvidence(item)}`,
    ),
    "",
    `출처 목록 (${summary.sourceCount}개)`,
    ...Object.values(cervicalCancerCareSources).map((source) => `- ${source.label}: ${source.url}`),
  ].join("\n");
}
