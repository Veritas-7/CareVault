import { describe, expect, it } from "vitest";
import { formatProfileModeToggleLabel } from "./profileModeToggle";

describe("profileModeToggle", () => {
  it("builds stateful accessible labels for profile tracking toggles", () => {
    expect(formatProfileModeToggleLabel("cancerCareMode", true)).toBe(
      "암환자 관리 켜짐 · 선택 해제하면 끕니다",
    );
    expect(formatProfileModeToggleLabel("diabetes", false)).toBe(
      "당뇨 추적 꺼짐 · 선택하면 켭니다",
    );
    expect(formatProfileModeToggleLabel("hypertension", true)).toBe(
      "혈압 추적 켜짐 · 선택 해제하면 끕니다",
    );
  });
});
