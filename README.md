# CareVault

Tauri v2 + React + TypeScript personal health tracking app.

CareVault is a local-first health notebook for manually tracking:

- blood pressure and blood glucose readings
- lab results with user-entered reference ranges and common CBC/diabetes presets
- adult BMI from age/sex/height/weight profile data
- diabetes and hypertension follow-up context
- hospital visits and next appointments
- treatment symptom and side-effect diary
- pre-visit clinical question planner with lab-result follow-up prompts
- care action queue that surfaces open questions, abnormal or reference-missing labs, active document actions, and upcoming visits
- cancer-care nutrition checks
- dated medical document notes such as labs, imaging, pathology, prescriptions, and visit notes with text/category/status filtering
- per-document review status and next-action tracking with in-list updates for clinical follow-up
- per-document audit history for saved records, review status changes, next-action edits, and attachment removal
- recoverable document deletion through an in-app deleted-document archive
- document attachment lifecycle controls with Tauri sandbox-copy selection and browser filename fallback
- clinician visit summary export as a Markdown packet with selectable 7/30/90/all-record date range

This is not a diagnostic or treatment app. It is a structured personal record and dashboard for preparing better clinical conversations.

## Current Slice

- React dashboard with localStorage persistence
- Tauri SQLite `app_state` persistence with browser localStorage fallback
- Recharts trend chart for BP/glucose
- full-state JSON backup export/import
- dated cancer-care symptom and question tracking
- lab value range tracking for manual cancer-care records with WBC, ANC, hemoglobin, platelet, A1C, and fasting-glucose presets
- one-click follow-up question creation from out-of-range or reference-missing lab results
- dashboard care action queue for pre-visit review of questions, labs, documents, and upcoming visits
- document review status and next-action tracking with in-list updates and category/status filtering
- document audit history shown on each saved record for recent review/action/attachment changes
- deleted-document archive with restore controls so manual medical notes are not immediately lost
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

Document history is stored with each saved document and is used as an in-app audit trail for recent manual changes. It is not a legal medical record, but it helps users see how a document's review state, next action, attachment state, or archive/restore state changed over time.

Document deletion is recoverable: deleting a saved note moves it to an in-app deleted-document archive and keeps its text, metadata, attachment reference, and history available for restore.

The next durable app slice should normalize vitals, visits, documents, and food checks into separate SQLite tables, then add attachment preview, missing-file recovery, and stronger long-term archive management.
