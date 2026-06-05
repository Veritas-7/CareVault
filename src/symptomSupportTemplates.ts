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
    mealNote: "냄새가 강하지 않은 소량 식사, 수분 섭취, 자극적인 음식 제한 여부를 기록 후보로 남기세요.",
    clinicianQuestion:
      "오심이 식사나 약 복용 시간과 관련 있는지, 항구토제 조정이나 탈수 확인이 필요한지 물어보세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 메스꺼움",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
  },
  {
    id: "mouth-sore",
    label: "구내염/입안 통증",
    keywords: ["구내염", "입안", "입 통증", "mouth sore", "mucositis"],
    mealNote: "부드럽고 차갑거나 미지근한 음식 후보와 맵고 거친 음식 제한 여부를 기록하세요.",
    clinicianQuestion:
      "입안 통증이나 상처가 있을 때 피해야 할 음식, 구강 관리, 진료 연락 기준을 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
  },
  {
    id: "diarrhea",
    label: "설사",
    keywords: ["설사", "묽은 변", "diarrhea"],
    mealNote: "수분·전해질 섭취, 기름지거나 자극적인 음식 제한 여부, 설사 횟수를 함께 기록하세요.",
    clinicianQuestion:
      "설사 횟수, 탈수 징후, 지사제나 식사 조정이 필요한 기준을 의료진에게 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 설사",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
  },
  {
    id: "constipation",
    label: "변비",
    keywords: ["변비", "constipation"],
    mealNote: "수분, 활동량, 식이섬유를 늘려도 되는지 확인할 후보 메모로 남기세요.",
    clinicianQuestion:
      "현재 치료·복용약 상황에서 식이섬유, 수분, 완하제 사용을 어떻게 조정할지 물어보세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 변비",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
  },
  {
    id: "fatigue",
    label: "피로감·우울",
    keywords: ["피로", "기운 없음", "우울", "기분 저하", "불면", "잠을 못", "fatigue"],
    mealNote:
      "식사량, 수분, 수면, 낮잠·휴식, 활동 후 악화 여부, 기분 저하나 불면이 함께 있는지 기록하세요.",
    clinicianQuestion:
      "피로감이나 우울이 혈구수, 영양섭취, 수면, 우울·불면, 약물 부작용, 치료 일정과 관련 있는지 확인하고 지원 상담이나 쉬어야 할 기준을 물어보세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 증상별 식생활 - 피로감과 우울",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
  },
  {
    id: "lymphedema",
    label: "림프부종/다리 붓기",
    keywords: ["림프부종", "다리 붓", "다리부종", "부종", "열감", "피부 붉", "lymphedema"],
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
    mealNote:
      "체온, 측정 시간, 오한 지속 시간, 소변 통증·빈뇨, 기침·흉통·숨참, 카테터 부위 발적·부종·분비물 여부를 함께 기록하세요.",
    clinicianQuestion:
      "체온 38℃ 이상, 심한 오한, 배뇨 통증, 호흡곤란, 카테터 부위 발적·분비물이 있을 때 연락 또는 응급실 기준을 어떻게 적용해야 하는지 확인하세요.",
    safetyNote,
    sourceLabel: "국가암정보센터 감염 의료진 상담 기준",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
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
