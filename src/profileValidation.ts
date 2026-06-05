export type ProfileNumberField = "age" | "heightCm" | "weightKg" | "waistCm";

export type ProfileNumberValidation =
  | { type: "ok" }
  | { message: string; type: "error" };

const profileNumberFieldMessages: Record<ProfileNumberField, string> = {
  age: "나이는 0보다 크게 입력해주세요.",
  heightCm: "키는 0보다 크게 입력해주세요.",
  waistCm: "허리둘레는 0보다 크게 입력해주세요.",
  weightKg: "몸무게는 0보다 크게 입력해주세요.",
};

export function isProfileNumberField(field: string): field is ProfileNumberField {
  return field === "age" || field === "heightCm" || field === "weightKg" || field === "waistCm";
}

export function validateProfileNumberInput(
  field: ProfileNumberField,
  value: string,
): ProfileNumberValidation {
  const trimmed = value.trim();
  if (!trimmed) return { type: "ok" };

  const numericValue = Number(trimmed);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return {
      message: profileNumberFieldMessages[field],
      type: "error",
    };
  }

  return { type: "ok" };
}

export function sanitizeProfileNumberInput(
  field: ProfileNumberField,
  value: unknown,
  fallback: string,
) {
  const valueText = typeof value === "string" ? value : value == null ? "" : String(value);
  const validation = validateProfileNumberInput(field, valueText);
  return validation.type === "error" ? fallback : valueText;
}

export function formatProfileNumberDisplay(
  value: string,
  unit: string,
  missingLabel: string,
) {
  const trimmed = value.trim();
  const numericValue = Number(trimmed);
  if (!trimmed || !Number.isFinite(numericValue) || numericValue <= 0) {
    return missingLabel;
  }

  return `${trimmed}${unit}`;
}
