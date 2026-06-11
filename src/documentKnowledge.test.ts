import { describe, expect, it } from "vitest";
import {
  buildDocumentCareQuestionDraft,
  buildDocumentKnowledgeSummary,
  buildDocumentKnowledgeSearchText,
  buildDocumentKnowledgeSnippet,
  detectDocumentKnowledgeSignals,
} from "./documentKnowledge";

const pathologyDocument = {
  attachmentName: "상급병원_병리결과.hwpx",
  body: "자궁경부 편평상피세포암 병리결과: 절제연 음성. HbA1c 7.2%, 혈압 142/88 기록도 함께 확인 필요.",
  category: "pathology",
  date: "2026-06-11",
  nextAction: "",
  reviewStatus: "needs-review",
  tags: "자궁경부암,당뇨,고혈압",
  title: "자궁경부암 병리결과",
} as const;

describe("documentKnowledge", () => {
  it("detects cervical-cancer, hypertension, diabetes, and HWP/HWPX document signals", () => {
    expect(detectDocumentKnowledgeSignals(pathologyDocument).map((signal) => signal.id)).toEqual([
      "cervical-cancer",
      "hypertension",
      "diabetes",
      "hwp-document",
    ]);
  });

  it("builds searchable knowledge text beyond the visible document fields", () => {
    const searchText = buildDocumentKnowledgeSearchText(pathologyDocument);

    expect(searchText).toContain("자궁경부암");
    expect(searchText).toContain("고혈압");
    expect(searchText).toContain("당뇨");
    expect(searchText).toContain("한글 문서");
    expect(searchText).toContain("HWP/HWPX");
    expect(searchText).toContain("문서 파싱");
  });

  it("builds a compact local-RAG style summary for saved document cards", () => {
    expect(buildDocumentKnowledgeSummary(pathologyDocument)).toBe(
      "문서 단서: 자궁경부암 · 고혈압 · 당뇨 · HWP/HWPX",
    );
  });

  it("builds a safe care-team question draft from parsed document signals", () => {
    const draft = buildDocumentCareQuestionDraft(pathologyDocument);

    expect(draft).toContain("자궁경부암 병리결과");
    expect(draft).toContain("자궁경부암, 고혈압, 당뇨");
    expect(draft).toContain("담당 의료진에게 확인");
    expect(draft).toContain("원문 메모");
    expect(draft).not.toMatch(/진단한다|처방|복용하세요|치료하세요|완치|괜찮습니다|기다려도 됩니다/);
  });

  it("builds a search snippet that preserves source text without local paths", () => {
    const snippet = buildDocumentKnowledgeSnippet(
      {
        ...pathologyDocument,
        attachmentPath: "/Users/wj/private/상급병원_병리결과.hwpx",
      },
      "절제연",
    );

    expect(snippet).toContain("절제연 음성");
    expect(snippet).toContain("문서 단서: 자궁경부암 · 고혈압 · 당뇨 · HWP/HWPX");
    expect(snippet).not.toContain("/Users/wj/private");
  });
});
