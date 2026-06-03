export type AttachmentMetadata = {
  attachmentName?: string;
  attachmentPath?: string;
  attachmentStorage?: string;
  attachmentStatus?: string;
};

export function hasAttachmentMetadata(document: AttachmentMetadata) {
  return Boolean(document.attachmentName?.trim());
}

export function clearAttachmentMetadata<T extends AttachmentMetadata>(document: T): T {
  return {
    ...document,
    attachmentName: undefined,
    attachmentPath: undefined,
    attachmentStorage: undefined,
    attachmentStatus: undefined,
  };
}
