import { describe, expect, it } from "vitest";
import {
  buildCareVaultBackupScopeSummary,
  describeCareVaultBackupImportFailure,
  extractCareVaultBackupState,
  formatCareVaultBackupExportDescription,
  formatCareVaultBackupExportStatus,
  formatCareVaultBackupImportDescription,
  formatCareVaultBackupImportStatus,
  formatCareVaultBackupImportSuccessDetail,
  formatCareVaultBackupScopeCompactSummary,
  prepareCareVaultBackupImport,
  restoredAttachmentStatus,
  sanitizeCareVaultBackupState,
} from "./backupState";

describe("backupState", () => {
  it("removes local attachment paths while keeping attachment filenames recoverable", () => {
    const backup = sanitizeCareVaultBackupState({
      profile: { waistCm: "82" },
      documents: [
        {
          id: "doc-1",
          attachmentName: "scan.pdf",
          attachmentPath: "/Users/wj/private/scan.pdf",
          attachmentStorage: "tauri-sandbox",
          attachmentStatus: "파일 확인됨",
        },
      ],
      deletedDocuments: [
        {
          id: "doc-2",
          attachmentName: "old.png",
          attachmentPath: "/Users/wj/private/old.png",
          attachmentStorage: "tauri-sandbox",
        },
      ],
    });

    expect(backup.documents?.[0]).toMatchObject({
      attachmentName: "scan.pdf",
      attachmentStorage: "browser-reference",
      attachmentStatus: restoredAttachmentStatus,
    });
    expect(backup.deletedDocuments?.[0]).toMatchObject({
      attachmentName: "old.png",
      attachmentStorage: "browser-reference",
      attachmentStatus: restoredAttachmentStatus,
    });
    expect(JSON.stringify(backup)).not.toContain("/Users/wj/private");
    expect(JSON.stringify(backup)).not.toContain("attachmentPath");
  });

  it("extracts wrapped CareVault backup payloads and sanitizes stale paths", () => {
    const extracted = extractCareVaultBackupState({
      app: "CareVault",
      schemaVersion: 1,
      state: {
        profile: { waistCm: "90" },
        vitals: [],
        documents: [
          {
            id: "doc-1",
            attachmentName: "result.pdf",
            attachmentPath: "/tmp/result.pdf",
          },
        ],
      },
    });

    expect(extracted).toMatchObject({
      profile: { waistCm: "90" },
      vitals: [],
    });
    const documents = extracted?.documents as Array<Record<string, unknown>>;
    expect(documents[0]).toMatchObject({
      attachmentName: "result.pdf",
      attachmentStatus: restoredAttachmentStatus,
    });
    expect(JSON.stringify(extracted)).not.toContain("/tmp/result.pdf");
  });

  it("rejects non-object backup payloads", () => {
    expect(extractCareVaultBackupState(null)).toBeNull();
    expect(extractCareVaultBackupState("not json")).toBeNull();
  });

  it("validates required CareVault import shape before state replacement", () => {
    expect(prepareCareVaultBackupImport(null)).toEqual({
      reason: "not-object",
      type: "error",
    });
    expect(prepareCareVaultBackupImport({ state: { profile: {} } })).toEqual({
      reason: "missing-required-state",
      type: "error",
    });
    expect(
      prepareCareVaultBackupImport({
        state: {
          profile: { name: "QA" },
          vitals: [],
        },
      }),
    ).toMatchObject({
      state: {
        profile: { name: "QA" },
        vitals: [],
      },
      type: "ok",
    });
  });

  it("describes rejected backup payloads without implying state replacement", () => {
    expect(describeCareVaultBackupImportFailure("not-object")).toContain("백업 객체");
    expect(describeCareVaultBackupImportFailure("missing-required-state")).toContain(
      "CareVault 백업 구조",
    );
  });

  it("summarizes backup export scope without exposing local paths", () => {
    const state = {
      caregiverShareSettings: { redactProfile: true },
      deletedDocuments: [
        {
          attachmentName: "old-result.pdf",
          attachmentPath: "/Users/wj/private/old-result.pdf",
        },
      ],
      documents: [
        {
          attachmentName: "blood-test.pdf",
          attachmentPath: "/Users/wj/private/blood-test.pdf",
        },
      ],
      labResults: [{}],
      profile: { name: "나의 건강 기록" },
      questions: [{}],
      symptoms: [{}],
      visits: [{}],
      vitals: [{}, {}],
    };
    const summary = buildCareVaultBackupScopeSummary(state);

    expect(summary).toMatchObject({
      ariaLabel: "백업 범위 프로필 포함 · 기록 8개 · 보호자 공유 설정 포함 · 첨부 파일명 2개",
      attachmentNameCount: 2,
      hasCaregiverSettings: true,
      hasProfile: true,
      recordCount: 8,
    });
    expect(summary.items).toEqual([
      { id: "profile", label: "프로필", value: "포함" },
      { id: "records", label: "기록", value: "8개" },
      { id: "caregiver", label: "공유 설정", value: "포함" },
      { id: "attachments", label: "첨부 파일명", value: "2개" },
    ]);
    expect(formatCareVaultBackupScopeCompactSummary(state)).toBe(
      "프로필 포함 · 기록 8개 · 공유 설정 포함 · 첨부 파일명 2개",
    );
    expect(formatCareVaultBackupExportDescription(state)).toBe(
      "전체 백업 내보내기 · 프로필 포함 · 기록 8개 · 공유 설정 포함 · 첨부 파일명 2개",
    );
    expect(formatCareVaultBackupExportStatus(state)).toBe(
      "백업 내보냄 · 프로필 포함 · 기록 8개 · 공유 설정 포함 · 첨부 파일명 2개",
    );
    expect(formatCareVaultBackupExportDescription(state)).not.toContain("/Users/wj/private");
  });

  it("describes backup import safety scope and success result without local paths", () => {
    const importedState = {
      caregiverShareSettings: { redactProfile: false },
      deletedDocuments: [
        {
          attachmentName: "old-result.pdf",
          attachmentPath: "/Users/wj/private/old-result.pdf",
        },
      ],
      documents: [
        {
          attachmentName: "blood-test.pdf",
          attachmentPath: "/Users/wj/private/blood-test.pdf",
        },
      ],
      profile: { name: "나의 건강 기록" },
      questions: [{}],
      visits: [{}],
      vitals: [{}, {}],
    };

    expect(formatCareVaultBackupImportDescription()).toBe(
      "CareVault 백업 가져오기 · JSON 구조 검증 후 기존 기록 교체 · 첨부 파일명은 재첨부 필요",
    );
    expect(formatCareVaultBackupImportSuccessDetail(importedState)).toBe(
      "프로필, 기록, 보호자 공유 설정을 백업 파일 기준으로 교체했습니다. 프로필 포함 · 기록 6개 · 공유 설정 포함 · 첨부 파일명 2개 · 첨부 파일명 2개는 재첨부 필요",
    );
    expect(formatCareVaultBackupImportStatus(importedState)).toBe(
      "백업 가져옴 · 프로필 포함 · 기록 6개 · 공유 설정 포함 · 첨부 파일명 2개",
    );
    expect(formatCareVaultBackupImportSuccessDetail(importedState)).not.toContain(
      "/Users/wj/private",
    );
  });
});
