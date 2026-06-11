import { appendDocumentHistory, type DocumentHistoryEntry } from "./documentHistory";

export type DocumentAttachmentTextCandidate = {
  name: string;
  type?: string;
};

export type ParsedAttachmentTextSourceLabel =
  | "텍스트 파일"
  | "HWPX 미리보기 텍스트"
  | "HWPX 본문 XML";

export type SavedDocumentParsedAttachmentTarget = {
  body: string;
  history?: DocumentHistoryEntry[];
};

const textAttachmentExtensions = new Set(["txt", "md", "csv"]);
const textAttachmentMimeTypes = new Set([
  "text/csv",
  "text/markdown",
  "text/plain",
]);
const parsedAttachmentMaxCharacters = 6000;

function formatAttachmentFileName(fileName: string | undefined) {
  return fileName?.trim() || "첨부 파일명 미확인";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatParsedAttachmentHeader(fileName: string, sourceLabel?: ParsedAttachmentTextSourceLabel) {
  const sourceContext = sourceLabel ? ` · ${sourceLabel}` : "";
  return `[첨부 텍스트 파싱: ${formatAttachmentFileName(fileName)}${sourceContext}]`;
}

function buildParsedAttachmentHeaderPattern(fileName: string) {
  return new RegExp(
    `(^|\\n)\\[첨부 텍스트 파싱: ${escapeRegExp(
      formatAttachmentFileName(fileName),
    )}(?: · [^\\]]+)?\\]\\n`,
  );
}

export function canParseDocumentAttachmentText(candidate: DocumentAttachmentTextCandidate) {
  const extension = candidate.name.trim().split(".").pop()?.toLowerCase() ?? "";
  const mimeType = candidate.type?.trim().toLowerCase() ?? "";

  return textAttachmentExtensions.has(extension) || textAttachmentMimeTypes.has(mimeType);
}

export function normalizeParsedAttachmentText(
  text: string,
  maxCharacters = parsedAttachmentMaxCharacters,
) {
  const normalized = text
    .replace(/\0/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (normalized.length <= maxCharacters) return normalized;
  return `${normalized.slice(0, maxCharacters).trim()}...`;
}

export function buildDocumentAttachmentParsedTextBlock(fileName: string, text: string) {
  const normalizedText = normalizeParsedAttachmentText(text);
  if (!normalizedText) return "";

  return `${formatParsedAttachmentHeader(fileName)}\n${normalizedText}`;
}

export function mergeParsedAttachmentTextIntoDocumentBody(
  currentBody: string,
  fileName: string,
  parsedText: string,
  sourceLabel?: ParsedAttachmentTextSourceLabel,
) {
  const normalizedText = normalizeParsedAttachmentText(parsedText);
  if (!normalizedText) return currentBody;

  const block = `${formatParsedAttachmentHeader(fileName, sourceLabel)}\n${normalizedText}`;
  if (!block) return currentBody;

  if (buildParsedAttachmentHeaderPattern(fileName).test(currentBody)) {
    return currentBody;
  }

  const current = currentBody.trim();
  return current ? `${current}\n\n${block}` : block;
}

export function formatDocumentAttachmentTextParsedStatus(
  fileName: string | undefined,
  characterCount: number,
  sourceLabel?: ParsedAttachmentTextSourceLabel,
) {
  const sourceContext = sourceLabel ? ` · 원천 ${sourceLabel}` : "";
  return `첨부 텍스트 파싱됨 · 현재 첨부 ${formatAttachmentFileName(
    fileName,
  )}${sourceContext} · 본문 ${characterCount}자 반영`;
}

export function formatDocumentAttachmentTextParseFailedStatus(fileName: string | undefined) {
  return `첨부 텍스트 파싱 실패 · 현재 첨부 ${formatAttachmentFileName(
    fileName,
  )} · 파일명 참조는 유지됨`;
}

export function mergeParsedAttachmentTextIntoSavedDocument<
  T extends SavedDocumentParsedAttachmentTarget,
>(
  document: T,
  fileName: string,
  parsedText: string,
  sourceLabel: ParsedAttachmentTextSourceLabel | undefined,
  historyEntry: DocumentHistoryEntry,
): T {
  return {
    ...document,
    body: mergeParsedAttachmentTextIntoDocumentBody(
      document.body,
      fileName,
      parsedText,
      sourceLabel,
    ),
    history: appendDocumentHistory(document.history, historyEntry),
  };
}
