import { describe, expect, it } from "vitest";
import { buildCareActionVisibleDetailParts } from "./careActionVisibleDetail";

describe("careActionVisibleDetail", () => {
  it("splits URL-backed vital evidence out of the visible care action body", () => {
    expect(
      buildCareActionVisibleDetailParts(
        "아침 안정 후 측정 / 한국 성인 남녀 공통 기준 고혈압 전단계입니다. / 근거: 질병관리청 국가건강정보포털 고혈압 (https://health.kdca.go.kr/example)",
      ),
    ).toEqual({
      body: "아침 안정 후 측정 / 한국 성인 남녀 공통 기준 고혈압 전단계입니다.",
      evidenceLinks: [
        {
          sourceLabel: "질병관리청 국가건강정보포털 고혈압",
          sourceUrl: "https://health.kdca.go.kr/example",
        },
      ],
    });
  });

  it("splits multiple parenthesized cervical screening evidence links in order", () => {
    expect(
      buildCareActionVisibleDetailParts(
        "국가암검진 대상 기준 해당: 20세 이상 여성은 2년 간격 대상입니다. (근거: 국가암정보센터 국가암검진 대상자 선정 및 통보 (https://www.cancer.go.kr/select); 국가암정보센터 국가암검진 검진주기 및 검진방법 (https://www.cancer.go.kr/cycle))",
      ),
    ).toEqual({
      body: "국가암검진 대상 기준 해당: 20세 이상 여성은 2년 간격 대상입니다.",
      evidenceLinks: [
        {
          sourceLabel: "국가암정보센터 국가암검진 대상자 선정 및 통보",
          sourceUrl: "https://www.cancer.go.kr/select",
        },
        {
          sourceLabel: "국가암정보센터 국가암검진 검진주기 및 검진방법",
          sourceUrl: "https://www.cancer.go.kr/cycle",
        },
      ],
    });
  });

  it("leaves details without URL-backed evidence unchanged", () => {
    expect(buildCareActionVisibleDetailParts("진료 때 재확인")).toEqual({
      body: "진료 때 재확인",
      evidenceLinks: [],
    });
    expect(buildCareActionVisibleDetailParts("메모 / 근거: 검사실 결과지 기준 우선")).toEqual({
      body: "메모 / 근거: 검사실 결과지 기준 우선",
      evidenceLinks: [],
    });
  });
});
