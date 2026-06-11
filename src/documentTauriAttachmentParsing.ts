import {
  normalizeParsedAttachmentText,
  type ParsedAttachmentTextSourceLabel,
} from "./documentAttachmentText";

export type TauriInvoke = <T>(command: string, args: Record<string, string>) => Promise<T>;

export type TauriHwpAttachmentParseResult = {
  characterCount?: unknown;
  sourceLabel?: unknown;
  text?: unknown;
};

export type ParsedTauriDocumentAttachmentText = {
  normalizedText: string;
  sourceLabel: ParsedAttachmentTextSourceLabel;
};

const tauriHwpAttachmentExtensions = new Set(["hwp", "hwpx", "hwpml"]);
const tauriHwpSourceLabel = "HWP/HWPX 데스크톱 파서";

export function canParseTauriHwpAttachmentName(fileName: string | undefined) {
  const extension = fileName?.trim().split(".").pop()?.toLowerCase() ?? "";
  return tauriHwpAttachmentExtensions.has(extension);
}

export async function parseTauriDocumentAttachmentText(
  attachmentPath: string,
  attachmentName: string | undefined,
  invoke: TauriInvoke,
): Promise<ParsedTauriDocumentAttachmentText | null> {
  if (!canParseTauriHwpAttachmentName(attachmentName)) return null;

  const result = await invoke<TauriHwpAttachmentParseResult>("parse_hwp_attachment_text", {
    path: attachmentPath,
  });
  const parsedText = typeof result.text === "string" ? result.text : "";
  const normalizedText = normalizeParsedAttachmentText(parsedText);
  if (!normalizedText) return null;

  return {
    normalizedText,
    sourceLabel: result.sourceLabel === tauriHwpSourceLabel ? result.sourceLabel : tauriHwpSourceLabel,
  };
}
