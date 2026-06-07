import { describe, expect, it } from "vitest";
import type { CareQuestion } from "./appState";
import { mergeGeneratedQuestionDraft } from "./questionDraftMerge";

const emptyDraft: CareQuestion = {
  answer: "",
  date: "2026-06-07",
  id: "",
  priority: "next-visit",
  question: "",
  status: "open",
  topic: "",
};

const generatedDraft = {
  date: "2026-06-15",
  priority: "high" as const,
  question: "새 근거 기반 질문입니다.\n출처: 공식 근거 - https://example.org/source",
  status: "open" as const,
  topic: "새 질문",
};

describe("mergeGeneratedQuestionDraft", () => {
  it("fills an empty editable question draft with generated fields", () => {
    expect(mergeGeneratedQuestionDraft(emptyDraft, generatedDraft)).toEqual({
      ...emptyDraft,
      ...generatedDraft,
    });
  });

  it("appends generated text without overwriting an in-progress draft", () => {
    const current: CareQuestion = {
      ...emptyDraft,
      answer: "진료 후 답변 메모",
      date: "2026-06-09",
      priority: "routine",
      question: "이미 작성 중인 질문입니다.",
      topic: "기존 질문 주제",
    };

    expect(mergeGeneratedQuestionDraft(current, generatedDraft)).toEqual({
      ...current,
      question: `${current.question}\n${generatedDraft.question}`,
      status: "open",
    });
  });

  it("does not append duplicate generated text", () => {
    const current: CareQuestion = {
      ...emptyDraft,
      question: `이미 작성 중인 질문입니다.\n${generatedDraft.question}`,
      topic: "기존 질문 주제",
    };

    expect(mergeGeneratedQuestionDraft(current, generatedDraft).question).toBe(current.question);
  });

  it("uses the generated topic when only the question body is in progress", () => {
    const current: CareQuestion = {
      ...emptyDraft,
      date: "2026-06-09",
      priority: "routine",
      question: "주제 없이 작성 중인 질문입니다.",
    };

    expect(mergeGeneratedQuestionDraft(current, generatedDraft)).toMatchObject({
      date: "2026-06-09",
      priority: "routine",
      topic: "새 질문",
    });
  });
});
