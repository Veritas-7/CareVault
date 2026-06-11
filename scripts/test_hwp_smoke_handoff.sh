#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/export_hwp_smoke_handoff.sh"
HANDOFF_PATH="$ROOT_DIR/docs/review-templates/carevault-private-hwp-smoke-handoff.md"
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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_HWP_HANDOFF_PATH"

expect_success "stdout-handoff"
assert_contains "$TMP_DIR/stdout-handoff.out" "CareVault Private HWP/HWPX Smoke Handoff"
assert_contains "$TMP_DIR/stdout-handoff.out" "CAREVAULT_HWP_SAMPLE_PATH=/path/to/private-sample.hwp"
assert_contains "$TMP_DIR/stdout-handoff.out" "CAREVAULT_HWP_SAMPLE_DIR=/path/to/private-samples"
assert_contains "$TMP_DIR/stdout-handoff.out" "npm run objective:readiness:report"
assert_contains "$TMP_DIR/stdout-handoff.err" "HWP/HWPX sample smoke fixture tests passed."
assert_contains "$TMP_DIR/stdout-handoff.err" "Objective readiness report smoke fixture tests passed."
assert_not_contains "$TMP_DIR/stdout-handoff.out" "/Users/wj"

OUTPUT_HANDOFF="$TMP_DIR/exported-handoff.md"
expect_success "file-handoff" CAREVAULT_HWP_HANDOFF_PATH="$OUTPUT_HANDOFF"
assert_contains "$TMP_DIR/file-handoff.out" "Private HWP/HWPX smoke handoff written"
cmp -s "$HANDOFF_PATH" "$OUTPUT_HANDOFF"

expect_failure "missing-parent" CAREVAULT_HWP_HANDOFF_PATH="$TMP_DIR/missing/handoff.md"
assert_contains "$TMP_DIR/missing-parent.err" "handoff output directory is not writable"
assert_not_contains "$TMP_DIR/missing-parent.err" "$TMP_DIR/missing"

printf 'HWP/HWPX smoke handoff fixture tests passed.\n'
