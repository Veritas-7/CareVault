import {
  buildDocumentParserAudit,
  type DocumentParserAuditSource,
} from "./documentParserAudit";

export const restoredAttachmentStatus = "백업에서 복원됨 - 재첨부 필요";

type BackupDocument = {
  attachmentName?: unknown;
  attachmentPath?: unknown;
  attachmentStorage?: unknown;
  attachmentStatus?: unknown;
  [key: string]: unknown;
};

type BackupState = {
  documents?: unknown;
  deletedDocuments?: unknown;
  caregiverShareSettings?: unknown;
  labResults?: unknown;
  profile?: unknown;
  questions?: unknown;
  symptoms?: unknown;
  visits?: unknown;
  vitals?: unknown;
  [key: string]: unknown;
};

export type CareVaultBackupScopeSummaryItem = {
  id: "profile" | "records" | "caregiver" | "attachments" | "parserAudit";
  label: string;
  value: string;
};

export type CareVaultBackupScopeSummary = {
  ariaLabel: string;
  attachmentNameCount: number;
  hasCaregiverSettings: boolean;
  hasProfile: boolean;
  items: CareVaultBackupScopeSummaryItem[];
  parserAuditSummary: string;
  recordCount: number;
};

const recordArrayKeys: Array<keyof BackupState> = [
  "vitals",
  "visits",
  "documents",
  "deletedDocuments",
  "symptoms",
  "questions",
  "labResults",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasAttachmentName(document: BackupDocument) {
  return typeof document.attachmentName === "string" && document.attachmentName.trim().length > 0;
}

function countRecordItems(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord).length : 0;
}

function countAttachmentNames(documents: unknown) {
  if (!Array.isArray(documents)) return 0;
  return documents.filter((document) => isRecord(document) && hasAttachmentName(document)).length;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function parserAuditSourcesFromDocuments(documents: unknown): DocumentParserAuditSource[] {
  if (!Array.isArray(documents)) return [];

  return documents.filter(isRecord).map((document) => ({
    attachmentName: stringValue(document.attachmentName),
    body: stringValue(document.body),
    category: stringValue(document.category),
    date: stringValue(document.date),
    id: stringValue(document.id),
    nextAction: stringValue(document.nextAction),
    reviewStatus: stringValue(document.reviewStatus),
    tags: stringValue(document.tags),
    title: stringValue(document.title),
  }));
}

function sanitizeBackupDocument<T extends BackupDocument>(document: T): T {
  const { attachmentPath: _attachmentPath, ...safeDocument } = document;
  if (!hasAttachmentName(safeDocument)) return safeDocument as T;

  return {
    ...safeDocument,
    attachmentStorage: "browser-reference",
    attachmentStatus: restoredAttachmentStatus,
  } as T;
}

function sanitizeBackupDocuments(documents: unknown) {
  if (!Array.isArray(documents)) return documents;
  return documents.map((document) =>
    isRecord(document) ? sanitizeBackupDocument(document as BackupDocument) : document,
  );
}

export function sanitizeCareVaultBackupState<T extends BackupState>(state: T): T {
  return {
    ...state,
    documents: sanitizeBackupDocuments(state.documents),
    deletedDocuments: sanitizeBackupDocuments(state.deletedDocuments),
  };
}

export function buildCareVaultBackupScopeSummary(
  state: BackupState,
): CareVaultBackupScopeSummary {
  const hasProfile = isRecord(state.profile);
  const hasCaregiverSettings = isRecord(state.caregiverShareSettings);
  const recordCount = recordArrayKeys.reduce<number>(
    (count, key) => count + countRecordItems(state[key]),
    0,
  );
  const attachmentNameCount =
    countAttachmentNames(state.documents) + countAttachmentNames(state.deletedDocuments);
  const parserAudit = buildDocumentParserAudit([
    ...parserAuditSourcesFromDocuments(state.documents),
    ...parserAuditSourcesFromDocuments(state.deletedDocuments),
  ]);
  const profileValue = hasProfile ? "포함" : "없음";
  const caregiverValue = hasCaregiverSettings ? "포함" : "없음";
  const items: CareVaultBackupScopeSummaryItem[] = [
    { id: "profile", label: "프로필", value: profileValue },
    { id: "records", label: "기록", value: `${recordCount}개` },
    { id: "caregiver", label: "공유 설정", value: caregiverValue },
    { id: "attachments", label: "첨부 파일명", value: `${attachmentNameCount}개` },
    { id: "parserAudit", label: "문서 파서 점검", value: parserAudit.summary },
  ];

  return {
    ariaLabel: `백업 범위 프로필 ${profileValue} · 기록 ${recordCount}개 · 보호자 공유 설정 ${caregiverValue} · 첨부 파일명 ${attachmentNameCount}개 · ${parserAudit.summary}`,
    attachmentNameCount,
    hasCaregiverSettings,
    hasProfile,
    items,
    parserAuditSummary: parserAudit.summary,
    recordCount,
  };
}

export function formatCareVaultBackupScopeCompactSummary(state: BackupState) {
  const summary = buildCareVaultBackupScopeSummary(state);
  const itemValue = (id: CareVaultBackupScopeSummaryItem["id"]) =>
    summary.items.find((item) => item.id === id)?.value ?? "";

  return [
    `프로필 ${itemValue("profile")}`,
    `기록 ${summary.recordCount}개`,
    `공유 설정 ${itemValue("caregiver")}`,
    `첨부 파일명 ${summary.attachmentNameCount}개`,
    itemValue("parserAudit"),
  ].join(" · ");
}

export function formatCareVaultBackupExportDescription(state: BackupState) {
  return `전체 백업 내보내기 · ${formatCareVaultBackupScopeCompactSummary(state)}`;
}

export function formatCareVaultBackupExportStatus(state: BackupState) {
  return `백업 내보냄 · ${formatCareVaultBackupScopeCompactSummary(state)}`;
}

export function formatCareVaultBackupImportDescription() {
  return "CareVault 백업 가져오기 · JSON 구조 검증 후 기존 기록 교체 · 첨부 파일명은 재첨부 필요";
}

export function formatCareVaultBackupImportSuccessDetail(state: BackupState) {
  const summary = buildCareVaultBackupScopeSummary(state);
  const attachmentNote =
    summary.attachmentNameCount > 0
      ? `첨부 파일명 ${summary.attachmentNameCount}개는 재첨부 필요`
      : "재첨부할 첨부 파일명 없음";

  return `프로필, 기록, 보호자 공유 설정을 백업 파일 기준으로 교체했습니다. ${formatCareVaultBackupScopeCompactSummary(state)} · ${attachmentNote}`;
}

export function formatCareVaultBackupImportStatus(state: BackupState) {
  return `백업 가져옴 · ${formatCareVaultBackupScopeCompactSummary(state)}`;
}

export function formatCareVaultBackupImportFailureStatus() {
  return "백업 가져오기 실패 · JSON 검증 실패 · 기존 기록 유지 · 첨부 재연결 변경 없음";
}

export function formatCareVaultBackupImportReadFailureStatus() {
  return "백업 가져오기 실패 · 파일 읽기 실패 · 기존 기록 유지 · 첨부 재연결 변경 없음";
}

export function extractCareVaultBackupState(payload: unknown) {
  if (!isRecord(payload)) return null;
  const candidate = isRecord(payload.state) ? payload.state : payload;
  return sanitizeCareVaultBackupState(candidate);
}

export type CareVaultBackupImportFailureReason = "not-object" | "missing-required-state";

export type CareVaultBackupImportResult =
  | { state: Record<string, unknown>; type: "ok" }
  | { reason: CareVaultBackupImportFailureReason; type: "error" };

export function describeCareVaultBackupImportFailure(
  reason: CareVaultBackupImportFailureReason,
) {
  if (reason === "not-object") {
    return "JSON 최상위 값이 백업 객체가 아닙니다.";
  }
  return "프로필과 기록 배열이 있는 CareVault 백업 구조가 아닙니다.";
}

export function prepareCareVaultBackupImport(payload: unknown): CareVaultBackupImportResult {
  const state = extractCareVaultBackupState(payload);
  if (!state) return { reason: "not-object", type: "error" };

  if (!isRecord(state.profile) || !Array.isArray(state.vitals)) {
    return { reason: "missing-required-state", type: "error" };
  }

  return { state, type: "ok" };
}
