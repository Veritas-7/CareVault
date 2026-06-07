import { parseSourceEvidence } from "./sourceEvidence";

export type SymptomRecordLabelSource = {
  action: string;
  body: string;
};

const cervicalWarningSourceLabelFragments = [
  "자궁경부암 일반적 증상",
  "자궁경부암 치료의 부작용",
];

function hasCervicalWarningSourceEvidence(symptom: SymptomRecordLabelSource) {
  return [symptom.body, symptom.action].some((text) => {
    const sources = parseSourceEvidence(text).sources;
    return sources.some((source) =>
      cervicalWarningSourceLabelFragments.some((fragment) =>
        source.sourceLabel.includes(fragment),
      ),
    );
  });
}

export function formatSymptomRecordLabel(symptom: SymptomRecordLabelSource) {
  const combined = `${symptom.body}\n${symptom.action}`;
  if (combined.includes("자궁경부암 기록 메모 초안")) return "자궁경부암 기록 메모";
  if (combined.includes("자궁경부암 경고 신호 기록 초안")) return "자궁경부암 경고 기록";
  if (hasCervicalWarningSourceEvidence(symptom)) return "자궁경부암 경고 기록";
  return "증상 기록";
}

export function formatSymptomRecordSaveActionLabel(symptom: SymptomRecordLabelSource) {
  return `${formatSymptomRecordLabel(symptom)} 추가`;
}

export function formatSymptomRecordSavedStatusLabel(symptom: SymptomRecordLabelSource) {
  return `${formatSymptomRecordLabel(symptom)} 추가됨`;
}

export function hasSymptomRecordSourceEvidence(symptom: SymptomRecordLabelSource) {
  return [symptom.body, symptom.action].some((text) => Boolean(parseSourceEvidence(text).sourceLabel));
}
