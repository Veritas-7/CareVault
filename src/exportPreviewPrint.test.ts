import { describe, expect, it, vi } from "vitest";
import {
  buildExportPreviewPrintHtml,
  printExportPreviewInFrame,
} from "./exportPreviewPrint";

function createPrintFrameEnvironment(options: { printThrows?: boolean; writeThrows?: boolean } = {}) {
  const write = vi.fn((_html: string) => {
    if (options.writeThrows) throw new Error("write failed");
  });
  const close = vi.fn();
  const focus = vi.fn();
  const print = vi.fn(() => {
    if (options.printThrows) throw new Error("print failed");
  });
  const setAttribute = vi.fn();
  const appendChild = vi.fn();
  const removeChild = vi.fn();
  const frame = {
    contentWindow: {
      document: { close, write },
      focus,
      print,
    },
    setAttribute,
    style: {},
  };
  const documentLike = {
    body: { appendChild, removeChild },
    createElement: vi.fn(() => frame),
  };
  const timeout = vi.fn<(callback: () => void, delay?: number) => number>((callback) => {
    callback();
    return 1;
  });

  return { appendChild, close, documentLike, frame, print, removeChild, timeout, write };
}

describe("exportPreviewPrint", () => {
  it("builds escaped printable HTML for text previews", () => {
    const html = buildExportPreviewPrintHtml({
      content: "검사 <수치> & 메모",
      filename: "carevault-summary.md",
      isHtml: false,
      title: "진료 요약 <미리보기>",
    });

    expect(html).toContain("<title>진료 요약 &lt;미리보기&gt;</title>");
    expect(html).toContain("<h1>진료 요약 &lt;미리보기&gt;</h1>");
    expect(html).toContain("<p>carevault-summary.md</p>");
    expect(html).toContain("<pre>검사 &lt;수치&gt; &amp; 메모</pre>");
  });

  it("prints inside a temporary frame without opening a new browser window", () => {
    const { appendChild, documentLike, frame, print, removeChild, timeout, write } =
      createPrintFrameEnvironment();

    expect(
      printExportPreviewInFrame(
        {
          content: "진료 요약 본문",
          filename: "summary.md",
          isHtml: false,
          title: "진료 요약",
        },
        {
          document: documentLike as unknown as Document,
          setTimeout: timeout as unknown as typeof window.setTimeout,
        },
      ),
    ).toBe("printed");

    expect(documentLike.createElement).toHaveBeenCalledWith("iframe");
    expect(appendChild).toHaveBeenCalledWith(frame);
    expect(write).toHaveBeenCalledWith(expect.stringContaining("<pre>진료 요약 본문</pre>"));
    expect(print).toHaveBeenCalledTimes(1);
    expect(timeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(removeChild).toHaveBeenCalledWith(frame);
  });

  it("keeps a successful print status when delayed frame cleanup cannot be scheduled", () => {
    const { documentLike, frame, print, removeChild } = createPrintFrameEnvironment();
    const timeout = vi.fn<(callback: () => void, delay?: number) => number>(() => {
      throw new Error("timer unavailable");
    });

    expect(
      printExportPreviewInFrame(
        {
          content: "진료 요약 본문",
          filename: "summary.md",
          isHtml: false,
          title: "진료 요약",
        },
        {
          document: documentLike as unknown as Document,
          setTimeout: timeout as unknown as typeof window.setTimeout,
        },
      ),
    ).toBe("printed");

    expect(print).toHaveBeenCalledTimes(1);
    expect(timeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(removeChild).toHaveBeenCalledWith(frame);
  });

  it("returns an explicit failure and removes the print frame when print throws", () => {
    const { documentLike, frame, removeChild } = createPrintFrameEnvironment({
      printThrows: true,
    });

    expect(
      printExportPreviewInFrame(
        {
          content: "<strong>공유본</strong>",
          filename: "share.html",
          isHtml: true,
          title: "보호자 공유본",
        },
        { document: documentLike as unknown as Document },
      ),
    ).toBe("print-failed");
    expect(removeChild).toHaveBeenCalledWith(frame);
  });

  it("returns unavailable when the host document cannot provide a print frame", () => {
    expect(
      printExportPreviewInFrame(
        {
          content: "CSV",
          filename: "records.csv",
          isHtml: false,
          title: "CSV",
        },
        { document: { createElement: vi.fn() } as unknown as Document },
      ),
    ).toBe("frame-unavailable");
  });
});
