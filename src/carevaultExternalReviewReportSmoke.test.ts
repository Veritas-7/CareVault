import { describe, expect, it } from "vitest";
import {
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
  type CareVaultExternalReviewEvidence,
} from "./carevaultObjectiveReadiness";

declare const process: {
  env: Record<string, string | undefined>;
};

const externalReviewJson = process.env.CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON ?? "";
const requireExternalReview = process.env.CAREVAULT_REQUIRE_EXTERNAL_REVIEW_REPORT === "1";
const describeWhenConfigured = requireExternalReview || externalReviewJson
  ? describe
  : describe.skip;

function loadConfiguredExternalReviewEvidence() {
  if (!externalReviewJson) {
    throw new Error("CAREVAULT_EXTERNAL_REVIEW_REPORT_JSON is required for this smoke.");
  }

  try {
    return JSON.parse(externalReviewJson) as CareVaultExternalReviewEvidence;
  } catch {
    throw new Error("Configured external review report must be valid JSON.");
  }
}

describeWhenConfigured("carevaultExternalReviewReportSmoke", () => {
  it("accepts configured external review report while preserving private HWP blocker", () => {
    const externalReviewEvidence = loadConfiguredExternalReviewEvidence();
    const report = buildCareVaultObjectiveReadinessReport({ externalReviewEvidence });
    const markdown = formatCareVaultObjectiveReadinessMarkdown(report);
    const externalReviewRequirement = report.requirements.find(
      (requirement) => requirement.id === "external-clinician-source-review",
    );

    if (externalReviewRequirement?.status !== "pass") {
      throw new Error(
        externalReviewRequirement?.detail
        ?? "External clinician/source review report was not accepted.",
      );
    }
    expect(externalReviewRequirement?.status).toBe("pass");
    expect(report.status).toBe("blocked");
    expect(report.blockingRequirementIds).toEqual(["real-private-hwp-hwpx-sample"]);
    expect(markdown).toContain("real-private-hwp-hwpx-sample");
    expect(markdown).toContain("Do not mark the active goal complete");
    expect(markdown).not.toContain("Status: pass");
    expect(externalReviewRequirement?.detail).not.toContain("/Users/wj");
    expect(externalReviewRequirement?.detail).not.toContain("\\");
  });
});
