export type HwpxAttachmentCandidate = {
  name: string;
  type?: string;
};

export type HwpxTextExtractionResult = {
  source: "preview" | "section-xml";
  text: string;
};

type ZipEntry = {
  compressedSize: number;
  compressionMethod: number;
  localHeaderOffset: number;
  name: string;
  uncompressedSize: number;
};

const decoder = new TextDecoder("utf-8");
const eocdSignature = 0x06054b50;
const centralDirectorySignature = 0x02014b50;
const localFileHeaderSignature = 0x04034b50;

function normalizeExtractedText(text: string) {
  return text
    .replace(/\0/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function decodeXmlEntities(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function findEndOfCentralDirectory(view: DataView) {
  const minOffset = Math.max(0, view.byteLength - 22 - 65535);
  for (let offset = view.byteLength - 22; offset >= minOffset; offset -= 1) {
    if (view.getUint32(offset, true) === eocdSignature) return offset;
  }
  return -1;
}

function readZipEntries(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer);
  const eocdOffset = findEndOfCentralDirectory(view);
  if (eocdOffset < 0) return [];

  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > view.byteLength) break;
    if (view.getUint32(offset, true) !== centralDirectorySignature) break;

    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameStart = offset + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd > view.byteLength) break;

    entries.push({
      compressedSize,
      compressionMethod,
      localHeaderOffset,
      name: decoder.decode(new Uint8Array(buffer, nameStart, nameLength)),
      uncompressedSize,
    });
    offset = nameEnd + extraLength + commentLength;
  }

  return entries;
}

async function inflateRaw(data: Uint8Array) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipEntryData(buffer: ArrayBuffer, entry: ZipEntry) {
  const view = new DataView(buffer);
  const offset = entry.localHeaderOffset;
  if (offset + 30 > view.byteLength || view.getUint32(offset, true) !== localFileHeaderSignature) {
    return undefined;
  }

  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const dataStart = offset + 30 + nameLength + extraLength;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataEnd > view.byteLength) return undefined;

  const compressed = new Uint8Array(buffer, dataStart, entry.compressedSize);
  if (entry.compressionMethod === 0) return compressed;
  if (entry.compressionMethod === 8) return inflateRaw(compressed);
  return undefined;
}

export function canParseHwpxAttachment(candidate: HwpxAttachmentCandidate) {
  return candidate.name.trim().toLowerCase().endsWith(".hwpx");
}

export function extractHwpxXmlText(xml: string) {
  const normalizedXml = xml
    .replace(/<hp:lineBreak\s*\/>/g, "\n")
    .replace(/<hp:tab\s*\/>/g, "\t");
  const matches = [...normalizedXml.matchAll(/<hp:t\b[^>]*>([\s\S]*?)<\/hp:t>/g)];

  return normalizeExtractedText(
    matches.map((match) => decodeXmlEntities(match[1].replace(/<[^>]+>/g, ""))).join("\n"),
  );
}

export async function extractHwpxTextFromArrayBuffer(
  buffer: ArrayBuffer,
): Promise<HwpxTextExtractionResult> {
  const entries = readZipEntries(buffer);
  const previewEntry = entries.find((entry) => entry.name === "Preview/PrvText.txt");

  if (previewEntry) {
    const data = await readZipEntryData(buffer, previewEntry);
    const text = data ? normalizeExtractedText(decoder.decode(data)) : "";
    if (text) return { source: "preview", text };
  }

  const sectionEntries = entries
    .filter((entry) => /^Contents\/section\d+\.xml$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const sectionTexts: string[] = [];
  for (const entry of sectionEntries) {
    const data = await readZipEntryData(buffer, entry);
    if (!data) continue;
    const text = extractHwpxXmlText(decoder.decode(data));
    if (text) sectionTexts.push(text);
  }

  const text = normalizeExtractedText(sectionTexts.join("\n"));
  if (text) return { source: "section-xml", text };

  throw new Error("No readable HWPX text entries found");
}
