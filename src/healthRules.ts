export type HealthLevel = "ok" | "watch" | "risk" | "neutral";
export type GlucoseContext = "fasting" | "before-meal" | "after-meal" | "bedtime" | "random";

export type HealthAssessment = {
  level: HealthLevel;
  label: string;
  standardId?: string;
  summary: string;
};

export type HealthSex = "female" | "male" | "other";

export type BloodGlucoseOptions = {
  diabetes?: boolean;
};

export type BmiAssessment = HealthAssessment & {
  value: number | null;
};

export type WaistAssessment = HealthAssessment & {
  thresholdCm: number | null;
  value: number | null;
};

export type FoodGuidanceSourceId =
  | "nccPreventionDiet"
  | "nccSideEffectDiet"
  | "nccImmuneLowDiet"
  | "nccComplementaryTherapy"
  | "kdcaNutrition"
  | "kdcaAlcohol";

export type FoodMatch = {
  term: string;
  level: "ok" | "watch" | "risk";
  reason: string;
  sourceId: FoodGuidanceSourceId;
  sourceLabel: string;
  sourceUrl: string;
};

export type FoodMatchSourceLinkLabels = {
  ariaLabel: string;
  title: string;
  visibleLabel: string;
};

export type LabFlag = "low" | "normal" | "high" | "unknown";

export type LabAssessment = HealthAssessment & {
  flag: LabFlag;
};

export type FoodAssessment = HealthAssessment & {
  matches: FoodMatch[];
};

export const formatFoodMatchEvidence = (
  match: Pick<FoodMatch, "term" | "reason" | "sourceLabel" | "sourceUrl">,
) => `${match.term}: ${match.reason} (${match.sourceLabel} - ${match.sourceUrl})`;

export function buildFoodMatchSourceLinkLabels(
  match: Pick<FoodMatch, "reason" | "sourceLabel" | "term">,
): FoodMatchSourceLinkLabels {
  const label = `${match.term} 음식 판단 근거 ${match.sourceLabel} 열기 - ${match.reason}`;
  return {
    ariaLabel: label,
    title: label,
    visibleLabel: match.sourceLabel,
  };
}

export const foodGuidanceSources: Record<
  FoodGuidanceSourceId,
  { label: string; url: string }
> = {
  nccPreventionDiet: {
    label: "국가암정보센터 암예방 식이",
    url: "https://cancer.go.kr/lay1/S1T226C230/contents.do",
  },
  nccSideEffectDiet: {
    label: "국가암정보센터 치료부작용시 식생활",
    url: "https://www.cancer.go.kr/lay1/S1T477C478/contents.do",
  },
  nccImmuneLowDiet: {
    label: "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    url: "https://cancer.go.kr/lay1/S1T479C489/contents.do",
  },
  nccComplementaryTherapy: {
    label: "국가암정보센터 보완대체요법 상담",
    url: "https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
  },
  kdcaNutrition: {
    label: "질병관리청 국가건강정보포털 식이영양",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6693",
  },
  kdcaAlcohol: {
    label: "질병관리청 국가건강정보포털 위험음주",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5355",
  },
};

export const koreanHealthStandardSummary = {
  bmi: "대한비만학회 한국인 성인 BMI: 정상 18.5-22.9, 비만전단계 23-24.9, 비만 25 이상",
  bloodPressure: "대한고혈압학회/KDCA 성인 혈압: 정상 <120/<80, 고혈압전단계 130-139 또는 80-89, 고혈압 140/90 이상",
  glucose: "대한당뇨병학회/KDCA 혈당: 비당뇨 선별 기준과 당뇨 관리 목표를 분리 적용",
  waist: "대한비만학회 한국인 복부비만: 남성 90cm 이상, 여성 85cm 이상",
} as const;

type FoodRuleTerm = [term: string, reason: string, sourceId: FoodGuidanceSourceId];

const supportiveFoods: FoodRuleTerm[] = [
  ["브로콜리", "채소 중심 식단에 적합", "nccPreventionDiet"],
  ["양배추", "십자화과 채소", "nccPreventionDiet"],
  ["케일", "짙은 잎채소", "nccPreventionDiet"],
  ["시금치", "짙은 잎채소", "nccPreventionDiet"],
  ["블루베리", "과일 다양성에 도움", "nccPreventionDiet"],
  ["딸기", "과일 다양성에 도움", "nccPreventionDiet"],
  ["사과", "과일 다양성에 도움", "nccPreventionDiet"],
  ["토마토", "채소 다양성에 도움", "nccPreventionDiet"],
  ["콩", "식물성 단백질과 섬유질", "kdcaNutrition"],
  ["두부", "식물성 단백질", "kdcaNutrition"],
  ["현미", "통곡물", "nccPreventionDiet"],
  ["귀리", "통곡물", "nccPreventionDiet"],
  ["견과", "불포화지방과 간식 대체", "kdcaNutrition"],
  ["호두", "견과류", "kdcaNutrition"],
  ["생선", "단백질 공급원", "nccSideEffectDiet"],
  ["요거트", "단백질과 섭취 용이성", "nccPreventionDiet"],
];

const limitFoods: FoodRuleTerm[] = [
  ["술", "암 예방 관점에서 제한 권고", "kdcaAlcohol"],
  ["알코올", "암 예방 관점에서 제한 권고", "kdcaAlcohol"],
  ["맥주", "알코올", "kdcaAlcohol"],
  ["와인", "알코올", "kdcaAlcohol"],
  ["소시지", "가공육", "nccPreventionDiet"],
  ["베이컨", "가공육", "nccPreventionDiet"],
  ["햄", "가공육", "nccPreventionDiet"],
  ["핫도그", "가공육", "nccPreventionDiet"],
  ["살라미", "가공육", "nccPreventionDiet"],
  ["탄산음료", "당음료", "kdcaNutrition"],
  ["설탕음료", "당음료", "kdcaNutrition"],
  ["가당음료", "당음료", "kdcaNutrition"],
  ["튀김", "치료 중 소화 불편 가능", "nccSideEffectDiet"],
  ["기름진", "치료 중 소화 불편 가능", "nccSideEffectDiet"],
];

const careTeamFoods: FoodRuleTerm[] = [
  ["자몽", "약물 상호작용 확인 필요", "kdcaNutrition"],
  ["보충제", "치료 상호작용 확인 필요", "nccComplementaryTherapy"],
  ["영양제", "치료 상호작용 확인 필요", "nccComplementaryTherapy"],
  ["생굴", "면역저하 시 익히지 않은 음식 주의", "nccImmuneLowDiet"],
  ["회", "면역저하 시 날음식 주의", "nccImmuneLowDiet"],
  ["날계란", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["비살균", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
];

function createFoodMatch(
  term: string,
  level: FoodMatch["level"],
  reason: string,
  sourceId: FoodGuidanceSourceId,
): FoodMatch {
  const source = foodGuidanceSources[sourceId];
  return {
    term,
    level,
    reason,
    sourceId,
    sourceLabel: source.label,
    sourceUrl: source.url,
  };
}

export function calculateBmi(heightCm: number, weightKg: number): BmiAssessment {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) {
    return {
      value: null,
      level: "neutral",
      label: "정보 부족",
      summary: "키와 몸무게를 입력하면 BMI가 계산됩니다.",
    };
  }

  const meters = heightCm / 100;
  const value = weightKg / (meters * meters);

  if (value < 18.5) {
    return {
      value,
      level: "watch",
      label: "저체중",
      summary: "치료 중 체중 감소가 있으면 의료진과 상의가 필요합니다.",
    };
  }
  if (value < 23) {
    return {
      value,
      level: "ok",
      label: "정상 체중 범위",
      summary: "한국인 성인 BMI 기준 정상 범위입니다.",
    };
  }
  if (value < 25) {
    return {
      value,
      level: "watch",
      label: "비만전단계",
      summary: "한국인 기준에서 비만전단계입니다. 허리둘레, 혈압, 혈당 추세를 함께 보세요.",
    };
  }
  if (value < 30) {
    return {
      value,
      level: "risk",
      label: "1단계 비만",
      summary: "한국인 성인 BMI 기준 1단계 비만 범위입니다.",
    };
  }
  if (value < 35) {
    return {
      value,
      level: "risk",
      label: "2단계 비만",
      summary: "한국인 성인 BMI 기준 2단계 비만 범위입니다.",
    };
  }
  return {
    value,
    level: "risk",
    label: "3단계 비만",
    summary: "한국인 성인 BMI 기준 고도비만 범위입니다. BMI는 선별 지표이며 진단은 의료진 평가가 필요합니다.",
  };
}

export function assessWaistCircumference(
  waistCm: number,
  sex: HealthSex,
): WaistAssessment {
  if (!Number.isFinite(waistCm) || waistCm <= 0) {
    return {
      value: null,
      thresholdCm: sex === "male" ? 90 : sex === "female" ? 85 : null,
      level: "neutral",
      label: "정보 부족",
      summary: "허리둘레를 입력하면 한국인 복부비만 기준으로 표시합니다.",
    };
  }

  const thresholdCm = sex === "male" ? 90 : sex === "female" ? 85 : null;
  if (thresholdCm === null) {
    return {
      value: waistCm,
      thresholdCm,
      level: "neutral",
      label: "성별 기준 미지정",
      summary: "한국인 복부비만 기준은 남성 90cm, 여성 85cm 이상입니다.",
    };
  }

  if (waistCm >= thresholdCm) {
    return {
      value: waistCm,
      thresholdCm,
      level: "watch",
      label: "복부비만 기준 해당",
      summary: `한국인 ${sex === "male" ? "남성" : "여성"} 복부비만 기준 ${thresholdCm}cm 이상입니다.`,
    };
  }

  return {
    value: waistCm,
    thresholdCm,
    level: "ok",
    label: "복부비만 기준 미만",
    summary: `한국인 ${sex === "male" ? "남성" : "여성"} 복부비만 기준 ${thresholdCm}cm 미만입니다.`,
  };
}

export function assessBloodPressure(systolic: number, diastolic: number): HealthAssessment {
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic) || systolic <= 0 || diastolic <= 0) {
    return {
      level: "neutral",
      label: "정보 부족",
      summary: "수축기와 이완기 혈압을 모두 입력하세요.",
    };
  }

  if (systolic >= 180 || diastolic >= 120) {
    return {
      level: "risk",
      label: "고혈압 위기 가능 범위",
      standardId: "blood-pressure",
      summary: "성인 남녀 공통 혈압 기준에서 고혈압 위기 가능 범위입니다. 증상이 있거나 반복되면 즉시 의료진 또는 응급 진료가 필요합니다.",
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      level: "watch",
      label: "낮은 혈압 가능",
      standardId: "low-blood-pressure",
      summary: "성인 남녀 공통 혈압 기준에서 낮은 혈압 가능 범위입니다. 어지러움, 실신감, 탈수 증상이 있으면 의료진에게 확인하세요.",
    };
  }
  if (systolic >= 160 || diastolic >= 100) {
    return {
      level: "risk",
      label: "고혈압 2단계 범위",
      standardId: "blood-pressure",
      summary: "한국 성인 남녀 공통 기준 고혈압 2단계 범위입니다. 반복 측정값을 기록하고 진료 때 공유하세요.",
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      level: "risk",
      label: "고혈압 1단계 범위",
      standardId: "blood-pressure",
      summary: "한국 성인 남녀 공통 기준 고혈압 1기 범위입니다. 반복 측정값을 진료 때 공유하세요.",
    };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      level: "watch",
      label: "고혈압 전단계 범위",
      standardId: "blood-pressure",
      summary: "한국 성인 남녀 공통 기준 고혈압 전단계입니다. 생활요인과 추세를 함께 기록하세요.",
    };
  }
  if (systolic >= 120 && diastolic < 80) {
    return {
      level: "watch",
      label: "주의혈압 범위",
      standardId: "blood-pressure",
      summary: "한국 성인 남녀 공통 기준 주의혈압입니다. 추세가 오르는지 확인하세요.",
    };
  }
  return {
    level: "ok",
    label: "정상 혈압 범위",
    standardId: "blood-pressure",
    summary: "현재 입력값은 한국 성인 남녀 공통 정상 혈압 범위입니다.",
  };
}

export function assessTemperature(temperatureC: number): HealthAssessment {
  if (!Number.isFinite(temperatureC) || temperatureC <= 0) {
    return {
      level: "neutral",
      label: "정보 부족",
      summary: "체온값을 ℃ 단위로 입력하세요.",
    };
  }

  if (temperatureC >= 38) {
    return {
      level: "risk",
      label: "발열 연락 기준",
      standardId: "infection-fever",
      summary: "암환자 공통 기준에서 체온 38℃ 이상 또는 오한은 즉시 응급실/진료팀 연락 기준으로 확인해야 합니다.",
    };
  }

  return {
    level: "ok",
    label: "체온 기록 범위",
    standardId: "infection-fever",
    summary: "암환자 공통 체온 기록입니다. 오한, 배뇨통, 호흡기 증상, 카테터 부위 변화가 있으면 함께 기록하세요.",
  };
}

export function assessBloodGlucose(
  valueMgDl: number,
  context: GlucoseContext,
  options: BloodGlucoseOptions = {},
): HealthAssessment {
  if (!Number.isFinite(valueMgDl) || valueMgDl <= 0) {
    return {
      level: "neutral",
      label: "정보 부족",
      summary: "혈당값을 mg/dL 단위로 입력하세요.",
    };
  }

  if (valueMgDl < 70) {
    return {
      level: "risk",
      label: "저혈당 범위",
      standardId: "hypoglycemia",
      summary:
        "성인 남녀 공통 혈당 기준에서 70 mg/dL 미만 저혈당 범위입니다. 증상, 의식상태, 약·식사·활동 변화를 함께 기록하고 진료팀 연락 기준을 확인하세요.",
    };
  }

  if (valueMgDl >= 250) {
    return {
      level: "risk",
      label: "현저한 고혈당 범위",
      standardId: "marked-hyperglycemia",
      summary:
        "성인 남녀 공통 기준에서 250 mg/dL 이상 현저한 고혈당 범위입니다. 다음·다뇨·체중감소, 탈수, 구토, 복통, 의식저하 동반 여부를 기록하고 병원 확인 기준을 확인하세요.",
    };
  }

  if (options.diabetes) {
    if (context === "after-meal") {
      if (valueMgDl < 180) {
        return {
          level: "ok",
          label: "식후 목표 범위",
          summary: "대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식후 2시간 180 mg/dL 미만을 제시합니다.",
        };
      }
      return {
        level: "watch",
        label: "식후 목표 초과",
        summary: "성인 남녀 공통 식후 2시간 목표를 넘었습니다. 식사 내용, 약, 활동량과 함께 추세를 확인하세요.",
      };
    }

    if (context === "before-meal" || context === "fasting") {
      if (valueMgDl >= 80 && valueMgDl <= 130) {
        return {
          level: "ok",
          label: "식전 목표 범위",
          summary: "대한당뇨병학회 일반 조절목표는 성인 남녀 공통으로 식전 80-130 mg/dL 범위를 제시합니다.",
        };
      }
      return {
        level: "watch",
        label: valueMgDl < 80 ? "식전 목표보다 낮음" : "식전 목표보다 높음",
        summary: "성인 남녀 공통 식전 목표에서 벗어났습니다. 개인 목표는 나이와 치료 상태에 따라 다를 수 있습니다.",
      };
    }

    return {
      level: valueMgDl < 200 ? "neutral" : "watch",
      label: valueMgDl < 200 ? "개별 목표 확인" : "무작위 혈당 추적 필요",
      summary: "취침 전이나 무작위 혈당은 개인 처방 목표와 측정 맥락을 함께 확인하세요.",
    };
  }

  if (context === "after-meal") {
    if (valueMgDl < 140) {
      return {
        level: "ok",
        label: "정상 식후 2시간 범위",
        summary: "성인 남녀 공통 당뇨 선별 기준에서 75g 경구당부하검사 2시간 혈당 정상 범위입니다.",
      };
    }
    if (valueMgDl < 200) {
      return {
        level: "watch",
        label: "내당능장애 범위",
        summary: "당뇨병 전단계 기준에 해당할 수 있어 반복 검사와 진료 확인이 필요합니다.",
      };
    }
    return {
      level: "risk",
      label: "당뇨병 진단 기준 범위",
      summary: "식후 2시간 혈당 200 mg/dL 이상은 진단 기준에 해당할 수 있어 의료진 확인이 필요합니다.",
    };
  }

  if (context === "before-meal" || context === "fasting") {
    if (valueMgDl < 100) {
      return {
        level: "ok",
        label: "정상 공복/식전 범위",
        summary: "한국 성인 남녀 공통 당뇨 선별 기준에서 공복혈당 정상 범위입니다.",
      };
    }
    if (valueMgDl < 126) {
      return {
        level: "watch",
        label: "공복혈당장애 범위",
        summary: "당뇨병 전단계 기준에 해당할 수 있어 추적과 진료 확인이 필요합니다.",
      };
    }
    return {
      level: "risk",
      label: "당뇨병 진단 기준 범위",
      summary: "공복혈당 126 mg/dL 이상은 진단 기준에 해당할 수 있어 반복 검사와 의료진 확인이 필요합니다.",
    };
  }

  if (context === "random" && valueMgDl >= 200) {
    return {
      level: "risk",
      label: "무작위 혈당 진단 기준 범위",
      summary: "증상과 함께 무작위 혈당 200 mg/dL 이상이면 당뇨병 진단 기준에 해당할 수 있습니다.",
    };
  }

  return {
    level: "neutral",
    label: "측정 시점 확인 필요",
    summary: "공복, 식전, 식후 2시간처럼 측정 시점을 남기면 한국 기준 판정이 더 정확합니다.",
  };
}

export function assessDiabetesCareGlucose(valueMgDl: number, context: GlucoseContext) {
  return assessBloodGlucose(valueMgDl, context, { diabetes: true });
}

export function assessScreeningGlucose(valueMgDl: number, context: GlucoseContext) {
  return assessBloodGlucose(valueMgDl, context, { diabetes: false });
}

export function assessLabValue(value: number, lower?: number, upper?: number): LabAssessment {
  if (!Number.isFinite(value)) {
    return {
      flag: "unknown",
      level: "neutral",
      label: "값 없음",
      summary: "검사 수치를 숫자로 입력하세요.",
    };
  }

  const hasLower = Number.isFinite(lower);
  const hasUpper = Number.isFinite(upper);

  if (!hasLower && !hasUpper) {
    return {
      flag: "unknown",
      level: "neutral",
      label: "기준 범위 없음",
      summary: "검사실 기준 범위를 함께 입력하면 낮음/높음을 표시합니다.",
    };
  }

  if (hasLower && lower !== undefined && value < lower) {
    return {
      flag: "low",
      level: "watch",
      label: "기준보다 낮음",
      summary: "검사실 기준보다 낮습니다. 증상과 함께 진료 때 확인하세요.",
    };
  }

  if (hasUpper && upper !== undefined && value > upper) {
    return {
      flag: "high",
      level: "watch",
      label: "기준보다 높음",
      summary: "검사실 기준보다 높습니다. 추세와 관련 증상을 함께 기록하세요.",
    };
  }

  return {
    flag: "normal",
    level: "ok",
    label: "기준 범위 내",
    summary: "입력한 검사실 기준 범위 안입니다.",
  };
}

export function assessCancerFood(input: string): FoodAssessment {
  const normalized = input.toLowerCase();
  const matches: FoodMatch[] = [];

  for (const [term, reason, sourceId] of supportiveFoods) {
    if (normalized.includes(term.toLowerCase())) {
      matches.push(createFoodMatch(term, "ok", reason, sourceId));
    }
  }
  for (const [term, reason, sourceId] of limitFoods) {
    if (normalized.includes(term.toLowerCase())) {
      matches.push(createFoodMatch(term, "watch", reason, sourceId));
    }
  }
  for (const [term, reason, sourceId] of careTeamFoods) {
    if (normalized.includes(term.toLowerCase())) {
      matches.push(createFoodMatch(term, "risk", reason, sourceId));
    }
  }

  if (matches.some((match) => match.level === "risk")) {
    return {
      level: "risk",
      label: "의료진 확인 필요",
      summary: "치료 중 상호작용이나 식품 안전 문제가 있을 수 있는 항목이 포함됐습니다.",
      matches,
    };
  }
  if (matches.some((match) => match.level === "watch")) {
    return {
      level: "watch",
      label: "제한 또는 소량 권장",
      summary: "가공육, 알코올, 당음료, 기름진 음식은 섭취 빈도와 양을 줄이는 쪽으로 기록하세요.",
      matches,
    };
  }
  if (matches.some((match) => match.level === "ok")) {
    return {
      level: "ok",
      label: "식단에 넣기 좋은 후보",
      summary: "단일 음식이 암을 치료하지는 않지만, 채소·과일·통곡물·콩류 중심 식단에 맞습니다.",
      matches,
    };
  }
  return {
    level: "neutral",
    label: "판단 근거 부족",
    summary: "음식명을 더 구체적으로 입력하면 식단 후보, 제한 후보, 의료진 확인 항목으로 나눕니다.",
    matches,
  };
}
