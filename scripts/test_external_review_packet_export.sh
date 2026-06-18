#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/export_external_review_packet.sh"
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
assert_contains "$TMP_DIR/help.out" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_HWP_SMOKE_REPORT_PATH"
assert_contains "$TMP_DIR/help.out" "CAREVAULT_CLINICAL_SOURCE_REPORT_PATH"

expect_failure "missing-output-dir"
assert_contains "$TMP_DIR/missing-output-dir.err" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR is required"

expect_failure "missing-parent" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$TMP_DIR/missing/packet"
assert_contains "$TMP_DIR/missing-parent.err" "external review packet parent directory is not writable"

PACKET_DIR="$TMP_DIR/packet"
SOURCE_URL_REPORT="$TMP_DIR/clinical-source-url-smoke-report.json"
FAILED_SOURCE_URL_REPORT="$TMP_DIR/failed-clinical-source-url-smoke-report.json"
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

cat > "$FAILED_SOURCE_URL_REPORT" <<'JSON'
{
  "schema": "carevault-clinical-source-url-smoke.v1",
  "status": "failed",
  "checked_url_count": 1,
  "failed_url_count": 1,
  "source_files": [
    "src/healthStandards.ts"
  ],
  "url_limit": 1,
  "checked_urls": [
    "https://www.cancer.go.kr"
  ],
  "failed_urls": [
    "https://www.cancer.go.kr"
  ]
}
JSON

expect_failure "failed-source-url-report" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$TMP_DIR/failed-source-packet" \
  CAREVAULT_CLINICAL_SOURCE_REPORT_PATH="$FAILED_SOURCE_URL_REPORT"
assert_contains "$TMP_DIR/failed-source-url-report.err" "clinical source URL smoke report status must be passed"

expect_success "packet-export" \
  CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR="$PACKET_DIR" \
  CAREVAULT_CLINICAL_SOURCE_REPORT_PATH="$SOURCE_URL_REPORT"
assert_contains "$TMP_DIR/packet-export.err" "External review packet exported with 9 files"

for filename in \
  clinical-review-packet.md \
  clinical-review-packet.json \
  clinical-workflow-review-packet.md \
  clinical-workflow-review-packet.json \
  clinical-source-url-smoke-report.json \
  objective-readiness-report.md \
  objective-readiness-report.json \
  carevault-external-review-report-template.json \
  reviewer-handoff.md
do
  assert_file_exists "$PACKET_DIR/$filename"
done

assert_contains "$PACKET_DIR/reviewer-handoff.md" "Artifact Hashes"
assert_contains "$PACKET_DIR/reviewer-handoff.md" "clinical-review-packet.md"
assert_contains "$PACKET_DIR/reviewer-handoff.md" "clinical-source-url-smoke-report.json"
assert_contains "$PACKET_DIR/reviewer-handoff.md" "objective-readiness-report.json"
assert_contains "$PACKET_DIR/reviewer-handoff.md" "Workflow Requirement Summary"
assert_contains "$PACKET_DIR/reviewer-handoff.md" "parsed-document-user-facing-surfaces"
assert_contains "$PACKET_DIR/reviewer-handoff.md" "PASS: parsed document evidence across user-facing surfaces"
assert_contains "$PACKET_DIR/reviewer-handoff.md" "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/path/to/carevault-external-review-packet"

if grep -R -n -E '/Users/|[A-Za-z]:\\|attachmentPath|private-carevault' "$PACKET_DIR"; then
  printf 'Expected external review packet to be path-safe.\n' >&2
  exit 1
fi

node - <<'NODE' "$PACKET_DIR"
const fs = require("fs");
const path = require("path");
const packetDir = process.argv[2];
const clinical = JSON.parse(fs.readFileSync(path.join(packetDir, "clinical-review-packet.json"), "utf8"));
const workflow = JSON.parse(fs.readFileSync(path.join(packetDir, "clinical-workflow-review-packet.json"), "utf8"));
const sourceUrlReport = JSON.parse(fs.readFileSync(path.join(packetDir, "clinical-source-url-smoke-report.json"), "utf8"));
const readiness = JSON.parse(fs.readFileSync(path.join(packetDir, "objective-readiness-report.json"), "utf8"));
const template = JSON.parse(fs.readFileSync(path.join(packetDir, "carevault-external-review-report-template.json"), "utf8"));
if (clinical.summary.totalSources <= 70) process.exit(1);
if (workflow.surfaces.length !== 6) process.exit(1);
if (sourceUrlReport.schema !== "carevault-clinical-source-url-smoke.v1") process.exit(1);
if (sourceUrlReport.status !== "passed") process.exit(1);
if (sourceUrlReport.checked_url_count !== 2) process.exit(1);
if (sourceUrlReport.failed_url_count !== 0) process.exit(1);
const workflowParsedSurfaceRequirement = workflow.requirements.find(
  (requirement) => requirement.id === "parsed-document-user-facing-surfaces",
);
if (!workflowParsedSurfaceRequirement) process.exit(1);
if (workflowParsedSurfaceRequirement.status !== "pass") process.exit(1);
if (workflowParsedSurfaceRequirement.label !== "parsed document evidence across user-facing surfaces") process.exit(1);
if (readiness.status !== "blocked") process.exit(1);
if (!readiness.blockingRequirementIds.includes("real-private-hwp-hwpx-sample")) process.exit(1);
const readinessParsedSurfaceRequirement = readiness.workflowReviewPacket.requirements.find(
  (requirement) => requirement.id === "parsed-document-user-facing-surfaces",
);
if (!readinessParsedSurfaceRequirement) process.exit(1);
if (readinessParsedSurfaceRequirement.status !== "pass") process.exit(1);
if (template.schema !== "carevault-external-clinician-review.v4") process.exit(1);
if (template.source_registry_total_count !== clinical.summary.totalSources) process.exit(1);
if (template.workflow_surface_count !== workflow.surfaces.length) process.exit(1);
const requiredArtifactIds = [
  "clinical-review-packet",
  "clinical-workflow-review-packet",
  "clinical-source-url-smoke-report",
  "objective-readiness-report",
];
if (template.reviewed_artifacts.length !== requiredArtifactIds.length) process.exit(1);
for (const id of requiredArtifactIds) {
  const artifact = template.reviewed_artifacts.find((candidate) => candidate.id === id);
  if (!artifact) process.exit(1);
  if (artifact.status !== "pending") process.exit(1);
  if (artifact.sha256 !== "REPLACE_WITH_PACKET_SHA256") process.exit(1);
  if (artifact.bytes !== 0) process.exit(1);
}
NODE

printf 'External review packet export fixture tests passed.\n'
