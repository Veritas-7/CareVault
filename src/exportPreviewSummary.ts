export type ExportPreviewSummary = {
  byteCount: number;
  byteLabel: string;
  characterCount: number;
  characterLabel: string;
  lineCount: number;
  lineLabel: string;
  sourceMarkerCount: number;
  sourceMarkerLabel: string;
};

export type ExportPreviewFreshActionReason =
  | "caregiver-settings"
  | "caregiver-content"
  | "visit-range"
  | "visit-content"
  | "csv-content";

const koreanNumberFormatter = new Intl.NumberFormat("ko-KR");

const exportPreviewFreshActionDescriptions: Record<ExportPreviewFreshActionReason, string> = {
  "caregiver-settings": "새 미리보기 생성 · 보호자 공유본 · 변경된 공유 설정 적용",
  "caregiver-content": "새 미리보기 생성 · 보호자 공유본 · 변경된 보호자 공유 기록 적용",
  "visit-range": "새 미리보기 생성 · 진료 요약 · 변경된 범위 적용",
  "visit-content": "새 미리보기 생성 · 진료 요약 · 변경된 기록 적용",
  "csv-content": "새 미리보기 생성 · CSV · 변경된 기록 적용",
};

const exportPreviewFreshActionVisibleLabels: Record<ExportPreviewFreshActionReason, string> = {
  "caregiver-settings": "공유 설정 반영",
  "caregiver-content": "공유 기록 반영",
  "visit-range": "요약 범위 반영",
  "visit-content": "요약 기록 반영",
  "csv-content": "CSV 기록 반영",
};

const exportPreviewStaleStatusDescriptions: Record<ExportPreviewFreshActionReason, string> = {
  "caregiver-settings": "변경된 공유 설정",
  "caregiver-content": "변경된 보호자 공유 기록",
  "visit-range": "변경된 진료 요약 범위",
  "visit-content": "변경된 진료 요약 기록",
  "csv-content": "변경된 CSV 기록",
};

function formatCount(value: number, unit: string) {
  return `${koreanNumberFormatter.format(value)}${unit}`;
}

export function buildExportPreviewSummary(content: string): ExportPreviewSummary {
  const lineCount = content ? content.split(/\r\n|\r|\n/).length : 0;
  const characterCount = content.length;
  const byteCount = new TextEncoder().encode(content).length;
  const sourceMarkerCount = content.match(/(?:근거|출처):/g)?.length ?? 0;

  return {
    byteCount,
    byteLabel: formatCount(byteCount, "B"),
    characterCount,
    characterLabel: formatCount(characterCount, "자"),
    lineCount,
    lineLabel: formatCount(lineCount, "줄"),
    sourceMarkerCount,
    sourceMarkerLabel: `근거/출처 ${formatCount(sourceMarkerCount, "개")}`,
  };
}

export function formatExportPreviewCompactSummary(summary: ExportPreviewSummary) {
  return [
    summary.lineLabel,
    summary.characterLabel,
    summary.byteLabel,
    summary.sourceMarkerLabel,
  ].join(" · ");
}

export function formatExportPreviewCopyDescription(
  format: string,
  summary: ExportPreviewSummary,
) {
  return `${format} 복사 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewDisabledActionDescription(
  actionDescription: string,
  disabledReason?: string,
) {
  const trimmedReason = disabledReason?.trim();
  return trimmedReason ? `${actionDescription} · 비활성: ${trimmedReason}` : actionDescription;
}

export function formatExportPreviewFreshActionDescription(
  reason: ExportPreviewFreshActionReason,
) {
  return exportPreviewFreshActionDescriptions[reason];
}

export function formatExportPreviewFreshActionVisibleLabel(
  reason: ExportPreviewFreshActionReason,
) {
  return exportPreviewFreshActionVisibleLabels[reason];
}

export function formatExportPreviewCopyStatus(format: string, summary: ExportPreviewSummary) {
  return `${format} 미리보기 복사됨 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewCopyUnsupportedStatus(
  format: string,
  summary: ExportPreviewSummary,
) {
  return `${format} 미리보기 복사 미지원 · 브라우저 클립보드 없음 · ${formatExportPreviewCompactSummary(
    summary,
  )}`;
}

export function formatExportPreviewCopyFailedStatus(
  format: string,
  summary: ExportPreviewSummary,
) {
  return `${format} 미리보기 복사 실패 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewStaleStatus(
  format: string,
  summary: ExportPreviewSummary,
  reason: ExportPreviewFreshActionReason,
) {
  return `${format} 미리보기 새로 생성 필요 · ${exportPreviewStaleStatusDescriptions[reason]} · ${formatExportPreviewCompactSummary(
    summary,
  )}`;
}

export function formatExportPreviewPrintDescription(
  format: string,
  summary: ExportPreviewSummary,
) {
  return `${format} 인쇄 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewPrintStatus(format: string, summary: ExportPreviewSummary) {
  return `${format} 미리보기 인쇄 준비 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewPrintWindowFailedStatus(
  format: string,
  summary: ExportPreviewSummary,
) {
  return `${format} 미리보기 인쇄 창 열기 실패 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewCloseStatus(format: string, summary: ExportPreviewSummary) {
  return `${format} 미리보기 닫힘 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewDownloadDescription(
  format: string,
  summary: ExportPreviewSummary,
) {
  return `${format} 다운로드 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewDownloadStatus(format: string, summary: ExportPreviewSummary) {
  return `${format} 미리보기 다운로드됨 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewDownloadFallbackLabel(format: string) {
  return `${format} 미리보기`;
}
