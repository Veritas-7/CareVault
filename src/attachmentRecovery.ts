const recoveryStatusTerms = ["파일 없음", "재첨부 필요", "열기 실패", "확인 실패"];
const defaultPreviewProbeTimeoutMs = 4000;

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

function getAttachmentExtension(attachmentName?: string) {
  return attachmentName?.trim().toLowerCase().match(/\.([^.\\/]+)$/)?.[1] ?? "";
}

export function hasSupportedImageSignature(attachmentName: string | undefined, bytes: ArrayLike<number>) {
  const extension = getAttachmentExtension(attachmentName);

  if (extension === "png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (extension === "jpg" || extension === "jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (extension === "webp") {
    return (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

function withPreviewProbeTimeout<T>(
  promise: Promise<T>,
  timeoutMs = defaultPreviewProbeTimeoutMs,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(
      () => reject(new Error("attachment preview probe timed out")),
      timeoutMs,
    );

    promise
      .then((result) => {
        globalThis.clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        globalThis.clearTimeout(timeout);
        reject(error);
      });
  });
}

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
    loadImage?: (previewUrl: string) => Promise<void>;
    previewProbeTimeoutMs?: number;
    readFile?: (path: string) => Promise<ArrayLike<number>>;
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
    const previewProbeTimeoutMs =
      runtime.previewProbeTimeoutMs ?? defaultPreviewProbeTimeoutMs;
    if (runtime.readFile) {
      const bytes = await withPreviewProbeTimeout(
        runtime.readFile(attachmentPath),
        previewProbeTimeoutMs,
      );
      if (!hasSupportedImageSignature(document.attachmentName, bytes)) {
        throw new Error("unsupported image signature");
      }
    }

    const previewUrl = runtime.convertFileSrc(attachmentPath);
    if (runtime.loadImage) {
      await withPreviewProbeTimeout(runtime.loadImage(previewUrl), previewProbeTimeoutMs);
    }

    return {
      attachmentName: document.attachmentName ?? "첨부",
      documentId: document.id,
      previewUrl,
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
