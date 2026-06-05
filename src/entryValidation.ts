export const recordRequiredFieldMessages = {
  document: "서류 제목과 내용을 입력해주세요.",
  lab: "검사 항목과 값을 입력해주세요.",
  question: "질문 주제와 내용을 입력해주세요.",
  symptom: "증상을 입력해주세요.",
  visit: "병원/과와 방문 이유를 입력해주세요.",
} as const;

export const recordFormFeedbackLabels = {
  document: "서류 수기 보관",
  lab: "검사 수치 입력",
  question: "진료 전 질문",
  symptom: "증상·부작용 기록",
  visit: "병원 방문 기록",
  vital: "혈압·혈당·체온 입력",
} as const;

export type RecordFormFeedbackId = keyof typeof recordFormFeedbackLabels;

export function formatRecordFormFeedbackAriaLabel(
  formId: RecordFormFeedbackId,
  message: string,
) {
  return `${recordFormFeedbackLabels[formId]} 필수 항목 안내 · ${message}`;
}

export function shouldClearRecordFormFeedback(
  currentMessage: string | undefined,
  isFormValid: boolean,
) {
  return Boolean(currentMessage && isFormValid);
}

export function hasRequiredTextValues(...values: Array<string | undefined>) {
  return values.every((value) => Boolean(value?.trim()));
}
