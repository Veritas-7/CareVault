import { describe, expect, it } from "vitest";
import {
  appendDocumentHistory,
  flushPendingDocumentNextActionHistories,
  hasDocumentNextActionChanged,
  type DocumentHistoryEntry,
} from "./documentHistory";

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

  it("detects meaningful next-action changes after trimming whitespace", () => {
    expect(hasDocumentNextActionChanged(" 다음 진료 질문 ", "다음 진료 질문")).toBe(false);
    expect(hasDocumentNextActionChanged("다음 진료 질문", "검사 결과 확인")).toBe(true);
    expect(hasDocumentNextActionChanged("다음 진료 질문", "  ")).toBe(true);
  });

  it("flushes pending next-action histories for changed documents only", () => {
    const documents = [
      { id: "doc-1", nextAction: "검사 결과 확인", history: [entry("1")] },
      { id: "doc-2", nextAction: " 기존 질문 ", history: [entry("2")] },
      { id: "doc-3", nextAction: "새 질문", history: [entry("3")] },
    ];

    const result = flushPendingDocumentNextActionHistories(
      documents,
      {
        "doc-1": "다음 진료 질문",
        "doc-2": "기존 질문",
        "missing-doc": "삭제된 서류",
      },
      (document) => ({
        ...entry(`${document.id}-next-action`),
        detail: document.nextAction.trim() || "다음 조치 비움",
      }),
    );

    expect(result.baselines).toEqual({ "missing-doc": "삭제된 서류" });
    expect(result.changedDocuments.map((document) => document.id)).toEqual(["doc-1"]);
    expect(result.documents[0].history.map((item) => item.detail)).toEqual([
      "조치 1",
      "검사 결과 확인",
    ]);
    expect(result.documents[1].history).toEqual(documents[1].history);
    expect(result.documents[2]).toBe(documents[2]);
  });
});
