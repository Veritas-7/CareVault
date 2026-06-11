# Rust HWP/HWPX Parser Adapter A/B - 2026-06-11

## Scope

CareVault needed a fail-closed runtime path for binary `.hwp` document text extraction.
Browser file input cannot provide a stable local path for binary `.hwp`, so this gate focuses on
Tauri-selected attachments where the app already has a sandbox/path reference.

## Samples

- `KTX.hwp` from public `edwardkim/rhwp`, 66,048 bytes.
- `hwp3-sample-hwpx.hwpx` from public `edwardkim/rhwp`, 108,286 bytes.

## Candidate Results

| Candidate | License | HWP result | HWPX result | Decision |
| --- | --- | --- | --- | --- |
| `hwarang@0.2.0` | MIT | success, 2,765 chars, preview includes `KTX 노선도`, `서울`, `용산`, `광명` | success, 21,573 chars, preview includes `Creating Linux Virtual Servers` | adopted for Tauri command |
| `unhwp@0.5.1` | MIT | text and markdown success | text and markdown success | keep as fallback candidate |
| `hwp2md@0.5.0` | GPL-3.0-only | not smoke-tested | not smoke-tested | not adopted as app runtime dependency |

## Adoption

Selected adapter: `hwarang::extract_text_from_file(path)` with `default-features = false`.

Runtime surface: Tauri command `parse_hwp_attachment_text`.

CareVault behavior:

- Tauri-selected `.hwp`, `.hwpx`, and `.hwpml` attachments can be parsed into the document body.
- Parsed blocks use source label `HWP/HWPX 데스크톱 파서`.
- Parser failure is fail-closed: the app keeps filename/path attachment metadata and reports parsing failure.
- Browser-selected `.hwp` remains filename-reference only.
- Browser-selected `.hwpx` continues to use the lightweight ZIP preview/XML extractor.

## Verification

- `cargo run -- /tmp/carevault-hwp-rust-ab.cW1uJl/KTX.hwp /tmp/carevault-hwp-rust-ab.cW1uJl/hwp3-sample-hwpx.hwpx` with `hwarang` `default-features = false`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `npm test -- src/documentTauriAttachmentParsing.test.ts src/documentAttachmentParsing.test.ts src/documentAttachmentText.test.ts src/documentHwpxText.test.ts src/documentKnowledge.test.ts src/documentFilterActions.test.ts`
- `npm run typecheck`
