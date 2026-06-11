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

This preflight checks whether the remaining objective-readiness evidence inputs
are missing, partially supplied, accepted by their existing smoke gates, or
ready for the final completion gate. It does not create private HWP evidence,
does not create external clinical approval, and does not print configured file
paths.
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
    print_summary
    printf 'FAIL: final objective readiness gate did not pass.\n' >&2
    exit 2
  fi
elif [[ "$hwp_status" == "accepted" || "$packet_status" != "missing" || "$external_status" != "missing" ]]; then
  overall_status="partial-evidence"
fi

print_summary
