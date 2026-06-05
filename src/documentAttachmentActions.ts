export const documentDraftAttachmentClearedStatusLabel = "첨부 선택 제거됨";

export function formatDocumentDraftAttachmentRemoveActionLabel(attachmentName?: string) {
  const trimmedName = attachmentName?.trim();
  const attachmentContext = trimmedName ? `현재 선택 ${trimmedName}` : "현재 선택 첨부 없음";

  return `서류 메모 첨부 선택 제거 · ${attachmentContext}`;
}
