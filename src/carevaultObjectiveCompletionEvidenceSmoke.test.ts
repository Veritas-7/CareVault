import { describe, expect, it } from "vitest";
import {
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
  type CareVaultExternalReviewEvidence,
  type CareVaultHwpSmokeReportEvidence,
} from "./carevaultObjectiveReadiness";

declare const process: {
  env: Record<string, string | undefined>;
};

const hwpSmokeReportJson = process.env.CAREVAULT_HWP_SMOKE_REPORT_JSON ?? "";
const externalReviewJson = process.env.CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON ?? "";
const requireCompletionEvidence =
  process.env.CAREVAULT_REQUIRE_COMPLETION_EVIDENCE === "1";
const describeWhenConfigured =
  requireCompletionEvidence || hwpSmokeReportJson || externalReviewJson
    ? describe
    : describe.skip;

function parseConfiguredJson<T>(value: string, label: string) {
  if (!value) {
    throw new Error(`${label} is required for this completion smoke.`);
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

describeWhenConfigured("carevaultObjectiveCompletionEvidenceSmoke", () => {
  it("passes only when private HWP and external review evidence both satisfy readiness", () => {
    const hwpSmokeReportEvidence = parseConfiguredJson<CareVaultHwpSmokeReportEvidence>(
      hwpSmokeReportJson,
      "CAREVAULT_HWP_SMOKE_REPORT_JSON",
    );
    const externalReviewEvidence = parseConfiguredJson<CareVaultExternalReviewEvidence>(
      externalReviewJson,
      "CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON",
    );
    const report = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence,
      hwpSmokeReportEvidence,
    });
    const markdown = formatCareVaultObjectiveReadinessMarkdown(report);

    expect(report.status).toBe("pass");
    expect(report.blockingRequirementIds).toEqual([]);
    expect(report.requirements.every((requirement) => requirement.status === "pass")).toBe(true);
    expect(markdown).toContain("Status: pass");
    expect(markdown).toContain("No blocking requirements remain");
    expect(markdown).not.toContain("/Users/wj/private");
    expect(markdown).not.toContain("\\Users\\");
  });
});
