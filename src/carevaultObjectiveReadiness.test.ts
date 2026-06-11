import { describe, expect, it } from "vitest";
import {
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
  type CareVaultExternalReviewEvidence,
  type CareVaultHwpSmokeReportEvidence,
} from "./carevaultObjectiveReadiness";

const validHwpSmokeReportEvidence: CareVaultHwpSmokeReportEvidence = {
  expected_terms_provided: true,
  minimum_parsed_chars: "200",
  sample_count: 2,
  samples: [
    { basename: "oncology-followup.hwpx", extension: "hwpx", status: "passed" },
    { basename: "blood-pressure-labs.hwp", extension: "hwp", status: "passed" },
  ],
  schema: "carevault-hwp-smoke-report.v1",
  status: "passed",
};

const validExternalReviewEvidence: CareVaultExternalReviewEvidence = {
  attestations: {
    cervical_hypertension_diabetes_scope_reviewed: true,
    non_diagnosis_boundary_reviewed: true,
    real_workflow_reviewed: true,
    source_registry_reviewed: true,
  },
  critical_findings_open: 0,
  major_findings_open: 0,
  required_check_ids: ["clinician-source-review", "real-workflow-review"],
  reviewed_at: "2026-06-11",
  reviewer_role: "external clinical reviewer",
  schema: "carevault-external-clinician-review.v1",
  source_registry_error_count: 0,
  source_registry_warning_count: 0,
  status: "passed",
  unresolved_required_check_ids: [],
};

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

  it("accepts sanitized private HWP smoke report evidence without marking clinical review complete", () => {
    const report = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: validHwpSmokeReportEvidence,
    });
    const markdown = formatCareVaultObjectiveReadinessMarkdown(report);
    const requirementsById = Object.fromEntries(
      report.requirements.map((requirement) => [requirement.id, requirement]),
    );

    expect(report.status).toBe("ready-for-external-review");
    expect(report.blockingRequirementIds).toEqual(["external-clinician-source-review"]);
    expect(requirementsById["real-private-hwp-hwpx-sample"]).toMatchObject({
      status: "pass",
    });
    expect(requirementsById["external-clinician-source-review"]).toMatchObject({
      status: "required",
    });
    expect(markdown).toContain("Sanitized real private HWP/HWPX smoke evidence accepted");
    expect(markdown).toContain("oncology-followup.hwpx");
    expect(requirementsById["real-private-hwp-hwpx-sample"]?.detail).not.toContain(
      "/Users/wj",
    );
    expect(markdown).not.toContain("Status: pass");
  });

  it("keeps HWP smoke evidence blocked when the report leaks paths or mismatches samples", () => {
    const pathLeakingReport = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        samples: [
          {
            basename: "/Users/wj/private/oncology-followup.hwpx",
            extension: "hwpx",
            status: "passed",
          },
          { basename: "blood-pressure-labs.hwp", extension: "hwp", status: "passed" },
        ],
      },
    });
    const mismatchedCountReport = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        sample_count: 3,
      },
    });

    expect(pathLeakingReport.status).toBe("blocked");
    expect(pathLeakingReport.blockingRequirementIds).toContain("real-private-hwp-hwpx-sample");
    expect(mismatchedCountReport.status).toBe("blocked");
    expect(mismatchedCountReport.blockingRequirementIds).toContain(
      "real-private-hwp-hwpx-sample",
    );
  });

  it("accepts external clinician/source review evidence without hiding the private HWP blocker", () => {
    const report = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: validExternalReviewEvidence,
    });
    const requirementsById = Object.fromEntries(
      report.requirements.map((requirement) => [requirement.id, requirement]),
    );

    expect(report.status).toBe("blocked");
    expect(report.blockingRequirementIds).toEqual(["real-private-hwp-hwpx-sample"]);
    expect(requirementsById["external-clinician-source-review"]).toMatchObject({
      status: "pass",
    });
    expect(requirementsById["external-clinician-source-review"]?.detail).toContain(
      "zero open critical or major findings",
    );
  });

  it("can mark the command-only readiness report pass when both external and private-sample evidence pass", () => {
    const report = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: validExternalReviewEvidence,
      hwpSmokeReportEvidence: validHwpSmokeReportEvidence,
    });
    const markdown = formatCareVaultObjectiveReadinessMarkdown(report);

    expect(report.status).toBe("pass");
    expect(report.blockingRequirementIds).toEqual([]);
    expect(markdown).toContain("Status: pass");
    expect(markdown).toContain("No blocking requirements remain");
  });

  it("keeps external review required when evidence is incomplete or has open major findings", () => {
    const missingWorkflowReview = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: {
        ...validExternalReviewEvidence,
        required_check_ids: ["clinician-source-review"],
      },
    });
    const openMajorFinding = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: {
        ...validExternalReviewEvidence,
        major_findings_open: 1,
      },
    });

    expect(missingWorkflowReview.status).toBe("blocked");
    expect(missingWorkflowReview.blockingRequirementIds).toContain(
      "external-clinician-source-review",
    );
    expect(openMajorFinding.status).toBe("blocked");
    expect(openMajorFinding.blockingRequirementIds).toContain(
      "external-clinician-source-review",
    );
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
