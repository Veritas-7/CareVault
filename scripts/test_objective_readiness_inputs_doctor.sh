#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/doctor_objective_readiness_inputs.sh"
PACKET_SCRIPT="$ROOT_DIR/scripts/export_external_review_packet.sh"
FIXTURE_WRITER="$ROOT_DIR/scripts/write_external_review_report_fixture.mjs"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

PACKET_DIR="$TMP_DIR/reviewer-packet"
VALID_HWP_REPORT="$TMP_DIR/valid-hwp-report.json"
PATH_LEAK_HWP_REPORT="$TMP_DIR/path-leak-hwp-report.json"
VALID_EXTERNAL_REPORT="$TMP_DIR/valid-external-review.json"

cat > "$VALID_HWP_REPORT" <<'JSON'
{
  "schema": "carevault-hwp-smoke-report.v3",
  "status": "passed",
  "sample_count": 2,
  "minimum_parsed_chars": "200",
  "expected_terms_provided": true,
  "expected_term_count": 3,
  "objective_term_groups": {
    "cervical_cancer": true,
    "hypertension": true,
    "diabetes": true
  },
  "samples": [
    {"basename": "oncology-followup.hwpx", "extension": "hwpx", "status": "passed", "parsed_character_count": 420},
    {"basename": "blood-pressure-labs.hwp", "extension": "hwp", "status": "passed", "parsed_character_count": 386}
  ]
}
JSON

cat > "$PATH_LEAK_HWP_REPORT" <<'JSON'
{
  "schema": "carevault-hwp-smoke-report.v3",
  "status": "passed",
  "sample_count": 1,
  "minimum_parsed_chars": "200",
  "expected_terms_provided": true,
  "expected_term_count": 3,
  "objective_term_groups": {
    "cervical_cancer": true,
    "hypertension": true,
    "diabetes": true
  },
  "samples": [
    {"basename": "/Users/wj/private/oncology-followup.hwpx", "extension": "hwpx", "status": "passed", "parsed_character_count": 420}
  ]
}
JSON

if ! CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  bash "$PACKET_SCRIPT" > "$TMP_DIR/packet-export.out" 2> "$TMP_DIR/packet-export.err"; then
  printf 'Expected packet export fixture setup to succeed.\n' >&2
  printf '%s\n' '--- stdout ---' >&2
  cat "$TMP_DIR/packet-export.out" >&2
  printf '%s\n' '--- stderr ---' >&2
  cat "$TMP_DIR/packet-export.err" >&2
  exit 1
fi

node "$FIXTURE_WRITER" "$PACKET_DIR" valid "$VALID_EXTERNAL_REPORT"

assert_contains() {
  local output_file="$1"
  local expected="$2"

  if ! grep -Fq "$expected" "$output_file"; then
    printf 'Expected output to contain: %s\n' "$expected" >&2
    printf '%s\n' '--- output ---' >&2
    cat "$output_file" >&2
    exit 1
  fi
}

assert_not_contains() {
  local output_file="$1"
  local unexpected="$2"

  if grep -Fq "$unexpected" "$output_file"; then
    printf 'Expected output not to contain: %s\n' "$unexpected" >&2
    printf '%s\n' '--- output ---' >&2
    cat "$output_file" >&2
    exit 1
  fi
}

expect_success() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"

  if ! env "$@" "$SCRIPT" > "$output_file" 2>&1; then
    printf 'Expected success for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

expect_failure() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"

  if env "$@" "$SCRIPT" > "$output_file" 2>&1; then
    printf 'Expected failure for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

if ! "$SCRIPT" --help > "$TMP_DIR/help.out" 2>&1; then
  printf 'Expected help to succeed.\n' >&2
  cat "$TMP_DIR/help.out" >&2
  exit 1
fi
assert_contains "$TMP_DIR/help.out" "CAREVAULT_HWP_SMOKE_REPORT_PATH"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH"

expect_success "no-inputs"
assert_contains "$TMP_DIR/no-inputs.out" "Objective readiness inputs: missing-evidence"
assert_contains "$TMP_DIR/no-inputs.out" "HWP smoke report: missing"
assert_contains "$TMP_DIR/no-inputs.out" "External review packet: missing"
assert_contains "$TMP_DIR/no-inputs.out" "External review report: missing"
assert_contains "$TMP_DIR/no-inputs.out" "Final readiness gate: not-ready"

expect_failure "missing-hwp-file" CAREVAULT_HWP_SMOKE_REPORT_PATH="$TMP_DIR/missing-hwp.json"
assert_contains "$TMP_DIR/missing-hwp-file.out" "configured HWP smoke report is not readable"
assert_not_contains "$TMP_DIR/missing-hwp-file.out" "$TMP_DIR"

expect_failure "missing-packet-dir" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$TMP_DIR/missing-packet" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/missing-packet-dir.out" "configured external review packet dir is not readable"
assert_not_contains "$TMP_DIR/missing-packet-dir.out" "$TMP_DIR"

expect_failure "missing-external-file" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$TMP_DIR/missing-external.json"
assert_contains "$TMP_DIR/missing-external-file.out" "configured external review report is not readable"
assert_not_contains "$TMP_DIR/missing-external-file.out" "$TMP_DIR"

expect_failure "path-leak-hwp" CAREVAULT_HWP_SMOKE_REPORT_PATH="$PATH_LEAK_HWP_REPORT"
assert_contains "$TMP_DIR/path-leak-hwp.out" "HWP smoke report: rejected"
assert_contains "$TMP_DIR/path-leak-hwp.out" "Objective readiness inputs: invalid-evidence"
assert_contains "$TMP_DIR/path-leak-hwp.out" "configured HWP smoke report did not pass readiness verification"
assert_not_contains "$TMP_DIR/path-leak-hwp.out" "/Users/wj/private"
assert_not_contains "$TMP_DIR/path-leak-hwp.out" "$TMP_DIR"

expect_success "valid-hwp-only" CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT"
assert_contains "$TMP_DIR/valid-hwp-only.out" "Objective readiness inputs: partial-evidence"
assert_contains "$TMP_DIR/valid-hwp-only.out" "HWP smoke report: accepted"
assert_contains "$TMP_DIR/valid-hwp-only.out" "External review packet: missing"
assert_contains "$TMP_DIR/valid-hwp-only.out" "External review report: missing"
assert_contains "$TMP_DIR/valid-hwp-only.out" "Final readiness gate: not-ready"
assert_not_contains "$TMP_DIR/valid-hwp-only.out" "$TMP_DIR"

expect_success "external-report-without-packet" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/external-report-without-packet.out" "Objective readiness inputs: partial-evidence"
assert_contains "$TMP_DIR/external-report-without-packet.out" "External review packet: missing"
assert_contains "$TMP_DIR/external-report-without-packet.out" "External review report: waiting-for-packet"
assert_contains "$TMP_DIR/external-report-without-packet.out" "Final readiness gate: not-ready"
assert_not_contains "$TMP_DIR/external-report-without-packet.out" "$TMP_DIR"

expect_success "valid-external-only" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/valid-external-only.out" "Objective readiness inputs: partial-evidence"
assert_contains "$TMP_DIR/valid-external-only.out" "HWP smoke report: missing"
assert_contains "$TMP_DIR/valid-external-only.out" "External review packet: accepted"
assert_contains "$TMP_DIR/valid-external-only.out" "External review report: accepted"
assert_contains "$TMP_DIR/valid-external-only.out" "Final readiness gate: not-ready"
assert_not_contains "$TMP_DIR/valid-external-only.out" "$TMP_DIR"

expect_success "valid-all-inputs" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/valid-all-inputs.out" "Objective readiness inputs: ready"
assert_contains "$TMP_DIR/valid-all-inputs.out" "HWP smoke report: accepted"
assert_contains "$TMP_DIR/valid-all-inputs.out" "External review packet: accepted"
assert_contains "$TMP_DIR/valid-all-inputs.out" "External review report: accepted"
assert_contains "$TMP_DIR/valid-all-inputs.out" "Final readiness gate: pass"
assert_not_contains "$TMP_DIR/valid-all-inputs.out" "$TMP_DIR"

printf 'Objective readiness input doctor fixture tests passed.\n'
