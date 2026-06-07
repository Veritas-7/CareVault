import { describe, expect, it } from "vitest";
import {
  formatSourceEvidence,
  formatTextWithSourceEvidence,
  parseSourceEvidence,
} from "./sourceEvidence";

describe("sourceEvidence", () => {
  it("splits source-backed text into body, label, and URL", () => {
    expect(
      parseSourceEvidence(
        "성생활 재개 시점을 확인하세요.\n출처: 국가암정보센터 자궁경부암 성생활 - https://www.cancer.go.kr/example",
      ),
    ).toEqual({
      body: "성생활 재개 시점을 확인하세요.",
      sourceLabel: "국가암정보센터 자궁경부암 성생활",
      sourceUrl: "https://www.cancer.go.kr/example",
      sources: [
        {
          sourceLabel: "국가암정보센터 자궁경부암 성생활",
          sourceUrl: "https://www.cancer.go.kr/example",
        },
      ],
    });
  });

  it("splits inline generated source citations at the end of a note", () => {
    expect(
      parseSourceEvidence(
        "복부팽만, 구토, 통증 동반 여부를 기록 출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://www.cancer.go.kr/example?menu_seq=4894",
      ),
    ).toEqual({
      body: "복부팽만, 구토, 통증 동반 여부를 기록",
      sourceLabel: "국가암정보센터 자궁경부암 치료의 부작용",
      sourceUrl: "https://www.cancer.go.kr/example?menu_seq=4894",
      sources: [
        {
          sourceLabel: "국가암정보센터 자궁경부암 치료의 부작용",
          sourceUrl: "https://www.cancer.go.kr/example?menu_seq=4894",
        },
      ],
    });
  });

  it("preserves multiple source lines as evidence instead of leaking raw source text", () => {
    const text = [
      "현재 음식/식단(자몽 주스, 보충제)에 의료진 확인 항목이 포함되어 있습니다.",
      "출처: 질병관리청 국가건강정보포털 식이영양 - https://health.kdca.go.kr/example",
      "출처: 국가암정보센터 보완대체요법 상담 - https://www.cancer.go.kr/complementary",
    ].join("\n");

    expect(parseSourceEvidence(text)).toEqual({
      body: "현재 음식/식단(자몽 주스, 보충제)에 의료진 확인 항목이 포함되어 있습니다.",
      sourceLabel: "질병관리청 국가건강정보포털 식이영양",
      sourceUrl: "https://health.kdca.go.kr/example",
      sources: [
        {
          sourceLabel: "질병관리청 국가건강정보포털 식이영양",
          sourceUrl: "https://health.kdca.go.kr/example",
        },
        {
          sourceLabel: "국가암정보센터 보완대체요법 상담",
          sourceUrl: "https://www.cancer.go.kr/complementary",
        },
      ],
    });
    expect(formatTextWithSourceEvidence(text)).toBe(
      "현재 음식/식단(자몽 주스, 보충제)에 의료진 확인 항목이 포함되어 있습니다. / 근거: 질병관리청 국가건강정보포털 식이영양 (https://health.kdca.go.kr/example); 국가암정보센터 보완대체요법 상담 (https://www.cancer.go.kr/complementary)",
    );
    expect(formatTextWithSourceEvidence(text)).not.toContain("출처:");
  });

  it("formats extracted source evidence as clinic-readable grounds", () => {
    expect(formatSourceEvidence("국가암정보센터 자궁경부암 성생활", "https://example.com")).toBe(
      "근거: 국가암정보센터 자궁경부암 성생활 (https://example.com)",
    );
    expect(
      formatTextWithSourceEvidence(
        "성생활 재개 시점을 확인하세요.\n출처: 국가암정보센터 자궁경부암 성생활 - https://example.com",
      ),
    ).toBe(
      "성생활 재개 시점을 확인하세요. / 근거: 국가암정보센터 자궁경부암 성생활 (https://example.com)",
    );
    expect(
      formatTextWithSourceEvidence(
        "복부팽만 여부를 기록 출처: 국가암정보센터 자궁경부암 치료의 부작용 - https://example.com",
      ),
    ).toBe(
      "복부팽만 여부를 기록 / 근거: 국가암정보센터 자궁경부암 치료의 부작용 (https://example.com)",
    );
  });
});
