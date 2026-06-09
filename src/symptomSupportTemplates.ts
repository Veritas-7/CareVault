export type SymptomSupportTemplate = {
  id: string;
  label: string;
  keywords: string[];
  mealNote: string;
  clinicianQuestion: string;
  safetyNote: string;
  sourceLabel: string;
  sourceUrl: string;
  priorityKeywords?: string[];
};

export type SymptomSupportSourceLinkLabels = {
  ariaLabel: string;
  title: string;
  visibleLabel: string;
};

const safetyNote = "치료 지시가 아니라 진료 전 확인용 기록 후보입니다.";
const careQueueSymptomTemplateIds = new Set([
  "cervical-bowel-obstruction",
  "cervical-general-warning",
  "cervical-urinary-bowel-bleeding",
  "infection-fever",
  "lymphedema",
]);

export const symptomSupportTemplates: SymptomSupportTemplate[] = [
  {
    id: "nausea",
    label: "오심/구역",
    keywords: ["오심", "구역", "메스꺼움", "토할", "nausea"],
    mealNote:
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다. 배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다. 메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다. 특정 음식에 대해 메스꺼움이 심할 때에도 억지로 먹지 않도록 합니다. 대신 먹기 좋은 다른 음식을 많이 먹도록 합니다. 비교적 위에 부담이 적은 식품들을 섭취합니다. 다음 음식들은 메스꺼움을 더욱 유발할 수 있으므로 피하도록 합니다. 물은 포만감을 줄 수 있기 때문에 천천히 조금씩 마시고, 식사 시에도 조금만 마시도록 합니다. 옷은 몸이 조이지 않도록 느슨하게 입습니다. 오심 시작 시점, 치료 일정과의 간격, 식사 환경, 강요 없이 먹을 수 있었던 음식, 피한 음식, 수분 섭취량, 옷 조임 여부를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다. 항암화학요법 이나 방사선치료 를 받는 동안 오심 증세가 나타난다면, 치료하기 1~2시간 전에는 먹지 않도록 합니다. 메스꺼움이 언제, 무엇 때문에 나타나는지를 체크하고 의사선생님이나 간호사와 상의합니다. 오심이 치료 시점·식사 환경·특정 음식·수분 섭취·약 복용과 관련 있는지, 항구토제 사용 상담이나 탈수 확인 기준을 내 치료 상황에서 어떻게 적용할지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 메스꺼움",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
  },
  {
    id: "vomiting",
    label: "구토",
    keywords: ["구토", "토함", "토하는", "vomiting", "emesis"],
    mealNote:
      "구토증상이 있는 경우 먹거나 마시지 않도록 합니다. 구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다. 맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다. 구토 시작 시점, 횟수, 마지막 구토 뒤 수분·식사 재개 여부를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다. 구토 횟수, 수분 섭취 가능 여부, 맑은 유동식·미음·부드러운 식사 전환 시점, 탈수나 약 복용 어려움 기준을 의료진에게 어떻게 확인할지 물어보세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 구토",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
  },
  {
    id: "mouth-sore",
    label: "구내염/입안 통증",
    keywords: ["구내염", "입안", "입 통증", "mouth sore", "mucositis"],
    mealNote:
      "부드럽고 촉촉한 음식을 준비합니다. 씹고 삼키기 쉬운 음식을 먹습니다. 입안을 자극하는 음식이나 음료는 피하도록 합니다. 요리를 할 때는 부드럽고 연해질 때까지 하도록 하며, 음식을 작은 크기로 자릅니다. 경우에 따라서는 믹서로 곱게 갈도록 합니다. 입안이 쓰린 경우 빨대를 이용합니다. 뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다. 얼음조각을 먹는 것도 도움이 됩니다. 입안 통증 시작 시점, 씹기·삼키기 어려움, 피한 자극 음식, 잘게 자르거나 간 음식, 빨대 사용, 차거나 상온 음식 반응을 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "만약 입안통증이나 잇몸에 염증이 있는 경우 의사선생님을 방문하여 항암치료 의 부작용 때문인지 치과질환인지 알아보도록 합니다. 그러나 옥살로플라틴(Oxaliplatin) 등과 같은 말초신경염을 유발할 수 있는 항암제 를 투여 받는 경우는 온도변화에 민감하여 통증을 유발할 수 있으므로 차가운 음식은 피하도록 합니다. 치아와 잇몸이 아프면 치과치료를 받도록 합니다. 음식을 먹은 후 입안은 깨끗이 헹구어 청결하게 유지합니다. 입안 통증·잇몸 염증·삼킴 어려움·차가운 음식 민감도·구강 청결·치과 확인 필요성을 내 치료 상황에서 어떻게 적용할지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
  },
  {
    id: "dry-mouth",
    label: "입안 건조증",
    keywords: ["입안 건조", "입안이 마르", "입마름", "구강건조", "침 마름", "dry mouth"],
    priorityKeywords: ["입안 건조", "입안이 마르", "입마름", "구강건조", "침 마름", "dry mouth"],
    mealNote:
      "가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다. 음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹도록 합니다. 부드럽고 곱게 간 식품을 먹도록 합니다. 삼키기 쉽게 하기 위해 음식에 소스나 드레싱을 첨가하여 촉촉하게 합니다. 식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다. 딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있습니다. 입안이 마른 시점, 삼킴 어려움, 식사 중 수분·촉촉한 음식 시도 여부를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "그러나 문제가 심각하면 의사선생님이나 치과선생님과 상의합니다. 입안 건조가 씹기·삼키기·복약·식사량에 영향을 주는지, 물·육수·소스/드레싱·빨대·사탕/껌 사용을 내 치료 상황에서 어떻게 조정할지 의료진이나 치과에 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 입안의 건조증",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C485/contents.do",
  },
  {
    id: "taste-change",
    label: "입맛의 변화",
    keywords: [
      "입맛 변화",
      "입맛의 변화",
      "맛 변화",
      "맛이 없음",
      "금속성 맛",
      "쓴맛",
      "냄새에 민감",
      "taste change",
      "metallic taste",
    ],
    mealNote:
      "만약 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품을 이용합니다. 고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다. 신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있으므로 오렌지나 레몬같이 시큼한 식품을 사용합니다. 그러나 입과 목에 통증 이 있다면, 이런 식품들이 염증을 자극하거나 불편하게 하므로 주의합니다. 어떤 음식에서 쓴맛·금속성 맛·냄새 민감이 생기는지, 대체 단백질이나 양념·신맛 식품 시도 여부를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고, 입안을 자주 헹구도록 합니다. 입맛 변화가 식사량·단백질 섭취·입과 목 통증·구강 상태와 관련 있는지, 생선·계란·두부·콩·유제품 대체와 레몬즙·새콤달콤한 소스·시큼한 식품을 내 치료 상황에서 어떻게 조정할지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 입맛의 변화",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
  },
  {
    id: "appetite-loss",
    label: "식욕부진",
    keywords: [
      "식욕부진",
      "식욕 저하",
      "식사량 감소",
      "입맛 없음",
      "먹기 싫",
      "먹고 싶지",
      "공복감 없음",
      "appetite loss",
      "poor appetite",
    ],
    priorityKeywords: [
      "식욕부진",
      "식욕 저하",
      "식사량 감소",
      "입맛 없음",
      "공복감 없음",
      "appetite loss",
      "poor appetite",
    ],
    mealNote:
      "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. (예) 과자, 빵, 과일, 우유 및 유제품, 두유, 치즈 등 식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다. 평소에 좋아하던 음식을 먹거나, 음식 형태에 변화를 주어 메뉴를 다양하게 해서 먹습니다. 식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다. 만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다. 가벼운 산책 등 규칙적인 운동도 입맛을 증진시키는데 도움을 줄 수 있습니다. 입맛을 돋우기 위해서 식사전후에 입안을 청결하게 합니다. 식욕부진 시작 시점, 먹을 수 있는 시간대, 간식 접근성, 식사 중 수분 섭취, 식사 전후 구강 청결 여부를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "식사섭취가 계속적으로 힘들 경우에는 특수영양 보충음료를 이용합니다. (예) 그린비아, 뉴케어, 메디푸드, 엔슈어 등 주위 분들도 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고 환자 스스로 먹을 수 있게끔 도와줍니다. 식욕부진이 암 자체·항암치료·기분 변화·통증·입안 문제와 관련 있는지, 간식·유동식·특수영양 보충음료·수분 섭취 시간·보호자 지원을 내 치료 상황에서 어떻게 조정할지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 식욕부진",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
  },
  {
    id: "diarrhea",
    label: "설사",
    keywords: ["설사", "묽은 변", "diarrhea"],
    mealNote:
      "수분을 충분히 섭취하여 설사로 손실된 부분을 보충합니다. 장이 약해져 있으므로 식사는 조금씩 자주 먹습니다. 염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분과 칼륨이 들어있는 식품으로는 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등입니다. 소화되기 쉽고 부드러운 음식을 먹습니다. 다음 식품들은 가능한 피하도록 합니다. 너무 뜨겁거나 차가운 식품이나 음료는 피하고, 대신 상온의 음료를 마시도록 합니다. 설사 시작 시점, 횟수, 수분 섭취, 전해질 식품, 피한 음식, 혈액 동반 여부를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다. 우유 및 유제품을 먹을 때에는 주의합니다. 이는 우유에 들어있는 유당이 설사를 악화시킬 수 있기 때문입니다. 설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다. 설사 횟수, 탈수 징후, 혈액 동반, 맑은 유동식 전환, 우유·유제품 주의, 약이나 식사 조정 기준을 의료진에게 어떻게 확인할지 물어보세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 설사",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
  },
  {
    id: "constipation",
    label: "변비",
    keywords: ["변비", "constipation"],
    mealNote:
      "수분을 충분히 섭취합니다.(하루에 8~10컵 이상) 이는 변을 부드럽게 합니다. 특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다. 음식 섭취량이 너무 적지 않도록 합니다. 도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취합니다. 가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다. 누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다. 변비 시작 시점, 배변 간격, 수분·식사량, 섬유소 식품, 활동량, 누워있는 시간, 복용약 변화를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 합니다. 현재 치료·복용약 상황에서 8~10컵 수분, 아침 찬물, 섬유소 식품, 음식 섭취량, 걷기·산책, 누워 있을 때 복부 마사지, 완하제 사용 여부를 어떻게 조정할지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 변비",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
  },
  {
    id: "fatigue",
    label: "피로감·우울",
    keywords: ["피로", "기운 없음", "우울", "기분 저하", "불면", "잠을 못", "fatigue"],
    mealNote:
      "치료기간 동안 피로감은 제대로 먹지 못한 것, 운동 저하, 혈구수 부족, 우울, 불면 그리고 약물 부작용 등과 관련이 있습니다. 충분한 휴식을 취하도록 합니다. 오랜 수면보다는 낮에 잠깐씩 낮잠이나 휴식을 취합니다. 일상적인 활동보다 짧고 간단한 활동을 하도록 합니다. 영양이 풍부한 음식을 충분히 섭취합니다. 불충분한 열량과 영양소 섭취가 피로의 원인이 될 수 있기 때문입니다. 하루 중 가장 좋은 시간에 가능한 많이 먹습니다. 낮잠이나 휴식 후에 먹는 것이 더 편안함을 느낄 수 있습니다. 적은 양의 식사와 간식을 자주 먹습니다. 가능하다면 산책이나 규칙적인 운동을 하도록 합니다. 이는 피로감을 덜어주고 정신을 맑게 하는데 도움이 될 것입니다. 피로 시작 시점, 식사량·간식, 하루 중 먹기 좋은 시간대, 낮잠·휴식, 활동량, 혈구수 설명, 기분 저하·우울·불면·약물 부작용 가능성을 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "만일 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요합니다. 여러분이 느끼는 감정과 공포에 대해 솔직하게 이야기하도록 합니다. 감정을 표현함으로써 조절이 가능할 수 있습니다. 치료방법, 부작용 그리고 이를 이겨내는 방법들에 대해 알아봅니다. 미리 알고 행동함으로써 조절이 훨씬 쉬워질 수 있기 때문입니다. 피로를 악화시키는 행위는 제한하도록 합니다. 아이보기, 밥하기, 집안일 등은 주변 사람들에게 도움을 청하도록 합니다. 피로가 혈구수, 영양섭취, 수면, 우울·불면, 운동 저하, 약물 부작용, 치료 일정과 관련 있는지, 쉬어야 할 기준과 지원 상담을 내 치료 상황에서 어떻게 적용할지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 피로감과 우울",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
  },
  {
    id: "weight-change-nutrition",
    label: "체중변화/영양 보충",
    keywords: [
      "체중감소",
      "체중 감소",
      "몸무게 감소",
      "몸무게가 줄",
      "살 빠",
      "체중이 빠",
      "체중증가",
      "체중 증가",
      "몸무게 증가",
      "살 찜",
      "살이 찜",
      "체중조절",
      "weight loss",
      "weight gain",
    ],
    priorityKeywords: [
      "체중감소",
      "체중 감소",
      "몸무게 감소",
      "몸무게가 줄",
      "체중이 빠",
      "체중증가",
      "체중 증가",
      "몸무게 증가",
      "weight loss",
      "weight gain",
    ],
    mealNote:
      "암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있습니다. 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨립니다. 그러므로 체중감소를 예방하기 위해서 열량과 단백질 등을 충분히 섭취해야 합니다. 지방보다는 탄수화물이 많이 포함된 간식을 드시면 포만감이 빨리 사라지므로 더 편안함을 느낄 수 있다. 간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다. 체중 변화 날짜, 치료 일정, 식사량, 간식, 단백질 섭취, 식욕 변화, 부종이나 수분 보유 느낌을 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다. 소금이 우리 몸에서 수분을 축적시키는 작용을 하므로 염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등)은 제한하고 가능한 싱겁게 먹는 것이 좋습니다. 반면, 식욕이 증가된 경우에는 열량이 높고 영양가가 없는 식품들(예: 청량 음료, 초콜릿, 사탕, 과자류 등)은 제한하도록 합니다. 과일과 야채 그리고 곡류의 섭취를 증가시킵니다. 가능한 한 지방이 없는 부위의 육류제품과 저지방 우유 및 유제품을 이용합니다. 끓이고 찌는 형태의 요리방법을 이용합니다. 버터, 마요네즈, 감미료 등을 추가로 사용하지 않도록 합니다. 가능한 고열량의 간식은 먹지 않도록 합니다. 많이 먹었다고 생각되면 운동을 합니다. 체중감소나 체중증가가 치료, 약물, 수분 보유, 식욕 변화, 식사량, 운동량과 관련 있는지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 체중변화",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
  },
  {
    id: "lymphedema",
    label: "림프부종/다리 붓기",
    keywords: ["림프부종", "다리 붓", "다리부종", "부종", "열감", "피부 붉", "lymphedema"],
    priorityKeywords: ["림프부종 감염·악화 신호"],
    mealNote:
      "부은 쪽 다리의 둘레, 좌우 차이, 피부 붉어짐, 열감, 통증, 상처, 활동 전후 변화를 함께 기록하세요.",
    clinicianQuestion:
      "골반 림프절 치료 이력과 관련해 피부 붉어짐, 열감, 통증, 상처, 갑자기 단단해지는 느낌이 있을 때 바로 연락해야 할 기준을 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 림프부종 치료 전후관리",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T429C431/contents.do",
  },
  {
    id: "infection-fever",
    label: "발열·오한/감염 의심",
    keywords: ["발열", "고열", "체온", "오한", "감염", "식은땀", "38", "fever", "chills"],
    priorityKeywords: ["발열", "고열", "체온", "오한", "38", "fever", "chills"],
    mealNote:
      "체온, 측정 시간, 오한 지속 시간, 소변 통증·빈뇨, 기침·흉통·숨참, 카테터 부위 발적·부종·분비물 여부를 함께 기록하세요.",
    clinicianQuestion:
      "체온 38℃ 이상, 심한 오한, 배뇨 통증, 호흡곤란, 카테터 부위 발적·분비물이 있을 때 연락 또는 응급실 기준을 어떻게 적용해야 하는지 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 감염 의료진 상담 기준",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
  },
  {
    id: "immune-low-food-safety",
    label: "면역기능 저하/식품 안전",
    keywords: [
      "면역기능 저하",
      "면역 기능 저하",
      "면역 저하",
      "면역력 저하",
      "백혈구",
      "호중구",
      "ANC",
      "날음식",
      "날 음식",
      "비살균",
      "저온살균",
      "생선회",
      "생조개",
      "초밥",
      "덜 익힌",
    ],
    priorityKeywords: [
      "면역기능 저하",
      "면역 기능 저하",
      "면역 저하",
      "면역력 저하",
      "백혈구",
      "호중구",
      "ANC",
      "날음식",
      "날 음식",
      "비살균",
      "생선회",
      "생조개",
      "초밥",
      "덜 익힌",
    ],
    mealNote:
      "항암화학요법 나 방사선 치료 후 백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다. 음식을 만지거나 요리를 하려면 손을 깨끗이 씻도록 합니다. 식품의 유통기한을 꼭 확인합니다. 요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다. 고기, 닭고기, 생선 등은 완전히 익히도록 합니다. 백혈구/호중구 수치, 치료 일정, 식사 전 손 씻기, 유통기한, 분리 보관, 완전 조리 여부를 진료 전 확인용으로 기록하세요.",
    clinicianQuestion:
      "날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다. 육회, 생선회, 생조개, 초밥 등 익히지 않은 음식은 드시지 않습니다. 쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다. 백혈구나 호중구 수치가 낮을 때 익힌 음식, 날음식·덜 익힌 음식 제한, 저온살균 제품 선택, 외식·식품 보관·조리 기준을 내 치료 상황에서 어떻게 적용할지 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C489/contents.do",
  },
  {
    id: "cervical-general-warning",
    label: "질출혈·분비물/골반통 확인",
    keywords: [
      "비정상 질출혈",
      "질출혈",
      "폐경 후 출혈",
      "성교 후 출혈",
      "성관계 후 출혈",
      "질 분비물",
      "분비물 증가",
      "악취 분비물",
      "붉은 질분비물",
      "골반통",
      "골반 통증",
      "하지 방사통",
      "다리로 뻗치는 통증",
    ],
    priorityKeywords: [
      "비정상 질출혈",
      "질출혈",
      "폐경 후 출혈",
      "성교 후 출혈",
      "성관계 후 출혈",
      "악취 분비물",
      "붉은 질분비물",
      "골반 통증",
      "다리로 뻗치는 통증",
    ],
    mealNote:
      "출혈이 생긴 시점, 생리기간과의 관계, 성관계·운동·배변·질세척 후 발생 여부, 분비물 색·냄새·양, 골반통이나 다리로 뻗치는 통증을 함께 기록하세요.",
    clinicianQuestion:
      "비정상 질출혈, 악취나 붉은 질분비물, 새 골반통이나 하지 방사통이 있을 때 어떤 증상 조합과 시점에서 진료팀에 연락해야 하는지 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 자궁경부암 일반적 증상",
    sourceUrl:
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
  },
  {
    id: "cervical-urinary-bowel-bleeding",
    label: "배뇨·배변/혈뇨·혈변 변화",
    keywords: [
      "배뇨",
      "배변 장애",
      "혈뇨",
      "혈변",
      "직장출혈",
      "방광염",
      "소변 통증",
      "방광 통증",
      "직장 통증",
    ],
    priorityKeywords: ["혈뇨", "혈변", "직장출혈"],
    mealNote:
      "배뇨곤란, 배변 장애, 설사·방광염 유사 증상, 혈변·혈뇨가 치료 시점과 언제 관련 있는지 날짜, 양, 통증, 발열 동반 여부를 기록하세요.",
    clinicianQuestion:
      "광범위 자궁절제술이나 방사선치료 후 배뇨·배변 변화, 방광염 유사 증상, 치료 후 6개월 이상 지난 뒤 혈변·혈뇨가 있을 때 연락 기준을 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 자궁경부암 치료의 부작용",
    sourceUrl:
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
  },
  {
    id: "cervical-bowel-obstruction",
    label: "장폐색/복부팽만 확인",
    keywords: ["장폐색", "복부팽만", "복부 팽만", "배가 빵빵", "가스가 안 나옴", "가스 배출"],
    priorityKeywords: ["장폐색", "복부팽만", "복부 팽만"],
    mealNote:
      "방사선치료 후 경과 시점, 복부팽만, 복통, 구토, 배변·가스 배출 변화, 혈변·혈뇨 동반 여부를 날짜와 함께 기록하세요.",
    clinicianQuestion:
      "방사선치료 후 6개월 이상 지난 뒤 장폐색으로 의심되는 변화가 있을 때 어떤 증상 조합과 시점에서 진료팀에 연락해야 하는지 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 자궁경부암 치료의 부작용",
    sourceUrl:
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
  },
  {
    id: "cervical-radiation-menopause",
    label: "골반 방사선/폐경 증상 상담",
    keywords: [
      "골반 방사선",
      "난소부전",
      "난소 기능",
      "폐경 증상",
      "무월경",
      "안면홍조",
      "홍조",
      "성욕 감소",
      "골다공증",
      "질협착",
      "질 협착",
    ],
    priorityKeywords: ["난소부전", "폐경 증상", "무월경", "안면홍조", "성욕 감소", "골다공증"],
    mealNote:
      "골반 방사선치료 시점, 월경 변화, 안면홍조, 수면 변화, 성욕 변화, 골다공증 관련 설명 여부, 질건조·질협착 느낌을 날짜별로 기록하세요.",
    clinicianQuestion:
      "골반 방사선치료 후 난소부전, 폐경 증상, 질협착 가능성과 여성호르몬 상담 필요 여부를 내 치료 범위와 나이 기준으로 어떻게 확인해야 하는지 진료팀에 물어보세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 방사선치료의 부작용",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T292C294/contents.do",
  },
  {
    id: "cervical-sexual-health",
    label: "질건조·성교통/성생활 상담",
    keywords: ["질건조", "질 협착", "질협착", "성교통", "성생활", "부부관계", "성관계 통증"],
    priorityKeywords: ["질건조", "질 협착", "질협착", "성교통", "성관계 통증"],
    mealNote:
      "수술 종류, 방사선치료 종료 시점, 성관계 재개 시도 시점, 질건조·질협착·통증·출혈 여부를 진료 전 메모로 남기세요.",
    clinicianQuestion:
      "수술 또는 방사선치료 후 성관계 재개 시점, 질건조·질협착·통증이 있을 때 확인할 점, 국소 치료나 윤활제 사용 가능 여부를 담당의에게 어떻게 상담해야 하는지 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 자궁경부암 성생활",
    sourceUrl:
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
  },
  {
    id: "cervical-fertility-pregnancy",
    label: "임신·출산/가임력 상담",
    keywords: ["임신 계획", "출산 계획", "가임력", "임신 가능", "자궁경부절제술", "조산", "유산"],
    mealNote:
      "치료명, 병기, 원추절제술·환상투열요법·광범위자궁경부절제술 여부, 임신 계획 시점, 산전 진찰에서 확인할 항목을 메모하세요.",
    clinicianQuestion:
      "초기 자궁경부암 치료 이력에 따라 임신 가능성, 산전관리, 자궁경관 길이, 유산·조산 위험을 산부인과와 종양팀 중 누구에게 언제 상담해야 하는지 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 자궁경부암 임신과 출산",
    sourceUrl:
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5374",
  },
  {
    id: "pain-management",
    label: "암성 통증 기록",
    keywords: ["통증", "아픔", "진통제", "통증점수", "통증 점수", "pain"],
    mealNote:
      "통증 부위, 0-10점 강도, 시작·지속 시간, 악화·완화 요인, 진통제 복용 시간과 효과를 함께 기록하세요.",
    clinicianQuestion:
      "통증 강도, 양상, 악화·완화 요인, 진통제 효과와 부작용을 의료진에게 어떻게 전달하고 연락 기준을 어떻게 정할지 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 통증평가 항목",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T378C380/contents.do",
  },
];

export function findSymptomSupportTemplate(input: string) {
  const normalized = input.toLowerCase();
  const priorityMatches = symptomSupportTemplates.filter((template) =>
    template.priorityKeywords?.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );
  const bowelObstructionPriorityMatch = priorityMatches.find(
    (template) =>
      template.id === "cervical-bowel-obstruction"
      && ["장폐색", "복부팽만", "복부 팽만"].some((keyword) =>
        normalized.includes(keyword.toLowerCase()),
      ),
  );
  if (bowelObstructionPriorityMatch) return bowelObstructionPriorityMatch;
  const priorityMatch = priorityMatches[0];
  if (priorityMatch) return priorityMatch;

  return symptomSupportTemplates.find((template) =>
    template.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );
}

export function buildSymptomSupportQuestion(
  template: SymptomSupportTemplate,
  symptomName: string,
) {
  const prefix = symptomName.trim() ? `${symptomName.trim()} 기록과 관련해 ` : "";
  return `${prefix}${template.clinicianQuestion}\n${formatSymptomSupportCitation(template)}`;
}

export function formatSymptomSupportSource(template: SymptomSupportTemplate) {
  return `출처: ${template.sourceLabel}`;
}

export function buildSymptomSupportSourceLinkLabels(
  template: SymptomSupportTemplate,
): SymptomSupportSourceLinkLabels {
  const actionLabel = `${template.label} 공식 출처 ${template.sourceLabel} 열기`;

  return {
    ariaLabel: actionLabel,
    title: actionLabel,
    visibleLabel: formatSymptomSupportSource(template),
  };
}

export function formatSymptomSupportQuestionDraftActionLabel(
  template: SymptomSupportTemplate,
) {
  return `${template.label} 질문 초안 채우기`;
}

export function formatSymptomSupportSymptomDraftReadyStatus(
  template: SymptomSupportTemplate,
) {
  return `${template.label} 증상 초안 준비됨 · 근거 ${template.sourceLabel} · ${buildSymptomSupportQueueHint(
    template,
  )}`;
}

export function formatSymptomSupportQuestionDraftReadyStatus(
  template: SymptomSupportTemplate,
) {
  return `${template.label} 질문 초안 준비됨 · 근거 ${template.sourceLabel} · ${buildSymptomSupportQueueHint(
    template,
  )}`;
}

export function formatSymptomSupportCitation(template: SymptomSupportTemplate) {
  return `${formatSymptomSupportSource(template)} - ${template.sourceUrl}`;
}

export function buildSymptomSupportActionNote(template: SymptomSupportTemplate) {
  return [template.mealNote, template.safetyNote, formatSymptomSupportCitation(template)].join(" ");
}

export function isSymptomSupportCareQueueCandidate(template: SymptomSupportTemplate) {
  return careQueueSymptomTemplateIds.has(template.id);
}

export function buildSymptomSupportQueueHint(template: SymptomSupportTemplate) {
  return isSymptomSupportCareQueueCandidate(template)
    ? "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다."
    : "질문 초안에는 이 출처와 URL이 함께 남습니다.";
}
