#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_external_review_report.sh"
PACKET_SCRIPT="$ROOT_DIR/scripts/export_external_review_packet.sh"
FIXTURE_WRITER="$ROOT_DIR/scripts/write_external_review_report_fixture.mjs"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

PACKET_DIR="$TMP_DIR/reviewer-packet"
VALID_REPORT="$TMP_DIR/valid-external-review.json"
MISSING_SCOPE_REPORT="$TMP_DIR/missing-scope.json"
MISSING_ARTIFACT_REPORT="$TMP_DIR/missing-artifact.json"
MISSING_HASH_REPORT="$TMP_DIR/missing-hash.json"
STALE_PACKET_HASH_REPORT="$TMP_DIR/stale-packet-hash.json"
STALE_COUNT_REPORT="$TMP_DIR/stale-count.json"
OPEN_FINDING_REPORT="$TMP_DIR/open-finding.json"
BAD_JSON_REPORT="$TMP_DIR/bad-json.json"

cat > "$VALID_REPORT" <<'JSON'
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

cat > "$MISSING_SCOPE_REPORT" <<'JSON'
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
  "source_registry_total_count": 84,
  "source_registry_warning_count": 0,
  "workflow_surface_count": 6
}
JSON

cat > "$MISSING_ARTIFACT_REPORT" <<'JSON'
{
  "schema": "carevault-external-clinician-review.v3",
  "status": "passed",
  "reviewed_at": "2026-06-11",
  "reviewer_role": "external clinical reviewer",
  "reviewed_artifacts": [
    {"id": "clinical-review-packet", "status": "reviewed", "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "bytes": 1200},
    {"id": "clinical-workflow-review-packet", "status": "reviewed", "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "bytes": 1300}
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

cat > "$MISSING_HASH_REPORT" <<'JSON'
{
  "schema": "carevault-external-clinician-review.v3",
  "status": "passed",
  "reviewed_at": "2026-06-11",
  "reviewer_role": "external clinical reviewer",
  "reviewed_artifacts": [
    {"id": "clinical-review-packet", "status": "reviewed", "sha256": "not-a-sha", "bytes": 1200},
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

cat > "$OPEN_FINDING_REPORT" <<'JSON'
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
  "major_findings_open": 1,
  "source_registry_error_count": 0,
  "source_registry_total_count": 84,
  "source_registry_warning_count": 0,
  "workflow_surface_count": 6
}
JSON

cat > "$STALE_COUNT_REPORT" <<'JSON'
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
  "source_registry_total_count": 83,
  "source_registry_warning_count": 0,
  "workflow_surface_count": 5
}
JSON

printf '{not-json' > "$BAD_JSON_REPORT"

if ! CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  bash "$PACKET_SCRIPT" > "$TMP_DIR/packet-export.out" 2> "$TMP_DIR/packet-export.err"; then
  printf 'Expected packet export fixture setup to succeed.\n' >&2
  printf '%s\n' '--- stdout ---' >&2
  cat "$TMP_DIR/packet-export.out" >&2
  printf '%s\n' '--- stderr ---' >&2
  cat "$TMP_DIR/packet-export.err" >&2
  exit 1
fi

node "$FIXTURE_WRITER" "$PACKET_DIR" valid "$VALID_REPORT"
node "$FIXTURE_WRITER" "$PACKET_DIR" missing-scope "$MISSING_SCOPE_REPORT"
node "$FIXTURE_WRITER" "$PACKET_DIR" missing-artifact "$MISSING_ARTIFACT_REPORT"
node "$FIXTURE_WRITER" "$PACKET_DIR" missing-hash "$MISSING_HASH_REPORT"
node "$FIXTURE_WRITER" "$PACKET_DIR" stale-packet-hash "$STALE_PACKET_HASH_REPORT"
node "$FIXTURE_WRITER" "$PACKET_DIR" open-finding "$OPEN_FINDING_REPORT"
node "$FIXTURE_WRITER" "$PACKET_DIR" stale-count "$STALE_COUNT_REPORT"

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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR"

expect_failure "missing-env"
assert_contains "$TMP_DIR/missing-env.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH is required"

expect_failure "missing-file" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$TMP_DIR/missing.json"
assert_contains "$TMP_DIR/missing-file.out" "configured external review report is not readable"
assert_not_contains "$TMP_DIR/missing-file.out" "$TMP_DIR"

expect_failure "missing-packet-env" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_REPORT"
assert_contains "$TMP_DIR/missing-packet-env.out" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR is required"

expect_failure "bad-json" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$BAD_JSON_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/bad-json.out" "Configured external review report must be valid JSON"
assert_not_contains "$TMP_DIR/bad-json.out" "$BAD_JSON_REPORT"

expect_failure "missing-scope" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$MISSING_SCOPE_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/missing-scope.out" "must cover clinician-source-review and real-workflow-review"
assert_not_contains "$TMP_DIR/missing-scope.out" "$TMP_DIR"

expect_failure "missing-artifact" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$MISSING_ARTIFACT_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/missing-artifact.out" "must include reviewed artifacts"
assert_not_contains "$TMP_DIR/missing-artifact.out" "$TMP_DIR"

expect_failure "missing-hash" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$MISSING_HASH_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/missing-hash.out" "sha256 hashes"
assert_not_contains "$TMP_DIR/missing-hash.out" "$TMP_DIR"

expect_failure "stale-packet-hash" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$STALE_PACKET_HASH_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/stale-packet-hash.out" "artifact hashes must match"
assert_not_contains "$TMP_DIR/stale-packet-hash.out" "$TMP_DIR"

expect_failure "open-finding" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$OPEN_FINDING_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/open-finding.out" "zero open critical or major findings"

expect_failure "stale-count" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$STALE_COUNT_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/stale-count.out" "source registry counts must match"
assert_not_contains "$TMP_DIR/stale-count.out" "$TMP_DIR"

expect_success "valid-report" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/valid-report.out" "External clinician/source review report smoke passed"
assert_contains "$TMP_DIR/valid-report.out" "1 passed"
assert_not_contains "$TMP_DIR/valid-report.out" "$TMP_DIR"

printf 'External review report smoke fixture tests passed.\n'
