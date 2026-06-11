import { describe, expect, it, vi } from "vitest";
import {
  canParseTauriHwpAttachmentName,
  parseTauriDocumentAttachmentText,
  type TauriInvoke,
} from "./documentTauriAttachmentParsing";

describe("documentTauriAttachmentParsing", () => {
  it("recognizes Tauri-side HWP, HWPX, and HWPML parser candidates by filename", () => {
    expect(canParseTauriHwpAttachmentName("pathology.hwp")).toBe(true);
    expect(canParseTauriHwpAttachmentName("pathology.hwpx")).toBe(true);
    expect(canParseTauriHwpAttachmentName("pathology.hwpml")).toBe(true);
    expect(canParseTauriHwpAttachmentName("pathology.pdf")).toBe(false);
    expect(canParseTauriHwpAttachmentName(undefined)).toBe(false);
  });

  it("invokes the fail-closed Tauri HWP parser and normalizes returned text", async () => {
    const invokeMock = vi.fn().mockResolvedValue({
      characterCount: 22,
      sourceLabel: "HWP/HWPX 데스크톱 파서",
      text: " 자궁경부암 병리 결과\r\n혈압 142/88 ",
    });
    const invoke: TauriInvoke = async <T,>(command: string, args: Record<string, string>) =>
      invokeMock(command, args) as T;

    await expect(
      parseTauriDocumentAttachmentText("/private/pathology.hwp", "pathology.hwp", invoke),
    ).resolves.toEqual({
      normalizedText: "자궁경부암 병리 결과\n혈압 142/88",
      sourceLabel: "HWP/HWPX 데스크톱 파서",
    });
    expect(invokeMock).toHaveBeenCalledWith("parse_hwp_attachment_text", {
      path: "/private/pathology.hwp",
    });
  });

  it("does not invoke the desktop parser for unsupported files", async () => {
    const invokeMock = vi.fn();
    const invoke: TauriInvoke = async <T,>(command: string, args: Record<string, string>) =>
      invokeMock(command, args) as T;

    await expect(
      parseTauriDocumentAttachmentText("/private/scan.pdf", "scan.pdf", invoke),
    ).resolves.toBeNull();
    expect(invokeMock).not.toHaveBeenCalled();
  });
});
