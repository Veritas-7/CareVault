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
| Continue the live CareVault target, not a stale handoff | Goal guard for thread `019eb4ff-957f-7173-8897-b1e24508f7ea`; live repo at `/Users/wj/Ai/System/10_Projects/CareVault`; `working.md`; `src/carevaultObjectiveReadiness.ts`; `src/carevaultObjectiveReadiness.test.ts` | PASS | Persisted objective and current goal match CareVault. `/Users/wj/Downloads/working.md/CareVault.txt` was checked and found stale, so current repo state is the source of truth. `npm run objective:readiness:smoke` now maps the active prompt themes to concrete artifacts and keeps completion blocked while private HWP/HWPX sample and clinician/source review requirements remain unresolved. |
| Apply AutoResearch philosophy | `docs/parser-candidates/*.md`, `working.md`, focused and full gates in recent slices | PASS | Parser candidates were handled with evidence files, A/B notes, fail-closed adoption, source labels, command gates, and incremental commits. Completion is not claimed until this mapping and remaining gaps are explicit. |
| Cervical-cancer care support | `README.md`, `src/*cervical*`, source-backed warning templates, care queue/export paths | PASS | README feature coverage documents extensive NCC cervical-cancer care notes, warning-record field cards, screening and diagnostic-test prompts, pathology/stage/treatment/follow-up/side-effect templates, official-source links, and non-diagnosis boundaries. |
| Hypertension and diabetes tracking | `README.md`, `src/healthStandards.ts`, `src/vitalAssessment.ts`, export builders | PASS | The app tracks blood pressure and glucose, includes BP/glucose standard labels, low-glucose and marked-hyperglycemia routing, diabetes-care glucose context, and preserves BP/glucose assessments in Markdown, CSV, caregiver HTML, and care queue paths. |
| Clinical source registry, URL reachability, and review packet | `src/clinicalSourceRegistry.ts`, `src/clinicalSourceRegistry.test.ts`, `src/clinicalReviewPacket.ts`, `src/clinicalReviewPacket.test.ts`, `src/clinicalWorkflowReview.ts`, `src/clinicalWorkflowReview.test.ts`, `src/healthStandards.ts`, `src/healthRules.ts`, `scripts/smoke_clinical_source_urls.sh`, `package.json`, README | PASS | The app now has a combined clinical source registry for health standards and food guidance plus deterministic clinician/source and workflow review packets. Static tests verify all entries use approved public-health, professional-society, hospital-reference, or food-safety domains, keep the local lab-range sentinel separate, and preserve explicit cervical-cancer, hypertension, and diabetes source coverage. `npm run clinical:sources:smoke` checks 60 deduplicated public HTTPS URLs with `curl`; it caught a stale MFDS HTML URL that returned HTTP 500 and was replaced with the reachable official PDF attachment URL. `npm run clinical:review:smoke` verifies the packet summarizes source counts, approved owners, required clinician/source review checks, real private HWP/HWPX sample blocker, and non-diagnosis boundary without claiming clinical approval. `npm run clinical:workflow:smoke` verifies a synthetic cervical-cancer + hypertension + diabetes parsed-document workflow across RAG context, care queue, visit Markdown, CSV, and caregiver HTML surfaces. These are source-policy/reachability/review-input gates, not a clinician accuracy review. |
| Document retention and lifecycle | `src/storage.ts`, `src/App.tsx`, `README.md`, `src/backupState.ts`, `src/backupState.test.ts` | PASS | Saved documents support category/status/filtering, next actions, history, recoverable deletion, attachment status, reattachment, sandbox-copy metadata, SQLite/localStorage/memory persistence, JSON backup/import, and local-path sanitization. `npm run backup:rag:smoke` now verifies parsed HWPX document text survives backup/import path stripping, restored filenames are marked for reattachment, and the preserved parsed body still ranks into source-grounded RAG context and answer drafts. |
| Document parsing from attachments | `src/documentAttachmentParsing.ts`, `src/documentHwpxText.ts`, `src/documentHwpxText.test.ts`, `src/documentTauriAttachmentParsing.ts`, `src-tauri/src/lib.rs`, `src/documentAttachmentParsing.test.ts` | PASS | Browser path parses text-like files and HWPX preview/section XML, and now orders multi-section HWPX `Contents/section*.xml` body files numerically so `section10.xml` does not precede `section2.xml`. A synthetic medical HWPX section-XML regression proves cervical-cancer, hypertension, and diabetes terms can flow from parsed HWPX bytes into source-grounded RAG evidence chunks and an answer draft without leaking local paths. Tauri path accepts HWP/HWPX/HWPML and invokes the Rust command `parse_hwp_attachment_text`; Rust uses `hwarang::extract_text_from_file`, normalizes text, and fails closed on missing or empty parsed text. |
| rhwp/HWP external evidence | `docs/parser-candidates/hwarang-unhwp-rust-ab-2026-06-11.md`, `docs/parser-candidates/hwarang-unhwp-rust-ab-2026-06-11.json`, `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs` | PASS | `hwarang@0.2.0` was adopted from the rhwp ecosystem with an MIT license note and a public `edwardkim/rhwp` `KTX.hwp` command-gated sample. |
| Real user/private HWP/HWPX sample smoke | `scripts/smoke_hwp_sample.sh`, `scripts/test_hwp_sample_smoke.sh`, `scripts/smoke_objective_readiness_report.sh`, `scripts/test_objective_readiness_report_smoke.sh`, `npm run hwp:smoke`, `npm run hwp:smoke:test`, `npm run objective:readiness:report`, `npm run objective:readiness:report:test`, `npm run hwp:synthetic:smoke`, `src-tauri/src/lib.rs`, `src/carevaultObjectiveReadiness.ts`, `src/carevaultObjectiveReadiness.test.ts`, `src/carevaultObjectiveReadinessReportSmoke.test.ts` | BLOCKED | The command-only private-sample harness now runs the same Tauri Rust parser boundary for either one `CAREVAULT_HWP_SAMPLE_PATH` file or a `CAREVAULT_HWP_SAMPLE_DIR` batch of `.hwp/.hwpx/.hwpml` files, with optional expected-term gates, basename-only output, and optional `CAREVAULT_HWP_SMOKE_REPORT_PATH` success evidence. The report records schema/status, sample count, minimum parsed character threshold, expected-term flag, and per-sample basename/extension/status only. The objective readiness gate now accepts that report as evidence only when schema/status, sample count, positive min-char string, expected-term boolean, passed sample statuses, supported extensions, and basename-only entries all validate; malformed reports, path-like basenames, and mismatched counts remain blocked. `npm run objective:readiness:report` is the command bridge that reads the generated report and proves the readiness status moves to `ready-for-external-review` only when the private-sample evidence is accepted. `npm run objective:readiness:report:test` verifies missing env, missing file, invalid JSON, path-leaking samples, and valid basename-only fixture reports without using a private sample. No real user/private medical HWP/HWPX sample has been supplied or executed in this session, so this remains blocked for a full completion claim. |
| Search/RAG-like use of parsed documents | `src/App.tsx`, `src/storage.ts`, `src/storage.test.ts`, `src/careActionQueue.ts`, `src/careActionQueue.test.ts`, `src/documentKnowledge.ts`, `src/documentFilterActions.ts`, `src/documentParserAudit.ts`, `src/documentRagContext.ts`, `src/documentRagReadiness.ts`, `src/documentRagReadiness.test.ts`, `src/documentRagModelRequest.ts`, `src/documentRagModelRequest.live.test.ts`, `src/documentRagEmbeddingRequest.ts`, `src/documentRagEmbeddingRequest.live.test.ts`, `scripts/smoke_rag_model.sh`, `scripts/smoke_rag_embedding.sh`, `scripts/doctor_ollama_runtime.sh`, `scripts/test_ollama_runtime_doctor.sh`, `scripts/smoke_ollama_rag.sh`, `scripts/test_ollama_rag_smoke.sh`, `package.json`, README | PASS | Parsed attachment bodies are searchable and ranked through deterministic local RAG context, SQLite readback search, source-grounded answer drafts, export/share evidence rows, care-queue clinician-question details, and parsed measurement cues without local path leakage or diagnosis/treatment wording. OpenAI-compatible localhost-only model and embedding plumbing is fail-closed for missing/remote/unsafe cases, with readiness warnings and fake-command fixtures for missing-worker diagnosis. After `brew upgrade ollama` moved the local runtime from `0.30.7` to `0.30.7_1`, `npm run rag:ollama:doctor` returned HTTP 200 for both minimal chat and embedding probes, and `npm run rag:ollama:smoke` passed both `src/documentRagModelRequest.live.test.ts` and `src/documentRagEmbeddingRequest.live.test.ts` against a temporary localhost Ollama server. The local model response safety gate now blocks colloquial Korean medication stop and dose-change instructions while allowing medication-history evidence when framed as a care-team confirmation question. |
| Clinical signal extraction from parsed documents | `src/documentKnowledge.ts`, `src/documentKnowledge.test.ts`, `src/documentParserAudit.ts`, `src/documentParserAuditClipboard.ts` | PASS | The app detects cervical-cancer, hypertension, diabetes, lab-result, and HWP/HWPX signals from saved document fields and parsed bodies; it now extracts blood-pressure, HbA1c, glucose, WBC, ANC, PLT, Hgb, Cr, eGFR, AST, ALT, and Albumin measurement cues as original-record context for care-team question drafts without interpreting, diagnosing, prescribing, or treating; parser-audit reports summarize source and clinical-signal coverage while avoiding diagnosis/treatment wording. |
| Parsed-document use in exports | `src/visitPacket.ts`, `src/caregiverExport.ts`, `src/csvExport.ts`, `src/exportTextSanitizer.ts`, `src/backupState.ts`, `src/csvExport.test.ts`, `src/visitPacket.test.ts`, `src/caregiverExport.test.ts`, README | PASS | Parser source and clinical-signal summaries now flow into visit-summary Markdown, caregiver HTML, CSV rows/labels, and backup export/import scope summaries; visit-summary Markdown, caregiver HTML, and CSV `document_rag_evidence` rows also include chunk-ranked document RAG evidence with saved-document status, next-action handoff lines, and focused long-chunk excerpts. `npm run backup:exports:smoke` verifies restored parsed-document RAG evidence, parsed-document care queue question details, and parsed blood-pressure/HbA1c/WBC/ANC/PLT/Cr/eGFR measurement cues appear in CSV, visit-summary Markdown, and caregiver HTML while local attachment paths remain excluded, including macOS and Windows local path strings embedded in document notes. |
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
- `bash -n scripts/smoke_ollama_rag.sh scripts/test_ollama_rag_smoke.sh`
- `npm run rag:ollama:smoke:test`: fake-command fixture verifies failed child model/embedding smokes are captured, local paths are sanitized, and the wrapper prints the explicit missing-`llama-server` diagnosis
- `npm run rag:ollama:smoke -- --help`
- `npm run rag:ollama:smoke`: started a temporary localhost Ollama server, found `llama3.2:1b` and `bge-m3:latest`, ran both existing model and embedding smokes, and failed with sanitized HTTP 500 output because Ollama could not start `llama-server`; the temporary listener was cleaned up afterward
- `npm run rag:ollama:smoke`: current rerun after `ded410a` still fails because local Ollama `0.30.7` cannot start `llama-server`, but the wrapper now ends with the same explicit missing-worker diagnosis as the direct doctor
- `bash -n scripts/doctor_ollama_runtime.sh`
- `bash -n scripts/doctor_ollama_runtime.sh scripts/test_ollama_runtime_doctor.sh`
- `npm run rag:ollama:doctor:test`: fake-command fixture verifies the doctor reports missing worker layout, missing-worker diagnosis, repair hint, and no local path leakage
- `npm run rag:ollama:doctor -- --help`
- `npm run rag:ollama:doctor`: printed the local Ollama command/client snapshot and Homebrew package `ollama 0.30.7`, started a temporary localhost Ollama server, reached `/api/version`, listed `llama3.2:1b` and `bge-m3:latest`, then failed minimal direct chat and embedding requests with sanitized HTTP 500 output and an explicit missing-`llama-server` diagnosis; this proves the blocker is below CareVault's RAG request construction
- `npm run rag:ollama:doctor`: current rerun after `09c13d2` reports `Ollama worker binary: not found in checked install roots (command directory, Homebrew package prefix)`, then reaches the API and model list but fails chat/embedding with the same sanitized HTTP 500 missing-worker diagnosis and repair hint
- `brew outdated --verbose ollama`: reported `ollama (0.30.7) < 0.30.7_1`
- `brew upgrade ollama`: upgraded the local Homebrew package from `ollama 0.30.7` to `0.30.7_1`
- `npm run rag:ollama:doctor`: after the upgrade, minimal chat and embedding probes both returned HTTP 200, and the temporary listener was cleaned up
- `npm run rag:ollama:smoke`: after the upgrade, both live tests passed: `src/documentRagModelRequest.live.test.ts` and `src/documentRagEmbeddingRequest.live.test.ts`; the temporary listener was cleaned up
- `bash -n scripts/doctor_ollama_runtime.sh scripts/test_ollama_runtime_doctor.sh scripts/smoke_ollama_rag.sh scripts/test_ollama_rag_smoke.sh`
- `npm run rag:ollama:doctor:test` and `npm run rag:ollama:smoke:test`: fixture tests passed after switching `mktemp` templates to suffix-free forms
- `npm run rag:readiness:smoke`: 4 files / 35 tests; verifies the Document RAG readiness status keeps deterministic local evidence use available when optional endpoints are unset, treats model-backed RAG as ready only when both local model and embedding requests are ready, blocks remote endpoints, and surfaces Ollama `llama-server` failures without leaking local filesystem paths
- `npm run rag:safety:smoke`: 2 files / 26 tests; verifies prompt-like or command-like text inside parsed documents downgrades evidence quality to review-needed, surfaces a visible warning, keeps local paths sanitized, carries a do-not-follow-original-instructions rule into both the local model handoff and OpenAI-compatible system prompt, and blocks unsafe local model responses before showing direct medical instructions
- `npm test -- --run src/documentRagModelRequest.test.ts`: 12 tests; verifies direct medication instructions are blocked, source-grounded medication history framed as clinician-confirmation remains allowed, and colloquial Korean medication stop/dose-change instructions are blocked
- `npm run rag:readiness:smoke`: 4 files / 37 tests after the medication-safety hardening
- `npm test -- --run src/clinicalSourceRegistry.test.ts src/healthRules.test.ts`: 2 files / 416 tests; verifies the clinical source registry, MFDS URL replacement, and food-guidance source evidence
- `npm run clinical:sources:smoke`: initially failed 1/60 on the old `https://www.mfds.go.kr/brd/m_99/view.do?seq=50005` URL with HTTP 500, then passed 60/60 after replacing it with the official MFDS PDF attachment URL `https://www.mfds.go.kr/brd/99/down.do?brd_id=ntc0021&data_tp=A&file_seq=2&seq=50005`
- `npm run clinical:review:smoke`: 2 files / 7 tests; verifies the deterministic clinician/source review packet built from the clinical source registry, including cervical-cancer, hypertension, and diabetes highlight sources, approved source owner summaries, required clinician/source review checks, real private HWP/HWPX sample blocker, browser/cmux exclusion, and non-diagnosis boundary
- `npm run clinical:workflow:smoke`: 1 file / 3 tests; verifies a synthetic cervical-cancer + hypertension + diabetes workflow across parsed-document RAG context, document-derived care queue, visit Markdown, CSV, caregiver HTML, and the clinical source review packet while preserving local-path stripping, unsafe-direct-instruction blocking, and explicit unresolved clinician/source plus private HWP/HWPX sample blockers
- Review-packet slice gates: `npm run typecheck`; `git diff --check`; `npm test` passed with 77 files passed, 2 skipped; 1167 tests passed, 2 skipped; `npm run build`; `npm run runtime:doctor`; current-change gitleaks passed for `src`, `docs/completion-audits`, `README.md`, `working.md`, and `package.json`
- Workflow-review slice gates: `npm run typecheck`; `git diff --check`; `npm test` passed with 78 files passed, 2 skipped; 1170 tests passed, 2 skipped; `npm run build`; `npm run runtime:doctor`; `npm run clinical:sources:smoke` passed with 60 URLs checked; current-change gitleaks passed for `src`, `README.md`, `docs/completion-audits`, `working.md`, and `package.json`
- Workflow-review source commit checks: staged paths were only README, completion audit, package script, workflow review source/test, and `working.md`; `git diff --cached --check` passed; staged gitleaks scanned about 24.71 KB with no leaks; source commit `8d93146 Add clinical workflow review smoke` pushed to `origin main`; post-push parity was `0 0`; post-push `npm run clinical:workflow:smoke` passed with 1 file and 3 tests
- Review-packet source commit checks: staged paths were only README, completion audit, package script, review packet source/test, and `working.md`; `git diff --cached --check` passed; staged gitleaks scanned about 17.28 KB with no leaks; source commit `d600f81 Add clinical review packet smoke` pushed to `origin main`; post-push parity was `0 0`; post-push `npm run clinical:review:smoke` passed with 2 files and 7 tests
- `npm run objective:readiness:smoke`: 3 files / 9 tests; verifies the prompt-to-artifact readiness report maps every explicit objective theme to concrete artifacts and keeps the objective blocked until real private HWP/HWPX sample smoke and external clinician/source review evidence exist
- Objective-readiness slice gates: `npm run typecheck`; `git diff --check`; `npm test` passed with 79 files passed, 2 skipped; 1173 tests passed, 2 skipped; `npm run build`; `npm run runtime:doctor`; `npm run clinical:sources:smoke` passed with 60 URLs checked; current-change gitleaks passed for `src`, `README.md`, `docs/completion-audits`, `working.md`, and `package.json`
- Objective-readiness source commit checks: staged paths were only README, completion audit, package script, objective readiness source/test, and `working.md`; `git diff --cached --check` passed; staged gitleaks scanned about 17.99 KB with no leaks; source commit `f31a9ac Add objective readiness smoke` pushed to `origin main`; post-push parity was `0 0`; post-push `npm run objective:readiness:smoke` passed with 3 files and 9 tests
- Data-driven HWP evidence readiness gate: `npm run objective:readiness:smoke` passed with 3 files and 11 tests; verifies valid sanitized basename-only private HWP smoke report evidence can pass the `real-private-hwp-hwpx-sample` requirement without completing clinician/source review, while no-evidence, path-leaking, and sample-count-mismatched reports stay blocked
- Data-driven HWP evidence slice gates: `npm run typecheck`; `git diff --check`; `npm test` passed with 79 files passed, 2 skipped; 1175 tests passed, 2 skipped; `npm run build`; `npm run runtime:doctor`; `npm run clinical:sources:smoke` passed with 60 URLs checked; browser/cmux QA was not used
- Data-driven HWP evidence source commit checks: staged paths were only README, objective readiness source, and objective readiness test; `git diff --cached --check` passed; staged gitleaks scanned about 8.24 KB with no leaks; source commit `a21c5a0 Add HWP smoke evidence readiness gate` pushed to `origin main`; commit-range gitleaks scanned 1 commit/about 8.24 KB with no leaks; post-push parity was `0 0`; post-push `npm run objective:readiness:smoke` passed with 3 files and 11 tests
- HWP readiness report command bridge: `npm run objective:readiness:report:test` passed and verifies missing `CAREVAULT_HWP_SMOKE_REPORT_PATH`, unreadable report, invalid JSON, path-leaking basename, and valid basename-only report cases; `npm run objective:readiness:smoke` still passed with 3 files and 11 tests
- HWP readiness report command bridge slice gates: `npm run typecheck`; `git diff --check`; `npm test` passed with 79 files passed, 3 skipped; 1175 tests passed, 3 skipped; `npm run build`; `npm run runtime:doctor`; browser/cmux QA was not used
- HWP readiness report command bridge source commit checks: staged paths were only README, package script entries, objective readiness report wrapper/test scripts, and the env-gated report smoke test; `git diff --cached --check` passed; staged gitleaks scanned about 7.92 KB with no leaks; source commit `614ee1f Add objective readiness report smoke` pushed to `origin main`; commit-range gitleaks scanned 1 commit/about 7.92 KB with no leaks; post-push parity was `0 0`; post-push `npm run objective:readiness:report:test` passed and `npm run objective:readiness:smoke` passed with 3 files and 11 tests
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
- `npm run backup:exports:smoke`: 3 files / 123 tests; verifies restored parsed-document RAG evidence, parsed-document care queue question details, and parsed blood-pressure/HbA1c/WBC/ANC/PLT/Cr/eGFR measurement cues appear in CSV, visit-summary Markdown, and caregiver HTML without local attachment paths
- `npm test -- src/visitPacket.test.ts src/csvExport.test.ts src/caregiverExport.test.ts`: 3 files / 120 tests in the document-measurement export slice
- `npm test -- src/visitPacket.test.ts src/csvExport.test.ts src/caregiverExport.test.ts`: 3 files / 123 tests in the parsed lab-result export slice
- `npm run care:queue:smoke`: 2 files / 45 tests in the parsed lab-result slice; verifies parsed WBC/ANC/PLT/Cr/eGFR cues become original-record context in document-derived clinic-prep queue details without diagnosis/treatment wording
- `npm run sqlite:search:smoke`: 2 files / 28 tests in the parsed lab-result slice; verifies normalized SQLite document search text includes `검사결과`, `ANC`, and `eGFR` aliases from parsed lab-result documents
- `npm test -- src/documentParserAudit.test.ts src/documentParserAuditClipboard.test.ts src/documentKnowledge.test.ts src/careActionQueue.test.ts src/storage.test.ts`: 5 files / 68 tests in the parsed lab-result slice
- `npm run typecheck`
- `git diff --check`
- `gitleaks dir scripts --no-banner --redact`; `gitleaks dir docs/completion-audits --no-banner --redact`; `gitleaks dir README.md --no-banner --redact`; `gitleaks dir working.md --no-banner --redact`
- `npm test`: 75 files passed / 2 files skipped; 1160 tests passed / 2 skipped after the medication-safety hardening
- `npm run build`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- The external rhwp `KTX.hwp` command gate above
- `npm run runtime:doctor`

## Remaining Gaps

1. BLOCKED: Real user/private HWP/HWPX smoke is still not executed. The repo now
   has `npm run hwp:smoke` for `CAREVAULT_HWP_SAMPLE_PATH` or
   `CAREVAULT_HWP_SAMPLE_DIR`, optional
   `CAREVAULT_HWP_SAMPLE_TERMS`, optional basename-only
   `CAREVAULT_HWP_SMOKE_REPORT_PATH` success evidence, the same Tauri Rust
   parser command boundary, a readiness gate that accepts only a sanitized
   passed report, and `npm run objective:readiness:report` to read that report
   back into the objective readiness status. A real private medical sample has
   not been supplied or run, so no report evidence was accepted for the live
   audit. A public rhwp sample proves the command boundary and parser
   integration, but not the user's likely private medical document shapes.
2. PARTIAL: No browser/cmux UI QA was run because of the user constraint. Local
   command verification is the valid evidence surface for this session.
3. PARTIAL: Clinical content is source-backed, URL-reachability checked, and
   guarded against diagnosis or treatment instructions, but deployment-quality
   medical accuracy still needs clinician/source review with real workflows.

## Completion Decision

Do not mark the active goal complete yet.

The repo has strong concrete coverage for document storage, parsing, search-like
retrieval, deterministic local vector-similarity scoring, local chunk-ranked
RAG-context packaging, fail-closed evidence-quality summaries and warnings,
in-app source-grounded answer drafts, localhost/127.0.0.1/[::1]-only model request plumbing,
in-app localhost-only embedding request/ranking plumbing,
fail-closed model handoff prompts, source-grounded care-brief lines,
visit-summary, CSV, and caregiver HTML evidence surfaces with status/next-action handoff lines, export/use paths, cervical-cancer care preparation, and
hypertension/diabetes tracking. Optional live Ollama-backed RAG is now
command-verified on this machine after the local Homebrew Ollama repair. The
remaining blockers are a real user/private HWP/HWPX sample smoke and
clinician/source review with real workflows before any production medical
readiness claim.
