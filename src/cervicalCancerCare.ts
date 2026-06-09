import { parseFiniteNumberText } from "./healthRules";

export type CervicalCancerCareSource = {
  label: string;
  url: string;
};

export type CervicalCancerCareAlert = {
  action: string;
  detail: string;
  sourceId: string;
  title: string;
};

export type CervicalCancerCarePrompt = {
  question: string;
  sourceId: string;
  topic: string;
};

export type CervicalCancerCareCheck = {
  detail: string;
  label: string;
  sourceId: string;
};

export type CervicalCancerCareRecoveryGuide = {
  detail: string;
  label: string;
  sourceId: string;
};

export type CervicalCancerCarePreventionGuide = {
  detail: string;
  label: string;
  sourceId: string;
};

export type CervicalCancerCarePriorityItem = {
  detail: string;
  label: string;
  sourceIds: string[];
};

export type CervicalCancerCareAlertRecordField = {
  detail: string;
  label: string;
  sourceIds: string[];
};

export type CervicalCancerCareSymptomDraft = {
  action: string;
  body: string;
  symptom: string;
};

export type CervicalCancerCareRecordDraftItem =
  | CervicalCancerCareCheck
  | CervicalCancerCareRecoveryGuide
  | CervicalCancerCarePreventionGuide;

export type CervicalCancerCareSourceLinkLabels = {
  ariaLabel: string;
  title: string;
  visibleLabel: string;
};

export type CervicalCancerCarePromptQuestionDraft = {
  date: string;
  priority: "next-visit";
  question: string;
  status: "open";
  topic: string;
};

export type CervicalCancerScreeningProfile = {
  age: string;
  sex: string;
};

export type CervicalCancerScreeningSummary = {
  action: string;
  detail: string;
  sourceIds: string[];
  status: string;
};

export const cervicalCancerCareSources: Record<string, CervicalCancerCareSource> = {
  nccSymptoms: {
    label: "국가암정보센터 자궁경부암 일반적 증상",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
  },
  nccScreeningSchedule: {
    label: "국가암정보센터 국가암검진 검진주기 및 검진방법",
    url: "https://www.cancer.go.kr/lay1/S1T553C555/contents.do",
  },
  nccScreeningEligibility: {
    label: "국가암정보센터 국가암검진 대상자 선정 및 통보",
    url: "https://www.cancer.go.kr/lay1/S1T553C554/contents.do",
  },
  nccScreeningResultCost: {
    label: "국가암정보센터 국가암검진 결과통보 및 비용",
    url: "https://www.cancer.go.kr/lay1/S1T553C556/contents.do",
  },
  nccDefinitionTypes: {
    label: "국가암정보센터 자궁경부암 정의 및 종류",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4881",
  },
  nccEarlyScreening: {
    label: "국가암정보센터 자궁경부암 조기검진",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4886",
  },
  nccRelatedStatistics: {
    label: "국가암정보센터 자궁경부암 관련통계",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4882",
  },
  nccEarlyDiagnosisPrevention: {
    label: "국립암센터 자궁경부암 조기 진단과 예방법",
    url: "https://www.cancer.go.kr/download.do?uuid=adf8879c-4343-445e-b67d-0c60e5ac9b58.pdf",
  },
  nccRecovery: {
    label: "국가암정보센터 자궁경부암 치료 후 생활",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4898",
  },
  nccRecurrenceFollowUp: {
    label: "국가암정보센터 자궁경부암 재발 및 전이",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4895",
  },
  nccTreatmentStatus: {
    label: "국가암정보센터 자궁경부암 치료현황",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4896",
  },
  nccSexLife: {
    label: "국가암정보센터 자궁경부암 성생활",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
  },
  nccPregnancyBirth: {
    label: "국가암정보센터 자궁경부암 임신과 출산",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5374",
  },
  nccDiet: {
    label: "국가암정보센터 자궁경부암 식생활",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
  },
  nccDiagnosisMethods: {
    label: "국가암정보센터 자궁경부암 진단방법",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C213/cancer/view.do?cancer_seq=4877&menu_seq=4889",
  },
  nccStage: {
    label: "국가암정보센터 자궁경부암 진행단계",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C213/cancer/view.do?cancer_seq=4877&menu_seq=4890",
  },
  nccTreatmentMethods: {
    label: "국가암정보센터 자궁경부암 치료방법",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4893",
  },
  nccDifferentialDiagnosis: {
    label: "국가암정보센터 자궁경부암 감별진단",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4891",
  },
  nccTreatmentSideEffects: {
    label: "국가암정보센터 자궁경부암 치료의 부작용",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
  },
  nccRadiationSideEffects: {
    label: "국가암정보센터 방사선치료의 부작용",
    url: "https://www.cancer.go.kr/lay1/S1T292C294/contents.do",
  },
  nccLymphedema: {
    label: "국가암정보센터 림프부종 운동 관리",
    url: "https://www.cancer.go.kr/lay1/S1T429C433/contents.do",
  },
  nccLymphedemaSymptoms: {
    label: "국가암정보센터 림프부종 증상과 진단",
    url: "https://www.cancer.go.kr/lay1/S1T426C428/contents.do",
  },
  nccLymphedemaCare: {
    label: "국가암정보센터 림프부종 치료 전후관리",
    url: "https://www.cancer.go.kr/lay1/S1T429C431/contents.do",
  },
  kdcaHpv: {
    label: "질병관리청 국가건강정보포털 자궁경부암 백신",
    url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=3987",
  },
  nccHpvVaccine: {
    label: "국가암정보센터 자궁경부암 HPV 예방백신",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
  },
  nccCervicalPrevention: {
    label: "국가암정보센터 자궁경부암 예방법",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C213/cancer/view.do?cancer_seq=4877",
  },
  nccCervicalRiskFactors: {
    label: "국가암정보센터 자궁경부암 위험요인",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4884",
  },
  nccCervicalPracticeGuideline: {
    label: "국가암정보센터 국민 암예방 수칙 실천지침 자궁경부암",
    url: "https://www.cancer.go.kr/download.do?uuid=6fb06571-5b8b-4dbe-9473-1074110e631d.pdf",
  },
};

export const cervicalCancerCareAlerts: CervicalCancerCareAlert[] = [
  {
    title: "비정상 질출혈",
    detail: "폐경 후 새 출혈, 생리기간 외 출혈, 성관계 후 출혈, 갑자기 많아진 생리량을 구분해 기록합니다.",
    action: "발생 시기·양·유발 상황을 적고 진료팀 확인",
    sourceId: "nccSymptoms",
  },
  {
    title: "분비물 변화",
    detail: "악취가 나는 분비물, 붉은 분비물, 갑자기 늘어난 분비물을 날짜별로 기록합니다.",
    action: "감염·출혈 동반 여부를 함께 적고 진료팀 확인",
    sourceId: "nccSymptoms",
  },
  {
    title: "골반통·요통·다리 통증",
    detail: "심한 골반통, 허리통증, 다리로 뻗치는 통증이 새로 생기거나 악화되는지 봅니다.",
    action: "통증 점수와 지속 시간을 기록하고 진료팀에 빠르게 상담",
    sourceId: "nccSymptoms",
  },
  {
    title: "배뇨·배변 변화",
    detail: "배뇨곤란, 혈뇨, 직장출혈, 변비처럼 방광·직장 관련 변화가 있는지 확인합니다.",
    action: "혈액·통증·발열 동반 여부를 적고 진료팀 확인",
    sourceId: "nccSymptoms",
  },
];

export const cervicalCancerCareAlertRecordFields: CervicalCancerCareAlertRecordField[] = [
  {
    label: "언제",
    detail: "새로 시작된 날짜, 반복 횟수, 치료·검사 후 며칠째인지",
    sourceIds: ["nccSymptoms", "nccTreatmentSideEffects"],
  },
  {
    label: "무엇이",
    detail: "출혈·분비물 색/냄새/양, 혈뇨·혈변, 배뇨·배변 변화",
    sourceIds: ["nccSymptoms", "nccTreatmentSideEffects"],
  },
  {
    label: "얼마나",
    detail: "통증 정도와 지속 시간, 복부팽만·구토·배변/가스 변화 동반 여부",
    sourceIds: ["nccSymptoms", "nccTreatmentSideEffects"],
  },
  {
    label: "같이",
    detail: "발열, 열감, 피부 붉어짐, 다리 부종·통증, 상처 동반 여부",
    sourceIds: ["nccLymphedemaCare", "nccTreatmentSideEffects"],
  },
];

export const cervicalCancerCarePrompts: CervicalCancerCarePrompt[] = [
  {
    topic: "자궁경부암 추적",
    question: "다음 추적 진료에서 자궁경부세포검사, HPV 검사, 내진, 영상검사 중 어떤 항목과 주기를 확인해야 하나요?",
    sourceId: "nccSymptoms",
  },
  {
    topic: "검진·진단검사 구분",
    question:
      "증상이 없는 국가암검진과 의심 증상이 있을 때의 진단검사를 어떻게 구분하고, 제 증상 기준으로 골반내진, 자궁경부세포검사, HPV 검사, 질확대경, 조직검사, 경질초음파, 골반 MRI 중 어떤 검사가 필요한지 어떻게 확인하면 좋을까요?",
    sourceId: "nccEarlyDiagnosisPrevention",
  },
  {
    topic: "치료 후 회복",
    question: "수술·방사선·항암 치료 후 피해야 할 활동, 부부관계 재개 시점, 운전/운동 제한을 제 상태 기준으로 어떻게 확인하면 좋을까요?",
    sourceId: "nccRecovery",
  },
  {
    topic: "치료 선택 기준",
    question:
      "제 병기, 암 크기, 전신상태, 연령, 향후 출산 희망 여부를 기준으로 수술·방사선치료·항암화학요법 선택 이유와 장단점을 어떻게 설명받으면 좋을까요?",
    sourceId: "nccTreatmentMethods",
  },
  {
    topic: "골반 방사선 후 폐경",
    question:
      "골반 방사선치료 후 난소부전, 홍조·무월경 같은 폐경 증상, 질협착, 성욕 변화, 골다공증 위험을 제 치료 범위와 나이 기준으로 어떻게 기록하고 상담해야 하나요?",
    sourceId: "nccRadiationSideEffects",
  },
  {
    topic: "장·방광 후기 변화",
    question:
      "수술 후 배뇨·배변 장애나 방사선치료 후 6개월 이상 지난 뒤 장폐색, 혈변, 혈뇨 가능성을 제 치료 시점 기준으로 어떻게 구분해 기록하고, 복부팽만·구토·배변/가스 변화가 있을 때 어떤 연락 기준을 적용해야 하나요?",
    sourceId: "nccTreatmentSideEffects",
  },
  {
    topic: "림프부종",
    question:
      "골반 림프절 치료 이력이 있는 경우 다리 부종, 피부 붉어짐, 열감, 통증, 상처를 어떻게 관찰하고 언제 의료진에게 바로 연락해야 하나요?",
    sourceId: "nccLymphedemaCare",
  },
  {
    topic: "식생활·보조식품",
    question:
      "방사선치료나 항암화학요법 중 장 기능 변화, 자극적인 음식, 민간요법·건강보조식품 복용 여부를 제 치료 일정 기준으로 어떻게 기록하고 상담해야 하나요?",
    sourceId: "nccDiet",
  },
  {
    topic: "HPV·검진",
    question:
      "HPV 백신은 예방용이고 접종 후에도 자궁경부암 선별검사를 계속 받아야 한다는 점을 제 나이와 치료 이력 기준으로 가족에게 어떻게 설명하면 좋을까요?",
    sourceId: "kdcaHpv",
  },
  {
    topic: "임신·출산 계획",
    question:
      "원추절제술, 환상투열요법, 광범위자궁경부절제술 이력에 따라 임신 가능성, 산전관리, 유산·조산 위험을 어떤 진료과와 언제 상담해야 하나요?",
    sourceId: "nccPregnancyBirth",
  },
];

export const cervicalCancerCareChecks: CervicalCancerCareCheck[] = [
  {
    label: "출혈·분비물 기록",
    detail: "날짜, 양, 색, 냄새, 성관계/운동/배변 후 발생 여부를 한 줄로 남깁니다.",
    sourceId: "nccSymptoms",
  },
  {
    label: "통증·부종 추세",
    detail: "골반통·요통·하지 통증·다리 부종은 0-10점, 좌우 차이, 악화 요인을 함께 적습니다.",
    sourceId: "nccLymphedemaSymptoms",
  },
  {
    label: "림프부종 감염·악화 신호",
    detail:
      "부은 쪽 다리의 피부 붉어짐, 열감, 통증, 상처, 갑자기 단단해지는 느낌이나 주름·통증을 날짜와 활동 전후로 기록하고 의료진에게 바로 연락할 기준을 확인합니다.",
    sourceId: "nccLymphedemaCare",
  },
  {
    label: "생활 제한 확인",
    detail: "수술 후 무거운 물건, 부부관계, 운전, 운동 재개는 치료 범위별로 진료팀 지시를 우선합니다.",
    sourceId: "nccRecovery",
  },
  {
    label: "추적검사 일정·결과",
    detail:
      "다음 외래 날짜, 자궁경부세포검사 예정일, 결과 설명 받은 날짜를 한 줄로 남기고 병원 추적 일정과 국가암검진 2년 주기가 어떻게 다른지 진료팀에 확인합니다.",
    sourceId: "nccScreeningSchedule",
  },
  {
    label: "의심 증상 진단검사 준비",
    detail:
      "증상이 없는 검진과 의심 증상 진단검사를 구분하고, 골반내진·자궁경부세포검사·HPV 검사·질확대경·조직검사·경질초음파·골반 MRI 중 내 증상과 결과에 필요한 항목을 진료팀에 확인합니다.",
    sourceId: "nccEarlyDiagnosisPrevention",
  },
  {
    label: "조기검진 준비·한계 메모",
    detail:
      "국가암정보센터는 조기검진 목적이 전구 질환인 자궁경부이형성증과 상피내암 단계에서 발견하는 것이라고 설명합니다. 자궁경부세포검사는 많이 이용되지만 병변이 있어도 정상으로 판정되는 위음성률이 50%에 달할 수 있고, 액상세포도말검사는 기존 방법보다 위음성률이 낮아졌다고 설명합니다. 검진 시기는 생리기간을 되도록 피하고 생리 시작일로부터 10~20일 사이가 좋으며, 최소 48시간 전부터 성관계, 탐폰 사용, 질 세척, 질 내 약물 및 윤활제, 질 내 피임약을 피하는 안내가 내 검사에 적용되는지 확인합니다. 생리기간이 아니어도 출혈이나 악취 나는 질 분비물 같은 증상이 있다면 출혈에 관계없이 검사 기준을 진료팀에 확인합니다.",
    sourceId: "nccEarlyScreening",
  },
  {
    label: "발생통계 해석 메모",
    detail:
      "국가암정보센터는 2026년에 발표된 중앙암등록본부 자료 기준 2023년 우리나라 전체 신규 암 288,613건 중 상피내암을 제외시킨 자궁경부암(C53)이 3,144건, 전체 암 발생의 1.1%였고 여자의 암 중에서는 11위, 인구 10만 명당 조발생률 6.1건이라고 설명합니다. 연령대는 40대가 22.8%, 50대가 22.6%, 60대가 19.1% 순이었고, 조직학적으로 암종이 96.6%, 편평세포암이 40.1%, 선암이 22.7%였습니다. 이 수치는 발생 현황을 설명하는 인구 통계이므로 개인 위험으로 단정하지 말고, 내 나이, 검진 이력, 병리결과, 치료 이력에서 어떤 의미가 있는지 진료팀에 확인합니다.",
    sourceId: "nccRelatedStatistics",
  },
  {
    label: "진단·병기검사 목적 메모",
    detail:
      "국가암정보센터는 자궁경부암 검사를 암이 맞는지 확인하는 조직검사와 병기 설정 검사로 나누어 설명합니다. 의사의 진찰, 자궁경부세포검사, 질확대경검사, 조직검사, 원추절제술, 방광경 및 에스결장경검사, 경정맥 신우조영술, CT, MRI, PET 중 어떤 검사가 내 결과에서 암 확인, 자궁경부 주위조직 침윤, 림프절 전이, 원격전이와 재발 확인 목적인지 진료팀에 확인합니다.",
    sourceId: "nccDiagnosisMethods",
  },
  {
    label: "병리조직 확인 메모",
    detail:
      "국가암정보센터는 자궁경부암이 전암단계를 상당 기간 거치며 자궁경부 상피내이형성증을 거쳐 상피 내에만 암세포가 있는 자궁경부상피내암으로 진행하고, 기저막을 침범하면 침윤성 암으로 분류한다고 설명합니다. 병리결과지의 편평상피세포암(약 80%), 선암(10-20%), 혼합 암종(2-5%) 같은 조직형과 상피내암/침윤성 암 구분이 내 병기·치료 설명에 어떻게 반영되는지 진료팀에 확인합니다.",
    sourceId: "nccDefinitionTypes",
  },
  {
    label: "병기 설명 메모",
    detail:
      "국가암정보센터는 자궁경부암 진행단계를 크게 1기부터 4기로 나누며, 전암 단계인 상피내암은 다른 곳으로 전이되지 않아 암의 분류에 속하지 않는다고 설명합니다. 1기는 자궁경부에 국한, 2기는 자궁경부를 벗어났지만 골반벽까지 퍼지지 않았거나 질 상부 2/3 침범 또는 자궁 옆 결합조직 침윤, 3기는 질 하부 1/3, 골반벽, 요관침윤으로 신장이 부은 경우나 골반·대동맥주위 림프절 전이, 4기는 방광이나 직장 점막 침범 또는 원격전이처럼 설명될 수 있으므로 내 진단서 병기와 검사 근거를 진료팀에 확인합니다.",
    sourceId: "nccStage",
  },
  {
    label: "치료현황 통계 상담 메모",
    detail:
      "국가암정보센터는 2026년 중앙암등록본부 발표 자료 기준 2019-2023년 자궁경부암 5년 상대생존율 79.0%와 요약병기별 5년 상대생존율 국한 94.5%, 국소 73.8%, 원격 29.1%, 모름 69.5%를 제시합니다. 이 수치는 5년 이상 생존 확률을 추정한 인구 통계이므로 개인 예후로 단정하지 말고, 내 병기, 검사 근거, 치료 반응, 재발·전이 여부에 맞춰 해석 기준을 진료팀에 확인합니다.",
    sourceId: "nccTreatmentStatus",
  },
  {
    label: "치료방법 선택 근거 메모",
    detail:
      "국가암정보센터는 자궁경부암 치료방법을 수술, 방사선치료, 항암화학요법(표적치료와 면역치료 포함)으로 설명하며, 병기와 암 크기, 연령, 전신상태, 향후 출산 희망 여부를 함께 고려해 결정한다고 설명합니다. 전암성 병변, 초기 침윤성 자궁경부암, 많이 진행된 병변, 재발 부위별로 선택지가 달라질 수 있으므로 내 병기, 병변 범위, 림프절 여부, 출산 계획, 수술·방사선·항암화학요법 병행 이유를 진료팀에 확인합니다.",
    sourceId: "nccTreatmentMethods",
  },
  {
    label: "감별진단 확인 메모",
    detail:
      "국가암정보센터는 자궁경부암이 자궁경부염, 질암, 자궁내막암, 자궁체부암, 골반 염증성질환 등과 감별되어야 한다고 설명합니다. 자궁경부세포검사, 질확대경검사 및 펀치 생검, 자궁경관 내 소파술, CT나 MRI 같은 영상검사 중 어떤 근거로 내 진단과 감별진단이 정리됐는지 진료팀에 확인합니다.",
    sourceId: "nccDifferentialDiagnosis",
  },
  {
    label: "배뇨·배변·출혈 변화 메모",
    detail:
      "국가암정보센터는 광범위 자궁절제술 후 방광·직장 기능부전, 방사선치료 후 설사·방광염 유사 증상, 치료 후 6개월 이상 지난 뒤 혈변·혈뇨 가능성을 설명합니다. 배뇨곤란, 설사/변비, 혈변·혈뇨, 직장·방광 통증을 날짜와 치료 시점 기준으로 기록해 진료팀에 확인합니다.",
    sourceId: "nccTreatmentSideEffects",
  },
  {
    label: "장폐색·혈변·혈뇨 연락 메모",
    detail:
      "국가암정보센터는 수술 직후 급성 합병증으로 장폐색을, 방사선치료가 끝난 6개월 이상 뒤 만성 합병증으로 장폐색과 혈변·혈뇨 가능성을 설명합니다. 복부팽만, 구토, 배변/가스 변화, 혈변, 혈뇨, 방광·직장 통증이 있으면 발생 시점과 치료 종료 시점을 함께 기록하고 연락 기준을 진료팀에 확인합니다.",
    sourceId: "nccTreatmentSideEffects",
  },
];

export const cervicalCancerCareRecoveryGuides: CervicalCancerCareRecoveryGuide[] = [
  {
    label: "원추절제술 후 생활 제한",
    detail:
      "6~8주 질분비물·간헐 출혈 가능 기간에 성관계, 수영/탕목욕, 무리한 운동, 변비 주의가 내게 적용되는지 퇴원 안내서와 진료팀 지시로 대조합니다.",
    sourceId: "nccRecovery",
  },
  {
    label: "광범위 자궁절제술 후 회복",
    detail:
      "최소 6주 무거운 물건, 부부관계, 운전 제한과 해제 시점을 내 수술 범위 기준으로 진료팀에 확인합니다.",
    sourceId: "nccRecovery",
  },
  {
    label: "골반 림프절 영향 운동",
    detail:
      "다리·발 운동 교육 여부, 압박 스타킹/붕대, 운동 전후 부종 비교, 악화 시 중단 기준을 기록합니다.",
    sourceId: "nccLymphedema",
  },
  {
    label: "림프부종 피부·감염 관리",
    detail:
      "압박 스타킹이나 붕대 사용 중 피부가 붉어지거나 가렵고, 감염 부위 주변에 열감·통증이 있거나 부종 부위가 단단해지면 부종 악화 가능성을 기록하고 의료진에게 바로 치료 기준을 확인합니다.",
    sourceId: "nccLymphedemaCare",
  },
  {
    label: "재발·추적검사 주기 메모",
    detail:
      "국가암정보센터는 추적검사 주기가 개인 상태와 병원에 따라 다를 수 있다고 설명합니다. 일반 설명인 첫 2년 3개월마다, 이후 5년까지 6개월마다, 그 이후 매년 일정을 내 치료 이력과 병원 계획에 맞게 진료팀에 확인합니다.",
    sourceId: "nccRecurrenceFollowUp",
  },
  {
    label: "재발 의심 증상·기본 추적검사 메모",
    detail:
      "국가암정보센터는 재발성 자궁경부암에서 체중감소, 하지 부종, 골반 혹은 허벅지 통증, 질출혈 혹은 질분비물의 증가, 진행성 요관 폐색, 쇄골위 림프절 비대, 폐 전이 시 기침·객혈·흉통이 있을 수 있지만 특징적인 증상이 없는 경우가 더 많다고 설명합니다. 병원 방문 때마다 문진, 골반내진을 포함한 신체검사, 세포검사와 필요 시 가슴사진, 종양 표지자, CT, MRI, PET 검사 여부를 내 증상 기록과 병원 계획에 맞게 진료팀에 확인합니다.",
    sourceId: "nccRecurrenceFollowUp",
  },
  {
    label: "골반 방사선치료 난소기능·폐경 증상 상담",
    detail:
      "국가암정보센터는 골반 방사선치료 후 여성에게 난소부전, 홍조, 무월경, 성욕 감소, 골다공증 같은 폐경 증상과 질협착이 나타날 수 있다고 설명합니다. 월경 변화, 안면홍조, 수면 변화, 성욕 변화, 질건조·질협착 느낌을 치료 시점 기준으로 기록하고 여성호르몬 상담 필요 여부를 진료팀에 확인합니다.",
    sourceId: "nccRadiationSideEffects",
  },
  {
    label: "성생활 재개·통증 상담",
    detail:
      "국가암정보센터는 수술 후 성생활 재개 시점도 담당의 진찰이 필요하고, 방사선 치료 중과 치료 후 약 2주~1개월은 출혈 가능성을 고려해야 한다고 설명합니다. 통증, 질건조·질협착, 콘돔 사용 권고, 국소 호르몬 연고 상담 필요 여부를 내 치료 이력 기준으로 진료팀에 확인합니다.",
    sourceId: "nccSexLife",
  },
  {
    label: "임신·출산 계획 상담",
    detail:
      "국가암정보센터는 초기 자궁경부암에서 환상투열요법이나 광범위자궁경부절제수술 후 임신·출산이 가능한 경우를 설명하면서 산전 진찰, 자궁경관 길이, 임신초기 유산 및 조산 위험 확인이 필요하다고 설명합니다. 임신 계획이 있으면 내 치료명과 병기를 기준으로 산부인과·종양팀 상담 시점을 기록합니다.",
    sourceId: "nccPregnancyBirth",
  },
  {
    label: "식생활·보조식품 확인",
    detail:
      "국가암정보센터는 자궁경부암 환자에게 특별히 피하거나 추천하는 음식은 없고 충분한 영양과 휴식이 도움이 될 수 있다고 설명합니다. 방사선치료나 항암화학요법 중 장 기능 변화, 자극적인 음식, 민간요법·건강보조식품 복용 여부는 내 치료 일정과 약제 기준으로 진료팀에 확인합니다.",
    sourceId: "nccDiet",
  },
];

export const cervicalCancerCarePreventionGuides: CervicalCancerCarePreventionGuide[] = [
  {
    label: "검진 대상 확인",
    detail:
      "자궁경부암 국가암검진 대상은 20세 이상 여성입니다. 같은 암종 진료 중이면 건강보험 산정특례기간 기준 검진 대상 유예 여부와 병원 추적검사 일정을 함께 기록합니다.",
    sourceId: "nccScreeningEligibility",
  },
  {
    label: "검진 주기·방법",
    detail:
      "국가암검진 표의 자궁경부암 검진 주기는 2년 간격이며 기본검사는 자궁경부세포검사입니다. 내 추적검사와 같은 일정인지 진료팀에 확인합니다.",
    sourceId: "nccScreeningSchedule",
  },
  {
    label: "자궁경부세포검사 전 확인",
    detail:
      "자궁경부세포검사는 생리 기간을 피해서 받는 것이 좋고, HPV 검사를 함께 받을 수 있으나 추가 비용이 생길 수 있습니다. 성경험이 없거나 자궁적출 이력이 있으면 검사 필요성과 방식을 먼저 진료팀에 확인합니다.",
    sourceId: "nccEarlyDiagnosisPrevention",
  },
  {
    label: "결과통보·비용 확인",
    detail:
      "국가암검진 결과는 검진완료일로부터 15일 이내 본인에게 통보되고, 자궁경부암 검사는 전액 무료로 안내됩니다. 내 결과통보 방식과 추가 확인이 필요한 비용 항목을 접수처나 진료팀에 확인합니다.",
    sourceId: "nccScreeningResultCost",
  },
  {
    label: "HPV 백신 가족 안내",
    detail:
      "HPV 백신은 예방용이며 치료 효과 확인 용도가 아닙니다. 접종 후에도 자궁경부암 선별검사는 변경 없이 받아야 하므로 가족에게 안내할 때 백신 예방 범위, 접종 후 정기검진 유지, 나이·치료 이력별 진료팀 확인 질문을 함께 적습니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 접종 일정·관찰 확인",
    detail:
      "접종기관에서 9세 이상 가능 여부, 만 12세 권장/지원 여부, 9-13(14)세 첫 접종 6개월 간격 2회와 이후 첫 접종 3회 일정 적용 여부를 확인합니다. 접종 당일 안내에는 앉거나 누운 상태와 접종 후 20~30분 관찰, 접종 후에도 선별검사 유지 여부를 함께 기록합니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 접종 지연·추가접종 메모",
    detail:
      "국가암정보센터는 HPV 접종시기를 놓친 경우 '남은 주사를 가능한 빨리 맞으며 처음부터 다시 시작하지는 않습니다'라고 설명합니다. 1차 후 일정 지연 시 2차와 3차 접종 간격은 적어도 12주인지 확인하고, 추가접종은 권고된 바가 없으므로 내 백신 종류·접종일·치료 일정 기준으로 접종기관과 진료팀에 질문으로 남깁니다.",
    sourceId: "nccHpvVaccine",
  },
  {
    label: "흡연·성생활 위험요인 메모",
    detail:
      "국가암정보센터는 사람유두종바이러스가 대부분 성접촉으로 감염되고 첫 성경험 나이와 성상대자수 같은 안전한 성생활 기록이 도움이 된다고 설명하며, 콘돔의 HPV 전파 예방 효과는 논란이 많다고 설명합니다. 흡연은 자궁경부암 위험이 높아지므로 흡연 여부·금연 지원 상담, 경구피임약 5년 이상 장기 복용 여부, 파트너/검진/예방접종 질문을 진료팀에 남깁니다.",
    sourceId: "nccCervicalPrevention",
  },
  {
    label: "경구피임약 장기복용 상담 메모",
    detail:
      "국가암정보센터는 '5년 이상의 장기적인 경구피임약 복용은 가능한 하지 않습니다.'라고 설명합니다. 이미 복용 중이면 복용 기간, 처방 이유, 대체 선택지나 추적검진 필요 여부를 임의 중단 없이 진료팀 질문으로 남깁니다.",
    sourceId: "nccCervicalPrevention",
  },
  {
    label: "예방법 종합 체크 메모",
    detail:
      "국가암정보센터는 '정기적으로 자궁경부 세포검진을 받고, 첫 성경험 연령을 늦추고, 성상 대자(sex partner) 수를 최소화하며 안전한 성생활을 합니다. 또한 사람유두종바이러스 예방 백신접종을 받고, 금연을 하며 채소와 과일을 충분하게 먹습니다. 5년 이상의 장기적인 경구피임약 복용은 가능한 하지 않습니다.'라고 설명합니다. 이 항목은 검진 일정, 성상대자수와 성생활 상담, 백신 접종 이력, 금연 지원, 식단, 경구피임약 복용 여부를 한 번에 점검하는 진료팀 질문으로 남깁니다.",
    sourceId: "nccCervicalPrevention",
  },
  {
    label: "실천지침 일상 예방 체크 메모",
    detail:
      "국가암정보센터 국민 암예방 수칙 실천지침 자궁경부암 자료의 '자궁경부암 예방, 일상 생활' 체크는 안전한 성생활(성 상대자수 최소화 등), 식이 섬유가 풍부한 신선한 채소·과일 섭취, 금연을 함께 제시합니다. 이 항목은 현재 검진·치료 이력에서 성생활 상담, 식단 기록, 금연 지원 필요 여부를 한 번에 정리하는 진료팀 질문으로 남깁니다.",
    sourceId: "nccCervicalPracticeGuideline",
  },
  {
    label: "면역·감염·출산력 위험요인 메모",
    detail:
      "국가암정보센터는 HIV 감염처럼 면역체계가 약해지는 경우, 클라미디아 감염, 과일·채소 섭취가 적은 식이, 장기간 경구피임약 사용, 출산 횟수가 많은 경우, 낮은 사회경제수준도 자궁경부암 위험요인으로 알려져 있다고 설명합니다. 면역저하 이력, 성매개감염 치료·재검 기록, 출산 횟수, 검진 접근 어려움과 지원 필요 여부를 진료팀 질문으로 남깁니다.",
    sourceId: "nccCervicalRiskFactors",
  },
  {
    label: "생활요인 근거 경계 메모",
    detail:
      "국가암정보센터 국민 암예방 수칙 실천지침은 음주, 비만, 신체활동 부족, 직업적·환경적 유해물질과 자궁경부암의 연관성은 아직 입증되지 않았다고 설명합니다. 해당 생활요인은 자궁경부암 직접 위험요인으로 표시하지 말고, 일반 암예방수칙이나 개인 건강목표로 분리해 기록하며, 내 검진·치료 이력에서 어떤 우선순위로 다룰지 진료팀에 질문으로 남깁니다.",
    sourceId: "nccCervicalPracticeGuideline",
  },
];

export const cervicalCancerCarePriorityItems: CervicalCancerCarePriorityItem[] = [
  {
    label: "오늘 증상 기록",
    detail:
      "출혈·분비물 변화, 골반통·요통·다리 통증, 배뇨·배변·혈뇨/혈변 변화는 발생 시점, 양·색·냄새, 통증점수, 동반 증상으로 정리합니다.",
    sourceIds: ["nccSymptoms", "nccTreatmentSideEffects"],
  },
  {
    label: "다음 진료 질문",
    detail:
      "병원 추적검사 일정과 국가암검진 2년 주기, 산정특례기간 국가검진 유예 여부, 의심 증상 진단검사 목록, 치료 선택 기준을 내 병기·치료 이력 기준으로 확인합니다.",
    sourceIds: [
      "nccScreeningSchedule",
      "nccScreeningEligibility",
      "nccEarlyDiagnosisPrevention",
      "nccTreatmentMethods",
    ],
  },
  {
    label: "치료 후 생활 상담",
    detail:
      "림프부종 피부 변화, 골반 방사선 후 폐경·질협착, 성생활 재개·통증, 임신·출산 계획, 식생활·보조식품은 진료팀 기준으로 기록합니다.",
    sourceIds: [
      "nccLymphedemaCare",
      "nccRadiationSideEffects",
      "nccSexLife",
      "nccPregnancyBirth",
      "nccDiet",
    ],
  },
];

function parseProfileAge(age: string) {
  const parsed = parseFiniteNumberText(age);
  return parsed !== undefined && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function buildCervicalCancerScreeningSummary(
  profile: CervicalCancerScreeningProfile,
): CervicalCancerScreeningSummary {
  const age = parseProfileAge(profile.age);
  const baseSourceIds = ["nccScreeningEligibility", "nccScreeningSchedule"];

  if (age === null) {
    return {
      action: "나이를 입력한 뒤 국가암검진 대상 여부와 병원 추적검사 일정을 함께 확인합니다.",
      detail: "국가암검진 기준은 20세 이상 여성, 2년 간격 자궁경부세포검사입니다.",
      sourceIds: baseSourceIds,
      status: "나이 입력 필요",
    };
  }

  if (profile.sex === "female" && age >= 20) {
    return {
      action:
        "같은 암종 진료 중이면 산정특례기간 기준 국가암검진 유예 여부와 병원 추적검사 일정을 진료팀에 확인합니다.",
      detail: "20세 이상 여성은 국가암검진 기준상 2년 간격 자궁경부세포검사 대상입니다.",
      sourceIds: baseSourceIds,
      status: "국가암검진 대상 기준 해당",
    };
  }

  if (profile.sex === "female") {
    return {
      action: "증상, 치료 이력, 가족 상담 필요가 있으면 국가암검진 연령 전이라도 진료팀 기준을 따릅니다.",
      detail: "국가암검진 자궁경부암 대상 연령은 20세 이상 여성입니다.",
      sourceIds: ["nccScreeningEligibility"],
      status: "국가암검진 대상 연령 전",
    };
  }

  return {
    action: "자궁경부 보유 여부, 치료 이력, 검진 필요성은 개인 상황에 맞게 진료팀에 확인합니다.",
    detail: "국가암검진 표의 자궁경부암 대상은 20세 이상 여성 기준으로 표시됩니다.",
    sourceIds: ["nccScreeningEligibility"],
    status: "프로필 성별 기준 확인 필요",
  };
}

export function formatCervicalCancerScreeningSummaryEvidence(
  summary: CervicalCancerScreeningSummary,
) {
  const sources = summary.sourceIds
    .map(formatCervicalCancerCareSourceCitation)
    .join("; ");

  return `${summary.status}: ${summary.detail} 확인: ${summary.action} (근거: ${sources})`;
}

export function buildCervicalCancerScreeningQuestion(
  summary: CervicalCancerScreeningSummary,
) {
  return [
    `${summary.status}로 표시됩니다. ${summary.detail}`,
    `${summary.action}`,
    "제 나이, 성별 기준, 자궁경부 보유 여부, 치료·추적 이력과 산정특례기간에 맞춰 국가암검진 유예 여부와 병원 추적검사 일정을 어떻게 확인하면 좋을까요?",
    formatCervicalCancerScreeningSummaryEvidence(summary),
  ].join("\n");
}

export function formatCervicalCancerScreeningQuestionDraftReadyStatus(
  summary: CervicalCancerScreeningSummary,
) {
  const sourceLabels = summary.sourceIds
    .map(
      (sourceId) =>
        getCervicalCancerCareSource(sourceId)?.label ?? "공식 자궁경부암 케어 자료",
    )
    .join(", ");

  return `자궁경부암 검진 질문 초안 준비됨 · ${summary.status} · 근거 ${summary.sourceIds.length}개: ${sourceLabels}`;
}

export function getCervicalCancerCareSource(sourceId: string) {
  return cervicalCancerCareSources[sourceId];
}

export function formatCervicalCancerCareSourceLinkLabel(sourceId: string) {
  const source = getCervicalCancerCareSource(sourceId);
  return source ? `출처: ${source.label}` : "출처: 공식 자궁경부암 케어 자료";
}

export function buildCervicalCancerCareSourceLinkLabels(
  sourceId: string,
  contextLabel?: string,
): CervicalCancerCareSourceLinkLabels {
  const source = getCervicalCancerCareSource(sourceId);
  const sourceLabel = source?.label ?? "공식 자궁경부암 케어 자료";
  const context = contextLabel?.trim() || "자궁경부암 케어";
  const prefix = `${context} 공식 출처`;
  const label = `${prefix} ${sourceLabel} 열기`;

  return {
    ariaLabel: label,
    title: label,
    visibleLabel: formatCervicalCancerCareSourceLinkLabel(sourceId),
  };
}

export function formatCervicalCancerCareListItemAriaLabel(
  item: CervicalCancerCareRecordDraftItem,
) {
  const source = getCervicalCancerCareSource(item.sourceId);
  const detail = item.detail.trim().replace(/[.。]+$/, "");
  const sourceText = source ? ` 출처: ${source.label}.` : "";

  return `${item.label}. ${detail}.${sourceText}`;
}

export function formatCervicalCancerCareItemDraftActionLabel(
  item: CervicalCancerCareRecordDraftItem,
) {
  return `${item.label} 자궁경부암 기록 메모 초안 만들기`;
}

export function formatCervicalCancerCareAlertDraftActionLabel(alert: CervicalCancerCareAlert) {
  return `${alert.title} 자궁경부암 증상 기록 초안 만들기`;
}

export function formatCervicalCancerCarePromptDraftActionLabel(prompt: CervicalCancerCarePrompt) {
  return `${prompt.topic} 자궁경부암 질문 초안 만들기`;
}

export function formatCervicalCancerCarePromptQuestionDraftReadyStatus(
  prompt: CervicalCancerCarePrompt,
) {
  return `자궁경부암 질문 초안 준비됨: ${prompt.topic}`;
}

export function formatCervicalCancerCareSourceEvidence(sourceId: string) {
  const source = getCervicalCancerCareSource(sourceId);
  return source
    ? `출처: ${source.label} - ${source.url}`
    : "출처: 공식 자궁경부암 케어 자료";
}

function formatCervicalCancerCareSourceCitation(sourceId: string) {
  const source = getCervicalCancerCareSource(sourceId);
  return source ? `${source.label} (${source.url})` : "공식 자궁경부암 케어 자료";
}

export function buildCervicalCancerCarePromptQuestion(prompt: CervicalCancerCarePrompt) {
  return `${prompt.question}\n${formatCervicalCancerCareSourceEvidence(prompt.sourceId)}`;
}

export function buildCervicalCancerCarePromptQuestionDraft(
  prompt: CervicalCancerCarePrompt,
  date: string,
): CervicalCancerCarePromptQuestionDraft {
  return {
    date,
    priority: "next-visit",
    question: buildCervicalCancerCarePromptQuestion(prompt),
    status: "open",
    topic: prompt.topic,
  };
}

export function formatCervicalCancerCareAlertEvidence(alert: CervicalCancerCareAlert) {
  return `${alert.title}: ${alert.detail} / 확인: ${alert.action} (${formatCervicalCancerCareSourceEvidence(alert.sourceId)})`;
}

export function formatCervicalCancerCareItemEvidence(
  item: CervicalCancerCareRecordDraftItem,
) {
  return `${item.label}: ${item.detail} (${formatCervicalCancerCareSourceEvidence(item.sourceId)})`;
}

export function formatCervicalCancerCarePriorityEvidence(
  item: CervicalCancerCarePriorityItem,
) {
  const sources = item.sourceIds
    .map(formatCervicalCancerCareSourceCitation)
    .join("; ");

  return `${item.label}: ${item.detail} (근거: ${sources})`;
}

export function formatCervicalCancerCareAlertRecordFieldEvidence(
  item: CervicalCancerCareAlertRecordField,
) {
  const sources = item.sourceIds
    .map(formatCervicalCancerCareSourceCitation)
    .join("; ");

  return `${item.label}: ${item.detail} (근거: ${sources})`;
}

export function buildCervicalCancerAlertSymptomDraft(
  alert: CervicalCancerCareAlert,
): CervicalCancerCareSymptomDraft {
  const recordFieldLines = cervicalCancerCareAlertRecordFields.map(
    (field) => `  - ${field.label}: ${field.detail}`,
  );

  return {
    action: alert.action,
    body: [
      "자궁경부암 경고 신호 기록 초안",
      `- 공식 증상 근거: ${alert.detail}`,
      "- 기록 항목 가이드:",
      ...recordFieldLines,
      "- 내 기록:",
      "- 발생 시점:",
      "- 양·색·냄새/통증 정도:",
      "- 유발 상황:",
      "- 동반 증상:",
      `- 진료팀에 확인할 기준: ${alert.action}`,
      formatCervicalCancerCareSourceEvidence(alert.sourceId),
    ].join("\n"),
    symptom: alert.title,
  };
}

export function buildCervicalCancerCareItemSymptomDraft(
  item: CervicalCancerCareRecordDraftItem,
): CervicalCancerCareSymptomDraft {
  return {
    action: `${item.label} 내용을 다음 진료 때 진료팀에 확인`,
    body: [
      "자궁경부암 기록 메모 초안",
      `- 기록 항목: ${item.label}`,
      `- 공식 근거/기록 기준: ${item.detail}`,
      "- 내 기록:",
      "- 발생/확인 날짜:",
      "- 변화 추세:",
      "- 진료팀에 확인할 질문:",
      formatCervicalCancerCareSourceEvidence(item.sourceId),
    ].join("\n"),
    symptom: item.label,
  };
}
