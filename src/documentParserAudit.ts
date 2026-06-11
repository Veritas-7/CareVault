import {
  detectDocumentKnowledgeSignals,
  extractDocumentParsedAttachmentSources,
  type DocumentKnowledgeSignal,
  type DocumentKnowledgeSource,
} from "./documentKnowledge";

export type DocumentParserAuditSource = DocumentKnowledgeSource & {
  id?: string;
};

export type DocumentParserAuditItem = {
  clinicalSignalSummary: string;
  dateLabel: string;
  documentId: string;
  documentLabel: string;
  hasDesktopParser: boolean;
  sourceSummary: string;
};

export type DocumentParserAudit = {
  ariaLabel: string;
  desktopParserDocumentCount: number;
  items: DocumentParserAuditItem[];
  parsedDocumentCount: number;
  parsedWithClinicalSignalCount: number;
  summary: string;
};

function getClinicalSignalLabels(signals: DocumentKnowledgeSignal[]) {
  return signals.filter((signal) => signal.id !== "hwp-document").map((signal) => signal.label);
}

function formatParsedSourceSummary(document: DocumentParserAuditSource) {
  return extractDocumentParsedAttachmentSources(document)
    .map((source) =>
      source.sourceLabel
        ? `${source.sourceLabel}: ${source.fileName}`
        : `텍스트 파싱: ${source.fileName}`,
    )
    .join(" · ");
}

function formatClinicalSignalSummary(document: DocumentParserAuditSource) {
  const clinicalSignals = getClinicalSignalLabels(detectDocumentKnowledgeSignals(document));
  return clinicalSignals.length ? clinicalSignals.join(" · ") : "임상 단서 없음";
}

export function buildDocumentParserAudit(
  documents: readonly DocumentParserAuditSource[],
): DocumentParserAudit {
  const items = documents
    .map((document, index) => {
      const parsedSources = extractDocumentParsedAttachmentSources(document);
      if (!parsedSources.length) return null;

      const documentLabel =
        document.title?.trim() || document.attachmentName?.trim() || "저장된 서류";
      const dateLabel = document.date?.trim() || "날짜 없음";
      const sourceSummary = formatParsedSourceSummary(document);
      const clinicalSignalSummary = formatClinicalSignalSummary(document);
      const hasDesktopParser = parsedSources.some((source) =>
        source.sourceLabel?.includes("데스크톱"),
      );

      return {
        clinicalSignalSummary,
        dateLabel,
        documentId: document.id ?? `${dateLabel}-${documentLabel}-${index}`,
        documentLabel,
        hasDesktopParser,
        sourceSummary,
      };
    })
    .filter((item): item is DocumentParserAuditItem => Boolean(item));
  const parsedDocumentCount = items.length;
  const desktopParserDocumentCount = items.filter((item) => item.hasDesktopParser).length;
  const parsedWithClinicalSignalCount = items.filter(
    (item) => item.clinicalSignalSummary !== "임상 단서 없음",
  ).length;
  const summary = parsedDocumentCount
    ? `파싱 문서 ${parsedDocumentCount}개 · 데스크톱 파서 ${desktopParserDocumentCount}개 · 임상 단서 ${parsedWithClinicalSignalCount}개`
    : "파싱 문서 없음";

  return {
    ariaLabel: summary,
    desktopParserDocumentCount,
    items,
    parsedDocumentCount,
    parsedWithClinicalSignalCount,
    summary,
  };
}
