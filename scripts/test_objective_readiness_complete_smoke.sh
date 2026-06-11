#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_objective_readiness_complete.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

VALID_HWP_REPORT="$TMP_DIR/valid-hwp-report.json"
PATH_LEAK_HWP_REPORT="$TMP_DIR/path-leak-hwp-report.json"
MISSING_GROUP_HWP_REPORT="$TMP_DIR/missing-group-hwp-report.json"
VALID_EXTERNAL_REPORT="$TMP_DIR/valid-external-review.json"
OPEN_FINDING_EXTERNAL_REPORT="$TMP_DIR/open-finding-external-review.json"

cat > "$VALID_HWP_REPORT" <<'JSON'
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

cat > "$PATH_LEAK_HWP_REPORT" <<'JSON'
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

cat > "$MISSING_GROUP_HWP_REPORT" <<'JSON'
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

cat > "$VALID_EXTERNAL_REPORT" <<'JSON'
{
  "schema": "carevault-external-clinician-review.v1",
  "status": "passed",
  "reviewed_at": "2026-06-11",
  "reviewer_role": "external clinical reviewer",
  "required_check_ids": ["clinician-source-review", "real-workflow-review"],
  "unresolved_required_check_ids": [],
  "attestations": {
    "source_registry_reviewed": true,
    "real_workflow_reviewed": true,
    "non_diagnosis_boundary_reviewed": true,
    "cervical_hypertension_diabetes_scope_reviewed": true
  },
  "critical_findings_open": 0,
  "major_findings_open": 0,
  "source_registry_error_count": 0,
  "source_registry_warning_count": 0
}
JSON

cat > "$OPEN_FINDING_EXTERNAL_REPORT" <<'JSON'
{
  "schema": "carevault-external-clinician-review.v1",
  "status": "passed",
  "reviewed_at": "2026-06-11",
  "reviewer_role": "external clinical reviewer",
  "required_check_ids": ["clinician-source-review", "real-workflow-review"],
  "unresolved_required_check_ids": [],
  "attestations": {
    "source_registry_reviewed": true,
    "real_workflow_reviewed": true,
    "non_diagnosis_boundary_reviewed": true,
    "cervical_hypertension_diabetes_scope_reviewed": true
  },
  "critical_findings_open": 0,
  "major_findings_open": 1,
  "source_registry_error_count": 0,
  "source_registry_warning_count": 0
}
JSON

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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH"

expect_failure "missing-hwp-env" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/missing-hwp-env.out" "CAREVAULT_HWP_SMOKE_REPORT_PATH is required"

expect_failure "missing-external-env" CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT"
assert_contains "$TMP_DIR/missing-external-env.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH is required"

expect_failure "missing-hwp-file" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$TMP_DIR/missing-hwp.json" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/missing-hwp-file.out" "configured HWP smoke report is not readable"
assert_not_contains "$TMP_DIR/missing-hwp-file.out" "$TMP_DIR"

expect_failure "path-leak-hwp" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$PATH_LEAK_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/path-leak-hwp.out" "basename-only entries"
assert_not_contains "$TMP_DIR/path-leak-hwp.out" "/Users/wj/private"

expect_failure "missing-group-hwp" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$MISSING_GROUP_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/missing-group-hwp.out" "missing diabetes"
assert_not_contains "$TMP_DIR/missing-group-hwp.out" "$TMP_DIR"

expect_failure "open-finding-external" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$OPEN_FINDING_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/open-finding-external.out" "critical or major findings"

expect_success "valid-completion-evidence" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Objective readiness completion evidence smoke passed"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "1 passed"
assert_not_contains "$TMP_DIR/valid-completion-evidence.out" "$TMP_DIR"

printf 'Objective readiness completion evidence fixture tests passed.\n'
