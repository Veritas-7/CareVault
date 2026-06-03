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
});
