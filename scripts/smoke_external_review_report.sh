#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VITEST_BIN="$ROOT_DIR/node_modules/.bin/vitest"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/tmp/carevault-external-review.json npm run clinical:external-review:report

This command connects external clinician/source review evidence to the
objective readiness gate. It is a command-only verification bridge and does not
claim production medical approval by itself.
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

if [[ -z "${CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH:-}" ]]; then
  printf 'FAIL: CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ ! -r "${CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH}" ]]; then
  printf 'FAIL: configured external review report is not readable.\n' >&2
  exit 2
fi

if [[ ! -x "$VITEST_BIN" ]]; then
  printf 'FAIL: local Vitest binary is missing; run npm install first.\n' >&2
  exit 2
fi

CAREVAULT_REQUIRE_EXTERNAL_REVIEW_REPORT=1 \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON="$(cat "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH")" \
  "$VITEST_BIN" run src/carevaultExternalReviewReportSmoke.test.ts

printf 'External clinician/source review report smoke passed.\n'
