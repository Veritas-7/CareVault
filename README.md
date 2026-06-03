# CareVault

Tauri v2 + React + TypeScript personal health tracking app.

CareVault is a local-first health notebook for manually tracking:

- blood pressure and blood glucose readings
- lab results with user-entered reference ranges and common CBC/diabetes presets
- adult BMI from age/sex/height/weight profile data
- diabetes and hypertension follow-up context
- hospital visits and next appointments
- treatment symptom and side-effect diary
- side-effect meal-note and clinician-question templates for common cancer-treatment symptoms
- pre-visit clinical question planner with lab-result follow-up prompts
- care action queue that surfaces open questions, abnormal or reference-missing labs, active document actions, and upcoming visits
- cancer-care nutrition checks
- dated medical document notes such as labs, imaging, pathology, prescriptions, and visit notes with text/category/status filtering
- per-document review status and next-action tracking with in-list updates for clinical follow-up
- per-document audit history for saved records, review status changes, next-action edits, and attachment removal
- recoverable document deletion through an in-app deleted-document archive
- deleted-document archive attachment cleanup that preserves restorable text records while clearing retained file links
- attachment availability checks that mark saved files as found, missing, failed, or filename-reference-only
- attachment open-failure recovery guidance that records missing or failed sandbox copies and points users to reattach
- saved-document attachment and reattachment controls without recreating the manual note
- saved-document image attachment preview without uploading or exporting medical files
- normalized SQLite mirror tables for profile, vitals, visits, documents, document attachments, document history, symptoms, questions, labs, and current food check
- normalized SQLite mirror read status for runtime verification after saves
- normalized SQLite search count readback across documents, labs, questions, symptoms, visits, vitals, and food checks
- document attachment lifecycle controls with Tauri sandbox-copy selection and browser filename fallback
- clinician visit summary export as a Markdown packet with selectable 7/30/90/all-record date range

This is not a diagnostic or treatment app. It is a structured personal record and dashboard for preparing better clinical conversations.

## Current Slice

- React dashboard with localStorage persistence
- Tauri SQLite `app_state` persistence with browser localStorage fallback
- Recharts trend chart for BP/glucose
- full-state JSON backup export/import
- dated cancer-care symptom and question tracking
- local symptom support templates for nausea, mouth sores, diarrhea, constipation, and fatigue
- lab value range tracking for manual cancer-care records with WBC, ANC, hemoglobin, platelet, A1C, and fasting-glucose presets
- one-click follow-up question creation from out-of-range or reference-missing lab results
- dashboard care action queue for pre-visit review of questions, labs, documents, and upcoming visits
- document review status and next-action tracking with in-list updates and category/status filtering
- document audit history shown on each saved record for recent review/action/attachment changes
- deleted-document archive with restore controls so manual medical notes are not immediately lost
- deleted-document archive attachment cleanup for clearing retained attachments without losing the archived note
- saved attachment status checks with document-history entries for found/missing/reference-only files
- saved attachment missing/open-failure recovery guidance with document-history entries and an in-card reattachment prompt
- saved-document attachment replacement with document-history entries
- saved-document image attachment preview for JPG, PNG, and WebP files
- expanded normalized SQLite mirror for core health records, symptoms, questions, and labs while keeping JSON `app_state` compatibility
- normalized SQLite mirror tables for attachment metadata and document history without storing local attachment paths
- SQLite mirror row-count readback shown in the app after Tauri saves
- Tauri-only normalized SQLite search count readback for the saved-document search term
- document attachment preparation, opening, removal, and document deletion through Tauri dialog/fs plugins
- Markdown visit summary export for clinical conversations with a selectable date range
- pure TypeScript health rule module in `src/healthRules.ts`
- Vitest coverage for BMI, BP, glucose, cancer-food rules, lab flags, lab prompts, and visit packet generation
- research archive:
  `/Users/wj/Ai/System/12_Research/CareVault_Health_Tauri_2026-06-03`

## Development

```bash
npm install
npm run test
npm run build
npm run tauri dev
```

## Storage Notes

The app now uses SQLite when it runs inside Tauri and falls back to localStorage in a browser preview. Document selection uses Tauri dialog `fileAccessMode: "copy"` in desktop runtime so the selected file is copied into the app sandbox and the copied path is stored as document metadata. Saved documents can remove an attachment or delete the whole document; Tauri runtime attempts to remove the copied sandbox file before clearing metadata. Browser preview stores only a filename reference.

Visit summaries are generated as local Markdown downloads. They include the selected 7/30/90-day or all-record range of vitals, labs, symptoms, questions, visits, document notes, document review status, next actions, attachment filenames, and the current food-check query, but they intentionally exclude local attachment paths. Lab presets are input helpers only; the app keeps the entered range editable because medical labs can use different reference ranges.

The dashboard care action queue is a derived view only. It does not create new medical advice; it gathers open questions, low/high/reference-missing labs, unfinished document actions, and future visits into a short pre-visit checklist.

Symptom support templates are local keyword prompts only. They suggest meal-note candidates and fill the question draft for clinician review; they do not save a question automatically or create treatment instructions.

Document history is stored with each saved document and is used as an in-app audit trail for recent manual changes. It is not a legal medical record, but it helps users see how a document's review state, next action, attachment state, or archive/restore state changed over time.

Document deletion is recoverable: deleting a saved note moves it to an in-app deleted-document archive and keeps its text, metadata, attachment reference, and history available for restore.

Deleted-document archive cards can clear only the retained attachment link and sandbox copy while keeping the archived text note and history restorable. This gives long-term attachment cleanup a separate path from deleting or restoring the medical note itself.

Saved attachment checks update the document card without reading or uploading medical file contents. Tauri runtime checks the sandbox copy path; browser preview keeps filename-reference-only status.

Opening a saved Tauri attachment first verifies that the sandbox copy still exists. If the file is missing or the opener request fails, the app records a document-history entry, marks the card as needing reattachment, and leaves the saved note intact.

Saved documents can attach or reattach a file from the existing card. Tauri runtime uses sandbox-copy selection again; browser preview refreshes the filename reference. The text note and document history stay intact.

Saved image attachments can be previewed from the document card. Tauri runtime uses the app asset protocol for sandbox-copied JPG, PNG, and WebP files after file selection has placed them in scope. Browser preview uses a temporary object URL for image files selected in the current session only; it still does not persist file contents.

Tauri SQLite saves still keep the compatible JSON `app_state` row, and now also mirror profile, vitals, visits, active/deleted documents, attachment metadata, document history, symptoms, questions, lab results, and the current food check into normalized tables. The mirror is snapshot-style and wrapped in a SQLite transaction. Attachment mirror rows intentionally store filename, storage mode, status, and deleted-state only, not local copied paths. After Tauri saves, the app reads normalized row counts back from SQLite and shows the mirror status in the sidebar. When a Tauri user searches saved documents, the same search term is also counted across normalized documents, labs, questions, symptoms, visits, vitals, food checks, attachment metadata, and document history as a read-path verification signal. Browser preview continues to use localStorage only.

The next durable app slice should add next-appointment reminders or CSV/JSON export.
