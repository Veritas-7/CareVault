export type VitalDraftForValidation = {
  diastolic?: number;
  glucoseMgDl?: number;
  systolic?: number;
  temperatureC?: number;
  type: "blood-pressure" | "glucose" | "temperature";
};

export type VitalDraftValidationResult =
  | {
      type: "ok";
      values: {
        diastolic?: number;
        glucoseMgDl?: number;
        systolic?: number;
        temperatureC?: number;
      };
    }
  | {
      message: string;
      type: "error";
    };

export function parseOptionalNumberInput(value: string) {
  if (!value.trim()) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isPositiveMeasurement(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined && value > 0;
}

export function validateVitalDraft(draft: VitalDraftForValidation): VitalDraftValidationResult {
  if (draft.type === "blood-pressure") {
    if (!isPositiveMeasurement(draft.systolic) || !isPositiveMeasurement(draft.diastolic)) {
      return {
        message: "혈압 수축기와 이완기를 0보다 크게 입력해주세요.",
        type: "error",
      };
    }

    return {
      type: "ok",
      values: {
        diastolic: draft.diastolic,
        systolic: draft.systolic,
      },
    };
  }

  if (draft.type === "temperature") {
    if (!isPositiveMeasurement(draft.temperatureC)) {
      return {
        message: "체온 값을 0보다 크게 입력해주세요.",
        type: "error",
      };
    }

    return {
      type: "ok",
      values: {
        temperatureC: draft.temperatureC,
      },
    };
  }

  if (!isPositiveMeasurement(draft.glucoseMgDl)) {
    return {
      message: "혈당 값을 0보다 크게 입력해주세요.",
      type: "error",
    };
  }

  return {
    type: "ok",
    values: {
      glucoseMgDl: draft.glucoseMgDl,
    },
  };
}
