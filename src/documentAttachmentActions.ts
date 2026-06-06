export const documentDraftAttachmentClearedStatusLabel = "첨부 선택 제거됨";

function formatDraftAttachmentContext(attachmentName?: string, attachmentStatus?: string) {
  const trimmedName = attachmentName?.trim();
  const trimmedStatus = attachmentStatus?.trim();
  const attachmentContext = trimmedName ? `현재 선택 ${trimmedName}` : "현재 선택 첨부 없음";

  return trimmedStatus ? `${attachmentContext} · 상태 ${trimmedStatus}` : attachmentContext;
}

export function formatDocumentDraftAttachmentRemoveActionLabel(attachmentName?: string) {
  const attachmentContext = formatDraftAttachmentContext(attachmentName);
  return `서류 메모 첨부 선택 제거 · ${attachmentContext}`;
}

export function formatDocumentDraftAttachmentClearedStatusLabel(
  attachmentName?: string,
  attachmentStatus?: string,
) {
  return `첨부 선택 제거됨 · ${formatDraftAttachmentContext(attachmentName, attachmentStatus)}`;
}

export function formatDocumentDraftAttachmentSelectionFailedStatusLabel(
  attachmentName?: string,
  attachmentStatus?: string,
) {
  return `서류 첨부 선택 실패 · 브라우저 파일명 참조 선택으로 전환 · ${formatDraftAttachmentContext(
    attachmentName,
    attachmentStatus,
  )}`;
}
