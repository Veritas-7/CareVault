export type LabPresetSex = "female" | "male" | "other";

export type LabPresetId =
  | "wbc"
  | "rbc"
  | "hematocrit"
  | "anc"
  | "hemoglobin"
  | "platelets"
  | "a1c"
  | "fasting-glucose"
  | "postprandial-glucose"
  | "bun"
  | "creatinine"
  | "egfr"
  | "uacr"
  | "albumin"
  | "total-protein"
  | "calcium"
  | "phosphate"
  | "uric-acid"
  | "sodium"
  | "potassium"
  | "total-cholesterol"
  | "ldl-cholesterol"
  | "hdl-cholesterol"
  | "triglyceride"
  | "ggt"
  | "ast"
  | "alt";

export type ResolvedLabPreset = {
  name: string;
  unit: string;
  lower: string;
  upper: string;
  note: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type LabPresetDraftSnapshot = Pick<ResolvedLabPreset, "lower" | "name" | "unit" | "upper">;

export type LabPresetDraftWithNoteSnapshot = LabPresetDraftSnapshot & {
  note?: string;
};

type LabPresetRange = {
  lower: string;
  upper: string;
};

export type LabPresetPreview = {
  label: string;
  name: string;
  unit: string;
  rangeLabel: string;
  applicabilityLabel: string;
  applicabilityDetail: string;
  note: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type LabPreset = {
  id: LabPresetId;
  label: string;
  name: string;
  unit: string;
  defaultRange: LabPresetRange;
  sexRanges?: Partial<Record<LabPresetSex, LabPresetRange>>;
  note: string;
  sourceLabel: string;
  sourceUrl: string;
};

const kdcaDiabetesSource = {
  sourceLabel: "질병관리청 국가건강정보포털 당뇨병",
  sourceUrl:
    "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5305",
} as const;

const kdcaDyslipidemiaSource = {
  sourceLabel: "질병관리청 국가건강정보포털 이상지질혈증 관리",
  sourceUrl:
    "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=124",
} as const;

const kdcaClinicalChemistrySource = {
  sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
  sourceUrl:
    "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
} as const;

const kdcaLiverFunctionSource = {
  sourceLabel: "질병관리청 국가건강정보포털 간기능검사",
  sourceUrl:
    "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5444",
} as const;

const kdcaChronicKidneyDiseaseSource = {
  sourceLabel: "질병관리청 국가건강정보포털 만성콩팥병",
  sourceUrl:
    "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5457",
} as const;

const kdaDiabetesTargetSource = {
  sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
  sourceUrl: "https://www.diabetes.or.kr/general/info/treat/treat_01.php",
} as const;

const asanHemoglobinSource = {
  sourceLabel: "서울아산병원 혈색소 검사 참고치",
  sourceUrl: "https://rso.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=119",
} as const;

const asanCompleteBloodCountSource = {
  sourceLabel: "서울아산병원 전혈구검사 참고치",
  sourceUrl: "https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126",
} as const;

const nccChemoSideEffectSource = {
  sourceLabel: "국가암정보센터 항암 부작용 증상 관리 지침",
  sourceUrl: "https://cancer.go.kr/download.do?uuid=d402e586-c237-419d-ae6f-da36d3b97109.pdf",
} as const;

export const labPresets: LabPreset[] = [
  {
    id: "wbc",
    label: "WBC 백혈구(CBC)",
    name: "WBC",
    unit: "10^3/uL",
    defaultRange: { lower: "4.0", upper: "10.0" },
    note: "서울아산병원 전혈구검사 참고치에서 WBC는 4,000-10,000/μL입니다. 치료 중 낮으면 감염 위험과 연결될 수 있어 결과지 기준과 함께 확인하세요.",
    ...asanCompleteBloodCountSource,
  },
  {
    id: "rbc",
    label: "RBC 적혈구수",
    name: "RBC",
    unit: "10^6/uL",
    defaultRange: { lower: "", upper: "" },
    sexRanges: {
      female: { lower: "4.0", upper: "5.4" },
      male: { lower: "4.2", upper: "6.3" },
    },
    note: "서울아산병원 전혈구검사 참고치에서 RBC는 남성 420만-630만/μL, 여성 400만-540만/μL입니다. 빈혈·탈수·출혈 맥락은 결과지와 진료팀 기준을 우선하세요.",
    ...asanCompleteBloodCountSource,
  },
  {
    id: "hematocrit",
    label: "Hct 적혈구용적률",
    name: "Hct",
    unit: "%",
    defaultRange: { lower: "", upper: "" },
    sexRanges: {
      female: { lower: "36", upper: "46" },
      male: { lower: "38", upper: "53" },
    },
    note: "서울아산병원 전혈구검사 참고치에서 Hct는 남성 38-53%, 여성 36-46%입니다. 탈수·출혈·빈혈 판단은 결과지와 진료팀 기준을 우선하세요.",
    ...asanCompleteBloodCountSource,
  },
  {
    id: "anc",
    label: "ANC 절대호중구수",
    name: "ANC",
    unit: "10^3/uL",
    defaultRange: { lower: "1.5", upper: "" },
    note: "항암 중 감염 위험 확인에 중요합니다. ANC 0.5 미만과 발열은 진료팀 기준으로 즉시 확인하세요.",
    ...nccChemoSideEffectSource,
  },
  {
    id: "hemoglobin",
    label: "Hgb 헤모글로빈",
    name: "Hgb",
    unit: "g/dL",
    defaultRange: { lower: "", upper: "" },
    sexRanges: {
      female: { lower: "12", upper: "16" },
      male: { lower: "13", upper: "17" },
    },
    note: "빈혈 추적에 자주 쓰입니다. 성별 참고치를 채우되 검사실마다 기준이 다를 수 있어 결과지 기준을 우선하세요.",
    ...asanHemoglobinSource,
  },
  {
    id: "platelets",
    label: "PLT 혈소판",
    name: "PLT",
    unit: "10^3/uL",
    defaultRange: { lower: "150", upper: "450" },
    note: "출혈/골수억제 추적에 자주 쓰입니다. 치료 일정과 멍, 코피, 출혈 증상을 함께 기록하세요.",
    ...asanCompleteBloodCountSource,
  },
  {
    id: "a1c",
    label: "HbA1c 당화혈색소",
    name: "HbA1c",
    unit: "%",
    defaultRange: { lower: "", upper: "5.6" },
    note: "대한당뇨병학회/KDCA 기준에서 5.7~6.4%는 당뇨병 전단계, 6.5% 이상은 진단 기준 범위입니다. 개인 목표는 치료 상태에 따라 의료진과 정하세요.",
    ...kdcaDiabetesSource,
  },
  {
    id: "fasting-glucose",
    label: "FPG 공복혈당",
    name: "FPG",
    unit: "mg/dL",
    defaultRange: { lower: "", upper: "99" },
    note: "대한당뇨병학회/KDCA 기준에서 공복혈당 100~125 mg/dL은 공복혈당장애, 126 mg/dL 이상은 진단 기준 범위입니다.",
    ...kdcaDiabetesSource,
  },
  {
    id: "postprandial-glucose",
    label: "PP2 식후 2시간 혈당",
    name: "PP2 glucose",
    unit: "mg/dL",
    defaultRange: { lower: "", upper: "139" },
    note: "대한당뇨병학회/KDCA 기준에서 75g 경구당부하 2시간 혈당 140~199 mg/dL은 내당능장애, 200 mg/dL 이상은 진단 기준 범위입니다.",
    ...kdcaDiabetesSource,
  },
  {
    id: "bun",
    label: "BUN 요소질소",
    name: "BUN",
    unit: "mg/dL",
    defaultRange: { lower: "10", upper: "26" },
    note: "KDCA 임상화학 검사 참고범위에서 BUN은 10-26 mg/dL입니다. 탈수, 단백질 섭취, 간·신장 상태 등 영향을 받을 수 있어 크레아티닌, 소변검사, 진료팀 기준과 함께 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "creatinine",
    label: "Cr 크레아티닌",
    name: "Cr",
    unit: "mg/dL",
    defaultRange: { lower: "0.7", upper: "1.4" },
    note: "KDCA 임상화학 검사 참고범위에서 성인 Cr은 0.7-1.4 mg/dL입니다. 근육량, 임신, 수분 상태 영향을 받을 수 있어 eGFR, 소변검사, 진료팀 기준과 함께 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "egfr",
    label: "eGFR 추정 사구체여과율",
    name: "eGFR",
    unit: "mL/min/1.73m²",
    defaultRange: { lower: "60", upper: "" },
    note: "KDCA 만성콩팥병 정보에서 eGFR 60 mL/min/1.73m² 미만이 3개월 이상 지속되면 만성콩팥병 기준 가능성이 있습니다. 알부민뇨, 혈뇨, 소변검사, 혈청 Cr, 영상검사, 진료팀 기준과 함께 확인하세요.",
    ...kdcaChronicKidneyDiseaseSource,
  },
  {
    id: "uacr",
    label: "UACR 소변 알부민/Cr 비",
    name: "UACR",
    unit: "mg/g",
    defaultRange: { lower: "", upper: "29" },
    note: "KDCA 만성콩팥병 정보에서 알부민뇨는 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 단계로 나뉩니다. 소변 정량검사, eGFR, 혈청 Cr, 혈뇨 여부, 진료팀 기준과 함께 확인하세요.",
    ...kdcaChronicKidneyDiseaseSource,
  },
  {
    id: "albumin",
    label: "Alb 알부민",
    name: "Albumin",
    unit: "g/dL",
    defaultRange: { lower: "3.3", upper: "5.2" },
    note: "KDCA 임상화학 검사 참고범위에서 혈청 알부민은 3.3-5.2 g/dL입니다. 간질환, 신장질환, 영양 결핍, 단백 소실, 만성 염증, 탈수 영향을 결과지와 진료팀 기준으로 함께 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "total-protein",
    label: "TP 총단백",
    name: "Total protein",
    unit: "g/dL",
    defaultRange: { lower: "6.0", upper: "8.0" },
    note: "KDCA 임상화학 검사 참고범위에서 총단백은 6.0-8.0 g/dL입니다. 알부민과 함께 간질환, 신장질환, 영양 결핍, 단백 소실, 만성 염증, 탈수 영향을 결과지와 진료팀 기준으로 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "calcium",
    label: "Ca 칼슘",
    name: "Calcium",
    unit: "mg/dL",
    defaultRange: { lower: "8.8", upper: "10.5" },
    note: "KDCA 임상화학 검사 참고범위에서 칼슘은 8.8-10.5 mg/dL입니다. 뼈 전이 암, 갑상선기능항진증, 비타민D 과다, 부갑상선저하증, 신부전, 영양 상태, 알부민 감소 영향을 결과지와 진료팀 기준으로 함께 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "phosphate",
    label: "P 인산",
    name: "Phosphate",
    unit: "mg/dL",
    defaultRange: { lower: "2.5", upper: "4.5" },
    note: "KDCA 임상화학 검사 참고범위에서 성인 인산은 2.5-4.5 mg/dL입니다. 신부전, 부갑상선 기능, 칼슘·비타민D 균형, 이뇨제·제산제, 영양 상태를 결과지와 진료팀 기준으로 함께 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "uric-acid",
    label: "UA 요산",
    name: "Uric acid",
    unit: "mg/dL",
    defaultRange: { lower: "3", upper: "7" },
    note: "KDCA 임상화학 검사 참고범위에서 요산은 3-7 mg/dL입니다. 남성이 여성보다 0.5-1.5 mg/dL 정도 높을 수 있고 전이암, 다발골수종, 백혈병, 항암치료, 신장 배설 변화와 함께 결과지와 진료팀 기준으로 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "sodium",
    label: "Na 나트륨",
    name: "Na",
    unit: "mmol/L",
    defaultRange: { lower: "135", upper: "145" },
    note: "KDCA 임상화학 검사 참고범위에서 나트륨은 135-145 mmol/L입니다. 구토, 설사, 탈수, 수분 섭취, 신장 상태, 약물 영향을 함께 기록하고 결과지 기준을 우선하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "potassium",
    label: "K 칼륨",
    name: "K",
    unit: "mmol/L",
    defaultRange: { lower: "3.5", upper: "5.5" },
    note: "KDCA 임상화학 검사 참고범위에서 칼륨은 3.5-5.5 mmol/L입니다. 심장박동, 신장 기능, 탈수, 설사, 약물 영향과 함께 진료팀 기준으로 확인하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "total-cholesterol",
    label: "총콜레스테롤",
    name: "Total cholesterol",
    unit: "mg/dL",
    defaultRange: { lower: "", upper: "199" },
    note:
      "KDCA 심뇌혈관질환 고위험군 관리 자료의 이상지질혈증 분류 표를 기준으로 한 적정 범위 보조값입니다. 개인 목표는 심혈관 위험도와 치료 상태에 따라 달라질 수 있습니다.",
    ...kdcaDyslipidemiaSource,
  },
  {
    id: "ldl-cholesterol",
    label: "LDL 콜레스테롤",
    name: "LDL-C",
    unit: "mg/dL",
    defaultRange: { lower: "", upper: "99" },
    note:
      "KDCA 심뇌혈관질환 고위험군 관리 자료의 이상지질혈증 분류 표를 기준으로 한 적정 범위 보조값입니다. 당뇨병이나 심혈관질환 위험도에 따라 목표가 더 낮아질 수 있습니다.",
    ...kdcaDyslipidemiaSource,
  },
  {
    id: "hdl-cholesterol",
    label: "HDL 콜레스테롤",
    name: "HDL-C",
    unit: "mg/dL",
    defaultRange: { lower: "40", upper: "" },
    sexRanges: {
      female: { lower: "50", upper: "" },
      male: { lower: "40", upper: "" },
    },
    note: "대한당뇨병학회 일반 목표 기준에서 HDL은 남성 40 mg/dL 이상, 여성 50 mg/dL 이상을 보조 기준으로 사용합니다.",
    ...kdaDiabetesTargetSource,
  },
  {
    id: "triglyceride",
    label: "TG 중성지방",
    name: "TG",
    unit: "mg/dL",
    defaultRange: { lower: "", upper: "149" },
    note:
      "KDCA 심뇌혈관질환 고위험군 관리 자료의 이상지질혈증 분류 표에서 중성지방 150 mg/dL 이상은 경계 이상입니다. 금식 여부와 검사실 기준을 함께 확인하세요.",
    ...kdcaDyslipidemiaSource,
  },
  {
    id: "ggt",
    label: "GGT 감마지티피",
    name: "GGT",
    unit: "IU/L",
    defaultRange: { lower: "", upper: "" },
    sexRanges: {
      female: { lower: "8", upper: "35" },
      male: { lower: "11", upper: "63" },
    },
    note: "KDCA 임상화학 검사 참고범위에서 GGT는 남성 11-63 IU/L, 여성 8-35 IU/L로 나뉩니다. 간담도·음주·약물 영향이 있을 수 있어 결과지와 진료팀 기준을 우선하세요.",
    ...kdcaClinicalChemistrySource,
  },
  {
    id: "ast",
    label: "AST 간기능",
    name: "AST",
    unit: "IU/L",
    defaultRange: { lower: "0", upper: "40" },
    note: "KDCA 간기능검사 참고범위에서 AST는 0-40 IU/L입니다. 간세포 외 심장·근육·혈구 등에도 있어 단독 진단이 아니라 증상, 약물, 다른 검사와 함께 확인하세요.",
    ...kdcaLiverFunctionSource,
  },
  {
    id: "alt",
    label: "ALT 간기능",
    name: "ALT",
    unit: "IU/L",
    defaultRange: { lower: "0", upper: "40" },
    note: "KDCA 간기능검사 참고범위에서 ALT는 0-40 IU/L입니다. 주로 간에 존재하지만 결과 해석은 검사실 참고치와 진료팀 기준을 우선하세요.",
    ...kdcaLiverFunctionSource,
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
    sourceLabel: preset.sourceLabel,
    sourceUrl: preset.sourceUrl,
  };
}

export function formatLabPresetRangeLabel(preset: Pick<ResolvedLabPreset, "lower" | "unit" | "upper">) {
  const unitSuffix = preset.unit ? ` ${preset.unit}` : "";
  if (preset.lower && preset.upper) return `${preset.lower}-${preset.upper}${unitSuffix}`;
  if (preset.lower) return `${preset.lower}${unitSuffix} 이상`;
  if (preset.upper) return `${preset.upper}${unitSuffix} 이하`;
  return "검사실 기준 직접 확인";
}

export function formatLabPresetApplicabilityLabel(presetId: string, sex: LabPresetSex = "other") {
  const preset = labPresets.find((candidate) => candidate.id === presetId);
  if (!preset) return "";
  if (!preset.sexRanges) return "성인 공통 입력 보조값";
  if (sex === "female") return "여성 기준 적용";
  if (sex === "male") return "남성 기준 적용";
  return "성별 미지정: 기본 보조값 적용";
}

export function formatLabPresetApplicabilityDetail(presetId: string, sex: LabPresetSex = "other") {
  const preset = labPresets.find((candidate) => candidate.id === presetId);
  if (!preset) return "";
  if (!preset.sexRanges) {
    if (["total-cholesterol", "ldl-cholesterol", "triglyceride"].includes(preset.id)) {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. 총콜레스테롤·LDL·TG 같은 공통 지질 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.";
    }
    if (["ast", "alt"].includes(preset.id)) {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. AST/ALT 같은 성인 공통 간기능 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.";
    }
    if (["bun", "creatinine", "egfr", "uacr"].includes(preset.id)) {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. BUN/Cr/eGFR/UACR 같은 성인 공통 신기능 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.";
    }
    if (preset.id === "albumin") {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. 혈청 알부민 같은 성인 공통 단백·영양/간기능 보조 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.";
    }
    if (preset.id === "total-protein") {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. 총단백 같은 성인 공통 단백·영양/간기능 보조 프리셋은 알부민, 간·신장, 영양, 염증, 탈수 맥락과 결과지 기준을 함께 확인하세요.";
    }
    if (preset.id === "calcium") {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. 칼슘 같은 성인 공통 골·신장·영양 보조 프리셋은 알부민, 신장 기능, 비타민D, 뼈 전이 암 맥락과 결과지 기준을 함께 확인하세요.";
    }
    if (preset.id === "phosphate") {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. 인산 같은 성인 공통 골·신장·전해질 보조 프리셋은 칼슘, 비타민D, 부갑상선, 신장 기능, 영양 맥락과 결과지 기준을 함께 확인하세요.";
    }
    if (preset.id === "uric-acid") {
      return "기본 3-7 mg/dL 참고 범위를 채우되, KDCA는 남성이 여성보다 약간 높을 수 있다고 설명합니다. 결과지 성별 기준과 진료팀 기준을 우선하고 프로필 성별 변경은 이 값을 자동 변경하지 않습니다.";
    }
    if (["sodium", "potassium"].includes(preset.id)) {
      return "성별과 관계없이 같은 참고 범위를 채웁니다. Na/K 같은 성인 공통 전해질 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.";
    }
    return "성별과 관계없이 같은 참고 범위를 채웁니다. 이 성인 공통 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.";
  }
  if (sex === "female") {
    return "현재 프로필의 여성 기준을 채웁니다. 사용자가 범위나 메모를 직접 고친 뒤에는 성별 변경이 그 값을 덮어쓰지 않습니다.";
  }
  if (sex === "male") {
    return "현재 프로필의 남성 기준을 채웁니다. 사용자가 범위나 메모를 직접 고친 뒤에는 성별 변경이 그 값을 덮어쓰지 않습니다.";
  }
  return "성별 미지정 기본값을 채웁니다. 프로필 성별을 여성 또는 남성으로 바꾸면 Hgb/RBC/Hct/HDL/GGT 같은 성별 프리셋의 범위와 자동 메모 기준만 갱신될 수 있습니다.";
}

export function buildLabPresetPreview(
  presetId: string,
  sex: LabPresetSex = "other",
): LabPresetPreview | null {
  const preset = labPresets.find((candidate) => candidate.id === presetId);
  const resolved = resolveLabPreset(presetId, sex);
  if (!preset || !resolved) return null;

  return {
    label: preset.label,
    name: resolved.name,
    unit: resolved.unit,
    rangeLabel: formatLabPresetRangeLabel(resolved),
    applicabilityLabel: formatLabPresetApplicabilityLabel(presetId, sex),
    applicabilityDetail: formatLabPresetApplicabilityDetail(presetId, sex),
    note: resolved.note,
    sourceLabel: resolved.sourceLabel,
    sourceUrl: resolved.sourceUrl,
  };
}

export function formatLabPresetSourceEvidence(
  preset: Pick<ResolvedLabPreset, "sourceLabel" | "sourceUrl">,
) {
  return preset.sourceUrl.startsWith("https://")
    ? `출처: ${preset.sourceLabel} - ${preset.sourceUrl}`
    : `출처: ${preset.sourceLabel}`;
}

export function formatLabPresetNoteWithSource(
  preset: ResolvedLabPreset,
  applicabilityLabel = "",
) {
  return [
    preset.note,
    applicabilityLabel ? `적용 기준: ${applicabilityLabel}` : "",
    formatLabPresetSourceEvidence(preset),
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatLabPresetSexSyncStatusLabel(
  presetId: string,
  nextSex: LabPresetSex,
) {
  const presetLabel = labPresets.find((candidate) => candidate.id === presetId)?.label ?? "선택한 프리셋";
  const targetLabel =
    nextSex === "female"
      ? "여성 기준으로"
      : nextSex === "male"
        ? "남성 기준으로"
        : "성별 미지정 기본값으로";

  return `${presetLabel} ${targetLabel} 갱신`;
}

export function resolveLabPresetSexChange(
  presetId: string,
  previousSex: LabPresetSex,
  nextSex: LabPresetSex,
  currentDraft: LabPresetDraftSnapshot,
): ResolvedLabPreset | null {
  const previousPreset = resolveLabPreset(presetId, previousSex);
  const nextPreset = resolveLabPreset(presetId, nextSex);
  if (!previousPreset || !nextPreset) return null;

  const stillUsingPresetRange =
    currentDraft.name === previousPreset.name &&
    currentDraft.unit === previousPreset.unit &&
    currentDraft.lower === previousPreset.lower &&
    currentDraft.upper === previousPreset.upper;

  return stillUsingPresetRange ? nextPreset : null;
}

export function resolveLabPresetSexChangeDraft(
  presetId: string,
  previousSex: LabPresetSex,
  nextSex: LabPresetSex,
  currentDraft: LabPresetDraftWithNoteSnapshot,
): ResolvedLabPreset | null {
  const previousPreset = resolveLabPreset(presetId, previousSex);
  const nextPreset = resolveLabPresetSexChange(presetId, previousSex, nextSex, currentDraft);
  if (!previousPreset || !nextPreset) return null;

  const previousApplicability = buildLabPresetPreview(presetId, previousSex)?.applicabilityLabel;
  const nextApplicability = buildLabPresetPreview(presetId, nextSex)?.applicabilityLabel;
  const previousAutoNote = formatLabPresetNoteWithSource(previousPreset, previousApplicability);
  const nextAutoNote = formatLabPresetNoteWithSource(nextPreset, nextApplicability);
  const currentNote = currentDraft.note ?? "";
  const shouldRefreshNote = !currentNote.trim() || currentNote.trim() === previousAutoNote.trim();

  return {
    ...nextPreset,
    note: shouldRefreshNote ? nextAutoNote : currentNote,
  };
}
