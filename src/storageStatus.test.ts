import { describe, expect, it } from "vitest";
import {
  formatStorageReadyLabel,
  formatStorageSaveFailedLabel,
  formatStorageSavedLabel,
  formatStorageSavedWithActionLabel,
} from "./storageStatus";

describe("storageStatus", () => {
  it("formats ready and saved labels for each persistence backend", () => {
    expect(formatStorageReadyLabel("sqlite")).toBe("SQLite 저장 준비");
    expect(formatStorageReadyLabel("localStorage")).toBe("브라우저 저장 준비");
    expect(formatStorageReadyLabel("memory")).toBe("임시 메모리 저장 준비");
    expect(formatStorageSavedLabel("sqlite", true)).toBe("SQLite 자동 저장됨");
    expect(formatStorageSavedLabel("localStorage")).toBe("브라우저 저장됨");
    expect(formatStorageSavedLabel("memory")).toBe("임시 메모리 저장됨");
  });

  it("formats save failure feedback with backend and automatic/manual context", () => {
    expect(formatStorageSaveFailedLabel("sqlite", true)).toBe(
      "SQLite 자동 저장 실패 · 현재 저장소 SQLite",
    );
    expect(formatStorageSaveFailedLabel("localStorage")).toBe(
      "브라우저 수동 저장 실패 · 현재 저장소 브라우저",
    );
    expect(formatStorageSaveFailedLabel("memory", true)).toBe(
      "임시 메모리 자동 저장 실패 · 현재 저장소 임시 메모리",
    );
  });

  it("combines pending action feedback with saved labels", () => {
    expect(formatStorageSavedWithActionLabel("localStorage", "다음 조치 이력 기록됨")).toBe(
      "다음 조치 이력 기록됨 · 브라우저 저장됨",
    );
    expect(formatStorageSavedWithActionLabel("sqlite", " 검사 상태 변경 ", true)).toBe(
      "검사 상태 변경 · SQLite 자동 저장됨",
    );
    expect(formatStorageSavedWithActionLabel("memory", "  ")).toBe("임시 메모리 저장됨");
  });
});
