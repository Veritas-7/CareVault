#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR=/tmp/carevault-objective-readiness-handoff \
  npm run objective:readiness:handoff

This command creates a path-safe operator handoff bundle for the two remaining
objective readiness blockers. It validates and exports the private HWP/HWPX
smoke handoff, exports the external review packet, exports the current blocked
objective readiness report, and writes the final evidence command sequence.

It does not create or run a real private HWP/HWPX sample and does not create
external clinician/source approval.
EOF
}

case "${1:-}" in
  -h | --help)
    print_usage
    exit 0
    ;;
  "")
    ;;
  *)
    print_usage >&2
    exit 2
    ;;
esac

if [[ -z "${CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR:-}" ]]; then
  printf 'FAIL: CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR is required.\n' >&2
  print_usage >&2
  exit 2
fi

HANDOFF_PARENT="$(dirname "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR")"
if [[ ! -d "$HANDOFF_PARENT" || ! -w "$HANDOFF_PARENT" ]]; then
  printf 'FAIL: objective readiness handoff parent directory is not writable.\n' >&2
  exit 2
fi

if [[ -e "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR" && ! -d "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR" ]]; then
  printf 'FAIL: objective readiness handoff output path is not a directory.\n' >&2
  exit 2
fi

mkdir -p "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR"

if [[ ! -w "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR" ]]; then
  printf 'FAIL: objective readiness handoff directory is not writable.\n' >&2
  exit 2
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

HWP_HANDOFF="$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR/carevault-private-hwp-smoke-handoff.md"
EXTERNAL_PACKET_DIR="$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR/carevault-external-review-packet"
READINESS_MARKDOWN="$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR/carevault-objective-readiness-report.md"
READINESS_JSON="$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR/carevault-objective-readiness-report.json"
FINAL_HANDOFF="$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR/carevault-final-readiness-handoff.md"

CAREVAULT_HWP_HANDOFF_PATH="$HWP_HANDOFF" \
  bash "$ROOT_DIR/scripts/export_hwp_smoke_handoff.sh" > "$TMP_DIR/hwp-handoff.out"

CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$EXTERNAL_PACKET_DIR" \
  bash "$ROOT_DIR/scripts/export_external_review_packet.sh" > "$TMP_DIR/external-review-packet.out"

CAREVAULT_OBJECTIVE_READINESS_REPORT_PATH="$READINESS_MARKDOWN" \
CAREVAULT_OBJECTIVE_READINESS_JSON_PATH="$READINESS_JSON" \
  bash "$ROOT_DIR/scripts/export_objective_readiness_report.sh" > "$TMP_DIR/objective-readiness.out"

cat > "$FINAL_HANDOFF" <<'EOF'
# CareVault Final Readiness Evidence Handoff

This bundle prepares the two external inputs that still block CareVault
objective readiness. It is an operator handoff, not private sample evidence,
not an external clinician/source review, and not a production medical readiness
approval.

## Bundle Contents

- `carevault-private-hwp-smoke-handoff.md`: private HWP/HWPX/HWPML smoke runbook.
- `carevault-external-review-packet/`: current clinical source, workflow, objective-readiness, template, and hash handoff files for reviewer use.
- `carevault-objective-readiness-report.md`: current command-generated blocked readiness report.
- `carevault-objective-readiness-report.json`: machine-readable readiness report.
- `carevault-final-readiness-handoff.md`: this final evidence sequence.

## Current Blocking Requirements

- `real-private-hwp-hwpx-sample`
- `external-clinician-source-review`

## Step 1: Run Real Private HWP/HWPX Evidence

Run one of these from the CareVault repo root when the real private medical
sample or sample directory is available. The report must stay basename-only.

```bash
CAREVAULT_HWP_SAMPLE_PATH=/path/to/private-sample.hwp \
CAREVAULT_HWP_SAMPLE_TERMS='자궁경부암,혈압,당뇨' \
CAREVAULT_HWP_SMOKE_REPORT_PATH=/path/to/carevault-hwp-smoke-report.json \
npm run hwp:smoke
```

```bash
CAREVAULT_HWP_SAMPLE_DIR=/path/to/private-samples \
CAREVAULT_HWP_SAMPLE_TERMS='자궁경부암,혈압,당뇨' \
CAREVAULT_HWP_SMOKE_REPORT_PATH=/path/to/carevault-hwp-smoke-report.json \
npm run hwp:smoke
```

## Step 2: Provide External Review Packet

Use the included packet, or regenerate the packet from current source before
review if the repo changed.

```bash
CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/path/to/carevault-external-review-packet \
npm run clinical:external-review:packet
```

The reviewer fills `carevault-external-review-report-template.json` after
reviewing the packet artifacts and copying the hashes/byte counts from
`reviewer-handoff.md`.

## Step 3: Verify External Review Evidence

```bash
CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/path/to/carevault-external-review-packet \
CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/path/to/filled-external-review.json \
npm run clinical:external-review:report
```

## Step 4: Verify Final Objective Readiness Evidence

```bash
CAREVAULT_HWP_SMOKE_REPORT_PATH=/path/to/carevault-hwp-smoke-report.json \
CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/path/to/carevault-external-review-packet \
CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/path/to/filled-external-review.json \
npm run objective:readiness:complete
```

Only after the final command prints `Objective readiness complete: pass` and
`Blocking requirements: none` can these two blockers be treated as resolved.
EOF

if grep -R -n -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR" >&2; then
  printf 'FAIL: objective readiness handoff bundle would include a local path or attachment path field.\n' >&2
  exit 2
fi

printf 'Objective readiness handoff bundle written.\n'
