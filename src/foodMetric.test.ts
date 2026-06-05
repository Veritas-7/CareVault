import { describe, expect, it } from "vitest";
import { assessCancerFood } from "./healthRules";
import { buildFoodPanelSummary } from "./foodMetric";

describe("foodMetric", () => {
  it("builds cancer-food panel summary chips from matched categories and official sources", () => {
    expect(
      buildFoodPanelSummary(assessCancerFood("브로콜리, 베이컨, 자몽 주스, 생굴").matches),
    ).toEqual({
      ariaLabel: "매칭 4개 · 식단 후보 1개 · 제한/주의 1개 · 진료팀 확인 2개 · 공식 출처 3개",
      careTeamCount: 2,
      itemCount: 4,
      items: [
        { id: "total", label: "매칭", value: "4개" },
        { id: "support", label: "식단 후보", value: "1개" },
        { id: "limit", label: "제한/주의", value: "1개" },
        { id: "care-team", label: "진료팀 확인", value: "2개" },
        { id: "source-backed", label: "공식 출처", value: "3개" },
      ],
      limitCount: 1,
      sourceCount: 3,
      supportCount: 1,
    });
  });

  it("builds an empty cancer-food panel summary", () => {
    expect(buildFoodPanelSummary([])).toEqual({
      ariaLabel: "매칭 없음 · 분류 대기 · 공식 출처 없음",
      careTeamCount: 0,
      itemCount: 0,
      items: [
        { id: "total", label: "매칭", value: "없음" },
        { id: "empty", label: "분류", value: "대기" },
        { id: "source-backed", label: "공식 출처", value: "없음" },
      ],
      limitCount: 0,
      sourceCount: 0,
      supportCount: 0,
    });
  });

  it("includes lab-linked immune food context sources in the source count", () => {
    expect(
      buildFoodPanelSummary(assessCancerFood("브로콜리, 생굴").matches, [
        "서울아산병원 전혈구검사 참고치",
        "국가암정보센터 증상별 식생활 - 면역기능의 저하",
      ]),
    ).toMatchObject({
      ariaLabel: "매칭 2개 · 식단 후보 1개 · 진료팀 확인 1개 · 공식 출처 3개",
      sourceCount: 3,
    });
  });
});
