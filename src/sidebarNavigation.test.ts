import { describe, expect, it } from "vitest";
import {
  defaultSidebarSectionId,
  getSidebarHashSectionId,
  normalizeSidebarSectionHash,
  sidebarSectionIds,
} from "./sidebarNavigation";

describe("sidebarNavigation", () => {
  it("keeps sidebar tracking order aligned to the app scroll flow", () => {
    expect(sidebarSectionIds).toEqual([
      "dashboard",
      "records",
      "care-plan",
      "labs",
      "nutrition",
      "documents",
    ]);
  });

  it("recognizes every sidebar hash target used by the app shell", () => {
    expect(sidebarSectionIds.map((sectionId) => getSidebarHashSectionId(`#${sectionId}`))).toEqual(
      sidebarSectionIds,
    );
  });

  it("does not treat unknown hashes as scroll targets", () => {
    expect(getSidebarHashSectionId("")).toBeNull();
    expect(getSidebarHashSectionId("#profile")).toBeNull();
    expect(getSidebarHashSectionId("#documents-extra")).toBeNull();
  });

  it("keeps active-section fallback on the dashboard for unknown hashes", () => {
    expect(normalizeSidebarSectionHash("#documents")).toBe("documents");
    expect(normalizeSidebarSectionHash("#missing")).toBe(defaultSidebarSectionId);
  });
});
