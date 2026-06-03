const previewableImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export function isPreviewableImageAttachment(fileName?: string) {
  const extension = fileName?.trim().toLowerCase().match(/\.([^.\\/]+)$/)?.[1];
  return Boolean(extension && previewableImageExtensions.has(extension));
}
