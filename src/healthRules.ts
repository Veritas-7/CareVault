export type HealthLevel = "ok" | "watch" | "risk" | "neutral";
export type GlucoseContext = "fasting" | "before-meal" | "after-meal" | "bedtime" | "random";

export type HealthAssessment = {
  level: HealthLevel;
  label: string;
  summary: string;
};

export type BmiAssessment = HealthAssessment & {
  value: number | null;
};

export type FoodMatch = {
  term: string;
  level: "ok" | "watch" | "risk";
  reason: string;
};

export type FoodAssessment = HealthAssessment & {
  matches: FoodMatch[];
};

const supportiveFoods: Array<[string, string]> = [
  ["브로콜리", "채소 중심 식단에 적합"],
  ["양배추", "십자화과 채소"],
  ["케일", "짙은 잎채소"],
  ["시금치", "짙은 잎채소"],
  ["블루베리", "과일 다양성에 도움"],
  ["딸기", "과일 다양성에 도움"],
  ["사과", "과일 다양성에 도움"],
  ["토마토", "채소 다양성에 도움"],
  ["콩", "식물성 단백질과 섬유질"],
  ["두부", "식물성 단백질"],
  ["현미", "통곡물"],
  ["귀리", "통곡물"],
  ["견과", "불포화지방과 간식 대체"],
  ["호두", "견과류"],
  ["생선", "단백질 공급원"],
  ["요거트", "단백질과 섭취 용이성"],
];

const limitFoods: Array<[string, string]> = [
  ["술", "암 예방 관점에서 제한 권고"],
  ["알코올", "암 예방 관점에서 제한 권고"],
  ["맥주", "알코올"],
  ["와인", "알코올"],
  ["소시지", "가공육"],
  ["베이컨", "가공육"],
  ["햄", "가공육"],
  ["핫도그", "가공육"],
  ["살라미", "가공육"],
  ["탄산음료", "당음료"],
  ["설탕음료", "당음료"],
  ["가당음료", "당음료"],
  ["튀김", "치료 중 소화 불편 가능"],
  ["기름진", "치료 중 소화 불편 가능"],
];

const careTeamFoods: Array<[string, string]> = [
  ["자몽", "약물 상호작용 확인 필요"],
  ["보충제", "치료 상호작용 확인 필요"],
  ["영양제", "치료 상호작용 확인 필요"],
  ["생굴", "면역저하 시 식품 안전 주의"],
  ["회", "면역저하 시 날음식 주의"],
  ["날계란", "면역저하 시 식품 안전 주의"],
  ["비살균", "면역저하 시 식품 안전 주의"],
];

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
  if (value < 25) {
    return {
      value,
      level: "ok",
      label: "건강 체중 범위",
      summary: "성인 BMI 기준 건강 체중 범위입니다.",
    };
  }
  if (value < 30) {
    return {
      value,
      level: "watch",
      label: "과체중",
      summary: "혈압, 혈당, 활동량과 함께 추적하세요.",
    };
  }
  return {
    value,
    level: "risk",
    label: "비만 범위",
    summary: "BMI는 선별 지표이며 진단은 의료진 평가가 필요합니다.",
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

  if (systolic > 180 || diastolic > 120) {
    return {
      level: "risk",
      label: "고혈압 위기 범위",
      summary: "증상이 있거나 반복되면 즉시 의료진 또는 응급 진료가 필요합니다.",
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      level: "watch",
      label: "낮은 혈압 가능",
      summary: "어지러움, 실신감, 탈수 증상이 있으면 의료진에게 확인하세요.",
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      level: "risk",
      label: "고혈압 2단계 범위",
      summary: "반복 측정값을 기록하고 진료 때 공유하세요.",
    };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      level: "watch",
      label: "고혈압 1단계 범위",
      summary: "생활요인과 약 복용 여부를 함께 기록하세요.",
    };
  }
  if (systolic >= 120 && diastolic < 80) {
    return {
      level: "watch",
      label: "상승 혈압 범위",
      summary: "추세가 오르는지 확인하세요.",
    };
  }
  return {
    level: "ok",
    label: "정상 혈압 범위",
    summary: "현재 입력값은 일반 성인 정상 범위입니다.",
  };
}

export function assessBloodGlucose(valueMgDl: number, context: GlucoseContext): HealthAssessment {
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
      summary: "저혈당 증상과 함께 즉시 대응이 필요한 값입니다.",
    };
  }

  if (valueMgDl >= 240) {
    return {
      level: "risk",
      label: "높은 혈당 경고",
      summary: "아플 때 240 mg/dL 이상이면 케톤 확인과 의료진 상담이 권고됩니다.",
    };
  }

  if (context === "after-meal") {
    if (valueMgDl < 180) {
      return {
        level: "ok",
        label: "식후 목표 범위",
        summary: "일반적인 식후 2시간 목표 범위 안입니다.",
      };
    }
    return {
      level: "watch",
      label: "식후 목표 초과",
      summary: "식사 내용, 약, 활동량과 함께 추세를 확인하세요.",
    };
  }

  if (context === "before-meal" || context === "fasting") {
    if (valueMgDl >= 80 && valueMgDl <= 130) {
      return {
        level: "ok",
        label: "식전 목표 범위",
        summary: "일반적인 식전 목표 범위 안입니다.",
      };
    }
    return {
      level: "watch",
      label: valueMgDl < 80 ? "식전 목표보다 낮음" : "식전 목표보다 높음",
      summary: "개인 목표는 나이와 치료 상태에 따라 다를 수 있습니다.",
    };
  }

  return {
    level: valueMgDl <= 180 ? "ok" : "watch",
    label: valueMgDl <= 180 ? "기록 범위 양호" : "추적 필요",
    summary: "측정 시점을 함께 남기면 해석 정확도가 올라갑니다.",
  };
}

export function assessCancerFood(input: string): FoodAssessment {
  const normalized = input.toLowerCase();
  const matches: FoodMatch[] = [];

  for (const [term, reason] of supportiveFoods) {
    if (normalized.includes(term.toLowerCase())) {
      matches.push({ term, level: "ok", reason });
    }
  }
  for (const [term, reason] of limitFoods) {
    if (normalized.includes(term.toLowerCase())) {
      matches.push({ term, level: "watch", reason });
    }
  }
  for (const [term, reason] of careTeamFoods) {
    if (normalized.includes(term.toLowerCase())) {
      matches.push({ term, level: "risk", reason });
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
