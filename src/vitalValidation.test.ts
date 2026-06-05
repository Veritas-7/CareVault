import { describe, expect, it } from "vitest";
import { parseOptionalNumberInput, validateVitalDraft } from "./vitalValidation";

describe("parseOptionalNumberInput", () => {
  it("keeps cleared number inputs empty instead of coercing them to zero", () => {
    expect(parseOptionalNumberInput("")).toBeUndefined();
    expect(parseOptionalNumberInput("   ")).toBeUndefined();
  });

  it("parses numeric input values", () => {
    expect(parseOptionalNumberInput("128")).toBe(128);
    expect(parseOptionalNumberInput("146.5")).toBe(146.5);
  });

  it("rejects non-decimal clinical input strings", () => {
    expect(parseOptionalNumberInput("0x80")).toBeUndefined();
    expect(parseOptionalNumberInput("1e2")).toBeUndefined();
    expect(parseOptionalNumberInput("128mmHg")).toBeUndefined();
  });
});

describe("validateVitalDraft", () => {
  it("rejects missing or non-positive blood pressure values", () => {
    expect(validateVitalDraft({ diastolic: 78, type: "blood-pressure" })).toEqual({
      message: "혈압 수축기와 이완기를 0보다 크게 입력해주세요.",
      type: "error",
    });
    expect(validateVitalDraft({ diastolic: 0, systolic: 128, type: "blood-pressure" })).toEqual({
      message: "혈압 수축기와 이완기를 0보다 크게 입력해주세요.",
      type: "error",
    });
  });

  it("accepts complete positive blood pressure values", () => {
    expect(validateVitalDraft({ diastolic: 78, systolic: 126, type: "blood-pressure" })).toEqual({
      type: "ok",
      values: {
        diastolic: 78,
        systolic: 126,
      },
    });
  });

  it("rejects missing or non-positive glucose values", () => {
    expect(validateVitalDraft({ type: "glucose" })).toEqual({
      message: "혈당 값을 0보다 크게 입력해주세요.",
      type: "error",
    });
    expect(validateVitalDraft({ glucoseMgDl: 0, type: "glucose" })).toEqual({
      message: "혈당 값을 0보다 크게 입력해주세요.",
      type: "error",
    });
  });

  it("accepts and rejects temperature values", () => {
    expect(validateVitalDraft({ type: "temperature" })).toEqual({
      message: "체온 값을 0보다 크게 입력해주세요.",
      type: "error",
    });
    expect(validateVitalDraft({ temperatureC: 0, type: "temperature" })).toEqual({
      message: "체온 값을 0보다 크게 입력해주세요.",
      type: "error",
    });
    expect(validateVitalDraft({ temperatureC: 38.1, type: "temperature" })).toEqual({
      type: "ok",
      values: {
        temperatureC: 38.1,
      },
    });
  });
});
