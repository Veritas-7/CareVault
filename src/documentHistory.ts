export type DocumentHistoryKind =
  | "created"
  | "review-status"
  | "next-action"
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
  return [...(history ?? []), entry].slice(-maxItems);
}
