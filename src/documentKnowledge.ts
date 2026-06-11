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

export type DocumentParsedAttachmentSource = {
  fileName: string;
  sourceLabel?: string;
};

export type DocumentCareMeasurementCue = {
  kind: "blood-pressure" | "glucose" | "hba1c";
  text: string;
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
    aliases: [
      "cervical cancer",
      "cervix",
      "C53",
      "HPV",
      "Pap smear",
      "LBC",
      "ASC-US",
      "LSIL",
      "HSIL",
      "CIN",
      "CIN1",
      "CIN2",
      "CIN3",
      "SCC",
      "편평상피세포암",
      "자궁경부세포검사",
      "액상세포검사",
      "질확대경검사",
      "병리",
      "조직검사",
    ],
    match:
      /자궁\s*경부|자궁경부암|cervix|cervical|c53|hpv|pap\s*smear|lbc\b|asc-?us|lsil|hsil|cin\s*\d?|scc\b|편평상피|선암|상피내암|자궁경부세포검사|액상세포검사|질확대경/i,
  },
  {
    id: "hypertension",
    label: "고혈압",
    aliases: [
      "혈압",
      "혈압약",
      "고혈압약",
      "BP",
      "SBP",
      "DBP",
      "수축기",
      "이완기",
      "항고혈압제",
      "ARB",
      "ACEi",
      "CCB",
      "amlodipine",
      "losartan",
    ],
    match: /고혈압|혈압|bp\b|수축기|이완기|항고혈압|arb\b|acei\b|ccb\b|\b\d{2,3}\/\d{2,3}\b/i,
  },
  {
    id: "diabetes",
    label: "당뇨",
    aliases: [
      "혈당",
      "glucose",
      "HbA1c",
      "A1C",
      "당화혈색소",
      "공복혈당",
      "식후혈당",
      "인슐린",
      "메트포르민",
      "metformin",
    ],
    match: /당뇨|혈당|glucose|hba1c|a1c\b|당화혈색소|공복혈당|식후\s*혈당|인슐린|메트포르민|metformin/i,
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

function uniqParsedSources(sources: DocumentParsedAttachmentSource[]) {
  const seen = new Set<string>();
  const uniqueSources: DocumentParsedAttachmentSource[] = [];
  sources.forEach((source) => {
    const key = `${source.fileName}\0${source.sourceLabel ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    uniqueSources.push(source);
  });
  return uniqueSources;
}

function getClinicalSignals(signals: DocumentKnowledgeSignal[]) {
  return signals.filter((signal) => signal.id !== "hwp-document");
}

function stripLocalPaths(value: string) {
  return value
    .replace(/\/Users\/[^\s)]+/g, "[local path]")
    .replace(/[A-Za-z]:\\[^\s)]+/g, "[local path]");
}

function truncateText(value: string, maxLength = 120) {
  const normalized = stripLocalPaths(value).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function findExcerpt(text: string, query: string, maxLength = 96) {
  const normalizedText = stripLocalPaths(text).replace(/\s+/g, " ").trim();
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

function stripParsedAttachmentMarkers(value: string) {
  return value.replace(/^\[첨부 텍스트 파싱:\s*[^\]\n]+\]\s*$/gm, "");
}

function normalizeMeasurementText(value: string) {
  return stripLocalPaths(value).replace(/\s+/g, " ").trim();
}

function isInRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function uniqMeasurementCues(cues: DocumentCareMeasurementCue[]) {
  const seen = new Set<string>();
  return cues.filter((cue) => {
    const key = `${cue.kind}\0${cue.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function extractDocumentCareMeasurementCues(
  document: DocumentKnowledgeSource,
): DocumentCareMeasurementCue[] {
  const text = normalizeMeasurementText(
    stripParsedAttachmentMarkers(
      compactText(document.title, document.body, document.tags, document.nextAction),
    ),
  );
  if (!text) return [];

  const cues: DocumentCareMeasurementCue[] = [];
  for (const match of text.matchAll(/(?:혈압|BP)\s*[:：]?\s*(\d{2,3})\s*\/\s*(\d{2,3})(?:\s*mmHg)?/gi)) {
    const systolic = Number(match[1]);
    const diastolic = Number(match[2]);
    if (!isInRange(systolic, 40, 260) || !isInRange(diastolic, 30, 180)) continue;
    cues.push({
      kind: "blood-pressure",
      text: `혈압 ${systolic}/${diastolic} mmHg`,
    });
  }

  for (const match of text.matchAll(/(?:HbA1c|A1C|당화혈색소)\s*[:：]?\s*(\d{1,2}(?:\.\d+)?)\s*%?/gi)) {
    const value = Number(match[1]);
    if (!isInRange(value, 3, 20)) continue;
    cues.push({
      kind: "hba1c",
      text: `HbA1c ${match[1]}%`,
    });
  }

  for (const match of text.matchAll(/(?:공복혈당|식후혈당|혈당|glucose)\s*[:：]?\s*(\d{2,3})\s*(?:mg\/?dL)?/gi)) {
    const value = Number(match[1]);
    if (!isInRange(value, 20, 600)) continue;
    cues.push({
      kind: "glucose",
      text: `혈당 ${value} mg/dL`,
    });
  }

  return uniqMeasurementCues(cues).slice(0, 5);
}

export function buildDocumentCareMeasurementSummary(document: DocumentKnowledgeSource) {
  const cues = extractDocumentCareMeasurementCues(document);
  if (!cues.length) return "";

  return `문서 측정 단서(원문): ${cues.map((cue) => cue.text).join(" · ")}. 수치 해석, 반복 측정 시점, 약·식사·치료 영향은 진료팀 기준으로 확인합니다.`;
}

function buildDocumentCareQuestionSourceText(
  document: DocumentKnowledgeSource,
  clinicalSignals: DocumentKnowledgeSignal[],
) {
  const body = stripParsedAttachmentMarkers(document.body ?? "");
  const focusTerms = uniq(
    clinicalSignals.flatMap((signal) => [signal.label, ...signal.aliases, ...signal.matchedBy]),
  );
  const lowerBody = body.toLowerCase();
  const focusTerm = focusTerms.find((term) => lowerBody.includes(term.toLowerCase())) ?? "";
  const bodyExcerpt = findExcerpt(body, focusTerm, 130);
  const measurementSummary = buildDocumentCareMeasurementSummary(document);
  const parserSummary = buildDocumentParserProvenanceSummary(document);

  return compactText(
    bodyExcerpt ? `원문 메모: ${bodyExcerpt}` : "",
    measurementSummary,
    parserSummary,
  );
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
  const parsedSources = extractDocumentParsedAttachmentSources(document);
  const parserAliases = buildDocumentParserProvenanceSearchAliases(parsedSources);

  return compactText(
    document.date,
    document.category,
    document.title,
    document.body,
    document.tags,
    document.nextAction,
    document.reviewStatus,
    document.attachmentName,
    buildDocumentParserProvenanceSummary(document),
    ...parserAliases,
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
  const clinicalSignals = getClinicalSignals(signals);
  const clinicalLabels = clinicalSignals.map((signal) => signal.label);
  if (!clinicalLabels.length) return "";

  const title = document.title?.trim() || "저장된 서류";
  const signalText = clinicalLabels.join(", ");
  const sourceText = buildDocumentCareQuestionSourceText(document, clinicalSignals);
  const sourceClause = sourceText ? ` ${sourceText}` : "";

  return `${title} 서류에서 ${signalText} 관련 단서가 함께 보입니다. 기록 의미, 추적 일정, 다른 만성질환 관리와의 연결을 담당 의료진에게 확인할 질문으로 정리합니다.${sourceClause}`;
}

export function buildDocumentKnowledgeSnippet(document: DocumentKnowledgeSource, query: string) {
  const summary = buildDocumentKnowledgeSummary(document);
  const parserSummary = buildDocumentParserProvenanceSummary(document);
  const bodyExcerpt = findExcerpt(
    compactText(document.title, document.body, document.tags, document.nextAction),
    query,
  );
  return compactText(bodyExcerpt, summary, parserSummary);
}

export function extractDocumentParsedAttachmentSources(
  document: DocumentKnowledgeSource,
): DocumentParsedAttachmentSource[] {
  const body = document.body ?? "";
  const matches = [...body.matchAll(/^\[첨부 텍스트 파싱:\s*([^\]\n]+)\]/gm)];
  const sources: DocumentParsedAttachmentSource[] = [];
  matches.forEach((match) => {
    const [fileName, ...sourceParts] = match[1].split(" · ");
    const normalizedFileName = fileName.trim();
    const sourceLabel = sourceParts.join(" · ").trim();
    if (!normalizedFileName) return;

    sources.push({
      fileName: normalizedFileName,
      sourceLabel: sourceLabel || undefined,
    });
  });
  return uniqParsedSources(sources);
}

export function buildDocumentParserProvenanceSummary(document: DocumentKnowledgeSource) {
  const sources = extractDocumentParsedAttachmentSources(document);
  if (!sources.length) return "";

  const summaries = sources.map((source) =>
    source.sourceLabel
      ? `${source.sourceLabel}: ${source.fileName}`
      : `텍스트 파싱: ${source.fileName}`,
  );
  return `파싱 원천: ${summaries.join(" · ")}`;
}

function buildDocumentParserProvenanceSearchAliases(sources: DocumentParsedAttachmentSource[]) {
  return uniq(
    sources.flatMap((source) => [
      "첨부 텍스트 파싱",
      "문서 파싱 원천",
      "파싱 원천",
      "파싱 provenance",
      source.fileName,
      source.sourceLabel ?? "",
      source.sourceLabel?.includes("데스크톱") ? "데스크톱 파서" : "",
      source.sourceLabel?.includes("HWP") ? "HWP 파서" : "",
      source.sourceLabel?.includes("HWPX") ? "HWPX 파서" : "",
      source.sourceLabel?.includes("미리보기") ? "HWPX 미리보기" : "",
      source.sourceLabel?.includes("본문 XML") ? "HWPX 본문 XML" : "",
    ]),
  );
}
