#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUTS_VERIFY_SCRIPT="$ROOT_DIR/scripts/verify_objective_readiness_inputs.sh"

print_usage() {
  cat <<'EOF'
Usage:
  CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR=/tmp/carevault-objective-readiness-handoff \
  npm run objective:readiness:handoff:verify

This command verifies a previously exported CareVault objective readiness
handoff bundle. It checks the machine-readable manifest, required file set,
current blocked readiness status, final evidence command sequence, and local
path exclusion. The command sequence must verify the path-safe input doctor JSON
before the final completion gate. It does not create private HWP evidence or
clinical approval.
EOF
}

case "${1:-}" in
  -h | --help)
    print_usage
    exit 0
    ;;
  "")
    ;;
  *)
    print_usage >&2
    exit 2
    ;;
esac

if [[ -z "${CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR:-}" ]]; then
  printf 'FAIL: CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR is required.\n' >&2
  print_usage >&2
  exit 2
fi

if [[ ! -d "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR" || ! -r "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR" ]]; then
  printf 'FAIL: objective readiness handoff directory is not readable.\n' >&2
  exit 2
fi

MANIFEST_PATH="$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR/carevault-objective-readiness-handoff-manifest.json"
if [[ ! -r "$MANIFEST_PATH" ]]; then
  printf 'FAIL: handoff manifest is not readable.\n' >&2
  exit 2
fi

INPUTS_DOCTOR_PATH="$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR/carevault-readiness-inputs-doctor.json"

if grep -R -q -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR"; then
  printf 'FAIL: handoff bundle contains a local path or attachment path field.\n' >&2
  exit 2
fi

CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH="$INPUTS_DOCTOR_PATH" \
  bash "$INPUTS_VERIFY_SCRIPT"

node - <<'NODE' "$CAREVAULT_OBJECTIVE_READINESS_HANDOFF_DIR"
const fs = require("fs");
const path = require("path");

const bundleDir = process.argv[2];
const manifestPath = path.join(
  bundleDir,
  "carevault-objective-readiness-handoff-manifest.json",
);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(2);
}

function readJson(filename, label) {
  try {
    return JSON.parse(fs.readFileSync(path.join(bundleDir, filename), "utf8"));
  } catch {
    fail(`${label} must be valid JSON.`);
  }
}

function readText(filename, label) {
  try {
    return fs.readFileSync(path.join(bundleDir, filename), "utf8");
  } catch {
    fail(`${label} is not readable.`);
  }
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch {
  fail("handoff manifest must be valid JSON.");
}

const expectedBlockers = [
  "real-private-hwp-hwpx-sample",
  "external-clinician-source-review",
];
const expectedCommands = [
  "npm run hwp:smoke",
  "npm run clinical:external-review:packet",
  "npm run clinical:external-review:report",
  "npm run objective:readiness:inputs:doctor",
  "npm run objective:readiness:inputs:verify",
  "npm run objective:readiness:complete",
];
const expectedEvidenceInputs = [
  "CAREVAULT_HWP_SMOKE_REPORT_PATH",
  "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR",
  "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH",
];
const expectedOptionalStatusOutputs = [
  "CAREVAULT_OBJECTIVE_READINESS_INPUTS_JSON_PATH",
];
const requiredBundleFiles = [
  "carevault-private-hwp-smoke-handoff.md",
  "carevault-external-review-packet/clinical-review-packet.md",
  "carevault-external-review-packet/clinical-review-packet.json",
  "carevault-external-review-packet/clinical-workflow-review-packet.md",
  "carevault-external-review-packet/clinical-workflow-review-packet.json",
  "carevault-external-review-packet/objective-readiness-report.md",
  "carevault-external-review-packet/objective-readiness-report.json",
  "carevault-external-review-packet/carevault-external-review-report-template.json",
  "carevault-external-review-packet/reviewer-handoff.md",
  "carevault-objective-readiness-report.md",
  "carevault-objective-readiness-report.json",
  "carevault-readiness-inputs-doctor.json",
  "carevault-final-readiness-handoff.md",
  "carevault-objective-readiness-handoff-manifest.json",
];

function assertArrayIncludesAll(actual, expected, message) {
  if (!Array.isArray(actual)) fail(message);
  for (const value of expected) {
    if (!actual.includes(value)) fail(message);
  }
}

function assertArrayEquals(actual, expected, message) {
  if (!Array.isArray(actual) || actual.length !== expected.length) fail(message);
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) fail(message);
  }
}

if (manifest.schema !== "carevault-objective-readiness-handoff.v1") {
  fail("handoff manifest schema is unsupported.");
}
if (manifest.status !== "blocked") {
  fail("handoff manifest status must be blocked.");
}
assertArrayIncludesAll(
  manifest.blocking_requirement_ids,
  expectedBlockers,
  "handoff manifest must list the current blocking requirements.",
);
assertArrayIncludesAll(
  manifest.bundle_files,
  requiredBundleFiles,
  "handoff manifest must list the required bundle files.",
);
assertArrayEquals(
  manifest.evidence_command_sequence,
  expectedCommands,
  "handoff manifest must list the final evidence command sequence.",
);
assertArrayIncludesAll(
  manifest.required_evidence_inputs,
  expectedEvidenceInputs,
  "handoff manifest must list required evidence inputs.",
);
assertArrayIncludesAll(
  manifest.optional_status_outputs,
  expectedOptionalStatusOutputs,
  "handoff manifest must list optional status outputs.",
);
if (
  typeof manifest.non_evidence_statement !== "string" ||
  !manifest.non_evidence_statement.includes("does not create")
) {
  fail("handoff manifest must keep the non-evidence boundary.");
}

const resolvedBundleDir = path.resolve(bundleDir);
for (const filename of manifest.bundle_files) {
  if (
    typeof filename !== "string" ||
    filename.length === 0 ||
    path.isAbsolute(filename) ||
    filename.split(/[\\/]/).includes("..")
  ) {
    fail("handoff manifest includes an unsafe bundle filename.");
  }
  const resolvedFile = path.resolve(bundleDir, filename);
  if (!resolvedFile.startsWith(`${resolvedBundleDir}${path.sep}`)) {
    fail("handoff manifest includes an unsafe bundle filename.");
  }
  let stat;
  try {
    stat = fs.statSync(resolvedFile);
  } catch {
    fail(`listed bundle file is missing: ${filename}`);
  }
  if (!stat.isFile() || stat.size === 0) {
    fail(`listed bundle file is missing: ${filename}`);
  }
}

const readiness = readJson(
  "carevault-objective-readiness-report.json",
  "objective readiness report",
);
if (readiness.status !== "blocked") {
  fail("objective readiness report must remain blocked.");
}
assertArrayIncludesAll(
  readiness.blockingRequirementIds,
  expectedBlockers,
  "objective readiness report must list current blockers.",
);

const inputsDoctor = readJson(
  "carevault-readiness-inputs-doctor.json",
  "inputs doctor baseline",
);
if (inputsDoctor.schema !== "carevault-objective-readiness-inputs-doctor.v1") {
  fail("inputs doctor baseline schema is unsupported.");
}
if (inputsDoctor.status !== "missing-evidence") {
  fail("inputs doctor baseline status must be missing-evidence.");
}
if (inputsDoctor.final_readiness_gate !== "not-ready") {
  fail("inputs doctor baseline final gate must be not-ready.");
}
if (inputsDoctor.input_paths_included !== false) {
  fail("inputs doctor baseline must omit configured input paths.");
}
if (
  !inputsDoctor.evidence_inputs ||
  inputsDoctor.evidence_inputs.hwp_smoke_report !== "missing" ||
  inputsDoctor.evidence_inputs.external_review_packet !== "missing" ||
  inputsDoctor.evidence_inputs.external_review_report !== "missing"
) {
  fail("inputs doctor baseline must list all evidence inputs as missing.");
}
assertArrayIncludesAll(
  inputsDoctor.blocking_requirements,
  expectedBlockers,
  "inputs doctor baseline must list current blockers.",
);
if (
  !Array.isArray(inputsDoctor.next_required_actions) ||
  inputsDoctor.next_required_actions.length !== 2
) {
  fail("inputs doctor baseline must list the two next required actions.");
}
const nextActionIds = inputsDoctor.next_required_actions.map((action) => action.id);
if (
  nextActionIds[0] !== "run-real-private-hwp-smoke" ||
  nextActionIds[1] !== "complete-external-clinician-source-review"
) {
  fail("inputs doctor baseline must list the expected next action ids.");
}
for (const action of inputsDoctor.next_required_actions) {
  if (!Array.isArray(action.commands) || action.commands.length === 0) {
    fail("inputs doctor baseline next actions must include command names.");
  }
  if (!Array.isArray(action.required_env) || action.required_env.length === 0) {
    fail("inputs doctor baseline next actions must include required env names.");
  }
}

const finalHandoff = readText(
  "carevault-final-readiness-handoff.md",
  "final readiness handoff",
);
for (const blocker of expectedBlockers) {
  if (!finalHandoff.includes(blocker)) {
    fail("final readiness handoff must list current blockers.");
  }
}
for (const command of expectedCommands) {
  if (!finalHandoff.includes(command)) {
    fail("final readiness handoff must list the final evidence command sequence.");
  }
}
if (!finalHandoff.includes("carevault-readiness-inputs-doctor.json")) {
  fail("final readiness handoff must list the inputs doctor baseline file.");
}

const reviewerHandoff = readText(
  "carevault-external-review-packet/reviewer-handoff.md",
  "reviewer handoff",
);
if (!reviewerHandoff.includes("Artifact Hashes")) {
  fail("reviewer handoff must include artifact hashes.");
}
if (!reviewerHandoff.includes("Workflow Requirement Summary")) {
  fail("reviewer handoff must include workflow requirement summary.");
}

console.log("Objective readiness handoff verified.");
console.log(`Status: ${manifest.status}`);
console.log(`Bundle files: ${manifest.bundle_files.length}`);
console.log(`Blocking requirements: ${expectedBlockers.join(", ")}`);
NODE
