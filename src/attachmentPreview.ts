const previewableImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export const attachmentPreviewCloseActionLabel = "첨부 미리보기 닫기";
export const attachmentPreviewClosedStatusLabel = "이미지 미리보기 닫힘";

type PreviewUrlRevokeEnvironment = {
  revokeObjectURL?: (url: string) => void;
};

export function isPreviewableImageAttachment(fileName?: string) {
  const extension = fileName?.trim().toLowerCase().match(/\.([^.\\/]+)$/)?.[1];
  return Boolean(extension && previewableImageExtensions.has(extension));
}

export function revokeAttachmentPreviewUrl(
  previewUrl: string | null | undefined,
  environment: PreviewUrlRevokeEnvironment = {},
) {
  const url = previewUrl?.trim();
  const revokeObjectURL = environment.revokeObjectURL ?? globalThis.URL?.revokeObjectURL;
  if (!url || !revokeObjectURL) return false;

  try {
    revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
