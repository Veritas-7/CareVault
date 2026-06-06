export type DocumentHistoryKind =
  | "created"
  | "review-status"
  | "next-action"
  | "attachment-check"
  | "attachment-replaced"
  | "attachment-removed"
  | "archived"
  | "restored";

export type DocumentHistoryEntry = {
  id: string;
  at: string;
  kind: DocumentHistoryKind;
  label: string;
  detail: string;
};

export type PendingDocumentNextActionTarget = {
  id: string;
  nextAction: string;
  history?: DocumentHistoryEntry[];
};

export function appendDocumentHistory(
  history: DocumentHistoryEntry[] | undefined,
  entry: DocumentHistoryEntry,
  maxItems = 8,
) {
  const currentHistory = history ?? [];
  const latestEntry = currentHistory[currentHistory.length - 1];
  if (
    latestEntry?.kind === entry.kind &&
    latestEntry.label === entry.label &&
    latestEntry.detail === entry.detail
  ) {
    return currentHistory.slice(-maxItems);
  }

  return [...currentHistory, entry].slice(-maxItems);
}

export function hasDocumentNextActionChanged(previous: string, next: string) {
  return previous.trim() !== next.trim();
}

export function flushPendingDocumentNextActionHistories<T extends PendingDocumentNextActionTarget>(
  documents: T[],
  baselines: Record<string, string>,
  createEntry: (document: T) => DocumentHistoryEntry,
) {
  if (!Object.keys(baselines).length) {
    return { documents, baselines, changedDocuments: [] as T[] };
  }

  const nextBaselines = { ...baselines };
  const changedDocuments: T[] = [];
  const nextDocuments = documents.map((document) => {
    if (!Object.prototype.hasOwnProperty.call(baselines, document.id)) {
      return document;
    }

    const previous = baselines[document.id] ?? document.nextAction;
    delete nextBaselines[document.id];
    if (!hasDocumentNextActionChanged(previous, document.nextAction)) {
      return document;
    }

    const nextDocument = {
      ...document,
      history: appendDocumentHistory(document.history, createEntry(document)),
    };
    changedDocuments.push(nextDocument);
    return nextDocument;
  });

  return {
    documents: nextDocuments,
    baselines: nextBaselines,
    changedDocuments,
  };
}
