export function formatCervicalCarePromptDisclosureLabel(promptCount: number) {
  return `자궁경부암 다음 진료 질문 초안 ${promptCount}개 보기 · 출처 포함`;
}

export function formatCervicalCareRecoveryDisclosureLabel(itemCount: number) {
  return `자궁경부암 회복 일정 메모 ${itemCount}개 보기`;
}

export function formatCervicalCarePreventionDisclosureLabel(itemCount: number) {
  return `자궁경부암 검진·예방 메모 ${itemCount}개 보기`;
}

export const healthStandardsCoverageDisclosureLabel =
  "한국 성인 건강 기준 적용 범위 보기 · 성별 적용과 공식 기준 경계 확인";

export function formatExportPreviewRawHtmlDisclosureLabel(previewTitle: string) {
  return `내보내기 미리보기 원본 HTML 보기 · ${previewTitle}`;
}
