import {
  buildClinicalReviewPacket,
  type ClinicalReviewPacket,
} from "./clinicalReviewPacket";
import {
  buildClinicalWorkflowReviewPacket,
  type ClinicalWorkflowReviewPacket,
} from "./clinicalWorkflowReview";

export type CareVaultObjectiveRequirementStatus = "blocked" | "pass" | "required";

export type CareVaultObjectiveRequirement = {
  artifacts: string[];
  detail: string;
  id: string;
  objectiveText: string;
  status: CareVaultObjectiveRequirementStatus;
};

export type CareVaultHwpSmokeReportSample = {
  basename: string;
  extension: string;
  parsed_character_count: number;
  status: string;
};

export type CareVaultHwpSmokeObjectiveTermGroups = {
  cervical_cancer: boolean;
  diabetes: boolean;
  hypertension: boolean;
};

export type CareVaultHwpSmokeReportEvidence = {
  expected_term_count: number;
  expected_terms_provided: boolean;
  minimum_parsed_chars: string;
  objective_term_groups: CareVaultHwpSmokeObjectiveTermGroups;
  sample_count: number;
  samples: CareVaultHwpSmokeReportSample[];
  schema: string;
  status: string;
};

export type CareVaultHwpSmokeEvidenceAssessment = {
  detail: string;
  sampleBasenames: string[];
  sampleCount: number;
  status: Extract<CareVaultObjectiveRequirementStatus, "blocked" | "pass">;
};

export type CareVaultExternalReviewAttestations = {
  cervical_hypertension_diabetes_scope_reviewed: boolean;
  non_diagnosis_boundary_reviewed: boolean;
  real_workflow_reviewed: boolean;
  source_registry_reviewed: boolean;
  source_url_reachability_reviewed: boolean;
};

export type CareVaultExternalReviewArtifact = {
  bytes: number;
  id: string;
  sha256: string;
  status: string;
};

export type CareVaultExternalReviewEvidence = {
  attestations: CareVaultExternalReviewAttestations;
  critical_findings_open: number;
  major_findings_open: number;
  required_check_ids: string[];
  reviewed_at: string;
  reviewed_artifacts: CareVaultExternalReviewArtifact[];
  reviewer_role: string;
  schema: string;
  source_registry_error_count: number;
  source_registry_total_count: number;
  source_registry_warning_count: number;
  status: string;
  unresolved_required_check_ids: string[];
  workflow_surface_count: number;
};

export type CareVaultExternalReviewEvidenceAssessment = {
  detail: string;
  reviewedCheckIds: string[];
  status: Extract<CareVaultObjectiveRequirementStatus, "pass" | "required">;
};

export type CareVaultObjectiveReadinessReport = {
  blockingRequirementIds: string[];
  clinicalReviewPacket: ClinicalReviewPacket;
  explicitObjective: string;
  generatedBy: string;
  requirements: CareVaultObjectiveRequirement[];
  status: "blocked" | "pass" | "ready-for-external-review";
  title: string;
  useBoundary: string;
  workflowReviewPacket: ClinicalWorkflowReviewPacket;
};

export type CareVaultObjectiveReadinessExport = {
  blockingRequirementIds: string[];
  clinicalReviewPacket: Pick<
    ClinicalReviewPacket,
    | "domainSummaries"
    | "generatedBy"
    | "keySourceHighlights"
    | "purpose"
    | "remainingBlockers"
    | "requiredChecks"
    | "summary"
    | "title"
    | "useBoundary"
  > & {
    registryErrors: ClinicalReviewPacket["registryAudit"]["errors"];
    registryWarnings: ClinicalReviewPacket["registryAudit"]["warnings"];
  };
  explicitObjective: string;
  generatedBy: string;
  requirements: CareVaultObjectiveRequirement[];
  status: CareVaultObjectiveReadinessReport["status"];
  title: string;
  useBoundary: string;
  workflowReviewPacket: Pick<
    ClinicalWorkflowReviewPacket,
    | "exportedAt"
    | "query"
    | "requirements"
    | "status"
    | "surfaces"
    | "title"
    | "useBoundary"
  > & {
    answerDraftSummary: string;
    careActionCount: number;
    documentRagProvenance: CareVaultDocumentRagProvenanceSummary;
    documentRagSummary: string;
  };
};

export type CareVaultDocumentRagProvenanceSummary = {
  answerDraftCitationCount: number;
  citationSourceLabelCount: number;
  evidenceChunkCount: number;
  parsedDocumentCount: number;
  parserSourceCount: number;
};

export const careVaultObjectiveText =
  "CareVault must be a reliable local-first care app for cervical-cancer patients who also need hypertension and diabetes tracking, with durable document storage, HWP/HWPX parsing, search/RAG use of parsed documents, internal/rhwp evidence, and app surfaces that can use stored documents without making diagnosis, prescription, or treatment claims.";

export const careVaultObjectiveReadinessBoundary =
  "This readiness report is a command-only completion audit input. It is not a clinical approval, not a production medical readiness claim, and not permission to mark the active goal complete while blocked requirements remain.";

const hwpSmokeReportSchema = "carevault-hwp-smoke-report.v3";
const externalReviewReportSchema = "carevault-external-clinician-review.v4";
const supportedHwpSampleExtensions = new Set(["hwp", "hwpx", "hwpml"]);
const hwpObjectiveTermGroupLabels: Record<
  keyof CareVaultHwpSmokeObjectiveTermGroups,
  string
> = {
  cervical_cancer: "cervical-cancer",
  diabetes: "diabetes",
  hypertension: "hypertension",
};
const externalReviewRequiredCheckIds = [
  "clinician-source-review",
  "clinical-source-url-reachability",
  "real-workflow-review",
] as const;
const externalReviewRequiredArtifactIds = [
  "clinical-review-packet",
  "clinical-workflow-review-packet",
  "clinical-source-url-smoke-report",
  "objective-readiness-report",
] as const;

function basenameIsPathSafe(basename: string) {
  return (
    basename.length > 0
    && basename === basename.trim()
    && !basename.includes("/")
    && !basename.includes("\\")
    && !/^[A-Za-z]:/.test(basename)
  );
}

function parseMinimumParsedChars(value: string) {
  if (!/^\d+$/.test(value)) return Number.NaN;
  return Number(value);
}

function isNonNegativeInteger(value: number) {
  return Number.isInteger(value) && value >= 0;
}

function isPathSafeLabel(value: string) {
  return (
    value.length > 0
    && value === value.trim()
    && !value.includes("/")
    && !value.includes("\\")
  );
}

function isSha256Hex(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

function hasAllRequiredIds(ids: string[], requiredIds: readonly string[]) {
  return requiredIds.every((requiredId) => ids.includes(requiredId));
}

function missingHwpObjectiveTermGroups(
  groups: CareVaultHwpSmokeObjectiveTermGroups,
) {
  return Object.entries(hwpObjectiveTermGroupLabels)
    .filter(([group]) => !groups[group as keyof CareVaultHwpSmokeObjectiveTermGroups])
    .map(([, label]) => label);
}

export function assessCareVaultHwpSmokeReportEvidence(
  report?: CareVaultHwpSmokeReportEvidence,
): CareVaultHwpSmokeEvidenceAssessment {
  if (!report) {
    return {
      detail:
        "The private-sample harness is ready, but no sanitized real user/private HWP/HWPX/HWPML smoke report has been supplied.",
      sampleBasenames: [],
      sampleCount: 0,
      status: "blocked",
    };
  }

  if (report.schema !== hwpSmokeReportSchema) {
    return {
      detail: `Blocked: HWP smoke report schema must be ${hwpSmokeReportSchema}.`,
      sampleBasenames: [],
      sampleCount: 0,
      status: "blocked",
    };
  }
  if (report.status !== "passed") {
    return {
      detail: "Blocked: HWP smoke report status must be passed.",
      sampleBasenames: [],
      sampleCount: 0,
      status: "blocked",
    };
  }
  if (!Array.isArray(report.samples)) {
    return {
      detail: "Blocked: HWP smoke report samples must be an array.",
      sampleBasenames: [],
      sampleCount: 0,
      status: "blocked",
    };
  }
  if (!Number.isInteger(report.sample_count) || report.sample_count <= 0) {
    return {
      detail: "Blocked: HWP smoke report must include at least one parsed private sample.",
      sampleBasenames: [],
      sampleCount: 0,
      status: "blocked",
    };
  }
  if (typeof report.minimum_parsed_chars !== "string") {
    return {
      detail: "Blocked: HWP smoke report minimum_parsed_chars must be a string.",
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }
  if (typeof report.expected_terms_provided !== "boolean") {
    return {
      detail: "Blocked: HWP smoke report expected_terms_provided must be a boolean.",
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }
  if (!report.expected_terms_provided) {
    return {
      detail:
        "Blocked: HWP smoke report must include expected-term checks for the cervical-cancer, hypertension, and diabetes objective.",
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }
  if (!Number.isInteger(report.expected_term_count) || report.expected_term_count < 3) {
    return {
      detail:
        "Blocked: HWP smoke report expected_term_count must be at least 3 for the cervical-cancer, hypertension, and diabetes objective.",
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }
  if (
    typeof report.objective_term_groups !== "object"
    || report.objective_term_groups === null
    || typeof report.objective_term_groups.cervical_cancer !== "boolean"
    || typeof report.objective_term_groups.hypertension !== "boolean"
    || typeof report.objective_term_groups.diabetes !== "boolean"
  ) {
    return {
      detail:
        "Blocked: HWP smoke report objective_term_groups must include cervical_cancer, hypertension, and diabetes booleans.",
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }
  const missingGroups = missingHwpObjectiveTermGroups(report.objective_term_groups);
  if (missingGroups.length > 0) {
    return {
      detail:
        `Blocked: HWP smoke report expected-term coverage is missing ${missingGroups.join(", ")}.`,
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }
  if (report.samples.length !== report.sample_count) {
    return {
      detail: "Blocked: HWP smoke report sample_count must match the samples array.",
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }

  const minimumParsedChars = parseMinimumParsedChars(report.minimum_parsed_chars);
  if (!Number.isFinite(minimumParsedChars) || minimumParsedChars <= 0) {
    return {
      detail: "Blocked: HWP smoke report minimum_parsed_chars must be a positive integer string.",
      sampleBasenames: [],
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }

  const invalidSample = report.samples.find((sample) => {
    if (
      typeof sample.basename !== "string"
      || typeof sample.extension !== "string"
      || typeof sample.parsed_character_count !== "number"
      || typeof sample.status !== "string"
    ) {
      return true;
    }
    const extension = sample.extension.toLowerCase();
    return (
      sample.status !== "passed"
      || !Number.isInteger(sample.parsed_character_count)
      || sample.parsed_character_count < minimumParsedChars
      || !supportedHwpSampleExtensions.has(extension)
      || !basenameIsPathSafe(sample.basename)
    );
  });
  if (invalidSample) {
    return {
      detail:
        "Blocked: HWP smoke report samples must be passed .hwp/.hwpx/.hwpml basename-only entries with parsed_character_count at or above minimum_parsed_chars.",
      sampleBasenames: report.samples.map((sample) => sample.basename),
      sampleCount: report.sample_count,
      status: "blocked",
    };
  }

  const sampleBasenames = report.samples.map((sample) => sample.basename);
  const minimumObservedParsedChars = Math.min(
    ...report.samples.map((sample) => sample.parsed_character_count),
  );
  return {
    detail:
      `Sanitized real private HWP/HWPX smoke evidence accepted for ${report.sample_count} sample(s) with ${report.expected_term_count} expected terms covering cervical-cancer, hypertension, and diabetes; minimum observed parsed_character_count ${minimumObservedParsedChars} meets threshold ${minimumParsedChars}; report stores basename-only sample evidence: ${sampleBasenames.join(", ")}.`,
    sampleBasenames,
    sampleCount: report.sample_count,
    status: "pass",
  };
}

export function assessCareVaultExternalReviewEvidence(
  evidence: CareVaultExternalReviewEvidence | undefined,
  clinicalReviewPacket: ClinicalReviewPacket,
  workflowReviewPacket: ClinicalWorkflowReviewPacket,
): CareVaultExternalReviewEvidenceAssessment {
  if (!evidence) {
    return {
      detail:
        "Source and workflow review packets exist, but no external clinician/source review evidence report has been supplied.",
      reviewedCheckIds: [],
      status: "required",
    };
  }

  if (evidence.schema !== externalReviewReportSchema) {
    return {
      detail: `Required: external review report schema must be ${externalReviewReportSchema}.`,
      reviewedCheckIds: [],
      status: "required",
    };
  }
  if (evidence.status !== "passed") {
    return {
      detail: "Required: external review report status must be passed.",
      reviewedCheckIds: [],
      status: "required",
    };
  }
  if (
    typeof evidence.reviewer_role !== "string"
    || !isPathSafeLabel(evidence.reviewer_role)
  ) {
    return {
      detail: "Required: external review report must include a non-path reviewer_role.",
      reviewedCheckIds: [],
      status: "required",
    };
  }
  if (
    typeof evidence.reviewed_at !== "string"
    || !/^\d{4}-\d{2}-\d{2}/.test(evidence.reviewed_at)
  ) {
    return {
      detail: "Required: external review report reviewed_at must start with YYYY-MM-DD.",
      reviewedCheckIds: [],
      status: "required",
    };
  }
  if (
    !Array.isArray(evidence.required_check_ids)
    || !evidence.required_check_ids.every((id) => typeof id === "string")
    || !hasAllRequiredIds(evidence.required_check_ids, externalReviewRequiredCheckIds)
  ) {
    return {
      detail:
        "Required: external review report must cover clinician-source-review, clinical-source-url-reachability, and real-workflow-review.",
      reviewedCheckIds: Array.isArray(evidence.required_check_ids)
        ? evidence.required_check_ids.filter((id) => typeof id === "string")
        : [],
      status: "required",
    };
  }
  if (
    !Array.isArray(evidence.unresolved_required_check_ids)
    || !evidence.unresolved_required_check_ids.every((id) => typeof id === "string")
  ) {
    return {
      detail: "Required: external review report unresolved_required_check_ids must be an array.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }
  if (
    externalReviewRequiredCheckIds.some((id) => evidence.unresolved_required_check_ids.includes(id))
  ) {
    return {
      detail:
        "Required: external review report still lists clinician/source or real-workflow review as unresolved.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }

  const attestations = evidence.attestations;
  if (
    !attestations
    || attestations.source_registry_reviewed !== true
    || attestations.source_url_reachability_reviewed !== true
    || attestations.real_workflow_reviewed !== true
    || attestations.non_diagnosis_boundary_reviewed !== true
    || attestations.cervical_hypertension_diabetes_scope_reviewed !== true
  ) {
    return {
      detail:
        "Required: external review report must attest source registry, clinical source URL reachability, real workflow, non-diagnosis boundary, and cervical/hypertension/diabetes scope review.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }
  if (
    !isNonNegativeInteger(evidence.critical_findings_open)
    || !isNonNegativeInteger(evidence.major_findings_open)
    || evidence.critical_findings_open > 0
    || evidence.major_findings_open > 0
  ) {
    return {
      detail: "Required: external review report must have zero open critical or major findings.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }
  if (
    evidence.source_registry_error_count !== clinicalReviewPacket.summary.registryErrorCount
    || evidence.source_registry_total_count !== clinicalReviewPacket.summary.totalSources
    || evidence.source_registry_warning_count !== clinicalReviewPacket.summary.registryWarningCount
  ) {
    return {
      detail:
        "Required: external review report source registry counts must match the current clinical review packet.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }
  if (evidence.workflow_surface_count !== workflowReviewPacket.surfaces.length) {
    return {
      detail:
        "Required: external review report workflow_surface_count must match the current workflow review packet.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }
  if (
    !Array.isArray(evidence.reviewed_artifacts)
    || !evidence.reviewed_artifacts.every((artifact) =>
      artifact
      && typeof artifact.id === "string"
      && isPathSafeLabel(artifact.id)
      && typeof artifact.status === "string"
      && artifact.status === "reviewed"
      && typeof artifact.sha256 === "string"
      && isSha256Hex(artifact.sha256)
      && Number.isInteger(artifact.bytes)
      && artifact.bytes > 0
    )
  ) {
    return {
      detail:
        "Required: external review report reviewed_artifacts must include reviewed non-path artifact IDs with packet sha256 hashes and positive byte counts.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }
  const reviewedArtifactIds = evidence.reviewed_artifacts.map((artifact) => artifact.id);
  if (!hasAllRequiredIds(reviewedArtifactIds, externalReviewRequiredArtifactIds)) {
    return {
      detail:
        "Required: external review report must include reviewed artifacts for clinical-review-packet, clinical-workflow-review-packet, clinical-source-url-smoke-report, and objective-readiness-report.",
      reviewedCheckIds: evidence.required_check_ids,
      status: "required",
    };
  }

  return {
    detail:
      `External clinician/source review evidence accepted for ${evidence.required_check_ids.join(", ")} by ${evidence.reviewer_role} on ${evidence.reviewed_at}; reviewed ${reviewedArtifactIds.length} hashed artifacts with current source URL reachability, source/workflow counts, and zero open critical or major findings.`,
    reviewedCheckIds: evidence.required_check_ids,
    status: "pass",
  };
}

function hasRequirement(
  workflowPacket: ClinicalWorkflowReviewPacket,
  requirementId: string,
  status: CareVaultObjectiveRequirementStatus = "pass",
) {
  return workflowPacket.requirements.some(
    (requirement) => requirement.id === requirementId && requirement.status === status,
  );
}

function allWorkflowSurfacesPass(workflowPacket: ClinicalWorkflowReviewPacket) {
  return workflowPacket.surfaces.every((surface) => surface.status === "pass");
}

function buildDocumentRagProvenanceSummary(
  context: ClinicalWorkflowReviewPacket["documentRagContext"],
): CareVaultDocumentRagProvenanceSummary {
  const evidenceChunks = context.items.flatMap((item) => item.evidenceChunks);

  return {
    answerDraftCitationCount: context.answerDraft.citations.length,
    citationSourceLabelCount: context.answerDraft.citations.filter((citation) =>
      citation.includes("조각 원천"),
    ).length,
    evidenceChunkCount: evidenceChunks.length,
    parsedDocumentCount: context.items.filter((item) => item.parsedSourceCount > 0).length,
    parserSourceCount: evidenceChunks.filter((chunk) => chunk.sourceSummary.trim().length > 0).length,
  };
}

function hasDocumentRagProvenance(
  context: ClinicalWorkflowReviewPacket["documentRagContext"],
) {
  const provenance = buildDocumentRagProvenanceSummary(context);
  return (
    provenance.parsedDocumentCount > 0
    && provenance.evidenceChunkCount > 0
    && provenance.parserSourceCount === provenance.evidenceChunkCount
    && provenance.answerDraftCitationCount > 0
    && provenance.citationSourceLabelCount === provenance.answerDraftCitationCount
  );
}

function buildRequirement(
  requirement: CareVaultObjectiveRequirement,
): CareVaultObjectiveRequirement {
  return requirement;
}

function computeReportStatus(requirements: CareVaultObjectiveRequirement[]) {
  if (requirements.some((requirement) => requirement.status === "blocked")) return "blocked";
  if (requirements.some((requirement) => requirement.status === "required")) {
    return "ready-for-external-review";
  }
  return "pass";
}

export function buildCareVaultObjectiveReadinessReport({
  clinicalReviewPacket = buildClinicalReviewPacket(),
  externalReviewEvidence,
  hwpSmokeReportEvidence,
  workflowReviewPacket = buildClinicalWorkflowReviewPacket(),
}: {
  clinicalReviewPacket?: ClinicalReviewPacket;
  externalReviewEvidence?: CareVaultExternalReviewEvidence;
  hwpSmokeReportEvidence?: CareVaultHwpSmokeReportEvidence;
  workflowReviewPacket?: ClinicalWorkflowReviewPacket;
} = {}): CareVaultObjectiveReadinessReport {
  const hwpSmokeAssessment = assessCareVaultHwpSmokeReportEvidence(hwpSmokeReportEvidence);
  const externalReviewAssessment = assessCareVaultExternalReviewEvidence(
    externalReviewEvidence,
    clinicalReviewPacket,
    workflowReviewPacket,
  );
  const sourceRegistryClean =
    clinicalReviewPacket.summary.registryErrorCount === 0
    && clinicalReviewPacket.summary.registryWarningCount === 0
    && clinicalReviewPacket.keySourceHighlights.every((source) => source.status === "present");
  const workflowComorbidPass = hasRequirement(
    workflowReviewPacket,
    "comorbid-profile-coverage",
  );
  const parsedDocumentRagPass = hasRequirement(workflowReviewPacket, "parsed-document-rag");
  const parsedDocumentUserFacingSurfacesPass = hasRequirement(
    workflowReviewPacket,
    "parsed-document-user-facing-surfaces",
  );
  const documentCareQueuePass = hasRequirement(workflowReviewPacket, "document-care-queue");
  const surfaceSafetyPass =
    hasRequirement(workflowReviewPacket, "surface-safety") && allWorkflowSurfacesPass(workflowReviewPacket);
  const sourceGroundedRagPass =
    workflowReviewPacket.documentRagContext.answerDraft.level === "source-grounded"
    && workflowReviewPacket.documentRagContext.items.some((item) => item.evidenceChunks.length > 0);
  const documentRagProvenancePass = hasDocumentRagProvenance(
    workflowReviewPacket.documentRagContext,
  );

  const requirements = [
    buildRequirement({
      artifacts: [
        "working.md",
        "docs/completion-audits/carevault-objective-audit-2026-06-11.md",
        "Goal identity guard command",
      ],
      detail:
        "Current thread identity and live repository state must be checked before edits; the durable audit records that the stale Downloads handoff is not the source of truth.",
      id: "live-carevault-target",
      objectiveText: "downloaded CareVault handoff read and live CareVault work continued",
      status: "pass",
    }),
    buildRequirement({
      artifacts: [
        "working.md",
        "docs/parser-candidates/hwarang-unhwp-rust-ab-2026-06-11.md",
        "docs/completion-audits/carevault-objective-audit-2026-06-11.md",
      ],
      detail:
        "The repo now records incremental evidence-producing slices, fail-closed parser adoption, source labels, command gates, and completion blockers.",
      id: "autoresearch-discipline",
      objectiveText: "$autoresearch philosophy",
      status: "pass",
    }),
    buildRequirement({
      artifacts: [
        "src/clinicalSourceRegistry.ts",
        "src/clinicalReviewPacket.ts",
        "src/clinicalWorkflowReview.ts",
        "npm run clinical:sources:smoke",
        "npm run clinical:review:smoke",
        "npm run clinical:workflow:smoke",
      ],
      detail:
        "Official-source registry and workflow packets explicitly cover cervical cancer, hypertension, and diabetes and preserve source-owner summaries.",
      id: "clinical-source-coverage",
      objectiveText: "accurate care for cervical cancer plus hypertension and diabetes",
      status: sourceRegistryClean && workflowComorbidPass ? "pass" : "blocked",
    }),
    buildRequirement({
      artifacts: [
        "src/storage.ts",
        "src/backupState.ts",
        "src/documentFilterActions.ts",
        "npm run backup:rag:smoke",
        "npm run sqlite:search:smoke",
      ],
      detail:
        "Document lifecycle, backup/import, search mirror, local path stripping, and reattachment boundaries are mapped to app artifacts and command smokes.",
      id: "document-storage-lifecycle",
      objectiveText: "documents must be stored well",
      status: "pass",
    }),
    buildRequirement({
      artifacts: [
        "src-tauri/src/lib.rs",
        "src/documentHwpxText.ts",
        "src/documentAttachmentParsing.ts",
        "scripts/smoke_hwp_sample.sh",
        "npm run hwp:synthetic:smoke",
        "npm run hwp:smoke:test",
      ],
      detail:
        "Synthetic HWPX and command fixture coverage exist, but full readiness still needs a real user/private HWP/HWPX/HWPML medical sample.",
      id: "hwp-hwpx-parser-evidence",
      objectiveText: "use rhwp/HWP evidence so documents can be parsed",
      status: "pass",
    }),
    buildRequirement({
      artifacts: [
        "docs/review-templates/carevault-private-hwp-smoke-handoff.md",
        "scripts/smoke_hwp_sample.sh",
        "npm run hwp:smoke:handoff",
        "CAREVAULT_HWP_SAMPLE_PATH",
        "CAREVAULT_HWP_SAMPLE_DIR",
        "CAREVAULT_HWP_SMOKE_REPORT_PATH",
      ],
      detail: hwpSmokeAssessment.detail,
      id: "real-private-hwp-hwpx-sample",
      objectiveText: "prove document parsing on real user/private medical HWP/HWPX documents",
      status: hwpSmokeAssessment.status,
    }),
    buildRequirement({
      artifacts: [
        "src/documentRagContext.ts",
        "src/documentRagReadiness.ts",
        "src/documentRagModelRequest.ts",
        "src/documentRagEmbeddingRequest.ts",
        "src/documentRagEmbeddingRequest.test.ts",
        "src/clinicalWorkflowReview.ts",
        "npm run rag:readiness:smoke",
        "npm run rag:ollama:doctor",
        "npm run rag:ollama:smoke",
      ],
      detail:
        "Parsed document evidence ranks into source-grounded deterministic RAG context, answer drafts with parser/source citation labels, and optional localhost-only model/embedding gates with ranked provenance tests.",
      id: "document-search-rag",
      objectiveText: "stored documents should be searchable and usable by RAG",
      status: parsedDocumentRagPass && sourceGroundedRagPass && documentRagProvenancePass
        ? "pass"
        : "blocked",
    }),
    buildRequirement({
      artifacts: [
        "src/careActionQueue.ts",
        "src/visitPacket.ts",
        "src/csvExport.ts",
        "src/caregiverExport.ts",
        "src/clinicalWorkflowReview.ts",
        "npm run clinical:workflow:smoke",
      ],
      detail:
        "Parsed document clues flow into clinic-prep queue items, visit Markdown, CSV rows, and caregiver HTML without local path leakage or direct clinical instructions.",
      id: "app-uses-parsed-documents",
      objectiveText: "the app should parse and use document content",
      status: documentCareQueuePass && parsedDocumentUserFacingSurfacesPass && surfaceSafetyPass
        ? "pass"
        : "blocked",
    }),
    buildRequirement({
      artifacts: [
        "src/documentRagModelRequest.ts",
        "src/clinicalReviewPacket.ts",
        "src/clinicalWorkflowReview.ts",
        "npm run rag:safety:smoke",
        "npm run clinical:workflow:smoke",
      ],
      detail:
        "RAG/model responses and export surfaces keep diagnosis, prescription, treatment, and medication-change wording blocked or framed as care-team confirmation.",
      id: "medical-safety-boundary",
      objectiveText: "healthcare app must not overstep into diagnosis or treatment instructions",
      status: surfaceSafetyPass ? "pass" : "blocked",
    }),
    buildRequirement({
      artifacts: [
        "src/clinicalReviewPacket.ts",
        "src/clinicalWorkflowReview.ts",
        "docs/completion-audits/carevault-objective-audit-2026-06-11.md",
        "CAREVAULT_EXTERNAL_REVIEW_PACKET_DIR",
        "CAREVAULT_EXTERNAL_REVIEW_REPORT_PATH",
        "clinical-source-url-smoke-report.json",
        "npm run clinical:sources:smoke",
        "scripts/verify_external_review_packet_hashes.mjs",
      ],
      detail: externalReviewAssessment.detail,
      id: "external-clinician-source-review",
      objectiveText: "perfect/accurate healthcare readiness",
      status: externalReviewAssessment.status,
    }),
  ];
  const blockingRequirementIds = requirements
    .filter((requirement) => requirement.status !== "pass")
    .map((requirement) => requirement.id);

  return {
    blockingRequirementIds,
    clinicalReviewPacket,
    explicitObjective: careVaultObjectiveText,
    generatedBy: "CareVault objective readiness gate",
    requirements,
    status: computeReportStatus(requirements),
    title: "CareVault Objective Readiness Report",
    useBoundary: careVaultObjectiveReadinessBoundary,
    workflowReviewPacket,
  };
}

export function buildCareVaultObjectiveReadinessExport(
  report: CareVaultObjectiveReadinessReport = buildCareVaultObjectiveReadinessReport(),
): CareVaultObjectiveReadinessExport {
  return {
    blockingRequirementIds: report.blockingRequirementIds,
    clinicalReviewPacket: {
      domainSummaries: report.clinicalReviewPacket.domainSummaries,
      generatedBy: report.clinicalReviewPacket.generatedBy,
      keySourceHighlights: report.clinicalReviewPacket.keySourceHighlights,
      purpose: report.clinicalReviewPacket.purpose,
      registryErrors: report.clinicalReviewPacket.registryAudit.errors,
      registryWarnings: report.clinicalReviewPacket.registryAudit.warnings,
      remainingBlockers: report.clinicalReviewPacket.remainingBlockers,
      requiredChecks: report.clinicalReviewPacket.requiredChecks,
      summary: report.clinicalReviewPacket.summary,
      title: report.clinicalReviewPacket.title,
      useBoundary: report.clinicalReviewPacket.useBoundary,
    },
    explicitObjective: report.explicitObjective,
    generatedBy: report.generatedBy,
    requirements: report.requirements,
    status: report.status,
    title: report.title,
    useBoundary: report.useBoundary,
    workflowReviewPacket: {
      answerDraftSummary: report.workflowReviewPacket.documentRagContext.answerDraft.summary,
      careActionCount: report.workflowReviewPacket.careActions.length,
      documentRagProvenance: buildDocumentRagProvenanceSummary(
        report.workflowReviewPacket.documentRagContext,
      ),
      documentRagSummary: report.workflowReviewPacket.documentRagContext.summary,
      exportedAt: report.workflowReviewPacket.exportedAt,
      query: report.workflowReviewPacket.query,
      requirements: report.workflowReviewPacket.requirements,
      status: report.workflowReviewPacket.status,
      surfaces: report.workflowReviewPacket.surfaces,
      title: report.workflowReviewPacket.title,
      useBoundary: report.workflowReviewPacket.useBoundary,
    },
  };
}

export function formatCareVaultObjectiveReadinessMarkdown(
  report: CareVaultObjectiveReadinessReport = buildCareVaultObjectiveReadinessReport(),
) {
  return [
    `# ${report.title}`,
    "",
    `Generated by: ${report.generatedBy}`,
    `Status: ${report.status}`,
    "",
    "## Objective",
    report.explicitObjective,
    "",
    "## Use Boundary",
    report.useBoundary,
    "",
    "## Prompt-To-Artifact Checklist",
    ...report.requirements.map((requirement) => [
      `- ${requirement.status.toUpperCase()}: ${requirement.objectiveText}`,
      `  - id: ${requirement.id}`,
      `  - detail: ${requirement.detail}`,
      `  - artifacts: ${requirement.artifacts.join(", ")}`,
    ].join("\n")),
    "",
    "## Blocking Requirements",
    ...(report.blockingRequirementIds.length
      ? report.blockingRequirementIds.map((id) => `- ${id}`)
      : ["- none"]),
    "",
    "## Do Not Complete",
    report.blockingRequirementIds.length
      ? "Do not mark the active goal complete while these requirements remain blocked or required."
      : "No blocking requirements remain in this command-only report.",
  ].join("\n");
}
