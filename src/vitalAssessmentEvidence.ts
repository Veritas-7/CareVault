import {
  assessBloodGlucose,
  assessBloodPressure,
  assessTemperature,
  type BloodGlucoseOptions,
  type GlucoseContext,
  type HealthAssessment,
} from "./healthRules";
import {
  formatHealthStandardSource,
  getHealthStandardCoverage,
  type HealthStandardCoverage,
} from "./healthStandards";

export type VitalAssessmentEvidenceRecord = {
  diastolic?: number;
  glucoseContext?: GlucoseContext;
  glucoseMgDl?: number;
  systolic?: number;
  temperatureC?: number;
  type: string;
};

export type VitalAssessmentEvidence = {
  assessment: HealthAssessment;
  standard: HealthStandardCoverage | null;
  standardId: string;
};

function isPositiveMeasurement(value: number | undefined): value is number {
  return Number.isFinite(value) && value !== undefined && value > 0;
}

export function buildVitalAssessmentEvidence(
  record: VitalAssessmentEvidenceRecord,
  options: BloodGlucoseOptions = {},
): VitalAssessmentEvidence | null {
  if (
    record.type === "blood-pressure"
    && isPositiveMeasurement(record.systolic)
    && isPositiveMeasurement(record.diastolic)
  ) {
    const assessment = assessBloodPressure(record.systolic, record.diastolic);
    const standardId = assessment.standardId ?? "blood-pressure";
    return {
      assessment,
      standard: getHealthStandardCoverage(standardId) ?? null,
      standardId,
    };
  }

  if (record.type === "glucose" && isPositiveMeasurement(record.glucoseMgDl)) {
    const assessment = assessBloodGlucose(
      record.glucoseMgDl,
      record.glucoseContext ?? "random",
      options,
    );
    const standardId = assessment.standardId ?? (options.diabetes ? "glucose-care" : "glucose-screening");
    return {
      assessment,
      standard: getHealthStandardCoverage(standardId) ?? null,
      standardId,
    };
  }

  if (record.type === "temperature" && isPositiveMeasurement(record.temperatureC)) {
    const assessment = assessTemperature(record.temperatureC);
    const standardId = assessment.standardId ?? "infection-fever";
    return {
      assessment,
      standard: getHealthStandardCoverage(standardId) ?? null,
      standardId,
    };
  }

  return null;
}

export function formatVitalAssessmentStandardLabel(evidence: VitalAssessmentEvidence) {
  return evidence.standard
    ? `${evidence.standard.sexApplicability} ${evidence.standard.label}`
    : evidence.standardId;
}

export function formatVitalAssessmentStatus(evidence: VitalAssessmentEvidence) {
  return `${evidence.assessment.label} · ${formatVitalAssessmentStandardLabel(evidence)}`;
}

export function formatVitalAssessmentSource(evidence: VitalAssessmentEvidence) {
  return evidence.standard ? formatHealthStandardSource(evidence.standard) : "";
}
