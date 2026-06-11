#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VITEST_BIN="$ROOT_DIR/node_modules/.bin/vitest"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json npm run objective:readiness:report

This command connects the private HWP/HWPX smoke report to the objective
readiness gate. The report must be the basename-only JSON written by
CAREVAULT_HWP_SMOKE_REPORT_PATH during npm run hwp:smoke.
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

if [[ ! -r "${CAREVAULT_HWP_SMOKE_REPORT_PATH}" ]]; then
  printf 'FAIL: configured HWP smoke report is not readable.\n' >&2
  exit 2
fi

if [[ ! -x "$VITEST_BIN" ]]; then
  printf 'FAIL: local Vitest binary is missing; run npm install first.\n' >&2
  exit 2
fi

CAREVAULT_REQUIRE_HWP_SMOKE_REPORT=1 \
  CAREVAULT_HWP_SMOKE_REPORT_JSON="$(cat "$CAREVAULT_HWP_SMOKE_REPORT_PATH")" \
  "$VITEST_BIN" run src/carevaultObjectiveReadinessReportSmoke.test.ts

printf 'Objective readiness report smoke passed for basename-only HWP evidence report.\n'
