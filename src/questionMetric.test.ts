import { describe, expect, it } from "vitest";
import { buildQuestionListSummary, buildQuestionMetricSummary } from "./questionMetric";

describe("questionMetric", () => {
  it("summarizes open questions by priority and source evidence", () => {
    expect(
      buildQuestionMetricSummary([
        {
          priority: "high",
          question:
            "식전 혈당 목표를 어떻게 조정할까요?\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://www.diabetes.or.kr/example",
          status: "open",
        },
        {
          priority: "next-visit",
          question: "백혈구 재검 필요성을 확인할까요?",
          status: "open",
        },
        {
          priority: "routine",
          question:
            "HPV 백신 가족 안내를 어떻게 설명할까요?\n출처: 질병관리청 국가건강정보포털 자궁경부암 백신 - https://health.kdca.go.kr/example",
          status: "open",
        },
        {
          priority: "high",
          question: "이미 답변된 질문",
          status: "answered",
        },
      ]),
    ).toEqual({
      highPriorityOpenCount: 1,
      nextVisitOpenCount: 1,
      openCount: 3,
      priorityText: "이번 진료 1 · 다음 진료 1 · 일반 1",
      routineOpenCount: 1,
      sourceBackedOpenCount: 2,
      sourceText: "근거 포함 2",
      statusText: "다음 진료 전 확인",
    });
  });

  it("summarizes the empty open-question state", () => {
    expect(
      buildQuestionMetricSummary([
        {
          priority: "high",
          question: "이미 답변된 질문",
          status: "answered",
        },
      ]),
    ).toEqual({
      highPriorityOpenCount: 0,
      nextVisitOpenCount: 0,
      openCount: 0,
      priorityText: "열린 질문 없음",
      routineOpenCount: 0,
      sourceBackedOpenCount: 0,
      sourceText: "근거 질문 없음",
      statusText: "열린 질문 없음",
    });
  });

  it("builds full saved-question list summary chips", () => {
    expect(
      buildQuestionListSummary([
        {
          answer: "",
          priority: "high",
          question:
            "식전 혈당 목표를 어떻게 조정할까요?\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://www.diabetes.or.kr/example",
          status: "open",
        },
        {
          answer: "다음 방문 때 재확인",
          priority: "next-visit",
          question: "백혈구 재검 필요성을 확인할까요?",
          status: "answered",
        },
        {
          answer: "",
          priority: "routine",
          question: "보험 서류는 다음에 확인",
          status: "deferred",
        },
      ]),
    ).toEqual({
      answerMemoCount: 1,
      answeredCount: 1,
      ariaLabel:
        "전체 3개 · 확인 필요 1개 · 답변 완료 1개 · 보류 1개 · 근거 포함 1개 · 답변 메모 포함 1개",
      deferredCount: 1,
      items: [
        { id: "total", label: "전체", value: "3개" },
        { id: "open", label: "확인 필요", value: "1개" },
        { id: "answered", label: "답변 완료", value: "1개" },
        { id: "deferred", label: "보류", value: "1개" },
        { id: "source-backed", label: "근거", value: "포함 1개" },
        { id: "answer-memo", label: "답변 메모", value: "포함 1개" },
      ],
      openCount: 1,
      sourceBackedCount: 1,
      totalCount: 3,
    });
  });

  it("builds an empty saved-question list summary", () => {
    expect(buildQuestionListSummary([])).toEqual({
      answerMemoCount: 0,
      answeredCount: 0,
      ariaLabel: "전체 0개 · 상태 질문 없음 · 근거 없음 · 답변 메모 없음",
      deferredCount: 0,
      items: [
        { id: "total", label: "전체", value: "0개" },
        { id: "empty", label: "상태", value: "질문 없음" },
        { id: "source-backed", label: "근거", value: "없음" },
        { id: "answer-memo", label: "답변 메모", value: "없음" },
      ],
      openCount: 0,
      sourceBackedCount: 0,
      totalCount: 0,
    });
  });
});
