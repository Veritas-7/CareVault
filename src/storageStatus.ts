import type { PersistenceBackend } from "./storage";

function formatStorageBackendLabel(backend: PersistenceBackend) {
  if (backend === "sqlite") return "SQLite";
  if (backend === "localStorage") return "브라우저";
  return "임시 메모리";
}

function formatStorageSavedTarget(backend: PersistenceBackend) {
  if (backend === "memory") return "임시 메모리에만";
  return formatStorageBackendLabel(backend);
}

export function formatStorageReadyLabel(backend: PersistenceBackend) {
  return `${formatStorageBackendLabel(backend)} 저장 준비`;
}

export function formatStorageSavedLabel(backend: PersistenceBackend, automatic = false) {
  return `${formatStorageSavedTarget(backend)} ${automatic ? "자동 저장됨" : "저장됨"}`;
}

export function formatStorageSavedWithActionLabel(
  backend: PersistenceBackend,
  actionLabel: string | null | undefined,
  automatic = false,
) {
  const savedLabel = formatStorageSavedLabel(backend, automatic);
  return actionLabel?.trim() ? `${actionLabel.trim()} · ${savedLabel}` : savedLabel;
}

export function formatStorageSaveFailedLabel(backend: PersistenceBackend, automatic = false) {
  return `${formatStorageBackendLabel(backend)} ${
    automatic ? "자동 저장 실패" : "수동 저장 실패"
  } · 현재 저장소 ${formatStorageBackendLabel(backend)}`;
}
