export type TextFileDownloadResult =
  | "clipboard-failed"
  | "clipboard-fallback"
  | "download-started"
  | "unsupported";

type ClipboardWriter = {
  writeText?: (text: string) => Promise<void>;
};

export type TextFileDownloadNavigator = {
  clipboard?: ClipboardWriter;
  userAgent?: string;
  vendor?: string;
};

type TextFileDownloadEnvironment = {
  BlobCtor?: typeof Blob;
  URLCtor?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
  document?: Document;
  navigator?: TextFileDownloadNavigator;
  setTimeout?: typeof window.setTimeout;
};

const safariLikeDownloadBlocklist = /(Chrome|Chromium|CriOS|FxiOS|Edg\/|OPR\/)/;

export function shouldUseClipboardDownloadFallback(
  navigatorLike: TextFileDownloadNavigator | undefined,
) {
  const userAgent = navigatorLike?.userAgent ?? "";
  const vendor = navigatorLike?.vendor ?? "";

  return (
    vendor.includes("Apple") &&
    userAgent.includes("AppleWebKit") &&
    userAgent.includes("Safari") &&
    !safariLikeDownloadBlocklist.test(userAgent)
  );
}

export function formatTextFileDownloadClipboardFallbackStatus(
  label: string,
  summary: string,
) {
  return `${label} 다운로드 대신 클립보드 복사됨 · ${summary}`;
}

export function formatTextFileDownloadUnsupportedStatus(label: string, summary: string) {
  return `${label} 다운로드 미지원 · 브라우저 다운로드/클립보드 없음 · ${summary}`;
}

export function formatTextFileDownloadFailedStatus(label: string, summary: string) {
  return `${label} 다운로드 실패 · 클립보드 복사 실패 · ${summary}`;
}

export async function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
  environment: TextFileDownloadEnvironment = {},
): Promise<TextFileDownloadResult> {
  const navigatorLike = environment.navigator ?? globalThis.navigator;

  if (shouldUseClipboardDownloadFallback(navigatorLike)) {
    const writeText = navigatorLike.clipboard?.writeText;
    if (!writeText) return "unsupported";

    try {
      await writeText.call(navigatorLike.clipboard, content);
      return "clipboard-fallback";
    } catch {
      return "clipboard-failed";
    }
  }

  const documentLike = environment.document ?? globalThis.document;
  const URLLike = environment.URLCtor ?? globalThis.URL;
  const BlobLike = environment.BlobCtor ?? globalThis.Blob;
  const revokeLater = environment.setTimeout ?? globalThis.setTimeout;
  const blob = new BlobLike([content], { type: mimeType });
  const url = URLLike.createObjectURL(blob);
  const link = documentLike.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  documentLike.body.appendChild(link);
  link.click();
  documentLike.body.removeChild(link);
  revokeLater(() => URLLike.revokeObjectURL(url), 5000);

  return "download-started";
}
