# CareVault External Review Report Template

This folder contains a draft JSON template for an external clinician/source
review report. It is a reviewer handoff artifact, not a clinical approval.

Use the export command before sending a copy to a reviewer:

```bash
CAREVAULT_EXTERNAL_REVIEW_TEMPLATE_PATH=/tmp/carevault-external-review.json \
npm run clinical:external-review:template
```

The command first runs `npm run clinical:external-review:template:test` through
the local Vitest binary. That test checks the template schema, required review
IDs, reviewed-artifact placeholders, draft fail-closed defaults,
source-registry total/error/warning counts, and workflow surface count against
the current review packet outputs.

The reviewer should fill a copy of the JSON, not this checked-in template.
Keep `schema` unchanged. Set `status` to `passed` only after the actual review
has been completed. Set every `reviewed_artifacts[*].status` to `reviewed` only
after checking the clinical review packet, clinical workflow review packet, and
objective readiness report. Keep `required_check_ids` covering both
`clinician-source-review` and `real-workflow-review`. Remove those IDs from
`unresolved_required_check_ids` only when the source registry and real patient
workflow review are complete.

Set every attestation to `true` only after reviewing the source registry, real
workflow evidence, non-diagnosis boundary, and cervical-cancer plus
hypertension/diabetes scope. The final gate requires zero open critical and
major findings. The source-registry total/error/warning counts and workflow
surface count must match the current review packets.

After receiving the filled report, verify it with:

```bash
CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/path/to/filled-external-review.json \
npm run clinical:external-review:report
```

When a private HWP/HWPX smoke report is also available, verify both remaining
evidence reports together:

```bash
CAREVAULT_HWP_SMOKE_REPORT_PATH=/path/to/carevault-hwp-smoke-report.json \
CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/path/to/filled-external-review.json \
npm run objective:readiness:complete
```
