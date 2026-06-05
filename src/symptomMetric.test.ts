import { describe, expect, it } from "vitest";
import { buildSymptomPanelSummary } from "./symptomMetric";

describe("symptomMetric", () => {
  it("builds saved-symptom panel summary chips from severity, evidence, and queue candidates", () => {
    expect(
      buildSymptomPanelSummary([
        {
          action: "진료팀 연락 기준 확인",
          body: "밤새 통증 지속",
          severity: 8,
          symptom: "골반통",
        },
        {
          action:
            "체온 38도 이상이면 연락 기준 확인\n출처: 국가암정보센터 감염 의료진 상담 기준 - https://www.cancer.go.kr/example",
          body: "오한 동반",
          severity: 5,
          symptom: "발열",
        },
        {
          action: "다음 진료 때 확인",
          body: "수면 후 완화",
          severity: 2,
          symptom: "피로",
        },
      ]),
    ).toEqual({
      ariaLabel: "전체 3개 · 고위험 1개 · 관찰 1개 · 안정 1개 · 근거 포함 1개 · 큐 후보 2개",
      highSeverityCount: 1,
      items: [
        { id: "total", label: "전체", value: "3개" },
        { id: "high", label: "고위험", value: "1개" },
        { id: "watch", label: "관찰", value: "1개" },
        { id: "stable", label: "안정", value: "1개" },
        { id: "source-backed", label: "근거", value: "포함 1개" },
        { id: "queue-candidate", label: "큐 후보", value: "2개" },
      ],
      queueCandidateCount: 2,
      sourceBackedCount: 1,
      stableSeverityCount: 1,
      totalCount: 3,
      watchSeverityCount: 1,
    });
  });

  it("builds an empty saved-symptom panel summary", () => {
    expect(buildSymptomPanelSummary([])).toEqual({
      ariaLabel: "전체 0개 · 상태 기록 없음 · 근거 없음 · 큐 후보 없음",
      highSeverityCount: 0,
      items: [
        { id: "total", label: "전체", value: "0개" },
        { id: "empty", label: "상태", value: "기록 없음" },
        { id: "source-backed", label: "근거", value: "없음" },
        { id: "queue-candidate", label: "큐 후보", value: "없음" },
      ],
      queueCandidateCount: 0,
      sourceBackedCount: 0,
      stableSeverityCount: 0,
      totalCount: 0,
      watchSeverityCount: 0,
    });
  });
});
