import { describe, expect, it } from "vitest";
import {
  buildSymptomSupportActionNote,
  buildSymptomSupportQuestion,
  buildSymptomSupportQueueHint,
  buildSymptomSupportSourceLinkLabels,
  findSymptomSupportTemplate,
  formatSymptomSupportQuestionDraftActionLabel,
  formatSymptomSupportQuestionDraftReadyStatus,
  formatSymptomSupportCitation,
  formatSymptomSupportSource,
  formatSymptomSupportSymptomDraftReadyStatus,
  symptomSupportTemplates,
} from "./symptomSupportTemplates";

describe("symptomSupportTemplates", () => {
  it("matches common cancer-treatment side-effect keywords", () => {
    expect(findSymptomSupportTemplate("식사 후 오심이 심함")?.id).toBe("nausea");
    expect(findSymptomSupportTemplate("입안 상처와 구내염")?.id).toBe("mouth-sore");
    expect(findSymptomSupportTemplate("입안이 마르고 구강건조가 심함")?.id).toBe(
      "dry-mouth",
    );
    expect(findSymptomSupportTemplate("입맛 변화와 금속성 맛")?.id).toBe("taste-change");
    expect(findSymptomSupportTemplate("식욕부진과 공복감 없음")?.id).toBe("appetite-loss");
    expect(findSymptomSupportTemplate("구토가 계속됨")?.id).toBe("vomiting");
    expect(findSymptomSupportTemplate("구토 12시간 이상 지속")?.id).toBe(
      "nausea-vomiting-consult-threshold",
    );
    expect(findSymptomSupportTemplate("diarrhea after medication")?.id).toBe("diarrhea");
    expect(findSymptomSupportTemplate("우울과 불면이 계속됨")?.id).toBe("fatigue");
    expect(findSymptomSupportTemplate("체중감소와 단백질 보충 걱정")?.id).toBe(
      "weight-change-nutrition",
    );
    expect(findSymptomSupportTemplate("백혈구 감소와 날음식 식사 걱정")?.id).toBe(
      "immune-low-food-safety",
    );
    expect(findSymptomSupportTemplate("손발저림과 감각이상")?.id).toBe(
      "neuropathy-safety",
    );
    expect(findSymptomSupportTemplate("피부 발진과 가려움")?.id).toBe(
      "skin-change-care",
    );
    expect(findSymptomSupportTemplate("빈혈과 어지럼증")?.id).toBe(
      "anemia-management",
    );
    expect(findSymptomSupportTemplate("잇몸출혈과 코피가 멈추지 않음")?.id).toBe(
      "bleeding-warning",
    );
    expect(findSymptomSupportTemplate("탈모와 두피 민감함")?.id).toBe(
      "hair-loss-care",
    );
    expect(findSymptomSupportTemplate("하루 이상 딸꾹질과 호흡곤란")?.id).toBe(
      "hiccup-consult",
    );
    expect(findSymptomSupportTemplate("자녀에게 암 설명 준비")?.id).toBe(
      "child-family-communication",
    );
    expect(findSymptomSupportTemplate("치료 불안과 부작용 두려움")?.id).toBe(
      "psychological-stability",
    );
    expect(findSymptomSupportTemplate("암생존자 디스트레스 자가평가")?.id).toBe(
      "survivor-distress-adaptation",
    );
    expect(findSymptomSupportTemplate("암생존자 불안 신체증상")?.id).toBe(
      "survivor-anxiety-management",
    );
    expect(findSymptomSupportTemplate("암생존자 수면관리 수면효율")?.id).toBe(
      "survivor-sleep-management",
    );
    expect(findSymptomSupportTemplate("암치료 후 슬럼프 울적함 의욕 상실 한 달")?.id).toBe(
      "survivor-treatment-slump",
    );
    expect(findSymptomSupportTemplate("암생존자 운동강도 상담")?.id).toBe(
      "survivor-exercise-management",
    );
    expect(findSymptomSupportTemplate("소아청소년 암생존자 운동 TOP 신체역량")?.id).toBe(
      "pediatric-exercise-activity-support",
    );
    expect(findSymptomSupportTemplate("소아청소년 암생존자 영양 식생활 BMI 백분위수")?.id).toBe(
      "pediatric-nutrition-growth-support",
    );
    expect(findSymptomSupportTemplate("소아청소년 암생존자 마음관리 마음 온도계 4점")?.id).toBe(
      "pediatric-mental-health-support",
    );
    expect(findSymptomSupportTemplate("암생존자 영양 식생활 균형잡힌 식사")?.id).toBe(
      "survivor-nutrition-lifestyle",
    );
    expect(findSymptomSupportTemplate("암생존자 예방접종 생백신 시점")?.id).toBe(
      "survivor-vaccination-timing",
    );
    expect(findSymptomSupportTemplate("암생존자 이차암 검진 흡연력 폐암 검진")?.id).toBe(
      "survivor-second-cancer-screening",
    );
    expect(findSymptomSupportTemplate("암생존자 직업복귀 근무시간 조정")?.id).toBe(
      "survivor-work-return",
    );
    expect(findSymptomSupportTemplate("암생존자 가족 통합지지 상담")?.id).toBe(
      "survivor-integrated-support",
    );
    expect(findSymptomSupportTemplate("소아청소년 암생존자 학교복귀 지원")?.id).toBe(
      "pediatric-school-return-support",
    );
    expect(findSymptomSupportTemplate("암관련 피로 대처")?.id).toBe(
      "cancer-fatigue-coping",
    );
    expect(findSymptomSupportTemplate("기침과 호흡곤란, 흉통")?.id).toBe(
      "dyspnea-consult",
    );
    expect(findSymptomSupportTemplate("충분한 공기를 얻을 수 없어요")?.id).toBe(
      "dyspnea-experience",
    );
    expect(findSymptomSupportTemplate("구강함수액과 틀니 세정 확인")?.id).toBe(
      "oral-mucositis-care",
    );
    expect(findSymptomSupportTemplate("기침이 오래 지속되고 밤잠 방해")?.id).toBe(
      "cough-care",
    );
    expect(findSymptomSupportTemplate("암환자 성기능장애 성욕 변화 의료진 상담")?.id).toBe(
      "sexual-function-change",
    );
    expect(findSymptomSupportTemplate("성문제나 성행위 의문 의료진 상담")?.id).toBe(
      "sexual-function-consult-threshold",
    );
    expect(findSymptomSupportTemplate("케모포트 삽입부위 붓고 분비물")?.id).toBe(
      "chemoport-contact-threshold",
    );
    expect(findSymptomSupportTemplate("자궁경부암 항암치료 민간요법 건강보조식품")?.id).toBe(
      "cervical-diet-supplement-boundary",
    );
    expect(findSymptomSupportTemplate("백혈구 수치 올리는 특별한 음식 치료 중 영양")?.id).toBe(
      "treatment-balanced-nutrition-boundary",
    );
    expect(findSymptomSupportTemplate("치료 중 건강식 단백질 반찬 채소 두 가지")?.id).toBe(
      "treatment-healthy-eating-tips",
    );
    expect(
      findSymptomSupportTemplate("치료 중 탄수화물 단백질 지방 비타민 무기질 물")?.id,
    ).toBe("treatment-nutrient-role-understanding");
    expect(
      findSymptomSupportTemplate("치료 후 식욕 감퇴 구강 건조증 입맛 변화 연하곤란 체중 감소")
        ?.id,
    ).toBe("post-treatment-eating-recovery");
    expect(findSymptomSupportTemplate("골반 림프절 치료 후 다리 붓기와 열감")?.id).toBe(
      "lymphedema",
    );
    expect(findSymptomSupportTemplate("38도 발열과 오한")?.id).toBe("infection-fever");
    expect(findSymptomSupportTemplate("성교 후 출혈과 악취 분비물")?.id).toBe(
      "cervical-general-warning",
    );
    expect(findSymptomSupportTemplate("방사선치료 후 혈뇨와 혈변")?.id).toBe(
      "cervical-urinary-bowel-bleeding",
    );
    expect(findSymptomSupportTemplate("광범위 자궁절제술 후 배뇨 장애")?.id).toBe(
      "cervical-urinary-bowel-bleeding",
    );
    expect(findSymptomSupportTemplate("방사선치료 후 장폐색과 복부팽만")?.id).toBe(
      "cervical-bowel-obstruction",
    );
    expect(findSymptomSupportTemplate("질건조와 성관계 통증")?.id).toBe(
      "cervical-sexual-health",
    );
    expect(findSymptomSupportTemplate("무월경과 안면홍조")?.id).toBe(
      "cervical-radiation-menopause",
    );
    expect(findSymptomSupportTemplate("임신 계획과 가임력")?.id).toBe(
      "cervical-fertility-pregnancy",
    );
    expect(findSymptomSupportTemplate("통증점수와 진통제 효과")?.id).toBe("pain-management");
  });

  it("keeps generated fever and infection draft text matched to the fever template", () => {
    expect(
      findSymptomSupportTemplate(
        "발열·오한/감염 의심 체온, 측정 시간, 오한 지속 시간, 소변 통증·빈뇨, 기침·흉통·숨참, 카테터 부위 발적·부종·분비물 여부",
      )?.id,
    ).toBe("infection-fever");
    expect(
      findSymptomSupportTemplate("림프부종 감염·악화 신호와 피부 붉어짐")?.id,
    ).toBe("lymphedema");
  });

  it("returns no template when the symptom is not mapped", () => {
    expect(findSymptomSupportTemplate("특이 증상 없음")).toBeUndefined();
  });

  it("builds clinician-facing questions without treatment instructions", () => {
    const template = findSymptomSupportTemplate("변비");

    expect(template).toBeDefined();
    expect(buildSymptomSupportQuestion(template!, "변비")).toContain("변비 기록과 관련해");
    expect(buildSymptomSupportQuestion(template!, "변비")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(formatSymptomSupportSource(template!)).toBe(
      "출처: 국가암정보센터 증상별 식생활 - 변비",
    );
    expect(formatSymptomSupportCitation(template!)).toBe(
      "출처: 국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
  });

  it("builds template-specific source and question-draft action labels", () => {
    const template = findSymptomSupportTemplate("38도 발열과 심한 오한")!;

    expect(buildSymptomSupportSourceLinkLabels(template)).toEqual({
      ariaLabel: "발열·오한/감염 의심 공식 출처 국가암정보센터 감염 의료진 상담 기준 열기",
      title: "발열·오한/감염 의심 공식 출처 국가암정보센터 감염 의료진 상담 기준 열기",
      visibleLabel: "출처: 국가암정보센터 감염 의료진 상담 기준",
    });
    expect(formatSymptomSupportQuestionDraftActionLabel(template)).toBe(
      "발열·오한/감염 의심 질문 초안 채우기",
    );
    expect(formatSymptomSupportSymptomDraftReadyStatus(template)).toBe(
      "발열·오한/감염 의심 증상 초안 준비됨 · 근거 국가암정보센터 감염 의료진 상담 기준 · 저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(formatSymptomSupportQuestionDraftReadyStatus(template)).toBe(
      "발열·오한/감염 의심 질문 초안 준비됨 · 근거 국가암정보센터 감염 의료진 상담 기준 · 저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
  });

  it("builds a lymphedema contact-threshold question from swelling keywords", () => {
    const template = findSymptomSupportTemplate("다리 붓기와 피부 붉어짐");

    expect(template?.id).toBe("lymphedema");
    expect(template?.mealNote).toContain("피부 붉어짐");
    expect(template?.mealNote).toContain("활동 전후 변화");
    expect(buildSymptomSupportQuestion(template!, "다리 붓기")).toContain(
      "바로 연락해야 할 기준",
    );
    expect(buildSymptomSupportQuestion(template!, "다리 붓기")).toContain(
      "출처: 국가암정보센터 림프부종 치료 전후관리 - https://www.cancer.go.kr/lay1/S1T429C431/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
  });

  it("builds an infection contact-threshold question from fever and chills keywords", () => {
    const template = findSymptomSupportTemplate("38도 발열과 심한 오한");

    expect(template?.id).toBe("infection-fever");
    expect(template?.mealNote).toContain("체온");
    expect(template?.mealNote).toContain("카테터 부위 발적");
    expect(buildSymptomSupportQuestion(template!, "38도 발열")).toContain("응급실 기준");
    expect(buildSymptomSupportQuestion(template!, "38도 발열")).toContain(
      "출처: 국가암정보센터 감염 의료진 상담 기준 - https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
  });

  it("builds an immune-low food-safety question from official cooked-food guidance", () => {
    const cookedFoodSentence =
      "항암화학요법 나 방사선 치료 후 백혈구수가 감소한 경우에는 감염에 대해 특별히 주의해야 하므로 음식을 통한 세균 감염을 예방하기 위해 익힌 음식을 먹도록 합니다.";
    const handWashSentence = "음식을 만지거나 요리를 하려면 손을 깨끗이 씻도록 합니다.";
    const expirationSentence = "식품의 유통기한을 꼭 확인합니다.";
    const separateStorageSentence =
      "요리하기 전의 고기, 생선, 닭고기 등은 비닐팩이나 플라스틱통 등에 분리하여 보관합니다.";
    const fullyCookSentence = "고기, 닭고기, 생선 등은 완전히 익히도록 합니다.";
    const rawEggSentence =
      "날계란이나 덜 익힌 계란과 이들이 들어간 음식은 먹지 않습니다.";
    const rawFoodSentence =
      "육회, 생선회, 생조개, 초밥 등 익히지 않은 음식은 드시지 않습니다.";
    const pasteurizedSentence =
      "쥬스, 우유, 요구르트 등은 저온살균 제품을 드시기 바랍니다.";
    const template = findSymptomSupportTemplate("백혈구 감소와 날음식 식사 걱정");

    expect(template?.id).toBe("immune-low-food-safety");
    expect(template?.mealNote).toContain(cookedFoodSentence);
    expect(template?.mealNote).toContain(handWashSentence);
    expect(template?.mealNote).toContain(expirationSentence);
    expect(template?.mealNote).toContain(separateStorageSentence);
    expect(template?.mealNote).toContain(fullyCookSentence);
    expect(template?.clinicianQuestion).toContain(rawEggSentence);
    expect(template?.clinicianQuestion).toContain(rawFoodSentence);
    expect(template?.clinicianQuestion).toContain(pasteurizedSentence);
    expect(buildSymptomSupportQuestion(template!, "백혈구 감소")).toContain(
      rawFoodSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "백혈구 감소")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://www.cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "백혈구 감소")).not.toMatch(
      /항생제를 처방하세요|진단하세요|치료하세요|모든 음식을 금지하세요|격리하세요/,
    );
  });

  it("builds a weight-change nutrition question from official calorie and cause guidance", () => {
    const weightLossSentence =
      "암환자는 치료과정에서 체중의 감소를 흔하게 경험할 수 있습니다. 체중감소는 환자를 허약하게 만들고 암에 대한 저항력과 치료효과 등을 떨어뜨립니다. 그러므로 체중감소를 예방하기 위해서 열량과 단백질 등을 충분히 섭취해야 합니다.";
    const calorieSnackSentence =
      "지방보다는 탄수화물이 많이 포함된 간식을 드시면 포만감이 빨리 사라지므로 더 편안함을 느낄 수 있다.";
    const proteinSnackSentence =
      "간식으로 고기나 생선, 치즈, 계란, 우유 등이 많이 포함된 음식을 선택한다.";
    const weightGainCauseSentence =
      "그러나 체중이 증가하였다고 바로 체중조절을 해야 하는 것은 아닙니다. 먼저 의사선생님과 상의하여 원인을 찾아야 합니다.";
    const highSaltSentence =
      "소금이 우리 몸에서 수분을 축적시키는 작용을 하므로 염분 함량이 높은 식품(예: 가공식품, 김치, 젓갈, 장아찌류 등)은 제한하고 가능한 싱겁게 먹는 것이 좋습니다.";
    const highCalorieLowNutritionSentence =
      "반면, 식욕이 증가된 경우에는 열량이 높고 영양가가 없는 식품들(예: 청량 음료, 초콜릿, 사탕, 과자류 등)은 제한하도록 합니다.";
    const balancedChoiceSentence =
      "과일과 야채 그리고 곡류의 섭취를 증가시킵니다. 가능한 한 지방이 없는 부위의 육류제품과 저지방 우유 및 유제품을 이용합니다.";
    const template = findSymptomSupportTemplate("체중감소와 단백질 보충 걱정");

    expect(template?.id).toBe("weight-change-nutrition");
    expect(template?.mealNote).toContain(weightLossSentence);
    expect(template?.mealNote).toContain(calorieSnackSentence);
    expect(template?.mealNote).toContain(proteinSnackSentence);
    expect(template?.clinicianQuestion).toContain(weightGainCauseSentence);
    expect(template?.clinicianQuestion).toContain(highSaltSentence);
    expect(template?.clinicianQuestion).toContain(highCalorieLowNutritionSentence);
    expect(template?.clinicianQuestion).toContain(balancedChoiceSentence);
    expect(buildSymptomSupportQuestion(template!, "체중감소")).toContain(
      weightGainCauseSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "체중감소")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 체중변화 - https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "체중감소")).not.toMatch(
      /식단을 처방하세요|진단하세요|치료하세요|운동을 강제하세요|체중조절을 지시하세요|고열량 간식을 금지하세요/,
    );
  });

  it("builds a neuropathy safety question from official nerve-symptom guidance", () => {
    const handExerciseSentence = "손비비기, 주먹을 쥐었다가 폈다하는 동작을 합니다.";
    const burnRiskSentence =
      "뜨거운 것은 화상을 입을 위험이 있으므로, 주의하여 사용하셔야 합니다.";
    const nailCareSentence =
      "손, 발을 항상 깨끗이 씻고, 손톱, 발톱을 짧게 하여 상처가 나지 않도록 주의하셔야 합니다. 혼자서 깎지 말고, 다른 사람의 도움을 받는 것이 좋습니다.";
    const shoeSentence =
      "양말은 부드러운 면으로 된 것을 사용하며, 신발 앞부분이 뾰족한 모양은 피하며 맨발로 다니지 않도록 합니다.";
    const consultSentence =
      "손발저림과 감각이상 등의 신경증이 있으면 의료진과 상의합니다.";
    const sensorySentence =
      "손가락, 손, 발가락, 발의 감각이 떨어질 수 있습니다. 손끝, 발끝이 저리고 무감각해지고 약해지고 통증 까지 수반할 수 있습니다.";
    const tinglingSentence = "아프고 따끔거리는 감각이 지속적으로 나타납니다.";
    const hearingSentence = "한쪽 또는 양쪽 귀의 청력이 변화 됩니다.";
    const autonomicSentence =
      "내장을 지배하는 신경에 부작용 이 생기는 경우에는 복통, 구토, 변비등의 증상을 일으키기도 합니다.";
    const template = findSymptomSupportTemplate("손발저림과 감각이상");

    expect(template?.id).toBe("neuropathy-safety");
    expect(template?.mealNote).toContain(handExerciseSentence);
    expect(template?.mealNote).toContain(burnRiskSentence);
    expect(template?.mealNote).toContain(nailCareSentence);
    expect(template?.mealNote).toContain(shoeSentence);
    expect(template?.clinicianQuestion).toContain(consultSentence);
    expect(template?.clinicianQuestion).toContain(sensorySentence);
    expect(template?.clinicianQuestion).toContain(tinglingSentence);
    expect(template?.clinicianQuestion).toContain(hearingSentence);
    expect(template?.clinicianQuestion).toContain(autonomicSentence);
    expect(buildSymptomSupportQuestion(template!, "손발저림")).toContain(
      consultSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "손발저림")).toContain(
      "출처: 국가암정보센터 신경계이상 증상 및 주의사항 - https://www.cancer.go.kr/lay1/S1T458C460/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "손발저림")).not.toMatch(
      /신경차단을 하세요|진단하세요|치료하세요|진통제를 처방하세요|운전을 금지하세요/,
    );
  });

  it("builds a skin-change care question from official skin-symptom guidance", () => {
    const acneSentence =
      "여드름이 생겼을 경우 손으로 만지거나 임의로 관리하지 마시고, 의사에게 치료를 받으시기 바랍니다.";
    const drySkinSentence =
      "샤워를 하거나 목욕을 할 때 오랜시간 동안 뜨거운 물에서 하는 것보다 짧은 시간에 끝내는 것이 좋고 크림이나 로션을 바르면 됩니다.";
    const rashItchSentence =
      "순한 비누로 목욕을 하면 진정 효과가 있습니다. 목욕 후 피부를 부드럽게 하는 로션을 바르면 도움이 됩니다.";
    const sunSentence =
      "태양에 노출되는 것을 가급적 피하고, 자외선의 활동이 가장 강한 오전 10시부터 오후 3시까지는 특히 주의하도록 합니다.";
    const handFootSentence =
      "손바닥과 발바닥에 통증 이 심하게 나타나고 부으면서 붉게 변할 수 있습니다. 이후 심해지면 물집이 형성되고, 피부가 벗겨지며 다시 피부가 재생됩니다.";
    const handFootConsultSentence =
      "통증이 심하거나 물집 형성, 표피박리 등이 있으면 의료진에게 즉시 알려서 적절한 치료를 받으시기 바랍니다.";
    const radiationSkinSentence =
      "방사선치료 후 피부가 건조하면 자극이 없는 수용성 크림이나 로션을 1일 2회 정도 피부에 가볍게 바르십시오. 그리고 치료부위의 피부를 비비거나 긁거나 마사지하는 것은 피합니다.";
    const radiationConsultSentence =
      "가능하면 환부를 공기에 노출하고 빨갛게 붓거나 물집이 생기면 의사와 상의합니다.";
    const nailChangeSentence =
      "치료과정에서 손톱이나 발톱이 검은색으로 변하거나 흰색 줄이 생길 수 있으며, 깨지거나, 건조해지고, 갈라지고, 들릴 수도 있습니다.";
    const nailConsultSentence =
      "손발톱 뿌리부분의 피부 붉어짐, 통증, 진물이 나면 즉시 의료진에게 알리도록 합니다.";
    const template = findSymptomSupportTemplate("피부 발진과 가려움");

    expect(template?.id).toBe("skin-change-care");
    expect(template?.mealNote).toContain(acneSentence);
    expect(template?.mealNote).toContain(drySkinSentence);
    expect(template?.mealNote).toContain(rashItchSentence);
    expect(template?.mealNote).toContain(sunSentence);
    expect(template?.clinicianQuestion).toContain(handFootSentence);
    expect(template?.clinicianQuestion).toContain(handFootConsultSentence);
    expect(template?.clinicianQuestion).toContain(radiationSkinSentence);
    expect(template?.clinicianQuestion).toContain(radiationConsultSentence);
    expect(template?.clinicianQuestion).toContain(nailChangeSentence);
    expect(template?.clinicianQuestion).toContain(nailConsultSentence);
    expect(buildSymptomSupportQuestion(template!, "피부 발진")).toContain(
      handFootConsultSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "피부 발진")).toContain(
      "출처: 국가암정보센터 피부변화 증상별 대처방법 - https://www.cancer.go.kr/lay1/S1T454C456/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "피부 발진")).not.toMatch(
      /스테로이드를 처방하세요|항생제를 처방하세요|진단하세요|치료하세요|방사선치료를 중단하세요|햇빛을 금지하세요/,
    );
  });

  it("builds an anemia management question from official symptom and activity guidance", () => {
    const treatmentEffectSentence =
      "받고 있는 항암 치료가 적혈구에 영향을 미칠 수 있는지 확인해 둡니다. 현재 적극적인 항암 치료를 받고 있다면, 치료가 적혈구에 영향을 미치는 것인지의 여부에 대하여 담당 의사에게 묻고 대처 방법에 대하여 알아둡니다.";
    const symptomDiarySentence =
      "빈혈 관련 증상을 숙지하고 일지에 정리하여 진료 시 담당 의사에게 모든 관련증상을 이야기합니다.";
    const labCompareSentence =
      "정기적인 혈액 검사 시에 적혈구 수와 헤모글로빈 수치를 점검하고 에너지 수준과 비교해 둡니다. 참고로, 남성의 정상 헤모글로빈 수치는 14-18 g/dL, 여자는 12-16 g/dL 입니다.";
    const energyConserveSentence =
      "하루 일과를 조정하거나 가족 또는 친구들에게 일을 분배함으로써 에너지를 보존합니다.";
    const avoidOverexerciseSentence = "과도한 운동은 삼가도록 합니다.";
    const balancedFoodSentence = "균형 잡힌 음식을 섭취합니다.";
    const hydrationSentence =
      "탈수되지 않도록 유의하고 하루 6--8잔의 물을 마시도록 노력합니다.";
    const dizzinessSentence =
      "어지럼증이 있을 시에는 운전, 아이 돌보기, 외출과 같은 활동은 주의를 요합니다.";
    const standSlowlySentence =
      "누워있거나 앉은 자세에서는 천천히 일어나야 합니다.";
    const sleepSentence =
      "충분한 수면을 취합니다. 침실에서 충분한 수면을 취하고, 낮 시간 동안에도 의자나 소파에서 짧은 낮잠을 즐기도록 합니다.";
    const template = findSymptomSupportTemplate("빈혈과 어지럼증");

    expect(template?.id).toBe("anemia-management");
    expect(template?.mealNote).toContain(treatmentEffectSentence);
    expect(template?.mealNote).toContain(symptomDiarySentence);
    expect(template?.mealNote).toContain("심각한 피로나 허약함");
    expect(template?.mealNote).toContain("숨 가쁨");
    expect(template?.mealNote).toContain("혼동이나 집중하기 힘들어짐");
    expect(template?.mealNote).toContain(labCompareSentence);
    expect(template?.clinicianQuestion).toContain(energyConserveSentence);
    expect(template?.clinicianQuestion).toContain(avoidOverexerciseSentence);
    expect(template?.clinicianQuestion).toContain(balancedFoodSentence);
    expect(template?.clinicianQuestion).toContain(hydrationSentence);
    expect(template?.clinicianQuestion).toContain(dizzinessSentence);
    expect(template?.clinicianQuestion).toContain(standSlowlySentence);
    expect(template?.clinicianQuestion).toContain(sleepSentence);
    expect(buildSymptomSupportQuestion(template!, "빈혈")).toContain(
      symptomDiarySentence,
    );
    expect(buildSymptomSupportQuestion(template!, "빈혈")).toContain(
      "출처: 국가암정보센터 빈혈 관리 - https://www.cancer.go.kr/lay1/S1T440C444/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "빈혈")).not.toMatch(
      /수혈을 하세요|철분제를 처방하세요|적혈구 생성인자를 처방하세요|진단하세요|치료하세요|운전을 금지하세요|운동을 금지하세요/,
    );
  });

  it("builds a bleeding warning question from official symptom-report guidance", () => {
    const reportSentence =
      "출혈의 증상과 의료진에게 보고해야 되는 증상에 대해 알아야합니다. 출혈의 증상에는 코피와 같이 금방 알 수 있는 증상 외에도, 출혈이 되고 있는지의 여부를 알 수 없는 증상도 있습니다. 아래와 같은 출혈의 증상은 의료진에게 알려야 합니다.";
    const skinSentence =
      "핀으로 찌른 것처럼 작고 붉은 발진 이 피부에 퍼져 있으며 팔과 다리에 주로 나타납니다. 멍이 쉽게 생깁니다.";
    const mouthNoseSentence =
      "코피, 입안의 혈액성 수포, 잇몸출혈, 구강 궤양 의 출혈이 있을 수 있고 침에 피가 섞여 나오기도 합니다.";
    const sputumSentence =
      "가래에 피 섞여 나오거나 호흡곤란, 빈호흡 및 부족상태이 있는 경우";
    const digestionSentence =
      "구토 물에 피가 섞여 나오거나 혈변, 검은 색의 묽은 변을 볼 수 있습니다.";
    const urinarySentence =
      "혈뇨, 소변을 볼 때 통증이나 타는 듯한 느낌, 빈뇨(소변을 자주 봄), 비정상적인 다량의 질출혈(또는 폐경기 이후의 질출혈) 등이 있습니다.";
    const template = findSymptomSupportTemplate("잇몸출혈과 코피가 멈추지 않음");

    expect(template?.id).toBe("bleeding-warning");
    expect(template?.mealNote).toContain(reportSentence);
    expect(template?.mealNote).toContain(skinSentence);
    expect(template?.mealNote).toContain(mouthNoseSentence);
    expect(template?.clinicianQuestion).toContain(sputumSentence);
    expect(template?.clinicianQuestion).toContain(digestionSentence);
    expect(template?.clinicianQuestion).toContain(urinarySentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "잇몸출혈")).toContain(reportSentence);
    expect(buildSymptomSupportQuestion(template!, "잇몸출혈")).toContain(
      "출처: 국가암정보센터 출혈 증상 - https://www.cancer.go.kr/lay1/S1T445C448/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "잇몸출혈")).not.toMatch(
      /지혈제를 처방하세요|수혈을 하세요|진단하세요|치료하세요|응급처치를 하세요|약을 중단하세요/,
    );
  });

  it("builds a hair-loss scalp-care question from official care guidance", () => {
    const gentleWashSentence =
      "머리를 거칠게 감지 않도록 하며 말릴 때는 살살 두들겨서 말립니다.";
    const cleanScalpSentence = "두피를 청결하게 관리합니다.";
    const shampooSentence =
      "머리카락이 빠지는 동안은 머리빗질이 쉽도록 부드러운 샴푸와 크림린스를 사용합니다.";
    const heatSentence =
      "헤어 드라이기와 같은 열기구의 사용은 되도록 줄입니다. 꼭 필요한 경우에는 가장 약한 열로 하도록 합니다. 가장 좋은 방법은 공기 중에서 자연스럽게 마르도록 하는 것입니다.";
    const combSentence =
      "심한 빗질은 삼가시고 간격이 넓고 부드러운 빗으로 살살 빗도록 합니다.";
    const emotionSentence =
      "탈모로 인한 불안감을 의료진 및 가족들에게 표현하고 탈모를 경험하는 다른 환자들과의 대화를 통하여 감정을 나누는 것도 좋습니다.";
    const scalpProtectionSentence =
      "외출 시에는 모자, 스카프 등을 사용하며, 완전 탈모 시에는 두피를 보호하기 위하여 선크림(햇빛 차단제)을 사용합니다.";
    const discussSentence =
      "탈모는 당신 자신에 대한 느낌을 변화시킬 수 있습니다. 이런 감정변화로 인하여 다른 중요한 일을 할 수 없게 된다면, 의사나 간호사와 이런 느낌을 함께 논의하십시오.";
    const template = findSymptomSupportTemplate("탈모와 두피 민감함");

    expect(template?.id).toBe("hair-loss-care");
    expect(template?.mealNote).toContain(gentleWashSentence);
    expect(template?.mealNote).toContain(cleanScalpSentence);
    expect(template?.mealNote).toContain(shampooSentence);
    expect(template?.clinicianQuestion).toContain(heatSentence);
    expect(template?.clinicianQuestion).toContain(combSentence);
    expect(template?.clinicianQuestion).toContain(emotionSentence);
    expect(template?.clinicianQuestion).toContain(scalpProtectionSentence);
    expect(template?.clinicianQuestion).toContain(discussSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "탈모")).toContain(discussSentence);
    expect(buildSymptomSupportQuestion(template!, "탈모")).toContain(
      "출처: 국가암정보센터 탈모 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T451C453/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "탈모")).not.toMatch(
      /미녹시딜을 처방하세요|가발을 처방하세요|진단하세요|치료하세요|항암제를 중단하세요|방사선치료를 중단하세요/,
    );
  });

  it("builds a hiccup consult-threshold question from official consult guidance", () => {
    const consultIntroSentence = "이런 때에는 의료진과 상의하십시오.";
    const persistentSentence = "하루이상 딸꾹질이 지속될 경우";
    const dyspneaSentence = "호흡곤란이 일어날 경우";
    const distensionSentence = "위장이 커져있거나 팽만되어 있는 것으로 보이는 경우";
    const sleepSentence = "잠을 이룰수 없을 정도로 딸꾹질이 나올 때";
    const painSentence = "딸꾹질로 인해 고통을 느낄 때";
    const template = findSymptomSupportTemplate("하루 이상 딸꾹질과 호흡곤란");

    expect(template?.id).toBe("hiccup-consult");
    expect(template?.mealNote).toContain(persistentSentence);
    expect(template?.mealNote).toContain(dyspneaSentence);
    expect(template?.mealNote).toContain(distensionSentence);
    expect(template?.clinicianQuestion).toContain(consultIntroSentence);
    expect(template?.clinicianQuestion).toContain(sleepSentence);
    expect(template?.clinicianQuestion).toContain(painSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "딸꾹질")).toContain(
      consultIntroSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "딸꾹질")).toContain(
      "출처: 국가암정보센터 딸꾹질 의료진 상담 상황 - https://www.cancer.go.kr/lay1/S1T466C468/contents.do",
    );
    expect(findSymptomSupportTemplate("구토와 딸꾹질")?.id).toBe("vomiting");
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "딸꾹질")).not.toMatch(
      /약을 처방하세요|진단하세요|치료하세요|종이백을 사용하세요|눈을 지압하세요|설탕을 삼키세요/,
    );
  });

  it("builds a child and family communication question from official guidance", () => {
    const confusionSentence =
      "그들이 혼란을 겪지 않도록 엄마나 아빠에게 어떤 변화가 생겼는지를 알려주고, 나름의 느낌과 의문들을 충분히 표현할 수 있도록 하는 것이 중요합니다.";
    const ageAppropriateSentence =
      "암에 대한 설명은 자녀의 나이에 걸맞은 수준으로, 지나친 두려움을 주지 않는 방식으로 해야 합니다. 그러나 ‘암’이라는 단어의 사용을 피하지는 말아야 합니다.";
    const treatmentChangeSentence =
      "치료 계획을 알려주고, 그에 따르는 가족 생활의 변화와 환자에게 생길 수 있는 변모(예컨대 탈모, 극심한 피로감, 체중 저하 등)도 미리 말해 두어 나중에 놀라지 않도록 합니다.";
    const questionSentence =
      "자녀의 질문에 대해 가능한 한 신중하고 정확하게 답해야 합니다. 혹 뭐라고 해야 할지를 모를 때는 당황하지 말고 이렇게 말하십시오.";
    const noBlameSentence = "질병을 죄악이나 벌과 연결시키지 마십시오.";
    const counselingSentence = "그 밖에 전문적인 상담이 필요한 경우";
    const template = findSymptomSupportTemplate("자녀에게 암 설명 준비");

    expect(template?.id).toBe("child-family-communication");
    expect(template?.mealNote).toContain(confusionSentence);
    expect(template?.mealNote).toContain(ageAppropriateSentence);
    expect(template?.mealNote).toContain(treatmentChangeSentence);
    expect(template?.clinicianQuestion).toContain(questionSentence);
    expect(template?.clinicianQuestion).toContain(noBlameSentence);
    expect(template?.clinicianQuestion).toContain(counselingSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "자녀에게 암 설명")).toContain(
      questionSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "자녀에게 암 설명")).toContain(
      "출처: 국가암정보센터 암환자의 생활 - 자녀에게 알리는 방법 - https://www.cancer.go.kr/lay1/S1T327C330/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(buildSymptomSupportQuestion(template!, "자녀에게 암 설명")).not.toMatch(
      /심리치료를 하세요|진단하세요|치료하세요|처방하세요|반드시 공개하세요|완치된다고 말하세요|걱정하지 않아도 된다고 보장하세요|아이 책임이라고 말하세요/,
    );
  });

  it("builds a psychological-stability question from official guidance", () => {
    const treatmentAnxietySentence =
      "항암화학요법을 받을 때 환자는 우울해지기 쉽습니다. 암 치료 자체에 대한 불안감, 일상의 삶이 바뀌는 것의 낯섦, 그리고 항암제 의 여러 부작용 에 대한 두려움 때문입니다.";
    const helpSentence =
      "겁이 너무 나서 자포자기하는 심정까지 들 정도라면 주위의 도움을 청하십시오.";
    const journalSentence =
      "치료를 받는 동안 일지나 일기를 쓰십시오. 그날그날 있은 일, 떠오른 상념과 의문을 기록해 두면 생각을 체계적으로 정리할 수 있으며, 의사나 간호사에게 질문을 할 때도 도움이 됩니다.";
    const specialistSentence = "필요하다면 정신과 전문의와 상담하십시오.";
    const listeningSentence =
      "그의 생각과 기분을 있는 그대로, 평가하지 않고 이해하는 ‘공감의 자세’가 필요합니다.";
    const template = findSymptomSupportTemplate("치료 불안과 부작용 두려움");

    expect(template?.id).toBe("psychological-stability");
    expect(template?.mealNote).toContain(treatmentAnxietySentence);
    expect(template?.mealNote).toContain(journalSentence);
    expect(template?.clinicianQuestion).toContain(helpSentence);
    expect(template?.clinicianQuestion).toContain(specialistSentence);
    expect(template?.clinicianQuestion).toContain(listeningSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "치료 불안")).toContain(
      listeningSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "치료 불안")).toContain(
      "출처: 국가암정보센터 암환자의 생활 - 심리적 안정을 위해 - https://www.cancer.go.kr/lay1/S1T327C329/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(buildSymptomSupportQuestion(template!, "치료 불안")).not.toMatch(
      /심리치료를 하세요|정신과 진료를 받으세요|운동하세요|진단하세요|치료하세요|처방하세요|완치됩니다|걱정하지 않아도 된다고 보장하세요|암 치료 결과가 좋아집니다/,
    );
  });

  it("builds a survivor distress-adaptation question from official guidance", () => {
    const definitionSentence =
      "디스트레스란 암생존자의 몸과 마음에 나타나는 모든 괴로움을 의미합니다.";
    const prevalenceSentence =
      "모든 암환자의 20~40%(10명 중 2명에서 4명)는 디스트레스를 경험합니다.";
    const burdenSentence =
      "암 관리에 대한 정보가 부족하거나, 암 관리를 계속 해야 한다는 부담";
    const highDistressSentence = "살고 싶지 않거나 죽고 싶다는 생각";
    const childcareSentence = "자녀보육";
    const helpSignalSentence =
      "예가 많을 수록 관심과 도움이 필요하다는 신호입니다.";
    const template = findSymptomSupportTemplate("암생존자 디스트레스 자가평가");

    expect(template?.id).toBe("survivor-distress-adaptation");
    expect(template?.mealNote).toContain(definitionSentence);
    expect(template?.mealNote).toContain(prevalenceSentence);
    expect(template?.mealNote).toContain(burdenSentence);
    expect(template?.mealNote).toContain(highDistressSentence);
    expect(template?.clinicianQuestion).toContain(childcareSentence);
    expect(template?.clinicianQuestion).toContain(helpSignalSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 디스트레스 자가평가"),
    ).toContain(highDistressSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 디스트레스 자가평가"),
    ).toContain(
      "출처: 국가암정보센터 암생존자 마음관리 - 변화된 삶에 적응하기 - https://www.cancer.go.kr/lay1/S1T788C790/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 디스트레스 자가평가"),
    ).not.toMatch(
      /디스트레스를 진단하세요|치료하세요|처방하세요|혼자 견디세요|암관리를 중단하세요|자살하세요|괜찮으니 참으세요|문제가 아닙니다|위험하지 않습니다/,
    );
  });

  it("builds a survivor anxiety-management question from official guidance", () => {
    const alarmSentence =
      "따라서 불안은 우리 몸의 ‘경보장치’라고 할 수 있으며, 생존을 위해 꼭 필요합니다.";
    const heartbeatSentence = "심장이 빨리 뛰고, 가슴이 두근거립니다.";
    const breathSentence = "숨이 가쁘거나 답답한 느낌이 듭니다.";
    const dailyLifeSentence =
      "고장난 경보장치처럼 오히려 일상생활에 방해가 되는 불안을 ‘병리적 불안’이라고 합니다.";
    const persistenceSentence =
      "불안을 느끼게 한 위협적인 요소가 사라졌음에도 불구하고 불안이 과도하게 오래 지속됩니다.";
    const discloseSentence =
      "가족이나 주위 사람들에게 불안한 마음을 솔직하게 털어놓는 방법입니다.";
    const attentionSentence =
      "불안과 관련된 생각과 신체 증상이 심해질 때 이를 멈추기 위해서 주의를 다른 곳으로 분산시키는 방법입니다.";
    const template = findSymptomSupportTemplate("암생존자 불안 신체증상");

    expect(template?.id).toBe("survivor-anxiety-management");
    expect(template?.mealNote).toContain(alarmSentence);
    expect(template?.mealNote).toContain(heartbeatSentence);
    expect(template?.mealNote).toContain(breathSentence);
    expect(template?.mealNote).toContain(dailyLifeSentence);
    expect(template?.mealNote).toContain(persistenceSentence);
    expect(template?.clinicianQuestion).toContain(discloseSentence);
    expect(template?.clinicianQuestion).toContain(attentionSentence);
    expect(template?.clinicianQuestion).toContain("복식호흡");
    expect(template?.clinicianQuestion).toContain("심상유도");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "암생존자 불안 신체증상")).toContain(
      attentionSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "암생존자 불안 신체증상")).toContain(
      "출처: 국가암정보센터 암생존자 마음관리 - 내 안의 불안 다스리기 - https://www.cancer.go.kr/lay1/S1T788C791/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(buildSymptomSupportQuestion(template!, "암생존자 불안 신체증상")).not.toMatch(
      /불안을 치료하세요|호흡훈련을 하세요|주의전환을 하세요|약을 복용하세요|진단하세요|처방하세요|치료하세요|불안은 위험하지 않습니다|응급실에 가지 않아도 됩니다|괜찮으니 참으세요/,
    );
  });

  it("builds a survivor sleep-management question from official guidance", () => {
    const insomniaSentence =
      "불면증은 밤에 잠을 자지 못하는 증상을 말합니다. 암 환자의 약 30~50%가 불면증을 경험합니다.";
    const causeSentence =
      "불면증은 복용하는 약물 때문에 나타나기도 하고, 암 치료 때문에 수면 습관이 바뀌어서 나타날 수도 있습니다.";
    const sleepEfficiencySentence =
      "수면효율 = 실제로 잠을 자는 시간 x 100 잠자리에 누워 있는 총시간";
    const wakeTimeSentence =
      "전날 일찍 잠들지 못했더라도 아침에 항상 일정한 시각에 일어납니다.";
    const eveningCaffeineSentence =
      "커피, 홍차, 녹차, 콜라 등 카페인이 포함된 음료는 저녁에는 섭취하지 않습니다.";
    const preSleepExerciseSentence =
      "낮에 규칙적으로 운동을 하면 수면에 도움이 됩니다. 단, 잠들기 전 2시간 안에는 운동하지 않는 것이 좋습니다.";
    const phoneSentence =
      "잠자리에서는 휴대 전화 사용을 삼가고, 자다가 시간을 확인하지 않습니다.";
    const template = findSymptomSupportTemplate("암생존자 수면관리 수면효율");

    expect(template?.id).toBe("survivor-sleep-management");
    expect(template?.mealNote).toContain(insomniaSentence);
    expect(template?.mealNote).toContain(causeSentence);
    expect(template?.mealNote).toContain(sleepEfficiencySentence);
    expect(template?.mealNote).toContain(wakeTimeSentence);
    expect(template?.clinicianQuestion).toContain(eveningCaffeineSentence);
    expect(template?.clinicianQuestion).toContain(preSleepExerciseSentence);
    expect(template?.clinicianQuestion).toContain(phoneSentence);
    expect(template?.clinicianQuestion).toContain("수면일지");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 수면관리 수면효율"),
    ).toContain(sleepEfficiencySentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 수면관리 수면효율"),
    ).toContain(
      "출처: 국가암정보센터 암생존자 수면관리 - https://www.cancer.go.kr/lay1/S1T748C794/contents.do",
    );
    expect(findSymptomSupportTemplate("우울과 불면이 계속됨")?.id).toBe("fatigue");
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 수면관리 수면효율"),
    ).not.toMatch(
      /수면제를 복용하세요|수면제를 처방하세요|카페인을 끊으세요|물을 적게 마시세요|저녁 물 금지|불면증을 진단하세요|치료하세요|처방하세요|인지 행동 치료를 하세요|8시간 이상 자세요|휴대 전화를 금지하세요/,
    );
  });

  it("builds a survivor treatment-slump question from official guidance", () => {
    const treatmentFinishedSentence =
      "암 진단 후에 수술과 항암화학요법을 받고 방사선치료까지 마쳤다는 것은 일단 초기 치료가 일단락되었음을 의미합니다.";
    const delayedDepressionSentence =
      "우울증은 보통 암 진단을 받은 직후나 치료를 받고 있는 중에 많이 생기지만, 처음에는 멀쩡하다가 한참 후에 우울증이 나타나는 경우도 흔합니다.";
    const isolationSentence =
      "좌절감, 절망감, 고립감, 고독감, 허무감 등의 감정";
    const burdenSentence =
      "혼자서 관리해야 한다는 부담감과 재발이나 전이에 대한 막연한 두려움";
    const thresholdSentence =
      "우울한 기분이나 의욕 상실 같은 증상이 한 달 이상 가거나 정도가 심하면";
    const expertHelpSentence =
      "전문가의 도움을 받으면 힘든 시기를 수월하게 극복할 수 있습니다.";
    const template = findSymptomSupportTemplate("암치료 후 슬럼프 울적함 의욕 상실 한 달");

    expect(template?.id).toBe("survivor-treatment-slump");
    expect(template?.mealNote).toContain(treatmentFinishedSentence);
    expect(template?.mealNote).toContain(delayedDepressionSentence);
    expect(template?.mealNote).toContain(isolationSentence);
    expect(template?.mealNote).toContain(burdenSentence);
    expect(template?.clinicianQuestion).toContain(thresholdSentence);
    expect(template?.clinicianQuestion).toContain(expertHelpSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암치료 후 슬럼프 울적함 의욕 상실 한 달"),
    ).toContain(thresholdSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암치료 후 슬럼프 울적함 의욕 상실 한 달"),
    ).toContain(
      "출처: 국가암정보센터 암환자 정신건강 - 암치료 후 슬럼프 - https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22077&condition=&cpage=4&keyword=&rn=45&rows=12",
    );
    expect(findSymptomSupportTemplate("우울과 불면이 계속됨")?.id).toBe("fatigue");
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암치료 후 슬럼프 울적함 의욕 상실 한 달"),
    ).not.toMatch(
      /우울증을 진단하세요|항우울제를 처방하세요|항우울제를 복용하세요|정신건강의학과 상담을 받으세요|치료하세요|처방하세요|혼자 관리하세요|괜찮으니 참으세요|전이가 아닙니다|재발이 아닙니다|우울증은 잘 낫습니다/,
    );
  });

  it("builds a survivor exercise-management question from official guidance", () => {
    const regularExerciseSentence =
      "암생존자의 규칙적인 운동참여는 체력증진, 피로도 감소로 삶의 질을 높여주고 일부 암종에서는 재발 율과 사망률의 위험을 낮춰줍니다.";
    const guidelineSentence =
      "미국 스포츠의학회에서는 암생존자의 건강 증진을 위하여 주당 150분 이상의 중강도 신체활동과 주 2회 이상의 근력운동을 권고하고 있습니다.";
    const moderateIntensitySentence =
      "중강도 신체활동: 숨이 약간 차지만 옆 사람과 대화가 가능한 정도";
    const programSentence =
      "암생존자의 신체활동 증진과 체력 향상을 위하여 운동과 관련된 정보교육과 스트레칭, 전신 근력운동을 배울 수 있는 프로그램입니다.";
    const clothingSentence =
      "실제 운동을 배우는 시간이 있으므로 편안한 운동복을 입고 오시면 좋습니다.";
    const template = findSymptomSupportTemplate("암생존자 운동강도 상담");

    expect(template?.id).toBe("survivor-exercise-management");
    expect(template?.mealNote).toContain(regularExerciseSentence);
    expect(template?.mealNote).toContain(guidelineSentence);
    expect(template?.mealNote).toContain(moderateIntensitySentence);
    expect(template?.clinicianQuestion).toContain(programSentence);
    expect(template?.clinicianQuestion).toContain(clothingSentence);
    expect(template?.clinicianQuestion).toContain("운동강도·시간·금기·재활 의뢰 기준");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 운동강도 상담"),
    ).toContain(guidelineSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 운동강도 상담"),
    ).toContain(
      "출처: 국가암정보센터 암생존자 운동 - https://www.cancer.go.kr/lay1/S1T748C795/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 운동강도 상담"),
    ).not.toMatch(
      /운동을 처방하세요|운동하세요|운동을 시작하세요|진단하세요|치료하세요|완치|재발을 예방합니다|사망률을 낮춥니다|무조건 주 150분|반드시 주 2회/,
    );
  });

  it("builds a pediatric exercise and activity question from official guidance", () => {
    const activityOpportunitySentence =
      "소아청소년이 암 치료를 받는 동안에는 학교생활이나 체육활동에 참여할 기회가 적어지므로 신체역량과 체력이 떨어집니다.";
    const physicalLiteracySentence =
      "신체역량에는 달리기, 던지기, 공치기, 발차기, 수영하기, 균형 잡기 능력 등이 포함되요.";
    const confidenceSentence =
      "규칙적인 운동과 다양한 체육활동 참여는 신체역량과 체력을 높이고, 자신감 및 자기효능감도 길러 주기 때문에 학교생활 적응에 도움이 됩니다.";
    const physicalLiteracyDefinitionSentence =
      "신체역량이란 자신의 신체를 상황에 따라 적절하게 움직일 수 있는 능력을 말합니다.";
    const goalPlanSentence = "달성할 수 있는 운동 목표와 계획을 주도적으로 세워 보세요.";
    const dailyActivitySentence =
      "소아청소년 암생존자는 소아청소년 신체활동 권장 사항에 따라 하루에 60분 이상 중강도 이상의 유산소 신체활동";
    const strengthSentence = "일주일에 3일 이상은 근력운동을 합니다.";
    const topExerciseSentence =
      "탑(TOP) 운동은 태권도, 권투, 근력운동 등을 조합하여 만든 운동 프로그램입니다.";
    const topIntensitySentence =
      "저강도(탑 익히기), 중강도(즐기기), 고강도(누리기)";
    const doctorTimingSentence =
      "운동은 주치의사의 권고에 따라 운동 시기 및 강도로 하시기 바랍니다.";
    const discomfortSentence = "운동 중 통증 이나 불편감이 발생하면";
    const template = findSymptomSupportTemplate("소아청소년 암생존자 운동 TOP 신체역량");

    expect(template?.id).toBe("pediatric-exercise-activity-support");
    expect(template?.mealNote).toContain(activityOpportunitySentence);
    expect(template?.mealNote).toContain(physicalLiteracySentence);
    expect(template?.mealNote).toContain(confidenceSentence);
    expect(template?.mealNote).toContain(physicalLiteracyDefinitionSentence);
    expect(template?.mealNote).toContain(goalPlanSentence);
    expect(template?.clinicianQuestion).toContain(dailyActivitySentence);
    expect(template?.clinicianQuestion).toContain(strengthSentence);
    expect(template?.clinicianQuestion).toContain(topExerciseSentence);
    expect(template?.clinicianQuestion).toContain(topIntensitySentence);
    expect(template?.clinicianQuestion).toContain(doctorTimingSentence);
    expect(template?.clinicianQuestion).toContain(discomfortSentence);
    expect(template?.clinicianQuestion).toContain("현재 체력 수준");
    expect(template?.clinicianQuestion).toContain("통증·불편감 발생 시 연락 기준");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 운동 TOP 신체역량",
      ),
    ).toContain(topExerciseSentence);
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 운동 TOP 신체역량",
      ),
    ).toContain(
      "출처: 국가암정보센터 소아청소년 암생존자 운동 - https://www.cancer.go.kr/lay1/S1T800C801/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 운동 TOP 신체역량",
      ),
    ).not.toMatch(
      /운동하세요|운동을 시작하세요|체육활동에 참여하세요|하루에 60분 이상 운동하세요|고강도 신체활동을 하세요|근력운동을 하세요|TOP 운동을 따라하세요|통증이 있으면 바로 멈추세요|운동을 처방하세요|진단하세요|치료하세요|학교생활 적응이 보장됩니다|체력이 좋아집니다/,
    );
  });

  it("builds a survivor nutrition-lifestyle question from official guidance", () => {
    const properWeightSentence = "적정체중을 유지 합니다.";
    const balancedMealSentence = "골고루 균형잡힌 식사를 계획합니다.";
    const colorfulFoodSentence =
      "다양한 색의 과일, 채소, 전곡류를 선택합니다.";
    const processedBurntSentence = "육가공품, 탄 음식의 섭취를 피합니다.";
    const lowSaltSentence = "짠 음식의 섭취를 피하고 싱겁게 먹습니다.";
    const alcoholSentence = "하루 한 두 잔의 술도 피합니다.";
    const supplementSentence = "건강보조식품, 민간요법 등은 주의합니다.";
    const template = findSymptomSupportTemplate("암생존자 영양 식생활 균형잡힌 식사");

    expect(template?.id).toBe("survivor-nutrition-lifestyle");
    expect(template?.mealNote).toContain(properWeightSentence);
    expect(template?.mealNote).toContain(balancedMealSentence);
    expect(template?.mealNote).toContain(colorfulFoodSentence);
    expect(template?.mealNote).toContain(processedBurntSentence);
    expect(template?.clinicianQuestion).toContain(lowSaltSentence);
    expect(template?.clinicianQuestion).toContain(alcoholSentence);
    expect(template?.clinicianQuestion).toContain(supplementSentence);
    expect(template?.clinicianQuestion).toContain("최근 식사와 간식");
    expect(template?.clinicianQuestion).toContain("가공육·탄 음식·짠 음식·술 노출");
    expect(template?.clinicianQuestion).toContain("건강보조식품·민간요법 목록");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 영양 식생활 균형잡힌 식사"),
    ).toContain(supplementSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 영양 식생활 균형잡힌 식사"),
    ).toContain(
      "출처: 국가암정보센터 암생존자 영양·식생활 - https://www.cancer.go.kr/lay1/S1T748C796/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 영양 식생활 균형잡힌 식사"),
    ).not.toMatch(
      /체중을 감량하세요|체중을 늘리세요|전곡류를 먹으세요|채소를 먹으세요|육가공품을 먹지 마세요|탄 음식을 먹지 마세요|짠 음식을 금지하세요|술을 끊으세요|건강보조식품을 중단하세요|민간요법을 중단하세요|식단을 처방하세요|진단하세요|치료하세요|처방하세요|암 재발을 예방합니다|완치됩니다/,
    );
  });

  it("builds a pediatric nutrition and growth question from official guidance", () => {
    const healthyHabitSentence =
      "건강하게 성장하려면 건강한 식생활 습관을 유지 하는 것이 좋습니다.";
    const bmiFormulaSentence = "체질량지수 = 나의 체중(kg) / 키(m) x 키(m)";
    const bmiPercentileSentence =
      "성별, 나이에 비교한 체질량지수(BMI) 백분위수로 비만도 판단";
    const pubertySentence =
      "호르몬의 변화로 사춘기가 빨라지고 성장이 빨리 멈출 수 있습니다.";
    const fitnessSentence = "체력이 떨어져 학업 및 운동력이 저하될 수 있습니다.";
    const balancedMealSentence = "여러 종류의 식품군 섭취를 통한 균형 잡힌 식사";
    const highCalorieSentence =
      "패스트푸드, 단 음료 등 고열량 · 저영양 식품 섭취 절제";
    const sixFoodGroupsSentence =
      "매일 여섯 가지 식품군을 필요한 만큼 골고루 먹습니다.";
    const mealCompositionSentence =
      "매끼 나에게 맞는 적당한 양으로 곡류와 고기·생선· 달걀· 콩류 중 1~2가지, 그리고 2가지 이상의 채소류를 포함한 식사를 합니다.";
    const snackSentence =
      "간식으로는 하루에 2번 이상 우유나 유제품을 먹거나, 1~2번 이상 과일류를 먹습니다.";
    const processedFoodSentence =
      "가공식품, 즉석 음식(패스트푸드),라면 등의 고열량· 저영양 식품을 주의해서 먹습니다.";
    const sweetDrinkSentence =
      "설탕이 많이 들어간 간식이나 음료를 주의해서 먹습니다.";
    const caffeineSentence = "카페인이 많이 들어간 식품이나 음료를 주의해서 먹습니다.";
    const breakfastSentence = "가능하면 아침을 먹도록 합니다.";
    const distractionSentence =
      "식사를 하는 동안 돌아다니거나 휴대전화, 텔레비전 등을 보지 말고, 정해진 장소에서 식사를 합니다.";
    const labelSentence =
      "식품을 선택할 때에는 영양 표시, 제조 일자, 유통기한 등 식품 표시 사항을 확인하고 식품을 선택합니다.";
    const handwashSentence = "음식을 먹기 전에는 손을 씻습니다.";
    const activitySentence = "바른 성장과 발달을 위해 매일 한 시간 이상 신체활동을 합니다.";
    const template = findSymptomSupportTemplate(
      "소아청소년 암생존자 영양 식생활 BMI 백분위수",
    );

    expect(template?.id).toBe("pediatric-nutrition-growth-support");
    expect(template?.mealNote).toContain(healthyHabitSentence);
    expect(template?.mealNote).toContain(bmiFormulaSentence);
    expect(template?.mealNote).toContain(bmiPercentileSentence);
    expect(template?.mealNote).toContain(pubertySentence);
    expect(template?.mealNote).toContain(fitnessSentence);
    expect(template?.mealNote).toContain(balancedMealSentence);
    expect(template?.mealNote).toContain(highCalorieSentence);
    expect(template?.clinicianQuestion).toContain(sixFoodGroupsSentence);
    expect(template?.clinicianQuestion).toContain(mealCompositionSentence);
    expect(template?.clinicianQuestion).toContain(snackSentence);
    expect(template?.clinicianQuestion).toContain(processedFoodSentence);
    expect(template?.clinicianQuestion).toContain(sweetDrinkSentence);
    expect(template?.clinicianQuestion).toContain(caffeineSentence);
    expect(template?.clinicianQuestion).toContain(breakfastSentence);
    expect(template?.clinicianQuestion).toContain(distractionSentence);
    expect(template?.clinicianQuestion).toContain("가족과 함께 식사");
    expect(template?.clinicianQuestion).toContain(labelSentence);
    expect(template?.clinicianQuestion).toContain(handwashSentence);
    expect(template?.clinicianQuestion).toContain(activitySentence);
    expect(template?.clinicianQuestion).toContain("성장도표");
    expect(template?.clinicianQuestion).toContain("치료 이력");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 영양 식생활 BMI 백분위수",
      ),
    ).toContain(bmiPercentileSentence);
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 영양 식생활 BMI 백분위수",
      ),
    ).toContain(
      "출처: 국가암정보센터 소아청소년 암생존자 영양·식생활 - https://www.cancer.go.kr/lay1/S1T800C802/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 영양 식생활 BMI 백분위수",
      ),
    ).not.toMatch(
      /먹이세요|먹으세요|금지하세요|절제시키세요|아침을 먹이세요|휴대전화를 금지하세요|손을 씻기세요|매일 한 시간 이상 운동시키세요|체중을 감량하세요|비만을 진단하세요|식단을 처방하세요|치료하세요|처방하세요|성장발달이 보장됩니다|비만 예방이 보장됩니다/,
    );
  });

  it("builds a pediatric mental-health question from official guidance", () => {
    const distressThermometerSentence =
      "오늘을 포함하여 지난 7일 동안 경험한 괴로움(힘듦) 정도";
    const fourPointSentence = "마음 온도계에서 4점보다 높을 때";
    const naturalEmotionSentence =
      "모든 감정은 누구나 느낄 수 있는 자연스러운 것입니다.";
    const survivorDifficultySentence =
      "암 치료가 끝난 소아청소년 암생존자들은 일상으로 돌아가 대체로 건강하게 생활을 잘 합니다.";
    const physicalSymptomSentence = "신체증상 - 가슴 통증, 구토, 숨가쁨, 피로감 등";
    const concentrationSentence = "집중력과 기억력 저하";
    const anxietySentence = "불안, 긴장, 겁이많음";
    const depressionSentence = "우울, 의욕이 없고, 위축된 느낌";
    const signalSentence =
      "나의 마음은 감정, 생각, 행동, 신체적 증상을 통해 알 수 있으며";
    const moodSentence = "쉽게 짜증이 나요.";
    const behaviorSentence = "자꾸 눈물이 나요.";
    const thoughtSentence = "‘역시 난 안돼’와 같이 부정적인 말을 자꾸 해요.";
    const bodySentence = "잠이 잘 안 오거나, 자꾸 잠만 자고 싶어져요.";
    const activitySentence = "마음을 즐겁게 할 수 있는 활동을 해요.";
    const adultHelpSentence = "마음이 힘들면 어른들에게 도움을 요청해요.";
    const template = findSymptomSupportTemplate(
      "소아청소년 암생존자 마음관리 마음 온도계 4점",
    );

    expect(template?.id).toBe("pediatric-mental-health-support");
    expect(template?.mealNote).toContain(distressThermometerSentence);
    expect(template?.mealNote).toContain(fourPointSentence);
    expect(template?.mealNote).toContain(naturalEmotionSentence);
    expect(template?.mealNote).toContain(survivorDifficultySentence);
    expect(template?.mealNote).toContain(physicalSymptomSentence);
    expect(template?.mealNote).toContain(concentrationSentence);
    expect(template?.mealNote).toContain(anxietySentence);
    expect(template?.mealNote).toContain(depressionSentence);
    expect(template?.clinicianQuestion).toContain(signalSentence);
    expect(template?.clinicianQuestion).toContain(moodSentence);
    expect(template?.clinicianQuestion).toContain(behaviorSentence);
    expect(template?.clinicianQuestion).toContain(thoughtSentence);
    expect(template?.clinicianQuestion).toContain(bodySentence);
    expect(template?.clinicianQuestion).toContain(activitySentence);
    expect(template?.clinicianQuestion).toContain(adultHelpSentence);
    expect(template?.clinicianQuestion).toContain("부모님 또는 주치의");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 마음관리 마음 온도계 4점",
      ),
    ).toContain(fourPointSentence);
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 마음관리 마음 온도계 4점",
      ),
    ).toContain(
      "출처: 국가암정보센터 소아청소년 암생존자 마음관리 - https://www.cancer.go.kr/lay1/S1T800C803/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 마음관리 마음 온도계 4점",
      ),
    ).not.toMatch(
      /우울증을 진단하세요|불안장애를 진단하세요|상담을 받으세요|치료하세요|처방하세요|약을 복용하세요|혼자 참으세요|괜찮아집니다|학교생활 적응이 보장됩니다|마음 온도계 점수를 낮추세요|활동을 강제하세요|도움을 요청하세요/,
    );
  });

  it("builds a survivor vaccination-timing question from official guidance", () => {
    const infectionRiskSentence = "폐렴, 인플루엔자, 코로나";
    const mortalitySeveritySentence = "사망과 중증화";
    const inactivatedVaccineSentence = "대부분의 예방접종 백신은 사백신";
    const liveVaccineSentence = "일부 예방접종은 생백신";
    const beforeChemoSentence = "항암치료 한 달 전";
    const afterChemoSentence = "항암치료 마치고 3개월 후";
    const shinglesSentence = "대상포진 백신";
    const pneumococcalRiskSentence = "침습성 폐렴구균 감염률";
    const tenTimesSentence = "10배 이상";
    const thirteenValentSentence = "13가";
    const twentyThreeValentSentence = "23가";
    const fiveYearSentence = "5년 후";
    const fluSentence = "독감 예방접종";
    const annualSentence = "매년";
    const template = findSymptomSupportTemplate("암생존자 예방접종 생백신 시점");

    expect(template?.id).toBe("survivor-vaccination-timing");
    expect(template?.mealNote).toContain(infectionRiskSentence);
    expect(template?.mealNote).toContain(mortalitySeveritySentence);
    expect(template?.mealNote).toContain(inactivatedVaccineSentence);
    expect(template?.mealNote).toContain(liveVaccineSentence);
    expect(template?.mealNote).toContain(beforeChemoSentence);
    expect(template?.mealNote).toContain(afterChemoSentence);
    expect(template?.mealNote).toContain(shinglesSentence);
    expect(template?.clinicianQuestion).toContain(pneumococcalRiskSentence);
    expect(template?.clinicianQuestion).toContain(tenTimesSentence);
    expect(template?.clinicianQuestion).toContain(thirteenValentSentence);
    expect(template?.clinicianQuestion).toContain(twentyThreeValentSentence);
    expect(template?.clinicianQuestion).toContain(fiveYearSentence);
    expect(template?.clinicianQuestion).toContain(fluSentence);
    expect(template?.clinicianQuestion).toContain(annualSentence);
    expect(template?.clinicianQuestion).toContain("코로나19");
    expect(template?.clinicianQuestion).toContain("파상풍");
    expect(template?.clinicianQuestion).toContain("HPV");
    expect(template?.clinicianQuestion).toContain("65세 이상 무료 23가");
    expect(template?.clinicianQuestion).toContain("지역 보건소·병의원");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 예방접종 생백신 시점"),
    ).toContain(inactivatedVaccineSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 예방접종 생백신 시점"),
    ).toContain(
      "출처: 국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리 - https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 예방접종 생백신 시점"),
    ).not.toMatch(
      /폐렴구균 예방접종을 받으세요|독감 예방접종을 받으세요|코로나19 예방접종을 받으세요|대상포진 예방접종을 하세요|생백신을 맞으세요|사백신을 맞으세요|항암치료 중 맞으세요|백신을 예약하세요|감염병을 예방합니다|중증화를 막습니다|치료하세요|처방하세요|진단하세요/,
    );
  });

  it("builds a survivor second-cancer screening question from official guidance", () => {
    const firstCancerSentence = "첫 번째 암이 걸리는데 좀더 취약한";
    const treatmentDamageSentence =
      "암 치료를 받으면서 방사선치료 항암치료를 받으면서 건강한 세포가 손상을 받아서";
    const lifestyleSentence =
      "담배를 피거나 술을 드시거나 이렇게 암에 좋지 않은 생활 슴관";
    const riskHigherSentence =
      "따른 암이 생길 가능성이 상대적으로 암을 겪지 않은 분 보다";
    const tenTwentySentence = "10% 에서 20%정도 더 높아진다";
    const originalCancerSentence = "원발암, 즉 내가 처음 겪었던 암 외에";
    const cervicalSmokingSentence = "자궁경부암을 겪은 분들이 흡연";
    const lungScreeningSentence = "폐암 검진";
    const recurrenceFollowUpSentence = "치료받은 병원에서 원발암 재발 검사";
    const nationalScreeningSentence = "국가 검진";
    const template = findSymptomSupportTemplate("암생존자 이차암 검진 흡연력 폐암 검진");

    expect(template?.id).toBe("survivor-second-cancer-screening");
    expect(template?.mealNote).toContain(firstCancerSentence);
    expect(template?.mealNote).toContain(treatmentDamageSentence);
    expect(template?.mealNote).toContain(lifestyleSentence);
    expect(template?.mealNote).toContain(riskHigherSentence);
    expect(template?.mealNote).toContain(tenTwentySentence);
    expect(template?.clinicianQuestion).toContain(originalCancerSentence);
    expect(template?.clinicianQuestion).toContain(cervicalSmokingSentence);
    expect(template?.clinicianQuestion).toContain(lungScreeningSentence);
    expect(template?.clinicianQuestion).toContain(recurrenceFollowUpSentence);
    expect(template?.clinicianQuestion).toContain(nationalScreeningSentence);
    expect(template?.clinicianQuestion).toContain("흡연 기간·양");
    expect(template?.clinicianQuestion).toContain("저선량 흉부 CT");
    expect(template?.clinicianQuestion).toContain("검진 결과 공유 방식");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 이차암 검진 흡연력 폐암 검진"),
    ).toContain(originalCancerSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 이차암 검진 흡연력 폐암 검진"),
    ).toContain(
      "출처: 국가암정보센터 암생존자 예방접종 및 슬기로운 건강관리 - https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 이차암 검진 흡연력 폐암 검진"),
    ).not.toMatch(
      /폐암 검진을 받으세요|저선량 흉부 CT를 찍으세요|국가검진을 예약하세요|금연하세요|술을 끊으세요|이차암을 예방합니다|재발을 예방합니다|위험이 높습니다|진단하세요|치료하세요|처방하세요/,
    );
  });

  it("builds a survivor work-return question from official guidance", () => {
    const noNeedQuitSentence =
      "암을 진단받았다고 해서 반드시 일을 그만둘 필요는 없습니다.";
    const consultTimingSentence =
      "치료중 일을 유지해도 되는지, 치료 후 언제 복귀할지 담당 의료진과 잘 상의하여 결정 하십시오.";
    const objectiveAssessmentSentence =
      "무엇보다 자신의 신체적, 정신적, 경제적 상황, 업무와 관련된 요인, 치료일정 등을 의료진과 함께 객관적으로 평가한 뒤 일을 계속해도 되는지, 쉬어야 할지, 쉰다면 얼마나 쉬어야 할지 상의하시기 바랍니다.";
    const sideEffectSentence =
      "암 치료로 예상되는 부작용 및 어려움";
    const workAdjustmentSentence =
      "근무시간 조정 가능여부";
    const flexibleWorkSentence =
      "출퇴근시간 조정, 유연근무제, 재택근무 변경 등";
    const benefitImpactSentence =
      "업무조정이 급여나 복지혜택에 미치는 영향";
    const proofDocumentSentence = "필요한 증빙서류 (진단서 등)";
    const workDiningSentence =
      "다만, 술은 피하시고, 되도록 자극적이지 않는 음식으로 골라 스트레스 받지 말고 즐겁게 드시기 바랍니다.";
    const template = findSymptomSupportTemplate("암생존자 직업복귀 근무시간 조정");

    expect(template?.id).toBe("survivor-work-return");
    expect(template?.mealNote).toContain(noNeedQuitSentence);
    expect(template?.mealNote).toContain(consultTimingSentence);
    expect(template?.mealNote).toContain(objectiveAssessmentSentence);
    expect(template?.mealNote).toContain(sideEffectSentence);
    expect(template?.clinicianQuestion).toContain(workAdjustmentSentence);
    expect(template?.clinicianQuestion).toContain(flexibleWorkSentence);
    expect(template?.clinicianQuestion).toContain(benefitImpactSentence);
    expect(template?.clinicianQuestion).toContain(proofDocumentSentence);
    expect(template?.clinicianQuestion).toContain(workDiningSentence);
    expect(template?.clinicianQuestion).toContain("치료와 일을 병행할 수 있는지");
    expect(template?.clinicianQuestion).toContain("직장 복귀시기");
    expect(template?.clinicianQuestion).toContain("부작용 및 스트레스 반응");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 직업복귀 근무시간 조정"),
    ).toContain(objectiveAssessmentSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 직업복귀 근무시간 조정"),
    ).toContain(
      "출처: 국가암정보센터 암생존자 직업복귀 - https://www.cancer.go.kr/lay1/S1T748C798/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 직업복귀 근무시간 조정"),
    ).not.toMatch(
      /복귀하세요|일하세요|퇴사하지 마세요|그만두세요|근무시간을 조정하세요|유연근무제를 신청하세요|재택근무를 하세요|술을 마셔도 됩니다|매운 음식을 먹어도 됩니다|진단하세요|치료하세요|처방하세요|직업복귀가 보장됩니다|삶의 질이 좋아집니다|보상을 신청하세요/,
    );
  });

  it("builds a survivor integrated-support question from official guidance", () => {
    const familySelfManagementSentence =
      "암생존자통합지지센터는 암생존자와 그 가족이 직면하는 신체·심리·생활 문제를 스스로 극복하도록 자가관리 능력 및 회복 탄력성을 증진하여 암생존자의 건강증진과 사회적 기능 복귀 (직장·학교)를 도모합니다.";
    const expertSupportSentence =
      "암생존자통합지지센터에 방문하시는 암생존자 및 가족은 의사, 간호사, 사회복지사, 영양사 등 여러 분야 전문가들을 통해 암 치료 후 발생할 수 있는 신체, 심리, 생활(사회·경제적) 문제를 파악하여 필요한 상담, 교육 등 다양한 서비스를 제공 받을 수 있습니다.";
    const eligibilitySentence =
      "암 진단 후 완치 목적의 주요 치료(수술, 항암화학요법, 방사선치료 등)를 마친 암환자와 그 가족";
    const useMethodSentence =
      "암생존자 통합지지 서비스 이용을 원하시는 경우, 가까운 권역센터를 방문하거나, 대표번호(1577-9740)로 전화하면";
    const serviceContentSentence =
      "암생존자통합지지센터에 방문하시는 암생존자 및 가족은 의사, 간호사, 사회복지사, 영양사 등 여러 분야 전문가들을 통해 암 치료 후 발생할 수 있는 신체, 심리, 생활(사회·경제적) 문제를 파악하여 필요한 상담, 교육 등의 다양한 서비스를 받을 수 있습니다.";
    const template = findSymptomSupportTemplate("암생존자 가족 통합지지 상담");

    expect(template?.id).toBe("survivor-integrated-support");
    expect(template?.mealNote).toContain(familySelfManagementSentence);
    expect(template?.mealNote).toContain(expertSupportSentence);
    expect(template?.clinicianQuestion).toContain(eligibilitySentence);
    expect(template?.clinicianQuestion).toContain(useMethodSentence);
    expect(template?.clinicianQuestion).toContain(serviceContentSentence);
    expect(template?.clinicianQuestion).toContain("자가평가");
    expect(template?.clinicianQuestion).toContain("지역사회 연계 서비스");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 가족 통합지지 상담"),
    ).toContain(serviceContentSentence);
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 가족 통합지지 상담"),
    ).toContain(
      "출처: 국가암정보센터 암생존자통합지지센터 - https://www.cancer.go.kr/lay1/S1T786C841/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "암생존자 가족 통합지지 상담"),
    ).not.toMatch(
      /통합지지센터에 등록하세요|센터에 방문하세요|전화하세요|진단하세요|치료하세요|처방하세요|상담을 받으세요|사회복귀가 보장됩니다|회복탄력성이 좋아집니다|건강증진을 보장합니다/,
    );
  });

  it("builds a pediatric school-return question from official guidance", () => {
    const educationOpportunitySentence =
      "청소년기의 교육기회는 성인기 이후의 직업, 소득, 결혼 등 자립적인 성인으로 전환하는 데 필요한 성과를 달성하고 사회구성원으로서 통합되어 살아가는 것과 밀접한 관련이 있습니다.";
    const schoolRoleSentence =
      "학교 교육은 아동청소년의 인지 및 정서 발달, 학업 성취, 상급학교 진학 등에 있어 중요한 역할";
    const readinessSentence =
      "학교로 돌아가기 전에 부모(보호자), 학교 선생님, 스스로의 준비상태에 대해 점검해보는 것이 좋습니다.";
    const teacherHealthSentence = "현재 학생의 건강 상태";
    const teacherTreatmentSentence = "치료의 진행(치료 기간, 치료 종류 등) 과정";
    const classroomCautionSentence =
      "학생의 건강 유지 및 증진을 위해 주의할 점(교실 환경, 신체활동의 제한, 음식물 등)";
    const attendanceSentence =
      "건강으로 학교 출석이 불가능할 경우 출석을 인정해주는 지원방안";
    const academicGapSentence =
      "학교로 복귀한 학생의 학업 격차를 최소화하는 지원방안";
    const activityAdjustmentSentence =
      "교내외 행사 및 활동에 참여할 수 있도록 활동 조정 가능";
    const emergencySentence =
      "열, 구토, 통증 호소, 부종, 멍, 코피, 출혈";
    const template = findSymptomSupportTemplate("소아청소년 암생존자 학교복귀 지원");

    expect(template?.id).toBe("pediatric-school-return-support");
    expect(template?.mealNote).toContain(educationOpportunitySentence);
    expect(template?.mealNote).toContain(schoolRoleSentence);
    expect(template?.mealNote).toContain(readinessSentence);
    expect(template?.mealNote).toContain("자녀의 진단명과 치료");
    expect(template?.mealNote).toContain("학교 친구들이 자녀의 병에 대해 아는 것");
    expect(template?.mealNote).toContain("학교생활에서 자녀가 도움이 필요할 때");
    expect(template?.clinicianQuestion).toContain(teacherHealthSentence);
    expect(template?.clinicianQuestion).toContain(teacherTreatmentSentence);
    expect(template?.clinicianQuestion).toContain(classroomCautionSentence);
    expect(template?.clinicianQuestion).toContain(attendanceSentence);
    expect(template?.clinicianQuestion).toContain(academicGapSentence);
    expect(template?.clinicianQuestion).toContain(activityAdjustmentSentence);
    expect(template?.clinicianQuestion).toContain("학습 내용이나 과제 조정");
    expect(template?.clinicianQuestion).toContain("앞자리, 화장실 배치");
    expect(template?.clinicianQuestion).toContain("학교급식 시 제외 음식");
    expect(template?.clinicianQuestion).toContain(emergencySentence);
    expect(template?.clinicianQuestion).toContain("충고보다 공감");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 학교복귀 지원",
      ),
    ).toContain(teacherHealthSentence);
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 학교복귀 지원",
      ),
    ).toContain(
      "출처: 국가암정보센터 소아청소년 암생존자 학교복귀 지원 - https://www.cancer.go.kr/lay1/S1T800C804/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(
        template!,
        "소아청소년 암생존자 학교복귀 지원",
      ),
    ).not.toMatch(
      /학교에 복귀시키세요|질병을 공개하세요|특별대우를 요청하세요|수업시간을 조정하세요|과제를 조정하세요|체육수업에 참여시키세요|급식을 제외하세요|응급처치하세요|진단하세요|치료하세요|처방하세요|학교생활에 잘 적응합니다|학업성취가 보장됩니다/,
    );
  });

  it("builds a complementary-therapy consultation question from official guidance", () => {
    const consultFirstSentence =
      "보완대체요법을 사용하는 것을 고려하신다면 주치의와 먼저 상의하시기 바랍니다.";
    const safetyWellbeingSentence =
      "의료진들이 여러분의 안전과 안녕에 대해 생각해 볼 기회를 주고, 여러분도 다른 치료법들의 장/단점을 비교해 볼 수 있게 되는 기회";
    const restrictedSiteSentence =
      "특정 크림이나 약물을 사용하거나 신체의 어느 부위에 침을 맞는 것을 금지";
    const herbSupplementSentence =
      "여러분의 약초나 영양제 복용 사실을 여러분을 돌보고 있는 의료진에게 알리는 것은 부작용 의 위험을 최소화할 수 있는 하나의 방법입니다.";
    const providerSentence =
      "요법가들의 직접적인 설명";
    const futureTreatmentSentence = "앞으로 진행될 의학적 치료";
    const template = findSymptomSupportTemplate("보완대체요법 약초 영양제 상담");

    expect(template?.id).toBe("complementary-therapy-consultation");
    expect(template?.mealNote).toContain(consultFirstSentence);
    expect(template?.mealNote).toContain(safetyWellbeingSentence);
    expect(template?.mealNote).toContain(restrictedSiteSentence);
    expect(template?.clinicianQuestion).toContain(herbSupplementSentence);
    expect(template?.clinicianQuestion).toContain(providerSentence);
    expect(template?.clinicianQuestion).toContain(futureTreatmentSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQuestion(template!, "보완대체요법 약초 영양제 상담"),
    ).toContain(herbSupplementSentence);
    expect(
      buildSymptomSupportQuestion(template!, "보완대체요법 약초 영양제 상담"),
    ).toContain(
      "출처: 국가암정보센터 보완대체요법 상담 - https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(
      buildSymptomSupportQuestion(template!, "보완대체요법 약초 영양제 상담"),
    ).not.toMatch(
      /보완대체요법을 사용하세요|약초를 복용하세요|영양제를 복용하세요|침을 맞으세요|크림을 바르세요|치료를 중단하세요|병원치료를 대체하세요|효과가 입증됐습니다|안전합니다|암을 낫게|진단하세요|치료하세요|처방하세요/,
    );
  });

  it("builds a dyspnea consult-threshold question from official respiratory guidance", () => {
    const sputumObservationSentence =
      "기침이나 구토 가 있으면 가래의 양과 양상 및 냄새를 관찰합니다. (투명하거나 하얗고 거품이 있는 것이 정상입니다. )";
    const consultHeaderSentence = "이런 경우에는 의사와 상의하십시오.";
    const dyspneaChestPainSentence = "호흡곤란이나 흉통이 있을 때";
    const coloredSputumSentence =
      "노랗거나 녹색이며 걸쭉하고 혈액이 섞인 가래가 있을 때";
    const paleBlueClammySkinSentence =
      "피부가 창백하거나 파랗거나 혹은 차가우며 축축할 때";
    const feverSentence = "열이 있을 때";
    const nostrilFlaringSentence = "호흡하는 동안 콧구멍이 넓게 벌어질 때";
    const noisyBreathingSentence = "호흡시 그르렁소리가 날 때";
    const template = findSymptomSupportTemplate("기침과 호흡곤란, 흉통");

    expect(template?.id).toBe("dyspnea-consult");
    expect(template?.mealNote).toContain(sputumObservationSentence);
    expect(template?.mealNote).toContain(paleBlueClammySkinSentence);
    expect(template?.mealNote).toContain(nostrilFlaringSentence);
    expect(template?.clinicianQuestion).toContain(consultHeaderSentence);
    expect(template?.clinicianQuestion).toContain(dyspneaChestPainSentence);
    expect(template?.clinicianQuestion).toContain(coloredSputumSentence);
    expect(template?.clinicianQuestion).toContain(feverSentence);
    expect(template?.clinicianQuestion).toContain(noisyBreathingSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "호흡곤란")).toContain(
      consultHeaderSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "호흡곤란")).toContain(
      "출처: 국가암정보센터 호흡곤란 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T411C415/contents.do",
    );
    expect(findSymptomSupportTemplate("38도 발열과 호흡곤란")?.id).toBe(
      "infection-fever",
    );
    expect(findSymptomSupportTemplate("가래에 피 섞인 호흡곤란")?.id).toBe(
      "bleeding-warning",
    );
    expect(findSymptomSupportTemplate("하루 이상 딸꾹질과 호흡곤란")?.id).toBe(
      "hiccup-consult",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "호흡곤란")).not.toMatch(
      /산소를 줍니다|처방된 약|항생제 치료를 받게 됩니다|진단하세요|치료하세요|약을 처방하세요/,
    );
  });

  it("builds a dyspnea experience question from official respiratory cause guidance", () => {
    const oxygenTransportSentence =
      "호흡곤란은 신체내에 운반되는 산소가 충분하지 않을 때 발생하는데 양쪽 폐가 충분한 공기를 흡입하지 못하거나 폐가 혈류로 충분한 산소를 운반해 주지 못할 때 일어납니다.";
    const experienceSentence =
      "암환자와 관계되는 경험적인 호흡곤란은 “숨이 가쁜”,“충분한 공기를 얻을 수 없어요.”, “호흡은 노력을 요구”, 그리고 “가슴은 단단해지는 것 같다”는 내용을 포함하는 공통된 어구를 사용합니다.";
    const worrySentence =
      "호흡곤란이 있는 대부분의 환자들은 걱정을 하게 되고, 심한 호흡곤란은 환자와 가족을 당황스럽게 합니다.";
    const symptomSentence =
      "호흡곤란이 오면 쉬고 있거나 움직일 때 숨이 가쁘거나 호흡하기가 힘들어지며, 가슴에 통증 을 호소하기도 하며 맥박수가 빨라지고 피부가 차고 축축하게 느껴지기도 합니다.";
    const careTeamSentence =
      "전에 없었던 호흡곤란이 나타나거나 갑자기 악화되는 경우 의사의 진료를 받아야 합니다.";
    const template = findSymptomSupportTemplate("충분한 공기를 얻을 수 없어요");

    expect(template?.id).toBe("dyspnea-experience");
    expect(template?.mealNote).toContain(oxygenTransportSentence);
    expect(template?.mealNote).toContain(experienceSentence);
    expect(template?.mealNote).toContain(worrySentence);
    expect(template?.clinicianQuestion).toContain(symptomSentence);
    expect(template?.clinicianQuestion).toContain(careTeamSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "공기를 얻기 어려움")).toContain(
      "출처: 국가암정보센터 호흡곤란 원인 - https://www.cancer.go.kr/lay1/S1T411C414/contents.do",
    );
    expect(findSymptomSupportTemplate("호흡곤란")?.id).toBe("dyspnea-consult");
    expect(findSymptomSupportTemplate("기침과 호흡곤란, 흉통")?.id).toBe(
      "dyspnea-consult",
    );
    expect(findSymptomSupportTemplate("38도 발열과 호흡곤란")?.id).toBe(
      "infection-fever",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "공기를 얻기 어려움")).not.toMatch(
      /산소를 투여하세요|산소를 줍니다|처방된 약|진단하세요|치료하세요|약을 처방하세요|응급 처치하세요/,
    );
  });

  it("builds a cough symptom-support question from official respiratory guidance", () => {
    const pathologicCoughSentence =
      "병적인 기침은 환자가 불편을 느끼는 증상으로 지속되거나 발작적인 것을 말합니다.";
    const sleepDisruptionSentence =
      "밤에 잠을 방해하거나, 피곤, 통증, 기절, 구토, 흉통, 복통, 두통을 일으키거나 가끔씩 늑골골절 등을 일으키는 괴로운 증상입니다.";
    const severeCoughSentence =
      "오래 지속되는 심한 기침은 통증을 증가시킬 뿐만 아니라 환자를 지치게 하며 환자의 수면을 방해하고 환자와 가족들에게 근심을 가져올 수 있습니다.";
    const causeSentence =
      "말기 암 환자의 기침은 흉막 삼출(흉막에 물이 찬 경우), 이물질 흡인(음식물이 기관지를 통해 폐로 넘어간 경우), 호흡기 감염(기관지염, 폐렴) 좌심실 부전, 천식, 알러지, 폐암 등에 의해 발생할 수 있습니다.";
    const template = findSymptomSupportTemplate("기침이 오래 지속되고 밤잠 방해");

    expect(template?.id).toBe("cough-care");
    expect(template?.mealNote).toContain(pathologicCoughSentence);
    expect(template?.mealNote).toContain(sleepDisruptionSentence);
    expect(template?.mealNote).toContain(severeCoughSentence);
    expect(template?.clinicianQuestion).toContain(causeSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "기침")).toContain(
      "출처: 국가암정보센터 기침 원인 - https://www.cancer.go.kr/lay1/S1T410C412/contents.do",
    );
    expect(findSymptomSupportTemplate("기침과 호흡곤란, 흉통")?.id).toBe(
      "dyspnea-consult",
    );
    expect(findSymptomSupportTemplate("38도 발열과 기침")?.id).toBe(
      "infection-fever",
    );
    expect(findSymptomSupportTemplate("가래에 피 섞인 기침")?.id).toBe(
      "bleeding-warning",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "기침")).not.toMatch(
      /처방된 알레르기 약을 복용합니다|흡입기를 처방받아 흡입합니다|항생제 치료를 받게 됩니다|진단하세요|치료하세요|약을 처방하세요/,
    );
  });

  it("builds a fatigue and mood-change question from depression or insomnia keywords", () => {
    const template = findSymptomSupportTemplate("우울과 불면이 계속됨");

    expect(template?.id).toBe("fatigue");
    expect(template?.label).toBe("피로감·우울");
    expect(template?.mealNote).toContain("기분 저하");
    expect(template?.mealNote).toContain("불면");
    expect(buildSymptomSupportQuestion(template!, "우울과 불면")).toContain(
      "혈구수, 영양섭취, 수면, 우울",
    );
    expect(buildSymptomSupportQuestion(template!, "우울과 불면")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
  });

  it("builds a fatigue symptom-support question from official rest and nutrition guidance", () => {
    const causeSentence =
      "치료기간 동안 피로감은 제대로 먹지 못한 것, 운동 저하, 혈구수 부족, 우울, 불면 그리고 약물 부작용 등과 관련이 있습니다.";
    const clinicianCauseSentence =
      "만일 피로를 느낀다면 의사선생님과 원인에 대해 함께 이야기하는 것이 필요합니다.";
    const shortRestSentence =
      "오랜 수면보다는 낮에 잠깐씩 낮잠이나 휴식을 취합니다.";
    const shortActivitySentence = "일상적인 활동보다 짧고 간단한 활동을 하도록 합니다.";
    const nutritionSentence =
      "영양이 풍부한 음식을 충분히 섭취합니다. 불충분한 열량과 영양소 섭취가 피로의 원인이 될 수 있기 때문입니다.";
    const bestTimeSentence = "하루 중 가장 좋은 시간에 가능한 많이 먹습니다.";
    const frequentSnackSentence = "적은 양의 식사와 간식을 자주 먹습니다.";
    const walkSentence =
      "가능하다면 산책이나 규칙적인 운동을 하도록 합니다. 이는 피로감을 덜어주고 정신을 맑게 하는데 도움이 될 것입니다.";
    const limitActivitySentence =
      "피로를 악화시키는 행위는 제한하도록 합니다. 아이보기, 밥하기, 집안일 등은 주변 사람들에게 도움을 청하도록 합니다.";
    const template = findSymptomSupportTemplate("피로와 기운 없음");

    expect(template?.id).toBe("fatigue");
    expect(template?.mealNote).toContain(causeSentence);
    expect(template?.mealNote).toContain(shortRestSentence);
    expect(template?.mealNote).toContain(shortActivitySentence);
    expect(template?.mealNote).toContain(nutritionSentence);
    expect(template?.mealNote).toContain(bestTimeSentence);
    expect(template?.mealNote).toContain(frequentSnackSentence);
    expect(template?.mealNote).toContain(walkSentence);
    expect(template?.clinicianQuestion).toContain(clinicianCauseSentence);
    expect(template?.clinicianQuestion).toContain(limitActivitySentence);
    expect(buildSymptomSupportQuestion(template!, "피로")).toContain(
      clinicianCauseSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "피로")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 피로감과 우울 - https://www.cancer.go.kr/lay1/S1T479C490/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "피로")).not.toMatch(
      /항우울제를 처방하세요|수면제를 처방하세요|진단하세요|치료하세요|운동을 강제하세요/,
    );
  });

  it("builds a cancer-fatigue coping question from official coping guidance", () => {
    const evaluationSentence =
      "피로의 치료를 잘하기 위해서는 피로의 정도를 반드시 정확하게 평가해야 합니다.";
    const familyEffortSentence =
      "암관련 피로를 치료할 때는 의료진의 도움뿐만 아니라 환자 본인과 가족의 노력이 함께 필요합니다.";
    const prioritySentence =
      "여러 가지 일들 중에 우선순위를 정하고 중요하지 않은 활동은 연기하는 지혜가 필요합니다.";
    const helpSentence =
      "일상생활에서 주위 사람들의 도움을 받도록 하며, 항상 사용하는 물건은 손이 닿기 쉬운 곳에 두어 에너지를 낭비하지 않도록 합니다.";
    const recordSentence =
      "피로를 느낄 때의 상황을 기록하여 생활의 계획을 세우면, 효율적으로 시간을 관리하게 되어 피로를 덜 느끼게 됩니다.";
    const balancedMealSentence =
      "다양한 음식으로 단백질과 비타민 등이 함유된 균형있는 식생활을 합니다.";
    const contactSignalSentence = "자꾸 몽롱해질 때";
    const template = findSymptomSupportTemplate("암관련 피로 대처");

    expect(template?.id).toBe("cancer-fatigue-coping");
    expect(template?.mealNote).toContain(evaluationSentence);
    expect(template?.mealNote).toContain(familyEffortSentence);
    expect(template?.mealNote).toContain(prioritySentence);
    expect(template?.mealNote).toContain(helpSentence);
    expect(template?.mealNote).toContain(recordSentence);
    expect(template?.mealNote).toContain(balancedMealSentence);
    expect(template?.clinicianQuestion).toContain("주치의와 간호사");
    expect(template?.clinicianQuestion).toContain(contactSignalSentence);
    expect(template?.clinicianQuestion).toContain("현기증");
    expect(template?.clinicianQuestion).toContain("숨이 차고");
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "암관련 피로 대처")).toContain(
      recordSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "암관련 피로 대처")).toContain(
      "출처: 국가암정보센터 암관련 피로대처 - https://www.cancer.go.kr/lay1/S1T420C421/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(buildSymptomSupportQuestion(template!, "암관련 피로 대처")).not.toMatch(
      /피로를 진단하세요|치료하세요|운동하세요|수면제를 처방하세요|음식을 처방하세요|암이 악화된 것이 아닙니다|반드시 상담받으세요|금연하세요|카페인을 끊으세요|낮잠을 자세요/,
    );
  });

  it("builds a nausea symptom-support question from official diet guidance", () => {
    const mealEnvironmentSentence =
      "음식 냄새가 나지 않고 환기가 잘 되는 쾌적한 장소에서 식사를 하고, 식사 시에는 조금씩 자주 천천히 하며, 식후 1시간 정도는 휴식을 취하는 것이 좋습니다.";
    const hungerSentence =
      "배가 고프면 더욱 메스꺼울 수 있으므로 배고프기 전에 먹도록 합니다.";
    const doNotForceSentence =
      "메스꺼움이 심한 경우 억지로 먹거나 마시지 않도록 합니다. 특정 음식에 대해 메스꺼움이 심할 때에도 억지로 먹지 않도록 합니다. 대신 먹기 좋은 다른 음식을 많이 먹도록 합니다.";
    const easyFoodSentence = "비교적 위에 부담이 적은 식품들을 섭취합니다.";
    const avoidFoodSentence =
      "다음 음식들은 메스꺼움을 더욱 유발할 수 있으므로 피하도록 합니다.";
    const waterClothingSentence =
      "물은 포만감을 줄 수 있기 때문에 천천히 조금씩 마시고, 식사 시에도 조금만 마시도록 합니다. 옷은 몸이 조이지 않도록 느슨하게 입습니다.";
    const antiemeticConsultSentence =
      "미리 메스꺼움과 구토증상을 완화시키는 항구토제의 사용에 대해 의사선생님과 상의합니다.";
    const triggerConsultSentence =
      "메스꺼움이 언제, 무엇 때문에 나타나는지를 체크하고 의사선생님이나 간호사와 상의합니다.";
    const template = findSymptomSupportTemplate("식사 후 오심이 심함");

    expect(template?.id).toBe("nausea");
    expect(template?.mealNote).toContain(mealEnvironmentSentence);
    expect(template?.mealNote).toContain(hungerSentence);
    expect(template?.mealNote).toContain(doNotForceSentence);
    expect(template?.mealNote).toContain(easyFoodSentence);
    expect(template?.mealNote).toContain(avoidFoodSentence);
    expect(template?.mealNote).toContain(waterClothingSentence);
    expect(template?.clinicianQuestion).toContain(antiemeticConsultSentence);
    expect(template?.clinicianQuestion).toContain(triggerConsultSentence);
    expect(buildSymptomSupportQuestion(template!, "오심")).toContain(triggerConsultSentence);
    expect(buildSymptomSupportQuestion(template!, "오심")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 메스꺼움 - https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "오심")).not.toMatch(
      /항구토제를 처방하세요|진단하세요|치료하세요|약을 조정하세요|억지로 먹이세요/,
    );
  });

  it("builds a vomiting symptom-support question from staged official diet guidance", () => {
    const activeVomitingSentence =
      "구토증상이 있는 경우 먹거나 마시지 않도록 합니다. 구토증상이 조절되면, 물이나 육수 등과 같은 맑은 유동식부터 조금씩 먹어보고 차츰 양을 증가시키도록 합니다.";
    const softFoodSentence =
      "맑은 유동식으로 구토증상이 조절되면, 미음이나 부드러운 식사로 바꾸어 조금씩 자주 먹도록 하고, 적응되면 일반 식사를 섭취하도록 합니다.";
    const consultationSentence =
      "구토가 1~2일 이상 심하게 계속된다면 의사선생님과 상의합니다.";
    const template = findSymptomSupportTemplate("구토가 계속됨");

    expect(template?.id).toBe("vomiting");
    expect(template?.mealNote).toContain(activeVomitingSentence);
    expect(template?.mealNote).toContain(softFoodSentence);
    expect(template?.clinicianQuestion).toContain(consultationSentence);
    expect(buildSymptomSupportQuestion(template!, "구토")).toContain(consultationSentence);
    expect(buildSymptomSupportQuestion(template!, "구토")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 구토 - https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "구토")).not.toMatch(/수액을 맞으세요|처방하세요|진단하세요/);
  });

  it("builds a nausea-vomiting consultation-threshold question from official symptom-management guidance", () => {
    const fluidHelpSentence =
      "환자들은 섭취할 수 있을 만큼만 음료를 마셔야 합니다. 대부분의 경우, 음료는 마실 수 있을 만큼 정상으로 돌아오게 되는데, 지속적으로 구토를 하는 환자들은 수분공급과 전해질의 균형을 유지하기 위해서 정맥 또는 피하 체액 주사를 맞을 수 도 있습니다. 이 때는 의료진의 도움이 필요합니다.";
    const throatCoughSentence = "구토 후 목에 음식물이 걸린 느낌과 기침이 계속되는 경우";
    const persistentNauseaSentence =
      "오심이 며칠이상 지속되거나 오심 때문에 당신이 중요한 일을 하지 못할 때";
    const hourlyVomitingSentence =
      "구토를 12시간 이상 지속적으로 하거나 한 시간 동안 3번 이상 한 경우";
    const lowIntakeSentence =
      "식사를 거의 못하여 하루에 4컵 이하의 음식을 먹거나 2일 이상 식사를 제대로 하지 못하는 경우와 2일동안 1-2회 이상의 구토가 있을 때";
    const darkUrineSentence =
      "수차례 구토를 하고, 소변의 색이 진한 노란색이고 평상시의 소변 횟수만큼 화장실에 가지 못할 때";
    const confusionSentence =
      "구토가 지속되고 머리가 띵하거나 어지럽거나, 혼란한 느낌이 들 때";
    const coffeeVomitSentence = "구토물이 커피색일 때 (혈액일 수 있음)";
    const antiemeticPersistentSentence =
      "의사가 처방한 진토제를 복용했는데도 오심 구토가 계속될 때";
    const antiemeticSideEffectSentence = "진토제 복용한 후 부작용 이 발생했을 때";
    const unableToTakeMedicineSentence =
      "심한 초심이나 구토 때문에 약을 먹을 수 없을 때, 또는 온종일 물을 제대로 마시지 못하거나 식사를 하지 못한 경우";
    const template = findSymptomSupportTemplate("구토 12시간 이상 지속");

    expect(template?.id).toBe("nausea-vomiting-consult-threshold");
    expect(template?.mealNote).toContain(fluidHelpSentence);
    expect(template?.mealNote).toContain(throatCoughSentence);
    expect(template?.mealNote).toContain(persistentNauseaSentence);
    expect(template?.mealNote).toContain(hourlyVomitingSentence);
    expect(template?.clinicianQuestion).toContain(lowIntakeSentence);
    expect(template?.clinicianQuestion).toContain(darkUrineSentence);
    expect(template?.clinicianQuestion).toContain(confusionSentence);
    expect(template?.clinicianQuestion).toContain(coffeeVomitSentence);
    expect(template?.clinicianQuestion).toContain(antiemeticPersistentSentence);
    expect(template?.clinicianQuestion).toContain(antiemeticSideEffectSentence);
    expect(template?.clinicianQuestion).toContain(unableToTakeMedicineSentence);
    expect(buildSymptomSupportQuestion(template!, "오심·구토")).toContain(
      hourlyVomitingSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "오심·구토")).toContain(
      "출처: 국가암정보센터 메스꺼움과 구토 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(buildSymptomSupportQuestion(template!, "오심·구토")).not.toMatch(
      /수액을 맞으세요|전해질을 처방하세요|진토제를 복용하세요|진토제를 추가하세요|복용량을 조절하세요|약을 중단하세요|응급치료하세요|자가 치료하세요|진단하세요|치료하세요/,
    );
  });

  it("builds a mouth-sore symptom-support question from official soft-food guidance", () => {
    const softMoistSentence = "부드럽고 촉촉한 음식을 준비합니다.";
    const easySwallowSentence = "씹고 삼키기 쉬운 음식을 먹습니다.";
    const avoidIrritantSentence = "입안을 자극하는 음식이나 음료는 피하도록 합니다.";
    const cutOrBlendSentence =
      "요리를 할 때는 부드럽고 연해질 때까지 하도록 하며, 음식을 작은 크기로 자릅니다. 경우에 따라서는 믹서로 곱게 갈도록 합니다.";
    const strawSentence = "입안이 쓰린 경우 빨대를 이용합니다.";
    const roomTemperatureSentence =
      "뜨거운 음식은 입과 목을 자극하므로 차거나 상온의 음식을 이용합니다.";
    const clinicianVisitSentence =
      "만약 입안통증이나 잇몸에 염증이 있는 경우 의사선생님을 방문하여 항암치료 의 부작용 때문인지 치과질환인지 알아보도록 합니다.";
    const template = findSymptomSupportTemplate("입안 상처와 구내염");

    expect(template?.id).toBe("mouth-sore");
    expect(template?.mealNote).toContain(softMoistSentence);
    expect(template?.mealNote).toContain(easySwallowSentence);
    expect(template?.mealNote).toContain(avoidIrritantSentence);
    expect(template?.mealNote).toContain(cutOrBlendSentence);
    expect(template?.mealNote).toContain(strawSentence);
    expect(template?.mealNote).toContain(roomTemperatureSentence);
    expect(template?.clinicianQuestion).toContain(clinicianVisitSentence);
    expect(buildSymptomSupportQuestion(template!, "구내염")).toContain(
      clinicianVisitSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "구내염")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 입과 목의 통증 - https://www.cancer.go.kr/lay1/S1T479C483/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "구내염")).not.toMatch(
      /구강치료를 지시하세요|진통제를 처방하세요|치료하세요|진단하세요/,
    );
  });

  it("builds an oral mucositis care question from official oral-hygiene guidance", () => {
    const cleanMoistSentence = "구강을 깨끗하고 촉촉하게 유지하는 방법";
    const softBrushSentence = "칫솔모가 부드러운 것을 사용하십시오.";
    const dentureCleaningSentence =
      "틀니는 발포성 틀니용 세정제나 1.5%과산화수소 용액에 6-7분 동안 담가둡니다.";
    const rinseSolutionSentence =
      "구강함수액은 생리식염수 500cc 와 베이킹 소다 10g을 섞은 물, 6%이하의 알코올 이 섞인 구강청정제, 1.5%과산화수소 수용액 또는 물과 과산화수소의 비가 3:1 이 되도록 만들어 사용합니다.";
    const duringTreatmentSentence =
      "구강을 자주 헹궈 수분을 충분하게 유지합니다. 단, 알코올 성분 구강세정제는 삼가합니다.";
    const dentureWearSentence = "의치는 꼭 필요한 경우만 착용합니다.";
    const gumConsultSentence =
      "항암화학요법 시작 전에 잇몸 상태 등에 대하여 의료진과 미리 상의하시면 도움이 됩니다.";
    const template = findSymptomSupportTemplate("구강함수액과 틀니 세정 확인");

    expect(template?.id).toBe("oral-mucositis-care");
    expect(template?.mealNote).toContain(cleanMoistSentence);
    expect(template?.mealNote).toContain(softBrushSentence);
    expect(template?.mealNote).toContain(dentureCleaningSentence);
    expect(template?.mealNote).toContain(rinseSolutionSentence);
    expect(template?.clinicianQuestion).toContain(duringTreatmentSentence);
    expect(template?.clinicianQuestion).toContain(dentureWearSentence);
    expect(template?.clinicianQuestion).toContain(gumConsultSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQuestion(template!, "구강함수액")).toContain(
      "출처: 국가암정보센터 입안의 염증(구내염) 도움이 되는 방법 - https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
    );
    expect(findSymptomSupportTemplate("입안 상처와 구내염")?.id).toBe("mouth-sore");
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "구강함수액")).not.toMatch(
      /구강치료를 지시하세요|항생제를 사용하세요|마취제를 사용하세요|진통제를 복용하세요|처방하세요|진단하세요|치료하세요|약을 처방하세요/,
    );
  });

  it("builds a dry-mouth symptom-support question from official moisture guidance", () => {
    const nearbyWaterSentence = "가까운 장소에 물을 두어 조금씩 자주 마시도록 합니다.";
    const brothSoakingSentence =
      "음식을 먹을 때 육수나 국물 등에 담그거나 적셔서 먹도록 합니다.";
    const moistFoodSentence =
      "삼키기 쉽게 하기 위해 음식에 소스나 드레싱을 첨가하여 촉촉하게 합니다.";
    const strawSentence =
      "식사 중간에 자주 물이나 음료를 한 모금씩 마시도록 합니다. 빨대를 이용하면 삼키는 것에 도움이 됩니다.";
    const candyGumSentence =
      "딱딱한 사탕을 빨거나 껌을 씹는 것도 침 분비를 도와줄 수 있습니다.";
    const consultationSentence =
      "그러나 문제가 심각하면 의사선생님이나 치과선생님과 상의합니다.";
    const template = findSymptomSupportTemplate("입안이 마르고 구강건조가 심함");

    expect(template?.id).toBe("dry-mouth");
    expect(template?.mealNote).toContain(nearbyWaterSentence);
    expect(template?.mealNote).toContain(brothSoakingSentence);
    expect(template?.mealNote).toContain(moistFoodSentence);
    expect(template?.mealNote).toContain(strawSentence);
    expect(template?.mealNote).toContain(candyGumSentence);
    expect(template?.clinicianQuestion).toContain(consultationSentence);
    expect(buildSymptomSupportQuestion(template!, "입안 건조증")).toContain(
      consultationSentence,
    );
    expect(buildSymptomSupportQuestion(template!, "입안 건조증")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 입안의 건조증 - https://www.cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "입안 건조증")).not.toMatch(
      /인공타액을 처방하세요|치료하세요|진단하세요/,
    );
  });

  it("builds a taste-change symptom-support question from official diet guidance", () => {
    const proteinAlternativeSentence =
      "만약 고기가 싫다면 생선이나 계란, 두부, 콩, 우유나 유제품을 이용합니다.";
    const seasoningSentence =
      "고기나 생선요리에 향이 좋은 양념류(와인, 레몬즙 등)나 새콤달콤한 소스를 사용합니다.";
    const metallicTasteSentence =
      "신맛이 금속성의 맛을 제거하는 데 도움이 될 수 있으므로 오렌지나 레몬같이 시큼한 식품을 사용합니다. 그러나 입과 목에 통증 이 있다면, 이런 식품들이 염증을 자극하거나 불편하게 하므로 주의합니다.";
    const dentalCheckSentence =
      "음식의 맛이나 냄새에 영향을 미치는 치과적인 문제가 없는지 확인해보고, 입안을 자주 헹구도록 합니다.";
    const template = findSymptomSupportTemplate("입맛 변화와 금속성 맛");

    expect(template?.id).toBe("taste-change");
    expect(template?.mealNote).toContain(proteinAlternativeSentence);
    expect(template?.mealNote).toContain(seasoningSentence);
    expect(template?.mealNote).toContain(metallicTasteSentence);
    expect(template?.clinicianQuestion).toContain(dentalCheckSentence);
    expect(buildSymptomSupportQuestion(template!, "입맛 변화")).toContain(dentalCheckSentence);
    expect(buildSymptomSupportQuestion(template!, "입맛 변화")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 입맛의 변화 - https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "입맛 변화")).not.toMatch(
      /치료하세요|진단하세요|레몬을 처방하세요|치과치료를 지시/,
    );
  });

  it("builds an appetite-loss symptom-support question from official diet guidance", () => {
    const frequentSnackSentence =
      "조금씩 자주 먹도록 하고 간식을 가까이 두어서 먹고 싶을 때 쉽게 먹을 수 있게 합니다. (예) 과자, 빵, 과일, 우유 및 유제품, 두유, 치즈 등";
    const eatWhenAbleSentence =
      "식사 시간에 얽매이지 말고 먹고 싶을 때, 먹을 수 있을 때, 또는 몸 상태가 좋을 때 먹도록 합니다.";
    const fluidTimingSentence =
      "식사 시 수분섭취는 포만감을 주므로 한 모금씩 조금만 마시도록 합니다. 만약 많은 양의 물을 마시고 싶다면 식전이나 식후 30~60분에 마시도록 합니다.";
    const walkAndCleanSentence =
      "가벼운 산책 등 규칙적인 운동도 입맛을 증진시키는데 도움을 줄 수 있습니다. 입맛을 돋우기 위해서 식사전후에 입안을 청결하게 합니다.";
    const supplementSentence =
      "식사섭취가 계속적으로 힘들 경우에는 특수영양 보충음료를 이용합니다. (예) 그린비아, 뉴케어, 메디푸드, 엔슈어 등";
    const caregiverSupportSentence =
      "주위 분들도 환자가 먹기 싫어할 때 억지로 먹으라고 지나치게 강요하지 말고 환자 스스로 먹을 수 있게끔 도와줍니다.";
    const template = findSymptomSupportTemplate("식욕부진과 공복감 없음");

    expect(template?.id).toBe("appetite-loss");
    expect(template?.mealNote).toContain(frequentSnackSentence);
    expect(template?.mealNote).toContain(eatWhenAbleSentence);
    expect(template?.mealNote).toContain(fluidTimingSentence);
    expect(template?.mealNote).toContain(walkAndCleanSentence);
    expect(template?.clinicianQuestion).toContain(supplementSentence);
    expect(template?.clinicianQuestion).toContain(caregiverSupportSentence);
    expect(buildSymptomSupportQuestion(template!, "식욕부진")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 식욕부진 - https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "식욕부진")).not.toMatch(
      /식욕촉진제를 처방하세요|강제로 먹이세요|진단하세요|치료하세요/,
    );
  });

  it("builds a diarrhea symptom-support question from official hydration guidance", () => {
    const hydrationSentence =
      "수분을 충분히 섭취하여 설사로 손실된 부분을 보충합니다.";
    const smallMealSentence = "장이 약해져 있으므로 식사는 조금씩 자주 먹습니다.";
    const electrolyteFoodSentence =
      "염분과 칼륨이 많이 들어있는 식품을 섭취하여 설사로 인한 손실을 보충합니다. 염분과 칼륨이 들어있는 식품으로는 육수, 스포츠 음료, 바나나, 삶거나 으깬 감자, 복숭아, 토마토 등입니다.";
    const avoidFoodSentence = "다음 식품들은 가능한 피하도록 합니다.";
    const roomTemperatureSentence =
      "너무 뜨겁거나 차가운 식품이나 음료는 피하고, 대신 상온의 음료를 마시도록 합니다.";
    const clearLiquidSentence =
      "갑자기 설사할 경우 12~24시간 동안은 맑은 유동식만 먹도록 합니다. 이는 장을 쉬게 해 주며 설사로 손실된 수분을 보충해 줍니다.";
    const consultationSentence =
      "설사가 너무 심하거나 피가 섞이거나 2일 이상 계속되면 의사선생님과 상의하도록 합니다.";
    const template = findSymptomSupportTemplate("diarrhea after medication");

    expect(template?.id).toBe("diarrhea");
    expect(template?.mealNote).toContain(hydrationSentence);
    expect(template?.mealNote).toContain(smallMealSentence);
    expect(template?.mealNote).toContain(electrolyteFoodSentence);
    expect(template?.mealNote).toContain(avoidFoodSentence);
    expect(template?.mealNote).toContain(roomTemperatureSentence);
    expect(template?.clinicianQuestion).toContain(clearLiquidSentence);
    expect(template?.clinicianQuestion).toContain(consultationSentence);
    expect(buildSymptomSupportQuestion(template!, "설사")).toContain(consultationSentence);
    expect(buildSymptomSupportQuestion(template!, "설사")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 설사 - https://www.cancer.go.kr/lay1/S1T479C488/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "설사")).not.toMatch(
      /지사제를 처방하세요|진단하세요|치료하세요|수액을 맞으세요/,
    );
  });

  it("builds a constipation symptom-support question from official hydration and activity guidance", () => {
    const hydrationSentence =
      "수분을 충분히 섭취합니다.(하루에 8~10컵 이상) 이는 변을 부드럽게 합니다.";
    const morningWaterSentence =
      "특히 아침 기상 직후에 차가운 물을 마시면 장운동에 도움이 됩니다.";
    const foodAmountSentence = "음식 섭취량이 너무 적지 않도록 합니다.";
    const fiberFoodSentence =
      "도정이 덜 된 곡류, 생과일, 생야채 등 섬유소가 많은 식품을 충분히 섭취합니다.";
    const activitySentence =
      "가벼운 산책이나 걷기 등의 자신에게 맞는 운동을 규칙적으로 하는 것이 도움이 됩니다.";
    const massageSentence =
      "누워만 있는 경우라도 배를 부드럽게 문질러 주면 장운동에 도움이 됩니다.";
    const consultationSentence =
      "계속적으로 변비가 조절되지 않는다면 의사선생님과 상의하도록 합니다.";
    const template = findSymptomSupportTemplate("변비만 있음");

    expect(template?.id).toBe("constipation");
    expect(template?.mealNote).toContain(hydrationSentence);
    expect(template?.mealNote).toContain(morningWaterSentence);
    expect(template?.mealNote).toContain(foodAmountSentence);
    expect(template?.mealNote).toContain(fiberFoodSentence);
    expect(template?.mealNote).toContain(activitySentence);
    expect(template?.mealNote).toContain(massageSentence);
    expect(template?.clinicianQuestion).toContain(consultationSentence);
    expect(buildSymptomSupportQuestion(template!, "변비")).toContain(consultationSentence);
    expect(buildSymptomSupportQuestion(template!, "변비")).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 변비 - https://www.cancer.go.kr/lay1/S1T479C487/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
    expect(buildSymptomSupportQuestion(template!, "변비")).not.toMatch(
      /완하제를 처방하세요|진단하세요|치료하세요|관장을 하세요/,
    );
  });

  it("builds a cervical urinary or bowel change question from bleeding keywords", () => {
    const template = findSymptomSupportTemplate("혈뇨와 혈변");

    expect(template?.id).toBe("cervical-urinary-bowel-bleeding");
    expect(template?.mealNote).toContain("배뇨곤란");
    expect(template?.mealNote).toContain("발열 동반 여부");
    expect(buildSymptomSupportQuestion(template!, "혈뇨")).toContain("6개월 이상");
    expect(buildSymptomSupportQuestion(template!, "혈뇨")).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
  });

  it("builds a cervical surgery bladder or bowel dysfunction question from official complication guidance", () => {
    const acuteComplicationSentence =
      "수술로 인한 합병증에는 급성과 만성이 있습니다. 급성 합병증이란 수술 직후에 일어나는 합병증으로 출혈, 장폐색, 혈관손상, 요관손상, 직장 파열, 폐렴, 폐색전 증 등이 있으나, 수술의 발전으로 최근 급성 합병증의 발생은 매우 드문 편입니다.";
    const bladderRectalSentence =
      "만성 합병증으로는 방광이나 직장의 기능부전이 가장 대표적입니다.";
    const surgeryScopeSentence =
      "침윤 성 자궁경부암 으로 수술한 경우, 근종이나 기타 양성 질환으로 수술하는 경우와는 달리 광범위자궁절제 및 림프절 절제술 을 동시에 시행해서 생깁니다.";
    const radicalHysterectomySentence =
      "광범위 자궁절제술 은 단순히 자궁뿐만 아니라 자궁주변의 조직을 많이 포함하여 절제하는 것을 말합니다.";
    const nerveInjurySentence =
      "이 경우 방광이나 직장으로 들어가는 신경조직이 많이 손상되므로 수술 후 배뇨나 배변 장애가 올 수 있습니다.";
    const nerveSparingSentence =
      "이와 같은 부작용 을 줄이기 위하여 최근에는 신경보존 광범위자궁절제술 등을 개발하여 시도하고 있습니다.";
    const lymphedemaSentence =
      "또한 림프절 절제술로 인한 림프 낭종 이나 다리나 회음부 에 림프 부종 이 생길 수 있습니다.";
    const template = findSymptomSupportTemplate("광범위 자궁절제술 후 배뇨 장애")!;
    const actionNote = buildSymptomSupportActionNote(template);
    const question = buildSymptomSupportQuestion(template, "광범위 자궁절제술 후 배뇨 장애");

    expect(template.id).toBe("cervical-urinary-bowel-bleeding");
    expect(template.mealNote).toContain(acuteComplicationSentence);
    expect(template.mealNote).toContain(bladderRectalSentence);
    expect(template.mealNote).toContain(nerveInjurySentence);
    expect(template.clinicianQuestion).toContain(surgeryScopeSentence);
    expect(template.clinicianQuestion).toContain(radicalHysterectomySentence);
    expect(template.clinicianQuestion).toContain(nerveSparingSentence);
    expect(template.clinicianQuestion).toContain(lymphedemaSentence);
    expect(actionNote).toContain("방광이나 직장의 기능부전");
    expect(actionNote).toContain("수술 후 배뇨나 배변 장애");
    expect(actionNote).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(buildSymptomSupportQueueHint(template)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(question).toContain("수술 직후");
    expect(question).toContain("배뇨나 배변 장애");
    expect(question).not.toMatch(
      /진단하세요|치료하세요|수술하세요|신경보존 광범위자궁절제술을 받으세요|림프낭종을 배액하세요|흡입도관|항생제를 복용하세요|도뇨관을 삽입하세요|약을 복용하세요/,
    );
  });

  it("builds a cervical bowel-obstruction contact-threshold question", () => {
    const template = findSymptomSupportTemplate("장폐색과 복부팽만");
    const mixedLateComplicationTemplate = findSymptomSupportTemplate(
      "장폐색·혈변·혈뇨 연락 메모와 복부팽만, 구토, 배변/가스 변화",
    );

    expect(template?.id).toBe("cervical-bowel-obstruction");
    expect(mixedLateComplicationTemplate?.id).toBe("cervical-bowel-obstruction");
    expect(template?.mealNote).toContain("복부팽만");
    expect(template?.mealNote).toContain("배변·가스 배출 변화");
    expect(buildSymptomSupportQuestion(template!, "장폐색")).toContain("6개월 이상");
    expect(buildSymptomSupportQuestion(template!, "장폐색")).toContain("진료팀에 연락");
    expect(buildSymptomSupportQuestion(template!, "장폐색")).toContain(
      "출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
  });

  it("builds a cervical general-warning question from bleeding or discharge keywords", () => {
    const template = findSymptomSupportTemplate("성교 후 출혈과 악취 분비물");

    expect(template?.id).toBe("cervical-general-warning");
    expect(template?.mealNote).toContain("생리기간과의 관계");
    expect(template?.mealNote).toContain("분비물 색·냄새·양");
    expect(buildSymptomSupportQuestion(template!, "성교 후 출혈")).toContain("비정상 질출혈");
    expect(buildSymptomSupportQuestion(template!, "성교 후 출혈")).toContain("진료팀에 연락");
    expect(buildSymptomSupportQuestion(template!, "성교 후 출혈")).toContain(
      "출처: 국가암정보센터 자궁경부암 일반적 증상 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
  });

  it("prioritizes cervical pain wording over the generic pain template", () => {
    expect(findSymptomSupportTemplate("골반 통증과 다리로 뻗치는 통증")?.id).toBe(
      "cervical-general-warning",
    );
    expect(findSymptomSupportTemplate("질건조와 성관계 통증")?.id).toBe(
      "cervical-sexual-health",
    );
    expect(findSymptomSupportTemplate("소변 통증과 혈뇨")?.id).toBe(
      "cervical-urinary-bowel-bleeding",
    );
    expect(findSymptomSupportTemplate("골반 방사선 후 질협착과 무월경")?.id).toBe(
      "cervical-radiation-menopause",
    );
    expect(findSymptomSupportTemplate("질협착만 있음")?.id).toBe("cervical-sexual-health");
  });

  it("prioritizes bleeding warning keywords over common bowel templates", () => {
    expect(findSymptomSupportTemplate("혈변과 변비")?.id).toBe(
      "cervical-urinary-bowel-bleeding",
    );
    expect(findSymptomSupportTemplate("성교 후 출혈과 악취 분비물")?.id).toBe(
      "cervical-general-warning",
    );
    expect(findSymptomSupportTemplate("잇몸출혈과 코피")?.id).toBe("bleeding-warning");
    expect(findSymptomSupportTemplate("검은 대변과 코피")?.id).toBe("bleeding-warning");
    expect(findSymptomSupportTemplate("변비만 있음")?.id).toBe("constipation");
  });

  it("explains whether a matched template can create care queue evidence", () => {
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("혈뇨")!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("장폐색")!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("비정상 질출혈")!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("잇몸출혈")!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("질건조")!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("임신 계획")!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("무월경")!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportQueueHint(findSymptomSupportTemplate("통증점수")!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(
      buildSymptomSupportQueueHint(
        findSymptomSupportTemplate("성문제나 성행위 의문 의료진 상담")!,
      ),
    ).toBe("저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.");
    expect(
      buildSymptomSupportQueueHint(
        findSymptomSupportTemplate("케모포트 삽입부위 붓고 분비물")!,
      ),
    ).toBe("저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.");
  });

  it("builds a cervical sexual-health question from dryness or pain keywords", () => {
    const template = findSymptomSupportTemplate("질건조와 성교통");

    expect(template?.id).toBe("cervical-sexual-health");
    expect(template?.mealNote).toContain("방사선치료 종료 시점");
    expect(template?.mealNote).toContain("통증·출혈 여부");
    expect(buildSymptomSupportQuestion(template!, "질건조")).toContain("성관계 재개 시점");
    expect(buildSymptomSupportQuestion(template!, "질건조")).toContain("국소 치료");
    expect(buildSymptomSupportQuestion(template!, "질건조")).toContain(
      "출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
    );
  });

  it("builds a general cancer-patient sexual-function change question from NCC guidance", () => {
    const overviewSentence =
      "항암화학요법 치료 기간 중에 사용되는 약물의 종류, 치료 기간, 약물의 용량, 환자의 나이, 치료부위에 따라 일시적으로나 영구적으로 성기능의 장애를 경험할 수 있습니다.";
    const personalContextSentence =
      "성기능은 환자의 성별이나 나이, 개인적 성향, 종교, 문화적 가치에 따라 다르게 느낄 수 있으므로 섣불리 단정지을 수는 없으며";
    const categorySentence =
      "성욕 장애, 성적 흥분장애, 오르가즘 장애, 성 통증 장애";
    const template = findSymptomSupportTemplate("암환자 성기능장애 성욕 변화 의료진 상담");
    const actionNote = buildSymptomSupportActionNote(template!);
    const question = buildSymptomSupportQuestion(template!, "성기능장애와 성욕 변화");

    expect(template?.id).toBe("sexual-function-change");
    expect(template?.mealNote).toContain(overviewSentence);
    expect(template?.mealNote).toContain("성적흥미");
    expect(template?.mealNote).toContain("친밀감");
    expect(template?.mealNote).toContain("피로, 건강에 대한 염려, 스트레스");
    expect(template?.clinicianQuestion).toContain(personalContextSentence);
    expect(template?.clinicianQuestion).toContain(categorySentence);
    expect(template?.clinicianQuestion).toContain("배우자와 의료진");
    expect(actionNote).toContain("성욕 변화");
    expect(actionNote).toContain("치료 기간");
    expect(actionNote).toContain(
      "출처: 국가암정보센터 성기능장애 - https://www.cancer.go.kr/lay1/S1T461C462/contents.do",
    );
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(question).toContain("성기능장애와 성욕 변화 기록과 관련해");
    expect(question).toContain("성욕 장애");
    expect(question).toContain("성 통증 장애");
    expect(question).toContain(
      "출처: 국가암정보센터 성기능장애 - https://www.cancer.go.kr/lay1/S1T461C462/contents.do",
    );
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /성생활을 해도 됩니다|성행위를 하세요|피임법을 시행하세요|임신을 피하세요|정자은행을 이용하세요|난자은행을 이용하세요|윤활제를 사용하세요|크림을 바르세요|확장기를 사용하세요|호르몬 대체요법을 받으세요|비뇨기과로 의뢰하세요|배우자에게 반드시 말하세요|진단하세요|치료하세요|처방하세요|회복을 보장/,
    );
  });

  it("builds a sexual-function medical-staff consult-threshold question from NCC guidance", () => {
    const consultHeading = "이런 때에는 의료진과 상의하십시오";
    const template = findSymptomSupportTemplate("성문제나 성행위 의문 의료진 상담");
    const actionNote = buildSymptomSupportActionNote(template!);
    const question = buildSymptomSupportQuestion(template!, "성문제나 성행위 의문");

    expect(template?.id).toBe("sexual-function-consult-threshold");
    expect(template?.mealNote).toContain(consultHeading);
    expect(template?.mealNote).toContain("새롭거나 더 심한 통증");
    expect(template?.mealNote).toContain("출혈");
    expect(template?.mealNote).toContain("발기능력이나 정액량에 변화");
    expect(template?.clinicianQuestion).toContain("성문제나 성행위와 관련된 의문점");
    expect(actionNote).toContain("발기능력이나 정액량");
    expect(actionNote).toContain(
      "출처: 국가암정보센터 성기능장애 극복방법 - https://www.cancer.go.kr/lay1/S1T461C465/contents.do",
    );
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(question).toContain("성문제나 성행위 의문 기록과 관련해");
    expect(question).toContain("새롭거나 더 심한 통증");
    expect(question).toContain("출혈");
    expect(question).toContain(
      "출처: 국가암정보센터 성기능장애 극복방법 - https://www.cancer.go.kr/lay1/S1T461C465/contents.do",
    );
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /성교를 하세요|성행위를 하세요|일주일에 3회|크림과 젤리를 바르세요|확장기를 사용하세요|피임법을 시행하세요|임신을 피하세요|정자은행을 이용하세요|난자은행을 이용하세요|호르몬 대체요법을 받으세요|비뇨기과로 의뢰하세요|진단하세요|치료하세요|처방하세요|자가치료|회복을 보장/,
    );
  });

  it("builds a chemoport physician-or-ER contact-threshold question from NCC guidance", () => {
    const heading =
      "NCC는 다음 항목을 담당의사 상담 또는 응급실 방문 기준으로 제시합니다.";
    const insertionSiteSentence =
      "삽입부위가 빨갛게 붓거나, 아프거나, 냄새가 나거나 분비물이 있을 때";
    const feverSentence = "체온이 38도 이상이 넘을 때";
    const numbPainSentence =
      "삽입부위나 삽입한 쪽의 어깨, 팔이 계속 저리거나 아픈 경우";
    const swellingSentence = "삽입한 쪽의 어깨, 팔, 또는 얼굴이 붓는 경우";
    const blockageSentence =
      "중심정맥관이 막혔다고 의심되는 경우(혈액 역류가 안 되거나 헤파린 주입 시 심하게 저항이 느껴지는 경우 또는 주입이 안 되는 경우, 이 경우 무리하게 힘을 가하면 카테터 손상이 있을 수 있습니다)";
    const template = findSymptomSupportTemplate("케모포트 삽입부위 붓고 분비물");
    const actionNote = buildSymptomSupportActionNote(template!);
    const question = buildSymptomSupportQuestion(
      template!,
      "케모포트 삽입부위 붓고 분비물",
    );

    expect(template?.id).toBe("chemoport-contact-threshold");
    expect(template?.label).toBe("케모포트 연락 기준");
    expect(template?.mealNote).toContain(heading);
    expect(template?.mealNote).toContain(insertionSiteSentence);
    expect(template?.mealNote).toContain(feverSentence);
    expect(template?.mealNote).toContain(numbPainSentence);
    expect(template?.mealNote).toContain(swellingSentence);
    expect(template?.clinicianQuestion).toContain(blockageSentence);
    expect(actionNote).toContain("혈액 역류");
    expect(actionNote).toContain("헤파린 주입 시 심하게 저항");
    expect(actionNote).toContain(
      "출처: 국가암정보센터 케모포트 - https://www.cancer.go.kr/lay1/S1T343C345/contents.do",
    );
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "저장하면 진료 준비 큐에도 근거가 남는 확인 항목입니다.",
    );
    expect(question).toContain("케모포트 삽입부위 붓고 분비물 기록과 관련해");
    expect(question).toContain("삽입부위가 빨갛게 붓거나");
    expect(question).toContain("체온이 38도 이상");
    expect(question).toContain("중심정맥관이 막혔다고 의심");
    expect(question).toContain(
      "출처: 국가암정보센터 케모포트 - https://www.cancer.go.kr/lay1/S1T343C345/contents.do",
    );
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /헤파린을 주입하세요|카테터를 뚫으세요|무리하게 힘을 가하세요|포트를 제거하세요|소독하세요|거즈를 붙이세요|샤워하세요|통목욕하세요|응급실을 방문하세요|응급실을 방문하셔야 합니다|진단하세요|치료하세요|처방하세요|자가수리|스스로 해결/,
    );
  });

  it("builds a cervical-cancer treatment-period diet and supplement-boundary question", () => {
    const noSpecialFoodSentence =
      "자궁경부암 환자가 특별히 피해야 하거나 환자에게 추천하는 음식은 없습니다.";
    const nutritionRestSentence =
      "충분한 영양을 섭취하고 휴식을 취하는 것이 몸의 면역 기능 강화와 투병 생활에 도움이 될 수 있습니다.";
    const bowelFunctionSentence =
      "방사선 치료나 항암화학요법 중에는 장기능이 약해질 가능성이 있으므로 되도록 자극적인 음식은 피합니다.";
    const supplementSentence =
      "민간요법이나 건강보조식품은 과학적으로 효능이 확인되지 않았으며 병원에서 투여하는 약제와 예상할 수 없는 상호작용으로 치료효과가 떨어지거나 부작용 이 커질 수도 있기 때문입니다.";
    const template = findSymptomSupportTemplate("자궁경부암 항암치료 민간요법 건강보조식품");
    const question = buildSymptomSupportQuestion(
      template!,
      "자궁경부암 항암치료 민간요법 건강보조식품",
    );

    expect(template?.id).toBe("cervical-diet-supplement-boundary");
    expect(template?.label).toBe("자궁경부암 식생활·보조식품 상담 준비");
    expect(template?.mealNote).toContain(noSpecialFoodSentence);
    expect(template?.mealNote).toContain(nutritionRestSentence);
    expect(template?.mealNote).toContain("평소 좋아했던 음식");
    expect(template?.mealNote).toContain("식욕을 느낄 때마다 먹은 기록");
    expect(template?.clinicianQuestion).toContain(bowelFunctionSentence);
    expect(template?.clinicianQuestion).toContain(supplementSentence);
    expect(buildSymptomSupportActionNote(template!)).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(question).toContain(
      "자궁경부암 항암치료 민간요법 건강보조식품 기록과 관련해",
    );
    expect(question).toContain("특별히 피해야 하거나");
    expect(question).toContain("장기능이 약해질 가능성");
    expect(question).toContain("예상할 수 없는 상호작용");
    expect(question).toContain(
      "출처: 국가암정보센터 자궁경부암 식생활 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /먹으세요|피하세요|진통제를 복용하세요|민간요법을 시작하세요|건강보조식품을 시작하세요|민간요법을 중단하세요|건강보조식품을 중단하세요|식단을 처방하세요|진단하세요|치료하세요|처방하세요|암을 낫게|완치|면역 기능을 강화합니다|치료효과를 높입니다|재발을 예방합니다/,
    );
  });

  it("builds a treatment-period healthy-eating tips question from official guidance", () => {
    const regularMealSentence =
      "규칙적으로 아침, 점심, 저녁 식사를 하며, 반찬을 골고루 먹습니다.";
    const riceSentence = "밥은 매끼 반 그릇에서 한 그릇 정도 먹고";
    const porridgeSentence = "죽을 먹어야 하는 경우에는 하루 4~5번 이상";
    const proteinSideDishSentence =
      "끼니마다 고기나 생선, 달걀, 두부, 콩, 치즈 등 단백질 반찬을 충분히 곁들입니다.";
    const vegetableSideDishSentence = "채소 반찬은 매끼 두 가지 이상을 충분히 먹습니다.";
    const textureSentence = "씹거나 삼키기 힘든 경우에는 다지거나 갈아서 먹습니다.";
    const dairySentence = "우유와 유제품은 하루 1컵(200ml) 이상 마십니다.";
    const seasoningSentence =
      "양념과 조미료를 적당히 사용하되 너무 맵거나 짜지 않게 요리합니다.";
    const soupDrinkDessertSentence = "국, 음료, 후식은 적당히 먹는 것이 좋습니다.";
    const template = findSymptomSupportTemplate(
      "치료 중 건강식 단백질 반찬 채소 두 가지",
    );

    expect(template?.id).toBe("treatment-healthy-eating-tips");
    expect(template?.label).toBe("치료 중 건강식 기록 상담 준비");
    expect(template?.mealNote).toContain(regularMealSentence);
    expect(template?.mealNote).toContain(riceSentence);
    expect(template?.mealNote).toContain(porridgeSentence);
    expect(template?.mealNote).toContain(proteinSideDishSentence);
    expect(template?.clinicianQuestion).toContain(vegetableSideDishSentence);
    expect(template?.clinicianQuestion).toContain(textureSentence);
    expect(template?.clinicianQuestion).toContain(dairySentence);
    expect(template?.clinicianQuestion).toContain(seasoningSentence);
    expect(template?.clinicianQuestion).toContain(soupDrinkDessertSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportActionNote(template!)).toContain(
      "출처: 국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    const question = buildSymptomSupportQuestion(
      template!,
      "치료 중 건강식 단백질 반찬 채소 두 가지",
    );

    expect(question).toContain("치료 중 건강식 단백질 반찬 채소 두 가지 기록과 관련해");
    expect(question).toContain(proteinSideDishSentence);
    expect(question).toContain(vegetableSideDishSentence);
    expect(question).toContain("영양사와 어떤 기준으로 확인할지");
    expect(question).toContain(
      "출처: 국가암정보센터 치료 중 건강식을 먹는 요령 - https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /먹으세요|반드시 먹어야|식사를 강요하세요|보호자가 강요|식단을 처방하세요|진단하세요|치료하세요|처방하세요|암을 낫게|완치|치료 효과를 높입니다|감염 위험을 감소시킵니다|재발을 예방합니다/,
    );
  });

  it("builds a treatment-period balanced-nutrition boundary question from official guidance", () => {
    const calorieNutrientSentence =
      "암환자에게 식생활이 중요하다는 것은 누구나 압니다. 그러나 대부분의 사람들은 몸에 좋다고 소문난 식품이나 영양소에만 관심을 기울이고, 적정 열량(칼로리)과 필수 영양소의 섭취는 제대로 고려하지 않는 수가 많습니다.";
    const balancedMealSentence =
      "건강식이란 균형 잡힌 식사를 말합니다. 즉, 다양한 음식을 골고루 먹는 것입니다.";
    const noCureFoodSentence = "암을 치유하는 특별한 음식이나 영양소는 없습니다.";
    const pickyEatingSentence =
      "암환자가 몸에 좋다는 특정 식품이나 영양소를 편중해서 섭취하면 일부 영양소는 과잉 상태가 되고 다른 중요한 영양소와 전체 열량은 부족한 상태가 되어, 당초 의도와 달리 환자에게 나쁜 영향을 줄 수 있습니다.";
    const immuneLowSentence =
      "음식을 들기가 전반적으로 힘들고 면역력까지 저하된 경우에는 개별적으로 영양 상담을 받아야 합니다.";
    const wbcFoodSentence = "백혈구 수치를 올리는 특별한 음식은 없습니다.";
    const consultSentence =
      "암환자의 식사와 관련하여 고민이 있다면 의료진, 영양사와 상담하십시오.";
    const template = findSymptomSupportTemplate(
      "백혈구 수치 올리는 특별한 음식 치료 중 영양",
    );

    expect(template?.id).toBe("treatment-balanced-nutrition-boundary");
    expect(template?.label).toBe("치료 중 균형영양·특별음식 상담 준비");
    expect(template?.mealNote).toContain(calorieNutrientSentence);
    expect(template?.mealNote).toContain(balancedMealSentence);
    expect(template?.mealNote).toContain(noCureFoodSentence);
    expect(template?.mealNote).toContain(pickyEatingSentence);
    expect(template?.clinicianQuestion).toContain(immuneLowSentence);
    expect(template?.clinicianQuestion).toContain(wbcFoodSentence);
    expect(template?.clinicianQuestion).toContain(consultSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportActionNote(template!)).toContain(
      "출처: 국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    const question = buildSymptomSupportQuestion(
      template!,
      "백혈구 수치 올리는 특별한 음식 치료 중 영양",
    );

    expect(question).toContain(
      "백혈구 수치 올리는 특별한 음식 치료 중 영양 기록과 관련해",
    );
    expect(question).toContain(noCureFoodSentence);
    expect(question).toContain(wbcFoodSentence);
    expect(question).toContain("의료진, 영양사와 어떤 기준으로 확인할지");
    expect(question).toContain(
      "출처: 국가암정보센터 치료 중 올바르게 식사하기 - https://www.cancer.go.kr/lay1/S1T471C474/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /먹으세요|반드시 먹어야|백혈구를 올립니다|백혈구 수치를 올립니다|면역력을 올립니다|특별한 음식을 처방하세요|식단을 처방하세요|진단하세요|치료하세요|처방하세요|암을 낫게|완치|치료 효과를 높입니다|감염 위험을 감소시킵니다|재발을 예방합니다/,
    );
  });

  it("builds a treatment-period nutrient-role question from official guidance", () => {
    const carbohydrateSentence =
      "탄수화물(carbohydrate)은 우리 몸에 열량을 공급하는 주요 에너지원으로, 이것이 부족하면 기초 체력이 저하하고 피곤해지며 체중이 줄게 됩니다.";
    const proteinSentence =
      "단백질(protein)은 체세포의 주성분으로서 우리 몸을 구성하고 유지하는 역할을 하며, 각종 효소와 호르몬, 항체 등의 성분이 됩니다.";
    const fatSentence =
      "지방(fat)은 탄수화물과 같이 우리 몸에 열량을 공급하는 주요 에너지원으로 참기름, 들기름, 콩기름, 버터 등에 함유되어 있습니다.";
    const vitaminMineralSentence =
      "우리 몸의 생리 기능을 조절하는 대표적인 영양소로 비타민과 무기질(vitamins and minerals)이 있습니다.";
    const waterSentence =
      "물은 중요한 영양소로 생각되지 않는 게 보통이지만, 사실은 혈액과 신체 조직의 핵심적인 성분이면서 영양소와 노폐물을 운반하고 체온을 유지해 주는 등 생명 유지에 필수적인 요소입니다.";
    const waterNeedSentence = "일반적으로 성인은 하루에 6~8컵 정도의 물이 필요합니다.";
    const template = findSymptomSupportTemplate(
      "치료 중 탄수화물 단백질 지방 비타민 무기질 물",
    );

    expect(template?.id).toBe("treatment-nutrient-role-understanding");
    expect(template?.label).toBe("치료 중 영양소 역할 상담 준비");
    expect(template?.mealNote).toContain(carbohydrateSentence);
    expect(template?.mealNote).toContain(proteinSentence);
    expect(template?.mealNote).toContain(fatSentence);
    expect(template?.clinicianQuestion).toContain(vitaminMineralSentence);
    expect(template?.clinicianQuestion).toContain(waterSentence);
    expect(template?.clinicianQuestion).toContain(waterNeedSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportActionNote(template!)).toContain(
      "출처: 국가암정보센터 치료 중 영양소의 이해 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    const question = buildSymptomSupportQuestion(
      template!,
      "치료 중 탄수화물 단백질 지방 비타민 무기질 물",
    );

    expect(question).toContain(
      "치료 중 탄수화물 단백질 지방 비타민 무기질 물 기록과 관련해",
    );
    expect(question).toContain(carbohydrateSentence);
    expect(question).toContain(proteinSentence);
    expect(question).toContain(waterSentence);
    expect(question).toContain("의료진, 영양사와 어떤 기준으로 확인할지");
    expect(question).toContain(
      "출처: 국가암정보센터 치료 중 영양소의 이해 - https://www.cancer.go.kr/lay1/S1T471C473/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /먹으세요|마시세요|반드시 먹어야|반드시 마셔야|식단을 처방하세요|영양소를 처방하세요|진단하세요|치료하세요|처방하세요|암을 낫게|완치|치료 효과를 높입니다|감염 위험을 감소시킵니다|재발을 예방합니다/,
    );
  });

  it("builds a post-treatment eating-recovery question from official guidance", () => {
    const lingeringSideEffectSentence =
      "암 치료로 인한 식사와 관련된 대부분의 부작용 은 치료가 끝나면 서서히 사라집니다.";
    const lingeringSymptomSentence =
      "가끔 식욕 감퇴, 구강 건조증, 입맛의 변화, 연하곤란, 체중 감소 등과 같은 부작용이 계속될 수도 있습니다.";
    const consultSentence = "이 경우에는 의사 선생님과 상의하도록 합니다.";
    const noRecurrenceFoodSentence =
      "여러분이 섭취하는 어떤 음식이 암의 재발 을 막는다는 연구 보고는 없습니다.";
    const specialDietCheckSentence =
      "단, 특별한 식사 조절 여부는 담당 의사 선생님께 확인합니다.";
    const limitSentence =
      "기름, 소금, 설탕, 술, 그리고 염장이나 훈제 식품 등의 섭취를 제한합니다.";
    const cookingSentence =
      "고기는 기름이 적은 부위를 선택하고, 닭고기는 껍질을 제거한 후 이용합니다. 이때 튀기는 요리법보다 끓이거나 삶는 요리법을 이용하도록 합니다.";
    const weightSentence =
      "만약 과체중이라면 식이에서 지방의 양을 줄이고 활동량을 늘리는 방법으로 체중을 줄이는 것을 고려해야 합니다.";
    const template = findSymptomSupportTemplate(
      "치료 후 식욕 감퇴 구강 건조증 입맛 변화 연하곤란 체중 감소",
    );

    expect(template?.id).toBe("post-treatment-eating-recovery");
    expect(template?.label).toBe("치료 후 식생활 회복 상담 준비");
    expect(template?.mealNote).toContain(lingeringSideEffectSentence);
    expect(template?.mealNote).toContain(lingeringSymptomSentence);
    expect(template?.mealNote).toContain(noRecurrenceFoodSentence);
    expect(template?.clinicianQuestion).toContain(consultSentence);
    expect(template?.clinicianQuestion).toContain(specialDietCheckSentence);
    expect(template?.clinicianQuestion).toContain(limitSentence);
    expect(template?.clinicianQuestion).toContain(cookingSentence);
    expect(template?.clinicianQuestion).toContain(weightSentence);
    expect(buildSymptomSupportQueueHint(template!)).toBe(
      "질문 초안에는 이 출처와 URL이 함께 남습니다.",
    );
    expect(buildSymptomSupportActionNote(template!)).toContain(
      "출처: 국가암정보센터 치료후의 식생활 - https://www.cancer.go.kr/lay1/S1T470C476/contents.do",
    );
    const question = buildSymptomSupportQuestion(
      template!,
      "치료 후 식욕 감퇴 구강 건조증 입맛 변화 연하곤란 체중 감소",
    );

    expect(question).toContain(
      "치료 후 식욕 감퇴 구강 건조증 입맛 변화 연하곤란 체중 감소 기록과 관련해",
    );
    expect(question).toContain(lingeringSymptomSentence);
    expect(question).toContain(noRecurrenceFoodSentence);
    expect(question).toContain("담당 의사 선생님께 확인");
    expect(question).toContain(
      "출처: 국가암정보센터 치료후의 식생활 - https://www.cancer.go.kr/lay1/S1T470C476/contents.do",
    );
    expect(template!.safetyNote).toContain("진료 전 확인용");
    expect(`${template?.mealNote}\n${template?.clinicianQuestion}\n${question}`).not.toMatch(
      /먹으세요|마시세요|반드시 먹어야|반드시 마셔야|체중을 줄이세요|활동량을 늘리세요|식단을 처방하세요|진단하세요|치료하세요|처방하세요|암을 낫게|완치|재발을 막습니다|재발을 예방합니다|치료 효과를 높입니다|감염 위험을 감소시킵니다/,
    );
  });

  it("builds a cervical fertility and pregnancy planning question", () => {
    const template = findSymptomSupportTemplate("임신 계획과 가임력");

    expect(template?.id).toBe("cervical-fertility-pregnancy");
    expect(template?.mealNote).toContain("광범위자궁경부절제술");
    expect(template?.mealNote).toContain("산전 진찰");
    expect(buildSymptomSupportQuestion(template!, "임신 계획")).toContain("자궁경관 길이");
    expect(buildSymptomSupportQuestion(template!, "임신 계획")).toContain("유산·조산 위험");
    expect(buildSymptomSupportQuestion(template!, "임신 계획")).toContain(
      "출처: 국가암정보센터 자궁경부암 임신과 출산 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5374",
    );
  });

  it("builds a cervical pelvic-radiation menopause-symptom question", () => {
    const template = findSymptomSupportTemplate("무월경과 안면홍조");

    expect(template?.id).toBe("cervical-radiation-menopause");
    expect(template?.mealNote).toContain("월경 변화");
    expect(template?.mealNote).toContain("성욕 변화");
    expect(template?.mealNote).toContain("질협착");
    expect(buildSymptomSupportQuestion(template!, "무월경과 안면홍조")).toContain(
      "난소부전",
    );
    expect(buildSymptomSupportQuestion(template!, "무월경과 안면홍조")).toContain(
      "폐경 증상",
    );
    expect(buildSymptomSupportQuestion(template!, "무월경과 안면홍조")).toContain(
      "여성호르몬 상담 필요 여부",
    );
    expect(buildSymptomSupportQuestion(template!, "무월경과 안면홍조")).toContain(
      "출처: 국가암정보센터 방사선치료의 부작용 - https://www.cancer.go.kr/lay1/S1T292C294/contents.do",
    );
    expect(template!.safetyNote).toContain("치료 지시가 아니라");
  });

  it("builds a source-backed cancer-pain assessment question", () => {
    const vitalSignSentence =
      "암 환자에게 있어서 통증 은 제 5의 활력 징후라고 할 수 있습니다.";
    const regularAssessmentSentence =
      "그러므로 통증에 대한 정기적인 평가가 필요하며, 극심한 통증을 보이는 환자에 대해서는 응급 상황에 준하는 신속하고 적절한 통증 관리가 이루어져야 합니다.";
    const factorSentence =
      "환자에 따라 통증에 영향을 주는 여러 요인들이 있을 수 있습니다. 통증을 완화시키는 요인은 무엇인지(진통제, 마사지, 휴식, 수면, 냉찜질, 온찜질 등), 통증을 악화시키는 요인은 무엇인지(자세, 기침, 움직임, 배뇨 등)에 대해 의료진에게 자세히 이야기 하도록 합니다.";
    const qualitySentence =
      "통증의 느낌이 어떠한지 자신이 흔히 쓰는 용어로 표현하면 됩니다.";
    const locationSentence =
      "어느 부위에서 통증이 느껴지는지를 말하는 것입니다. 통증 부위가 한 곳 이상일 수 있으므로 환자가 신체의 그림에 표시하는 방법을 사용한다면 의사전달이 쉬울 수 있습니다.";
    const severitySentence =
      "숫자통증등급(numeric rating scale)은 통증의 강도를 숫자 0~10까지 등급을 매겨서 표현할 수 있도록 하는 것입니다.";
    const timingSentence =
      "통증의 시작 시간, 경과, 지속 시간, 지속성 여부 등을 평가합니다.";
    const template = findSymptomSupportTemplate("통증점수와 진통제 효과")!;

    expect(template.id).toBe("pain-management");
    expect(template.mealNote).toContain(vitalSignSentence);
    expect(template.mealNote).toContain(regularAssessmentSentence);
    expect(template.mealNote).toContain(locationSentence);
    expect(template.mealNote).toContain(severitySentence);
    expect(template.mealNote).toContain(timingSentence);
    expect(template.mealNote).toContain("0-10점");
    expect(template.mealNote).toContain("악화·완화 요인");
    expect(template.clinicianQuestion).toContain(factorSentence);
    expect(template.clinicianQuestion).toContain(qualitySentence);
    expect(buildSymptomSupportQuestion(template, "등 통증")).toContain(
      "등 통증 기록과 관련해 환자에 따라 통증에 영향을 주는 여러 요인들이 있을 수 있습니다.",
    );
    expect(buildSymptomSupportQuestion(template, "등 통증")).toContain(
      "출처: 국가암정보센터 통증평가 항목 - https://www.cancer.go.kr/lay1/S1T378C380/contents.do",
    );
    expect(buildSymptomSupportQuestion(template, "등 통증")).not.toMatch(
      /진통제를 증량하세요|마약성 진통제를 복용하세요|응급 처치하세요|진단하세요|치료하세요|약을 처방하세요/,
    );
    expect(template.safetyNote).toContain("치료 지시가 아니라");
  });

  it("builds source-retaining symptom action notes for template-filled symptoms", () => {
    const template = findSymptomSupportTemplate("임신 계획")!;
    const actionNote = buildSymptomSupportActionNote(template);

    expect(actionNote).toContain("산전 진찰");
    expect(actionNote).toContain("치료 지시가 아니라");
    expect(actionNote).toContain(
      "출처: 국가암정보센터 자궁경부암 임신과 출산 - https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5374",
    );
  });

  it("keeps every symptom-support template tied to an official Korean source URL", () => {
    expect(symptomSupportTemplates).toHaveLength(57);
    expect(
      symptomSupportTemplates.every(
        (template) =>
          template.sourceLabel.startsWith("국가암정보센터") &&
          template.sourceUrl.startsWith("https://www.cancer.go.kr/"),
      ),
    ).toBe(true);
    expect(findSymptomSupportTemplate("오심")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C481/contents.do",
    );
    expect(findSymptomSupportTemplate("구토")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C482/contents.do",
    );
    expect(findSymptomSupportTemplate("구토 12시간 이상 지속")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T398C404/contents.do",
    );
    expect(findSymptomSupportTemplate("구강건조")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C485/contents.do",
    );
    expect(findSymptomSupportTemplate("자녀에게 암 설명")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T327C330/contents.do",
    );
    expect(findSymptomSupportTemplate("치료 불안")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T327C329/contents.do",
    );
    expect(findSymptomSupportTemplate("암생존자 디스트레스 자가평가")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T788C790/contents.do",
    );
    expect(findSymptomSupportTemplate("암생존자 불안 신체증상")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T788C791/contents.do",
    );
    expect(findSymptomSupportTemplate("암생존자 수면관리 수면효율")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T748C794/contents.do",
    );
    expect(findSymptomSupportTemplate("암치료 후 슬럼프 울적함 의욕 상실 한 달")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/bbs/S1T668C805/G/54/view.do?article_seq=22077&condition=&cpage=4&keyword=&rn=45&rows=12",
    );
    expect(findSymptomSupportTemplate("암생존자 운동강도 상담")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T748C795/contents.do",
    );
    expect(findSymptomSupportTemplate("소아청소년 암생존자 운동 TOP 신체역량")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T800C801/contents.do",
    );
    expect(
      findSymptomSupportTemplate("소아청소년 암생존자 영양 식생활 BMI 백분위수")?.sourceUrl,
    ).toBe("https://www.cancer.go.kr/lay1/S1T800C802/contents.do");
    expect(
      findSymptomSupportTemplate("소아청소년 암생존자 마음관리 마음 온도계 4점")
        ?.sourceUrl,
    ).toBe("https://www.cancer.go.kr/lay1/S1T800C803/contents.do");
    expect(findSymptomSupportTemplate("암생존자 영양 식생활 균형잡힌 식사")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T748C796/contents.do",
    );
    expect(findSymptomSupportTemplate("암생존자 예방접종 생백신 시점")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(findSymptomSupportTemplate("암생존자 이차암 검진 흡연력")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/bbs/S1T767C750/G/46/view.do?article_seq=22688&condition=&cpage=3&keyword=&rn=33&rows=12",
    );
    expect(findSymptomSupportTemplate("암생존자 직업복귀 근무시간 조정")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T748C798/contents.do",
    );
    expect(findSymptomSupportTemplate("암생존자 가족 통합지지 상담")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T786C841/contents.do",
    );
    expect(findSymptomSupportTemplate("소아청소년 암생존자 학교복귀 지원")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T800C804/contents.do",
    );
    expect(findSymptomSupportTemplate("보완대체요법 약초 영양제 상담")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T365C368/contents.do",
    );
    expect(findSymptomSupportTemplate("암관련 피로 대처")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T420C421/contents.do",
    );
    expect(findSymptomSupportTemplate("입맛 변화")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C484/contents.do",
    );
    expect(findSymptomSupportTemplate("식욕부진")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C480/contents.do",
    );
    expect(findSymptomSupportTemplate("림프부종")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T429C431/contents.do",
    );
    expect(findSymptomSupportTemplate("오한")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T435C439/contents.do",
    );
    expect(findSymptomSupportTemplate("백혈구 감소")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(findSymptomSupportTemplate("체중감소")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C486/contents.do",
    );
    expect(findSymptomSupportTemplate("손발저림")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T458C460/contents.do",
    );
    expect(findSymptomSupportTemplate("피부 발진")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T454C456/contents.do",
    );
    expect(findSymptomSupportTemplate("빈혈")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T440C444/contents.do",
    );
    expect(findSymptomSupportTemplate("잇몸출혈")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T445C448/contents.do",
    );
    expect(findSymptomSupportTemplate("탈모")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T451C453/contents.do",
    );
    expect(findSymptomSupportTemplate("딸꾹질")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T466C468/contents.do",
    );
    expect(findSymptomSupportTemplate("호흡곤란")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T411C415/contents.do",
    );
    expect(findSymptomSupportTemplate("충분한 공기")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T411C414/contents.do",
    );
    expect(findSymptomSupportTemplate("구강함수액")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T390C393/contents.do",
    );
    expect(findSymptomSupportTemplate("기침")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T410C412/contents.do",
    );
    expect(findSymptomSupportTemplate("암환자 성기능장애 성욕 변화 의료진 상담")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T461C462/contents.do",
    );
    expect(findSymptomSupportTemplate("성문제나 성행위 의문 의료진 상담")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T461C465/contents.do",
    );
    expect(findSymptomSupportTemplate("케모포트 삽입부위 붓고 분비물")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T343C345/contents.do",
    );
    expect(
      findSymptomSupportTemplate("자궁경부암 항암치료 민간요법 건강보조식품")?.sourceUrl,
    ).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    );
    expect(
      findSymptomSupportTemplate("백혈구 수치 올리는 특별한 음식 치료 중 영양")?.sourceUrl,
    ).toBe("https://www.cancer.go.kr/lay1/S1T471C474/contents.do");
    expect(findSymptomSupportTemplate("치료 중 건강식 단백질 반찬 채소 두 가지")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T471C475/contents.do",
    );
    expect(
      findSymptomSupportTemplate("치료 중 탄수화물 단백질 지방 비타민 무기질 물")?.sourceUrl,
    ).toBe("https://www.cancer.go.kr/lay1/S1T471C473/contents.do");
    expect(
      findSymptomSupportTemplate(
        "치료 후 식욕 감퇴 구강 건조증 입맛 변화 연하곤란 체중 감소",
      )?.sourceUrl,
    ).toBe("https://www.cancer.go.kr/lay1/S1T470C476/contents.do");
    expect(findSymptomSupportTemplate("질출혈")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
    );
    expect(findSymptomSupportTemplate("혈뇨")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(findSymptomSupportTemplate("광범위 자궁절제술 후 배뇨 장애")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(findSymptomSupportTemplate("장폐색")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C211/cancer/view.do?cancer_seq=4877&menu_seq=4894",
    );
    expect(findSymptomSupportTemplate("성교통")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5373",
    );
    expect(findSymptomSupportTemplate("무월경")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T292C294/contents.do",
    );
    expect(findSymptomSupportTemplate("임신 계획")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=5374",
    );
    expect(findSymptomSupportTemplate("진통제")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T378C380/contents.do",
    );
  });
});
