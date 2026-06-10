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
  nccOverview: {
    label: "국가암정보센터 자궁경부암 요약설명",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C213/cancer/view.do?cancer_seq=4877",
  },
  nccAnatomySite: {
    label: "국가암정보센터 자궁경부암 발생부위",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4880",
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
  nccTreatmentEating: {
    label: "국가암정보센터 치료 중 일반적인 식생활",
    url: "https://www.cancer.go.kr/lay1/S1T471C472/contents.do",
  },
  nccNauseaDiet: {
    label: "국가암정보센터 증상별 식생활 - 메스꺼움",
    url: "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
  },
  nccVomitingDiet: {
    label: "국가암정보센터 증상별 식생활 - 구토",
    url: "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
  },
  nccAppetiteLossDiet: {
    label: "국가암정보센터 증상별 식생활 - 식욕부진",
    url: "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
  },
  nccMouthPainDiet: {
    label: "국가암정보센터 증상별 식생활 - 입과 목의 통증",
    url: "https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
  },
  nccMucositisCare: {
    label: "국가암정보센터 입안의 염증(구내염) 도움이 되는 방법",
    url: "https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
  },
  nccDryMouthDiet: {
    label: "국가암정보센터 증상별 식생활 - 입안의 건조증",
    url: "https://www.cancer.go.kr/lay1/S1T479C485/contents.do",
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
  nccImmuneLowDiet: {
    label: "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    url: "https://www.cancer.go.kr/lay1/S1T479C489/contents.do",
  },
  nccFatigueDepressionDiet: {
    label: "국가암정보센터 증상별 식생활 - 피로감과 우울",
    url: "https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
  },
  nccInfectionConsult: {
    label: "국가암정보센터 감염 의료진 상담 기준",
    url: "https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
  },
  nccNeuropathyCare: {
    label: "국가암정보센터 신경계이상 증상 및 주의사항",
    url: "https://www.cancer.go.kr/lay1/S1T458C460/contents.do",
  },
	  nccSkinChangeCare: {
	    label: "국가암정보센터 피부변화 증상별 대처방법",
	    url: "https://www.cancer.go.kr/lay1/S1T454C456/contents.do",
	  },
	  nccAnemiaCare: {
	    label: "국가암정보센터 빈혈 관리",
	    url: "https://www.cancer.go.kr/lay1/S1T440C444/contents.do",
	  },
		  nccBleedingSymptoms: {
		    label: "국가암정보센터 출혈 증상",
		    url: "https://www.cancer.go.kr/lay1/S1T445C448/contents.do",
		  },
			  nccHairLossCare: {
			    label: "국가암정보센터 탈모 도움이 되는 방법",
			    url: "https://www.cancer.go.kr/lay1/S1T451C453/contents.do",
			  },
			  nccHiccupConsult: {
			    label: "국가암정보센터 딸꾹질 의료진 상담 상황",
			    url: "https://www.cancer.go.kr/lay1/S1T466C468/contents.do",
			  },
			  nccCancerLifeChildrenCommunication: {
	    label: "국가암정보센터 암환자의 생활 - 자녀에게 알리는 방법",
	    url: "https://www.cancer.go.kr/lay1/S1T327C330/contents.do",
  },
  nccCancerLifePsychologicalStability: {
    label: "국가암정보센터 암환자의 생활 - 심리적 안정을 위해",
    url: "https://www.cancer.go.kr/lay1/S1T327C329/contents.do",
  },
  nccSurvivorSleepManagement: {
    label: "국가암정보센터 암생존자 수면관리",
    url: "https://www.cancer.go.kr/lay1/S1T748C794/contents.do",
  },
  nccSurvivorExerciseManagement: {
    label: "국가암정보센터 암생존자 운동",
    url: "https://www.cancer.go.kr/lay1/S1T748C795/contents.do",
  },
  nccSurvivorNutritionLifestyle: {
    label: "국가암정보센터 암생존자 영양·식생활",
    url: "https://www.cancer.go.kr/lay1/S1T748C796/contents.do",
  },
  nccSurvivorWorkReturn: {
    label: "국가암정보센터 암생존자 직업복귀",
    url: "https://www.cancer.go.kr/lay1/S1T748C798/contents.do",
  },
  nccComplementaryTherapyConsultation: {
    label: "국가암정보센터 보완대체요법 상담",
    url: "https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
  },
  nccPainAssessment: {
    label: "국가암정보센터 암성 통증평가 항목",
    url: "https://www.cancer.go.kr/lay1/S1T378C380/contents.do",
  },
  nccCancerFatigueCoping: {
    label: "국가암정보센터 암관련 피로대처",
    url: "https://www.cancer.go.kr/lay1/S1T420C421/contents.do",
  },
  nccDyspneaCause: {
    label: "국가암정보센터 호흡곤란 원인",
    url: "https://www.cancer.go.kr/lay1/S1T411C414/contents.do",
  },
  nccDyspneaConsult: {
    label: "국가암정보센터 호흡곤란 도움이 되는 방법",
    url: "https://www.cancer.go.kr/lay1/S1T411C415/contents.do",
  },
  nccCoughCause: {
    label: "국가암정보센터 기침 원인",
    url: "https://www.cancer.go.kr/lay1/S1T410C412/contents.do",
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
  nccChemotherapyUnderstanding: {
    label: "국가암정보센터 항암화학요법의 이해",
    url: "https://www.cancer.go.kr/lay1/S1T289C290/contents.do",
  },
  nccChemotherapySideEffects: {
    label: "국가암정보센터 항암화학요법의 부작용",
    url: "https://www.cancer.go.kr/lay1/S1T289C291/contents.do",
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
  kdcaHpvNationalImmunization: {
    label: "질병관리청 예방접종도우미 HPV 국가예방접종 사업",
    url: "https://nip.kdca.go.kr/irhp/infm/goVcntInfo.do?menuCd=132&menuLv=1",
  },
  nccHpvInfection: {
    label: "국가암정보센터 사람유두종바이러스 감염",
    url: "https://www.cancer.go.kr/lay1/S1T250C254/contents.do",
  },
  nccHpvVaccine: {
    label: "국가암정보센터 자궁경부암 HPV 예방백신",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
  },
  nccCervicalPrevention: {
    label: "국가암정보센터 자궁경부암 예방법",
    url: "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4885",
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
    topic: "감별진단 확인",
    question:
      "국가암정보센터의 감별진단 설명처럼 자궁경부염, 질암, 자궁내막암, 자궁체부암, 골반 염증성질환과 제 증상과 검사 결과에서 어떤 근거로 구분됐는지, 자궁경부세포검사, 질확대경검사 및 펀치 생검, 자궁경관 내 소파술, CT·MRI 같은 검사가 어떤 목적과 순서로 해석됐는지 진료팀에 어떻게 확인하면 좋을까요?",
    sourceId: "nccDifferentialDiagnosis",
  },
  {
    topic: "병리조직 확인",
    question:
      "국가암정보센터의 정의 및 종류 설명처럼 전암단계, 상피내이형성증, 자궁경부상피내암, 기저막 침범 여부와 침윤성 암 구분, 편평상피세포암·선암·혼합 암종 같은 병리결과지 용어가 제 병기·치료 설명에 어떻게 반영되는지 진료팀에 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccDefinitionTypes",
  },
  {
    topic: "병기 설명 확인",
    question:
      "국가암정보센터 진행단계 설명처럼 상피내암은 암의 분류에 속하지 않는지, 1기는 자궁경부에만 국한, 2기는 질벽 상부 2/3 또는 자궁 옆 결합조직 침윤, 3기는 질의 하부 1/3·요관침윤·골반·대동맥주위 림프절 전이, 4기는 방광이나 직장 점막 침범 또는 원격전이라는 설명이 제 진단서 병기와 검사 근거에서 각각 어떻게 확인됐는지 진료팀에 어떤 순서로 질문하면 좋을까요?",
    sourceId: "nccStage",
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
    topic: "항암화학요법 목적·일정 확인",
    question:
      "국가암정보센터 항암화학요법의 이해 설명처럼 항암화학요법은 전신에 퍼져있는 암세포에 작용하는 전신적 치료이고, 목적은 암의 치료(완치), 암의 조절, 증상 완화로 달라질 수 있으며 수술이나 방사선치료와 함께 쓰일 수 있다고 설명되는데, 제 치료에서 보조화학요법·선행화학요법·동시화학요법 중 어느 목적과 순서인지, 세포독성 항암제·표적항암제·면역항암제 중 어떤 약제군인지, 치료 간격과 진찰 및 혈액 검사로 회복을 확인하는 기준을 어떤 순서로 진료팀에 질문하면 좋을까요?",
    sourceId: "nccChemotherapyUnderstanding",
  },
  {
    topic: "항암 부작용 개인차·효과 오해 확인",
    question:
      "국가암정보센터 항암화학요법의 부작용 설명처럼 부작용 유무와 치료 효과는 전혀 별개의 문제이고, 같은 항암제와 같은 용량이어도 환자마다 부작용 정도가 다를 수 있으며, 대부분 치료가 끝나면 점차 사라지지만 일부는 몇 개월 또는 몇 년이 걸리거나 폐·신장·심장·생식기관 손상처럼 영구 지속될 수 있다고 설명되는데, 제 약제와 회차에서 오심·구토, 구강 궤양, 설사·변비, 골수기능 저하, 탈모, 피부·손톱 변화, 말초신경병증 증상을 어떻게 기록하고, 부작용이 치료 효과보다 크게 느껴질 때 투여 용량 조절, 약물 종류 변경, 중단 여부를 임의 판단하지 않고 어떤 기준으로 진료팀에 확인하면 좋을까요?",
    sourceId: "nccChemotherapySideEffects",
  },
  {
    topic: "재발·추적검사",
    question:
      "국가암정보센터의 재발 및 전이 설명처럼 첫 2년 3개월마다, 이후 5년까지 6개월마다 같은 추적검사 일정과 체중감소, 하지 부종, 골반/허벅지 통증, 질출혈·질분비물 증가, 기침·객혈·흉통 같은 재발 의심 증상을 제 병원 계획 기준으로 어떻게 기록하고, 문진·골반내진·세포검사·가슴사진·종양 표지자·CT·MRI·PET 필요 여부를 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccRecurrenceFollowUp",
  },
  {
    topic: "재발성 치료 선택 확인",
    question:
      "국가암정보센터 자궁경부암 치료방법 설명처럼 재발은 골반 내 국소 재발과 폐·간·뇌·뼈 같은 원격 재발로 나뉘고 치료방법은 환자의 상태와 재발 부위에 따라 달라지며, 골반 내 국소 재발에서는 방사선요법, 동시항암화학방사선치료, 골반장기적출술 등이 이용될 수 있고 이때 요로전환술이나 장전환술이 함께 이루어질 수 있다고 설명되는데, 제 검사에서 재발 부위가 어디로 판단됐는지, 단독 병소라 외과적 절제술 논의 대상인지 또는 다발성 전이라 항암화학요법 중심인지, 이전 방사선치료 여부와 수술 가능성은 어떤 기준으로 진료팀에 확인하면 좋을까요?",
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
    topic: "치료 중 균형식 확인",
    question:
      "국가암정보센터 치료 중 일반적인 식생활 안내처럼 암 자체와 암 치료가 영양 상태에 영향을 미치고, 영양 상태는 질병의 이환율과 사망률, 치료 효과, 삶의 질에 영향을 주며, 치료 중 잘 먹는 것은 영양 상태 유지, 부작용 극복, 감염의 위험 감소, 항암치료로 손상된 세포 재생에 도움이 될 수 있다고 설명됩니다. 암을 낫게 해주는 특별한 식품이나 영양소는 없고 균형 잡힌 식사, 충분한 열량과 단백질, 비타민 및 무기질, 여러 가지 음식을 골고루 먹는 것이 중요하다는 점을 제 치료 일정, 장 기능 변화, 식사량, 단백질 반찬, 보조식품 고민과 함께 어떻게 기록해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccTreatmentEating",
  },
  {
    topic: "메스꺼움·구토 식사 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 메스꺼움 안내처럼 메스꺼움은 수술, 화학요법, 방사선요법 등의 일반적인 부작용이고, 치료 받은 직후 또는 치료 2~3일 후 나타날 수 있으며, 음식을 충분히 섭취하지 못하면 필요한 영양소를 충족하기 어려울 수 있다고 설명됩니다. 음식 냄새가 나지 않고 환기가 잘 되는 곳에서 조금씩 자주 천천히 먹었는지, 식후 1시간 정도 휴식했는지, 항구토제 사용은 의사선생님과 상의할 일인지, 메스꺼움이 심해 억지로 먹거나 마시기 어려운지, 토스트·크래커·요거트·샤베트·복숭아통조림·맑은 유동식·얼음조각처럼 부담이 적은 음식과 기름진 음식·매우 단 음식·향이 강하거나 뜨거운 음식처럼 유발 가능성이 있는 음식을 언제, 무엇 때문에 힘들었는지 기록해 진료팀에 어떻게 확인하면 좋을까요?",
    sourceId: "nccNauseaDiet",
  },
  {
    topic: "구토 후 수분·식사 단계 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 구토 안내처럼 구토증상이 있는 경우 먹거나 마시지 않도록 하고, 구토증상이 조절되면 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키며, 맑은 유동식으로 조절되면 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹고 적응되면 일반 식사를 섭취한다고 설명됩니다. 우유를 소화시키기 힘들면 우유가 들어있지 않은 제품을 이용하는지, 구토가 1~2일 이상 심하게 계속되어 의사선생님과 상의할 상황인지, 제 치료 회차·구토 횟수·수분 섭취·소변 변화·식사 단계 기록을 어떤 순서로 진료팀에 확인하면 좋을까요?",
    sourceId: "nccVomitingDiet",
  },
  {
    topic: "식욕부진 식사·간식 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 식욕부진 안내처럼 식욕부진은 암 자체와 항암치료에 의해 흔하게 일어날 수 있고 암으로 인한 공포나 우울감 등으로도 생길 수 있다고 설명됩니다. 조금씩 자주 먹었는지, 간식을 가까이 두었는지, 식사 시간에 얽매이지 않고 먹고 싶을 때·먹을 수 있을 때·몸 상태가 좋을 때 먹을 수 있었는지, 평소에 좋아하던 음식과 메뉴 변화가 도움이 되었는지, 충분한 휴식을 취한 아침처럼 몸 상태가 가장 좋은 시간이 있었는지, 죽, 미음, 쥬스, 스프, 우유 및 유제품 같은 간식 후보를 기록했는지, 식사 시 수분섭취는 한 모금씩 조금만 했는지 또는 많은 양의 물은 식전이나 식후 30~60분에 마셨는지, 식사하는 시간, 장소, 분위기 변화와 가벼운 산책, 식사전후에 입안을 청결하게 한 기록, 특수영양 보충음료 필요성, 보호자가 억지로 먹으라고 지나치게 강요하지 않는 지원 문구를 어떤 순서로 진료팀에 확인하면 좋을까요?",
    sourceId: "nccAppetiteLossDiet",
  },
  {
    topic: "입과 목 통증 식사·구강상태 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 입과 목의 통증 안내처럼 입안과 목구멍에는 방사선요법, 화학요법 또는 감염 등에 의해 입안 통증, 잇몸의 손상, 인후염 또는 식도염이 자주 발생할 수 있고, 입안 통증이나 잇몸 염증은 항암치료의 부작용 때문인지 치과질환인지 확인이 필요하다고 설명됩니다. 부드럽고 촉촉한 음식, 씹고 삼키기 쉬운 죽류·미음·부드러운 고기나 생선·부드러운 채소·시지 않은 과일을 먹기 쉬웠는지, 오렌지, 포도, 레몬, 토마토주스, 향신료, 소금에 절인 음식, 토스트, 크래커 또는 말린 음식처럼 입안을 자극할 수 있는 후보가 통증을 악화시켰는지, 음식을 작은 크기로 자르거나 곱게 갈았는지, 빨대와 작은 스푼이 도움이 되었는지, 뜨거운 음식 대신 차거나 상온의 음식과 얼음조각을 쓸 수 있는지, 옥살로플라틴처럼 말초신경염을 유발할 수 있는 항암제를 투여받는 경우 차가운 음식은 피해야 하는지, 식후 입안은 깨끗이 헹구어 청결하게 유지했는지 제 치료 약제와 구강 상태 기준으로 어떻게 기록해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccMouthPainDiet",
  },
  {
    topic: "구내염 구강관리 확인",
    question:
      "국가암정보센터 입안의 염증(구내염) 도움이 되는 방법 안내처럼 입안의 염증이 있을 때 구강을 깨끗하고 촉촉하게 유지하는 방법, 칫솔모가 부드러운 것 사용 여부, 틀니 세정과 잘 헹굼, 치실 또는 양치질 후 입안 헹굼, 구강함수액 후보를 제 치료 일정, 혈소판·출혈 위험, 감염 위험, 삼킴 상태 기준으로 어떻게 확인하면 좋을까요? 발포성 틀니용 세정제나 1.5%과산화수소 용액에 6-7분 동안 담가두는 틀니 관리, 생리식염수 500cc 와 베이킹 소다 10g을 섞은 물, 6%이하의 알코올 이 섞인 구강청정제, 1.5%과산화수소 수용액 또는 물과 과산화수소의 비가 3:1 이 되도록 만든 구강함수액 후보가 제 상황에서 적절한지, 항암화학요법 시작 전 잇몸 상태를 의료진과 미리 상의해야 하는지, 항암치료 및 방사선치료 도중 구강을 자주 헹궈 수분을 충분하게 유지하는 방법, 알코올 성분 구강세정제를 삼가야 하는 기준, 의치는 꼭 필요한 경우만 착용하는 기준, 입안 통증·붉어짐·궤양·출혈·삼킴 어려움과 24시간 이상 먹거나 마실 수 없는 경우의 연락 기준을 어떤 순서로 진료팀과 치과에 질문하면 좋을까요?",
    sourceId: "nccMucositisCare",
  },
  {
    topic: "입안 건조 식사·수분 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 입안의 건조증 안내처럼 머리와 목 주위에 대한 항암화학요법이나 방사선치료는 침분비를 감소시켜 입안을 마르게 할 수 있고, 입안이 건조해지면 음식물을 씹고 삼키는 것이 더욱 어려워지며 음식의 맛도 변할 수 있다고 설명됩니다. 가까운 장소에 물을 두고 조금씩 자주 마셨는지, 부드럽고 곱게 간 식품이나 육수나 국물에 적신 음식이 도움이 되었는지, 삼키기 쉽게 소스나 드레싱으로 촉촉하게 했는지, 식사 중간에 자주 물이나 음료를 한 모금씩 마셨는지, 빨대를 이용하면 삼키는 데 도움이 되었는지, 딱딱한 사탕이나 껌이 침 분비에 도움이 되었는지, 아주 달거나 신음식은 침분비를 늘릴 수 있지만 입안이 헐거나 목구멍이 아플 경우 피해야 하는지, 입술 연고 등으로 입술 보습을 유지했는지, 문제가 심각해 의사선생님이나 치과선생님과 상의할 상황인지 제 구강 상태와 치료 약제 기준으로 어떻게 기록해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccDryMouthDiet",
  },
  {
    topic: "입맛 변화 단백질·향 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 입맛의 변화 안내처럼 암이나 항암치료, 혹은 치과적인 문제 때문에 음식의 맛이나 냄새에 민감해질 수 있고, 특히 고기나 생선 등의 고단백식품에 대해서는 쓴맛이나 금속성 맛을 느끼게 되며 음식의 맛이 없어질 수 있고, 이런 변화는 치료가 끝나면 사라질 것이라고 설명됩니다. 보기가 좋고 냄새도 좋은 식품을 선택하고 준비했는지, 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품 같은 단백질 대체 후보를 쓸 수 있는지, 고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용하는 것이 제 치료 일정과 구강 상태에 맞는지, 신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있어 오렌지나 레몬 같은 시큼한 식품을 쓸 수 있는지, 입과 목에 통증이 있을 때 이런 식품들이 염증을 자극하거나 불편하게 할 수 있어 주의해야 하는지, 음식 맛이나 냄새에 영향을 주는 치과적인 문제가 없는지, 입안을 자주 헹구도록 한 기록을 어떤 순서로 진료팀과 치과에 확인하면 좋을까요?",
    sourceId: "nccTasteChangeDiet",
  },
  {
    topic: "설사 수분·전해질 음식 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 설사 안내처럼 설사는 항암치료, 복부와 골반 부위의 방사선치료, 감염, 음식에 대한 민감성, 불안 및 스트레스 등에 의해 발생할 수 있고, 설사가 있을 경우 음식이 장을 빨리 통과하기 때문에 비타민, 무기질, 수분이 충분히 흡수되지 못하며 탈수의 원인이 될 수 있다고 설명됩니다. 맑은 유동식은 적절한 영양소를 공급할 수 없으므로 1~2일 이상 계속하지 않는지, 갑자기 설사할 경우 12~24시간 동안 맑은 유동식으로 장을 쉬게 하고 손실된 수분을 보충해야 하는지, 수분을 충분히 섭취했는지, 염분과 칼륨 보충 후보로 육수, 스포츠 음료, 바나나, 복숭아, 토마토, 으깬 감자를 기록했는지, 식사는 조금씩 자주 했는지, 섬유소가 적은 식품인 흰밥, 흰죽, 미음, 흰빵, 삶거나 으깬 감자, 맑은 고깃국, 생선, 닭고기, 두부, 계란을 먹기 쉬웠는지, 너무 뜨겁거나 찬 음식 대신 실온 음식을 쓰는지, 생야채, 생과일의 껍질, 씨, 브로콜리, 옥수수, 말린 콩, 카페인과 알코올, 커피, 홍차, 초콜릿, 탄산음료, 콩, 양배추, 탄산음료, 껌, 우유 및 유제품이 설사를 악화시켰는지, 유당이 설사를 악화시킬 수 있지만 적은 양의 우유나 유제품은 소화할 수 있는지, 설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되어 의사선생님과 상의할 상황인지 제 치료 회차와 복부·골반 방사선 범위 기준으로 어떻게 기록해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccDiarrheaDiet",
  },
  {
    topic: "변비 수분·섬유소·활동 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 변비 안내처럼 변비는 수분 및 음식섭취가 불충분하거나 오랫동안 누워있는 경우에 생길 수 있고, 항암제나 진통제 등의 부작용으로 생기기도 한다고 설명됩니다. 수분을 충분히 섭취했는지, 하루에 8~10컵 이상 마셨는지, 변을 부드럽게 하기 위해 아침 기상 직후 차가운 물이 장운동에 도움이 되었는지, 음식 섭취량이 너무 적지 않도록 기록했는지, 도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 먹기 쉬웠는지, 가벼운 산책이나 걷기 같은 자신에게 맞는 운동을 규칙적으로 할 수 있었는지, 누워만 있는 경우라도 배를 부드럽게 문질러 주는 기록이 장운동에 도움이 되었는지, 계속적으로 변비가 조절되지 않아 의사선생님과 상의할 상황인지 제 치료 회차, 진통제 사용, 활동량 기준으로 어떻게 기록해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccConstipationDiet",
  },
  {
    topic: "체중변화 열량·단백질·원인 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 체중변화 안내처럼 암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있고, 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨리므로 열량과 단백질 등을 충분히 섭취해야 한다고 설명됩니다. 체중감소가 있을 때 밥 예시인 김밥, 초밥, 주먹밥, 볶음밥, 죽 예시인 야채죽, 전복죽, 계란죽, 닭죽, 간식 예시인 감자, 고구마, 떡, 만두, 빵, 과일, 과일주스, 과일통조림, 열량 보충 예시인 설탕, 꿀, 쨈, 버터, 땅콩버터, 우유, 두유에 더하는 재료, 탄수화물 간식인 사탕, 젤리, 크래커, 빵류, 과일, 주스, 단백질 후보인 계란, 콩, 두부, 생선, 유제품 중 실제 먹기 쉬웠던 것을 어떻게 기록하면 좋을까요? 체중증가는 약물에 의한 체내 수분 보유나 식욕의 이상 증가 등으로 생길 수 있고 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아니라 먼저 의사선생님과 상의하여 원인을 찾아야 한다는 안내를 기준으로, 가공식품, 김치, 젓갈, 장아찌류 같은 염분 함량이 높은 식품, 청량 음료, 초콜릿, 사탕, 과자류 같은 열량이 높고 영양가가 없는 식품, 과일과 야채 그리고 곡류, 지방이 없는 부위의 육류제품, 저지방 우유 및 유제품, 끓이고 찌는 형태의 조리법, 버터, 마요네즈, 감미료 추가 여부, 고열량의 간식, 많이 먹었다고 생각되면 운동한 기록을 제 체중 추이와 치료 약제 기준으로 어떻게 진료팀에 확인하면 좋을까요?",
    sourceId: "nccWeightChangeDiet",
  },
  {
    topic: "면역기능 저하 식품안전 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 면역기능의 저하 안내처럼 백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 한다고 설명됩니다. 최근 WBC/ANC, 항암·방사선 일정, 발열·오한 여부와 함께 완전히 익힌 음식, 사용 전 유효기간 확인, 쥬스·우유·요구르트 등 저온살균 제품, 상하기 쉬운 음식 냉장·냉동 보관, 요리 전 고기·생선·닭고기 분리 보관과 즙이 다른 식품에 떨어지지 않도록 한 기록, 고기를 냉장고에서 녹이고 해동 후 즉시 요리한 기록, 남은 음식을 즉시 냉장 보관한 기록, 채소와 과일을 먹기 전 또는 썰기 전에 깨끗이 씻은 기록, 손과 손톱 밑 세척, 음식물에 머리카락이 들어가지 않도록 한 기록, 조리 기구·식기·수저 소독, 식기·도마·칼 분리 또는 소독, 생고기·닭고기·생선 즙 교차오염 주의, 외식보다 직접 요리한 기록을 어떻게 정리하면 좋을까요? 날계란이나 덜 익힌 계란과 이들이 들어간 음식, 생굴, 회, 육회, 생선회, 생조개, 초밥 등 익히지 않은 음식, 다진 고기, 씻기 어려운 딸기, 3~4일 지난 남은 음식, 곰팡이가 핀 음식, 상한 음식, 상온 30분 이상 운반, 녹슨 캔이나 움푹해진 캔, 녹은 냉동제품, 비살균 우유·주스·요구르트 같은 위험 후보를 제 검사 수치와 치료 회차 기준으로 어떤 수준까지 피하거나 진료팀에 확인해야 할까요?",
    sourceId: "nccImmuneLowDiet",
  },
  {
    topic: "피로감·우울 식사·활동 기록 준비",
    question:
      "국가암정보센터 증상별 식생활 피로감과 우울 안내처럼 치료기간 동안 피로감은 제대로 먹지 못한 것, 운동 저하, 혈구수 부족, 우울, 불면 그리고 약물 부작용 등과 관련이 있고, 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요하다고 설명됩니다. 피로 시작 시점과 강도, 최근 식사량·간식·체중변화, 활동량 변화, 최근 혈구수 설명, 우울·불면·약물 부작용 가능성, 느끼는 감정과 공포를 솔직하게 말하기 어려운 점, 치료방법, 부작용 그리고 이를 이겨내는 방법을 미리 알고 싶은 질문을 어떻게 정리하면 좋을까요? 충분한 휴식, 오랜 수면보다는 낮에 잠깐씩 낮잠이나 휴식, 일상적인 활동보다 짧고 간단한 활동, 영양이 풍부한 음식과 불충분한 열량과 영양소 섭취 가능성, 하루 중 가장 좋은 시간에 가능한 많이 먹은 기록, 낮잠이나 휴식 후 먹는 것이 편안했는지, 적은 양의 식사와 간식을 자주 먹은 기록, 가족이나 친구의 도움, 음식배달서비스 이용 가능성, 치료를 받지 않을 때 좋아하는 음식, 가능하다면 산책이나 규칙적인 운동, 피로를 악화시키는 행위 제한, 아이보기, 밥하기, 집안일 도움 요청을 제 치료 일정과 혈액검사 결과 기준으로 어떤 수준까지 진료팀과 보호자에게 확인하면 좋을까요?",
    sourceId: "nccFatigueDepressionDiet",
  },
  {
    topic: "발열·오한 감염 상담 기준 확인",
    question:
      "국가암정보센터 감염 의료진 상담 기준 안내처럼 항문 상처가 생기면 병원 방문 기준을 확인하고, 오한이나 열이 38℃ 이상인 경우, 예방주사와 치과진료, 오심·구토·설사, 흉통이나 호흡곤란, 배뇨시 쓰리거나 빈뇨, 뇨의 색변화나 냄새, 구강내 궤양이나 흰색의 반점이 있을 때를 상담 상황으로 설명합니다. 체온 측정 시각, 최고 체온, 오한 지속 시간, 소화기 증상, 흉통·호흡곤란, 배뇨 변화, 구강 병변, 항문 상처, 예방주사·치과진료 예정 여부를 어떤 순서로 기록하고 제 치료 일정·혈액검사 결과 기준으로 언제 진료팀에 알려야 하는지 확인하면 좋을까요?",
    sourceId: "nccInfectionConsult",
  },
  {
    topic: "손발저림·감각이상 안전 확인",
    question:
      "국가암정보센터 신경계이상 안내의 신경계 손상 시 주의 사항처럼 손비비기, 주먹을 쥐었다가 폈다하는 동작, 뜨거운 것은 화상을 입을 위험이 있으므로 주의해야 하는 상황, 손, 발을 항상 깨끗이 씻고 손톱, 발톱을 짧게 하되 혼자서 깎지 말고 다른 사람의 도움을 받을지, 양말은 부드러운 면으로 된 것을 쓰고 신발 앞부분이 뾰족한 모양과 맨발 보행을 피해야 하는지, 추위나 찬 것 노출과 물의 온도 확인, 수염 관리 시 전기면도기 사용 여부, 직접 운전하지 않는 주의를 제 증상과 일상 기준으로 어떻게 적용하면 좋을까요? 손발저림과 감각이상 등의 신경증이 있으면 의료진과 상의한다는 기준에 맞춰, 손가락·손·발가락·발의 감각이 떨어지는지, 손끝, 발끝이 저리고 무감각해지고 약해지거나 통증까지 수반되는지, 아프고 따끔거리는 감각이 지속되는지, 한쪽 또는 양쪽 귀의 청력 변화가 있는지, 내장을 지배하는 신경 부작용 가능성으로 복통, 구토, 변비가 동반되는지 어떤 순서로 기록해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccNeuropathyCare",
  },
	  {
	    topic: "피부변화·손발홍반·손발톱 확인",
	    question:
	      "국가암정보센터 피부변화 증상별 대처방법 안내처럼 피부와 눈의 공막에 노란빛, 진한 오렌지색의 소변, 희거나 회색빛의 소변, 파랗거나 보랏빛 피부 또는 타박상, 호흡곤란, 피부의 발적이나 붉게 된 것, 부종이 있으면서 변색된 것, 가려움증을 어떤 순서로 기록하면 좋을까요? 여드름, 미지근한 물과 순한 비누 사용, 오랜시간 동안 뜨거운 물 노출, 향수·화장수·면도용 로션의 알코올 함유 여부, 긁거나 문지른 상황, 면 같은 부드러운 섬유 옷, 가능하면 피부를 공기에 노출한 기록, 햇빛 노출과 자외선이 강한 오전 10시부터 오후 3시 활동, 손바닥과 발바닥 통증·부종·붉어짐·물집·표피박리, 방사선치료 부위 건조와 자극 없는 수용성 크림이나 로션 사용 가능 여부, 치료부위를 비비거나 긁거나 마사지한 상황, 빨갛게 붓거나 물집이 생긴 상황, 손발톱이 검은색으로 변하거나 흰색 줄이 생긴 변화, 깨지거나, 건조해지고, 갈라지고, 들릴 수 있는 변화, 손발톱 뿌리부분 붉어짐·통증·진물을 제 항암·방사선 일정과 피부 상태 기준으로 언제 진료팀에 알려야 하는지 확인하면 좋을까요?",
	    sourceId: "nccSkinChangeCare",
	  },
	  {
	    topic: "빈혈·혈색소·어지럼 기록 확인",
	    question:
	      "국가암정보센터 빈혈 관리 안내처럼 받고 있는 항암 치료가 적혈구에 영향을 미칠 수 있는지 확인해 두고, 현재 적극적인 항암 치료 중이라면 치료가 적혈구에 영향을 미치는 것인지 담당 의사에게 묻고 대처 방법을 알아두라고 설명됩니다. 빈혈 관련 증상을 숙지하고 일지에 정리하여 진료 시 담당 의사에게 모든 관련증상을 이야기한다는 기준에 맞춰 심각한 피로나 허약함, 숨 가쁨, 혼동이나 집중하기 힘들어짐, 핏기 없는 입술, 잇몸, 눈꺼풀, 손톱 뿌리, 손바닥을 포함한 창백한 피부, 빠른 심박동수, 춥게 느껴지는 것, 슬퍼지거나 우울해지는 것을 어떤 순서로 기록하면 좋을까요? 정기적인 혈액 검사 시 적혈구 수와 헤모글로빈 수치를 점검하고 에너지 수준과 비교한 기록, 하루 일과를 조정하거나 가족 또는 친구들에게 일을 분배한 기록, 과도한 운동을 피한 상황, 충분한 휴식, 균형 잡힌 음식, 탈수되지 않도록 하루 6--8잔의 물을 마시려고 노력한 기록, 어지럼증이 있을 때 운전, 아이 돌보기, 외출 같은 활동을 주의한 기록, 누워있거나 앉은 자세에서 천천히 일어나기, 충분한 수면과 짧은 낮잠을 제 치료 일정과 혈액검사 결과 기준으로 어떻게 진료팀에 확인하면 좋을까요?",
	    sourceId: "nccAnemiaCare",
	  },
		  {
		    topic: "출혈·멍·코피·혈변 기록 확인",
		    question:
		      "국가암정보센터 출혈 증상 안내처럼 출혈의 증상과 의료진에게 보고해야 되는 증상을 알고 있어야 하며, 출혈이 되고 있는지 여부를 알 수 없는 증상도 의료진에게 알려야 한다고 설명됩니다. 의식상태의 변화, 핀으로 찌른 것처럼 작고 붉은 발진, 멍이 쉽게 생기는 증상, 눈의 흰동자에 출혈 또는 시력저하, 코피, 입안의 혈액성 수포, 잇몸출혈, 침에 피가 섞여 나오는 증상을 어떤 순서로 날짜와 위치별로 기록하면 좋을까요? 가래에 피가 섞여 나오거나 호흡곤란이 있는지, 구토 물에 피가 섞여 나오거나 혈변, 검은 색의 묽은 변, 복부통증, 복부팽창이 있는지, 혈뇨, 소변을 볼 때 통증, 빈뇨, 비정상적인 다량의 질출혈 또는 폐경기 이후의 질출혈이 있는지를 제 치료 일정과 혈액검사 결과 기준으로 언제 진료팀에 알리고 어떤 질문으로 확인하면 좋을까요?",
		    sourceId: "nccBleedingSymptoms",
		  },
			  {
			    topic: "탈모·두피 보호 기록 확인",
			    question:
			      "국가암정보센터 탈모 도움이 되는 방법 안내처럼 머리를 거칠게 감지 않고 말릴 때 살살 두들겨 말렸는지, 두피를 청결하게 관리했는지, 머리카락이 빠지는 동안 부드러운 샴푸와 크림린스를 썼는지 어떤 순서로 기록하면 좋을까요? 헤어 드라이기 같은 열기구 사용을 줄이거나 꼭 필요할 때 가장 약한 열로 했는지, 공기 중에서 자연스럽게 말릴 수 있었는지, 간격이 넓고 부드러운 빗을 사용했는지, 탈모로 인한 불안감과 감정변화, 모자, 스카프, 선크림, 자신에게 잘 맞는 가발 준비, 아직 머리카락이 빠지기 전에 준비할 항목, 갑자기 두피 피부가 노출될 때 보호 기준을 제 항암 일정과 두피 민감도 기준으로 어떻게 진료팀에 확인하면 좋을까요?",
			    sourceId: "nccHairLossCare",
			  },
			  {
			    topic: "딸꾹질 지속 상담 기준 확인",
			    question:
			      "국가암정보센터 딸꾹질 의료진 상담 상황 안내처럼 하루이상 딸꾹질이 지속될 경우, 호흡곤란이 일어날 경우, 위장이 커져있거나 팽만되어 있는 것으로 보이는 경우, 잠을 이룰수 없을 정도로 딸꾹질이 나올 때, 딸꾹질로 인해 고통을 느낄 때 의료진과 상의해야 한다고 설명됩니다. 딸꾹질 시작 시점, 지속 시간, 호흡곤란, 위장 팽만, 수면 방해, 고통 정도를 어떤 순서로 기록하고 제 치료 일정·복부 증상·호흡 증상 기준으로 언제 진료팀에 알려야 하는지 확인하면 좋을까요?",
			    sourceId: "nccHiccupConsult",
			  },
			  {
			    topic: "HPV·검진",
	    question:
      "HPV 백신은 예방용이고 접종 후에도 자궁경부암 선별검사를 계속 받아야 한다는 점을 제 나이와 치료 이력 기준으로 가족에게 어떻게 설명하면 좋을까요?",
    sourceId: "kdcaHpv",
  },
  {
    topic: "HPV 감염·파트너 상담",
    question:
      "사람유두종바이러스가 주로 성접촉으로 전파되지만 혈액·체액·장기이식으로 전파되지 않고, 대부분 증상 없이 자연소멸될 수 있다는 점을 저와 배우자/파트너의 검사·백신·콘돔·정기검진 상담에서 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccHpvInfection",
  },
  {
    topic: "임신·출산 계획",
    question:
      "원추절제술, 환상투열요법, 광범위자궁경부절제술 이력에 따라 임신 가능성, 산전관리, 유산·조산 위험을 어떤 진료과와 언제 상담해야 하나요?",
    sourceId: "nccPregnancyBirth",
  },
  {
    topic: "성생활 재개 상담",
    question:
      "국가암정보센터 성생활 설명처럼 단순자궁절제술 후 수술 후 6주부터 가능하다는 일반 설명과 담당의 진찰 필요성, 광범위자궁절제술 후 질의 길이 변화와 통증 가능성, 방사선 치료 중과 방사선치료 후 약 2주-1개월 성관계 자제, 질 협착·건조함·출혈 시 국소 호르몬 연고 상담, 콘돔 권고가 제 수술·방사선치료 범위와 회복 상태에 어떻게 적용되는지 진료팀에 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccSexLife",
  },
  {
    topic: "자녀·가족 설명 준비",
    question:
      "자궁경부암 진단과 치료로 생긴 외모·일상 변화, 검사·치료 일정, 자녀가 질문하거나 감정을 표현해도 괜찮다는 안내, 암이 누구의 잘못도 아니며 아이의 잘못도 아니라는 설명을 자녀의 나이와 이해 정도에 맞춰 어떤 말로 준비하면 좋을지 진료팀과 보호자에게 어떻게 확인하면 좋을까요?",
    sourceId: "nccCancerLifeChildrenCommunication",
  },
  {
    topic: "정서 안정·전문상담 준비",
    question:
      "국가암정보센터 심리적 안정 안내처럼 항암화학요법을 받을 때 우울, 암 치료 자체에 대한 불안감, 일상의 삶이 바뀌는 것, 항암제 여러 부작용에 대한 두려움이 생길 수 있다는 점을 기준으로 일지나 일기에 어떤 감정·상황·질문을 기록하고, 의사나 간호사에게 질문할 내용, 가족이나 친구·다른 환자와 나눌 이야기, 정신과 전문의 상담 기준, 보호자의 공감적 경청을 진료팀과 보호자에게 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccCancerLifePsychologicalStability",
  },
  {
    topic: "불면·수면일지 상담 준비",
    question:
      "국가암정보센터 암생존자 수면관리 안내처럼 암 환자의 약 30~50%가 불면증을 경험하고, 불면은 복용하는 약물이나 암 치료 때문에 수면 습관이 바뀌어 나타날 수 있다고 설명됩니다. 수면 효율은 실제로 잠을 자는 시간을 잠자리에 누워 있는 총시간으로 나누어 계산한다는 점을 기준으로 취침·기상 시각, 실제 수면 시간, 낮잠, 항상 일정한 시각에 일어난 기록, 저녁 카페인, 취침 시간 외 침대 사용, 잠들기 전 2시간 안 운동, 휴대 전화 사용, 잠이 오지 않을 때 침실 밖에서 조용한 활동을 했는지를 어떻게 수면일지로 정리하고 진료팀에 확인하면 좋을까요?",
    sourceId: "nccSurvivorSleepManagement",
  },
  {
    topic: "운동강도·근력운동 상담 준비",
    question:
      "국가암정보센터 암생존자 운동 안내처럼 암생존자의 규칙적인 운동참여는 체력증진, 피로도 감소로 삶의 질을 높여주고 일부 암종에서 재발률과 사망률 위험 감소가 설명되지만, 이를 제 자궁경부암 상태의 개인 효과로 단정하지 않도록 확인하려고 합니다. 주당 150분 이상의 중강도 신체활동과 주 2회 이상의 근력운동 권고가 제 수술·방사선·항암 치료 이력, 빈혈·호흡곤란·통증·림프부종 상태, 현재 체력에 어떻게 적용되는지, 중강도가 숨이 약간 차지만 옆 사람과 대화가 가능한 정도라는 설명에 맞춰 활동 시간·강도·피로 변화·부종 변화를 어떻게 기록하면 좋을까요? 암생존자 운동프로그램이 정보교육과 스트레칭, 전신 근력운동을 포함하고 실제 운동을 배우므로 편안한 운동복을 입고 오면 좋다는 안내가 제 지역 센터나 재활 상담에서 가능한지 진료팀에 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccSurvivorExerciseManagement",
  },
  {
    topic: "치료 후 영양·식생활 상담 준비",
    question:
      "국가암정보센터 암생존자 영양·식생활 안내처럼 치료 후 건강한 식생활 원칙으로 적정체중 유지, 골고루 균형잡힌 식사 계획, 다양한 색의 과일, 채소, 전곡류 선택, 육가공품과 탄 음식 섭취 주의, 짠 음식 줄이기와 싱겁게 먹기, 하루 한 두 잔의 술도 피하는 원칙, 건강보조식품, 민간요법 주의를 제 치료 이력과 현재 소화기 증상에 맞춰 어떻게 기록하면 좋을까요? 최근 식사와 간식, 체중 변화, 가공육·직화/탄 음식·짠 음식·술 노출, 복용 중인 건강보조식품이나 민간요법 목록을 진료팀에 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccSurvivorNutritionLifestyle",
  },
  {
    topic: "직업복귀·근무조정 상담 준비",
    question:
      "국가암정보센터 암생존자 직업복귀 안내처럼 직업복귀는 경제 상태와 삶의 질에 긍정적 영향이 있을 수 있지만, 암을 진단받았다고 해서 반드시 직장을 그만두어야 할 필요는 없습니다. 제 치료계획, 몸 상태, 직업의 종류를 기준으로 치료와 일을 병행할 수 있는지와 직장 복귀시기를 의료진과 상의하려면 업무 종류와 업무 스트레스, 치료방법과 예상 치료기간, 부작용과 스트레스 반응, 근무시간 조정·유연근무제·재택근무 같은 지원 가능성, 휴가·병가·근무조정에 필요한 증빙서류를 어떤 순서로 정리하면 좋을까요? 직장 복귀 후 회식이 불가피할 때 음주와 자극적인 음식을 어떻게 기록하고 진료팀에 확인하면 좋을까요?",
    sourceId: "nccSurvivorWorkReturn",
  },
  {
    topic: "보완대체요법 상담 준비",
    question:
      "국가암정보센터 보완대체요법 상담 안내처럼 보완대체요법을 고려할 때 주치의와 먼저 상의하고, 안전과 안녕, 계획한 요법과 다른 치료의 장/단점, 특정 크림이나 약물 또는 침을 맞는 것처럼 제한이 필요한 부위·시술, 약초나 영양제 복용 사실과 부작용 위험, 요법가들의 직접적인 설명, 현재 상태와 앞으로 진행될 의학적 치료 이해 여부를 진료팀에 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccComplementaryTherapyConsultation",
  },
  {
    topic: "암성 통증 평가 준비",
    question:
      "국가암정보센터 통증평가 항목처럼 암 환자의 통증은 제5의 활력 징후로 정기적인 평가가 필요하고, 통증 병력은 악화 또는 완화 요인, 통증의 성격, 위치와 방사통, 숫자통증등급 0~10 강도, 시작 시간·경과·지속 시간, 돌발성 통증 여부를 의료진에게 자세히 말해야 한다고 설명되는데, 제 골반통·허벅지 통증·수술 또는 방사선 후 통증을 어떤 기록 형식으로 정리해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccPainAssessment",
  },
  {
    topic: "암관련 피로 대처 준비",
    question:
      "국가암정보센터 암관련 피로대처 안내처럼 피로의 정도를 정확하게 평가하고, 피로를 느낄 때의 상황을 기록해 하루 일과를 계획하며, 해야 할 일의 우선순위를 정하고 중요하지 않은 활동을 줄이고, 주위 사람들의 도움을 받아 에너지를 보존할 수 있다고 설명되는데, 제 치료 일정, 수면, 식사, 활동, 현기증, 자꾸 몽롱함, 숨이 차고 가슴이 두근거림, 귀가 윙윙거리거나 두통, 삶의 의욕이 없어지는 우울감을 주치의와 간호사에게 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccCancerFatigueCoping",
  },
  {
    topic: "호흡곤란 변화 기록 준비",
    question:
      "국가암정보센터 호흡곤란 원인 안내처럼 암환자와 관련된 호흡곤란은 숨이 가쁜 느낌, 충분한 공기를 얻기 어려운 느낌, 호흡은 노력을 요구하는 느낌, 가슴은 단단해지는 느낌으로 표현될 수 있고, 쉬고 있거나 움직일 때 숨이 가쁘거나 가슴에 통증이 있거나 맥박수가 빨라지거나 피부가 차고 축축해지는 증상, 호흡이 빨라짐, 콧구멍 벌어짐, 입술·손톱의 청색증, 전에 없던 호흡곤란이나 갑자기 악화되는 경우를 의사에게 알려야 한다고 설명되는데, 제 기침·객혈·흉통·숨참 기록과 재발/폐 전이 걱정을 어떤 항목으로 정리해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccDyspneaCause",
  },
  {
    topic: "호흡곤란·흉통 상담 기준 확인",
    question:
      "국가암정보센터 호흡곤란 도움이 되는 방법 안내처럼 기침이나 구토가 있으면 가래의 양과 양상 및 냄새를 관찰하고, 호흡곤란이나 흉통, 노랗거나 녹색이며 걸쭉하고 혈액이 섞인 가래, 피부가 창백하거나 파랗거나 혹은 차갑고 축축함, 열, 호흡하는 동안 콧구멍이 넓게 벌어질 때, 호흡시 그르렁소리가 날 때 의사와 상의하라고 설명되는데, 제 호흡곤란 시작 시점, 움직임·휴식 중 발생 여부, 흉통, 가래 색·점도·혈액 섞임, 피부색·차가움·축축함, 열, 콧구멍 벌어짐, 호흡 소리를 어떤 순서로 기록해 진료팀에 알려야 하는지 확인하면 좋을까요?",
    sourceId: "nccDyspneaConsult",
  },
  {
    topic: "기침·객혈 변화 기록 준비",
    question:
      "국가암정보센터 기침 원인 안내처럼 기침은 기도안에 이물질이 있거나 분비물이 많을때 깨끗이 배출하기 위한 정상적인 반사작용이며 호흡곤란을 일으키거나 호흡곤란에 의해 유발되기도 하고, 병적인 기침은 환자가 불편을 느끼는 증상으로 지속되거나 발작적인 것을 말한다고 설명됩니다. 밤에 잠을 방해하거나 피곤, 통증, 기절, 구토, 흉통, 복통, 두통을 일으키는지, 흉막 삼출, 이물질 흡인, 호흡기 감염, 좌심실 부전, 천식, 알러지, 폐암 같은 원인 확인이 필요한지, 제 기침·가래·객혈·흉통·호흡곤란 기록을 어떤 순서로 정리해 진료팀에 확인하면 좋을까요?",
    sourceId: "nccCoughCause",
  },
  {
    topic: "치료현황 통계 해석",
    question:
      "국가암정보센터 치료현황 통계처럼 2019-2023년 자궁경부암 5년 상대생존율 79.0%, 요약병기별 국한 94.5%·국소 73.8%·원격 29.1%·모름 69.5%와 5년 이상 생존 확률 설명이 제 병기, 검사 근거, 치료 반응, 재발·전이 여부와 어떤 차이가 있는지 개인 예후로 단정하지 않고 진료팀에 어떻게 해석 질문을 하면 좋을까요?",
    sourceId: "nccTreatmentStatus",
  },
  {
    topic: "수술 합병증 확인",
    question:
      "국가암정보센터 치료의 부작용 설명처럼 수술 직후 급성 합병증으로 출혈, 장폐색, 혈관손상, 요관손상, 직장 파열, 폐렴, 폐색전 증 등이 드물게 설명되고, 광범위자궁절제 및 림프절 절제술 뒤 방광이나 직장의 기능부전, 배뇨나 배변 장애, 림프 낭종, 다리나 회음부 림프 부종이 생길 수 있다는 설명과 증상이 있는 림프 낭종의 흡입도관 배액 가능성이 제 수술명, 림프절 절제 범위, 현재 증상에 어떻게 적용되는지 진료팀에 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccTreatmentSideEffects",
  },
  {
    topic: "방사선 급성 부작용 확인",
    question:
      "국가암정보센터 치료의 부작용 설명처럼 방사선치료로 인한 합병증은 자궁보다 방사선에 약한 장 점막과 방광점막 손상으로 나타날 수 있고, 급성 합병증으로 장운동의 일시적인 증가와 점막의 손상으로 올 수 있는 설사, 일반적인 방광염과 비슷한 증상이 설명되는데, 방사선치료 회차, 설사 횟수, 복통, 배뇨 빈도, 소변 통증, 혈뇨 여부를 어떤 기준으로 기록하고 언제 진료팀에 연락해야 하는지 어떻게 확인하면 좋을까요?",
    sourceId: "nccTreatmentSideEffects",
  },
  {
    topic: "방사선 질 변화 상담",
    question:
      "국가암정보센터 치료의 부작용 설명처럼 방사선치료 후 질의 위축 또는 경화 등이 올 수 있고 호르몬치료와 국소치료를 병행해 어느 정도 예방과 치료를 할 수 있다는 설명이 제 방사선치료 범위, 질건조·통증·출혈·성생활 변화, 기존 호르몬 금기 여부에 어떻게 적용되는지 진료팀에 어떤 순서로 확인하면 좋을까요?",
    sourceId: "nccTreatmentSideEffects",
  },
  {
    topic: "전암성 병변 치료 확인",
    question:
      "국가암정보센터 치료방법 설명처럼 전암성 병변은 자궁경부이형성증과 자궁경부상피내암인 경우를 말하고, 치료방법으로 원추절제술, 국소파괴요법(동결요법·고주파요법·레이저요법), 단순자궁절제술 등이 설명되는데, 아이를 더 원하거나 자궁 보존을 원하는지, 원추절제술 조직검사에서 병변이 절제 부위에만 있는지, 조직경계 침범이나 더 진행된 암 발견 여부를 어떤 순서로 진료팀에 확인하면 좋을까요?",
    sourceId: "nccTreatmentMethods",
  },
  {
    topic: "침윤성 초기 치료 확인",
    question:
      "국가암정보센터 치료방법 설명처럼 침윤성 자궁경부암은 환자의 연령과 건강상태, 암의 파급정도, 동반된 합병증 여부에 따라 수술·방사선치료·항암화학요법 등을 선택하고, 비교적 초기 환자가 임신을 원한다면 광범위 자궁경부절제술과 복강경을 이용한 림프절 절제술로 자궁을 보존할 수 있다고 설명되는데, 제 병기가 1기와 2기 초기인지, 광범위 자궁절제술이 필요한 경우 자궁주위 조직·질 상부·골반림프절 절제 범위가 어떻게 정해지는지 어떤 순서로 진료팀에 확인하면 좋을까요?",
    sourceId: "nccTreatmentMethods",
  },
  {
    topic: "요약·진료 흐름",
    question:
      "국가암정보센터 요약설명 기준으로 발생부위와 조직형, HPV·위험요인, 권고안 3년 간격과 국가암검진사업 2년 주기, 증상, 진단검사, 치료 선택 기준, 부작용과 재발 추적 중 제 기록에서 빠진 항목을 어떤 순서로 진료팀에 확인하면 좋을까요?",
    sourceId: "nccOverview",
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
    label: "발생부위·구조 메모",
    detail:
      "국가암정보센터는 자궁이 골반 안에 있으며 앞쪽에는 방광, 뒤쪽에는 직장이 있고 임신하지 않은 상태에서는 상하 약 7cm, 좌우 약 4cm 정도의 계란 크기라고 설명합니다. 자궁 상부 2/3는 자궁체부, 하부 1/3은 자궁경부이며 자궁경부는 자궁 입구 부분으로 제일 아래에 있어 질과 연결되고 자궁체부보다 신축성 있는 조직이라고 설명합니다. 검사·수술·방사선치료 설명을 들을 때 자궁경부, 자궁체부, 질, 방광, 직장, 요관, 림프관 및 림프절 위치 용어가 내 검사결과와 치료범위에서 어떤 의미인지 진료팀에 확인합니다.",
    sourceId: "nccAnatomySite",
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
      "국가암정보센터는 원추 절제술 시술 후에는 수술 후 약 6~8주간 질 분비물이 많이 나올 수 있고, 간헐적 으로 질출혈이 생길 수 있습니다. 이 기간 동안 성관계, 수영이나 탕목욕, 무리한 운동을 피하고, 변비가 생기지 않도록 주의해야 합니다. 이 제한과 변비 예방 메모가 내 퇴원 안내서와 진료팀 지시에 어떻게 적용되는지 대조합니다.",
    sourceId: "nccRecovery",
  },
  {
    label: "광범위 자궁절제술 후 회복",
    detail:
      "국가암정보센터는 광범위 자궁절제술 후에는 수술 후 최소한 6주 동안에는 무거운 것을 들면 안되고, 부부관계를 피해야 하며, 갑작스러운 통증 이 올 수 있으므로 완전히 회복될 때까지는 운전을 하지 않는 것이 좋습니다. 이 회복 제한과 해제 시점을 내 수술 범위, 퇴원 안내서, 진료팀 지시에 맞춰 확인합니다.",
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
      "국가암정보센터는 재발 성 자궁경부암 의 증상은 매우 다양합니다. 체중감소, 하지 부종, 골반 혹은 허벅지 통증, 질출혈 혹은 질분비물의 증가, 진행 성 요관 폐색, 쇄골위 림프절 비대 등이 나타나며, 폐로 전이 하면 기침, 객혈, 때로는 흉통을 호소할 수 있습니다. 그러나 특징적인 증상이 없는 경우가 더 많습니다. 병원 방문 때마다 문진, 골반내진을 포함한 신체검사, 세포검사와 필요 시 가슴사진, 종양 표지자, CT, MRI, PET 검사 여부를 내 증상 기록과 병원 계획에 맞게 진료팀에 확인합니다.",
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
    label: "자녀·가족 설명 메모",
    detail:
      "국가암정보센터는 부모의 암 진단과 가족 생활 변화가 숨겨지면 자녀가 혼란을 겪지 않도록 변화와 느낌을 표현할 기회를 주는 것이 중요하다고 설명합니다. 암 설명은 자녀의 나이에 걸맞은 수준으로 준비하고, 치료 계획과 가족 생활의 변화, 탈모·극심한 피로감·체중 저하 같은 외모와 일상 변화, 자녀가 암이나 죽음 같은 말을 꺼내 질문을 할 수 있게 하는 답변, 자신의 정서를 표현할 방법을 진료팀과 보호자에게 확인합니다. 가족이 대신 말할 때는 검사와 치료가 힘들어 감정 변화가 있을 수 있지만 네 잘못 때문이 아니고 환자가 자녀에게 화가 난 것이 아니라는 문구를 기록해 둡니다.",
    sourceId: "nccCancerLifeChildrenCommunication",
  },
  {
    label: "정서 안정·전문상담 메모",
    detail:
      "국가암정보센터는 항암화학요법을 받을 때 암 치료 자체에 대한 불안감, 일상의 삶이 바뀌는 것, 항암제 여러 부작용에 대한 두려움 때문에 \"우울해지기 쉽습니다\"라고 설명합니다. 치료 중 일지나 일기에 그날그날 있은 일, 떠오른 상념과 의문을 적으면 생각 정리와 의사나 간호사에게 질문할 때 도움이 된다는 설명을 기준으로 감정 변화, 치료 스케줄로 바뀐 일상, 걱정이나 두려움, 가족이나 친구·다른 환자와 나눌 이야기, 정신과 전문의 상담 기준을 기록합니다. 환자가 불안하거나 두려워할 때는 가족과 친지가 상황과 감정을 평가하지 않고 이해하는 공감의 자세로 듣는다고 설명하므로, 보호자가 같이 확인할 문구와 연락 기준을 진료팀과 보호자에게 확인합니다.",
    sourceId: "nccCancerLifePsychologicalStability",
  },
  {
    label: "불면·수면효율·습관 메모",
    detail:
      "국가암정보센터는 불면증은 밤에 잠을 자지 못하는 증상이며 암 환자의 약 30~50%가 불면증을 경험한다고 설명합니다. 불면증은 복용하는 약물 때문에 나타나기도 하고 암 치료 때문에 수면 습관이 바뀌어서 나타날 수도 있다고 안내합니다. 수면효율은 실제로 잠을 자는 시간과 잠자리에 누워 있는 총시간을 비교해 계산하므로 취침 시각, 기상 시각, 실제 수면 시간, 잠자리에 누워 있던 총시간, 낮잠 여부를 기록합니다. 건강한 수면 습관으로는 전날 일찍 잠들지 못했더라도 아침에 항상 일정한 시각에 일어나기, 취침 시간 외에는 잠자리에 눕지 않기, 커피·홍차·녹차·콜라 같은 카페인 음료를 저녁에는 섭취하지 않기, 낮에 규칙적으로 운동하되 잠들기 전 2시간 안에는 운동하지 않기, 잠자리에서 휴대 전화 사용을 삼가고 자다가 시간을 확인하지 않기, 잠이 오지 않을 때 억지로 자려 하지 않고 침실 밖에서 조용한 음악 듣기나 책 읽기 같은 활동 후 졸릴 때 다시 눕는지를 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccSurvivorSleepManagement",
  },
  {
    label: "암생존자 운동강도·근력운동 메모",
    detail:
      "국가암정보센터는 암생존자의 규칙적인 운동참여가 체력증진, 피로도 감소로 삶의 질을 높여주고 일부 암종에서는 재발률과 사망률 위험을 낮춰준다고 설명하지만, 이 문구를 개인 예후나 자궁경부암 재발 예방 보장으로 단정하지 않고 진료팀 확인 기준으로 분리합니다. 미국 스포츠의학회 권고로 주당 150분 이상의 중강도 신체활동과 주 2회 이상의 근력운동을 제시하며, 중강도 신체활동은 숨이 약간 차지만 옆 사람과 대화가 가능한 정도라고 설명합니다. 암생존자 운동프로그램은 운동 정보교육과 스트레칭, 전신 근력운동을 배울 수 있는 프로그램이고, 실제 운동을 배우는 시간이 있어 편안한 운동복이 좋다고 안내합니다. 활동 전후 피로, 통증, 숨참, 어지럼, 다리 부종·피부 변화, 운동 전후 부종 비교, 쉬어야 했던 이유를 기록하고 내 치료 이력과 체력에 맞는 강도·시간·금기·재활 의뢰 기준을 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccSurvivorExerciseManagement",
  },
  {
    label: "암생존자 균형식·가공육·보조식품 메모",
    detail:
      "국가암정보센터는 암생존자 건강한 식생활로 적정체중을 유지하고, 골고루 균형잡힌 식사를 계획하며, 다양한 색의 과일, 채소, 전곡류를 선택하라고 설명합니다. 또한 육가공품과 탄 음식의 섭취, 짠 음식의 섭취를 피하고 싱겁게 먹는 것, 하루 한 두 잔의 술도 피하는 것, 건강보조식품, 민간요법 등은 주의하는 것을 원칙으로 제시합니다. 이 항목은 식단 처방이나 특정 식품 금지 명령이 아니라 최근 식사와 간식, 체중 변화, 가공육·직화/탄 음식·짠 음식·술 노출, 복용 중인 건강보조식품이나 민간요법 목록, 치료 후 소화기 증상과 식사 제한 이유를 기록하고 내 치료 이력에 맞는 조정 기준을 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccSurvivorNutritionLifestyle",
  },
  {
    label: "암생존자 직업복귀·근무조정 메모",
    detail:
      "국가암정보센터는 직업복귀가 경제 상태와 삶의 질에 긍정적 영향을 줄 수 있고, 암 진단이 반드시 직장을 그만두어야 한다는 뜻은 아니며 치료계획, 몸 상태, 직업의 종류에 따라 일을 유지하면서 치료받는 것이 도움이 될 수 있다고 설명합니다. 치료와 일을 병행할 수 있는지, 직장 복귀시기, 치료방법과 예상 치료기간, 부작용과 스트레스 반응, 휴가·병가·연차·휴직 기간, 근무시간 조정·유연근무제·재택근무 같은 지원, 업무조정이 급여나 복지혜택에 미치는 영향, 근무조정 증빙서류를 의료진과 직장에 확인할 항목으로 기록합니다. 직장 복귀 후 불가피한 외식이나 회식에서는 음주와 맵고 자극적인 음식이 치료 후 몸 상태에 맞는지 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccSurvivorWorkReturn",
  },
  {
    label: "보완대체요법·약초 공유 메모",
    detail:
      "국가암정보센터는 보완대체요법을 고려하고 있다면 주치의와 먼저 상의할 것을 안내하고, 상담을 통해 환자의 안전과 안녕을 고려하며 계획한 요법과 다른 치료의 장/단점을 비교할 수 있다고 설명합니다. 주치의가 특정 크림이나 약물 사용 또는 침을 맞는 것 같은 특정 부위·시술을 제한할 수 있고, 약초나 영양제 복용 사실을 의료진에게 알리는 것은 부작용 위험을 최소화하는 방법이라고 설명합니다. 요법가들의 직접적인 설명에는 현재 상태와 앞으로 진행될 의학적 치료 이해 여부, 직접적인 치료 경험, 부작용 가능성을 포함해야 하므로, 보완대체요법 이름, 약초나 영양제 목록, 사용 시점, 기대 효과 문구, 부작용 우려, 설명서를 기록하고 진료팀과 보호자에게 확인합니다.",
    sourceId: "nccComplementaryTherapyConsultation",
  },
  {
    label: "암성 통증 평가 메모",
    detail:
      "국가암정보센터는 암 환자에게 통증은 제5의 활력 징후라고 할 수 있어 정기적인 평가가 필요하고, 극심한 통증에는 응급 상황에 준하는 신속하고 적절한 통증 관리가 필요하다고 설명합니다. 통증 병력은 악화 또는 완화 요인, 통증의 성격, 위치와 방사통, 숫자통증등급 0~10 강도, 시작 시간·경과·지속 시간, 급성·만성·돌발성 통증 구분을 의료진에게 자세히 말하도록 안내하므로, 통증 부위, 가장 심한 부위, 강도 숫자, 느낌, 악화/완화 상황, 배뇨·기침·움직임·배변 관련성, 진통제 사용 여부와 효과, 진료팀 연락 기준을 기록합니다.",
    sourceId: "nccPainAssessment",
  },
  {
    label: "암관련 피로·수면·도움요청 메모",
    detail:
      "국가암정보센터는 피로의 정도를 반드시 정확하게 평가하고 피로 조절을 위해서는 환자 본인과 가족의 노력, 의료진의 적절한 조언이 필요하다고 설명합니다. 해야 할 일은 우선순위를 정하고 중요하지 않은 활동은 줄이며, 피로를 느낄 때의 상황을 기록하면 하루 일과를 계획하는 데 도움이 된다고 안내합니다. 주위 사람들의 도움을 받아 에너지 낭비를 줄이고, 자주 쓰는 물건은 손이 닿기 쉬운 곳에 두며, 피로를 참지 말고 주치의와 간호사에게 알리도록 설명하므로 피로 시작 시점, 강도, 수면, 식사, 활동, 도움 요청할 일, 에너지 보존 방법을 기록합니다. 심한 현기증, 자꾸 몽롱해지는 경우, 숨이 차고 가슴이 두근거리는 경우, 귀가 윙윙거리거나 두통이 심한 경우, 삶의 의욕이 없어지거나 우울하다고 느끼는 경우에는 진료팀 연락 기준을 확인합니다.",
    sourceId: "nccCancerFatigueCoping",
  },
  {
    label: "호흡곤란·흉통 변화 메모",
    detail:
      "국가암정보센터는 암환자와 관련된 호흡곤란을 숨이 가쁜 느낌, 충분한 공기를 얻기 어려운 느낌, 호흡은 노력을 요구하는 느낌, 가슴은 단단해지는 느낌으로 설명합니다. 쉬고 있거나 움직일 때 숨이 가쁘거나 호흡하기 힘든지, 가슴에 통증이 있는지, 맥박수가 빨라지는지, 피부가 차고 축축하게 느껴지는지, 호흡이 빨라지거나 그르렁소리가 나는지, 콧구멍이 벌어지는지, 입으로 호흡하거나 입술을 오므리고 숨 쉬는지, 입술·손톱에 청색증이 보이는지를 날짜와 상황별로 기록합니다. 전에 없었던 호흡곤란이 나타나거나 갑자기 악화되는 경우에는 진료팀에 알릴 기준을 확인합니다.",
    sourceId: "nccDyspneaCause",
  },
  {
    label: "호흡곤란·흉통·가래 상담 메모",
    detail:
      "국가암정보센터는 \"기침이나 구토 가 있으면 가래의 양과 양상 및 냄새를 관찰합니다. (투명하거나 하얗고 거품이 있는 것이 정상입니다. )\"라고 안내합니다. 또한 \"이런 경우에는 의사와 상의하십시오.\"라는 기준으로 호흡곤란이나 흉통이 있을 때, 노랗거나 녹색이며 걸쭉하고 혈액이 섞인 가래가 있을 때, 피부가 창백하거나 파랗거나 혹은 차가우며 축축할 때, 열이 있을 때, 호흡하는 동안 콧구멍이 넓게 벌어질 때, 호흡시 그르렁소리가 날 때를 제시합니다. 호흡곤란 시작 시점, 쉬거나 움직일 때의 발생 여부, 흉통, 가래 색·점도·혈액 섞임, 피부색·차가움·축축함, 열, 콧구멍 벌어짐, 호흡 소리를 기록하고 어떤 조합에서 진료팀에 알려야 하는지 확인합니다.",
    sourceId: "nccDyspneaConsult",
  },
  {
    label: "기침·가래·수면방해 메모",
    detail:
      "국가암정보센터는 기침이란 기도안에 이물질이 있거나 분비물이 많을때 깨끗이 배출하기 위한 정상적인 반사작용이며 호흡곤란을 일으키거나 호흡곤란에 의해 유발되기도 합니다. 병적인 기침은 환자가 불편을 느끼는 증상으로 지속되거나 발작적인 것을 말합니다. 밤에 잠을 방해하거나, 피곤, 통증, 기절, 구토, 흉통, 복통, 두통을 일으키거나 가끔씩 늑골골절 등을 일으키는 괴로운 증상입니다. 말기 암 환자의 기침은 흉막 삼출, 이물질 흡인, 호흡기 감염, 좌심실 부전, 천식, 알러지, 폐암 등에 의해 발생할 수 있다고 설명하므로, 기침 시작 시점, 지속/발작 여부, 밤잠 방해, 가래 양상과 냄새, 객혈, 흉통, 복통, 두통, 구토, 호흡곤란 동반 여부를 기록하고 진료팀에 원인 확인 기준을 질문합니다.",
    sourceId: "nccCoughCause",
  },
  {
    label: "식생활·보조식품 확인",
    detail:
      "국가암정보센터는 자궁경부암 환자가 특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다. 충분한 영양을 섭취하고 휴식을 취하는 것이 몸의 면역 기능 강화와 투병 생활에 도움이 될 수 있습니다. 방사선 치료나 항암화학요법 중에는 장기능이 약해질 가능성이 있으므로 되도록 자극적인 음식은 피합니다. 또한 항암화학요법을 받는 중에는 민간요법이나 건강보조식품은 삼갑니다. 내 치료 일정, 장 기능 변화, 자극적인 음식, 민간요법·건강보조식품 복용 여부를 약제 기준에 맞춰 진료팀에 확인합니다.",
    sourceId: "nccDiet",
  },
  {
    label: "치료 중 열량·단백질·영양소 메모",
    detail:
      "국가암정보센터는 암 자체뿐 아니라 암을 치료하기 위한 방법들도 환자의 영양 상태에 영향을 미치고, 영양 상태는 질병의 이환율과 사망률, 치료 효과, 삶의 질에도 영향을 미친다고 설명합니다. 치료 중 잘 먹으면 영양 상태 유지, 치료에 따르는 부작용을 잘 극복, 감염의 위험 감소, 항암치료로 손상된 세포 재생에 도움이 될 수 있다고 안내합니다. 암을 낫게 해주는 특별한 식품이나 영양소는 없으며, 균형 잡힌 식사로 좋은 영양 상태를 유지하는 것이 매우 중요합니다. 그러기 위해서는 충분한 열량과 단백질, 비타민 및 무기질을 섭취해야 하며, 이는 여러 가지 음식을 골고루 먹음으로써 가능합니다. 이 항목은 식사량, 단백질 반찬, 다양한 식품군, 식사 어려움, 보조식품 고민을 치료 일정과 증상 기준으로 기록하고 진료팀에 확인하는 메모로 남깁니다.",
    sourceId: "nccTreatmentEating",
  },
  {
    label: "메스꺼움·구토 식사환경 메모",
    detail:
      "국가암정보센터는 메스꺼움은 수술, 화학요법, 방사선요법 등의 일반적인 부작용 입니다. 치료 받은 직후에 메스꺼움이 나타나는 사람이 있는가 하면, 치료 2~3일 후에 나타나는 사람들도 있습니다. 원인이 무엇이든 간에 메스꺼움으로 인해 음식을 충분히 섭취할 수 없으면 우리 몸에 필요한 영양소를 충족시킬 수 없게 되므로 메스꺼움 증상을 잘 조절하는 것이 중요합니다. 음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다. 항구토제 사용은 의사선생님과 상의하고, 메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 하는지 진료팀 기준을 확인합니다. 토스트, 크래커, 요거트, 샤베트, 복숭아통조림, 부드러운 과일과 채소, 맑은 유동식, 얼음조각처럼 부담이 적은 후보와 기름진 음식, 사탕·쿠키·케익 같은 매우 단 음식, 향이 강하거나 뜨거운 음식, 이상한 냄새가 나는 음식처럼 메스꺼움을 더 유발할 수 있는 후보를 구분하고, 메스꺼움이 언제, 무엇 때문에 나타나는지 기록해 의사선생님이나 간호사와 상의합니다.",
    sourceId: "nccNauseaDiet",
  },
  {
    label: "구토 후 유동식·부드러운 식사 메모",
    detail:
      "국가암정보센터는 구토증상이 있는 경우 먹거나 마시지 않도록 하고, 구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다. 맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다. 우유를 소화시키기 힘들면 우유가 들어있지 않은 제품을 이용하도록 설명하며, 구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다. 이 항목은 구토 시작·마지막 시점, 횟수, 수분 섭취 가능 여부, 물·육수·맑은 유동식·미음·부드러운 식사·일반식 전환 시점, 우유 소화 어려움, 소변 감소나 어지러움 동반 여부를 기록하고 진료팀에 확인하는 메모로 남깁니다.",
    sourceId: "nccVomitingDiet",
  },
  {
    label: "식욕부진 간식·수분 타이밍 메모",
    detail:
      "국가암정보센터는 식욕부진은 암 자체와 항암치료에 의해 가장 흔하게 일어날 수 있고, 암으로 인한 공포나 우울감 등으로도 생길 수 있다고 설명합니다. 조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. 식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 하며, 평소에 좋아하던 음식이나 음식 형태 변화를 통해 메뉴를 다양하게 해 보는지 기록합니다. 몸의 상태가 가장 좋을 때 많이 먹도록 하며 일반적으로 충분한 휴식을 취한 아침이 가장 좋다고 설명하고, 간식으로 죽, 미음, 쥬스, 스프, 우유 및 유제품 등을 활용하도록 안내합니다. 식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다. 만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다. 식사하는 시간, 장소, 분위기 변화, 가벼운 산책 등 규칙적인 운동, 식사전후에 입안을 청결하게 한 기록, 식사섭취가 계속적으로 힘들 때 특수영양 보충음료를 진료팀 기준으로 확인할 필요, 주위 사람이 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 않고 환자 스스로 먹을 수 있게 돕는 문구를 기록합니다.",
    sourceId: "nccAppetiteLossDiet",
  },
  {
    label: "입과 목 통증 부드러운 식사 메모",
    detail:
      "국가암정보센터는 입안과 목구멍은 방사선요법, 화학요법 또는 감염 등에 의해 입안 통증, 잇몸의 손상, 인후염 또는 식도염 등이 자주 발생한다고 설명합니다. 입안 통증이나 잇몸에 염증이 있는 경우 항암치료의 부작용 때문인지 치과질환인지 진료팀에 확인할 기준을 기록합니다. 부드럽고 촉촉한 음식을 준비합니다. 씹고 삼키기 쉬운 음식을 먹습니다. 죽류는 흰죽, 닭죽, 고기죽, 전복죽, 호박죽, 야채죽, 계란죽 등이 있고, 미음은 쌀미음, 조미음, 잣미음, 깨미음, 녹두미음 등이 있으며, 고기는 부드럽게 조리하고 생선은 곱게 다지거나 갈아서, 채소는 부드러운 야채를 푹 익히거나 데쳐서, 과일은 바나나, 배, 수박, 과일통조림 등과 같이 시지 않은 과일을 기준으로 먹기 쉬웠는지 남깁니다. 입안을 자극하는 음식이나 음료는 피하도록 합니다. 오렌지, 포도, 레몬, 토마토주스, 향신료를 많이 사용하거나 소금에 절인 음식, 토스트, 크래커 또는 말린 음식이 통증이나 따가움을 악화시켰는지 기록합니다. 요리를 부드럽고 연해질 때까지 했는지, 음식을 작은 크기로 자릅니다 같은 방식이 도움이 되었는지, 필요하면 믹서로 곱게 갈았는지, 입안이 쓰린 경우 빨대와 작은 스푼을 이용했는지 남깁니다. 뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다. 얼음조각을 먹는 것도 도움이 됩니다. 다만 옥살로플라틴 등 말초신경염을 유발할 수 있는 항암제를 투여받는 경우 온도변화에 민감하여 통증을 유발할 수 있으므로 차가운 음식은 피해야 하는지 제 약제 기준으로 확인합니다. 따뜻한 육수에 소금을 약간 넣은 음료가 가능한지, 치아와 잇몸 통증은 치과 진료 필요성을 확인할지, 음식을 먹은 후 입안은 깨끗이 헹구어 청결하게 유지했는지를 진료팀 질문으로 남깁니다.",
    sourceId: "nccMouthPainDiet",
  },
  {
    label: "구내염 구강청결·틀니·헹굼 메모",
    detail:
      "국가암정보센터는 입안의 염증(구내염) 도움이 되는 방법으로 구강을 깨끗하고 촉촉하게 유지하는 방법을 설명합니다. 칫솔모가 부드러운 것을 썼는지, 틀니는 발포성 틀니용 세정제나 1.5%과산화수소 용액에 6-7분 동안 담가둡니다. 잘 헹구어 내는지, 치실 또는 양치질 후 입안을 헹구는지, 구강함수액 후보를 제 치료 일정과 구강 상태 기준으로 진료팀·치과에 확인할 항목으로 남깁니다. 구강함수액은 생리식염수 500cc 와 베이킹 소다 10g을 섞은 물, 6%이하의 알코올 이 섞인 구강청정제, 1.5%과산화수소 수용액 또는 물과 과산화수소의 비가 3:1 이 되도록 만들어 사용합니다. 이 후보들은 임의 적용하지 않고 적절성, 농도, 횟수, 삼킴 위험을 확인합니다. 항암화학요법 시작 전에 잇몸 상태 등에 대하여 의료진과 미리 상의할 필요가 있는지, 항암치료 및 방사선치료 도중 구강을 자주 헹궈 수분을 충분하게 유지하는 방법, 알코올 성분 구강세정제를 삼가는 기준, 의치를 꼭 필요한 경우만 착용하는 기준, 입안 통증·붉어짐·궤양·출혈·삼킴 어려움과 24시간 이상 먹거나 마실 수 없는 경우의 연락 기준을 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccMucositisCare",
  },
  {
    label: "입안 건조 수분·촉촉한 식사 메모",
    detail:
      "국가암정보센터는 머리와 목 주위에 대한 항암화학요법 이나 방사선치료 는 침분비를 감소시켜 입안을 마르게 할 수 있습니다. 입안이 건조해 지면, 음식물을 씹고 삼키는 것이 더욱 어려워지고 음식의 맛도 변할 수 있습니다. 가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다. 부드럽고 곱게 간 식품을 먹도록 합니다. 음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹도록 합니다. 삼키기 쉽게 하기 위해 음식에 소스나 드레싱을 첨가하여 촉촉하게 합니다. 식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다. 딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있습니다. 입술 연고 등을 사용하여 입술이 촉촉한 상태로 유지되도록 합니다. 아주 달거나 신음식을 먹으면 침분비가 많아집니다. 단, 입안이 헐거나 목구멍이 아플 경우에는 피하도록 합니다. 그러나 문제가 심각하면 의사선생님이나 치과선생님과 상의합니다. 이 항목은 수분 섭취 가능 시간, 삼킴 어려움, 촉촉하게 만든 음식, 단맛·신맛 예외, 입술 보습, 심한 증상 여부를 기록하고 진료팀과 치과 상담 기준으로 확인하는 메모로 남깁니다.",
    sourceId: "nccDryMouthDiet",
  },
  {
    label: "입맛 변화 단백질·향 메모",
    detail:
      "국가암정보센터는 암이나 항암치료, 혹은 치과적인 문제 때문에 음식의 맛이나 냄새에 민감해 질 수 있습니다. 특히, 고기나 생선 등의 고단백식품들에 대해서는 쓴맛이나 금속성 맛을 느끼게 되고 음식의 맛이 없어질 수 있습니다. 그러나 이런 변화는 치료가 끝나면 사라질 것입니다. 암이나 항암치료 등에 의한 입맛의 변화를 막을 수 없지만, 보기가 좋고 냄새도 좋은 식품을 선택하고 준비합니다. 만약 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품을 이용합니다. 고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다. 신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있으므로 오렌지나 레몬같이 시큼한 식품을 사용합니다. 그러나 입과 목에 통증 이 있다면, 이런 식품들이 염증을 자극하거나 불편하게 하므로 주의합니다. 음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고, 입안을 자주 헹구도록 합니다. 이 항목은 싫어진 고단백 음식, 가능한 단백질 대체 후보, 향·소스가 도움이 된 음식, 산미 식품 사용 가능 여부와 입·목 통증, 치과 문제 의심, 구강 헹굼 기록을 진료팀과 치과에 확인하는 메모로 남깁니다.",
    sourceId: "nccTasteChangeDiet",
  },
  {
    label: "설사 수분·전해질·자극음식 메모",
    detail:
      "국가암정보센터는 설사는 항암치료, 복부와 골반 부위의 방사선치료, 감염, 음식에 대한 민감성, 불안 및 스트레스 등에 의해 발생할 수 있습니다. 설사가 있을 경우에는 음식이 장을 빨리 통과하기 때문에 비타민, 무기질, 수분이 충분히 흡수되지 못합니다. 설사는 탈수의 원인이 될 수 있는데, 이 경우에는 충분한 수분을 섭취해야 합니다. 맑은 유동식은 적절한 영양소를 공급할 수 없으므로 1~2일 이상 먹이지 않도록 합니다. 갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다. 수분을 충분히 섭취하여 설사로 손실된 부분을 보충합니다. 염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분이 많이 들어있는 식품은 육수나 스포츠 음료이고, 칼륨이 많이 들어있는 식품은 바나나, 복숭아, 토마토, 으깬 감자 등입니다. 장이 약간 쉴 수 있도록 식사는 조금씩 자주 먹도록 합니다. 섬유소가 적은 식품을 먹습니다. (예) 흰밥, 흰죽, 미음, 흰빵, 삶거나 으깬 감자, 맑은 고깃국, 생선, 닭고기, 두부, 계란 등. 너무 뜨겁거나 찬 음식은 피하고 실온의 음식을 먹도록 합니다. 생야채, 생과일의 껍질, 씨를 피합니다. 브로콜리, 옥수수, 말린 콩 등 섬유소를 많이 함유한 식품은 피합니다. 카페인과 알코올을 함유한 음료와 음식을 피합니다. 커피, 홍차, 초콜릿, 탄산음료가 설사를 악화시켰는지 기록합니다. 가스를 발생시키는 식품이나 음료는 제한합니다. 콩, 양배추, 탄산음료, 껌이 해당됩니다. 우유 및 유제품을 먹을 때에는 주의합니다. 이는 우유에 들어있는 유당이 설사를 악화시킬 수 있기 때문입니다. 그러나 일반적으로 적은 양의 우유나 유제품은 소화시킬 수 있습니다. 설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다. 이 항목은 설사 시작 시점, 횟수, 혈변 여부, 수분·전해질 보충 후보, 먹기 쉬웠던 저섬유 음식, 악화 음식, 유제품 반응, 2일 이상 지속 여부를 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccDiarrheaDiet",
  },
  {
    label: "변비 수분·섬유소·활동 메모",
    detail:
      "국가암정보센터는 변비는 수분 및 음식섭취가 불충분하거나 오랫동안 누워있는 경우에 생길 수 있습니다. 그리고 항암제 나 진통제 등의 부작용 으로 생기기도 합니다. 수분을 충분히 섭취합니다.(하루에 8~10컵 이상) 이는 변을 부드럽게 합니다. 특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다. 음식 섭취량이 너무 적지 않도록 합니다. 도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취합니다. 가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다. 누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다. 계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 합니다. 이 항목은 변비 시작 시점, 배변 횟수, 수분 섭취량, 아침 차가운 물 반응, 실제 식사량, 먹기 쉬웠던 섬유소 식품, 진통제·항암제 사용, 가능한 활동량, 침상 안정 여부, 복부 문지름 도움 여부, 조절되지 않는 지속 여부를 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccConstipationDiet",
  },
  {
    label: "체중변화 열량·단백질·원인 메모",
    detail:
      "국가암정보센터는 암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있습니다. 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨립니다. 그러므로 체중감소를 예방하기 위해서 열량과 단백질 등을 충분히 섭취해야 합니다. 열량을 보충하려면 밥 : 김밥, 초밥, 주먹밥, 볶음밥 등, 죽 : 야채죽, 전복죽, 계란죽, 닭죽, 깨죽, 호박죽, 단팥죽, 잣죽 등을 다양하게 조리하고, 간식으로 감자, 고구마, 떡, 만두, 빵, 과일, 과일주스, 과일통조림 등을 활용한다고 설명합니다. 빵이나 떡 : 설탕, 꿀, 쨈, 버터, 땅콩버터 등을 발라 먹고, 감자에는 버터, 나물요리에는 식용유, 참기름, 들기름, 야채샐러드에는 마요네즈와 샐러드드레싱, 우유, 두유 등 음료에는 설탕, 꿀, 초콜릿, 미숫가루, 분유 등을 더할 수 있는지 기록합니다. 지방보다는 탄수화물이 많이 포함된 간식인 사탕, 젤리, 크래커, 빵류, 과일, 주스 등은 더 편안함을 느낄 수 있다고 설명합니다. 단백질 후보는 계란 : 계란후라이, 계란찜, 수란, 오믈렛, 메추리알조림 등, 콩, 두부 : 콩밥, 두유, 연두부찜, 두부조림, 된장찌개, 콩자반 등, 생선 : 생선포, 생선전, 생선조림, 어묵, 마른 오징어 등, 유제품 : 우유, 요구르트, 요플레, 아이스크림, 밀크쉐이크, 치즈 등과 간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식입니다. 치료를 받는 동안 체중이 증가하는 사람들도 있습니다. 체중증가는 복용하고 있는 약물에 의한 체내 수분 보유나 식욕의 이상 증가 등으로 생길 수 있습니다. 그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다. 수분 보유가 관련되면 염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등), 식욕 증가가 관련되면 열량이 높고 영양가가 없는 식품들(예: 청량 음료, 초콜릿, 사탕, 과자류 등)을 기록합니다. 체중조절을 논의할 때는 과일과 야채 그리고 곡류의 섭취를 증가, 지방이 없는 부위의 육류제품과 저지방 우유 및 유제품, 끓이고 찌는 형태의 요리방법, 버터, 마요네즈, 감미료 등을 추가로 사용하지 않기, 가능한 고열량의 간식은 먹지 않기, 많이 먹었다고 생각되면 운동한 여부를 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccWeightChangeDiet",
  },
  {
    label: "면역저하 익힌음식·위생·보관 메모",
    detail:
      "국가암정보센터는 백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다. 식품으로 인한 질병의 위험을 낮추는 데 도움이 되는 사항으로 완전히 익힌 음식, 모든 식품 사용 전 유효기간 확인, 쥬스, 우유, 요구르트 등은 저온살균 제품인지 확인한 기록을 남깁니다. 상하기 쉬운 음식은 냉장고 혹은 냉동고에 보관하고, 요리하기 전의 고기, 생선, 닭고기 등은 분리하여 보관하며, 다른 식품에 고기나 생선즙이 떨어지지 않도록 보관합니다. 고기는 냉장고에서 녹이고, 해동한 후 즉시 요리하며, 남은 음식은 포장하여 즉시 냉장 보관합니다. 채소와 과일은 먹기 전에 깨끗이 씻고, 과일이나 채소는 썰기 전에 깨끗이 씻습니다. 음식을 만지거나 요리하기 전 손과 손톱 밑부분까지 깨끗이 씻고, 음식물에 머리카락이 들어가지 않도록 하며, 조리에 사용되는 기구, 식기, 수저는 소독합니다. 고기, 생선, 과일, 채소 등에 사용되는 식기, 도마, 칼 등은 가능한 분리해서 사용하거나 소독한 다음 사용하고, 생고기, 닭고기, 생선 등에서 나오는 즙이 다른 식품이나 음식에 떨어지지 않도록 조심하며, 외식보다는 직접 요리한 기록을 남깁니다. 고기, 닭고기, 생선 등은 완전히 익히고, 갈아둔 고기를 요리하거나 고명으로 얹고자 할 때에는 다른 재료들과 섞기 전에 충분히 익히도록 합니다. 날계란이나 덜 익힌 계란과 이들이 들어간 음식, 생굴, 회, 육회, 생선회, 생조개, 초밥 등 익히지 않은 음식, 다진 고기 오염 가능성, 딸기 등 꼼꼼히 씻기 어려운 과일, 냉장고에 보관하던 남은 음식도 3~4일이 지나면 버리기, 곰팡이가 핀 음식이나 상한 음식, 상온 30분 이상 운반, 녹슨 캔이나 움푹해진 캔, 녹은 냉동제품, 비살균 우유·주스·요구르트는 제 WBC/ANC, 항암·방사선 일정, 발열 여부 기준으로 진료팀 확인 메모로 남깁니다.",
    sourceId: "nccImmuneLowDiet",
  },
  {
    label: "피로감·우울 영양·휴식·도움요청 메모",
    detail:
      "국가암정보센터는 치료기간 동안 피로감은 제대로 먹지 못한 것, 운동 저하, 혈구수 부족, 우울, 불면 그리고 약물 부작용 등과 관련이 있다고 설명합니다. 만일 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요하고, 느끼는 감정과 공포에 대해 솔직하게 이야기하며, 치료방법, 부작용 그리고 이를 이겨내는 방법들에 대해 알아보면 미리 알고 행동함으로써 조절이 훨씬 쉬워질 수 있다고 설명합니다. 피로 시작 시점, 강도, 식사량, 활동량, 혈구수 설명, 수면, 감정 변화를 기록하고, 충분한 휴식을 취하고, 오랜 수면보다는 낮에 잠깐씩 낮잠이나 휴식을 취하며, 일상적인 활동보다 짧고 간단한 활동을 한 기록을 남깁니다. 영양이 풍부한 음식을 충분히 섭취하고, 불충분한 열량과 영양소 섭취가 피로의 원인이 될 수 있으므로 식사량, 간식, 하루 중 가장 좋은 시간에 가능한 많이 먹은 기록, 낮잠이나 휴식 후에 먹는 것이 더 편안했는지, 적은 양의 식사와 간식을 자주 먹었는지 기록합니다. 가족이나 친구의 도움, 주변의 이용 가능한 음식배달서비스, 치료를 받지 않을 때 좋아하는 음식, 가능하다면 산책이나 규칙적인 운동이 피로감과 정신 맑음에 도움이 되었는지, 피로를 악화시키는 행위 제한, 아이보기, 밥하기, 집안일 등 주변 사람들에게 도움을 청할 항목을 제 치료 일정, 혈구수 설명, 수면, 우울·불면, 약물 부작용 가능성과 함께 진료팀·보호자 확인 메모로 남깁니다.",
    sourceId: "nccFatigueDepressionDiet",
  },
  {
    label: "발열·오한·감염 상담 메모",
    detail:
      "국가암정보센터는 감염 상황에서 항문 상처가 생기면 병원 방문 기준을 확인하고, 오한 또는 38℃ 이상 열은 응급실 기준으로 제시합니다. 예방주사와 치과진료는 의료진과 상의하도록 안내하고, 오심·구토·설사, 흉통이나 호흡곤란, 배뇨시 쓰리거나 빈뇨, 뇨의 색변화나 냄새, 구강내 궤양이나 흰색의 반점을 상담 상황으로 설명합니다. 체온 측정 시각, 최고 체온, 오한 지속 시간, 항문 상처, 소화기 증상, 흉통·호흡곤란, 배뇨 변화, 구강 병변, 예방주사·치과진료 예정 여부를 제 치료 일정과 혈액검사 결과 기준으로 기록하고 언제 진료팀에 알려야 하는지 확인합니다.",
    sourceId: "nccInfectionConsult",
  },
  {
    label: "손발저림·감각·화상예방 메모",
    detail:
      "국가암정보센터는 신경계 손상 시 주의 사항으로 손비비기, 주먹을 쥐었다가 폈다하는 동작을 합니다. 뜨거운 것은 화상을 입을 위험이 있으므로, 주의하여 사용하셔야 합니다. 손, 발을 항상 깨끗이 씻고, 손톱, 발톱을 짧게 하여 상처가 나지 않도록 주의하셔야 합니다. 혼자서 깎지 말고, 다른 사람의 도움을 받는 것이 좋습니다. 양말은 부드러운 면으로 된 것을 사용하며, 신발 앞부분이 뾰족한 모양은 피하며 맨발로 다니지 않도록 합니다. 추위나 찬 것에 노출을 피하며, 손이나 발을 물에 넣기 전에 물의 온도를 확인하고, 수염 관리가 필요한 경우 전기면도기 사용 여부와 직접 운전하지 않는 주의를 제 치료 일정과 증상 기준으로 확인합니다. 손발저림과 감각이상 등의 신경증이 있으면 의료진과 상의합니다. 손가락, 손, 발가락, 발의 감각이 떨어질 수 있습니다. 손끝, 발끝이 저리고 무감각해지고 약해지고 통증 까지 수반할 수 있습니다. 아프고 따끔거리는 감각이 지속적으로 나타나는지, 한쪽 또는 양쪽 귀의 청력이 변화되는지, 복통, 구토, 변비가 함께 생기는지 기록하고 진료팀에 확인합니다.",
    sourceId: "nccNeuropathyCare",
  },
	  {
	    label: "피부변화·손발홍반·손발톱 메모",
	    detail:
	      "국가암정보센터는 피부변화에서 피부와 눈의 공막에 노란빛, 진한 오렌지색의 소변, 희거나 회색빛의 소변, 파랗거나 보랏빛 피부 또는 타박상, 호흡곤란, 피부의 발적 이나 붉게 된 것, 부종 이 있으면서 변색된 것, 가려움증을 관찰합니다. 여드름, 피부 발진, 피부건조, 붉어진 피부, 가려움 시작 시점과 부위를 기록하고, 피부건조가 있으면 미지근한 물, 순한 비누, 오랜시간 동안 뜨거운 물 노출 여부, 향수·화장수·면도용 로션의 알코올 함유 여부를 확인합니다. 피부 발진과 가려움은 긁는 것, 피부를 문지르지 않은 기록, 강한 햇빛이나 열 노출, 냉기 노출, 면 같은 부드러운 섬유 옷, 손톱을 깨끗하게 관리한 기록과 함께 남깁니다. 피부가 붉거나 발적되면 부드럽게 닦고 말린 기록, 가능하면 피부를 공기에 노출한 기록, 뜨겁거나 차가운 것으로부터 손상된 부위를 보호한 기록, 햇빛 노출과 자외선 활동이 강한 오전 10시부터 오후 3시 활동 여부를 남깁니다. 손바닥과 발바닥의 통증, 부종, 붉어짐, 물집, 피부 벗겨짐, 통증이 심하거나 물집 형성, 표피박리 여부는 의료진에게 알릴 기준으로 정리합니다. 방사선치료 부위는 표시 선, 자극이나 상처, 전기면도기 사용 여부, 수영·뜨거운 물질·테이프·일회용 밴드 노출, 순면 의복, 직사광선 차광, 건조 시 자극 없는 수용성 크림이나 로션을 1일 2회 정도 가볍게 바를 수 있는지, 치료부위를 비비거나 긁거나 마사지한 상황, 가능하면 환부를 공기에 노출한 기록, 빨갛게 붓거나 물집이 생긴 상황을 진료팀 확인 메모로 남깁니다. 손톱이나 발톱이 검은색으로 변하거나 흰색 줄이 생길 수 있고, 깨지거나, 건조해지고, 갈라지고, 들릴 수도 있으므로 색 변화, 줄, 깨짐, 건조, 갈라짐, 들림, 손발톱 뿌리부분의 피부 붉어짐, 통증, 진물 여부를 제 항암·방사선 일정과 함께 기록하고 진료팀에 확인합니다.",
	    sourceId: "nccSkinChangeCare",
	  },
	  {
	    label: "빈혈·혈색소·어지럼 메모",
	    detail:
	      "국가암정보센터는 받고 있는 항암 치료가 적혈구에 영향을 미칠 수 있는지 확인해 둡니다. 현재 적극적인 항암 치료를 받고 있다면, 치료가 적혈구에 영향을 미치는 것인지의 여부에 대하여 담당 의사에게 묻고 대처 방법에 대하여 알아둡니다. 빈혈 관련 증상을 숙지하고 일지에 정리하여 진료 시 담당 의사에게 모든 관련증상을 이야기합니다. 이 항목은 심각한 피로나 허약함, 숨 가쁨, 혼동이나 집중하기 힘들어짐, 핏기 없는 입술, 잇몸, 눈꺼풀, 손톱 뿌리, 손바닥 등을 포함한 창백한 피부, 빠른 심박동수, 춥게 느껴지는 것, 슬퍼지거나 우울해지는 것을 날짜와 상황별로 기록합니다. 정기적인 혈액 검사 시에 적혈구 수와 헤모글로빈 수치를 점검하고 에너지 수준과 비교해 둡니다. 하루 일과를 조정하거나 가족 또는 친구들에게 일을 분배함으로써 에너지를 보존한 기록, 과도한 운동을 삼간 상황, 충분한 휴식, 균형 잡힌 음식 섭취, 탈수되지 않도록 하루 6--8잔의 물을 마시도록 노력한 기록을 남깁니다. 어지럼증이 있을 시에는 운전, 아이 돌보기, 외출과 같은 활동은 주의를 요합니다. 누워있거나 앉은 자세에서는 천천히 일어나야 하며, 충분한 수면과 낮 시간 동안 의자나 소파에서 짧은 낮잠을 취한 기록을 제 항암 일정, 혈액검사 결과, 증상 변화와 함께 진료팀 확인 메모로 남깁니다.",
	    sourceId: "nccAnemiaCare",
	  },
		  {
		    label: "출혈·멍·코피·혈변 메모",
		    detail:
		      "국가암정보센터는 출혈의 증상과 의료진에게 보고해야 되는 증상에 대해 알아야 하며, 출혈이 되고 있는지의 여부를 알 수 없는 증상도 의료진에게 알려야 한다고 설명합니다. 이 항목은 출혈 관련 증상으로 의식상태의 변화, 혼수, 혼미, 침착하지 못한 상태, 두통, 현기증, 지시하는 대로 시행할 수 없는 경우, 팔이나 다리 힘이 없는 경우를 날짜와 상황별로 기록합니다. 핀으로 찌른 것처럼 작고 붉은 발진 이 피부에 퍼져 있으며 팔과 다리에 주로 나타납니다. 멍이 쉽게 생깁니다. 눈의 흰동자에 출혈이 있거나 시력저하가 오는지, 눈 또는 귀부위 통증이 있는지 기록합니다. 코피, 입안의 혈액성 수포, 잇몸출혈, 구강 궤양 의 출혈이 있을 수 있고 침에 피가 섞여 나오기도 합니다. 가래에 피 섞여 나오거나 호흡곤란, 빈호흡 및 부족상태가 있는 경우를 기록합니다. 구토 물에 피가 섞여 나오거나 혈변, 검은 색의 묽은 변을 볼 수 있습니다. 복부통증과 복부팽창이 있는지 함께 남깁니다. 혈뇨, 소변을 볼 때 통증이나 타는 듯한 느낌, 빈뇨(소변을 자주 봄), 비정상적인 다량의 질출혈(또는 폐경기 이후의 질출혈) 등이 있습니다. 증상의 시작 시점, 위치, 양, 반복 여부, 동반 증상을 제 치료 일정과 혈액검사 결과와 함께 진료팀에 보고하고 확인할 메모로 남깁니다.",
		    sourceId: "nccBleedingSymptoms",
		  },
			  {
			    label: "탈모·두피 보호·가발 준비 메모",
			    detail:
			      "국가암정보센터는 탈모 시 머리를 거칠게 감지 않도록 하며 말릴 때는 살살 두들겨서 말립니다. 두피를 청결하게 관리하고, 머리카락이 빠지는 동안은 머리빗질이 쉽도록 부드러운 샴푸와 크림린스를 사용한다고 설명합니다. 헤어 드라이기와 같은 열기구의 사용은 되도록 줄입니다. 꼭 필요한 경우에는 가장 약한 열로 하도록 합니다. 가장 좋은 방법은 공기 중에서 자연스럽게 마르도록 하는 것이라고 안내합니다. 심한 빗질은 피하고 간격이 넓고 부드러운 빗으로 살살 빗은 기록을 남깁니다. 탈모로 인한 불안감을 의료진 및 가족들에게 표현하고 탈모를 경험하는 다른 환자들과의 대화를 통하여 감정을 나누는 것도 좋습니다. 외출 시에는 모자, 스카프 등을 사용하며, 완전 탈모 시에는 두피를 보호하기 위하여 선크림(햇빛 차단제)을 사용합니다. 탈모가 예상되면 자신에게 잘 맞는 가발, 모자, 스카프를 준비했는지, 아직 머리카락이 빠지기 전에 구입할 수 있었는지, 두피는 민감하므로 갑자기 두피 피부가 노출될 때 보호가 필요한지 기록합니다. 탈모는 자신에 대한 느낌을 변화시킬 수 있고 이런 감정변화로 다른 중요한 일을 하기 어렵다면 의사나 간호사와 논의할 수 있으므로, 치료 일정, 탈모 시작 시점, 두피 민감도, 외출 보호, 가발 준비, 감정 변화를 진료팀 확인 메모로 남깁니다.",
			    sourceId: "nccHairLossCare",
			  },
			  {
			    label: "딸꾹질 지속·호흡곤란 상담 메모",
			    detail:
			      "국가암정보센터는 이런 때에는 의료진과 상의하라고 하며, 하루이상 딸꾹질이 지속될 경우, 호흡곤란이 일어날 경우, 위장이 커져있거나 팽만되어 있는 것으로 보이는 경우, 잠을 이룰수 없을 정도로 딸꾹질이 나올 때, 딸꾹질로 인해 고통을 느낄 때를 안내합니다. 딸꾹질 시작 시점, 지속 시간, 호흡곤란, 위장 팽만, 수면 방해, 고통 정도, 치료 일정과 복부·호흡 증상 동반 여부를 날짜별로 기록하고 언제 진료팀에 알려야 하는지 진료팀 확인 메모로 남깁니다.",
			    sourceId: "nccHiccupConsult",
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
    label: "HPV 백신 종류·예방범위 확인",
    detail:
      "접종기관과 진료팀에 2가 백신은 HPV 16, 18형, 4가 백신은 HPV 16, 18형과 HPV 6, 11형, 9가 백신은 HPV 6, 11, 16, 18, 31, 33, 45, 52, 58형에 의한 질병 예방 범위인지 확인합니다. 전체 자궁경부암의 약 70%에 대한 방어효과와 교차반응 가능성은 완전 예방으로 단정하지 않도록 가족 설명 문구에 적고, 유전자재조합 백신으로 병을 일으키는 DNA가 포함되어 있지 않아 감염의 위험은 없다는 안전 질문도 함께 남깁니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 남성 접종·관련질환 확인",
    detail:
      "질병관리청 국가건강정보포털은 4가 및 9가 백신이 남성에게도 접종되어 항문암, 성기암, 두경부 종양 등 HPV 관련 질환 예방에 사용될 수 있다고 설명합니다. 다만 남성에서 HPV 백신의 질병 예방 효과는 여성의 자궁경부암 예방 효과만큼 높지 않습니다. 가족이나 보호자와 남성 접종 대상, 백신 종류, 관련 질환 예방 범위, 기대효과 한계를 접종기관과 진료팀 질문으로 정리합니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 관련질환 범위 확인",
    detail:
      "질병관리청 국가건강정보포털은 HPV 감염이 대부분 무증상이고 자연적으로 소멸하지만, 지속적인 HPV 감염은 자궁경부암, 자궁경부 전암병변, 항문 생식기의 사마귀와 호흡기에 생기는 유두종 병변 등을 일으킬 수 있다고 설명합니다. 이 항목은 가족이나 파트너에게 HPV 관련 질환 범위를 설명할 때 암, 전암병변, 사마귀, 호흡기 유두종 병변을 구분하고, 개인 원인이나 진단으로 단정하지 않도록 진료팀 질문으로 정리합니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 치료효과·재발연구 확인",
    detail:
      "질병관리청 국가건강정보포털은 현재 개발된 HPV 백신이 예방용 백신이므로 상피내종양이나 자궁경부암에 대한 치료 효과는 없는 것으로 생각된다고 설명합니다. 치료 후 재발 방지에 도움이 되는지에 대한 연구는 현재 진행 중이라고 안내하므로, 백신 이력과 치료 이력을 치료나 재발 예방 확정 근거로 쓰지 말고 진료팀 질문으로 정리합니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 허가연령·노출전 효과 확인",
    detail:
      "질병관리청 국가건강정보포털은 자궁경부암 백신이 사람유두종바이러스에 노출되기 전, 즉 성접촉을 시작하기 전에 접종하는 것이 가장 유리하다고 설명합니다. 현재 국내 시판 HPV 백신은 9세부터 25~26세까지 접종 허가를 받았고, 허가 연령 이후 여성에서 암 예방 효과는 입증되지 않았다고 안내합니다. 다만 26세 이상이더라도 성생활을 시작하지 않았거나 HPV에 노출 기회가 적은 경우 이론적으로 암예방 효과를 기대할 수 있다고 설명하므로, 내 나이, 성생활 시작 여부, 노출 가능성, 백신 종류와 기대효과 한계를 진료팀 질문으로 정리합니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 접종 후 이상반응·관찰 확인",
    detail:
      "질병관리청 국가건강정보포털은 HPV 백신 접종 후 정상적인 면역반응으로 접종 부위 통증, 부종, 발적 같은 국소 반응과 발열, 오심(메스꺼움), 근육통 같은 전신반응이 나타날 수 있다고 설명합니다. 국소반응 중 접종 부위 통증은 약 80%로 가장 흔하고, 가만히 있어도 느껴지거나 일상 활동을 방해할 정도의 통증은 약 6%에서 관찰되었지만 대부분 수일 내 회복되었다고 안내합니다. 매우 드물게 심한(중증) 알레르기 반응으로 호흡곤란, 아나필락시스가 있을 수 있고, 젊은 성인 및 청소년에서는 예방접종 후 실신 보고 빈도가 높게 나타난다고 설명하므로, 앉거나 누운 상태로 접종하고 접종 후 20~30분 관찰, 알레르기 병력, 실신 경험, 귀가 뒤 연락 기준을 접종기관과 진료팀 질문으로 정리합니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 접종 일정·관찰 확인",
    detail:
      "접종기관에서 9세 이상 가능 여부, 만 12세 권장/지원 여부, 9-13(14)세 첫 접종 6개월 간격 2회와 이후 첫 접종 3회 일정 적용 여부를 확인합니다. 접종 당일 안내에는 앉거나 누운 상태와 접종 후 20~30분 관찰, 접종 후에도 선별검사 유지 여부를 함께 기록합니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 접종 전 임신·급성질환 확인",
    detail:
      "질병관리청 국가건강정보포털은 임신 중의 백신 접종은 권장되지 않으며, 백신 접종 후 임신을 알게 된 경우에는 나머지 접종은 출산 뒤로 미루게 된다고 설명합니다. 또한 중등도 또는 심한 급성기 질환(고열을 동반한 감염질환 등)이 있는 경우에는 증상이 호전될 때까지 접종을 피해야 한다고 안내합니다. 임신 가능성, 수유 여부, 고열·급성 감염, 기저질환, 접종 후 발열 처치 혼선 가능성을 접종기관과 진료팀에 질문으로 남깁니다.",
    sourceId: "kdcaHpv",
  },
  {
    label: "HPV 접종 지연·추가접종 메모",
    detail:
      "국가암정보센터는 HPV 접종시기를 놓친 경우 '남은 주사를 가능한 빨리 맞으며 처음부터 다시 시작하지는 않습니다'라고 설명합니다. 1차 후 일정 지연 시 2차와 3차 접종 간격은 적어도 12주인지 확인하고, 추가접종은 권고된 바가 없으므로 내 백신 종류·접종일·치료 일정 기준으로 접종기관과 진료팀에 질문으로 남깁니다.",
    sourceId: "nccHpvVaccine",
  },
  {
    label: "HPV 국가예방접종 대상 메모",
    detail:
      "질병관리청 예방접종도우미는 HPV 국가예방접종 사업대상으로 2026년 5월 6일부터 시행되는 12세 남성 청소년(2014.1.1.~2014.12.31. 출생자), 12~17세 여성 청소년, 18~26세 저소득층 여성을 안내합니다. HPV 백신은 자궁경부암의 70%를 일으키는 고위험 유전형(16형,18형) 감염 예방 목적이고, 성경험 전에 접종을 완료할 경우 자궁경부 상피내 종양 등 전암병변에 70~90%의 예방효과가 보고된다고 설명합니다. 가족이나 보호자와 대상 여부와 접종일정, 지원 백신, 위탁의료기관 확인, 접종 후 20~30분 관찰 안내를 접종기관과 진료팀 질문으로 남깁니다.",
    sourceId: "kdcaHpvNationalImmunization",
  },
  {
    label: "HPV 감염·전파 상담 메모",
    detail:
      "국가암정보센터는 사람유두종바이러스가 주로 성접촉으로 감염되고 혈액, 체액, 장기이식으로는 전파되지 않는다고 설명합니다. 대부분의 감염은 아무 증상 없이 자연소멸될 수 있지만 고위험군 바이러스가 지속 감염되면 자궁경부암 발생 위험이 높아질 수 있으며, 첫 성경험 나이, 성상대자 수, 본인 또는 배우자의 성 상대자 수가 위험과 관련될 수 있다고 설명합니다. 이 항목은 감염을 비난이나 개인 원인으로 단정하지 말고, 배우자/파트너와 백신, 콘돔, 정기검진, HPV 검사 필요성을 진료팀 질문으로 정리합니다.",
    sourceId: "nccHpvInfection",
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
