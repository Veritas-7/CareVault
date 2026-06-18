#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_objective_readiness_complete.sh"
PACKET_SCRIPT="$ROOT_DIR/scripts/export_external_review_packet.sh"
FIXTURE_WRITER="$ROOT_DIR/scripts/write_external_review_report_fixture.mjs"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

PACKET_DIR="$TMP_DIR/reviewer-packet"
VALID_HWP_REPORT="$TMP_DIR/valid-hwp-report.json"
PATH_LEAK_HWP_REPORT="$TMP_DIR/path-leak-hwp-report.json"
MISSING_GROUP_HWP_REPORT="$TMP_DIR/missing-group-hwp-report.json"
VALID_EXTERNAL_REPORT="$TMP_DIR/valid-external-review.json"
OPEN_FINDING_EXTERNAL_REPORT="$TMP_DIR/open-finding-external-review.json"
VERIFY_JSON_PATH="$TMP_DIR/objective-readiness-complete-verify.json"
SOURCE_URL_REPORT="$TMP_DIR/clinical-source-url-smoke-report.json"

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

cat > "$MISSING_GROUP_HWP_REPORT" <<'JSON'
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
    "diabetes": false
  },
  "samples": [
    {"basename": "oncology-followup.hwpx", "extension": "hwpx", "status": "passed", "parsed_character_count": 420}
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

cat > "$OPEN_FINDING_EXTERNAL_REPORT" <<'JSON'
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

cat > "$SOURCE_URL_REPORT" <<'JSON'
{
  "schema": "carevault-clinical-source-url-smoke.v1",
  "status": "passed",
  "checked_url_count": 2,
  "failed_url_count": 0,
  "source_files": [
    "src/healthStandards.ts",
    "src/healthRules.ts",
    "src/labPresets.ts"
  ],
  "url_limit": 2,
  "checked_urls": [
    "https://www.cancer.go.kr",
    "https://www.kdca.go.kr"
  ],
  "failed_urls": []
}
JSON

if ! CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  CAREVAULT_CLINICAL_SOURCE_REPORT_PATH="$SOURCE_URL_REPORT" \
  bash "$PACKET_SCRIPT" > "$TMP_DIR/packet-export.out" 2> "$TMP_DIR/packet-export.err"; then
  printf 'Expected packet export fixture setup to succeed.\n' >&2
  printf '%s\n' '--- stdout ---' >&2
  cat "$TMP_DIR/packet-export.out" >&2
  printf '%s\n' '--- stderr ---' >&2
  cat "$TMP_DIR/packet-export.err" >&2
  exit 1
fi

node "$FIXTURE_WRITER" "$PACKET_DIR" valid "$VALID_EXTERNAL_REPORT"
node "$FIXTURE_WRITER" "$PACKET_DIR" open-finding "$OPEN_FINDING_EXTERNAL_REPORT"

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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH"
assert_contains "$TMP_DIR/help.out" "npm run objective:readiness:complete:verify"

expect_failure "missing-hwp-env" CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/missing-hwp-env.out" "CAREVAULT_HWP_SMOKE_REPORT_PATH is required"

expect_failure "missing-external-env" CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT"
assert_contains "$TMP_DIR/missing-external-env.out" "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH is required"

expect_failure "missing-hwp-file" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$TMP_DIR/missing-hwp.json" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/missing-hwp-file.out" "configured HWP smoke report is not readable"
assert_not_contains "$TMP_DIR/missing-hwp-file.out" "$TMP_DIR"

expect_failure "missing-packet-env" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT"
assert_contains "$TMP_DIR/missing-packet-env.out" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR is required"

expect_failure "path-leak-hwp" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$PATH_LEAK_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/path-leak-hwp.out" "basename-only entries"
assert_not_contains "$TMP_DIR/path-leak-hwp.out" "/Users/wj/private"

expect_failure "missing-group-hwp" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$MISSING_GROUP_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/missing-group-hwp.out" "missing diabetes"
assert_not_contains "$TMP_DIR/missing-group-hwp.out" "$TMP_DIR"

expect_failure "open-finding-external" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$OPEN_FINDING_EXTERNAL_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/open-finding-external.out" "critical or major findings"

expect_success "valid-completion-evidence" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Objective readiness completion evidence smoke passed"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Objective readiness complete: pass"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Accepted HWP smoke evidence: 2 sample(s)"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Minimum observed parsed chars: 386"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "HWP sample basenames: oncology-followup.hwpx, blood-pressure-labs.hwp"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Accepted external review evidence: external clinical reviewer"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Reviewed artifacts: 4"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Required checks: clinician-source-review, clinical-source-url-reachability, real-workflow-review"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "Blocking requirements: none"
assert_contains "$TMP_DIR/valid-completion-evidence.out" "1 passed"
assert_not_contains "$TMP_DIR/valid-completion-evidence.out" "$TMP_DIR"

expect_success "valid-completion-json" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$VERIFY_JSON_PATH"
assert_contains "$TMP_DIR/valid-completion-json.out" "npm run objective:readiness:complete:verify"
python3 - "$VERIFY_JSON_PATH" "$TMP_DIR" <<'PY'
import json
import pathlib
import sys

report_path = pathlib.Path(sys.argv[1])
tmp_dir = sys.argv[2]
report_text = report_path.read_text()
if tmp_dir in report_text:
    raise SystemExit("completion verify JSON leaked a temp path")
report = json.loads(report_text)
assert report["schema"] == "carevault-objective-readiness-complete-verify.v1"
assert report["status"] == "verified-complete"
assert report["blocking_requirements"] == []
assert report["hwp_smoke"]["sample_count"] == 2
assert report["hwp_smoke"]["sample_basenames"] == [
    "oncology-followup.hwpx",
    "blood-pressure-labs.hwp",
]
assert report["hwp_smoke"]["minimum_observed_parsed_chars"] == 386
assert report["external_review"]["reviewer_role"] == "external clinical reviewer"
assert report["external_review"]["required_check_ids"] == [
    "clinician-source-review",
    "clinical-source-url-reachability",
    "real-workflow-review",
]
assert report["external_review"]["reviewed_artifact_ids"] == [
    "clinical-review-packet",
    "clinical-workflow-review-packet",
    "clinical-source-url-smoke-report",
    "objective-readiness-report",
]
assert report["external_review"]["open_findings"] == {"critical": 0, "major": 0}
assert report["input_paths_included"] is False
PY
CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$VERIFY_JSON_PATH" \
  bash "$ROOT_DIR/scripts/verify_objective_readiness_complete.sh" > "$TMP_DIR/valid-completion-json-verify.out" 2>&1
assert_contains "$TMP_DIR/valid-completion-json-verify.out" "Objective readiness complete verify JSON verified."
assert_contains "$TMP_DIR/valid-completion-json-verify.out" "Status: verified-complete"
assert_contains "$TMP_DIR/valid-completion-json-verify.out" "Blocking requirements: none"
assert_not_contains "$TMP_DIR/valid-completion-json.out" "$TMP_DIR"
assert_not_contains "$TMP_DIR/valid-completion-json-verify.out" "$TMP_DIR"

expect_failure "verify-json-missing-parent" \
  CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$TMP_DIR/missing/report.json"
assert_contains "$TMP_DIR/verify-json-missing-parent.out" "objective readiness complete verify JSON parent is not writable"
assert_not_contains "$TMP_DIR/verify-json-missing-parent.out" "$TMP_DIR/missing/report.json"

printf 'Objective readiness completion evidence fixture tests passed.\n'
