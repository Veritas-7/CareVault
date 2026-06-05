export const sidebarNavigationItems = [
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
] as const;

export type SidebarSectionId = (typeof sidebarNavigationItems)[number]["id"];

export const sidebarSectionIds = sidebarNavigationItems.map((item) => item.id);

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
