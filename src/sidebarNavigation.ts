export const sidebarSectionIds = [
  "dashboard",
  "records",
  "nutrition",
  "care-plan",
  "labs",
  "documents",
] as const;

export type SidebarSectionId = (typeof sidebarSectionIds)[number];

export const defaultSidebarSectionId: SidebarSectionId = "dashboard";

export function getSidebarHashSectionId(hash: string): SidebarSectionId | null {
  const sectionId = hash.replace(/^#/, "");
  return sidebarSectionIds.includes(sectionId as SidebarSectionId)
    ? (sectionId as SidebarSectionId)
    : null;
}

export function normalizeSidebarSectionHash(hash: string): SidebarSectionId {
  return getSidebarHashSectionId(hash) ?? defaultSidebarSectionId;
}
