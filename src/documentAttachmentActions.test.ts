import { describe, expect, it } from "vitest";
import {
  documentDraftAttachmentClearedStatusLabel,
  formatDocumentDraftAttachmentClearedStatusLabel,
  formatDocumentDraftAttachmentRemoveActionLabel,
} from "./documentAttachmentActions";

describe("documentAttachmentActions", () => {
  it("formats the draft attachment remove action with the selected filename", () => {
    expect(formatDocumentDraftAttachmentRemoveActionLabel(" scan.png ")).toBe(
      "서류 메모 첨부 선택 제거 · 현재 선택 scan.png",
    );
  });

  it("formats a stable fallback when the selected filename is missing", () => {
    expect(formatDocumentDraftAttachmentRemoveActionLabel()).toBe(
      "서류 메모 첨부 선택 제거 · 현재 선택 첨부 없음",
    );
  });

  it("keeps the draft attachment cleared status explicit", () => {
    expect(documentDraftAttachmentClearedStatusLabel).toBe("첨부 선택 제거됨");
    expect(
      formatDocumentDraftAttachmentClearedStatusLabel("scan.png", "브라우저 파일명 참조"),
    ).toBe("첨부 선택 제거됨 · 현재 선택 scan.png · 상태 브라우저 파일명 참조");
    expect(formatDocumentDraftAttachmentClearedStatusLabel()).toBe(
      "첨부 선택 제거됨 · 현재 선택 첨부 없음",
    );
  });
});
