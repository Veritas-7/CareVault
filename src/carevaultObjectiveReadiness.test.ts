import { describe, expect, it } from "vitest";
import {
  buildCareVaultObjectiveReadinessExport,
  buildCareVaultObjectiveReadinessReport,
  formatCareVaultObjectiveReadinessMarkdown,
  type CareVaultExternalReviewEvidence,
  type CareVaultHwpSmokeReportEvidence,
} from "./carevaultObjectiveReadiness";

const validHwpSmokeReportEvidence: CareVaultHwpSmokeReportEvidence = {
  expected_term_count: 3,
  expected_terms_provided: true,
  minimum_parsed_chars: "200",
  objective_term_groups: {
    cervical_cancer: true,
    diabetes: true,
    hypertension: true,
  },
  sample_count: 2,
  samples: [
    {
      basename: "oncology-followup.hwpx",
      extension: "hwpx",
      parsed_character_count: 420,
      status: "passed",
    },
    {
      basename: "blood-pressure-labs.hwp",
      extension: "hwp",
      parsed_character_count: 386,
      status: "passed",
    },
  ],
  schema: "carevault-hwp-smoke-report.v3",
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
  reviewed_artifacts: [
    { id: "clinical-review-packet", status: "reviewed" },
    { id: "clinical-workflow-review-packet", status: "reviewed" },
    { id: "objective-readiness-report", status: "reviewed" },
  ],
  reviewer_role: "external clinical reviewer",
  schema: "carevault-external-clinician-review.v2",
  source_registry_error_count: 0,
  source_registry_total_count: 84,
  source_registry_warning_count: 0,
  status: "passed",
  unresolved_required_check_ids: [],
  workflow_surface_count: 6,
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
    expect(markdown).toContain("cervical-cancer, hypertension, and diabetes");
    expect(markdown).toContain("minimum observed parsed_character_count");
    expect(markdown).toContain("oncology-followup.hwpx");
    expect(requirementsById["real-private-hwp-hwpx-sample"]?.detail).not.toContain(
      "/Users/wj",
    );
    expect(markdown).not.toContain("Status: pass");
  });

  it("keeps HWP smoke evidence blocked when expected-term checks were not provided", () => {
    const report = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        expected_terms_provided: false,
      },
    });
    const requirement = report.requirements.find(
      ({ id }) => id === "real-private-hwp-hwpx-sample",
    );

    expect(report.status).toBe("blocked");
    expect(report.blockingRequirementIds).toContain("real-private-hwp-hwpx-sample");
    expect(requirement).toMatchObject({
      status: "blocked",
    });
    expect(requirement?.detail).toContain("expected-term checks");
  });

  it("keeps HWP smoke evidence blocked when expected-term coverage misses an objective group", () => {
    const report = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        objective_term_groups: {
          ...validHwpSmokeReportEvidence.objective_term_groups,
          diabetes: false,
        },
      },
    });
    const requirement = report.requirements.find(
      ({ id }) => id === "real-private-hwp-hwpx-sample",
    );

    expect(report.status).toBe("blocked");
    expect(report.blockingRequirementIds).toContain("real-private-hwp-hwpx-sample");
    expect(requirement?.detail).toContain("missing diabetes");
  });

  it("keeps HWP smoke evidence blocked when expected-term count is too small", () => {
    const report = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        expected_term_count: 2,
      },
    });
    const requirement = report.requirements.find(
      ({ id }) => id === "real-private-hwp-hwpx-sample",
    );

    expect(report.status).toBe("blocked");
    expect(report.blockingRequirementIds).toContain("real-private-hwp-hwpx-sample");
    expect(requirement?.detail).toContain("expected_term_count must be at least 3");
  });

  it("keeps HWP smoke evidence blocked when the report leaks paths or mismatches samples", () => {
    const pathLeakingReport = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        samples: [
          {
            basename: "/Users/wj/private/oncology-followup.hwpx",
            extension: "hwpx",
            parsed_character_count: 420,
            status: "passed",
          },
          {
            basename: "blood-pressure-labs.hwp",
            extension: "hwp",
            parsed_character_count: 386,
            status: "passed",
          },
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

  it("keeps HWP smoke evidence blocked when parsed character counts are missing or below the threshold", () => {
    const missingParsedCharacterCountReport = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        samples: [
          {
            basename: "oncology-followup.hwpx",
            extension: "hwpx",
            status: "passed",
          } as never,
        ],
        sample_count: 1,
      },
    });
    const belowMinimumParsedCharacterCountReport = buildCareVaultObjectiveReadinessReport({
      hwpSmokeReportEvidence: {
        ...validHwpSmokeReportEvidence,
        samples: [
          {
            basename: "oncology-followup.hwpx",
            extension: "hwpx",
            parsed_character_count: 199,
            status: "passed",
          },
        ],
        sample_count: 1,
      },
    });

    expect(missingParsedCharacterCountReport.status).toBe("blocked");
    expect(missingParsedCharacterCountReport.blockingRequirementIds).toContain(
      "real-private-hwp-hwpx-sample",
    );
    expect(belowMinimumParsedCharacterCountReport.status).toBe("blocked");
    expect(belowMinimumParsedCharacterCountReport.blockingRequirementIds).toContain(
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

  it("keeps external review required when reviewed artifacts or counts are stale", () => {
    const missingArtifact = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: {
        ...validExternalReviewEvidence,
        reviewed_artifacts: [
          { id: "clinical-review-packet", status: "reviewed" },
          { id: "clinical-workflow-review-packet", status: "reviewed" },
        ],
      },
    });
    const staleCount = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: {
        ...validExternalReviewEvidence,
        workflow_surface_count: 5,
      },
    });

    expect(missingArtifact.status).toBe("blocked");
    expect(missingArtifact.blockingRequirementIds).toContain(
      "external-clinician-source-review",
    );
    expect(staleCount.status).toBe("blocked");
    expect(staleCount.blockingRequirementIds).toContain(
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

  it("exports path-safe JSON summary without raw workflow state", () => {
    const exported = buildCareVaultObjectiveReadinessExport();
    const json = JSON.stringify(exported);

    expect(exported.workflowReviewPacket.surfaces).toHaveLength(6);
    expect(Object.prototype.hasOwnProperty.call(exported.workflowReviewPacket, "state")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(exported.workflowReviewPacket, "documentRagContext"))
      .toBe(false);
    expect(json).not.toContain("/Users/");
    expect(json).not.toContain("attachmentPath");
    expect(json).not.toContain("private-carevault");
  });
});
