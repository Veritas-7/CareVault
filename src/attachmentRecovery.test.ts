import { describe, expect, it } from "vitest";
import { needsAttachmentRecovery } from "./attachmentRecovery";

describe("attachmentRecovery", () => {
  it("flags missing, failed, and reattachment-needed attachment statuses", () => {
    expect(needsAttachmentRecovery("파일 없음 - 재첨부 필요")).toBe(true);
    expect(needsAttachmentRecovery("첨부 열기 실패 - 재첨부 필요")).toBe(true);
    expect(needsAttachmentRecovery("첨부 확인 실패")).toBe(true);
  });

  it("does not flag healthy or reference-only attachment statuses", () => {
    expect(needsAttachmentRecovery("파일 확인됨")).toBe(false);
    expect(needsAttachmentRecovery("브라우저 파일명 참조")).toBe(false);
    expect(needsAttachmentRecovery(undefined)).toBe(false);
  });
});
