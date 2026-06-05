import { describe, expect, it } from "vitest";
import {
  buildQuestionDisplayParts,
  buildQuestionTimelineDisplayParts,
  formatQuestionAnswerMemoDisplay,
} from "./questionDisplay";

describe("questionDisplay", () => {
  it("splits a source-backed saved question into body and evidence display parts", () => {
    expect(
      buildQuestionDisplayParts(
        "성생활 재개 시점을 어떻게 상담할까요?\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/example",
      ),
    ).toEqual({
      body: "성생활 재개 시점을 어떻게 상담할까요?",
      sourceEvidence: "근거: 국가암정보센터 자궁경부암 성생활 (https://www.cancer.go.kr/example)",
      sourceLabel: "국가암정보센터 자궁경부암 성생활",
      sourceUrl: "https://www.cancer.go.kr/example",
    });
  });

  it("keeps ordinary saved questions unchanged without evidence display parts", () => {
    expect(buildQuestionDisplayParts("백혈구 수치가 낮을 때 외식 기준을 확인할까요?")).toEqual({
      body: "백혈구 수치가 낮을 때 외식 기준을 확인할까요?",
      sourceEvidence: "",
      sourceLabel: "",
      sourceUrl: "",
    });
  });

  it("builds timeline details without leaking source lines into the paragraph", () => {
    expect(
      buildQuestionTimelineDisplayParts(
        "혈당 목표를 어떻게 조정할까요?\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://www.diabetes.or.kr/example",
        "확인 필요",
      ),
    ).toEqual({
      body: "혈당 목표를 어떻게 조정할까요?",
      detail: "확인 필요: 혈당 목표를 어떻게 조정할까요?",
      sourceEvidence: "근거: 대한당뇨병학회 당뇨병 관리 목표 (https://www.diabetes.or.kr/example)",
      sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
      sourceUrl: "https://www.diabetes.or.kr/example",
    });
  });

  it("formats saved answer memo display text without preserving padding", () => {
    expect(formatQuestionAnswerMemoDisplay("  검사 전날부터 기록하기  ")).toBe(
      "검사 전날부터 기록하기",
    );
    expect(formatQuestionAnswerMemoDisplay("   ")).toBe("");
    expect(formatQuestionAnswerMemoDisplay(undefined)).toBe("");
  });
});
