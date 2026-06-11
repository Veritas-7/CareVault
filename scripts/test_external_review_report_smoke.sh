#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_external_review_report.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

VALID_REPORT="$TMP_DIR/valid-external-review.json"
MISSING_SCOPE_REPORT="$TMP_DIR/missing-scope.json"
OPEN_FINDING_REPORT="$TMP_DIR/open-finding.json"
BAD_JSON_REPORT="$TMP_DIR/bad-json.json"

cat > "$VALID_REPORT" <<'JSON'
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

cat > "$MISSING_SCOPE_REPORT" <<'JSON'
{
  "schema": "carevault-external-clinician-review.v1",
  "status": "passed",
  "reviewed_at": "2026-06-11",
  "reviewer_role": "external clinical reviewer",
  "required_check_ids": ["clinician-source-review"],
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

cat > "$OPEN_FINDING_REPORT" <<'JSON'
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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH"

expect_failure "missing-env"
assert_contains "$TMP_DIR/missing-env.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH is required"

expect_failure "missing-file" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$TMP_DIR/missing.json"
assert_contains "$TMP_DIR/missing-file.out" "configured external review report is not readable"
assert_not_contains "$TMP_DIR/missing-file.out" "$TMP_DIR"

expect_failure "bad-json" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$BAD_JSON_REPORT"
assert_contains "$TMP_DIR/bad-json.out" "Configured external review report must be valid JSON"
assert_not_contains "$TMP_DIR/bad-json.out" "$BAD_JSON_REPORT"

expect_failure "missing-scope" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$MISSING_SCOPE_REPORT"
assert_contains "$TMP_DIR/missing-scope.out" "AssertionError"
assert_not_contains "$TMP_DIR/missing-scope.out" "$TMP_DIR"

expect_failure "open-finding" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$OPEN_FINDING_REPORT"
assert_contains "$TMP_DIR/open-finding.out" "AssertionError"

expect_success "valid-report" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_REPORT"
assert_contains "$TMP_DIR/valid-report.out" "External clinician/source review report smoke passed"
assert_contains "$TMP_DIR/valid-report.out" "1 passed"
assert_not_contains "$TMP_DIR/valid-report.out" "$TMP_DIR"

printf 'External review report smoke fixture tests passed.\n'
