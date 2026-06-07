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
  | "nccAppetiteLossDiet"
  | "nccNauseaDiet"
  | "nccVomitingDiet"
  | "nccTasteChangeDiet"
  | "nccDiarrheaDiet"
  | "nccConstipationDiet"
  | "nccWeightChangeDiet"
  | "nccFatigueDepressionDiet"
  | "nccMouthPainDiet"
  | "nccDryMouthDiet"
  | "nccImmuneLowDiet"
  | "nccComplementaryTherapy"
  | "nccCervicalDiet"
  | "nccCervicalFoodPrevention"
  | "nccCervicalPracticeDiet"
  | "nccTreatmentEating"
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
    label: "국가암정보센터 건강한 식생활",
    url: "https://www.cancer.go.kr/lay1/S1T226C229/contents.do",
  },
  nccPreventionMealExamples: {
    label: "국가암정보센터 암예방 식단 예시",
    url: "https://www.cancer.go.kr/lay1/S1T226C230/contents.do",
  },
  nccSideEffectDiet: {
    label: "국가암정보센터 치료부작용시 식생활",
    url: "https://www.cancer.go.kr/lay1/S1T477C478/contents.do",
  },
  nccAppetiteLossDiet: {
    label: "국가암정보센터 증상별 식생활 - 식욕부진",
    url: "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
  },
  nccNauseaDiet: {
    label: "국가암정보센터 증상별 식생활 - 메스꺼움",
    url: "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
  },
  nccVomitingDiet: {
    label: "국가암정보센터 증상별 식생활 - 구토",
    url: "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
  },
  nccTasteChangeDiet: {
    label: "국가암정보센터 증상별 식생활 - 입맛의 변화",
    url: "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
  },
  nccDiarrheaDiet: {
    label: "국가암정보센터 증상별 식생활 - 설사",
    url: "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
  },
  nccConstipationDiet: {
    label: "국가암정보센터 증상별 식생활 - 변비",
    url: "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
  },
  nccWeightChangeDiet: {
    label: "국가암정보센터 증상별 식생활 - 체중변화",
    url: "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
  },
  nccFatigueDepressionDiet: {
    label: "국가암정보센터 증상별 식생활 - 피로감과 우울",
    url: "https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
  },
  nccMouthPainDiet: {
    label: "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    url: "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
  },
  nccDryMouthDiet: {
    label: "국가암정보센터 증상별 식생활 - 입안의 건조증",
    url: "https://cancer.go.kr/lay1/S1T479C485/contents.do",
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
  nccTreatmentEating: {
    label: "국가암정보센터 치료 중 일반적인 식생활",
    url: "https://www.cancer.go.kr/lay1/S1T471C472/contents.do",
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
          "국가암정보센터 건강한 식생활 자료는 채소와 과일을 충분히 먹고, 다채로운 식단으로 균형 잡힌 식사를 하며, 채소류(생채소, 나물, 샐러드, 쌈류 등)를 매일, 매끼니 충분히 먹고, 과일류는 매일 1회 이상 간식으로 섭취하며, 다양한 종류의 잡곡과 도정하지 않은 곡류를 섭취하고, 두류와 두류 가공품(두유, 두부 등)을 매일 섭취하며, 저지방 우유를 하루 1잔 정도 마시고, 음식을 짜지 않게 먹으며, 김치류는 짜지 않게 만들어 먹도록 안내합니다.",
        examples:
          "채소와 과일을 충분히 먹습니다, 채소와 과일 충분히 먹기, 다채로운 식단으로 균형 잡힌 식사를 합니다, 다채로운 식단 균형 잡힌 식사, 채소류(생채소, 나물, 샐러드, 쌈류 등)를 매일, 매끼니 충분히 먹습니다, 채소류 생채소 나물 샐러드 쌈류 매일 매끼니 충분히, 채소류, 생채소, 나물, 샐러드, 쌈류, 매끼니 채소, 매일 채소, 매일 매끼니 충분히, 채소 반찬, 과일류는 매일 1회 이상 간식으로 섭취합니다, 과일류 매일 1회 이상 간식 섭취, 매일 1회 이상 과일, 과일 매일 1회 이상, 과일 간식, 매일 과일 간식, 다양한 종류의 잡곡과 도정하지 않은 곡류를 섭취합니다, 잡곡 도정하지 않은 곡류 섭취, 두류와 두류 가공품 (두유, 두부 등)을 매일 섭취합니다, 두류 두류 가공품 두유 두부 매일 섭취, 저염 김치, 음식을 짜지 않게 먹습니다, 음식을 짜지 않게 먹기, 김치류는 짜지 않게 만들어 먹습니다, 김치류 짜지 않게 만들기, 짜지 않은 김치, 싱겁게 만든 김치, 짜지 않은 김치류, 제철 과일, 잡곡밥, 도정하지 않은 곡류, 현미, 귀리, 통밀빵, 두류 매일 섭취, 두류 가공품 매일 섭취, 두유 두부 매일 섭취, 두류, 두류 가공품, 두유, 두부, 저지방 우유를 하루 1잔 정도 마십니다, 저지방 우유 하루 1잔 정도 마시기, 저지방 우유 하루 1잔 정도, 하루 1잔 정도 저지방 우유, 하루 1잔 저지방 우유, 저지방 우유",
        sourceIds: ["nccPreventionDiet"],
      },
      {
        label: "암예방 식단 예시",
        detail:
          "국가암정보센터 암예방 식단 예시는 매 식사에 채소 반찬(생채·샐러드·나물·쌈 등) 2가지 이상, 다양한 색의 신선한 채소와 제철 식품, 다양한 잡곡이 섞인 밥, 단백질 식품 1~2가지를 적당량 선택하는 식사, 생선·달걀·콩·닭고기 단백질 식품, 등푸른 생선 주 2회 이상, 간편식의 통밀·귀리 등 통곡물 빵과 샐러드·저지방 유제품·매일 과일 예시, 단체 급식의 다양한 채소 반찬과 적정량 단백질 예시를 균형식 후보로 제시합니다.",
        examples:
          "채소 반찬, 생채, 나물, 채소 쌈, 신선한 채소, 다양한 색의 채소, 제철 식품, 다양한 잡곡, 잡곡, 아욱된장국, 호박나물, 콩나물무침, 고등어구이, 단백질 식품, 적정량 단백질, 생선, 달걀, 콩, 닭고기, 등푸른 생선, 고등어, 통밀빵, 통밀 식빵, 통밀, 귀리빵, 귀리 식빵, 귀리, 샐러드(채소), 샐러드(달걀), 샐러드(치즈), 모차렐라, 리코타 치즈, 플레인 요구르트, 플레인 요거트, 저지방 유제품, 저지방 요구르트, 저지방 요거트, 방울토마토, 블루베리, 과일류, 매일 과일, 미역국, 상추쌈, 버섯나물, 불고기",
        sourceIds: ["nccPreventionMealExamples"],
      },
      {
        label: "치료 중 균형식·충분한 영양",
        detail:
          "국가암정보센터 치료 중 일반적인 식생활 자료는 좋은 영양 상태 유지가 중요하므로 균형 잡힌 식사로 충분한 열량과 단백질, 비타민 및 무기질을 섭취하고 여러 가지 음식을 골고루 먹도록 안내합니다.",
        examples:
          "치료 중 균형 잡힌 식사, 치료 중 충분한 열량과 단백질, 치료 중 비타민 및 무기질, 여러 가지 음식을 골고루",
        sourceIds: ["nccTreatmentEating"],
      },
      {
        label: "익힌 단백질·수분",
        detail:
          "치료 중 영양 자료는 탄수화물, 단백질, 비타민·무기질, 물을 기본 영양소로 설명하고, 감자·고구마·옥수수 같은 탄수화물 식품과 성인 하루 물 6~8컵을 예시로 안내합니다. 건강한 식생활 자료는 육류 섭취 시 구워 먹기보다는 삶거나 끓인 조리 예시를 제시하며, 면역저하 자료는 음식으로 인한 감염 예방을 위해 완전히 익힌 음식과 저온살균 제품을 선택하도록 안내합니다.",
        examples:
          "감자, 고구마, 옥수수, 물 6~8컵, 하루 6~8컵 물, 육류 섭취 시 이를 구워 먹기(숯불구이, 직접 구이 등)보다는 삶거나 끓여서(수육, 보쌈 등) 먹습니다, 육류 구워 먹기보다는 삶거나 끓여서 수육 보쌈 먹기, 완전히 익힌 음식, 저온살균 요구르트, 유통기한 확인, 냉장고에서 해동, 익힌 생선·닭고기·달걀, 수육, 보쌈, 고등어, 두부, 저지방 우유, 플레인 요구르트, 물",
        sourceIds: ["nccTreatmentNutrients", "nccPreventionDiet", "nccImmuneLowDiet"],
      },
      {
        label: "메스꺼움 시 위 부담 적은 음식",
        detail:
          "국가암정보센터 메스꺼움 자료는 증상이 있을 때 억지로 먹지 말고 먹기 좋은 다른 음식을 선택하도록 하며, 비교적 위에 부담이 적은 식품으로 샤베트, 복숭아통조림 같은 부드러운 과일, 맑은 유동식, 얼음조각 등을 예시로 안내합니다.",
        examples: "샤베트, 복숭아통조림, 맑은 유동식, 얼음조각",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "구토 조절 후 단계적 유동식",
        detail:
          "국가암정보센터 구토 자료는 구토 증상이 있을 때는 먹거나 마시지 않고, 증상이 조절되면 물이나 육수 같은 맑은 유동식부터 조금씩 시작해 미음이나 부드러운 식사로 바꾸며, 우유 소화가 힘들면 우유가 들어있지 않은 제품을 이용하도록 안내합니다.",
        examples:
          "구토 조절 후 물, 구토 조절 후 육수, 구토 맑은 유동식, 구토 후 미음, 구토 후 부드러운 식사, 우유가 들어있지 않은 제품",
        sourceIds: ["nccVomitingDiet"],
      },
      {
        label: "입맛 변화 시 단백질 대체·향미 조절",
        detail:
          "국가암정보센터 입맛의 변화 자료는 고기가 싫다면 생선, 계란, 두부, 콩, 우유나 유제품을 이용하고, 고기나 생선요리에 와인·레몬즙 같은 향이 좋은 양념류나 새콤달콤한 소스를 사용하며, 금속성 맛에는 오렌지나 레몬 같은 시큼한 식품이 도움이 될 수 있으나 입과 목 통증이 있으면 주의하도록 안내합니다.",
        examples:
          "입맛 변화 생선, 입맛 변화 계란, 입맛 변화 두부, 입맛 변화 콩, 입맛 변화 우유나 유제품, 고기 싫을 때 생선, 레몬즙 양념, 새콤달콤한 소스, 입맛 변화 오렌지, 입맛 변화 레몬",
        sourceIds: ["nccTasteChangeDiet", "nccMouthPainDiet"],
      },
      {
        label: "설사 시 수분·전해질·부드러운 음식",
        detail:
          "국가암정보센터 설사 자료는 수분을 충분히 보충하고, 염분과 칼륨 손실 보충 식품으로 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등을 예시로 들며, 소화되기 쉽고 부드러운 죽류·미음을 조금씩 자주 먹도록 안내합니다.",
        examples:
          "설사 육수, 설사 스포츠 음료, 설사 바나나, 설사 으깬 감자, 설사 복숭아, 설사 토마토, 설사 흰죽, 설사 쌀미음",
        sourceIds: ["nccDiarrheaDiet"],
      },
      {
        label: "변비 시 수분·섬유소",
        detail:
          "국가암정보센터 변비 자료는 하루 8~10컵 이상 수분을 충분히 섭취하고, 특히 아침 기상 직후 찬물을 마시는 것이 장운동에 도움이 될 수 있으며, 도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취하도록 안내합니다.",
        examples:
          "변비 물 8~10컵, 변비 하루 8~10컵 물, 변비 아침 찬물, 변비 도정 덜 된 곡류, 변비 생과일, 변비 생야채, 변비 섬유소 많은 식품",
        sourceIds: ["nccConstipationDiet"],
      },
      {
        label: "체중감소 시 열량·단백질 보충",
        detail:
          "국가암정보센터 체중변화 자료는 치료 중 체중감소를 예방하기 위해 열량과 단백질을 충분히 섭취하도록 안내하며, 밥·죽을 다양하게 조리하고 감자·고구마·떡·만두·과일주스·과일통조림 같은 간식과 계란·콩·두부·생선·유제품 단백질 예시를 제시합니다.",
        examples:
          "체중감소 김밥, 체중감소 주먹밥, 체중감소 야채죽, 체중감소 전복죽, 체중감소 계란죽, 체중감소 잣죽, 체중감소 감자, 체중감소 고구마, 체중감소 떡, 체중감소 만두, 체중감소 과일주스, 체중감소 과일통조림, 체중감소 땅콩버터, 체중감소 계란찜, 체중감소 두유, 체중감소 두부조림, 체중감소 생선전, 체중감소 어묵, 체중감소 요구르트",
        sourceIds: ["nccWeightChangeDiet"],
      },
      {
        label: "피로감·우울 시 먹기 쉬운 시점·간식",
        detail:
          "국가암정보센터 피로감과 우울 자료는 치료 중 피로가 불충분한 열량·영양소 섭취와 관련될 수 있어 영양이 풍부한 음식을 충분히 먹고, 하루 중 몸 상태가 가장 좋은 때나 휴식 후에 먹으며, 적은 양의 식사와 간식을 자주 먹고, 가족·친구 도움이나 음식배달서비스를 이용하며, 치료를 받지 않을 때 좋아하는 음식을 먹도록 안내합니다.",
        examples:
          "피로감 영양이 풍부한 음식, 피로감 하루 중 가장 좋은 시간에 많이 먹기, 피로감 휴식 후 먹기, 피로감 적은 양의 식사와 간식, 피로감 음식배달서비스, 우울 좋아하는 음식",
        sourceIds: ["nccFatigueDepressionDiet"],
      },
      {
        label: "식욕부진 시 가까이 두는 간식",
        detail:
          "국가암정보센터 식욕부진 자료는 조금씩 자주 먹고 간식을 가까이 두며, 간식으로 죽·미음·쥬스·스프·우유 및 유제품 등을 활용하고, 식사섭취가 계속 힘들면 특수영양 보충음료를 이용하도록 안내합니다.",
        examples:
          "식욕부진 간식, 식욕부진 죽, 식욕부진 미음, 식욕부진 쥬스, 식욕부진 주스, 식욕부진 스프, 특수영양 보충음료",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "입·목 통증 시 부드러운 음식",
        detail:
          "국가암정보센터 입과 목의 통증 자료는 부드럽고 촉촉하며 씹고 삼키기 쉬운 음식으로 죽류, 미음, 부드럽게 조리한 고기·생선, 익히거나 데친 채소, 바나나·배·수박·과일통조림처럼 시지 않은 과일을 예시로 안내합니다.",
        examples:
          "흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽, 쌀미음, 조미음, 잣미음, 깨미음, 녹두미음, 부드러운 야채, 데친 채소, 바나나, 배, 수박, 과일통조림",
        sourceIds: ["nccMouthPainDiet"],
      },
      {
        label: "입안 건조증 시 촉촉한 음식",
        detail:
          "국가암정보센터 입안의 건조증 자료는 가까운 곳에 물을 두어 조금씩 자주 마시고, 삼키기 쉽도록 음식에 소스나 드레싱을 더해 촉촉하게 하며, 식사 중간에 물이나 음료를 한 모금씩 마시고, 딱딱한 사탕이나 껌으로 침 분비를 도울 수 있다고 안내합니다.",
        examples: "물 조금씩 자주, 물 한 모금, 소스나 드레싱, 딱딱한 사탕, 껌, 껌 씹기",
        sourceIds: ["nccDryMouthDiet"],
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
          "국가암정보센터 암예방 식단 예시는 햄·소시지 등 가공육류를 가급적 적게 섭취하고 직화 구이와 튀김 조리법을 피하도록 안내하며, 건강한 식생활 자료도 햄·소시지 등 육가공품에 대해 햄, 소시지 등의 육가공품을 가급적 먹지 않기, 탄 음식은 먹지 않기, 숯불로 굽거나 직접 구워 탄 음식의 섭취는 삼가하기, 지방 함량이 많은 부위의 육류 섭취 제한을 안내합니다.",
        examples:
          "햄, 소시지, 가공육류, 가공육, 육가공품, 햄, 소시지 등의 육가공품을 가급적 먹지 않습니다, 햄 소시지 등의 육가공품 가급적 먹지 않기, 햄·소시지, 햄 소시지, 햄 소시지 육가공품, 육가공품 가급적 먹지 않기, 육가공품 가급적 먹지 않습니다, 베이컨, 탄 고기, 숯불구이, 숯불 직화, 직접 구이, 직접구이, 탄 음식은 먹지 않기, 탄 음식은 먹지 않습니다, 숯불로 굽거나 직접 구워 탄 음식의 섭취는 삼가합니다, 숯불로 굽거나 직접 구워 탄 음식 섭취 삼가, 숯불로 굽거나 직접 구워서 탄 음식의 섭취는 삼가합니다, 숯불로 굽거나 직접 구워서 탄 음식 섭취 삼가, 숯불로 구운 탄 음식, 직접 구워 탄 음식, 탄 음식 섭취 삼가, 지방 함량이 많은 부위의 육류 섭취는 제한합니다, 지방 함량이 많은 육류 부위 섭취 제한, 지방 함량이 많은 부위, 직화 구이, 직화구이, 튀김 조리, 튀긴 음식, 튀김",
        sourceIds: ["nccPreventionMealExamples", "nccPreventionDiet"],
      },
      {
        label: "붉은 육류 적정량",
        detail:
          "국가암정보센터 암예방 식단 예시는 소고기와 돼지고기 같은 붉은 육류를 주 3인분 이하로 적정량 섭취하도록 안내하고, 건강한 식생활 자료는 붉은색 육류 섭취 시 1회에 1인분씩, 주 3인분(익힌 상태로 350~500g)을 넘지 않도록 설명합니다.",
        examples:
          "소고기, 돼지고기, 붉은 육류, 붉은색 육류, 붉은색 육류 섭취 시 1회에 1인분씩, 주 3인분(익힌 상태로 350~500g)을 넘지 않도록 합니다, 붉은색 육류 1회 1인분 주 3인분 350~500g 이하, 붉은색 육류 주 3인분, 붉은 육류 주 3인분, 붉은 육류 350~500g, 익힌 상태 350~500g",
        sourceIds: ["nccPreventionMealExamples", "nccPreventionDiet"],
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
          "자궁경부암 식생활 자료는 방사선치료나 항암화학요법 중 장 기능이 약해질 수 있어 자극적인 음식은 피하도록 설명하고, 국가암정보센터 건강한 식생활 자료도 너무 뜨겁거나 매운 음식의 섭취는 피하도록 안내합니다.",
        examples:
          "너무 뜨겁거나 매운 음식의 섭취는 피합니다, 너무 뜨겁거나 매운 음식 섭취 피하기, 너무 뜨겁거나 매운 음식, 매운 음식, 아주 뜨거운 음식, 장 불편을 악화시키는 음식",
        sourceIds: ["nccCervicalDiet", "nccPreventionDiet"],
      },
      {
        label: "입안 자극 음식",
        detail:
          "국가암정보센터 입과 목의 통증 자료는 입안을 자극할 수 있는 오렌지·포도·레몬·토마토주스, 향신료를 많이 사용하거나 소금에 절인 음식, 토스트·크래커·말린 음식은 통증 상황에서 피하도록 안내합니다.",
        examples:
          "토마토주스, 토스트, 크래커, 말린 음식, 오렌지, 포도, 레몬, 향신료를 많이 사용한 음식, 소금에 절인 음식",
        sourceIds: ["nccMouthPainDiet"],
      },
      {
        label: "메스꺼움 유발 가능 음식",
        detail:
          "국가암정보센터 메스꺼움 자료는 메스꺼움을 더 유발할 수 있는 음식으로 기름진 음식, 사탕·쿠키·케익처럼 매우 단 음식, 향이 강하거나 뜨거운 음식, 이상한 냄새가 나는 음식을 피하도록 안내합니다.",
        examples: "기름진 음식, 매우 단 음식, 향이 강하거나 뜨거운 음식, 이상한 냄새가 나는 음식",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "설사 시 장 자극·고섬유·유당·카페인 확인",
        detail:
          "국가암정보센터 설사 자료는 설사 중에는 기름진 음식, 생야채, 생과일의 껍질·씨·끈적한 섬유소 부분, 브로콜리·옥수수·말린 콩 같은 고섬유 채소, 너무 뜨겁거나 차가운 식품·음료, 커피·초콜릿 등 카페인 식품과 음료, 우유 및 유제품을 주의하도록 안내합니다.",
        examples:
          "설사 생야채, 설사 생과일 껍질, 설사 브로콜리, 설사 옥수수, 설사 말린 콩, 설사 커피, 설사 초콜릿, 설사 우유 및 유제품",
        sourceIds: ["nccDiarrheaDiet"],
      },
      {
        label: "체중증가 시 고염분·고열량 저영양 식품 확인",
        detail:
          "국가암정보센터 체중변화 자료는 체중증가 원인을 먼저 의사와 확인하도록 하며, 항암제 관련 수분 보유가 의심되면 가공식품·김치·젓갈·장아찌류 같은 염분 함량이 높은 식품을 제한하고, 식욕 증가가 있으면 청량 음료·초콜릿·사탕·과자류처럼 열량이 높고 영양가가 낮은 식품을 제한하도록 안내합니다.",
        examples:
          "체중증가 가공식품, 체중증가 김치, 체중증가 젓갈, 체중증가 장아찌류, 체중증가 청량 음료, 체중증가 초콜릿, 체중증가 사탕, 체중증가 과자류, 체중증가 고열량 간식",
        sourceIds: ["nccWeightChangeDiet"],
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
          "암예방 식생활 자료는 인공조미료(화학조미료 포함)의 사용을 제한하며 음식을 싱겁게 만들어 먹기, 음식을 먹을 때 추가로 소금이나 간장을 사용하지 않기, 젓갈류와 염(소금) 저장식품(김치 또는 장아찌류 등) 섭취 제한, 국이나 찌개의 국물 섭취 제한을 안내하며, 예시 식단의 배추김치·열무김치도 나트륨을 줄이기 위해 조금만 섭취하는 항목으로 설명합니다.",
        examples:
          "인공조미료(화학조미료 포함)의 사용을 제한하며 음식을 싱겁게 만들어 먹습니다, 인공조미료 화학조미료 사용 제한 싱겁게 만들어 먹기, 인공조미료, 화학조미료, 음식을 먹을 때 추가로 소금이나 간장을 사용하지 않습니다, 소금이나 간장 사용하지 않기, 추가 소금, 추가 간장, 젓갈류와 염(소금) 저장식품(김치 또는 장아찌류 등)의 섭취는 제한합니다, 젓갈류 염 소금 저장식품 김치 장아찌류 섭취 제한, 젓갈류, 염 저장식품, 소금 저장식품, 김치 또는 장아찌류, 젓갈, 장아찌, 염장식품, 짠 김치, 배추김치, 열무김치, 국이나 찌개의 국물 섭취는 제한합니다, 국이나 찌개 국물 섭취 제한, 국이나 찌개의 국물, 찌개 국물, 국물 섭취, 국물 과다",
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
        label: "특별한 항암 식품·영양소 주장",
        detail:
          "국가암정보센터 치료 중 일반적인 식생활 자료는 특정 식품이나 영양소를 특효 항암 수단으로 보지 않고, 균형 잡힌 식사와 충분한 영양 상태 유지를 강조합니다.",
        examples: "특별한 항암 식품, 특별한 항암 영양소, 특효 식품, 특효 영양소",
        sourceIds: ["nccTreatmentEating"],
      },
      {
        label: "날음식·비살균·보관/세척 주의 식품",
        detail:
          "백혈구 감소 등 면역저하 맥락에서는 음식으로 인한 감염을 줄이기 위해 완전히 익힌 음식, 과일·채소 세척, 손상된 캔이나 녹은 냉동제품 구매 주의, 상온 운반 후 즉시 냉장, 오래 보관한 남은 음식 폐기, 저온살균 제품 여부를 확인합니다.",
        examples:
          "생굴, 회, 초밥, 육회, 생조개, 날계란, 덜 익힌 고기, 다진 고기, 씻지 않은 딸기, 오래된 남은 음식, 3~4일 지난 남은 음식, 상온 30분 이상 운반, 녹슨 캔, 움푹해진 캔, 냉동제품 녹음, 비살균 우유·주스",
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
  ["다양한 잡곡", "국가암정보센터 암예방 식단 다양한 잡곡밥 예시 후보", "nccPreventionMealExamples"],
  ["잡곡", "국가암정보센터 암예방 식단 다양한 잡곡밥 예시 후보", "nccPreventionMealExamples", standaloneFoodTermOptions],
  ["아욱된장국", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["호박나물", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["콩나물무침", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["고등어구이", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["미역국", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["상추쌈", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["버섯나물", "국가암정보센터 암예방 식단 예시 후보", "nccPreventionMealExamples"],
  ["불고기", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["단백질 식품", "국가암정보센터 암예방 식단 단백질 식품 적정량 예시 후보", "nccPreventionMealExamples"],
  ["적정량 단백질", "국가암정보센터 암예방 식단 단백질 식품 적정량 예시 후보", "nccPreventionMealExamples"],
  ["채소 반찬", "국가암정보센터 암예방 식단 채소 반찬 충분히 섭취 예시 후보", "nccPreventionMealExamples"],
  ["채소 쌈", "국가암정보센터 암예방 식단 채소 반찬 충분히 섭취 예시 후보", "nccPreventionMealExamples"],
  ["생채", "국가암정보센터 암예방 식단 채소 반찬 충분히 섭취 예시 후보", "nccPreventionMealExamples"],
  ["신선한 채소", "국가암정보센터 암예방 식단 신선·제철 채소 선택 예시 후보", "nccPreventionMealExamples"],
  ["다양한 색의 채소", "국가암정보센터 암예방 식단 신선·제철 채소 선택 예시 후보", "nccPreventionMealExamples"],
  ["제철 식품", "국가암정보센터 암예방 식단 신선·제철 채소 선택 예시 후보", "nccPreventionMealExamples"],
  ["통밀빵", "국가암정보센터 암예방 샐러드 통곡물 예시 후보", "nccPreventionMealExamples"],
  ["샐러드(채소)", "국가암정보센터 암예방 샐러드 신선채소 예시 후보", "nccPreventionMealExamples"],
  ["샐러드(달걀)", "국가암정보센터 암예방 샐러드 단백질 예시 후보", "nccPreventionMealExamples"],
  ["샐러드(치즈)", "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보", "nccPreventionMealExamples"],
  ["모차렐라", "국가암정보센터 암예방 샐러드 유제품 단백질·칼슘 예시 후보", "nccPreventionMealExamples"],
  ["통밀 식빵", "국가암정보센터 암예방 샐러드 통곡물 예시 후보", "nccPreventionMealExamples"],
  ["귀리 식빵", "국가암정보센터 암예방 샐러드 통곡물 예시 후보", "nccPreventionMealExamples"],
  ["귀리빵", "국가암정보센터 암예방 샐러드 통곡물 예시 후보", "nccPreventionMealExamples"],
  ["통밀", "국가암정보센터 암예방 샐러드 통곡물 예시 후보", "nccPreventionMealExamples"],
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
  [
    "채소류(생채소, 나물, 샐러드, 쌈류 등)를 매일, 매끼니 충분히 먹습니다",
    "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "채소와 과일을 충분히 먹습니다",
    "국가암정보센터 건강한 식생활 채소와 과일 충분히 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "채소와 과일 충분히 먹기",
    "국가암정보센터 건강한 식생활 채소와 과일 충분히 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "다채로운 식단으로 균형 잡힌 식사를 합니다",
    "국가암정보센터 건강한 식생활 다채로운 식단 균형 식사 후보",
    "nccPreventionDiet",
  ],
  [
    "다채로운 식단 균형 잡힌 식사",
    "국가암정보센터 건강한 식생활 다채로운 식단 균형 식사 후보",
    "nccPreventionDiet",
  ],
  [
    "채소류 생채소 나물 샐러드 쌈류 매일 매끼니 충분히",
    "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보",
    "nccPreventionDiet",
  ],
  ["채소류", "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보", "nccPreventionDiet"],
  ["생채소", "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보", "nccPreventionDiet"],
  ["샐러드", "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보", "nccPreventionDiet"],
  ["쌈류", "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보", "nccPreventionDiet"],
  [
    "매일 매끼니 충분히",
    "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보",
    "nccPreventionDiet",
  ],
  ["매끼니 채소", "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보", "nccPreventionDiet"],
  ["매일 채소", "국가암정보센터 건강한 식생활 매일·매끼니 채소 충분히 섭취 후보", "nccPreventionDiet"],
  [
    "도정하지 않은 곡류",
    "국가암정보센터 건강한 식생활 도정하지 않은 곡류·두류 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "다양한 종류의 잡곡과 도정하지 않은 곡류를 섭취합니다",
    "국가암정보센터 건강한 식생활 잡곡·도정하지 않은 곡류 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "잡곡 도정하지 않은 곡류 섭취",
    "국가암정보센터 건강한 식생활 잡곡·도정하지 않은 곡류 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "두류와 두류 가공품 (두유, 두부 등)을 매일 섭취합니다",
    "국가암정보센터 건강한 식생활 두류·두류 가공품 매일 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "두류 두류 가공품 두유 두부 매일 섭취",
    "국가암정보센터 건강한 식생활 두류·두류 가공품 매일 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "두류 매일 섭취",
    "국가암정보센터 건강한 식생활 두류·두류 가공품 매일 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "두류 가공품 매일 섭취",
    "국가암정보센터 건강한 식생활 두류·두류 가공품 매일 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "두유 두부 매일 섭취",
    "국가암정보센터 건강한 식생활 두류·두류 가공품 매일 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "두류 가공품",
    "국가암정보센터 건강한 식생활 도정하지 않은 곡류·두류 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "두류",
    "국가암정보센터 건강한 식생활 도정하지 않은 곡류·두류 섭취 후보",
    "nccPreventionDiet",
    standaloneFoodTermOptions,
  ],
  ["두유", "국가암정보센터 건강한 식생활 도정하지 않은 곡류·두류 섭취 후보", "nccPreventionDiet"],
  ["방울토마토", "국가암정보센터 암예방 샐러드 신선채소 예시 후보", "nccPreventionMealExamples"],
  ["블루베리", "국가암정보센터 암예방 샐러드 과일 예시 후보", "nccPreventionMealExamples"],
  [
    "과일류는 매일 1회 이상 간식으로 섭취합니다",
    "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "과일류 매일 1회 이상 간식 섭취",
    "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "매일 1회 이상 과일",
    "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "과일 매일 1회 이상",
    "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "과일 간식",
    "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "매일 과일 간식",
    "국가암정보센터 건강한 식생활 과일류 매일 1회 이상 간식 섭취 후보",
    "nccPreventionDiet",
  ],
  ["저염 김치", "국가암정보센터 건강한 식생활 짜지 않은 김치류 섭취 후보", "nccPreventionDiet"],
  [
    "음식을 짜지 않게 먹습니다",
    "국가암정보센터 건강한 식생활 음식을 짜지 않게 먹기 후보",
    "nccPreventionDiet",
  ],
  [
    "음식을 짜지 않게 먹기",
    "국가암정보센터 건강한 식생활 음식을 짜지 않게 먹기 후보",
    "nccPreventionDiet",
  ],
  [
    "김치류는 짜지 않게 만들어 먹습니다",
    "국가암정보센터 건강한 식생활 김치류 짜지 않게 만들기 후보",
    "nccPreventionDiet",
  ],
  [
    "김치류 짜지 않게 만들기",
    "국가암정보센터 건강한 식생활 김치류 짜지 않게 만들기 후보",
    "nccPreventionDiet",
  ],
  [
    "싱겁게 만든 김치",
    "국가암정보센터 건강한 식생활 짜지 않은 김치류 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "짜지 않은 김치류",
    "국가암정보센터 건강한 식생활 짜지 않은 김치류 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "짜지 않은 김치",
    "국가암정보센터 건강한 식생활 짜지 않은 김치류 섭취 후보",
    "nccPreventionDiet",
  ],
  ["과일류", "국가암정보센터 암예방 샐러드 매일 과일 예시 후보", "nccPreventionMealExamples"],
  ["매일 과일", "국가암정보센터 암예방 샐러드 매일 과일 예시 후보", "nccPreventionMealExamples"],
  ["딸기", "과일 다양성에 도움", "nccPreventionDiet"],
  ["사과", "과일 다양성에 도움", "nccPreventionDiet"],
  ["토마토", "채소 다양성에 도움", "nccPreventionDiet"],
  ["콩나물", "채소 반찬 후보", "nccPreventionDiet"],
  ["나물", "국가암정보센터 암예방 식단 채소 반찬 충분히 섭취 예시 후보", "nccPreventionMealExamples"],
  ["상추", "채소 반찬 후보", "nccPreventionDiet"],
  ["버섯", "채소 반찬 후보", "nccPreventionDiet"],
  [
    "콩",
    "국가암정보센터 암예방 식단 단백질 적정량 예시 후보",
    "nccPreventionMealExamples",
    standaloneFoodTermOptions,
  ],
  ["두부", "국가암정보센터 건강한 식생활 도정하지 않은 곡류·두류 섭취 후보", "nccPreventionDiet"],
  ["현미", "통곡물", "nccPreventionDiet"],
  ["귀리", "국가암정보센터 암예방 샐러드 통곡물 예시 후보", "nccPreventionMealExamples"],
  ["감자", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["고구마", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["옥수수", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["물 6~8컵", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["하루 6~8컵 물", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["흰죽", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["닭죽", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["호박죽", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["쌀미음", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["바나나", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["수박", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["과일통조림", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["샤베트", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  ["복숭아통조림", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  ["맑은 유동식", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  ["얼음조각", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  ["구토 조절 후 물", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 조절 후 육수", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 맑은 유동식", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 후 미음", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 후 부드러운 식사", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["우유가 들어있지 않은 제품", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["입맛 변화 생선", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["입맛 변화 계란", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["입맛 변화 두부", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["입맛 변화 콩", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["입맛 변화 우유나 유제품", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["고기 싫을 때 생선", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["레몬즙 양념", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["새콤달콤한 소스", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["입맛 변화 오렌지", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["입맛 변화 레몬", "국가암정보센터 입맛 변화 시 단백질 대체·향미 조절 후보", "nccTasteChangeDiet"],
  ["설사 육수", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 스포츠 음료", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 바나나", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 으깬 감자", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 복숭아", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 토마토", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 흰죽", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 쌀미음", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["변비 물 8~10컵", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 하루 8~10컵 물", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 아침 찬물", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 도정 덜 된 곡류", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 생과일", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 생야채", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 섬유소 많은 식품", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["완전히 익힌 음식", "면역저하 시 익힌 음식·저온살균 제품 선택 후보", "nccImmuneLowDiet"],
  ["저온살균 요구르트", "면역저하 시 익힌 음식·저온살균 제품 선택 후보", "nccImmuneLowDiet"],
  ["유통기한 확인", "면역저하 시 구매·해동 안전 확인 후보", "nccImmuneLowDiet"],
  ["냉장고에서 해동", "면역저하 시 구매·해동 안전 확인 후보", "nccImmuneLowDiet"],
  ["체중감소 김밥", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 주먹밥", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 야채죽", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 전복죽", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 계란죽", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 잣죽", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 감자", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 고구마", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 떡", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 만두", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 과일주스", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 과일통조림", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 땅콩버터", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 계란찜", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 두유", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 두부조림", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 생선전", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 어묵", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  ["체중감소 요구르트", "국가암정보센터 체중감소 시 열량·단백질 보충 후보", "nccWeightChangeDiet"],
  [
    "피로감 영양이 풍부한 음식",
    "국가암정보센터 피로감·우울 시 영양 보충·식사 빈도 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "피로감 하루 중 가장 좋은 시간에 많이 먹기",
    "국가암정보센터 피로감·우울 시 영양 보충·식사 빈도 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "피로감 휴식 후 먹기",
    "국가암정보센터 피로감·우울 시 영양 보충·식사 빈도 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "피로감 적은 양의 식사와 간식",
    "국가암정보센터 피로감·우울 시 영양 보충·식사 빈도 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "피로감 음식배달서비스",
    "국가암정보센터 피로감·우울 시 영양 보충·식사 빈도 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "우울 좋아하는 음식",
    "국가암정보센터 피로감·우울 시 영양 보충·식사 빈도 후보",
    "nccFatigueDepressionDiet",
  ],
  ["식욕부진 간식", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 죽", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 미음", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 쥬스", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 주스", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 스프", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["특수영양 보충음료", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["물 조금씩 자주", "국가암정보센터 입안 건조증 시 침 분비·삼킴 도움 후보", "nccDryMouthDiet"],
  ["물 한 모금", "국가암정보센터 입안 건조증 시 침 분비·삼킴 도움 후보", "nccDryMouthDiet"],
  ["소스나 드레싱", "국가암정보센터 입안 건조증 시 침 분비·삼킴 도움 후보", "nccDryMouthDiet"],
  ["딱딱한 사탕", "국가암정보센터 입안 건조증 시 침 분비·삼킴 도움 후보", "nccDryMouthDiet"],
  ["껌 씹기", "국가암정보센터 입안 건조증 시 침 분비·삼킴 도움 후보", "nccDryMouthDiet"],
  [
    "껌",
    "국가암정보센터 입안 건조증 시 침 분비·삼킴 도움 후보",
    "nccDryMouthDiet",
    standaloneFoodTermOptions,
  ],
  ["견과", "불포화지방과 간식 대체", "kdcaNutrition"],
  ["호두", "견과류", "kdcaNutrition"],
  [
    "치료 중 균형 잡힌 식사",
    "국가암정보센터 치료 중 균형식·충분한 영양 섭취 후보",
    "nccTreatmentEating",
  ],
  [
    "치료 중 충분한 열량과 단백질",
    "국가암정보센터 치료 중 균형식·충분한 영양 섭취 후보",
    "nccTreatmentEating",
  ],
  [
    "치료 중 비타민 및 무기질",
    "국가암정보센터 치료 중 균형식·충분한 영양 섭취 후보",
    "nccTreatmentEating",
  ],
  [
    "여러 가지 음식을 골고루",
    "국가암정보센터 치료 중 균형식·충분한 영양 섭취 후보",
    "nccTreatmentEating",
  ],
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
  [
    "육류 섭취 시 이를 구워 먹기(숯불구이, 직접 구이 등)보다는 삶거나 끓여서(수육, 보쌈 등) 먹습니다",
    "국가암정보센터 건강한 식생활 삶거나 끓인 육류 조리 예시 후보",
    "nccPreventionDiet",
  ],
  [
    "육류 구워 먹기보다는 삶거나 끓여서 수육 보쌈 먹기",
    "국가암정보센터 건강한 식생활 삶거나 끓인 육류 조리 예시 후보",
    "nccPreventionDiet",
  ],
  [
    "수육",
    "국가암정보센터 건강한 식생활 삶거나 끓인 육류 조리 예시 후보",
    "nccPreventionDiet",
  ],
  [
    "보쌈",
    "국가암정보센터 건강한 식생활 삶거나 끓인 육류 조리 예시 후보",
    "nccPreventionDiet",
  ],
  ["닭고기", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["달걀", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["생선", "국가암정보센터 암예방 식단 단백질 적정량 예시 후보", "nccPreventionMealExamples"],
  ["플레인 요구르트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["플레인 요거트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["저지방 유제품", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["저지방 요구르트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  ["저지방 요거트", "국가암정보센터 암예방 샐러드 저지방 유제품 예시 후보", "nccPreventionMealExamples"],
  [
    "저지방 우유를 하루 1잔 정도 마십니다",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 정도 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "저지방 우유 하루 1잔 정도 마시기",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 정도 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "저지방 우유 하루 1잔 정도",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 정도 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "하루 1잔 정도 저지방 우유",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 정도 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "하루 1잔 저지방 우유",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "저지방 우유 하루 1잔",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "저지방 우유 1잔",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 섭취 후보",
    "nccPreventionDiet",
  ],
  [
    "저지방 우유",
    "국가암정보센터 건강한 식생활 저지방 우유 하루 1잔 섭취 후보",
    "nccPreventionDiet",
  ],
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
  [
    "붉은색 육류 섭취 시 1회에 1인분씩, 주 3인분(익힌 상태로 350~500g)을 넘지 않도록 합니다",
    "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "붉은색 육류 1회 1인분 주 3인분 350~500g 이하",
    "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "붉은색 육류 주 3인분",
    "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "붉은 육류 주 3인분",
    "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "붉은 육류 350~500g",
    "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "익힌 상태 350~500g",
    "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "붉은색 육류",
    "국가암정보센터 건강한 식생활 붉은색 육류 주 3인분·350~500g 이하 제한 후보",
    "nccPreventionDiet",
  ],
  ["흰쌀밥", "자궁경부암 실천지침 식이섬유 증가 대체 전 예시", "nccCervicalPracticeDiet"],
  ["쌀밥", "자궁경부암 실천지침 식이섬유 증가 대체 전 예시", "nccCervicalPracticeDiet", standaloneFoodTermOptions],
  ["햄구이", "자궁경부암 실천지침 식단 제한 예시", "nccCervicalPracticeDiet"],
  [
    "소시지",
    "국가암정보센터 암예방 식단 가공육류 가급적 적게 섭취 예시",
    "nccPreventionMealExamples",
  ],
  ["베이컨", "가공육", "nccPreventionDiet"],
  [
    "햄",
    "국가암정보센터 암예방 식단 가공육류 가급적 적게 섭취 예시",
    "nccPreventionMealExamples",
    standaloneFoodTermOptions,
  ],
  ["핫도그", "가공육", "nccPreventionDiet"],
  ["살라미", "가공육", "nccPreventionDiet"],
  [
    "가공육류",
    "국가암정보센터 암예방 식단 가공육류 가급적 적게 섭취 예시",
    "nccPreventionMealExamples",
  ],
  [
    "가공육",
    "국가암정보센터 암예방 식단 가공육류 가급적 적게 섭취 예시",
    "nccPreventionMealExamples",
    standaloneFoodTermOptions,
  ],
  [
    "육가공품",
    "국가암정보센터 암예방 식단 가공육류 가급적 적게 섭취 예시",
    "nccPreventionMealExamples",
  ],
  [
    "햄, 소시지 등의 육가공품을 가급적 먹지 않습니다",
    "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "햄 소시지 등의 육가공품 가급적 먹지 않기",
    "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "햄 소시지 육가공품",
    "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "육가공품 가급적 먹지 않습니다",
    "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "육가공품 가급적 먹지 않기",
    "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "햄·소시지",
    "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "햄 소시지",
    "국가암정보센터 건강한 식생활 햄·소시지 등 육가공품 가급적 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "직화 구이",
    "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
    "nccPreventionMealExamples",
  ],
  [
    "직화구이",
    "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
    "nccPreventionMealExamples",
  ],
  [
    "숯불구이",
    "국가암정보센터 건강한 식생활 숯불·직접 구이와 지방 많은 부위 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "직접 구이",
    "국가암정보센터 건강한 식생활 숯불·직접 구이와 지방 많은 부위 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "직접구이",
    "국가암정보센터 건강한 식생활 숯불·직접 구이와 지방 많은 부위 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "지방 함량이 많은 부위의 육류 섭취는 제한합니다",
    "국가암정보센터 건강한 식생활 지방 많은 육류 부위 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "지방 함량이 많은 육류 부위 섭취 제한",
    "국가암정보센터 건강한 식생활 지방 많은 육류 부위 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "지방 함량이 많은 부위",
    "국가암정보센터 건강한 식생활 숯불·직접 구이와 지방 많은 부위 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "지방 많은 부위",
    "국가암정보센터 건강한 식생활 숯불·직접 구이와 지방 많은 부위 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "탄 음식은 먹지 않기",
    "국가암정보센터 건강한 식생활 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "탄 음식은 먹지 않습니다",
    "국가암정보센터 건강한 식생활 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "숯불로 굽거나 직접 구워 탄 음식의 섭취는 삼가합니다",
    "국가암정보센터 건강한 식생활 숯불·직접 구이 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "숯불로 굽거나 직접 구워 탄 음식 섭취 삼가",
    "국가암정보센터 건강한 식생활 숯불·직접 구이 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "숯불로 굽거나 직접 구워서 탄 음식의 섭취는 삼가합니다",
    "국가암정보센터 건강한 식생활 숯불·직접 구이 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "숯불로 굽거나 직접 구워서 탄 음식 섭취 삼가",
    "국가암정보센터 건강한 식생활 숯불·직접 구이 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "숯불로 구운 탄 음식",
    "국가암정보센터 건강한 식생활 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "직접 구워 탄 음식",
    "국가암정보센터 건강한 식생활 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
  [
    "탄 음식 섭취 삼가",
    "국가암정보센터 건강한 식생활 탄 음식 섭취 삼가기 후보",
    "nccPreventionDiet",
  ],
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
  [
    "너무 뜨겁거나 매운 음식의 섭취는 피합니다",
    "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 섭취 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "너무 뜨겁거나 매운 음식 섭취 피하기",
    "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 섭취 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "너무 뜨겁거나 매운 음식",
    "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "너무 뜨거운 음식",
    "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "뜨거운 음식",
    "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "너무 매운 음식",
    "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 피하기 후보",
    "nccPreventionDiet",
  ],
  [
    "매운 음식",
    "국가암정보센터 건강한 식생활 너무 뜨겁거나 매운 음식 피하기 후보",
    "nccPreventionDiet",
  ],
  ["기름진 음식", "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보", "nccNauseaDiet"],
  ["매우 단 음식", "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보", "nccNauseaDiet"],
  [
    "향이 강하거나 뜨거운 음식",
    "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보",
    "nccNauseaDiet",
  ],
  [
    "이상한 냄새가 나는 음식",
    "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보",
    "nccNauseaDiet",
  ],
  ["토마토주스", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  ["토스트", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  ["크래커", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  ["말린 음식", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  ["설사 생야채", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 생과일 껍질", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 브로콜리", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 옥수수", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 말린 콩", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 커피", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 초콜릿", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 우유 및 유제품", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["체중증가 가공식품", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 김치", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 젓갈", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 장아찌류", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 청량 음료", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 초콜릿", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 사탕", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 과자류", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 고열량 간식", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["단무지", "자궁경부암 실천지침 식단 제한 예시", "nccCervicalPracticeDiet"],
  ["우엉조림", "자궁경부암 실천지침 나트륨 감소 대체 전 예시", "nccCervicalPracticeDiet"],
  [
    "인공조미료(화학조미료 포함)의 사용을 제한하며 음식을 싱겁게 만들어 먹습니다",
    "국가암정보센터 건강한 식생활 인공조미료 제한·싱겁게 만들기 후보",
    "nccPreventionDiet",
  ],
  [
    "인공조미료 화학조미료 사용 제한 싱겁게 만들어 먹기",
    "국가암정보센터 건강한 식생활 인공조미료 제한·싱겁게 만들기 후보",
    "nccPreventionDiet",
  ],
  [
    "인공조미료",
    "국가암정보센터 건강한 식생활 인공조미료·추가 소금/간장 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "화학조미료",
    "국가암정보센터 건강한 식생활 인공조미료·추가 소금/간장 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "음식을 먹을 때 추가로 소금이나 간장을 사용하지 않습니다",
    "국가암정보센터 건강한 식생활 추가 소금이나 간장 사용하지 않기 후보",
    "nccPreventionDiet",
  ],
  [
    "소금이나 간장 사용하지 않기",
    "국가암정보센터 건강한 식생활 추가 소금이나 간장 사용하지 않기 후보",
    "nccPreventionDiet",
  ],
  [
    "추가 소금",
    "국가암정보센터 건강한 식생활 인공조미료·추가 소금/간장 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "소금 추가",
    "국가암정보센터 건강한 식생활 인공조미료·추가 소금/간장 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "추가 간장",
    "국가암정보센터 건강한 식생활 인공조미료·추가 소금/간장 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "간장 추가",
    "국가암정보센터 건강한 식생활 인공조미료·추가 소금/간장 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "젓갈류와 염(소금) 저장식품(김치 또는 장아찌류 등)의 섭취는 제한합니다",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "젓갈류 염 소금 저장식품 김치 장아찌류 섭취 제한",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "젓갈류",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "염 저장식품",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "소금 저장식품",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "김치 또는 장아찌류",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
    "nccPreventionDiet",
  ],
  ["젓갈", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  ["장아찌", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  ["염장", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  ["배추김치", "암예방 식단 염장식품 소량 예시", "nccPreventionMealExamples"],
  ["열무김치", "암예방 식단 염장식품 소량 예시", "nccPreventionMealExamples"],
  ["짠 김치", "염장 식품은 조금만 섭취", "nccPreventionDiet"],
  [
    "국이나 찌개의 국물 섭취는 제한합니다",
    "국가암정보센터 건강한 식생활 국/찌개 국물 섭취 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "국이나 찌개 국물 섭취 제한",
    "국가암정보센터 건강한 식생활 국/찌개 국물 섭취 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "국이나 찌개의 국물",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "찌개 국물",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
    "nccPreventionDiet",
  ],
  [
    "국물 섭취",
    "국가암정보센터 건강한 식생활 젓갈류·염 저장식품·국/찌개 국물 제한 후보",
    "nccPreventionDiet",
  ],
  ["국물", "국·찌개 국물 제한 예시", "nccCervicalPracticeDiet"],
  [
    "튀김 조리법",
    "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
    "nccPreventionMealExamples",
  ],
  [
    "튀김 조리",
    "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
    "nccPreventionMealExamples",
  ],
  [
    "튀긴 음식",
    "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
    "nccPreventionMealExamples",
  ],
  [
    "튀김",
    "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
    "nccPreventionMealExamples",
  ],
  [
    "튀긴",
    "국가암정보센터 암예방 식단 직화 구이·튀김 조리법 피하기 예시",
    "nccPreventionMealExamples",
  ],
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
  [
    "암을 낫게 해주는 특별한 식품",
    "국가암정보센터 치료 중 특별식품·특별영양소 cure claim 확인 필요",
    "nccTreatmentEating",
  ],
  [
    "암을 낫게 해주는 특별한 영양소",
    "국가암정보센터 치료 중 특별식품·특별영양소 cure claim 확인 필요",
    "nccTreatmentEating",
  ],
  [
    "특별한 항암 식품",
    "국가암정보센터 치료 중 특별식품·특별영양소 cure claim 확인 필요",
    "nccTreatmentEating",
  ],
  [
    "특별한 항암 영양소",
    "국가암정보센터 치료 중 특별식품·특별영양소 cure claim 확인 필요",
    "nccTreatmentEating",
  ],
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
  ["상온 30분 이상 운반", "면역저하 시 상온 운반 후 즉시 냉장 확인", "nccImmuneLowDiet"],
  ["녹슨 캔", "면역저하 시 손상 캔·해동 냉동제품 구매 주의", "nccImmuneLowDiet"],
  ["움푹해진 캔", "면역저하 시 손상 캔·해동 냉동제품 구매 주의", "nccImmuneLowDiet"],
  ["냉동제품 녹음", "면역저하 시 손상 캔·해동 냉동제품 구매 주의", "nccImmuneLowDiet"],
  ["3~4일 지난 남은 음식", "면역저하 시 3~4일 지난 남은 음식 폐기 기준 확인", "nccImmuneLowDiet"],
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
