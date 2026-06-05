import { describe, expect, it } from "vitest";
import { type CareDocument } from "./appState";
import {
  formatDocumentActionButtonLabel,
  formatDocumentArchiveStatusLabel,
  formatDocumentNextActionHistoryStatusLabel,
  formatDocumentReviewStatusUpdatedLabel,
  formatDocumentRestoreStatusLabel,
  formatDocumentSavedStatusLabel,
} from "./documentActionLabels";

const baseDocument: CareDocument = {
  id: "doc-1",
  date: "2026-06-05",
  title: "혈액검사 메모",
  category: "lab",
  body: "WBC 추적",
  tags: "혈액검사",
  reviewStatus: "care-question",
  nextAction: "진료 때 질문",
};

describe("documentActionLabels", () => {
  it("builds document-specific saved status feedback without an attachment", () => {
    expect(formatDocumentSavedStatusLabel(baseDocument)).toBe(
      "혈액검사 메모 검사 서류 저장됨 · 상태 의료진 질문 · 첨부 없음",
    );
  });

  it("includes the attachment filename in document saved status feedback", () => {
    const documentWithAttachment: CareDocument = {
      ...baseDocument,
      attachmentName: "blood-result.pdf",
      attachmentPath: "/private/path/blood-result.pdf",
      attachmentStorage: "tauri-sandbox",
    };

    expect(formatDocumentSavedStatusLabel(documentWithAttachment)).toBe(
      "혈액검사 메모 검사 서류 저장됨 · 상태 의료진 질문 · 첨부 파일 blood-result.pdf",
    );
  });

  it("uses a stable saved status fallback when a title is missing", () => {
    expect(formatDocumentSavedStatusLabel({ ...baseDocument, title: "   " })).toBe(
      "제목 없는 서류 검사 서류 저장됨 · 상태 의료진 질문 · 첨부 없음",
    );
  });

  it("builds document-specific review status update feedback", () => {
    expect(formatDocumentReviewStatusUpdatedLabel(baseDocument, "done")).toBe(
      "혈액검사 메모 검사 서류 상태 정리 완료로 업데이트됨",
    );
  });

  it("builds document-specific next-action history feedback", () => {
    expect(
      formatDocumentNextActionHistoryStatusLabel(
        baseDocument,
        "다음 종양내과 방문 때 WBC 추적 질문",
      ),
    ).toBe("혈액검사 메모 검사 서류 다음 조치 이력 기록됨 · 다음 종양내과 방문 때 WBC 추적 질문");
  });

  it("summarizes long or empty next-action history feedback", () => {
    expect(
      formatDocumentNextActionHistoryStatusLabel(
        baseDocument,
        "다음 방문 때 검사 결과 원본과 이전 수치 변화 그래프를 함께 보여주고 추가 확인할 질문 준비",
      ),
    ).toBe(
      "혈액검사 메모 검사 서류 다음 조치 이력 기록됨 · 다음 방문 때 검사 결과 원본과 이전 수치 변화 그래프를...",
    );
    expect(formatDocumentNextActionHistoryStatusLabel(baseDocument, "  ")).toBe(
      "혈액검사 메모 검사 서류 다음 조치 이력 기록됨 · 다음 조치 비움",
    );
  });

  it("builds document-specific archive and restore status feedback", () => {
    const deletedDocument: CareDocument = {
      ...baseDocument,
      title: "복부 CT",
      category: "imaging",
      reviewStatus: "done",
    };

    expect(formatDocumentArchiveStatusLabel(deletedDocument)).toBe(
      "복부 CT 영상 서류 삭제 보관함으로 이동됨 · 상태 정리 완료",
    );
    expect(formatDocumentRestoreStatusLabel(deletedDocument)).toBe(
      "복부 CT 영상 서류 저장된 서류로 복구됨 · 상태 정리 완료",
    );
  });

  it("builds document-specific add and archive labels when no attachment exists", () => {
    expect(formatDocumentActionButtonLabel(baseDocument, "add-attachment")).toBe(
      "혈액검사 메모 검사 서류 첨부 추가 · 상태 의료진 질문",
    );
    expect(formatDocumentActionButtonLabel(baseDocument, "archive-document")).toBe(
      "혈액검사 메모 검사 서류 삭제 보관함으로 이동 · 상태 의료진 질문",
    );
  });

  it("includes attachment name and status for saved attachment actions", () => {
    const documentWithAttachment: CareDocument = {
      ...baseDocument,
      attachmentName: "blood-result.pdf",
      attachmentPath: "/private/path/blood-result.pdf",
      attachmentStatus: "재첨부 필요",
    };

    expect(formatDocumentActionButtonLabel(documentWithAttachment, "replace-attachment")).toBe(
      "혈액검사 메모 검사 서류 첨부 재연결 · 현재 첨부 blood-result.pdf · 상태 의료진 질문",
    );
    expect(formatDocumentActionButtonLabel(documentWithAttachment, "check-attachment")).toBe(
      "혈액검사 메모 검사 서류 첨부 확인 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요",
    );
    expect(formatDocumentActionButtonLabel(documentWithAttachment, "open-attachment")).toBe(
      "혈액검사 메모 검사 서류 첨부 파일 열기 · 현재 첨부 blood-result.pdf",
    );
    expect(formatDocumentActionButtonLabel(documentWithAttachment, "remove-attachment")).toBe(
      "혈액검사 메모 검사 서류 첨부 연결 제거 · 현재 첨부 blood-result.pdf",
    );
  });

  it("keeps deleted-document actions scoped to restore or cleanup intent", () => {
    const deletedDocument: CareDocument = {
      ...baseDocument,
      title: "복부 CT",
      category: "imaging",
      reviewStatus: "done",
      attachmentName: "ct.png",
    };

    expect(formatDocumentActionButtonLabel(deletedDocument, "restore-document")).toBe(
      "복부 CT 영상 서류 삭제 보관함에서 복구 · 상태 정리 완료",
    );
    expect(formatDocumentActionButtonLabel(deletedDocument, "clean-deleted-attachment")).toBe(
      "복부 CT 영상 서류 삭제 보관함 첨부 연결 정리 · 현재 첨부 ct.png",
    );
  });
});
