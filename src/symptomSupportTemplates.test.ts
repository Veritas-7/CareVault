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
    expect(findSymptomSupportTemplate("diarrhea after medication")?.id).toBe("diarrhea");
    expect(findSymptomSupportTemplate("우울과 불면이 계속됨")?.id).toBe("fatigue");
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
    const template = findSymptomSupportTemplate("통증점수와 진통제 효과")!;

    expect(template.id).toBe("pain-management");
    expect(template.mealNote).toContain("0-10점");
    expect(template.mealNote).toContain("악화·완화 요인");
    expect(buildSymptomSupportQuestion(template, "등 통증")).toContain(
      "등 통증 기록과 관련해 통증 강도, 양상, 악화·완화 요인",
    );
    expect(buildSymptomSupportQuestion(template, "등 통증")).toContain("진통제 효과와 부작용");
    expect(buildSymptomSupportQuestion(template, "등 통증")).toContain(
      "출처: 국가암정보센터 통증평가 항목 - https://www.cancer.go.kr/lay1/S1T378C380/contents.do",
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
    expect(symptomSupportTemplates).toHaveLength(18);
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
    expect(findSymptomSupportTemplate("구강건조")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/S1T479C485/contents.do",
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
    expect(findSymptomSupportTemplate("질출혈")?.sourceUrl).toBe(
      "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4888",
    );
    expect(findSymptomSupportTemplate("혈뇨")?.sourceUrl).toBe(
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
