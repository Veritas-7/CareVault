---
version: alpha
name: CareVault
description: >
  Korean local-first health record dashboard for cancer-care, blood pressure,
  glucose, lab, visit, question, and document preparation workflows. The visual
  promise is calm, private, clinical, and action-oriented rather than decorative.
source:
  input_type: source_project
  checked_at: 2026-06-05
  evidence_root: /Users/wj/Ai/System/10_Projects/CareVault
colors:
  background: "#edf3f2"
  sidebar: "#102326"
  primary: "#0f766e"
  clinicalText: "#0f4c5c"
  warning: "#d97706"
  risk: "#dc5a4a"
typography:
  ui: "\"Pretendard Variable\", Pretendard, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
  mono: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace"
spacing:
  workspace: "30px desktop, 18px mobile"
  panel: "20px"
  gridGap: "18px"
rounded:
  panel: "8px"
  control: "8px"
shadows:
  panel: "0 12px 30px rgba(29, 37, 40, 0.06)"
breakpoints:
  tablet: "1120px"
  mobile: "760px"
components:
  sidebar: "sticky desktop navigation"
  topbar: "export and caregiver-share controls"
  careQueue: "dated cervical/symptom/question/vital/lab/document/visit rows, source chips, visible 진료 큐 복사 affordance"
  profileHelpers: "sex-specific Korean waist helper, standard notes, copy affordance"
  vitalRangeHelper: "BMI, waist, blood pressure, diabetes-care/screening glucose, KDCA low-glucose under 70 mg/dL, KDCA marked-hyperglycemia at 250 mg/dL or higher, A1C, BUN/Cr/eGFR/UACR kidney function, Na/K electrolytes, lipid, HDL, GGT, AST/ALT liver enzymes, Alb/TP protein/nutrition, Ca calcium, P phosphate, UA uric-acid, Hgb, CBC WBC/RBC/Hct/PLT, ANC infection-risk, PLT bleeding-risk, and cancer-patient fever/infection numeric threshold rows with row-level common or sex-specific applicability, quick category filters, plus BP/glucose and fever/infection source-backed question draft shortcuts"
  foodJudgement: "source-backed matched food chips for support, limit, and clinician-check categories plus a source-retaining question-draft shortcut"
  symptomSupport: "source-backed meal-note, symptom-observation, and clinician-question prompts for common cancer-treatment symptoms"
  labPresetPreview: "selected lab helper range and sex-applicability preview"
  cervicalCarePanel: "source-backed priority checklist, cancer-care guidance, profile-based screening quick-check, screening-versus-diagnostic-test prompts, visible source labels on cards and list items, symptom drafts, and copy affordance"
  exportPreview: "visible preview-scoped copy, print, download, close action labels, stale-disabled reasons, text-fit guards, and size summary"
states:
  focus: "3px visible rings"
  status: "aria-live save feedback"
motion:
  policy: "minimal; no decorative motion"
imagery:
  policy: "icons only; no stock medical imagery"
styleArchitecture:
  css: "single App.css with semantic component classes"
layoutMetrics:
  sidebarWidth: "280px"
  minViewportWidth: "320px"
textFit:
  koreanWrap: "long Korean labels wrap inside controls and cards"
tokenExports:
  cssVariables: "future-ready; current tokens documented here"
performance:
  chunks: "Recharts, Lucide, health standards, cervical-care, and export helpers split below Vite warning threshold"
evidence:
  source: "src/App.tsx, src/App.css, src/healthStandards.ts, src/cervicalCancerCare.ts, src/symptomSupportTemplates.ts"
  runtime: "cmux workspace 암관리 right in-app browser at http://127.0.0.1:1420/ and Tauri desktop SQLite readback at tauri://localhost, both served by the current-source 127.0.0.1:1420 dev listener during QA"
---

# DESIGN.md

## Overview

CareVault is a working health-record tool for Korean patients and caregivers who need to prepare clinical conversations from local records. The product should feel like a quiet care workstation: dense enough for repeated use, explicit about medical source boundaries, and calm enough for stressful cancer-care contexts.

## Colors

- Background: `#edf3f2`, a low-chroma clinical green-gray.
- Sidebar: `#102326`, a private dark teal anchor.
- Primary actions: `#0f766e`, used for save/add/export commands.
- Clinical text accent: `#0f4c5c`, used for source labels and secondary emphasis.
- Warning: `#d97706`, used for watch states and cervical warning cards.
- Risk: `#dc5a4a`, used only for risk indicators.

## Typography

- UI and Korean body text must prefer `"Pretendard Variable", Pretendard` before fallback UI fonts.
- Heading scale stays compact because this is an operational dashboard, not a landing page.
- Monospace is reserved for raw export preview content.

## Layout

- Desktop uses a 280px sticky sidebar and a scrollable workspace.
- Main workflows use two-column grids for comparison: profile/chart, records, care-plan, labs, and documents.
- Core user actions stay in the topbar and in each task panel.
- The cervical cancer panel appears above profile inputs when cancer-care mode is active.

## Elevation & Depth

- Panels use a single light shadow and a 1px border.
- Status severity is shown with colored borders or compact marks, not heavy backgrounds.
- Avoid nested decorative cards; nested cards are allowed only for repeated records or task rows.

## Shapes

- Panels, buttons, inputs, cards, and chips use 8px radius.
- Pills are limited to status marks and compact labels.
- Avoid large rounded marketing cards.
- Button `aria-label` and hover title text should use the same action sentence when both are present. Compact desktop actions can be visually small, but must not fall below a 32px hit-target height; mobile keeps the broader 44px contract.

## Components

- Sidebar navigation: icon plus Korean label, 42px minimum height. Each section link must expose a destination-specific `aria-label` and hover title such as `대시보드 섹션으로 이동`, not only the visible label. The visible sidebar order follows the actual scroll order, so each next nav item moves farther down the page. The current click/hash/scroll-backed section uses `aria-current="page"` and a visible active state so users can tell which records area is in focus.
- Topbar: export, backup, caregiver-share, and save controls with immediate status feedback; the topbar manual save control must visibly say `수동 저장` and expose a scoped accessible label/title; visit-summary export/preview labels and status feedback preserve the selected 7/30/90-day/all-record range, the visit-summary export control must visibly say `요약 내보내기`, and stale visit-summary previews must block copy/print/download when the selected range or Markdown-relevant records change until regenerated; CSV export/preview labels and status feedback summarize record count, care-queue maximum, cervical-reference inclusion, food-check inclusion, standards/source rows, and local-path exclusion, the CSV export control must visibly say `CSV 내보내기`, and stale CSV previews must block copy/print/download until regenerated; backup export/import buttons must visibly say `백업` in addition to aria/title scope text; backup export labels and status feedback summarize profile, record count, caregiver-share settings, and attachment filename scope; backup import labels state JSON validation plus replacement and reattachment boundaries, and success feedback repeats imported scope; caregiver-share controls show compact summary chips for preset intent, profile redaction, memo presence, included section count, and excluded section count before preview/export; caregiver-share profile and section toggles must expose their current state and next action in accessible labels/titles; caregiver memo preset buttons must visibly include the action word, such as `식사 적용`, while preset buttons, reset, and preset select expose intent labels/titles and stay at least 40px high in constrained cmux right-pane layouts; caregiver share export/preview button labels plus status feedback preserve the same share-scope summary, the caregiver export control must visibly say `공유본 내보내기`, and stale caregiver previews must block copy/print/download when share settings or shared records change until regenerated, with settings-change alerts taking precedence for settings-only section changes.
- Metric cards: one clinical fact per card, with status border; the profile card must show compact current-sex standard chips for sex-specific waist, HDL, GGT, hemoglobin, and RBC/Hct helpers without repeating adult common BP/glucose standards, each chip's accessible label plus hover title must include its official-source evidence, and the profile card must offer one-click copy for the visible current-sex criteria plus source evidence. BMI, waist, latest blood-pressure, and latest glucose cards must show the active Korean standard note plus a compact linked `근거:` official-source label, with dashboard criteria copy buttons at least 32px high and metric source links at least 28px high in the right-pane desktop layout. Latest blood-pressure and glucose cards must select the newest dated matching record, keep units, glucose measurement context, and a compact assessment chip visible rather than relying only on the colored border.
- Trend chart: BP/glucose hover details must use Korean labels, full record dates, `mmHg`, `mg/dL`, and glucose measurement context; separate left/right Y-axis labels must distinguish blood pressure `mmHg` from glucose `mg/dL`; a visible line legend must identify 수축기 혈압, 이완기 혈압, and 혈당 with matching colors and units; a visible summary row must also show period, units, record counts, latest blood-pressure value, and latest glucose value with measurement context; and a collapsible source-data list must expose date-by-date plotted BP/glucose values, units, glucose context, adult-common BP/glucose assessment labels, and official source labels so touch and screen-reader users do not need hover or separate metric cards to interpret the chart.
- Profile helpers: show current sex-specific waist threshold at the waist input, keep BMI, blood pressure, diabetes-care/screening glucose, low-glucose, marked-hyperglycemia, A1C, common BUN/Cr/eGFR/UACR kidney-function, common Na/K electrolyte, common lipid, sex-specific HDL, sex-specific GGT, common AST/ALT liver-function, common Alb/TP protein/nutrition, common Ca calcium, common P phosphate, common UA uric-acid with result-sheet sex-reference priority, sex-specific Hgb, CBC WBC/PLT common helpers, sex-specific RBC/Hct helpers, ANC infection-risk, and PLT bleeding-risk helper criteria labeled by applicability, allow copying the source-backed standards text for the selected quick-filter category with BMI/waist/blood-pressure/glucose/low-glucose/marked-hyperglycemia/A1C/BUN/Cr/eGFR/UACR/Na/K/lipid/HDL/GGT/AST/ALT/Alb/Ca/P/UA/Hgb/WBC/RBC/Hct/ANC/PLT numeric and risk-threshold ranges plus cancer-patient fever/infection contact thresholds, preserve full-copy behavior when `전체` is selected, keep standards-panel and BP/glucose input-helper source links at least 28px high in the right-pane desktop layout, and let the fever/infection standards card prepare source-retaining symptom record and clinician-question drafts.
- Profile mode toggles: cancer-care, diabetes, and hypertension tracking toggles must expose the current on/off state and the next toggle action in accessible labels/titles, while keeping the visible labels compact. Desktop toggle labels stay at least 40px high, with the existing 44px mobile touch-target contract preserved.
- Form controls: visible inputs, selects, textareas, and hidden file inputs must expose scoped accessible labels and matching hover titles when their visible label can repeat elsewhere, especially `날짜`, `메모`, `우선순위`, `상태`, file selection, and filter controls. Labels should name the owning profile/vital/visit/symptom/question/lab/food/document context without adding medical claims. Required add/save validation feedback must render as a local, visible `role=status` row next to the affected form action, in addition to the global save chip, so users do not need to scroll back to the topbar after an empty-form click. That local feedback clears automatically once the required draft fields become valid, before the user has to click the add/save action again; when the topbar still shows the same stale required-field warning, it should switch to a scoped ready status such as `병원 방문 기록 필수 입력 확인됨` without claiming that a record was saved.
- Care queue: dated, source-labeled rows for profile-based cervical screening quick-checks with concise `근거: 출처명 (URL)` source data, cervical warning, high-severity, or source-backed infection/lymphedema/urinary-bowel-bleeding/bowel-obstruction contact-threshold symptoms, open questions, out-of-range blood pressure/glucose readings with standard-source detail, high-risk BP/low-glucose/marked-hyperglycemia rows with adult-common standard wording and clinician-contact framing, generated cervical record-memo rows that preserve the official `공식 근거/기록 기준` line, abnormal labs with separated memo/assessment/source evidence, unfinished document actions, upcoming visits, compact summary chips for total, watch-tone, neutral schedule/general, and source-backed item counts, source-count chips, and a copy button for clinic-prep text whose accessible label/title, copied header, and post-copy status preserve the visible tone/source-backed and source-count summaries. Visible dashboard queue rows must render URL-bearing `근거:` source data as compact linked official-source rows instead of raw URL paragraph text. Copied queue text must split compound details into `메모:`, `판정:`, `기록 기준:`, and `근거:` lines, and long copy-status chips must wrap without horizontal overflow on mobile.
- Recent timeline: show compact summary chips for total records, vital/visit/document/symptom/question/lab type counts, and source-backed records before the mixed timeline list so users can scan record coverage before scrolling. Source-evidence link labels include date plus recent-timeline row position so repeated same-day generated records do not expose identical link names.
- Food judgment: the nutrition panel must show compact food-judgment summary chips for matched item count, support/limit/care-team categories, and unique official-source count before the food input. When a saved WBC or ANC row is below the user-entered lower range, the panel shows a compact `면역저하 검사 연결` strip that states the recorded low lab context, links the recovered lab source and National Cancer Center immune-function diet source, and adds those labels to the source count without implying a diagnosis. Matched food chips show term, local category reason, and a clickable official Korean source link next to each match; those food source links should stay at least 28px high in the right-pane desktop layout; raw or unpasteurized food-safety matches use the National Cancer Center immune-function diet source rather than the generic side-effect diet overview. When matched food or low-lab immune-food context exists, a compact `질문 초안` action must fill the editable pre-visit question form with food reasons, low-lab context when present, and a parseable source line rather than saving a question automatically.
- Symptom support template: when a keyword match exists, show the meal-note or symptom-observation candidate, safety boundary, queue-evidence hint for contact-threshold matches, and official Korean source link before the question-draft action; generated question drafts keep the source label and URL. Cancer-pain prompts record location, 0-10 intensity, timing, worsening/easing factors, and analgesic effect for clinician review. Cervical general warning symptoms such as abnormal vaginal bleeding, suspicious discharge change, pelvic pain, or radiating leg pain must stay framed as record-review and clinician-contact questions and must take priority over the generic pain template when wording overlaps.
- Cervical cancer care note: compact top summary chips for total item, priority, screening-summary, warning-record-field, warning, question, record/recovery/prevention, and official-source counts; official-source priority record/question/recovery checklist, source-backed warning-record field cards for when/what/how-much/with-what to record before a visit, warning signs, profile-based national screening quick-check for age/sex and 산정특례기간 deferral confirmation with non-duplicated source citations, HPV vaccine guidance and question drafts that keep vaccination prevention separate from continued cervical screening, screening-versus-diagnostic-test and suspected-symptom diagnostic-test prompts for Pap/HPV/colposcopy/biopsy/ultrasound/MRI conversations, source-backed stage-explanation notes for 0-4 stage conversations, lymphedema infection/worsening-signal recording prompts, screening-to-question draft button, warning-card recording-draft buttons that prefill the same when/what/how-much/with-what warning-record field guide, then keep a separate user-recording area and a single parseable official `출처:` line, record/recovery/prevention memo draft buttons that fill a source-backed symptom/action note without treatment instructions, collapsible source-labeled and source-retaining treatment-selection/pelvic-radiation/recovery/장·방광 후기 변화 question draft buttons, late 장폐색·혈변·혈뇨 record-check memos that preserve surgery/radiation timing and contact-standard wording in the saved care-queue label and official basis detail, separate item-level official source links beside each question draft row, recovery checks with a visible item count, item/context-specific official-source links, a visible source-list heading with official-source count, and a source-retaining copy action for clinic-prep text whose visible helper text, accessible label/title, copied source-list heading, and post-copy status summarize copied item and official-source counts. Copied cervical-care text, Markdown, CSV, and caregiver HTML must preserve the warning-record field section with official source evidence. In the right-pane desktop layout, all cervical-care official-source links should stay at least 28px high without horizontal overflow.
- Standards coverage: each standard shows status, scan-friendly `남녀 공통`/`성별 분리` badges, sex applicability, source label, source URL where external, context-specific accessible source-link names, restrained emphasis for high-risk BMI/waist/BP/glucose/low-glucose/marked-hyperglycemia/A1C/BUN/Cr/eGFR/UACR/Na/K/lipid/HDL/GGT/AST/ALT/Alb/Ca/P/UA/ANC/PLT and cancer-patient fever/infection numeric rows, Hgb rows plus CBC WBC/RBC/Hct/PLT rows with result-sheet-priority wording, quick filters for `전체`, `생활지표`, `당뇨·지질`, `검사`, and `암환자`, visible count feedback, summary chips for displayed criteria, risk-highlight rows, sex-specific criteria, and official-source counts, filter-aware copy for the selected filter whose button accessible label/title, copied clinic-prep text, and post-copy status feedback preserve the same selected-range summary, and fever/infection symptom-record plus clinician-question draft shortcuts that reuse the source-backed symptom template.
- Lab preset preview: selected helper shows current sex applicability, common-versus-sex-specific refresh note, range, unit, and result-sheet-priority note; the preview accessibility name must mention both range and memo criteria; direct-input item examples should include WBC/RBC/Hct/PLT before broader chemistry examples; sex-specific HDL/GGT/Hgb/RBC/Hct profile-sex refresh must update both the range and auto-filled memo `적용 기준` line while preserving user-written custom memos, and feedback must name the exact preset plus female/male/default 기준; common BUN/Cr/eGFR/UACR kidney-function, common Na/K electrolyte, common lipid, common AST/ALT liver-function, common Alb/TP protein/nutrition, common Ca calcium, common P phosphate, common UA uric-acid, and common CBC WBC/PLT presets plus HDL/GGT/Hgb/RBC/Hct sex-specific presets must not be collapsed into one source row, and preset-derived drafts must expose a reset action that returns the selector and fields to direct input without saving a record.
- Lab result cards: the lab tracking panel must show compact saved-lab summary chips for total count, low/high/normal/reference-missing mix, source-backed count, and follow-up question candidate count before the saved-result list. Source-bearing saved notes split ordinary multiline memo text from the source label/link so evidence is not hidden in paragraph copy; saved cards plus Markdown, CSV, and caregiver lab rows use the same memo-plus-`근거:` format and render single-sided ranges as `이상`/`이하` labels instead of dash placeholders.
- Lab follow-up questions: generated question drafts use normalized Korean spacing, compact multiline lab memo bodies, label source-bearing notes as `기존 메모/근거`, and preserve the source label plus URL on a parseable `출처:` line for downstream question/export evidence splitting.
- Saved question cards, timeline rows, and metric summary: the question panel must show compact saved-question summary chips for total count, current status mix, source-backed count, and answer-memo count before the form. Source-backed saved questions must show the question body without the raw generated `출처:` line and render the extracted evidence as a separate compact `근거:` row, linking the official source when a URL is present. Saved question answer memos must render as a labeled `답변 메모` row rather than an unlabeled small note. Recent-timeline question rows must keep the current answer status prefix while removing raw `출처:` text from the detail paragraph. The dashboard question metric must show open-question priority counts and source-backed open-question counts so users can triage before opening the full list.
- Saved question copy controls: each question copy button should visibly say `질문 복사`, and its accessible label/title plus post-copy status must include the topic, date, priority, current answer status, source-evidence presence, and answer-memo presence so clinic-prep copying is auditable before and after the action.
- Vital input helper: blood-pressure and glucose forms show compact saved-vital summary chips for total count, BP/glucose type mix, and ok/watch/risk/neutral assessment mix before the form, then the active Korean standard context, explicit adult common-sex applicability, official source link, compact numeric ranges, restrained high-risk row emphasis, a save-preview assessment for the entered reading, type-specific save button/status feedback, and a source-backed clinician-question draft button before saving; glucose save-preview and downstream evidence must route values under 70 mg/dL to the KDCA low-glucose source and values at 250 mg/dL or higher to the KDCA marked-hyperglycemia source before falling back to diabetes-care or screening defaults; saved latest-metric and recent-timeline vital rows must choose the newest dated matching record and keep the assessment label, `mmHg`, and glucose measurement context visible after save; generated vital questions must keep parseable KDCA blood-pressure, KDCA low-glucose/marked-hyperglycemia, and KDA diabetes-care glucose source evidence that care queue, copied text, Markdown, CSV, and caregiver HTML question outputs reformat as `근거:`.
- Symptom record labels: the symptom panel must show compact saved-symptom summary chips for total count, severity mix, source-backed count, and care-queue candidate count before the form. The symptom form shows a save-preview label before adding a record, adds a compact `근거 포함` hint when the draft contains parseable source evidence, its primary save button and saved-status feedback use the same record type wording, and saved symptom records show the same label and source-evidence hint rule in the latest-symptom metric, timeline, Markdown, CSV, and caregiver exports, distinguishing generic symptoms, structured cervical warning drafts, source-labeled cervical warning records from official general-symptom or treatment-side-effect sources, and generated cervical memo drafts without changing the severity/status color. Source-backed latest-symptom metric cards must show a compact linked `근거:` source label, and source-backed recent-timeline symptom rows must remove raw `출처:` text from the detail paragraph and render the extracted official source as a separate compact linked `근거:` row.
- Document list and search: the saved-document panel must show compact summary chips for total count, review-status mix, open next-action count, attachment-recovery count, and deleted-archive count before search and filters. Icon-only search visuals must keep a screen-reader label plus input `aria-label`/title; no-match filters show a reset action; true empty state explains that a document must be saved first. Saved-document next-action edits should use a multiline control so long Korean care-team questions stay readable at 320px. Saved-document and deleted-archive row actions must expose document-specific `aria-label` and title text with title, category/status, attachment filename/status where relevant, and the intended action; saved-document rows without an attachment must visibly say `첨부 추가` rather than only `첨부`, and recoverable delete actions must visibly say `삭제 보관` rather than only `삭제`. Desktop saved-document rows must reserve enough action-column width for the icon plus full Korean action label.
- Care queue empty state: links back to profile cancer-care mode, BP/glucose entry, symptom/question, lab, and document inputs that can create queue items.
- Visit input helper: the hospital-visit panel must show compact summary chips for total visits, upcoming appointments, appointments inside the 14-day reminder window, and visits with summary/plan notes before the form. These chips complement the dashboard appointment strip; they do not replace the derived care queue.
- Visit summary export: includes the record-derived care queue inside the selected date range, including saved symptom alerts, direct symptom row labels for generic symptoms, structured cervical warning drafts, and generated cervical memo drafts, source-separated lab queue details, low WBC/ANC immune-food context for in-range lab rows, direct BP/glucose rows with per-vital assessment plus official-source evidence, and high-risk BP/low-glucose/marked-hyperglycemia queue rows with adult-common standard wording and official source URLs.
- Caregiver export: live settings controls show summary chips for preset intent, profile redaction, memo presence, included section count, and excluded section count, and caregiver export/preview button labels plus status feedback preserve the same share-scope summary; caregiver previews snapshot both share settings and shared record content, then block stale copy/print/download when either changes until a fresh preview is generated, using the generated section scope for record-stale checks and avoiding a duplicate record-stale alert when only share settings changed; the exported HTML includes a care queue built from enabled share sections plus the profile-based cervical quick-check so excluded record sections do not leak through derived rows, keeps vital units plus glucose measurement context, per-vital assessment labels, and linked official-source evidence in recent BP/glucose rows, labels generated cervical memo records distinctly from generic symptom records in recent-symptom rows, renders low WBC/ANC immune-food context only when both food and lab sections are enabled, and renders source-backed question, recent-symptom, high-risk vital, care-queue, lab-note, and cervical screening-summary evidence as clickable official-source labels when URLs are present; source-backed multiline lab memo bodies keep visible line breaks before evidence links.
- CSV export: includes `care_queue` rows with the same source labels used by the dashboard queue, Korean-labeled vital units/glucose contexts, per-vital BP/glucose assessment and official-source evidence, high-risk BP/low-glucose/marked-hyperglycemia queue source evidence, direct symptom row labels for generic symptoms, structured cervical warning drafts, and generated cervical memo drafts, source-retaining cervical question drafts including screening-versus-diagnostic-test clarification, source-separated direct symptom and lab queue evidence, low WBC/ANC immune-food context in the food-check row, and item-level cervical-care evidence with source URLs.
- Export preview: content preview, visible preview-scoped copy, print, download, and close labels, action `aria-label`/title text, action feedback that preserves the visible line/character/byte/source-marker summary, stale disabled reasons for caregiver settings/records, visit-summary range/records, and CSV records, stale alert, and state-specific fresh-preview visible actions, format, line count, character count, byte size, and `근거:`/`출처:` marker count. Stale-alert fresh-preview buttons must expose scoped visible labels plus `aria-label` and title text that name the preview type and changed state being applied. Caregiver setting-stale alerts should take precedence over caregiver record-stale alerts when settings alone changed. Below 760px, summary chips use two-column wrapping, the source-marker chip spans the full row, and stale-alert fresh-preview actions span the alert width instead of becoming narrow vertical buttons.

## Responsive Behavior

- At 1120px, broad layouts collapse to two columns and the topbar becomes a stacked grid so the Korean page title keeps a normal readable line box above dense export/caregiver-share controls.
- Above 1120px, constrained cmux right-pane desktop widths keep the topbar as a two-column grid with a protected title column so `나의 건강 기록` does not collapse into single-character Korean lines beside wrapped actions.
- At 760px, all content grids collapse to one column.
- Mobile and narrow cmux widths require at least 44px touch height for visible controls, including primary/secondary buttons, disclosure summaries, text/date/number inputs, native selects, checkbox labels, and official-source links. Native selects need explicit `height`, not only `min-height`, because WKWebView can otherwise render them below the intended hit area.
- Long Korean source labels and question buttons must wrap without horizontal overflow.
- Korean standards applicability chips, saved-document next-action editors, and saved-document archive action buttons must avoid visible text clipping at 320px, 375px, 760px, cmux right-pane, and desktop widths.
- Saved-document search fields must keep the leading search icon vertically centered inside the input at mobile, cmux right-pane, and desktop widths.

## Motion

- Motion is intentionally minimal.
- Do not use decorative reveals, parallax, or animated medical effects.
- Save/status changes should be textual and immediate.

## Imagery And Assets

- Use lucide icons to identify action types.
- Do not use stock clinical photos or decorative illustrations.
- User-selected medical attachments must not be used as decoration.

## Accessibility

- Every interactive element needs visible focus.
- Hidden file inputs remain out of tab order and are triggered by visible buttons.
- Save/import/export statuses use `aria-live` or `role=status`.
- Medical source links must be readable text links.

## Content & Voice

- Korean copy should be specific, plain, and clinical.
- The app is a record and preparation tool, not diagnosis, prescription, or treatment instruction.
- Cancer-care guidance must direct users to record symptoms and ask the care team.
- Korean standards must distinguish automatic rules, input helpers, and user-entered lab ranges.
- Vital input helpers should show compact numeric thresholds and a source-backed clinician-question shortcut, not only the standard name.

## Style Architecture

- Keep style ownership in `src/App.css` with semantic class names.
- Shared medical rules live in TypeScript data modules, not hard-coded JSX strings.
- Exports should reuse source/range labels from shared modules.

## Spacing Ownership

- Workspace owns page padding.
- Panels own internal padding.
- Repeated lists own row gaps.
- Controls own minimum height and inline padding.

## Text Fit And Dynamic Content

- Korean labels wrap inside buttons and cards.
- Long care-queue detail text and source URLs wrap inside the row content column without widening the dashboard.
- Export source labels stay in small rows rather than headings.
- Question buttons must allow multi-line text.
- Saved-document next-action text uses a multiline editor so clinic-prep actions do not hide in a horizontally scrolling input on narrow phones.
- Standards applicability chips use aggressive wrapping for slash-heavy Korean medical shorthand such as A1C/FPG/PP2 and BUN/Cr/eGFR/UACR.
- Timeline and reminder rows can truncate only secondary details, not dates or core titles.

## Layout Stability

- Fixed-format controls keep stable min-height.
- The sidebar does not affect main content width below 1120px.
- Export and attachment preview panels must not shift core form layouts.

## Token Export Guide

- Promote documented color, radius, shadow, and spacing values to CSS variables if the app grows beyond a single stylesheet.
- Preserve semantic token names: background, sidebar, primary, warning, risk, panel radius, focus ring.

## Agent Prompt Guide

- When improving CareVault UI, keep the first viewport operational.
- Prefer compact panels and exact Korean status feedback.
- Do not add landing-page heroes, decorative gradients, or generic wellness copy.
- For medical content, use official Korean sources and frame content as record/clinician-question support.

## Audit Checklist

- Does every new medical statement have an official source label?
- Do required visit, symptom, question, lab, document, and vital add/save validation messages appear locally beside the clicked form action instead of only in the offscreen global save chip, clear once the required draft fields become valid, and prevent the topbar from keeping a stale required-field warning?
- Do symptom-support templates show the official source link before filling a question draft, and does the saved draft text retain source label plus URL?
- Do symptom-support template-filled symptom action notes retain the same official source label plus URL when the action field was blank?
- Do symptom-support templates explain when a saved contact-threshold symptom can enter the care queue with source evidence?
- Do symptom-support source links and question-draft buttons expose template-specific accessible names and hover titles?
- Do sidebar section links expose destination-specific accessible names, hover titles, and a single click/hash/scroll-aware `aria-current="page"` active state?
- Do lymphedema symptom-support templates treat swelling, skin redness, heat, pain, and wounds as observation/contact-threshold prompts rather than self-treatment instructions?
- Do infection symptom-support templates treat fever, chills, urinary symptoms, respiratory symptoms, and catheter-site changes as contact-threshold prompts rather than self-treatment instructions?
- Do fatigue and mood-change symptom-support templates treat 피로감, 우울, and 불면 as source-backed clinician-question prompts rather than diagnosis or treatment instructions?
- Do cervical general-warning symptom-support templates treat 비정상 질출혈, 성교 후 출혈, 질분비물 변화, 골반통, and 하지 방사통 as source-backed record-review questions rather than self-treatment instructions?
- Do cervical urinary/bowel/bleeding symptom-support templates treat 배뇨곤란, 배변 장애, 혈뇨, and 혈변 as source-backed contact-threshold questions rather than self-treatment instructions?
- Do cervical bowel-obstruction symptom-support templates treat 장폐색, 복부팽만, and 배변·가스 배출 changes as source-backed contact-threshold questions rather than self-treatment instructions?
- Do cervical sexual-health symptom-support templates treat 질건조, 질협착, 성교통, and 성생활 재개 as source-backed clinician-question prompts rather than prescriptions?
- Do cervical pelvic-radiation menopause symptom-support templates treat 무월경, 안면홍조, 난소부전, 성욕 감소, 골다공증, and 질협착 as source-backed clinician-question prompts rather than hormone-treatment advice?
- Do cervical pelvic-radiation recovery notes treat 난소부전, 폐경 증상, 성욕 감소, 골다공증, and 질협착 as source-backed record/clinician-confirmation prompts rather than hormone or sexual-health treatment advice?
- Do cervical fertility/pregnancy symptom-support templates treat 임신 계획, 가임력, 자궁경관 길이, 유산, and 조산 risk as source-backed clinician-confirmation prompts rather than pregnancy guidance?
- Do cancer-pain symptom-support templates treat 통증, 통증점수, and 진통제 효과 as source-backed recording prompts rather than medication instructions?
- Do cervical pelvic-pain and sexual-health pain keywords take priority over the generic pain template when wording overlaps?
- Do cancer-food matches show official Korean source links in the dashboard and source URLs in text exports?
- Do cancer-food source links expose item-specific accessible names and hover titles that include the food term and local reason?
- Do raw or unpasteurized cancer-food safety matches such as 생굴, 회, 날계란, and 비살균 cite the immune-function diet source rather than the generic side-effect diet overview?
- Does a saved low WBC or ANC row show the nutrition-panel `면역저하 검사 연결` strip and preserve that context in Markdown, CSV, and caregiver exports without leaking lab values when caregiver lab sharing is disabled?
- Does the nutrition-panel `질문 초안` action expose source-count scope in aria-label/title and fill the editable pre-visit question draft with matched food reasons, low-lab context when present, and parseable `출처:` evidence without saving automatically?
- Are cervical warning-card source links named with the visible official source, not just a generic source label?
- Do cervical warning-card, screening-summary, side-list, and all-source official links expose item/context-specific accessible names and hover titles?
- Do cervical question drafts retain the source label and URL after leaving the care panel?
- Do source-backed saved questions render generated `출처:` lines as separated `근거:` evidence in copy, care queue, CSV, Markdown, and caregiver HTML outputs?
- Does the question panel show saved-question summary chips for total, status mix, source-backed count, and answer-memo count without horizontal overflow?
- Do source-backed saved question cards split the visible question body from a separate compact `근거:` row instead of showing raw `출처:` text in the paragraph?
- Do saved question cards render answer memos as a labeled `답변 메모` row with wrapped text rather than an unlabeled small note?
- Do source-backed recent-timeline question rows keep the answer-status prefix while splitting raw generated `출처:` text into a separate compact linked `근거:` row?
- Does the dashboard question metric show open-question priority counts and `근거 포함` open-question counts without horizontal overflow?
- Do saved-question copy buttons visibly say `질문 복사`, and do copied text and post-copy status feedback expose topic, date, priority, current answer status, source-evidence presence, and answer-memo presence?
- Do repeated saved-question status buttons expose item-specific accessible names and hover titles that include the question topic and target status, while deferred actions visibly say `보류 처리`?
- Do caregiver-share setting summary chips, symptom severity sliders, native range/preset selects, form controls, disclosure summaries, official-source links, and caregiver share export/preview button labels expose preset intent, profile redaction, memo presence, included section count, and excluded section count without horizontal overflow and with the required touch height?
- Do caregiver-share profile redaction, caregiver section, cancer-care, diabetes, and hypertension tracking toggles expose stateful accessible labels/titles instead of generic on/off names?
- Does a caregiver HTML preview generated before share-setting or shared-record changes show the matching stale alert, avoid duplicate record-stale alerts for settings-only changes, and disable copy/print/download until a fresh preview is generated?
- Do backup export/import button labels, titles, and success feedback expose profile, record count, caregiver-share settings, attachment filename scope, JSON validation, and reattachment boundaries without leaking local attachment paths?
- Do source-backed direct symptom rows render generated `출처:` lines as separated `근거:` evidence in CSV, Markdown, and caregiver HTML outputs?
- Do source-backed recent-timeline symptom rows split raw generated `출처:` text into a separate compact linked `근거:` row?
- Do recent-timeline summary chips show record-type counts and source-backed count before the mixed list without horizontal overflow?
- Do BMI, waist, latest-BP, and latest-glucose metric cards show linked official-source `근거:` labels without horizontal overflow and with at least 28px source-link height in the right-pane desktop layout?
- Does the dashboard metric-standard copy affordance expose the BMI/waist/BP/glucose criteria count and official-source count in its visible summary, aria-label/title, copied text, and post-copy status?
- Does the dashboard profile card show current-sex waist/HDL/GGT/Hgb/RBC/Hct standard chips with source-backed accessible labels/titles, one-click source-backed copy, and no horizontal overflow?
- Do CSV, Markdown, and caregiver HTML direct symptom rows distinguish generated cervical memo records from generic symptom records?
- Do the latest-symptom metric card and recent timeline use the same generic/cervical warning/cervical memo record labels as the export surfaces?
- Does caregiver HTML render source-backed saved-question evidence as clickable official-source links when a URL is present?
- Does caregiver HTML render source-backed recent-symptom evidence, including inline template-filled `출처:` action notes, as separated `근거:` evidence with clickable official-source links when URLs are present?
- Does caregiver HTML label generated cervical memo records distinctly from generic symptom records in recent-symptom rows?
- Does caregiver HTML render source-backed care-queue and lab-note `근거:` evidence as clickable official-source links when URLs are present?
- Do cervical question buttons show a source label before the user clicks them?
- Does the longer cervical question prompt list stay in a compact disclosure so added medical prompts do not dominate first scan?
- Do cervical symptom/question draft buttons have item-specific accessible names and hover titles, not only generic visible labels?
- Do cervical clinician-question prompt rows expose a separate official source link without nesting links inside the question-draft button?
- Do cervical treatment-selection question drafts ask what to clarify with the care team based on stage, tumor size, whole-body condition, age, and childbirth plans, without recommending a treatment?
- Do cervical pelvic-radiation menopause question drafts ask what to record and clarify with the care team based on treatment scope and age, without recommending hormone treatment?
- Do cervical 장·방광 후기 변화 question drafts preserve surgery/radiation timing, 장폐색, 혈변, 혈뇨, and contact-standard wording without turning into self-treatment instructions?
- Do cervical late 장폐색·혈변·혈뇨 record-check memos preserve surgery/radiation timing, 복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨, and care-team contact-standard wording without turning into self-treatment instructions?
- Do cervical side-list care notes keep source labels adjacent to each item?
- Do cervical side-list care-note list items expose spaced accessible labels that separate title, detail, and source?
- Do cervical side-list care-note source chips open the item-level official page, not only repeat source text?
- Do cervical side-list care-note source chips expose item-specific accessible names, not repeated source-only labels?
- Does the dashboard care queue copy affordance visibly say `진료 큐 복사` and expose the same tone/source-backed and source-breakdown summaries in aria-label/title, copied text, and post-copy status?
- Does the dashboard care queue show tone/source-backed summary chips before the source breakdown without horizontal overflow?
- Do source-backed dashboard care queue rows remove raw URL text from the visible paragraph and render linked `근거:` evidence rows while preserving URLs in copied/exported text?
- Does the cervical screening quick-check show the current profile status, official source links, and clinician-confirmation action without becoming treatment advice?
- Does the cervical screening quick-check preserve 산정특례기간-based deferral confirmation for patients already being treated for the same cancer?
- Does the cervical screening quick-check create a source-retaining question draft rather than a saved question or treatment instruction?
- Do cervical screening-versus-diagnostic-test question drafts distinguish asymptomatic screening from suspected-symptom diagnostic workups without implying one fixed test path?
- Do cervical suspected-symptom diagnostic-test checks preserve Pap/HPV/colposcopy/biopsy/ultrasound/MRI as care-team clarification prompts rather than self-diagnosis instructions?
- Do cervical stage-explanation notes preserve 0-4 stage wording as a prompt to confirm the user's own diagnosis and test basis with the care team, not as self-staging guidance?
- Do cervical HPV vaccine notes say vaccination is prevention-only and regular cervical screening continues after vaccination?
- Do cervical HPV question drafts also ask how to explain continued screening after vaccination, not only vaccine eligibility?
- Do cervical caregiver exports keep item-level source links, and do Markdown/CSV exports keep item-level source labels and URLs, not only a final source list?
- Does copied cervical-care clinic-prep text keep item-level source labels and URLs?
- Does copied cervical-care clinic-prep text keep the current profile screening quick-check when copied from the app?
- Does copied cervical-care clinic-prep text preserve source-retaining clinician-question drafts, including treatment-selection questions?
- Do Markdown, CSV, and caregiver HTML exports preserve source-retaining cervical clinician-question drafts in cancer-care mode?
- Do copied cervical-care text, Markdown, CSV, and caregiver HTML exports preserve pelvic-radiation menopause question drafts, 장·방광 후기 변화 question drafts, and recovery notes with the matching National Cancer Center URLs?
- Does the cervical-care panel, copied note, Markdown, CSV, and caregiver HTML start the cervical-care reference with a short source-backed priority checklist for today symptoms, next-visit questions, and treatment-aftercare topics?
- Do cervical-care record checks separate hospital follow-up schedules/results from the national screening cycle without turning that into treatment advice?
- Do cervical-care record checks preserve urinary, bowel, blood-in-stool, and blood-in-urine change guidance as observation/clinician-confirmation prompts rather than fixed treatment instructions?
- Do cervical-care lymphedema notes preserve skin redness, heat, pain, wound, and sudden hardening/worsening signals as recording/contact prompts rather than self-treatment instructions?
- Does the visible cervical record-check heading show an item count after the list grows, without causing narrow-width overflow?
- Do cervical cancer care note top summary chips expose item/source counts before the dense checklist and avoid horizontal overflow?
- Does the cervical-care note show source-backed warning-record field cards for when/what/how-much/with-what to record, and do copied text, Markdown, CSV, and caregiver HTML preserve that section with official source evidence?
- Do cervical warning-card recording draft buttons prefill the same when/what/how-much/with-what field guide, show a separate `내 기록` area, and retain exactly one parseable official `출처:` line?
- Do cervical-care screening/prevention notes preserve result notification timing and cervical-screening cost guidance from official Korean sources?
- Do cervical-care screening/prevention notes preserve cytology timing, possible HPV co-test cost, sexual-experience consultation, and hysterectomy-history confirmation as clinician-check items?
- Do cervical-care recovery notes preserve recurrence/follow-up interval guidance as clinician-confirmation prompts rather than fixed treatment instructions?
- Do cervical-care recovery notes preserve sex-life restart, pain, dryness, and radiation-treatment timing guidance as clinician-confirmation prompts rather than fixed treatment instructions?
- Do cervical-care recovery notes preserve pregnancy/birth planning, antenatal-care, miscarriage, and preterm-birth risk guidance as clinician-confirmation prompts rather than fixed treatment instructions?
- Do cervical-care food/supplement notes preserve the official no-specific-food framing, nutrition/rest context, and supplement interaction check without turning it into a diet prescription?
- Do BMI/waist/BP/glucose/A1C/BUN/Cr/eGFR/UACR/Na/K/lipid/HDL/GGT/AST/ALT/Alb/Ca/P/UA/Hgb/WBC/RBC/Hct/ANC/PLT and cancer-patient fever/infection numeric or risk-threshold rows show row-level male/female/common or cancer-patient applicability, not only a section-level standard label?
- Can users narrow the dense standards range strip with quick filters, and does the selected filter show an accessible pressed state plus visible count feedback?
- Do selected standards quick filters show summary chips for displayed criteria count, risk-highlight row count, sex-specific count, and official-source count without horizontal overflow?
- Does the Korean standards copy button copy only the selected quick-filter category, while `전체` still copies all standard range sections and matching source coverage?
- Does the standards copy button aria-label/title include the selected-range summary before copy, not only the selected category name?
- Does copied Korean standards text include the selected-range summary lines for displayed criteria, risk-highlight rows, sex-specific criteria, and official-source counts?
- Does standards copy success feedback echo a compact selected-range summary, not only a generic copied message?
- Do fever/infection standards-card shortcuts create source-retaining symptom record and clinician-question drafts without overwriting unrelated in-progress text?
- Do health-standard source links expose context-specific accessible names and hover titles such as 혈압 기준 or 당뇨 추적 혈당 목표, not only repeated source labels?
- Do lab preset previews show a source label or link before the user saves the preset-derived range?
- Do lab preset previews explain whether profile sex changes can alter the selected helper range, separating common BUN/Cr/eGFR/UACR kidney-function, common Na/K electrolyte, common lipid, AST/ALT liver-function, Alb/TP protein/nutrition, Ca calcium, P phosphate, UA uric-acid, and common CBC WBC/PLT helpers from HDL/GGT/Hgb/RBC/Hct sex-specific helpers?
- Do lab preset drafts preserve sex-applicability and source evidence in a readable multiline default memo unless the user has already written a custom memo?
- Can users reset a preset-derived lab draft back to direct input without saving or manually clearing every field?
- Do saved lab-result cards separate source evidence from ordinary multiline memo text and keep official source links clickable?
- Do care queue, Markdown, CSV, and caregiver lab rows preserve preset `적용 기준` text while still converting source lines into `근거:` evidence?
- Does caregiver HTML keep multiline lab memo body text, including preset `적용 기준` lines, visually separated before linked `근거:` evidence?
- Do lab follow-up question drafts compact multiline memo bodies while keeping preset source evidence visible as `기존 메모/근거` plus a parseable `출처:` line?
- Do lab follow-up question buttons have item-specific accessible names and hover titles that say whether memo/evidence will be included?
- Do visit-panel summary chips show upcoming appointments, the 14-day reminder window, and plan/summary note counts before the visit form without horizontal overflow?
- Do health-standard coverage rows separate common BUN/Cr kidney-function helpers, common eGFR kidney-function helper, common UACR albuminuria helper, common Na/K electrolyte helpers, common lipid helpers, common AST/ALT liver-function helpers, common Alb/TP protein/nutrition helper, common Ca calcium helper, common P phosphate helper, common UA uric-acid helper, and HDL/GGT male/female-specific helper thresholds with their distinct official sources?
- Does every new control have visible feedback or a clear state change?
- Do primary form actions and document attachment selection expose scoped accessible names and hover titles rather than only generic visible text?
- Do visible inputs/selects/textareas and hidden file inputs expose scoped accessible names and matching hover titles when the visible label is repeated across sections?
- Do button `aria-label` and hover title text match for the same action, and do compact desktop action buttons avoid sub-32px hit targets?
- Do one-click copy controls have specific accessible names and matching hover titles rather than only generic visible text?
- Does the live app avoid internal roadmap or development-slice copy and keep such notes in `working.md` instead of user-facing UI?
- Does the narrow cmux browser avoid horizontal overflow?
- Does the symptom form show the same record-label rule in its preview, primary save button, and saved-status feedback that the latest card, timeline, Markdown, CSV, and caregiver exports use after save, and does source-backed generated content show a compact `근거 포함` hint before and after save?
- Does the latest-symptom metric card show a compact linked `근거:` source label for source-backed records instead of only saying `근거 포함`?
- Do saved source-backed cervical general-warning or treatment-side-effect symptom records classify as `자궁경부암 경고 기록` even when they were saved before the explicit warning-draft marker existed?
- Do cervical warning cards create source-URL-retaining symptom-record drafts rather than treatment advice?
- Do cervical warning-card symptom drafts include structured blanks for occurrence timing, amount/color/odor or pain, triggers, accompanied symptoms, clinician-contact criteria, and the official source URL?
- Do Markdown, CSV, and caregiver HTML exports preserve structured cervical warning-card symptom drafts with their official source URL?
- Do queued symptom alerts come from saved records or severity/source flags rather than new advice?
- Do source-backed fever/chills, lymphedema, cervical general-warning, cervical urinary/bowel/bleeding, and cervical bowel-obstruction symptom records enter the care queue as contact-threshold review rows with National Cancer Center source labels and URLs?
- Does cancer-care mode add a source-backed cervical screening quick-check to the care queue without marking it as a risk item?
- Does an empty care queue offer direct links back to profile cancer-care mode and record forms, including BP/glucose entry, that can create queue items?
- Do out-of-range blood-pressure and glucose readings enter the care queue as watch items and preserve the same source label in copied/exported checklist text?
- Do high-risk vital queue rows such as 고혈압 위기 가능 범위, 저혈당 범위, and 현저한 고혈당 범위 retain the user note, adult-common Korean standard wording, clinician-contact framing, and official source URL?
- Do Markdown, CSV, and caregiver HTML exports preserve high-risk BP/low-glucose/marked-hyperglycemia queue rows with adult-common standard wording and official source URLs?
- Does the saved-document search input have an accessible name beyond its placeholder while preserving the compact icon-only visual treatment?
- Does the saved-document panel summary show review/action/attachment-recovery/archive counts before filters, and do its chips avoid horizontal overflow at narrow cmux widths?
- Do saved-document and deleted-archive row actions expose document-specific accessible names and hover titles instead of only generic visible text such as `첨부`, `삭제`, or `복구`?
- Do blood-pressure and glucose assessment summaries in queue/export details say they are adult common standards when that is the applicable Korean rule?
- Do saved-vital summary chips show BP/glucose type and ok/watch/risk/neutral assessment mix before the input form without horizontal overflow?
- Do vital queue rows preserve the user note, assessment summary, and Korean standard source label/URL in copied and exported text?
- Do long source-backed care-queue details wrap in the row content column without horizontal overflow?
- Does the visit summary queue respect the selected date range and avoid undefined source labels?
- Do visit-summary export and preview button labels/titles plus post-action status preserve the selected range?
- Does a Markdown visit-summary preview generated before range, record, or food-query changes show the matching stale alert and disable copy/print/download until a fresh preview is generated?
- Do CSV export and preview button labels/titles plus post-action status expose record count, care queue, cervical reference, food check, standards/source rows, and local-path exclusion without horizontal overflow?
- Does a CSV preview generated before record changes show a stale-record alert and disable copy/print/download until a fresh preview is generated?
- Does the caregiver queue respect share-section include/exclude settings while still allowing the profile-based cervical quick-check when cancer-care mode is active?
- Do Markdown visit-summary vital rows keep `mmHg`, `mg/dL`, Korean glucose context labels, per-vital assessment labels, adult-common standard labels, and official-source evidence?
- Do caregiver vital rows keep `mmHg`, `mg/dL`, glucose context labels such as 공복/식전/식후 2시간, per-vital assessment labels, and linked official-source evidence?
- Do CSV vital rows keep `mmHg`, `mg/dL`, Korean glucose context labels, per-vital assessment labels, adult-common standard labels, and official-source evidence instead of raw internal values?
- Does CSV expose care queue rows without local file paths?
- Do stale export preview controls explain why copy, print, and download are disabled?
- Do stale-preview fresh action buttons expose state-specific visible labels plus preview-specific accessible names and hover titles rather than only generic `새 미리보기` text?
- Do visible export preview action buttons say `미리보기 복사`, `미리보기 인쇄`, `미리보기 다운로드`, and `미리보기 닫기` instead of generic action-only labels without mobile overflow?
- Do export preview copy, print, and download button aria-labels/titles plus action feedback echo the same line, character, byte, and `근거:`/`출처:` marker summary shown in the preview chips?
- Do blood pressure and glucose rules say they are adult common criteria rather than sex-specific?
- Do blood pressure and glucose input helpers show the actual numeric ranges users need before saving?
- Do blood pressure and glucose input helpers show the current official source link with context-specific accessible names before saving?
- Do blood pressure and glucose input helpers show the entered reading's save-preview assessment with measurement, active adult-common standard, and no overflow before saving?
- Do glucose input helpers and downstream BP/glucose evidence route low glucose under 70 mg/dL and marked hyperglycemia at 250 mg/dL or higher to their KDCA acute source IDs instead of the profile diabetes/screening default?
- Do blood pressure and glucose save buttons and saved-status feedback say 혈압/혈당 기록 and include the saved assessment instead of generic 측정값 feedback?
- Do latest blood-pressure and glucose metric cards keep `mmHg`, glucose context such as 식후 2시간, and the same assessment chip visible after saving?
- Do latest blood-pressure and glucose metric cards use the newest dated matching record rather than a later-entered older-date reading?
- Does the BP/glucose trend chart tooltip show the full record date, Korean line labels, `mmHg`, `mg/dL`, and glucose context such as 식후 2시간?
- Does the BP/glucose trend chart label separate left/right Y axes as blood pressure `mmHg` and glucose `mg/dL` without mobile overflow?
- Does the BP/glucose trend chart show visible 수축기 혈압, 이완기 혈압, and 혈당 line-legend chips with matching units and no mobile overflow?
- Does the BP/glucose trend chart show period, units, record counts, latest BP value, and latest glucose value/context in visible summary chips without requiring hover?
- Does the BP/glucose trend chart expose a collapsible source-data list whose visible rows and accessible labels keep dates, `mmHg`, `mg/dL`, glucose context, assessment labels, adult-common standard context, and official source labels without mobile overflow?
- Do saved blood-pressure and glucose timeline rows keep the assessment label, `mmHg`, and glucose context such as 식후 2시간 after saving?
- Do blood pressure and glucose input helper question drafts include the entered measurement, adult-common standard, clinician-confirmation framing, and official source URL?
- Are high-risk BP/glucose numeric rows visually emphasized without looking like a diagnosis or treatment instruction?
- Does the profile standards panel show source-backed BMI, waist, blood-pressure, and glucose numeric range cards before the detailed coverage disclosure?
- Does copied Korean health-standard text include BMI, waist, blood-pressure, and glucose numeric ranges, not only source labels?
- Do Markdown, CSV, and caregiver HTML exports preserve BMI/waist/BP/glucose/A1C/BUN/Cr/eGFR/UACR/Na/K/lipid/HDL/GGT/AST/ALT/Alb/Ca/P/UA/Hgb/WBC/RBC/Hct/ANC/PLT numeric and risk-threshold ranges plus cancer-patient fever/infection contact thresholds with source labels?
- Do the profile standards panel and copied Korean health-standard text include an adult-standard/clinician-priority boundary note?
- Do Markdown, CSV, and caregiver HTML exports preserve the same Korean health-standard boundary note?
- Do sex-specific waist, HDL, GGT, hemoglobin, RBC, and Hct helpers show the active profile sex or an unspecified fallback?
- Do empty states offer a direct recovery action when a filter caused the empty result?
- Does any export avoid local file paths and treatment instructions?

## Evidence Map

- UI source: `src/App.tsx`.
- Style source: `src/App.css`.
- Korean standards: `src/healthStandards.ts`.
- Cervical cancer care data: `src/cervicalCancerCare.ts`.
- Symptom support data: `src/symptomSupportTemplates.ts`.
- Runtime QA: cmux workspace `암관리` right in-app browser at `http://127.0.0.1:1420/`.
- Worklog: `working.md`.

## Decisions Log

- 2026-06-06: Scoped stale export-preview fresh-action visible labels so settings/range refresh buttons name the preview state being applied, not only generic `설정 반영` or `범위 반영`.
- 2026-06-05: Moved AppState defaults and hydration normalization into `src/appState.ts` so `src/App.tsx` stays a component-only module for Vite Fast Refresh while preserving the same local-first persisted-state contract.
- 2026-06-04: Created project design contract because no CareVault `DESIGN.md` existed.
- 2026-06-04: Added cervical cancer care note as a record/question-prep panel instead of a treatment advice panel.
- 2026-06-04: Explicitly labeled blood pressure and glucose as adult common criteria and waist/HDL/hemoglobin as sex-specific where applicable.
- 2026-06-04: Added compact helper surfaces for profile waist, Korean standards copy, vital input standards, lab presets, care queue symptom scanning/copy, cervical warning-to-symptom drafts, cervical-care note copy, document filter recovery, and export preview size summaries.
- 2026-06-04: Added empty care-queue recovery links to symptom/question, lab, and document inputs.
- 2026-06-04: Hardened export preview headers, summary chips, caregiver iframe source labels, and generated source-label pills so long Korean labels wrap instead of creating horizontal overflow.
- 2026-06-04: Clarified after-meal glucose context labels as 식후 2시간 in the queue, CSV, Markdown, and caregiver exports.
- 2026-06-04: Added adult common standard wording to blood-pressure and glucose assessment summaries that flow into queue and export details.
- 2026-06-04: Added a cervical-care record check for hospital follow-up schedule/results versus the national 2-year screening cycle.
- 2026-06-04: Added a cervical-care record check for urinary, bowel, blood-in-stool, and blood-in-urine changes after surgery or radiation treatment.
- 2026-06-04: Added cervical national-screening result notification and cost notes from the official Korean result/cost source.
- 2026-06-04: Added cervical recurrence/follow-up interval guidance as a source-backed recovery note framed for clinician confirmation.
- 2026-06-04: Added cervical pelvic-radiation ovarian-function, menopause-symptom, sexual desire, osteoporosis, and vaginal-stenosis recovery notes as source-backed record and clinician-confirmation prompts.
- 2026-06-04: Added cervical sex-life restart, pain, dryness, and radiation-treatment timing guidance as a source-backed recovery note framed for clinician confirmation.
- 2026-06-04: Added cervical pregnancy/birth planning and antenatal-risk guidance as a source-backed recovery note and clinician-question draft.
- 2026-06-04: Added a cervical treatment-selection question draft sourced from the official treatment-methods page and framed around care-team explanation, not treatment advice.
- 2026-06-04: Added a cervical pelvic-radiation menopause question draft sourced from the official radiation-side-effects page and framed around record and care-team clarification.
- 2026-06-04: Added cervical food/supplement consultation prompt and recovery memo sourced from the official dietary-life page and framed as care-team confirmation.
- 2026-06-04: Added explicit export preview action labels and stale-disabled titles so copy, print, and download controls remain understandable when disabled.
- 2026-06-04: Refreshed runtime evidence from the replaced cmux browser surface, keeping the design contract tied to visible `surface:513` verification.
- 2026-06-05: Refreshed runtime evidence to the current cmux `암관리` right in-app browser at `http://127.0.0.1:1431/`, replacing stale `surface:513` and `1420` references in the active design contract.
- 2026-06-05: Changed export preview panel visible actions from generic `복사`, `인쇄`, `다운로드`, and `닫기` to preview-scoped labels so the open panel names the target of each action without relying on hover text.
- 2026-06-04: Added compact numeric range rows to blood pressure and glucose input helpers, backed by shared Korean standards data.
- 2026-06-04: Added blood-pressure and glucose numeric ranges to copied Korean health-standard text.
- 2026-06-04: Added source-backed blood-pressure and glucose numeric range cards to the Korean standards profile panel and accessible copy-button labeling.
- 2026-06-04: Added row-level `남녀 공통` wording to all BP/glucose numeric range rows in helpers, copied text, Markdown, CSV, and caregiver exports.
- 2026-06-04: Propagated source-backed BP/glucose numeric ranges into Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added source-backed A1C numeric ranges to the shared Korean standards panel, copy text, Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added source-backed common lipid numeric ranges and fasting-context notes to the shared Korean standards panel, copy text, Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added source-backed sex-specific HDL numeric ranges to the shared Korean standards panel, copy text, Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added source-backed sex-specific GGT numeric helper ranges from KDCA clinical chemistry to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and GGT lab preset preview.
- 2026-06-04: Added source-backed AST/ALT liver-function helper ranges from KDCA liver function testing to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and AST/ALT lab preset previews.
- 2026-06-04: Added source-backed Alb/total-protein helper ranges from KDCA clinical chemistry to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and Alb lab preset preview while preserving result-sheet and care-team confirmation boundaries.
- 2026-06-04: Added source-backed BUN/Cr kidney-function helper ranges from KDCA clinical chemistry to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and BUN/Cr lab preset previews.
- 2026-06-04: Added source-backed eGFR kidney-function helper ranges from KDCA chronic kidney disease guidance to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and eGFR lab preset preview while preserving the 3-month persistence and urine/albuminuria confirmation boundary.
- 2026-06-04: Added source-backed UACR albuminuria helper ranges from KDCA chronic kidney disease guidance to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and UACR lab preset preview while preserving repeat quantitative urine-test and eGFR/care-team confirmation boundaries.
- 2026-06-04: Added source-backed Na/K electrolyte helper ranges from KDCA clinical chemistry to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and Na/K lab preset previews.
- 2026-06-04: Added a standards range quick-filter control so the dense Korean standards panel can be narrowed to lifestyle, diabetes/lipid, lab, or cancer-patient sections, and made the standards copy button copy the selected filter category while preserving full copy when `전체` is selected.
- 2026-06-04: Added source-backed sex-specific Hgb numeric helper ranges to the shared Korean standards panel, copy text, Markdown, CSV, and caregiver HTML exports while keeping result-sheet-priority wording.
- 2026-06-04: Added source-backed ANC infection-risk helper ranges and official NCC chemotherapy side-effect guideline evidence to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and ANC lab preset preview.
- 2026-06-04: Added source-backed PLT bleeding-risk threshold rows from the official NCC chemotherapy side-effect guideline to the shared Korean standards panel, copy text, Markdown, CSV, and caregiver HTML exports while keeping normal PLT lab ranges result-sheet-first.
- 2026-06-04: Added source-backed BMI and waist numeric ranges to the shared Korean standards panel, copy text, Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added a source-backed cervical-care priority checklist to the visible panel, copied clinic-prep note, Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added source-backed cancer-patient fever and infection contact-threshold rows to the shared standards panel, copied text, Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added standards-card shortcuts that turn the cancer-patient fever/infection contact-threshold row into source-retaining symptom record and clinician-question drafts.
- 2026-06-04: Added source labels/links to selected lab preset previews, including KDCA diabetes/dyslipidemia and result-sheet-priority local ranges.
- 2026-06-04: Split health-standard coverage for common lipid helper presets from HDL male/female-specific helper thresholds so their sex applicability and official sources stay distinct.
- 2026-06-04: Added a lab preset preview note that states whether profile sex changes can alter the selected helper range, keeping common BUN/Cr/eGFR/UACR kidney-function, common Na/K electrolyte, common lipid, AST/ALT liver-function, Alb/TP protein/nutrition, Ca calcium, P phosphate, and UA uric-acid helpers separate from HDL/GGT/Hgb sex-specific helpers.
- 2026-06-04: Added source-backed UA uric-acid helper ranges from KDCA clinical chemistry to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and lab preset preview while preserving result-sheet sex-reference and care-team confirmation boundaries.
- 2026-06-04: Added source-backed Ca calcium helper ranges from KDCA clinical chemistry to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and lab preset preview while preserving albumin, kidney, vitamin D/parathyroid, bone-metastasis, result-sheet, and care-team confirmation boundaries.
- 2026-06-04: Added source-backed P phosphate helper ranges from KDCA clinical chemistry to the shared Korean standards panel, copy text, Markdown, CSV, caregiver HTML exports, and lab preset preview while preserving calcium, vitamin D/parathyroid, kidney, medicine, nutrition, result-sheet, and care-team confirmation boundaries.
- 2026-06-04: Added a source-backed TP total-protein lab preset from the existing KDCA albumin/total-protein standard so the selectable lab helper surface matches the visible `알부민/총단백 기준` card.
- 2026-06-04: Replaced the user-facing internal development-slice footer with a patient-facing local-record and clinician-priority boundary note.
- 2026-06-04: Made lab preset application preserve source evidence in the default draft memo while leaving user-written memos untouched.
- 2026-06-04: Made lab preset application preserve the selected sex-applicability label in the multiline default draft memo before the source evidence line.
- 2026-06-04: Added an explicit lab draft reset action so preset-derived helper values can return to direct-input mode without saving a record.
- 2026-06-04: Added export regression coverage so caregiver, CSV, and visit packet lab rows preserve the preset `적용 기준` line while still converting source lines into `근거:` evidence.
- 2026-06-04: Split source-bearing saved lab notes into ordinary multiline memo text plus a visible source evidence chip/link.
- 2026-06-04: Made caregiver HTML render multiline lab memo bodies with visible line breaks before linked `근거:` evidence.
- 2026-06-04: Made lab follow-up question drafts label source-bearing lab notes as `기존 메모/근거`.
- 2026-06-04: Made lab follow-up question drafts compact multiline memo bodies while preserving parseable source URL lines.
- 2026-06-04: Added an adult-standard/clinician-priority boundary note to the Korean standards panel and copied standards text.
- 2026-06-04: Propagated the Korean health-standard boundary note into Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added specific accessible names and hover titles for queue, cervical-care, question, and standards copy buttons.
- 2026-06-04: Made cervical warning-card source links display the official source label directly while preserving compact wrapping.
- 2026-06-04: Added item-specific accessible names and hover titles for cervical warning symptom drafts and cervical clinician-question draft buttons.
- 2026-06-04: Split cervical clinician-question prompt rows into a question-draft button plus a separate item-level official source link.
- 2026-06-04: Moved the longer cervical clinician-question prompt list into a compact source-count disclosure.
- 2026-06-04: Added item-level official source chips to cervical check, recovery, and screening/prevention notes.
- 2026-06-04: Promoted cervical check, recovery, and screening/prevention source chips from text labels to item-level official-source links.
- 2026-06-04: Added item-specific accessible names and hover titles to cervical side-list official-source chips.
- 2026-06-04: Added spaced accessible labels to cervical side-list care-note items so title, detail, and source do not read as one concatenated phrase.
- 2026-06-04: Added a profile-based cervical national-screening quick-check and propagated it to Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Propagated the profile-based cervical screening quick-check into the copied cervical-care clinic-prep text.
- 2026-06-04: Added a one-click cervical screening question draft from the profile-based quick-check.
- 2026-06-04: Upgraded cancer-food matches from generic local rule labels to official-source-backed labels on dashboard chips and exports.
- 2026-06-04: Promoted cancer-food source trace from labels only to clickable dashboard links, caregiver HTML links, and URL-bearing Markdown/CSV evidence.
- 2026-06-04: Added item-specific accessible names and hover titles to dashboard cancer-food source links.
- 2026-06-04: Pointed raw/unpasteurized immune-low food-safety matches to the specific National Cancer Center immune-function diet source.
- 2026-06-04: Added National Cancer Center source labels and links to common cancer-treatment symptom support templates.
- 2026-06-04: Added a source-backed cervical general-warning symptom template for abnormal vaginal bleeding, discharge changes, pelvic pain, and radiating leg pain.
- 2026-06-04: Added a lymphedema symptom-support template for swelling, skin redness, heat, pain, wounds, and clinician contact thresholds.
- 2026-06-04: Added a fever/chills infection symptom-support template for temperature, urinary, respiratory, and catheter-site contact-threshold questions.
- 2026-06-04: Expanded the fatigue symptom-support template to catch 우울 and 불면 wording as source-backed clinician-question prompts.
- 2026-06-04: Added a cervical-treatment urinary/bowel/bleeding symptom-support template for 배뇨곤란, 배변 장애, 혈뇨, and 혈변 contact-threshold questions.
- 2026-06-04: Added a cervical-treatment bowel-obstruction symptom-support template for 장폐색, 복부팽만, and 배변·가스 배출 contact-threshold questions.
- 2026-06-04: Added visible symptom-support hints that distinguish care-queue evidence rows from question-draft-only templates.
- 2026-06-04: Added a cervical post-treatment sexual-health symptom-support template for 질건조, 질협착, 성교통, and 성생활 재개 clinician questions.
- 2026-06-04: Added a cervical pelvic-radiation menopause symptom-support template for 무월경, 안면홍조, 난소부전, 성욕 감소, 골다공증, and 질협착 clinician questions.
- 2026-06-04: Added a cervical pregnancy/fertility symptom-support template for 임신 계획, 가임력, 자궁경관 길이, 유산, and 조산 clinician questions.
- 2026-06-04: Made symptom-support template-filled symptom action notes retain the official source label plus URL and focus the question draft after filling.
- 2026-06-04: Added template-specific accessible names and hover titles to symptom-support official-source links and question-draft buttons.
- 2026-06-04: Added shared source-evidence parsing so source-backed question text renders as body plus `근거:` evidence in copy, queue, CSV, Markdown, and caregiver HTML outputs.
- 2026-06-04: Made caregiver HTML render source-backed saved-question evidence as official-source links when URLs are present.
- 2026-06-04: Made caregiver HTML render source-backed care-queue and lab-note `근거:` evidence as official-source links while continuing to escape user text.
- 2026-06-04: Extended source-evidence parsing to inline generated `출처:` citations and made caregiver HTML recent-symptom notes render them as separated linked `근거:` evidence.
- 2026-06-04: Made caregiver HTML cervical screening-summary `근거:` evidence use linked official-source labels instead of plain URL text.
- 2026-06-04: Made cervical-care question drafts retain official source labels and URLs.
- 2026-06-04: Made copied cervical-care clinic-prep text include source-retaining clinician-question drafts.
- 2026-06-04: Propagated source-retaining cervical clinician-question drafts into Markdown, CSV, and caregiver HTML exports.
- 2026-06-04: Added export regression coverage for pelvic-radiation menopause question drafts and recovery notes across copied cervical-care text, Markdown, CSV, and caregiver HTML.
- 2026-06-04: Added export regression coverage for the cervical 장·방광 후기 변화 clinician-question draft across Markdown, CSV, and caregiver HTML.
- 2026-06-04: Added item-level source labels and URLs to cervical-care caregiver, Markdown, and CSV exports.
- 2026-06-04: Promoted caregiver HTML cervical-care item-level source evidence from URL text to clickable links.
- 2026-06-04: Made copied cervical-care clinic-prep text retain item-level source labels and URLs.
- 2026-06-04: Added out-of-range blood-pressure and glucose readings to the care queue as watch items, with vital source chips, copy text, and empty-state recovery links.
- 2026-06-04: Made cervical warning-card symptom drafts retain the official source URL, not only the source label.
- 2026-06-04: Turned cervical warning-card symptom drafts into structured source-retaining recording templates.
- 2026-06-04: Renamed cervical warning-card action buttons to `기록 초안` so the visible command matches the structured recording template.
- 2026-06-04: Added Markdown, CSV, and caregiver HTML regression coverage for structured cervical warning-card symptom drafts and their official source URL.
- 2026-06-04: Made BP/glucose care-queue detail retain the user note, assessment summary, and Korean standard source label/URL.
- 2026-06-04: Clarified low-glucose assessment text as an adult-common Korean standard and added high-risk BP/low-glucose care-queue regression coverage.
- 2026-06-04: Added Markdown, CSV, and caregiver HTML regression coverage for high-risk BP/low-glucose queue source evidence.
- 2026-06-04: Added context-specific accessible names and hover titles to Korean health-standard source links.
- 2026-06-04: Added current official source links to the BP/glucose input helper using the same context-specific accessible-name helper.
- 2026-06-04: Added restrained visual emphasis to shared high-risk BP/glucose numeric range rows in the standards panel and vital input helper.
- 2026-06-04: Clarified BP/glucose input helper copy so 혈압, 당뇨 추적 혈당, and 혈당 선별 기준 all say they are adult common-sex standards before saving a reading.
- 2026-06-04: Added BP/glucose input-helper clinician-question drafts that preserve the entered reading, adult-common standard wording, and official source URL, then aligned their saved question evidence with the existing `출처:` to care queue/copy/Markdown/CSV/caregiver `근거:` pipeline.
- 2026-06-04: Added scan-friendly `남녀 공통` and `성별 분리` badges to the standards coverage list so BP/glucose common-sex standards are visually distinct from waist, HDL, GGT, and hemoglobin sex-specific helpers.
- 2026-06-04: Added a source-backed cervical 장·방광 후기 변화 clinician-question draft for post-surgery urinary/bowel changes and post-radiation 장폐색, 혈변, 혈뇨 contact-standard clarification.
- 2026-06-04: Added BP units and glucose measurement-context labels to caregiver HTML vital rows.
- 2026-06-04: Added a BP/glucose save-preview assessment that shows the entered reading, current assessment label, and active adult-common Korean standard before adding the reading.
- 2026-06-04: Added saved BP/glucose timeline assessment chips with `mmHg` and Korean glucose measurement-context labels so the save-preview interpretation remains visible after save.
- 2026-06-04: Made BP/glucose primary save buttons and saved-status feedback type-specific, including the saved assessment label.
- 2026-06-05: Added saved BP/glucose assessment chips to the latest metric cards, with BP `mmHg` and glucose measurement-context text visible before opening the timeline.
- 2026-06-05: Made latest BP/glucose metric cards select the newest dated matching record so backdated entries do not replace the true latest reading.
- 2026-06-05: Replaced the default BP/glucose chart tooltip with a compact Korean tooltip that keeps full date, BP/glucose units, and glucose measurement context visible.
- 2026-06-05: Added always-visible BP/glucose chart summary chips for period, units, record counts, and latest glucose context so chart interpretation does not depend on hover.
- 2026-06-05: Upgraded BP/glucose chart summary chips to include latest blood-pressure and glucose values with units and glucose context.
- 2026-06-05: Added visible BP/glucose chart line-legend chips for 수축기 혈압, 이완기 혈압, and 혈당 with shared chart colors and units.
- 2026-06-05: Split the BP/glucose chart into separate left/right Y axes labeled blood pressure `mmHg` and glucose `mg/dL` so mixed units are not implied to share one scale.
- 2026-06-05: Added a collapsible BP/glucose chart source-data list that exposes date-by-date plotted values with units and glucose context for touch and screen-reader review.
- 2026-06-05: Added adult-common BP/glucose assessment and official source labels to the collapsible chart source-data rows.
- 2026-06-05: Split low glucose under 70 mg/dL and marked hyperglycemia at 250 mg/dL or higher into separate KDCA source-backed standards before profile diabetes/screening glucose defaults.
- 2026-06-05: Added standards quick-filter summary chips for displayed criteria, risk-highlight rows, sex-specific criteria, and official-source counts.
- 2026-06-05: Added the same selected-range summary lines to copied Korean standards text so clinic-prep copies preserve the visible filter context.
- 2026-06-05: Made Korean standards copy success feedback echo the selected summary as compact visible confirmation.
- 2026-06-05: Added the selected summary to Korean standards copy button aria-label/title so the copy scope is clear before activation.
- 2026-06-05: Added the visible care-queue source-count summary to queue copy aria-label/title, copied checklist header, and post-copy status.
- 2026-06-04: Added BP units and Korean glucose measurement-context labels to CSV vital rows.
- 2026-06-04: Hardened care-queue row text wrapping for long source-backed detail and URLs.
- 2026-06-04: Added the profile-based cervical screening quick-check as a neutral source-backed care queue item.
- 2026-06-04: Added source-backed infection, lymphedema, and cervical urinary/bowel/bleeding contact-threshold symptom records to the care queue.
- 2026-06-04: Clarified cervical screening quick-check wording with the official 산정특례기간-based deferment condition for patients already treated for the same cancer.
- 2026-06-04: Clarified HPV vaccine guidance as prevention-only while preserving the need to continue regular cervical screening after vaccination.
- 2026-06-04: Clarified the HPV clinician-question draft so exported clinic-prep text asks how to explain continued cervical screening after vaccination.
- 2026-06-04: Added a source-backed cervical screening-versus-diagnostic-test clinician-question draft from the National Cancer Center early-diagnosis/prevention PDF.
- 2026-06-04: Added cervical suspected-symptom diagnostic-test checks for Pap, HPV, colposcopy, biopsy, transvaginal ultrasound, and pelvic MRI as clinician-confirmation prompts.
- 2026-06-04: Added a cervical stage-explanation record check sourced from the National Cancer Center early-diagnosis/prevention PDF and framed as care-team confirmation, not self-staging.
- 2026-06-04: Added a visible item count to the cervical record-check heading so the growing source-backed checklist is easier to scan.
- 2026-06-04: Added cervical cytology preparation notes for period timing, optional HPV co-test cost, sexual-experience consultation, and hysterectomy-history confirmation.
- 2026-06-04: Propagated cervical diagnostic-test preparation prompts into copied clinic-prep text, Markdown, CSV, and caregiver HTML exports with item-level source evidence.
- 2026-06-04: Added source-backed lymphedema infection and worsening-signal notes for skin redness, heat, pain, wounds, and sudden hardening after pelvic lymph-node treatment.
- 2026-06-04: Added a profile anchor and empty care-queue recovery link for enabling cancer-care mode.
- 2026-06-04: Added `근거:`/`출처:` marker counts to export preview summaries so source-backed packets can be checked before download.
- 2026-06-04: Hardened export preview summary chip wrapping so the source-marker count owns a full row on narrow screens.
- 2026-06-05: Added export preview line/character/byte/source-marker summary to copy, print, and download aria-label/title text plus action feedback.
- 2026-06-05: Changed stale-preview fresh action visible labels from generic `새 미리보기` to state-specific labels for caregiver setting, caregiver record, visit-summary range, visit-summary record, and CSV record changes.
- 2026-06-05: Added copied item/source-count summaries to the cervical cancer care note visible copy helper, button aria-label/title, and post-copy status.
- 2026-06-05: Added cervical cancer care note top summary chips for item/source counts before the dense checklist.
- 2026-06-05: Added official-source counts to the cervical cancer care note visible source-list heading and copied source-list heading.
- 2026-06-05: Added saved-question copy action summaries to button aria-label/title text and post-copy status feedback.
- 2026-06-05: Added the same saved-question action summary to copied question text so clinic-prep text preserves priority, answer status, evidence, and answer-memo scope.
- 2026-06-05: Rendered saved-question answer memos as labeled `답변 메모` rows with wrapped text.
- 2026-06-05: Added saved-question panel summary chips for total count, status mix, source-backed questions, and answer memos.
- 2026-06-05: Added saved-vital panel summary chips for total count, BP/glucose type mix, and ok/watch/risk/neutral assessment mix.
- 2026-06-05: Added visit-panel summary chips for total visits, upcoming appointments, 14-day reminder-window appointments, and summary/plan notes.
- 2026-06-05: Added saved-symptom panel summary chips for total count, severity mix, source-backed records, and care-queue candidates.
- 2026-06-05: Added saved-lab panel summary chips for total count, low/high/normal/reference-missing mix, source-backed records, and follow-up question candidates.
- 2026-06-05: Added food-judgment summary chips for matched item count, support/limit/care-team categories, and unique official-source count.
- 2026-06-05: Added saved-document panel summary chips for total count, review-status mix, open next-action count, attachment-recovery count, and deleted-archive count.
- 2026-06-05: Split source-backed saved question card text into a visible question body plus a separate linked `근거:` evidence row.
- 2026-06-05: Split source-backed recent-timeline question text into an answer-status detail paragraph plus a separate linked `근거:` evidence row.
- 2026-06-05: Added recent-timeline summary chips for record-type counts and source-backed records.
- 2026-06-05: Added dashboard care queue summary chips for total, watch-tone, neutral schedule/general, and source-backed item counts.
- 2026-06-05: Extended dashboard care queue copy labels, copied text, and copy status with the same tone/source-backed summary.
- 2026-06-05: Split dashboard care queue URL-bearing `근거:` citations into compact linked official-source rows while keeping copied/exported queue text source-retaining.
- 2026-06-05: Added caregiver-share settings summary chips for preset intent, profile redaction, memo presence, included section count, and excluded section count.
- 2026-06-05: Extended caregiver share export/preview labels and status feedback with the same live share-scope summary.
- 2026-06-05: Extended backup export labels and status feedback with profile, record count, caregiver-share settings, and attachment filename scope.
- 2026-06-05: Extended backup import labels and success feedback with JSON validation, replacement scope, imported backup scope, and attachment filename reattachment boundaries.
- 2026-06-05: Extended visit-summary export/preview labels and status feedback with the selected 7/30/90-day/all-record range.
- 2026-06-05: Extended CSV export/preview labels and status feedback with record count, care queue, cervical reference, food check, standards/source rows, and local-path exclusion.
- 2026-06-05: Added CSV preview stale-record detection that blocks copy, print, and download until regeneration when CSV-relevant records change.
- 2026-06-05: Added visit-summary preview stale-record detection that blocks copy, print, and download until regeneration when Markdown-relevant records or the food query change.
- 2026-06-05: Added caregiver preview stale-record detection that blocks copy, print, and download until regeneration when shared records change.
- 2026-06-05: Made caregiver preview stale-record checks use the generated section scope and suppress duplicate record-stale alerts when only share settings changed.
- 2026-06-05: Fixed WKWebView select touch-target rendering by assigning explicit heights to the visit-summary range and caregiver preset selects.
- 2026-06-05: Made narrow export-preview stale-alert fresh-preview actions span the alert width so Korean labels do not collapse into tall narrow buttons.
- 2026-06-05: Made stale export-preview copy, print, and download controls expose the same action-plus-disabled-reason sentence in aria-label and hover title text.
- 2026-06-05: Applied the 44px mobile touch-target contract to visible buttons, form controls, disclosure summaries, checkbox labels, and official-source links across the app.
- 2026-06-05: Re-audited mobile official-source links and raised the remaining cervical, standards, metric, timeline, lab, and question source-link selectors to the 44px touch-target contract while preserving 28px right-pane targets.
- 2026-06-05: Added per-vital BP/glucose assessment, adult-common standard labels, and official-source evidence to direct Markdown, CSV, and caregiver HTML export rows.
- 2026-06-05: Locked HDL/GGT/Hgb/RBC/Hct sex-specific lab preset refresh feedback so profile-sex changes name the exact refreshed preset and 기준.
- 2026-06-05: Made sex-specific lab preset refresh update auto-filled memo applicability lines while preserving custom user memos.
- 2026-06-05: Aligned lab preset helper and preview copy with the range-plus-auto-memo refresh behavior.
- 2026-06-05: Aligned the lab preset preview accessibility label with the range-plus-memo criteria content.
- 2026-06-05: Added stateful accessible labels and hover titles to caregiver-share profile/section toggles and profile tracking toggles.
- 2026-06-05: Made the 1120px topbar stack into a grid so the page title does not collapse into vertical Korean text beside dense controls.
- 2026-06-05: Protected the desktop cmux right-pane topbar title column so the Korean page title stays on one readable line while dense actions wrap.
- 2026-06-05: Raised mobile standards-coverage, lab-preset, and vital-helper official-source links to the 44px touch-target contract.
- 2026-06-05: Raised the mobile BP/glucose chart source-data disclosure summary to the 44px touch-target contract.
- 2026-06-05: Added matching hover titles to repeated visit-range, caregiver-memo, chart-source, and saved-document edit controls.
- 2026-06-05: Added a matching hover title to the attachment image preview close action and made close report `이미지 미리보기 닫힘` instead of leaving the open-state status visible.
- 2026-06-05: Added filename-scoped aria-label/title text, clearer visible wording, and explicit cleared feedback to the document-draft attachment remove action.
- 2026-06-05: Added search/category/status-scoped aria-label/title text and clearer visible wording to the saved-document filter reset action.
- 2026-06-05: Recentered the saved-document search icon inside its input so the icon no longer protrudes below the 44px mobile field.
- 2026-06-05: Made topbar backup export/import visible labels say `백업 내보내기` and `백업 가져오기` while keeping the existing detailed aria/title scope text.
- 2026-06-05: Made the topbar manual save action visibly say `수동 저장` and raised caregiver memo preset/reset/preset-select controls to 40px in constrained right-pane layouts.
- 2026-06-05: Made the caregiver share export action visibly say `공유본 내보내기` while keeping the existing detailed aria/title share-scope summary.
- 2026-06-05: Made the visit-summary and CSV export actions visibly say `요약 내보내기` and `CSV 내보내기` while keeping their detailed aria/title scope summaries.
- 2026-06-05: Made caregiver memo preset buttons visibly include the action word as `식사 적용`, `증상 적용`, and `서류 적용`.
- 2026-06-05: Added stateful accessible labels and 44px mobile touch height to the symptom severity slider.
- 2026-06-05: Raised right-pane caregiver memo preset/reset/preset-select controls to 40px and added explicit intent labels/titles.
- 2026-06-05: Added dashboard open-question metric chips for priority mix and source-backed question count.
- 2026-06-05: Added linked official-source `근거:` labels to BMI, waist, blood-pressure, and glucose dashboard metric standard notes.
- 2026-06-05: Added direct body-temperature vital input, latest-temperature dashboard status, fever-contact care queue rows, and Markdown/CSV/caregiver/SQLite preservation for the National Cancer Center 38℃ cancer-patient infection contact standard.
- 2026-06-05: Added linked official-source evidence rows and source-backed summary counts to recent-timeline vital entries for BP, glucose, and temperature records.
- 2026-06-05: Added one-click source-backed copy for the dashboard BMI, waist, blood-pressure, and glucose metric standards with matching visible summary, accessible label, copied text, and copy status.
- 2026-06-05: Raised dashboard metric criteria copy buttons and official-source links to right-pane-friendly target heights without introducing overflow.
- 2026-06-05: Added compact current-sex waist/HDL/GGT/Hgb/RBC/Hct standard chips to the dashboard profile metric card.
- 2026-06-05: Added official-source evidence to dashboard profile sex-standard chip aria labels and hover titles.
- 2026-06-05: Added one-click source-backed copy for the dashboard profile sex-standard chips.
- 2026-06-05: Added source-backed CBC WBC/RBC/Hct/PLT helper ranges from Seoul Asan complete blood count reference data, including sex-specific RBC/Hct preset refresh, profile sex-standard chips, standards quick-filter copy, and export range rows.
- 2026-06-05: Added preset-derived official-source recovery for saved lab rows so older/direct-entered WBC-style records show source-backed lab cards, timeline evidence, care queue detail, questions, CSV, Markdown, and caregiver exports.
- 2026-06-05: Added a source-backed WBC/ANC low-lab context strip to the nutrition panel and carried the immune-food safety context through Markdown, CSV, and caregiver exports.
- 2026-06-05: Added a source-retaining nutrition-panel `질문 초안` action that moves matched food reasons and low-lab immune-food context into the editable pre-visit question draft.
- 2026-06-05: Updated the lab item direct-input placeholder so WBC/RBC/Hct/PLT examples stay discoverable even before a preset is selected.
- 2026-06-04: Added item-specific accessible names and hover titles to lab follow-up question buttons, including memo/evidence inclusion.
- 2026-06-04: Added item-specific accessible names and hover titles to saved-question status buttons.
- 2026-06-04: Added shared item/context-specific accessible names and hover titles for cervical-care official source links.
- 2026-06-05: Raised all right-pane cervical-care official-source links to at least 28px target height without changing medical wording.
- 2026-06-05: Raised the remaining right-pane standards, BP/glucose input-helper, and nutrition official-source links to at least 28px target height without changing medical wording.
- 2026-06-05: Converted saved-document next-action edits to a multiline control and wrapped standards applicability chips so 320px, 375px, and 760px mobile audits have no visible clipped text.
- 2026-06-05: Added document-specific `aria-label` and hover title text to saved-document and deleted-archive row actions.
- 2026-06-05: Made saved-document rows without an attachment visibly say `첨부 추가` while preserving document-specific aria/title context.
- 2026-06-05: Made recoverable saved-document delete actions visibly say `삭제 보관` while preserving the document-specific archive aria/title context.
- 2026-06-05: Added scoped `aria-label` and hover title text to stale-preview fresh action buttons.
- 2026-06-05: Made the remaining short dashboard/question action labels visible as `진료 큐 복사`, `질문 복사`, and `보류 처리` while preserving detailed aria-label/title context.
- 2026-06-05: Added scoped `aria-label` and hover title text to manual save, primary form actions, and document attachment selection.
- 2026-06-05: Added scoped `aria-label` and hover title text to visible inputs, selects, textareas, and hidden file inputs so repeated field labels carry section context.
- 2026-06-05: Aligned remaining button `aria-label`/title wording and raised compact cervical-note and question-status action heights above sub-32px desktop targets.
- 2026-06-05: Added destination-specific `aria-label` and hover title text to sidebar section links.
- 2026-06-05: Added hash-backed `aria-current` and visible active styling to sidebar section links.
- 2026-06-05: Extended sidebar active-section state to update on manual scroll as well as click/hash changes.
- 2026-06-05: Replaced dead/collapsed KDCA lipid and legacy KDA HDL source URLs with live official KDCA/KDA pages, then aligned lipid helper wording and export tests to those reachable sources.
- 2026-06-05: Added a source-backed late 장폐색·혈변·혈뇨 cervical record-check memo that preserves surgery/radiation timing and care-team contact-standard wording.
- 2026-06-05: Preserved late 장폐색·혈변·혈뇨 generated memo queue labels and official basis detail in dashboard/export care queues.
- 2026-06-05: Added scoped accessible labels and matching hover titles to disclosure summaries for cervical care lists, Korean-standard coverage, and rendered export raw HTML.
- 2026-06-05: Added action-context and disabled-reason parity to the caregiver-share reset button label and hover title.
- 2026-06-05: Added scoped accessible labels and matching hover titles to source-evidence and empty-queue recovery links.
- 2026-06-05: Matched hover titles to accessible names for shared and inline health-standard, cervical-care, food, care-queue, lab, immune-food, and profile-standard evidence labels.
- 2026-06-05: Hid backing file inputs from the accessibility tree so backup and document attachment flows expose only their visible, full-size buttons.
- 2026-06-05: Raised the nutrition `질문 초안` action to the 44px mobile target floor while keeping the compact inline style.
- 2026-06-05: Disambiguated caregiver memo preset and export-preview action accessible names so exact memo, preview, refresh, and download controls resolve to one target each.
- 2026-06-05: Made export-preview copy fail closed with an explicit unsupported-browser status when the Clipboard API is unavailable.
- 2026-06-05: Ensured the Tauri SQLite `app_state` table is created before app load/save so first-run persistence does not fail before hydration.
- 2026-06-05: Added UI-surface context to repeated health-standard source link accessible names so dashboard, quick-range, and coverage links resolve uniquely.
- 2026-06-05: Hardened browser storage persistence so blocked or quota-limited localStorage falls back to memory instead of breaking hydrate/save.
- 2026-06-05: Made save-status labels distinguish SQLite, browser storage, and temporary memory backends so blocked-storage fallback is not misreported as browser-saved.
- 2026-06-05: Hardened persisted AppState normalization so valid JSON with null or malformed field shapes falls back to defaults instead of breaking hydration.
- 2026-06-05: Guarded persisted document history arrays so malformed nested history values do not break document rendering or normalized mirrors.
- 2026-06-05: Hardened caregiver-share settings normalization so malformed persisted memo, preset, redaction, or section values fall back safely.
- 2026-06-05: Normalized malformed persisted record scalar fields at hydration so bad dates, enum values, attachment fields, history entries, numbers, and labels cannot reach render or mirror paths.
- 2026-06-05: Made backup import/export scope summaries count only usable object records so malformed array junk does not overstate imported or exported record counts.
- 2026-06-05: Split stable health-standards, cervical-care, and export helper modules into named production chunks so the main app chunk stays below Vite's warning threshold.
- 2026-06-05: Corrected active runtime evidence back to CareVault's fixed local Vite/Tauri port `1420` after cmux verification.
- 2026-06-05: Guarded SQLite mirror/search count rows so malformed plugin result containers fall back to zero instead of breaking normalized status reads.
- 2026-06-05: Guarded SQLite schema column checks so malformed `PRAGMA table_info` result containers do not break normalized mirror table migration.
- 2026-06-05: Tightened SQLite count parsing to accept only non-negative safe integer counts, rejecting partial strings, decimals, negatives, and unsafe integers.
- 2026-06-05: Tightened saved lab number parsing so partial text like `3.4 low` no longer becomes a false low/high lab assessment in summaries, queues, exports, or immune-food context.
- 2026-06-05: Tightened cervical screening age parsing so partial or non-integer profile age text no longer becomes a false national-screening eligibility result.
- 2026-06-05: Tightened profile metric parsing so partial height, weight, or waist text no longer feeds false BMI or waist assessments in dashboard and visit summaries.
- 2026-06-05: Clamped restored symptom severity values to the 0-10 slider scale so malformed backups cannot create impossible symptom states.
- 2026-06-05: Dropped non-positive restored vital measurements during hydration so malformed backups cannot create impossible blood pressure, glucose, or temperature readings.
- 2026-06-05: Dropped malformed restored record dates during hydration so invalid backup dates cannot distort sorting, reminders, or visit-summary range filters.
- 2026-06-05: Dropped malformed restored document history timestamps during hydration so impossible change-log times cannot leak into saved-document history displays.
- 2026-06-05: Dropped unknown restored caregiver-share preset IDs during hydration so the preset select never carries a retired or invalid option value.
- 2026-06-05: Tightened vital-entry number input parsing to reject hex, exponent, and unit-suffixed strings before blood-pressure, glucose, or temperature values are saved.
- 2026-06-05: Tightened profile number input parsing to reject hex, exponent, and unit-suffixed strings before age, height, weight, or waist values are saved or displayed.
- 2026-06-05: Trimmed restored profile number strings during hydration so padded age, height, weight, or waist backups become stable number-input values.
- 2026-06-05: Verified the Tauri desktop SQLite mirror and normalized search readback with live UI evidence plus direct sandbox database counts.
- 2026-06-05: Centralized saved-attachment missing, opener-failure, check-failure, and image-preview-failure recovery statuses so cards, history entries, and reattachment prompts stay aligned.
- 2026-06-05: Added disposable Tauri runtime adapter fixtures for missing-file, opener-failure, and image-preview conversion-failure recovery, and made rendered image load errors mark the saved card for reattachment.
- 2026-06-05: Verified live Tauri desktop missing-file attachment recovery with a seeded sandbox database, in-card reattachment prompt, direct SQLite status/history readback, and post-run database restore.
- 2026-06-05: Added saved-image preview byte-signature and bounded decode preflight coverage, then verified live Tauri invalid-image recovery with a picker-granted bad PNG, JSON `app_state` readback, normalized attachment/document/history rows, and post-run database restore.
- 2026-06-05: Ordered Tauri SQLite saves so normalized mirror data writes before the compatible JSON `app_state` upsert, with bounded busy-timeout/retry handling for `SQLITE_BUSY` save contention.
- 2026-06-05: Added a module-level latest-only persisted save queue so autosave and manual-save calls serialize across React dev StrictMode remounts and stale queued saves cannot overwrite newer state.
- 2026-06-05: Coalesced consecutive duplicate document-history entries so repeated attachment preview failures or retries do not inflate the saved-document audit trail.
- 2026-06-05: Tightened normalized SQLite mirror regression coverage so deleted-archive attachment and document-history rows must carry `is_deleted = 1`.
- 2026-06-05: Verified live Tauri archive and restore SQLite readback for active/deleted document counts, attachment/history `is_deleted` flags, and post-run sandbox database restore.
- 2026-06-05: Reserved saved-document desktop action-column width so recoverable archive buttons keep the full `삭제 보관` label instead of collapsing to `삭제`.
- 2026-06-05: Added a runtime doctor preflight for current-source desktop verification so stale port 1420 listeners, installed release windows, and leftover CareVault dev processes are caught before live evidence is trusted.
- 2026-06-05: Added `npm run tauri:dev:clean` so current-source desktop runs go through the runtime doctor before `tauri dev` starts.
- 2026-06-05: Added `npm run runtime:doctor:dev` active-session verification so live Tauri QA must prove this repo's Vite listener, Tauri CLI, and debug binary are running while no release-bundle `CareVault.app` shadow is present.
- 2026-06-05: Bound current-source dev to `127.0.0.1:1420` and aligned the Tauri dev URL so the single existing cmux `암관리` browser pane can reach the same server as Tauri dev.
- 2026-06-05: Added `npm run runtime:doctor:test` fake-process fixtures for clean mode, active-dev mode, release-bundle shadowing, wrong port ownership, and Tauri's relative `target/debug/carevault` command form.
- 2026-06-05: Fixed sidebar hash deep links so direct URLs such as `#documents` scroll to the intended section after React render and persisted-state hydration, with the active nav state kept in sync.
- 2026-06-05: Made saved-document summary chips keep zero-count `첨부 복구 없음` and `삭제 보관 없음` states visually neutral so only real recovery or archive counts receive warning/archive emphasis.
- 2026-06-05: Gave native select controls explicit desktop and mobile heights so WKWebView keeps document form, filter, and update selects aligned with neighboring input hit targets.
- 2026-06-05: Raised compact metric, timeline, lab, and question source-evidence links to the 28px right-pane target height so saved lab source links no longer render as 16px text-only targets.
- 2026-06-05: Extracted saved-document search/category/status filtering into a regression-tested helper so no-match reset behavior, attachment/status text search, and accidental surrounding spaces stay stable.
- 2026-06-05: Added date and row-position context to recent-timeline source-evidence link labels so repeated same-day generated records stay uniquely addressable.
- 2026-06-05: Raised profile mode toggle labels to the 40px desktop control rhythm while preserving the 44px mobile checkbox-label contract.
- 2026-06-05: Reordered the sidebar to match actual page flow: records, symptom/question care plan, labs, nutrition, then documents.
- 2026-06-05: Added source-backed cervical warning-record field cards for when/what/how-much/with-what to record and preserved them in copied text, Markdown, CSV, and caregiver HTML exports.
- 2026-06-05: Made cervical warning-card recording drafts reuse the same warning-record field guide while preserving one parseable official source line.
- 2026-06-05: Split care-queue copied detail text into readable memo/assessment/record-basis/evidence lines and made long copy status chips wrap without mobile overflow.
- 2026-06-04: Added a National Cancer Center pain-assessment symptom template for recording pain location, 0-10 intensity, timing, worsening/easing factors, and analgesic effect without medication instructions.
- 2026-06-04: Made CSV and Markdown direct symptom rows convert generated symptom-template `출처:` lines into separated `근거:` evidence, matching care queue and caregiver exports.
- 2026-06-04: Made CSV, Markdown, and caregiver direct symptom rows share one label rule for generic symptoms, structured cervical warning drafts, and generated cervical memo drafts.
- 2026-06-04: Added the same symptom record labels to the latest-symptom metric card and recent timeline so generated cervical memo records are visible before export.
- 2026-06-04: Added a symptom-form save preview for the same record-label rule before adding generated cervical memo records.
- 2026-06-04: Made the symptom form primary save button and saved-status feedback use the same record-label rule as preview and exports.
- 2026-06-04: Added a source-evidence hint to symptom-form record previews when generated drafts keep a parseable `출처:` line.
- 2026-06-04: Added the same source-evidence hint to saved symptom labels in the latest-symptom metric and timeline.
- 2026-06-05: Replaced the latest-symptom metric's generic source hint with a compact linked `근거:` source label.
- 2026-06-04: Classified source-backed cervical general-warning and treatment-side-effect symptom records as cervical warning records even when older records lack the explicit warning-draft marker.
- 2026-06-04: Added Markdown, CSV, and caregiver HTML regression coverage for markerless source-backed cervical warning record labels in direct symptom rows.
- 2026-06-04: Added a screen-reader label plus explicit `aria-label` and title to the saved-document search input while keeping the compact icon-only search field.
- 2026-06-06: Made lab-entry required-field feedback name the specific missing side, so partial drafts like a filled test name with an empty value say `검사 값을 입력해주세요.` locally and globally.
- 2026-06-06: Made generated lab follow-up question actions become `질문 추가됨` after the matching question exists, preventing duplicate clinician-question drafts across autosave and reload.
- 2026-06-06: Made the current saved-question status button disabled with a `현재 상태` accessible label so question cards do not offer misleading no-op status changes.
- 2026-06-06: Aligned caregiver-share preview stale detection, reset enablement, and settings differences with the trimmed memo text that caregiver HTML exports actually render, so whitespace-only memo edits do not block preview actions.
- 2026-06-06: Made direct text-file exports fail closed in Safari/WebKit download-hostile surfaces by copying the export content to the clipboard with explicit fallback status instead of navigating the app to a `blob:` document.
- 2026-06-06: Made every external link in caregiver-share HTML exports open with `target="_blank"` and `rel="noreferrer"` so official-source navigation does not replace the share document.
- 2026-06-06: Required a typed food query before the nutrition-panel `질문 초안` action can appear, while still allowing low-lab immune-food context to generate a clinician question for unclassified typed foods.
- 2026-06-06: Made export-preview print-window failure feedback preserve the same preview format, line, character, byte, and source-marker summary as successful print feedback.
- 2026-06-06: Made document attachment picker failure feedback name the browser file-name fallback and preserve the current attachment name/status context.
- 2026-06-06: Made export-preview close feedback report the closed preview format, line, character, byte, and source-marker summary instead of leaving the previous generated-preview status visible.
- 2026-06-06: Made saved-document reattachment failures show the same document-specific feedback inside the affected row and in the global save chip, matching successful reattachment feedback.
- 2026-06-06: Made saved-document attachment image-load and removal failures also update the affected row feedback, so recovery prompts, card status, and global save feedback stay aligned.
- 2026-06-06: Made manual save flush pending saved-document next-action edits into the document history before persisting, covering focused textareas that have not yet blurred.
- 2026-06-06: Made manual-save success feedback preserve the pending action message before the storage label, matching autosave feedback for document-history and other row actions.
- 2026-06-06: Made redacted caregiver-share preview stale detection ignore hidden profile-only fields such as name, height, weight, and waist while still tracking sex, diabetes, and cervical-screening profile facts that affect exported content.

## Do's and Don'ts

- Do keep source labels visible.
- Do keep status feedback immediate.
- Do keep Korean controls compact and readable.
- Do not hide medical caveats behind generic wellness phrasing.
- Do not imply the app diagnoses, prescribes, or replaces care-team guidance.
