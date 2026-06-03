import { describe, expect, it } from "vitest";
import { clearAttachmentMetadata, hasAttachmentMetadata } from "./attachmentArchive";

describe("attachmentArchive", () => {
  it("detects saved attachment metadata", () => {
    expect(hasAttachmentMetadata({ attachmentName: "result.pdf" })).toBe(true);
    expect(hasAttachmentMetadata({ attachmentName: "   " })).toBe(false);
    expect(hasAttachmentMetadata({})).toBe(false);
  });

  it("clears attachment metadata while preserving the document record", () => {
    const document = {
      id: "doc-1",
      title: "검사 결과",
      attachmentName: "result.pdf",
      attachmentPath: "/tmp/result.pdf",
      attachmentStorage: "tauri-sandbox",
      attachmentStatus: "파일 확인됨",
      history: [{ id: "history-1" }],
    };

    expect(clearAttachmentMetadata(document)).toEqual({
      id: "doc-1",
      title: "검사 결과",
      attachmentName: undefined,
      attachmentPath: undefined,
      attachmentStorage: undefined,
      attachmentStatus: undefined,
      history: [{ id: "history-1" }],
    });
  });
});
