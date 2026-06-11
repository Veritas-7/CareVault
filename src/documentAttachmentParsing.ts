import {
  canParseDocumentAttachmentText,
  normalizeParsedAttachmentText,
  type ParsedAttachmentTextSourceLabel,
} from "./documentAttachmentText";
import { canParseHwpxAttachment, extractHwpxTextFromArrayBuffer } from "./documentHwpxText";

export type ParsedBrowserDocumentAttachmentText = {
  normalizedText: string;
  sourceLabel: ParsedAttachmentTextSourceLabel;
};

export async function parseBrowserDocumentAttachmentText(
  file: File,
): Promise<ParsedBrowserDocumentAttachmentText | null> {
  let parsedText = "";
  let sourceLabel: ParsedAttachmentTextSourceLabel;

  if (canParseDocumentAttachmentText(file)) {
    parsedText = await file.text();
    sourceLabel = "텍스트 파일";
  } else if (canParseHwpxAttachment(file)) {
    const result = await extractHwpxTextFromArrayBuffer(await file.arrayBuffer());
    parsedText = result.text;
    sourceLabel = result.source === "preview" ? "HWPX 미리보기 텍스트" : "HWPX 본문 XML";
  } else {
    return null;
  }

  const normalizedText = normalizeParsedAttachmentText(parsedText);
  if (!normalizedText) return null;

  return { normalizedText, sourceLabel };
}
