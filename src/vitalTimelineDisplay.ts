import type { BloodGlucoseOptions } from "./healthRules";
import {
  buildVitalAssessmentEvidence,
  formatVitalAssessmentSource,
  type VitalAssessmentEvidenceRecord,
} from "./vitalAssessmentEvidence";

export type VitalTimelineDisplayParts = {
  compactSourceEvidence: string;
  sourceEvidence: string;
  sourceLabel: string;
  sourceUrl: string;
};

export function buildVitalTimelineDisplayParts(
  record: VitalAssessmentEvidenceRecord,
  options: BloodGlucoseOptions = {},
): VitalTimelineDisplayParts {
  const evidence = buildVitalAssessmentEvidence(record, options);
  const sourceLabel = evidence?.standard?.sourceLabel ?? "";
  const sourceUrl = evidence?.standard?.sourceUrl ?? "";
  const source = evidence ? formatVitalAssessmentSource(evidence) : "";

  return {
    compactSourceEvidence: sourceLabel ? `근거: ${sourceLabel}` : "",
    sourceEvidence: source ? `근거: ${source}` : "",
    sourceLabel,
    sourceUrl,
  };
}
