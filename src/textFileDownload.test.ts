import { describe, expect, it, vi } from "vitest";
import {
  downloadTextFile,
  formatTextFileDownloadClipboardFallbackStatus,
  formatTextFileDownloadFailedStatus,
  formatTextFileDownloadUnsupportedStatus,
  shouldUseClipboardDownloadFallback,
} from "./textFileDownload";

const safariNavigator = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15",
  vendor: "Apple Computer, Inc.",
};

describe("textFileDownload", () => {
  it("detects Safari/WebKit blob-download fallback without blocking Chromium shells", () => {
    expect(shouldUseClipboardDownloadFallback(safariNavigator)).toBe(true);
    expect(
      shouldUseClipboardDownloadFallback({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        vendor: "Google Inc.",
      }),
    ).toBe(false);
    expect(shouldUseClipboardDownloadFallback({ userAgent: "", vendor: "" })).toBe(false);
  });

  it("copies text instead of attempting a blob download in Safari/WebKit fallback mode", async () => {
    const writeText = vi.fn(async (_text: string) => undefined);
    const createObjectURL = vi.fn();

    await expect(
      downloadTextFile("backup body", "backup.json", "application/json", {
        navigator: {
          ...safariNavigator,
          clipboard: { writeText },
        },
        URLCtor: {
          createObjectURL,
          revokeObjectURL: vi.fn(),
        },
      }),
    ).resolves.toBe("clipboard-fallback");

    expect(writeText).toHaveBeenCalledWith("backup body");
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("reports unsupported or failed fallback without navigating away", async () => {
    await expect(
      downloadTextFile("backup body", "backup.json", "application/json", {
        navigator: safariNavigator,
      }),
    ).resolves.toBe("unsupported");

    await expect(
      downloadTextFile("backup body", "backup.json", "application/json", {
        navigator: {
          ...safariNavigator,
          clipboard: {
            writeText: vi.fn(async (_text: string) => {
              throw new Error("denied");
            }),
          },
        },
      }),
    ).resolves.toBe("clipboard-failed");
  });

  it("reports unsupported when anchor download APIs are unavailable", async () => {
    const createObjectURL = vi.fn(() => "blob:download-url");

    await expect(
      downloadTextFile("backup body", "backup.json", "application/json", {
        BlobCtor: Blob,
        URLCtor: {
          createObjectURL,
          revokeObjectURL: vi.fn(),
        },
        navigator: {
          userAgent: "Mozilla/5.0 Chrome/121.0.0.0 Safari/537.36",
          vendor: "Google Inc.",
        },
      }),
    ).resolves.toBe("unsupported");

    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("starts an anchor download in non-Safari browsers", async () => {
    const click = vi.fn();
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const revokeObjectURL = vi.fn();
    const timeout = vi.fn<(callback: () => void, delay?: number) => number>((callback) => {
      callback();
      return 1;
    });
    const link = {
      click,
      download: "",
      href: "",
      style: { display: "" },
    } as unknown as HTMLAnchorElement;

    await expect(
      downloadTextFile("csv body", "records.csv", "text/csv", {
        BlobCtor: Blob,
        URLCtor: {
          createObjectURL: vi.fn(() => "blob:download-url"),
          revokeObjectURL,
        },
        document: {
          body: {
            appendChild,
            removeChild,
          },
          createElement: vi.fn(() => link),
        } as unknown as Document,
        navigator: {
          userAgent: "Mozilla/5.0 Chrome/121.0.0.0 Safari/537.36",
          vendor: "Google Inc.",
        },
        setTimeout: timeout as unknown as typeof window.setTimeout,
      }),
    ).resolves.toBe("download-started");

    expect(link.href).toBe("blob:download-url");
    expect(link.download).toBe("records.csv");
    expect(click).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(removeChild).toHaveBeenCalledWith(link);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download-url");
  });

  it("formats fallback download statuses with the same scope summary", () => {
    expect(
      formatTextFileDownloadClipboardFallbackStatus("백업", "프로필 포함 · 기록 8개"),
    ).toBe("백업 다운로드 대신 클립보드 복사됨 · 프로필 포함 · 기록 8개");
    expect(formatTextFileDownloadUnsupportedStatus("백업", "프로필 포함 · 기록 8개")).toBe(
      "백업 다운로드 미지원 · 브라우저 다운로드/클립보드 없음 · 프로필 포함 · 기록 8개",
    );
    expect(formatTextFileDownloadFailedStatus("백업", "프로필 포함 · 기록 8개")).toBe(
      "백업 다운로드 실패 · 클립보드 복사 실패 · 프로필 포함 · 기록 8개",
    );
  });
});
