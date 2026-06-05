import { describe, expect, it } from "vitest";
import {
  documentFilterResetStatusLabel,
  formatDocumentFilterResetActionLabel,
} from "./documentFilterActions";

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
  });
});
