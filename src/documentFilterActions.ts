import {
  buildDocumentKnowledgeSearchText,
  detectDocumentKnowledgeSignals,
  type DocumentKnowledgeSignalId,
} from "./documentKnowledge";

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

export type DocumentClinicalQuickSearchOption = {
  actionLabel: string;
  disabled: boolean;
  id: "cervical-cancer" | "hypertension" | "diabetes";
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

function normalizeFilterText(...values: Array<string | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreFieldMatch(
  fieldText: string,
  normalizedSearch: string,
  searchTokens: string[],
  phraseScore: number,
  tokenScore: number,
) {
  if (!fieldText) return 0;

  const phraseMatchScore = normalizedSearch && fieldText.includes(normalizedSearch) ? phraseScore : 0;
  const tokenMatchScore = searchTokens.filter((token) => fieldText.includes(token)).length * tokenScore;
  return phraseMatchScore + tokenMatchScore;
}

function scoreDocumentSearchRelevance<Document extends DocumentFilterSource>(
  document: Document,
  {
    categoryLabel,
    haystack,
    normalizedSearch,
    searchTokens,
    statusLabel,
  }: {
    categoryLabel: string;
    haystack: string;
    normalizedSearch: string;
    searchTokens: string[];
    statusLabel: string;
  },
) {
  const titleText = normalizeFilterText(document.title);
  const tagText = normalizeFilterText(document.tags);
  const nextActionText = normalizeFilterText(document.nextAction);
  const bodyText = normalizeFilterText(document.body);
  const attachmentText = normalizeFilterText(document.attachmentName, document.attachmentStatus);
  const metadataText = normalizeFilterText(
    document.date,
    document.category,
    categoryLabel,
    document.reviewStatus,
    statusLabel,
  );
  const knowledgeText = normalizeFilterText(buildDocumentKnowledgeSearchText(document));
  const querySignalIds = new Set(
    detectDocumentKnowledgeSignals({
      body: normalizedSearch,
      title: normalizedSearch,
    }).map((signal) => signal.id),
  );
  const documentSignals = detectDocumentKnowledgeSignals(document);
  const overlappingSignals = documentSignals.filter((signal) => querySignalIds.has(signal.id));
  const matchedTokenCount = searchTokens.filter((token) => haystack.includes(token)).length;

  let score = 0;
  score += scoreFieldMatch(titleText, normalizedSearch, searchTokens, 90, 18);
  score += scoreFieldMatch(tagText, normalizedSearch, searchTokens, 70, 14);
  score += scoreFieldMatch(nextActionText, normalizedSearch, searchTokens, 55, 12);
  score += scoreFieldMatch(bodyText, normalizedSearch, searchTokens, 40, 8);
  score += scoreFieldMatch(attachmentText, normalizedSearch, searchTokens, 30, 7);
  score += scoreFieldMatch(metadataText, normalizedSearch, searchTokens, 20, 5);
  score += scoreFieldMatch(knowledgeText, normalizedSearch, searchTokens, 24, 5);
  score += overlappingSignals.filter((signal) => signal.id !== "hwp-document").length * 24;
  score += overlappingSignals.filter((signal) => signal.id === "hwp-document").length * 8;
  score += matchedTokenCount * 4;
  if (searchTokens.length > 1 && matchedTokenCount === searchTokens.length) {
    score += 12;
  }
  return score;
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

const clinicalQuickSearchDefinitions: Array<{
  id: DocumentClinicalQuickSearchOption["id"];
  label: string;
  searchText: string;
  signalId: DocumentKnowledgeSignalId;
}> = [
  {
    id: "cervical-cancer",
    label: "자궁경부암",
    searchText: "자궁경부암",
    signalId: "cervical-cancer",
  },
  {
    id: "hypertension",
    label: "혈압약",
    searchText: "혈압약",
    signalId: "hypertension",
  },
  {
    id: "diabetes",
    label: "당화혈색소",
    searchText: "당화혈색소",
    signalId: "diabetes",
  },
];

export function buildDocumentClinicalQuickSearchOptions<Document extends DocumentFilterSource>(
  documents: readonly Document[],
): DocumentClinicalQuickSearchOption[] {
  const signalIdsByDocument = documents.map(
    (document) => new Set(detectDocumentKnowledgeSignals(document).map((signal) => signal.id)),
  );

  return clinicalQuickSearchDefinitions.map(({ id, label, searchText, signalId }) => {
    const count = signalIdsByDocument.filter((signalIds) => signalIds.has(signalId)).length;
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
  const searchTokens = splitSearchTokens(normalizedSearch);

  return documents
    .map((document, index) => {
      const categoryMatches = categoryFilter === "all" || document.category === categoryFilter;
      const statusMatches = statusFilter === "all" || document.reviewStatus === statusFilter;

      if (!categoryMatches || !statusMatches) {
        return null;
      }
      if (!normalizedSearch) {
        return {
          document,
          index,
          score: 0,
        };
      }

      const categoryLabel = categoryLabels[document.category] ?? document.category;
      const statusLabel = statusLabels[document.reviewStatus] ?? document.reviewStatus;
      const haystack = [
        document.date,
        categoryLabel,
        document.title,
        document.body,
        document.tags,
        document.nextAction,
        statusLabel,
        document.attachmentName ?? "",
        document.attachmentStatus ?? "",
        buildDocumentKnowledgeSearchText(document),
      ]
        .join(" ")
        .toLowerCase();

      if (haystack.includes(normalizedSearch)) {
        return {
          document,
          index,
          score: scoreDocumentSearchRelevance(document, {
            categoryLabel,
            haystack,
            normalizedSearch,
            searchTokens,
            statusLabel,
          }),
        };
      }

      if (searchTokens.length > 1 && searchTokens.every((token) => haystack.includes(token))) {
        return {
          document,
          index,
          score: scoreDocumentSearchRelevance(document, {
            categoryLabel,
            haystack,
            normalizedSearch,
            searchTokens,
            statusLabel,
          }),
        };
      }

      return null;
    })
    .filter((entry): entry is { document: Document; index: number; score: number } => Boolean(entry))
    .sort((first, second) =>
      normalizedSearch ? second.score - first.score || first.index - second.index : first.index - second.index,
    )
    .map((entry) => entry.document);
}
