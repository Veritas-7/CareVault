import { describe, expect, it } from "vitest";
import externalReviewTemplateJson from "../docs/review-templates/carevault-external-review-report-template.json";
import {
  buildCareVaultObjectiveReadinessReport,
  type CareVaultExternalReviewEvidence,
} from "./carevaultObjectiveReadiness";
import { buildClinicalReviewPacket } from "./clinicalReviewPacket";

const externalReviewTemplate =
  externalReviewTemplateJson as CareVaultExternalReviewEvidence;

const requiredExternalReviewCheckIds = [
  "clinician-source-review",
  "real-workflow-review",
];

describe("carevaultExternalReviewTemplate", () => {
  it("keeps the checked-in external review template aligned with the current packet", () => {
    const clinicalReviewPacket = buildClinicalReviewPacket();
    const serializedTemplate = JSON.stringify(externalReviewTemplate);

    expect(externalReviewTemplate.schema).toBe("carevault-external-clinician-review.v1");
    expect(externalReviewTemplate.status).toBe("draft");
    expect(externalReviewTemplate.reviewed_at).toBe("YYYY-MM-DD");
    expect(externalReviewTemplate.reviewer_role).toBe(
      "REPLACE_WITH_EXTERNAL_CLINICAL_REVIEWER_ROLE",
    );
    expect(externalReviewTemplate.required_check_ids).toEqual(
      requiredExternalReviewCheckIds,
    );
    expect(externalReviewTemplate.unresolved_required_check_ids).toEqual(
      requiredExternalReviewCheckIds,
    );
    expect(externalReviewTemplate.attestations).toEqual({
      cervical_hypertension_diabetes_scope_reviewed: false,
      non_diagnosis_boundary_reviewed: false,
      real_workflow_reviewed: false,
      source_registry_reviewed: false,
    });
    expect(externalReviewTemplate.critical_findings_open).toBe(0);
    expect(externalReviewTemplate.major_findings_open).toBe(0);
    expect(externalReviewTemplate.source_registry_error_count).toBe(
      clinicalReviewPacket.summary.registryErrorCount,
    );
    expect(externalReviewTemplate.source_registry_warning_count).toBe(
      clinicalReviewPacket.summary.registryWarningCount,
    );
    expect(serializedTemplate).not.toContain("/Users/wj");
    expect(serializedTemplate).not.toContain("\\");
  });

  it("fails closed as a draft and only passes after a reviewer fills every gate", () => {
    const draftReport = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: externalReviewTemplate,
    });
    const draftRequirement = draftReport.requirements.find(
      (requirement) => requirement.id === "external-clinician-source-review",
    );

    expect(draftRequirement?.status).toBe("required");
    expect(draftReport.blockingRequirementIds).toContain(
      "external-clinician-source-review",
    );
    expect(draftReport.status).toBe("blocked");

    const filledReport: CareVaultExternalReviewEvidence = {
      ...externalReviewTemplate,
      attestations: {
        cervical_hypertension_diabetes_scope_reviewed: true,
        non_diagnosis_boundary_reviewed: true,
        real_workflow_reviewed: true,
        source_registry_reviewed: true,
      },
      reviewed_at: "2026-06-11",
      reviewer_role: "external clinical reviewer",
      status: "passed",
      unresolved_required_check_ids: [],
    };
    const acceptedReport = buildCareVaultObjectiveReadinessReport({
      externalReviewEvidence: filledReport,
    });
    const acceptedRequirement = acceptedReport.requirements.find(
      (requirement) => requirement.id === "external-clinician-source-review",
    );

    expect(acceptedRequirement?.status).toBe("pass");
    expect(acceptedReport.blockingRequirementIds).toEqual([
      "real-private-hwp-hwpx-sample",
    ]);
    expect(acceptedReport.status).toBe("blocked");
  });
});
