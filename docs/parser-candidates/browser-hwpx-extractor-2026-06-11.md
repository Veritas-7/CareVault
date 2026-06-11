# Browser HWPX Extractor - 2026-06-11

## Scope

CareVault now has a lightweight built-in `.hwpx` text extraction path for browser-selected attachments.

Supported:

- ZIP entries stored with method `0`;
- ZIP entries deflated with method `8` through `DecompressionStream("deflate-raw")`;
- `Preview/PrvText.txt` as the preferred text source;
- `Contents/section*.xml` as fallback, extracting `<hp:t>` text nodes.

Not supported:

- binary `.hwp` parsing;
- encrypted, damaged, DRM, or unsupported ZIP structures;
- layout-faithful HWPX rendering, tables, images, or style preservation.

## Safety Boundary

When extraction fails, CareVault keeps the attachment as a filename-reference record instead of blocking document storage. Full binary HWP parsing remains a `kordoc` candidate path and must be adopted only through a fail-closed adapter after runtime bundling is verified.

## Verification

- `npm test -- src/documentHwpxText.test.ts`: PASS, 4 tests
- Combined focused document parsing tests: PASS, 4 files / 22 tests
