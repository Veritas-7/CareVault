#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERIFY_SCRIPT="$ROOT_DIR/scripts/verify_objective_readiness_complete.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

VALID_JSON="$TMP_DIR/valid-completion-verify.json"

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

  if ! env "$@" bash "$VERIFY_SCRIPT" > "$output_file" 2> "$error_file"; then
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

  if env "$@" bash "$VERIFY_SCRIPT" > "$output_file" 2> "$error_file"; then
    printf 'Expected failure for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

cat > "$VALID_JSON" <<'JSON'
{
  "schema": "carevault-objective-readiness-complete-verify.v1",
  "status": "verified-complete",
  "blocking_requirements": [],
  "hwp_smoke": {
    "sample_count": 2,
    "sample_basenames": ["oncology-followup.hwpx", "blood-pressure-labs.hwp"],
    "minimum_parsed_chars": "200",
    "minimum_observed_parsed_chars": 386,
    "expected_term_count": 3,
    "objective_term_groups": {
      "cervical_cancer": true,
      "hypertension": true,
      "diabetes": true
    }
  },
  "external_review": {
    "reviewer_role": "external clinical reviewer",
    "reviewed_at": "2026-06-11",
    "required_check_ids": ["clinician-source-review", "real-workflow-review"],
    "reviewed_artifact_ids": [
      "clinical-review-packet",
      "clinical-workflow-review-packet",
      "objective-readiness-report"
    ],
    "source_registry_counts": {
      "total": 84,
      "errors": 0,
      "warnings": 0
    },
    "workflow_surface_count": 6,
    "open_findings": {
      "critical": 0,
      "major": 0
    }
  },
  "input_paths_included": false,
  "path_policy": "Configured evidence paths are intentionally omitted."
}
JSON

if ! bash "$VERIFY_SCRIPT" --help > "$TMP_DIR/help.out" 2>&1; then
  printf 'Expected help to succeed.\n' >&2
  cat "$TMP_DIR/help.out" >&2
  exit 1
fi
assert_contains "$TMP_DIR/help.out" "CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH"

expect_failure "missing-env"
assert_contains "$TMP_DIR/missing-env.err" "CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH is required"

expect_failure "missing-file" \
  CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$TMP_DIR/missing.json"
assert_contains "$TMP_DIR/missing-file.err" "completion verify JSON is not readable"
assert_not_contains "$TMP_DIR/missing-file.err" "$TMP_DIR/missing.json"

BAD_JSON="$TMP_DIR/bad.json"
printf '{not-json' > "$BAD_JSON"
expect_failure "bad-json" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$BAD_JSON"
assert_contains "$TMP_DIR/bad-json.err" "completion verify JSON must be valid JSON"
assert_not_contains "$TMP_DIR/bad-json.err" "$BAD_JSON"

PATH_LEAK_JSON="$TMP_DIR/path-leak.json"
cp "$VALID_JSON" "$PATH_LEAK_JSON"
python3 - "$PATH_LEAK_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["path_policy"] = "/Users/wj/private-carevault/sample.hwp"
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "path-leak" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$PATH_LEAK_JSON"
assert_contains "$TMP_DIR/path-leak.err" "completion verify JSON contains a local path"
assert_not_contains "$TMP_DIR/path-leak.err" "/Users/wj/private-carevault"

WRONG_STATUS_JSON="$TMP_DIR/wrong-status.json"
cp "$VALID_JSON" "$WRONG_STATUS_JSON"
python3 - "$WRONG_STATUS_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["status"] = "blocked"
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "wrong-status" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$WRONG_STATUS_JSON"
assert_contains "$TMP_DIR/wrong-status.err" "completion verify JSON status must be verified-complete"

BLOCKED_JSON="$TMP_DIR/blocked.json"
cp "$VALID_JSON" "$BLOCKED_JSON"
python3 - "$BLOCKED_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["blocking_requirements"] = ["real-private-hwp-hwpx-sample"]
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "blocked" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$BLOCKED_JSON"
assert_contains "$TMP_DIR/blocked.err" "completion verify JSON must not list blocking requirements"

MISSING_GROUP_JSON="$TMP_DIR/missing-group.json"
cp "$VALID_JSON" "$MISSING_GROUP_JSON"
python3 - "$MISSING_GROUP_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["hwp_smoke"]["objective_term_groups"]["diabetes"] = False
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "missing-group" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$MISSING_GROUP_JSON"
assert_contains "$TMP_DIR/missing-group.err" "completion verify JSON must cover all objective term groups"

OPEN_FINDING_JSON="$TMP_DIR/open-finding.json"
cp "$VALID_JSON" "$OPEN_FINDING_JSON"
python3 - "$OPEN_FINDING_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["external_review"]["open_findings"]["major"] = 1
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "open-finding" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$OPEN_FINDING_JSON"
assert_contains "$TMP_DIR/open-finding.err" "completion verify JSON must have zero open critical and major findings"

MISSING_ARTIFACT_JSON="$TMP_DIR/missing-artifact.json"
cp "$VALID_JSON" "$MISSING_ARTIFACT_JSON"
python3 - "$MISSING_ARTIFACT_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["external_review"]["reviewed_artifact_ids"] = ["clinical-review-packet"]
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "missing-artifact" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$MISSING_ARTIFACT_JSON"
assert_contains "$TMP_DIR/missing-artifact.err" "completion verify JSON must list all reviewed artifact ids"

expect_success "valid-report" CAREVAULT_OBJECTIVE_READINESS_COMPLETE_VERIFY_JSON_PATH="$VALID_JSON"
assert_contains "$TMP_DIR/valid-report.out" "Objective readiness complete verify JSON verified."
assert_contains "$TMP_DIR/valid-report.out" "Status: verified-complete"
assert_contains "$TMP_DIR/valid-report.out" "Blocking requirements: none"
assert_contains "$TMP_DIR/valid-report.out" "Accepted HWP samples: 2"
assert_contains "$TMP_DIR/valid-report.out" "Accepted external reviewer: external clinical reviewer"
assert_not_contains "$TMP_DIR/valid-report.out" "$TMP_DIR"

printf 'Objective readiness complete verify JSON fixture tests passed.\n'
