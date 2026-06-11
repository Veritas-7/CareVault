import { readFileSync, writeFileSync } from "node:fs";
import {
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
  type CareVaultExternalReviewEvidence,
  type CareVaultHwpSmokeReportEvidence,
} from "../src/carevaultObjectiveReadiness";

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

const hwpSmokeReportEvidence = readOptionalJson<CareVaultHwpSmokeReportEvidence>(
  "CAREVAULT_HWP_SMOKE_REPORT_PATH",
  "HWP smoke report",
);
const externalReviewEvidence = readOptionalJson<CareVaultExternalReviewEvidence>(
  "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH",
  "external review report",
);

const report = buildCareVaultObjectiveReadinessReport({
  externalReviewEvidence,
  hwpSmokeReportEvidence,
});
const markdown = formatCareVaultObjectiveReadinessMarkdown(report);
const markdownOutputPath = process.env.CAREVAULT_OBJECTIVE_READINESS_REPORT_PATH;
const jsonOutputPath = process.env.CAREVAULT_OBJECTIVE_READINESS_JSON_PATH;

if (markdownOutputPath) {
  writeFileSync(markdownOutputPath, `${markdown}\n`);
} else {
  process.stdout.write(`${markdown}\n`);
}

if (jsonOutputPath) {
  writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (markdownOutputPath || jsonOutputPath) {
  console.error("Objective readiness export completed.");
}
