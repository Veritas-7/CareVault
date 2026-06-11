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

export const careVaultObjectiveText =
  "CareVault must be a reliable local-first care app for cervical-cancer patients who also need hypertension and diabetes tracking, with durable document storage, HWP/HWPX parsing, search/RAG use of parsed documents, internal/rhwp evidence, and app surfaces that can use stored documents without making diagnosis, prescription, or treatment claims.";

export const careVaultObjectiveReadinessBoundary =
  "This readiness report is a command-only completion audit input. It is not a clinical approval, not a production medical readiness claim, and not permission to mark the active goal complete while blocked requirements remain.";

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
  workflowReviewPacket = buildClinicalWorkflowReviewPacket(),
}: {
  clinicalReviewPacket?: ClinicalReviewPacket;
  workflowReviewPacket?: ClinicalWorkflowReviewPacket;
} = {}): CareVaultObjectiveReadinessReport {
  const sourceRegistryClean =
    clinicalReviewPacket.summary.registryErrorCount === 0
    && clinicalReviewPacket.summary.registryWarningCount === 0
    && clinicalReviewPacket.keySourceHighlights.every((source) => source.status === "present");
  const workflowComorbidPass = hasRequirement(
    workflowReviewPacket,
    "comorbid-profile-coverage",
  );
  const parsedDocumentRagPass = hasRequirement(workflowReviewPacket, "parsed-document-rag");
  const documentCareQueuePass = hasRequirement(workflowReviewPacket, "document-care-queue");
  const surfaceSafetyPass =
    hasRequirement(workflowReviewPacket, "surface-safety") && allWorkflowSurfacesPass(workflowReviewPacket);
  const sourceGroundedRagPass =
    workflowReviewPacket.documentRagContext.answerDraft.level === "source-grounded"
    && workflowReviewPacket.documentRagContext.items.some((item) => item.evidenceChunks.length > 0);

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
      objectiveText: "/Users/wj/Downloads/working.md/CareVault.txt read and continue the live CareVault work",
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
        "scripts/smoke_hwp_sample.sh",
        "CAREVAULT_HWP_SAMPLE_PATH",
        "CAREVAULT_HWP_SAMPLE_DIR",
        "CAREVAULT_HWP_SMOKE_REPORT_PATH",
      ],
      detail:
        "The private-sample harness is ready, but no real user/private medical HWP/HWPX/HWPML sample path has been supplied or executed.",
      id: "real-private-hwp-hwpx-sample",
      objectiveText: "prove document parsing on real user/private medical HWP/HWPX documents",
      status: "blocked",
    }),
    buildRequirement({
      artifacts: [
        "src/documentRagContext.ts",
        "src/documentRagReadiness.ts",
        "src/documentRagModelRequest.ts",
        "src/documentRagEmbeddingRequest.ts",
        "src/clinicalWorkflowReview.ts",
        "npm run rag:readiness:smoke",
        "npm run rag:ollama:doctor",
        "npm run rag:ollama:smoke",
      ],
      detail:
        "Parsed document evidence ranks into source-grounded deterministic RAG context, answer drafts, and optional localhost-only model/embedding gates.",
      id: "document-search-rag",
      objectiveText: "stored documents should be searchable and usable by RAG",
      status: parsedDocumentRagPass && sourceGroundedRagPass ? "pass" : "blocked",
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
      status: documentCareQueuePass && surfaceSafetyPass ? "pass" : "blocked",
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
      ],
      detail:
        "Source and workflow review packets exist, but external clinician/source review on real workflows is still required before production medical readiness can be claimed.",
      id: "external-clinician-source-review",
      objectiveText: "perfect/accurate healthcare readiness",
      status: "required",
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
