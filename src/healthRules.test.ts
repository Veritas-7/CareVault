import { describe, expect, it } from "vitest";
import {
  assessBloodGlucose,
  assessBloodPressure,
  assessCancerFood,
  calculateBmi,
} from "./healthRules";

describe("healthRules", () => {
  it("classifies adult BMI using CDC categories", () => {
    expect(calculateBmi(170, 65).label).toBe("건강 체중 범위");
    expect(calculateBmi(170, 88).level).toBe("risk");
  });

  it("classifies blood pressure into AHA-style ranges", () => {
    expect(assessBloodPressure(118, 76).label).toBe("정상 혈압 범위");
    expect(assessBloodPressure(132, 84).label).toBe("고혈압 1단계 범위");
    expect(assessBloodPressure(182, 100).label).toBe("고혈압 위기 범위");
  });

  it("classifies diabetes tracking targets by context", () => {
    expect(assessBloodGlucose(126, "before-meal").level).toBe("ok");
    expect(assessBloodGlucose(181, "after-meal").level).toBe("watch");
    expect(assessBloodGlucose(66, "random").label).toBe("저혈당 범위");
  });

  it("flags cancer food support, limit, and clinician-check items", () => {
    expect(assessCancerFood("브로콜리와 현미").level).toBe("ok");
    expect(assessCancerFood("베이컨과 탄산음료").level).toBe("watch");
    expect(assessCancerFood("자몽 주스와 보충제").level).toBe("risk");
  });
});
