export const documentFilterResetStatusLabel = "서류 필터 초기화됨";

type DocumentFilterResetActionParts = {
  categoryLabel: string;
  searchText?: string;
  statusLabel: string;
};

export function formatDocumentFilterResetActionLabel({
  categoryLabel,
  searchText,
  statusLabel,
}: DocumentFilterResetActionParts) {
  const trimmedSearch = searchText?.trim();
  const searchContext = trimmedSearch ? `검색어 ${trimmedSearch}` : "검색어 없음";

  return `저장된 서류 필터 초기화 · ${searchContext} · 분류 ${categoryLabel} · 상태 ${statusLabel}`;
}
