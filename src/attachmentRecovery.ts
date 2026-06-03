const recoveryStatusTerms = ["파일 없음", "재첨부 필요", "열기 실패", "확인 실패"];

export function needsAttachmentRecovery(status: string | undefined) {
  return recoveryStatusTerms.some((term) => status?.includes(term));
}
