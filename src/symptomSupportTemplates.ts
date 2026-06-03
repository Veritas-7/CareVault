export type SymptomSupportTemplate = {
  id: string;
  label: string;
  keywords: string[];
  mealNote: string;
  clinicianQuestion: string;
  safetyNote: string;
};

const safetyNote = "치료 지시가 아니라 진료 전 확인용 기록 후보입니다.";

export const symptomSupportTemplates: SymptomSupportTemplate[] = [
  {
    id: "nausea",
    label: "오심/구역",
    keywords: ["오심", "구역", "메스꺼움", "토할", "nausea"],
    mealNote: "냄새가 강하지 않은 소량 식사, 수분 섭취, 자극적인 음식 제한 여부를 기록 후보로 남기세요.",
    clinicianQuestion:
      "오심이 식사나 약 복용 시간과 관련 있는지, 항구토제 조정이나 탈수 확인이 필요한지 물어보세요.",
    safetyNote,
  },
  {
    id: "mouth-sore",
    label: "구내염/입안 통증",
    keywords: ["구내염", "입안", "입 통증", "mouth sore", "mucositis"],
    mealNote: "부드럽고 차갑거나 미지근한 음식 후보와 맵고 거친 음식 제한 여부를 기록하세요.",
    clinicianQuestion:
      "입안 통증이나 상처가 있을 때 피해야 할 음식, 구강 관리, 진료 연락 기준을 확인하세요.",
    safetyNote,
  },
  {
    id: "diarrhea",
    label: "설사",
    keywords: ["설사", "묽은 변", "diarrhea"],
    mealNote: "수분·전해질 섭취, 기름지거나 자극적인 음식 제한 여부, 설사 횟수를 함께 기록하세요.",
    clinicianQuestion:
      "설사 횟수, 탈수 징후, 지사제나 식사 조정이 필요한 기준을 의료진에게 확인하세요.",
    safetyNote,
  },
  {
    id: "constipation",
    label: "변비",
    keywords: ["변비", "constipation"],
    mealNote: "수분, 활동량, 식이섬유를 늘려도 되는지 확인할 후보 메모로 남기세요.",
    clinicianQuestion:
      "현재 치료·복용약 상황에서 식이섬유, 수분, 완하제 사용을 어떻게 조정할지 물어보세요.",
    safetyNote,
  },
  {
    id: "fatigue",
    label: "피로",
    keywords: ["피로", "기운 없음", "fatigue"],
    mealNote: "식사량, 수분, 수면, 활동 후 악화 여부를 같이 기록하세요.",
    clinicianQuestion:
      "피로가 검사 수치, 수면, 약물, 치료 일정과 관련 있는지 확인하고 쉬어야 할 기준을 물어보세요.",
    safetyNote,
  },
];

export function findSymptomSupportTemplate(input: string) {
  const normalized = input.toLowerCase();
  return symptomSupportTemplates.find((template) =>
    template.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );
}

export function buildSymptomSupportQuestion(
  template: SymptomSupportTemplate,
  symptomName: string,
) {
  const prefix = symptomName.trim() ? `${symptomName.trim()} 기록과 관련해 ` : "";
  return `${prefix}${template.clinicianQuestion}`;
}
