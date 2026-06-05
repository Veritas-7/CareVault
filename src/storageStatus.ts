import type { PersistenceBackend } from "./storage";

function formatStorageBackendLabel(backend: PersistenceBackend) {
  if (backend === "sqlite") return "SQLite";
  if (backend === "localStorage") return "브라우저";
  return "임시 메모리";
}

export function formatStorageReadyLabel(backend: PersistenceBackend) {
  return `${formatStorageBackendLabel(backend)} 저장 준비`;
}

export function formatStorageSavedLabel(backend: PersistenceBackend, automatic = false) {
  return `${formatStorageBackendLabel(backend)} ${automatic ? "자동 저장됨" : "저장됨"}`;
}

export function formatStorageSaveFailedLabel(backend: PersistenceBackend, automatic = false) {
  return `${formatStorageBackendLabel(backend)} ${
    automatic ? "자동 저장 실패" : "수동 저장 실패"
  } · 현재 저장소 ${formatStorageBackendLabel(backend)}`;
}
