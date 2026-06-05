const recoveryStatusTerms = ["파일 없음", "재첨부 필요", "열기 실패", "확인 실패"];

export type AttachmentRecoveryReason =
  | "missing-file"
  | "open-failure"
  | "check-failure"
  | "preview-failure";

export type AttachmentRecoveryUpdate = {
  historyDetail: string;
  historyLabel: string;
  status: string;
};

const attachmentRecoveryUpdates: Record<
  AttachmentRecoveryReason,
  Omit<AttachmentRecoveryUpdate, "historyDetail">
> = {
  "missing-file": {
    historyLabel: "첨부 재첨부 필요",
    status: "파일 없음 - 재첨부 필요",
  },
  "open-failure": {
    historyLabel: "첨부 열기 실패",
    status: "첨부 열기 실패 - 재첨부 필요",
  },
  "check-failure": {
    historyLabel: "첨부 확인 실패",
    status: "첨부 확인 실패",
  },
  "preview-failure": {
    historyLabel: "첨부 미리보기 실패",
    status: "이미지 미리보기 실패 - 재첨부 필요",
  },
};

export function buildAttachmentRecoveryUpdate(
  reason: AttachmentRecoveryReason,
  attachmentName?: string,
): AttachmentRecoveryUpdate {
  const update = attachmentRecoveryUpdates[reason];
  const displayName = attachmentName?.trim() || "첨부";

  return {
    ...update,
    historyDetail: `${displayName}: ${update.status}`,
  };
}

export function needsAttachmentRecovery(status: string | undefined) {
  return recoveryStatusTerms.some((term) => status?.includes(term));
}
