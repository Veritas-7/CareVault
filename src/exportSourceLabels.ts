export const exportSourceLabels = {
  attachmentFilenameOnly: "첨부 파일명만 포함",
  foodLocalRules: "로컬 음식 규칙 라벨",
  labMissingRange: "기준 범위 없음",
  labUserRange: "사용자 입력 기준 범위",
} as const;

export function getLabRangeSourceLabel(lower?: string, upper?: string) {
  return lower?.trim() || upper?.trim()
    ? exportSourceLabels.labUserRange
    : exportSourceLabels.labMissingRange;
}
