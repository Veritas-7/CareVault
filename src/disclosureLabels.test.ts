import { describe, expect, it } from "vitest";
import {
  formatCervicalCarePreventionDisclosureLabel,
  formatCervicalCarePromptDisclosureLabel,
  formatCervicalCareRecoveryDisclosureLabel,
  formatExportPreviewRawHtmlDisclosureLabel,
  healthStandardsCoverageDisclosureLabel,
} from "./disclosureLabels";

describe("disclosureLabels", () => {
  it("keeps cervical care disclosure labels scoped by list purpose and count", () => {
    expect(formatCervicalCarePromptDisclosureLabel(3)).toBe(
      "자궁경부암 다음 진료 질문 초안 3개 보기 · 출처 포함",
    );
    expect(formatCervicalCareRecoveryDisclosureLabel(4)).toBe(
      "자궁경부암 회복 일정 메모 4개 보기",
    );
    expect(formatCervicalCarePreventionDisclosureLabel(5)).toBe(
      "자궁경부암 검진·예방 메모 5개 보기",
    );
  });

  it("keeps the health standards coverage disclosure tied to scope boundaries", () => {
    expect(healthStandardsCoverageDisclosureLabel).toBe(
      "한국 성인 건강 기준 적용 범위 보기 · 성별 적용과 공식 기준 경계 확인",
    );
  });

  it("scopes raw export HTML disclosure labels to the active preview", () => {
    expect(formatExportPreviewRawHtmlDisclosureLabel("보호자 공유본 미리보기")).toBe(
      "내보내기 미리보기 원본 HTML 보기 · 보호자 공유본 미리보기",
    );
  });
});
