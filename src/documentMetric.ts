import { needsAttachmentRecovery } from "./attachmentRecovery";

type DocumentReviewStatus = "needs-review" | "care-question" | "waiting-result" | "done";

export type DocumentPanelSummarySource = {
  attachmentStatus?: string;
  nextAction?: string;
  reviewStatus: DocumentReviewStatus;
};

export type DocumentPanelSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type DocumentPanelSummary = {
  ariaLabel: string;
  careQuestionCount: number;
  deletedCount: number;
  doneCount: number;
  items: DocumentPanelSummaryItem[];
  needsReviewCount: number;
  openNextActionCount: number;
  recoveryCount: number;
  totalCount: number;
  waitingResultCount: number;
};

export function buildDocumentPanelSummary(
  documents: DocumentPanelSummarySource[],
  deletedDocuments: DocumentPanelSummarySource[],
): DocumentPanelSummary {
  const totalCount = documents.length;
  const needsReviewCount = documents.filter(
    (document) => document.reviewStatus === "needs-review",
  ).length;
  const careQuestionCount = documents.filter(
    (document) => document.reviewStatus === "care-question",
  ).length;
  const waitingResultCount = documents.filter(
    (document) => document.reviewStatus === "waiting-result",
  ).length;
  const doneCount = documents.filter((document) => document.reviewStatus === "done").length;
  const openNextActionCount = documents.filter(
    (document) => document.reviewStatus !== "done" && Boolean(document.nextAction?.trim()),
  ).length;
  const recoveryCount = documents.filter((document) =>
    needsAttachmentRecovery(document.attachmentStatus),
  ).length;
  const deletedCount = deletedDocuments.length;
  const statusItems = [
    needsReviewCount
      ? { id: "needs-review", label: "검토 필요", value: `${needsReviewCount}개` }
      : null,
    careQuestionCount
      ? { id: "care-question", label: "의료진 질문", value: `${careQuestionCount}개` }
      : null,
    waitingResultCount
      ? { id: "waiting-result", label: "결과 대기", value: `${waitingResultCount}개` }
      : null,
    doneCount ? { id: "done", label: "정리 완료", value: `${doneCount}개` } : null,
  ].filter((item): item is DocumentPanelSummaryItem => Boolean(item));
  const items = [
    { id: "total", label: "전체", value: `${totalCount}개` },
    ...(statusItems.length ? statusItems : [{ id: "empty", label: "상태", value: "서류 없음" }]),
    {
      id: "open-next-action",
      label: "열린 조치",
      value: openNextActionCount ? `${openNextActionCount}개` : "없음",
    },
    {
      id: recoveryCount ? "recovery" : "recovery-none",
      label: "첨부 복구",
      value: recoveryCount ? `${recoveryCount}개` : "없음",
    },
    {
      id: deletedCount ? "deleted" : "deleted-none",
      label: "삭제 보관",
      value: deletedCount ? `${deletedCount}개` : "없음",
    },
  ];
  const ariaLabel = items.map((item) => `${item.label} ${item.value}`).join(" · ");

  return {
    ariaLabel,
    careQuestionCount,
    deletedCount,
    doneCount,
    items,
    needsReviewCount,
    openNextActionCount,
    recoveryCount,
    totalCount,
    waitingResultCount,
  };
}
