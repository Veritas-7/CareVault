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

print_completion_summary() {
  python3 - "$CAREVAULT_HWP_SMOKE_REPORT_PATH" "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" <<'PY'
import json
import pathlib
import sys

hwp_report = json.loads(pathlib.Path(sys.argv[1]).read_text())
external_report = json.loads(pathlib.Path(sys.argv[2]).read_text())
hwp_samples = hwp_report.get("samples", [])
parsed_counts = [sample.get("parsed_character_count") for sample in hwp_samples]
minimum_observed = min(parsed_counts) if parsed_counts else 0
hwp_sample_basenames = ", ".join(sample.get("basename", "") for sample in hwp_samples)
required_checks = ", ".join(external_report.get("required_check_ids", []))

print("Objective readiness complete: pass")
print(f"Accepted HWP smoke evidence: {hwp_report.get('sample_count')} sample(s)")
print(f"Minimum parsed chars: {hwp_report.get('minimum_parsed_chars')}")
print(f"Minimum observed parsed chars: {minimum_observed}")
print(f"Expected term count: {hwp_report.get('expected_term_count')}")
print(f"HWP sample basenames: {hwp_sample_basenames}")
print(f"Accepted external review evidence: {external_report.get('reviewer_role')}")
print(f"Reviewed artifacts: {len(external_report.get('reviewed_artifacts', []))}")
print(f"Required checks: {required_checks}")
print(
    "Source registry counts: "
    f"total={external_report.get('source_registry_total_count')}, "
    f"errors={external_report.get('source_registry_error_count')}, "
    f"warnings={external_report.get('source_registry_warning_count')}"
)
print(f"Workflow surfaces reviewed: {external_report.get('workflow_surface_count')}")
print(
    "Open findings: "
    f"critical={external_report.get('critical_findings_open')}, "
    f"major={external_report.get('major_findings_open')}"
)
print("Blocking requirements: none")
PY
}

node "$ROOT_DIR/scripts/verify_external_review_packet_hashes.mjs" \
  "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" \
  "$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR"

CAREVAULT_REQUIRE_COMPLETION_EVIDENCE=1 \
  CAREVAULT_HWP_SMOKE_REPORT_JSON="$(cat "$CAREVAULT_HWP_SMOKE_REPORT_PATH")" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON="$(cat "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH")" \
  "$VITEST_BIN" run src/carevaultObjectiveCompletionEvidenceSmoke.test.ts

print_completion_summary

printf 'Objective readiness completion evidence smoke passed.\n'
