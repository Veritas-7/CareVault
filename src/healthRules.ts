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
  | "nccDietPracticeFiber"
  | "nccPreventionMealExamples"
  | "nccSideEffectDiet"
  | "nccAppetiteLossDiet"
  | "nccNauseaDiet"
  | "nccVomitingDiet"
  | "nccTasteChangeDiet"
  | "nccDiarrheaDiet"
  | "nccConstipationDiet"
  | "nccWeightMaintenanceDiet"
  | "nccWeightChangeDiet"
  | "nccFatigueDepressionDiet"
  | "nccMouthPainDiet"
  | "nccMucositisCare"
  | "nccDryMouthDiet"
  | "nccImmuneLowDiet"
  | "nccNauseaVomitingCare"
  | "nccComplementaryTherapy"
  | "nccCervicalDiet"
  | "nccCervicalFoodPrevention"
  | "nccCervicalRiskFactors"
  | "nccCervicalPracticeDiet"
  | "nccCervicalEarlyDiagnosisPrevention"
  | "nccTreatmentEating"
  | "nccTreatmentNutrients"
  | "nccTreatmentRightEating"
  | "nccTreatmentHealthyEatingTips"
  | "nccAfterTreatmentHealthyEating"
  | "nccChemoSideEffectGuide"
  | "kdcaNutrition"
  | "kdcaAlcohol"
  | "kdcaVibrioSepsis"
  | "kdcaNorovirusFoodSafety"
  | "kdcaFoodPoisoningNaturalToxins"
  | "foodSafetyKoreaNorovirusFoodPoisoning"
  | "foodSafetyKoreaStaphylococcusAureusFoodPoisoning"
  | "foodSafetyKoreaSalmonellaFoodPoisoning"
  | "foodSafetyKoreaBacillusCereusFoodPoisoning"
  | "foodSafetyKoreaClostridiumPerfringensFoodPoisoning"
  | "foodSafetyKoreaClostridiumBotulinumFoodPoisoning"
  | "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning"
  | "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning"
  | "foodSafetyKoreaListeriaFoodPoisoning"
  | "foodSafetyKoreaCampylobacterFoodPoisoning"
  | "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning"
  | "mfdsSalmonellaEggSafety"
  | "mfdsFoodPoisoningPrevention";

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
  nccDietPracticeFiber: {
    label: "국가암정보센터 국민 암예방 수칙 실천지침 식이",
    url: "https://cancer.go.kr/download.do?uuid=646c1953-81f7-48ca-ad26-cdd0f382cfb8.pdf",
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
  nccWeightMaintenanceDiet: {
    label: "국가암정보센터 적정 체중과 체지방 유지",
    url: "https://www.cancer.go.kr/download.do?uuid=ccd2b0bb-1a1f-4ac8-a1d7-955d7ff81fcd.pdf",
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
  nccMucositisCare: {
    label: "국가암정보센터 구강증상 - 입안의 염증(구내염)",
    url: "https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
  },
  nccDryMouthDiet: {
    label: "국가암정보센터 증상별 식생활 - 입안의 건조증",
    url: "https://cancer.go.kr/lay1/S1T479C485/contents.do",
  },
  nccImmuneLowDiet: {
    label: "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    url: "https://cancer.go.kr/lay1/S1T479C489/contents.do",
  },
  nccNauseaVomitingCare: {
    label: "국가암정보센터 메스꺼움과 구토 도움이 되는 방법",
    url: "https://cancer.go.kr/lay1/S1T398C404/contents.do",
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
  nccCervicalRiskFactors: {
    label: "국가암정보센터 자궁경부암 위험요인",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4884",
  },
  nccCervicalPracticeDiet: {
    label: "국가암정보센터 자궁경부암 실천지침 식생활",
    url: "https://www.cancer.go.kr/download.do?uuid=6fb06571-5b8b-4dbe-9473-1074110e631d.pdf",
  },
  nccCervicalEarlyDiagnosisPrevention: {
    label: "국립암센터 자궁경부암 조기 진단과 예방법",
    url: "https://www.cancer.go.kr/download.do?uuid=adf8879c-4343-445e-b67d-0c60e5ac9b58.pdf",
  },
  nccTreatmentEating: {
    label: "국가암정보센터 치료 중 일반적인 식생활",
    url: "https://www.cancer.go.kr/lay1/S1T471C472/contents.do",
  },
  nccTreatmentNutrients: {
    label: "국가암정보센터 치료 중 영양소",
    url: "https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
  },
  nccTreatmentRightEating: {
    label: "국가암정보센터 치료 중 올바르게 식사하기",
    url: "https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
  },
  nccTreatmentHealthyEatingTips: {
    label: "국가암정보센터 치료 중 건강식을 먹는 요령",
    url: "https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
  },
  nccAfterTreatmentHealthyEating: {
    label: "국가암정보센터 치료 후 건강한 식생활",
    url: "https://www.cancer.go.kr/download.do?uuid=500129bf-9dac-4580-a42f-df5b8c0e6c48.pdf",
  },
  nccChemoSideEffectGuide: {
    label: "국가암정보센터 항암 부작용 증상 관리 지침",
    url: "https://cancer.go.kr/download.do?uuid=d402e586-c237-419d-ae6f-da36d3b97109.pdf",
  },
  kdcaNutrition: {
    label: "질병관리청 국가건강정보포털 식이영양",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6693",
  },
  kdcaAlcohol: {
    label: "질병관리청 국가건강정보포털 위험음주",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5355",
  },
  kdcaVibrioSepsis: {
    label: "질병관리청 국가건강정보포털 비브리오 패혈증",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5372",
  },
  kdcaNorovirusFoodSafety: {
    label: "질병관리청 국가건강정보포털 노로바이러스 식중독 예방",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=80",
  },
  foodSafetyKoreaNorovirusFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 노로바이러스",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  kdcaFoodPoisoningNaturalToxins: {
    label: "질병관리청 국가건강정보포털 식중독",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5239",
  },
  foodSafetyKoreaStaphylococcusAureusFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 황색포도상구균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaSalmonellaFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 살모넬라균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaBacillusCereusFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 바실러스 세레우스균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaClostridiumPerfringensFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 클로스트리디움 퍼프린젠스균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaClostridiumBotulinumFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 클로스트리디움 보툴리늄균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 장출혈성 대장균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 장염비브리오균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaListeriaFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 리스테리아",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaCampylobacterFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 캠필로박터",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning: {
    label: "식품안전나라 주요 식중독균별 특성 - 여시니아 엔테로콜리티카균",
    url: "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs400&menu_grp=MENU_NEW02&menu_no=4418&ntctxt_no=1068747",
  },
  mfdsSalmonellaEggSafety: {
    label: "식품의약품안전처 달걀 조리식품 살모넬라 식중독 주의",
    url: "https://www.mfds.go.kr/brd/m_99/view.do?seq=50005",
  },
  mfdsFoodPoisoningPrevention: {
    label: "식품의약품안전처 식중독 예방 6대요령",
    url: "https://www.mfds.go.kr/brd/m_827/view.do?seq=3609",
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
          "공식 자료는 자궁경부암 환자가 특별히 피하거나 추천하는 음식은 없고, 치료 전·치료 중·치료 후 올바른 음식섭취와 충분한 영양과 휴식이 중요하다고 설명합니다.",
        examples:
          "자궁경부암 환자가 특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다., 충분한 영양을 섭취하고 휴식을 취하는 것이 몸의 면역 기능 강화와 투병 생활에 도움이 될 수 있습니다., 영양은 암치료에 있어서 중요한 부분입니다. 치료 전, 치료기간 동안, 그리고 치료 후 올바른 음식섭취는 기분을 좋게 하고 강하게 만들어 줄 것입니다., 평소 먹기 쉬운 음식, 소량씩 자주 먹기, 통증·식욕 저하를 진료팀에 공유",
        sourceIds: ["nccCervicalDiet"],
      },
      {
        label: "카로테노이드·신선식품 메모",
        detail:
          "자궁경부암 예방과 음식 자료는 베타카로틴이 풍부한 신선식품 예시를 제시하지만 카로테노이드·비타민 식품의 예방 효과가 아직 명확하지 않다고 설명하고, 정기 검진이 가장 효과적인 예방 방법이며 안전한 성생활·금연과 함께 일반적인 건강 생활로 신선한 채소·과일 섭취가 좋다고 안내하므로 치료식으로 보지 않고 신선한 채소·과일·해조류 섭취 질문으로 남깁니다.",
        examples:
          "카로틴(carotene)과 거의 유사한 구조를 가진 물질을 카로테노이드라고 하며, 그 중 베타카로틴 은 당근, 시금치, 차, 미역 등 신선한 채소, 과일, 해조류에 풍부합니다., 그러므로 자궁경부암의 예방을 위해서는 조기 검진과 정기 검진이 가장 효과적인 방법이며, 일반적으로 건강한 생활을 위해서는 신선한 채소 및 과일을 충분히 섭취하는 것이 좋습니다., 이상에서 살펴본 바와 같이, 자궁경부암의 예방을 위해서는 정기적인 검진이 가장 효과적인 방법이며, 안전한 성생활을 유지하고, 금연을 하며, 신선한 채소 및 과일을 충분히 섭취하는 것이 좋습니다., 당근, 시금치, 차, 미역, 신선한 채소, 과일, 해조류",
        sourceIds: ["nccCervicalFoodPrevention"],
      },
      {
        label: "조기진단 자료 균형식 생활수칙",
        detail:
          "국립암센터 자궁경부암 조기 진단과 예방법 PDF는 생활수칙 식생활 항목에서 채소와 과일을 충분하게 먹고 다채로운 식단으로 균형 잡힌 식사를 하도록 안내합니다. 식단 기록에서는 최신 조기진단 자료의 생활수칙 문구를 보존하되, 특정 음식의 치료 효과나 보장으로 과장하지 않습니다.",
        examples: "채소와 과일을 충분하게 먹고, 다채로운 식단으로 균형 잡힌 식사하기",
        sourceIds: ["nccCervicalEarlyDiagnosisPrevention"],
      },
      {
        label: "실천지침 식단 예시",
        detail:
          "국민 암예방 수칙 자궁경부암 실천지침은 암예방을 위한 식단 예시를 다양하게 활용하도록 하며, 채소·과일을 충분히 섭취하고 짠 음식과 탄 음식을 제한하는 식단 예시를 제시합니다. 식단 작성 시 다양한 종류의 식품을 섭취할 수 있도록 계획하고, 파프리카·피망·시금치·토마토·당근·양배추처럼 식품이 지닌 색상을 고려해 다양한 색상이 포함되도록 식품을 선택하라고 안내합니다. 규칙적인 식생활과 즐거운 마음의 식사도 함께 권합니다. 예시 식단은 채소샐러드에 요플레드레싱을 사용해 채소 섭취량을 늘리고, 북어콩나물국과 쇠고기뭇국의 소금·간장 사용을 줄이며, 우엉조림을 우엉볶음으로 바꾸어 나트륨 섭취를 줄이는 조리 예시도 함께 보여줍니다. 자궁경부암 예방 생활 실천으로 식이섬유가 풍부한 신선한 채소와 과일 섭취도 제시합니다. 식단표에는 느타리버섯볶음, 달래무무침, 닭고기덮밥, 왜된장국, 보리밥, 김구이 같은 일반 식사 예시도 포함됩니다.",
        examples:
          "암예방을 위한 식단의 예입니다. 다음에 제시된 식단을 다양하게 활용하시기 바랍니다., 식단 작성 시 다양한 종류의 식품을 섭취할 수 있도록 계획해 보십시오., 파프리카, 피망, 시금치, 토마토, 당근, 양배추 등 식품이 지닌 색상을 고려하여 다양한 종류의 색상이 포함되도록 식품을 선택해 보십시오., 건강을 생각해서 규칙적인 식생활과 더불어 즐거운 마음으로 식사를 하시기 바랍니다., 식이섬유가 풍부한 신선한 채소, 과일 섭취, 식이 섬유가 풍부한 신선한 채소·과일 섭취, 파프리카, 피망, 토마토, 잡곡밥, 과일샐러드, 채소샐러드, 채소 섭취량 증가(채소샐러드는 요플레드레싱 사용), 브로콜리회, 귤, 딸기 요플레, 느타리버섯볶음, 달래무무침, 닭고기덮밥, 왜된장국, 보리밥, 김구이, 북어콩나물국, 소금 및 간장 사용량 감소(소금 섭취량 감소), 시금치나물, 우엉볶음, 우엉조림 → 우엉볶음 : 간장 사용량 감소(소금 섭취량 감소), 쇠고기뭇국, 소금 대신 간장 사용으로 나트륨 섭취량 감소",
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
        label: "식이섬유 간식 대체 예시",
        detail:
          "국민 암예방 수칙 식이 실천지침은 매일 5가지 색의 채소와 과일을 먹고, 과자나 탄산음료 대신 고구마·채소·과일 같은 간식 대체 예시를 선택하도록 안내합니다.",
        examples:
          "매일 5가지 색(빨강, 초록, 노랑, 보라, 하양)의 채소와 과일을 먹습니다., 간식으로 과자나 탄산음료 대신 고구마(중간 크기 1개 정도), 채소(예: 당근1/5개, 오이1/4개 정도) 및 과일 (예: 사과1/2개, 딸기 10개 정도)을 먹습니다., 고구마(중간 크기 1개 정도), 당근1/5개, 오이1/4개, 사과1/2개, 딸기 10개",
        sourceIds: ["nccDietPracticeFiber"],
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
        label: "체중 유지 채소·과일 조절",
        detail:
          "국가암정보센터 적정 체중과 체지방 유지 자료는 과체중 또는 비만인 경우 적정 체중과 체지방을 유지하기 위한 노력의 일부로 채소는 충분히 먹고 과일은 적당량 먹도록 안내합니다.",
        examples: "채소는 충분히, 과일을 적당량 먹는다.",
        sourceIds: ["nccWeightMaintenanceDiet"],
      },
      {
        label: "체중 유지 규칙적 균형식",
        detail:
          "국가암정보센터 적정 체중과 체지방 유지 자료는 과체중 또는 비만인 경우 적정 체중과 체지방을 유지하기 위한 노력의 일부로 다양한 음식을 제때에 골고루 먹도록 안내합니다.",
        examples: "다양한 음식을 제때에, 골고루 먹는다",
        sourceIds: ["nccWeightMaintenanceDiet"],
      },
      {
        label: "체중 유지 천천히 식사",
        detail:
          "국가암정보센터 적정 체중과 체지방 유지 자료는 과체중 또는 비만인 경우 적정 체중과 체지방을 유지하기 위한 노력의 일부로 과식을 피하기 위해 천천히 먹도록 안내합니다.",
        examples: "과식을 피하기 위해 천천히 먹는다.",
        sourceIds: ["nccWeightMaintenanceDiet"],
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
        label: "치료 중 적정 열량·고단백 회복식",
        detail:
          "국가암정보센터 치료 중 올바르게 식사하기 자료는 적정 열량과 필수 영양소 섭취를 강조하며, 충분한 열량·단백질·비타민·무기질로 좋은 영양 상태를 유지하고 고칼로리·고단백질 음식을 포함한 다양한 음식을 골고루 먹도록 안내합니다.",
        examples:
          "건강식이란 균형 잡힌 식사를 말합니다. 즉, 다양한 음식을 골고루 먹는 것입니다. 그래야 충분한 열량과 단백질, 비타민과 무기질을 섭취하여 좋은 영양 상태를 유지할 수 있습니다., 충분한 열량과 다양한 영양소를 섭취해야 암과 그 치료를 감당하고 부작용도 극복할 수 있는 체력이 만들어집니다., 특히 고칼로리, 고단백질의 음식은 치료 효과를 높이고 빠른 회복을 돕습니다., 따라서 암환자의 건강식이란 좋아하는 음식에다 다른 여러 식품을 고루 곁들여 먹는 것이라 하겠습니다., 치료 중 적정 열량과 필수 영양소, 치료 중 충분한 열량 단백질 비타민 무기질, 고칼로리, 고단백질의 식품을 비롯한 다양한 음식을 골고루 섭취하는 것이 도움이 됩니다, 치료 중 고칼로리 고단백질 음식, 치료 중 좋아하는 음식과 여러 식품, 치료 중 다양한 음식 골고루",
        sourceIds: ["nccTreatmentRightEating"],
      },
      {
        label: "치료 중 건강식 회복 지원",
        detail:
          "국가암정보센터 치료 중 올바르게 식사하기 자료는 건강식이 좋은 영양 상태로 치료 참여를 돕고, 치료 부작용 극복과 감염 위험 감소 및 항암치료 후 손상 세포 재생을 지원하며 치료 효과와 삶의 질에도 좋은 영향을 줄 수 있다고 설명합니다.",
        examples:
          "항암치료 로 손상된 세포의 재생을 도와줍니다., 따라서 치료 효과에도, 삶의 질에도 좋은 영향을 줄 수 있습니다., 환자가 좋은 영양 상태로 치료에 적극 참여할 수 있게 해줍니다., 치료에 의한 부작용을 더 잘 극복하게 해줍니다., 감염의 위험을 감소시켜 줍니다.",
        sourceIds: ["nccTreatmentRightEating"],
      },
      {
        label: "치료 중 탄수화물·단백질·수분",
        detail:
          "치료 중 영양 자료의 탄수화물 설명: 탄수화물(carbohydrate)은 우리 몸에 열량을 공급하는 주요 에너지원으로, 이것이 부족하면 기초 체력이 저하하고 피곤해지며 체중이 줄게 됩니다. 탄수화물 식품 설명: 탄수화물이 풍부하게 들어 있는 음식은 밥, 국수, 빵, 떡, 감자, 고구마, 옥수수 등입니다. 단백질 설명: 단백질(protein)은 체세포의 주성분으로서 우리 몸을 구성하고 유지하는 역할을 하며, 각종 효소와 호르몬, 항체 등의 성분이 됩니다. 단백질 식품 설명: 단백질이 많이 든 식품으로는 쇠고기, 돼지고기, 닭고기 등의 육류와 생선류, 조개류, 달걀, 두부, 우유 등이 있습니다. 지방 설명: 지방(fat)은 탄수화물과 같이 우리 몸에 열량을 공급하는 주요 에너지원으로 참기름, 들기름, 콩기름, 버터 등에 함유되어 있습니다. 비타민·무기질 설명: 우리 몸의 생리 기능을 조절하는 대표적인 영양소로 비타민과 무기질(vitamins and minerals)이 있습니다. 신체의 성장‧발달과 건강 유지에 필수적이므로, 필요량은 적지만 규칙적으로 섭취하는 것이 좋습니다. 채소와 과일 등에 많이 들어 있습니다. 물 설명: 물은 중요한 영양소로 생각되지 않는 게 보통이지만, 사실은 혈액과 신체 조직의 핵심적인 성분이면서 영양소와 노폐물을 운반하고 체온을 유지해 주는 등 생명 유지에 필수적인 요소입니다. 수분의 섭취가 부족하거나, 구토‧설사나 고열이 지속되거나, 땀을 과도하게 흘릴 경우에는 탈수가 일어날 수 있습니다. 일반적으로 성인은 하루에 6~8컵 정도의 물이 필요합니다. 이 자료는 탄수화물, 단백질, 지방, 비타민·무기질, 물을 기본 영양소로 설명하고, 감자·고구마·옥수수 같은 탄수화물 식품, 쇠고기·돼지고기·닭고기 등 육류와 생선류·조개류·달걀·두부·우유 같은 단백질 식품, 참기름·들기름·콩기름·버터 같은 지방 식품, 채소와 과일의 비타민·무기질, 성인 하루 물 6~8컵을 예시로 안내합니다. 건강한 식생활 자료는 육류 섭취 시 구워 먹기보다는 삶거나 끓인 조리 예시를 제시하며, 면역저하 자료는 음식으로 인한 감염 예방을 위해 완전히 익힌 음식과 쥬스·우유·요구르트 등 저온살균 제품을 선택하도록 안내합니다.",
        examples:
          "치료 중 탄수화물 에너지원, 감자, 고구마, 옥수수, 물 6~8컵, 하루 6~8컵 물, 치료 중 단백질 식품, 치료 중 육류와 생선류, 치료 중 조개류, 치료 중 달걀 두부 우유, 치료 중 참기름 들기름 콩기름 버터, 치료 중 채소와 과일, 육류 섭취 시 이를 구워 먹기(숯불구이, 직접 구이 등)보다는 삶거나 끓여서(수육, 보쌈 등) 먹습니다, 육류 구워 먹기보다는 삶거나 끓여서 수육 보쌈 먹기, 완전히 익힌 음식, 저온살균 우유, 저온살균 주스, 저온살균 제품, 저온살균 요구르트, 유통기한 확인, 냉장고에서 해동, 익힌 생선·닭고기·달걀, 수육, 보쌈, 고등어, 두부, 저지방 우유, 플레인 요구르트, 물",
        sourceIds: ["nccTreatmentNutrients", "nccPreventionDiet", "nccImmuneLowDiet"],
      },
      {
        label: "면역저하 백혈구 감소 익힌 음식 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 백혈구수가 감소한 경우 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염 예방을 위해 익힌 음식을 먹도록 안내하고, 식품으로 인한 질병 위험을 낮추는 데 도움이 되는 식품안전 사항을 참조하도록 설명합니다.",
        examples:
          "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다, 다음 사항들을 참조하면 식품으로 인한 질병의 위험을 낮추는 데 도움이 될 것입니다.",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "면역저하 식품 구입 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 식품 구입 시 신선도 유지를 위해 대량 구입하지 않고 소량씩 구입하며, 식품 유통기한을 꼭 확인하도록 안내합니다. 갈은 고기는 가는 과정에서 오염 가능성이 커질 수 있으므로 직접 갈아주는 곳에서 구입하도록 설명합니다.",
        examples:
          "신선도 유지를 위해 음식은 대량 구입하시지 마시고 소량씩 구입해서 드시기 바랍니다, 식품의 유통기한을 꼭 확인합니다, 갈은 고기를 살 경우에는 직접 갈아주는 곳에서 구입합니다, 유통기한 꼭 확인, 신선도 유지, 대량 구입하지 않기, 소량씩 구입, 직접 갈아주는 곳에서 구입",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "면역저하 상온 운반 후 냉장 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 식품이 30분 이상 상온에서 운반된 경우 곧바로 냉장고에 넣어 차갑게 보관하도록 안내합니다.",
        examples: "곧바로 냉장고에 넣어 차갑게, 상온 운반 후 즉시 냉장",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "면역저하 보관·해동 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 상하기 쉬운 음식은 냉장고나 냉동고에 보관하고, 요리하기 전 고기·생선·닭고기는 비닐팩이나 플라스틱통에 분리 보관하며, 다른 식품에 고기나 생선즙이 떨어지지 않도록 보관하라고 안내합니다. 냉동고 식품은 랩이나 팩에 포장하고, 해동 후 즉시 요리하며, 남은 음식은 포장해 즉시 냉장 보관하도록 설명합니다.",
        examples:
          "상하기 쉬운 음식은 냉장고, 혹은 냉동고에 보관합니다, 상하기 쉬운 음식 냉장고 냉동고 보관, 요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다, 다른 식품에 고기나 생선즙이 떨어지지 않도록 보관합니다, 요리하기 전의 고기 생선 닭고기 분리 보관, 고기나 생선즙이 떨어지지 않도록 보관, 고기는 냉장고에서 녹입니다, 냉동고에 식품을 보관할 때는 랩이나 팩에 포장합니다, 냉동고 식품 랩이나 팩 포장, 해동한 후 즉시 요리하는 것이 좋습니다, 해동한 후 즉시 요리, 남은 음식은 포장하여 즉시 냉장 보관합니다, 남은 음식 즉시 냉장 보관",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "면역저하 과일·채소 세척 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 채소와 과일을 먹기 전에 깨끗이 씻고, 과일이나 채소는 썰기 전에 깨끗이 씻도록 안내합니다. 딸기처럼 꼼꼼히 씻기 어려운 과일은 별도 주의 항목으로 기록합니다.",
        examples:
          "채소와 과일은 먹기 전에 깨끗이 씻어 드시기 바랍니다, 채소와 과일 먹기 전 세척, 과일이나 채소는 썰기 전에 깨끗이 씻어야 합니다, 과일이나 채소 썰기 전 세척",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "면역저하 유효기간·저온살균 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 모든 식품은 사용하기 전에 반드시 유효기간을 확인하고, 쥬스·우유·요구르트 등은 저온살균 제품을 선택하도록 안내합니다.",
        examples:
          "모든 식품은 사용하기 전에 반드시 유효기간을 확인합니다, 사용하기 전에 유효기간 확인, 유효기간 확인, 저온살균 쥬스, 쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다, 쥬스 우유 요구르트 저온살균 제품",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "면역저하 완전 가열 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 고기·닭고기·생선을 완전히 익히고, 갈아둔 고기는 다른 재료와 섞기 전에 충분히 익히도록 안내합니다.",
        examples:
          "고기, 닭고기, 생선 등은 완전히 익히도록 합니다, 고기 닭고기 생선 완전히 익히기, 고기 닭고기 생선 등은 완전히 익히기, 만약 갈아둔 고기를 요리하거나 고명으로 얹고자 할 때에는 다른 재료들과 섞기 전에 충분히 익히도록 합니다, 갈아둔 고기 충분히 익히기, 다른 재료들과 섞기 전에 충분히 익히기",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "면역저하 조리 위생 후보",
        detail:
          "국가암정보센터 면역기능 저하 자료는 백혈구 감소 등 면역저하 맥락에서 음식 감염 예방을 위해 음식을 만지거나 요리하기 전 손톱 밑까지 깨끗이 씻고, 조리 기구·식기·수저를 소독하며, 식기·도마·칼은 가능한 분리 또는 소독해 사용하도록 안내합니다. 생고기·닭고기·생선 즙이 다른 식품에 떨어지지 않도록 조심하고, 외식보다는 직접 요리하는 편이 안전하다고 설명합니다.",
        examples:
          "음식을 만지거나 요리를 하려면 손을 깨끗이 씻도록 합니다, 손톱 밑부분까지 깨끗이 씻도록 합니다, 손톱 밑까지 깨끗이 씻기, 음식물에 머리카락이 들어가지 않도록 합니다, 음식물에 머리카락 들어가지 않게, 조리에 사용되는 기구, 식기, 수저는 반드시 소독합니다, 조리 기구 식기 수저 소독, 고기, 생선, 과일, 채소 등에 사용되는 식기, 도마, 칼 등은 가능한 분리해서 사용하거나 소독한 다음 사용합니다, 식기 도마 칼 분리 사용, 생고기, 닭고기, 생선 등에서 나오는 즙이 다른 식품이나 음식에 떨어지지 않도록 조심합니다, 생고기 닭고기 생선 즙이 다른 식품에 떨어지지 않게, 외식보다는 직접 요리하여 드시는 것이 안전합니다, 외식보다는 직접 요리",
        sourceIds: ["nccImmuneLowDiet"],
      },
      {
        label: "치료 중 건강식 실천 예시",
        detail:
          "국가암정보센터 치료 중 건강식을 먹는 요령 자료는 식사가 치료의 보조 요법만큼 중요하다고 설명합니다. 도입 설명: 식사는 암 치료의 보조 요법이라고 할 수 있을 만큼 중요합니다. 암환자에게 제일가는 식사 원칙은 '잘 먹는 것' 입니다. 이를 위해서는 환자의 식욕과 선호에만 의존할 수 없습니다. 건강을 위해 올바른 식사를 하도록 적극 도와주려는 보호자들의 의지가 필요합니다. 이 자료는 규칙적인 아침·점심·저녁 식사, 밥 반 그릇에서 한 그릇 또는 죽 하루 4~5번 이상, 끼니마다 충분한 단백질 반찬, 매끼 두 가지 이상 채소 반찬, 씹거나 삼키기 힘든 경우 다지거나 갈아서 먹기, 과일 하루 한두 번, 우유와 유제품 하루 1컵 이상과 요구르트·두유·치즈 대체, 식용유·참기름·버터 등 기름을 볶음이나 나물 요리 양념으로 쓰는 방법, 양념과 조미료를 적당히 쓰되 너무 맵거나 짜지 않게 요리하는 방법, 국·음료·후식을 적당히 먹는 방법을 안내합니다.",
        examples:
          "식사는 암 치료의 보조 요법이라고 할 수 있을 만큼 중요합니다. 암환자에게 제일가는 식사 원칙은 '잘 먹는 것' 입니다. 이를 위해서는 환자의 식욕과 선호에만 의존할 수 없습니다. 건강을 위해 올바른 식사를 하도록 적극 도와주려는 보호자들의 의지가 필요합니다., 규칙적으로 아침, 점심, 저녁 식사를 하며, 반찬을 골고루 먹습니다., 밥은 매끼 반 그릇에서 한 그릇 정도 먹고, 간식으로 빵 종류와 크래커, 떡 등을 조금씩 먹습니다. 죽을 먹어야 하는 경우에는 하루 4~5번 이상 자주 드는 것이 좋습니다., 끼니마다 고기나 생선, 달걀, 두부, 콩, 치즈 등 단백질 반찬을 충분히 곁들입니다., 채소 반찬은 매끼 두 가지 이상을 충분히 먹습니다., 씹거나 삼키기 힘든 경우에는 다지거나 갈아서 먹습니다., 한 가지 이상의 과일을 하루에 한두 번 정도 먹는 것이 좋습니다., 우유와 유제품은 하루 1컵(200ml) 이상 마십니다., 우유가 맞지 않을 경우엔 요구르트, 두유, 치즈 따위를 대신 먹습니다., 식용유, 참기름, 버터 등의 기름은 볶음이나 나물 요리에 양념으로 사용합니다., 양념과 조미료를 적당히 사용하되 너무 맵거나 짜지 않게 요리합니다., 국, 음료, 후식은 적당히 먹는 것이 좋습니다., 치료 중 규칙적인 아침 점심 저녁, 치료 중 밥 반 그릇에서 한 그릇, 치료 중 죽 하루 4~5번 이상, 치료 중 단백질 반찬 충분히, 치료 중 채소 반찬 매끼 두 가지 이상, 치료 중 과일 하루 한두 번, 치료 중 우유와 유제품 하루 1컵, 치료 중 요구르트 두유 치즈",
        sourceIds: ["nccTreatmentHealthyEatingTips"],
      },
      {
        label: "치료 후 균형식·전곡류",
        detail:
          "국가암정보센터 치료 후 건강한 식생활 자료는 암에 대한 모든 치료들이 끝난 후에는 건강한 식생활을 위한 식사지침을 따르도록 하며 적정 체중과 체지방량을 유지하도록 안내합니다. 우리 몸에 필요한 영양소는 다양한 식품과 음식을 통하여 섭취해야 한다고 설명하며, 균형잡힌 식사란 나에게 맞는 적당량으로, 매끼 적당량의 곡류와 고기, 생선, 계란, 두부 등의 다양한 단백질 식품을 1~2가지, 2~3가지의 채소류를 포함한 식사를 하고 우유 및 유제품류, 과일류를 하루 1~2회 간식으로 섭취하는 것이라고 안내합니다. 또한 다양한 색의 과일, 채소와 전곡류를 충분하게 먹고, 과일과 채소에 들어있는 비타민, 무기질, 식이섬유소, 항산화 영양소 등이 암 예방 및 건강 증진에 도움이 된다고 설명합니다. 다양한 종류와 색깔을 선택하여 채소는 매끼 2~3가지 이상, 과일은 매일 1~2회 섭취하며, 도정이나 가공이 덜 된 전곡류 식품을 선택하도록 안내합니다.",
        examples:
          "적정 체중과 체지방량을 유지합니다., 암에 대한 모든 치료들이 끝난 후에는 건강한 식생활을 위한 식사지침을 따르도록 합니다., 우리 몸에 필요한 영양소는 다양한 식품과 음식을 통하여 섭취해야 합니다., 균형잡힌 식사란 나에게 맞는 적당량으로, 매끼 적당량의 곡류와 고기, 생선, 계란, 두부 등의 다양한 단백질 식품을 1~2가지, 2~3가지의 채소류를 포함한 식사를 하고 우유 및 유제품류, 과일류를 하루 1~2회 간식으로 섭취합니다., 다양한 색의 과일, 채소와 전곡류를 충분하게 먹습니다., 과일과 채소에 들어있는 비타민, 무기질, 식이섬유소, 항산화 영양소 등이 암 예방 및 건강 증진에 도움이 됩니다., 다양한 종류와 색깔을 선택하고 채소는 매끼 2~3가지 이상, 과일은 매일 1~2회 섭취합니다., 도정이나 가공이 덜 된 전곡류(현미,보리 등의 잡곡류)의 식품을 선택합니다., 치료 후 건강한 식생활, 치료 후 다채로운 식단과 균형잡힌 식사, 치료 후 다양한 단백질 식품과 채소류, 치료 후 우유 및 유제품류 과일류, 치료 후 과일 채소 전곡류 충분히",
        sourceIds: ["nccAfterTreatmentHealthyEating"],
      },
      {
        label: "메스꺼움 시 위 부담 적은 음식",
        detail:
          "국가암정보센터 메스꺼움 자료는 증상이 있을 때 억지로 먹지 말고 먹기 좋은 다른 음식을 선택하도록 하며, 비교적 위에 부담이 적은 식품들을 섭취하도록 안내합니다. 예시로 샤베트, 복숭아통조림 같은 부드러운 과일, 맑은 유동식, 얼음조각 등을 안내합니다.",
        examples:
          "비교적 위에 부담이 적은 식품들을 섭취합니다., 토스트, 크래커, 요거트, 샤베트, 샤베트, 복숭아통조림이나 다른 부드러운 과일과 채소, 복숭아통조림, 맑은 유동식, 얼음조각 등, 맑은 유동식, 얼음조각",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "메스꺼움·구토 시 소량·천천히·자주 섭취",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 먼저 소량씩 천천히 그리고 자주 섭취하는 것이 좋다고 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 소량·천천히·빈번한 섭취 패턴 후보로 분리하고, 강제 섭취나 치료식 지시로 과장하지 않습니다.",
        examples: "먼저 소량씩 천천히 그리고 자주 섭취하는 것이 좋습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 환자 음식 선택",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 환자가 언제 무엇을 먹고 싶은지 선택하도록 하고, 음식을 강요하지 않도록 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 환자 음식 선택권과 강요하지 않기 후보로 분리하고, 치료식 지시로 과장하지 않습니다.",
        examples: "환자가 언제 무엇을 먹고 싶은지 선택하도록 하고, 음식을 강요하지 않도록 합니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 냄새 적은 식사 장소",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 식사를 하는 장소가 환자에게 맞지 않는 음식 냄새가 나지 않고 환기가 잘 되는 곳이어야 한다고 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 음식 냄새가 적고 환기되는 식사 장소 후보로 분리하고, 치료 효과나 특정 음식 처방으로 과장하지 않습니다.",
        examples: "식사를 하는 장소는 환자에게 맞지 않는 음식 냄새가 나지 않고 환기가 잘 되는 곳이어야 합니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 부드럽고 자극 적은 음식",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 일반적으로 메스꺼움과 구토에는 비스킷, 토스트, 요구르트, 튀기지 않은 껍질이 있는 닭, 부드럽고 자극적이지 않은 복숭아 통조림과 같은 과일과 야채, 얼음 조각 등이 좋다고 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 부드럽고 자극 적은 음식 후보로 분리하고, 단일 음식의 치료 효과로 과장하지 않습니다.",
        examples:
          "일반적으로 메스꺼움과 구토에는 비스킷, 토스트, 요구르트, 튀기지 않은 껍질이 있는 닭, 부드럽고 자극적이지 않은 복숭아 통조림과 같은 과일과 야채, 얼음 조각 등이 좋습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 자극 적고 소화 쉬운 음식",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 자극이 적고 부드럽고 소화가 잘 되는 음식을 먹도록 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 자극 적고 부드러우며 소화 쉬운 음식 후보로 분리하고, 구내염·입목통증용 부드러운 음식 규칙이나 치료식 주장으로 과장하지 않습니다.",
        examples: "자극이 적고 부드럽고 소화가 잘 되는 음식을 먹습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 아침 토스트·크래커",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 아침에 메스꺼움을 느낀다면 일어나기 전에 토스트나 크래커를 먹도록 안내합니다. 식단 기록에서는 아침 메스꺼움 상황의 일어나기 전 토스트·크래커 후보로 분리하고, 단일 음식의 치료 효과나 강제 섭취 지시로 과장하지 않습니다.",
        examples: "아침에 메스꺼움을 느낀다면, 일어나기 전에 토스트나 크래커를 먹도록 합니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 차가운 음식·음료",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 뜨거운 음식이 메스꺼움을 느끼게 할 수 있으므로 음료나 음식은 차게 섭취하고, 좋아하는 음료수를 얼려서 마시는 것도 좋은 방법이라고 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 차가운 음식·음료와 얼린 음료 후보로 분리하고, 단일 음식이나 음료의 치료 효과로 과장하지 않습니다.",
        examples:
          "뜨거운 음식은 메스꺼움을 느끼게 할 수 있으므로, 음료나 음식은 차게 섭취하도록 하고, 좋아하는 음료수를 얼려서 마시는 것도 좋은 방법입니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 물종류만 가능할 때 음료",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 물종류만 먹을 수 있을때는 꿀물, 설탕물, 이온음료를 먹도록 안내합니다. 식단 기록에서는 메스꺼움·구토 상황에서 물종류만 가능할 때의 음료 후보로 분리하고, 일반 당분 음료 권장이나 탈수 치료로 과장하지 않습니다.",
        examples: "물종류만 먹을 수 있을때는 꿀물, 설탕물, 이온음료를 먹습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 후 단계적 식품 추가",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 구토 뒤 적응이 되면 우유, 요구르트, 주스, 고단백 음료 등을 조금씩 추가하고 죽에서 밥으로 서서히 바꾸도록 안내합니다. 식단 기록에서는 구토 후 적응 단계의 점진적 식품 추가 후보로 분리하고, 체중증가 치료나 감염 예방용 저온살균 지시 또는 특정 식품 치료효과로 과장하지 않습니다.",
        examples:
          "적응이 되면 우유, 요구르트, 주스, 고단백 음료 등을 조금씩 추가하고, 죽에서 밥으로 서서히 바꾸어 갑니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움 시 배고프기 전 식사",
        detail:
          "국가암정보센터 메스꺼움 자료는 배가 고프면 메스꺼움이 더 심해질 수 있으므로 배고프기 전에 먹도록 안내합니다.",
        examples: "배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다.",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "메스꺼움 시 식사 환경·식후 휴식",
        detail:
          "국가암정보센터 메스꺼움 자료는 음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사하고, 식사 시 조금씩 자주 천천히 하며, 식후 1시간 정도 휴식을 취하는 것이 좋다고 안내합니다. 또한 이상한 냄새가 나거나 너무 후덥지근한 방을 피하고 음식냄새가 나지 않도록 자주 환기시키도록 안내합니다.",
        examples:
          "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다., 이상한 냄새가 나거나 너무 후덥지근한 방은 피하도록 하며, 음식냄새가 나지 않도록 자주 환기시킵니다.",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "메스꺼움·구토 시 식후 자세·휴식",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 식사직후에 움직이는 것이 소화를 느리게 하므로 식후에는 잠시 쉬도록 하며, 식사 후 한 시간 정도 똑바로 앉아서 휴식을 취하는 것이 가장 좋다고 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 식후 움직임 줄이기와 바른 자세 휴식 후보로 분리하고 치료 지시로 과장하지 않습니다.",
        examples:
          "식사직후에 움직이는 것은 소화를 느리게 하므로 식후에는 잠시 쉬도록 하며, 식사 후 한 시간 정도 똑바로 앉아서 휴식을 취하는 것이 가장 좋습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움 시 물 천천히·느슨한 옷",
        detail:
          "국가암정보센터 메스꺼움 자료는 물이 포만감을 줄 수 있으므로 천천히 조금씩 마시고, 식사 시에도 조금만 마시며, 옷은 몸이 조이지 않도록 느슨하게 입도록 안내합니다.",
        examples:
          "물은 포만감을 줄 수 있기 때문에 천천히 조금씩 마시고, 식사 시에도 조금만 마시도록 합니다. 옷은 몸이 조이지 않도록 느슨하게 입습니다.",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "구토 조절 후 단계적 유동식",
        detail:
          "국가암정보센터 구토 자료는 구토 증상이 있을 때는 먹거나 마시지 않고, 구토증상이 조절되면 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키며, 맑은 유동식으로 구토증상이 조절되면 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹고 적응되면 일반 식사로 넘어가도록 안내합니다. 우유 소화가 힘들면 우유가 들어있지 않은 제품을 이용하도록 안내합니다.",
        examples:
          "구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다., 맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다. 우유를 소화시키기 힘들면 우유가 들어있지 않은 제품을 이용하도록 합니다., 구토 조절 후 물, 구토 조절 후 육수, 구토 맑은 유동식, 구토 후 미음, 구토 후 부드러운 식사, 우유가 들어있지 않은 제품",
        sourceIds: ["nccVomitingDiet"],
      },
      {
        label: "입맛 변화 시 단백질 대체·향미 조절",
        detail:
          "국가암정보센터 입맛의 변화 자료는 보기가 좋고 냄새도 좋은 식품을 선택하고 준비하며, 고기가 싫다면 생선, 계란, 두부, 콩, 우유나 유제품을 이용하고, 고기나 생선요리에 와인·레몬즙 같은 향이 좋은 양념류나 새콤달콤한 소스를 사용하며, 금속성 맛에는 오렌지나 레몬 같은 시큼한 식품이 도움이 될 수 있으나 입과 목 통증이 있으면 주의하도록 안내합니다.",
        examples:
          "보기가 좋고 냄새도 좋은 식품을 선택하고 준비합니다. 만약 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품을 이용합니다. 고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다. 신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있으므로 오렌지나 레몬같이 시큼한 식품을 사용합니다. 그러나 입과 목에 통증 이 있다면, 이런 식품들이 염증을 자극하거나 불편하게 하므로 주의합니다. 입맛 변화 생선, 입맛 변화 계란, 입맛 변화 두부, 입맛 변화 콩, 입맛 변화 우유나 유제품, 고기 싫을 때 생선, 레몬즙 양념, 새콤달콤한 소스, 입맛 변화 오렌지, 입맛 변화 레몬",
        sourceIds: ["nccTasteChangeDiet", "nccMouthPainDiet"],
      },
      {
        label: "설사 시 수분·전해질·부드러운 음식",
        detail:
          "국가암정보센터 설사 자료는 수분을 충분히 보충하고, 염분과 칼륨 손실 보충 식품으로 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등을 예시로 들며, 소화되기 쉽고 부드러운 죽류·미음을 조금씩 자주 먹도록 안내합니다. 갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹어 장을 쉬게 하고 손실된 수분을 보충하도록 안내합니다.",
        examples:
          "수분을 충분히 섭취하여 설사로 손실된 부분을 보충합니다.; 장이 약해져 있으므로 식사는 조금씩 자주 먹습니다.; 염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분과 칼륨이 들어있는 식품으로는 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등입니다.; 소화되기 쉽고 부드러운 음식을 먹습니다.; 갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다., 설사 육수, 설사 스포츠 음료, 설사 바나나, 설사 으깬 감자, 설사 복숭아, 설사 토마토, 설사 흰죽, 설사 쌀미음",
        sourceIds: ["nccDiarrheaDiet"],
      },
      {
        label: "변비 시 수분·섬유소",
        detail:
          "국가암정보센터 변비 자료는 하루 8~10컵 이상 수분을 충분히 섭취하고, 음식 섭취량이 너무 적지 않도록 하며, 특히 아침 기상 직후 찬물을 마시는 것이 장운동에 도움이 될 수 있고, 도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취하며, 자신에게 맞는 가벼운 산책이나 걷기 등 규칙적인 운동과 누워 있는 경우 부드러운 복부 마사지가 도움이 될 수 있다고 안내합니다. 항암 부작용 증상 관리 지침도 변비 가정관리에서 섬유질이 많은 음식(야채, 채소, 현미, 견과류 등)을 먹도록 안내합니다.",
        examples:
          "수분을 충분히 섭취합니다.(하루에 8~10컵 이상) 이는 변을 부드럽게 합니다., 음식 섭취량이 너무 적지 않도록 합니다., 특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다., 도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취합니다., 섬유질이 많은 음식(야채, 채소, 현미, 견과류 등)을 먹습니다., 가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다., 누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다., 변비 물 8~10컵, 변비 하루 8~10컵 물, 변비 아침 찬물, 변비 도정 덜 된 곡류, 변비 생과일, 변비 생야채, 변비 섬유소 많은 식품",
        sourceIds: ["nccConstipationDiet", "nccChemoSideEffectGuide"],
      },
      {
        label: "체중감소 시 열량·단백질 보충",
        detail:
          "국가암정보센터 체중변화 자료는 치료과정에서 체중감소가 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨릴 수 있어, 체중감소 예방을 위해 열량과 단백질을 충분히 섭취하도록 안내합니다. 밥·죽을 다양하게 조리하고 김밥·초밥·주먹밥·볶음밥 예시와 야채죽·전복죽·계란죽·닭죽·깨죽·호박죽·단팥죽·잣죽 예시, 감자·고구마·떡·만두·빵·과일·과일주스·과일통조림 같은 간식, 빵·떡에 설탕·꿀·쨈·버터·땅콩버터를 바르거나 감자에 버터를 발라 굽고 나물요리에 식용유·참기름·들기름을 넉넉히 사용하거나 야채샐러드에 마요네즈·샐러드드레싱을 충분히 사용하고 우유·두유 등 음료에 설탕·꿀·초콜릿·미숫가루·분유를 타거나 과일 통조림과 우유·아이스크림을 섞어 쉐이크를 만드는 조리 예시와 사탕·젤리·크래커·빵류·과일·주스 같은 탄수화물이 많이 포함된 간식, 고기를 과일 주스에 담그거나 과일 통조림과 함께 조리하고 마늘·양파·고추장·카레·케찹 등으로 고기의 쓴맛을 줄이는 단백질 보충 조리 예시, 계란후라이·계란찜·수란·오믈렛·메추리알조림 같은 계란 단백질 예시와 콩밥·두유·연두부찜·두부조림·된장찌개·콩자반 같은 콩·두부 단백질 예시, 생선포·생선전·생선조림·어묵·마른 오징어 같은 생선 단백질 예시, 우유·요구르트·요플레·아이스크림·밀크쉐이크·치즈 같은 유제품 단백질 예시, 탈지분유나 분유를 우유에 타서 마시거나 미숫가루를 만들 때 물 대신 우유 또는 두유를 이용하는 단백질 보충 음료 예시, 야채샐러드에 삶은 계란을 다져 넣거나 부침 등에 물 대신 계란을 많이 사용하고 크래커나 빵을 요플레와 함께 먹는 단백질 보충 조리 예시, 단백질이 많이 포함된 간식 선택과 만두·피자·샌드위치·계란샐러드·카스테라 예시를 제시합니다.",
        examples:
          "암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있습니다. 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨립니다. 그러므로 체중감소를 예방하기 위해서 열량과 단백질 등을 충분히 섭취해야 합니다.; 밥 : 김밥, 초밥, 주먹밥, 볶음밥 등; 죽 : 야채죽, 전복죽, 계란죽, 닭죽, 깨죽, 호박죽, 단팥죽, 잣죽 등; 감자, 고구마, 떡, 만두, 빵, 과일, 과일주스, 과일통조림 등; 빵이나 떡 : 설탕, 꿀, 쨈, 버터, 땅콩버터 등을 발라 먹는다.; 감자 : 버터를 발라 구워 먹는다.; 나물요리 : 볶거나 무침을 할 때 식용유, 참기름, 들기름 등을 넉넉히 사용한다.; 야채샐러드 : 마요네즈, 샐러드드레싱을 충분히 사용한다.; 우유, 두유 등 음료 : 설탕, 꿀, 초콜릿, 미숫가루, 분유 등을 타서 먹는다.; 과일 : 과일 대신 과일 통조림을 먹거나 우유, 아이스크림과 혼합하여 쉐이크를 만들어서 먹는다.; 지방보다는 탄수화물이 많이 포함된 간식을 드시면 포만감이 빨리 사라지므로 더 편안함을 느낄 수 있다.; 사탕, 젤리, 크래커, 빵류, 과일, 주스 등; 고기를 과일 주스에 담그거나 과일 통조림과 함께 조리한다.; 마늘, 양파, 고추장, 카레, 케찹 등을 사용하여 고기의 쓴맛을 제거한다.; 계란 : 계란후라이, 계란찜, 수란, 오믈렛, 메추리알조림 등; 콩, 두부 : 콩밥, 두유, 연두부찜, 두부조림, 된장찌개, 콩자반 등; 생선 : 생선포, 생선전, 생선조림, 어묵, 마른 오징어 등; 유제품 : 우유, 요구르트, 요플레, 아이스크림, 밀크쉐이크, 치즈 등; 탈지분유나 분유를 우유에 타서 마신다.; 미숫가루를 만들 때 물 대신 우유 또는 두유를 이용한다.; 야채샐러드에 삶은 계란을 다져 넣는다.; 부침 등에 물 대신 계란을 많이 사용한다.; 크래커나 빵을 요플레와 함께 먹는다.; 간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.; 만두, 피자, 샌드위치, 계란샐러드, 카스테라 등; 체중감소 김밥, 체중감소 주먹밥, 체중감소 야채죽, 체중감소 전복죽, 체중감소 계란죽, 체중감소 잣죽, 체중감소 감자, 체중감소 고구마, 체중감소 떡, 체중감소 만두, 체중감소 과일주스, 체중감소 과일통조림, 체중감소 땅콩버터, 체중감소 계란찜, 체중감소 두유, 체중감소 두부조림, 체중감소 생선전, 체중감소 어묵, 체중감소 요구르트",
        sourceIds: ["nccWeightChangeDiet"],
      },
      {
        label: "체중증가 시 균형 식품 선택",
        detail:
          "국가암정보센터 체중변화 자료는 체중증가 원인을 의료진과 확인한 뒤 체중조절 방법으로 과일·야채·곡류 섭취를 늘리고, 가능한 한 지방이 없는 부위의 육류제품과 저지방 우유 및 유제품을 이용하며, 끓이고 찌는 형태의 요리방법을 이용하도록 안내합니다.",
        examples:
          "과일과 야채 그리고 곡류의 섭취를 증가시킵니다. 가능한 한 지방이 없는 부위의 육류제품과 저지방 우유 및 유제품을 이용합니다.; 끓이고 찌는 형태의 요리방법을 이용합니다.",
        sourceIds: ["nccWeightChangeDiet"],
      },
      {
        label: "피로감·우울 시 먹기 쉬운 시점·간식",
        detail:
          "국가암정보센터 피로감과 우울 자료는 치료 중 피로가 불충분한 열량·영양소 섭취와 관련될 수 있어 영양이 풍부한 음식을 충분히 먹고, 하루 중 몸 상태가 가장 좋은 때나 휴식 후에 먹으며, 적은 양의 식사와 간식을 자주 먹고, 가족·친구 도움이나 음식배달서비스를 이용하며, 치료를 받지 않을 때 좋아하는 음식을 먹도록 안내합니다.",
        examples:
          "영양이 풍부한 음식을 충분히 섭취합니다. 불충분한 열량과 영양소 섭취가 피로의 원인이 될 수 있기 때문입니다., 하루 중 가장 좋은 시간에 가능한 많이 먹습니다., 낮잠이나 휴식 후에 먹는 것이 더 편안함을 느낄 수 있습니다., 적은 양의 식사와 간식을 자주 먹습니다., 가족이나 친구의 도움을 받도록 합니다., 주변의 이용 가능한 음식배달서비스를 알아두고 이용합니다., 치료를 받지 않을 때에는 좋아하는 음식을 먹도록 합니다., 피로감 영양이 풍부한 음식, 피로감 하루 중 가장 좋은 시간에 많이 먹기, 피로감 휴식 후 먹기, 피로감 적은 양의 식사와 간식, 피로감 음식배달서비스, 우울 좋아하는 음식",
        sourceIds: ["nccFatigueDepressionDiet"],
      },
      {
        label: "식욕부진 시 먹을 수 있을 때 식사",
        detail:
          "국가암정보센터 식욕부진 자료는 식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 안내합니다.",
        examples:
          "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 좋아하는 음식·메뉴 다양화",
        detail:
          "국가암정보센터 식욕부진 자료는 평소에 좋아하던 음식을 먹거나, 음식 형태에 변화를 주어 메뉴를 다양하게 해서 먹도록 안내합니다.",
        examples:
          "평소에 좋아하던 음식을 먹거나, 음식 형태에 변화를 주어 메뉴를 다양하게 해서 먹습니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 몸 상태 좋은 때 식사",
        detail:
          "국가암정보센터 식욕부진 자료는 몸의 상태가 가장 좋을 때 많이 먹도록 하며, 일반적으로 충분한 휴식을 취한 아침이 가장 좋다고 안내합니다.",
        examples:
          "몸의 상태가 가장 좋을 때 많이 먹도록 합니다. 일반적으로 충분한 휴식을 취한 아침이 가장 좋다고 합니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 식사 환경 바꾸기",
        detail:
          "국가암정보센터 식욕부진 자료는 식사하는 시간, 장소, 분위기를 바꾸어 보고 음악, 식탁보, 식기 변화도 시도할 수 있다고 안내합니다.",
        examples:
          "식사하는 시간, 장소, 분위기를 바꾸어 봅니다. 음악을 들으며 식사를 하거나 식탁보나 식기를 바꾸어 보는 것도 좋습니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 가벼운 산책",
        detail:
          "국가암정보센터 식욕부진 자료는 가벼운 산책 등 규칙적인 운동도 입맛을 증진시키는 데 도움을 줄 수 있다고 안내합니다.",
        examples: "가벼운 산책 등 규칙적인 운동도 입맛을 증진시키는데 도움을 줄 수 있습니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 식사 전후 입안 청결",
        detail:
          "국가암정보센터 식욕부진 자료는 입맛을 돋우기 위해 식사 전후에 입안을 청결하게 하도록 안내합니다.",
        examples: "입맛을 돋우기 위해서 식사전후에 입안을 청결하게 합니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 보호자 식사 지원",
        detail:
          "국가암정보센터 식욕부진 자료는 주위 사람들이 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고, 환자 스스로 먹을 수 있게 돕도록 안내합니다.",
        examples:
          "주위 분들도 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고 환자 스스로 먹을 수 있게끔 도와줍니다.",
        sourceIds: ["nccAppetiteLossDiet"],
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
        label: "식욕부진 시 조금씩 자주 먹는 간식",
        detail:
          "국가암정보센터 식욕부진 자료는 조금씩 자주 먹고 간식을 가까이 두어 먹고 싶을 때 쉽게 먹을 수 있게 하며, 과자·빵·과일·우유 및 유제품·두유·치즈 등을 예시로 제시합니다.",
        examples:
          "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. (예) 과자, 빵, 과일, 우유 및 유제품, 두유, 치즈 등",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 간식·유동식 활용",
        detail:
          "국가암정보센터 식욕부진 자료는 간식으로 죽, 미음, 쥬스, 스프, 우유 및 유제품 등을 활용하도록 안내합니다.",
        examples: "간식으로 죽, 미음, 쥬스, 스프, 우유 및 유제품 등을 활용하도록 합니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "식욕부진 시 특수영양 보충음료",
        detail:
          "국가암정보센터 식욕부진 자료는 식사섭취가 계속적으로 힘들 경우에는 특수영양 보충음료를 이용할 수 있다고 안내하며, 그린비아·뉴케어·메디푸드·엔슈어 등을 예시로 제시합니다.",
        examples:
          "식사섭취가 계속적으로 힘들 경우에는 특수영양 보충음료를 이용합니다. (예) 그린비아, 뉴케어, 메디푸드, 엔슈어 등",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "입·목 통증 시 부드러운 음식",
        detail:
          "국가암정보센터 입과 목의 통증 자료는 부드럽고 촉촉한 음식을 준비하고, 씹고 삼키기 쉬운 음식으로 죽류·미음·부드럽게 조리한 고기·생선·데친 채소·시지 않은 과일을 예시로 들며, 요리는 부드럽고 연해질 때까지 하고 음식을 작은 크기로 자르거나 경우에 따라 믹서로 곱게 갈도록 안내합니다. 입안이 쓰린 경우 빨대를 이용하고, 아이들 스푼과 같이 작은 스푼을 이용하도록 하며, 음식을 먹은 후 입안을 깨끗이 헹구어 청결하게 유지하도록 안내합니다. 얼음조각도 도움이 될 수 있지만, 옥살로플라틴 등 온도변화에 민감해질 수 있는 항암제를 투여 받는 경우에는 차가운 음식을 피하도록 안내합니다. 또한 따뜻한 육수(고기국물)에 소금을 약간 첨가하여 마시는 방법을 안내합니다.",
        examples:
          "부드럽고 촉촉한 음식을 준비합니다. 씹고 삼키기 쉬운 음식을 먹습니다. 죽류 : 흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽 등. 미음 : 쌀미음, 조미음, 잣미음, 깨미음, 녹두미음 등. 고기나 생선 : 고기는 부드럽게 조리하고, 생선은 곱게 다지거나 갈아서. 채소 : 부드러운 야채를 푹 익히거나 데쳐서. 과일 : 바나나, 배, 수박, 과일통조림 등과 같이 시지 않은 과일. 요리를 할 때는 부드럽고 연해질 때까지 하도록 하며, 음식을 작은 크기로 자릅니다. 경우에 따라서는 믹서로 곱게 갈도록 합니다. 입안이 쓰린 경우 빨대를 이용합니다. 아이들 스푼과 같이 작은 스푼을 이용합니다. 음식을 먹은 후 입안은 깨끗이 헹구어 청결하게 유지합니다. 얼음조각을 먹는 것도 도움이 됩니다. 따뜻한 육수(고기국물)에 소금을 약간 첨가하여 마십니다. 이는 목의 염증을 가라앉게 해 주는데 도움이 됩니다. 흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽, 쌀미음, 조미음, 잣미음, 깨미음, 녹두미음, 부드러운 야채, 데친 채소, 바나나, 배, 수박, 과일통조림",
        sourceIds: ["nccMouthPainDiet"],
      },
      {
        label: "입안 건조증 시 촉촉한 음식",
        detail:
          "국가암정보센터 입안의 건조증 자료는 가까운 장소에 물을 두어 조금씩 자주 마시고, 음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹으며, 부드럽고 곱게 간 식품을 먹고, 삼키기 쉽게 하기 위해 음식에 소스나 드레싱을 첨가하여 촉촉하게 하고, 식사 중간에 자주 물이나 음료를 한 모금씩 마시며 빨대를 이용하면 삼키는 것에 도움이 될 수 있고, 딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있다고 안내합니다.",
        examples:
          "가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다. 음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹도록 합니다. 부드럽고 곱게 간 식품을 먹도록 합니다. 삼키기 쉽게 하기 위해 음식에 소스나 드레싱을 첨가하여 촉촉하게 합니다. 식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다. 딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있습니다. 물 조금씩 자주, 물 한 모금, 소스나 드레싱, 딱딱한 사탕, 껌, 껌 씹기",
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
          "질병관리청 위험음주 자료는 최근에는 하루 한두 잔의 소량 음주도 암 발생 위험을 높인다는 연구 결과에 따라 절주보다 금주가 권장되고, 표준잔 기준으로 소주·맥주·막걸리·와인·양주 같은 음주량을 계산한다고 설명합니다. 국립암센터 자궁경부암 조기 진단과 예방법 PDF도 생활수칙 음주 항목에서 하루 한두 잔의 소량 음주도 피하라고 안내합니다. 치료 중에는 약물·간기능·수면과도 함께 확인해야 합니다.",
        examples:
          "술, 소주, 맥주, 막걸리, 와인, 양주, 고도주, 하루 한두 잔의 소량 음주도 피하기",
        sourceIds: ["kdcaAlcohol", "nccCervicalEarlyDiagnosisPrevention"],
      },
      {
        label: "체중 유지 음주 제한",
        detail:
          "국가암정보센터 적정 체중과 체지방 유지 자료는 과체중 또는 비만인 경우 적정 체중과 체지방을 유지하기 위한 노력의 일부로 술은 마시지 않도록 안내합니다.",
        examples: "술은 마시지 않는다.",
        sourceIds: ["nccWeightMaintenanceDiet"],
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
        label: "치료 후 가공육·탄 음식·짠 음식·술",
        detail:
          "국가암정보센터 치료 후 건강한 식생활 자료는 가공육 섭취를 제한하고 햄, 베이컨, 소시지 등의 가공육은 되도록 피하도록 안내합니다. 또한 육류는 적정량으로 살코기 위주로 섭취하며, 조리 시 직화구이를 피하고 탄 음식을 먹지 않도록 안내합니다. 짠 음식의 섭취를 피하고 싱겁게 먹으며, 음식을 만들 때는 소금, 간장 등 짠맛이 나는 양념의 사용을 줄이고 싱겁게 조리하도록 안내합니다. 국이나 찌개는 건더기 위주로 섭취하고 김치, 젓갈, 장아찌, 피클 등 염장 식품의 섭취를 줄이도록 안내합니다. 하루 한 두 잔의 술도 피하고, 암 예방을 위해서도 하루 한 두 잔의 술은 피하는 것이 좋다고 안내합니다.",
        examples:
          "햄, 베이컨, 소시지 등의 가공육은 되도록 피합니다., 육류는 적정량 (탁구공 1~2개 크기)으로 살코기 위주로 섭취하며, 조리 시 직화구이를 피하고 탄 음식을 먹지 않습니다., 짠 음식의 섭취를 피하고, 싱겁게 먹습니다., 음식을 만들 때는 소금, 간장 등 짠맛이 나는 양념의 사용을 줄이고, 싱겁게 조리합니다., 국이나 찌개 섭취 시에는 건더기 위주로 섭취하며, 김치, 젓갈, 장아찌, 피클 등 염장 식품의 섭취를 줄입니다., 하루 한 두 잔의 술도 피합니다., 암 예방을 위해서 하루 한 두 잔의 술도 피하는 것이 좋습니다., 치료 후 가공육 제한, 치료 후 탄 음식 피하기, 치료 후 짠 음식 피하기, 치료 후 하루 한 두 잔 술도 피하기",
        sourceIds: ["nccAfterTreatmentHealthyEating"],
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
        label: "체중 유지 식사조절",
        detail:
          "국가암정보센터 적정 체중과 체지방 유지 자료는 과체중 또는 비만인 경우 적정 체중과 체지방을 유지하기 위한 노력의 일부로 기름진 음식과 단 음식은 피하고 가능한 싱겁게 먹도록 안내합니다.",
        examples: "기름진 음식과 단 음식은 피하고, 가능한 싱겁게 먹는다.",
        sourceIds: ["nccWeightMaintenanceDiet"],
      },
      {
        label: "실천지침 대체 식단 예시",
        detail:
          "국민 암예방 수칙 자궁경부암 실천지침의 예시 식단은 식이섬유를 늘리는 잡곡밥 대체 예시와 함께 가공육·달콤한 간식·짠 반찬·국물 과다와 나트륨이 많은 조림을 줄이고 과일·채소·저염 조리 예시로 바꾸는 방향을 보여주며, 총각김치·열무김치·배추김치 같은 김치 반찬은 저염 여부와 양을 확인하는 후보로 기록합니다. 햄구이를 과일샐러드로 바꾸는 이유는 육가공식품(훈제식품) 섭취량 감소와 과일 섭취량 증가이고, 초코칩쿠키를 귤로 바꾸는 이유는 과일 섭취량 증가이며, 단무지를 채소샐러드·브로콜리회로 바꾸는 이유는 채소 섭취량 증가입니다. 기본원칙으로 다채로운 식단·채소와 과일 충분 섭취·짠 음식 및 탄 음식 섭취 제한을 함께 제시하고, 국 또는 찌개의 국물은 다 먹지 않도록 안내합니다. 식생활 습관 개선은 한꺼번에 바꾸지 않고 가능한 것부터 확인해 서서히 단계적으로 계획하며, 지방 함량이 높은 식품이나 짠 음식 섭취를 줄이고 신선한 채소·과일·곡류를 자주 먹으며, 가능한 제철 과일·채소를 구입하고 곰팡이 핀 음식은 피하라고 안내합니다.",
        examples:
          "쌀밥, 흰쌀밥, 총각김치, 열무김치, 배추김치, 햄구이, 초코칩쿠키, 단무지, 우엉조림, 햄구이 → 과일샐러드 : 육가공식품(훈제식품) 섭취량 감소, 과일 섭취량 증가, 초코칩쿠키 → 귤 : 과일 섭취량 증가, 단무지 → 채소샐러드, 브로콜리회 : 채소 섭취량 증가(채소샐러드는 요플레드레싱 사용), 국·찌개 국물, 국물 과다, 국 또는 찌개의 국물은 다 드시지 마십시오., 기본원칙 : 다채로운 식단으로 균형 잡힌 식사 / 채소, 과일을 충분히 섭취 / 짠 음식 및 탄 음식 섭취 제한, 한꺼번에 식생활 습관을 바꾸는 것은 위험합니다. 다음의 내용을 숙지하면서 식생활 개선을 시작하세요., 식생활을 한꺼번에 바꾸려고 하지 말고 내가 할 수 있는 것들을 확인하여 서서히 단계적으로 변화시킬 수 있는 계획표를 작성해 보십시오., 가능한 지방 함량이 높은 식품이나 짠 음식 섭취를 줄이겠다는 생각을 가지며, 신선한 채소와 과일, 곡류 등을 자주 드시기 바랍니다., 가능한 제철 과일, 채소를 구입하십시오. 곰팡이 핀 음식은 피하시기 바랍니다.",
        sourceIds: ["nccCervicalPracticeDiet"],
      },
      {
        label: "채소·과일 섭취 부족 확인",
        detail:
          "국가암정보센터 자궁경부암 위험요인 자료는 과일과 채소의 섭취가 적은 식이를 위험요인 중 하나로 설명합니다. 식단 기록에서는 부족 상태를 확인하고, 치료 효과로 과장하지 않으며 충분한 채소·과일 섭취와 진료팀 상담 질문으로 연결합니다.",
        examples:
          "과일과 채소의 섭취가 적은 식이, 과일 채소 섭취 부족, 채소와 과일을 거의 안 먹음",
        sourceIds: ["nccCervicalRiskFactors"],
      },
      {
        label: "자궁경부암 예방 음식 효과 불명확성",
        detail:
          "국가암정보센터 자궁경부암 예방과 음식 자료는 카로테노이드와 비타민 A·C·E 등이 예방 가능성이 있는 음식으로 거론되지만 아직 효과가 명확하지 않다고 설명합니다. 카로테노이드는 1980년대 일부 연구결과와 다량 섭취가 위험도를 줄일 가능성이 있다는 결론이 소개되지만 연구 결과들이 항상 일치하는 것은 아니었다고 설명하고, 비타민 C도 일부 연구 결과와 위험도 감소 가능성 결론이 함께 소개되지만 이후 연구에서 예방 효과가 항상 명확히 보도된 것은 아니었다고 설명합니다. 비타민 E도 위험도가 낮은 경향과 예방 효과 가능성이 소개되지만 아직 확실히 결론을 내린 것은 아니었다고 설명합니다. 별도 국민 암예방 수칙 자궁경부암 실천지침은 비타민 C·E, 엽산, 비타민 B12, 카로티노이드가 든 채소·과일 섭취 예방 문구를 제시하므로, 식단 기록에서는 공식 출처를 보존하되 특정 영양소나 식품을 예방·치료 효과로 단정하지 않도록 확인합니다.",
        examples:
          "자궁경부암의 예방 가능성이 있는 음식으로 카로테노이드(carotenoid), 비타민 A, 비타민 C, 비타민 E 등이 거론되나 아직 그 효과에 대해서는 명확하지 않은 상태입니다., 1980년대에 이루어진 일부 연구결과에 의하면 카로테노이드를 많이 섭취하면 침윤성 자궁경부암의 빈도가 1/2에서 1/5까지도 줄어들고 베타카로틴의 혈중 농도가 낮을수록 자궁경부암 및 자궁경부 상피내암 등의 빈도가 높아진다는 보고도 있었습니다., 그러나 이러한 연구 결과들이 항상 일치하는 것이 아니어서 현재 미국암연구협회(American Institute for Cancer Research)에서는 “카로테노이드의 다량의 섭취가 자궁경부암의 위험도를 줄일 가능성이 있다”라고 결론을 내렸습니다., 비타민 C의 섭취가 많은 집단의 자궁경부암 발생 빈도가 20~50 %까지 감소한다는 연구 결과가 나온 바 있습니다. 그러나 이후 연구에서 항상 예방 효과가 명확히 보도된 것은 아니었기 때문에 현재 미국암연구협회(American Institute for Cancer Research)에서는 “비타민 C의 다량의 섭취가 자궁경부암의 위험도를 줄일 가능성이 있다”라고 결론을 내렸습니다., 일부 연구에서 비타민 E의 섭취가 많거나 혈중 농도가 높을수록 자궁경부암의 위험도가 낮은 경향을 보이기는 했지만 아직 확실히 결론을 내린 것은 아닙니다. 그러나 혈중 비타민 E의 농도가 자궁경부이형성증(정상조직과 암조직의 중간과정)의 정도가 심할수록 낮았다는 보고가 있으므로 자궁경부암의 예방 효과가 있을 가능성은 존재합니다., 채소와 과일을 충분히 섭취합니다. 영양성분 중 비타민 C, 비타민 E, 엽산, 비타민 B12, 카로티노이드 섭취는 자궁경부암을 예방한다고 알려져 있습니다. 이들 영양성분을 충분히 함유하고 있는 채소와 과일을 섭취하면 자궁경부암을 예방할 수 있습니다.",
        sourceIds: ["nccCervicalFoodPrevention", "nccCervicalPracticeDiet"],
      },
      {
        label: "레티놀·엽산 예방 관련성 없음",
        detail:
          "국가암정보센터 자궁경부암 예방과 음식 자료는 레티놀과 엽산도 자궁경부암 예방 관련 연구가 있었으나 자궁경부암과의 관련성이나 위험도를 줄일 가능성은 없는 것으로 나타났다고 설명합니다.",
        examples:
          "그 밖에 레티놀(retinol)과 엽산(folate)도 자궁경부암의 예방과 관련한 연구를 진행했으나 자궁경부암과의 관련성이나 자궁경부암의 위험도를 줄일 가능성은 없는 것으로 나타났습니다.",
        sourceIds: ["nccCervicalFoodPrevention"],
      },
      {
        label: "자극적·너무 뜨겁거나 매운 음식",
        detail:
          "자궁경부암 식생활 자료는 방사선치료나 항암화학요법 중 장 기능이 약해질 수 있어 자극적인 음식은 피하도록 설명하고, 국가암정보센터 건강한 식생활 자료도 너무 뜨겁거나 매운 음식의 섭취는 피하도록 안내합니다.",
        examples:
          "방사선 치료나 항암화학요법 중에는 장기능이 약해질 가능성이 있으므로 되도록 자극적인 음식은 피합니다., 너무 뜨겁거나 매운 음식의 섭취는 피합니다, 너무 뜨겁거나 매운 음식 섭취 피하기, 너무 뜨겁거나 매운 음식, 매운 음식, 아주 뜨거운 음식, 장 불편을 악화시키는 음식",
        sourceIds: ["nccCervicalDiet", "nccPreventionDiet"],
      },
      {
        label: "금연 보조 식이요법",
        detail:
          "국민 암예방 수칙 자궁경부암 실천지침은 금연을 돕는 식이요법으로 채식 위주의 균형식과 카페인·알코올 음료 줄이기, 맵고 짠 자극적인 음식이나 지방이 많은 느끼한 음식과 육식 피하기, 과식 피하기, 금연을 위한 간식 준비를 안내합니다. 식품 자체를 자궁경부암 치료식으로 보지 않고 금연 실천 보조 기록 후보로 다룹니다.",
        examples:
          "채식위주의 균형 잡힌 식사를 하고, 흡연욕구를 일으키는 카페인이나 알코올의 섭취를 줄일 수 있도록 평소 마시던 음료를 커피나 청량음료에서 따뜻한 차 등으로 바꾸기, 맵고 짠 자극적인 음식이나 지방이 많은 느끼한 음식, 육식은 가급적 피하기, 과식은 피하고 평소 섭취하는 열량의 80% 정도만 섭취하고, 금연을 위한 간식으로 당근, 오이, 다시마, 무가당 껌, 은단 등을 준비하기",
        sourceIds: ["nccCervicalPracticeDiet"],
      },
      {
        label: "입안 자극 음식",
        detail:
          "국가암정보센터 입과 목의 통증 자료는 입안을 자극하는 음식이나 음료를 피하도록 하며, 오렌지·포도·레몬·토마토주스, 향신료를 많이 사용하거나 소금에 절인 음식, 토스트·크래커·말린 음식은 통증 상황에서 피하도록 안내합니다. 뜨거운 음식은 입과 목을 자극할 수 있어 차거나 상온의 음식을 이용하도록 안내합니다.",
        examples:
          "입안을 자극하는 음식이나 음료는 피하도록 합니다. 오렌지, 포도, 레몬, 토마토주스. 향신료를 많이 사용하거나 소금에 절인 음식. 토스트, 크래커 또는 말린 음식 등. 뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다. 토마토주스, 토스트, 크래커, 말린 음식, 오렌지, 포도, 레몬, 향신료를 많이 사용한 음식, 소금에 절인 음식",
        sourceIds: ["nccMouthPainDiet"],
      },
      {
        label: "구내염 시 자극 음식",
        detail:
          "국가암정보센터 입안의 염증(구내염) 자료는 자극성 있는 양념이나 딱딱하고 거친 음식 제한, 부드러운 음식 섭취, 맵거나 거친 자극적인 음식 회피를 안내합니다. 입안에 상처나 궤양, 민감한 부위가 있으면 거칠거나 날 음식, 짠 음식, 산성 및 양념이 강한 음식물처럼 자극되는 음식물은 피하고 견딜만한 양만 먹도록 설명합니다.",
        examples:
          "자극성 있는 양념이나 딱딱하고 거친 음식은 제한하는 것이 좋습니다., 부드러운 음식을 섭취하고 맵거나 거친 자극적인 음식을 피합니다., 거칠거나 날 음식, 짠 음식, 산성 및 양념이 강한 음식물과 같이 자극되는 음식물은 피하고 견딜만한 양만 먹도록 한다., 뜨겁거나 거친 음식, 양념이 많거나 신 음식, 먹기 힘든 음식의 섭취를 피합니다.",
        sourceIds: ["nccMucositisCare"],
      },
      {
        label: "입안 건조증 시 단맛·신맛 조건부 주의",
        detail:
          "국가암정보센터 입안의 건조증 자료는 아주 달거나 신음식이 침분비를 늘릴 수 있지만, 입안이 헐거나 목구멍이 아픈 경우에는 피하도록 안내합니다.",
        examples:
          "아주 달거나 신음식을 먹으면 침분비가 많아집니다. 단, 입안이 헐거나 목구멍이 아플 경우에는 피하도록 합니다.",
        sourceIds: ["nccDryMouthDiet"],
      },
      {
        label: "식욕부진 시 식사 중 수분 조금만",
        detail:
          "국가암정보센터 식욕부진 자료는 식사 시 수분섭취가 포만감을 줄 수 있어 한 모금씩 조금만 마시고, 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 안내합니다.",
        examples:
          "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다. 만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다.",
        sourceIds: ["nccAppetiteLossDiet"],
      },
      {
        label: "메스꺼움 심할 때 억지 섭취 피하기",
        detail:
          "국가암정보센터 메스꺼움 자료는 메스꺼움이 심한 경우 억지로 먹거나 마시지 않고, 특정 음식에 대해 메스꺼움이 심할 때에도 억지로 먹지 않으며, 대신 먹기 좋은 다른 음식을 많이 먹도록 안내합니다.",
        examples:
          "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다. 특정 음식에 대해 메스꺼움이 심할 때에도 억지로 먹지 않도록 합니다. 대신 먹기 좋은 다른 음식을 많이 먹도록 합니다.",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "메스꺼움·구토 시 식사 중 국물·음료 조절",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 물을 마시는 것이 포만감을 느끼게 할 수 있으므로 식사 때 너무 많은 국물이나 음료는 피하도록 안내합니다. 식단 기록에서는 구토·메스꺼움 상황의 식사 중 과다 국물·음료 회피 후보로 분리하고, 탈수 치료나 수분 제한 지시로 과장하지 않습니다.",
        examples:
          "물을 마시는 것은 포만감을 느끼게 할 수 있기 때문에 식사를 할 때는 너무 많은 국물이나 음료는 피하도록 합니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 좋아하는 음식 혐오화 주의",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 메스꺼움을 느낄 때는 좋아하는 음식도 먹지 않게 되며, 그 음식을 영원히 싫어하게 될 수도 있다고 안내합니다. 식단 기록에서는 메스꺼움 중 좋아하는 음식 혐오화 주의 후보로 분리하고, 좋아하는 음식의 치료 효과나 일반 섭취 권장으로 과장하지 않습니다.",
        examples:
          "메스꺼움을 느낄 때는 좋아하는 음식도 먹지 않게 되며, 그 음식을 영원히 싫어하게 될 수도 있습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 식사전후 과다 물·음료 피하기",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 식사전후 물과 음료수를 많이 마시지 않고 마른 음식을 먹도록 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 식사전후 과다 물·음료 피하기와 마른 음식 후보로 분리하고, 탈수 치료나 일반 수분 제한 지시로 과장하지 않습니다.",
        examples: "식사전후 물과 음료수를 많이 마시지 않습니다. 마른 음식을 먹습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 구토 멈출 때까지 섭취 피하기",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 구토가 멈출 때까지는 음료나 음식을 먹지 않도록 안내합니다. 식단 기록에서는 구토가 이어지는 동안 음식·음료 섭취를 피하는 후보로 분리하고, 단식 치료나 일반 수분 제한 지시로 과장하지 않습니다.",
        examples: "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 후 물 섭취와 탄산음료 피하기",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 구토 후 1~2시간 정도 지난 뒤 수분을 섭취하고, 탄산음료는 되도록 피하며 물을 섭취하는 것이 좋다고 안내합니다. 식단 기록에서는 구토 후 수분 재개 시점과 탄산음료 회피 후보로 분리하고, 탈수 치료나 무제한 수분 섭취 지시로 과장하지 않습니다.",
        examples:
          "구토 후 1~2시간 정도의 시간이 경과한 후에 수분 섭취를 하도록 합니다. 탄산음료는 되도록 피하고 물을 섭취하는 것이 좋습니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 기름진·튀긴·매운·단 음식 피하기",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 기름진 음식, 튀긴 음식, 짜고 매운 음식, 지나치게 단 음식은 피하도록 안내합니다. 식단 기록에서는 메스꺼움·구토 상황의 음식 제한 후보로 분리하고, 일반 나트륨 제한이나 치료식 주장으로 과장하지 않습니다.",
        examples: "기름진 음식, 튀긴 음식, 짜고 매운 음식, 지나치게 단 음식은 피합니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "구토 중 먹거나 마시지 않기",
        detail:
          "국가암정보센터 구토 자료는 구토증상이 있는 경우 먹거나 마시지 않도록 하고, 구토증상이 조절되면 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보며 차츰 양을 증가시키도록 안내합니다.",
        examples:
          "구토증상이 있는 경우 먹거나 마시지 않도록 합니다. 구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.",
        sourceIds: ["nccVomitingDiet"],
      },
      {
        label: "메스꺼움 시 치료 전 식사 피하기",
        detail:
          "국가암정보센터 메스꺼움 자료는 항암화학요법이나 방사선치료를 받는 동안 오심 증세가 나타난다면 치료하기 1~2시간 전에는 먹지 않도록 안내합니다.",
        examples:
          "항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다.",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "메스꺼움 유발 가능 음식",
        detail:
          "국가암정보센터 메스꺼움 자료는 다음 음식들이 메스꺼움을 더욱 유발할 수 있으므로 피하도록 안내합니다. 예시로 기름진 음식, 사탕·쿠키·케익처럼 매우 단 음식, 향이 강하거나 뜨거운 음식, 이상한 냄새가 나는 음식을 제시합니다.",
        examples:
          "다음 음식들은 메스꺼움을 더욱 유발할 수 있으므로 피하도록 합니다., 기름진 음식, 사탕, 쿠키 또는 케익 등과 같이 매우 단 음식, 매우 단 음식, 향이 강하거나 뜨거운 음식, 이상한 냄새가 나는 음식 등, 이상한 냄새가 나는 음식",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "설사 시 장 자극·고섬유·유당·카페인 확인",
        detail:
          "국가암정보센터 설사 자료는 설사 중에는 기름진 음식, 생야채, 생과일의 껍질·씨·끈적한 섬유소 부분, 브로콜리·옥수수·말린 콩 같은 고섬유 채소, 너무 뜨겁거나 차가운 식품·음료, 커피·초콜릿 등 카페인 식품과 음료, 우유 및 유제품을 주의하도록 안내합니다. 항암 부작용 증상 관리 지침도 설사 시 알코올, 카페인 함유 제품, 우유 및 유제품, 고지방식, 고섬유식, 과일 주스, 매운 음식 등을 피해야 할 음식으로 제시합니다.",
        examples:
          "너무 뜨겁거나 차가운 식품이나 음료는 피하고, 대신 상온의 음료를 마시도록 합니다.; 커피와 초콜릿 등과 같은 카페인을 함유한 식품과 음료는 제한합니다.; 우유 및 유제품을 먹을 때에는 주의합니다. 이는 우유에 들어있는 유당이 설사를 악화시킬 수 있기 때문입니다. 그러나 일반적으로 적은 양의 우유나 유제품은 소화시킬 수 있습니다.; 기름진 음식, 생야채; 브로콜리, 옥수수, 말린 콩 등과 같은 고섬유 채소 등; 생과일의 껍질, 씨, 끈적한 섬유소 부분; 피해야 할 음식: 알코올, 카페인 함유 제품, 우유 및 유제품, 고지방식, 고섬유식, 과일 주스, 매운 음식 등 입니다.; 설사 생야채, 설사 생과일 껍질, 설사 브로콜리, 설사 옥수수, 설사 말린 콩, 설사 커피, 설사 초콜릿, 설사 우유 및 유제품",
        sourceIds: ["nccDiarrheaDiet", "nccChemoSideEffectGuide"],
      },
      {
        label: "체중증가 시 고염분·고열량 저영양 식품 확인",
        detail:
          "국가암정보센터 체중변화 자료는 체중증가 원인을 먼저 의사와 확인하도록 하며, 항암제 관련 수분 보유가 의심되면 소금이 수분 축적에 관여하므로 가공식품·김치·젓갈·장아찌류 같은 염분 함량이 높은 식품을 제한하고 가능한 싱겁게 먹도록 안내합니다. 식욕 증가가 있으면 청량 음료·초콜릿·사탕·과자류처럼 열량이 높고 영양가가 낮은 식품을 제한하도록 안내합니다. 체중조절 방법으로 버터, 마요네즈, 감미료 등을 추가로 사용하지 않고 가능한 고열량의 간식은 먹지 않도록 안내합니다.",
        examples:
          "소금이 우리 몸에서 수분을 축적시키는 작용을 하므로 염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등)은 제한하고 가능한 싱겁게 먹는 것이 좋습니다.; 반면, 식욕이 증가된 경우에는 열량이 높고 영양가가 없는 식품들(예: 청량 음료, 초콜릿, 사탕, 과자류 등)은 제한하도록 합니다.; 버터, 마요네즈, 감미료 등을 추가로 사용하지 않도록 합니다.; 가능한 고열량의 간식은 먹지 않도록 합니다.; 체중증가 가공식품, 체중증가 김치, 체중증가 젓갈, 체중증가 장아찌류, 체중증가 청량 음료, 체중증가 초콜릿, 체중증가 사탕, 체중증가 과자류, 체중증가 고열량 간식",
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
          "자궁경부암 식생활 자료와 보완대체요법 자료는 항암화학요법 중 민간요법·건강보조식품을 삼가거나 주치의에게 알리도록 안내합니다. 보완대체요법 자료는 약초나 영양제 복용 사실을 의료진에게 알리는 것이 부작용 위험 최소화 방법이라고 설명합니다.",
        examples:
          "또한 항암화학요법을 받는 중에는 민간요법이나 건강보조식품은 삼갑니다., 민간요법이나 건강보조식품은 과학적으로 효능이 확인되지 않았으며 병원에서 투여하는 약제와 예상할 수 없는 상호작용으로 치료효과가 떨어지거나 부작용이 커질 수도 있기 때문입니다., 여러분의 약초나 영양제 복용 사실을 여러분을 돌보고 있는 의료진에게 알리는 것은 부작용 의 위험을 최소화할 수 있는 하나의 방법입니다., 고농축 보충제, 영양제, 약초, 한약, 민간요법, 치료 효과를 표방하는 식품",
        sourceIds: ["nccCervicalDiet", "nccComplementaryTherapy"],
      },
      {
        label: "통증·식욕저하 식사 전 약 확인",
        detail:
          "자궁경부암 식생활 자료는 통증으로 식욕을 잃은 경우 식사 전 진통제 복용을 언급합니다. 식단 기록에서는 환자가 좋아하거나 먹고 싶어하는 음식과 손이 닿는 위치에 둔 음식 메모를 보존하되, 약 복용 시점은 처방과 진료팀 지시로 확인할 항목으로 분리합니다.",
        examples:
          "충분한 영양 섭취를 위해서는 잘 먹는 것이 중요한데, 우선 환자가 평소에 좋아했던 음식이나 먹고 싶어하던 음식을 제공하고, 통증 으로 식욕을 잃었다면 식사 전에 먼저 진통제 를 복용합니다. 음식은 항상 손이 쉽게 갈 수 있는 곳에 두고 식욕을 느낄 때마다 먹습니다.",
        sourceIds: ["nccCervicalDiet"],
      },
      {
        label: "자몽·약물 상호작용 가능 식품",
        detail:
          "약 복용 중 특정 식품 상호작용이 의심되면 처방약, 항암제, 보조제를 함께 적어 진료팀 기준으로 확인합니다.",
        examples: "자몽, 자몽 주스, 복용 약과 같이 먹는 보충제",
        sourceIds: ["kdcaNutrition", "nccComplementaryTherapy"],
      },
      {
        label: "식약처 식중독 예방 6대수칙",
        detail:
          "식품의약품안전처는 식중독 예방 6가지 방법으로 흐르는 물에 비누로 30초 이상 손 씻기, 날음식과 조리음식 및 칼·도마 구분 사용, 육류 중심온도 75˚C(어패류는 85˚C) 1분 이상 익히기, 식재료·조리기구 세척·소독, 물 끓여 먹기, 냉장식품은 5˚C 이하·냉동식품은 -18˚C 이하 보관온도 지키기를 안내합니다. 음식점 안전조리 요령에서는 따뜻한 음식은 60˚C 이상, 찬 음식은 5˚C 이하로 보관하고, 조리한 음식은 상온에 오래 방치하지 않으며 가급적 조리후 2시간 이내 섭취하도록 안내합니다.",
        examples:
          "흐르는 물에 비누로 30초 이상 씻기, 날음식과 조리음식 구분, 칼·도마 구분 사용, 육류 중심온도 75˚C(어패류는 85˚C) 1분 이상 익히기, 식재료·조리기구는 깨끗이 세척·소독 하기, 물은 끓여서 먹기, 냉장식품은 5˚C 이하, 냉동식품은 -18˚C 이하, 따뜻한 음식은 60˚C 이상, 찬 음식은 5˚C 이하, 조리후 2시간 이내 섭취",
        sourceIds: ["mfdsFoodPoisoningPrevention"],
      },
      {
        label: "식약처 달걀 살모넬라 식중독 주의",
        detail:
          "식품의약품안전처는 달걀을 사용하는 음식점에서 살모넬라 식중독 의심 사례가 지속 발생해 달걀 취급 업체 식중독 예방수칙 준수를 당부했습니다. 주요 교차오염 사례로 생달걀을 만진 손을 씻지 않고 다른 음식 조리, 가열 전 달걀물이 묻은 집게를 조리 완제품에도 혼용 사용, 충분히 익지 않은 육전, 남은 달걀물의 재사용, 달걀물을 상온에서 장시간 보관, 조리 후 작업공간 세척·소독 미실시를 제시합니다. 예방수칙으로 생달걀 또는 달걀물을 만진 후 비누로 30초 이상 손씻기, 생달걀과 일반 조리과정 구분 및 칼·도마·집게·장갑 등은 분리 사용, 달걀 조리식품은 중심부까지 충분히 가열, 달걀 보관온도(0~10℃) 준수, 작업대·용기·조리 기구는 사용 후 즉시 세척·소독을 안내합니다.",
        examples:
          "살모넬라 식중독, 생달걀을 만진 손을 씻지 않고 다른 음식 조리, 가열 전 달걀물이 묻은 집게를 조리 완제품에도 혼용 사용, 충분히 익지 않은 육전, 남은 달걀물의 재사용, 달걀물을 상온에서 장시간 보관, 조리 후 작업공간 세척·소독 미실시, 생달걀 또는 달걀물을 만진 후 비누로 30초 이상 손씻기, 생달걀과 일반 조리과정은 구분하고 칼·도마·집게·장갑 등은 분리 사용, 달걀 조리식품은 중심부까지 충분히 가열하기, 달걀 보관온도(0~10℃)를 준수, 작업대·용기·조리 기구는 사용 후 즉시 세척·소독",
        sourceIds: ["mfdsSalmonellaEggSafety"],
      },
      {
        label: "질병관리청 노로바이러스 식중독 예방",
        detail:
          "질병관리청 국가건강정보포털은 노로바이러스 감염 시 구토와 설사로 인한 탈수에 주의해야 하며, 특히 면역저하자 등에서는 탈수 증상 관찰과 늦지 않은 치료가 중요하다고 설명합니다. 오염된 식재료를 조리하지 않고 섭취했을 때도 발생할 수 있으므로, 흐르는 물에 비누로 30초 이상 손 씻기, 채소·과일 세척, 음식물은 85℃ 이상에서 1분 이상 가열, 끓인 물 마시기, 칼·도마 소독과 조리도구 구분을 안내합니다. 음식 조리 시에는 식재료를 흐르는 물에 세척하여 85℃ 이상에서 충분히 익히고, 조리한 식품은 실온에 두지 말고 10℃ 이하의 냉장고에 보관하며, 환자가 발생한 경우 구토물·접촉환경·사용 물건에 대한 염소 소독을 확인하도록 안내합니다.",
        examples:
          "노로바이러스 식중독, 면역저하자 노로바이러스 탈수, 오염된 식재료를 조리하지 않고 섭취, 음식물은 충분히 익혀 먹기(85℃ 이상에서 1분 이상 가열), 식재료를 흐르는 물에 세척하여 85℃ 이상에서 충분히 익혀 먹기, 조리한 식품은 실온에 두지 말고 10℃ 이하의 냉장고에 보관, 칼·도마는 소독하여 사용, 환자 구토물 접촉환경, 염소 소독",
        sourceIds: ["kdcaNorovirusFoodSafety"],
      },
      {
        label: "식품안전나라 노로바이러스 식중독 주의",
        detail:
          "식품안전나라는 노로바이러스를 외가닥 RNA를 가진 껍질이 없는(Non-envelop) 바이러스로 설명하며, 주로 분변-구강 경로로 감염되고 사람의 장관 내에서만 증식할 수 있으며 연중 발생 가능하고 2차 발병률이 높다고 설명합니다. 원인식품으로 음식(패류, 샐러드, 과일, 냉장식품, 샌드위치, 상추, 냉장조리 햄, 빙과류)이나 물, 특히 사람의 분변에 오염된 물이나 식품을 제시하므로 식품 안전 질문으로 분리합니다. 예방대책으로 감염자의 변, 구토물 접촉 회피 및 접촉 시 충분한 세척·소독, 조리자의 용변 후 또는 조리 전 손 씻기와 소독, 과일과 채소 세척 및 굴 등의 어패류 중심온도 85℃에서 1분 이상 가열, 오염된 표면 세척·살균과 감염된 옷·이불의 비누 사용 뜨거운 물로 세탁을 안내합니다.",
        examples:
          "껍질이 없는(Non-envelop) 바이러스, 분변-구강 경로(Fecal-oral route)를 통하여 감염, 사람의 장관 내에서만 증식, 연중 발생 가능하며 2차 발병률이 높다, 음식(패류, 샐러드, 과일, 냉장식품, 샌드위치, 상추, 냉장조리 햄, 빙과류), 사람의 분변에 오염된 물이나 식품, 감염자의 변, 구토물에 접촉하지 않으며, 접촉한 경우에는 충분히 세척하고 소독을 하여야 한다, 조리자는 용변을 본 후나 조리하기 전에 반드시 손을 잘 씻고 소독을 하여야 한다, 과일과 채소는 철저히 씻어야 하며, 굴 등의 어패류는 중심온도 85℃에서 1분 이상 가열하여 먹는다, 질병 발생 후 오염된 표면은 소독제로 철저히 세척, 살균하고 바이러스에 감염된 옷과 이불 등은 즉시 비누를 사용하여 뜨거운 물로 세탁하여야 한다",
        sourceIds: ["foodSafetyKoreaNorovirusFoodPoisoning"],
      },
      {
        label: "질병관리청 자연독 식중독 주의",
        detail:
          "질병관리청 국가건강정보포털은 식중독 원인에 동물성·식물성·진균성 자연독이 포함된다고 설명합니다. 복어의 알·난소·간·껍질에는 치명적인 테트로도톡신이 있고 복어독은 열에 강하기 때문에 120℃에서 1시간 이상 가열해도 파괴되지 않으므로 복어는 복어요리 전문가가 조리한 것을 확인해야 합니다. 조개류는 유독성 플랑크톤 축적, 섭조개·홍합의 마비성 조개독, 야생 독버섯의 식용버섯 오인, 녹색 감자·싹 부위의 솔라닌, 세척하거나 열을 가해도 없어지지 않는 곰팡이독을 식품 안전 질문으로 분리합니다.",
        examples:
          "복어독은 열에 강하기 때문에 120℃에서 1시간 이상 가열해도 파괴되지 않습니다, 복어요리 전문가가 조리하지 않은 복어, 유독화된 조개, 적조에 노출된 섭조개나 홍합, 야생 독버섯을 식용버섯으로 오인, 녹색을 띠는 감자, 감자의 독이 포함된 부위(싹이 난 부위나 녹색을 띠는 부위)를 잘라내야 합니다, 솔라닌, 곰팡이독은 세척하거나 열을 가하더라도 없어지지 않고",
        sourceIds: ["kdcaFoodPoisoningNaturalToxins"],
      },
      {
        label: "식품안전나라 황색포도상구균 식중독 주의",
        detail:
          "식품안전나라는 황색포도상구균을 식품 중에서 증식해 생산한 장독소(enterotoxin)를 함유한 식품 섭취로 일어나는 독소형 식중독균으로 설명합니다. 균은 78℃에서 1분 또는 64℃에서 10분 가열로 거의 사멸되지만, 원인 물질인 장독소는 내열성이 강해 100℃에서 60분간 가열해야 파괴된다고 설명하므로 식품 안전 질문으로 분리합니다. 원인식품으로 육류 및 그 가공품과 우유, 크림, 버터, 치즈 등과 이들을 재료로 한 과자류와 유제품, 밥, 김밥, 도시락, 두부 등과 복합조리식품, 크림, 소스, 어육 연제품을 제시합니다. 예방대책으로 식품 취급자의 손 청결, 손에 창상 또는 화농되거나 신체 다른 부위에 화농이 있을 때 식품 취급 금지, 기구와 기기 청결 유지, 남은 식품은 실온 방치 대신 5℃ 이하에 냉장 보관을 안내합니다.",
        examples:
          "황색포도상구균, 장독소(enterotoxin), 코 안이나 피부에 상재, 손에 창상 또는 화농, 신체 다른 부위에 화농, 육류 및 그 가공품과 우유, 크림, 버터, 치즈, 과자류와 유제품, 밥, 김밥, 도시락, 두부, 복합조리식품, 소스, 어육 연제품, 식품 취급자는 손을 청결히 하며 손에 창상 또는 화농되거나 신체 다른 부위에 화농이 있으면 식품을 취급해서는 안된다, 식품제조에 필요한 모든 기구와 기기 등을 청결히 유지하여 2차 오염을 방지한다, 식품은 적당량을 조속히 조리한 후 모두 섭취하고, 식품이 남았을 경우에는 실온에 방치하지 말고 5℃ 이하에 냉장 보관한다",
        sourceIds: ["foodSafetyKoreaStaphylococcusAureusFoodPoisoning"],
      },
      {
        label: "식품안전나라 살모넬라균 식중독 주의",
        detail:
          "식품안전나라는 살모넬라균을 2~3×0.6um 의 포자를 형성하지 않는 그람음성 간균으로 운동성이 있다고 설명합니다. 60℃에서 20분 동안 가열 하면 사멸하나 토양 및 수중에서는 비교적 오래 생존하고, 생체 내로 침입되면 장내에서 분열·증식되어 독소가 생산된다고 설명하므로 식품 안전 질문으로 분리합니다. 원인식품으로 부적절하게 가열한 동물성 단백질식품(우유, 유제품, 고기와 그 가공품, 가금류의 알과 그 가공품, 어패류와 그 가공품), 식물성 단백질식품, 채소 등 복합조리식품, 생선묵, 생선요리, 면류, 야채, 샐러드, 마요네즈, 도시락 등 복합조리식품을 제시하고, 보균자의 손, 발 등 2차 오염에 의한 오염식품도 감염 가능하다고 설명합니다. 예방대책으로 조리 후 식품을 가능한 한 신속히 섭취하고 남은 음식은 5℃ 이하 저온 보관, 식품은 75℃에서 1분 이상 가열 조리, 조리에 사용된 기구 등은 세척·소독하도록 안내합니다.",
        examples:
          "살모넬라균, 2~3×0.6um 의 포자를 형성하지 않는 그람음성 간균, 60℃에서 20분 동안 가열 하면 사멸, 균이 생체 내로 침입되면 장내에서 분열·증식되어 독소가 생산, 부적절하게 가열한 동물성 단백질식품(우유, 유제품, 고기와 그 가공품, 가금류의 알과 그 가공품, 어패류와 그 가공품), 식물성 단백질식품, 채소 등 복합조리식품, 생선묵, 생선요리, 면류, 야채, 샐러드, 마요네즈, 도시락 등 복합조리식품, 보균자의 손, 발 등 2차 오염에 의한 오염식품, 조리 후 식품을 가능한 한 신속히 섭취하도록 하며 남은 음식은 5℃ 이하 저온 보관한다, 식품을 75℃에서 1분 이상 가열 조리한 후 섭취한다, 조리에 사용된 기구 등은 세척·소독하여 2차 오염을 방지한다",
        sourceIds: ["foodSafetyKoreaSalmonellaFoodPoisoning"],
      },
      {
        label: "식품안전나라 바실러스 세레우스균 식중독 주의",
        detail:
          "식품안전나라는 바실러스 세레우스균을 135℃에서 4시간의 가열에도 견디는 내열성 포자 형성균으로 설명합니다. 설사형 독소(Diarrhetic toxin)는 장내에서 생성되는 열, 산, 알칼리, 단백질 가수분해 효소에 민감하지만, 구토형 독소(Emetic toxin)는 열과 산 등에 저항력을 갖는다고 설명하므로 식품 안전 질문으로 분리합니다. 원인식품으로 설사형은 향신료 사용 요리, 육류 및 채소의 스프, 푸딩, 구토형은 주로 쌀밥, 볶음밥을 제시합니다. 예방대책으로 곡류, 채소류는 세척하여 사용, 조리된 음식은 장기간 실온방치를 금지하고 5℃이하에서 냉장보관, 저온보존이 부적절한 김밥 같은 식품은 조리 후 바로 섭취를 안내합니다.",
        examples:
          "바실러스 세레우스균, 설사형 독소(Diarrhetic toxin), 구토형 독소(Emetic toxin), 향신료 사용 요리, 육류 및 채소의 스프, 푸딩, 볶음밥, 토양 상재균, 곡류, 채소류는 세척하여 사용하여야 한다, 조리된 음식은 장기간 실온방치를 금지하고, 5℃이하에서 냉장보관 한다, 저온보존이 부적절한 김밥 같은 식품은 조리 후 바로 섭취하여야 한다",
        sourceIds: ["foodSafetyKoreaBacillusCereusFoodPoisoning"],
      },
      {
        label: "식품안전나라 클로스트리디움 퍼프린젠스균 식중독 주의",
        detail:
          "식품안전나라는 클로스트리디움 퍼프린젠스균을 아포를 형성하는 그람양성 편성혐기성 간균으로 설명하고, 아포의 발아 시 독소를 생성하며 사람의 식중독에는 주로 A형과 C형이 관여한다고 설명합니다. 원인식품으로 돼지고기, 닭고기, 칠면조고기 등으로 조리한 식품 및 그 가공품인 동물성 단백질식품과 미리 가열 조리된 후 실온에서 5시간이상 방치된 식품을 제시하므로 식품 안전 질문으로 분리합니다. 예방대책으로 대량 큰 용기 보관은 혐기조건이 될 수 있어 소량씩 용기에 넣어 보관, 부득이하게 남은 음식은 먹기 전에 충분히 가열, 따뜻하게 배식하는 음식은 조리 후 배식까지 60℃ 이상 유지, 차갑게 배식하는 음식은 조리 후 재빨리 식혀 5℃ 이하에서 보관을 안내합니다.",
        examples:
          "클로스트리디움 퍼프린젠스균, 아포의 발아 시 독소를 생성, A형과 C형, 돼지고기, 닭고기, 칠면조고기 등으로 조리한 식품 및 그 가공품인 동물성 단백질식품, 미리 가열 조리된 후 실온에서 5시간이상 방치된 식품, 식품을 대량으로 큰 용기에 보관하면 혐기조건이 될 수 있으므로 소량씩 용기에 넣어 보관한다, 부득이하게 남은 음식은 먹기 전에 충분히 가열한 후 섭취하여야 한다, 따뜻하게 배식하는 음식은 조리 후 배식까지 60℃ 이상을 유지해야 하며, 차갑게 배식하는 음식은 조리 후 재빨리 식혀 5℃ 이하에서 보관한다",
        sourceIds: ["foodSafetyKoreaClostridiumPerfringensFoodPoisoning"],
      },
      {
        label: "식품안전나라 클로스트리디움 보툴리늄균 식중독 주의",
        detail:
          "식품안전나라는 클로스트리디움 보툴리늄균을 그람양성의 편성혐기성 간균이며 세포 한쪽 끝에 난 원형의 아포를 형성하는 균으로 설명합니다. A형, B형, E형, 및 F형균이 사람에게 식중독을 일으키고, 독소는 매우 독성이 강하지만 열에 불안정하여 80℃, 20분과 100℃, 1~2분 가열로 파괴된다고 설명하므로 식품 안전 질문으로 분리합니다. 원인식품으로 통조림, 병조림, 레토르트 식품, 식육, 소시지 생선을 제시하고, 환경조건이 혐기적일 때 아포가 발아하여 증식하면서 식중독을 발생시킬 정도의 독소를 생산할 수 있다고 설명합니다. 예방대책으로 채소와 곡물 세척, 신선한 어류 조리, 통조림·병조림 및 기타 저장식품도 반드시 가열 후 섭취하도록 안내합니다.",
        examples:
          "클로스트리디움 보툴리늄균, 그람양성의 편성혐기성 간균, 세포 한쪽 끝에 난 원형의 아포, A형, B형, E형, 및 F형균, 80℃, 20분과 100℃, 1~2분 가열로 파괴, 통조림, 병조림, 레토르트 식품, 식육, 소시지 생선, 환경조건이 혐기적일 때 아포가 발아하여 증식하면서 식중독을 발생시킬 정도의 독소를 생산, 채소와 곡물을 반드시 깨끗이 세척하고 생선 등 어류는 신선한 것으로 조리해야 한다, 통조림·병조림 및 기타 저장식품도 반드시 가열 후 섭취하여야 한다",
        sourceIds: ["foodSafetyKoreaClostridiumBotulinumFoodPoisoning"],
      },
      {
        label: "식품안전나라 장출혈성 대장균 식중독 주의",
        detail:
          "식품안전나라는 병원성 대장균 중 베로독소를 생성해 대장점막에 궤양과 출혈을 유발하는 대장균을 장관출혈성대장균이라고 설명하며, O26, O103, O104, O146, O157 등 혈청형과 대표 균인 대장균 O157:H7을 제시합니다. 주요 증상은 설사, 복통, 발열, 구토이고 심하면 출혈성 대장염, 용혈성요독증후군, 혈전성혈소판 감소증 등이 나타날 수 있으므로 식품 안전 질문으로 분리합니다. 주요 원인식품으로 햄, 치즈, 소시지, 채소샐러드, 분유, 두부, 음료수, 어패류, 도시락, 급식 등을 제시합니다. 예방대책으로 조리기구(칼, 도마 등) 구분 사용, 생육과 조리된 음식을 구분하여 보관, 다진 고기는 중심부 온도가 75℃ 1분 이상 가열을 안내합니다.",
        examples:
          "장출혈성 대장균, 장관출혈성대장균, 대장균 O157:H7, 출혈성 대장염, 용혈성요독증후군, 혈전성혈소판 감소증, 햄, 치즈, 소시지, 채소샐러드, 분유, 두부, 음료수, 어패류, 도시락, 급식, 환자나 보균자의 분변, 보균자가 화장실을 비위생적으로 사용할 때, 하천수와 어패류 등에서 분리 검출, 조리기구(칼, 도마 등) 구분 사용으로 2차 오염을 방지하여야 한다, 생육과 조리된 음식을 구분하여 보관하여야 한다, 다진 고기는 중심부 온도가 75℃ 1분 이상 가열하여야 한다",
        sourceIds: ["foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning"],
      },
      {
        label: "식품안전나라 장염비브리오균 식중독 주의",
        detail:
          "식품안전나라는 장염비브리오균을 해수세균의 일종으로 2~4%의 소금물에서 잘 생육하며 해수온도가 15℃ 이상이 되면 급격히 증식하고, 짧은 쉼표 모양의 형태를 나타낸다고 설명합니다. 원인식품으로 어패류, 생선회, 수산식품(게장, 생선회, 오징어무침, 꼬막무침 등)을 제시하고, 어패류의 체표와 내장 및 아가미 등에 부착된 균이 조리한 사람의 손과 기구로 다른 식품에 2차 오염될 수 있으므로 식품 안전 질문으로 분리합니다. 예방대책으로 어패류는 수돗물로 잘 씻고, 횟감용 칼, 도마는 구분하여 사용, 오염된 조리 기구 세정·열탕 처리, 가능한 한 생식을 피하고 60℃에서 5분, 55℃에서 10분의 가열로 쉽게 사멸하므로 반드시 식품을 가열한 후 섭취하도록 안내합니다.",
        examples:
          "장염비브리오균, 2~4%의 소금물에서 잘 생육, 해수온도가 15℃ 이상이 되면 급격히 증식, 짧은 쉼표 모양, 어패류, 생선회, 수산식품(게장, 생선회, 오징어무침, 꼬막무침 등), 어패류의 체표와 내장 및 아가미 등에 부착, 어패류는 수돗물로 잘 씻고, 횟감용 칼, 도마는 구분하여 사용하여야 한다, 오염된 조리 기구는 세정, 열탕 처리하여 2차 오염을 방지하여야 한다, 가능한 한 생식을 피하고, 이 균은 60℃에서 5분, 55℃에서 10분의 가열로 쉽게 사멸하므로 반드시 식품을 가열한 후 섭취한다",
        sourceIds: ["foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning"],
      },
      {
        label: "식품안전나라 리스테리아 식중독 주의",
        detail:
          "식품안전나라는 리스테리아균이 냉장온도에서도 생존하여 증식할 수 있다고 설명합니다. 원인식품으로 원유, 살균처리하지 아니한 우유, 핫도그, 치즈(특히 소프트치즈), 아이스크림, 소시지 및 건조 소시지, 가공·비가공 가금육과 비가공 식육 등을 제시하므로, 면역저하 또는 항암 치료 중 식품 메모에서는 냉장 보관 온도 5℃ 이하 관리와 살균 안 된 우유 회피를 식품 안전 질문으로 분리합니다.",
        examples:
          "리스테리아균, 냉장온도에서도 생존하여 증식, 원유, 살균처리하지 아니한 우유, 살균 안 된 우유를 섭취하지 말아야 한다, 핫도그, 치즈(특히 소프트치즈), 아이스크림, 소시지 및 건조 소시지, 가공·비가공 가금육, 비가공 식육, 냉장 보관 온도(5℃ 이하) 관리를 철저하게 하여야 한다",
        sourceIds: ["foodSafetyKoreaListeriaFoodPoisoning"],
      },
      {
        label: "식품안전나라 여시니아 엔테로콜리티카균 식중독 주의",
        detail:
          "식품안전나라는 여시니아 엔테로콜리티카균을 운동성이 있는 그람음성 단간균이며 다른 장내세균은 증식할 수 없는 0~5℃의 냉장고에서도 발육이 가능한 전형적인 저온세균으로 설명합니다. 진공포장에서도 증식할 수 있는 특성과 저온발육 특성 때문에 가을과 초겨울철 식품 취급·보존에 방심할 수 있다고 설명하고, 오물, 오염된 물, 돼지고기, 양고기, 쇠고기, 생우유, 아이스크림을 주요 원인식품으로 제시하므로 식품 안전 질문으로 분리합니다. 예방대책으로 돈육 취급 시 조리기구와 손을 깨끗이 세척·소독하고, 저온보관 상태에서도 균이 증식하며 0℃에서도 증식이 가능한 점을 고려해 냉장 및 냉동육과 그 제품의 유통과정에서도 주의하도록 안내합니다.",
        examples:
          "여시니아 엔테로콜리티카균, 0~5℃의 냉장고에서도 발육이 가능한, 진공포장에서도 증식할 수 있는 특성, 오물, 오염된 물, 돼지고기, 양고기, 쇠고기, 생우유, 아이스크림, 동물의 분변과 함께 배출되어 음료수나 식품에 오염, 저온보관 상태에서도 균이 증식, 돈육 취급 시 조리기구와 손을 깨끗이 세척·소독한다, 저온에서 생육이 억제되지 않으며 균이 0℃에서도 증식이 가능한 점을 고려할 때 냉장 및 냉동육과 그 제품의 유통과정에서도 주의하여야 한다",
        sourceIds: ["foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning"],
      },
      {
        label: "식품안전나라 캠필로박터 식중독 주의",
        detail:
          "식품안전나라는 캠필로박터균의 원인식품으로 소, 돼지, 개, 고양이, 닭, 우유, 물을 제시하고, 육류의 생식이나 불충분한 가열, 동물(조류 등)의 분변에 의한 오염을 감염 경로로 설명합니다. 생육을 만진 경우 손을 깨끗하게 씻고 소독해 2차 오염을 막고, 식품은 충분히 가열하며, 마시는 물도 끓여 마시고, 식육(특히 닭고기)의 생식을 피하며, 열이나 건조에 약하므로 조리 기구는 물로 끓이거나 소독하여 건조하도록 안내합니다.",
        examples:
          "캠필로박터균, 소, 돼지, 개, 고양이, 닭, 우유, 물, 육류의 생식이나 불충분한 가열, 동물(조류 등)의 분변에 의한 오염, 생육을 만진 경우 손을 깨끗하게 씻고 소독하여 2차 오염 방지하여야 한다, 마시는 물도 끓여 마셔야 한다, 식육(특히 닭고기)의 생식, 조리 기구는 물로 끓이거나 소독하여 건조시켜야 한다",
        sourceIds: ["foodSafetyKoreaCampylobacterFoodPoisoning"],
      },
      {
        label: "질병관리청 비브리오 어패류 안전",
        detail:
          "질병관리청 국가건강정보포털은 비브리오 패혈증이 간질환자나 면역저하자에서 심하게 나타나고, 고위험군에는 부신피질호르몬제나 항암제 치료 중인 경우 등이 포함된다고 설명합니다. 날것이나 덜 익힌 어패류 섭취 또는 상처 부위의 바닷물 접촉으로 감염될 수 있으므로, 피부에 상처가 있는 사람은 바닷물과 접촉하지 않도록 하고, 어패류는 충분히 익혀 먹고 여름철 어패류는 5℃ 이하로 저장하며, 흐르는 물에 씻은 뒤 85℃ 이상 가열 처리하고, 조개류는 껍질이 열린 후 5분 이상 끓이거나 증기로 익히는 경우에는 9분이상 더 요리하며, 어패류를 요리한 도마·칼 소독과 어패류를 다룰 때 장갑 착용을 확인하도록 안내합니다.",
        examples:
          "비브리오 패혈증, 날것이나 덜 익힌 어패류, 피부에 상처가 있는 사람은 바닷물과 접촉하지 않도록, 어패류는 충분히 익혀 먹습니다, 여름철 어패류는 5℃ 이하의 저온 상태로 저장합니다, 어패류는 흐르는 물에 깨끗이 씻은 후 85℃ 이상으로 가열 처리, 조개류를 끓여 요리할 때는 껍질이 열린 후 5분 이상 끓이고, 증기로 익히는 경우에는 9분이상 더 요리합니다, 어패류를 요리한 도마, 칼 등의 조리도구는 소독하여 사용합니다, 어패류를 다룰 때 장갑을 착용합니다, 항암제 치료 중 어패류 생식",
        sourceIds: ["kdcaVibrioSepsis"],
      },
      {
        label: "특별한 항암 식품·영양소 주장",
        detail:
          "국가암정보센터 치료 중 일반적인 식생활 및 올바르게 식사하기 자료는 특정 식품이나 영양소를 특효 항암 수단으로 보지 않고, 균형 잡힌 식사와 충분한 영양 상태 유지를 강조합니다.",
        examples:
          "특별한 항암 식품, 특별한 항암 영양소, 특효 식품, 특효 영양소, 암을 치유하는 특별한 음식이나 영양소는 없습니다.",
        sourceIds: ["nccTreatmentEating", "nccTreatmentRightEating"],
      },
      {
        label: "소문난 식품·백혈구 특효 음식 주장",
        detail:
          "국가암정보센터 치료 중 올바르게 식사하기 자료는 몸에 좋다고 소문난 특정 식품이나 영양소에만 관심을 기울이면 전체 열량과 중요한 영양소가 부족해질 수 있고, 백혈구 수치를 올리는 특별한 음식은 없으므로 식사 고민은 의료진·영양사와 상담하도록 안내합니다.",
        examples:
          "몸에 좋다고 소문난 식품, 몸에 좋다고 소문난 영양소, 암환자에게 식생활이 중요하다는 것은 누구나 압니다. 그러나 대부분의 사람들은 몸에 좋다고 소문난 식품이나 영양소에만 관심을 기울이고, 적정 열량(칼로리)과 필수 영양소의 섭취는 제대로 고려하지 않는 수가 많습니다., 암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다, 특정 식품이나 영양소 편중, 백혈구 수치를 올리는 특별한 음식은 없습니다. 이 수치는 시간이 지나면 자연히 회복됩니다., 백혈구 수치를 올리는 특별한 음식은 없습니다, 백혈구 수치를 올리는 특별한 음식",
        sourceIds: ["nccTreatmentRightEating"],
      },
      {
        label: "치료 중 식사 고민·영양 상담",
        detail:
          "국가암정보센터 치료 중 올바르게 식사하기 자료는 음식을 들기 전반이 힘들고 면역력까지 저하된 경우 개별 영양 상담을 받으며, 암환자의 식사와 관련한 고민이 있다면 의료진, 영양사와 상담하고 적절한 영양 섭취에 관해 상담을 받도록 안내합니다.",
        examples:
          "음식을 들기가 전반적으로 힘들고 면역력까지 저하된 경우에는 개별적으로 영양 상담을 받아야 합니다., 암환자의 식사와 관련하여 고민이 있다면 의료진, 영양사와 상담하십시오. 적절한 영양 섭취에 관해 상담을 해드릴 것입니다., 치료 중 식사 고민 의료진 영양사 상담",
        sourceIds: ["nccTreatmentRightEating"],
      },
      {
        label: "입·목 통증 시 입안통증·잇몸 염증 의료진 방문",
        detail:
          "국가암정보센터 입과 목의 통증 자료는 입안통증이나 잇몸 염증이 있는 경우 의사선생님을 방문하여 항암치료 부작용인지 치과질환인지 알아보도록 안내합니다. 식사 기록에서는 음식 판단이 아니라 증상 원인 확인을 위한 의료진·치과 확인 신호로 분리합니다.",
        examples:
          "만약 입안통증이나 잇몸에 염증이 있는 경우 의사선생님을 방문하여 항암치료 의 부작용 때문인지 치과질환인지 알아보도록 합니다.",
        sourceIds: ["nccMouthPainDiet"],
      },
      {
        label: "입·목 통증 시 치아·잇몸 통증 치과치료",
        detail:
          "국가암정보센터 입과 목의 통증 자료는 치아와 잇몸이 아프면 치과치료를 받도록 안내합니다. 식사 기록에서는 음식 판단으로 해석하지 않고 진료팀·치과 확인이 필요한 증상 신호로 분리합니다.",
        examples: "치아와 잇몸이 아프면 치과치료를 받도록 합니다.",
        sourceIds: ["nccMouthPainDiet"],
      },
      {
        label: "옥살로플라틴 온도 민감성·차가운 음식 확인",
        detail:
          "국가암정보센터 입과 목의 통증 자료는 옥살로플라틴 등 말초신경염을 유발할 수 있는 항암제를 투여 받는 경우 온도변화에 민감해 통증을 유발할 수 있으므로 차가운 음식을 피하도록 안내합니다. 식사 기록에서는 약제 조건부 주의로 분리해 진료팀 기준을 확인합니다.",
        examples:
          "그러나 옥살로플라틴(Oxaliplatin) 등과 같은 말초신경염을 유발할 수 있는 항암제 를 투여 받는 경우는 온도변화에 민감하여 통증을 유발할 수 있으므로 차가운 음식은 피하도록 합니다.",
        sourceIds: ["nccMouthPainDiet"],
      },
      {
        label: "입안 건조증 심각 시 의료진·치과 상담",
        detail:
          "국가암정보센터 입안의 건조증 자료는 문제가 심각하면 의사선생님이나 치과선생님과 상의하도록 안내합니다. 식사 기록에서는 음식 판단이 아니라 증상 심각도 확인과 의료진·치과 상담 신호로 분리합니다.",
        examples: "그러나 문제가 심각하면 의사선생님이나 치과선생님과 상의합니다.",
        sourceIds: ["nccDryMouthDiet"],
      },
      {
        label: "입맛 변화 시 치과 문제 확인·구강 헹굼",
        detail:
          "국가암정보센터 입맛의 변화 자료는 음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고 입안을 자주 헹구도록 안내합니다. 식사 기록에서는 음식 허용 판단이 아니라 맛·냄새 변화의 치과 문제 확인과 구강 청결 신호로 분리합니다.",
        examples:
          "음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고, 입안을 자주 헹구도록 합니다.",
        sourceIds: ["nccTasteChangeDiet"],
      },
      {
        label: "피로감·우울 시 피로 원인 의료진 상담",
        detail:
          "국가암정보센터 피로감과 우울 자료는 치료기간 동안 피로감이 제대로 먹지 못한 것, 운동 저하, 혈구수 부족, 우울, 불면, 약물 부작용 등과 관련될 수 있으므로 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요하다고 안내합니다. 식사 기록에서는 음식 허용 판단이 아니라 피로 원인 확인을 위한 진료팀 상담 신호로 분리합니다.",
        examples:
          "만일 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요합니다.",
        sourceIds: ["nccFatigueDepressionDiet"],
      },
      {
        label: "메스꺼움 유발 요인 기록·의료진 상담",
        detail:
          "국가암정보센터 메스꺼움 자료는 메스꺼움이 언제, 무엇 때문에 나타나는지를 체크하고 의사선생님이나 간호사와 상의하도록 안내합니다.",
        examples: "메스꺼움이 언제, 무엇 때문에 나타나는지를 체크하고 의사선생님이나 간호사와 상의합니다.",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "메스꺼움 항구토제 사용 상담",
        detail:
          "국가암정보센터 메스꺼움 자료는 메스꺼움과 구토증상 완화를 위한 항구토제 사용을 미리 의사선생님과 상의하도록 안내합니다.",
        examples: "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.",
        sourceIds: ["nccNauseaDiet"],
      },
      {
        label: "구토 1~2일 이상 지속 상담",
        detail:
          "국가암정보센터 구토 자료는 구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의하도록 안내합니다.",
        examples: "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.",
        sourceIds: ["nccVomitingDiet"],
      },
      {
        label: "메스꺼움·구토 지속 시 수분·전해질 의료진 도움",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 환자가 섭취할 수 있을 만큼만 음료를 마시고, 지속적으로 구토하는 경우 수분공급과 전해질 균형 유지를 위해 정맥 또는 피하 체액 주사를 맞을 수 있으며 이때 의료진의 도움이 필요하다고 안내합니다. 식단 기록에서는 지속 구토의 수분·전해질 유지 의료진 도움 신호로 분리하고, 탈수 치료식이나 자가 주사 지시 또는 일반 수분 섭취 권장으로 과장하지 않습니다.",
        examples:
          "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 섭취 저하·반복 구토 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 식사를 거의 못해 하루에 4컵 이하의 음식만 먹거나, 2일 이상 제대로 식사하지 못하거나, 2일 동안 1~2회 이상의 구토가 있을 때 의료진과 상의하도록 안내합니다. 식단 기록에서는 섭취량 저하와 반복 구토의 진료팀 상담 신호로 분리하고, 음식량 목표나 강제 섭취 또는 칼로리 처방으로 과장하지 않습니다.",
        examples:
          "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 후 목 음식물 걸림·기침 지속 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 구토 후 목에 음식물이 걸린 느낌과 기침이 계속되는 경우 의료진과 상의하도록 안내합니다. 식단 기록에서는 구토 후 목 걸림감과 기침 지속의 진료팀 상담 신호로 분리하고, 부드러운 음식 권장이나 삼킴 훈련, 흡인·기침 치료 지시로 과장하지 않습니다.",
        examples: "구토 후 목에 음식물이 걸린 느낌과 기침이 계속되는 경우",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 12시간 이상·한 시간 3회 이상 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우 의료진과 상의하도록 안내합니다. 식단 기록에서는 지속·반복 구토의 진료팀 상담 신호로 분리하고, 구토 치료법이나 진토제 처방, 수액 치료 또는 응급처치 지시로 과장하지 않습니다.",
        examples: "구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 오심 지속·중요 활동 어려움 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 오심이 며칠 이상 지속되거나 오심 때문에 중요한 일을 하지 못할 때 의료진과 상의하도록 안내합니다. 식단 기록에서는 오심 지속과 일상·중요 활동 저하의 진료팀 상담 신호로 분리하고, 활동 처방이나 진토제 처방, 오심·구토 치료 지시로 과장하지 않습니다.",
        examples: "오심이 며칠이상 지속되거나 오심 때문에 당신이 중요한 일을 하지 못할 때",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 참기 어려운 분출성 구토 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 참지 못하는 구토가 멀리까지 분출되는 경우 의료진과 상의하도록 안내합니다. 식단 기록에서는 참기 어려운 분출성 구토의 진료팀 상담 신호로 분리하고, 일반 구토 키워드나 진토제 처방, 응급치료, 분출성 구토 치료 지시로 과장하지 않습니다.",
        examples: "참지 못하는 구토가 멀리까지 분출되는 경우",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 심한 무력감·현기증 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 심하게 힘이 없거나 현기증이 있을 경우 의료진과 상의하도록 안내합니다. 식단 기록에서는 심한 무력감이나 현기증의 진료팀 상담 신호로 분리하고, 일반 피로 키워드나 휴식·운동 처방, 진토제 처방, 응급치료 지시로 과장하지 않습니다.",
        examples: "심하게 힘이 없거나 현기증이 있을 경우",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 반복 구토·진한 소변·소변 감소 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 수차례 구토를 하고 소변색이 진한 노란색이며 평상시 소변 횟수만큼 화장실에 가지 못할 때 의료진과 상의하도록 안내합니다. 식단 기록에서는 반복 구토와 진한 소변·소변 감소의 진료팀 상담 신호로 분리하고, 탈수 치료식이나 수액 처방, 자가 수분 치료, 일반 소변색 판단 또는 응급치료 지시로 과장하지 않습니다.",
        examples: "수차례 구토를 하고, 소변의 색이 진한 노란색이고 평상시의 소변 횟수만큼 화장실에 가지 못할 때",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 지속·머리 띵함·어지러움·혼란감 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 구토가 지속되고 머리가 띵하거나 어지럽거나 혼란한 느낌이 들 때 의료진과 상의하도록 안내합니다. 식단 기록에서는 구토 지속과 머리 띵함·어지러움·혼란감의 진료팀 상담 신호로 분리하고, 탈수 치료식이나 수액 처방, 진토제 처방, 응급치료 또는 어지럼·혼란 치료 지시로 과장하지 않습니다.",
        examples: "구토가 지속되고 머리가 띵하거나 어지럽거나, 혼란한 느낌이 들 때",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 커피색 구토물 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 구토물이 커피색일 때 혈액일 수 있으므로 의료진과 상의하도록 안내합니다. 식단 기록에서는 커피색 구토물의 진료팀 상담 신호로 분리하고, 커피 음식 제한이나 출혈 진단, 혈액검사 지시, 응급치료 또는 자가 치료 지시로 과장하지 않습니다.",
        examples: "구토물이 커피색일 때 (혈액일 수 있음)",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 처방 진토제 후 지속 증상 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 의사가 처방한 진토제를 복용했는데도 오심 구토가 계속될 때 의료진과 상의하도록 안내합니다. 식단 기록에서는 처방 진토제 복용 후에도 지속되는 오심·구토의 진료팀 상담 신호로 분리하고, 진토제 추가나 복용 권장, 복용량 조절, 약 변경·중단, 응급치료 또는 자가 치료 지시로 과장하지 않습니다.",
        examples: "의사가 처방한 진토제를 복용했는데도 오심 구토가 계속될 때",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 진토제 복용 후 부작용 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 진토제 복용한 후 부작용이 발생했을 때 의료진과 상의하도록 안내합니다. 식단 기록에서는 진토제 복용 후 부작용 발생의 진료팀 상담 신호로 분리하고, 진토제 추가나 복용 권장, 복용량 조절, 약 변경·중단, 부작용 치료, 응급치료 또는 자가 치료 지시로 과장하지 않습니다.",
        examples: "진토제 복용한 후 부작용 이 발생했을 때",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "메스꺼움·구토 시 약 복용·수분·식사 어려움 상담",
        detail:
          "국가암정보센터 메스꺼움과 구토 도움이 되는 방법 자료는 심한 오심이나 구토 때문에 약을 먹을 수 없을 때, 또는 온종일 물을 제대로 마시지 못하거나 식사를 하지 못한 경우 의료진과 상의하도록 안내합니다. 식단 기록에서는 약 복용 불가와 종일 수분·식사 어려움의 진료팀 상담 신호로 분리하고, 약 복용 권장, 복용량 조절, 약 변경·중단, 수액 처방, 응급치료 또는 자가 치료 지시로 과장하지 않습니다. 원문 `초심` 표기는 출처 문장 보존을 위해 examples에 그대로 둡니다.",
        examples:
          "심한 초심이나 구토 때문에 약을 먹을 수 없을 때, 또는 온종일 물을 제대로 마시지 못하거나 식사를 하지 못한 경우",
        sourceIds: ["nccNauseaVomitingCare"],
      },
      {
        label: "설사 심함·혈변·2일 이상 지속 상담",
        detail:
          "국가암정보센터 설사 자료는 설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 안내합니다.",
        examples: "설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다.",
        sourceIds: ["nccDiarrheaDiet"],
      },
      {
        label: "변비 지속·조절 어려움 상담",
        detail:
          "국가암정보센터 변비 자료는 계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 안내합니다.",
        examples: "계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 합니다.",
        sourceIds: ["nccConstipationDiet"],
      },
      {
        label: "체중 유지 어려움·만성질환 상담",
        detail:
          "국가암정보센터 적정 체중과 체지방 유지 자료는 식사조절과 운동만으로 적정 체중 유지가 어렵거나 고혈압, 당뇨병, 고지혈증 등 만성질환이 있는 경우 담당의사 및 임상영양사의 상담을 받도록 안내합니다.",
        examples:
          "단, 식사조절과 운동으로 적정 체중 유지가 어렵거나 고혈압, 당뇨병, 고지혈증 등 만성질환이 있는 경우 담당의사 및 임상영양사의 상담을 받도록 합니다.",
        sourceIds: ["nccWeightMaintenanceDiet"],
      },
      {
        label: "체중증가 원인 확인 상담",
        detail:
          "국가암정보센터 체중변화 자료는 치료 중 체중이 증가하더라도 바로 체중조절을 해야 하는 것은 아니며, 먼저 의사선생님과 상의해 원인을 찾도록 안내합니다.",
        examples:
          "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다.",
        sourceIds: ["nccWeightChangeDiet"],
      },
      {
        label: "치료 후 식사 어려움·보조식품 상담",
        detail:
          "국가암정보센터 치료 후 건강한 식생활 자료는 어떤 특정 식품이나 음식에 의해 암의 재발을 막는다는 연구보고는 없다고 설명합니다. 또한 시중에 암 예방 효과가 있다고 알려진 여러 식품들이나 건강 보조식품들은 아직 안정성이나 효과에 대해 과학적으로 입증된 근거가 없으므로 선택 시 주의가 필요하다고 안내합니다. 단, 암 치료가 끝난 후 부작용 등으로 적절한 식사 섭취가 힘들거나 고혈압, 당뇨병, 고지혈증 등으로 식사조절이 필요한 경우 담당의사 및 임상영양사의 상담을 받도록 안내합니다.",
        examples:
          "어떤 특정 식품이나 음식에 의해 암의 재발을 막는다는 연구보고는 없습니다., 시중에 암 예방 효과가 있다고 알려진 여러 식품들이나 건강 보조식품들은 아직 안정성이나 효과에 대해 과학적으로 입증된 근거가 없으므로 선택 시 주의가 필요합니다., 단, 암 치료가 끝난 후 부작용 등으로 적절한 식사 섭취가 힘들거나 고혈압, 당뇨병, 고지혈증 등으로 식사조절이 필요한 경우 담당의사 및 임상영양사의 상담을 받도록 합니다., 치료 후 부작용으로 식사 섭취 힘듦, 치료 후 건강보조식품 민간요법 주의",
        sourceIds: ["nccAfterTreatmentHealthyEating"],
      },
      {
        label: "날음식·비살균·보관/세척 주의 식품",
        detail:
          "백혈구 감소 등 면역저하 맥락에서는 음식으로 인한 감염을 줄이기 위해 완전히 익힌 음식, 과일·채소 세척, 손상된 캔이나 녹은 냉동제품 구매 주의, 갈은 고기의 가는 과정에서 오염 가능성, 날계란이나 덜 익힌 계란이 들어간 음식 회피, 상온 운반 후 즉시 냉장, 오래 보관한 남은 음식과 곰팡이가 핀 음식 폐기, 저온살균 제품 여부를 확인합니다.",
        examples:
          "생굴, 회, 육회, 생선회, 생조개, 초밥 등 익히지 않은 음식은 드시지 않습니다, 날계란, 덜 익힌 고기, 날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다, 날계란이나 덜 익힌 계란이 들어간 음식, 다진 고기, 가는 과정에서 고기의 표면적이 넓어져 세균 등에 오염될 가능성이 커지기 때문입니다, 가는 과정에서 오염 가능, 씻지 않은 딸기, 딸기 등 꼼꼼히 씻기 어려운 과일은 주의해서 드시고, 딸기 등 꼼꼼히 씻기 어려운 과일, 오래된 남은 음식, 3~4일 지난 남은 음식, 냉장고에 보관하던 남은 음식도 3~4일이 지나면 버립니다, 곰팡이가 핀 음식, 곰팡이 핀 음식, 상한 음식, 식품의 냄새가 이상하거나 모양이 이상한 경우에는 절대 사용하지 않습니다, 상온 30분 이상 운반, 30분 이상 상온에서 운반, 녹슨 캔, 움푹해진 캔, 녹슬거나 움푹해진 캔, 냉동제품 녹음, 냉동제품이 녹아 있다면 구입하지 않도록, 비살균 우유·주스, 비살균 쥬스, 비살균 요구르트",
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
  requiredInputIncludes?: readonly string[];
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

const cervicalPracticeContextTermOptions: FoodRuleTermOptions = {
  requiredInputIncludes: ["자궁경부암", "실천지침"],
};

const supportiveFoods: FoodRuleTerm[] = [
  [
    "자궁경부암 환자가 특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다.",
    "자궁경부암 특수 금기·추천 음식 없음 확인 후보",
    "nccCervicalDiet",
  ],
  [
    "충분한 영양을 섭취하고 휴식을 취하는 것이 몸의 면역 기능 강화와 투병 생활에 도움이 될 수 있습니다.",
    "자궁경부암 충분한 영양·휴식 확인 후보",
    "nccCervicalDiet",
  ],
  [
    "영양은 암치료에 있어서 중요한 부분입니다. 치료 전, 치료기간 동안, 그리고 치료 후 올바른 음식섭취는 기분을 좋게 하고 강하게 만들어 줄 것입니다.",
    "자궁경부암 치료 전·중·후 올바른 음식섭취 확인 후보",
    "nccCervicalDiet",
  ],
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
  [
    "그러므로 자궁경부암의 예방을 위해서는 조기 검진과 정기 검진이 가장 효과적인 방법이며, 일반적으로 건강한 생활을 위해서는 신선한 채소 및 과일을 충분히 섭취하는 것이 좋습니다.",
    "자궁경부암 정기검진 우선·신선 채소과일 섭취 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "채소와 과일을 충분하게 먹고, 다채로운 식단으로 균형 잡힌 식사하기",
    "국립암센터 자궁경부암 조기 진단과 예방법 균형식 생활수칙 후보",
    "nccCervicalEarlyDiagnosisPrevention",
  ],
  [
    "이상에서 살펴본 바와 같이, 자궁경부암의 예방을 위해서는 정기적인 검진이 가장 효과적인 방법이며, 안전한 성생활을 유지하고, 금연을 하며, 신선한 채소 및 과일을 충분히 섭취하는 것이 좋습니다.",
    "자궁경부암 정기검진·생활습관·신선 채소과일 섭취 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "카로틴(carotene)과 거의 유사한 구조를 가진 물질을 카로테노이드라고 하며, 그 중 베타카로틴 은 당근, 시금치, 차, 미역 등 신선한 채소, 과일, 해조류에 풍부합니다.",
    "자궁경부암 베타카로틴 신선식품 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "암예방을 위한 식단의 예입니다. 다음에 제시된 식단을 다양하게 활용하시기 바랍니다.",
    "자궁경부암 실천지침 암예방 식단 예시 활용 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "식이섬유가 풍부한 신선한 채소, 과일 섭취",
    "자궁경부암 실천지침 식이섬유 풍부한 신선 채소·과일 섭취 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "식이 섬유가 풍부한 신선한 채소·과일 섭취",
    "자궁경부암 실천지침 식이섬유 풍부한 신선 채소·과일 섭취 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "식단 작성 시 다양한 종류의 식품을 섭취할 수 있도록 계획해 보십시오.",
    "자궁경부암 실천지침 다양한 식품 섭취 계획 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "파프리카, 피망, 시금치, 토마토, 당근, 양배추 등 식품이 지닌 색상을 고려하여 다양한 종류의 색상이 포함되도록 식품을 선택해 보십시오.",
    "자궁경부암 실천지침 색상 다양성 식품 선택 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "건강을 생각해서 규칙적인 식생활과 더불어 즐거운 마음으로 식사를 하시기 바랍니다.",
    "자궁경부암 실천지침 규칙적 식생활 후보",
    "nccCervicalPracticeDiet",
  ],
  ["파프리카", "자궁경부암 실천지침 색상 다양성 채소 예시 후보", "nccCervicalPracticeDiet"],
  ["피망", "자궁경부암 실천지침 색상 다양성 채소 예시 후보", "nccCervicalPracticeDiet"],
  ["토마토", "자궁경부암 실천지침 색상 다양성 채소 예시 후보", "nccCervicalPracticeDiet"],
  ["과일샐러드", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  [
    "채소 섭취량 증가(채소샐러드는 요플레드레싱 사용)",
    "자궁경부암 실천지침 채소샐러드 요플레드레싱 예시 후보",
    "nccCervicalPracticeDiet",
  ],
  ["채소샐러드", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["브로콜리회", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["딸기 요플레", "자궁경부암 실천지침 딸기 요플레 간식 예시 후보", "nccCervicalPracticeDiet"],
  ["느타리버섯볶음", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["달래무무침", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["닭고기덮밥", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["왜된장국", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["보리밥", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["김구이", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["북어콩나물국", "자궁경부암 실천지침 나트륨 감소 식단 예시 후보", "nccCervicalPracticeDiet"],
  [
    "소금 및 간장 사용량 감소(소금 섭취량 감소)",
    "자궁경부암 실천지침 소금·간장 사용량 감소 조리 예시 후보",
    "nccCervicalPracticeDiet",
  ],
  ["시금치나물", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  ["우엉볶음", "자궁경부암 실천지침 식단 예시 후보", "nccCervicalPracticeDiet"],
  [
    "우엉조림 → 우엉볶음 : 간장 사용량 감소(소금 섭취량 감소)",
    "자궁경부암 실천지침 우엉볶음 나트륨 감소 대체 예시 후보",
    "nccCervicalPracticeDiet",
  ],
  ["쇠고기뭇국", "자궁경부암 실천지침 나트륨 감소 식단 예시 후보", "nccCervicalPracticeDiet"],
  [
    "소금 대신 간장 사용으로 나트륨 섭취량 감소",
    "자궁경부암 실천지침 나트륨 감소 조리 예시 후보",
    "nccCervicalPracticeDiet",
  ],
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
  [
    "채소는 충분히, 과일을 적당량 먹는다.",
    "국가암정보센터 적정 체중과 체지방 유지 채소·과일 섭취 후보",
    "nccWeightMaintenanceDiet",
  ],
  [
    "다양한 음식을 제때에, 골고루 먹는다",
    "국가암정보센터 적정 체중과 체지방 유지 규칙적 균형식 후보",
    "nccWeightMaintenanceDiet",
  ],
  [
    "과식을 피하기 위해 천천히 먹는다.",
    "국가암정보센터 적정 체중과 체지방 유지 천천히 식사 후보",
    "nccWeightMaintenanceDiet",
  ],
  [
    "매일 5가지 색(빨강, 초록, 노랑, 보라, 하양)의 채소와 과일을 먹습니다.",
    "국가암정보센터 식이 실천지침 5가지 색 채소·과일 후보",
    "nccDietPracticeFiber",
  ],
  [
    "간식으로 과자나 탄산음료 대신 고구마(중간 크기 1개 정도), 채소(예: 당근1/5개, 오이1/4개 정도) 및 과일 (예: 사과1/2개, 딸기 10개 정도)을 먹습니다.",
    "국가암정보센터 식이 실천지침 과자·탄산음료 대체 간식 후보",
    "nccDietPracticeFiber",
  ],
  [
    "고구마(중간 크기 1개 정도)",
    "국가암정보센터 식이 실천지침 간식 대체 고구마 예시 후보",
    "nccDietPracticeFiber",
  ],
  [
    "고구마 중간 크기 1개",
    "국가암정보센터 식이 실천지침 간식 대체 고구마 예시 후보",
    "nccDietPracticeFiber",
  ],
  ["당근1/5개", "국가암정보센터 식이 실천지침 간식 대체 채소 예시 후보", "nccDietPracticeFiber"],
  ["당근 1/5개", "국가암정보센터 식이 실천지침 간식 대체 채소 예시 후보", "nccDietPracticeFiber"],
  ["오이1/4개", "국가암정보센터 식이 실천지침 간식 대체 채소 예시 후보", "nccDietPracticeFiber"],
  ["오이 1/4개", "국가암정보센터 식이 실천지침 간식 대체 채소 예시 후보", "nccDietPracticeFiber"],
  ["사과1/2개", "국가암정보센터 식이 실천지침 간식 대체 과일 예시 후보", "nccDietPracticeFiber"],
  ["사과 1/2개", "국가암정보센터 식이 실천지침 간식 대체 과일 예시 후보", "nccDietPracticeFiber"],
  ["딸기 10개", "국가암정보센터 식이 실천지침 간식 대체 과일 예시 후보", "nccDietPracticeFiber"],
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
  [
    "탄수화물(carbohydrate)은 우리 몸에 열량을 공급하는 주요 에너지원으로, 이것이 부족하면 기초 체력이 저하하고 피곤해지며 체중이 줄게 됩니다.",
    "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보",
    "nccTreatmentNutrients",
  ],
  [
    "탄수화물이 풍부하게 들어 있는 음식은 밥, 국수, 빵, 떡, 감자, 고구마, 옥수수 등입니다.",
    "국가암정보센터 치료 중 영양소 탄수화물 식품 예시 후보",
    "nccTreatmentNutrients",
  ],
  ["감자", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["고구마", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["옥수수", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["물 6~8컵", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  ["하루 6~8컵 물", "국가암정보센터 치료 중 영양소 탄수화물·수분 보충 후보", "nccTreatmentNutrients"],
  [
    "물은 중요한 영양소로 생각되지 않는 게 보통이지만, 사실은 혈액과 신체 조직의 핵심적인 성분이면서 영양소와 노폐물을 운반하고 체온을 유지해 주는 등 생명 유지에 필수적인 요소입니다. 수분의 섭취가 부족하거나, 구토‧설사나 고열이 지속되거나, 땀을 과도하게 흘릴 경우에는 탈수가 일어날 수 있습니다. 일반적으로 성인은 하루에 6~8컵 정도의 물이 필요합니다.",
    "국가암정보센터 치료 중 영양소 수분 생명 유지·탈수 예방 후보",
    "nccTreatmentNutrients",
  ],
  [
    "단백질(protein)은 체세포의 주성분으로서 우리 몸을 구성하고 유지하는 역할을 하며, 각종 효소와 호르몬, 항체 등의 성분이 됩니다.",
    "국가암정보센터 치료 중 영양소 단백질 구성·유지 후보",
    "nccTreatmentNutrients",
  ],
  [
    "단백질이 많이 든 식품으로는 쇠고기, 돼지고기, 닭고기 등의 육류와 생선류, 조개류, 달걀, 두부, 우유 등이 있습니다.",
    "국가암정보센터 치료 중 영양소 단백질 식품 예시 후보",
    "nccTreatmentNutrients",
  ],
  [
    "지방(fat)은 탄수화물과 같이 우리 몸에 열량을 공급하는 주요 에너지원으로 참기름, 들기름, 콩기름, 버터 등에 함유되어 있습니다.",
    "국가암정보센터 치료 중 영양소 지방 에너지원 후보",
    "nccTreatmentNutrients",
  ],
  [
    "우리 몸의 생리 기능을 조절하는 대표적인 영양소로 비타민과 무기질(vitamins and minerals)이 있습니다. 신체의 성장‧발달과 건강 유지에 필수적이므로, 필요량은 적지만 규칙적으로 섭취하는 것이 좋습니다. 채소와 과일 등에 많이 들어 있습니다.",
    "국가암정보센터 치료 중 영양소 비타민·무기질 조절 후보",
    "nccTreatmentNutrients",
  ],
  [
    "치료 중 단백질 식품",
    "국가암정보센터 치료 중 영양소 단백질·지방·비타민/무기질 식품 후보",
    "nccTreatmentNutrients",
  ],
  [
    "치료 중 육류와 생선류",
    "국가암정보센터 치료 중 영양소 단백질·지방·비타민/무기질 식품 후보",
    "nccTreatmentNutrients",
  ],
  [
    "치료 중 조개류",
    "국가암정보센터 치료 중 영양소 단백질·지방·비타민/무기질 식품 후보",
    "nccTreatmentNutrients",
  ],
  [
    "치료 중 달걀 두부 우유",
    "국가암정보센터 치료 중 영양소 단백질·지방·비타민/무기질 식품 후보",
    "nccTreatmentNutrients",
  ],
  [
    "치료 중 참기름 들기름 콩기름 버터",
    "국가암정보센터 치료 중 영양소 단백질·지방·비타민/무기질 식품 후보",
    "nccTreatmentNutrients",
  ],
  [
    "치료 중 채소와 과일",
    "국가암정보센터 치료 중 영양소 단백질·지방·비타민/무기질 식품 후보",
    "nccTreatmentNutrients",
  ],
  [
    "건강식이란 균형 잡힌 식사를 말합니다. 즉, 다양한 음식을 골고루 먹는 것입니다. 그래야 충분한 열량과 단백질, 비타민과 무기질을 섭취하여 좋은 영양 상태를 유지할 수 있습니다.",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "치료 중 적정 열량과 필수 영양소",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "치료 중 충분한 열량 단백질 비타민 무기질",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "충분한 열량과 다양한 영양소를 섭취해야 암과 그 치료를 감당하고 부작용도 극복할 수 있는 체력이 만들어집니다.",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "특히 고칼로리, 고단백질의 음식은 치료 효과를 높이고 빠른 회복을 돕습니다.",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "따라서 암환자의 건강식이란 좋아하는 음식에다 다른 여러 식품을 고루 곁들여 먹는 것이라 하겠습니다.",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "고칼로리, 고단백질의 식품을 비롯한 다양한 음식을 골고루 섭취하는 것이 도움이 됩니다",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "환자가 좋은 영양 상태로 치료에 적극 참여할 수 있게 해줍니다.",
    "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
    "nccTreatmentRightEating",
  ],
  [
    "항암치료 로 손상된 세포의 재생을 도와줍니다.",
    "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
    "nccTreatmentRightEating",
  ],
  [
    "따라서 치료 효과에도, 삶의 질에도 좋은 영향을 줄 수 있습니다.",
    "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
    "nccTreatmentRightEating",
  ],
  [
    "치료에 의한 부작용을 더 잘 극복하게 해줍니다.",
    "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
    "nccTreatmentRightEating",
  ],
  [
    "감염의 위험을 감소시켜 줍니다.",
    "국가암정보센터 치료 중 건강식 치료 참여·회복 지원 후보",
    "nccTreatmentRightEating",
  ],
  [
    "치료 중 고칼로리 고단백질 음식",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "치료 중 좋아하는 음식과 여러 식품",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "치료 중 다양한 음식 골고루",
    "국가암정보센터 치료 중 적정 열량·고단백 회복식 후보",
    "nccTreatmentRightEating",
  ],
  [
    "식사는 암 치료의 보조 요법이라고 할 수 있을 만큼 중요합니다. 암환자에게 제일가는 식사 원칙은 '잘 먹는 것' 입니다. 이를 위해서는 환자의 식욕과 선호에만 의존할 수 없습니다. 건강을 위해 올바른 식사를 하도록 적극 도와주려는 보호자들의 의지가 필요합니다.",
    "국가암정보센터 치료 중 건강식 보호자 지원 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "규칙적으로 아침, 점심, 저녁 식사를 하며, 반찬을 골고루 먹습니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "끼니마다 고기나 생선, 달걀, 두부, 콩, 치즈 등 단백질 반찬을 충분히 곁들입니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "밥은 매끼 반 그릇에서 한 그릇 정도 먹고, 간식으로 빵 종류와 크래커, 떡 등을 조금씩 먹습니다. 죽을 먹어야 하는 경우에는 하루 4~5번 이상 자주 드는 것이 좋습니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "채소 반찬은 매끼 두 가지 이상을 충분히 먹습니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "씹거나 삼키기 힘든 경우에는 다지거나 갈아서 먹습니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "한 가지 이상의 과일을 하루에 한두 번 정도 먹는 것이 좋습니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 규칙적인 아침 점심 저녁",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 밥 반 그릇에서 한 그릇",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 죽 하루 4~5번 이상",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 단백질 반찬 충분히",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 채소 반찬 매끼 두 가지 이상",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 과일 하루 한두 번",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "우유와 유제품은 하루 1컵(200ml) 이상 마십니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 우유와 유제품 하루 1컵",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "우유가 맞지 않을 경우엔 요구르트, 두유, 치즈 따위를 대신 먹습니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "식용유, 참기름, 버터 등의 기름은 볶음이나 나물 요리에 양념으로 사용합니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "양념과 조미료를 적당히 사용하되 너무 맵거나 짜지 않게 요리합니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "국, 음료, 후식은 적당히 먹는 것이 좋습니다.",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "치료 중 요구르트 두유 치즈",
    "국가암정보센터 치료 중 건강식 실천 식품 후보",
    "nccTreatmentHealthyEatingTips",
  ],
  [
    "암에 대한 모든 치료들이 끝난 후에는 건강한 식생활을 위한 식사지침을 따르도록 합니다.",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "적정 체중과 체지방량을 유지합니다.",
    "국가암정보센터 치료 후 건강한 식생활 체중·체지방 유지 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "우리 몸에 필요한 영양소는 다양한 식품과 음식을 통하여 섭취해야 합니다.",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "균형잡힌 식사란 나에게 맞는 적당량으로, 매끼 적당량의 곡류와 고기, 생선, 계란, 두부 등의 다양한 단백질 식품을 1~2가지, 2~3가지의 채소류를 포함한 식사를 하고 우유 및 유제품류, 과일류를 하루 1~2회 간식으로 섭취합니다.",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "다양한 색의 과일, 채소와 전곡류를 충분하게 먹습니다.",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "과일과 채소에 들어있는 비타민, 무기질, 식이섬유소, 항산화 영양소 등이 암 예방 및 건강 증진에 도움이 됩니다.",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "다양한 종류와 색깔을 선택하고 채소는 매끼 2~3가지 이상, 과일은 매일 1~2회 섭취합니다.",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "도정이나 가공이 덜 된 전곡류(현미,보리 등의 잡곡류)의 식품을 선택합니다.",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 건강한 식생활",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 다채로운 식단과 균형잡힌 식사",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 다양한 단백질 식품과 채소류",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 우유 및 유제품류 과일류",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 과일 채소 전곡류 충분히",
    "국가암정보센터 치료 후 건강한 식생활 균형식 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "부드럽고 촉촉한 음식을 준비합니다.",
    "국가암정보센터 입과 목 통증 시 부드럽고 촉촉한 음식 확인 후보",
    "nccMouthPainDiet",
  ],
  [
    "씹고 삼키기 쉬운 음식을 먹습니다.",
    "국가암정보센터 입과 목 통증 시 씹고 삼키기 쉬운 음식 확인 후보",
    "nccMouthPainDiet",
  ],
  [
    "요리를 할 때는 부드럽고 연해질 때까지 하도록 하며, 음식을 작은 크기로 자릅니다.",
    "국가암정보센터 입과 목 통증 시 부드러운 조리와 작은 크기 음식 준비 후보",
    "nccMouthPainDiet",
  ],
  [
    "경우에 따라서는 믹서로 곱게 갈도록 합니다.",
    "국가암정보센터 입과 목 통증 시 믹서로 곱게 간 음식 준비 후보",
    "nccMouthPainDiet",
  ],
  [
    "얼음조각을 먹는 것도 도움이 됩니다.",
    "국가암정보센터 입과 목 통증 시 얼음조각 섭취 후보",
    "nccMouthPainDiet",
  ],
  [
    "죽류 : 흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽 등",
    "국가암정보센터 입과 목 통증 시 부드러운 죽류 예시 후보",
    "nccMouthPainDiet",
  ],
  [
    "미음 : 쌀미음, 조미음, 잣미음, 깨미음, 녹두미음 등",
    "국가암정보센터 입과 목 통증 시 부드러운 미음 예시 후보",
    "nccMouthPainDiet",
  ],
  [
    "고기나 생선 : 고기는 부드럽게 조리하고, 생선은 곱게 다지거나 갈아서",
    "국가암정보센터 입과 목 통증 시 부드러운 고기·생선 예시 후보",
    "nccMouthPainDiet",
  ],
  [
    "채소 : 부드러운 야채를 푹 익히거나 데쳐서",
    "국가암정보센터 입과 목 통증 시 부드러운 채소 예시 후보",
    "nccMouthPainDiet",
  ],
  [
    "과일 : 바나나, 배, 수박, 과일통조림 등과 같이 시지 않은 과일",
    "국가암정보센터 입과 목 통증 시 시지 않은 과일 예시 후보",
    "nccMouthPainDiet",
  ],
  [
    "따뜻한 육수(고기국물)에 소금을 약간 첨가하여 마십니다. 이는 목의 염증을 가라앉게 해 주는데 도움이 됩니다.",
    "국가암정보센터 입과 목 통증 시 따뜻한 육수 확인 후보",
    "nccMouthPainDiet",
  ],
  [
    "입안이 쓰린 경우 빨대를 이용합니다.",
    "국가암정보센터 입과 목 통증 시 입안 쓰림 빨대 이용 후보",
    "nccMouthPainDiet",
  ],
  [
    "아이들 스푼과 같이 작은 스푼을 이용합니다.",
    "국가암정보센터 입과 목 통증 시 작은 스푼 이용 후보",
    "nccMouthPainDiet",
  ],
  [
    "음식을 먹은 후 입안은 깨끗이 헹구어 청결하게 유지합니다.",
    "국가암정보센터 입과 목 통증 시 식후 구강 청결 유지 후보",
    "nccMouthPainDiet",
  ],
  ["흰죽", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["닭죽", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["호박죽", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["쌀미음", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["바나나", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["수박", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  ["과일통조림", "국가암정보센터 입과 목 통증 시 부드럽고 삼키기 쉬운 음식 후보", "nccMouthPainDiet"],
  [
    "비교적 위에 부담이 적은 식품들을 섭취합니다.",
    "국가암정보센터 메스꺼움 시 위 부담 적은 식품 선택 후보",
    "nccNauseaDiet",
  ],
  [
    "일반적으로 메스꺼움과 구토에는 비스킷, 토스트, 요구르트, 튀기지 않은 껍질이 있는 닭, 부드럽고 자극적이지 않은 복숭아 통조림과 같은 과일과 야채, 얼음 조각 등이 좋습니다.",
    "국가암정보센터 메스꺼움·구토 시 비스킷·토스트·요구르트·튀기지 않은 닭·부드러운 과일야채·얼음 조각 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "자극이 적고 부드럽고 소화가 잘 되는 음식을 먹습니다.",
    "국가암정보센터 메스꺼움·구토 시 자극 적고 부드럽고 소화 잘 되는 음식 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "아침에 메스꺼움을 느낀다면, 일어나기 전에 토스트나 크래커를 먹도록 합니다.",
    "국가암정보센터 메스꺼움·구토 시 아침 메스꺼움에 일어나기 전 토스트·크래커 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "뜨거운 음식은 메스꺼움을 느끼게 할 수 있으므로, 음료나 음식은 차게 섭취하도록 하고, 좋아하는 음료수를 얼려서 마시는 것도 좋은 방법입니다.",
    "국가암정보센터 메스꺼움·구토 시 차가운 음식·음료와 얼린 음료 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "물종류만 먹을 수 있을때는 꿀물, 설탕물, 이온음료를 먹습니다.",
    "국가암정보센터 메스꺼움·구토 시 물종류만 가능할 때 꿀물·설탕물·이온음료 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "적응이 되면 우유, 요구르트, 주스, 고단백 음료 등을 조금씩 추가하고, 죽에서 밥으로 서서히 바꾸어 갑니다.",
    "국가암정보센터 메스꺼움·구토 후 적응 시 우유·요구르트·주스·고단백 음료와 죽-밥 단계 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "토스트, 크래커, 요거트, 샤베트",
    "국가암정보센터 메스꺼움 시 위 부담 적은 토스트·크래커·요거트·샤베트 후보",
    "nccNauseaDiet",
  ],
  ["샤베트", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  [
    "복숭아통조림이나 다른 부드러운 과일과 채소",
    "국가암정보센터 메스꺼움 시 위 부담 적은 부드러운 과일·채소 후보",
    "nccNauseaDiet",
  ],
  ["복숭아통조림", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  [
    "맑은 유동식, 얼음조각 등",
    "국가암정보센터 메스꺼움 시 위 부담 적은 맑은 유동식·얼음조각 후보",
    "nccNauseaDiet",
  ],
  ["맑은 유동식", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  ["얼음조각", "국가암정보센터 메스꺼움 시 위 부담 적은 음식 후보", "nccNauseaDiet"],
  [
    "배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다.",
    "국가암정보센터 메스꺼움 시 배고프기 전 식사 후보",
    "nccNauseaDiet",
  ],
  [
    "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.",
    "국가암정보센터 메스꺼움 시 식사 환경·식후 휴식 후보",
    "nccNauseaDiet",
  ],
  [
    "먼저 소량씩 천천히 그리고 자주 섭취하는 것이 좋습니다.",
    "국가암정보센터 메스꺼움·구토 시 소량·천천히·자주 섭취 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "환자가 언제 무엇을 먹고 싶은지 선택하도록 하고, 음식을 강요하지 않도록 합니다.",
    "국가암정보센터 메스꺼움·구토 시 환자 음식 선택과 강요하지 않기 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "식사를 하는 장소는 환자에게 맞지 않는 음식 냄새가 나지 않고 환기가 잘 되는 곳이어야 합니다.",
    "국가암정보센터 메스꺼움·구토 시 음식 냄새 적고 환기되는 식사 장소 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "식사직후에 움직이는 것은 소화를 느리게 하므로 식후에는 잠시 쉬도록 하며, 식사 후 한 시간 정도 똑바로 앉아서 휴식을 취하는 것이 가장 좋습니다.",
    "국가암정보센터 메스꺼움·구토 시 식후 움직임 줄이고 바른 자세 휴식 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "이상한 냄새가 나거나 너무 후덥지근한 방은 피하도록 하며, 음식냄새가 나지 않도록 자주 환기시킵니다.",
    "국가암정보센터 메스꺼움 시 냄새·후덥지근한 방 피하기 후보",
    "nccNauseaDiet",
  ],
  [
    "물은 포만감을 줄 수 있기 때문에 천천히 조금씩 마시고, 식사 시에도 조금만 마시도록 합니다. 옷은 몸이 조이지 않도록 느슨하게 입습니다.",
    "국가암정보센터 메스꺼움 시 물 천천히·느슨한 옷 후보",
    "nccNauseaDiet",
  ],
  [
    "구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.",
    "국가암정보센터 구토 조절 후 맑은 유동식 증량 확인 후보",
    "nccVomitingDiet",
  ],
  [
    "맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다. 우유를 소화시키기 힘들면 우유가 들어있지 않은 제품을 이용하도록 합니다.",
    "국가암정보센터 구토 조절 후 미음·일반식 전환 확인 후보",
    "nccVomitingDiet",
  ],
  ["구토 조절 후 물", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 조절 후 육수", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 맑은 유동식", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 후 미음", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["구토 후 부드러운 식사", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  ["우유가 들어있지 않은 제품", "국가암정보센터 구토 조절 후 단계적 수분·유동식 후보", "nccVomitingDiet"],
  [
    "보기가 좋고 냄새도 좋은 식품을 선택하고 준비합니다.",
    "국가암정보센터 입맛 변화 시 보기 좋고 냄새 좋은 식품 준비 후보",
    "nccTasteChangeDiet",
  ],
  [
    "만약 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품을 이용합니다.",
    "국가암정보센터 입맛 변화 시 고기 대체 단백질 식품 후보",
    "nccTasteChangeDiet",
  ],
  [
    "고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다.",
    "국가암정보센터 입맛 변화 시 향이 좋은 양념류·새콤달콤한 소스 후보",
    "nccTasteChangeDiet",
  ],
  [
    "신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있으므로 오렌지나 레몬같이 시큼한 식품을 사용합니다. 그러나 입과 목에 통증 이 있다면, 이런 식품들이 염증을 자극하거나 불편하게 하므로 주의합니다.",
    "국가암정보센터 입맛 변화 시 금속성 맛 신맛 식품·입목 통증 주의 후보",
    "nccTasteChangeDiet",
  ],
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
  [
    "수분을 충분히 섭취하여 설사로 손실된 부분을 보충합니다.",
    "국가암정보센터 설사 시 수분 손실 보충 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "장이 약해져 있으므로 식사는 조금씩 자주 먹습니다.",
    "국가암정보센터 설사 시 장 약화·소량 빈번 식사 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "소화되기 쉽고 부드러운 음식을 먹습니다.",
    "국가암정보센터 설사 시 소화 쉬운 부드러운 음식 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분과 칼륨이 들어있는 식품으로는 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등입니다.",
    "국가암정보센터 설사 시 염분·칼륨 손실 보충 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다.",
    "국가암정보센터 설사 시 12~24시간 맑은 유동식 후보",
    "nccDiarrheaDiet",
  ],
  ["설사 육수", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 스포츠 음료", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 바나나", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 으깬 감자", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 복숭아", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 토마토", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 흰죽", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  ["설사 쌀미음", "국가암정보센터 설사 시 수분·전해질 보충 및 부드러운 음식 후보", "nccDiarrheaDiet"],
  [
    "수분을 충분히 섭취합니다.(하루에 8~10컵 이상) 이는 변을 부드럽게 합니다.",
    "국가암정보센터 변비 시 8~10컵 이상 수분 섭취 확인 후보",
    "nccConstipationDiet",
  ],
  [
    "특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다.",
    "국가암정보센터 변비 시 아침 기상 직후 차가운 물 확인 후보",
    "nccConstipationDiet",
  ],
  [
    "도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취합니다.",
    "국가암정보센터 변비 시 섬유소 많은 식품 충분 섭취 확인 후보",
    "nccConstipationDiet",
  ],
  [
    "섬유질이 많은 음식(야채, 채소, 현미, 견과류 등)을 먹습니다.",
    "국가암정보센터 항암 부작용 변비 시 섬유질 많은 음식 후보",
    "nccChemoSideEffectGuide",
  ],
  [
    "음식 섭취량이 너무 적지 않도록 합니다.",
    "국가암정보센터 변비 시 음식 섭취량 부족 예방 확인 후보",
    "nccConstipationDiet",
  ],
  [
    "가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다.",
    "국가암정보센터 변비 시 가벼운 산책·걷기 확인 후보",
    "nccConstipationDiet",
  ],
  [
    "누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다.",
    "국가암정보센터 변비 시 부드러운 복부 마사지 확인 후보",
    "nccConstipationDiet",
  ],
  ["변비 물 8~10컵", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 하루 8~10컵 물", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 아침 찬물", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 도정 덜 된 곡류", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 생과일", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 생야채", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  ["변비 섬유소 많은 식품", "국가암정보센터 변비 시 수분·섬유소 섭취 후보", "nccConstipationDiet"],
  [
    "백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다",
    "면역저하 시 백혈구 감소·익힌 음식 확인 후보",
    "nccImmuneLowDiet",
  ],
  [
    "다음 사항들을 참조하면 식품으로 인한 질병의 위험을 낮추는 데 도움이 될 것입니다.",
    "면역저하 시 식품으로 인한 질병 위험 낮추기 후보",
    "nccImmuneLowDiet",
  ],
  ["완전히 익힌 음식", "면역저하 시 익힌 음식·저온살균 제품 선택 후보", "nccImmuneLowDiet"],
  ["저온살균 우유", "면역저하 시 저온살균 우유·주스·요구르트 제품 선택 후보", "nccImmuneLowDiet"],
  ["저온살균 주스", "면역저하 시 저온살균 우유·주스·요구르트 제품 선택 후보", "nccImmuneLowDiet"],
  ["저온살균 쥬스", "면역저하 시 유효기간·저온살균 제품 확인 후보", "nccImmuneLowDiet"],
  [
    "쥬스 우유 요구르트 저온살균 제품",
    "면역저하 시 유효기간·저온살균 제품 확인 후보",
    "nccImmuneLowDiet",
  ],
  [
    "쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다",
    "면역저하 시 유효기간·저온살균 제품 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["저온살균 제품", "면역저하 시 저온살균 우유·주스·요구르트 제품 선택 후보", "nccImmuneLowDiet"],
  ["저온살균 요구르트", "면역저하 시 익힌 음식·저온살균 제품 선택 후보", "nccImmuneLowDiet"],
  [
    "모든 식품은 사용하기 전에 반드시 유효기간을 확인합니다",
    "면역저하 시 유효기간·저온살균 제품 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["사용하기 전에 유효기간 확인", "면역저하 시 유효기간·저온살균 제품 확인 후보", "nccImmuneLowDiet"],
  ["유효기간 확인", "면역저하 시 유효기간·저온살균 제품 확인 후보", "nccImmuneLowDiet"],
  [
    "신선도 유지를 위해 음식은 대량 구입하시지 마시고 소량씩 구입해서 드시기 바랍니다",
    "면역저하 시 식품 구입 신선도·소량 구입 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["식품의 유통기한을 꼭 확인합니다", "면역저하 시 식품 구입 신선도·소량 구입 확인 후보", "nccImmuneLowDiet"],
  [
    "갈은 고기를 살 경우에는 직접 갈아주는 곳에서 구입합니다",
    "면역저하 시 식품 구입 신선도·소량 구입 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["유통기한 꼭 확인", "면역저하 시 식품 구입 신선도·소량 구입 확인 후보", "nccImmuneLowDiet"],
  ["신선도 유지", "면역저하 시 식품 구입 신선도·소량 구입 확인 후보", "nccImmuneLowDiet"],
  ["대량 구입하지 않기", "면역저하 시 식품 구입 신선도·소량 구입 확인 후보", "nccImmuneLowDiet"],
  ["소량씩 구입", "면역저하 시 식품 구입 신선도·소량 구입 확인 후보", "nccImmuneLowDiet"],
  ["직접 갈아주는 곳에서 구입", "면역저하 시 식품 구입 신선도·소량 구입 확인 후보", "nccImmuneLowDiet"],
  ["곧바로 냉장고에 넣어 차갑게", "면역저하 시 상온 운반 후 즉시 냉장 실행 후보", "nccImmuneLowDiet"],
  ["상온 운반 후 즉시 냉장", "면역저하 시 상온 운반 후 즉시 냉장 실행 후보", "nccImmuneLowDiet"],
  ["유통기한 확인", "면역저하 시 구매·해동 안전 확인 후보", "nccImmuneLowDiet"],
  ["냉장고에서 해동", "면역저하 시 구매·해동 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "상하기 쉬운 음식은 냉장고, 혹은 냉동고에 보관합니다",
    "면역저하 시 식품 보관·해동 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["상하기 쉬운 음식 냉장고 냉동고 보관", "면역저하 시 식품 보관·해동 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다",
    "면역저하 시 식품 보관·해동 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  [
    "다른 식품에 고기나 생선즙이 떨어지지 않도록 보관합니다",
    "면역저하 시 식품 보관·해동 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  [
    "요리하기 전의 고기 생선 닭고기 분리 보관",
    "면역저하 시 식품 보관·해동 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["고기나 생선즙이 떨어지지 않도록 보관", "면역저하 시 식품 보관·해동 안전 확인 후보", "nccImmuneLowDiet"],
  ["고기는 냉장고에서 녹입니다", "면역저하 시 식품 보관·해동 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "냉동고에 식품을 보관할 때는 랩이나 팩에 포장합니다",
    "면역저하 시 식품 보관·해동 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["냉동고 식품 랩이나 팩 포장", "면역저하 시 식품 보관·해동 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "해동한 후 즉시 요리하는 것이 좋습니다",
    "면역저하 시 식품 보관·해동 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["해동한 후 즉시 요리", "면역저하 시 식품 보관·해동 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "남은 음식은 포장하여 즉시 냉장 보관합니다",
    "면역저하 시 식품 보관·해동 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["남은 음식 즉시 냉장 보관", "면역저하 시 식품 보관·해동 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "채소와 과일은 먹기 전에 깨끗이 씻어 드시기 바랍니다",
    "면역저하 시 과일·채소 세척 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["채소와 과일 먹기 전 세척", "면역저하 시 과일·채소 세척 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "과일이나 채소는 썰기 전에 깨끗이 씻어야 합니다",
    "면역저하 시 과일·채소 세척 안전 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["과일이나 채소 썰기 전 세척", "면역저하 시 과일·채소 세척 안전 확인 후보", "nccImmuneLowDiet"],
  [
    "음식을 만지거나 요리를 하려면 손을 깨끗이 씻도록 합니다",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  [
    "손톱 밑부분까지 깨끗이 씻도록 합니다",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["손톱 밑까지 깨끗이 씻기", "면역저하 시 조리 위생·교차오염 예방 확인 후보", "nccImmuneLowDiet"],
  [
    "음식물에 머리카락이 들어가지 않도록 합니다",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["음식물에 머리카락 들어가지 않게", "면역저하 시 조리 위생·교차오염 예방 확인 후보", "nccImmuneLowDiet"],
  [
    "조리에 사용되는 기구, 식기, 수저는 반드시 소독합니다",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["조리 기구 식기 수저 소독", "면역저하 시 조리 위생·교차오염 예방 확인 후보", "nccImmuneLowDiet"],
  [
    "고기, 생선, 과일, 채소 등에 사용되는 식기, 도마, 칼 등은 가능한 분리해서 사용하거나 소독한 다음 사용합니다",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["식기 도마 칼 분리 사용", "면역저하 시 조리 위생·교차오염 예방 확인 후보", "nccImmuneLowDiet"],
  [
    "생고기, 닭고기, 생선 등에서 나오는 즙이 다른 식품이나 음식에 떨어지지 않도록 조심합니다",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  [
    "고기, 닭고기, 생선 등은 완전히 익히도록 합니다",
    "면역저하 시 고기·생선 완전 가열 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["고기 닭고기 생선 완전히 익히기", "면역저하 시 고기·생선 완전 가열 확인 후보", "nccImmuneLowDiet"],
  ["고기 닭고기 생선 등은 완전히 익히기", "면역저하 시 고기·생선 완전 가열 확인 후보", "nccImmuneLowDiet"],
  [
    "만약 갈아둔 고기를 요리하거나 고명으로 얹고자 할 때에는 다른 재료들과 섞기 전에 충분히 익히도록 합니다",
    "면역저하 시 고기·생선 완전 가열 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["갈아둔 고기 충분히 익히기", "면역저하 시 고기·생선 완전 가열 확인 후보", "nccImmuneLowDiet"],
  ["다른 재료들과 섞기 전에 충분히 익히기", "면역저하 시 고기·생선 완전 가열 확인 후보", "nccImmuneLowDiet"],
  [
    "생고기 닭고기 생선 즙이 다른 식품에 떨어지지 않게",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  [
    "외식보다는 직접 요리하여 드시는 것이 안전합니다",
    "면역저하 시 조리 위생·교차오염 예방 확인 후보",
    "nccImmuneLowDiet",
  ],
  ["외식보다는 직접 요리", "면역저하 시 조리 위생·교차오염 예방 확인 후보", "nccImmuneLowDiet"],
  [
    "흐르는 물에 비누로 30초 이상 씻기",
    "식약처 식중독 예방 30초 손 씻기 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "육류 중심온도 75˚C(어패류는 85˚C) 1분 이상 익히기",
    "식약처 식중독 예방 육류·어패류 중심온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "육류 중심온도 75℃",
    "식약처 식중독 예방 육류 중심온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "어패류 중심온도 85℃",
    "식약처 식중독 예방 어패류 중심온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  ["물은 끓여서 먹기", "식약처 식중독 예방 끓인 물 후보", "mfdsFoodPoisoningPrevention"],
  [
    "냉장식품은 5˚C 이하",
    "식약처 식중독 예방 냉장 보관온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "냉동식품은 -18˚C 이하",
    "식약처 식중독 예방 냉동 보관온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "냉장식품 5℃ 이하",
    "식약처 식중독 예방 냉장 보관온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "냉동식품 -18℃ 이하",
    "식약처 식중독 예방 냉동 보관온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "따뜻한 음식은 60˚C 이상",
    "식약처 식중독 예방 따뜻한 음식 보관온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "찬 음식은 5˚C 이하",
    "식약처 식중독 예방 찬 음식 보관온도 확인 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "조리후 2시간 이내 섭취",
    "식약처 식중독 예방 조리 후 2시간 이내 섭취 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "날음식과 조리음식 구분",
    "식약처 식중독 예방 날음식·조리음식 구분 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "칼·도마 구분 사용",
    "식약처 식중독 예방 칼·도마 구분 사용 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "식재료·조리기구는 깨끗이 세척·소독 하기",
    "식약처 식중독 예방 식재료·조리기구 세척·소독 후보",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "생달걀 또는 달걀물을 만진 후 비누로 30초 이상 손씻기",
    "식약처 살모넬라 달걀 취급 후 30초 손씻기 후보",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "생달걀과 일반 조리과정은 구분하고 칼·도마·집게·장갑 등은 분리 사용",
    "식약처 살모넬라 생달걀 조리과정·도구 분리 후보",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "달걀 조리식품은 중심부까지 충분히 가열하기",
    "식약처 살모넬라 달걀 조리식품 중심부 가열 후보",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "달걀 보관온도(0~10℃)를 준수",
    "식약처 살모넬라 달걀 보관온도 확인 후보",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "작업대·용기·조리 기구는 사용 후 즉시 세척·소독",
    "식약처 살모넬라 작업대·용기·조리기구 즉시 세척·소독 후보",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "조리 후 식품을 가능한 한 신속히 섭취하도록 하며 남은 음식은 5℃ 이하 저온 보관한다",
    "식품안전나라 살모넬라균 조리 후 신속 섭취·남은 음식 5℃ 저온 보관 후보",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "식품을 75℃에서 1분 이상 가열 조리한 후 섭취한다",
    "식품안전나라 살모넬라균 75℃ 1분 이상 가열 후보",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "조리에 사용된 기구 등은 세척·소독하여 2차 오염을 방지한다",
    "식품안전나라 살모넬라균 조리기구 세척·소독 2차 오염 방지 후보",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "식품 취급자는 손을 청결히 하며 손에 창상 또는 화농되거나 신체 다른 부위에 화농이 있으면 식품을 취급해서는 안된다",
    "식품안전나라 황색포도상구균 식품취급자 손 청결·창상 화농 취급 제한 후보",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "식품제조에 필요한 모든 기구와 기기 등을 청결히 유지하여 2차 오염을 방지한다",
    "식품안전나라 황색포도상구균 기구·기기 청결 2차 오염 방지 후보",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "식품은 적당량을 조속히 조리한 후 모두 섭취하고, 식품이 남았을 경우에는 실온에 방치하지 말고 5℃ 이하에 냉장 보관한다",
    "식품안전나라 황색포도상구균 남은 음식 실온방치 금지·5℃ 이하 냉장 후보",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "곡류, 채소류는 세척하여 사용하여야 한다",
    "식품안전나라 바실러스 세레우스균 곡류·채소류 세척 후보",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "조리된 음식은 장기간 실온방치를 금지하고, 5℃이하에서 냉장보관 한다",
    "식품안전나라 바실러스 세레우스균 조리음식 장기 실온방치 금지·5℃ 이하 냉장 후보",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "저온보존이 부적절한 김밥 같은 식품은 조리 후 바로 섭취하여야 한다",
    "식품안전나라 바실러스 세레우스균 김밥 같은 식품 조리 후 즉시 섭취 후보",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "식품을 대량으로 큰 용기에 보관하면 혐기조건이 될 수 있으므로 소량씩 용기에 넣어 보관한다",
    "식품안전나라 클로스트리디움 퍼프린젠스균 대량 용기 혐기조건 회피·소량 보관 후보",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "부득이하게 남은 음식은 먹기 전에 충분히 가열한 후 섭취하여야 한다",
    "식품안전나라 클로스트리디움 퍼프린젠스균 남은 음식 충분 재가열 후보",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "따뜻하게 배식하는 음식은 조리 후 배식까지 60℃ 이상을 유지해야 하며, 차갑게 배식하는 음식은 조리 후 재빨리 식혀 5℃ 이하에서 보관한다",
    "식품안전나라 클로스트리디움 퍼프린젠스균 배식 온도 60℃ 이상·냉각 5℃ 이하 후보",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "채소와 곡물을 반드시 깨끗이 세척하고 생선 등 어류는 신선한 것으로 조리해야 한다",
    "식품안전나라 클로스트리디움 보툴리늄균 채소·곡물 세척 및 신선 어류 조리 후보",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "통조림·병조림 및 기타 저장식품도 반드시 가열 후 섭취하여야 한다",
    "식품안전나라 클로스트리디움 보툴리늄균 통조림·병조림·저장식품 가열 섭취 후보",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "조리기구(칼, 도마 등) 구분 사용으로 2차 오염을 방지하여야 한다",
    "식품안전나라 장출혈성 대장균 조리기구 구분 사용 후보",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "생육과 조리된 음식을 구분하여 보관하여야 한다",
    "식품안전나라 장출혈성 대장균 생육·조리음식 구분 보관 후보",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "다진 고기는 중심부 온도가 75℃ 1분 이상 가열하여야 한다",
    "식품안전나라 장출혈성 대장균 다진 고기 중심부 75℃ 1분 이상 가열 후보",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "어패류는 수돗물로 잘 씻고, 횟감용 칼, 도마는 구분하여 사용하여야 한다",
    "식품안전나라 장염비브리오균 어패류 세척·횟감용 칼 도마 구분 후보",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "오염된 조리 기구는 세정, 열탕 처리하여 2차 오염을 방지하여야 한다",
    "식품안전나라 장염비브리오균 오염 조리기구 세정·열탕 처리 후보",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "가능한 한 생식을 피하고, 이 균은 60℃에서 5분, 55℃에서 10분의 가열로 쉽게 사멸하므로 반드시 식품을 가열한 후 섭취한다",
    "식품안전나라 장염비브리오균 생식 회피·60℃/55℃ 가열 후보",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "음식물은 충분히 익혀 먹기(85℃ 이상에서 1분 이상 가열)",
    "질병관리청 노로바이러스 식중독 예방 음식물 85℃ 1분 이상 가열 후보",
    "kdcaNorovirusFoodSafety",
  ],
  [
    "식재료를 흐르는 물에 세척하여 85℃ 이상에서 충분히 익혀 먹기",
    "질병관리청 노로바이러스 식중독 예방 식재료 세척·85℃ 이상 가열 후보",
    "kdcaNorovirusFoodSafety",
  ],
  [
    "조리한 식품은 실온에 두지 말고 10℃ 이하의 냉장고에 보관",
    "질병관리청 노로바이러스 식중독 예방 조리식품 10℃ 이하 냉장 보관 후보",
    "kdcaNorovirusFoodSafety",
  ],
  [
    "감염자의 변, 구토물에 접촉하지 않으며, 접촉한 경우에는 충분히 세척하고 소독을 하여야 한다",
    "식품안전나라 노로바이러스 감염자 변·구토물 접촉 회피 및 세척·소독 후보",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "조리자는 용변을 본 후나 조리하기 전에 반드시 손을 잘 씻고 소독을 하여야 한다",
    "식품안전나라 노로바이러스 조리자 용변 후·조리 전 손씻기 소독 후보",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "과일과 채소는 철저히 씻어야 하며, 굴 등의 어패류는 중심온도 85℃에서 1분 이상 가열하여 먹는다",
    "식품안전나라 노로바이러스 과일·채소 세척 및 어패류 85℃ 1분 중심가열 후보",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "질병 발생 후 오염된 표면은 소독제로 철저히 세척, 살균하고 바이러스에 감염된 옷과 이불 등은 즉시 비누를 사용하여 뜨거운 물로 세탁하여야 한다",
    "식품안전나라 노로바이러스 오염 표면 세척·살균 및 뜨거운 물 세탁 후보",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "감자의 독이 포함된 부위(싹이 난 부위나 녹색을 띠는 부위)를 잘라내야 합니다",
    "질병관리청 식중독 자연독 감자 솔라닌 부위 제거 후보",
    "kdcaFoodPoisoningNaturalToxins",
  ],
  [
    "살균 안 된 우유를 섭취하지 말아야 한다",
    "식품안전나라 리스테리아 식중독 살균 안 된 우유 회피 후보",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "냉장 보관 온도(5℃ 이하) 관리를 철저하게 하여야 한다",
    "식품안전나라 리스테리아 식중독 5℃ 이하 냉장 보관 후보",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "돈육 취급 시 조리기구와 손을 깨끗이 세척·소독한다",
    "식품안전나라 여시니아 엔테로콜리티카균 돈육 취급 조리기구·손 세척 소독 후보",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "저온에서 생육이 억제되지 않으며 균이 0℃에서도 증식이 가능한 점을 고려할 때 냉장 및 냉동육과 그 제품의 유통과정에서도 주의하여야 한다",
    "식품안전나라 여시니아 엔테로콜리티카균 냉장·냉동육 유통과정 주의 후보",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "생육을 만진 경우 손을 깨끗하게 씻고 소독하여 2차 오염 방지하여야 한다",
    "식품안전나라 캠필로박터 식중독 생육 취급 후 손 씻기·소독 후보",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "마시는 물도 끓여 마셔야 한다",
    "식품안전나라 캠필로박터 식중독 끓인 물 후보",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "조리 기구는 물로 끓이거나 소독하여 건조시켜야 한다",
    "식품안전나라 캠필로박터 식중독 조리기구 끓임·소독·건조 후보",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "어패류는 충분히 익혀 먹습니다",
    "질병관리청 비브리오 패혈증 예방 어패류 충분히 익히기 후보",
    "kdcaVibrioSepsis",
  ],
  [
    "여름철 어패류는 5℃ 이하의 저온 상태로 저장합니다",
    "질병관리청 비브리오 패혈증 예방 어패류 저온 저장 후보",
    "kdcaVibrioSepsis",
  ],
  [
    "어패류는 흐르는 물에 깨끗이 씻은 후 85℃ 이상으로 가열 처리",
    "질병관리청 비브리오 패혈증 예방 어패류 85℃ 이상 가열 후보",
    "kdcaVibrioSepsis",
  ],
  [
    "조개류를 끓여 요리할 때는 껍질이 열린 후 5분 이상 끓이고, 증기로 익히는 경우에는 9분이상 더 요리합니다",
    "질병관리청 비브리오 패혈증 예방 조개류 가열 시간 후보",
    "kdcaVibrioSepsis",
  ],
  [
    "어패류를 요리한 도마, 칼 등의 조리도구는 소독하여 사용합니다",
    "질병관리청 비브리오 패혈증 예방 어패류 조리도구 소독 후보",
    "kdcaVibrioSepsis",
  ],
  [
    "어패류를 다룰 때 장갑을 착용합니다",
    "질병관리청 비브리오 패혈증 예방 어패류 취급 장갑 착용 후보",
    "kdcaVibrioSepsis",
  ],
  [
    "암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있습니다. 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨립니다. 그러므로 체중감소를 예방하기 위해서 열량과 단백질 등을 충분히 섭취해야 합니다.",
    "국가암정보센터 체중감소 시 열량·단백질 충분 섭취 후보",
    "nccWeightChangeDiet",
  ],
  [
    "밥 : 김밥, 초밥, 주먹밥, 볶음밥 등",
    "국가암정보센터 체중감소 시 밥 조리 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "죽 : 야채죽, 전복죽, 계란죽, 닭죽, 깨죽, 호박죽, 단팥죽, 잣죽 등",
    "국가암정보센터 체중감소 시 죽 조리 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "감자, 고구마, 떡, 만두, 빵, 과일, 과일주스, 과일통조림 등",
    "국가암정보센터 체중감소 시 간식 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "빵이나 떡 : 설탕, 꿀, 쨈, 버터, 땅콩버터 등을 발라 먹는다.",
    "국가암정보센터 체중감소 시 빵·떡 열량 보충 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "감자 : 버터를 발라 구워 먹는다.",
    "국가암정보센터 체중감소 시 감자 열량 보충 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "나물요리 : 볶거나 무침을 할 때 식용유, 참기름, 들기름 등을 넉넉히 사용한다.",
    "국가암정보센터 체중감소 시 나물 열량 보충 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "야채샐러드 : 마요네즈, 샐러드드레싱을 충분히 사용한다.",
    "국가암정보센터 체중감소 시 야채샐러드 열량 보충 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "우유, 두유 등 음료 : 설탕, 꿀, 초콜릿, 미숫가루, 분유 등을 타서 먹는다.",
    "국가암정보센터 체중감소 시 우유·두유 음료 열량 보충 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "과일 : 과일 대신 과일 통조림을 먹거나 우유, 아이스크림과 혼합하여 쉐이크를 만들어서 먹는다.",
    "국가암정보센터 체중감소 시 과일 열량 보충 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "지방보다는 탄수화물이 많이 포함된 간식을 드시면 포만감이 빨리 사라지므로 더 편안함을 느낄 수 있다.",
    "국가암정보센터 체중감소 시 탄수화물 간식 활용 후보",
    "nccWeightChangeDiet",
  ],
  [
    "사탕, 젤리, 크래커, 빵류, 과일, 주스 등",
    "국가암정보센터 체중감소 시 탄수화물 간식 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "고기를 과일 주스에 담그거나 과일 통조림과 함께 조리한다.",
    "국가암정보센터 체중감소 시 고기 과일주스 조리 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "마늘, 양파, 고추장, 카레, 케찹 등을 사용하여 고기의 쓴맛을 제거한다.",
    "국가암정보센터 체중감소 시 고기 쓴맛 조리 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "계란 : 계란후라이, 계란찜, 수란, 오믈렛, 메추리알조림 등",
    "국가암정보센터 체중감소 시 계란 단백질 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "콩, 두부 : 콩밥, 두유, 연두부찜, 두부조림, 된장찌개, 콩자반 등",
    "국가암정보센터 체중감소 시 콩·두부 단백질 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "생선 : 생선포, 생선전, 생선조림, 어묵, 마른 오징어 등",
    "국가암정보센터 체중감소 시 생선 단백질 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "유제품 : 우유, 요구르트, 요플레, 아이스크림, 밀크쉐이크, 치즈 등",
    "국가암정보센터 체중감소 시 유제품 단백질 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "탈지분유나 분유를 우유에 타서 마신다.",
    "국가암정보센터 체중감소 시 탈지분유·분유 우유 활용 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "미숫가루를 만들 때 물 대신 우유 또는 두유를 이용한다.",
    "국가암정보센터 체중감소 시 미숫가루 우유·두유 활용 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "야채샐러드에 삶은 계란을 다져 넣는다.",
    "국가암정보센터 체중감소 시 야채샐러드 삶은 계란 활용 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "부침 등에 물 대신 계란을 많이 사용한다.",
    "국가암정보센터 체중감소 시 부침 계란 활용 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "크래커나 빵을 요플레와 함께 먹는다.",
    "국가암정보센터 체중감소 시 크래커·빵 요플레 활용 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.",
    "국가암정보센터 체중감소 시 단백질 간식 활용 후보",
    "nccWeightChangeDiet",
  ],
  [
    "만두, 피자, 샌드위치, 계란샐러드, 카스테라 등",
    "국가암정보센터 체중감소 시 단백질 간식 예시 후보",
    "nccWeightChangeDiet",
  ],
  [
    "과일과 야채 그리고 곡류의 섭취를 증가시킵니다. 가능한 한 지방이 없는 부위의 육류제품과 저지방 우유 및 유제품을 이용합니다.",
    "국가암정보센터 체중증가 시 과일·야채·곡류 및 저지방 식품 선택 후보",
    "nccWeightChangeDiet",
  ],
  [
    "끓이고 찌는 형태의 요리방법을 이용합니다.",
    "국가암정보센터 체중증가 시 끓이고 찌는 조리방법 후보",
    "nccWeightChangeDiet",
  ],
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
    "영양이 풍부한 음식을 충분히 섭취합니다. 불충분한 열량과 영양소 섭취가 피로의 원인이 될 수 있기 때문입니다.",
    "국가암정보센터 피로감·우울 시 영양이 풍부한 음식과 충분한 섭취 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "하루 중 가장 좋은 시간에 가능한 많이 먹습니다.",
    "국가암정보센터 피로감·우울 시 하루 중 좋은 시간 식사 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "낮잠이나 휴식 후에 먹는 것이 더 편안함을 느낄 수 있습니다.",
    "국가암정보센터 피로감·우울 시 낮잠이나 휴식 후 식사 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "적은 양의 식사와 간식을 자주 먹습니다.",
    "국가암정보센터 피로감·우울 시 적은 양의 식사와 간식 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "가족이나 친구의 도움을 받도록 합니다.",
    "국가암정보센터 피로감·우울 시 가족·친구 식사 도움 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "주변의 이용 가능한 음식배달서비스를 알아두고 이용합니다.",
    "국가암정보센터 피로감·우울 시 음식배달서비스 이용 후보",
    "nccFatigueDepressionDiet",
  ],
  [
    "치료를 받지 않을 때에는 좋아하는 음식을 먹도록 합니다.",
    "국가암정보센터 피로감·우울 시 치료를 받지 않을 때 좋아하는 음식 후보",
    "nccFatigueDepressionDiet",
  ],
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
  [
    "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.",
    "국가암정보센터 식욕부진 시 먹을 수 있을 때 식사 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "평소에 좋아하던 음식을 먹거나, 음식 형태에 변화를 주어 메뉴를 다양하게 해서 먹습니다.",
    "국가암정보센터 식욕부진 시 좋아하는 음식·메뉴 다양화 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "몸의 상태가 가장 좋을 때 많이 먹도록 합니다. 일반적으로 충분한 휴식을 취한 아침이 가장 좋다고 합니다.",
    "국가암정보센터 식욕부진 시 몸 상태가 좋은 때 식사 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "식사하는 시간, 장소, 분위기를 바꾸어 봅니다. 음악을 들으며 식사를 하거나 식탁보나 식기를 바꾸어 보는 것도 좋습니다.",
    "국가암정보센터 식욕부진 시 식사 환경 변경 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "가벼운 산책 등 규칙적인 운동도 입맛을 증진시키는데 도움을 줄 수 있습니다.",
    "국가암정보센터 식욕부진 시 가벼운 산책·규칙적 운동 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "입맛을 돋우기 위해서 식사전후에 입안을 청결하게 합니다.",
    "국가암정보센터 식욕부진 시 식사 전후 입안 청결 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "주위 분들도 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고 환자 스스로 먹을 수 있게끔 도와줍니다.",
    "국가암정보센터 식욕부진 시 보호자 식사 지원 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "식사섭취가 계속적으로 힘들 경우에는 특수영양 보충음료를 이용합니다. (예) 그린비아, 뉴케어, 메디푸드, 엔슈어 등",
    "국가암정보센터 식욕부진 시 특수영양 보충음료 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "간식으로 죽, 미음, 쥬스, 스프, 우유 및 유제품 등을 활용하도록 합니다.",
    "국가암정보센터 식욕부진 시 간식·유동식 활용 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. (예) 과자, 빵, 과일, 우유 및 유제품, 두유, 치즈 등",
    "국가암정보센터 식욕부진 시 조금씩 자주 먹는 간식 후보",
    "nccAppetiteLossDiet",
  ],
  ["식욕부진 간식", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 죽", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 미음", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 쥬스", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 주스", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["식욕부진 스프", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  ["특수영양 보충음료", "국가암정보센터 식욕부진 시 가까이 두는 간식·유동식 후보", "nccAppetiteLossDiet"],
  [
    "가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다.",
    "국가암정보센터 입안 건조증 시 가까운 물과 잦은 소량 수분 섭취 후보",
    "nccDryMouthDiet",
  ],
  [
    "삼키기 쉽게 하기 위해 음식에 소스나 드레싱을 첨가하여 촉촉하게 합니다.",
    "국가암정보센터 입안 건조증 시 소스나 드레싱으로 촉촉한 음식 후보",
    "nccDryMouthDiet",
  ],
  [
    "음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹도록 합니다.",
    "국가암정보센터 입안 건조증 시 육수나 국물에 적셔 먹는 촉촉한 음식 후보",
    "nccDryMouthDiet",
  ],
  [
    "부드럽고 곱게 간 식품을 먹도록 합니다.",
    "국가암정보센터 입안 건조증 시 부드럽고 곱게 간 식품 후보",
    "nccDryMouthDiet",
  ],
  [
    "식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다.",
    "국가암정보센터 입안 건조증 시 식사 중간 수분 한 모금과 빨대 도움 후보",
    "nccDryMouthDiet",
  ],
  [
    "딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있습니다.",
    "국가암정보센터 입안 건조증 시 딱딱한 사탕과 껌을 통한 침 분비 도움 후보",
    "nccDryMouthDiet",
  ],
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
  [
    "술은 마시지 않는다.",
    "국가암정보센터 적정 체중과 체지방 유지 음주 제한 후보",
    "nccWeightMaintenanceDiet",
  ],
  ["술", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol", standaloneFoodTermOptions],
  ["알코올", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol"],
  ["소주", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol", standaloneFoodTermOptions],
  ["맥주", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol"],
  ["막걸리", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol"],
  ["와인", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol"],
  ["양주", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol", standaloneFoodTermOptions],
  ["고도주", "질병관리청 위험음주 표준잔·금주 권고 확인 후보", "kdcaAlcohol"],
  [
    "하루 한두 잔의 소량 음주도 피하기",
    "국립암센터 자궁경부암 조기 진단과 예방법 소량 음주 회피 생활수칙 후보",
    "nccCervicalEarlyDiagnosisPrevention",
  ],
  [
    "치료 후 가공육 제한",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "햄, 베이컨, 소시지 등의 가공육은 되도록 피합니다.",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "육류는 적정량 (탁구공 1~2개 크기)으로 살코기 위주로 섭취하며, 조리 시 직화구이를 피하고 탄 음식을 먹지 않습니다.",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 탄 음식 피하기",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 짠 음식 피하기",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "짠 음식의 섭취를 피하고, 싱겁게 먹습니다.",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "음식을 만들 때는 소금, 간장 등 짠맛이 나는 양념의 사용을 줄이고, 싱겁게 조리합니다.",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "국이나 찌개 섭취 시에는 건더기 위주로 섭취하며, 김치, 젓갈, 장아찌, 피클 등 염장 식품의 섭취를 줄입니다.",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "하루 한 두 잔의 술도 피합니다.",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "암 예방을 위해서 하루 한 두 잔의 술도 피하는 것이 좋습니다.",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 하루 한 두 잔 술도 피하기",
    "국가암정보센터 치료 후 가공육·탄 음식·짠 음식·음주 제한 후보",
    "nccAfterTreatmentHealthyEating",
  ],
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
  [
    "한꺼번에 식생활 습관을 바꾸는 것은 위험합니다. 다음의 내용을 숙지하면서 식생활 개선을 시작하세요.",
    "자궁경부암 실천지침 급격한 식생활 변경 주의 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "식생활을 한꺼번에 바꾸려고 하지 말고 내가 할 수 있는 것들을 확인하여 서서히 단계적으로 변화시킬 수 있는 계획표를 작성해 보십시오.",
    "자궁경부암 실천지침 단계적 식생활 개선 계획 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "기본원칙 : 다채로운 식단으로 균형 잡힌 식사 / 채소, 과일을 충분히 섭취 / 짠 음식 및 탄 음식 섭취 제한",
    "자궁경부암 실천지침 식단 기본원칙 제한 포함 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "햄구이 → 과일샐러드 : 육가공식품(훈제식품) 섭취량 감소, 과일 섭취량 증가",
    "자궁경부암 실천지침 햄구이 대체로 육가공식품 감소·과일 증가 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "초코칩쿠키 → 귤 : 과일 섭취량 증가",
    "자궁경부암 실천지침 초코칩쿠키 대체로 과일 증가 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "단무지 → 채소샐러드, 브로콜리회 : 채소 섭취량 증가(채소샐러드는 요플레드레싱 사용)",
    "자궁경부암 실천지침 단무지 대체로 채소 증가 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "가능한 지방 함량이 높은 식품이나 짠 음식 섭취를 줄이겠다는 생각을 가지며, 신선한 채소와 과일, 곡류 등을 자주 드시기 바랍니다.",
    "자궁경부암 실천지침 지방·짠 음식 줄이기와 신선식품 섭취 계획 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "가능한 제철 과일, 채소를 구입하십시오. 곰팡이 핀 음식은 피하시기 바랍니다.",
    "자궁경부암 실천지침 제철 과일·채소 구입과 곰팡이 핀 음식 피하기 후보",
    "nccCervicalPracticeDiet",
  ],
  ["흰쌀밥", "자궁경부암 실천지침 식이섬유 증가 대체 전 예시", "nccCervicalPracticeDiet"],
  ["쌀밥", "자궁경부암 실천지침 식이섬유 증가 대체 전 예시", "nccCervicalPracticeDiet", standaloneFoodTermOptions],
  ["총각김치", "자궁경부암 실천지침 식단 김치 저염 확인 후보", "nccCervicalPracticeDiet"],
  [
    "열무김치",
    "자궁경부암 실천지침 식단 김치 저염 확인 후보",
    "nccCervicalPracticeDiet",
    cervicalPracticeContextTermOptions,
  ],
  [
    "배추김치",
    "자궁경부암 실천지침 식단 김치 저염 확인 후보",
    "nccCervicalPracticeDiet",
    cervicalPracticeContextTermOptions,
  ],
  ["햄구이", "자궁경부암 실천지침 식단 제한 예시", "nccCervicalPracticeDiet"],
  [
    "과일과 채소의 섭취가 적은 식이",
    "국가암정보센터 자궁경부암 위험요인 채소·과일 섭취 부족 확인 후보",
    "nccCervicalRiskFactors",
  ],
  [
    "과일 채소 섭취 부족",
    "국가암정보센터 자궁경부암 위험요인 채소·과일 섭취 부족 확인 후보",
    "nccCervicalRiskFactors",
  ],
  [
    "채소와 과일을 거의 안 먹음",
    "국가암정보센터 자궁경부암 위험요인 채소·과일 섭취 부족 확인 후보",
    "nccCervicalRiskFactors",
  ],
  [
    "자궁경부암의 예방 가능성이 있는 음식으로 카로테노이드(carotenoid), 비타민 A, 비타민 C, 비타민 E 등이 거론되나 아직 그 효과에 대해서는 명확하지 않은 상태입니다.",
    "자궁경부암 카로테노이드·비타민 예방 효과 불명확성 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "채소와 과일을 충분히 섭취합니다. 영양성분 중 비타민 C, 비타민 E, 엽산, 비타민 B12, 카로티노이드 섭취는 자궁경부암을 예방한다고 알려져 있습니다. 이들 영양성분을 충분히 함유하고 있는 채소와 과일을 섭취하면 자궁경부암을 예방할 수 있습니다.",
    "자궁경부암 실천지침 비타민 B12·카로티노이드 채소과일 예방문구 확인 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "1980년대에 이루어진 일부 연구결과에 의하면 카로테노이드를 많이 섭취하면 침윤성 자궁경부암의 빈도가 1/2에서 1/5까지도 줄어들고 베타카로틴의 혈중 농도가 낮을수록 자궁경부암 및 자궁경부 상피내암 등의 빈도가 높아진다는 보고도 있었습니다.",
    "자궁경부암 카로테노이드 관찰연구·불확실성 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "그러나 이러한 연구 결과들이 항상 일치하는 것이 아니어서 현재 미국암연구협회(American Institute for Cancer Research)에서는 “카로테노이드의 다량의 섭취가 자궁경부암의 위험도를 줄일 가능성이 있다”라고 결론을 내렸습니다.",
    "자궁경부암 카로테노이드 위험도 감소 가능성·불확실성 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "비타민 C의 섭취가 많은 집단의 자궁경부암 발생 빈도가 20~50 %까지 감소한다는 연구 결과가 나온 바 있습니다. 그러나 이후 연구에서 항상 예방 효과가 명확히 보도된 것은 아니었기 때문에 현재 미국암연구협회(American Institute for Cancer Research)에서는 “비타민 C의 다량의 섭취가 자궁경부암의 위험도를 줄일 가능성이 있다”라고 결론을 내렸습니다.",
    "자궁경부암 비타민 C 위험도 감소 가능성·불확실성 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "일부 연구에서 비타민 E의 섭취가 많거나 혈중 농도가 높을수록 자궁경부암의 위험도가 낮은 경향을 보이기는 했지만 아직 확실히 결론을 내린 것은 아닙니다. 그러나 혈중 비타민 E의 농도가 자궁경부이형성증(정상조직과 암조직의 중간과정)의 정도가 심할수록 낮았다는 보고가 있으므로 자궁경부암의 예방 효과가 있을 가능성은 존재합니다.",
    "자궁경부암 비타민 E 예방 가능성·불확실성 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "그 밖에 레티놀(retinol)과 엽산(folate)도 자궁경부암의 예방과 관련한 연구를 진행했으나 자궁경부암과의 관련성이나 자궁경부암의 위험도를 줄일 가능성은 없는 것으로 나타났습니다.",
    "자궁경부암 레티놀·엽산 예방 관련성 없음 확인 후보",
    "nccCervicalFoodPrevention",
  ],
  [
    "채식위주의 균형 잡힌 식사를 하고, 흡연욕구를 일으키는 카페인이나 알코올의 섭취를 줄일 수 있도록 평소 마시던 음료를 커피나 청량음료에서 따뜻한 차 등으로 바꾸기",
    "자궁경부암 실천지침 금연 보조 카페인·알코올 음료 대체 후보",
    "nccCervicalPracticeDiet",
  ],
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
  [
    "과자나 탄산음료",
    "국가암정보센터 식이 실천지침 대체 대상 간식 확인 후보",
    "nccDietPracticeFiber",
  ],
  ["탄산음료", "당음료", "kdcaNutrition"],
  ["설탕음료", "당음료", "kdcaNutrition"],
  ["가당음료", "당음료", "kdcaNutrition"],
  [
    "피해야 할 음식: 알코올, 카페인 함유 제품, 우유 및 유제품, 고지방식, 고섬유식, 과일 주스, 매운 음식 등 입니다.",
    "국가암정보센터 항암 부작용 설사 시 알코올·카페인·고지방·고섬유 식품 피하기 후보",
    "nccChemoSideEffectGuide",
  ],
  ["초코칩쿠키", "자궁경부암 실천지침 식단 제한 예시", "nccCervicalPracticeDiet"],
  ["가당 제품", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  ["가당 유제품", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  ["가당 요구르트", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  ["가당 요거트", "국가암정보센터 암예방 샐러드 가당 유제품 제한 예시", "nccPreventionMealExamples"],
  [
    "방사선 치료나 항암화학요법 중에는 장기능이 약해질 가능성이 있으므로 되도록 자극적인 음식은 피합니다.",
    "자궁경부암 방사선·항암치료 중 자극적 음식 피하기 확인 후보",
    "nccCervicalDiet",
  ],
  [
    "맵고 짠 자극적인 음식이나 지방이 많은 느끼한 음식, 육식은 가급적 피하기",
    "자궁경부암 실천지침 금연 식이요법 자극적·지방 많은 음식 제한 후보",
    "nccCervicalPracticeDiet",
  ],
  [
    "과식은 피하고 평소 섭취하는 열량의 80% 정도만 섭취하고, 금연을 위한 간식으로 당근, 오이, 다시마, 무가당 껌, 은단 등을 준비하기",
    "자궁경부암 실천지침 금연 간식·과식 제한 준비 후보",
    "nccCervicalPracticeDiet",
  ],
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
  [
    "기름진 음식과 단 음식은 피하고, 가능한 싱겁게 먹는다.",
    "국가암정보센터 적정 체중과 체지방 유지 식사조절 후보",
    "nccWeightMaintenanceDiet",
  ],
  [
    "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다.",
    "국가암정보센터 식욕부진 시 식사 중 수분 조절 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다.",
    "국가암정보센터 식욕부진 시 많은 양의 물 섭취 시간 조절 후보",
    "nccAppetiteLossDiet",
  ],
  [
    "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다. 특정 음식에 대해 메스꺼움이 심할 때에도 억지로 먹지 않도록 합니다. 대신 먹기 좋은 다른 음식을 많이 먹도록 합니다.",
    "국가암정보센터 메스꺼움 시 특정 음식 억지 섭취 피하고 대체 음식 선택 후보",
    "nccNauseaDiet",
  ],
  [
    "물을 마시는 것은 포만감을 느끼게 할 수 있기 때문에 식사를 할 때는 너무 많은 국물이나 음료는 피하도록 합니다.",
    "국가암정보센터 메스꺼움·구토 시 식사 중 과다 국물·음료 회피 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "메스꺼움을 느낄 때는 좋아하는 음식도 먹지 않게 되며, 그 음식을 영원히 싫어하게 될 수도 있습니다.",
    "국가암정보센터 메스꺼움·구토 시 메스꺼움 중 좋아하는 음식 혐오화 주의 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "식사전후 물과 음료수를 많이 마시지 않습니다. 마른 음식을 먹습니다.",
    "국가암정보센터 메스꺼움·구토 시 식사전후 과다 물·음료 피하고 마른 음식 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "구토가 멈출 때까지는 음료나 음식을 먹지 않도록 합니다.",
    "국가암정보센터 메스꺼움·구토 시 구토가 멈출 때까지 음식·음료 피하기 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "구토 후 1~2시간 정도의 시간이 경과한 후에 수분 섭취를 하도록 합니다. 탄산음료는 되도록 피하고 물을 섭취하는 것이 좋습니다.",
    "국가암정보센터 메스꺼움·구토 후 1~2시간 뒤 물 섭취와 탄산음료 피하기 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "기름진 음식, 튀긴 음식, 짜고 매운 음식, 지나치게 단 음식은 피합니다.",
    "국가암정보센터 메스꺼움·구토 시 기름진·튀긴·짜고 매운·지나치게 단 음식 회피 후보",
    "nccNauseaVomitingCare",
  ],
  [
    "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다.",
    "국가암정보센터 메스꺼움 시 억지 섭취 피하기 후보",
    "nccNauseaDiet",
  ],
  [
    "구토증상이 있는 경우 먹거나 마시지 않도록 합니다. 구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.",
    "국가암정보센터 구토 중 섭취 중단 후 맑은 유동식 단계적 증량 확인 후보",
    "nccVomitingDiet",
  ],
  [
    "구토증상이 있는 경우 먹거나 마시지 않도록 합니다.",
    "국가암정보센터 구토 중 먹거나 마시지 않기 확인 후보",
    "nccVomitingDiet",
  ],
  [
    "항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다.",
    "국가암정보센터 메스꺼움 시 치료 전 식사 피하기 후보",
    "nccNauseaDiet",
  ],
  [
    "다음 음식들은 메스꺼움을 더욱 유발할 수 있으므로 피하도록 합니다.",
    "국가암정보센터 메스꺼움 유발 가능 음식 제한 확인 후보",
    "nccNauseaDiet",
  ],
  ["기름진 음식", "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보", "nccNauseaDiet"],
  [
    "사탕, 쿠키 또는 케익 등과 같이 매우 단 음식",
    "국가암정보센터 메스꺼움 유발 가능 매우 단 음식 확인 후보",
    "nccNauseaDiet",
  ],
  ["매우 단 음식", "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보", "nccNauseaDiet"],
  [
    "향이 강하거나 뜨거운 음식",
    "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보",
    "nccNauseaDiet",
  ],
  [
    "이상한 냄새가 나는 음식 등",
    "국가암정보센터 메스꺼움 유발 가능 이상한 냄새 음식 확인 후보",
    "nccNauseaDiet",
  ],
  [
    "이상한 냄새가 나는 음식",
    "국가암정보센터 메스꺼움 유발 가능 음식 확인 후보",
    "nccNauseaDiet",
  ],
  [
    "오렌지, 포도, 레몬, 토마토주스",
    "국가암정보센터 입과 목 통증 시 입안 자극 과일·토마토주스 확인 후보",
    "nccMouthPainDiet",
  ],
  [
    "향신료를 많이 사용하거나 소금에 절인 음식",
    "국가암정보센터 입과 목 통증 시 향신료·소금절임 입안 자극 음식 확인 후보",
    "nccMouthPainDiet",
  ],
  [
    "토스트, 크래커 또는 말린 음식 등",
    "국가암정보센터 입과 목 통증 시 토스트·크래커·말린 음식 입안 자극 음식 확인 후보",
    "nccMouthPainDiet",
  ],
  ["토마토주스", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  [
    "입안을 자극하는 음식이나 음료는 피하도록 합니다.",
    "국가암정보센터 입과 목 통증 시 입안 자극 음식·음료 확인 후보",
    "nccMouthPainDiet",
  ],
  [
    "아주 달거나 신음식을 먹으면 침분비가 많아집니다. 단, 입안이 헐거나 목구멍이 아플 경우에는 피하도록 합니다.",
    "국가암정보센터 입안 건조증 시 단맛·신맛 침 분비와 구강·목 통증 시 회피 확인 후보",
    "nccDryMouthDiet",
  ],
  [
    "뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다.",
    "국가암정보센터 입과 목 통증 시 뜨거운 음식 자극과 상온 음식 확인 후보",
    "nccMouthPainDiet",
  ],
  [
    "거칠거나 날 음식, 짠 음식, 산성 및 양념이 강한 음식물과 같이 자극되는 음식물은 피하고 견딜만한 양만 먹도록 한다.",
    "국가암정보센터 구내염 시 거칠거나 날 음식·짠 음식·산성 및 강한 양념 음식 제한 후보",
    "nccMucositisCare",
  ],
  [
    "부드러운 음식을 섭취하고 맵거나 거친 자극적인 음식을 피합니다.",
    "국가암정보센터 구내염 시 부드러운 음식 섭취와 맵거나 거친 자극 음식 제한 후보",
    "nccMucositisCare",
  ],
  [
    "뜨겁거나 거친 음식, 양념이 많거나 신 음식, 먹기 힘든 음식의 섭취를 피합니다.",
    "국가암정보센터 구내염 시 뜨겁거나 거친 음식·강한 양념·신 음식 제한 후보",
    "nccMucositisCare",
  ],
  [
    "자극성 있는 양념이나 딱딱하고 거친 음식은 제한하는 것이 좋습니다.",
    "국가암정보센터 구내염 예방관리 시 자극성 양념·딱딱하고 거친 음식 제한 후보",
    "nccMucositisCare",
  ],
  ["토스트", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  ["크래커", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  ["말린 음식", "국가암정보센터 입과 목 통증 시 입안 자극 음식 확인 후보", "nccMouthPainDiet"],
  [
    "너무 뜨겁거나 차가운 식품이나 음료는 피하고, 대신 상온의 음료를 마시도록 합니다.",
    "국가암정보센터 설사 시 너무 뜨겁거나 차가운 식품·음료 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "커피와 초콜릿 등과 같은 카페인을 함유한 식품과 음료는 제한합니다.",
    "국가암정보센터 설사 시 카페인 식품·음료 제한 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "우유 및 유제품을 먹을 때에는 주의합니다. 이는 우유에 들어있는 유당이 설사를 악화시킬 수 있기 때문입니다. 그러나 일반적으로 적은 양의 우유나 유제품은 소화시킬 수 있습니다.",
    "국가암정보센터 설사 시 우유·유제품 유당 주의 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "브로콜리, 옥수수, 말린 콩 등과 같은 고섬유 채소 등",
    "국가암정보센터 설사 시 고섬유 채소 제한 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "생과일의 껍질, 씨, 끈적한 섬유소 부분",
    "국가암정보센터 설사 시 생과일 껍질·씨·끈적한 섬유소 제한 확인 후보",
    "nccDiarrheaDiet",
  ],
  [
    "기름진 음식, 생야채",
    "국가암정보센터 설사 시 기름진 음식·생야채 제한 확인 후보",
    "nccDiarrheaDiet",
  ],
  ["설사 생야채", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 생과일 껍질", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 브로콜리", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 옥수수", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 말린 콩", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 커피", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 초콜릿", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  ["설사 우유 및 유제품", "국가암정보센터 설사 시 장 자극·고섬유·유당·카페인 확인 후보", "nccDiarrheaDiet"],
  [
    "소금이 우리 몸에서 수분을 축적시키는 작용을 하므로 염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등)은 제한하고 가능한 싱겁게 먹는 것이 좋습니다.",
    "국가암정보센터 체중증가 시 고염분 식품 제한 후보",
    "nccWeightChangeDiet",
  ],
  [
    "반면, 식욕이 증가된 경우에는 열량이 높고 영양가가 없는 식품들(예: 청량 음료, 초콜릿, 사탕, 과자류 등)은 제한하도록 합니다.",
    "국가암정보센터 체중증가 시 식욕증가 고열량 저영양 식품 제한 후보",
    "nccWeightChangeDiet",
  ],
  ["체중증가 가공식품", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 김치", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 젓갈", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 장아찌류", "국가암정보센터 체중증가 시 고염분 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 청량 음료", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 초콜릿", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 사탕", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 과자류", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  ["체중증가 고열량 간식", "국가암정보센터 체중증가 시 고열량 저영양 식품 확인 후보", "nccWeightChangeDiet"],
  [
    "버터, 마요네즈, 감미료 등을 추가로 사용하지 않도록 합니다.",
    "국가암정보센터 체중증가 시 버터·마요네즈·감미료 추가 사용 제한 후보",
    "nccWeightChangeDiet",
  ],
  [
    "가능한 고열량의 간식은 먹지 않도록 합니다.",
    "국가암정보센터 체중증가 시 고열량 간식 제한 후보",
    "nccWeightChangeDiet",
  ],
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
  [
    "국 또는 찌개의 국물은 다 드시지 마십시오.",
    "자궁경부암 실천지침 국·찌개 국물 남기기 예시",
    "nccCervicalPracticeDiet",
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
  [
    "또한 항암화학요법을 받는 중에는 민간요법이나 건강보조식품은 삼갑니다.",
    "자궁경부암 항암화학요법 중 민간요법·건강보조식품 피하기 확인 후보",
    "nccCervicalDiet",
  ],
  [
    "민간요법이나 건강보조식품은 과학적으로 효능이 확인되지 않았으며 병원에서 투여하는 약제와 예상할 수 없는 상호작용으로 치료효과가 떨어지거나 부작용이 커질 수도 있기 때문입니다.",
    "자궁경부암 민간요법·건강보조식품 약제 상호작용 확인 후보",
    "nccCervicalDiet",
  ],
  [
    "충분한 영양 섭취를 위해서는 잘 먹는 것이 중요한데, 우선 환자가 평소에 좋아했던 음식이나 먹고 싶어하던 음식을 제공하고, 통증 으로 식욕을 잃었다면 식사 전에 먼저 진통제 를 복용합니다. 음식은 항상 손이 쉽게 갈 수 있는 곳에 두고 식욕을 느낄 때마다 먹습니다.",
    "자궁경부암 통증·식욕저하 식사 전 약 복용 진료팀 확인 후보",
    "nccCervicalDiet",
  ],
  [
    "여러분의 약초나 영양제 복용 사실을 여러분을 돌보고 있는 의료진에게 알리는 것은 부작용 의 위험을 최소화할 수 있는 하나의 방법입니다.",
    "국가암정보센터 보완대체요법 약초·영양제 복용 사실 의료진 공유 후보",
    "nccComplementaryTherapy",
  ],
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
    "암을 치유하는 특별한 음식이나 영양소는 없습니다.",
    "국가암정보센터 치료 중 특별식품·특별영양소 cure claim 확인 필요",
    "nccTreatmentRightEating",
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
  [
    "몸에 좋다고 소문난 식품",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "몸에 좋다고 소문난 영양소",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "암환자에게 식생활이 중요하다는 것은 누구나 압니다. 그러나 대부분의 사람들은 몸에 좋다고 소문난 식품이나 영양소에만 관심을 기울이고, 적정 열량(칼로리)과 필수 영양소의 섭취는 제대로 고려하지 않는 수가 많습니다.",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "특정 식품이나 영양소 편중",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "백혈구 수치를 올리는 특별한 음식은 없습니다. 이 수치는 시간이 지나면 자연히 회복됩니다.",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.",
    "국가암정보센터 메스꺼움 항구토제 사용 의료진 상담 후보",
    "nccNauseaDiet",
  ],
  [
    "백혈구 수치를 올리는 특별한 음식은 없습니다",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "백혈구 수치를 올리는 특별한 음식",
    "국가암정보센터 치료 중 소문난 식품·백혈구 특효 음식 확인 필요",
    "nccTreatmentRightEating",
  ],
  [
    "음식을 들기가 전반적으로 힘들고 면역력까지 저하된 경우에는 개별적으로 영양 상담을 받아야 합니다.",
    "국가암정보센터 치료 중 의료진·영양사 식사 상담 필요",
    "nccTreatmentRightEating",
  ],
  [
    "암환자의 식사와 관련하여 고민이 있다면 의료진, 영양사와 상담하십시오. 적절한 영양 섭취에 관해 상담을 해드릴 것입니다.",
    "국가암정보센터 치료 중 의료진·영양사 식사 상담 필요",
    "nccTreatmentRightEating",
  ],
  [
    "치료 중 식사 고민 의료진 영양사 상담",
    "국가암정보센터 치료 중 의료진·영양사 식사 상담 필요",
    "nccTreatmentRightEating",
  ],
  [
    "만약 입안통증이나 잇몸에 염증이 있는 경우 의사선생님을 방문하여 항암치료 의 부작용 때문인지 치과질환인지 알아보도록 합니다.",
    "국가암정보센터 입과 목 통증 시 입안통증·잇몸 염증 의료진 방문 확인 필요",
    "nccMouthPainDiet",
  ],
  [
    "치아와 잇몸이 아프면 치과치료를 받도록 합니다.",
    "국가암정보센터 입과 목 통증 시 치아·잇몸 통증 치과치료 확인 필요",
    "nccMouthPainDiet",
  ],
  [
    "그러나 옥살로플라틴(Oxaliplatin) 등과 같은 말초신경염을 유발할 수 있는 항암제 를 투여 받는 경우는 온도변화에 민감하여 통증을 유발할 수 있으므로 차가운 음식은 피하도록 합니다.",
    "국가암정보센터 입과 목 통증 시 옥살로플라틴 온도 민감성 차가운 음식 회피 확인 필요",
    "nccMouthPainDiet",
  ],
  [
    "그러나 문제가 심각하면 의사선생님이나 치과선생님과 상의합니다.",
    "국가암정보센터 입안 건조증 심각 시 의료진·치과 상담 확인 필요",
    "nccDryMouthDiet",
  ],
  [
    "음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고, 입안을 자주 헹구도록 합니다.",
    "국가암정보센터 입맛 변화 시 치과 문제 확인·입안 자주 헹굼 필요",
    "nccTasteChangeDiet",
  ],
  [
    "만일 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요합니다.",
    "국가암정보센터 피로감·우울 시 피로 원인 의료진 상담 필요",
    "nccFatigueDepressionDiet",
  ],
  [
    "메스꺼움이 언제, 무엇 때문에 나타나는지를 체크하고 의사선생님이나 간호사와 상의합니다.",
    "국가암정보센터 메스꺼움 유발 요인 기록·의료진 상담 필요",
    "nccNauseaDiet",
  ],
  [
    "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.",
    "국가암정보센터 구토 1~2일 이상 지속 의료진 상담 필요",
    "nccVomitingDiet",
  ],
  [
    "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.",
    "국가암정보센터 메스꺼움·구토 지속 시 수분·전해질 유지와 체액 주사 의료진 도움 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때",
    "국가암정보센터 메스꺼움·구토 시 하루 4컵 이하 섭취·2일 이상 식사 어려움·반복 구토 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "구토 후 목에 음식물이 걸린 느낌과 기침이 계속되는 경우",
    "국가암정보센터 메스꺼움·구토 후 목 음식물 걸림 느낌·기침 지속 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우",
    "국가암정보센터 메스꺼움·구토 12시간 이상 지속 또는 한 시간 3번 이상 구토 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "오심이 며칠이상 지속되거나 오심 때문에 당신이 중요한 일을 하지 못할 때",
    "국가암정보센터 오심 며칠 이상 지속 또는 중요한 일 수행 어려움 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "참지 못하는 구토가 멀리까지 분출되는 경우",
    "국가암정보센터 참기 어려운 구토가 멀리까지 분출되는 경우 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "심하게 힘이 없거나 현기증이 있을 경우",
    "국가암정보센터 심한 무력감 또는 현기증 발생 시 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "수차례 구토를 하고, 소변의 색이 진한 노란색이고 평상시의 소변 횟수만큼 화장실에 가지 못할 때",
    "국가암정보센터 수차례 구토와 진한 노란 소변·소변 횟수 감소 시 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "구토가 지속되고 머리가 띵하거나 어지럽거나, 혼란한 느낌이 들 때",
    "국가암정보센터 구토 지속과 머리 띵함·어지러움·혼란감 시 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "구토물이 커피색일 때 (혈액일 수 있음)",
    "국가암정보센터 구토물이 커피색일 때 혈액 가능성 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "의사가 처방한 진토제를 복용했는데도 오심 구토가 계속될 때",
    "국가암정보센터 처방 진토제 복용 후 오심·구토 지속 시 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "진토제 복용한 후 부작용 이 발생했을 때",
    "국가암정보센터 진토제 복용 후 부작용 발생 시 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "심한 초심이나 구토 때문에 약을 먹을 수 없을 때, 또는 온종일 물을 제대로 마시지 못하거나 식사를 하지 못한 경우",
    "국가암정보센터 심한 오심·구토로 약 복용 불가 또는 종일 수분·식사 어려움 시 의료진 상담 필요",
    "nccNauseaVomitingCare",
  ],
  [
    "설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다.",
    "국가암정보센터 설사 심함·혈변·2일 이상 지속 의료진 상담 필요",
    "nccDiarrheaDiet",
  ],
  [
    "계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 합니다.",
    "국가암정보센터 변비 지속·조절 어려움 의료진 상담 필요",
    "nccConstipationDiet",
  ],
  [
    "단, 식사조절과 운동으로 적정 체중 유지가 어렵거나 고혈압, 당뇨병, 고지혈증 등 만성질환이 있는 경우 담당의사 및 임상영양사의 상담을 받도록 합니다.",
    "국가암정보센터 적정 체중과 체지방 유지 만성질환·체중유지 상담 필요",
    "nccWeightMaintenanceDiet",
  ],
  [
    "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다.",
    "국가암정보센터 체중증가 시 원인 확인 의료진 상담 필요",
    "nccWeightChangeDiet",
  ],
  [
    "어떤 특정 식품이나 음식에 의해 암의 재발을 막는다는 연구보고는 없습니다.",
    "국가암정보센터 치료 후 재발 예방 특정식품 근거 없음",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "비브리오 패혈증",
    "질병관리청 비브리오 패혈증 고위험군·어패류 생식 확인 필요",
    "kdcaVibrioSepsis",
  ],
  [
    "날것이나 덜 익힌 어패류",
    "질병관리청 비브리오 패혈증 날것·덜 익힌 어패류 감염위험 확인 필요",
    "kdcaVibrioSepsis",
  ],
  [
    "오염된 어패류를 날 것으로 먹거나",
    "질병관리청 비브리오 패혈증 오염 어패류 생식 감염위험 확인 필요",
    "kdcaVibrioSepsis",
  ],
  [
    "항암제 치료 중 어패류 생식",
    "질병관리청 비브리오 패혈증 항암제 치료 중 고위험군 어패류 생식 확인 필요",
    "kdcaVibrioSepsis",
  ],
  [
    "면역저하 환자 어패류 생식",
    "질병관리청 비브리오 패혈증 면역저하 고위험군 어패류 생식 확인 필요",
    "kdcaVibrioSepsis",
  ],
  [
    "피부에 상처가 있는 사람은 바닷물과 접촉하지 않도록",
    "질병관리청 비브리오 패혈증 피부 상처 바닷물 접촉 확인 필요",
    "kdcaVibrioSepsis",
  ],
  [
    "시중에 암 예방 효과가 있다고 알려진 여러 식품들이나 건강 보조식품들은 아직 안정성이나 효과에 대해 과학적으로 입증된 근거가 없으므로 선택 시 주의가 필요합니다.",
    "국가암정보센터 치료 후 건강보조식품 과학적 근거 주의",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "단, 암 치료가 끝난 후 부작용 등으로 적절한 식사 섭취가 힘들거나 고혈압, 당뇨병, 고지혈증 등으로 식사조절이 필요한 경우 담당의사 및 임상영양사의 상담을 받도록 합니다.",
    "국가암정보센터 치료 후 식사 어려움·보조식품 상담 필요",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 부작용으로 식사 섭취 힘듦",
    "국가암정보센터 치료 후 식사 어려움·보조식품 상담 필요",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "치료 후 건강보조식품 민간요법 주의",
    "국가암정보센터 치료 후 식사 어려움·보조식품 상담 필요",
    "nccAfterTreatmentHealthyEating",
  ],
  [
    "육회, 생선회, 생조개, 초밥 등 익히지 않은 음식은 드시지 않습니다",
    "면역저하 시 익히지 않은 음식 주의",
    "nccImmuneLowDiet",
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
  [
    "가는 과정에서 고기의 표면적이 넓어져 세균 등에 오염될 가능성이 커지기 때문입니다",
    "면역저하 시 갈아둔 고기 오염 가능성 확인",
    "nccImmuneLowDiet",
  ],
  ["가는 과정에서 오염 가능", "면역저하 시 갈아둔 고기 오염 가능성 확인", "nccImmuneLowDiet"],
  ["날달걀", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["날계란", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  [
    "날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다",
    "면역저하 시 날계란·덜 익힌 계란이 들어간 음식 주의",
    "nccImmuneLowDiet",
  ],
  [
    "날계란이나 덜 익힌 계란이 들어간 음식",
    "면역저하 시 날계란·덜 익힌 계란이 들어간 음식 주의",
    "nccImmuneLowDiet",
  ],
  ["날계란 들어간 음식", "면역저하 시 날계란·덜 익힌 계란이 들어간 음식 주의", "nccImmuneLowDiet"],
  [
    "덜 익힌 계란이 들어간 음식",
    "면역저하 시 날계란·덜 익힌 계란이 들어간 음식 주의",
    "nccImmuneLowDiet",
  ],
  ["덜 익힌 계란", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["덜익힌 계란", "면역저하 시 날계란·덜 익힌 계란 주의", "nccImmuneLowDiet"],
  ["덜 익힌 고기", "면역저하 시 고기·생선은 완전히 익힘 확인", "nccImmuneLowDiet"],
  ["덜익힌 고기", "면역저하 시 고기·생선은 완전히 익힘 확인", "nccImmuneLowDiet"],
  ["생고기", "면역저하 시 고기·생선은 완전히 익힘 확인", "nccImmuneLowDiet"],
  [
    "상온에 오랜시간 방치",
    "식약처 식중독 예방 조리 후 상온 방치·2시간 초과 확인 필요",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "조리후 2시간 초과",
    "식약처 식중독 예방 조리 후 상온 방치·2시간 초과 확인 필요",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "조리 후 2시간 초과",
    "식약처 식중독 예방 조리 후 상온 방치·2시간 초과 확인 필요",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "상온에 오래 방치",
    "식약처 식중독 예방 조리 후 상온 방치·2시간 초과 확인 필요",
    "mfdsFoodPoisoningPrevention",
  ],
  [
    "살모넬라 식중독",
    "식약처 살모넬라 달걀 조리식품 식중독 확인 필요",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "생달걀을 만진 손을 씻지 않고 다른 음식 조리",
    "식약처 살모넬라 생달걀 취급 후 손씻기 누락 교차오염 확인 필요",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "가열 전 달걀물이 묻은 집게를 조리 완제품에도 혼용 사용",
    "식약처 살모넬라 달걀물 묻은 집게 완제품 혼용 확인 필요",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "충분히 익지 않은 육전",
    "식약처 살모넬라 달걀 조리식품 불충분 가열 확인 필요",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "남은 달걀물의 재사용",
    "식약처 살모넬라 남은 달걀물 재사용 확인 필요",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "달걀물을 상온에서 장시간 보관",
    "식약처 살모넬라 달걀물 상온 장시간 보관 확인 필요",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "조리 후 작업공간 세척·소독 미실시",
    "식약처 살모넬라 조리 후 작업공간 세척·소독 누락 확인 필요",
    "mfdsSalmonellaEggSafety",
  ],
  [
    "살모넬라균",
    "식품안전나라 살모넬라균 식중독 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "2~3×0.6um 의 포자를 형성하지 않는 그람음성 간균",
    "식품안전나라 살모넬라균 무아포성 그람음성 간균 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "60℃에서 20분 동안 가열 하면 사멸",
    "식품안전나라 살모넬라균 60℃ 20분 가열 사멸 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "균이 생체 내로 침입되면 장내에서 분열·증식되어 독소가 생산",
    "식품안전나라 살모넬라균 장내 증식·독소 생산 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "부적절하게 가열한 동물성 단백질식품(우유, 유제품, 고기와 그 가공품, 가금류의 알과 그 가공품, 어패류와 그 가공품)",
    "식품안전나라 살모넬라균 부적절 가열 동물성 단백질식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "보균자의 손, 발 등 2차 오염에 의한 오염식품",
    "식품안전나라 살모넬라균 보균자 손발 2차 오염 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 우유",
    "식품안전나라 살모넬라균 우유 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 유제품",
    "식품안전나라 살모넬라균 유제품 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 고기",
    "식품안전나라 살모넬라균 고기 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 고기 가공품",
    "식품안전나라 살모넬라균 고기 가공품 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 가금류 알",
    "식품안전나라 살모넬라균 가금류 알 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 가금류 알 가공품",
    "식품안전나라 살모넬라균 가금류 알 가공품 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 어패류",
    "식품안전나라 살모넬라균 어패류 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 어패류 가공품",
    "식품안전나라 살모넬라균 어패류 가공품 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 식물성 단백질식품",
    "식품안전나라 살모넬라균 식물성 단백질식품 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 채소 복합조리식품",
    "식품안전나라 살모넬라균 채소 등 복합조리식품 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 생선묵",
    "식품안전나라 살모넬라균 생선묵 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 생선요리",
    "식품안전나라 살모넬라균 생선요리 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 면류",
    "식품안전나라 살모넬라균 면류 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 야채",
    "식품안전나라 살모넬라균 야채 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 샐러드",
    "식품안전나라 살모넬라균 샐러드 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 마요네즈",
    "식품안전나라 살모넬라균 마요네즈 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "살모넬라 도시락",
    "식품안전나라 살모넬라균 도시락 등 복합조리식품 원인식품 확인 필요",
    "foodSafetyKoreaSalmonellaFoodPoisoning",
  ],
  [
    "황색포도상구균",
    "식품안전나라 황색포도상구균 식중독 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "장독소(enterotoxin)",
    "식품안전나라 황색포도상구균 장독소 독소형 식중독 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "코 안이나 피부에 상재",
    "식품안전나라 황색포도상구균 피부·비강 보균 오염 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "손에 창상 또는 화농",
    "식품안전나라 황색포도상구균 식품취급자 손 창상·화농 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "신체 다른 부위에 화농",
    "식품안전나라 황색포도상구균 식품취급자 신체 화농 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "육류 및 그 가공품과 우유, 크림, 버터, 치즈",
    "식품안전나라 황색포도상구균 육류·유제품 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "밥, 김밥, 도시락, 두부",
    "식품안전나라 황색포도상구균 밥·김밥·도시락·두부 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 육류",
    "식품안전나라 황색포도상구균 육류 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 육류 가공품",
    "식품안전나라 황색포도상구균 육류 가공품 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 우유",
    "식품안전나라 황색포도상구균 우유 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 밥",
    "식품안전나라 황색포도상구균 밥 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 김밥",
    "식품안전나라 황색포도상구균 김밥 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 도시락",
    "식품안전나라 황색포도상구균 도시락 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 두부",
    "식품안전나라 황색포도상구균 두부 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 과자류",
    "식품안전나라 황색포도상구균 과자류 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 유제품",
    "식품안전나라 황색포도상구균 유제품 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 크림",
    "식품안전나라 황색포도상구균 크림 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 버터",
    "식품안전나라 황색포도상구균 버터 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 치즈",
    "식품안전나라 황색포도상구균 치즈 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 복합조리식품",
    "식품안전나라 황색포도상구균 복합조리식품 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 소스",
    "식품안전나라 황색포도상구균 소스 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "황색포도상구균 어육 연제품",
    "식품안전나라 황색포도상구균 어육 연제품 원인식품 확인 필요",
    "foodSafetyKoreaStaphylococcusAureusFoodPoisoning",
  ],
  [
    "바실러스 세레우스균",
    "식품안전나라 바실러스 세레우스균 식중독 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "설사형 독소(Diarrhetic toxin)",
    "식품안전나라 바실러스 세레우스균 설사형 독소 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "구토형 독소(Emetic toxin)",
    "식품안전나라 바실러스 세레우스균 구토형 독소 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "향신료 사용 요리, 육류 및 채소의 스프, 푸딩",
    "식품안전나라 바실러스 세레우스균 설사형 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "볶음밥",
    "식품안전나라 바실러스 세레우스균 구토형 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "토양 상재균",
    "식품안전나라 바실러스 세레우스균 토양 상재균 오염 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "바실러스 향신료 사용 요리",
    "식품안전나라 바실러스 세레우스균 향신료 사용 요리 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "바실러스 육류 채소 스프",
    "식품안전나라 바실러스 세레우스균 육류·채소 스프 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "바실러스 육류 스프",
    "식품안전나라 바실러스 세레우스균 육류 스프 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "바실러스 채소 스프",
    "식품안전나라 바실러스 세레우스균 채소 스프 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "바실러스 푸딩",
    "식품안전나라 바실러스 세레우스균 푸딩 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "바실러스 쌀밥",
    "식품안전나라 바실러스 세레우스균 쌀밥 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "바실러스 볶음밥",
    "식품안전나라 바실러스 세레우스균 볶음밥 원인식품 확인 필요",
    "foodSafetyKoreaBacillusCereusFoodPoisoning",
  ],
  [
    "클로스트리디움 퍼프린젠스균",
    "식품안전나라 클로스트리디움 퍼프린젠스균 식중독 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "아포의 발아 시 독소를 생성",
    "식품안전나라 클로스트리디움 퍼프린젠스균 아포 발아 독소 생성 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "A형과 C형",
    "식품안전나라 클로스트리디움 퍼프린젠스균 A형·C형 식중독 관여 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "돼지고기, 닭고기, 칠면조고기 등으로 조리한 식품 및 그 가공품인 동물성 단백질식품",
    "식품안전나라 클로스트리디움 퍼프린젠스균 동물성 단백질 조리식품 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "미리 가열 조리된 후 실온에서 5시간이상 방치된 식품",
    "식품안전나라 클로스트리디움 퍼프린젠스균 가열 후 5시간 이상 실온방치 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "퍼프린젠스 돼지고기 조리식품",
    "식품안전나라 클로스트리디움 퍼프린젠스균 돼지고기 조리식품 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "퍼프린젠스 닭고기 조리식품",
    "식품안전나라 클로스트리디움 퍼프린젠스균 닭고기 조리식품 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "퍼프린젠스 칠면조고기 조리식품",
    "식품안전나라 클로스트리디움 퍼프린젠스균 칠면조고기 조리식품 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "퍼프린젠스 5시간 실온방치 식품",
    "식품안전나라 클로스트리디움 퍼프린젠스균 5시간 이상 실온방치 식품 확인 필요",
    "foodSafetyKoreaClostridiumPerfringensFoodPoisoning",
  ],
  [
    "클로스트리디움 보툴리늄균",
    "식품안전나라 클로스트리디움 보툴리늄균 식중독 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "그람양성의 편성혐기성 간균",
    "식품안전나라 클로스트리디움 보툴리늄균 편성혐기성 간균 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "세포 한쪽 끝에 난 원형의 아포",
    "식품안전나라 클로스트리디움 보툴리늄균 말단 원형 아포 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "A형, B형, E형, 및 F형균",
    "식품안전나라 클로스트리디움 보툴리늄균 A/B/E/F형 식중독 관여 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "80℃, 20분과 100℃, 1~2분 가열로 파괴",
    "식품안전나라 클로스트리디움 보툴리늄균 독소 열 불활성화 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "통조림, 병조림, 레토르트 식품, 식육, 소시지 생선",
    "식품안전나라 클로스트리디움 보툴리늄균 저장식품·식육·소시지·생선 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "보툴리늄 통조림",
    "식품안전나라 클로스트리디움 보툴리늄균 통조림 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "보툴리늄 병조림",
    "식품안전나라 클로스트리디움 보툴리늄균 병조림 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "보툴리늄 레토르트 식품",
    "식품안전나라 클로스트리디움 보툴리늄균 레토르트 식품 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "보툴리늄 식육",
    "식품안전나라 클로스트리디움 보툴리늄균 식육 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "보툴리늄 소시지",
    "식품안전나라 클로스트리디움 보툴리늄균 소시지 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "보툴리늄 생선",
    "식품안전나라 클로스트리디움 보툴리늄균 생선 원인식품 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "환경조건이 혐기적일 때 아포가 발아하여 증식하면서 식중독을 발생시킬 정도의 독소를 생산",
    "식품안전나라 클로스트리디움 보툴리늄균 혐기조건 아포 발아·독소 생산 확인 필요",
    "foodSafetyKoreaClostridiumBotulinumFoodPoisoning",
  ],
  [
    "장출혈성 대장균",
    "식품안전나라 장출혈성 대장균 식중독 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "대장균 O157:H7",
    "식품안전나라 장출혈성 대장균 O157:H7 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "출혈성 대장염, 용혈성요독증후군, 혈전성혈소판 감소증",
    "식품안전나라 장출혈성 대장균 중증 합병증 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "환자나 보균자의 분변",
    "식품안전나라 장출혈성 대장균 분변 오염 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "보균자가 화장실을 비위생적으로 사용할 때",
    "식품안전나라 장출혈성 대장균 비위생적 화장실 사용 오염 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "하천수와 어패류 등에서 분리 검출",
    "식품안전나라 장출혈성 대장균 환경·어패류 오염 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 햄",
    "식품안전나라 장출혈성 대장균 햄 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 치즈",
    "식품안전나라 장출혈성 대장균 치즈 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 소시지",
    "식품안전나라 장출혈성 대장균 소시지 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 채소샐러드",
    "식품안전나라 장출혈성 대장균 채소샐러드 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 분유",
    "식품안전나라 장출혈성 대장균 분유 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 두부",
    "식품안전나라 장출혈성 대장균 두부 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 음료수",
    "식품안전나라 장출혈성 대장균 음료수 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 어패류",
    "식품안전나라 장출혈성 대장균 어패류 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 도시락",
    "식품안전나라 장출혈성 대장균 도시락 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장출혈성 대장균 급식",
    "식품안전나라 장출혈성 대장균 급식 원인식품 확인 필요",
    "foodSafetyKoreaEnterohemorrhagicEcoliFoodPoisoning",
  ],
  [
    "장염비브리오균",
    "식품안전나라 장염비브리오균 식중독 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "2~4%의 소금물에서 잘 생육",
    "식품안전나라 장염비브리오균 염분 조건 생육 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "해수온도가 15℃ 이상이 되면 급격히 증식",
    "식품안전나라 장염비브리오균 15℃ 이상 해수 급증식 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "짧은 쉼표 모양",
    "식품안전나라 장염비브리오균 형태 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "어패류, 생선회, 수산식품(게장, 생선회, 오징어무침, 꼬막무침 등)",
    "식품안전나라 장염비브리오균 어패류·생선회·수산식품 원인식품 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "장염비브리오 어패류",
    "식품안전나라 장염비브리오균 어패류 원인식품 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "장염비브리오 생선회",
    "식품안전나라 장염비브리오균 생선회 원인식품 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "장염비브리오 수산식품",
    "식품안전나라 장염비브리오균 수산식품 원인식품 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "장염비브리오 게장",
    "식품안전나라 장염비브리오균 게장 원인식품 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "장염비브리오 오징어무침",
    "식품안전나라 장염비브리오균 오징어무침 원인식품 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "장염비브리오 꼬막무침",
    "식품안전나라 장염비브리오균 꼬막무침 원인식품 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "어패류의 체표와 내장 및 아가미 등에 부착",
    "식품안전나라 장염비브리오균 어패류 체표·내장·아가미 오염 확인 필요",
    "foodSafetyKoreaVibrioParahaemolyticusFoodPoisoning",
  ],
  [
    "노로바이러스 식중독",
    "질병관리청 노로바이러스 식중독 예방·탈수·오염 식재료 확인 필요",
    "kdcaNorovirusFoodSafety",
  ],
  [
    "면역저하자 노로바이러스 탈수",
    "질병관리청 노로바이러스 면역저하자 탈수 관찰·진료 확인 필요",
    "kdcaNorovirusFoodSafety",
  ],
  [
    "오염된 식재료를 조리하지 않고 섭취",
    "질병관리청 노로바이러스 오염 식재료 비조리 섭취 확인 필요",
    "kdcaNorovirusFoodSafety",
  ],
  [
    "환자 구토물 접촉환경",
    "질병관리청 노로바이러스 환자 구토물·접촉환경 염소 소독 확인 필요",
    "kdcaNorovirusFoodSafety",
  ],
  [
    "껍질이 없는(Non-envelop) 바이러스",
    "식품안전나라 노로바이러스 비외피 바이러스 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "분변-구강 경로(Fecal-oral route)를 통하여 감염",
    "식품안전나라 노로바이러스 분변-구강 경로 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "사람의 장관 내에서만 증식",
    "식품안전나라 노로바이러스 사람 장관 내 증식 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "연중 발생 가능하며 2차 발병률이 높다",
    "식품안전나라 노로바이러스 연중 발생·2차 발병률 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "음식(패류, 샐러드, 과일, 냉장식품, 샌드위치, 상추, 냉장조리 햄, 빙과류)",
    "식품안전나라 노로바이러스 원인식품 목록 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 패류",
    "식품안전나라 노로바이러스 패류 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 샐러드",
    "식품안전나라 노로바이러스 샐러드 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 과일",
    "식품안전나라 노로바이러스 과일 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 냉장식품",
    "식품안전나라 노로바이러스 냉장식품 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 샌드위치",
    "식품안전나라 노로바이러스 샌드위치 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 상추",
    "식품안전나라 노로바이러스 상추 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 냉장조리 햄",
    "식품안전나라 노로바이러스 냉장조리 햄 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 빙과류",
    "식품안전나라 노로바이러스 빙과류 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "노로바이러스 물",
    "식품안전나라 노로바이러스 물 원인식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "사람의 분변에 오염된 물이나 식품",
    "식품안전나라 노로바이러스 분변 오염 물·식품 확인 필요",
    "foodSafetyKoreaNorovirusFoodPoisoning",
  ],
  [
    "복어독은 열에 강하기 때문에 120℃에서 1시간 이상 가열해도 파괴되지 않습니다",
    "질병관리청 자연독 식중독 복어독 열저항성 확인 필요",
    "kdcaFoodPoisoningNaturalToxins",
  ],
  [
    "복어요리 전문가가 조리하지 않은 복어",
    "질병관리청 자연독 식중독 복어요리 전문가 조리 여부 확인 필요",
    "kdcaFoodPoisoningNaturalToxins",
  ],
  [
    "야생 독버섯을 식용버섯으로 오인",
    "질병관리청 자연독 식중독 야생 독버섯 오인 섭취 확인 필요",
    "kdcaFoodPoisoningNaturalToxins",
  ],
  [
    "녹색을 띠는 감자",
    "질병관리청 자연독 식중독 감자 솔라닌 부위 확인 필요",
    "kdcaFoodPoisoningNaturalToxins",
  ],
  [
    "곰팡이독은 세척하거나 열을 가하더라도 없어지지 않고",
    "질병관리청 자연독 식중독 곰팡이독 세척·가열 불충분 확인 필요",
    "kdcaFoodPoisoningNaturalToxins",
  ],
  [
    "리스테리아균",
    "식품안전나라 리스테리아 식중독 냉장증식·원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "냉장온도에서도 생존하여 증식",
    "식품안전나라 리스테리아 식중독 냉장온도 증식 가능성 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "살균처리하지 아니한 우유",
    "식품안전나라 리스테리아 식중독 살균처리하지 않은 우유 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "치즈(특히 소프트치즈)",
    "식품안전나라 리스테리아 식중독 소프트치즈 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "소시지 및 건조 소시지",
    "식품안전나라 리스테리아 식중독 소시지·건조 소시지 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 원유",
    "식품안전나라 리스테리아 식중독 원유 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 핫도그",
    "식품안전나라 리스테리아 식중독 핫도그 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 아이스크림",
    "식품안전나라 리스테리아 식중독 아이스크림 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 살균처리하지 아니한 우유",
    "식품안전나라 리스테리아 식중독 살균처리하지 아니한 우유 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 치즈",
    "식품안전나라 리스테리아 식중독 치즈 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 소프트치즈",
    "식품안전나라 리스테리아 식중독 소프트치즈 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 소시지",
    "식품안전나라 리스테리아 식중독 소시지 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 건조 소시지",
    "식품안전나라 리스테리아 식중독 건조 소시지 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 가금육",
    "식품안전나라 리스테리아 식중독 가공·비가공 가금육 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "리스테리아 비가공 식육",
    "식품안전나라 리스테리아 식중독 비가공 식육 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "가공·비가공 가금육",
    "식품안전나라 리스테리아 식중독 가공·비가공 가금육 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "비가공 식육",
    "식품안전나라 리스테리아 식중독 비가공 식육 원인식품 확인 필요",
    "foodSafetyKoreaListeriaFoodPoisoning",
  ],
  [
    "여시니아 엔테로콜리티카균",
    "식품안전나라 여시니아 엔테로콜리티카균 식중독 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "0~5℃의 냉장고에서도 발육이 가능한",
    "식품안전나라 여시니아 엔테로콜리티카균 0~5℃ 냉장 발육 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "진공포장에서도 증식할 수 있는 특성",
    "식품안전나라 여시니아 엔테로콜리티카균 진공포장 증식 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "오물, 오염된 물, 돼지고기, 양고기, 쇠고기, 생우유, 아이스크림",
    "식품안전나라 여시니아 엔테로콜리티카균 오염수·육류·생우유 원인식품 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "여시니아 오염된 물",
    "식품안전나라 여시니아 엔테로콜리티카균 오염된 물 원인식품 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "여시니아 돼지고기",
    "식품안전나라 여시니아 엔테로콜리티카균 돼지고기 원인식품 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "여시니아 양고기",
    "식품안전나라 여시니아 엔테로콜리티카균 양고기 원인식품 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "여시니아 쇠고기",
    "식품안전나라 여시니아 엔테로콜리티카균 쇠고기 원인식품 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "여시니아 생우유",
    "식품안전나라 여시니아 엔테로콜리티카균 생우유 원인식품 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "여시니아 아이스크림",
    "식품안전나라 여시니아 엔테로콜리티카균 아이스크림 원인식품 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "동물의 분변과 함께 배출되어 음료수나 식품에 오염",
    "식품안전나라 여시니아 엔테로콜리티카균 동물 분변 유래 오염 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "저온보관 상태에서도 균이 증식",
    "식품안전나라 여시니아 엔테로콜리티카균 저온보관 중 증식 확인 필요",
    "foodSafetyKoreaYersiniaEnterocoliticaFoodPoisoning",
  ],
  [
    "캠필로박터균",
    "식품안전나라 캠필로박터 식중독 원인식품·오염경로 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "소, 돼지, 개, 고양이, 닭, 우유, 물",
    "식품안전나라 캠필로박터 식중독 원인식품 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "캠필로박터 소",
    "식품안전나라 캠필로박터 식중독 소 원인식품 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "캠필로박터 돼지",
    "식품안전나라 캠필로박터 식중독 돼지 원인식품 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "캠필로박터 닭",
    "식품안전나라 캠필로박터 식중독 닭 원인식품 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "캠필로박터 닭고기",
    "식품안전나라 캠필로박터 식중독 닭고기 원인식품 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "캠필로박터 우유",
    "식품안전나라 캠필로박터 식중독 우유 원인식품 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "캠필로박터 물",
    "식품안전나라 캠필로박터 식중독 물 원인식품 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "육류의 생식이나 불충분한 가열",
    "식품안전나라 캠필로박터 식중독 육류 생식·불충분 가열 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "동물(조류 등)의 분변에 의한 오염",
    "식품안전나라 캠필로박터 식중독 조류 분변 오염 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  [
    "식육(특히 닭고기)의 생식",
    "식품안전나라 캠필로박터 식중독 닭고기 생식 확인 필요",
    "foodSafetyKoreaCampylobacterFoodPoisoning",
  ],
  ["씻지 않은 딸기", "면역저하 시 씻기 어려운 과일 주의", "nccImmuneLowDiet"],
  [
    "딸기 등 꼼꼼히 씻기 어려운 과일은 주의해서 드시고",
    "면역저하 시 씻기 어려운 과일 주의",
    "nccImmuneLowDiet",
  ],
  ["딸기 등 꼼꼼히 씻기 어려운 과일", "면역저하 시 씻기 어려운 과일 주의", "nccImmuneLowDiet"],
  ["꼼꼼히 씻기 어려운 과일", "면역저하 시 씻기 어려운 과일 주의", "nccImmuneLowDiet"],
  ["씻지 않은 과일", "면역저하 시 과일·채소는 먹기 전 세척 확인", "nccImmuneLowDiet"],
  ["씻지 않은 채소", "면역저하 시 과일·채소는 먹기 전 세척 확인", "nccImmuneLowDiet"],
  ["냉장고에 보관하던 남은 음식도 3~4일이 지나면 버립니다", "면역저하 시 3~4일 지난 남은 음식 폐기 기준 확인", "nccImmuneLowDiet"],
  ["오래된 남은 음식", "면역저하 시 오래 보관한 남은 음식 폐기 기준 확인", "nccImmuneLowDiet"],
  ["오래된 반찬", "면역저하 시 오래 보관한 남은 음식 폐기 기준 확인", "nccImmuneLowDiet"],
  [
    "식품의 냄새가 이상하거나 모양이 이상한 경우에는 절대 사용하지 않습니다",
    "면역저하 시 냄새·모양 이상 식품 사용 금지 기준 확인",
    "nccImmuneLowDiet",
  ],
  ["상한 음식", "면역저하 시 냄새·모양 이상 식품 사용 금지 기준 확인", "nccImmuneLowDiet"],
  ["냄새 이상한 음식", "면역저하 시 냄새·모양 이상 식품 사용 금지 기준 확인", "nccImmuneLowDiet"],
  ["곰팡이가 핀 음식", "면역저하 시 곰팡이가 핀 음식 폐기 기준 확인", "nccImmuneLowDiet"],
  ["곰팡이 핀 음식", "면역저하 시 곰팡이가 핀 음식 폐기 기준 확인", "nccImmuneLowDiet"],
  ["비살균 우유", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["비살균 주스", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["비살균 쥬스", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["비살균 요구르트", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["비살균", "면역저하 시 저온살균 제품 여부 확인 필요", "nccImmuneLowDiet"],
  ["곰팡이", "면역저하 시 곰팡이가 핀 음식 사용 금지 기준 확인", "nccImmuneLowDiet"],
  ["상온 30분 이상 운반", "면역저하 시 상온 운반 후 즉시 냉장 확인", "nccImmuneLowDiet"],
  ["30분 이상 상온에서 운반", "면역저하 시 상온 운반 후 즉시 냉장 확인", "nccImmuneLowDiet"],
  ["녹슬거나 움푹해진 캔", "면역저하 시 손상 캔·해동 냉동제품 구매 주의", "nccImmuneLowDiet"],
  ["녹슨 캔", "면역저하 시 손상 캔·해동 냉동제품 구매 주의", "nccImmuneLowDiet"],
  ["움푹해진 캔", "면역저하 시 손상 캔·해동 냉동제품 구매 주의", "nccImmuneLowDiet"],
  ["냉동제품이 녹아 있다면 구입하지 않도록", "면역저하 시 손상 캔·해동 냉동제품 구매 주의", "nccImmuneLowDiet"],
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
  if (
    options?.requiredInputIncludes
    && !options.requiredInputIncludes.every((value) =>
      normalizedInput.includes(value.toLowerCase()),
    )
  ) {
    return false;
  }
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
