import { describe, expect, it, vi } from "vitest";
import {
  attachmentPreviewCloseActionLabel,
  attachmentPreviewClosedStatusLabel,
  createAttachmentPreviewUrl,
  isPreviewableImageAttachment,
  revokeAttachmentPreviewUrl,
} from "./attachmentPreview";

describe("attachmentPreview", () => {
  it("keeps the close action label scoped for both aria-label and hover title", () => {
    expect(attachmentPreviewCloseActionLabel).toBe("첨부 미리보기 닫기");
  });

  it("keeps the close status explicit after the dialog is dismissed", () => {
    expect(attachmentPreviewClosedStatusLabel).toBe("이미지 미리보기 닫힘");
  });

  it("accepts supported image attachment extensions", () => {
    expect(isPreviewableImageAttachment("scan.JPG")).toBe(true);
    expect(isPreviewableImageAttachment("pathology-slide.webp")).toBe(true);
    expect(isPreviewableImageAttachment("lab-result.png")).toBe(true);
  });

  it("rejects non-image medical document attachments", () => {
    expect(isPreviewableImageAttachment("blood-test.pdf")).toBe(false);
    expect(isPreviewableImageAttachment("visit-note.docx")).toBe(false);
    expect(isPreviewableImageAttachment("no-extension")).toBe(false);
  });

  it("creates preview object URLs only when image preview support succeeds", () => {
    const imageFile = { name: "scan.png" } as File;
    const documentFile = { name: "scan.pdf" } as File;
    const createObjectURL = vi.fn((file: File) =>
      file.name === "scan.png" ? "blob:scan-preview" : "blob:document-preview",
    );
    const throwingCreateObjectURL = vi.fn((_file: File) => {
      throw new Error("preview URL blocked");
    });

    expect(createAttachmentPreviewUrl(imageFile, { createObjectURL })).toBe(
      "blob:scan-preview",
    );
    expect(createAttachmentPreviewUrl(documentFile, { createObjectURL })).toBeNull();
    expect(
      createAttachmentPreviewUrl(imageFile, {
        createObjectURL: throwingCreateObjectURL,
      }),
    ).toBeNull();
    expect(createAttachmentPreviewUrl(imageFile, { createObjectURL: undefined })).toBeNull();
  });

  it("revokes preview object URLs without letting cleanup failures interrupt UI state updates", () => {
    const revokeObjectURL = vi.fn((url: string) => {
      if (url === "blob:broken-preview") throw new Error("revoke blocked");
    });

    expect(revokeAttachmentPreviewUrl("blob:healthy-preview", { revokeObjectURL })).toBe(true);
    expect(revokeAttachmentPreviewUrl("blob:broken-preview", { revokeObjectURL })).toBe(
      false,
    );
    expect(revokeAttachmentPreviewUrl("", { revokeObjectURL })).toBe(false);
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
  });
});
