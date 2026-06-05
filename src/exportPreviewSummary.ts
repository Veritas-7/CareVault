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

const koreanNumberFormatter = new Intl.NumberFormat("ko-KR");

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

export function formatExportPreviewCopyStatus(format: string, summary: ExportPreviewSummary) {
  return `${format} 미리보기 복사됨 · ${formatExportPreviewCompactSummary(summary)}`;
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

export function formatExportPreviewDownloadDescription(
  format: string,
  summary: ExportPreviewSummary,
) {
  return `${format} 다운로드 · ${formatExportPreviewCompactSummary(summary)}`;
}

export function formatExportPreviewDownloadStatus(format: string, summary: ExportPreviewSummary) {
  return `${format} 미리보기 다운로드됨 · ${formatExportPreviewCompactSummary(summary)}`;
}
