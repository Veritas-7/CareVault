#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERIFY_SCRIPT="$ROOT_DIR/scripts/verify_objective_readiness_handoff.sh"
EXPORT_SCRIPT="$ROOT_DIR/scripts/export_objective_readiness_handoff.sh"
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

copy_bundle() {
  local name="$1"
  local destination="$TMP_DIR/$name"

  cp -R "$VALID_BUNDLE" "$destination"
  printf '%s\n' "$destination"
}

if ! bash "$VERIFY_SCRIPT" --help > "$TMP_DIR/help.out" 2>&1; then
  printf 'Expected help to succeed.\n' >&2
  cat "$TMP_DIR/help.out" >&2
  exit 1
fi
assert_contains "$TMP_DIR/help.out" "CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_OBJECTIVE_READINESS_HANDOFF_VERIFY_JSON_PATH"

VALID_BUNDLE="$TMP_DIR/valid-bundle"
if ! CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$VALID_BUNDLE" \
  bash "$EXPORT_SCRIPT" > "$TMP_DIR/export.out" 2> "$TMP_DIR/export.err"; then
  printf 'Expected handoff export setup to succeed.\n' >&2
  printf '%s\n' '--- stdout ---' >&2
  cat "$TMP_DIR/export.out" >&2
  printf '%s\n' '--- stderr ---' >&2
  cat "$TMP_DIR/export.err" >&2
  exit 1
fi

expect_failure "missing-dir-env"
assert_contains "$TMP_DIR/missing-dir-env.err" "CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR is required"

expect_failure "unreadable-dir" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$TMP_DIR/no-such-bundle"
assert_contains "$TMP_DIR/unreadable-dir.err" "objective readiness handoff directory is not readable"
assert_not_contains "$TMP_DIR/unreadable-dir.err" "$TMP_DIR/no-such-bundle"

expect_success "valid-bundle" CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$VALID_BUNDLE"
assert_contains "$TMP_DIR/valid-bundle.out" "Objective readiness handoff verified."
assert_contains "$TMP_DIR/valid-bundle.out" "Status: blocked"
assert_contains "$TMP_DIR/valid-bundle.out" "Bundle files: 14"
assert_contains "$TMP_DIR/valid-bundle.out" "real-private-hwp-hwpx-sample, external-clinician-source-review"
assert_not_contains "$TMP_DIR/valid-bundle.out" "$VALID_BUNDLE"

VERIFY_JSON="$TMP_DIR/verify-report.json"
expect_success "valid-bundle-json" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$VALID_BUNDLE" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_VERIFY_JSON_PATH="$VERIFY_JSON"
if [[ ! -s "$VERIFY_JSON" ]]; then
  printf 'Expected handoff verify JSON report to be written.\n' >&2
  exit 1
fi
node - <<'NODE' "$VERIFY_JSON"
const fs = require("fs");
const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const expectedCommands = [
  "npm run hwp:smoke",
  "npm run clinical:external-review:packet",
  "npm run clinical:external-review:report",
  "npm run objective:readiness:inputs:doctor",
  "npm run objective:readiness:inputs:verify",
  "npm run objective:readiness:complete",
];
if (report.schema !== "carevault-objective-readiness-handoff-verify.v1") process.exit(1);
if (report.status !== "verified-blocked") process.exit(1);
if (report.bundle_status !== "blocked") process.exit(1);
if (report.bundle_file_count !== 14) process.exit(1);
if (report.local_paths_included !== false) process.exit(1);
if (
  !Array.isArray(report.blocking_requirement_ids) ||
  report.blocking_requirement_ids.join(",") !==
    "real-private-hwp-hwpx-sample,external-clinician-source-review"
) {
  process.exit(1);
}
if (
  !Array.isArray(report.evidence_command_sequence) ||
  report.evidence_command_sequence.join("\n") !== expectedCommands.join("\n")
) {
  process.exit(1);
}
if (!report.inputs_doctor || report.inputs_doctor.status !== "missing-evidence") process.exit(1);
if (report.inputs_doctor.final_readiness_gate !== "not-ready") process.exit(1);
if (report.inputs_doctor.input_paths_included !== false) process.exit(1);
if (
  !Array.isArray(report.inputs_doctor.next_required_action_ids) ||
  report.inputs_doctor.next_required_action_ids.join(",") !==
    "run-real-private-hwp-smoke,complete-external-clinician-source-review"
) {
  process.exit(1);
}
NODE
if grep -q -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$VERIFY_JSON"; then
  printf 'Expected handoff verify JSON report to be path-safe.\n' >&2
  exit 1
fi
assert_not_contains "$TMP_DIR/valid-bundle-json.out" "$TMP_DIR"

expect_failure "verify-json-missing-parent" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$VALID_BUNDLE" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_VERIFY_JSON_PATH="$TMP_DIR/missing/report.json"
assert_contains "$TMP_DIR/verify-json-missing-parent.err" "handoff verify JSON parent directory is not writable"
assert_not_contains "$TMP_DIR/verify-json-missing-parent.err" "$TMP_DIR/missing"

MISSING_INPUT_VERIFY_COMMAND_BUNDLE="$(copy_bundle missing-input-verify-command-bundle)"
node - <<'NODE' "$MISSING_INPUT_VERIFY_COMMAND_BUNDLE/carevault-objective-readiness-handoff-manifest.json" "$MISSING_INPUT_VERIFY_COMMAND_BUNDLE/carevault-final-readiness-handoff.md"
const fs = require("fs");
const manifestPath = process.argv[2];
const handoffPath = process.argv[3];
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.evidence_command_sequence = manifest.evidence_command_sequence.filter(
  (command) => command !== "npm run objective:readiness:inputs:verify",
);
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const handoff = fs
  .readFileSync(handoffPath, "utf8")
  .replace(/\nCAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH=\/path\/to\/carevault-readiness-inputs\.json \\\n?npm run objective:readiness:inputs:verify\n?/g, "\n");
fs.writeFileSync(handoffPath, handoff);
NODE
expect_failure "missing-input-verify-command" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$MISSING_INPUT_VERIFY_COMMAND_BUNDLE"
assert_contains "$TMP_DIR/missing-input-verify-command.err" "final evidence command sequence"

MISSING_MANIFEST_BUNDLE="$(copy_bundle missing-manifest-bundle)"
rm "$MISSING_MANIFEST_BUNDLE/carevault-objective-readiness-handoff-manifest.json"
expect_failure "missing-manifest" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$MISSING_MANIFEST_BUNDLE"
assert_contains "$TMP_DIR/missing-manifest.err" "handoff manifest is not readable"
assert_not_contains "$TMP_DIR/missing-manifest.err" "$MISSING_MANIFEST_BUNDLE"

BAD_JSON_BUNDLE="$(copy_bundle bad-json-bundle)"
printf '{not-json' > "$BAD_JSON_BUNDLE/carevault-objective-readiness-handoff-manifest.json"
expect_failure "bad-manifest-json" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$BAD_JSON_BUNDLE"
assert_contains "$TMP_DIR/bad-manifest-json.err" "handoff manifest must be valid JSON"
assert_not_contains "$TMP_DIR/bad-manifest-json.err" "$BAD_JSON_BUNDLE"

MISSING_FILE_BUNDLE="$(copy_bundle missing-file-bundle)"
rm "$MISSING_FILE_BUNDLE/carevault-final-readiness-handoff.md"
expect_failure "missing-listed-file" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$MISSING_FILE_BUNDLE"
assert_contains "$TMP_DIR/missing-listed-file.err" "listed bundle file is missing"
assert_contains "$TMP_DIR/missing-listed-file.err" "carevault-final-readiness-handoff.md"
assert_not_contains "$TMP_DIR/missing-listed-file.err" "$MISSING_FILE_BUNDLE"

WRONG_STATUS_BUNDLE="$(copy_bundle wrong-status-bundle)"
node - <<'NODE' "$WRONG_STATUS_BUNDLE/carevault-objective-readiness-handoff-manifest.json"
const fs = require("fs");
const path = process.argv[2];
const manifest = JSON.parse(fs.readFileSync(path, "utf8"));
manifest.status = "pass";
fs.writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
NODE
expect_failure "wrong-status" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$WRONG_STATUS_BUNDLE"
assert_contains "$TMP_DIR/wrong-status.err" "handoff manifest status must be blocked"

WRONG_INPUTS_STATUS_BUNDLE="$(copy_bundle wrong-inputs-status-bundle)"
node - <<'NODE' "$WRONG_INPUTS_STATUS_BUNDLE/carevault-readiness-inputs-doctor.json"
const fs = require("fs");
const path = process.argv[2];
const report = JSON.parse(fs.readFileSync(path, "utf8"));
report.status = "ready";
fs.writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
NODE
expect_failure "wrong-inputs-status" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$WRONG_INPUTS_STATUS_BUNDLE"
assert_contains "$TMP_DIR/wrong-inputs-status.err" "ready inputs JSON must have final_readiness_gate pass"

EXTRA_INPUTS_BLOCKER_BUNDLE="$(copy_bundle extra-inputs-blocker-bundle)"
node - <<'NODE' "$EXTRA_INPUTS_BLOCKER_BUNDLE/carevault-readiness-inputs-doctor.json"
const fs = require("fs");
const path = process.argv[2];
const report = JSON.parse(fs.readFileSync(path, "utf8"));
report.blocking_requirements = [
  ...report.blocking_requirements,
  "unsupported-extra-blocker",
];
fs.writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
NODE
expect_failure "extra-inputs-blocker" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$EXTRA_INPUTS_BLOCKER_BUNDLE"
assert_contains "$TMP_DIR/extra-inputs-blocker.err" "inputs doctor JSON blockers do not match accepted input states"

PATH_LEAK_BUNDLE="$(copy_bundle path-leak-bundle)"
printf '\n/Users/wj/private-carevault/sample.hwp\n' >> "$PATH_LEAK_BUNDLE/carevault-final-readiness-handoff.md"
expect_failure "path-leak" \
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR="$PATH_LEAK_BUNDLE"
assert_contains "$TMP_DIR/path-leak.err" "handoff bundle contains a local path or attachment path field"
assert_not_contains "$TMP_DIR/path-leak.err" "$PATH_LEAK_BUNDLE"

printf 'Objective readiness handoff verification fixture tests passed.\n'
