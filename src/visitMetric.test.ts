import { describe, expect, it } from "vitest";
import { buildVisitPanelSummary } from "./visitMetric";

describe("visitMetric", () => {
  it("builds visit panel summary chips from upcoming appointments and planned notes", () => {
    expect(
      buildVisitPanelSummary(
        [
          {
            date: "2026-06-01",
            hospital: "서울암센터",
            id: "visit-1",
            nextDate: "2026-06-05",
            plan: "검사 결과 질문",
            reason: "항암 후 추적",
            summary: "",
          },
          {
            date: "2026-06-02",
            hospital: "내분비내과",
            id: "visit-2",
            nextDate: "2026-06-20",
            plan: "",
            reason: "혈당 상담",
            summary: "식전 혈당 확인",
          },
          {
            date: "2026-05-20",
            hospital: "지난 진료",
            id: "visit-3",
            nextDate: "2026-05-25",
            plan: "",
            reason: "과거",
            summary: "",
          },
        ],
        "2026-06-03",
      ),
    ).toEqual({
      ariaLabel: "전체 3개 · 다가오는 일정 2개 · 14일 이내 1개 · 요약/계획 2개",
      items: [
        { id: "total", label: "전체", value: "3개" },
        { id: "upcoming", label: "다가오는 일정", value: "2개" },
        { id: "soon", label: "14일 이내", value: "1개" },
        { id: "plan", label: "요약/계획", value: "2개" },
      ],
      planCount: 2,
      reminderWindowCount: 1,
      totalCount: 3,
      upcomingCount: 2,
    });
  });

  it("builds an empty visit panel summary", () => {
    expect(buildVisitPanelSummary([], "2026-06-03")).toEqual({
      ariaLabel: "전체 0개 · 다가오는 일정 없음 · 14일 이내 없음 · 요약/계획 없음",
      items: [
        { id: "total", label: "전체", value: "0개" },
        { id: "upcoming", label: "다가오는 일정", value: "없음" },
        { id: "soon", label: "14일 이내", value: "없음" },
        { id: "plan", label: "요약/계획", value: "없음" },
      ],
      planCount: 0,
      reminderWindowCount: 0,
      totalCount: 0,
      upcomingCount: 0,
    });
  });
});
