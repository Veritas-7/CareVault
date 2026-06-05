import { describe, expect, it } from "vitest";
import { caregiverExportSectionDefaults } from "./caregiverExport";
import {
  buildCaregiverShareSettingsDifferences,
  buildCaregiverShareSettingsFingerprint,
  buildCaregiverShareSettingsPanelSummary,
  buildCaregiverShareSettingsPreviewSummary,
  buildCaregiverShareSectionSummary,
  caregiverShareSettingPresets,
  caregiverShareSectionOptions,
  createDefaultCaregiverShareSettings,
  formatCaregiverShareExportDescription,
  formatCaregiverShareExportStatus,
  formatCaregiverShareMemoPresetActionLabel,
  formatCaregiverSharePresetSelectDescription,
  formatCaregiverShareProfileRedactionToggleLabel,
  formatCaregiverSharePreviewDescription,
  formatCaregiverSharePreviewStatus,
  formatCaregiverShareResetDescription,
  formatCaregiverShareSectionSummaryAriaLabel,
  formatCaregiverShareSectionToggleLabel,
  formatCaregiverShareSettingsCompactSummary,
  getCaregiverShareSettingsPreset,
  hasCustomCaregiverShareSettings,
  normalizeCaregiverShareSettings,
} from "./caregiverShareSettings";

describe("caregiverShareSettings", () => {
  it("creates independent default section maps", () => {
    const first = createDefaultCaregiverShareSettings();
    const second = createDefaultCaregiverShareSettings();

    first.sections.food = false;

    expect(second.sections).toEqual(caregiverExportSectionDefaults);
  });

  it("normalizes partial persisted settings against current defaults", () => {
    const settings = normalizeCaregiverShareSettings({
      coverMemo: "식사 기록만 봐주세요.",
      sections: {
        food: false,
      },
    });

    expect(settings.coverMemo).toBe("식사 기록만 봐주세요.");
    expect(settings.presetId).toBe("");
    expect(settings.redactProfile).toBe(false);
    expect(settings.sections.food).toBe(false);
    expect(settings.sections.visits).toBe(true);
    expect(settings.sections.documents).toBe(true);
  });

  it("normalizes malformed persisted settings back to safe defaults", () => {
    const settings = normalizeCaregiverShareSettings({
      coverMemo: 42,
      presetId: ["clinic-prep"],
      redactProfile: "true",
      sections: {
        food: "false",
        labs: false,
        vitals: true,
      },
    });

    expect(settings.coverMemo).toBe("");
    expect(settings.presetId).toBe("");
    expect(settings.redactProfile).toBe(false);
    expect(settings.sections.food).toBe(true);
    expect(settings.sections.labs).toBe(false);
    expect(settings.sections.vitals).toBe(true);
    expect(Object.keys(settings.sections)).toEqual(Object.keys(caregiverExportSectionDefaults));
  });

  it("drops unknown persisted preset ids so the select stays in a valid option state", () => {
    const settings = normalizeCaregiverShareSettings({
      coverMemo: "진료 준비만 공유해주세요.",
      presetId: "retired-preset",
      sections: {
        documents: false,
      },
    });

    expect(settings.presetId).toBe("");
    expect(settings.coverMemo).toBe("진료 준비만 공유해주세요.");
    expect(settings.sections.documents).toBe(false);
    expect(buildCaregiverShareSettingsPanelSummary(settings).items[0]).toEqual({
      id: "preset",
      label: "의도",
      title: "직접 설정",
      value: "직접 설정",
    });
  });

  it("detects custom settings that can be reset", () => {
    expect(hasCustomCaregiverShareSettings(undefined)).toBe(false);
    expect(hasCustomCaregiverShareSettings({ coverMemo: "확인 부탁" })).toBe(true);
    expect(hasCustomCaregiverShareSettings({ presetId: "clinic-prep" })).toBe(true);
    expect(hasCustomCaregiverShareSettings({ redactProfile: true })).toBe(true);
    expect(
      hasCustomCaregiverShareSettings({
        sections: {
          ...caregiverExportSectionDefaults,
          labs: false,
        },
      }),
    ).toBe(true);
  });

  it("keeps named presets unique and resettable", () => {
    const ids = new Set(caregiverShareSettingPresets.map((preset) => preset.id));
    const labels = new Set(caregiverShareSettingPresets.map((preset) => preset.label));

    expect(ids.size).toBe(caregiverShareSettingPresets.length);
    expect(labels.size).toBe(caregiverShareSettingPresets.length);
    expect(caregiverShareSettingPresets.length).toBeGreaterThanOrEqual(3);
    for (const preset of caregiverShareSettingPresets) {
      expect(preset.description).not.toBe("");
      expect(preset.settings.presetId).toBe(preset.id);
      expect(hasCustomCaregiverShareSettings(preset.settings)).toBe(true);
      expect(Object.keys(preset.settings.sections)).toEqual(Object.keys(caregiverExportSectionDefaults));
      expect(Object.values(preset.settings.sections).some(Boolean)).toBe(true);
    }
  });

  it("finds family-review presets by id", () => {
    const mealPreset = getCaregiverShareSettingsPreset("meal-symptom");
    const privacyPreset = getCaregiverShareSettingsPreset("privacy-minimal");

    expect(mealPreset?.settings.sections.food).toBe(true);
    expect(mealPreset?.settings.sections.symptoms).toBe(true);
    expect(mealPreset?.settings.sections.documents).toBe(false);
    expect(privacyPreset?.settings.redactProfile).toBe(true);
    expect(getCaregiverShareSettingsPreset("missing")).toBeUndefined();
  });

  it("summarizes included and excluded caregiver share sections in display order", () => {
    const clinicPrepPreset = getCaregiverShareSettingsPreset("clinic-prep");
    const summary = buildCaregiverShareSectionSummary(clinicPrepPreset?.settings);

    expect(caregiverShareSectionOptions.map((option) => option.id)).toEqual([
      "visits",
      "questions",
      "documents",
      "symptoms",
      "labs",
      "food",
      "vitals",
    ]);
    expect(summary.includedText).toBe("진료, 질문, 서류, 검사");
    expect(summary.excludedText).toBe("증상, 음식, 혈압·혈당·체온");
    expect(formatCaregiverShareSectionSummaryAriaLabel(summary)).toBe(
      "보호자 공유본 포함 요약 · 포함 4개: 진료, 질문, 서류, 검사 · 제외 3개: 증상, 음식, 혈압·혈당·체온",
    );
  });

  it("shows no excluded sections when all caregiver sections are included", () => {
    const summary = buildCaregiverShareSectionSummary(createDefaultCaregiverShareSettings());

    expect(summary.included).toHaveLength(caregiverShareSectionOptions.length);
    expect(summary.excluded).toEqual([]);
    expect(summary.excludedText).toBe("없음");
  });

  it("handles imported settings with no caregiver sections enabled", () => {
    const summary = buildCaregiverShareSectionSummary({
      sections: {
        visits: false,
        questions: false,
        documents: false,
        symptoms: false,
        labs: false,
        food: false,
        vitals: false,
      },
    });

    expect(summary.included).toEqual([]);
    expect(summary.includedText).toBe("없음");
    expect(summary.excludedText).toBe("진료, 질문, 서류, 증상, 검사, 음식, 혈압·혈당·체온");
  });

  it("builds stable fingerprints for stale caregiver preview detection", () => {
    const baseline = buildCaregiverShareSettingsFingerprint(undefined);

    expect(buildCaregiverShareSettingsFingerprint(createDefaultCaregiverShareSettings())).toBe(
      baseline,
    );
    expect(buildCaregiverShareSettingsFingerprint({ sections: { food: false } })).not.toBe(
      baseline,
    );
    expect(buildCaregiverShareSettingsFingerprint({ coverMemo: "식사만 봐주세요." })).not.toBe(
      baseline,
    );
    expect(buildCaregiverShareSettingsFingerprint({ redactProfile: true })).not.toBe(baseline);
    expect(buildCaregiverShareSettingsFingerprint({ presetId: "clinic-prep" })).not.toBe(
      baseline,
    );
  });

  it("builds a caregiver preview snapshot summary for default settings", () => {
    const summary = buildCaregiverShareSettingsPreviewSummary(undefined);

    expect(summary.presetText).toBe("직접 설정");
    expect(summary.profileText).toBe("프로필 표시");
    expect(summary.memoText).toBe("전달 메모 없음");
    expect(summary.includedText).toBe("진료, 질문, 서류, 증상, 검사, 음식, 혈압·혈당·체온");
    expect(summary.excludedText).toBe("없음");
  });

  it("builds a caregiver preview snapshot summary for named presets", () => {
    const summary = buildCaregiverShareSettingsPreviewSummary(
      getCaregiverShareSettingsPreset("privacy-minimal")?.settings,
    );

    expect(summary.presetText).toBe("정보 최소 · 식별정보와 생활기록 노출 최소화");
    expect(summary.profileText).toBe("프로필 가림");
    expect(summary.memoText).toBe("전달 메모 포함");
    expect(summary.includedText).toBe("진료, 질문, 서류, 증상, 검사");
    expect(summary.excludedText).toBe("음식, 혈압·혈당·체온");
  });

  it("builds compact caregiver share settings panel chips", () => {
    const summary = buildCaregiverShareSettingsPanelSummary(
      getCaregiverShareSettingsPreset("privacy-minimal")?.settings,
    );

    expect(summary.ariaLabel).toBe(
      "보호자 공유 설정 요약 공유 의도 정보 최소 · 프로필 가림 · 전달 메모 포함 · 포함 5개 · 제외 2개",
    );
    expect(summary.includedCount).toBe(5);
    expect(summary.excludedCount).toBe(2);
    expect(summary.items).toEqual([
      {
        id: "preset",
        label: "의도",
        title: "정보 최소 · 식별정보와 생활기록 노출 최소화",
        value: "정보 최소",
      },
      { id: "profile", label: "프로필", title: "프로필 가림", value: "가림" },
      { id: "memo", label: "메모", title: "전달 메모 포함", value: "포함" },
      { id: "included", label: "포함", title: "포함 진료, 질문, 서류, 증상, 검사", value: "5개" },
      { id: "excluded", label: "제외", title: "제외 음식, 혈압·혈당·체온", value: "2개" },
    ]);
  });

  it("keeps default caregiver share settings panel summary explicit", () => {
    const summary = buildCaregiverShareSettingsPanelSummary(undefined);

    expect(summary.ariaLabel).toBe(
      "보호자 공유 설정 요약 공유 의도 직접 설정 · 프로필 표시 · 전달 메모 없음 · 포함 7개 · 제외 0개",
    );
    expect(summary.items.map((item) => item.value)).toEqual([
      "직접 설정",
      "표시",
      "없음",
      "7개",
      "없음",
    ]);
  });

  it("formats caregiver share action labels and statuses with the same compact summary", () => {
    const settings = getCaregiverShareSettingsPreset("privacy-minimal")?.settings;
    const compactSummary = "의도 정보 최소 · 프로필 가림 · 메모 포함 · 포함 5개 · 제외 2개";

    expect(formatCaregiverShareSettingsCompactSummary(settings)).toBe(compactSummary);
    expect(formatCaregiverShareExportDescription(settings)).toBe(
      `보호자 공유본 내보내기 · ${compactSummary}`,
    );
    expect(formatCaregiverSharePreviewDescription(settings)).toBe(
      `보호자 공유본 미리보기 · ${compactSummary}`,
    );
    expect(formatCaregiverShareExportStatus(settings)).toBe(
      `보호자 공유본 내보냄 · ${compactSummary}`,
    );
    expect(formatCaregiverSharePreviewStatus(settings)).toBe(
      `보호자 공유본 미리보기 생성 · ${compactSummary}`,
    );
  });

  it("formats caregiver reset labels with action context and disabled reason", () => {
    const settings = getCaregiverShareSettingsPreset("privacy-minimal")?.settings;

    expect(formatCaregiverShareResetDescription(settings)).toBe(
      "보호자 공유 설정 초기화 · 의도 정보 최소 · 프로필 가림 · 메모 포함 · 포함 5개 · 제외 2개 · 기본값으로 되돌립니다",
    );
    expect(formatCaregiverShareResetDescription(undefined)).toBe(
      "보호자 공유 설정 초기화 · 비활성: 이미 기본 공유 설정입니다",
    );
  });

  it("formats caregiver profile redaction toggles with current state and next action", () => {
    expect(formatCaregiverShareProfileRedactionToggleLabel(true)).toBe(
      "보호자 공유본 프로필 가리기 켜짐 · 선택 해제하면 이름과 기본 프로필 정보를 표시합니다",
    );
    expect(formatCaregiverShareProfileRedactionToggleLabel(false)).toBe(
      "보호자 공유본 프로필 가리기 꺼짐 · 선택하면 이름과 기본 프로필 정보를 숨깁니다",
    );
  });

  it("formats caregiver memo preset action labels", () => {
    expect(formatCaregiverShareMemoPresetActionLabel("식사")).toBe(
      "보호자 공유본 식사 메모 프리셋 적용",
    );
    expect(formatCaregiverShareMemoPresetActionLabel(" 증상 ")).toBe(
      "보호자 공유본 증상 메모 프리셋 적용",
    );
    expect(formatCaregiverShareMemoPresetActionLabel("")).toBe(
      "보호자 공유본 전달 메모 프리셋 적용",
    );
  });

  it("formats caregiver share preset select descriptions", () => {
    expect(formatCaregiverSharePresetSelectDescription("정보 최소")).toBe(
      "보호자 공유 설정 프리셋 · 현재 정보 최소 · 선택하면 해당 공유 설정을 적용합니다",
    );
    expect(formatCaregiverSharePresetSelectDescription("")).toBe(
      "보호자 공유 설정 프리셋 · 현재 프리셋 미선택 · 선택하면 해당 공유 설정을 적용합니다",
    );
  });

  it("formats caregiver section toggles with state, next action, and locked reason", () => {
    expect(formatCaregiverShareSectionToggleLabel("검사", true, false)).toBe(
      "보호자 공유본 포함 섹션 검사 포함됨 · 선택 해제하면 공유본에서 제외됩니다",
    );
    expect(formatCaregiverShareSectionToggleLabel("검사", false, false)).toBe(
      "보호자 공유본 포함 섹션 검사 제외됨 · 선택하면 공유본에 포함됩니다",
    );
    expect(formatCaregiverShareSectionToggleLabel("검사", true, true)).toBe(
      "보호자 공유본 포함 섹션 검사 포함됨 · 최소 1개 섹션은 포함해야 해서 해제할 수 없습니다",
    );
  });

  it("does not report caregiver preview setting differences for matching settings", () => {
    const settings = getCaregiverShareSettingsPreset("clinic-prep")?.settings;

    expect(buildCaregiverShareSettingsDifferences(settings, settings)).toEqual([]);
  });

  it("reports exact caregiver preview setting differences between snapshot and current settings", () => {
    const snapshot = getCaregiverShareSettingsPreset("privacy-minimal")?.settings;
    const current = normalizeCaregiverShareSettings({
      coverMemo: "진료 전에 검사 수치만 먼저 확인해주세요.",
      presetId: "",
      redactProfile: false,
      sections: {
        food: true,
        vitals: false,
      },
    });

    const differences = buildCaregiverShareSettingsDifferences(snapshot, current);

    expect(differences).toEqual([
      {
        id: "preset",
        label: "공유 의도",
        previousText: "정보 최소 · 식별정보와 생활기록 노출 최소화",
        currentText: "직접 설정",
      },
      {
        id: "profile",
        label: "프로필",
        previousText: "프로필 가림",
        currentText: "프로필 표시",
      },
      {
        id: "memo",
        label: "전달 메모",
        previousText: "필요한 진료 준비 항목만 보이도록 식별정보와 생활기록은 최소화했습니다.",
        currentText: "진료 전에 검사 수치만 먼저 확인해주세요.",
      },
      {
        id: "sections",
        label: "공유 섹션",
        previousText: "포함 진료, 질문, 서류, 증상, 검사 / 제외 음식, 혈압·혈당·체온",
        currentText: "포함 진료, 질문, 서류, 증상, 검사, 음식 / 제외 혈압·혈당·체온",
        detailText: "변경된 섹션: 음식",
      },
    ]);
  });

  it("reports caregiver memo content changes even when both previews include a memo", () => {
    const snapshot = normalizeCaregiverShareSettings({
      coverMemo: "식사 기록을 먼저 확인해주세요.",
    });
    const current = normalizeCaregiverShareSettings({
      coverMemo: "증상 기록을 먼저 확인해주세요.",
    });

    expect(buildCaregiverShareSettingsDifferences(snapshot, current)).toEqual([
      {
        id: "memo",
        label: "전달 메모",
        previousText: "식사 기록을 먼저 확인해주세요.",
        currentText: "증상 기록을 먼저 확인해주세요.",
      },
    ]);
  });
});
