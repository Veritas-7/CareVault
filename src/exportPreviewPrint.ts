export type ExportPreviewPrintDocument = {
  content: string;
  filename: string;
  isHtml: boolean;
  title: string;
};

export type ExportPreviewPrintResult = "frame-unavailable" | "print-failed" | "printed";

type ExportPreviewPrintEnvironment = {
  document?: Pick<Document, "body" | "createElement">;
  setTimeout?: typeof window.setTimeout;
};

function escapePrintHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildExportPreviewPrintHtml(preview: ExportPreviewPrintDocument) {
  if (preview.isHtml) return preview.content;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapePrintHtml(preview.title)}</title>
  <style>
    body { margin: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; }
    h1 { margin: 0 0 4px; font-size: 20px; }
    p { margin: 0 0 14px; color: #526066; }
    pre { white-space: pre-wrap; word-break: break-word; font: 12px/1.55 "SFMono-Regular", Consolas, monospace; }
    @media print { body { margin: 14mm; } }
  </style>
</head>
<body>
  <h1>${escapePrintHtml(preview.title)}</h1>
  <p>${escapePrintHtml(preview.filename)}</p>
  <pre>${escapePrintHtml(preview.content)}</pre>
</body>
</html>`;
}

export function printExportPreviewInFrame(
  preview: ExportPreviewPrintDocument,
  environment: ExportPreviewPrintEnvironment = {},
): ExportPreviewPrintResult {
  const documentLike = environment.document ?? globalThis.document;
  const delay = environment.setTimeout ?? globalThis.setTimeout;
  if (!documentLike?.body || !documentLike.createElement) return "frame-unavailable";

  const frame = documentLike.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.setAttribute("aria-hidden", "true");

  try {
    documentLike.body.appendChild(frame);
    const frameWindow = frame.contentWindow;
    const frameDocument = frameWindow?.document;
    if (!frameWindow || !frameDocument) {
      documentLike.body.removeChild(frame);
      return "frame-unavailable";
    }

    frameDocument.write(buildExportPreviewPrintHtml(preview));
    frameDocument.close();
    frameWindow.focus();
    frameWindow.print();
    try {
      delay(() => {
        try {
          documentLike.body.removeChild(frame);
        } catch {
          // Frame cleanup is best-effort after the print request has been issued.
        }
      }, 1000);
    } catch {
      try {
        documentLike.body.removeChild(frame);
      } catch {
        // Frame cleanup is best-effort after the print request has been issued.
      }
    }
    return "printed";
  } catch {
    try {
      documentLike.body.removeChild(frame);
    } catch {
      // Frame cleanup is best-effort after the host browser rejected printing.
    }
    return "print-failed";
  }
}
