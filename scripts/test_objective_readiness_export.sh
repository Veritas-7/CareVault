#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/export_objective_readiness_report.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

VALID_HWP_REPORT="$TMP_DIR/valid-hwp-report.json"
VALID_EXTERNAL_REPORT="$TMP_DIR/valid-external-review.json"
PATH_LEAK_HWP_REPORT="$TMP_DIR/path-leak-hwp-report.json"
BAD_JSON_REPORT="$TMP_DIR/bad-json-report.json"

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

cat > "$VALID_EXTERNAL_REPORT" <<'JSON'
{
  "schema": "carevault-external-clinician-review.v3",
  "status": "passed",
  "reviewed_at": "2026-06-11",
  "reviewer_role": "external clinical reviewer",
  "reviewed_artifacts": [
    {"id": "clinical-review-packet", "status": "reviewed", "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "bytes": 1200},
    {"id": "clinical-workflow-review-packet", "status": "reviewed", "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "bytes": 1300},
    {"id": "objective-readiness-report", "status": "reviewed", "sha256": "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc", "bytes": 1400}
  ],
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
  "source_registry_total_count": 84,
  "source_registry_warning_count": 0,
  "workflow_surface_count": 6
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
  local error_file="$TMP_DIR/$name.err"

  if ! env "$@" bash "$SCRIPT" > "$output_file" 2> "$error_file"; then
    printf 'Expected success for %s\n' "$name" >&2
    printf '%s\n' '--- stdout ---' >&2
    cat "$output_file" >&2
    printf '%s\n' '--- stderr ---' >&2
    cat "$error_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

expect_failure() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"
  local error_file="$TMP_DIR/$name.err"

  if env "$@" bash "$SCRIPT" > "$output_file" 2> "$error_file"; then
    printf 'Expected failure for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

if ! bash "$SCRIPT" --help > "$TMP_DIR/help.out" 2>&1; then
  printf 'Expected help to succeed.\n' >&2
  cat "$TMP_DIR/help.out" >&2
  exit 1
fi
assert_contains "$TMP_DIR/help.out" "CAREVAULT_OBJECTIVE_READINESS_REPORT_PATH"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_HWP_SMOKE_REPORT_PATH"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH"

expect_success "default-blocked"
assert_contains "$TMP_DIR/default-blocked.out" "Status: blocked"
assert_contains "$TMP_DIR/default-blocked.out" "real-private-hwp-hwpx-sample"
assert_contains "$TMP_DIR/default-blocked.out" "external-clinician-source-review"
assert_contains "$TMP_DIR/default-blocked.out" "Do not mark the active goal complete"
assert_not_contains "$TMP_DIR/default-blocked.out" "/Users/wj/private"

MARKDOWN_REPORT="$TMP_DIR/objective-readiness.md"
JSON_REPORT="$TMP_DIR/objective-readiness.json"
expect_success "file-export" \
  CAREVAULT_OBJECTIVE_READINESS_REPORT_PATH="$MARKDOWN_REPORT" \
  CAREVAULT_OBJECTIVE_READINESS_JSON_PATH="$JSON_REPORT"
assert_contains "$TMP_DIR/file-export.err" "Objective readiness export completed."
assert_contains "$MARKDOWN_REPORT" "Status: blocked"
node -e "const fs=require('fs'); const report=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); if (report.status !== 'blocked') process.exit(1); if (!report.blockingRequirementIds.includes('real-private-hwp-hwpx-sample')) process.exit(1);" "$JSON_REPORT"
if grep -n -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$JSON_REPORT"; then
  printf 'Expected objective readiness JSON export to be path-safe.\n' >&2
  exit 1
fi

expect_success "valid-complete-evidence" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/valid-complete-evidence.out" "Status: pass"
assert_contains "$TMP_DIR/valid-complete-evidence.out" "No blocking requirements remain"
assert_contains "$TMP_DIR/valid-complete-evidence.out" "oncology-followup.hwpx"
assert_not_contains "$TMP_DIR/valid-complete-evidence.out" "$TMP_DIR"

expect_success "path-leak-hwp-stays-blocked" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$PATH_LEAK_HWP_REPORT"
assert_contains "$TMP_DIR/path-leak-hwp-stays-blocked.out" "Status: blocked"
assert_contains "$TMP_DIR/path-leak-hwp-stays-blocked.out" "real-private-hwp-hwpx-sample"
assert_not_contains "$TMP_DIR/path-leak-hwp-stays-blocked.out" "/Users/wj/private"

expect_failure "bad-hwp-json" CAREVAULT_HWP_SMOKE_REPORT_PATH="$BAD_JSON_REPORT"
assert_contains "$TMP_DIR/bad-hwp-json.err" "configured HWP smoke report must be valid JSON"
assert_not_contains "$TMP_DIR/bad-hwp-json.err" "$BAD_JSON_REPORT"

expect_failure "missing-output-parent" \
  CAREVAULT_OBJECTIVE_READINESS_REPORT_PATH="$TMP_DIR/missing/report.md"
assert_contains "$TMP_DIR/missing-output-parent.err" "objective readiness Markdown output directory is not writable"
assert_not_contains "$TMP_DIR/missing-output-parent.err" "$TMP_DIR/missing"

printf 'Objective readiness export fixture tests passed.\n'
