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
  | "nccPreventionMealExamples"
  | "nccSideEffectDiet"
  | "nccImmuneLowDiet"
  | "nccComplementaryTherapy"
  | "nccCervicalDiet"
  | "nccCervicalFoodPrevention"
  | "nccCervicalPracticeDiet"
  | "nccTreatmentNutrients"
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

export type CancerFoodGuideItem = {
  detail: string;
  examples: string;
  label: string;
  sourceIds: FoodGuidanceSourceId[];
};

export type CancerFoodGuideCategory = {
  id: "balanced" | "limit" | "care-team";
  items: CancerFoodGuideItem[];
  label: string;
  level: FoodMatch["level"];
  summary: string;
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

const finiteNumberTextPattern = /^[+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?$/;

export function parseFiniteNumberText(value: string | undefined): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !finiteNumberTextPattern.test(trimmed)) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

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
  nccPreventionMealExamples: {
    label: "국가암정보센터 암예방 식단 예시",
    url: "https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
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
  nccCervicalDiet: {
    label: "국가암정보센터 자궁경부암 식생활",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
  },
  nccCervicalFoodPrevention: {
    label: "국가암정보센터 자궁경부암 예방과 음식",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
  },
  nccCervicalPracticeDiet: {
    label: "국가암정보센터 자궁경부암 실천지침 식생활",
    url: "https://www.cancer.go.kr/download.do?uuid=6fb06571-5b8b-4dbe-9473-1074110e631d.pdf",
  },
  nccTreatmentNutrients: {
    label: "국가암정보센터 치료 중 영양소",
    url: "https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
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

export const cancerFoodGuideCategories: CancerFoodGuideCategory[] = [
  {
    id: "balanced",
    label: "대체로 식단에 넣기",
    level: "ok",
    summary:
      "자궁경부암 자체를 치료하는 음식이 아니라 충분한 영양과 균형 잡힌 식사 후보입니다.",
    items: [
      {
        label: "자궁경부암 특수 금기/추천 없음",
        detail:
          "공식 자료는 자궁경부암 환자가 특별히 피하거나 추천하는 음식은 없고 충분한 영양과 휴식이 중요하다고 설명합니다.",
        examples: "평소 먹기 쉬운 음식, 소량씩 자주 먹기, 통증·식욕 저하를 진료팀에 공유",
        sourceIds: ["nccCervicalDiet"],
      },
      {
        label: "카로테노이드·신선식품 메모",
        detail:
          "자궁경부암 예방과 음식 자료는 카로테노이드·비타민 식품의 예방 효과가 아직 명확하지 않다고 설명하므로 치료식으로 보지 않고 신선한 채소·과일·해조류 섭취 질문으로 남깁니다.",
        examples: "당근, 시금치, 차, 미역, 신선한 채소, 과일, 해조류",
        sourceIds: ["nccCervicalFoodPrevention"],
      },
      {
        label: "실천지침 식단 예시",
        detail:
          "국민 암예방 수칙 자궁경부암 실천지침은 채소·과일을 충분히 섭취하고 짠 음식과 탄 음식을 제한하는 식단 예시를 제시합니다.",
        examples: "잡곡밥, 과일샐러드, 채소샐러드, 브로콜리회, 귤, 시금치나물, 우엉볶음",
        sourceIds: ["nccCervicalPracticeDiet"],
      },
      {
        label: "채소·과일·통곡물·콩류",
        detail:
          "암예방 식생활 자료는 매끼 채소, 매일 과일, 잡곡·도정하지 않은 곡류, 두류와 두부 같은 두류 가공품을 권합니다.",
        examples: "채소 반찬, 제철 과일, 잡곡밥, 현미, 귀리, 통밀빵, 콩, 두부",
        sourceIds: ["nccPreventionDiet"],
      },
      {
        label: "암예방 식단 예시",
        detail:
          "국가암정보센터 암예방 식단 예시는 잡곡밥, 채소 반찬, 생선·달걀·콩·닭고기 단백질 식품, 등푸른 생선 주 2회 이상, 간편식의 통곡물·샐러드·저지방 유제품·과일 예시, 단체 급식의 다양한 채소 반찬과 적정량 단백질 예시를 균형식 후보로 제시합니다.",
        examples:
          "아욱된장국, 호박나물, 콩나물무침, 고등어구이, 생선, 달걀, 콩, 닭고기, 등푸른 생선, 고등어, 통밀빵, 샐러드(채소), 샐러드(달걀), 샐러드(치즈), 모차렐라, 리코타 치즈, 플레인 요구르트, 플레인 요거트, 저지방 유제품, 저지방 요구르트, 저지방 요거트, 방울토마토, 블루베리, 미역국, 상추쌈, 버섯나물, 불고기",
        sourceIds: ["nccPreventionMealExamples"],
      },
      {
        label: "익힌 단백질·수분",
        detail:
          "치료 중 영양 자료는 탄수화물, 단백질, 비타민·무기질, 물을 기본 영양소로 설명합니다. 면역저하가 있으면 안전하게 익힌 음식인지 함께 확인합니다.",
        examples: "익힌 생선·닭고기·달걀, 고등어, 두부, 저지방 우유, 플레인 요구르트, 물",
        sourceIds: ["nccTreatmentNutrients", "nccPreventionDiet", "nccImmuneLowDiet"],
      },
    ],
  },
  {
    id: "limit",
    label: "줄이기/피하기",
    level: "watch",
    summary:
      "암예방과 치료 중 불편감 관점에서 양과 빈도를 줄이거나 피할 후보입니다.",
    items: [
      {
        label: "술·알코올",
        detail:
          "음주는 암 예방 관점에서 제한 대상이며, 치료 중 약물·간기능·수면과도 함께 확인해야 합니다.",
        examples: "술, 맥주, 와인, 고도주",
        sourceIds: ["kdcaAlcohol"],
      },
      {
        label: "가공육·탄 음식·튀김",
        detail:
          "공식 암예방 식이 자료는 햄·소시지 같은 육가공품을 가급적 적게 먹고, 탄 음식과 직화구이·튀김 조리법을 피하도록 안내합니다.",
        examples: "햄, 소시지, 베이컨, 가공육류, 탄 고기, 숯불 직화, 직화구이, 튀김",
        sourceIds: ["nccPreventionDiet"],
      },
      {
        label: "붉은 육류 적정량",
        detail:
          "국가암정보센터 암예방 식단 예시는 소고기와 돼지고기 같은 붉은 육류를 주 3인분 이하로 적정량 섭취하도록 안내합니다.",
        examples: "소고기, 돼지고기, 붉은 육류",
        sourceIds: ["nccPreventionMealExamples"],
      },
      {
        label: "실천지침 대체 식단 예시",
        detail:
          "국민 암예방 수칙 자궁경부암 실천지침의 예시 식단은 식이섬유를 늘리는 잡곡밥 대체 예시와 함께 가공육·달콤한 간식·짠 반찬·국물 과다와 나트륨이 많은 조림을 줄이고 과일·채소·저염 조리 예시로 바꾸는 방향을 보여줍니다.",
        examples: "쌀밥, 흰쌀밥, 햄구이, 초코칩쿠키, 단무지, 우엉조림, 국·찌개 국물, 국물 과다",
        sourceIds: ["nccCervicalPracticeDiet"],
      },
      {
        label: "자극적·너무 뜨겁거나 매운 음식",
        detail:
          "자궁경부암 식생활 자료는 방사선치료나 항암화학요법 중 장 기능이 약해질 수 있어 자극적인 음식은 피하도록 설명합니다.",
        examples: "매운 음식, 아주 뜨거운 음식, 장 불편을 악화시키는 음식",
        sourceIds: ["nccCervicalDiet", "nccPreventionDiet"],
      },
      {
        label: "가당 유제품",
        detail:
          "국가암정보센터 암예방 샐러드 예시는 플레인 요구르트를 칼슘·단백질 보충 후보로 제시하되 가당 제품은 피하고 저지방 유제품을 권장합니다.",
        examples: "가당 제품, 가당 유제품, 가당 요구르트, 가당 요거트",
        sourceIds: ["nccPreventionMealExamples"],
      },
      {
        label: "짠 저장식품·국물 과다",
        detail:
          "암예방 식생활 자료는 짜게 먹지 않기, 염장식품 제한, 국이나 찌개 국물 제한을 안내하며, 예시 식단의 배추김치·열무김치도 나트륨을 줄이기 위해 조금만 섭취하는 항목으로 설명합니다.",
        examples: "젓갈, 장아찌, 염장식품, 짠 김치, 배추김치, 열무김치, 국물 과다",
        sourceIds: ["nccPreventionDiet", "nccPreventionMealExamples"],
      },
    ],
  },
  {
    id: "care-team",
    label: "진료팀 확인",
    level: "risk",
    summary:
      "치료 약제, 면역저하, 보완요법 여부에 따라 개인별 기준이 달라질 수 있는 항목입니다.",
    items: [
      {
        label: "민간요법·건강보조식품",
        detail:
          "자궁경부암 식생활 자료와 보완대체요법 자료는 항암화학요법 중 민간요법·건강보조식품을 삼가거나 주치의에게 알리도록 안내합니다.",
        examples: "고농축 보충제, 영양제, 약초, 한약, 민간요법, 치료 효과를 표방하는 식품",
        sourceIds: ["nccCervicalDiet", "nccComplementaryTherapy"],
      },
      {
        label: "자몽·약물 상호작용 가능 식품",
        detail:
          "약 복용 중 특정 식품 상호작용이 의심되면 처방약, 항암제, 보조제를 함께 적어 진료팀 기준으로 확인합니다.",
        examples: "자몽, 자몽 주스, 복용 약과 같이 먹는 보충제",
        sourceIds: ["kdcaNutrition", "nccComplementaryTherapy"],
      },
      {
        label: "날음식·비살균·보관/세척 주의 식품",
        detail:
          "백혈구 감소 등 면역저하 맥락에서는 음식으로 인한 감염을 줄이기 위해 완전히 익힌 음식, 과일·채소 세척, 오래 보관한 남은 음식 폐기, 저온살균 제품 여부를 확인합니다.",
        examples:
          "생굴, 회, 초밥, 육회, 생조개, 날계란, 덜 익힌 고기, 다진 고기, 씻지 않은 딸기, 오래된 남은 음식, 비살균 우유·주스",
        sourceIds: ["nccImmuneLowDiet"],
      },
    ],
  },
];

export const koreanHealthStandardSummary = {
  bmi: "대한비만학회 한국인 성인 BMI: 정상 18.5-22.9, 비만전단계 23-24.9, 비만 25 이상",
  bloodPressure: "대한고혈압학회/KDCA 성인 혈압: 정상 <120/<80, 고혈압전단계 130-139 또는 80-89, 고혈압 140/90 이상",
  glucose: "대한당뇨병학회/KDCA 혈당: 비당뇨 선별 기준과 당뇨 관리 목표를 분리 적용",
  waist: "대한비만학회 한국인 복부비만: 남성 90cm 이상, 여성 85cm 이상",
} as const;

type FoodRuleTermOptions = {
  allowedKoreanSuffixes?: readonly string[];
  matchMode?: "standalone";
};
type FoodRuleTerm = [
  term: string,
  reason: string,
  sourceId: FoodGuidanceSourceId,
  options?: FoodRuleTermOptions,
];
type FoodRuleMatchCandidate = {
  end: number;
  level: FoodMatch["level"];
  reason: string;
  sourceId: FoodGuidanceSourceId;
  start: number;
  term: string;
};

const commonKoreanFoodTermSuffixes = [
  "으로",
  "에서",
  "에게",
  "부터",
  "까지",
  "처럼",
  "보다",
  "은",
  "는",
  "이",
  "가",
  "을",
  "를",
  "도",
  "만",
  "와",
  "과",
  "로",
  "에",
] as const;

const standaloneFoodTermOptions: FoodRuleTermOptions = {
  allowedKoreanSuffixes: commonKoreanFoodTermSuffixes,
  matchMode: "standalone",
};

const supportiveFoods: FoodRuleTerm[] = [
  ["잡곡밥", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["아욱된장국", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["호박나물", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["콩나물무침", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["고등어구이", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["미역국", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["상추쌈", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["버섯나물", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["불고기", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["통밀빵", "국가암정보센터 암예방 샐러드 통곡물 예시 후보", "nccPreventionMealExamples"],
  ["샐러드(채소)", "국가암정보센터 암예방 샐러드 신선채소 예시 후보", "nccPreventionMealExamples"],
  ["샐러드(달걀)", "국가암정보센터 암예방 샐러드 단백질 예시 후보", "nccPreventionMealExamples"],
  ["샐러드(치즈)", "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보", "nccPreventionMealExamples"],
  ["모차렐라", "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보", "nccPreventionMealExamples"],
  ["통밀", "통밀·귀리 등 통곡물 후보", "nccPreventionDiet"],
  ["당근", "자궁경부암 예방 관련 신선식품 후보", "nccCervicalFoodPrevention"],
  ["시금치", "자궁경부암 예방 관련 신선식품 후보", "nccCervicalFoodPrevention"],
  ["미역", "자궁경부암 예방 관련 신선식품 후보", "nccCervicalFoodPrevention"],
  ["차", "자궁경부암 예방 관련 신선식품 후보", "nccCervicalFoodPrevention", standaloneFoodTermOptions],
  ["과일샐러드", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["채소샐러드", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["브로콜리회", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["시금치나물", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["우엉볶음", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["귤", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet", standaloneFoodTermOptions],
  ["브로콜리", "채소 중심 식단에 적합", "nccPreventionDiet"],
  ["양배추", "십자화과 채소", "nccPreventionDiet"],
  ["케일", "짙은 잎채소", "nccPreventionDiet"],
  ["방울토마토", "국가암정보센터 암예방 샐러드 신선채소 예시 후보", "nccPreventionMealExamples"],
  ["블루베리", "국가암정보센터 암예방 샐러드 과일 예시 후보", "nccPreventionMealExamples"],
  ["딸기", "과일 다양성에 도움", "nccPreventionDiet"],
  ["사과", "과일 다양성에 도움", "nccPreventionDiet"],
  ["토마토", "채소 다양성에 도움", "nccPreventionDiet"],
  ["콩나물", "채소 반찬 후보", "nccPreventionDiet"],
  ["나물", "채소 반찬 후보", "nccPreventionDiet"],
  ["상추", "채소 반찬 후보", "nccPreventionDiet"],
  ["버섯", "채소 반찬 후보", "nccPreventionDiet"],
  [
    "콩",
    "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
    "nccPreventionMealExamples",
    standaloneFoodTermOptions,
  ],
  ["두부", "식물성 단백질", "kdcaNutrition"],
  ["현미", "통곡물", "nccPreventionDiet"],
  ["귀리", "통곡물", "nccPreventionDiet"],
  ["견과", "불포화지방과 간식 대체", "kdcaNutrition"],
  ["호두", "견과류", "kdcaNutrition"],
  [
    "등푸른 생선",
    "국가암정보센터 암예방 식단 등푸른 생선 주 2회 이상 예시 후보",
    "nccPreventionMealExamples",
  ],
  [
    "고등어",
    "국가암정보센터 암예방 식단 등푸른 생선 주 2회 이상 예시 후보",
    "nccPreventionMealExamples",
  ],
  ["닭고기", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["달걀", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["생선", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["플레인 요구르트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["플레인 요거트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["저지방 유제품", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["저지방 요구르트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["저지방 요거트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["저지방 우유", "저지방 유제품 후보", "nccPreventionDiet"],
  ["리코타 치즈", "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보", "nccPreventionMealExamples"],
  ["요거트", "단백질과 섭취 용이성", "nccPreventionDiet"],
];

const limitFoods: FoodRuleTerm[] = [
  ["술", "암 예방 관점에서 제한 권고", "kdcaAlcohol", standaloneFoodTermOptions],
  ["알코올", "암 예방 관점에서 제한 권고", "kdcaAlcohol"],
  ["맥주", "알코올", "kdcaAlcohol"],
  ["와인", "알코올", "kdcaAlcohol"],
  ["소고기", "국가암정보센터 암예방 식단 붉은 육류 주 3인분 이하 적정량 예시", "nccPreventionMealExamples"],
  ["돼지고기", "국가암정보센터 암예방 식단 붉은 육류 주 3인분 이하 적정량 예시", "nccPreventionMealExamples"],
  ["붉은 육류", "국가암정보센터 암예방 식단 붉은 육류 주 3인분 이하 적정량 예시", "nccPreventionMealExamples"],
  ["흰쌀밥", "자궁경부암 실천지침 식이섬유 증가 대체 전 예시", "nccCervicalPracticeDiet"],
  ["쌀밥", "자궁경부암 실천지침 식이섬유 증가 대체 전 예시", "nccCervicalPracticeDiet", standaloneFoodTermOptions],
  ["햄구이", "자궁경부암 실천지침 식단 제한 예시", "nccCervicalPracticeDiet"],
  ["소시지", "가공육", "nccPreventionDiet"],
  ["베이컨", "가공육", "nccPreventionDiet"],
  ["햄", "가공육", "nccPreventionDiet", standaloneFoodTermOptions],
  ["핫도그", "가공육", "nccPreventionDiet"],
  ["살라미", "가공육", "nccPreventionDiet"],
  ["가공육류", "가공육", "nccPreventionDiet"],
  ["직화구이", "직화·튀김 조리법 피하기", "nccPreventionDiet"],
  ["직화", "직화·튀김 조리법 피하기", "nccPreventionDiet"],
  ["숯불", "직화·튀김 조리법 피하기", "nccPreventionDiet"],
  ["탄 고기", "직화·탄 음식 조리법 피하기", "nccPreventionDiet"],
  ["탄 음식", "직화·탄 음식 조리법 피하기", "nccPreventionDiet"],
  ["탄산음료", "당음료", "kdcaNutrition"],
  ["설탕음료", "당음료", "kdcaNutrition"],
  ["가당음료", "당음료", "kdcaNutrition"],
  ["초코칩쿠키", "자궁경부암 실천지침 식단 제한 예시", "nccCervicalPracticeDiet"],
  ["가당 제품", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  ["가당 유제품", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  ["가당 요구르트", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  ["가당 요거트", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  ["단무지", "자궁경부암 실천지침 식단 제한 예시", "nccCervicalPracticeDiet"],
  ["우엉조림", "자궁경부암 실천지침 나트륨 감소 대체 전 예시", "nccCervicalPracticeDiet"],
  ["젓갈", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  ["장아찌", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  ["염장", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  ["배추김치", "암예방 식단 염장식품 소량 예시", "nccPreventionMealExamples"],
  ["열무김치", "암예방 식단 염장식품 소량 예시", "nccPreventionMealExamples"],
  ["짠 김치", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  ["국물", "국·찌개 국물 제한 예시", "nccCervicalPracticeDiet"],
  ["튀김", "치료 중 소화 불편 가능", "nccSideEffectDiet"],
  ["튀긴", "직화·튀김 조리법 피하기", "nccPreventionDiet"],
  ["기름진", "치료 중 소화 불편 가능", "nccSideEffectDiet"],
];

const careTeamFoods: FoodRuleTerm[] = [
  ["자몽", "약물 상호작용 확인 필요", "kdcaNutrition"],
  ["민간요법", "치료 상호작용 확인 필요", "nccComplementaryTherapy"],
  ["약초", "보완대체요법·약초 복용 사실 진료팀 공유", "nccComplementaryTherapy"],
  ["한약", "보완대체요법·약초 복용 사실 진료팀 공유", "nccComplementaryTherapy"],
  ["고농축", "치료 상호작용 확인 필요", "nccComplementaryTherapy"],
  ["보충제", "치료 상호작용 확인 필요", "nccComplementaryTherapy"],
  ["영양제", "치료 상호작용 확인 필요", "nccComplementaryTherapy"],
  ["생굴", "면역저하 시 익히지 않은 음식 주의", "nccImmuneLowDiet"],
  ["육회", "면역저하 시 익히지 않은 음식 주의", "nccImmuneLowDiet"],
  ["생조개", "면역저하 시 익히지 않은 음식 주의", "nccImmuneLowDiet"],
  ["생선회", "면역저하 시 날음식 주의", "nccImmuneLowDiet"],
  ["회", "면역저하 시 날음식 주의", "nccImmuneLowDiet", standaloneFoodTermOptions],
  ["초밥", "면역저하 시 익히지 않은 음식 주의", "nccImmuneLowDiet"],
  ["다진 고기", "면역저하 시 갈아둔 고기는 충분히 익힘 확인", "nccImmuneLowDiet"],
  ["갈은 고기", "면역저하 시 갈아둔 고기는 충분히 익힘 확인", "nccImmuneLowDiet"],
  ["갈아둔 고기", "면역저하 시 갈아둔 고기는 충분히 익힘 확인", "nccImmuneLowDiet"],
  ["날달걀", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["날계란", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["덜 익힌 계란", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["덜익힌 계란", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["덜 익힌 고기", "면역저하 시 고기·생선은 완전히 익힘 확인", "nccImmuneLowDiet"],
  ["덜익힌 고기", "면역저하 시 고기·생선은 완전히 익힘 확인", "nccImmuneLowDiet"],
  ["생고기", "면역저하 시 고기·생선은 완전히 익힘 확인", "nccImmuneLowDiet"],
  ["씻지 않은 딸기", "면역저하 시 씻기 어려운 과일 주의", "nccImmuneLowDiet"],
  ["씻지 않은 과일", "면역저하 시 과일·채소는 먹기 전 세척 확인", "nccImmuneLowDiet"],
  ["씻지 않은 채소", "면역저하 시 과일·채소는 먹기 전 세척 확인", "nccImmuneLowDiet"],
  ["오래된 남은 음식", "면역저하 시 오래 보관한 남은 음식 폐기 기준 확인", "nccImmuneLowDiet"],
  ["오래된 반찬", "면역저하 시 오래 보관한 남은 음식 폐기 기준 확인", "nccImmuneLowDiet"],
  ["상한 음식", "면역저하 시 냄새·모양 이상 식품 사용 금지 기준 확인", "nccImmuneLowDiet"],
  ["냄새 이상한 음식", "면역저하 시 냄새·모양 이상 식품 사용 금지 기준 확인", "nccImmuneLowDiet"],
  ["비살균 우유", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["비살균 주스", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["비살균", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["곰팡이", "면역저하 시 곰팡이가 핀 음식 사용 금지 기준 확인", "nccImmuneLowDiet"],
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

function isFoodTermBoundaryChar(char: string | undefined) {
  return !char || !/[\p{L}\p{N}]/u.test(char);
}

function hasAllowedKoreanTermSuffix(
  normalizedInput: string,
  end: number,
  allowedSuffixes: readonly string[] | undefined,
) {
  return Boolean(
    allowedSuffixes?.some((suffix) => {
      if (!normalizedInput.startsWith(suffix, end)) return false;
      return isFoodTermBoundaryChar(normalizedInput[end + suffix.length]);
    }),
  );
}

function isFoodTermCandidateAllowed(
  normalizedInput: string,
  start: number,
  end: number,
  options: FoodRuleTermOptions | undefined,
) {
  if (options?.matchMode !== "standalone") return true;
  return (
    isFoodTermBoundaryChar(normalizedInput[start - 1])
    && (isFoodTermBoundaryChar(normalizedInput[end])
      || hasAllowedKoreanTermSuffix(normalizedInput, end, options.allowedKoreanSuffixes))
  );
}

function collectFoodMatchCandidates(
  normalizedInput: string,
  rules: FoodRuleTerm[],
  level: FoodMatch["level"],
): FoodRuleMatchCandidate[] {
  const candidates: FoodRuleMatchCandidate[] = [];

  for (const [term, reason, sourceId, options] of rules) {
    const normalizedTerm = term.toLowerCase();
    let start = normalizedInput.indexOf(normalizedTerm);

    while (start !== -1) {
      const end = start + normalizedTerm.length;
      if (isFoodTermCandidateAllowed(normalizedInput, start, end, options)) {
        candidates.push({
          end,
          level,
          reason,
          sourceId,
          start,
          term,
        });
      }
      start = normalizedInput.indexOf(normalizedTerm, start + normalizedTerm.length);
    }
  }

  return candidates;
}

function rangesOverlap(
  first: Pick<FoodRuleMatchCandidate, "end" | "start">,
  second: Pick<FoodRuleMatchCandidate, "end" | "start">,
) {
  return first.start < second.end && second.start < first.end;
}

function selectFoodMatchCandidates(candidates: FoodRuleMatchCandidate[]) {
  const selected: FoodRuleMatchCandidate[] = [];

  for (const candidate of [...candidates].sort(
    (first, second) =>
      second.term.length - first.term.length
      || first.start - second.start
      || first.term.localeCompare(second.term),
  )) {
    if (selected.some((existing) => rangesOverlap(existing, candidate))) {
      continue;
    }
    selected.push(candidate);
  }

  return selected.sort((first, second) => first.start - second.start || first.end - second.end);
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

export function assessLabTextValue(
  value: string,
  lower?: string,
  upper?: string,
): LabAssessment {
  return assessLabValue(
    parseFiniteNumberText(value) ?? Number.NaN,
    parseFiniteNumberText(lower),
    parseFiniteNumberText(upper),
  );
}

export function assessCancerFood(input: string): FoodAssessment {
  const normalized = input.toLowerCase();
  const candidates = [
    ...collectFoodMatchCandidates(normalized, supportiveFoods, "ok"),
    ...collectFoodMatchCandidates(normalized, limitFoods, "watch"),
    ...collectFoodMatchCandidates(normalized, careTeamFoods, "risk"),
  ];
  const matches = selectFoodMatchCandidates(candidates).map((candidate) =>
    createFoodMatch(candidate.term, candidate.level, candidate.reason, candidate.sourceId),
  );

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
      summary:
        "공식 자료의 제한·대체 예시나 가공육, 알코올, 당음료, 기름진 음식은 섭취 빈도와 양을 기록하세요.",
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
