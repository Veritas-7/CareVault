export const exportSourceLabels = {
  attachmentFilenameOnly: "첨부 파일명만 포함",
  foodLocalRules: "공식 출처 기반 음식 규칙",
  labMissingRange: "기준 범위 없음",
  labUserRange: "사용자 입력 기준 범위",
} as const;

export function getLabRangeSourceLabel(lower?: string, upper?: string) {
  return lower?.trim() || upper?.trim()
    ? exportSourceLabels.labUserRange
    : exportSourceLabels.labMissingRange;
}

export function formatLabReferenceRangeLabel(lower?: string, upper?: string, unit?: string) {
  const lowerText = lower?.trim() ?? "";
  const upperText = upper?.trim() ?? "";
  const unitSuffix = unit?.trim() ? ` ${unit.trim()}` : "";

  if (lowerText && upperText) return `${lowerText}~${upperText}${unitSuffix}`;
  if (lowerText) return `${lowerText}${unitSuffix} 이상`;
  if (upperText) return `${upperText}${unitSuffix} 이하`;
  return "";
}
