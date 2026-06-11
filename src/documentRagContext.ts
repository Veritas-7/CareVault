import {
  buildDocumentKnowledgeSearchText,
  buildDocumentKnowledgeSnippet,
  buildDocumentParserProvenanceSummary,
  detectDocumentKnowledgeSignals,
  extractDocumentParsedAttachmentSources,
  type DocumentKnowledgeSignal,
  type DocumentKnowledgeSource,
} from "./documentKnowledge";

export type DocumentRagContextSource = DocumentKnowledgeSource & {
  id?: string;
};

export type DocumentRagEvidenceChunk = {
  label: string;
  reasonSummary: string;
  score: number;
  sourceSummary: string;
  text: string;
};

export type DocumentRagContextItem = {
  clinicalSignalCount: number;
  documentId: string;
  evidenceChunks: DocumentRagEvidenceChunk[];
  parserSummary: string;
  parsedSourceCount: number;
  reasonSummary: string;
  score: number;
  signalSummary: string;
  snippet: string;
  titleLine: string;
};

export type DocumentRagContext = {
  ariaLabel: string;
  items: DocumentRagContextItem[];
  queryLabel: string;
  summary: string;
};

export type DocumentRagProfileQuerySource = {
  cancerCareMode?: boolean;
  diabetes?: boolean;
  hypertension?: boolean;
};

const defaultMaxItems = 5;
const noContextSummary = "RAG 컨텍스트 없음 · 검색 결과 0개";

function normalizeSearchText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function stripLocalPaths(value: string) {
  return value
    .replace(/\/Users\/[^\s)]+/g, "[local path]")
    .replace(/[A-Za-z]:\\[^\s)]+/g, "[local path]");
}

function splitQueryTokens(query: string) {
  return [...new Set(normalizeSearchText(query).split(/[\s,.;:!?()[\]{}"'`~|/\\<>·]+/).filter(Boolean))];
}

export function buildDocumentRagProfileQuery(profile: DocumentRagProfileQuerySource) {
  const queryParts = [
    profile.cancerCareMode ? "자궁경부암" : "",
    profile.hypertension ? "고혈압" : "",
    profile.hypertension ? "혈압" : "",
    profile.hypertension ? "혈압약" : "",
    profile.diabetes ? "당뇨" : "",
    profile.diabetes ? "혈당" : "",
    profile.diabetes ? "HbA1c" : "",
    profile.diabetes ? "당화혈색소" : "",
  ];
  return queryParts.filter(Boolean).join(" ");
}

function expandQueryTokens(query: string, querySignals: DocumentKnowledgeSignal[]) {
  return splitQueryTokens(
    [
      query,
      ...querySignals.flatMap((signal) => [
        signal.label,
        ...signal.aliases,
        ...signal.matchedBy,
      ]),
    ].join(" "),
  );
}

function getClinicalSignals(signals: DocumentKnowledgeSignal[]) {
  return signals.filter((signal) => signal.id !== "hwp-document");
}

function getSignalLabels(signals: DocumentKnowledgeSignal[]) {
  return signals.map((signal) => signal.label);
}

function getClinicalSignalLabels(signals: DocumentKnowledgeSignal[]) {
  return getSignalLabels(getClinicalSignals(signals));
}

function formatSourceParts(sourceText: string) {
  const [fileName, ...sourceParts] = sourceText.split(" · ");
  const normalizedFileName = fileName.trim();
  const sourceLabel = sourceParts.join(" · ").trim();
  if (!normalizedFileName) return "";
  return sourceLabel ? `${sourceLabel}: ${normalizedFileName}` : `텍스트 파싱: ${normalizedFileName}`;
}

function formatParsedMarkerSourceSummary(line: string) {
  const match = line.match(/^\[첨부 텍스트 파싱:\s*([^\]\n]+)\]\s*$/);
  return match ? formatSourceParts(match[1]) : "";
}

function removeParserSummaryPrefix(summary: string) {
  return summary.replace(/^파싱 원천:\s*/, "");
}

function formatDocumentTitleLine(document: DocumentRagContextSource) {
  const dateLabel = document.date?.trim() || "날짜 없음";
  const titleLabel =
    document.title?.trim() || document.attachmentName?.trim() || document.category?.trim() || "저장된 서류";
  return stripLocalPaths(`${dateLabel} · ${titleLabel}`);
}

function buildRawEvidenceChunks(document: DocumentRagContextSource) {
  const chunks: Array<{
    label: string;
    sourceSummary: string;
    text: string;
  }> = [];
  let currentSourceSummary = "직접 입력 메모";
  let currentSourceKind: "manual" | "parsed" = "manual";
  let manualChunkCount = 0;
  let parsedChunkCount = 0;
  let buffer: string[] = [];

  const flushBuffer = () => {
    const text = stripLocalPaths(buffer.join(" ").replace(/\s+/g, " ").trim());
    buffer = [];
    if (!text) return;

    const label =
      currentSourceKind === "parsed"
        ? `파싱 본문 조각 ${++parsedChunkCount}`
        : `문서 메모 조각 ${++manualChunkCount}`;
    chunks.push({
      label,
      sourceSummary: currentSourceSummary,
      text,
    });
  };

  (document.body ?? "").split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    const parsedSourceSummary = formatParsedMarkerSourceSummary(trimmedLine);
    if (parsedSourceSummary) {
      flushBuffer();
      currentSourceSummary = stripLocalPaths(parsedSourceSummary);
      currentSourceKind = "parsed";
      return;
    }

    if (!trimmedLine) {
      flushBuffer();
      return;
    }
    buffer.push(trimmedLine);
  });
  flushBuffer();

  return chunks;
}

function scoreEvidenceChunk(
  chunk: ReturnType<typeof buildRawEvidenceChunks>[number],
  query: string,
  querySignals: DocumentKnowledgeSignal[],
  queryTokens: string[],
) {
  const normalizedQuery = normalizeSearchText(query);
  const searchableText = normalizeSearchText(`${chunk.text} ${chunk.sourceSummary}`);
  const chunkSignals = detectDocumentKnowledgeSignals({
    body: chunk.text,
    title: chunk.sourceSummary,
  });
  const reasons: string[] = [];
  let score = 0;

  if (normalizedQuery && searchableText.includes(normalizedQuery)) {
    score += 60;
    reasons.push("검색어 직접 일치");
  }

  const tokenHits = queryTokens.filter((token) => searchableText.includes(token));
  if (tokenHits.length) {
    score += tokenHits.length * 8;
    reasons.push(`검색어 일부: ${tokenHits.slice(0, 4).join(", ")}`);
  }

  const queryClinicalSignalIds = new Set(getClinicalSignals(querySignals).map((signal) => signal.id));
  const overlappingClinicalSignals = getClinicalSignals(chunkSignals).filter((signal) =>
    queryClinicalSignalIds.has(signal.id),
  );
  if (overlappingClinicalSignals.length) {
    score += overlappingClinicalSignals.length * 20;
    reasons.push(`임상 단서: ${getSignalLabels(overlappingClinicalSignals).join(" · ")}`);
  }

  const isParsedChunk = chunk.label.startsWith("파싱 본문");
  if (!normalizedQuery && isParsedChunk) {
    score += 12;
  }
  if (!normalizedQuery && getClinicalSignals(chunkSignals).length) {
    score += getClinicalSignals(chunkSignals).length * 8;
    reasons.push(`임상 단서: ${getClinicalSignalLabels(chunkSignals).join(" · ")}`);
  }
  if (isParsedChunk && score > 0) {
    reasons.push("파싱 본문");
  }

  if (!score) return null;

  return {
    ...chunk,
    reasonSummary: reasons.join(" · "),
    score,
  };
}

function buildDocumentEvidenceChunks(
  document: DocumentRagContextSource,
  query: string,
  querySignals: DocumentKnowledgeSignal[],
  queryTokens: string[],
) {
  return buildRawEvidenceChunks(document)
    .map((chunk) => scoreEvidenceChunk(chunk, query, querySignals, queryTokens))
    .filter((chunk): chunk is DocumentRagEvidenceChunk => Boolean(chunk))
    .sort((first, second) => second.score - first.score || first.label.localeCompare(second.label, "ko"))
    .slice(0, 3);
}

function scoreDocumentForContext(
  document: DocumentRagContextSource,
  query: string,
  querySignals: DocumentKnowledgeSignal[],
  queryTokens: string[],
) {
  const normalizedQuery = normalizeSearchText(query);
  const searchableText = normalizeSearchText(buildDocumentKnowledgeSearchText(document));
  const documentSignals = detectDocumentKnowledgeSignals(document);
  const documentSignalLabels = getSignalLabels(documentSignals);
  const clinicalSignalLabels = getClinicalSignalLabels(documentSignals);
  const parsedSources = extractDocumentParsedAttachmentSources(document);
  const parserSummary = removeParserSummaryPrefix(buildDocumentParserProvenanceSummary(document));
  const evidenceChunks = buildDocumentEvidenceChunks(document, query, querySignals, queryTokens);
  const reasons: string[] = [];
  let score = 0;

  if (normalizedQuery && searchableText.includes(normalizedQuery)) {
    score += 80;
    reasons.push("검색어 직접 일치");
  }

  const tokenHits = queryTokens.filter((token) => searchableText.includes(token));
  if (tokenHits.length) {
    score += tokenHits.length * 10;
    reasons.push(`검색어 일부: ${tokenHits.slice(0, 4).join(", ")}`);
  }

  const queryClinicalSignalIds = new Set(getClinicalSignals(querySignals).map((signal) => signal.id));
  const overlappingClinicalSignals = getClinicalSignals(documentSignals).filter((signal) =>
    queryClinicalSignalIds.has(signal.id),
  );
  if (overlappingClinicalSignals.length) {
    score += overlappingClinicalSignals.length * 22;
    reasons.push(`임상 단서: ${getSignalLabels(overlappingClinicalSignals).join(" · ")}`);
  }

  const parserMatched =
    Boolean(normalizedQuery) &&
    parsedSources.some((source) =>
      normalizeSearchText(`${source.fileName} ${source.sourceLabel ?? ""}`).includes(normalizedQuery),
    );
  if (parserMatched) {
    score += 24;
    reasons.push("파싱 원천 일치");
  }

  if (!normalizedQuery) {
    if (parsedSources.length) {
      score += 18;
      reasons.push("파싱 본문 포함");
    }
    if (clinicalSignalLabels.length) {
      score += clinicalSignalLabels.length * 8;
      reasons.push(`임상 단서: ${clinicalSignalLabels.join(" · ")}`);
    }
  }

  if (evidenceChunks.length) {
    score += Math.min(30, Math.ceil(evidenceChunks[0].score / 2));
  }

  if (!score) return null;

  const snippetQuery = normalizedQuery || clinicalSignalLabels.join(" ") || document.title || "";
  const topEvidenceChunk = evidenceChunks[0];
  return {
    clinicalSignalCount: clinicalSignalLabels.length,
    documentId: document.id ?? `${document.date ?? "no-date"}-${document.title ?? "document"}`,
    evidenceChunks,
    parserSummary: parserSummary || "파싱 원천 없음",
    parsedSourceCount: parsedSources.length,
    reasonSummary: reasons.join(" · "),
    score,
    signalSummary: documentSignalLabels.length ? documentSignalLabels.join(" · ") : "임상 단서 없음",
    snippet: topEvidenceChunk?.text ?? stripLocalPaths(buildDocumentKnowledgeSnippet(document, snippetQuery)),
    titleLine: formatDocumentTitleLine(document),
  };
}

export function buildDocumentRagContext(
  documents: readonly DocumentRagContextSource[],
  query: string,
  { maxItems = defaultMaxItems }: { maxItems?: number } = {},
): DocumentRagContext {
  const queryLabel = stripLocalPaths(query.trim()) || "전체 저장 서류";
  const querySignals = detectDocumentKnowledgeSignals({
    attachmentName: query,
    body: query,
    title: query,
  });
  const queryTokens = expandQueryTokens(query, querySignals);
  const items = documents
    .map((document) => scoreDocumentForContext(document, query, querySignals, queryTokens))
    .filter((item): item is DocumentRagContextItem => Boolean(item))
    .sort((first, second) => second.score - first.score || first.titleLine.localeCompare(second.titleLine, "ko"))
    .slice(0, Math.max(1, maxItems));

  if (!items.length) {
    return {
      ariaLabel: `${noContextSummary} · 기준 ${queryLabel}`,
      items,
      queryLabel,
      summary: noContextSummary,
    };
  }

  const parsedDocumentCount = items.filter((item) => item.parsedSourceCount > 0).length;
  const clinicalDocumentCount = items.filter((item) => item.clinicalSignalCount > 0).length;
  const evidenceChunkCount = items.reduce((count, item) => count + item.evidenceChunks.length, 0);
  const summary = `RAG 컨텍스트 ${items.length}개 · 파싱 문서 ${parsedDocumentCount}개 · 임상 단서 ${clinicalDocumentCount}개 · 근거 조각 ${evidenceChunkCount}개`;

  return {
    ariaLabel: `${summary} · 기준 ${queryLabel}`,
    items,
    queryLabel,
    summary,
  };
}

export function formatDocumentRagContextClipboardDescription(context: DocumentRagContext) {
  return `문서 RAG 컨텍스트 복사 · ${context.summary}`;
}

export function formatDocumentRagContextClipboardStatus(context: DocumentRagContext) {
  return `문서 RAG 컨텍스트 복사됨 · ${context.summary}`;
}

export function formatDocumentRagContextClipboardUnsupportedStatus(context: DocumentRagContext) {
  return `문서 RAG 컨텍스트 복사 미지원 · 브라우저 클립보드 없음 · ${context.summary}`;
}

export function formatDocumentRagContextClipboardFailedStatus(context: DocumentRagContext) {
  return `문서 RAG 컨텍스트 복사 실패 · ${context.summary}`;
}

export function formatDocumentRagContextDownloadDescription(context: DocumentRagContext) {
  return `문서 RAG 컨텍스트 다운로드 · ${context.summary}`;
}

export function formatDocumentRagContextDownloadStatus(context: DocumentRagContext) {
  return `문서 RAG 컨텍스트 다운로드됨 · ${context.summary}`;
}

export function formatDocumentRagContextDownloadFallbackLabel() {
  return "문서 RAG 컨텍스트";
}

export function formatDocumentRagContextClipboardText(context: DocumentRagContext) {
  const lines = [
    "[CareVault 문서 RAG 컨텍스트]",
    "용도: 저장된 서류와 파싱된 첨부 본문에서 검색 기준에 맞는 근거 조각을 묶은 로컬 컨텍스트입니다.",
    "주의: 진단·처방·치료 지시가 아니라 원문 서류와 진료팀 확인을 돕는 기록입니다.",
    `기준 검색어: ${context.queryLabel}`,
    `요약: ${context.summary}`,
  ];

  if (!context.items.length) {
    return [...lines, "", "- 검색 기준에 맞는 저장 서류 컨텍스트가 없습니다."].join("\n");
  }

  return [
    ...lines,
    "",
    ...context.items.flatMap((item, index) => [
      `- [${index + 1}] ${item.titleLine}`,
      `  - 관련 이유: ${item.reasonSummary}`,
      `  - 임상 단서: ${item.signalSummary}`,
      `  - 파싱 원천: ${item.parserSummary}`,
      `  - 근거 스니펫: ${item.snippet}`,
      ...item.evidenceChunks.flatMap((chunk, chunkIndex) => [
        `  - 근거 조각 ${chunkIndex + 1}: ${chunk.label}`,
        `    - 조각 이유: ${chunk.reasonSummary}`,
        `    - 조각 원천: ${chunk.sourceSummary}`,
        `    - 조각 본문: ${chunk.text}`,
      ]),
    ]),
  ].join("\n");
}
