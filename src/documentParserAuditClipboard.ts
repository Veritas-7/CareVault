import type { DocumentParserAudit } from "./documentParserAudit";

export function formatDocumentParserAuditClipboardDescription(audit: DocumentParserAudit) {
  return `문서 파서 점검 복사 · ${audit.summary}`;
}

export function formatDocumentParserAuditClipboardStatus(audit: DocumentParserAudit) {
  return `문서 파서 점검 복사됨 · ${audit.summary}`;
}

export function formatDocumentParserAuditClipboardUnsupportedStatus(audit: DocumentParserAudit) {
  return `문서 파서 점검 복사 미지원 · 브라우저 클립보드 없음 · ${audit.summary}`;
}

export function formatDocumentParserAuditClipboardFailedStatus(audit: DocumentParserAudit) {
  return `문서 파서 점검 복사 실패 · ${audit.summary}`;
}

export function formatDocumentParserAuditClipboardText(audit: DocumentParserAudit) {
  const lines = [
    "[CareVault 문서 파서 점검]",
    "용도: 저장된 서류의 파싱 원천과 앱이 감지한 임상 단서를 진료 전 확인하기 위한 공유 메모입니다.",
    "주의: 진단·처방·치료 지시가 아니라 원문 서류와 진료팀 확인을 돕는 기록입니다.",
    `요약: ${audit.summary}`,
  ];

  if (!audit.items.length) {
    return [...lines, "", "- 파싱된 첨부 본문이 없습니다."].join("\n");
  }

  return [
    ...lines,
    "",
    ...audit.items.flatMap((item) => [
      `- ${item.dateLabel} · ${item.documentLabel}`,
      `  - 파싱 원천: ${item.sourceSummary}`,
      `  - 임상 단서: ${item.clinicalSignalSummary}`,
    ]),
  ].join("\n");
}
