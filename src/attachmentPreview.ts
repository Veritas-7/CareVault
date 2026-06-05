const previewableImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export const attachmentPreviewCloseActionLabel = "첨부 미리보기 닫기";
export const attachmentPreviewClosedStatusLabel = "이미지 미리보기 닫힘";

export function isPreviewableImageAttachment(fileName?: string) {
  const extension = fileName?.trim().toLowerCase().match(/\.([^.\\/]+)$/)?.[1];
  return Boolean(extension && previewableImageExtensions.has(extension));
}
