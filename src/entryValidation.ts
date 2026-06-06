export const recordRequiredFieldMessages = {
  document: "서류 제목과 내용을 입력해주세요.",
  lab: "검사 항목과 값을 입력해주세요.",
  question: "질문 주제와 내용을 입력해주세요.",
  symptom: "증상명 또는 몸 상태 메모를 입력해주세요.",
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

export function formatRecordFormFeedbackClearedStatus(formId: RecordFormFeedbackId) {
  return `${recordFormFeedbackLabels[formId]} 필수 입력 확인됨`;
}

export function resolveRecordFormFeedbackClearedSaveLabel(
  formId: RecordFormFeedbackId,
  clearedMessage: string | undefined,
  currentSaveLabel: string,
) {
  if (!clearedMessage || currentSaveLabel !== clearedMessage) return currentSaveLabel;

  return formatRecordFormFeedbackClearedStatus(formId);
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

export function formatLabRequiredFieldMessage(
  labName: string | undefined,
  labValue: string | undefined,
) {
  const hasLabName = hasRequiredTextValues(labName);
  const hasLabValue = hasRequiredTextValues(labValue);

  if (hasLabName && hasLabValue) return null;
  if (!hasLabName && !hasLabValue) return recordRequiredFieldMessages.lab;
  if (!hasLabName) return "검사 항목을 입력해주세요.";

  return "검사 값을 입력해주세요.";
}

export function formatVisitRequiredFieldMessage(
  visitHospital: string | undefined,
  visitReason: string | undefined,
) {
  const hasVisitHospital = hasRequiredTextValues(visitHospital);
  const hasVisitReason = hasRequiredTextValues(visitReason);

  if (hasVisitHospital && hasVisitReason) return null;
  if (!hasVisitHospital && !hasVisitReason) return recordRequiredFieldMessages.visit;
  if (!hasVisitHospital) return "병원/과를 입력해주세요.";

  return "방문 이유를 입력해주세요.";
}

export function formatQuestionRequiredFieldMessage(
  questionTopic: string | undefined,
  questionBody: string | undefined,
) {
  const hasQuestionTopic = hasRequiredTextValues(questionTopic);
  const hasQuestionBody = hasRequiredTextValues(questionBody);

  if (hasQuestionTopic && hasQuestionBody) return null;
  if (!hasQuestionTopic && !hasQuestionBody) return recordRequiredFieldMessages.question;
  if (!hasQuestionTopic) return "질문 주제를 입력해주세요.";

  return "질문 내용을 입력해주세요.";
}

export function formatSymptomRequiredFieldMessage(
  symptomName: string | undefined,
  symptomBody: string | undefined,
) {
  const hasSymptomName = hasRequiredTextValues(symptomName);
  const hasSymptomBody = hasRequiredTextValues(symptomBody);

  if (hasSymptomName || hasSymptomBody) return null;

  return recordRequiredFieldMessages.symptom;
}

export function formatDocumentRequiredFieldMessage(
  documentTitle: string | undefined,
  documentBody: string | undefined,
) {
  const hasDocumentTitle = hasRequiredTextValues(documentTitle);
  const hasDocumentBody = hasRequiredTextValues(documentBody);

  if (hasDocumentTitle && hasDocumentBody) return null;
  if (!hasDocumentTitle && !hasDocumentBody) return recordRequiredFieldMessages.document;
  if (!hasDocumentTitle) return "서류 제목을 입력해주세요.";

  return "서류 내용을 입력해주세요.";
}
