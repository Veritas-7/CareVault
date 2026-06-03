import { describe, expect, it } from "vitest";
import { isPreviewableImageAttachment } from "./attachmentPreview";

describe("attachmentPreview", () => {
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
});
