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

export type RuntimeAttachmentDocument = {
  attachmentName?: string;
  attachmentPath?: string;
  id: string;
  title: string;
};

export type RuntimeAttachmentOpenResult =
  | {
      recovery: AttachmentRecoveryUpdate;
      type: "recovery";
    }
  | {
      statusLabel: string;
      type: "opened";
    };

export type RuntimeAttachmentPreviewResult =
  | {
      recovery: AttachmentRecoveryUpdate;
      type: "recovery";
    }
  | {
      attachmentName: string;
      documentId: string;
      previewUrl: string;
      sourceLabel: string;
      statusLabel: string;
      title: string;
      type: "preview";
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

export async function resolveRuntimeAttachmentOpen(
  document: RuntimeAttachmentDocument,
  runtime: {
    exists: (path: string) => Promise<boolean>;
    openPath: (path: string) => Promise<void>;
  },
): Promise<RuntimeAttachmentOpenResult> {
  const attachmentPath = document.attachmentPath ?? "";
  const attachmentExists = await runtime.exists(attachmentPath).catch(() => false);
  if (!attachmentExists) {
    return {
      recovery: buildAttachmentRecoveryUpdate("missing-file", document.attachmentName),
      type: "recovery",
    };
  }

  try {
    await runtime.openPath(attachmentPath);
    return {
      statusLabel: "첨부 파일 열기 요청됨",
      type: "opened",
    };
  } catch {
    return {
      recovery: buildAttachmentRecoveryUpdate("open-failure", document.attachmentName),
      type: "recovery",
    };
  }
}

export async function resolveRuntimeAttachmentPreview(
  document: RuntimeAttachmentDocument,
  runtime: {
    convertFileSrc: (path: string) => string;
    exists: (path: string) => Promise<boolean>;
  },
): Promise<RuntimeAttachmentPreviewResult> {
  const attachmentPath = document.attachmentPath ?? "";
  const attachmentExists = await runtime.exists(attachmentPath).catch(() => false);
  if (!attachmentExists) {
    return {
      recovery: buildAttachmentRecoveryUpdate("missing-file", document.attachmentName),
      type: "recovery",
    };
  }

  try {
    return {
      attachmentName: document.attachmentName ?? "첨부",
      documentId: document.id,
      previewUrl: runtime.convertFileSrc(attachmentPath),
      sourceLabel: "앱 샌드박스 이미지 미리보기",
      statusLabel: "이미지 미리보기 열림",
      title: document.title,
      type: "preview",
    };
  } catch {
    return {
      recovery: buildAttachmentRecoveryUpdate("preview-failure", document.attachmentName),
      type: "recovery",
    };
  }
}

export function needsAttachmentRecovery(status: string | undefined) {
  return recoveryStatusTerms.some((term) => status?.includes(term));
}
