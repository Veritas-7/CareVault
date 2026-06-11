#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_objective_readiness_report.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

VALID_REPORT="$TMP_DIR/valid-report.json"
PATH_LEAK_REPORT="$TMP_DIR/path-leak-report.json"
MISSING_GROUP_REPORT="$TMP_DIR/missing-group-report.json"
BAD_JSON_REPORT="$TMP_DIR/bad-json-report.json"

cat > "$VALID_REPORT" <<'JSON'
{
  "schema": "carevault-hwp-smoke-report.v2",
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
    {"basename": "oncology-followup.hwpx", "extension": "hwpx", "status": "passed"},
    {"basename": "blood-pressure-labs.hwp", "extension": "hwp", "status": "passed"}
  ]
}
JSON

cat > "$PATH_LEAK_REPORT" <<'JSON'
{
  "schema": "carevault-hwp-smoke-report.v2",
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
    {"basename": "/Users/wj/private/oncology-followup.hwpx", "extension": "hwpx", "status": "passed"}
  ]
}
JSON

cat > "$MISSING_GROUP_REPORT" <<'JSON'
{
  "schema": "carevault-hwp-smoke-report.v2",
  "status": "passed",
  "sample_count": 1,
  "minimum_parsed_chars": "200",
  "expected_terms_provided": true,
  "expected_term_count": 3,
  "objective_term_groups": {
    "cervical_cancer": true,
    "hypertension": true,
    "diabetes": false
  },
  "samples": [
    {"basename": "oncology-followup.hwpx", "extension": "hwpx", "status": "passed"}
  ]
}
JSON

printf '{not-json' > "$BAD_JSON_REPORT"

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

expect_failure "missing-env"
assert_contains "$TMP_DIR/missing-env.out" "CAREVAULT_HWP_SMOKE_REPORT_PATH is required"

expect_failure "missing-file" CAREVAULT_HWP_SMOKE_REPORT_PATH="$TMP_DIR/missing.json"
assert_contains "$TMP_DIR/missing-file.out" "configured HWP smoke report is not readable"
assert_not_contains "$TMP_DIR/missing-file.out" "$TMP_DIR"

expect_failure "bad-json" CAREVAULT_HWP_SMOKE_REPORT_PATH="$BAD_JSON_REPORT"
assert_contains "$TMP_DIR/bad-json.out" "Configured HWP smoke report must be valid JSON"
assert_not_contains "$TMP_DIR/bad-json.out" "$BAD_JSON_REPORT"

expect_failure "path-leak" CAREVAULT_HWP_SMOKE_REPORT_PATH="$PATH_LEAK_REPORT"
assert_contains "$TMP_DIR/path-leak.out" "real-private-hwp-hwpx-sample"
assert_not_contains "$TMP_DIR/path-leak.out" "/Users/wj/private"

expect_failure "missing-group" CAREVAULT_HWP_SMOKE_REPORT_PATH="$MISSING_GROUP_REPORT"
assert_contains "$TMP_DIR/missing-group.out" "missing diabetes"
assert_not_contains "$TMP_DIR/missing-group.out" "$TMP_DIR"

expect_success "valid-report" CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_REPORT"
assert_contains "$TMP_DIR/valid-report.out" "Objective readiness report smoke passed"
assert_contains "$TMP_DIR/valid-report.out" "1 passed"
assert_not_contains "$TMP_DIR/valid-report.out" "$TMP_DIR"

printf 'Objective readiness report smoke fixture tests passed.\n'
