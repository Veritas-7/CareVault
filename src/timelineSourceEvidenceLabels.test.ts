import { describe, expect, it } from "vitest";

import {
  formatTimelineSourceEvidenceLabel,
  formatTimelineSourceEvidenceOpenLabel,
} from "./timelineSourceEvidenceLabels";

describe("timelineSourceEvidenceLabels", () => {
  it("includes row position so repeated same-day evidence links stay distinct", () => {
    const base = {
      date: "2026-06-04",
      title: "HPV 백신 가족 안내 · 3/10",
      sourceEvidenceTypeLabel: "기록",
      sourceLabel: "질병관리청 국가건강정보포털 자궁경부암 백신",
    };

    expect(formatTimelineSourceEvidenceLabel({ ...base, position: 1 })).toBe(
      "2026-06-04 최근 타임라인 1번째 HPV 백신 가족 안내 · 3/10 기록 근거 질병관리청 국가건강정보포털 자궁경부암 백신",
    );
    expect(formatTimelineSourceEvidenceOpenLabel({ ...base, position: 2 })).toBe(
      "2026-06-04 최근 타임라인 2번째 HPV 백신 가족 안내 · 3/10 기록 근거 질병관리청 국가건강정보포털 자궁경부암 백신 열기",
    );
  });

  it("uses the visible date fallback in evidence labels for malformed restored dates", () => {
    expect(
      formatTimelineSourceEvidenceLabel({
        date: "2026-06-31",
        position: 3,
        title: "성생활 상담 질문",
        sourceEvidenceTypeLabel: "질문",
        sourceLabel: "국가암정보센터 자궁경부암 성생활",
      }),
    ).toBe(
      "날짜 미입력 최근 타임라인 3번째 성생활 상담 질문 질문 근거 국가암정보센터 자궁경부암 성생활",
    );
  });
});
