import { describe, expect, it } from "vitest";
import {
  buildImmuneFoodSafetyContext,
  formatImmuneFoodSafetyContextText,
} from "./immuneFoodContext";

describe("immuneFoodContext", () => {
  it("connects a low WBC lab row to immune-low food safety guidance", () => {
    const context = buildImmuneFoodSafetyContext([
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

    expect(context).toMatchObject({
      label: "면역저하 검사 연결",
      labName: "WBC",
      labValueLabel: "2026-06-01 WBC 3.4 10^3/uL",
      lowerLimitLabel: "4.0 10^3/uL",
      labSourceLabel: "서울아산병원 전혈구검사 참고치",
      foodSafetySourceLabel: "국가암정보센터 증상별 식생활 - 면역기능의 저하",
      sourceCount: 2,
    });
    expect(context?.summary).toContain("입력 기준 하한 4.0 10^3/uL보다 낮게 기록");
    expect(context?.summary).toContain("날음식·비살균 식품");
    expect(context?.ariaLabel).toContain("공식 출처 2개");
    expect(formatImmuneFoodSafetyContextText(context)).toContain(
      "WBC 3.4 10^3/uL",
    );
    expect(formatImmuneFoodSafetyContextText(context)).toContain(
      "국가암정보센터 증상별 식생활 - 면역기능의 저하",
    );
  });

  it("uses ANC as the direct infection-risk lab context when it is low", () => {
    const context = buildImmuneFoodSafetyContext([
      {
        date: "2026-06-02",
        name: "ANC",
        value: "0.4",
        unit: "10^3/uL",
        lower: "1.5",
        upper: "",
        note: "",
      },
    ]);

    expect(context).toMatchObject({
      labName: "ANC",
      labSourceLabel: "국가암정보센터 항암 부작용 증상 관리 지침",
      lowerLimitLabel: "1.5 10^3/uL",
      sourceCount: 2,
    });
    expect(context?.summary).toContain("입력 기준 하한 1.5 10^3/uL보다 낮게 기록");
  });

  it("does not create food-safety context for normal or range-missing rows", () => {
    expect(
      buildImmuneFoodSafetyContext([
        {
          date: "2026-06-01",
          name: "WBC",
          value: "5.4",
          unit: "10^3/uL",
          lower: "4.0",
          upper: "10.0",
          note: "",
        },
      ]),
    ).toBeNull();
    expect(
      buildImmuneFoodSafetyContext([
        {
          date: "2026-06-01",
          name: "ANC",
          value: "0.4",
          unit: "10^3/uL",
          lower: "",
          upper: "",
          note: "",
        },
      ]),
    ).toBeNull();
  });

  it("does not create food-safety context from partial lab number text", () => {
    expect(
      buildImmuneFoodSafetyContext([
        {
          date: "2026-06-01",
          name: "WBC",
          value: "3.4 low",
          unit: "10^3/uL",
          lower: "4.0",
          upper: "10.0",
          note: "",
        },
      ]),
    ).toBeNull();
  });

  it("ignores malformed lab dates when selecting immune food safety context", () => {
    const context = buildImmuneFoodSafetyContext([
      {
        date: "2026-06-31",
        name: "ANC",
        value: "0.4",
        unit: "10^3/uL",
        lower: "1.5",
        upper: "",
        note: "깨진 날짜 검사",
      },
      {
        date: "2026-06-01",
        name: "WBC",
        value: "3.4",
        unit: "10^3/uL",
        lower: "4.0",
        upper: "10.0",
        note: "실제 날짜 검사",
      },
    ]);

    expect(context).toMatchObject({
      labName: "WBC",
      labValueLabel: "2026-06-01 WBC 3.4 10^3/uL",
    });
    expect(context?.summary).not.toContain("2026-06-31");
  });
});
