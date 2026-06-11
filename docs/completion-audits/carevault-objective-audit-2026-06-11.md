# CareVault Objective Audit - 2026-06-11

This is a completion-audit artifact for the active CareVault objective. It is not
a completion claim.

## Objective Restatement

Build CareVault into a reliable local-first care app for cervical-cancer patients
who may also track hypertension and diabetes, with strong document retention,
document parsing, search/RAG-like retrieval, and app use of parsed document
content. Use internal assets and rhwp/HWP evidence where useful, and keep work
aligned with the AutoResearch style: bind the real target, make incremental
evidence-producing slices, fail closed on parser adoption, and map every prompt
requirement to concrete artifacts before declaring completion.

The original handoff file `/Users/wj/Downloads/working.md/CareVault.txt` is
stale relative to the live repository. This audit uses the current repository
state instead.

## Source State Inspected

- Repo: `/Users/wj/Ai/System/10_Projects/CareVault`
- Pre-audit state: `HEAD == origin/main == 2f51e2d37028505b9590465e83676ff9fb263c5b`
- Pre-audit git status: clean, ahead/behind `0/0`
- Browser/cmux QA: intentionally not used because the user said cmux browser
  cannot be used in this session.

## Prompt-To-Artifact Checklist

| Requirement | Concrete artifacts inspected | Status | Evidence and gaps |
|---|---|---:|---|
| Continue the live CareVault target, not a stale handoff | Goal guard for thread `019eb4ff-957f-7173-8897-b1e24508f7ea`; live repo at `/Users/wj/Ai/System/10_Projects/CareVault`; `working.md` | PASS | Persisted objective and current goal match CareVault. `/Users/wj/Downloads/working.md/CareVault.txt` was checked and found stale, so current repo state is the source of truth. |
| Apply AutoResearch philosophy | `docs/parser-candidates/*.md`, `working.md`, focused and full gates in recent slices | PASS | Parser candidates were handled with evidence files, A/B notes, fail-closed adoption, source labels, command gates, and incremental commits. Completion is not claimed until this mapping and remaining gaps are explicit. |
| Cervical-cancer care support | `README.md`, `src/*cervical*`, source-backed warning templates, care queue/export paths | PASS | README feature coverage documents extensive NCC cervical-cancer care notes, warning-record field cards, screening and diagnostic-test prompts, pathology/stage/treatment/follow-up/side-effect templates, official-source links, and non-diagnosis boundaries. |
| Hypertension and diabetes tracking | `README.md`, `src/healthStandards.ts`, `src/vitalAssessment.ts`, export builders | PASS | The app tracks blood pressure and glucose, includes BP/glucose standard labels, low-glucose and marked-hyperglycemia routing, diabetes-care glucose context, and preserves BP/glucose assessments in Markdown, CSV, caregiver HTML, and care queue paths. |
| Document retention and lifecycle | `src/storage.ts`, `src/App.tsx`, `README.md`, `src/backupState.ts`, `src/backupState.test.ts` | PASS | Saved documents support category/status/filtering, next actions, history, recoverable deletion, attachment status, reattachment, sandbox-copy metadata, SQLite/localStorage/memory persistence, JSON backup/import, and local-path sanitization. `npm run backup:rag:smoke` now verifies parsed HWPX document text survives backup/import path stripping, restored filenames are marked for reattachment, and the preserved parsed body still ranks into source-grounded RAG context and answer drafts. |
| Document parsing from attachments | `src/documentAttachmentParsing.ts`, `src/documentHwpxText.ts`, `src/documentHwpxText.test.ts`, `src/documentTauriAttachmentParsing.ts`, `src-tauri/src/lib.rs`, `src/documentAttachmentParsing.test.ts` | PASS | Browser path parses text-like files and HWPX preview/section XML, and now orders multi-section HWPX `Contents/section*.xml` body files numerically so `section10.xml` does not precede `section2.xml`. A synthetic medical HWPX section-XML regression proves cervical-cancer, hypertension, and diabetes terms can flow from parsed HWPX bytes into source-grounded RAG evidence chunks and an answer draft without leaking local paths. Tauri path accepts HWP/HWPX/HWPML and invokes the Rust command `parse_hwp_attachment_text`; Rust uses `hwarang::extract_text_from_file`, normalizes text, and fails closed on missing or empty parsed text. |
| rhwp/HWP external evidence | `docs/parser-candidates/hwarang-unhwp-rust-ab-2026-06-11.md`, `docs/parser-candidates/hwarang-unhwp-rust-ab-2026-06-11.json`, `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs` | PASS | `hwarang@0.2.0` was adopted from the rhwp ecosystem with an MIT license note and a public `edwardkim/rhwp` `KTX.hwp` command-gated sample. |
| Real user/private HWP/HWPX sample smoke | `scripts/smoke_hwp_sample.sh`, `scripts/test_hwp_sample_smoke.sh`, `npm run hwp:smoke`, `npm run hwp:smoke:test`, `npm run hwp:synthetic:smoke`, `src-tauri/src/lib.rs` | BLOCKED | The command-only private-sample harness now runs the same Tauri Rust parser boundary for either one `CAREVAULT_HWP_SAMPLE_PATH` file or a `CAREVAULT_HWP_SAMPLE_DIR` batch of `.hwp/.hwpx/.hwpml` files, with optional expected-term gates, basename-only output, and optional `CAREVAULT_HWP_SMOKE_REPORT_PATH` success evidence. The report records schema/status, sample count, minimum parsed character threshold, expected-term flag, and per-sample basename/extension/status only. The shell fixture test verifies directory discovery, single-file mode, empty-directory failure, unsupported-extension failure, missing-report-parent failure before cargo runs, path-plus-directory conflict failure, missing-input failure, no full local path output, and no sample directory path in the JSON report. `npm run hwp:synthetic:smoke` covers a generated medical HWPX parser-to-RAG regression, but a real user/private medical HWP/HWPX sample has still not been supplied or executed, so this remains blocked for a full completion claim. |
| Search/RAG-like use of parsed documents | `src/App.tsx`, `src/storage.ts`, `src/storage.test.ts`, `src/careActionQueue.ts`, `src/careActionQueue.test.ts`, `src/documentKnowledge.ts`, `src/documentFilterActions.ts`, `src/documentParserAudit.ts`, `src/documentRagContext.ts`, `src/documentRagReadiness.ts`, `src/documentRagReadiness.test.ts`, `src/documentRagModelRequest.ts`, `src/documentRagModelRequest.live.test.ts`, `src/documentRagEmbeddingRequest.ts`, `src/documentRagEmbeddingRequest.live.test.ts`, `scripts/smoke_rag_model.sh`, `scripts/smoke_rag_embedding.sh`, `scripts/doctor_ollama_runtime.sh`, `scripts/smoke_ollama_rag.sh`, `package.json`, README | PARTIAL | Parsed attachment bodies are inserted into saved document text, then used by local relevance-ranked lexical search, clinical-signal quick-search buttons, patient-facing/domain alias expansion, multi-token document filtering, parser provenance terms, deterministic local vector-similarity scoring, fail-closed evidence-quality summaries and warnings, prompt-like document instruction boundary warnings that keep original text as evidence while downgrading quality to review-needed, local-path-sanitized source snippets, clinician-question drafts with focused parsed-document excerpts and parser provenance, local RAG-context copy/download packets with profile-based query fallback, query-coverage scoring, source-boundary wording, fail-closed model handoff prompts for source-grounded external AI use, in-app source-grounded answer drafts with citation lines and insufficient-evidence fallback wording, optional OpenAI-compatible localhost/127.0.0.1/[::1]-only model request execution with remote-endpoint blocking, sanitized endpoint-error reporting, document-instruction isolation in the local model system prompt, unsafe local model response blocking for direct diagnosis/prescription/treatment or medication-change instructions, no-request insufficient-evidence gating, command-only live local model smoke harness, optional localhost-only embedding request/ranking execution from the Document RAG card, command-only live embedding smoke harness, a Document RAG readiness status that separates usable deterministic local document evidence from optional model/embedding endpoint setup and sanitized Ollama runtime failures, a direct Ollama runtime doctor that prints the local CLI/client and Homebrew package snapshot while isolating model-worker failures from CareVault RAG request construction, and a one-command temporary Ollama wrapper smoke that runs both model and embedding gates. The normalized SQLite mirror also stores alias-expanded `care_documents.search_text` for parsed-document clues, so readback searches such as `당화혈색소` can count documents whose parsed body contains `HbA1c`, hypertension, cervical-cancer, or HWPX parser provenance terms. When an active saved document has parsed cervical-cancer, hypertension, or diabetes clues but no manual next action yet, the care queue now promotes those clues into a clinician-question detail, includes source-grounded blood-pressure/HbA1c/glucose measurement cues as original-record context, and preserves them in copied clinic-prep queue text; document-derived queue details also strip embedded macOS and Windows local paths before display or copying. Saved-document status/next-action handoff lines, source-grounded care-brief lines, sanitized query labels, visit-summary Markdown and caregiver HTML sections, and CSV `document_rag_evidence` rows include ranked parsed-body evidence chunks for matched saved documents. Long parsed chunks are exported as focused excerpts around matched query or clinical terms instead of whole long HWP paragraphs. This is useful local retrieval/context packaging, deterministic answer drafting, readiness/status separation, local-model request plumbing, in-app embedding request/ranking plumbing, normalized SQLite readback search, care-queue use of parsed document clues and measurement cues, and prompt handoff. A real Ollama endpoint was reached with `llama3.2:1b` and `bge-m3:latest`, but direct Ollama doctor plus CareVault model/embedding smokes show model/embedding output is still blocked because the local Homebrew Ollama `0.30.7` runtime returns HTTP 500 for a missing `llama-server` binary. Do not overclaim it as complete model-backed RAG. |
| Clinical signal extraction from parsed documents | `src/documentKnowledge.ts`, `src/documentKnowledge.test.ts`, `src/documentParserAudit.ts`, `src/documentParserAuditClipboard.ts` | PASS | The app detects cervical-cancer, hypertension, diabetes, and HWP/HWPX signals from saved document fields and parsed bodies; it now extracts blood-pressure, HbA1c, and glucose measurement cues as original-record context for care-team question drafts without interpreting, diagnosing, prescribing, or treating; parser-audit reports summarize source and clinical-signal coverage while avoiding diagnosis/treatment wording. |
| Parsed-document use in exports | `src/visitPacket.ts`, `src/caregiverExport.ts`, `src/csvExport.ts`, `src/exportTextSanitizer.ts`, `src/backupState.ts`, `src/csvExport.test.ts`, `src/visitPacket.test.ts`, `src/caregiverExport.test.ts`, README | PASS | Parser source and clinical-signal summaries now flow into visit-summary Markdown, caregiver HTML, CSV rows/labels, and backup export/import scope summaries; visit-summary Markdown, caregiver HTML, and CSV `document_rag_evidence` rows also include chunk-ranked document RAG evidence with saved-document status, next-action handoff lines, and focused long-chunk excerpts. `npm run backup:exports:smoke` verifies restored parsed-document RAG evidence and parsed-document care queue question details appear in CSV, visit-summary Markdown, and caregiver HTML while local attachment paths remain excluded, including macOS and Windows local path strings embedded in document notes. |
| Local storage and backup safety | `src/storage.ts`, `src/storage.test.ts`, `src/backupState.ts`, tests | PASS | The app uses SQLite in Tauri, localStorage in browser preview, memory fallback when storage is unavailable, sanitized JSON backup/import, reattachment boundaries, local path exclusion from exports/backups, and a migrated normalized `care_documents.search_text` column for alias-expanded document search readback. |
| Local command verification without browser/cmux | recent slice gates in `working.md`; package scripts; Rust tests | PASS | Recent pushed state was verified with `npm test`, `npm run build`, `cargo test --manifest-path src-tauri/Cargo.toml`, the external HWP command gate, `npm run runtime:doctor`, and gitleaks scans. No cmux/browser QA was used. |
| Production medical readiness | source-backed templates, non-diagnosis wording, local-only app scope | PARTIAL | The app is positioned as record keeping and clinic-prep support, not diagnosis/treatment. Full medical readiness still requires clinician/source review on real patient workflows and current clinical source policy. |

## Verification Evidence Available Before This Audit

The latest pushed source state before this audit was `2f51e2d Add parser audit
backup summaries`. Its post-push evidence recorded in `working.md` includes:

- `npm test`: 71 files / 1095 tests
- `npm run build`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- External rhwp sample command gate:
  `CAREVAULT_HWP_SAMPLE_URL=https://raw.githubusercontent.com/edwardkim/rhwp/main/samples/basic/KTX.hwp CAREVAULT_HWP_SAMPLE_TERMS='KTX 노선도,서울,용산,광명' cargo test --manifest-path src-tauri/Cargo.toml hwp_parser_command_parses_external_sample_when_env_is_set -- --nocapture`
- `npm run runtime:doctor`
- staged, commit-range, and tracked archive `gitleaks` scans

This audit slice was locally verified before commit with:

- `bash -n scripts/smoke_rag_model.sh`
- `npm run rag:model:smoke -- --help`
- `npm run rag:model:smoke`: fail-closed exit 2 without endpoint env
- `CAREVAULT_RAG_MODEL_ENDPOINT=https://api.example.com/v1/chat/completions CAREVAULT_RAG_MODEL_NAME=blocked npm run rag:model:smoke`: fail-closed exit 2 before request
- `npm test -- src/documentRagModelRequest.test.ts src/documentRagModelRequest.live.test.ts`: 7 passed / 1 skipped
- `CAREVAULT_RAG_MODEL_ENDPOINT=http://127.0.0.1:11434/v1/chat/completions CAREVAULT_RAG_MODEL_NAME=llama3.2:1b npm run rag:model:smoke`: reached the local Ollama endpoint but failed with HTTP 500 because the local runtime could not start `llama-server`; the surfaced endpoint error stripped local filesystem paths
- `npm test -- src/documentRagEmbeddingRequest.test.ts src/documentRagEmbeddingRequest.live.test.ts`: 4 passed / 1 skipped
- `npm run rag:embedding:smoke -- --help`
- `npm run rag:embedding:smoke`: fail-closed exit 2 without endpoint env
- `CAREVAULT_RAG_EMBEDDING_ENDPOINT=https://api.example.com/v1/embeddings CAREVAULT_RAG_EMBEDDING_MODEL=blocked npm run rag:embedding:smoke`: fail-closed exit 2 before request
- `CAREVAULT_RAG_EMBEDDING_ENDPOINT=http://127.0.0.1:11434/v1/embeddings CAREVAULT_RAG_EMBEDDING_MODEL=bge-m3:latest npm run rag:embedding:smoke`: reached the local Ollama endpoint but failed with HTTP 500 because the local runtime could not start `llama-server`; the surfaced endpoint error stripped local filesystem paths
- `npm test -- src/documentRagEmbeddingRequest.test.ts src/documentRagEmbeddingRequest.live.test.ts src/documentRagModelRequest.test.ts src/documentRagModelRequest.live.test.ts`: 11 passed / 2 skipped
- `bash -n scripts/smoke_ollama_rag.sh`
- `npm run rag:ollama:smoke -- --help`
- `npm run rag:ollama:smoke`: started a temporary localhost Ollama server, found `llama3.2:1b` and `bge-m3:latest`, ran both existing model and embedding smokes, and failed with sanitized HTTP 500 output because Ollama could not start `llama-server`; the temporary listener was cleaned up afterward
- `bash -n scripts/doctor_ollama_runtime.sh`
- `npm run rag:ollama:doctor -- --help`
- `npm run rag:ollama:doctor`: printed the local Ollama command/client snapshot and Homebrew package `ollama 0.30.7`, started a temporary localhost Ollama server, reached `/api/version`, listed `llama3.2:1b` and `bge-m3:latest`, then failed minimal direct chat and embedding requests with sanitized HTTP 500 output and an explicit missing-`llama-server` diagnosis; this proves the blocker is below CareVault's RAG request construction
- `npm run rag:readiness:smoke`: 4 files / 35 tests; verifies the Document RAG readiness status keeps deterministic local evidence use available when optional endpoints are unset, treats model-backed RAG as ready only when both local model and embedding requests are ready, blocks remote endpoints, and surfaces Ollama `llama-server` failures without leaking local filesystem paths
- `npm run rag:safety:smoke`: 2 files / 26 tests; verifies prompt-like or command-like text inside parsed documents downgrades evidence quality to review-needed, surfaces a visible warning, keeps local paths sanitized, carries a do-not-follow-original-instructions rule into both the local model handoff and OpenAI-compatible system prompt, and blocks unsafe local model responses before showing direct medical instructions
- `npm test -- src/documentRagModelRequest.test.ts src/documentRagModelRequest.live.test.ts src/documentRagReadiness.test.ts`: 2 files passed / 1 skipped; 15 tests passed / 1 skipped
- `npm run hwp:smoke:test`: verifies the private HWP/HWPX smoke harness supports basename-only single-file and directory-batch modes, writes optional basename-only JSON success evidence, rejects a missing report parent before cargo runs, rejects empty directories, rejects unsupported extensions without printing the source directory path, rejects path-plus-directory ambiguity, and fails closed when neither input is provided
- `npm run hwp:smoke -- --help`: documents `CAREVAULT_HWP_SMOKE_REPORT_PATH` and the basename-only report boundary
- `npm run hwp:smoke`: expected fail-closed exit 2 when neither `CAREVAULT_HWP_SAMPLE_PATH` nor `CAREVAULT_HWP_SAMPLE_DIR` is set
- `npm run sqlite:search:smoke`: 2 files / 26 tests; verifies normalized SQLite document rows store alias-expanded parsed-document search text for patient-facing terms such as `당화혈색소`
- `npm run care:queue:smoke`: 2 files / 42 tests; verifies parsed clinical document clues become care-queue question details when manual next action is empty and document-derived queue details strip embedded local paths
- `npm run care:queue:smoke`: 2 files / 43 tests in the document-measurement slice; verifies parsed blood-pressure/HbA1c measurement cues appear as original-record context in document-derived clinic-prep queue details without diagnosis/treatment wording
- `npm run sqlite:search:smoke`: 2 files / 27 tests in the document-measurement slice; verifies source-grounded measurement extraction keeps document knowledge search regressions green
- `npm test -- src/documentKnowledge.test.ts src/careActionQueue.test.ts`: 2 files / 43 tests in the document-measurement slice
- `npm run hwp:synthetic:smoke`: parses generated HWPX section XML care-note fixtures, verifies multi-section HWPX body XML uses numeric section order, verifies cervical-cancer, hypertension, and diabetes cues become parsed text, ranked RAG evidence chunks, and a source-grounded answer draft, and verifies local paths are stripped; 3 files / 25 tests in the instruction-boundary slice
- `npm run backup:rag:smoke`: verifies backup/import sanitization strips local attachment paths while preserving parsed document body text for ranked RAG context and source-grounded answer drafts
- `npm run backup:exports:smoke`: 3 files / 120 tests; verifies restored parsed-document RAG evidence and parsed-document care queue question details appear in CSV, visit-summary Markdown, and caregiver HTML without local attachment paths
- `npm run typecheck`
- `git diff --check`
- `gitleaks dir scripts --no-banner --redact`; `gitleaks dir docs/completion-audits --no-banner --redact`; `gitleaks dir README.md --no-banner --redact`; `gitleaks dir working.md --no-banner --redact`
- `npm test`: 75 files passed / 2 files skipped; 1152 tests passed / 2 skipped
- `npm run build`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- The external rhwp `KTX.hwp` command gate above
- `npm run runtime:doctor`

## Remaining Gaps

1. BLOCKED: Real user/private HWP/HWPX smoke is still not executed. The repo now
   has `npm run hwp:smoke` for `CAREVAULT_HWP_SAMPLE_PATH` or
   `CAREVAULT_HWP_SAMPLE_DIR`, optional
   `CAREVAULT_HWP_SAMPLE_TERMS`, optional basename-only
   `CAREVAULT_HWP_SMOKE_REPORT_PATH` success evidence, and the same Tauri Rust parser command boundary,
   but a real private medical sample has not been supplied or run. A public rhwp
   sample proves the command boundary and parser integration, but not the user's
   likely private medical document shapes.
2. PARTIAL: Search is local relevance-ranked lexical/provenance/signal retrieval
   with snippets, focused parsed-document clinician-question drafts, chunk-ranked
   RAG-context packets, deterministic local vector-similarity scoring, fail-closed
   evidence-quality summaries and warnings, prompt-like document instruction
   boundary warnings, unsafe local model response blocking, in-app source-grounded answer drafts,
   localhost/127.0.0.1/[::1]-only OpenAI-compatible model request plumbing,
   command-only live local model smoke harness, localhost-only embedding
   request/ranking plumbing from the Document RAG card, command-only live embedding smoke harness,
   Document RAG readiness status that preserves the distinction between usable deterministic local evidence and optional live runtime setup, direct Ollama runtime doctor for minimal chat/embedding probes,
   one-command temporary Ollama wrapper smoke for both local RAG gates,
   fail-closed model handoff prompts, local model system-prompt instruction
   isolation, local model response safety gate, focused long-chunk excerpts,
   status/next-action handoff lines, source-grounded care-brief lines,
   visit-summary RAG evidence sections, CSV
   `document_rag_evidence` rows, and caregiver HTML RAG evidence sections. It
   now reaches an actual local Ollama endpoint for both chat and embeddings, but
   the live smokes fail because the local Homebrew Ollama `0.30.7` runtime
   cannot start `llama-server`; it is still not fully live model-backed RAG.
3. PARTIAL: No browser/cmux UI QA was run because of the user constraint. Local
   command verification is the valid evidence surface for this session.
4. PARTIAL: Clinical content is source-backed and guarded against diagnosis or
   treatment instructions, but deployment-quality medical accuracy still needs
   clinician/source review with real workflows.

## Completion Decision

Do not mark the active goal complete yet.

The repo has strong concrete coverage for document storage, parsing, search-like
retrieval, deterministic local vector-similarity scoring, local chunk-ranked
RAG-context packaging, fail-closed evidence-quality summaries and warnings,
in-app source-grounded answer drafts, localhost/127.0.0.1/[::1]-only model request plumbing,
in-app localhost-only embedding request/ranking plumbing,
fail-closed model handoff prompts, source-grounded care-brief lines,
visit-summary, CSV, and caregiver HTML evidence surfaces with status/next-action handoff lines, export/use paths, cervical-cancer care preparation, and
hypertension/diabetes tracking. The remaining blocker is a real user/private
HWP/HWPX sample smoke, plus fixing the local Ollama/runtime endpoint enough for
`npm run rag:ollama:doctor`, `npm run rag:ollama:smoke`, `npm run rag:model:smoke`, and
`npm run rag:embedding:smoke` to receive real model output if the optional
model-backed RAG path is required beyond deterministic local drafting.
