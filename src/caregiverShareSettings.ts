import {
  caregiverExportSectionDefaults,
  type CaregiverExportSectionId,
  type CaregiverExportSections,
} from "./caregiverExport";

export type CaregiverShareSettings = {
  coverMemo: string;
  presetId: string;
  redactProfile: boolean;
  sections: CaregiverExportSections;
};

export type CaregiverShareSettingsPreset = {
  id: string;
  label: string;
  description: string;
  settings: CaregiverShareSettings;
};

export type CaregiverShareSectionOption = {
  id: CaregiverExportSectionId;
  label: string;
};

export type CaregiverShareSectionSummary = {
  included: CaregiverShareSectionOption[];
  excluded: CaregiverShareSectionOption[];
  includedText: string;
  excludedText: string;
};

export type CaregiverShareSettingsPanelSummaryItem = {
  id: "preset" | "profile" | "memo" | "included" | "excluded";
  label: string;
  title: string;
  value: string;
};

export type CaregiverShareSettingsPanelSummary = {
  ariaLabel: string;
  excludedCount: number;
  includedCount: number;
  items: CaregiverShareSettingsPanelSummaryItem[];
};

export type CaregiverShareSettingsPreviewSummary = {
  excludedText: string;
  includedText: string;
  memoText: string;
  presetText: string;
  profileText: string;
};

export type CaregiverShareSettingsDifference = {
  currentText: string;
  detailText?: string;
  id: "preset" | "profile" | "memo" | "sections";
  label: string;
  previousText: string;
};

type CaregiverShareSettingsInput = Partial<Omit<CaregiverShareSettings, "sections">> & {
  sections?: Partial<CaregiverExportSections>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const caregiverExportSectionIds = Object.keys(
  caregiverExportSectionDefaults,
) as CaregiverExportSectionId[];

export const caregiverShareSectionOptions: CaregiverShareSectionOption[] = [
  { id: "visits", label: "진료" },
  { id: "questions", label: "질문" },
  { id: "documents", label: "서류" },
  { id: "symptoms", label: "증상" },
  { id: "labs", label: "검사" },
  { id: "food", label: "음식" },
  { id: "vitals", label: "혈압·혈당·체온" },
];

const caregiverSharePresetIds = [
  "family-overview",
  "meal-symptom",
  "clinic-prep",
  "privacy-minimal",
] as const;

export function createDefaultCaregiverShareSettings(): CaregiverShareSettings {
  return {
    coverMemo: "",
    presetId: "",
    redactProfile: false,
    sections: { ...caregiverExportSectionDefaults },
  };
}

function createCaregiverShareSettings(
  settings: CaregiverShareSettingsInput,
): CaregiverShareSettings {
  return normalizeCaregiverShareSettings(settings);
}

export const caregiverShareSettingPresets: CaregiverShareSettingsPreset[] = [
  {
    id: "family-overview",
    label: "가족 요약",
    description: "다가오는 진료와 열린 질문 중심",
    settings: createCaregiverShareSettings({
      coverMemo: "다가오는 진료, 아직 열린 질문, 최근 증상만 먼저 확인해주세요.",
      presetId: "family-overview",
      sections: {
        food: false,
        vitals: false,
      },
    }),
  },
  {
    id: "meal-symptom",
    label: "식사·증상",
    description: "식사 반응과 부작용 확인 중심",
    settings: createCaregiverShareSettings({
      coverMemo: "식사량, 수분 섭취, 불편했던 음식, 증상 변화를 중심으로 봐주세요.",
      presetId: "meal-symptom",
      sections: {
        visits: false,
        questions: false,
        documents: false,
        labs: false,
      },
    }),
  },
  {
    id: "clinic-prep",
    label: "진료 준비",
    description: "질문, 검사, 서류, 예약 확인 중심",
    settings: createCaregiverShareSettings({
      coverMemo: "다음 진료 전에 확인할 질문, 검사 수치, 서류, 예약만 먼저 정리해주세요.",
      presetId: "clinic-prep",
      sections: {
        symptoms: false,
        food: false,
        vitals: false,
      },
    }),
  },
  {
    id: "privacy-minimal",
    label: "정보 최소",
    description: "식별정보와 생활기록 노출 최소화",
    settings: createCaregiverShareSettings({
      coverMemo: "필요한 진료 준비 항목만 보이도록 식별정보와 생활기록은 최소화했습니다.",
      presetId: "privacy-minimal",
      redactProfile: true,
      sections: {
        food: false,
        vitals: false,
      },
    }),
  },
];

export function getCaregiverShareSettingsPreset(id: string) {
  return caregiverShareSettingPresets.find((preset) => preset.id === id);
}

function normalizeCaregiverSharePresetId(value: unknown) {
  if (typeof value !== "string") return "";
  return caregiverSharePresetIds.some((id) => id === value) ? value : "";
}

export function normalizeCaregiverShareSettings(
  input: CaregiverShareSettingsInput | undefined | unknown,
): CaregiverShareSettings {
  const settings = isRecord(input) ? input : {};
  const sectionsInput = isRecord(settings.sections) ? settings.sections : {};

  return {
    coverMemo: typeof settings.coverMemo === "string" ? settings.coverMemo : "",
    presetId: normalizeCaregiverSharePresetId(settings.presetId),
    redactProfile: settings.redactProfile === true,
    sections: Object.fromEntries(
      caregiverExportSectionIds.map((id) => [
        id,
        typeof sectionsInput[id] === "boolean"
          ? sectionsInput[id]
          : caregiverExportSectionDefaults[id],
      ]),
    ) as CaregiverExportSections,
  };
}

export function hasCustomCaregiverShareSettings(
  input: CaregiverShareSettingsInput | undefined,
) {
  const settings = normalizeCaregiverShareSettings(input);

  return (
    settings.coverMemo !== "" ||
    settings.presetId !== "" ||
    settings.redactProfile ||
    caregiverExportSectionIds.some(
      (id) => settings.sections[id] !== caregiverExportSectionDefaults[id],
    )
  );
}

export function buildCaregiverShareSectionSummary(
  input: CaregiverShareSettingsInput | undefined,
): CaregiverShareSectionSummary {
  const settings = normalizeCaregiverShareSettings(input);
  const included = caregiverShareSectionOptions.filter((option) => settings.sections[option.id]);
  const excluded = caregiverShareSectionOptions.filter((option) => !settings.sections[option.id]);

  return {
    included,
    excluded,
    includedText: included.length ? included.map((option) => option.label).join(", ") : "없음",
    excludedText: excluded.length ? excluded.map((option) => option.label).join(", ") : "없음",
  };
}

export function formatCaregiverShareSectionSummaryAriaLabel(
  summary: CaregiverShareSectionSummary,
) {
  return [
    "보호자 공유본 포함 요약",
    `포함 ${summary.included.length}개: ${summary.includedText}`,
    `제외 ${summary.excluded.length}개: ${summary.excludedText}`,
  ].join(" · ");
}

export function buildCaregiverShareSettingsFingerprint(
  input: CaregiverShareSettingsInput | undefined,
) {
  const settings = normalizeCaregiverShareSettings(input);

  return JSON.stringify({
    coverMemo: settings.coverMemo,
    presetId: settings.presetId,
    redactProfile: settings.redactProfile,
    sections: caregiverShareSectionOptions.map((option) => [
      option.id,
      settings.sections[option.id],
    ]),
  });
}

export function buildCaregiverShareSettingsPreviewSummary(
  input: CaregiverShareSettingsInput | undefined,
): CaregiverShareSettingsPreviewSummary {
  const settings = normalizeCaregiverShareSettings(input);
  const sectionSummary = buildCaregiverShareSectionSummary(settings);

  return {
    excludedText: sectionSummary.excludedText,
    includedText: sectionSummary.includedText,
    memoText: settings.coverMemo.trim() ? "전달 메모 포함" : "전달 메모 없음",
    presetText: summarizeCaregiverSharePreset(settings),
    profileText: summarizeCaregiverShareProfile(settings),
  };
}

export function buildCaregiverShareSettingsPanelSummary(
  input: CaregiverShareSettingsInput | undefined,
): CaregiverShareSettingsPanelSummary {
  const settings = normalizeCaregiverShareSettings(input);
  const sectionSummary = buildCaregiverShareSectionSummary(settings);
  const preset = getCaregiverShareSettingsPreset(settings.presetId);
  const presetValue = preset?.label ?? "직접 설정";
  const presetTitle = preset ? `${preset.label} · ${preset.description}` : "직접 설정";
  const profileValue = settings.redactProfile ? "가림" : "표시";
  const memoValue = settings.coverMemo.trim() ? "포함" : "없음";
  const includedCount = sectionSummary.included.length;
  const excludedCount = sectionSummary.excluded.length;
  const items: CaregiverShareSettingsPanelSummaryItem[] = [
    { id: "preset", label: "의도", title: presetTitle, value: presetValue },
    { id: "profile", label: "프로필", title: `프로필 ${profileValue}`, value: profileValue },
    { id: "memo", label: "메모", title: `전달 메모 ${memoValue}`, value: memoValue },
    {
      id: "included",
      label: "포함",
      title: `포함 ${sectionSummary.includedText}`,
      value: `${includedCount}개`,
    },
    {
      id: "excluded",
      label: "제외",
      title: `제외 ${sectionSummary.excludedText}`,
      value: excludedCount ? `${excludedCount}개` : "없음",
    },
  ];

  return {
    ariaLabel: `보호자 공유 설정 요약 공유 의도 ${presetValue} · 프로필 ${profileValue} · 전달 메모 ${memoValue} · 포함 ${includedCount}개 · 제외 ${excludedCount}개`,
    excludedCount,
    includedCount,
    items,
  };
}

export function formatCaregiverShareSettingsCompactSummary(
  input: CaregiverShareSettingsInput | undefined,
) {
  const summary = buildCaregiverShareSettingsPanelSummary(input);
  const itemValue = (id: CaregiverShareSettingsPanelSummaryItem["id"]) =>
    summary.items.find((item) => item.id === id)?.value ?? "";

  return [
    `의도 ${itemValue("preset")}`,
    `프로필 ${itemValue("profile")}`,
    `메모 ${itemValue("memo")}`,
    `포함 ${summary.includedCount}개`,
    `제외 ${summary.excludedCount}개`,
  ].join(" · ");
}

export function formatCaregiverShareExportDescription(
  input: CaregiverShareSettingsInput | undefined,
) {
  return `보호자 공유본 내보내기 · ${formatCaregiverShareSettingsCompactSummary(input)}`;
}

export function formatCaregiverSharePreviewDescription(
  input: CaregiverShareSettingsInput | undefined,
) {
  return `보호자 공유본 미리보기 · ${formatCaregiverShareSettingsCompactSummary(input)}`;
}

export function formatCaregiverShareResetDescription(
  input: CaregiverShareSettingsInput | undefined,
) {
  if (!hasCustomCaregiverShareSettings(input)) {
    return "보호자 공유 설정 초기화 · 비활성: 이미 기본 공유 설정입니다";
  }

  return `보호자 공유 설정 초기화 · ${formatCaregiverShareSettingsCompactSummary(
    input,
  )} · 기본값으로 되돌립니다`;
}

export function formatCaregiverShareProfileRedactionToggleLabel(redactProfile: boolean) {
  return redactProfile
    ? "보호자 공유본 프로필 가리기 켜짐 · 선택 해제하면 이름과 기본 프로필 정보를 표시합니다"
    : "보호자 공유본 프로필 가리기 꺼짐 · 선택하면 이름과 기본 프로필 정보를 숨깁니다";
}

export function formatCaregiverShareMemoPresetActionLabel(label: string) {
  const presetLabel = label.trim();
  if (!presetLabel) return "보호자 공유본 전달 메모 프리셋 적용";
  return `보호자 공유본 ${presetLabel} 메모 프리셋 적용`;
}

export function formatCaregiverSharePresetSelectDescription(label: string) {
  const selectedLabel = label.trim() || "프리셋 미선택";
  return `보호자 공유 설정 프리셋 · 현재 ${selectedLabel} · 선택하면 해당 공유 설정을 적용합니다`;
}

export function formatCaregiverShareSectionToggleLabel(
  label: string,
  checked: boolean,
  isOnlyIncludedSection: boolean,
) {
  if (checked && isOnlyIncludedSection) {
    return `보호자 공유본 포함 섹션 ${label} 포함됨 · 최소 1개 섹션은 포함해야 해서 해제할 수 없습니다`;
  }

  return checked
    ? `보호자 공유본 포함 섹션 ${label} 포함됨 · 선택 해제하면 공유본에서 제외됩니다`
    : `보호자 공유본 포함 섹션 ${label} 제외됨 · 선택하면 공유본에 포함됩니다`;
}

export function formatCaregiverShareSectionStatus(
  label: string,
  included: boolean,
  input: CaregiverShareSettingsInput | undefined,
) {
  const sectionLabel = label.trim() || "공유 섹션";
  return `공유 섹션 ${included ? "포함" : "제외"}: ${sectionLabel} · ${formatCaregiverShareSettingsCompactSummary(
    input,
  )}`;
}

export function formatCaregiverShareExportStatus(
  input: CaregiverShareSettingsInput | undefined,
) {
  return `보호자 공유본 내보냄 · ${formatCaregiverShareSettingsCompactSummary(input)}`;
}

export function formatCaregiverSharePreviewStatus(
  input: CaregiverShareSettingsInput | undefined,
) {
  return `보호자 공유본 미리보기 생성 · ${formatCaregiverShareSettingsCompactSummary(input)}`;
}

export function formatCaregiverShareResetStatus() {
  return `보호자 공유 설정 초기화됨 · ${formatCaregiverShareSettingsCompactSummary(
    createDefaultCaregiverShareSettings(),
  )}`;
}

export function formatCaregiverSharePresetStatus(
  presetLabel: string,
  input: CaregiverShareSettingsInput | undefined,
) {
  const label = presetLabel.trim() || "프리셋";
  return `보호자 공유 프리셋 적용: ${label} · ${formatCaregiverShareSettingsCompactSummary(input)}`;
}

function summarizeCaregiverSharePreset(settings: CaregiverShareSettings) {
  const preset = getCaregiverShareSettingsPreset(settings.presetId);
  return preset ? `${preset.label} · ${preset.description}` : "직접 설정";
}

function summarizeCaregiverShareProfile(settings: CaregiverShareSettings) {
  return settings.redactProfile ? "프로필 가림" : "프로필 표시";
}

function summarizeCaregiverShareMemo(settings: CaregiverShareSettings) {
  return settings.coverMemo.trim() || "전달 메모 없음";
}

function summarizeCaregiverShareSections(settings: CaregiverShareSettings) {
  const summary = buildCaregiverShareSectionSummary(settings);
  return `포함 ${summary.includedText} / 제외 ${summary.excludedText}`;
}

export function buildCaregiverShareSettingsDifferences(
  previousInput: CaregiverShareSettingsInput | undefined,
  currentInput: CaregiverShareSettingsInput | undefined,
): CaregiverShareSettingsDifference[] {
  const previous = normalizeCaregiverShareSettings(previousInput);
  const current = normalizeCaregiverShareSettings(currentInput);
  const differences: CaregiverShareSettingsDifference[] = [];

  if (previous.presetId !== current.presetId) {
    differences.push({
      id: "preset",
      label: "공유 의도",
      previousText: summarizeCaregiverSharePreset(previous),
      currentText: summarizeCaregiverSharePreset(current),
    });
  }

  if (previous.redactProfile !== current.redactProfile) {
    differences.push({
      id: "profile",
      label: "프로필",
      previousText: summarizeCaregiverShareProfile(previous),
      currentText: summarizeCaregiverShareProfile(current),
    });
  }

  if (previous.coverMemo !== current.coverMemo) {
    differences.push({
      id: "memo",
      label: "전달 메모",
      previousText: summarizeCaregiverShareMemo(previous),
      currentText: summarizeCaregiverShareMemo(current),
    });
  }

  const changedSectionLabels = caregiverShareSectionOptions
    .filter((option) => previous.sections[option.id] !== current.sections[option.id])
    .map((option) => option.label);

  if (changedSectionLabels.length) {
    differences.push({
      id: "sections",
      label: "공유 섹션",
      previousText: summarizeCaregiverShareSections(previous),
      currentText: summarizeCaregiverShareSections(current),
      detailText: `변경된 섹션: ${changedSectionLabels.join(", ")}`,
    });
  }

  return differences;
}
