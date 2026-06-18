import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import externalReviewTemplate from "../docs/review-templates/carevault-external-review-report-template.json";
import {
  buildCareVaultObjectiveReadinessExport,
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
  type CareVaultExternalReviewEvidence,
  type CareVaultHwpSmokeReportEvidence,
} from "../src/carevaultObjectiveReadiness";
import {
  buildClinicalReviewPacket,
  formatClinicalReviewPacketMarkdown,
} from "../src/clinicalReviewPacket";
import {
  buildClinicalWorkflowReviewPacket,
  formatClinicalWorkflowReviewPacketMarkdown,
  type ClinicalWorkflowReviewRequirement,
} from "../src/clinicalWorkflowReview";

type WrittenArtifact = {
  bytes: number;
  filename: string;
  sha256: string;
};

type ClinicalSourceUrlSmokeReport = {
  checked_url_count: number;
  checked_urls: string[];
  failed_url_count: number;
  failed_urls: string[];
  schema: string;
  source_files: string[];
  status: string;
  url_limit: number | null;
};

const localPathLeakPattern = /\/Users\/|[A-Za-z]:\\|attachmentPath|private-carevault/;

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

function readOptionalJson<T>(envName: string, label: string): T | undefined {
  const reportPath = process.env[envName];
  if (!reportPath) return undefined;

  try {
    return JSON.parse(readFileSync(reportPath, "utf8")) as T;
  } catch {
    fail(`FAIL: configured ${label} must be valid JSON.`);
  }
}

function readRequiredJson<T>(envName: string, label: string): T {
  const reportPath = process.env[envName];
  if (!reportPath) {
    fail(`FAIL: ${envName} is required.`);
  }

  try {
    return JSON.parse(readFileSync(reportPath, "utf8")) as T;
  } catch {
    fail(`FAIL: configured ${label} must be valid JSON.`);
  }
}

function stableJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function assertPathSafe(filename: string, content: string) {
  if (localPathLeakPattern.test(content)) {
    fail(`FAIL: ${filename} would include a local path or attachment path field.`);
  }
}

function validateClinicalSourceUrlSmokeReport(report: ClinicalSourceUrlSmokeReport) {
  const checkedUrls = Array.isArray(report.checked_urls) ? report.checked_urls : [];
  const failedUrls = Array.isArray(report.failed_urls) ? report.failed_urls : [];
  const sourceFiles = Array.isArray(report.source_files) ? report.source_files : [];

  if (report.schema !== "carevault-clinical-source-url-smoke.v1") {
    fail("FAIL: clinical source URL smoke report schema is unsupported.");
  }
  if (report.status !== "passed") {
    fail("FAIL: clinical source URL smoke report status must be passed.");
  }
  if (
    !Number.isInteger(report.checked_url_count)
    || report.checked_url_count <= 0
    || report.checked_url_count !== checkedUrls.length
  ) {
    fail("FAIL: clinical source URL smoke report checked_url_count is inconsistent.");
  }
  if (
    !Number.isInteger(report.failed_url_count)
    || report.failed_url_count !== 0
    || failedUrls.length !== 0
  ) {
    fail("FAIL: clinical source URL smoke report must have zero failed URLs.");
  }
  if (
    !sourceFiles.every((sourceFile) =>
      typeof sourceFile === "string"
      && sourceFile.length > 0
      && !sourceFile.startsWith("/")
      && !sourceFile.includes("..")
      && !sourceFile.includes("\\")
    )
  ) {
    fail("FAIL: clinical source URL smoke report source_files must be repo-relative labels.");
  }
  if (!checkedUrls.every((url) => typeof url === "string" && url.startsWith("https://"))) {
    fail("FAIL: clinical source URL smoke report checked URLs must be HTTPS URLs.");
  }
}

function writeArtifact(outputDir: string, filename: string, content: string): WrittenArtifact {
  assertPathSafe(filename, content);
  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
  writeFileSync(join(outputDir, filename), normalizedContent);
  return {
    bytes: Buffer.byteLength(normalizedContent),
    filename,
    sha256: sha256(normalizedContent),
  };
}

function formatReviewerHandoff(
  artifacts: WrittenArtifact[],
  workflowRequirements: ClinicalWorkflowReviewRequirement[],
) {
  return [
    "# CareVault External Review Packet",
    "",
    "This packet contains command-generated review inputs for an external clinician/source reviewer.",
    "It is not a clinical approval, not a private HWP/HWPX sample result, and not a production medical readiness claim.",
    "",
    "## Required Review Artifacts",
    "- clinical-review-packet.md/json: current clinical source registry review input.",
    "- clinical-workflow-review-packet.md/json: current synthetic workflow review input across RAG, queue, and export surfaces.",
    "- clinical-source-url-smoke-report.json: current command-verified HTTPS reachability report for embedded clinical source URLs.",
    "- objective-readiness-report.md/json: current objective readiness report and remaining blockers.",
    "- carevault-external-review-report-template.json: draft report the reviewer fills after reviewing the artifacts.",
    "",
    "## Workflow Requirement Summary",
    ...workflowRequirements.map(
      (requirement) =>
        `- ${requirement.status.toUpperCase()}: ${requirement.label} (${requirement.id}) - ${requirement.detail}`,
    ),
    "",
    "## Artifact Hashes",
    ...artifacts.map((artifact) =>
      `- ${artifact.filename}: sha256=${artifact.sha256}, bytes=${artifact.bytes}`,
    ),
    "",
    "## Verification Commands",
    "```bash",
    "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/path/to/carevault-external-review-packet \\",
    "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/path/to/filled-external-review.json \\",
    "npm run clinical:external-review:report",
    "",
    "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR=/path/to/carevault-external-review-packet \\",
    "CAREVAULT_HWP_SMOKE_REPORT_PATH=/path/to/carevault-hwp-smoke-report.json \\",
    "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH=/path/to/filled-external-review.json \\",
    "npm run objective:readiness:complete",
    "```",
  ].join("\n");
}

const outputDir = process.env.CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR;
if (!outputDir) {
  fail("FAIL: CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR is required.");
}

const hwpSmokeReportEvidence = readOptionalJson<CareVaultHwpSmokeReportEvidence>(
  "CAREVAULT_HWP_SMOKE_REPORT_PATH",
  "HWP smoke report",
);
const externalReviewEvidence = readOptionalJson<CareVaultExternalReviewEvidence>(
  "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH",
  "external review report",
);
const clinicalSourceUrlSmokeReport = readRequiredJson<ClinicalSourceUrlSmokeReport>(
  "CAREVAULT_CLINICAL_SOURCE_REPORT_PATH",
  "clinical source URL smoke report",
);
validateClinicalSourceUrlSmokeReport(clinicalSourceUrlSmokeReport);

mkdirSync(outputDir, { recursive: true });

const clinicalReviewPacket = buildClinicalReviewPacket();
const clinicalWorkflowReviewPacket = buildClinicalWorkflowReviewPacket();
const objectiveReadinessReport = buildCareVaultObjectiveReadinessReport({
  clinicalReviewPacket,
  externalReviewEvidence,
  hwpSmokeReportEvidence,
  workflowReviewPacket: clinicalWorkflowReviewPacket,
});
const objectiveReadinessExport = buildCareVaultObjectiveReadinessExport(
  objectiveReadinessReport,
);

const workflowReviewExport = objectiveReadinessExport.workflowReviewPacket;
const clinicalReviewExport = objectiveReadinessExport.clinicalReviewPacket;

const artifacts: WrittenArtifact[] = [];
artifacts.push(
  writeArtifact(
    outputDir,
    "clinical-review-packet.md",
    formatClinicalReviewPacketMarkdown(clinicalReviewPacket),
  ),
);
artifacts.push(
  writeArtifact(outputDir, "clinical-review-packet.json", stableJson(clinicalReviewExport)),
);
artifacts.push(
  writeArtifact(
    outputDir,
    "clinical-workflow-review-packet.md",
    formatClinicalWorkflowReviewPacketMarkdown(clinicalWorkflowReviewPacket),
  ),
);
artifacts.push(
  writeArtifact(
    outputDir,
    "clinical-workflow-review-packet.json",
    stableJson(workflowReviewExport),
  ),
);
artifacts.push(
  writeArtifact(
    outputDir,
    "clinical-source-url-smoke-report.json",
    stableJson(clinicalSourceUrlSmokeReport),
  ),
);
artifacts.push(
  writeArtifact(
    outputDir,
    "objective-readiness-report.md",
    formatCareVaultObjectiveReadinessMarkdown(objectiveReadinessReport),
  ),
);
artifacts.push(
  writeArtifact(
    outputDir,
    "objective-readiness-report.json",
    stableJson(objectiveReadinessExport),
  ),
);
artifacts.push(
  writeArtifact(
    outputDir,
    "carevault-external-review-report-template.json",
    stableJson(externalReviewTemplate),
  ),
);
artifacts.push(
  writeArtifact(
    outputDir,
    "reviewer-handoff.md",
    formatReviewerHandoff(artifacts, clinicalWorkflowReviewPacket.requirements),
  ),
);

console.error(`External review packet exported with ${artifacts.length} files.`);
