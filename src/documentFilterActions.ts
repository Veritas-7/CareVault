import { buildDocumentKnowledgeSearchText } from "./documentKnowledge";

type DocumentFilterSource = {
  attachmentName?: string;
  attachmentStatus?: string;
  body: string;
  category: string;
  date: string;
  nextAction: string;
  reviewStatus: string;
  tags: string;
  title: string;
};

type DocumentFilterResetActionParts = {
  categoryLabel: string;
  searchText?: string;
  statusLabel: string;
};

type DocumentParserQuickSearchCounts = {
  desktopParserCount: number;
  parsedAttachmentCount: number;
};

export type DocumentParserQuickSearchOption = {
  actionLabel: string;
  disabled: boolean;
  id: "parsed-attachment" | "desktop-parser";
  label: string;
  searchText: string;
  statusLabel: string;
  value: string;
};

function formatDocumentFilterResetContext({
  categoryLabel,
  searchText,
  statusLabel,
}: DocumentFilterResetActionParts) {
  const trimmedSearch = searchText?.trim();
  const searchContext = trimmedSearch ? `검색어 ${trimmedSearch}` : "검색어 없음";

  return `${searchContext} · 분류 ${categoryLabel} · 상태 ${statusLabel}`;
}

export const documentFilterResetStatusLabel = "서류 필터 초기화됨";

export function formatDocumentFilterResetActionLabel({
  categoryLabel,
  searchText,
  statusLabel,
}: DocumentFilterResetActionParts) {
  return `저장된 서류 필터 초기화 · ${formatDocumentFilterResetContext({
    categoryLabel,
    searchText,
    statusLabel,
  })}`;
}

export function formatDocumentFilterResetStatusLabel(parts: DocumentFilterResetActionParts) {
  return `서류 필터 초기화됨 · ${formatDocumentFilterResetContext(parts)}`;
}

export function hasActiveDocumentFilters({
  categoryFilter,
  searchText,
  statusFilter,
}: {
  categoryFilter: string;
  searchText: string;
  statusFilter: string;
}) {
  return Boolean(searchText.trim()) || categoryFilter !== "all" || statusFilter !== "all";
}

function splitSearchTokens(value: string) {
  return [...new Set(value.split(/[\s,.;:!?()[\]{}"'`~|/\\<>·]+/).filter(Boolean))];
}

export function buildDocumentParserQuickSearchOptions({
  desktopParserCount,
  parsedAttachmentCount,
}: DocumentParserQuickSearchCounts): DocumentParserQuickSearchOption[] {
  return [
    {
      count: parsedAttachmentCount,
      id: "parsed-attachment" as const,
      label: "파싱 본문",
      searchText: "첨부 텍스트 파싱",
    },
    {
      count: desktopParserCount,
      id: "desktop-parser" as const,
      label: "데스크톱 파서",
      searchText: "데스크톱 파서",
    },
  ].map(({ count, id, label, searchText }) => {
    const disabled = count === 0;
    const value = disabled ? "없음" : `${count}개`;

    return {
      actionLabel: disabled
        ? `저장된 서류 ${label} 빠른 검색 불가 · 대상 없음`
        : `저장된 서류 ${label} ${value} 빠른 검색`,
      disabled,
      id,
      label,
      searchText,
      statusLabel: disabled
        ? `서류 검색 불가 · ${label} 없음`
        : `서류 검색 적용됨 · ${label} ${value} · 검색어 ${searchText}`,
      value,
    };
  });
}

export function filterDocumentsBySearchAndReview<Document extends DocumentFilterSource>(
  documents: readonly Document[],
  {
    categoryFilter,
    categoryLabels,
    searchText,
    statusFilter,
    statusLabels,
  }: {
    categoryFilter: string;
    categoryLabels: Partial<Record<string, string>>;
    searchText: string;
    statusFilter: string;
    statusLabels: Partial<Record<string, string>>;
  },
) {
  const normalizedSearch = searchText.trim().toLowerCase();

  return documents.filter((document) => {
    const categoryMatches = categoryFilter === "all" || document.category === categoryFilter;
    const statusMatches = statusFilter === "all" || document.reviewStatus === statusFilter;

    if (!categoryMatches || !statusMatches) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      document.date,
      categoryLabels[document.category] ?? document.category,
      document.title,
      document.body,
      document.tags,
      document.nextAction,
      statusLabels[document.reviewStatus] ?? document.reviewStatus,
      document.attachmentName ?? "",
      document.attachmentStatus ?? "",
      buildDocumentKnowledgeSearchText(document),
    ]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(normalizedSearch)) {
      return true;
    }

    const searchTokens = splitSearchTokens(normalizedSearch);
    return searchTokens.length > 1 && searchTokens.every((token) => haystack.includes(token));
  });
}
