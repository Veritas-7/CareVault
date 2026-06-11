import { describe, expect, it } from "vitest";
import {
  buildDocumentCareQuestionDraft,
  buildDocumentCareMeasurementSummary,
  buildDocumentKnowledgeSummary,
  buildDocumentKnowledgeSearchText,
  buildDocumentKnowledgeSnippet,
  buildDocumentParserProvenanceSummary,
  detectDocumentKnowledgeSignals,
  extractDocumentCareMeasurementCues,
  extractDocumentParsedAttachmentSources,
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

const parsedHwpDocument = {
  ...pathologyDocument,
  attachmentName: "상급병원_병리결과.hwp",
  body:
    "기존 메모\n\n" +
    "[첨부 텍스트 파싱: 상급병원_병리결과.hwp · HWP/HWPX 데스크톱 파서]\n" +
    "자궁경부암 병리 결과: 절제연 음성. HbA1c 7.2%, 혈압 142/88.",
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
    expect(searchText).toContain("CIN2");
    expect(searchText).toContain("HSIL");
    expect(searchText).toContain("고혈압");
    expect(searchText).toContain("혈압약");
    expect(searchText).toContain("당뇨");
    expect(searchText).toContain("당화혈색소");
    expect(searchText).toContain("한글 문서");
    expect(searchText).toContain("HWP/HWPX");
    expect(searchText).toContain("문서 파싱");
  });

  it("extracts parsed attachment provenance for visible cards and search", () => {
    expect(extractDocumentParsedAttachmentSources(parsedHwpDocument)).toEqual([
      {
        fileName: "상급병원_병리결과.hwp",
        sourceLabel: "HWP/HWPX 데스크톱 파서",
      },
    ]);
    expect(buildDocumentParserProvenanceSummary(parsedHwpDocument)).toBe(
      "파싱 원천: HWP/HWPX 데스크톱 파서: 상급병원_병리결과.hwp",
    );

    const searchText = buildDocumentKnowledgeSearchText(parsedHwpDocument);
    expect(searchText).toContain("파싱 원천");
    expect(searchText).toContain("HWP/HWPX 데스크톱 파서");
    expect(searchText).toContain("데스크톱 파서");
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

  it("uses a focused parsed-document excerpt in care-team question drafts", () => {
    const draft = buildDocumentCareQuestionDraft({
      ...parsedHwpDocument,
      attachmentPath: "/Users/wj/private/상급병원_병리결과.hwp",
      body: [
        `${"관련 없는 접수 메모 ".repeat(30)}진료 전 확인 예정.`,
        "",
        "[첨부 텍스트 파싱: 상급병원_병리결과.hwp · HWP/HWPX 데스크톱 파서]",
        "자궁경부암 병리 결과: 절제연 음성. HbA1c 7.2%, 혈압 142/88. 혈압약과 혈당 관리 연결 질문.",
      ].join("\n"),
    });

    expect(draft).toContain("HbA1c 7.2%");
    expect(draft).toContain("혈압 142/88");
    expect(draft).toContain("문서 측정 단서(원문): 혈압 142/88 mmHg · HbA1c 7.2%");
    expect(draft).toContain("수치 해석, 반복 측정 시점, 약·식사·치료 영향은 진료팀 기준으로 확인합니다.");
    expect(draft).toContain("파싱 원천: HWP/HWPX 데스크톱 파서: 상급병원_병리결과.hwp");
    expect(draft).not.toContain("[첨부 텍스트 파싱:");
    expect(draft).not.toContain("관련 없는 접수 메모 ".repeat(10).trim());
    expect(draft).not.toContain("/Users/wj/private");
  });

  it("extracts source-grounded document care measurements without interpreting them", () => {
    const document = {
      ...parsedHwpDocument,
      body:
        "원본 경로 /Users/wj/private/follow.hwpx\n" +
        "[첨부 텍스트 파싱: follow.hwpx · HWPX 본문 XML]\n" +
        "혈압 149/93, HbA1c 7.4%, 공복혈당 132 mg/dL. BP 149/93.",
    };

    expect(extractDocumentCareMeasurementCues(document)).toEqual([
      {
        kind: "blood-pressure",
        text: "혈압 149/93 mmHg",
      },
      {
        kind: "hba1c",
        text: "HbA1c 7.4%",
      },
      {
        kind: "glucose",
        text: "혈당 132 mg/dL",
      },
    ]);

    const summary = buildDocumentCareMeasurementSummary(document);
    expect(summary).toBe(
      "문서 측정 단서(원문): 혈압 149/93 mmHg · HbA1c 7.4% · 혈당 132 mg/dL. 수치 해석, 반복 측정 시점, 약·식사·치료 영향은 진료팀 기준으로 확인합니다.",
    );
    expect(summary).not.toContain("진단");
    expect(summary).not.toContain("처방");
    expect(summary).not.toContain("치료하세요");
    expect(summary).not.toContain("/Users/wj/private");
  });

  it("detects parsed lab-result documents and extracts lab measurement cues as original context", () => {
    const document = {
      attachmentName: "blood-panel.hwpx",
      body:
        "로컬 원본 /Users/wj/private/blood-panel.hwpx\n" +
        "[첨부 텍스트 파싱: blood-panel.hwpx · HWPX 본문 XML]\n" +
        "CBC WBC 3.2 10^3/uL, ANC 1.1 10^3/uL, PLT 118 10^3/uL. Cr 1.4 mg/dL, eGFR 52 mL/min/1.73m2.",
      category: "lab",
      date: "2026-06-12",
      nextAction: "",
      reviewStatus: "care-question",
      tags: "혈액검사 신장기능",
      title: "혈액·신장 기능 검사",
    } as const;

    expect(detectDocumentKnowledgeSignals(document).map((signal) => signal.id)).toEqual([
      "lab-result",
      "hwp-document",
    ]);

    const searchText = buildDocumentKnowledgeSearchText(document);
    expect(searchText).toContain("검사결과");
    expect(searchText).toContain("혈액검사");
    expect(searchText).toContain("ANC");
    expect(searchText).toContain("eGFR");

    expect(extractDocumentCareMeasurementCues(document)).toEqual([
      {
        kind: "lab-result",
        text: "WBC 3.2 10^3/uL",
      },
      {
        kind: "lab-result",
        text: "ANC 1.1 10^3/uL",
      },
      {
        kind: "lab-result",
        text: "PLT 118 10^3/uL",
      },
      {
        kind: "lab-result",
        text: "Cr 1.4 mg/dL",
      },
      {
        kind: "lab-result",
        text: "eGFR 52 mL/min/1.73m2",
      },
    ]);

    const draft = buildDocumentCareQuestionDraft(document);
    expect(draft).toContain("검사결과 관련 단서");
    expect(draft).toContain(
      "문서 측정 단서(원문): WBC 3.2 10^3/uL · ANC 1.1 10^3/uL · PLT 118 10^3/uL · Cr 1.4 mg/dL · eGFR 52 mL/min/1.73m2",
    );
    expect(draft).toContain("수치 해석, 반복 측정 시점, 약·식사·치료 영향은 진료팀 기준으로 확인합니다.");
    expect(draft).toContain("파싱 원천: HWPX 본문 XML: blood-panel.hwpx");
    expect(draft).not.toContain("/Users/wj/private");
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

  it("strips local paths from document-derived search snippets", () => {
    const snippet = buildDocumentKnowledgeSnippet(
      {
        ...pathologyDocument,
        body: "환자가 저장한 원본 경로 /Users/wj/private/상급병원_병리결과.hwp 안에 HbA1c 7.2% 기록이 있음.",
        title: "로컬 경로 C:\\Users\\wj\\private\\report.hwp 확인",
      },
      "HbA1c",
    );

    expect(snippet).toContain("[local path]");
    expect(snippet).toContain("HbA1c 7.2%");
    expect(snippet).not.toContain("/Users/wj/private");
    expect(snippet).not.toContain("C:\\Users\\wj");
  });

  it("adds parser provenance to search snippets without local paths", () => {
    const snippet = buildDocumentKnowledgeSnippet(
      {
        ...parsedHwpDocument,
        attachmentPath: "/Users/wj/private/상급병원_병리결과.hwp",
      },
      "데스크톱 파서",
    );

    expect(snippet).toContain("HWP/HWPX 데스크톱 파서");
    expect(snippet).toContain("파싱 원천: HWP/HWPX 데스크톱 파서: 상급병원_병리결과.hwp");
    expect(snippet).not.toContain("/Users/wj/private");
  });
});
