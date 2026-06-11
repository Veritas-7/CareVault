#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/export_objective_readiness_handoff.sh"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

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

assert_file_exists() {
  local path="$1"

  if [[ ! -s "$path" ]]; then
    printf 'Expected non-empty file: %s\n' "$path" >&2
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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR"

expect_failure "missing-output-dir"
assert_contains "$TMP_DIR/missing-output-dir.err" "CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR is required"

expect_failure "missing-parent" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$TMP_DIR/missing/bundle"
assert_contains "$TMP_DIR/missing-parent.err" "objective readiness handoff parent directory is not writable"
assert_not_contains "$TMP_DIR/missing-parent.err" "$TMP_DIR/missing"

HANDOFF_DIR="$TMP_DIR/bundle"
expect_success "bundle-export" CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$HANDOFF_DIR"
assert_contains "$TMP_DIR/bundle-export.out" "Objective readiness handoff bundle written."
assert_not_contains "$TMP_DIR/bundle-export.out" "$HANDOFF_DIR"

assert_file_exists "$HANDOFF_DIR/carevault-private-hwp-smoke-handoff.md"
assert_file_exists "$HANDOFF_DIR/carevault-objective-readiness-report.md"
assert_file_exists "$HANDOFF_DIR/carevault-objective-readiness-report.json"
assert_file_exists "$HANDOFF_DIR/carevault-final-readiness-handoff.md"

for filename in \
  clinical-review-packet.md \
  clinical-review-packet.json \
  clinical-workflow-review-packet.md \
  clinical-workflow-review-packet.json \
  objective-readiness-report.md \
  objective-readiness-report.json \
  carevault-external-review-report-template.json \
  reviewer-handoff.md
do
  assert_file_exists "$HANDOFF_DIR/carevault-external-review-packet/$filename"
done

FINAL_HANDOFF="$HANDOFF_DIR/carevault-final-readiness-handoff.md"
assert_contains "$FINAL_HANDOFF" "real-private-hwp-hwpx-sample"
assert_contains "$FINAL_HANDOFF" "external-clinician-source-review"
assert_contains "$FINAL_HANDOFF" "npm run hwp:smoke"
assert_contains "$FINAL_HANDOFF" "npm run clinical:external-review:packet"
assert_contains "$FINAL_HANDOFF" "npm run clinical:external-review:report"
assert_contains "$FINAL_HANDOFF" "npm run objective:readiness:complete"
assert_contains "$FINAL_HANDOFF" "CAREVAULT_HWP_SMOKE_REPORT_PATH=/path/to/carevault-hwp-smoke-report.json"
assert_contains "$FINAL_HANDOFF" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/path/to/carevault-external-review-packet"

assert_contains "$HANDOFF_DIR/carevault-objective-readiness-report.md" "Status: blocked"
assert_contains "$HANDOFF_DIR/carevault-objective-readiness-report.md" "real-private-hwp-hwpx-sample"
assert_contains "$HANDOFF_DIR/carevault-objective-readiness-report.md" "external-clinician-source-review"
assert_contains "$HANDOFF_DIR/carevault-external-review-packet/reviewer-handoff.md" "Workflow Requirement Summary"

if grep -R -n -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$HANDOFF_DIR"; then
  printf 'Expected objective readiness handoff bundle to be path-safe.\n' >&2
  exit 1
fi

printf 'Objective readiness handoff fixture tests passed.\n'
