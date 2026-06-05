import { describe, expect, it } from "vitest";
import {
  buildAttachmentRecoveryUpdate,
  needsAttachmentRecovery,
  resolveRuntimeAttachmentOpen,
  resolveRuntimeAttachmentPreview,
} from "./attachmentRecovery";

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

  it("builds stable recovery status and history text for runtime failures", () => {
    expect(buildAttachmentRecoveryUpdate("missing-file", " scan.pdf ")).toEqual({
      historyDetail: "scan.pdf: 파일 없음 - 재첨부 필요",
      historyLabel: "첨부 재첨부 필요",
      status: "파일 없음 - 재첨부 필요",
    });
    expect(buildAttachmentRecoveryUpdate("open-failure", "scan.pdf")).toEqual({
      historyDetail: "scan.pdf: 첨부 열기 실패 - 재첨부 필요",
      historyLabel: "첨부 열기 실패",
      status: "첨부 열기 실패 - 재첨부 필요",
    });
    expect(buildAttachmentRecoveryUpdate("preview-failure")).toEqual({
      historyDetail: "첨부: 이미지 미리보기 실패 - 재첨부 필요",
      historyLabel: "첨부 미리보기 실패",
      status: "이미지 미리보기 실패 - 재첨부 필요",
    });
  });

  it("uses a disposable runtime fixture for missing-file attachment open recovery", async () => {
    const openCalls: string[] = [];

    await expect(
      resolveRuntimeAttachmentOpen(
        {
          attachmentName: "scan.pdf",
          attachmentPath: "/tmp/missing-scan.pdf",
          id: "doc-fixture",
          title: "영상 첨부 복구 테스트",
        },
        {
          exists: async () => false,
          openPath: async (path) => {
            openCalls.push(path);
          },
        },
      ),
    ).resolves.toEqual({
      recovery: {
        historyDetail: "scan.pdf: 파일 없음 - 재첨부 필요",
        historyLabel: "첨부 재첨부 필요",
        status: "파일 없음 - 재첨부 필요",
      },
      type: "recovery",
    });
    expect(openCalls).toEqual([]);
  });

  it("uses a disposable runtime fixture for opener-failure recovery", async () => {
    await expect(
      resolveRuntimeAttachmentOpen(
        {
          attachmentName: "scan.pdf",
          attachmentPath: "/tmp/existing-scan.pdf",
          id: "doc-fixture",
          title: "영상 첨부 복구 테스트",
        },
        {
          exists: async () => true,
          openPath: async () => {
            throw new Error("fixture opener failure");
          },
        },
      ),
    ).resolves.toEqual({
      recovery: {
        historyDetail: "scan.pdf: 첨부 열기 실패 - 재첨부 필요",
        historyLabel: "첨부 열기 실패",
        status: "첨부 열기 실패 - 재첨부 필요",
      },
      type: "recovery",
    });
  });

  it("uses a disposable runtime fixture for image-preview conversion failure recovery", async () => {
    await expect(
      resolveRuntimeAttachmentPreview(
        {
          attachmentName: "scan.png",
          attachmentPath: "/tmp/existing-scan.png",
          id: "doc-fixture",
          title: "영상 첨부 복구 테스트",
        },
        {
          convertFileSrc: () => {
            throw new Error("fixture preview failure");
          },
          exists: async () => true,
        },
      ),
    ).resolves.toEqual({
      recovery: {
        historyDetail: "scan.png: 이미지 미리보기 실패 - 재첨부 필요",
        historyLabel: "첨부 미리보기 실패",
        status: "이미지 미리보기 실패 - 재첨부 필요",
      },
      type: "recovery",
    });
  });
});
