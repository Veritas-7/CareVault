import { describe, expect, it } from "vitest";
import { buildDocumentParserAudit } from "./documentParserAudit";

describe("documentParserAudit", () => {
  it("summarizes parsed document sources and clinical signal coverage without local paths", () => {
    const audit = buildDocumentParserAudit([
      {
        attachmentName: "상급병원_병리결과.hwp",
        attachmentPath: "/Users/wj/private/상급병원_병리결과.hwp",
        body:
          "[첨부 텍스트 파싱: 상급병원_병리결과.hwp · HWP/HWPX 데스크톱 파서]\n" +
          "자궁경부암 병리 결과: 절제연 음성. 혈압 142/88, HbA1c 7.2%.",
        date: "2026-06-11",
        id: "pathology-hwp",
        reviewStatus: "needs-review",
        title: "병리결과",
      },
      {
        attachmentName: "blood.csv",
        body: "[첨부 텍스트 파싱: blood.csv · 텍스트 파일]\n검사 결과 원본 대조 필요.",
        date: "2026-06-10",
        id: "blood-csv",
        reviewStatus: "care-question",
        title: "혈액검사 원본",
      },
      {
        attachmentName: "old.pdf",
        body: "스캔 PDF 파일명만 보관됨.",
        date: "2026-06-01",
        id: "old-pdf",
        title: "예전 스캔",
      },
    ]);

    expect(audit).toEqual({
      ariaLabel: "파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
      desktopParserDocumentCount: 1,
      items: [
        {
          clinicalSignalSummary: "자궁경부암 · 고혈압 · 당뇨",
          dateLabel: "2026-06-11",
          documentId: "pathology-hwp",
          documentLabel: "병리결과",
          hasDesktopParser: true,
          sourceSummary: "HWP/HWPX 데스크톱 파서: 상급병원_병리결과.hwp",
        },
        {
          clinicalSignalSummary: "검사결과",
          dateLabel: "2026-06-10",
          documentId: "blood-csv",
          documentLabel: "혈액검사 원본",
          hasDesktopParser: false,
          sourceSummary: "텍스트 파일: blood.csv",
        },
      ],
      parsedDocumentCount: 2,
      parsedWithClinicalSignalCount: 2,
      summary: "파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
    });
    expect(JSON.stringify(audit)).not.toContain("/Users/wj/private");
  });

  it("returns a stable empty audit when no parsed attachment body blocks exist", () => {
    expect(
      buildDocumentParserAudit([
        {
          attachmentName: "scan.pdf",
          body: "병리 결과지 PDF를 보관함.",
          date: "2026-06-01",
          title: "스캔 문서",
        },
      ]),
    ).toEqual({
      ariaLabel: "파싱 문서 없음",
      desktopParserDocumentCount: 0,
      items: [],
      parsedDocumentCount: 0,
      parsedWithClinicalSignalCount: 0,
      summary: "파싱 문서 없음",
    });
  });
});
