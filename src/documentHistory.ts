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
