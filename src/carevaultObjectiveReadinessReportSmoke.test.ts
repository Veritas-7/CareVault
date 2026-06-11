import { describe, expect, it } from "vitest";
import {
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
  type CareVaultHwpSmokeReportEvidence,
} from "./carevaultObjectiveReadiness";

declare const process: {
  env: Record<string, string | undefined>;
};

const smokeReportJson = process.env.CAREVAULT_HWP_SMOKE_REPORT_JSON ?? "";
const requireSmokeReport = process.env.CAREVAULT_REQUIRE_HWP_SMOKE_REPORT === "1";
const describeWhenConfigured = requireSmokeReport || smokeReportJson
  ? describe
  : describe.skip;

function loadConfiguredHwpSmokeReport() {
  if (!smokeReportJson) {
    throw new Error("CAREVAULT_HWP_SMOKE_REPORT_JSON is required for this smoke.");
  }

  try {
    return JSON.parse(smokeReportJson) as CareVaultHwpSmokeReportEvidence;
  } catch {
    throw new Error("Configured HWP smoke report must be valid JSON.");
  }
}

describeWhenConfigured("carevaultObjectiveReadinessReportSmoke", () => {
  it("accepts configured basename-only private HWP smoke report for real-private-hwp-hwpx-sample", () => {
    const hwpSmokeReportEvidence = loadConfiguredHwpSmokeReport();
    const report = buildCareVaultObjectiveReadinessReport({ hwpSmokeReportEvidence });
    const markdown = formatCareVaultObjectiveReadinessMarkdown(report);
    const hwpRequirement = report.requirements.find(
      (requirement) => requirement.id === "real-private-hwp-hwpx-sample",
    );

    if (hwpRequirement?.status !== "pass") {
      throw new Error(hwpRequirement?.detail ?? "HWP smoke report was not accepted.");
    }
    expect(hwpRequirement?.status).toBe("pass");
    expect(report.status).toBe("ready-for-external-review");
    expect(report.blockingRequirementIds).toEqual(["external-clinician-source-review"]);
    expect(markdown).toContain("Status: ready-for-external-review");
    expect(markdown).toContain("external-clinician-source-review");
    expect(markdown).not.toContain("Status: pass");
    expect(markdown).not.toContain("No blocking requirements remain");

    for (const sample of hwpSmokeReportEvidence.samples) {
      expect(hwpRequirement?.detail).toContain(sample.basename);
    }
    expect(hwpRequirement?.detail).not.toContain("/Users/wj");
    expect(hwpRequirement?.detail).not.toContain("\\");
  });
});
