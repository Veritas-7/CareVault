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
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}
