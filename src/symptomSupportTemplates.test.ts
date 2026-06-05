import { describe, expect, it } from "vitest";
import {
  buildSymptomSupportActionNote,
  buildSymptomSupportQuestion,
  buildSymptomSupportQueueHint,
  findSymptomSupportTemplate,
  formatSymptomSupportCitation,
  formatSymptomSupportSource,
  symptomSupportTemplates,
} from "./symptomSupportTemplates";

describe("symptomSupportTemplates", () => {
  it("matches common cancer-treatment side-effect keywords", () => {
    expect(findSymptomSupportTemplate("식사 후 오심이 심함")?.id).toBe("nausea");
    expect(findSymptomSupportTemplate("입안 상처와 구내염")?.id).toBe("mouth-sore");
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
    expect(symptomSupportTemplates).toHaveLength(14);
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
