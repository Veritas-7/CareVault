import { describe, expect, it } from "vitest";
import { assessCancerFood } from "./healthRules";
import { buildImmuneFoodSafetyContext } from "./immuneFoodContext";
import {
  buildFoodQuestionButtonLabels,
  buildFoodQuestionDraft,
  formatFoodQuestionDraftReadyStatus,
  formatFoodQuestionDraftUnavailableStatus,
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
    const input = {
      assessment: assessCancerFood("브로콜리, 생굴, 자몽 주스"),
      foodQuery: "브로콜리, 생굴, 자몽 주스",
      immuneContext,
    };
    const draft = buildFoodQuestionDraft(input);

    expect(draft).toMatchObject({
      priority: "high",
      topic: "식단·음식 안전",
    });
    expect(draft?.question).toContain("2026-06-01 WBC 3.4 10^3/uL");
    expect(draft?.question).toContain("브로콜리, 생굴, 자몽 주스");
    expect(draft?.question).toContain("날음식·비살균 식품");
    expect(draft?.question).toContain("30분 이상 상온 운반");
    expect(draft?.question).toContain("냉장 보관");
    expect(draft?.question).toContain("남은 음식 3~4일");
    expect(draft?.question).toContain("조리 위생");
    expect(draft?.question).toContain("외식보다 직접 조리");
    expect(draft?.question).toContain("생굴: 면역저하 시 익히지 않은 음식 주의");
    expect(draft?.question).toContain("자몽: 약물 상호작용 확인 필요");
    expect(draft?.question).toContain("검사 근거: 서울아산병원 전혈구검사 참고치");
    expect(draft?.question).toContain(
      "출처: 국가암정보센터 증상별 식생활 - 면역기능의 저하 - https://cancer.go.kr/lay1/S1T479C489/contents.do",
    );
    expect(draft?.question).not.toContain("먹지 마세요");
    expect(draft?.question).not.toContain("치료하세요");
    expect(draft ? formatFoodQuestionDraftReadyStatus(input, draft) : "").toBe(
      "음식 판단 질문 초안 준비됨 · 식단·음식 안전 · 우선순위 이번 진료 우선 · 입력 브로콜리, 생굴, 자몽 주스 · 일치 3개 · 검사 연결 2026-06-01 WBC 3.4 10^3/uL · 근거 4개",
    );

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
    expect(draft?.question).toContain(
      "출처: 국가암정보센터 보완대체요법 상담 - https://www.cancer.go.kr/",
    );

    const copied = formatQuestionClipboardText({
      answer: "",
      date: "2026-06-15",
      priority: draft?.priority,
      question: draft?.question ?? "",
      status: "open",
      topic: draft?.topic ?? "",
    });

    expect(copied).toContain("근거: 질병관리청 국가건강정보포털 식이영양");
    expect(copied).toContain("국가암정보센터 보완대체요법 상담");
    expect(copied).not.toContain("출처: 국가암정보센터 보완대체요법 상담");
  });

  it("returns null for an empty or unclassified food check", () => {
    const emptyInput = {
      assessment: assessCancerFood(""),
      foodQuery: "",
      immuneContext: null,
    };
    const unclassifiedInput = {
      assessment: assessCancerFood("파인애플"),
      foodQuery: "파인애플",
      immuneContext: null,
    };

    expect(buildFoodQuestionDraft(emptyInput)).toBeNull();
    expect(formatFoodQuestionDraftUnavailableStatus(emptyInput)).toBe(
      "음식 판단 질문 초안 준비 실패 · 입력 음식 입력 없음 · 일치 0개 · 검사 연결 없음 · 근거 0개",
    );
    expect(buildFoodQuestionDraft(unclassifiedInput)).toBeNull();
    expect(formatFoodQuestionDraftUnavailableStatus(unclassifiedInput)).toBe(
      "음식 판단 질문 초안 준비 실패 · 입력 파인애플 · 일치 0개 · 검사 연결 없음 · 근거 0개",
    );
  });

  it("builds a non-risk replacement food question with source-backed wording", () => {
    const input = {
      assessment: assessCancerFood("흰쌀밥"),
      foodQuery: "흰쌀밥",
      immuneContext: null,
    };
    const draft = buildFoodQuestionDraft(input);

    expect(draft).toMatchObject({
      priority: "next-visit",
      topic: "식단·음식 안전",
    });
    expect(draft?.sourceCount).toBe(1);
    expect(draft?.question).toContain("현재 음식/식단(흰쌀밥)에 공식 식단 대체 예시가 포함되어 있습니다.");
    expect(draft?.question).toContain("섭취 빈도, 양, 대체 후보를 진료팀 기준으로 어떻게 확인하면 좋을까요?");
    expect(draft?.question).toContain(
      "흰쌀밥: 자궁경부암 실천지침 식이섬유 증가 대체 전 예시",
    );
    expect(draft?.question).toContain(
      "출처: 국가암정보센터 자궁경부암 실천지침 식생활 - https://www.cancer.go.kr/download.do",
    );
    expect(draft?.question).not.toContain("의료진 확인 항목");
    expect(draft?.question).not.toContain("먹지 마세요");
    expect(draft ? formatFoodQuestionDraftReadyStatus(input, draft) : "").toBe(
      "음식 판단 질문 초안 준비됨 · 식단·음식 안전 · 우선순위 다음 진료 · 입력 흰쌀밥 · 일치 1개 · 검사 연결 없음 · 근거 1개",
    );
  });

  it("requires a typed food query before low lab context can create a clinician question", () => {
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
    const emptyInput = {
      assessment: assessCancerFood(""),
      foodQuery: "   ",
      immuneContext,
    };
    const unclassifiedInput = {
      assessment: assessCancerFood("파인애플"),
      foodQuery: "파인애플",
      immuneContext,
    };
    const unclassifiedDraft = buildFoodQuestionDraft(unclassifiedInput);

    expect(buildFoodQuestionDraft(emptyInput)).toBeNull();
    expect(formatFoodQuestionDraftUnavailableStatus(emptyInput)).toBe(
      "음식 판단 질문 초안 준비 실패 · 입력 음식 입력 없음 · 일치 0개 · 검사 연결 2026-06-01 WBC 3.4 10^3/uL · 근거 2개",
    );
    expect(unclassifiedDraft).toMatchObject({
      priority: "high",
      topic: "식단·음식 안전",
    });
    expect(unclassifiedDraft?.question).toContain("현재 음식/식단(파인애플)");
    expect(unclassifiedDraft?.question).toContain("검사 근거: 서울아산병원 전혈구검사 참고치");
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
