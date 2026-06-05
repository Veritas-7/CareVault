import { describe, expect, it } from "vitest";
import { formatLabReferenceRangeLabel, getLabRangeSourceLabel } from "./exportSourceLabels";

describe("exportSourceLabels", () => {
  it("formats lab reference ranges for direct exports", () => {
    expect(formatLabReferenceRangeLabel("4.0", "10.0", "10^3/uL")).toBe("4.0~10.0 10^3/uL");
    expect(formatLabReferenceRangeLabel("50", "", "mg/dL")).toBe("50 mg/dL 이상");
    expect(formatLabReferenceRangeLabel("", "139", "mg/dL")).toBe("139 mg/dL 이하");
    expect(formatLabReferenceRangeLabel("", "", "mg/dL")).toBe("");
  });

  it("labels whether a lab range comes from user input or is missing", () => {
    expect(getLabRangeSourceLabel("50", "")).toBe("사용자 입력 기준 범위");
    expect(getLabRangeSourceLabel("", "")).toBe("기준 범위 없음");
  });
});
