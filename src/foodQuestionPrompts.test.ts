import { describe, expect, it } from "vitest";
import { assessCancerFood } from "./healthRules";
import { buildImmuneFoodSafetyContext } from "./immuneFoodContext";
import {
  buildFoodQuestionButtonLabels,
  buildFoodQuestionDraft,
} from "./foodQuestionPrompts";
import { formatQuestionClipboardText } from "./questionClipboard";

describe("foodQuestionPrompts", () => {
  it("builds a source-backed immune-low food safety clinician question", () => {
    const immuneContext = buildImmuneFoodSafetyContext([
      {
        date: "2026-06-01",
        name: "WBC",
        value: "3.4",
        unit: "10^3/uL",
        lower: "4.0",
        upper: "10.0",
        note: "면역저하 식품 안전 질문과 연결",
      },
    ]);
    const draft = buildFoodQuestionDraft({
      assessment: assessCancerFood("브로콜리, 생굴, 자몽 주스"),
      foodQuery: "브로콜리, 생굴, 자몽 주스",
      immuneContext,
    });

    expect(draft).toMatchObject({
      priority: "high",
      topic: "식단·음식 안전",
    });
    expect(draft?.question).toContain("2026-06-01 WBC 3.4 10^3/uL");
    expect(draft?.question).toContain("브로콜리, 생굴, 자몽 주스");
    expect(draft?.question).toContain("날음식·비살균 식품");
    expect(draft?.question).toContain("생굴: 면역저하 시 익히지 않은 음식 주의");
    expect(draft?.question).toContain("자몽: 약물 상호작용 확인 필요");
    expect(draft?.question).toContain("검사 근거: 서울아산병원 전혈구검사 참고치");
    expect(draft?.question).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(draft?.question).not.toContain("먹지 마세요");
    expect(draft?.question).not.toContain("치료하세요");

    const copied = formatQuestionClipboardText({
      answer: "",
      date: "2026-06-15",
      priority: draft?.priority,
      question: draft?.question ?? "",
      status: "open",
      topic: draft?.topic ?? "",
    });
    expect(copied).toContain(
      "근거: 국가암정보센터 증상별 식생활 - 면역기능의 저하 (https://cancer.go.kr/lay1/S1T479C489/contents.do)",
    );
    expect(copied).not.toContain("출처: 국가암정보센터 증상별 식생활");
  });

  it("builds a clinician-check food question without low lab context", () => {
    const draft = buildFoodQuestionDraft({
      assessment: assessCancerFood("자몽 주스, 보충제"),
      foodQuery: "자몽 주스, 보충제",
      immuneContext: null,
    });

    expect(draft).toMatchObject({
      priority: "high",
      topic: "식단·음식 안전",
    });
    expect(draft?.question).toContain("자몽 주스, 보충제");
    expect(draft?.question).toContain("약물 상호작용이나 치료 상호작용");
    expect(draft?.question).toContain("자몽: 약물 상호작용 확인 필요");
    expect(draft?.question).toContain("보충제: 치료 상호작용 확인 필요");
    expect(draft?.question).toContain(
      "출처: 질병관리청 국가건강정보포털 식이영양 - https://health.kdca.go.kr/",
    );
  });

  it("returns null for an empty or unclassified food check", () => {
    expect(
      buildFoodQuestionDraft({
        assessment: assessCancerFood(""),
        foodQuery: "",
        immuneContext: null,
      }),
    ).toBeNull();
    expect(
      buildFoodQuestionDraft({
        assessment: assessCancerFood("흰쌀밥"),
        foodQuery: "흰쌀밥",
        immuneContext: null,
      }),
    ).toBeNull();
  });

  it("builds accessible food question button labels with evidence scope", () => {
    expect(buildFoodQuestionButtonLabels(3)).toEqual({
      ariaLabel: "음식 판단 진료 질문 초안 만들기 · 근거 3개 포함",
      title: "음식 판단 진료 질문 초안 만들기 · 근거 3개 포함",
      visibleLabel: "질문 초안",
    });
    expect(buildFoodQuestionButtonLabels(0).ariaLabel).toBe(
      "음식 판단 진료 질문 초안 만들기",
    );
  });
});
