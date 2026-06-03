import { describe, expect, it } from "vitest";
import { buildCareActionQueue, type CareActionQueueState } from "./careActionQueue";

const state: CareActionQueueState = {
  visits: [
    {
      id: "visit-1",
      date: "2026-06-01",
      hospital: "종양내과",
      reason: "정기 추적",
      summary: "검사 결과 확인",
      plan: "2주 뒤 재검",
      nextDate: "2026-06-15",
    },
  ],
  questions: [
    {
      id: "question-1",
      date: "2026-06-15",
      topic: "식사",
      question: "날음식 제한 기준은?",
      status: "open",
    },
    {
      id: "question-2",
      date: "2026-06-10",
      topic: "완료",
      question: "이미 답변된 질문",
      status: "answered",
    },
  ],
  labResults: [
    {
      id: "lab-1",
      date: "2026-06-03",
      name: "WBC",
      value: "3.4",
      unit: "10^3/uL",
      lower: "4.0",
      upper: "10.0",
      note: "면역저하 질문",
    },
    {
      id: "lab-2",
      date: "2026-06-03",
      name: "PLT",
      value: "210",
      unit: "10^3/uL",
      lower: "150",
      upper: "400",
      note: "",
    },
  ],
  documents: [
    {
      id: "doc-1",
      date: "2026-06-02",
      title: "혈액검사 메모",
      body: "다음 진료 때 확인",
      tags: "혈액검사",
      reviewStatus: "care-question",
      nextAction: "식사 제한 기준 질문",
    },
    {
      id: "doc-2",
      date: "2026-06-02",
      title: "정리 완료 서류",
      body: "",
      tags: "",
      reviewStatus: "done",
      nextAction: "",
    },
  ],
};

describe("careActionQueue", () => {
  it("collects open questions, abnormal labs, active documents, and upcoming visits", () => {
    const actions = buildCareActionQueue(state, "2026-06-03");
    expect(actions.map((action) => action.id)).toEqual([
      "document:doc-1",
      "lab:lab-1",
      "question:question-1",
      "visit:visit-1:2026-06-15",
    ]);
    expect(actions.find((action) => action.id === "lab:lab-1")).toMatchObject({
      label: "기준보다 낮음",
      title: "WBC 3.4 10^3/uL",
    });
  });

  it("drops past visits and respects the requested limit", () => {
    const actions = buildCareActionQueue(
      {
        ...state,
        visits: [{ ...state.visits[0], nextDate: "2026-05-30" }],
      },
      "2026-06-03",
      2,
    );
    expect(actions).toHaveLength(2);
    expect(actions.some((action) => action.source === "visit")).toBe(false);
  });
});
