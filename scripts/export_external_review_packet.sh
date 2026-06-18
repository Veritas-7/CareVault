#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ESBUILD_BIN="$ROOT_DIR/node_modules/.bin/esbuild"
VITEST_BIN="$ROOT_DIR/node_modules/.bin/vitest"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/tmp/carevault-external-review-packet \
  npm run clinical:external-review:packet

Optional evidence inputs:
  CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/tmp/carevault-external-review.json
  CAREVAULT_CLINICAL_SOURCE_REPORT_PATH=/tmp/carevault-clinical-source-url-smoke.json

This command exports the current path-safe external review packet: clinical
review packet, clinical workflow review packet, clinical source URL reachability
report, objective readiness report, and the draft external review JSON template.
If CAREVAULT_CLINICAL_SOURCE_REPORT_PATH is unset, it runs the clinical source
URL smoke and includes the generated report. It does not create private HWP
evidence or clinical approval.
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

check_readable_input() {
  local env_name="$1"
  local label="$2"
  local value="${!env_name:-}"

  [[ -n "$value" ]] || return 0
  if [[ ! -r "$value" ]]; then
    printf 'FAIL: configured %s is not readable.\n' "$label" >&2
    exit 2
  fi
}

if [[ -z "${CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR:-}" ]]; then
  printf 'FAIL: CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR is required.\n' >&2
  print_usage >&2
  exit 2
fi

PACKET_PARENT="$(dirname "$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR")"
if [[ ! -d "$PACKET_PARENT" || ! -w "$PACKET_PARENT" ]]; then
  printf 'FAIL: external review packet parent directory is not writable.\n' >&2
  exit 2
fi

if [[ ! -x "$ESBUILD_BIN" ]]; then
  printf 'FAIL: local esbuild binary is missing; run npm install first.\n' >&2
  exit 2
fi

if [[ ! -x "$VITEST_BIN" ]]; then
  printf 'FAIL: local Vitest binary is missing; run npm install first.\n' >&2
  exit 2
fi

check_readable_input CAREVAULT_HWP_SMOKE_REPORT_PATH "HWP smoke report"
check_readable_input CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH "external review report"
check_readable_input CAREVAULT_CLINICAL_SOURCE_REPORT_PATH "clinical source URL smoke report"

"$VITEST_BIN" run src/carevaultExternalReviewTemplate.test.ts src/carevaultObjectiveReadiness.test.ts >&2

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [[ -z "${CAREVAULT_CLINICAL_SOURCE_REPORT_PATH:-}" ]]; then
  export CAREVAULT_CLINICAL_SOURCE_REPORT_PATH="$TMP_DIR/clinical-source-url-smoke-report.json"
  bash "$ROOT_DIR/scripts/smoke_clinical_source_urls.sh" >&2
fi

"$ESBUILD_BIN" \
  "$ROOT_DIR/scripts/external_review_packet_export_cli.ts" \
  --bundle \
  --platform=node \
  --format=esm \
  --log-level=error \
  --outfile="$TMP_DIR/external-review-packet-export.mjs"

node "$TMP_DIR/external-review-packet-export.mjs"
