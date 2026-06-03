# CareVault

Tauri v2 + React + TypeScript personal health tracking app.

CareVault is a local-first health notebook for manually tracking:

- blood pressure and blood glucose readings
- adult BMI from age/sex/height/weight profile data
- diabetes and hypertension follow-up context
- hospital visits and next appointments
- treatment symptom and side-effect diary
- pre-visit clinical question planner
- cancer-care nutrition checks
- dated medical document notes such as labs, imaging, pathology, prescriptions, and visit notes

This is not a diagnostic or treatment app. It is a structured personal record and dashboard for preparing better clinical conversations.

## Current Slice

- React dashboard with localStorage persistence
- Tauri SQLite `app_state` persistence with browser localStorage fallback
- Recharts trend chart for BP/glucose
- full-state JSON backup export/import
- dated cancer-care symptom and question tracking
- pure TypeScript health rule module in `src/healthRules.ts`
- Vitest coverage for BMI, BP, glucose, and cancer-food rules
- research archive:
  `/Users/wj/Ai/System/12_Research/CareVault_Health_Tauri_2026-06-03`

## Development

```bash
npm install
npm run test
npm run build
npm run tauri dev
```

## Next Storage Slice

The app now uses SQLite when it runs inside Tauri and falls back to localStorage in a browser preview. The next durable app slice should normalize vitals, visits, documents, and food checks into separate SQLite tables and store document attachments under the app data directory.
