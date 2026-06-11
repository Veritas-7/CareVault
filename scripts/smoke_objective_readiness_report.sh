#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VITEST_BIN="$ROOT_DIR/node_modules/.bin/vitest"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_HWP_SMOKE_REPORT_PATH=/tmp/carevault-hwp-smoke-report.json npm run objective:readiness:report

Optional output:
  CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH=/tmp/carevault-hwp-smoke-verify.json

This command connects the private HWP/HWPX smoke report to the objective
readiness gate. The report must be the basename-only JSON written by
CAREVAULT_HWP_SMOKE_REPORT_PATH during npm run hwp:smoke. When
CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH is set, it writes a path-safe
machine-readable verification report after the readiness gate accepts the HWP
evidence.
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

if [[ -n "${CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH:-}" ]]; then
  verify_json_parent="$(dirname "$CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH")"
  if [[ ! -d "$verify_json_parent" || ! -w "$verify_json_parent" ]]; then
    printf 'FAIL: HWP smoke report verify JSON parent is not writable.\n' >&2
    exit 2
  fi
  if [[ -e "$CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH" && ! -f "$CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH" ]]; then
    printf 'FAIL: HWP smoke report verify JSON output path is not a file.\n' >&2
    exit 2
  fi
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

write_hwp_verify_json() {
  [[ -n "${CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH:-}" ]] || return 0

  python3 - "$CAREVAULT_HWP_SMOKE_REPORT_PATH" "$CAREVAULT_HWP_SMOKE_REPORT_VERIFY_JSON_PATH" <<'PY'
import json
import pathlib
import sys

hwp_report_path = pathlib.Path(sys.argv[1])
verify_report_path = pathlib.Path(sys.argv[2])
hwp_report = json.loads(hwp_report_path.read_text())
samples = hwp_report.get("samples", [])
parsed_counts = [sample.get("parsed_character_count") for sample in samples]
minimum_observed = min(parsed_counts) if parsed_counts else 0
verify_report = {
    "schema": "carevault-hwp-smoke-report-verify.v1",
    "status": "verified-ready-for-external-review",
    "verified_blocker": "real-private-hwp-hwpx-sample",
    "next_blocking_requirement": "external-clinician-source-review",
    "sample_count": hwp_report.get("sample_count"),
    "sample_basenames": [sample.get("basename", "") for sample in samples],
    "minimum_parsed_chars": hwp_report.get("minimum_parsed_chars"),
    "minimum_observed_parsed_chars": minimum_observed,
    "expected_term_count": hwp_report.get("expected_term_count"),
    "objective_term_groups": hwp_report.get("objective_term_groups"),
    "input_paths_included": False,
    "path_policy": "Configured evidence paths are intentionally omitted.",
}
verify_report_path.write_text(json.dumps(verify_report, indent=2, ensure_ascii=False) + "\n")
PY

  printf 'HWP smoke report verify JSON: written with path-safe evidence summary.\n'
}

CAREVAULT_REQUIRE_HWP_SMOKE_REPORT=1 \
  CAREVAULT_HWP_SMOKE_REPORT_JSON="$(cat "$CAREVAULT_HWP_SMOKE_REPORT_PATH")" \
  "$VITEST_BIN" run src/carevaultObjectiveReadinessReportSmoke.test.ts

write_hwp_verify_json
print_hwp_report_summary

printf 'Objective readiness report smoke passed for basename-only HWP evidence report.\n'
