import { describe, expect, it } from "vitest";
import {
  defaultSidebarSectionId,
  getSidebarHashSectionId,
  normalizeSidebarSectionHash,
  sidebarNavigationItems,
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

  it("keeps destination-specific labels, titles, and hrefs beside section order", () => {
    expect(sidebarNavigationItems).toEqual([
      {
        actionLabel: "대시보드 섹션으로 이동",
        href: "#dashboard",
        id: "dashboard",
        visibleLabel: "대시보드",
      },
      {
        actionLabel: "입력 기록 섹션으로 이동",
        href: "#records",
        id: "records",
        visibleLabel: "입력 기록",
      },
      {
        actionLabel: "증상·질문 섹션으로 이동",
        href: "#care-plan",
        id: "care-plan",
        visibleLabel: "증상·질문",
      },
      {
        actionLabel: "검사 수치 섹션으로 이동",
        href: "#labs",
        id: "labs",
        visibleLabel: "검사 수치",
      },
      {
        actionLabel: "음식 판단 섹션으로 이동",
        href: "#nutrition",
        id: "nutrition",
        visibleLabel: "음식 판단",
      },
      {
        actionLabel: "서류 보관 섹션으로 이동",
        href: "#documents",
        id: "documents",
        visibleLabel: "서류 보관",
      },
    ]);
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
