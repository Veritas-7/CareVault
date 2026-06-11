import { describe, expect, it } from "vitest";
import {
  canParseHwpxAttachment,
  extractHwpxTextFromArrayBuffer,
  extractHwpxXmlText,
} from "./documentHwpxText";

const encoder = new TextEncoder();

async function deflateRaw(data: Uint8Array) {
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

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

async function createZip(
  entries: Array<{ name: string; text: string; method?: "deflate" | "store" }>,
) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const original = encoder.encode(entry.text);
    const method = entry.method === "store" ? 0 : 8;
    const compressed = method === 0 ? original : await deflateRaw(original);
    const localOffset = offset;
    const local = concatBytes([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(method),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(compressed.length),
      uint32(original.length),
      uint16(name.length),
      uint16(0),
      name,
      compressed,
    ]);
    localParts.push(local);
    offset += local.length;
    centralParts.push(
      concatBytes([
        uint32(0x02014b50),
        uint16(20),
        uint16(20),
        uint16(0),
        uint16(method),
        uint16(0),
        uint16(0),
        uint32(0),
        uint32(compressed.length),
        uint32(original.length),
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
  const end = concatBytes([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(central.length),
    uint32(offset),
    uint16(0),
  ]);

  return concatBytes([...localParts, central, end]).buffer;
}

describe("documentHwpxText", () => {
  it("recognizes only HWPX attachments for browser-side HWPX text extraction", () => {
    expect(canParseHwpxAttachment({ name: "result.hwpx", type: "" })).toBe(true);
    expect(canParseHwpxAttachment({ name: "result.hwp", type: "" })).toBe(false);
    expect(canParseHwpxAttachment({ name: "result.pdf", type: "application/pdf" })).toBe(false);
  });

  it("extracts HWPX preview text from a deflated zip entry first", async () => {
    const zip = await createZip([
      {
        name: "Contents/section0.xml",
        text: "<hp:t>section text should not win</hp:t>",
        method: "store",
      },
      {
        name: "Preview/PrvText.txt",
        text: "자궁경부암 병리 결과\nHbA1c 7.2%\n혈압 142/88",
        method: "deflate",
      },
    ]);

    await expect(extractHwpxTextFromArrayBuffer(zip)).resolves.toEqual({
      source: "preview",
      text: "자궁경부암 병리 결과\nHbA1c 7.2%\n혈압 142/88",
    });
  });

  it("falls back to section XML hp:t text when preview text is missing", async () => {
    const xml =
      '<hs:sec xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph">' +
      "<hp:p><hp:run><hp:t>자궁경부암 &amp; 병리</hp:t></hp:run></hp:p>" +
      "<hp:p><hp:run><hp:t>혈압 142/88</hp:t></hp:run></hp:p>" +
      "</hs:sec>";
    const zip = await createZip([{ name: "Contents/section0.xml", text: xml, method: "deflate" }]);

    await expect(extractHwpxTextFromArrayBuffer(zip)).resolves.toEqual({
      source: "section-xml",
      text: "자궁경부암 & 병리\n혈압 142/88",
    });
  });

  it("extracts text nodes from HWPX section XML", () => {
    expect(
      extractHwpxXmlText("<hp:t>당뇨 &lt;HbA1c&gt;</hp:t><hp:t>식후혈당 181</hp:t>"),
    ).toBe("당뇨 <HbA1c>\n식후혈당 181");
  });
});
