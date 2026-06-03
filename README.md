# CareVault

Tauri v2 + React + TypeScript personal health tracking app.

CareVault is a local-first health notebook for manually tracking:

- blood pressure and blood glucose readings
- lab results with user-entered reference ranges
- adult BMI from age/sex/height/weight profile data
- diabetes and hypertension follow-up context
- hospital visits and next appointments
- treatment symptom and side-effect diary
- pre-visit clinical question planner
- cancer-care nutrition checks
- dated medical document notes such as labs, imaging, pathology, prescriptions, and visit notes
- document attachment lifecycle controls with Tauri sandbox-copy selection and browser filename fallback
- clinician visit summary export as a Markdown packet

This is not a diagnostic or treatment app. It is a structured personal record and dashboard for preparing better clinical conversations.

## Current Slice

- React dashboard with localStorage persistence
- Tauri SQLite `app_state` persistence with browser localStorage fallback
- Recharts trend chart for BP/glucose
- full-state JSON backup export/import
- dated cancer-care symptom and question tracking
- lab value range tracking for manual cancer-care records
- document attachment preparation, opening, removal, and document deletion through Tauri dialog/fs plugins
- Markdown visit summary export for clinical conversations
- pure TypeScript health rule module in `src/healthRules.ts`
- Vitest coverage for BMI, BP, glucose, cancer-food rules, lab flags, and visit packet generation
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

Visit summaries are generated as local Markdown downloads. They include recent vitals, labs, symptoms, questions, visits, document notes, attachment filenames, and the current food-check query, but they intentionally exclude local attachment paths.

The next durable app slice should normalize vitals, visits, documents, and food checks into separate SQLite tables, then add attachment preview, missing-file recovery, and per-document audit history.
