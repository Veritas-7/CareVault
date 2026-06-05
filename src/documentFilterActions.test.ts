import { describe, expect, it } from "vitest";
import {
  documentFilterResetStatusLabel,
  filterDocumentsBySearchAndReview,
  formatDocumentFilterResetActionLabel,
  formatDocumentFilterResetStatusLabel,
  hasActiveDocumentFilters,
} from "./documentFilterActions";

const categoryLabels = {
  imaging: "영상",
  lab: "검사",
  prescription: "처방",
};

const statusLabels = {
  "care-question": "의료진 질문",
  done: "정리 완료",
  "needs-review": "검토 필요",
};

const documents = [
  {
    attachmentName: "blood-result.pdf",
    attachmentStatus: "재첨부 필요",
    body: "백혈구 수치와 간수치 변화를 다음 진료 때 질문할 것.",
    category: "lab",
    date: "2026-06-01",
    nextAction: "백혈구 제한 기준 질문",
    reviewStatus: "care-question",
    tags: "혈액검사,항암",
    title: "혈액검사 메모",
  },
  {
    body: "CT 결과 설명을 들음.",
    category: "imaging",
    date: "2026-05-20",
    nextAction: "",
    reviewStatus: "done",
    tags: "CT",
    title: "복부 CT",
  },
] as const;

describe("documentFilterActions", () => {
  it("formats the reset action with search, category, and status context", () => {
    expect(
      formatDocumentFilterResetActionLabel({
        categoryLabel: "검사",
        searchText: "  백혈구  ",
        statusLabel: "의료진 질문",
      }),
    ).toBe("저장된 서류 필터 초기화 · 검색어 백혈구 · 분류 검사 · 상태 의료진 질문");
  });

  it("formats a stable fallback when the search text is empty", () => {
    expect(
      formatDocumentFilterResetActionLabel({
        categoryLabel: "전체 분류",
        searchText: "   ",
        statusLabel: "전체 상태",
      }),
    ).toBe("저장된 서류 필터 초기화 · 검색어 없음 · 분류 전체 분류 · 상태 전체 상태");
  });

  it("keeps the reset feedback explicit", () => {
    expect(documentFilterResetStatusLabel).toBe("서류 필터 초기화됨");
    expect(
      formatDocumentFilterResetStatusLabel({
        categoryLabel: "검사",
        searchText: "백혈구",
        statusLabel: "의료진 질문",
      }),
    ).toBe("서류 필터 초기화됨 · 검색어 백혈구 · 분류 검사 · 상태 의료진 질문");
    expect(
      formatDocumentFilterResetStatusLabel({
        categoryLabel: "전체 분류",
        searchText: "",
        statusLabel: "전체 상태",
      }),
    ).toBe("서류 필터 초기화됨 · 검색어 없음 · 분류 전체 분류 · 상태 전체 상태");
  });

  it("filters saved documents by trimmed search text across visible fields", () => {
    const filtered = filterDocumentsBySearchAndReview(documents, {
      categoryFilter: "all",
      categoryLabels,
      searchText: "  백혈구  ",
      statusFilter: "all",
      statusLabels,
    });

    expect(filtered).toEqual([documents[0]]);
  });

  it("matches attachment and review-status text in saved-document search", () => {
    const filtered = filterDocumentsBySearchAndReview(documents, {
      categoryFilter: "all",
      categoryLabels,
      searchText: "재첨부 필요",
      statusFilter: "all",
      statusLabels,
    });

    expect(filtered).toEqual([documents[0]]);
  });

  it("applies category and review-status filters before search", () => {
    const filtered = filterDocumentsBySearchAndReview(documents, {
      categoryFilter: "imaging",
      categoryLabels,
      searchText: "백혈구",
      statusFilter: "done",
      statusLabels,
    });

    expect(filtered).toEqual([]);
  });

  it("detects active document filters from search, category, or status", () => {
    expect(
      hasActiveDocumentFilters({
        categoryFilter: "all",
        searchText: "   ",
        statusFilter: "all",
      }),
    ).toBe(false);
    expect(
      hasActiveDocumentFilters({
        categoryFilter: "lab",
        searchText: "   ",
        statusFilter: "all",
      }),
    ).toBe(true);
    expect(
      hasActiveDocumentFilters({
        categoryFilter: "all",
        searchText: "백혈구",
        statusFilter: "all",
      }),
    ).toBe(true);
    expect(
      hasActiveDocumentFilters({
        categoryFilter: "all",
        searchText: "   ",
        statusFilter: "needs-review",
      }),
    ).toBe(true);
  });
});
