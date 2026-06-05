export type ProfileModeToggleField = "cancerCareMode" | "diabetes" | "hypertension";

const profileModeToggleLabels: Record<ProfileModeToggleField, string> = {
  cancerCareMode: "암환자 관리",
  diabetes: "당뇨 추적",
  hypertension: "혈압 추적",
};

export function formatProfileModeToggleLabel(
  field: ProfileModeToggleField,
  checked: boolean,
) {
  const stateText = checked ? "켜짐" : "꺼짐";
  const actionText = checked ? "선택 해제하면 끕니다" : "선택하면 켭니다";

  return `${profileModeToggleLabels[field]} ${stateText} · ${actionText}`;
}
