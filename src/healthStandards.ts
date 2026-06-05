export type HealthStandardCoverageStatus =
  | "implemented"
  | "input-helper"
  | "user-range-required";

export type HealthStandardCoverage = {
  id: string;
  label: string;
  sexApplicability: string;
  status: HealthStandardCoverageStatus;
  sexSpecific: boolean;
  sourceLabel: string;
  sourceUrl: string;
  summary: string;
};

export type HealthStandardApplicabilitySummary = {
  id: string;
  label: string;
  detail: string;
};

export type ProfileSexStandardNote = {
  detail: string;
  id: string;
  label: string;
};

export type ProfileMetricSexStandardChip = ProfileSexStandardNote & {
  sourceLabel: string;
  sourceUrl: string;
  standardId: string;
};

const profileMetricSexStandardChipCoverageIds: Record<string, string> = {
  ggt: "ggt",
  hdl: "hdl",
  hemoglobin: "hemoglobin",
  waist: "waist",
};

export type VitalStandardRangeLine = {
  detail: string;
  id: string;
  label: string;
  tone?: "risk";
};

export type VitalStandardRangeSection = {
  id: string;
  label: string;
  lines: VitalStandardRangeLine[];
  sourceLabel: string;
  sourceUrl: string;
  standardId: string;
};

export type HealthStandardRangeFilterId = "all" | "vitals" | "diabetes" | "labs" | "cancer";

export type HealthStandardRangeFilterOption = {
  detail: string;
  id: HealthStandardRangeFilterId;
  label: string;
  standardIds: string[];
};

export type HealthStandardRangeFilterSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type HealthStandardSourceLinkLabels = {
  ariaLabel: string;
  title: string;
  visibleLabel: string;
};

export type HealthStandardSourceLinkLabelOptions = {
  surfaceLabel?: string;
};

export type DashboardMetricStandardEvidence = {
  contextLabel: string;
  note: string;
  sourceLabel: string;
  sourceUrl: string;
  linkLabels: HealthStandardSourceLinkLabels;
};

export type VitalStandardQuestionDraftInput = {
  assessmentLabel: string;
  assessmentSummary: string;
  measurementLabel: string;
  note?: string;
  standardId: string;
};

export type VitalSavePreviewLabelInput = {
  assessmentLabel: string;
  measurementLabel: string;
  standardLabel: string;
  standardSexApplicability: string;
};

export type VitalStandardQuestionDraft = {
  question: string;
  topic: string;
};

export type HealthStandardSexApplicabilityBadge = {
  label: "남녀 공통" | "성별 분리";
  tone: "common" | "specific";
};

export const healthStandardStatusLabel: Record<HealthStandardCoverageStatus, string> = {
  implemented: "판정 적용",
  "input-helper": "입력 보조",
  "user-range-required": "사용자 기준 우선",
};

export const feverInfectionStandardSymptomDraftActionLabel =
  "체온·감염 연락 기준 증상 기록 초안 만들기";

export const feverInfectionStandardQuestionDraftActionLabel =
  "체온·감염 연락 기준 진료 질문 초안 만들기";

export const koreanHealthStandardUseBoundary =
  "성인 기준 참고용입니다. 임신·소아·투석·항암 중 특수 기준이나 증상이 있으면 결과지와 진료팀 기준을 우선합니다.";

export const koreanHealthStandardApplicabilitySummary: HealthStandardApplicabilitySummary[] = [
  {
    id: "common",
    label: "남녀 공통",
    detail:
      "BMI·혈압·혈당·저혈당·현저한 고혈당·체온 기준 · A1C/FPG/PP2·BUN/Cr/eGFR/UACR·Na/K·총콜레스테롤/LDL/TG·AST/ALT·Alb/Ca/P/요산 기준·ANC/PLT 위험 기준",
  },
  {
    id: "sex-specific",
    label: "성별 분리",
    detail: "허리둘레 남성 90cm/여성 85cm · HDL·GGT·헤모글로빈·RBC·Hct 프리셋",
  },
  {
    id: "lab-range",
    label: "결과지 우선",
    detail: "기타 검사실 수치는 병원 결과지 입력값",
  },
];

export const koreanHealthStandardCoverage: HealthStandardCoverage[] = [
  {
    id: "bmi",
    label: "한국 성인 BMI",
    sexApplicability: "성인 남녀 공통",
    status: "implemented",
    sexSpecific: false,
    sourceLabel: "대한비만학회 비만 진료지침 2022",
    sourceUrl: "https://general.kosso.or.kr/html/user/core/view/reaction/main/kosso/inc/data/guideline2022_vol8.pdf",
    summary: "대한비만학회 한국인 성인 BMI 구간으로 대시보드와 진료 요약을 판정합니다.",
  },
  {
    id: "waist",
    label: "한국 성인 허리둘레",
    sexApplicability: "남성 90cm, 여성 85cm 분리",
    status: "implemented",
    sexSpecific: true,
    sourceLabel: "대한비만학회 비만 진료지침 2022",
    sourceUrl: "https://general.kosso.or.kr/html/user/core/view/reaction/main/kosso/inc/data/guideline2022_vol8.pdf",
    summary: "남성 90cm, 여성 85cm 복부비만 기준으로 대시보드 판정을 표시합니다.",
  },
  {
    id: "blood-pressure",
    label: "한국 성인 혈압",
    sexApplicability: "성인 남녀 공통",
    status: "implemented",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 고혈압",
    sourceUrl: "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28",
    summary: "정상, 주의혈압, 고혈압 전단계, 1기, 2기 범위를 한국 기준으로 표시합니다.",
  },
  {
    id: "low-blood-pressure",
    label: "저혈압 확인 기준",
    sexApplicability: "성인 남녀 공통",
    status: "implemented",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 저혈압",
    sourceUrl: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5259",
    summary: "90/60 mmHg 이하 저혈압 가능 범위와 어지러움, 피로, 실신 등 동반 증상 확인을 표시합니다.",
  },
  {
    id: "glucose-care",
    label: "당뇨 추적 혈당",
    sexApplicability: "성인 남녀 공통",
    status: "implemented",
    sexSpecific: false,
    sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
    sourceUrl: "https://www.diabetes.or.kr/general/info/treat/treat_01.php",
    summary: "당뇨 추적 프로필에서는 식전과 식후 2시간 일반 조절목표를 적용합니다.",
  },
  {
    id: "hypoglycemia",
    label: "저혈당 확인 기준",
    sexApplicability: "성인 남녀 공통 · 70 mg/dL 미만과 증상·의식상태 확인",
    status: "implemented",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 급성 합병증_저혈당",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2350",
    summary:
      "70 mg/dL 미만 저혈당 범위와 손떨림, 식은땀, 쇠약, 어지럼, 의식 변화 같은 동반 증상 기록을 한국 공식 자료 기준으로 표시합니다.",
  },
  {
    id: "marked-hyperglycemia",
    label: "현저한 고혈당 확인 기준",
    sexApplicability: "성인 남녀 공통 · 250 mg/dL 이상과 탈수·의식저하 확인",
    status: "implemented",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 고혈당",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5304",
    summary:
      "250 mg/dL 이상 현저한 고혈당, 다음·다뇨·체중감소, 탈수, 의식저하, 케톤산증·고삼투질상태 의심 증상 기록을 한국 공식 자료 기준으로 표시합니다.",
  },
  {
    id: "glucose-screening",
    label: "혈당 선별 기준",
    sexApplicability: "성인 남녀 공통",
    status: "implemented",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 당뇨병",
    sourceUrl: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5305",
    summary: "당뇨 추적이 꺼진 프로필에서는 공복혈당과 식후 2시간 선별 기준을 적용합니다.",
  },
  {
    id: "a1c-fpg-pp2",
    label: "A1C/FPG/식후 2시간 검사",
    sexApplicability: "성인 남녀 공통",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 당뇨병",
    sourceUrl: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5305",
    summary: "검사 프리셋으로 한국 당뇨 전단계/진단 기준 문구와 기본 상한을 채웁니다.",
  },
  {
    id: "infection-fever",
    label: "체온·감염 연락 기준",
    sexApplicability: "암환자 공통",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "국가암정보센터 감염 의료진 상담 기준",
    sourceUrl: "https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
    summary: "암환자 발열·오한과 감염 의심 증상을 기록하고 진료팀 연락 기준을 확인하도록 돕습니다.",
  },
  {
    id: "anc-infection-risk",
    label: "ANC 감염 위험 프리셋",
    sexApplicability: "암환자 남녀 공통 · ANC <500 cells/mm²와 발열 기준 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "국가암정보센터 항암 부작용 증상 관리 지침",
    sourceUrl: "https://cancer.go.kr/download.do?uuid=d402e586-c237-419d-ae6f-da36d3b97109.pdf",
    summary: "ANC 500 미만과 발열·오한·호흡기 증상을 함께 기록해 진료팀 확인 기준을 놓치지 않도록 돕습니다.",
  },
  {
    id: "platelet-bleeding-risk",
    label: "혈소판 출혈 위험 기준",
    sexApplicability: "암환자 남녀 공통 · PLT <75,000/mm³부터 출혈 예방 기준 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "국가암정보센터 항암 부작용 증상 관리 지침",
    sourceUrl: "https://cancer.go.kr/download.do?uuid=d402e586-c237-419d-ae6f-da36d3b97109.pdf",
    summary: "혈소판 감소와 코피·검은 변·혈뇨·비정상 질출혈 같은 출혈 신호를 함께 기록해 진료팀 확인 기준을 놓치지 않도록 돕습니다.",
  },
  {
    id: "kidney-function",
    label: "BUN/Cr 신기능 프리셋",
    sexApplicability: "BUN·Cr 성인 남녀 공통 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
    summary:
      "BUN 10-26 mg/dL, 성인 Cr 0.7-1.4 mg/dL 보조값을 제공합니다. 탈수, 근육량, 소변검사, eGFR, 진료팀 기준과 함께 확인합니다.",
  },
  {
    id: "egfr",
    label: "eGFR 신장여과율 프리셋",
    sexApplicability: "성인 남녀 공통 · eGFR 60 mL/min/1.73m² 미만 3개월 지속 기준 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 만성콩팥병",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5457",
    summary:
      "eGFR 60 미만이 3개월 이상 지속되거나 알부민뇨·혈뇨·영상 이상 같은 콩팥 손상 근거가 있으면 진료팀 확인이 필요하다는 기준을 입력 보조로 제공합니다.",
  },
  {
    id: "albuminuria",
    label: "UACR 알부민뇨 프리셋",
    sexApplicability: "성인 남녀 공통 · UACR 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 만성콩팥병",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5457",
    summary:
      "알부민뇨 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 단계를 eGFR과 함께 확인하도록 입력 보조로 제공합니다. 반복 정량검사와 진료팀 기준을 우선합니다.",
  },
  {
    id: "electrolytes",
    label: "Na/K 전해질 프리셋",
    sexApplicability: "Na·K 성인 남녀 공통 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
    summary:
      "나트륨 135-145 mmol/L, 칼륨 3.5-5.5 mmol/L 보조값을 제공합니다. 구토, 설사, 탈수, 신장 상태, 약물 영향과 함께 확인합니다.",
  },
  {
    id: "lipids-common",
    label: "지질 검사 공통 프리셋",
    sexApplicability: "총콜레스테롤·LDL·중성지방 성인 공통 입력 보조값",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 이상지질혈증 관리",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=124",
    summary:
      "총콜레스테롤, LDL, 중성지방 프리셋은 KDCA 심뇌혈관질환 고위험군 관리 자료의 이상지질혈증 표를 공통 보조값으로 제공합니다.",
  },
  {
    id: "hdl",
    label: "HDL 콜레스테롤 프리셋",
    sexApplicability: "HDL 남성 40 mg/dL 이상, 여성 50 mg/dL 이상 분리",
    status: "input-helper",
    sexSpecific: true,
    sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
    sourceUrl: "https://www.diabetes.or.kr/general/info/treat/treat_01.php",
    summary: "HDL 프리셋은 남성 40 mg/dL 이상, 여성 50 mg/dL 이상으로 나눠 제공합니다.",
  },
  {
    id: "ggt",
    label: "GGT 감마지티피 프리셋",
    sexApplicability: "GGT 남성 11-63 IU/L, 여성 8-35 IU/L 분리",
    status: "input-helper",
    sexSpecific: true,
    sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
    summary: "GGT 프리셋은 KDCA 임상화학 검사 참고범위에 따라 남성 11-63 IU/L, 여성 8-35 IU/L로 나눠 제공합니다.",
  },
  {
    id: "liver-enzymes",
    label: "AST/ALT 간기능 프리셋",
    sexApplicability: "AST·ALT 성인 남녀 공통 0-40 IU/L 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 간기능검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5444",
    summary: "AST/ALT 프리셋은 KDCA 간기능검사 참고범위에 따라 각각 0-40 IU/L로 제공합니다. 단독 진단이 아니라 임상 상황과 다른 검사를 함께 확인합니다.",
  },
  {
    id: "serum-albumin",
    label: "알부민/총단백 프리셋",
    sexApplicability: "성인 남녀 공통 · 알부민 3.3-5.2 g/dL, 총단백 6.0-8.0 g/dL 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
    summary:
      "혈청 알부민 3.3-5.2 g/dL과 총단백 6.0-8.0 g/dL 보조값을 제공합니다. 간질환, 신장질환, 영양 결핍, 단백 소실, 만성 염증, 탈수 영향을 결과지와 진료팀 기준으로 확인합니다.",
  },
  {
    id: "calcium",
    label: "칼슘 프리셋",
    sexApplicability: "성인 남녀 공통 · 칼슘 8.8-10.5 mg/dL 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
    summary:
      "칼슘 8.8-10.5 mg/dL 보조값을 제공합니다. 뼈 전이 암, 비타민D·부갑상선·신부전, 알부민·영양 상태, 결과지 기준, 진료팀 기준과 함께 확인합니다.",
  },
  {
    id: "phosphate",
    label: "인산 프리셋",
    sexApplicability: "성인 남녀 공통 · 인산 2.5-4.5 mg/dL 입력 보조",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
    summary:
      "성인 인산 2.5-4.5 mg/dL 보조값을 제공합니다. 신부전, 부갑상선 기능, 칼슘·비타민D 균형, 이뇨제·제산제, 영양 상태, 결과지 기준, 진료팀 기준과 함께 확인합니다.",
  },
  {
    id: "uric-acid",
    label: "요산 프리셋",
    sexApplicability: "성인 남녀 공통 입력 보조 · 요산 3-7 mg/dL, 남성은 여성보다 0.5-1.5 mg/dL 높을 수 있음",
    status: "input-helper",
    sexSpecific: false,
    sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5531",
    summary:
      "요산 3-7 mg/dL 보조값을 제공합니다. 전이암, 다발골수종, 백혈병, 항암치료, 신장 배설 변화, 결과지 성별 기준, 진료팀 기준과 함께 확인합니다.",
  },
  {
    id: "hemoglobin",
    label: "헤모글로빈 성별 프리셋",
    sexApplicability: "헤모글로빈 남성 13.0-17.0 g/dL, 여성 12.0-16.0 g/dL 분리",
    status: "input-helper",
    sexSpecific: true,
    sourceLabel: "서울아산병원 혈색소 검사 참고치",
    sourceUrl: "https://rso.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=119",
    summary: "헤모글로빈 프리셋은 성별 참고치를 채우되 검사실 결과지 기준을 우선합니다.",
  },
  {
    id: "cbc",
    label: "CBC/항암 추적 프리셋",
    sexApplicability: "WBC·PLT 성인 공통, RBC·Hct 남녀 분리 입력 보조, 결과지 기준 우선",
    status: "input-helper",
    sexSpecific: true,
    sourceLabel: "서울아산병원 전혈구검사 참고치",
    sourceUrl: "https://ent.amc.seoul.kr/asan/mobile/healthinfo/management/managementDetail.do?managementId=126",
    summary: "WBC, RBC, Hct, 혈소판 프리셋을 제공하고 성별·검사실·치료 상태에 따른 결과지 기준 입력을 우선합니다.",
  },
  {
    id: "lab-ranges",
    label: "기타 검사실 기준",
    sexApplicability: "검사실 결과지 기준 우선",
    status: "user-range-required",
    sexSpecific: false,
    sourceLabel: "사용자 입력 검사실 기준 범위",
    sourceUrl: "local-user-entered-range",
    summary: "검사실·병원·치료 상태마다 달라질 수 있어 결과지의 하한/상한 입력값을 우선합니다.",
  },
];

const vitalStandardRangeLines: Record<string, VitalStandardRangeLine[]> = {
  bmi: [
    {
      id: "bmi-underweight",
      label: "저체중",
      detail: "남녀 공통 · <18.5 kg/m²",
    },
    {
      id: "bmi-normal",
      label: "정상",
      detail: "남녀 공통 · 18.5-22.9 kg/m²",
    },
    {
      id: "bmi-pre-obesity",
      label: "비만전단계",
      detail: "남녀 공통 · 23-24.9 kg/m²",
    },
    {
      id: "bmi-obesity",
      label: "비만",
      detail: "남녀 공통 · 1단계 25-29.9, 2단계 30-34.9, 3단계 35 이상 kg/m²",
      tone: "risk",
    },
  ],
  waist: [
    {
      id: "waist-male-abdominal-obesity",
      label: "남성 복부비만",
      detail: "남성 기준 · 90cm 이상",
      tone: "risk",
    },
    {
      id: "waist-female-abdominal-obesity",
      label: "여성 복부비만",
      detail: "여성 기준 · 85cm 이상",
      tone: "risk",
    },
  ],
  "blood-pressure": [
    {
      id: "bp-normal",
      label: "정상",
      detail: "남녀 공통 · <120/<80 mmHg",
    },
    {
      id: "bp-watch",
      label: "주의/전단계",
      detail: "남녀 공통 · 주의 120-129/<80, 전단계 130-139 또는 80-89 mmHg",
    },
    {
      id: "bp-hypertension",
      label: "고혈압",
      detail: "남녀 공통 · 1기 140/90 이상, 2기 160/100 이상, 위기 가능 180/120 이상",
      tone: "risk",
    },
  ],
  "low-blood-pressure": [
    {
      id: "low-bp-threshold",
      label: "저혈압 가능",
      detail: "남녀 공통 · 90/60 mmHg 이하",
      tone: "risk",
    },
    {
      id: "low-bp-symptoms",
      label: "동반 증상",
      detail: "남녀 공통 · 어지러움, 피로, 실신, 탈수·출혈·약물 영향 확인",
      tone: "risk",
    },
    {
      id: "low-bp-acute-care",
      label: "급성 확인",
      detail: "남녀 공통 · 급성 저혈압이나 쇼크 의심 시 즉시 병원 치료 필요",
      tone: "risk",
    },
  ],
  "glucose-care": [
    {
      id: "glucose-care-before-meal",
      label: "식전/공복 목표",
      detail: "남녀 공통 · 80-130 mg/dL",
    },
    {
      id: "glucose-care-after-meal",
      label: "식후 2시간 목표",
      detail: "남녀 공통 · 180 mg/dL 미만",
    },
    {
      id: "glucose-care-individualized",
      label: "개별 목표",
      detail: "남녀 공통 · 나이, 유병 기간, 동반질환, 저혈당 인지 능력에 따라 진료팀 목표 우선",
    },
  ],
  hypoglycemia: [
    {
      id: "hypoglycemia-threshold",
      label: "저혈당",
      detail: "남녀 공통 · 70 mg/dL 미만이면 증상·의식상태와 대처 기준 확인",
      tone: "risk",
    },
    {
      id: "hypoglycemia-symptoms",
      label: "동반 증상",
      detail: "남녀 공통 · 손떨림, 불안감, 식은땀, 공복감, 쇠약, 피로, 어지럼, 의식 변화",
      tone: "risk",
    },
    {
      id: "hypoglycemia-context",
      label: "원인 기록",
      detail: "남녀 공통 · 당뇨병약, 식사 불규칙, 활동량 증가, 과음, 중증 저혈당 병력 확인",
    },
  ],
  "marked-hyperglycemia": [
    {
      id: "marked-hyperglycemia-threshold",
      label: "현저한 고혈당",
      detail: "남녀 공통 · 250 mg/dL 이상이면 현저한 고혈당으로 병원 확인 기준",
      tone: "risk",
    },
    {
      id: "marked-hyperglycemia-symptoms",
      label: "동반 증상",
      detail: "남녀 공통 · 다음, 다뇨, 다식, 체중 감소, 탈수, 구토, 복통, 의식저하 확인",
      tone: "risk",
    },
    {
      id: "marked-hyperglycemia-acute-risk",
      label: "급성 합병증 확인",
      detail: "남녀 공통 · 1형 당뇨 케톤산증, 고령 2형 당뇨 고삼투질상태 가능성은 병원 기준 우선",
      tone: "risk",
    },
  ],
  "glucose-screening": [
    {
      id: "glucose-screening-fasting",
      label: "공복",
      detail: "남녀 공통 · 정상 <100, 전단계 100-125, 진단 기준 126 이상 mg/dL",
    },
    {
      id: "glucose-screening-after-meal",
      label: "식후 2시간",
      detail: "남녀 공통 · 정상 <140, 내당능장애 140-199, 진단 기준 200 이상 mg/dL",
    },
    {
      id: "glucose-screening-random",
      label: "무작위",
      detail: "남녀 공통 · 증상과 함께 200 mg/dL 이상이면 진단 기준 가능성 확인",
    },
  ],
  "a1c-fpg-pp2": [
    {
      id: "a1c-normal",
      label: "A1C 정상",
      detail: "남녀 공통 · 당화혈색소 <5.7%",
    },
    {
      id: "a1c-prediabetes",
      label: "A1C 전단계",
      detail: "남녀 공통 · 5.7-6.4%는 당뇨병 전단계",
    },
    {
      id: "a1c-diagnosis",
      label: "A1C 진단 기준",
      detail: "남녀 공통 · 6.5% 이상이면 당뇨병 진단 기준 가능성 확인",
      tone: "risk",
    },
    {
      id: "a1c-care-target",
      label: "A1C 관리 목표",
      detail: "남녀 공통 · 성인 2형 당뇨병 일반 목표 6.5% 미만, 개인별 목표는 진료팀 확인",
    },
  ],
  "kidney-function": [
    {
      id: "bun-reference",
      label: "BUN",
      detail: "남녀 공통 · 10-26 mg/dL, 병원 결과지 기준 우선",
    },
    {
      id: "creatinine-reference",
      label: "Cr",
      detail: "남녀 공통 · 성인 0.7-1.4 mg/dL, 병원 결과지 기준 우선",
    },
    {
      id: "kidney-function-check",
      label: "상승 확인",
      detail:
        "남녀 공통 · 단독 진단이 아니라 탈수·근육량·약물·소변검사·eGFR·진료팀 기준과 함께 확인",
      tone: "risk",
    },
  ],
  egfr: [
    {
      id: "egfr-preserved",
      label: "보존 범위",
      detail: "남녀 공통 · 60 mL/min/1.73m² 이상이어도 단백뇨·혈뇨 등 콩팥 손상 근거는 별도 확인",
    },
    {
      id: "egfr-persistent-low",
      label: "60 미만 지속",
      detail: "남녀 공통 · 60 미만이 3개월 이상 지속되면 만성콩팥병 기준 가능성 진료팀 확인",
      tone: "risk",
    },
    {
      id: "egfr-albuminuria-check",
      label: "동반 확인",
      detail: "남녀 공통 · 알부민뇨·혈뇨·소변검사·혈청 Cr·영상검사·전해질 이상과 함께 확인",
    },
  ],
  albuminuria: [
    {
      id: "albuminuria-a1",
      label: "A1 낮음",
      detail: "남녀 공통 · 알부민뇨 30 mg/g 미만",
    },
    {
      id: "albuminuria-a2",
      label: "A2 증가",
      detail: "남녀 공통 · 30-300 mg/g 범위는 반복 정량검사와 eGFR 함께 확인",
      tone: "risk",
    },
    {
      id: "albuminuria-a3",
      label: "A3 고도 증가",
      detail: "남녀 공통 · 300 mg/g 이상이면 말기 신부전 진행 위험 평가 진료팀 확인",
      tone: "risk",
    },
  ],
  electrolytes: [
    {
      id: "sodium-reference",
      label: "Na",
      detail: "남녀 공통 · 135-145 mmol/L, 병원 결과지 기준 우선",
    },
    {
      id: "potassium-reference",
      label: "K",
      detail: "남녀 공통 · 3.5-5.5 mmol/L, 병원 결과지 기준 우선",
    },
    {
      id: "electrolyte-change-check",
      label: "변화 확인",
      detail:
        "남녀 공통 · 단독 진단이 아니라 구토·설사·탈수·신장 상태·심장 증상·약물·진료팀 기준과 함께 확인",
      tone: "risk",
    },
  ],
  "lipids-common": [
    {
      id: "lipids-optimal",
      label: "적정",
      detail: "남녀 공통 · 총콜레스테롤 <200, LDL-C <100, 중성지방 <150 mg/dL",
    },
    {
      id: "lipids-borderline",
      label: "경계",
      detail: "남녀 공통 · 총콜레스테롤 200-239, LDL-C 130-159, 중성지방 150-199 mg/dL",
    },
    {
      id: "lipids-high",
      label: "높음",
      detail: "남녀 공통 · 총콜레스테롤 240 이상, LDL-C 160 이상(190 이상 매우 높음), 중성지방 200 이상(500 이상 매우 높음) mg/dL",
      tone: "risk",
    },
    {
      id: "lipids-annual-check",
      label: "정기검사",
      detail: "남녀 공통 · 고위험군은 매년 지질검사, 수치 이상 시 전문의 상담으로 맞춤 치료계획 확인",
    },
  ],
  hdl: [
    {
      id: "hdl-male-target",
      label: "남성 HDL",
      detail: "남성 기준 · 40 mg/dL 이상",
    },
    {
      id: "hdl-female-target",
      label: "여성 HDL",
      detail: "여성 기준 · 50 mg/dL 이상",
    },
    {
      id: "hdl-low-check",
      label: "낮음 확인",
      detail: "성별 분리 · 남성 40 미만 또는 여성 50 미만이면 결과지와 심혈관 위험도 기준 확인",
      tone: "risk",
    },
  ],
  ggt: [
    {
      id: "ggt-male-reference",
      label: "남성 GGT",
      detail: "남성 기준 · 11-63 IU/L, 병원 결과지 기준 우선",
    },
    {
      id: "ggt-female-reference",
      label: "여성 GGT",
      detail: "여성 기준 · 8-35 IU/L, 병원 결과지 기준 우선",
    },
    {
      id: "ggt-high-check",
      label: "상승 확인",
      detail: "성별 분리 · 간담도·음주·약물 영향이 있을 수 있어 결과지와 진료팀 기준 확인",
      tone: "risk",
    },
  ],
  "liver-enzymes": [
    {
      id: "ast-reference",
      label: "AST",
      detail: "남녀 공통 · 0-40 IU/L, 병원 결과지 기준 우선",
    },
    {
      id: "alt-reference",
      label: "ALT",
      detail: "남녀 공통 · 0-40 IU/L, 병원 결과지 기준 우선",
    },
    {
      id: "liver-enzyme-high-check",
      label: "상승 확인",
      detail: "남녀 공통 · 단독 진단이 아니라 증상·약물·영상·다른 검사와 함께 진료팀 기준 확인",
      tone: "risk",
    },
  ],
  "serum-albumin": [
    {
      id: "albumin-reference",
      label: "알부민",
      detail: "남녀 공통 · 3.3-5.2 g/dL, 병원 결과지 기준 우선",
    },
    {
      id: "total-protein-reference",
      label: "총단백",
      detail: "남녀 공통 · 6.0-8.0 g/dL, 알부민과 함께 확인",
    },
    {
      id: "albumin-low-check",
      label: "낮음 확인",
      detail: "남녀 공통 · 단독 진단이 아니라 간질환·신장질환·영양 결핍·단백 소실·만성 염증·탈수와 진료팀 기준 확인",
      tone: "risk",
    },
  ],
  calcium: [
    {
      id: "calcium-reference",
      label: "Ca",
      detail: "남녀 공통 · 8.8-10.5 mg/dL, 병원 결과지 기준 우선",
    },
    {
      id: "calcium-high-context",
      label: "상승 확인",
      detail:
        "남녀 공통 · 단독 진단이 아니라 뼈 전이 암·갑상선기능항진증·비타민D 과다·약물·진료팀 기준 확인",
      tone: "risk",
    },
    {
      id: "calcium-low-context",
      label: "감소 확인",
      detail:
        "남녀 공통 · 부갑상선저하증·신부전·비타민D·마그네슘·인·영양실조·알부민 감소와 함께 확인",
      tone: "risk",
    },
  ],
  phosphate: [
    {
      id: "phosphate-reference",
      label: "P",
      detail: "남녀 공통 · 성인 2.5-4.5 mg/dL, 병원 결과지 기준 우선",
    },
    {
      id: "phosphate-high-context",
      label: "상승 확인",
      detail:
        "남녀 공통 · 단독 진단이 아니라 신부전·부갑상선기능저하증·인 성분 약제·진료팀 기준 확인",
      tone: "risk",
    },
    {
      id: "phosphate-low-context",
      label: "감소 확인",
      detail:
        "남녀 공통 · 고칼슘혈증·이뇨제·장기간 제산제·비타민D 결핍 골질환·영양실조·알코올중독과 함께 확인",
      tone: "risk",
    },
  ],
  "uric-acid": [
    {
      id: "uric-acid-reference",
      label: "요산",
      detail: "남녀 공통 입력 보조 · 3-7 mg/dL, 남성은 여성보다 0.5-1.5 mg/dL 높을 수 있어 결과지 기준 우선",
    },
    {
      id: "uric-acid-context",
      label: "상승 맥락",
      detail:
        "남녀 공통 · 단독 진단이 아니라 전이암·다발골수종·백혈병·항암치료·신장 배설 변화·탈수·진료팀 기준 확인",
      tone: "risk",
    },
    {
      id: "uric-acid-result-sheet",
      label: "결과지 우선",
      detail: "남녀 공통 · 병원·검사법·성별 참고치가 다를 수 있어 결과지 범위와 함께 기록",
    },
  ],
  hemoglobin: [
    {
      id: "hgb-male-reference",
      label: "남성 헤모글로빈",
      detail: "남성 입력 보조 · 13.0-17.0 g/dL, 병원 결과지 기준 우선",
    },
    {
      id: "hgb-female-reference",
      label: "여성 헤모글로빈",
      detail: "여성 입력 보조 · 12.0-16.0 g/dL, 병원 결과지 기준 우선",
    },
    {
      id: "hgb-result-sheet-priority",
      label: "결과지 우선",
      detail: "성별·검사실·치료 상태에 따라 달라질 수 있어 병원 결과지 기준을 우선",
    },
  ],
  cbc: [
    {
      id: "wbc-reference",
      label: "WBC",
      detail: "남녀 공통 · 4.0-10.0 10^3/uL, 병원 결과지 기준 우선",
    },
    {
      id: "rbc-male-reference",
      label: "남성 RBC",
      detail: "남성 입력 보조 · 4.2-6.3 10^6/uL, 병원 결과지 기준 우선",
    },
    {
      id: "rbc-female-reference",
      label: "여성 RBC",
      detail: "여성 입력 보조 · 4.0-5.4 10^6/uL, 병원 결과지 기준 우선",
    },
    {
      id: "hct-male-reference",
      label: "남성 Hct",
      detail: "남성 입력 보조 · 38-53%, 병원 결과지 기준 우선",
    },
    {
      id: "hct-female-reference",
      label: "여성 Hct",
      detail: "여성 입력 보조 · 36-46%, 병원 결과지 기준 우선",
    },
    {
      id: "plt-reference",
      label: "PLT",
      detail: "남녀 공통 · 150-450 10^3/uL, 병원 결과지 기준 우선",
    },
    {
      id: "cbc-result-sheet-priority",
      label: "결과지 우선",
      detail: "성별·나이·신체상태·검사실·치료 상태에 따라 달라질 수 있어 병원 결과지 기준을 우선",
    },
  ],
  "anc-infection-risk": [
    {
      id: "anc-fever-threshold",
      label: "ANC 발열 기준",
      detail: "암환자 공통 · ANC <500 cells/mm²이면서 38.3℃ 1회 이상 또는 38.0℃ 1시간 이상 지속",
      tone: "risk",
    },
    {
      id: "anc-chemo-window",
      label: "항암 후 시기",
      detail: "암환자 공통 · 항암제 주사 후 보통 7-14일 사이 고열 빈도 증가",
    },
    {
      id: "anc-symptom-check",
      label: "동반 확인",
      detail: "암환자 공통 · 기침·호흡곤란, 오한·식은땀·탈수, 상처 발적·통증 기록",
      tone: "risk",
    },
  ],
  "platelet-bleeding-risk": [
    {
      id: "platelet-prevention-threshold",
      label: "출혈 예방 기준",
      detail: "암환자 공통 · 혈소판 <75,000/mm³이면 멍·코피·구강/질 출혈 기록",
      tone: "risk",
    },
    {
      id: "platelet-contact-threshold",
      label: "의료진 상담 기준",
      detail: "암환자 공통 · 혈소판 <50,000/mm³ 수준 또는 지속 코피·검은 변·혈뇨·비정상 질출혈 확인",
      tone: "risk",
    },
    {
      id: "platelet-emergency-check",
      label: "응급 확인",
      detail: "암환자 공통 · 10분 이상 압박해도 계속되는 출혈, 호흡곤란, 의식 변화 기록",
      tone: "risk",
    },
  ],
  "infection-fever": [
    {
      id: "infection-fever-threshold",
      label: "발열·오한 연락",
      detail: "암환자 공통 · 오한 또는 체온 38℃ 이상이면 즉시 응급실/진료팀 기준 확인",
      tone: "risk",
    },
    {
      id: "infection-fever-symptoms",
      label: "동반 증상",
      detail: "암환자 공통 · 오심·구토·설사, 흉통·호흡곤란, 배뇨통·빈뇨·소변색/냄새 변화 기록",
      tone: "risk",
    },
    {
      id: "infection-fever-record",
      label: "기록 항목",
      detail: "암환자 공통 · 체온, 측정 시간, 오한 지속, 소변/호흡기/카테터 부위 변화 기록",
    },
  ],
};

const vitalStandardRangeSectionConfigs = [
  {
    id: "bmi-ranges",
    label: "BMI 기준",
    standardId: "bmi",
  },
  {
    id: "waist-ranges",
    label: "허리둘레 기준",
    standardId: "waist",
  },
  {
    id: "blood-pressure-ranges",
    label: "혈압 기준",
    standardId: "blood-pressure",
  },
  {
    id: "low-blood-pressure-ranges",
    label: "저혈압 확인 기준",
    standardId: "low-blood-pressure",
  },
  {
    id: "glucose-care-ranges",
    label: "당뇨 추적 혈당 목표",
    standardId: "glucose-care",
  },
  {
    id: "hypoglycemia-ranges",
    label: "저혈당 확인 기준",
    standardId: "hypoglycemia",
  },
  {
    id: "marked-hyperglycemia-ranges",
    label: "현저한 고혈당 확인 기준",
    standardId: "marked-hyperglycemia",
  },
  {
    id: "glucose-screening-ranges",
    label: "혈당 선별 기준",
    standardId: "glucose-screening",
  },
  {
    id: "a1c-ranges",
    label: "A1C 검사 기준",
    standardId: "a1c-fpg-pp2",
  },
  {
    id: "kidney-function-ranges",
    label: "BUN/Cr 신기능 기준",
    standardId: "kidney-function",
  },
  {
    id: "egfr-ranges",
    label: "eGFR 신장여과율 기준",
    standardId: "egfr",
  },
  {
    id: "albuminuria-ranges",
    label: "UACR 알부민뇨 기준",
    standardId: "albuminuria",
  },
  {
    id: "electrolyte-ranges",
    label: "Na/K 전해질 기준",
    standardId: "electrolytes",
  },
  {
    id: "lipids-common-ranges",
    label: "지질 검사 기준",
    standardId: "lipids-common",
  },
  {
    id: "hdl-ranges",
    label: "HDL 성별 기준",
    standardId: "hdl",
  },
  {
    id: "ggt-ranges",
    label: "GGT 성별 기준",
    standardId: "ggt",
  },
  {
    id: "liver-enzyme-ranges",
    label: "AST/ALT 간기능 기준",
    standardId: "liver-enzymes",
  },
  {
    id: "serum-albumin-ranges",
    label: "알부민/총단백 기준",
    standardId: "serum-albumin",
  },
  {
    id: "calcium-ranges",
    label: "칼슘 기준",
    standardId: "calcium",
  },
  {
    id: "phosphate-ranges",
    label: "인산 기준",
    standardId: "phosphate",
  },
  {
    id: "uric-acid-ranges",
    label: "요산 기준",
    standardId: "uric-acid",
  },
  {
    id: "hemoglobin-ranges",
    label: "헤모글로빈 입력 보조",
    standardId: "hemoglobin",
  },
  {
    id: "cbc-ranges",
    label: "CBC 입력 보조",
    standardId: "cbc",
  },
  {
    id: "anc-infection-risk-ranges",
    label: "ANC 감염 위험 기준",
    standardId: "anc-infection-risk",
  },
  {
    id: "platelet-bleeding-risk-ranges",
    label: "혈소판 출혈 위험 기준",
    standardId: "platelet-bleeding-risk",
  },
  {
    id: "infection-fever-ranges",
    label: "체온·감염 연락 기준",
    standardId: "infection-fever",
  },
];

export const healthStandardRangeFilterOptions: HealthStandardRangeFilterOption[] = [
  {
    id: "all",
    label: "전체",
    detail: "모든 기준",
    standardIds: [],
  },
  {
    id: "vitals",
    label: "생활지표",
    detail: "BMI·허리·혈압·혈당·체온",
    standardIds: [
      "bmi",
      "waist",
      "blood-pressure",
      "low-blood-pressure",
      "glucose-care",
      "hypoglycemia",
      "marked-hyperglycemia",
      "glucose-screening",
      "infection-fever",
    ],
  },
  {
    id: "diabetes",
    label: "당뇨·지질",
    detail: "혈당·A1C·지질",
    standardIds: [
      "glucose-care",
      "hypoglycemia",
      "marked-hyperglycemia",
      "glucose-screening",
      "a1c-fpg-pp2",
      "lipids-common",
      "hdl",
    ],
  },
  {
    id: "labs",
    label: "검사",
    detail: "신기능·전해질·간기능·단백·칼슘·인산·요산·혈액",
    standardIds: [
      "a1c-fpg-pp2",
      "kidney-function",
      "egfr",
      "albuminuria",
      "electrolytes",
      "lipids-common",
      "hdl",
      "ggt",
      "liver-enzymes",
      "serum-albumin",
      "calcium",
      "phosphate",
      "uric-acid",
      "hemoglobin",
      "cbc",
      "anc-infection-risk",
      "platelet-bleeding-risk",
    ],
  },
  {
    id: "cancer",
    label: "암환자",
    detail: "감염·출혈 연락 기준",
    standardIds: ["infection-fever", "anc-infection-risk", "platelet-bleeding-risk"],
  },
];

export function getImplementedStandardCount() {
  return koreanHealthStandardCoverage.filter((item) => item.status === "implemented").length;
}

export function isExternalHealthStandardSource(item: HealthStandardCoverage) {
  return item.sourceUrl.startsWith("https://");
}

export function formatHealthStandardSource(item: HealthStandardCoverage) {
  return isExternalHealthStandardSource(item)
    ? `${item.sourceLabel} (${item.sourceUrl})`
    : item.sourceLabel;
}

export function buildHealthStandardSourceLinkLabels(
  sourceLabel: string,
  contextLabel: string,
  options: HealthStandardSourceLinkLabelOptions = {},
): HealthStandardSourceLinkLabels {
  const context = contextLabel.trim() || "건강 기준";
  const surface = options.surfaceLabel?.trim();
  const labelContext = surface ? `${surface} ${context}` : context;
  const label = `${labelContext} 공식 기준 출처 ${sourceLabel} 열기`;
  return {
    ariaLabel: label,
    title: label,
    visibleLabel: sourceLabel,
  };
}

export function formatHealthStandardCoverage(item: HealthStandardCoverage) {
  return `[${healthStandardStatusLabel[item.status]}] ${item.label} - ${item.summary}${
    item.sexSpecific ? " 남녀 기준 분리." : " 남녀 공통 적용."
  } 적용: ${item.sexApplicability}. 근거: ${formatHealthStandardSource(item)}`;
}

export function buildHealthStandardCoverageLines() {
  return koreanHealthStandardCoverage.map(formatHealthStandardCoverage);
}

export function getHealthStandardCoverage(id: string) {
  return koreanHealthStandardCoverage.find((item) => item.id === id);
}

export function formatDashboardMetricStandardNote(id: string) {
  const standard = getHealthStandardCoverage(id);
  return standard ? `${standard.sexApplicability} · ${standard.label}` : "";
}

export function buildDashboardMetricStandardEvidence(
  id: string,
  contextLabel: string,
): DashboardMetricStandardEvidence | null {
  const standard = getHealthStandardCoverage(id);
  if (!standard) return null;

  return {
    contextLabel,
    linkLabels: buildHealthStandardSourceLinkLabels(standard.sourceLabel, contextLabel, {
      surfaceLabel: "대시보드 지표",
    }),
    note: formatDashboardMetricStandardNote(id),
    sourceLabel: standard.sourceLabel,
    sourceUrl: standard.sourceUrl,
  };
}

function getDashboardMetricStandardEvidenceItems(
  evidences: readonly (DashboardMetricStandardEvidence | null | undefined)[],
): DashboardMetricStandardEvidence[] {
  return evidences.filter((item): item is DashboardMetricStandardEvidence => Boolean(item));
}

function countExternalDashboardMetricSources(
  evidences: readonly (DashboardMetricStandardEvidence | null | undefined)[],
) {
  return new Set(
    getDashboardMetricStandardEvidenceItems(evidences)
      .filter((item) => item.sourceUrl.startsWith("https://"))
      .map((item) => `${item.sourceLabel}|${item.sourceUrl}`),
  ).size;
}

export function formatDashboardMetricStandardCompactSummary(
  evidences: readonly (DashboardMetricStandardEvidence | null | undefined)[],
) {
  const items = getDashboardMetricStandardEvidenceItems(evidences);
  return [`${items.length}개 기준`, `근거 ${countExternalDashboardMetricSources(items)}개`].join(
    " · ",
  );
}

export function formatDashboardMetricStandardCopyDescription(
  evidences: readonly (DashboardMetricStandardEvidence | null | undefined)[],
) {
  return [
    "대시보드 건강 기준 복사",
    formatDashboardMetricStandardCompactSummary(evidences),
  ].join(" · ");
}

export function formatDashboardMetricStandardCopyStatus(
  evidences: readonly (DashboardMetricStandardEvidence | null | undefined)[],
) {
  return [
    "대시보드 건강 기준 복사됨",
    formatDashboardMetricStandardCompactSummary(evidences),
  ].join(" · ");
}

export function formatDashboardMetricStandardClipboardText(
  evidences: readonly (DashboardMetricStandardEvidence | null | undefined)[],
) {
  const items = getDashboardMetricStandardEvidenceItems(evidences);
  return [
    "[대시보드 건강 기준]",
    `요약: ${formatDashboardMetricStandardCompactSummary(items)}`,
    ...items.map((item) =>
      [
        `- ${item.contextLabel}: ${item.note}`,
        `  근거: ${item.sourceLabel}${
          item.sourceUrl.startsWith("https://") ? ` (${item.sourceUrl})` : ""
        }`,
      ].join("\n"),
    ),
  ].join("\n");
}

export function buildHealthStandardSexApplicabilityBadge(
  item: HealthStandardCoverage,
): HealthStandardSexApplicabilityBadge {
  return item.sexSpecific
    ? { label: "성별 분리", tone: "specific" }
    : { label: "남녀 공통", tone: "common" };
}

export function formatVitalInputStandardHelp(id: string) {
  if (id === "blood-pressure") {
    return "혈압 입력값은 한국 성인 남녀 공통 혈압 기준으로 표시됩니다.";
  }
  if (id === "low-blood-pressure") {
    return "낮은 혈압 입력값은 성인 남녀 공통 저혈압 확인 기준으로 표시됩니다.";
  }
  if (id === "glucose-care") {
    return "당뇨 추적이 켜져 있어 성인 남녀 공통 식전·식후 목표 기준으로 표시됩니다.";
  }
  if (id === "hypoglycemia") {
    return "70 mg/dL 미만 혈당은 성인 남녀 공통 저혈당 확인 기준으로 표시됩니다.";
  }
  if (id === "marked-hyperglycemia") {
    return "250 mg/dL 이상 혈당은 성인 남녀 공통 현저한 고혈당 확인 기준으로 표시됩니다.";
  }
  if (id === "glucose-screening") {
    return "당뇨 추적이 꺼져 있어 성인 남녀 공통 공복·식후 선별 기준으로 표시됩니다.";
  }
  if (id === "infection-fever") {
    return "체온 38℃ 이상 또는 오한은 암환자 공통 감염 연락 기준으로 표시됩니다.";
  }
  return "";
}

export function formatVitalSavePreviewLabel(input: VitalSavePreviewLabelInput) {
  const standardText = [input.standardSexApplicability, input.standardLabel]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" · ");

  return [input.measurementLabel, input.assessmentLabel, standardText]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" · ");
}

export function buildVitalStandardQuestionDraft(
  input: VitalStandardQuestionDraftInput,
): VitalStandardQuestionDraft | null {
  const standard = getHealthStandardCoverage(input.standardId);
  if (!standard) return null;

  const assessmentSummary = input.assessmentSummary.trim().replace(/[.。]+$/, "");
  const note = input.note?.trim().replace(/[.。]+$/, "");
  const noteText = note ? ` 사용자 메모: ${note}.` : "";

  return {
    topic: input.standardId.includes("blood-pressure") ? "혈압 기준 확인" : "혈당 기준 확인",
    question: `${input.measurementLabel} 기록을 ${standard.sexApplicability} ${standard.label} 기준과 제 치료 상황에 맞춰 어떻게 해석해야 할까요? 반복 측정 시점, 약·식사·활동 영향, 진료팀 연락 기준을 확인하고 싶습니다. 앱 참고 판정: ${input.assessmentLabel} - ${assessmentSummary}.${noteText}\n출처: ${standard.sourceLabel} - ${standard.sourceUrl}`,
  };
}

export function buildVitalStandardRangeLines(id: string) {
  return vitalStandardRangeLines[id] ?? [];
}

export function buildVitalStandardRangeSections(): VitalStandardRangeSection[] {
  return vitalStandardRangeSectionConfigs.map((section) => {
    const standard = getHealthStandardCoverage(section.standardId);

    return {
      ...section,
      lines: buildVitalStandardRangeLines(section.standardId),
      sourceLabel: standard?.sourceLabel ?? "한국 성인 건강 기준",
      sourceUrl: standard?.sourceUrl ?? "",
    };
  });
}

export function filterVitalStandardRangeSections(
  sections: VitalStandardRangeSection[],
  filterId: HealthStandardRangeFilterId,
): VitalStandardRangeSection[] {
  const option = getHealthStandardRangeFilterOption(filterId);
  if (!option || option.id === "all") return sections;
  const standardIds = new Set(option.standardIds);
  return sections.filter((section) => standardIds.has(section.standardId));
}

export function getHealthStandardRangeFilterOption(
  filterId: HealthStandardRangeFilterId,
): HealthStandardRangeFilterOption {
  return (
    healthStandardRangeFilterOptions.find((candidate) => candidate.id === filterId) ??
    healthStandardRangeFilterOptions[0]
  );
}

export function buildHealthStandardRangeFilterSummary(
  sections: VitalStandardRangeSection[],
  filterId: HealthStandardRangeFilterId,
): HealthStandardRangeFilterSummaryItem[] {
  const selectedSections = filterVitalStandardRangeSections(sections, filterId);
  const selectedStandards = selectedSections
    .map((section) => getHealthStandardCoverage(section.standardId))
    .filter((item): item is HealthStandardCoverage => Boolean(item));
  const riskLineCount = selectedSections.reduce(
    (total, section) => total + section.lines.filter((line) => line.tone === "risk").length,
    0,
  );
  const sexSpecificCount = selectedStandards.filter((item) => item.sexSpecific).length;
  const sourceCount = new Set(
    selectedStandards
      .filter(isExternalHealthStandardSource)
      .map((item) => `${item.sourceLabel}|${item.sourceUrl}`),
  ).size;

  return [
    {
      id: "visible-sections",
      label: "표시",
      value: `${selectedSections.length}/${sections.length}개 기준`,
    },
    {
      id: "risk-lines",
      label: "주의",
      value: riskLineCount ? `${riskLineCount}개 위험 강조 행` : "위험 강조 없음",
    },
    {
      id: "sex-specific",
      label: "성별",
      value: sexSpecificCount ? `성별 분리 ${sexSpecificCount}개` : "남녀 공통",
    },
    {
      id: "official-sources",
      label: "근거",
      value: `공식 출처 ${sourceCount}개`,
    },
  ];
}

function buildCompactHealthStandardRangeFilterSummaryParts(
  summary: readonly HealthStandardRangeFilterSummaryItem[],
) {
  const summaryById = Object.fromEntries(summary.map((item) => [item.id, item.value]));
  const visible = summaryById["visible-sections"]?.replace("개 기준", "");
  const riskValue = summaryById["risk-lines"];
  const risk =
    riskValue === "위험 강조 없음" ? riskValue : riskValue?.replace("개 위험 강조 행", "");
  const sex = summaryById["sex-specific"];
  const sources = summaryById["official-sources"]?.replace("공식 출처", "출처");

  return [
    visible ? `표시 ${visible}` : "",
    risk ? `주의 ${risk}` : "",
    sex,
    sources,
  ]
    .map((value) => value?.trim())
    .filter(Boolean);
}

export function formatHealthStandardRangeFilterCopyDescription(
  filterLabel: string,
  summary: readonly HealthStandardRangeFilterSummaryItem[],
) {
  return [
    `한국 성인 건강 기준 ${filterLabel} 범위 복사`,
    ...buildCompactHealthStandardRangeFilterSummaryParts(summary),
  ].join(" · ");
}

export function formatHealthStandardRangeFilterCopyStatus(
  filterLabel: string,
  summary: readonly HealthStandardRangeFilterSummaryItem[],
) {
  return [
    `${filterLabel} 기준 복사됨`,
    ...buildCompactHealthStandardRangeFilterSummaryParts(summary),
  ].join(" · ");
}

export function formatProfileWaistStandardNote(sex: string) {
  const waistStandard = getHealthStandardCoverage("waist");
  const sourceLabel = waistStandard?.sourceLabel ?? "한국 성인 허리둘레 기준";

  if (sex === "female") {
    return `여성 85cm 이상 · ${sourceLabel}`;
  }
  if (sex === "male") {
    return `남성 90cm 이상 · ${sourceLabel}`;
  }
  return `남성 90cm/여성 85cm · ${sourceLabel}`;
}

export function formatHealthStandardsClipboardText(
  profileSex: string,
  filterId: HealthStandardRangeFilterId = "all",
) {
  const profileNotes = buildProfileSexStandardNotes(profileSex);
  const rangeSections = buildVitalStandardRangeSections();
  const selectedRangeSections = filterVitalStandardRangeSections(rangeSections, filterId);
  const selectedFilter = getHealthStandardRangeFilterOption(filterId);
  const selectedFilterSummary = buildHealthStandardRangeFilterSummary(rangeSections, filterId);
  const selectedStandardIds =
    selectedFilter.id === "all"
      ? undefined
      : new Set(selectedRangeSections.map((section) => section.standardId));
  const vitalRangeLines = selectedRangeSections.flatMap((section) => [
    `- ${section.label} · 근거: ${section.sourceLabel}${
      section.sourceUrl.startsWith("https://") ? ` (${section.sourceUrl})` : ""
    }`,
    ...section.lines.map((item) => `  - ${item.label}: ${item.detail}`),
  ]);
  const coverageLines = koreanHealthStandardCoverage
    .filter((item) => !selectedStandardIds || selectedStandardIds.has(item.id))
    .map(formatHealthStandardCoverage);

  return [
    "[한국 성인 건강 기준]",
    "용도: CareVault 대시보드 판정과 입력 보조 기준 확인",
    `주의: ${koreanHealthStandardUseBoundary}`,
    `선택 범위: ${selectedFilter.label} · ${selectedRangeSections.length}/${rangeSections.length}개 표시`,
    "선택 범위 요약",
    ...selectedFilterSummary.map((item) => `- ${item.label}: ${item.value}`),
    "",
    "성별 기준 요약",
    ...koreanHealthStandardApplicabilitySummary.map(
      (item) => `- ${item.label}: ${item.detail}`,
    ),
    "",
    "현재 프로필 성별 적용",
    ...profileNotes.map((item) => `- ${item.label}: ${item.detail}`),
    "",
    "신체계측·혈압·혈당·신기능·전해질·지질·간기능·단백·칼슘·인산·요산·혈액·체온 숫자 범위",
    ...vitalRangeLines,
    "",
    "적용 범위와 근거",
    ...coverageLines.map((line) => `- ${line}`),
  ].join("\n");
}

export function buildProfileSexStandardNotes(sex: string): ProfileSexStandardNote[] {
  if (sex === "female") {
    return [
      {
        id: "common",
        label: "BMI·혈압·혈당·신기능·전해질·단백·칼슘·인산·요산",
        detail: "성인 남녀 공통 기준과 BUN/Cr·eGFR·UACR·Na/K·Alb·Ca·P·요산 입력 보조값으로 표시",
      },
      {
        id: "waist",
        label: "허리둘레",
        detail: "여성 85cm 이상이면 복부비만 기준 해당",
      },
      {
        id: "hdl",
        label: "HDL-C",
        detail: "여성 프리셋은 50 mg/dL 이상",
      },
      {
        id: "ggt",
        label: "GGT",
        detail: "여성 프리셋은 8-35 IU/L, 결과지 기준 우선",
      },
      {
        id: "hemoglobin",
        label: "헤모글로빈",
        detail: "여성 프리셋은 12.0-16.0 g/dL, 결과지 기준 우선",
      },
      {
        id: "cbc",
        label: "RBC/Hct",
        detail: "여성 RBC 4.0-5.4 10^6/uL, Hct 36-46%, 결과지 기준 우선",
      },
    ];
  }

  if (sex === "male") {
    return [
      {
        id: "common",
        label: "BMI·혈압·혈당·신기능·전해질·단백·칼슘·인산·요산",
        detail: "성인 남녀 공통 기준과 BUN/Cr·eGFR·UACR·Na/K·Alb·Ca·P·요산 입력 보조값으로 표시",
      },
      {
        id: "waist",
        label: "허리둘레",
        detail: "남성 90cm 이상이면 복부비만 기준 해당",
      },
      {
        id: "hdl",
        label: "HDL-C",
        detail: "남성 프리셋은 40 mg/dL 이상",
      },
      {
        id: "ggt",
        label: "GGT",
        detail: "남성 프리셋은 11-63 IU/L, 결과지 기준 우선",
      },
      {
        id: "hemoglobin",
        label: "헤모글로빈",
        detail: "남성 프리셋은 13.0-17.0 g/dL, 결과지 기준 우선",
      },
      {
        id: "cbc",
        label: "RBC/Hct",
        detail: "남성 RBC 4.2-6.3 10^6/uL, Hct 38-53%, 결과지 기준 우선",
      },
    ];
  }

  return [
    {
      id: "common",
      label: "BMI·혈압·혈당·신기능·전해질·단백·칼슘·인산·요산",
      detail: "성인 남녀 공통 기준과 BUN/Cr·eGFR·UACR·Na/K·Alb·Ca·P·요산 입력 보조값으로 표시",
    },
    {
      id: "waist",
      label: "허리둘레",
      detail: "성별 선택 전에는 남성 90cm/여성 85cm를 함께 확인",
    },
    {
      id: "hdl",
      label: "HDL-C",
      detail: "성별 선택 시 남성 40 mg/dL, 여성 50 mg/dL 프리셋 적용",
    },
    {
      id: "ggt",
      label: "GGT",
      detail: "성별 선택 시 남성 11-63, 여성 8-35 IU/L 프리셋 적용",
    },
    {
      id: "hemoglobin",
      label: "헤모글로빈",
      detail: "성별 선택 시 남성 13.0-17.0, 여성 12.0-16.0 g/dL 프리셋 적용",
    },
    {
      id: "cbc",
      label: "RBC/Hct",
      detail: "성별 선택 시 RBC 남성 4.2-6.3/여성 4.0-5.4 10^6/uL, Hct 남성 38-53/여성 36-46% 프리셋 적용",
    },
  ];
}

export function buildProfileMetricSexStandardChips(
  sex: string,
): ProfileMetricSexStandardChip[] {
  return buildProfileSexStandardNotes(sex)
    .filter((item) => item.id !== "common")
    .map((item) => {
      const standardId = profileMetricSexStandardChipCoverageIds[item.id] ?? item.id;
      const standard = getHealthStandardCoverage(standardId);

      return {
        ...item,
        sourceLabel: standard?.sourceLabel ?? "한국 성인 건강 기준",
        sourceUrl: standard?.sourceUrl ?? "",
        standardId,
      };
    });
}

function countExternalProfileMetricSources(chips: readonly ProfileMetricSexStandardChip[]) {
  return new Set(
    chips
      .filter((item) => item.sourceUrl.startsWith("https://"))
      .map((item) => `${item.sourceLabel}|${item.sourceUrl}`),
  ).size;
}

function formatProfileMetricSexStandardCompactSummary(
  sexLabel: string,
  chips: readonly ProfileMetricSexStandardChip[],
) {
  return [
    sexLabel,
    `${chips.length}개 기준`,
    `근거 ${countExternalProfileMetricSources(chips)}개`,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" · ");
}

export function formatProfileMetricSexStandardCopyDescription(
  sexLabel: string,
  chips: readonly ProfileMetricSexStandardChip[],
) {
  return [
    "프로필 성별 기준 복사",
    formatProfileMetricSexStandardCompactSummary(sexLabel, chips),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function formatProfileMetricSexStandardCopyStatus(
  sexLabel: string,
  chips: readonly ProfileMetricSexStandardChip[],
) {
  return [
    "프로필 성별 기준 복사됨",
    formatProfileMetricSexStandardCompactSummary(sexLabel, chips),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function formatProfileMetricSexStandardClipboardText(
  sexLabel: string,
  chips: readonly ProfileMetricSexStandardChip[],
) {
  return [
    "[프로필 성별 적용 기준]",
    `성별: ${sexLabel}`,
    `요약: ${formatProfileMetricSexStandardCompactSummary(sexLabel, chips)}`,
    ...chips.map((item) =>
      [
        `- ${item.label}: ${item.detail}`,
        `  근거: ${item.sourceLabel}${
          item.sourceUrl.startsWith("https://") ? ` (${item.sourceUrl})` : ""
        }`,
      ].join("\n"),
    ),
  ].join("\n");
}
