import { describe, expect, it } from "vitest";
import {
  buildDocumentAttachmentParsedTextBlock,
  canParseDocumentAttachmentText,
  formatDocumentAttachmentTextParseFailedStatus,
  formatDocumentAttachmentTextParsedStatus,
  mergeParsedAttachmentTextIntoDocumentBody,
  normalizeParsedAttachmentText,
} from "./documentAttachmentText";

describe("documentAttachmentText", () => {
  it("recognizes text-like document attachments that browser File.text can parse safely", () => {
    expect(canParseDocumentAttachmentText({ name: "result.txt", type: "text/plain" })).toBe(true);
    expect(canParseDocumentAttachmentText({ name: "memo.md", type: "" })).toBe(true);
    expect(canParseDocumentAttachmentText({ name: "labs.csv", type: "text/csv" })).toBe(true);
    expect(canParseDocumentAttachmentText({ name: "scan.hwpx", type: "" })).toBe(false);
    expect(canParseDocumentAttachmentText({ name: "result.pdf", type: "application/pdf" })).toBe(
      false,
    );
  });

  it("normalizes parsed text and keeps a bounded local snippet", () => {
    const parsed = normalizeParsedAttachmentText(`\u0000 HbA1c 7.2%\r\n혈압 142/88\n${"가".repeat(7000)}`);

    expect(parsed).toContain("HbA1c 7.2%\n혈압 142/88");
    expect(parsed.length).toBeLessThanOrEqual(6004);
    expect(parsed.endsWith("...")).toBe(true);
  });

  it("builds a stable parsed-text block with the source filename", () => {
    expect(buildDocumentAttachmentParsedTextBlock(" labs.csv ", " HbA1c 7.2% ")).toBe(
      "[첨부 텍스트 파싱: labs.csv]\nHbA1c 7.2%",
    );
  });

  it("merges parsed text into an empty or existing document body without duplicating a file block", () => {
    const first = mergeParsedAttachmentTextIntoDocumentBody("", "labs.csv", "HbA1c 7.2%");
    const second = mergeParsedAttachmentTextIntoDocumentBody(
      "기존 메모",
      "labs.csv",
      "HbA1c 7.2%",
    );

    expect(first).toBe("[첨부 텍스트 파싱: labs.csv]\nHbA1c 7.2%");
    expect(second).toBe("기존 메모\n\n[첨부 텍스트 파싱: labs.csv]\nHbA1c 7.2%");
    expect(mergeParsedAttachmentTextIntoDocumentBody(first, "labs.csv", "새 내용")).toBe(first);
  });

  it("formats parse status labels with filename and character counts", () => {
    expect(formatDocumentAttachmentTextParsedStatus("labs.csv", 18)).toBe(
      "첨부 텍스트 파싱됨 · 현재 첨부 labs.csv · 본문 18자 반영",
    );
    expect(formatDocumentAttachmentTextParseFailedStatus("labs.csv")).toBe(
      "첨부 텍스트 파싱 실패 · 현재 첨부 labs.csv · 파일명 참조는 유지됨",
    );
  });
});
