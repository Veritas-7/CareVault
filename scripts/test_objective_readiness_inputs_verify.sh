#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERIFY_SCRIPT="$ROOT_DIR/scripts/verify_objective_readiness_inputs.sh"
DOCTOR_SCRIPT="$ROOT_DIR/scripts/doctor_objective_readiness_inputs.sh"
PACKET_SCRIPT="$ROOT_DIR/scripts/export_external_review_packet.sh"
FIXTURE_WRITER="$ROOT_DIR/scripts/write_external_review_report_fixture.mjs"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

VALID_HWP_REPORT="$TMP_DIR/valid-hwp-report.json"
PACKET_DIR="$TMP_DIR/reviewer-packet"
VALID_EXTERNAL_REPORT="$TMP_DIR/valid-external-review.json"
NO_INPUTS_JSON="$TMP_DIR/no-inputs.json"
READY_JSON="$TMP_DIR/ready.json"

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

  if ! env "$@" "$VERIFY_SCRIPT" > "$output_file" 2> "$error_file"; then
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

  if env "$@" "$VERIFY_SCRIPT" > "$output_file" 2> "$error_file"; then
    printf 'Expected failure for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

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

CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$NO_INPUTS_JSON" \
  bash "$DOCTOR_SCRIPT" > "$TMP_DIR/no-inputs-doctor.out"

CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  bash "$PACKET_SCRIPT" > "$TMP_DIR/packet-export.out"
node "$FIXTURE_WRITER" "$PACKET_DIR" valid "$VALID_EXTERNAL_REPORT"
CAREVAULT_HWP_SMOKE_REPORT_PATH="$VALID_HWP_REPORT" \
CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH="$VALID_EXTERNAL_REPORT" \
CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$READY_JSON" \
  bash "$DOCTOR_SCRIPT" > "$TMP_DIR/ready-doctor.out"

if ! "$VERIFY_SCRIPT" --help > "$TMP_DIR/help.out" 2>&1; then
  printf 'Expected help to succeed.\n' >&2
  cat "$TMP_DIR/help.out" >&2
  exit 1
fi
assert_contains "$TMP_DIR/help.out" "CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH"

expect_failure "missing-env"
assert_contains "$TMP_DIR/missing-env.err" "CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH is required"

expect_failure "missing-file" CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$TMP_DIR/missing.json"
assert_contains "$TMP_DIR/missing-file.err" "inputs doctor JSON is not readable"
assert_not_contains "$TMP_DIR/missing-file.err" "$TMP_DIR/missing.json"

BAD_JSON="$TMP_DIR/bad.json"
printf '{not-json' > "$BAD_JSON"
expect_failure "bad-json" CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$BAD_JSON"
assert_contains "$TMP_DIR/bad-json.err" "inputs doctor JSON must be valid JSON"
assert_not_contains "$TMP_DIR/bad-json.err" "$BAD_JSON"

PATH_LEAK_JSON="$TMP_DIR/path-leak.json"
cp "$NO_INPUTS_JSON" "$PATH_LEAK_JSON"
python3 - "$PATH_LEAK_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["path_policy"] = "/Users/wj/private-carevault/sample.hwp"
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "path-leak" CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$PATH_LEAK_JSON"
assert_contains "$TMP_DIR/path-leak.err" "inputs doctor JSON contains a local path"
assert_not_contains "$TMP_DIR/path-leak.err" "/Users/wj/private-carevault"

INCONSISTENT_READY_JSON="$TMP_DIR/inconsistent-ready.json"
cp "$READY_JSON" "$INCONSISTENT_READY_JSON"
python3 - "$INCONSISTENT_READY_JSON" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
report = json.loads(path.read_text())
report["next_required_actions"] = [
    {
        "id": "run-real-private-hwp-smoke",
        "blocking_requirement": "real-private-hwp-hwpx-sample",
        "commands": ["npm run hwp:smoke"],
        "required_env": ["CAREVAULT_HWP_SMOKE_REPORT_PATH"],
    }
]
path.write_text(json.dumps(report, indent=2) + "\n")
PY
expect_failure "ready-with-actions" CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$INCONSISTENT_READY_JSON"
assert_contains "$TMP_DIR/ready-with-actions.err" "ready inputs JSON must not list next required actions"

expect_success "valid-no-inputs" CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$NO_INPUTS_JSON"
assert_contains "$TMP_DIR/valid-no-inputs.out" "Objective readiness inputs JSON verified."
assert_contains "$TMP_DIR/valid-no-inputs.out" "Status: missing-evidence"
assert_contains "$TMP_DIR/valid-no-inputs.out" "Blocking requirements: real-private-hwp-hwpx-sample, external-clinician-source-review"
assert_contains "$TMP_DIR/valid-no-inputs.out" "Next actions: run-real-private-hwp-smoke, complete-external-clinician-source-review"
assert_not_contains "$TMP_DIR/valid-no-inputs.out" "$TMP_DIR"

expect_success "valid-ready" CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$READY_JSON"
assert_contains "$TMP_DIR/valid-ready.out" "Objective readiness inputs JSON verified."
assert_contains "$TMP_DIR/valid-ready.out" "Status: ready"
assert_contains "$TMP_DIR/valid-ready.out" "Blocking requirements: none"
assert_contains "$TMP_DIR/valid-ready.out" "Next actions: none"
assert_not_contains "$TMP_DIR/valid-ready.out" "$TMP_DIR"

printf 'Objective readiness input JSON verification fixture tests passed.\n'
