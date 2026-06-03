export type LabPresetSex = "female" | "male" | "other";

export type LabPresetId =
  | "wbc"
  | "anc"
  | "hemoglobin"
  | "platelets"
  | "a1c"
  | "fasting-glucose";

export type ResolvedLabPreset = {
  name: string;
  unit: string;
  lower: string;
  upper: string;
  note: string;
};

type LabPresetRange = {
  lower: string;
  upper: string;
};

export type LabPreset = {
  id: LabPresetId;
  label: string;
  name: string;
  unit: string;
  defaultRange: LabPresetRange;
  sexRanges?: Partial<Record<LabPresetSex, LabPresetRange>>;
  note: string;
};

export const labPresets: LabPreset[] = [
  {
    id: "wbc",
    label: "WBC 백혈구(CBC)",
    name: "WBC",
    unit: "10^3/uL",
    defaultRange: { lower: "4.5", upper: "11.0" },
    note: "CBC 백혈구 수치입니다. 치료 중 낮으면 감염 위험과 연결될 수 있어 결과지 기준과 함께 확인하세요.",
  },
  {
    id: "anc",
    label: "ANC 절대호중구수",
    name: "ANC",
    unit: "10^3/uL",
    defaultRange: { lower: "1.5", upper: "" },
    note: "항암 중 감염 위험 확인에 중요합니다. ANC 0.5 미만은 감염 고위험으로 알려져 발열/증상과 함께 즉시 확인하세요.",
  },
  {
    id: "hemoglobin",
    label: "Hgb 헤모글로빈",
    name: "Hgb",
    unit: "g/dL",
    defaultRange: { lower: "", upper: "" },
    sexRanges: {
      female: { lower: "12", upper: "16" },
      male: { lower: "13", upper: "18" },
    },
    note: "빈혈 추적에 자주 쓰입니다. 성별과 검사실마다 기준이 다를 수 있어 결과지 기준을 우선하세요.",
  },
  {
    id: "platelets",
    label: "PLT 혈소판",
    name: "PLT",
    unit: "10^3/uL",
    defaultRange: { lower: "150", upper: "400" },
    note: "출혈/골수억제 추적에 자주 쓰입니다. 치료 일정과 멍, 코피, 출혈 증상을 함께 기록하세요.",
  },
  {
    id: "a1c",
    label: "HbA1c 당화혈색소",
    name: "HbA1c",
    unit: "%",
    defaultRange: { lower: "", upper: "5.6" },
    note: "CDC/ADA 기준에서 5.7%부터 전당뇨 범위입니다. 개인 목표는 치료 상태에 따라 의료진과 정하세요.",
  },
  {
    id: "fasting-glucose",
    label: "FPG 공복혈당",
    name: "FPG",
    unit: "mg/dL",
    defaultRange: { lower: "", upper: "99" },
    note: "CDC/ADA 기준에서 공복혈당 100 mg/dL부터 전당뇨 범위입니다. 측정 시점과 식사 여부를 같이 남기세요.",
  },
];

export function resolveLabPreset(
  presetId: string,
  sex: LabPresetSex = "other",
): ResolvedLabPreset | null {
  const preset = labPresets.find((candidate) => candidate.id === presetId);
  if (!preset) return null;

  const range = preset.sexRanges?.[sex] ?? preset.defaultRange;
  return {
    name: preset.name,
    unit: preset.unit,
    lower: range.lower,
    upper: range.upper,
    note: preset.note,
  };
}
