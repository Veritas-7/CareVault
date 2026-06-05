import { formatSourceEvidence, parseSourceEvidence } from "./sourceEvidence";

export type SymptomDisplaySource = {
  action: string;
  body: string;
};

export type SymptomDisplayParts = {
  body: string;
  compactSourceEvidence: string;
  sourceEvidence: string;
  sourceLabel: string;
  sourceUrl: string;
};

export function buildSymptomDisplayParts(symptom: SymptomDisplaySource): SymptomDisplayParts {
  const primaryText = symptom.action || symptom.body;
  const primaryEvidence = parseSourceEvidence(primaryText);
  const secondaryText = symptom.action ? symptom.body : symptom.action;
  const secondaryEvidence = primaryEvidence.sourceLabel
    ? { sourceLabel: "", sourceUrl: "" }
    : parseSourceEvidence(secondaryText);
  const sourceLabel = primaryEvidence.sourceLabel || secondaryEvidence.sourceLabel;
  const sourceUrl = primaryEvidence.sourceUrl || secondaryEvidence.sourceUrl;

  return {
    body: primaryEvidence.body || primaryText,
    compactSourceEvidence: sourceLabel ? `근거: ${sourceLabel}` : "",
    sourceEvidence: formatSourceEvidence(sourceLabel, sourceUrl),
    sourceLabel,
    sourceUrl,
  };
}
