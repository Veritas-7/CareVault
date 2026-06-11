import { describe, expect, it } from "vitest";
import {
  buildClinicalWorkflowReviewPacket,
  formatClinicalWorkflowReviewPacketMarkdown,
} from "./clinicalWorkflowReview";

describe("clinicalWorkflowReview", () => {
  it("builds a command-only workflow review packet across RAG, queue, and export surfaces", () => {
    const packet = buildClinicalWorkflowReviewPacket();

    expect(packet.status).toBe("needs-external-review");
    expect(packet.query).toContain("자궁경부암");
    expect(packet.query).toContain("혈압");
    expect(packet.query).toContain("HbA1c");
    expect(packet.documentRagContext.items.length).toBeGreaterThan(0);
    expect(packet.documentRagContext.items[0]?.parsedSourceCount).toBeGreaterThan(0);
    expect(packet.documentRagContext.items[0]?.evidenceChunks.length).toBeGreaterThan(0);
    expect(packet.documentRagContext.answerDraft.level).toBe("source-grounded");
    expect(packet.careActions.some((action) => action.source === "document")).toBe(true);
    expect(packet.careActions.some((action) => action.source === "vital")).toBe(true);
    expect(packet.careActions.some((action) => action.source === "lab")).toBe(true);
  });

  it("keeps every workflow surface path-safe and free of unsafe direct clinical instructions", () => {
    const packet = buildClinicalWorkflowReviewPacket();

    expect(packet.surfaces.map((surface) => surface.id).sort()).toEqual([
      "care-action-queue",
      "caregiver-html",
      "clinical-source-review-packet",
      "csv-export",
      "document-rag-context",
      "visit-summary-markdown",
    ]);
    expect(packet.surfaces.every((surface) => surface.status === "pass")).toBe(true);
    expect(packet.surfaces.every((surface) => !surface.hasLocalPathLeak)).toBe(true);
    expect(packet.surfaces.every((surface) => surface.unsafeClinicalInstructionHits.length === 0))
      .toBe(true);
    expect(packet.surfaces.some((surface) => surface.containsParsedEvidence)).toBe(true);
    expect(packet.surfaces.some((surface) => surface.containsCareBoundary)).toBe(true);
  });

  it("marks real clinician review and private HWP/HWPX sample smoke as unresolved blockers", () => {
    const packet = buildClinicalWorkflowReviewPacket();
    const requirementsById = Object.fromEntries(
      packet.requirements.map((requirement) => [requirement.id, requirement]),
    );

    expect(requirementsById["comorbid-profile-coverage"]).toMatchObject({ status: "pass" });
    expect(requirementsById["parsed-document-rag"]).toMatchObject({ status: "pass" });
    expect(requirementsById["document-care-queue"]).toMatchObject({ status: "pass" });
    expect(requirementsById["surface-safety"]).toMatchObject({ status: "pass" });
    expect(requirementsById["clinician-source-review"]).toMatchObject({ status: "required" });
    expect(requirementsById["private-hwp-hwpx-sample"]).toMatchObject({ status: "blocked" });

    const markdown = formatClinicalWorkflowReviewPacketMarkdown(packet);
    expect(markdown).toContain("Status: needs-external-review");
    expect(markdown).toContain("clinician/source review still required");
    expect(markdown).toContain("real private HWP/HWPX sample smoke not executed");
    expect(markdown).not.toContain("/Users/wj/private-carevault");
    expect(markdown).not.toContain("진단합니다");
    expect(markdown).not.toContain("처방합니다");
    expect(markdown).not.toContain("치료합니다");
  });

  it("requires every user-facing workflow surface to preserve parsed document evidence", () => {
    const packet = buildClinicalWorkflowReviewPacket();
    const requirementsById = Object.fromEntries(
      packet.requirements.map((requirement) => [requirement.id, requirement]),
    );
    const userFacingSurfaceIds = [
      "care-action-queue",
      "caregiver-html",
      "csv-export",
      "document-rag-context",
      "visit-summary-markdown",
    ];
    const userFacingSurfaces = packet.surfaces.filter((surface) =>
      userFacingSurfaceIds.includes(surface.id),
    );

    expect(userFacingSurfaces.map((surface) => surface.id).sort()).toEqual(userFacingSurfaceIds);
    expect(userFacingSurfaces.every((surface) => surface.containsParsedEvidence)).toBe(true);
    expect(requirementsById["parsed-document-user-facing-surfaces"]).toMatchObject({
      status: "pass",
    });

    const markdown = formatClinicalWorkflowReviewPacketMarkdown(packet);
    expect(markdown).toContain("parsed document evidence across user-facing surfaces");
    for (const surfaceId of userFacingSurfaceIds) {
      expect(markdown).toContain(`${surfaceId}) - parsed=true`);
    }
  });
});
