import { describe, expect, it } from "vitest";
import { parseBrowserDocumentAttachmentText } from "./documentAttachmentParsing";
import {
  buildDocumentRagContext,
  formatDocumentRagAnswerDraftClipboardText,
  formatDocumentRagContextClipboardText,
} from "./documentRagContext";

const encoder = new TextEncoder();

function concatBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function uint16(value: number) {
  const output = new Uint8Array(2);
  new DataView(output.buffer).setUint16(0, value, true);
  return output;
}

function uint32(value: number) {
  const output = new Uint8Array(4);
  new DataView(output.buffer).setUint32(0, value, true);
  return output;
}

function createStoredZip(entries: Array<{ name: string; text: string }>) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = encoder.encode(entry.text);
    const localOffset = offset;
    const local = concatBytes([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      name,
      data,
    ]);
    localParts.push(local);
    offset += local.length;
    centralParts.push(
      concatBytes([
        uint32(0x02014b50),
        uint16(20),
        uint16(20),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(0),
        uint32(data.length),
        uint32(data.length),
        uint16(name.length),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(0),
        uint32(localOffset),
        name,
      ]),
    );
  }

  const central = concatBytes(centralParts);
  return concatBytes([
    ...localParts,
    central,
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(central.length),
    uint32(offset),
    uint16(0),
  ]).buffer;
}

describe("documentAttachmentParsing", () => {
  it("parses text-like browser attachments into normalized local-RAG text", async () => {
    const file = new File([" HbA1c 7.2%\r\n혈압 142/88 "], "labs.csv", { type: "text/csv" });

    await expect(parseBrowserDocumentAttachmentText(file)).resolves.toEqual({
      normalizedText: "HbA1c 7.2%\n혈압 142/88",
      sourceLabel: "텍스트 파일",
    });
  });

  it("parses HWPX preview text with a source label", async () => {
    const file = new File(
      [
        createStoredZip([
          {
            name: "Preview/PrvText.txt",
            text: "자궁경부암 병리 결과\n식후혈당 181",
          },
        ]),
      ],
      "pathology.hwpx",
    );

    await expect(parseBrowserDocumentAttachmentText(file)).resolves.toEqual({
      normalizedText: "자궁경부암 병리 결과\n식후혈당 181",
      sourceLabel: "HWPX 미리보기 텍스트",
    });
  });

  it("feeds synthetic medical HWPX section XML into source-grounded RAG evidence", async () => {
    const file = new File(
      [
        createStoredZip([
          {
            name: "Contents/section0.xml",
            text:
              '<?xml version="1.0" encoding="UTF-8"?>' +
              "<hp:sec>" +
              "<hp:t>자궁경부암 추적 진료 기록</hp:t>" +
              "<hp:lineBreak/>" +
              "<hp:t>혈압 148/92, 혈압약 복용 확인 필요</hp:t>" +
              "<hp:lineBreak/>" +
              "<hp:t>HbA1c 7.6%, 당화혈색소와 식후혈당 상담 예정</hp:t>" +
              "</hp:sec>",
          },
        ]),
      ],
      "synthetic-care-note.hwpx",
    );

    const parsed = await parseBrowserDocumentAttachmentText(file);
    expect(parsed).toEqual({
      normalizedText:
        "자궁경부암 추적 진료 기록\n" +
        "혈압 148/92, 혈압약 복용 확인 필요\n" +
        "HbA1c 7.6%, 당화혈색소와 식후혈당 상담 예정",
      sourceLabel: "HWPX 본문 XML",
    });
    if (!parsed) throw new Error("synthetic HWPX should parse");

    const context = buildDocumentRagContext(
      [
        {
          attachmentName: "synthetic-care-note.hwpx",
          attachmentPath: "/Users/wj/private/synthetic-care-note.hwpx",
          body:
            "진료 전 확인 메모\n\n" +
            `[첨부 텍스트 파싱: synthetic-care-note.hwpx · ${parsed.sourceLabel}]\n` +
            parsed.normalizedText,
          category: "follow-up",
          date: "2026-06-11",
          id: "doc-synthetic-hwpx",
          nextAction: "진료팀에 혈압과 당화혈색소 관리 연결 질문",
          reviewStatus: "care-question",
          tags: "자궁경부암,고혈압,당뇨",
          title: "합성 HWPX 진료 기록",
        },
      ],
      "자궁경부암 혈압 당화혈색소",
    );
    const packetText = formatDocumentRagContextClipboardText(context);
    const answerText = formatDocumentRagAnswerDraftClipboardText(context);

    expect(context.items).toHaveLength(1);
    expect(context.items[0]).toMatchObject({
      documentId: "doc-synthetic-hwpx",
      parserSummary: "HWPX 본문 XML: synthetic-care-note.hwpx",
      signalSummary: "자궁경부암 · 고혈압 · 당뇨 · HWP/HWPX",
      statusSummary: "의료진 질문",
    });
    expect(context.items[0].evidenceChunks[0]).toMatchObject({
      label: "파싱 본문 조각 1",
      sourceSummary: "HWPX 본문 XML: synthetic-care-note.hwpx",
    });
    expect(context.items[0].evidenceChunks[0].reasonSummary).toContain("쿼리 커버리지:");
    expect(context.items[0].evidenceChunks[0].reasonSummary).toContain("임상 단서:");
    expect(context.items[0].evidenceChunks[0].text).toContain("혈압 148/92");
    expect(context.items[0].evidenceChunks[0].text).toContain("HbA1c 7.6%");
    expect(context.evidenceQuality.level).toBe("source-grounded");
    expect(context.answerDraft.level).toBe("source-grounded");
    expect(answerText).toContain("진료팀 확인 질문");
    expect(packetText).toContain("HWPX 본문 XML: synthetic-care-note.hwpx");
    expect(packetText).not.toContain("/Users/wj/private");
    expect(answerText).not.toContain("/Users/wj/private");
  });

  it("returns null for unsupported browser attachments instead of treating binary data as text", async () => {
    const file = new File(["%PDF-1.7"], "scan.pdf", { type: "application/pdf" });

    await expect(parseBrowserDocumentAttachmentText(file)).resolves.toBeNull();
  });
});
