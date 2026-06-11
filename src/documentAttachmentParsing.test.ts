import { describe, expect, it } from "vitest";
import { parseBrowserDocumentAttachmentText } from "./documentAttachmentParsing";

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

  it("returns null for unsupported browser attachments instead of treating binary data as text", async () => {
    const file = new File(["%PDF-1.7"], "scan.pdf", { type: "application/pdf" });

    await expect(parseBrowserDocumentAttachmentText(file)).resolves.toBeNull();
  });
});
