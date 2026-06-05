import { describe, expect, it } from "vitest";
import {
  buildLabPresetPreview,
  formatLabPresetNoteWithSource,
  formatLabPresetSourceEvidence,
  formatLabPresetSexSyncStatusLabel,
  labPresets,
  resolveLabPreset,
  resolveLabPresetSexChange,
  resolveLabPresetSexChangeDraft,
} from "./labPresets";

describe("labPresets", () => {
  it("keeps cancer-care CBC and diabetes presets available", () => {
    expect(labPresets.map((preset) => preset.id)).toEqual([
      "wbc",
      "rbc",
      "hematocrit",
      "anc",
      "hemoglobin",
      "platelets",
      "a1c",
      "fasting-glucose",
      "postprandial-glucose",
      "bun",
      "creatinine",
      "egfr",
      "uacr",
      "albumin",
      "total-protein",
      "calcium",
      "phosphate",
      "uric-acid",
      "sodium",
      "potassium",
      "total-cholesterol",
      "ldl-cholesterol",
      "hdl-cholesterol",
      "triglyceride",
      "ggt",
      "ast",
      "alt",
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
      upper: "17",
    });
  });

  it("keeps Korean diabetes and lipid helper ranges available", () => {
    expect(resolveLabPreset("anc", "other")).toMatchObject({
      lower: "1.5",
      sourceLabel: "국가암정보센터 항암 부작용 증상 관리 지침",
      unit: "10^3/uL",
    });
    expect(resolveLabPreset("anc", "other")?.sourceUrl).toContain(
      "d402e586-c237-419d-ae6f-da36d3b97109.pdf",
    );
    expect(resolveLabPreset("postprandial-glucose", "other")).toMatchObject({
      name: "PP2 glucose",
      upper: "139",
      unit: "mg/dL",
    });
    expect(resolveLabPreset("bun", "other")).toMatchObject({
      lower: "10",
      upper: "26",
      unit: "mg/dL",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("creatinine", "other")).toMatchObject({
      lower: "0.7",
      upper: "1.4",
      unit: "mg/dL",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("bun", "other")?.sourceUrl).toContain("cntnts_sn=5531");
    expect(resolveLabPreset("egfr", "other")).toMatchObject({
      lower: "60",
      upper: "",
      unit: "mL/min/1.73m²",
      sourceLabel: "질병관리청 국가건강정보포털 만성콩팥병",
    });
    expect(resolveLabPreset("egfr", "other")?.sourceUrl).toContain("cntnts_sn=5457");
    expect(resolveLabPreset("uacr", "other")).toMatchObject({
      name: "UACR",
      upper: "29",
      unit: "mg/g",
      sourceLabel: "질병관리청 국가건강정보포털 만성콩팥병",
    });
    expect(resolveLabPreset("uacr", "other")?.sourceUrl).toContain("cntnts_sn=5457");
    expect(resolveLabPreset("albumin", "other")).toMatchObject({
      name: "Albumin",
      lower: "3.3",
      upper: "5.2",
      unit: "g/dL",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("albumin", "other")?.sourceUrl).toContain("cntnts_sn=5531");
    expect(resolveLabPreset("total-protein", "other")).toMatchObject({
      name: "Total protein",
      lower: "6.0",
      upper: "8.0",
      unit: "g/dL",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("total-protein", "other")?.sourceUrl).toContain("cntnts_sn=5531");
    expect(resolveLabPreset("calcium", "other")).toMatchObject({
      name: "Calcium",
      lower: "8.8",
      upper: "10.5",
      unit: "mg/dL",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("calcium", "other")?.sourceUrl).toContain("cntnts_sn=5531");
    expect(resolveLabPreset("phosphate", "other")).toMatchObject({
      name: "Phosphate",
      lower: "2.5",
      upper: "4.5",
      unit: "mg/dL",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("phosphate", "other")?.sourceUrl).toContain("cntnts_sn=5531");
    expect(resolveLabPreset("uric-acid", "other")).toMatchObject({
      name: "Uric acid",
      lower: "3",
      upper: "7",
      unit: "mg/dL",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("uric-acid", "other")?.sourceUrl).toContain("cntnts_sn=5531");
    expect(resolveLabPreset("sodium", "other")).toMatchObject({
      lower: "135",
      upper: "145",
      unit: "mmol/L",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("potassium", "other")).toMatchObject({
      lower: "3.5",
      upper: "5.5",
      unit: "mmol/L",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("hdl-cholesterol", "female")).toMatchObject({
      lower: "50",
      unit: "mg/dL",
    });
    expect(resolveLabPreset("hdl-cholesterol", "male")).toMatchObject({
      lower: "40",
    });
    expect(resolveLabPreset("triglyceride", "other")).toMatchObject({
      upper: "149",
    });
    expect(resolveLabPreset("ggt", "female")).toMatchObject({
      lower: "8",
      upper: "35",
      unit: "IU/L",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(resolveLabPreset("ggt", "male")).toMatchObject({
      lower: "11",
      upper: "63",
    });
    expect(resolveLabPreset("ggt", "female")?.sourceUrl).toContain("cntnts_sn=5531");
    expect(resolveLabPreset("ast", "other")).toMatchObject({
      lower: "0",
      upper: "40",
      unit: "IU/L",
      sourceLabel: "질병관리청 국가건강정보포털 간기능검사",
    });
    expect(resolveLabPreset("alt", "other")).toMatchObject({
      lower: "0",
      upper: "40",
      unit: "IU/L",
      sourceLabel: "질병관리청 국가건강정보포털 간기능검사",
    });
    expect(resolveLabPreset("ast", "other")?.sourceUrl).toContain("cntnts_sn=5444");
  });

  it("formats selected preset previews with sex applicability and range labels", () => {
    expect(buildLabPresetPreview("hemoglobin", "female")).toMatchObject({
      label: "Hgb 헤모글로빈",
      rangeLabel: "12-16 g/dL",
      applicabilityLabel: "여성 기준 적용",
      sourceLabel: "서울아산병원 혈색소 검사 참고치",
    });
    expect(buildLabPresetPreview("hemoglobin", "female")?.sourceUrl).toContain("managementId=119");
    expect(buildLabPresetPreview("hdl-cholesterol", "male")).toMatchObject({
      rangeLabel: "40 mg/dL 이상",
      applicabilityLabel: "남성 기준 적용",
      applicabilityDetail:
        "현재 프로필의 남성 기준을 채웁니다. 사용자가 범위나 메모를 직접 고친 뒤에는 성별 변경이 그 값을 덮어쓰지 않습니다.",
      sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
    });
    expect(buildLabPresetPreview("hdl-cholesterol", "male")?.sourceUrl).toContain(
      "diabetes.or.kr",
    );
    expect(buildLabPresetPreview("wbc", "other")).toMatchObject({
      rangeLabel: "4.0-10.0 10^3/uL",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "서울아산병원 전혈구검사 참고치",
    });
    expect(buildLabPresetPreview("rbc", "female")).toMatchObject({
      label: "RBC 적혈구수",
      rangeLabel: "4.0-5.4 10^6/uL",
      applicabilityLabel: "여성 기준 적용",
      sourceLabel: "서울아산병원 전혈구검사 참고치",
    });
    expect(buildLabPresetPreview("rbc", "male")).toMatchObject({
      rangeLabel: "4.2-6.3 10^6/uL",
      applicabilityLabel: "남성 기준 적용",
    });
    expect(buildLabPresetPreview("hematocrit", "female")).toMatchObject({
      label: "Hct 적혈구용적률",
      rangeLabel: "36-46 %",
      applicabilityLabel: "여성 기준 적용",
      sourceLabel: "서울아산병원 전혈구검사 참고치",
    });
    expect(buildLabPresetPreview("hematocrit", "male")).toMatchObject({
      rangeLabel: "38-53 %",
      applicabilityLabel: "남성 기준 적용",
    });
    expect(buildLabPresetPreview("anc", "other")).toMatchObject({
      rangeLabel: "1.5 10^3/uL 이상",
      sourceLabel: "국가암정보센터 항암 부작용 증상 관리 지침",
    });
    expect(buildLabPresetPreview("creatinine", "female")).toMatchObject({
      rangeLabel: "0.7-1.4 mg/dL",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("egfr", "female")).toMatchObject({
      rangeLabel: "60 mL/min/1.73m² 이상",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 만성콩팥병",
    });
    expect(buildLabPresetPreview("uacr", "female")).toMatchObject({
      rangeLabel: "29 mg/g 이하",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 만성콩팥병",
    });
    expect(buildLabPresetPreview("albumin", "female")).toMatchObject({
      rangeLabel: "3.3-5.2 g/dL",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("total-protein", "female")).toMatchObject({
      rangeLabel: "6.0-8.0 g/dL",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("calcium", "female")).toMatchObject({
      rangeLabel: "8.8-10.5 mg/dL",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("phosphate", "female")).toMatchObject({
      rangeLabel: "2.5-4.5 mg/dL",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("uric-acid", "female")).toMatchObject({
      rangeLabel: "3-7 mg/dL",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("potassium", "female")).toMatchObject({
      rangeLabel: "3.5-5.5 mmol/L",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("ggt", "female")).toMatchObject({
      rangeLabel: "8-35 IU/L",
      applicabilityLabel: "여성 기준 적용",
      sourceLabel: "질병관리청 국가건강정보포털 임상 화학 검사",
    });
    expect(buildLabPresetPreview("ast", "female")).toMatchObject({
      rangeLabel: "0-40 IU/L",
      applicabilityLabel: "성인 공통 입력 보조값",
      sourceLabel: "질병관리청 국가건강정보포털 간기능검사",
    });
    expect(buildLabPresetPreview("custom-test", "other")).toBeNull();
  });

  it("explains common versus sex-specific preset refresh behavior in previews", () => {
    expect(buildLabPresetPreview("total-cholesterol", "female")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. 총콜레스테롤·LDL·TG 같은 공통 지질 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.",
    });
    expect(buildLabPresetPreview("hdl-cholesterol", "female")).toMatchObject({
      applicabilityLabel: "여성 기준 적용",
      applicabilityDetail:
        "현재 프로필의 여성 기준을 채웁니다. 사용자가 범위나 메모를 직접 고친 뒤에는 성별 변경이 그 값을 덮어쓰지 않습니다.",
    });
    expect(buildLabPresetPreview("hdl-cholesterol", "other")).toMatchObject({
      applicabilityLabel: "성별 미지정: 기본 보조값 적용",
      applicabilityDetail:
        "성별 미지정 기본값을 채웁니다. 프로필 성별을 여성 또는 남성으로 바꾸면 Hgb/RBC/Hct/HDL/GGT 같은 성별 프리셋의 범위와 자동 메모 기준만 갱신될 수 있습니다.",
    });
    expect(buildLabPresetPreview("ast", "female")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. AST/ALT 같은 성인 공통 간기능 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.",
    });
    expect(buildLabPresetPreview("bun", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. BUN/Cr/eGFR/UACR 같은 성인 공통 신기능 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.",
    });
    expect(buildLabPresetPreview("egfr", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. BUN/Cr/eGFR/UACR 같은 성인 공통 신기능 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.",
    });
    expect(buildLabPresetPreview("uacr", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. BUN/Cr/eGFR/UACR 같은 성인 공통 신기능 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.",
    });
    expect(buildLabPresetPreview("albumin", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. 혈청 알부민 같은 성인 공통 단백·영양/간기능 보조 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.",
    });
    expect(buildLabPresetPreview("total-protein", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. 총단백 같은 성인 공통 단백·영양/간기능 보조 프리셋은 알부민, 간·신장, 영양, 염증, 탈수 맥락과 결과지 기준을 함께 확인하세요.",
    });
    expect(buildLabPresetPreview("calcium", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. 칼슘 같은 성인 공통 골·신장·영양 보조 프리셋은 알부민, 신장 기능, 비타민D, 뼈 전이 암 맥락과 결과지 기준을 함께 확인하세요.",
    });
    expect(buildLabPresetPreview("phosphate", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. 인산 같은 성인 공통 골·신장·전해질 보조 프리셋은 칼슘, 비타민D, 부갑상선, 신장 기능, 영양 맥락과 결과지 기준을 함께 확인하세요.",
    });
    expect(buildLabPresetPreview("uric-acid", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "기본 3-7 mg/dL 참고 범위를 채우되, KDCA는 남성이 여성보다 약간 높을 수 있다고 설명합니다. 결과지 성별 기준과 진료팀 기준을 우선하고 프로필 성별 변경은 이 값을 자동 변경하지 않습니다.",
    });
    expect(buildLabPresetPreview("sodium", "male")).toMatchObject({
      applicabilityLabel: "성인 공통 입력 보조값",
      applicabilityDetail:
        "성별과 관계없이 같은 참고 범위를 채웁니다. Na/K 같은 성인 공통 전해질 프리셋은 프로필 성별을 바꿔도 자동 범위가 달라지지 않습니다.",
    });
  });

  it("keeps source labels attached to every lab preset preview", () => {
    for (const preset of labPresets) {
      const preview = buildLabPresetPreview(preset.id, "female");

      expect(preview?.sourceLabel).toBeTruthy();
      expect(preview?.sourceUrl).toBeTruthy();
    }

    expect(buildLabPresetPreview("a1c", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 당뇨병",
    );
    expect(buildLabPresetPreview("triglyceride", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 이상지질혈증 관리",
    );
    expect(buildLabPresetPreview("ggt", "female")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("bun", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("egfr", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 만성콩팥병",
    );
    expect(buildLabPresetPreview("uacr", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 만성콩팥병",
    );
    expect(buildLabPresetPreview("albumin", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("total-protein", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("calcium", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("phosphate", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("uric-acid", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("sodium", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(buildLabPresetPreview("ast", "other")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 간기능검사",
    );
  });

  it("formats preset source evidence for notes that get saved with the lab draft", () => {
    const hgbPreset = resolveLabPreset("hemoglobin", "male");
    const ancPreset = resolveLabPreset("anc", "other");
    const hdlPreset = resolveLabPreset("hdl-cholesterol", "female");
    const ggtPreset = resolveLabPreset("ggt", "female");
    const astPreset = resolveLabPreset("ast", "other");
    const bunPreset = resolveLabPreset("bun", "other");
    const egfrPreset = resolveLabPreset("egfr", "other");
    const uacrPreset = resolveLabPreset("uacr", "other");
    const albuminPreset = resolveLabPreset("albumin", "other");
    const totalProteinPreset = resolveLabPreset("total-protein", "other");
    const calciumPreset = resolveLabPreset("calcium", "other");
    const phosphatePreset = resolveLabPreset("phosphate", "other");
    const uricAcidPreset = resolveLabPreset("uric-acid", "other");
    const sodiumPreset = resolveLabPreset("sodium", "other");
    const wbcPreset = resolveLabPreset("wbc", "other");
    const rbcPreset = resolveLabPreset("rbc", "female");
    const hematocritPreset = resolveLabPreset("hematocrit", "male");

    expect(ancPreset && formatLabPresetSourceEvidence(ancPreset)).toContain(
      "출처: 국가암정보센터 항암 부작용 증상 관리 지침 - https://",
    );
    expect(hgbPreset && formatLabPresetSourceEvidence(hgbPreset)).toContain(
      "출처: 서울아산병원 혈색소 검사 참고치 - https://",
    );
    expect(hdlPreset && formatLabPresetSourceEvidence(hdlPreset)).toContain(
      "출처: 대한당뇨병학회 당뇨병 관리 목표 - https://",
    );
    expect(ggtPreset && formatLabPresetSourceEvidence(ggtPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(bunPreset && formatLabPresetSourceEvidence(bunPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(egfrPreset && formatLabPresetSourceEvidence(egfrPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 만성콩팥병 - https://",
    );
    expect(uacrPreset && formatLabPresetSourceEvidence(uacrPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 만성콩팥병 - https://",
    );
    expect(albuminPreset && formatLabPresetSourceEvidence(albuminPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(totalProteinPreset && formatLabPresetSourceEvidence(totalProteinPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(calciumPreset && formatLabPresetSourceEvidence(calciumPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(phosphatePreset && formatLabPresetSourceEvidence(phosphatePreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(uricAcidPreset && formatLabPresetSourceEvidence(uricAcidPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(sodiumPreset && formatLabPresetSourceEvidence(sodiumPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 임상 화학 검사 - https://",
    );
    expect(astPreset && formatLabPresetSourceEvidence(astPreset)).toContain(
      "출처: 질병관리청 국가건강정보포털 간기능검사 - https://",
    );
    expect(wbcPreset && formatLabPresetSourceEvidence(wbcPreset)).toContain(
      "출처: 서울아산병원 전혈구검사 참고치 - https://",
    );
    expect(rbcPreset && formatLabPresetSourceEvidence(rbcPreset)).toContain(
      "출처: 서울아산병원 전혈구검사 참고치 - https://",
    );
    expect(hematocritPreset && formatLabPresetSourceEvidence(hematocritPreset)).toContain(
      "출처: 서울아산병원 전혈구검사 참고치 - https://",
    );
    expect(hdlPreset && formatLabPresetNoteWithSource(hdlPreset)).toContain(
      "여성 50 mg/dL 이상",
    );
    expect(hdlPreset && formatLabPresetNoteWithSource(hdlPreset)).toContain(
      "출처: 대한당뇨병학회 당뇨병 관리 목표",
    );
    expect(ancPreset && formatLabPresetNoteWithSource(ancPreset)).toContain(
      "ANC 0.5 미만과 발열",
    );
    expect(ancPreset && formatLabPresetNoteWithSource(ancPreset)).toContain(
      "출처: 국가암정보센터 항암 부작용 증상 관리 지침",
    );
    expect(ggtPreset && formatLabPresetNoteWithSource(ggtPreset)).toContain(
      "GGT는 남성 11-63 IU/L, 여성 8-35 IU/L",
    );
    expect(bunPreset && formatLabPresetNoteWithSource(bunPreset)).toContain(
      "BUN은 10-26 mg/dL",
    );
    expect(sodiumPreset && formatLabPresetNoteWithSource(sodiumPreset)).toContain(
      "나트륨은 135-145 mmol/L",
    );
    expect(totalProteinPreset && formatLabPresetNoteWithSource(totalProteinPreset)).toContain(
      "총단백은 6.0-8.0 g/dL",
    );
    expect(calciumPreset && formatLabPresetNoteWithSource(calciumPreset)).toContain(
      "칼슘은 8.8-10.5 mg/dL",
    );
    expect(phosphatePreset && formatLabPresetNoteWithSource(phosphatePreset)).toContain(
      "성인 인산은 2.5-4.5 mg/dL",
    );
    expect(uricAcidPreset && formatLabPresetNoteWithSource(uricAcidPreset)).toContain(
      "요산은 3-7 mg/dL",
    );
    expect(astPreset && formatLabPresetNoteWithSource(astPreset)).toContain(
      "AST는 0-40 IU/L",
    );
    expect(rbcPreset && formatLabPresetNoteWithSource(rbcPreset, "여성 기준 적용")).toContain(
      "RBC는 남성 420만-630만/μL, 여성 400만-540만/μL",
    );
    expect(rbcPreset && formatLabPresetNoteWithSource(rbcPreset, "여성 기준 적용")).toContain(
      "적용 기준: 여성 기준 적용",
    );
    expect(
      hematocritPreset && formatLabPresetNoteWithSource(hematocritPreset, "남성 기준 적용"),
    ).toContain("Hct는 남성 38-53%, 여성 36-46%");
    expect(hgbPreset && formatLabPresetNoteWithSource(hgbPreset, "남성 기준 적용")).toContain(
      "출처: 서울아산병원 혈색소 검사 참고치",
    );
    expect(hgbPreset && formatLabPresetNoteWithSource(hgbPreset, "남성 기준 적용")).toContain(
      "적용 기준: 남성 기준 적용",
    );
    expect(hdlPreset && formatLabPresetNoteWithSource(hdlPreset, "여성 기준 적용")).toContain(
      "적용 기준: 여성 기준 적용",
    );
    expect(ggtPreset && formatLabPresetNoteWithSource(ggtPreset, "여성 기준 적용")).toContain(
      "적용 기준: 여성 기준 적용",
    );
  });

  it("refreshes sex-specific preset ranges only while the draft still matches the preset", () => {
    expect(
      resolveLabPresetSexChange("hemoglobin", "female", "male", {
        name: "Hgb",
        unit: "g/dL",
        lower: "12",
        upper: "16",
      }),
    ).toMatchObject({
      lower: "13",
      upper: "17",
    });

    expect(
      resolveLabPresetSexChange("hemoglobin", "female", "male", {
        name: "Hgb",
        unit: "g/dL",
        lower: "11.5",
        upper: "16",
      }),
    ).toBeNull();

    expect(
      resolveLabPresetSexChange("rbc", "female", "male", {
        name: "RBC",
        unit: "10^6/uL",
        lower: "4.0",
        upper: "5.4",
      }),
    ).toMatchObject({
      lower: "4.2",
      upper: "6.3",
    });

    expect(
      resolveLabPresetSexChange("hematocrit", "female", "male", {
        name: "Hct",
        unit: "%",
        lower: "36",
        upper: "46",
      }),
    ).toMatchObject({
      lower: "38",
      upper: "53",
    });

    expect(
      resolveLabPresetSexChange("ggt", "female", "male", {
        name: "GGT",
        unit: "IU/L",
        lower: "8",
        upper: "35",
      }),
    ).toMatchObject({
      lower: "11",
      upper: "63",
    });

    expect(
      resolveLabPresetSexChange("hdl-cholesterol", "female", "male", {
        name: "HDL-C",
        unit: "mg/dL",
        lower: "50",
        upper: "",
      }),
    ).toMatchObject({
      lower: "40",
      upper: "",
    });

    expect(
      resolveLabPresetSexChange("hdl-cholesterol", "female", "male", {
        name: "HDL-C",
        unit: "mg/dL",
        lower: "55",
        upper: "",
      }),
    ).toBeNull();
  });

  it("formats exact status feedback when profile sex refreshes a selected preset", () => {
    expect(formatLabPresetSexSyncStatusLabel("hdl-cholesterol", "male")).toBe(
      "HDL 콜레스테롤 남성 기준으로 갱신",
    );
    expect(formatLabPresetSexSyncStatusLabel("hemoglobin", "female")).toBe(
      "Hgb 헤모글로빈 여성 기준으로 갱신",
    );
    expect(formatLabPresetSexSyncStatusLabel("rbc", "male")).toBe(
      "RBC 적혈구수 남성 기준으로 갱신",
    );
    expect(formatLabPresetSexSyncStatusLabel("hematocrit", "female")).toBe(
      "Hct 적혈구용적률 여성 기준으로 갱신",
    );
    expect(formatLabPresetSexSyncStatusLabel("ggt", "other")).toBe(
      "GGT 감마지티피 성별 미지정 기본값으로 갱신",
    );
  });

  it("refreshes auto-filled sex-specific preset notes without overwriting custom notes", () => {
    const femaleHdl = resolveLabPreset("hdl-cholesterol", "female");
    const femaleHdlNote = femaleHdl
      ? formatLabPresetNoteWithSource(femaleHdl, "여성 기준 적용")
      : "";

    expect(
      resolveLabPresetSexChangeDraft("hdl-cholesterol", "female", "male", {
        name: "HDL-C",
        unit: "mg/dL",
        lower: "50",
        upper: "",
        note: femaleHdlNote,
      }),
    ).toMatchObject({
      lower: "40",
      upper: "",
      note: expect.stringContaining("적용 기준: 남성 기준 적용"),
    });

    expect(
      resolveLabPresetSexChangeDraft("hdl-cholesterol", "female", "male", {
        name: "HDL-C",
        unit: "mg/dL",
        lower: "50",
        upper: "",
        note: femaleHdlNote,
      })?.note,
    ).not.toContain("적용 기준: 여성 기준 적용");

    expect(
      resolveLabPresetSexChangeDraft("hdl-cholesterol", "female", "male", {
        name: "HDL-C",
        unit: "mg/dL",
        lower: "50",
        upper: "",
        note: "내 병원 결과지 기준으로 직접 확인",
      }),
    ).toMatchObject({
      lower: "40",
      note: "내 병원 결과지 기준으로 직접 확인",
    });
  });

  it("returns null for unknown preset ids", () => {
    expect(resolveLabPreset("custom-test")).toBeNull();
  });
});
