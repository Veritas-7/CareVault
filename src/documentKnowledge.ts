export type DocumentKnowledgeSignalId =
  | "cervical-cancer"
  | "hypertension"
  | "diabetes"
  | "hwp-document";

export type DocumentKnowledgeSource = {
  attachmentName?: string;
  attachmentPath?: string;
  body?: string;
  category?: string;
  date?: string;
  nextAction?: string;
  reviewStatus?: string;
  tags?: string;
  title?: string;
};

export type DocumentKnowledgeSignal = {
  id: DocumentKnowledgeSignalId;
  label: string;
  aliases: string[];
  matchedBy: string[];
};

const signalDefinitions: Array<{
  aliases: string[];
  id: DocumentKnowledgeSignalId;
  label: string;
  match: RegExp;
}> = [
  {
    id: "cervical-cancer",
    label: "자궁경부암",
    aliases: ["cervical cancer", "cervix", "C53", "HPV", "병리", "조직검사"],
    match: /자궁\s*경부|자궁경부암|cervix|cervical|c53|hpv|편평상피|선암|상피내암/i,
  },
  {
    id: "hypertension",
    label: "고혈압",
    aliases: ["혈압", "BP", "수축기", "이완기", "항고혈압제", "ARB", "ACEi", "CCB"],
    match: /고혈압|혈압|bp\b|수축기|이완기|항고혈압|arb\b|acei\b|ccb\b|\b\d{2,3}\/\d{2,3}\b/i,
  },
  {
    id: "diabetes",
    label: "당뇨",
    aliases: ["혈당", "glucose", "HbA1c", "A1C", "공복혈당", "식후혈당", "인슐린"],
    match: /당뇨|혈당|glucose|hba1c|a1c\b|공복혈당|식후\s*혈당|인슐린|메트포르민/i,
  },
  {
    id: "hwp-document",
    label: "HWP/HWPX",
    aliases: ["한글 문서", "한컴 문서", "문서 파싱", "RAG", "rhwp", "kordoc"],
    match: /\.(hwp|hwpx)$/i,
  },
];

function compactText(...values: Array<string | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
}

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getClinicalSignals(signals: DocumentKnowledgeSignal[]) {
  return signals.filter((signal) => signal.id !== "hwp-document");
}

function truncateText(value: string, maxLength = 120) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function findExcerpt(text: string, query: string, maxLength = 96) {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedText) return "";
  if (!normalizedQuery) return truncateText(normalizedText, maxLength);

  const index = normalizedText.toLowerCase().indexOf(normalizedQuery);
  if (index < 0) return truncateText(normalizedText, maxLength);

  const half = Math.floor(maxLength / 2);
  const start = Math.max(0, index - half);
  const end = Math.min(normalizedText.length, start + maxLength);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < normalizedText.length ? "..." : "";
  return `${prefix}${normalizedText.slice(start, end).trim()}${suffix}`;
}

export function detectDocumentKnowledgeSignals(
  document: DocumentKnowledgeSource,
): DocumentKnowledgeSignal[] {
  const textFields = compactText(
    document.title,
    document.body,
    document.tags,
    document.nextAction,
    document.category,
  );
  const attachmentName = document.attachmentName?.trim() ?? "";

  return signalDefinitions
    .map((definition) => {
      const targetText =
        definition.id === "hwp-document" ? attachmentName : compactText(textFields, attachmentName);
      if (!definition.match.test(targetText)) return null;

      return {
        id: definition.id,
        label: definition.label,
        aliases: definition.aliases,
        matchedBy: uniq([definition.label, ...definition.aliases]),
      };
    })
    .filter((signal): signal is DocumentKnowledgeSignal => Boolean(signal));
}

export function buildDocumentKnowledgeSearchText(document: DocumentKnowledgeSource) {
  const signals = detectDocumentKnowledgeSignals(document);

  return compactText(
    document.date,
    document.category,
    document.title,
    document.body,
    document.tags,
    document.nextAction,
    document.reviewStatus,
    document.attachmentName,
    ...signals.flatMap((signal) => [signal.label, ...signal.aliases, ...signal.matchedBy]),
  );
}

export function buildDocumentKnowledgeSummary(document: DocumentKnowledgeSource) {
  const signals = detectDocumentKnowledgeSignals(document);
  if (!signals.length) return "";

  return `문서 단서: ${signals.map((signal) => signal.label).join(" · ")}`;
}

export function buildDocumentCareQuestionDraft(document: DocumentKnowledgeSource) {
  const signals = detectDocumentKnowledgeSignals(document);
  const clinicalLabels = getClinicalSignals(signals).map((signal) => signal.label);
  if (!clinicalLabels.length) return "";

  const title = document.title?.trim() || "저장된 서류";
  const bodyExcerpt = truncateText(document.body ?? "", 110);
  const signalText = clinicalLabels.join(", ");
  const sourceText = bodyExcerpt ? ` 원문 메모: ${bodyExcerpt}` : "";

  return `${title} 서류에서 ${signalText} 관련 단서가 함께 보입니다. 기록 의미, 추적 일정, 다른 만성질환 관리와의 연결을 담당 의료진에게 확인할 질문으로 정리합니다.${sourceText}`;
}

export function buildDocumentKnowledgeSnippet(document: DocumentKnowledgeSource, query: string) {
  const summary = buildDocumentKnowledgeSummary(document);
  const bodyExcerpt = findExcerpt(
    compactText(document.title, document.body, document.tags, document.nextAction),
    query,
  );
  return compactText(bodyExcerpt, summary);
}
