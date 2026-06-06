import {
  type CareDocument,
  type DocumentReviewStatus,
  documentLabel,
  documentReviewStatusLabel,
} from "./appState";

export type DocumentActionLabelKind =
  | "add-attachment"
  | "replace-attachment"
  | "check-attachment"
  | "preview-attachment"
  | "open-attachment"
  | "remove-attachment"
  | "archive-document"
  | "restore-document"
  | "clean-deleted-attachment";

function formatDocumentContext(document: CareDocument) {
  const title = document.title.trim() || "제목 없는 서류";
  return `${title} ${documentLabel[document.category]} 서류`;
}

export function formatDocumentSavedStatusLabel(document: CareDocument) {
  const reviewContext = `상태 ${documentReviewStatusLabel[document.reviewStatus]}`;
  const attachmentContext = document.attachmentName?.trim()
    ? `첨부 파일 ${document.attachmentName.trim()}`
    : "첨부 없음";

  return `${formatDocumentContext(document)} 저장됨 · ${reviewContext} · ${attachmentContext}`;
}

export function formatDocumentReviewStatusUpdatedLabel(
  document: CareDocument,
  reviewStatus: DocumentReviewStatus,
) {
  return `${formatDocumentContext(document)} 상태 ${documentReviewStatusLabel[reviewStatus]}로 업데이트됨`;
}

function formatDocumentNextActionPreview(nextAction: string) {
  const normalized = nextAction.trim().replace(/\s+/g, " ");
  if (!normalized) return "다음 조치 비움";
  return normalized.length > 32 ? `${normalized.slice(0, 32).trimEnd()}...` : normalized;
}

export function formatDocumentNextActionHistoryStatusLabel(
  document: CareDocument,
  nextAction: string,
) {
  return `${formatDocumentContext(document)} 다음 조치 이력 기록됨 · ${formatDocumentNextActionPreview(nextAction)}`;
}

export function formatDocumentArchiveStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 삭제 보관함으로 이동됨 · 상태 ${
    documentReviewStatusLabel[document.reviewStatus]
  }`;
}

export function formatDocumentRestoreStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 저장된 서류로 복구됨 · 상태 ${
    documentReviewStatusLabel[document.reviewStatus]
  }`;
}

function formatRemovedAttachmentContext(document: CareDocument) {
  return document.attachmentName?.trim()
    ? `제거한 첨부 ${document.attachmentName.trim()}`
    : "제거한 첨부 파일명 미확인";
}

function formatAttachmentFileName(attachmentName: string | undefined) {
  return attachmentName?.trim() || "첨부 파일명 미확인";
}

function formatAttachmentStatusContext(attachmentStatus: string | undefined) {
  return attachmentStatus?.trim() ? ` · 첨부 상태 ${attachmentStatus.trim()}` : "";
}

function formatCurrentAttachmentContext(document: CareDocument) {
  return `현재 첨부 ${formatAttachmentFileName(document.attachmentName)}${formatAttachmentStatusContext(
    document.attachmentStatus,
  )}`;
}

export function formatDocumentAttachmentRemovedStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 첨부 제거됨 · ${formatRemovedAttachmentContext(document)}`;
}

export function formatDeletedDocumentAttachmentCleanedStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 삭제 보관함 첨부 정리됨 · ${formatRemovedAttachmentContext(document)}`;
}

export function formatDocumentAttachmentReferenceStatusLabel(
  document: CareDocument,
  attachmentName: string | undefined,
) {
  return `${formatDocumentContext(document)} 첨부 파일명 참조 갱신됨 · 현재 첨부 ${formatAttachmentFileName(attachmentName)}`;
}

export function formatDocumentAttachmentReconnectStatusLabel(
  document: CareDocument,
  attachmentName: string | undefined,
  attachmentStatus?: string,
) {
  return `${formatDocumentContext(document)} 첨부 재연결됨 · 현재 첨부 ${formatAttachmentFileName(
    attachmentName,
  )}${formatAttachmentStatusContext(attachmentStatus)}`;
}

export function formatDocumentAttachmentPathUpdatedStatusLabel(
  document: CareDocument,
  attachmentName: string | undefined,
  attachmentStatus?: string,
) {
  return `${formatDocumentContext(document)} 첨부 경로 갱신됨 · 현재 첨부 ${formatAttachmentFileName(
    attachmentName,
  )}${formatAttachmentStatusContext(attachmentStatus)}`;
}

export function formatDocumentDraftAttachmentReadyStatusLabel(
  attachmentName: string | undefined,
  attachmentStatus?: string,
) {
  return `서류 첨부 준비됨 · 현재 첨부 ${formatAttachmentFileName(
    attachmentName,
  )}${formatAttachmentStatusContext(attachmentStatus)}`;
}

export function formatDocumentDraftAttachmentReferenceReadyStatusLabel(
  attachmentName: string | undefined,
) {
  return `서류 첨부 파일명 참조 준비됨 · 현재 첨부 ${formatAttachmentFileName(
    attachmentName,
  )} · 첨부 상태 브라우저 파일명 참조`;
}

export function formatDocumentDraftAddActionLabel(
  draft: Pick<CareDocument, "title" | "body">,
  hasRequiredFields: boolean,
) {
  const title = draft.title.trim();
  const body = draft.body.trim();
  if (!hasRequiredFields || !title || !body) return "서류 메모 저장 · 제목과 내용 필요";

  return `서류 메모 저장 · ${title} 입력 준비됨`;
}

export function formatDocumentAttachmentFileNameOnlyStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 첨부는 파일명 참조만 저장됨 · 현재 첨부 ${formatAttachmentFileName(
    document.attachmentName,
  )}`;
}

export function formatDocumentAttachmentCheckedStatusLabel(
  document: CareDocument,
  attachmentStatus: string,
) {
  const status = attachmentStatus.trim() || "첨부 상태 미확인";
  return `${formatDocumentContext(document)} 첨부 확인됨 · 현재 첨부 ${formatAttachmentFileName(
    document.attachmentName,
  )} · 첨부 상태 ${status}`;
}

export function formatDocumentAttachmentReconnectFailedStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 첨부 재연결 실패 · ${formatCurrentAttachmentContext(document)}`;
}

export function formatDocumentAttachmentPreviewUnavailableStatusLabel(
  document: CareDocument,
  reason: string,
) {
  const reasonText = reason.trim() || "이유 미확인";
  return `${formatDocumentContext(document)} 이미지 미리보기 불가 · ${formatCurrentAttachmentContext(
    document,
  )} · 이유 ${reasonText}`;
}

export function formatDocumentAttachmentPreviewOpenedStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 이미지 미리보기 열림 · ${formatCurrentAttachmentContext(
    document,
  )}`;
}

export function formatDocumentAttachmentPreviewClosedStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 이미지 미리보기 닫힘 · ${formatCurrentAttachmentContext(
    document,
  )}`;
}

export function formatDocumentAttachmentPreviewActionLabel(
  document: CareDocument,
  canPreview: boolean,
  unavailableReason?: string,
) {
  if (canPreview) {
    return `${formatDocumentContext(document)} 이미지 첨부 미리보기 · ${formatCurrentAttachmentContext(
      document,
    )}`;
  }

  const reason = unavailableReason?.trim() || "이유 미확인";
  return `${formatDocumentContext(document)} 이미지 첨부 미리보기 불가 · ${formatCurrentAttachmentContext(
    document,
  )} · 이유 ${reason}`;
}

export function formatDocumentAttachmentRemovalFailedStatusLabel(document: CareDocument) {
  return `${formatDocumentContext(document)} 첨부 파일 삭제 실패 · ${formatCurrentAttachmentContext(
    document,
  )}`;
}

export function formatDocumentActionButtonLabel(
  document: CareDocument,
  kind: DocumentActionLabelKind,
) {
  const documentContext = formatDocumentContext(document);
  const reviewContext = `상태 ${documentReviewStatusLabel[document.reviewStatus]}`;
  const attachmentContext = document.attachmentName
    ? `현재 첨부 ${document.attachmentName}`
    : "현재 첨부 없음";
  const attachmentStatusContext = document.attachmentStatus
    ? `첨부 상태 ${document.attachmentStatus}`
    : "첨부 상태 미확인";

  const actionLabel: Record<DocumentActionLabelKind, string> = {
    "add-attachment": `${documentContext} 첨부 추가 · ${reviewContext}`,
    "replace-attachment": `${documentContext} 첨부 재연결 · ${attachmentContext} · ${reviewContext}`,
    "check-attachment": `${documentContext} 첨부 확인 · ${attachmentContext} · ${attachmentStatusContext}`,
    "preview-attachment": formatDocumentAttachmentPreviewActionLabel(document, true),
    "open-attachment": `${documentContext} 첨부 파일 열기 · ${attachmentContext}`,
    "remove-attachment": `${documentContext} 첨부 연결 제거 · ${attachmentContext}`,
    "archive-document": `${documentContext} 삭제 보관함으로 이동 · ${reviewContext}`,
    "restore-document": `${documentContext} 삭제 보관함에서 복구 · ${reviewContext}`,
    "clean-deleted-attachment": `${documentContext} 삭제 보관함 첨부 연결 정리 · ${attachmentContext}`,
  };

  return actionLabel[kind];
}
