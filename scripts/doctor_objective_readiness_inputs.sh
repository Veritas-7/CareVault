#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HWP_REPORT_SCRIPT="$ROOT_DIR/scripts/smoke_objective_readiness_report.sh"
EXTERNAL_REPORT_SCRIPT="$ROOT_DIR/scripts/smoke_external_review_report.sh"
COMPLETE_SCRIPT="$ROOT_DIR/scripts/smoke_objective_readiness_complete.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

print_usage() {
  cat <<'EOF'
Usage:
  npm run objective:readiness:inputs:doctor

Optional evidence inputs:
  CAREVAULT_HWP_SMOKE_REPORT_PATH
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH
  CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH

This preflight checks whether the remaining objective-readiness evidence inputs
are missing, partially supplied, accepted by their existing smoke gates, or
ready for the final completion gate. It does not create private HWP evidence,
does not create external clinical approval, and does not print configured file
paths. When CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH is set, it writes a
path-safe machine-readable status report without configured evidence paths.
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

overall_status="missing-evidence"
hwp_status="missing"
packet_status="missing"
external_status="missing"
final_status="not-ready"

if [[ -n "${CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH:-}" ]]; then
  json_parent="$(dirname "$CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH")"
  if [[ ! -d "$json_parent" || ! -w "$json_parent" ]]; then
    printf 'FAIL: configured inputs doctor JSON parent is not writable.\n' >&2
    exit 2
  fi
fi

write_json_report() {
  if [[ -z "${CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH:-}" ]]; then
    return 0
  fi

  CAREVAULT_INPUTS_DOCTOR_STATUS="$overall_status" \
    CAREVAULT_INPUTS_DOCTOR_HWP_STATUS="$hwp_status" \
    CAREVAULT_INPUTS_DOCTOR_PACKET_STATUS="$packet_status" \
    CAREVAULT_INPUTS_DOCTOR_EXTERNAL_STATUS="$external_status" \
    CAREVAULT_INPUTS_DOCTOR_FINAL_STATUS="$final_status" \
    python3 - "$CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH" <<'PY'
import json
import os
import pathlib
import sys

status = os.environ["CAREVAULT_INPUTS_DOCTOR_STATUS"]
hwp_status = os.environ["CAREVAULT_INPUTS_DOCTOR_HWP_STATUS"]
packet_status = os.environ["CAREVAULT_INPUTS_DOCTOR_PACKET_STATUS"]
external_status = os.environ["CAREVAULT_INPUTS_DOCTOR_EXTERNAL_STATUS"]
final_status = os.environ["CAREVAULT_INPUTS_DOCTOR_FINAL_STATUS"]

blocking_requirements = []
if hwp_status != "accepted":
    blocking_requirements.append("real-private-hwp-hwpx-sample")
if packet_status != "accepted" or external_status != "accepted":
    blocking_requirements.append("external-clinician-source-review")
if final_status == "pass":
    blocking_requirements = []

report = {
    "schema": "carevault-objective-readiness-inputs-doctor.v1",
    "generated_by": "npm run objective:readiness:inputs:doctor",
    "status": status,
    "evidence_inputs": {
        "hwp_smoke_report": hwp_status,
        "external_review_packet": packet_status,
        "external_review_report": external_status,
    },
    "final_readiness_gate": final_status,
    "blocking_requirements": blocking_requirements,
    "input_paths_included": False,
    "path_policy": "Configured evidence paths are intentionally omitted.",
}

pathlib.Path(sys.argv[1]).write_text(
    json.dumps(report, indent=2, ensure_ascii=False) + "\n"
)
PY
}

print_summary() {
  printf 'Objective readiness inputs: %s\n' "$overall_status"
  printf 'HWP smoke report: %s\n' "$hwp_status"
  printf 'External review packet: %s\n' "$packet_status"
  printf 'External review report: %s\n' "$external_status"
  printf 'Final readiness gate: %s\n' "$final_status"
}

if [[ -n "${CAREVAULT_HWP_SMOKE_REPORT_PATH:-}" ]]; then
  if [[ ! -r "$CAREVAULT_HWP_SMOKE_REPORT_PATH" ]]; then
    printf 'FAIL: configured HWP smoke report is not readable.\n' >&2
    exit 2
  fi

  if CAREVAULT_HWP_SMOKE_REPORT_PATH="$CAREVAULT_HWP_SMOKE_REPORT_PATH" \
    bash "$HWP_REPORT_SCRIPT" > "$TMP_DIR/hwp-report.out" 2>&1; then
    hwp_status="accepted"
  else
    overall_status="invalid-evidence"
    hwp_status="rejected"
    write_json_report
    print_summary
    printf 'FAIL: configured HWP smoke report did not pass readiness verification.\n' >&2
    exit 2
  fi
fi

if [[ -n "${CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR:-}" ]]; then
  if [[ ! -d "$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR" || ! -r "$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR" ]]; then
    printf 'FAIL: configured external review packet dir is not readable.\n' >&2
    exit 2
  fi
  packet_status="present"
fi

if [[ -n "${CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH:-}" ]]; then
  if [[ ! -r "$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" ]]; then
    printf 'FAIL: configured external review report is not readable.\n' >&2
    exit 2
  fi

  if [[ "$packet_status" == "missing" ]]; then
    external_status="waiting-for-packet"
  elif CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR" \
    CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" \
    bash "$EXTERNAL_REPORT_SCRIPT" > "$TMP_DIR/external-review.out" 2>&1; then
    packet_status="accepted"
    external_status="accepted"
  else
    overall_status="invalid-evidence"
    packet_status="rejected"
    external_status="rejected"
    write_json_report
    print_summary
    printf 'FAIL: configured external review report did not pass readiness verification.\n' >&2
    exit 2
  fi
fi

if [[ "$hwp_status" == "accepted" && "$packet_status" == "accepted" && "$external_status" == "accepted" ]]; then
  if CAREVAULT_HWP_SMOKE_REPORT_PATH="$CAREVAULT_HWP_SMOKE_REPORT_PATH" \
    CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR" \
    CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH" \
    bash "$COMPLETE_SCRIPT" > "$TMP_DIR/complete.out" 2>&1; then
    overall_status="ready"
    final_status="pass"
  else
    overall_status="invalid-evidence"
    final_status="rejected"
    write_json_report
    print_summary
    printf 'FAIL: final objective readiness gate did not pass.\n' >&2
    exit 2
  fi
elif [[ "$hwp_status" == "accepted" || "$packet_status" != "missing" || "$external_status" != "missing" ]]; then
  overall_status="partial-evidence"
fi

write_json_report
print_summary
