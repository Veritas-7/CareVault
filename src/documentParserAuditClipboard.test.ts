import { describe, expect, it } from "vitest";
import { buildDocumentParserAudit } from "./documentParserAudit";
import {
  formatDocumentParserAuditClipboardDescription,
  formatDocumentParserAuditClipboardFailedStatus,
  formatDocumentParserAuditClipboardStatus,
  formatDocumentParserAuditClipboardText,
  formatDocumentParserAuditClipboardUnsupportedStatus,
  formatDocumentParserAuditDownloadDescription,
  formatDocumentParserAuditDownloadFallbackLabel,
  formatDocumentParserAuditDownloadStatus,
} from "./documentParserAuditClipboard";

const audit = buildDocumentParserAudit([
  {
    attachmentName: "상급병원_병리결과.hwp",
    attachmentPath: "/Users/wj/private/상급병원_병리결과.hwp",
    body:
      "[첨부 텍스트 파싱: 상급병원_병리결과.hwp · HWP/HWPX 데스크톱 파서]\n" +
      "자궁경부암 병리 결과: 절제연 음성. 혈압 142/88, HbA1c 7.2%.",
    date: "2026-06-11",
    id: "pathology-hwp",
    title: "병리결과",
  },
  {
    attachmentName: "blood.csv",
    body: "[첨부 텍스트 파싱: blood.csv · 텍스트 파일]\n검사 결과 원본 대조 필요.",
    date: "2026-06-10",
    id: "blood-csv",
    title: "혈액검사 원본",
  },
]);

describe("documentParserAuditClipboard", () => {
  it("formats a shareable parser audit memo without local attachment paths", () => {
    const text = formatDocumentParserAuditClipboardText(audit);

    expect(text).toContain("[CareVault 문서 파서 점검]");
    expect(text).toContain("진단·처방·치료 지시가 아니라");
    expect(text).toContain("요약: 파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개");
    expect(text).toContain("- 2026-06-11 · 병리결과");
    expect(text).toContain("파싱 원천: HWP/HWPX 데스크톱 파서: 상급병원_병리결과.hwp");
    expect(text).toContain("임상 단서: 자궁경부암 · 고혈압 · 당뇨");
    expect(text).toContain("파싱 원천: 텍스트 파일: blood.csv");
    expect(text).toContain("임상 단서: 검사결과");
    expect(text).not.toContain("/Users/wj/private");
  });

  it("formats stable copy statuses from the parser audit summary", () => {
    expect(formatDocumentParserAuditClipboardDescription(audit)).toBe(
      "문서 파서 점검 복사 · 파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
    );
    expect(formatDocumentParserAuditClipboardStatus(audit)).toBe(
      "문서 파서 점검 복사됨 · 파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
    );
    expect(formatDocumentParserAuditClipboardUnsupportedStatus(audit)).toBe(
      "문서 파서 점검 복사 미지원 · 브라우저 클립보드 없음 · 파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
    );
    expect(formatDocumentParserAuditClipboardFailedStatus(audit)).toBe(
      "문서 파서 점검 복사 실패 · 파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
    );
  });

  it("formats stable download labels from the parser audit summary", () => {
    expect(formatDocumentParserAuditDownloadDescription(audit)).toBe(
      "문서 파서 점검 다운로드 · 파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
    );
    expect(formatDocumentParserAuditDownloadStatus(audit)).toBe(
      "문서 파서 점검 다운로드됨 · 파싱 문서 2개 · 데스크톱 파서 1개 · 임상 단서 2개",
    );
    expect(formatDocumentParserAuditDownloadFallbackLabel()).toBe("문서 파서 점검");
  });

  it("formats an empty parser audit memo", () => {
    const emptyAudit = buildDocumentParserAudit([]);

    expect(formatDocumentParserAuditClipboardText(emptyAudit)).toContain(
      "- 파싱된 첨부 본문이 없습니다.",
    );
    expect(formatDocumentParserAuditClipboardDescription(emptyAudit)).toBe(
      "문서 파서 점검 복사 · 파싱 문서 없음",
    );
  });
});
