export const recordRequiredFieldMessages = {
  document: "서류 제목과 내용을 입력해주세요.",
  lab: "검사 항목과 값을 입력해주세요.",
  question: "질문 주제와 내용을 입력해주세요.",
  symptom: "증상을 입력해주세요.",
  visit: "병원/과와 방문 이유를 입력해주세요.",
} as const;

export function hasRequiredTextValues(...values: Array<string | undefined>) {
  return values.every((value) => Boolean(value?.trim()));
}
