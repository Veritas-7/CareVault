import { describe, expect, it } from "vitest";
import { appendDocumentHistory, type DocumentHistoryEntry } from "./documentHistory";

const entry = (id: string): DocumentHistoryEntry => ({
  id,
  at: `2026-06-03T00:00:0${id}.000Z`,
  kind: "next-action",
  label: "다음 조치 변경",
  detail: `조치 ${id}`,
});

describe("documentHistory", () => {
  it("appends a history entry to an empty document history", () => {
    expect(appendDocumentHistory(undefined, entry("1"))).toEqual([entry("1")]);
  });

  it("keeps only the most recent entries when the history is capped", () => {
    const history = ["1", "2", "3"].map(entry);
    expect(appendDocumentHistory(history, entry("4"), 2).map((item) => item.id)).toEqual([
      "3",
      "4",
    ]);
  });

  it("skips consecutive duplicate history entries", () => {
    const history = [entry("1")];
    const duplicate = { ...entry("1"), id: "2" };

    expect(appendDocumentHistory(history, duplicate)).toEqual(history);
  });

  it("keeps repeated details when another history entry appears between them", () => {
    const first = entry("1");
    const middle = { ...entry("2"), detail: "다른 조치" };
    const repeated = { ...entry("3"), detail: first.detail };

    expect(appendDocumentHistory([first, middle], repeated).map((item) => item.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
});
