import { describe, expect, it } from "vitest";
import { labPresets, resolveLabPreset } from "./labPresets";

describe("labPresets", () => {
  it("keeps cancer-care CBC and diabetes presets available", () => {
    expect(labPresets.map((preset) => preset.id)).toEqual([
      "wbc",
      "anc",
      "hemoglobin",
      "platelets",
      "a1c",
      "fasting-glucose",
    ]);
  });

  it("resolves sex-specific hemoglobin ranges without changing other fields", () => {
    expect(resolveLabPreset("hemoglobin", "female")).toMatchObject({
      name: "Hgb",
      lower: "12",
      upper: "16",
      unit: "g/dL",
    });
    expect(resolveLabPreset("hemoglobin", "male")).toMatchObject({
      lower: "13",
      upper: "18",
    });
  });

  it("returns null for unknown preset ids", () => {
    expect(resolveLabPreset("custom-test")).toBeNull();
  });
});
