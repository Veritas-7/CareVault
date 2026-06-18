#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const reviewedArtifactFiles = [
  ["clinical-review-packet", "clinical-review-packet.md"],
  ["clinical-workflow-review-packet", "clinical-workflow-review-packet.md"],
  ["clinical-source-url-smoke-report", "clinical-source-url-smoke-report.json"],
  ["objective-readiness-report", "objective-readiness-report.md"],
];

function fail(message) {
  console.error(message);
  process.exit(2);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    fail("FAIL: packet fixture input JSON is not readable.");
  }
}

function artifactFromFile(packetDir, id, filename) {
  const bytes = readFileSync(join(packetDir, filename));
  return {
    bytes: bytes.length,
    id,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    status: "reviewed",
  };
}

const [packetDir, variant, outputPath] = process.argv.slice(2);

if (!packetDir || !variant || !outputPath) {
  fail("Usage: write_external_review_report_fixture.mjs <packet-dir> <variant> <output-path>");
}

const clinical = readJson(join(packetDir, "clinical-review-packet.json"));
const workflow = readJson(join(packetDir, "clinical-workflow-review-packet.json"));

const report = {
  schema: "carevault-external-clinician-review.v4",
  status: "passed",
  reviewed_at: "2026-06-11",
  reviewer_role: "external clinical reviewer",
  reviewed_artifacts: reviewedArtifactFiles.map(([id, filename]) =>
    artifactFromFile(packetDir, id, filename),
  ),
  required_check_ids: [
    "clinician-source-review",
    "clinical-source-url-reachability",
    "real-workflow-review",
  ],
  unresolved_required_check_ids: [],
  attestations: {
    source_registry_reviewed: true,
    real_workflow_reviewed: true,
    non_diagnosis_boundary_reviewed: true,
    cervical_hypertension_diabetes_scope_reviewed: true,
    source_url_reachability_reviewed: true,
  },
  critical_findings_open: 0,
  major_findings_open: 0,
  source_registry_error_count: clinical.summary.registryErrorCount,
  source_registry_total_count: clinical.summary.totalSources,
  source_registry_warning_count: clinical.summary.registryWarningCount,
  workflow_surface_count: workflow.surfaces.length,
};

switch (variant) {
  case "valid":
    break;
  case "missing-scope":
    report.required_check_ids = ["clinician-source-review"];
    break;
  case "missing-artifact":
    report.reviewed_artifacts = report.reviewed_artifacts.slice(0, 2);
    break;
  case "missing-hash":
    report.reviewed_artifacts[0] = {
      ...report.reviewed_artifacts[0],
      sha256: "not-a-sha",
    };
    break;
  case "stale-packet-hash":
    report.reviewed_artifacts[0] = {
      ...report.reviewed_artifacts[0],
      sha256: "f".repeat(64),
    };
    break;
  case "open-finding":
    report.major_findings_open = 1;
    break;
  case "stale-count":
    report.source_registry_total_count = clinical.summary.totalSources - 1;
    report.workflow_surface_count = workflow.surfaces.length - 1;
    break;
  default:
    fail(`FAIL: unknown external review fixture variant: ${variant}`);
}

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
