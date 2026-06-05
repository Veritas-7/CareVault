import { describe, expect, it } from "vitest";
import {
  formatProfileNumberDisplay,
  isProfileNumberField,
  sanitizeProfileNumberInput,
  validateProfileNumberInput,
} from "./profileValidation";

describe("profileValidation", () => {
  it("allows blank profile number drafts while users are editing", () => {
    expect(validateProfileNumberInput("heightCm", "")).toEqual({ type: "ok" });
    expect(validateProfileNumberInput("weightKg", "  ")).toEqual({ type: "ok" });
  });

  it("accepts positive numeric profile values", () => {
    expect(validateProfileNumberInput("age", "56")).toEqual({ type: "ok" });
    expect(validateProfileNumberInput("waistCm", "82.5")).toEqual({ type: "ok" });
  });

  it("rejects zero and negative values with field-specific Korean feedback", () => {
    expect(validateProfileNumberInput("heightCm", "-1")).toEqual({
      message: "키는 0보다 크게 입력해주세요.",
      type: "error",
    });
    expect(validateProfileNumberInput("waistCm", "0")).toEqual({
      message: "허리둘레는 0보다 크게 입력해주세요.",
      type: "error",
    });
  });

  it("rejects malformed number strings", () => {
    expect(validateProfileNumberInput("weightKg", "abc")).toEqual({
      message: "몸무게는 0보다 크게 입력해주세요.",
      type: "error",
    });
  });

  it("identifies profile number fields", () => {
    expect(isProfileNumberField("age")).toBe(true);
    expect(isProfileNumberField("heightCm")).toBe(true);
    expect(isProfileNumberField("name")).toBe(false);
  });

  it("formats profile number displays without dangling units", () => {
    expect(formatProfileNumberDisplay("164", "cm", "키 미입력")).toBe("164cm");
    expect(formatProfileNumberDisplay("", "cm", "키 미입력")).toBe("키 미입력");
    expect(formatProfileNumberDisplay("-1", "cm", "키 미입력")).toBe("키 미입력");
    expect(formatProfileNumberDisplay("0", "세", "나이 미입력")).toBe("나이 미입력");
  });

  it("sanitizes imported profile number values with a fallback", () => {
    expect(sanitizeProfileNumberInput("heightCm", "-1", "164")).toBe("164");
    expect(sanitizeProfileNumberInput("weightKg", "0", "62")).toBe("62");
    expect(sanitizeProfileNumberInput("age", "abc", "56")).toBe("56");
    expect(sanitizeProfileNumberInput("waistCm", "", "82")).toBe("");
    expect(sanitizeProfileNumberInput("waistCm", 83, "82")).toBe("83");
  });
});
