#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VITEST_BIN="$ROOT_DIR/node_modules/.bin/vitest"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/tmp/carevault-external-review-packet \
  CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/tmp/carevault-external-review.json \
  npm run objective:readiness:complete

This final command-only gate reads both evidence reports, verifies the external
review report against the reviewer packet directory, and fails unless the
CareVault objective readiness report reaches Status: pass. It does not create
private HWP evidence or clinical approval; it only verifies supplied evidence.
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

if [[ -z "${CAREVAULT_HWP_SMOKE_REPORT_PATH:-}" ]]; then
  printf 'FAIL: CAREVAULT_HWP_SMOKE_REPORT_PATH is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ -z "${CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH:-}" ]]; then
  printf 'FAIL: CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ ! -r "${CAREVAULT_HWP_SMOKE_REPORT_PATH}" ]]; then
  printf 'FAIL: configured HWP smoke report is not readable.\n' >&2
  exit 2
fi

if [[ ! -r "${CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH}" ]]; then
  printf 'FAIL: configured external review report is not readable.\n' >&2
  exit 2
fi

if [[ -z "${CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR:-}" ]]; then
  printf 'FAIL: CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ ! -d "${CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR}" || ! -r "${CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR}" ]]; then
  printf 'FAIL: configured external review packet dir is not readable.\n' >&2
  exit 2
fi

if [[ ! -x "$VITEST_BIN" ]]; then
  printf 'FAIL: local Vitest binary is missing; run npm install first.\n' >&2
  exit 2
fi

node "$ROOT_DIR/scripts/verify_external_review_packet_hashes.mjs" \
  "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" \
  "$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR"

CAREVAULT_REQUIRE_COMPLETION_EVIDENCE=1 \
  CAREVAULT_HWP_SMOKE_REPORT_JSON="$(cat "$CAREVAULT_HWP_SMOKE_REPORT_PATH")" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON="$(cat "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH")" \
  "$VITEST_BIN" run src/carevaultObjectiveCompletionEvidenceSmoke.test.ts

printf 'Objective readiness completion evidence smoke passed.\n'
