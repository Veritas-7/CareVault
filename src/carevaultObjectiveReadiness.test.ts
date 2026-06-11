import { describe, expect, it } from "vitest";
import {
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
} from "./carevaultObjectiveReadiness";

describe("carevaultObjectiveReadiness", () => {
  it("maps every explicit objective theme to concrete artifacts", () => {
    const report = buildCareVaultObjectiveReadinessReport();
    const requirementIds = report.requirements.map((requirement) => requirement.id);

    expect(new Set(requirementIds).size).toBe(requirementIds.length);
    expect(requirementIds).toEqual([
      "live-carevault-target",
      "autoresearch-discipline",
      "clinical-source-coverage",
      "document-storage-lifecycle",
      "hwp-hwpx-parser-evidence",
      "real-private-hwp-hwpx-sample",
      "document-search-rag",
      "app-uses-parsed-documents",
      "medical-safety-boundary",
      "external-clinician-source-review",
    ]);
    expect(report.requirements.every((requirement) => requirement.artifacts.length > 0)).toBe(true);
    expect(report.requirements.every((requirement) => requirement.detail.length > 20)).toBe(true);
  });

  it("keeps the objective blocked until private sample and clinician review evidence exist", () => {
    const report = buildCareVaultObjectiveReadinessReport();
    const requirementsById = Object.fromEntries(
      report.requirements.map((requirement) => [requirement.id, requirement]),
    );

    expect(report.status).toBe("blocked");
    expect(report.blockingRequirementIds).toEqual([
      "real-private-hwp-hwpx-sample",
      "external-clinician-source-review",
    ]);
    expect(requirementsById["real-private-hwp-hwpx-sample"]).toMatchObject({
      status: "blocked",
    });
    expect(requirementsById["external-clinician-source-review"]).toMatchObject({
      status: "required",
    });
    expect(requirementsById["document-search-rag"]).toMatchObject({ status: "pass" });
    expect(requirementsById["app-uses-parsed-documents"]).toMatchObject({ status: "pass" });
  });

  it("formats a completion audit packet that cannot be mistaken for completion", () => {
    const markdown = formatCareVaultObjectiveReadinessMarkdown();

    expect(markdown).toContain("Status: blocked");
    expect(markdown).toContain("Prompt-To-Artifact Checklist");
    expect(markdown).toContain("real-private-hwp-hwpx-sample");
    expect(markdown).toContain("external-clinician-source-review");
    expect(markdown).toContain("Do not mark the active goal complete");
    expect(markdown).not.toContain("Status: pass");
    expect(markdown).not.toContain("No blocking requirements remain");
  });
});
