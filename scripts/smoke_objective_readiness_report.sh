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

print_hwp_report_summary() {
  python3 - "$CAREVAULT_HWP_SMOKE_REPORT_PATH" <<'PY'
import json
import pathlib
import sys

report = json.loads(pathlib.Path(sys.argv[1]).read_text())
samples = report.get("samples", [])
parsed_counts = [sample.get("parsed_character_count") for sample in samples]
minimum_observed = min(parsed_counts) if parsed_counts else 0
sample_basenames = ", ".join(sample.get("basename", "") for sample in samples)

print(f"Accepted HWP smoke evidence: {report.get('sample_count')} sample(s)")
print(f"Minimum parsed chars: {report.get('minimum_parsed_chars')}")
print(f"Minimum observed parsed chars: {minimum_observed}")
print(f"Expected term count: {report.get('expected_term_count')}")
print(f"Sample basenames: {sample_basenames}")
PY
}

CAREVAULT_REQUIRE_HWP_SMOKE_REPORT=1 \
  CAREVAULT_HWP_SMOKE_REPORT_JSON="$(cat "$CAREVAULT_HWP_SMOKE_REPORT_PATH")" \
  "$VITEST_BIN" run src/carevaultObjectiveReadinessReportSmoke.test.ts

print_hwp_report_summary

printf 'Objective readiness report smoke passed for basename-only HWP evidence report.\n'
