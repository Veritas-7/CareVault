import {
  type CareDocument,
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

export function formatDocumentActionButtonLabel(
  document: CareDocument,
  kind: DocumentActionLabelKind,
) {
  const documentContext = `${document.title} ${documentLabel[document.category]} 서류`;
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
    "preview-attachment": `${documentContext} 이미지 첨부 미리보기 · ${attachmentContext}`,
    "open-attachment": `${documentContext} 첨부 파일 열기 · ${attachmentContext}`,
    "remove-attachment": `${documentContext} 첨부 연결 제거 · ${attachmentContext}`,
    "archive-document": `${documentContext} 삭제 보관함으로 이동 · ${reviewContext}`,
    "restore-document": `${documentContext} 삭제 보관함에서 복구 · ${reviewContext}`,
    "clean-deleted-attachment": `${documentContext} 삭제 보관함 첨부 연결 정리 · ${attachmentContext}`,
  };

  return actionLabel[kind];
}
