#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VITEST_BIN="$ROOT_DIR/node_modules/.bin/vitest"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/tmp/carevault-external-review-packet \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/tmp/carevault-external-review.json \
  npm run clinical:external-review:report

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

print_external_review_summary() {
  python3 - "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" <<'PY'
import json
import pathlib
import sys

report = json.loads(pathlib.Path(sys.argv[1]).read_text())
required_checks = ", ".join(report.get("required_check_ids", []))

print(f"Accepted external review evidence: {report.get('reviewer_role')}")
print(f"Reviewed artifacts: {len(report.get('reviewed_artifacts', []))}")
print(f"Required checks: {required_checks}")
print(
    "Source registry counts: "
    f"total={report.get('source_registry_total_count')}, "
    f"errors={report.get('source_registry_error_count')}, "
    f"warnings={report.get('source_registry_warning_count')}"
)
print(f"Workflow surfaces reviewed: {report.get('workflow_surface_count')}")
print(
    "Open findings: "
    f"critical={report.get('critical_findings_open')}, "
    f"major={report.get('major_findings_open')}"
)
PY
}

node "$ROOT_DIR/scripts/verify_external_review_packet_hashes.mjs" \
  "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" \
  "$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR"

CAREVAULT_REQUIRE_EXTERNAL_REVIEW_REPORT=1 \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON="$(cat "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH")" \
  "$VITEST_BIN" run src/carevaultExternalReviewReportSmoke.test.ts

print_external_review_summary

printf 'External clinician/source review report smoke passed.\n'
