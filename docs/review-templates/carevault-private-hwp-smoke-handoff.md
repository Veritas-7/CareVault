# CareVault Private HWP/HWPX Smoke Handoff

This handoff is for running a real private HWP/HWPX/HWPML parser smoke through
the same Tauri Rust command boundary used by CareVault. It is not evidence by
itself. It becomes readiness evidence only after `npm run hwp:smoke` parses a
real private sample and writes a basename-only success report.

## Privacy Boundary

- Use a local private sample file or a local private sample directory.
- Do not paste private medical text into issue trackers, chat, or this repo.
- The smoke output prints sample basenames only.
- The optional report stores basenames, extensions, status, sample count, the
  minimum parsed character threshold, expected-term count, and objective
  term-group coverage, plus each sample's observed parsed character count.
- The report must not contain full local paths.

## Single File Smoke

```bash
CAREVAULT_HWP_SAMPLE_PATH=/path/to/private-sample.hwp \
CAREVAULT_HWP_SAMPLE_TERMS='자궁경부암,혈압,당화혈색소' \
CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json \
npm run hwp:smoke
```

## Directory Batch Smoke

```bash
CAREVAULT_HWP_SAMPLE_DIR=/path/to/private-samples \
CAREVAULT_HWP_SAMPLE_TERMS='자궁경부암,혈압,당화혈색소' \
CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json \
npm run hwp:smoke
```

`CAREVAULT_HWP_SAMPLE_TERMS` is optional for parser-only smoke, but required for
objective-readiness evidence because this objective must prove that a real
private sample checks cervical-cancer, hypertension, and diabetes terms.

## Readiness Report Check

After `npm run hwp:smoke` writes the report, verify that the objective-readiness
gate accepts it:

```bash
CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json \
npm run objective:readiness:report
```

The objective is still not complete after this check unless external
clinician/source review evidence is also supplied.

## Final Combined Evidence Check

When an external review report is also available, verify both reports together:

```bash
CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/tmp/carevault-external-review-packet \
CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json \
CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/tmp/carevault-external-review.json \
npm run objective:readiness:complete
```

The combined command fails unless the private HWP/HWPX smoke report and external
review report both satisfy the readiness gate.
