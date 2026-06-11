#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/smoke_clinical_source_urls.sh"
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

expect_failure() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"

  if env "$@" bash "$SCRIPT" > "$output_file" 2>&1; then
    printf 'Expected failure for %s\n' "$name" >&2
    cat "$output_file" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$name"
}

expect_success() {
  local name="$1"
  shift
  local output_file="$TMP_DIR/$name.out"

  if ! env "$@" bash "$SCRIPT" > "$output_file" 2>&1; then
    printf 'Expected success for %s\n' "$name" >&2
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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_CLINICAL_SOURCE_REPORT_PATH"

expect_failure "bad-limit" CAREVAULT_CLINICAL_SOURCE_URL_LIMIT=0
assert_contains "$TMP_DIR/bad-limit.out" "must be a positive integer"

expect_failure "missing-report-parent" \
  CAREVAULT_CLINICAL_SOURCE_URL_LIMIT=1 \
  CAREVAULT_CLINICAL_SOURCE_REPORT_PATH="$TMP_DIR/missing/report.json"
assert_contains "$TMP_DIR/missing-report-parent.out" "report directory is not writable"

REPORT_PATH="$TMP_DIR/source-url-smoke.json"
expect_success "limited-report" \
  CAREVAULT_CLINICAL_SOURCE_URL_LIMIT=1 \
  CAREVAULT_CLINICAL_SOURCE_REPORT_PATH="$REPORT_PATH"
assert_contains "$TMP_DIR/limited-report.out" "Clinical source URL smoke passed: 1 URLs checked."

node - <<'NODE' "$REPORT_PATH"
const fs = require("fs");
const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
if (report.schema !== "carevault-clinical-source-url-smoke.v1") process.exit(1);
if (report.status !== "passed") process.exit(1);
if (report.checked_url_count !== 1) process.exit(1);
if (report.failed_url_count !== 0) process.exit(1);
if (report.url_limit !== 1) process.exit(1);
if (!Array.isArray(report.source_files)) process.exit(1);
if (!report.source_files.includes("src/healthStandards.ts")) process.exit(1);
if (!report.source_files.includes("src/healthRules.ts")) process.exit(1);
if (!report.source_files.includes("src/labPresets.ts")) process.exit(1);
if (!Array.isArray(report.checked_urls) || report.checked_urls.length !== 1) process.exit(1);
if (!Array.isArray(report.failed_urls) || report.failed_urls.length !== 0) process.exit(1);
NODE

printf 'Clinical source URL smoke fixture tests passed.\n'
