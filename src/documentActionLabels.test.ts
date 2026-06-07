import { describe, expect, it } from "vitest";
import { type CareDocument } from "./appState";
import {
  formatDeletedDocumentAttachmentCleanupCanceledStatusLabel,
  formatDeletedDocumentAttachmentCleanedStatusLabel,
  formatDocumentActionButtonLabel,
  formatDocumentArchiveCanceledStatusLabel,
  formatDocumentArchiveStatusLabel,
  formatDocumentAttachmentFileNameOnlyStatusLabel,
  formatDocumentAttachmentCheckedStatusLabel,
  formatDocumentAttachmentPreviewActionLabel,
  formatDocumentAttachmentPreviewClosedStatusLabel,
  formatDocumentAttachmentPathUpdatedStatusLabel,
  formatDocumentAttachmentPreviewOpenedStatusLabel,
  formatDocumentAttachmentPreviewUnavailableStatusLabel,
  formatDocumentAttachmentReconnectStatusLabel,
  formatDocumentAttachmentReconnectFailedStatusLabel,
  formatDocumentAttachmentReferenceStatusLabel,
  formatDocumentAttachmentRemovedStatusLabel,
  formatDocumentAttachmentRemovalCanceledStatusLabel,
  formatDocumentAttachmentRemovalFailedStatusLabel,
  formatDocumentDraftAddActionLabel,
  formatDocumentDraftAttachmentReadyStatusLabel,
  formatDocumentDraftAttachmentReferenceReadyStatusLabel,
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
    expect(formatDocumentArchiveCanceledStatusLabel(deletedDocument)).toBe(
      "복부 CT 영상 서류 삭제 보관 취소됨 · 상태 정리 완료",
    );
    expect(formatDocumentRestoreStatusLabel(deletedDocument)).toBe(
      "복부 CT 영상 서류 저장된 서류로 복구됨 · 상태 정리 완료",
    );
  });

  it("builds document-specific attachment removal status feedback", () => {
    const documentWithAttachment: CareDocument = {
      ...baseDocument,
      attachmentName: "blood-result.pdf",
      attachmentPath: "/private/path/blood-result.pdf",
    };
    const deletedDocumentWithAttachment: CareDocument = {
      ...documentWithAttachment,
      title: "복부 CT",
      category: "imaging",
      attachmentName: "ct.png",
    };

    expect(formatDocumentAttachmentRemovedStatusLabel(documentWithAttachment)).toBe(
      "혈액검사 메모 검사 서류 첨부 제거됨 · 제거한 첨부 blood-result.pdf",
    );
    expect(formatDeletedDocumentAttachmentCleanedStatusLabel(deletedDocumentWithAttachment)).toBe(
      "복부 CT 영상 서류 삭제 보관함 첨부 정리됨 · 제거한 첨부 ct.png",
    );
    expect(
      formatDeletedDocumentAttachmentCleanupCanceledStatusLabel({
        ...deletedDocumentWithAttachment,
        attachmentStatus: "브라우저 파일명 참조",
      }),
    ).toBe(
      "복부 CT 영상 서류 삭제 보관함 첨부 정리 취소됨 · 현재 첨부 ct.png · 첨부 상태 브라우저 파일명 참조",
    );
    expect(formatDocumentAttachmentRemovedStatusLabel({ ...baseDocument, attachmentName: "  " })).toBe(
      "혈액검사 메모 검사 서류 첨부 제거됨 · 제거한 첨부 파일명 미확인",
    );
  });

  it("builds document-specific attachment removal cancel feedback", () => {
    const documentWithAttachment: CareDocument = {
      ...baseDocument,
      attachmentName: "blood-result.pdf",
      attachmentStatus: "브라우저 파일명 참조",
    };

    expect(formatDocumentAttachmentRemovalCanceledStatusLabel(documentWithAttachment)).toBe(
      "혈액검사 메모 검사 서류 첨부 연결 제거 취소됨 · 현재 첨부 blood-result.pdf · 첨부 상태 브라우저 파일명 참조",
    );
  });

  it("builds document-specific attachment reference and reconnect feedback", () => {
    expect(formatDocumentAttachmentReferenceStatusLabel(baseDocument, "browser-scan.png")).toBe(
      "혈액검사 메모 검사 서류 첨부 파일명 참조 갱신됨 · 현재 첨부 browser-scan.png",
    );
    expect(
      formatDocumentAttachmentReconnectStatusLabel(baseDocument, "blood-result.pdf", "파일 확인됨"),
    ).toBe(
      "혈액검사 메모 검사 서류 첨부 재연결됨 · 현재 첨부 blood-result.pdf · 첨부 상태 파일 확인됨",
    );
    expect(
      formatDocumentAttachmentPathUpdatedStatusLabel(
        baseDocument,
        "result.pdf",
        "앱 샌드박스 경로 저장됨",
      ),
    ).toBe(
      "혈액검사 메모 검사 서류 첨부 경로 갱신됨 · 현재 첨부 result.pdf · 첨부 상태 앱 샌드박스 경로 저장됨",
    );
    expect(formatDocumentAttachmentReferenceStatusLabel(baseDocument, "  ")).toBe(
      "혈액검사 메모 검사 서류 첨부 파일명 참조 갱신됨 · 현재 첨부 첨부 파일명 미확인",
    );
  });

  it("builds draft attachment readiness feedback with filename and status context", () => {
    expect(
      formatDocumentDraftAttachmentReadyStatusLabel("blood-result.pdf", "앱 샌드박스 복사됨"),
    ).toBe("서류 첨부 준비됨 · 현재 첨부 blood-result.pdf · 첨부 상태 앱 샌드박스 복사됨");
    expect(formatDocumentDraftAttachmentReadyStatusLabel("  ")).toBe(
      "서류 첨부 준비됨 · 현재 첨부 첨부 파일명 미확인",
    );
    expect(formatDocumentDraftAttachmentReferenceReadyStatusLabel("browser-scan.png")).toBe(
      "서류 첨부 파일명 참조 준비됨 · 현재 첨부 browser-scan.png · 첨부 상태 브라우저 파일명 참조",
    );
  });

  it("builds document draft add action labels from required-field readiness", () => {
    expect(formatDocumentDraftAddActionLabel(baseDocument, false)).toBe(
      "서류 메모 저장 · 제목과 내용 필요",
    );
    expect(formatDocumentDraftAddActionLabel({ ...baseDocument, title: "  " }, true)).toBe(
      "서류 메모 저장 · 제목과 내용 필요",
    );
    expect(formatDocumentDraftAddActionLabel(baseDocument, true)).toBe(
      "서류 메모 저장 · 혈액검사 메모 입력 준비됨",
    );
  });

  it("builds saved attachment filename-only feedback with document context", () => {
    expect(
      formatDocumentAttachmentFileNameOnlyStatusLabel({
        ...baseDocument,
        attachmentName: "browser-scan.png",
      }),
    ).toBe(
      "혈액검사 메모 검사 서류 첨부는 파일명 참조만 저장됨 · 현재 첨부 browser-scan.png",
    );
    expect(
      formatDocumentAttachmentCheckedStatusLabel(
        { ...baseDocument, attachmentName: "blood-result.pdf" },
        "파일 확인됨",
      ),
    ).toBe(
      "혈액검사 메모 검사 서류 첨부 확인됨 · 현재 첨부 blood-result.pdf · 첨부 상태 파일 확인됨",
    );
  });

  it("builds saved attachment failure and preview feedback with document context", () => {
    const documentWithAttachment: CareDocument = {
      ...baseDocument,
      attachmentName: "blood-result.pdf",
      attachmentStatus: "재첨부 필요",
    };

    expect(formatDocumentAttachmentReconnectFailedStatusLabel(documentWithAttachment)).toBe(
      "혈액검사 메모 검사 서류 첨부 재연결 실패 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요",
    );
    expect(
      formatDocumentAttachmentPreviewUnavailableStatusLabel(
        documentWithAttachment,
        "이미지 첨부 아님",
      ),
    ).toBe(
      "혈액검사 메모 검사 서류 이미지 미리보기 불가 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요 · 이유 이미지 첨부 아님",
    );
    expect(formatDocumentAttachmentPreviewOpenedStatusLabel(documentWithAttachment)).toBe(
      "혈액검사 메모 검사 서류 이미지 미리보기 열림 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요",
    );
    expect(formatDocumentAttachmentPreviewClosedStatusLabel(documentWithAttachment)).toBe(
      "혈액검사 메모 검사 서류 이미지 미리보기 닫힘 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요",
    );
    expect(formatDocumentAttachmentPreviewActionLabel(documentWithAttachment, true)).toBe(
      "혈액검사 메모 검사 서류 이미지 첨부 미리보기 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요",
    );
    expect(
      formatDocumentAttachmentPreviewActionLabel(
        { ...documentWithAttachment, attachmentName: "icon.png", attachmentStatus: "브라우저 파일명 참조" },
        false,
        "저장된 경로 또는 데스크톱 런타임 필요",
      ),
    ).toBe(
      "혈액검사 메모 검사 서류 이미지 첨부 미리보기 불가 · 현재 첨부 icon.png · 첨부 상태 브라우저 파일명 참조 · 이유 저장된 경로 또는 데스크톱 런타임 필요",
    );
    expect(formatDocumentAttachmentRemovalFailedStatusLabel(documentWithAttachment)).toBe(
      "혈액검사 메모 검사 서류 첨부 파일 삭제 실패 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요",
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
    expect(formatDocumentActionButtonLabel(documentWithAttachment, "preview-attachment")).toBe(
      "혈액검사 메모 검사 서류 이미지 첨부 미리보기 · 현재 첨부 blood-result.pdf · 첨부 상태 재첨부 필요",
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
