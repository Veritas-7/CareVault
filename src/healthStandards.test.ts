import { describe, expect, it } from "vitest";
import {
  buildDashboardMetricStandardEvidence,
  buildHealthStandardCoverageLines,
  buildHealthStandardRangeFilterSummary,
  buildHealthStandardSexApplicabilityBadge,
  buildHealthStandardSourceLinkLabels,
  buildProfileMetricSexStandardChips,
  buildProfileSexStandardNotes,
  buildVitalStandardQuestionDraft,
  buildVitalStandardRangeLines,
  buildVitalStandardRangeSections,
  filterVitalStandardRangeSections,
  feverInfectionStandardQuestionDraftActionLabel,
  feverInfectionStandardSymptomDraftActionLabel,
  formatDashboardMetricStandardClipboardText,
  formatDashboardMetricStandardCompactSummary,
  formatDashboardMetricStandardCopyDescription,
  formatDashboardMetricStandardCopyStatus,
  formatHealthStandardRangeFilterCopyDescription,
  formatHealthStandardRangeFilterCopyStatus,
  formatHealthStandardsClipboardText,
  formatDashboardMetricStandardNote,
  formatHealthStandardCoverage,
  formatHealthStandardSource,
  formatProfileMetricSexStandardClipboardText,
  formatProfileMetricSexStandardCopyDescription,
  formatProfileMetricSexStandardCopyStatus,
  formatProfileWaistStandardNote,
  formatVitalInputStandardHelp,
  formatVitalSavePreviewLabel,
  getHealthStandardCoverage,
  getImplementedStandardCount,
  healthStandardRangeFilterOptions,
  healthStandardStatusLabel,
  isExternalHealthStandardSource,
  koreanHealthStandardApplicabilitySummary,
  koreanHealthStandardCoverage,
  koreanHealthStandardUseBoundary,
} from "./healthStandards";

describe("healthStandards", () => {
  it("keeps implemented Korean screening standards explicit", () => {
    expect(koreanHealthStandardCoverage.map((item) => item.id)).toEqual([
      "bmi",
      "waist",
      "blood-pressure",
      "low-blood-pressure",
      "glucose-care",
      "hypoglycemia",
      "marked-hyperglycemia",
      "glucose-screening",
      "a1c-fpg-pp2",
      "infection-fever",
      "anc-infection-risk",
      "platelet-bleeding-risk",
      "kidney-function",
      "egfr",
      "albuminuria",
      "electrolytes",
      "lipids-common",
      "hdl",
      "ggt",
      "liver-enzymes",
      "serum-albumin",
      "calcium",
      "phosphate",
      "uric-acid",
      "hemoglobin",
      "cbc",
      "lab-ranges",
    ]);
    expect(getImplementedStandardCount()).toBe(8);
  });

  it("separates full assessment rules from input helpers and user-entered lab ranges", () => {
    const statusById = Object.fromEntries(
      koreanHealthStandardCoverage.map((item) => [item.id, item.status]),
    );

    expect(statusById.bmi).toBe("implemented");
    expect(statusById.waist).toBe("implemented");
    expect(statusById["blood-pressure"]).toBe("implemented");
    expect(statusById["low-blood-pressure"]).toBe("implemented");
    expect(statusById["hypoglycemia"]).toBe("implemented");
    expect(statusById["marked-hyperglycemia"]).toBe("implemented");
    expect(statusById["glucose-screening"]).toBe("implemented");
    expect(statusById["a1c-fpg-pp2"]).toBe("input-helper");
    expect(statusById["infection-fever"]).toBe("input-helper");
    expect(statusById["anc-infection-risk"]).toBe("input-helper");
    expect(statusById["platelet-bleeding-risk"]).toBe("input-helper");
    expect(statusById["kidney-function"]).toBe("input-helper");
    expect(statusById.egfr).toBe("input-helper");
    expect(statusById.albuminuria).toBe("input-helper");
    expect(statusById.electrolytes).toBe("input-helper");
    expect(statusById["lipids-common"]).toBe("input-helper");
    expect(statusById.hdl).toBe("input-helper");
    expect(statusById.ggt).toBe("input-helper");
    expect(statusById["liver-enzymes"]).toBe("input-helper");
    expect(statusById["serum-albumin"]).toBe("input-helper");
    expect(statusById.calcium).toBe("input-helper");
    expect(statusById.phosphate).toBe("input-helper");
    expect(statusById["uric-acid"]).toBe("input-helper");
    expect(statusById.hemoglobin).toBe("input-helper");
    expect(statusById.cbc).toBe("input-helper");
    expect(statusById["lab-ranges"]).toBe("user-range-required");
    expect(healthStandardStatusLabel["user-range-required"]).toBe("사용자 기준 우선");
  });

  it("keeps fever infection standard shortcut action labels reusable", () => {
    expect(feverInfectionStandardSymptomDraftActionLabel).toBe(
      "체온·감염 연락 기준 증상 기록 초안 만들기",
    );
    expect(feverInfectionStandardQuestionDraftActionLabel).toBe(
      "체온·감염 연락 기준 진료 질문 초안 만들기",
    );
  });

  it("keeps source labels attached to every displayed standard", () => {
    expect(koreanHealthStandardCoverage.every((item) => item.sourceLabel && item.sourceUrl)).toBe(
      true,
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "bmi")?.sourceLabel).toBe(
      "대한비만학회 비만 진료지침 2022",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "glucose-care")?.sourceLabel).toBe(
      "대한당뇨병학회 당뇨병 관리 목표",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "glucose-care")?.sourceUrl).toBe(
      "https://www.diabetes.or.kr/general/info/treat/treat_01.php",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "hypoglycemia")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 급성 합병증_저혈당",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "hypoglycemia")?.sourceUrl).toContain(
      "cntnts_sn=2350",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "marked-hyperglycemia")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 고혈당",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "marked-hyperglycemia")?.sourceUrl).toContain(
      "cntnts_sn=5304",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "low-blood-pressure")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 저혈압",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "low-blood-pressure")?.sourceUrl).toContain(
      "cntnts_sn=5259",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "lipids-common")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 이상지질혈증 관리",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "lipids-common")?.sourceUrl).toContain(
      "thtimt_cntnts_sn=124",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "hdl")?.sourceLabel).toBe(
      "대한당뇨병학회 당뇨병 관리 목표",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "ggt")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "ggt")?.sourceUrl).toContain(
      "cntnts_sn=5531",
    );
    expect(
      koreanHealthStandardCoverage.find((item) => item.id === "kidney-function")?.sourceLabel,
    ).toBe("질병관리청 국가건강정보포털 임상 화학 검사");
    expect(
      koreanHealthStandardCoverage.find((item) => item.id === "kidney-function")?.sourceUrl,
    ).toContain("cntnts_sn=5531");
    expect(koreanHealthStandardCoverage.find((item) => item.id === "egfr")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 만성콩팥병",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "egfr")?.sourceUrl).toContain(
      "cntnts_sn=5457",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "albuminuria")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 만성콩팥병",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "albuminuria")?.sourceUrl).toContain(
      "cntnts_sn=5457",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "electrolytes")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "electrolytes")?.sourceUrl).toContain(
      "cntnts_sn=5531",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "liver-enzymes")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 간기능검사",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "liver-enzymes")?.sourceUrl).toContain(
      "cntnts_sn=5444",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "serum-albumin")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "serum-albumin")?.sourceUrl).toContain(
      "cntnts_sn=5531",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "calcium")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "calcium")?.sourceUrl).toContain(
      "cntnts_sn=5531",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "phosphate")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "phosphate")?.sourceUrl).toContain(
      "cntnts_sn=5531",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "uric-acid")?.sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "uric-acid")?.sourceUrl).toContain(
      "cntnts_sn=5531",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "hemoglobin")?.sourceLabel).toBe(
      "서울아산병원 혈색소 검사 참고치",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "hemoglobin")?.sourceUrl).toContain(
      "managementId=119",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "cbc")?.sourceLabel).toBe(
      "서울아산병원 전혈구검사 참고치",
    );
    expect(koreanHealthStandardCoverage.find((item) => item.id === "cbc")?.sourceUrl).toContain(
      "managementId=126",
    );
    expect(
      koreanHealthStandardCoverage.find((item) => item.id === "infection-fever")?.sourceUrl,
    ).toContain("S1T435C439");
    expect(koreanHealthStandardCoverage.find((item) => item.id === "anc-infection-risk")?.sourceLabel).toBe(
      "국가암정보센터 항암 부작용 증상 관리 지침",
    );
    expect(
      koreanHealthStandardCoverage.find((item) => item.id === "anc-infection-risk")?.sourceUrl,
    ).toContain("d402e586-c237-419d-ae6f-da36d3b97109.pdf");
    expect(koreanHealthStandardCoverage.find((item) => item.id === "platelet-bleeding-risk")?.sourceLabel).toBe(
      "국가암정보센터 항암 부작용 증상 관리 지침",
    );
    expect(
      koreanHealthStandardCoverage.find((item) => item.id === "platelet-bleeding-risk")?.sourceUrl,
    ).toContain("d402e586-c237-419d-ae6f-da36d3b97109.pdf");
  });

  it("states whether Korean standards are sex-specific or common", () => {
    const applicabilityById = Object.fromEntries(
      koreanHealthStandardCoverage.map((item) => [item.id, item.sexApplicability]),
    );

    expect(applicabilityById["blood-pressure"]).toBe("성인 남녀 공통");
    expect(applicabilityById["low-blood-pressure"]).toBe("성인 남녀 공통");
    expect(applicabilityById["glucose-care"]).toBe("성인 남녀 공통");
    expect(applicabilityById.hypoglycemia).toBe(
      "성인 남녀 공통 · 70 mg/dL 미만과 증상·의식상태 확인",
    );
    expect(applicabilityById["marked-hyperglycemia"]).toBe(
      "성인 남녀 공통 · 250 mg/dL 이상과 탈수·의식저하 확인",
    );
    expect(applicabilityById["infection-fever"]).toBe("암환자 공통");
    expect(applicabilityById["anc-infection-risk"]).toBe(
      "암환자 남녀 공통 · ANC <500 cells/mm²와 발열 기준 입력 보조",
    );
    expect(applicabilityById["platelet-bleeding-risk"]).toBe(
      "암환자 남녀 공통 · PLT <75,000/mm³부터 출혈 예방 기준 입력 보조",
    );
    expect(applicabilityById.waist).toBe("남성 90cm, 여성 85cm 분리");
    expect(applicabilityById["lipids-common"]).toBe(
      "총콜레스테롤·LDL·중성지방 성인 공통 입력 보조값",
    );
    expect(applicabilityById.hdl).toBe("HDL 남성 40 mg/dL 이상, 여성 50 mg/dL 이상 분리");
    expect(applicabilityById.ggt).toBe("GGT 남성 11-63 IU/L, 여성 8-35 IU/L 분리");
    expect(applicabilityById["kidney-function"]).toBe(
      "BUN·Cr 성인 남녀 공통 입력 보조",
    );
    expect(applicabilityById.egfr).toBe(
      "성인 남녀 공통 · eGFR 60 mL/min/1.73m² 미만 3개월 지속 기준 입력 보조",
    );
    expect(applicabilityById.albuminuria).toBe(
      "성인 남녀 공통 · UACR 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 입력 보조",
    );
    expect(applicabilityById.electrolytes).toBe("Na·K 성인 남녀 공통 입력 보조");
    expect(applicabilityById["liver-enzymes"]).toBe(
      "AST·ALT 성인 남녀 공통 0-40 IU/L 입력 보조",
    );
    expect(applicabilityById["serum-albumin"]).toBe(
      "성인 남녀 공통 · 알부민 3.3-5.2 g/dL, 총단백 6.0-8.0 g/dL 입력 보조",
    );
    expect(applicabilityById.calcium).toBe(
      "성인 남녀 공통 · 칼슘 8.8-10.5 mg/dL 입력 보조",
    );
    expect(applicabilityById.phosphate).toBe(
      "성인 남녀 공통 · 인산 2.5-4.5 mg/dL 입력 보조",
    );
    expect(applicabilityById["uric-acid"]).toBe(
      "성인 남녀 공통 입력 보조 · 요산 3-7 mg/dL, 남성은 여성보다 0.5-1.5 mg/dL 높을 수 있음",
    );
    expect(applicabilityById.hemoglobin).toBe(
      "헤모글로빈 남성 13.0-17.0 g/dL, 여성 12.0-16.0 g/dL 분리",
    );
    expect(applicabilityById.cbc).toBe(
      "WBC·PLT 성인 공통, RBC·Hct 남녀 분리 입력 보조, 결과지 기준 우선",
    );
  });

  it("summarizes sex applicability before the detailed coverage list", () => {
    expect(koreanHealthStandardApplicabilitySummary).toEqual([
      {
        id: "common",
        label: "남녀 공통",
        detail:
          "BMI·혈압·혈당·저혈당·현저한 고혈당·체온 기준 · A1C/FPG/PP2·BUN/Cr/eGFR/UACR·Na/K·총콜레스테롤/LDL/TG·AST/ALT·Alb/Ca/P/요산 기준·ANC/PLT 위험 기준",
      },
      {
        id: "sex-specific",
        label: "성별 분리",
        detail: "허리둘레 남성 90cm/여성 85cm · HDL·GGT·헤모글로빈·RBC·Hct 프리셋",
      },
      {
        id: "lab-range",
        label: "결과지 우선",
        detail: "기타 검사실 수치는 병원 결과지 입력값",
      },
    ]);
  });

  it("keeps a non-diagnostic adult-standard use boundary with the Korean standards", () => {
    expect(koreanHealthStandardUseBoundary).toContain("성인 기준 참고용");
    expect(koreanHealthStandardUseBoundary).toContain("진료팀 기준을 우선");
  });

  it("formats external standard sources with URLs while keeping local ranges label-only", () => {
    const bmi = koreanHealthStandardCoverage.find((item) => item.id === "bmi");
    const labRanges = koreanHealthStandardCoverage.find((item) => item.id === "lab-ranges");

    expect(bmi && isExternalHealthStandardSource(bmi)).toBe(true);
    expect(labRanges && isExternalHealthStandardSource(labRanges)).toBe(false);
    expect(bmi && formatHealthStandardSource(bmi)).toContain("https://general.kosso.or.kr/");
    expect(labRanges && formatHealthStandardSource(labRanges)).toBe("사용자 입력 검사실 기준 범위");
  });

  it("builds context-specific accessible labels for health-standard source links", () => {
    expect(
      buildHealthStandardSourceLinkLabels("질병관리청 국가건강정보포털 고혈압", "혈압 기준"),
    ).toEqual({
      ariaLabel: "혈압 기준 공식 기준 출처 질병관리청 국가건강정보포털 고혈압 열기",
      title: "혈압 기준 공식 기준 출처 질병관리청 국가건강정보포털 고혈압 열기",
      visibleLabel: "질병관리청 국가건강정보포털 고혈압",
    });
    expect(buildHealthStandardSourceLinkLabels("대한당뇨병학회 당뇨병 관리 목표", "")).toEqual({
      ariaLabel: "건강 기준 공식 기준 출처 대한당뇨병학회 당뇨병 관리 목표 열기",
      title: "건강 기준 공식 기준 출처 대한당뇨병학회 당뇨병 관리 목표 열기",
      visibleLabel: "대한당뇨병학회 당뇨병 관리 목표",
    });
    expect(
      buildHealthStandardSourceLinkLabels("질병관리청 국가건강정보포털 고혈압", "혈압 기준", {
        surfaceLabel: "기준 빠른 보기",
      }),
    ).toEqual({
      ariaLabel: "기준 빠른 보기 혈압 기준 공식 기준 출처 질병관리청 국가건강정보포털 고혈압 열기",
      title: "기준 빠른 보기 혈압 기준 공식 기준 출처 질병관리청 국가건강정보포털 고혈압 열기",
      visibleLabel: "질병관리청 국가건강정보포털 고혈압",
    });
  });

  it("marks standards with real sex-specific thresholds", () => {
    const sexSpecificIds = koreanHealthStandardCoverage
      .filter((item) => item.sexSpecific)
      .map((item) => item.id);

    expect(sexSpecificIds).toEqual(["waist", "hdl", "ggt", "hemoglobin", "cbc"]);
  });

  it("builds scan-friendly sex applicability badges for standards", () => {
    const badgeById = Object.fromEntries(
      koreanHealthStandardCoverage.map((item) => [
        item.id,
        buildHealthStandardSexApplicabilityBadge(item),
      ]),
    );

    expect(badgeById["blood-pressure"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById["low-blood-pressure"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById["glucose-care"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.hypoglycemia).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById["marked-hyperglycemia"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById["anc-infection-risk"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById["platelet-bleeding-risk"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById["kidney-function"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.egfr).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.albuminuria).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.electrolytes).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.waist).toEqual({ label: "성별 분리", tone: "specific" });
    expect(badgeById.hdl).toEqual({ label: "성별 분리", tone: "specific" });
    expect(badgeById.ggt).toEqual({ label: "성별 분리", tone: "specific" });
    expect(badgeById["liver-enzymes"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.calcium).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.phosphate).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById["uric-acid"]).toEqual({ label: "남녀 공통", tone: "common" });
    expect(badgeById.hemoglobin).toEqual({ label: "성별 분리", tone: "specific" });
    expect(badgeById.cbc).toEqual({ label: "성별 분리", tone: "specific" });
  });

  it("formats coverage lines for exports", () => {
    expect(formatHealthStandardCoverage(koreanHealthStandardCoverage[0])).toContain(
      "[판정 적용] 한국 성인 BMI",
    );
    expect(buildHealthStandardCoverageLines()).toHaveLength(27);
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[판정 적용] 저혈압 확인 기준",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "질병관리청 국가건강정보포털 저혈압",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain("[사용자 기준 우선] 기타 검사실 기준");
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 지질 검사 공통 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "총콜레스테롤·LDL·중성지방 성인 공통 입력 보조값",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 체온·감염 연락 기준",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] ANC 감염 위험 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "ANC 500 미만과 발열·오한·호흡기 증상",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 혈소판 출혈 위험 기준",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "혈소판 감소와 코피·검은 변·혈뇨·비정상 질출혈",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] BUN/Cr 신기능 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "BUN 10-26 mg/dL, 성인 Cr 0.7-1.4 mg/dL",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] eGFR 신장여과율 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "eGFR 60 미만이 3개월 이상 지속되거나 알부민뇨·혈뇨·영상 이상",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] UACR 알부민뇨 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "알부민뇨 30 mg/g 미만, 30-300 mg/g, 300 mg/g 이상 단계",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] Na/K 전해질 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "나트륨 135-145 mmol/L, 칼륨 3.5-5.5 mmol/L",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] HDL 콜레스테롤 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "HDL 남성 40 mg/dL 이상, 여성 50 mg/dL 이상 분리",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] GGT 감마지티피 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "GGT 남성 11-63 IU/L, 여성 8-35 IU/L 분리",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] AST/ALT 간기능 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "AST·ALT 성인 남녀 공통 0-40 IU/L 입력 보조",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 알부민/총단백 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "혈청 알부민 3.3-5.2 g/dL과 총단백 6.0-8.0 g/dL",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 칼슘 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "칼슘 8.8-10.5 mg/dL 보조값",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 인산 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "성인 인산 2.5-4.5 mg/dL 보조값",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 요산 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "요산 3-7 mg/dL 보조값",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] 헤모글로빈 성별 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "헤모글로빈 남성 13.0-17.0 g/dL, 여성 12.0-16.0 g/dL 분리",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[입력 보조] CBC/항암 추적 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "WBC, RBC, Hct, 혈소판 프리셋",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "한국 성인 혈압 - 정상, 주의혈압, 고혈압 전단계",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[판정 적용] 저혈당 확인 기준",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain("70 mg/dL 미만 저혈당");
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "[판정 적용] 현저한 고혈당 확인 기준",
    );
    expect(buildHealthStandardCoverageLines().join("\n")).toContain("250 mg/dL 이상 현저한 고혈당");
    expect(buildHealthStandardCoverageLines().join("\n")).toContain("적용: 성인 남녀 공통");
    expect(buildHealthStandardCoverageLines().join("\n")).toContain(
      "근거: 대한비만학회 비만 진료지침 2022 (https://general.kosso.or.kr/",
    );
  });

  it("formats short dashboard metric standard notes from the shared coverage matrix", () => {
    expect(getHealthStandardCoverage("blood-pressure")?.label).toBe("한국 성인 혈압");
    expect(formatDashboardMetricStandardNote("blood-pressure")).toBe(
      "성인 남녀 공통 · 한국 성인 혈압",
    );
    expect(formatDashboardMetricStandardNote("low-blood-pressure")).toBe(
      "성인 남녀 공통 · 저혈압 확인 기준",
    );
    expect(formatDashboardMetricStandardNote("hypoglycemia")).toBe(
      "성인 남녀 공통 · 70 mg/dL 미만과 증상·의식상태 확인 · 저혈당 확인 기준",
    );
    expect(formatDashboardMetricStandardNote("marked-hyperglycemia")).toBe(
      "성인 남녀 공통 · 250 mg/dL 이상과 탈수·의식저하 확인 · 현저한 고혈당 확인 기준",
    );
    expect(formatDashboardMetricStandardNote("waist")).toBe(
      "남성 90cm, 여성 85cm 분리 · 한국 성인 허리둘레",
    );
    expect(formatDashboardMetricStandardNote("unknown")).toBe("");
  });

  it("builds dashboard metric source evidence from the shared coverage matrix", () => {
    expect(buildDashboardMetricStandardEvidence("blood-pressure", "최근 혈압 기준")).toEqual({
      contextLabel: "최근 혈압 기준",
      linkLabels: {
        ariaLabel: "대시보드 지표 최근 혈압 기준 공식 기준 출처 질병관리청 국가건강정보포털 고혈압 열기",
        title: "대시보드 지표 최근 혈압 기준 공식 기준 출처 질병관리청 국가건강정보포털 고혈압 열기",
        visibleLabel: "질병관리청 국가건강정보포털 고혈압",
      },
      note: "성인 남녀 공통 · 한국 성인 혈압",
      sourceLabel: "질병관리청 국가건강정보포털 고혈압",
      sourceUrl:
        "https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=28",
    });
    expect(buildDashboardMetricStandardEvidence("low-blood-pressure", "낮은 혈압 기준")).toMatchObject({
      contextLabel: "낮은 혈압 기준",
      note: "성인 남녀 공통 · 저혈압 확인 기준",
      sourceLabel: "질병관리청 국가건강정보포털 저혈압",
      sourceUrl:
        "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5259",
    });
    expect(buildDashboardMetricStandardEvidence("glucose-care", "최근 혈당 기준")).toMatchObject({
      contextLabel: "최근 혈당 기준",
      linkLabels: {
        ariaLabel: "대시보드 지표 최근 혈당 기준 공식 기준 출처 대한당뇨병학회 당뇨병 관리 목표 열기",
        title: "대시보드 지표 최근 혈당 기준 공식 기준 출처 대한당뇨병학회 당뇨병 관리 목표 열기",
        visibleLabel: "대한당뇨병학회 당뇨병 관리 목표",
      },
      note: "성인 남녀 공통 · 당뇨 추적 혈당",
      sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
    });
    expect(buildDashboardMetricStandardEvidence("hypoglycemia", "최근 혈당 기준")).toMatchObject({
      contextLabel: "최근 혈당 기준",
      note: "성인 남녀 공통 · 70 mg/dL 미만과 증상·의식상태 확인 · 저혈당 확인 기준",
      sourceLabel: "질병관리청 국가건강정보포털 급성 합병증_저혈당",
      sourceUrl:
        "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2350",
    });
    expect(buildDashboardMetricStandardEvidence("marked-hyperglycemia", "최근 혈당 기준")).toMatchObject({
      contextLabel: "최근 혈당 기준",
      note: "성인 남녀 공통 · 250 mg/dL 이상과 탈수·의식저하 확인 · 현저한 고혈당 확인 기준",
      sourceLabel: "질병관리청 국가건강정보포털 고혈당",
      sourceUrl:
        "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5304",
    });
    expect(buildDashboardMetricStandardEvidence("unknown", "최근 혈압 기준")).toBeNull();
  });

  it("formats dashboard metric standard copy text with official source evidence", () => {
    const evidences = [
      buildDashboardMetricStandardEvidence("bmi", "BMI 대시보드 기준"),
      buildDashboardMetricStandardEvidence("waist", "허리둘레 대시보드 기준"),
      buildDashboardMetricStandardEvidence("blood-pressure", "최근 혈압 기준"),
      buildDashboardMetricStandardEvidence("glucose-care", "최근 혈당 기준"),
    ];

    expect(formatDashboardMetricStandardCompactSummary(evidences)).toBe(
      "4개 기준 · 근거 3개",
    );
    expect(formatDashboardMetricStandardCopyDescription(evidences)).toBe(
      "대시보드 건강 기준 복사 · 4개 기준 · 근거 3개",
    );
    expect(formatDashboardMetricStandardCopyStatus(evidences)).toBe(
      "대시보드 건강 기준 복사됨 · 4개 기준 · 근거 3개",
    );

    const text = formatDashboardMetricStandardClipboardText(evidences);

    expect(text).toContain("[대시보드 건강 기준]");
    expect(text).toContain("요약: 4개 기준 · 근거 3개");
    expect(text).toContain("- BMI 대시보드 기준: 성인 남녀 공통 · 한국 성인 BMI");
    expect(text).toContain("근거: 대한비만학회 비만 진료지침 2022");
    expect(text).toContain(
      "- 허리둘레 대시보드 기준: 남성 90cm, 여성 85cm 분리 · 한국 성인 허리둘레",
    );
    expect(text).toContain("- 최근 혈압 기준: 성인 남녀 공통 · 한국 성인 혈압");
    expect(text).toContain("근거: 질병관리청 국가건강정보포털 고혈압");
    expect(text).toContain("- 최근 혈당 기준: 성인 남녀 공통 · 당뇨 추적 혈당");
    expect(text).toContain("근거: 대한당뇨병학회 당뇨병 관리 목표");
  });

  it("formats vital input helper copy with adult common-sex applicability", () => {
    expect(formatVitalInputStandardHelp("blood-pressure")).toBe(
      "혈압 입력값은 한국 성인 남녀 공통 혈압 기준으로 표시됩니다.",
    );
    expect(formatVitalInputStandardHelp("low-blood-pressure")).toBe(
      "낮은 혈압 입력값은 성인 남녀 공통 저혈압 확인 기준으로 표시됩니다.",
    );
    expect(formatVitalInputStandardHelp("glucose-care")).toBe(
      "당뇨 추적이 켜져 있어 성인 남녀 공통 식전·식후 목표 기준으로 표시됩니다.",
    );
    expect(formatVitalInputStandardHelp("hypoglycemia")).toBe(
      "70 mg/dL 미만 혈당은 성인 남녀 공통 저혈당 확인 기준으로 표시됩니다.",
    );
    expect(formatVitalInputStandardHelp("marked-hyperglycemia")).toBe(
      "250 mg/dL 이상 혈당은 성인 남녀 공통 현저한 고혈당 확인 기준으로 표시됩니다.",
    );
    expect(formatVitalInputStandardHelp("glucose-screening")).toBe(
      "당뇨 추적이 꺼져 있어 성인 남녀 공통 공복·식후 선별 기준으로 표시됩니다.",
    );
    expect(formatVitalInputStandardHelp("infection-fever")).toBe(
      "체온 38℃ 이상 또는 오한은 암환자 공통 감염 연락 기준으로 표시됩니다.",
    );
    expect(formatVitalInputStandardHelp("unknown")).toBe("");
  });

  it("formats vital save-preview labels with measurement, assessment, and active standard", () => {
    expect(
      formatVitalSavePreviewLabel({
        assessmentLabel: "고혈압 전단계 범위",
        measurementLabel: "혈압 132/82 mmHg",
        standardLabel: "한국 성인 혈압",
        standardSexApplicability: "성인 남녀 공통",
      }),
    ).toBe("혈압 132/82 mmHg · 고혈압 전단계 범위 · 성인 남녀 공통 · 한국 성인 혈압");

    expect(
      formatVitalSavePreviewLabel({
        assessmentLabel: "식후 목표 초과",
        measurementLabel: "혈당 191 mg/dL (식후 2시간)",
        standardLabel: "당뇨 추적 혈당",
        standardSexApplicability: "성인 남녀 공통",
      }),
    ).toBe("혈당 191 mg/dL (식후 2시간) · 식후 목표 초과 · 성인 남녀 공통 · 당뇨 추적 혈당");
  });

  it("builds source-backed clinician question drafts from vital input standards", () => {
    const bloodPressureDraft = buildVitalStandardQuestionDraft({
      assessmentLabel: "고혈압 위기 가능 범위",
      assessmentSummary:
        "성인 남녀 공통 혈압 기준에서 고혈압 위기 가능 범위입니다. 증상이 있거나 반복되면 즉시 의료진 또는 응급 진료가 필요합니다.",
      measurementLabel: "혈압 182/121 mmHg",
      note: "두통 동반",
      standardId: "blood-pressure",
    });
    const glucoseDraft = buildVitalStandardQuestionDraft({
      assessmentLabel: "식전 목표보다 낮음",
      assessmentSummary:
        "성인 남녀 공통 식전 목표에서 벗어났습니다. 개인 목표는 나이와 치료 상태에 따라 다를 수 있습니다.",
      measurementLabel: "혈당 76 mg/dL (식전)",
      standardId: "glucose-care",
    });
    const lowBloodPressureDraft = buildVitalStandardQuestionDraft({
      assessmentLabel: "낮은 혈압 가능",
      assessmentSummary:
        "성인 남녀 공통 혈압 기준에서 낮은 혈압 가능 범위입니다. 어지러움, 실신감, 탈수 증상이 있으면 의료진에게 확인하세요.",
      measurementLabel: "혈압 88/58 mmHg",
      standardId: "low-blood-pressure",
    });
    const hypoglycemiaDraft = buildVitalStandardQuestionDraft({
      assessmentLabel: "저혈당 범위",
      assessmentSummary:
        "성인 남녀 공통 혈당 기준에서 70 mg/dL 미만 저혈당 범위입니다. 증상, 의식상태, 약·식사·활동 변화를 함께 기록하고 진료팀 연락 기준을 확인하세요.",
      measurementLabel: "혈당 66 mg/dL (수시)",
      standardId: "hypoglycemia",
    });
    const markedHyperglycemiaDraft = buildVitalStandardQuestionDraft({
      assessmentLabel: "현저한 고혈당 범위",
      assessmentSummary:
        "성인 남녀 공통 기준에서 250 mg/dL 이상 현저한 고혈당 범위입니다. 다음·다뇨·체중감소, 탈수, 구토, 복통, 의식저하 동반 여부를 기록하고 병원 확인 기준을 확인하세요.",
      measurementLabel: "혈당 250 mg/dL (수시)",
      standardId: "marked-hyperglycemia",
    });

    expect(bloodPressureDraft?.topic).toBe("혈압 기준 확인");
    expect(bloodPressureDraft?.question).toContain("혈압 182/121 mmHg");
    expect(bloodPressureDraft?.question).toContain("성인 남녀 공통 한국 성인 혈압 기준");
    expect(bloodPressureDraft?.question).toContain("고혈압 위기 가능 범위");
    expect(bloodPressureDraft?.question).toContain("사용자 메모: 두통 동반");
    expect(bloodPressureDraft?.question).toContain("질병관리청 국가건강정보포털 고혈압");
    expect(bloodPressureDraft?.question).toContain("thtimt_cntnts_sn=28");
    expect(bloodPressureDraft?.question).not.toContain(".. 공식 근거");
    expect(bloodPressureDraft?.question).toContain(
      "\n출처: 질병관리청 국가건강정보포털 고혈압 - https://health.kdca.go.kr/",
    );
    expect(glucoseDraft?.topic).toBe("혈당 기준 확인");
    expect(glucoseDraft?.question).toContain("혈당 76 mg/dL (식전)");
    expect(glucoseDraft?.question).toContain(
      "\n출처: 대한당뇨병학회 당뇨병 관리 목표 - https://www.diabetes.or.kr/general/info/treat/treat_01.php",
    );
    expect(lowBloodPressureDraft?.topic).toBe("혈압 기준 확인");
    expect(lowBloodPressureDraft?.question).toContain("혈압 88/58 mmHg");
    expect(lowBloodPressureDraft?.question).toContain("성인 남녀 공통 저혈압 확인 기준");
    expect(lowBloodPressureDraft?.question).toContain("질병관리청 국가건강정보포털 저혈압");
    expect(lowBloodPressureDraft?.question).toContain("cntnts_sn=5259");
    expect(lowBloodPressureDraft?.question).not.toContain("thtimt_cntnts_sn=28");
    expect(hypoglycemiaDraft?.topic).toBe("혈당 기준 확인");
    expect(hypoglycemiaDraft?.question).toContain("혈당 66 mg/dL (수시)");
    expect(hypoglycemiaDraft?.question).toContain("질병관리청 국가건강정보포털 급성 합병증_저혈당");
    expect(hypoglycemiaDraft?.question).toContain("cntnts_sn=2350");
    expect(markedHyperglycemiaDraft?.question).toContain("혈당 250 mg/dL (수시)");
    expect(markedHyperglycemiaDraft?.question).toContain("질병관리청 국가건강정보포털 고혈당");
    expect(markedHyperglycemiaDraft?.question).toContain("cntnts_sn=5304");
    expect(buildVitalStandardQuestionDraft({
      assessmentLabel: "정보 부족",
      assessmentSummary: "기준 없음",
      measurementLabel: "혈당 0 mg/dL",
      standardId: "unknown",
    })).toBeNull();
  });

  it("builds compact source-backed numeric range lines for health standard helpers", () => {
    const bmiRangeLines = buildVitalStandardRangeLines("bmi");
    const waistRangeLines = buildVitalStandardRangeLines("waist");
    const bloodPressureRangeLines = buildVitalStandardRangeLines("blood-pressure");
    const lowBloodPressureRangeLines = buildVitalStandardRangeLines("low-blood-pressure");
    const diabetesCareRangeLines = buildVitalStandardRangeLines("glucose-care");
    const hypoglycemiaRangeLines = buildVitalStandardRangeLines("hypoglycemia");
    const markedHyperglycemiaRangeLines = buildVitalStandardRangeLines("marked-hyperglycemia");
    const bmiLines = bmiRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const waistLines = waistRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const bloodPressureLines = bloodPressureRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const lowBloodPressureLines = lowBloodPressureRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const diabetesCareLines = diabetesCareRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const hypoglycemiaLines = hypoglycemiaRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const markedHyperglycemiaLines = markedHyperglycemiaRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const glucoseScreeningLines = buildVitalStandardRangeLines("glucose-screening")
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const a1cLines = buildVitalStandardRangeLines("a1c-fpg-pp2")
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const kidneyFunctionRangeLines = buildVitalStandardRangeLines("kidney-function");
    const kidneyFunctionLines = kidneyFunctionRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const egfrRangeLines = buildVitalStandardRangeLines("egfr");
    const egfrLines = egfrRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const albuminuriaRangeLines = buildVitalStandardRangeLines("albuminuria");
    const albuminuriaLines = albuminuriaRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const electrolyteRangeLines = buildVitalStandardRangeLines("electrolytes");
    const electrolyteLines = electrolyteRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const lipidRangeLines = buildVitalStandardRangeLines("lipids-common");
    const lipidLines = lipidRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const hdlRangeLines = buildVitalStandardRangeLines("hdl");
    const hdlLines = hdlRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const ggtRangeLines = buildVitalStandardRangeLines("ggt");
    const ggtLines = ggtRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const liverEnzymeRangeLines = buildVitalStandardRangeLines("liver-enzymes");
    const liverEnzymeLines = liverEnzymeRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const serumAlbuminRangeLines = buildVitalStandardRangeLines("serum-albumin");
    const serumAlbuminLines = serumAlbuminRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const calciumRangeLines = buildVitalStandardRangeLines("calcium");
    const calciumLines = calciumRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const phosphateRangeLines = buildVitalStandardRangeLines("phosphate");
    const phosphateLines = phosphateRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const uricAcidRangeLines = buildVitalStandardRangeLines("uric-acid");
    const uricAcidLines = uricAcidRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const hemoglobinRangeLines = buildVitalStandardRangeLines("hemoglobin");
    const hemoglobinLines = hemoglobinRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const cbcRangeLines = buildVitalStandardRangeLines("cbc");
    const cbcLines = cbcRangeLines.map((item) => `${item.label}: ${item.detail}`).join("\n");
    const ancInfectionRiskRangeLines = buildVitalStandardRangeLines("anc-infection-risk");
    const ancInfectionRiskLines = ancInfectionRiskRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const plateletBleedingRiskRangeLines = buildVitalStandardRangeLines("platelet-bleeding-risk");
    const plateletBleedingRiskLines = plateletBleedingRiskRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const infectionFeverRangeLines = buildVitalStandardRangeLines("infection-fever");
    const infectionFeverLines = infectionFeverRangeLines
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");

    expect(bmiLines).toContain("저체중: 남녀 공통 · <18.5 kg/m²");
    expect(bmiLines).toContain("정상: 남녀 공통 · 18.5-22.9 kg/m²");
    expect(bmiLines).toContain("비만전단계: 남녀 공통 · 23-24.9 kg/m²");
    expect(bmiLines).toContain(
      "비만: 남녀 공통 · 1단계 25-29.9, 2단계 30-34.9, 3단계 35 이상 kg/m²",
    );
    expect(waistLines).toContain("남성 복부비만: 남성 기준 · 90cm 이상");
    expect(waistLines).toContain("여성 복부비만: 여성 기준 · 85cm 이상");
    expect(bloodPressureLines).toContain("정상: 남녀 공통 · <120/<80 mmHg");
    expect(bloodPressureLines).toContain(
      "주의/전단계: 남녀 공통 · 주의 120-129/<80",
    );
    expect(bloodPressureLines).toContain("고혈압: 남녀 공통 · 1기 140/90 이상");
    expect(lowBloodPressureLines).toContain("저혈압 가능: 남녀 공통 · 90/60 mmHg 이하");
    expect(lowBloodPressureLines).toContain("동반 증상: 남녀 공통 · 어지러움");
    expect(lowBloodPressureLines).toContain("급성 확인: 남녀 공통 · 급성 저혈압");
    expect(diabetesCareLines).toContain("식전/공복 목표: 남녀 공통 · 80-130 mg/dL");
    expect(diabetesCareLines).toContain("식후 2시간 목표: 남녀 공통 · 180 mg/dL 미만");
    expect(diabetesCareLines).toContain("개별 목표: 남녀 공통 · 나이, 유병 기간");
    expect(hypoglycemiaLines).toContain("저혈당: 남녀 공통 · 70 mg/dL 미만");
    expect(hypoglycemiaLines).toContain("동반 증상: 남녀 공통 · 손떨림");
    expect(hypoglycemiaLines).toContain("원인 기록: 남녀 공통 · 당뇨병약");
    expect(markedHyperglycemiaLines).toContain(
      "현저한 고혈당: 남녀 공통 · 250 mg/dL 이상이면 현저한 고혈당",
    );
    expect(markedHyperglycemiaLines).toContain("동반 증상: 남녀 공통 · 다음, 다뇨");
    expect(markedHyperglycemiaLines).toContain("급성 합병증 확인: 남녀 공통 · 1형 당뇨");
    expect(bmiRangeLines.find((item) => item.id === "bmi-obesity")?.tone).toBe("risk");
    expect(
      waistRangeLines.find((item) => item.id === "waist-male-abdominal-obesity")?.tone,
    ).toBe("risk");
    expect(bloodPressureRangeLines.find((item) => item.id === "bp-hypertension")?.tone).toBe(
      "risk",
    );
    expect(
      lowBloodPressureRangeLines.find((item) => item.id === "low-bp-threshold")?.tone,
    ).toBe("risk");
    expect(diabetesCareRangeLines.some((item) => item.tone === "risk")).toBe(false);
    expect(hypoglycemiaRangeLines.find((item) => item.id === "hypoglycemia-threshold")?.tone).toBe(
      "risk",
    );
    expect(
      markedHyperglycemiaRangeLines.find((item) => item.id === "marked-hyperglycemia-threshold")
        ?.tone,
    ).toBe("risk");
    expect(glucoseScreeningLines).toContain("공복: 남녀 공통 · 정상 <100");
    expect(glucoseScreeningLines).toContain("식후 2시간: 남녀 공통 · 정상 <140");
    expect(glucoseScreeningLines).toContain(
      "무작위: 남녀 공통 · 증상과 함께 200 mg/dL 이상",
    );
    expect(a1cLines).toContain("A1C 정상: 남녀 공통 · 당화혈색소 <5.7%");
    expect(a1cLines).toContain(
      "A1C 진단 기준: 남녀 공통 · 6.5% 이상이면 당뇨병 진단 기준 가능성 확인",
    );
    expect(kidneyFunctionLines).toContain("BUN: 남녀 공통 · 10-26 mg/dL");
    expect(kidneyFunctionLines).toContain("Cr: 남녀 공통 · 성인 0.7-1.4 mg/dL");
    expect(kidneyFunctionLines).toContain(
      "상승 확인: 남녀 공통 · 단독 진단이 아니라 탈수·근육량·약물·소변검사·eGFR",
    );
    expect(egfrLines).toContain(
      "보존 범위: 남녀 공통 · 60 mL/min/1.73m² 이상이어도 단백뇨·혈뇨",
    );
    expect(egfrLines).toContain(
      "60 미만 지속: 남녀 공통 · 60 미만이 3개월 이상 지속되면 만성콩팥병 기준 가능성 진료팀 확인",
    );
    expect(egfrLines).toContain(
      "동반 확인: 남녀 공통 · 알부민뇨·혈뇨·소변검사·혈청 Cr·영상검사·전해질 이상",
    );
    expect(albuminuriaLines).toContain("A1 낮음: 남녀 공통 · 알부민뇨 30 mg/g 미만");
    expect(albuminuriaLines).toContain(
      "A2 증가: 남녀 공통 · 30-300 mg/g 범위는 반복 정량검사와 eGFR 함께 확인",
    );
    expect(albuminuriaLines).toContain(
      "A3 고도 증가: 남녀 공통 · 300 mg/g 이상이면 말기 신부전 진행 위험 평가 진료팀 확인",
    );
    expect(electrolyteLines).toContain("Na: 남녀 공통 · 135-145 mmol/L");
    expect(electrolyteLines).toContain("K: 남녀 공통 · 3.5-5.5 mmol/L");
    expect(electrolyteLines).toContain(
      "변화 확인: 남녀 공통 · 단독 진단이 아니라 구토·설사·탈수·신장 상태",
    );
    expect(lipidLines).toContain("적정: 남녀 공통 · 총콜레스테롤 <200");
    expect(lipidLines).toContain("경계: 남녀 공통 · 총콜레스테롤 200-239");
    expect(lipidLines).toContain("높음: 남녀 공통 · 총콜레스테롤 240 이상");
    expect(lipidLines).toContain("정기검사: 남녀 공통 · 고위험군은 매년 지질검사, 수치 이상 시 전문의 상담으로 맞춤 치료계획 확인");
    expect(hdlLines).toContain("남성 HDL: 남성 기준 · 40 mg/dL 이상");
    expect(hdlLines).toContain("여성 HDL: 여성 기준 · 50 mg/dL 이상");
    expect(hdlLines).toContain("낮음 확인: 성별 분리 · 남성 40 미만 또는 여성 50 미만");
    expect(ggtLines).toContain("남성 GGT: 남성 기준 · 11-63 IU/L");
    expect(ggtLines).toContain("여성 GGT: 여성 기준 · 8-35 IU/L");
    expect(ggtLines).toContain("상승 확인: 성별 분리 · 간담도·음주·약물 영향");
    expect(liverEnzymeLines).toContain("AST: 남녀 공통 · 0-40 IU/L");
    expect(liverEnzymeLines).toContain("ALT: 남녀 공통 · 0-40 IU/L");
    expect(liverEnzymeLines).toContain(
      "상승 확인: 남녀 공통 · 단독 진단이 아니라 증상·약물·영상·다른 검사",
    );
    expect(serumAlbuminLines).toContain("알부민: 남녀 공통 · 3.3-5.2 g/dL");
    expect(serumAlbuminLines).toContain("총단백: 남녀 공통 · 6.0-8.0 g/dL");
    expect(serumAlbuminLines).toContain(
      "낮음 확인: 남녀 공통 · 단독 진단이 아니라 간질환·신장질환·영양 결핍",
    );
    expect(calciumLines).toContain(
      "Ca: 남녀 공통 · 8.8-10.5 mg/dL, 병원 결과지 기준 우선",
    );
    expect(calciumLines).toContain(
      "상승 확인: 남녀 공통 · 단독 진단이 아니라 뼈 전이 암·갑상선기능항진증·비타민D 과다",
    );
    expect(calciumLines).toContain(
      "감소 확인: 남녀 공통 · 부갑상선저하증·신부전·비타민D·마그네슘·인·영양실조·알부민 감소",
    );
    expect(phosphateLines).toContain(
      "P: 남녀 공통 · 성인 2.5-4.5 mg/dL, 병원 결과지 기준 우선",
    );
    expect(phosphateLines).toContain(
      "상승 확인: 남녀 공통 · 단독 진단이 아니라 신부전·부갑상선기능저하증·인 성분 약제",
    );
    expect(phosphateLines).toContain(
      "감소 확인: 남녀 공통 · 고칼슘혈증·이뇨제·장기간 제산제·비타민D 결핍 골질환·영양실조",
    );
    expect(uricAcidLines).toContain(
      "요산: 남녀 공통 입력 보조 · 3-7 mg/dL, 남성은 여성보다 0.5-1.5 mg/dL",
    );
    expect(uricAcidLines).toContain(
      "상승 맥락: 남녀 공통 · 단독 진단이 아니라 전이암·다발골수종·백혈병·항암치료",
    );
    expect(uricAcidLines).toContain(
      "결과지 우선: 남녀 공통 · 병원·검사법·성별 참고치가 다를 수 있어 결과지 범위",
    );
    expect(hemoglobinLines).toContain(
      "남성 헤모글로빈: 남성 입력 보조 · 13.0-17.0 g/dL",
    );
    expect(hemoglobinLines).toContain(
      "여성 헤모글로빈: 여성 입력 보조 · 12.0-16.0 g/dL",
    );
    expect(hemoglobinLines).toContain("결과지 우선: 성별·검사실·치료 상태");
    expect(cbcLines).toContain("WBC: 남녀 공통 · 4.0-10.0 10^3/uL");
    expect(cbcLines).toContain("남성 RBC: 남성 입력 보조 · 4.2-6.3 10^6/uL");
    expect(cbcLines).toContain("여성 RBC: 여성 입력 보조 · 4.0-5.4 10^6/uL");
    expect(cbcLines).toContain("남성 Hct: 남성 입력 보조 · 38-53%");
    expect(cbcLines).toContain("여성 Hct: 여성 입력 보조 · 36-46%");
    expect(cbcLines).toContain("PLT: 남녀 공통 · 150-450 10^3/uL");
    expect(cbcLines).toContain("결과지 우선: 성별·나이·신체상태·검사실·치료 상태");
    expect(ancInfectionRiskLines).toContain(
      "ANC 발열 기준: 암환자 공통 · ANC <500 cells/mm²",
    );
    expect(ancInfectionRiskLines).toContain("항암 후 시기: 암환자 공통 · 항암제 주사 후 보통 7-14일");
    expect(ancInfectionRiskLines).toContain("동반 확인: 암환자 공통 · 기침·호흡곤란");
    expect(plateletBleedingRiskLines).toContain(
      "출혈 예방 기준: 암환자 공통 · 혈소판 <75,000/mm³",
    );
    expect(plateletBleedingRiskLines).toContain(
      "의료진 상담 기준: 암환자 공통 · 혈소판 <50,000/mm³ 수준",
    );
    expect(plateletBleedingRiskLines).toContain(
      "응급 확인: 암환자 공통 · 10분 이상 압박해도 계속되는 출혈",
    );
    expect(infectionFeverLines).toContain(
      "발열·오한 연락: 암환자 공통 · 오한 또는 체온 38℃ 이상",
    );
    expect(infectionFeverLines).toContain("동반 증상: 암환자 공통 · 오심·구토·설사");
    expect(infectionFeverLines).toContain("기록 항목: 암환자 공통 · 체온, 측정 시간");
    expect(
      buildVitalStandardRangeLines("a1c-fpg-pp2").find((item) => item.id === "a1c-diagnosis")
        ?.tone,
    ).toBe("risk");
    expect(
      kidneyFunctionRangeLines.find((item) => item.id === "kidney-function-check")?.tone,
    ).toBe("risk");
    expect(
      egfrRangeLines.find((item) => item.id === "egfr-persistent-low")?.tone,
    ).toBe("risk");
    expect(
      albuminuriaRangeLines.find((item) => item.id === "albuminuria-a2")?.tone,
    ).toBe("risk");
    expect(
      albuminuriaRangeLines.find((item) => item.id === "albuminuria-a3")?.tone,
    ).toBe("risk");
    expect(
      electrolyteRangeLines.find((item) => item.id === "electrolyte-change-check")?.tone,
    ).toBe("risk");
    expect(lipidRangeLines.find((item) => item.id === "lipids-high")?.tone).toBe("risk");
    expect(hdlRangeLines.find((item) => item.id === "hdl-low-check")?.tone).toBe("risk");
    expect(ggtRangeLines.find((item) => item.id === "ggt-high-check")?.tone).toBe("risk");
    expect(
      liverEnzymeRangeLines.find((item) => item.id === "liver-enzyme-high-check")?.tone,
    ).toBe("risk");
    expect(
      serumAlbuminRangeLines.find((item) => item.id === "albumin-low-check")?.tone,
    ).toBe("risk");
    expect(
      calciumRangeLines.find((item) => item.id === "calcium-high-context")?.tone,
    ).toBe("risk");
    expect(
      calciumRangeLines.find((item) => item.id === "calcium-low-context")?.tone,
    ).toBe("risk");
    expect(
      phosphateRangeLines.find((item) => item.id === "phosphate-high-context")?.tone,
    ).toBe("risk");
    expect(
      phosphateRangeLines.find((item) => item.id === "phosphate-low-context")?.tone,
    ).toBe("risk");
    expect(
      uricAcidRangeLines.find((item) => item.id === "uric-acid-context")?.tone,
    ).toBe("risk");
    expect(hemoglobinRangeLines.some((item) => item.tone === "risk")).toBe(false);
    expect(cbcRangeLines.some((item) => item.tone === "risk")).toBe(false);
    expect(
      ancInfectionRiskRangeLines.find((item) => item.id === "anc-fever-threshold")?.tone,
    ).toBe("risk");
    expect(
      ancInfectionRiskRangeLines.find((item) => item.id === "anc-symptom-check")?.tone,
    ).toBe("risk");
    expect(
      plateletBleedingRiskRangeLines.find((item) => item.id === "platelet-prevention-threshold")
        ?.tone,
    ).toBe("risk");
    expect(
      plateletBleedingRiskRangeLines.find((item) => item.id === "platelet-emergency-check")?.tone,
    ).toBe("risk");
    expect(
      infectionFeverRangeLines.find((item) => item.id === "infection-fever-threshold")?.tone,
    ).toBe("risk");
    expect(buildVitalStandardRangeLines("unknown")).toEqual([]);
  });

  it("builds source-backed numeric range sections for visible summaries", () => {
    const sections = buildVitalStandardRangeSections();

    expect(sections.map((section) => section.id)).toEqual([
      "bmi-ranges",
      "waist-ranges",
      "blood-pressure-ranges",
      "low-blood-pressure-ranges",
      "glucose-care-ranges",
      "hypoglycemia-ranges",
      "marked-hyperglycemia-ranges",
      "glucose-screening-ranges",
      "a1c-ranges",
      "kidney-function-ranges",
      "egfr-ranges",
      "albuminuria-ranges",
      "electrolyte-ranges",
      "lipids-common-ranges",
      "hdl-ranges",
      "ggt-ranges",
      "liver-enzyme-ranges",
      "serum-albumin-ranges",
      "calcium-ranges",
      "phosphate-ranges",
      "uric-acid-ranges",
      "hemoglobin-ranges",
      "cbc-ranges",
      "anc-infection-risk-ranges",
      "platelet-bleeding-risk-ranges",
      "infection-fever-ranges",
    ]);
    const sectionByLabel = Object.fromEntries(sections.map((section) => [section.label, section]));
    expect(sections[0].label).toBe("BMI 기준");
    expect(sections[0].sourceLabel).toBe("대한비만학회 비만 진료지침 2022");
    expect(sections[0].sourceUrl).toContain("guideline2022_vol8.pdf");
    expect(sections[0].lines.map((line) => line.label)).toEqual([
      "저체중",
      "정상",
      "비만전단계",
      "비만",
    ]);
    expect(sections[1].label).toBe("허리둘레 기준");
    expect(sections[1].lines.map((line) => line.detail)).toEqual([
      "남성 기준 · 90cm 이상",
      "여성 기준 · 85cm 이상",
    ]);
    expect(sections[2].label).toBe("혈압 기준");
    expect(sections[2].sourceLabel).toBe("질병관리청 국가건강정보포털 고혈압");
    expect(sections[2].sourceUrl).toContain("thtimt_cntnts_sn=28");
    expect(sections[3].label).toBe("저혈압 확인 기준");
    expect(sections[3].sourceLabel).toBe("질병관리청 국가건강정보포털 저혈압");
    expect(sections[3].sourceUrl).toContain("cntnts_sn=5259");
    expect(sections[3].lines.map((line) => line.label)).toEqual([
      "저혈압 가능",
      "동반 증상",
      "급성 확인",
    ]);
    expect(sectionByLabel["당뇨 추적 혈당 목표"].sourceLabel).toBe(
      "대한당뇨병학회 당뇨병 관리 목표",
    );
    expect(sectionByLabel["저혈당 확인 기준"].sourceLabel).toBe(
      "질병관리청 국가건강정보포털 급성 합병증_저혈당",
    );
    expect(sectionByLabel["저혈당 확인 기준"].sourceUrl).toContain("cntnts_sn=2350");
    expect(sectionByLabel["저혈당 확인 기준"].lines.map((line) => line.label)).toEqual([
      "저혈당",
      "동반 증상",
      "원인 기록",
    ]);
    expect(sectionByLabel["현저한 고혈당 확인 기준"].sourceLabel).toBe(
      "질병관리청 국가건강정보포털 고혈당",
    );
    expect(sectionByLabel["현저한 고혈당 확인 기준"].sourceUrl).toContain("cntnts_sn=5304");
    expect(sectionByLabel["현저한 고혈당 확인 기준"].lines.map((line) => line.label)).toEqual([
      "현저한 고혈당",
      "동반 증상",
      "급성 합병증 확인",
    ]);
    expect(sectionByLabel["혈당 선별 기준"].lines.map((line) => line.label)).toEqual([
      "공복",
      "식후 2시간",
      "무작위",
    ]);
    expect(sectionByLabel["A1C 검사 기준"].sourceLabel).toBe("질병관리청 국가건강정보포털 당뇨병");
    expect(sectionByLabel["A1C 검사 기준"].lines.map((line) => line.label)).toEqual([
      "A1C 정상",
      "A1C 전단계",
      "A1C 진단 기준",
      "A1C 관리 목표",
    ]);
    expect(sectionByLabel["BUN/Cr 신기능 기준"].sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(sectionByLabel["BUN/Cr 신기능 기준"].sourceUrl).toContain("cntnts_sn=5531");
    expect(sectionByLabel["BUN/Cr 신기능 기준"].lines.map((line) => line.label)).toEqual([
      "BUN",
      "Cr",
      "상승 확인",
    ]);
    expect(sectionByLabel["eGFR 신장여과율 기준"].sourceLabel).toBe(
      "질병관리청 국가건강정보포털 만성콩팥병",
    );
    expect(sectionByLabel["eGFR 신장여과율 기준"].sourceUrl).toContain("cntnts_sn=5457");
    expect(sectionByLabel["eGFR 신장여과율 기준"].lines.map((line) => line.label)).toEqual([
      "보존 범위",
      "60 미만 지속",
      "동반 확인",
    ]);
    expect(sectionByLabel["UACR 알부민뇨 기준"].sourceLabel).toBe(
      "질병관리청 국가건강정보포털 만성콩팥병",
    );
    expect(sectionByLabel["UACR 알부민뇨 기준"].sourceUrl).toContain("cntnts_sn=5457");
    expect(sectionByLabel["UACR 알부민뇨 기준"].lines.map((line) => line.label)).toEqual([
      "A1 낮음",
      "A2 증가",
      "A3 고도 증가",
    ]);
    expect(sectionByLabel["Na/K 전해질 기준"].sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(sectionByLabel["Na/K 전해질 기준"].sourceUrl).toContain("cntnts_sn=5531");
    expect(sectionByLabel["Na/K 전해질 기준"].lines.map((line) => line.label)).toEqual([
      "Na",
      "K",
      "변화 확인",
    ]);
    expect(sectionByLabel["지질 검사 기준"].sourceLabel).toBe("질병관리청 국가건강정보포털 이상지질혈증 관리");
    expect(sectionByLabel["지질 검사 기준"].sourceUrl).toContain("thtimt_cntnts_sn=124");
    expect(sectionByLabel["지질 검사 기준"].lines.map((line) => line.label)).toEqual([
      "적정",
      "경계",
      "높음",
      "정기검사",
    ]);
    expect(sectionByLabel["HDL 성별 기준"].sourceLabel).toBe("대한당뇨병학회 당뇨병 관리 목표");
    expect(sectionByLabel["HDL 성별 기준"].lines.map((line) => line.label)).toEqual([
      "남성 HDL",
      "여성 HDL",
      "낮음 확인",
    ]);
    expect(sectionByLabel["GGT 성별 기준"].sourceLabel).toBe("질병관리청 국가건강정보포털 임상 화학 검사");
    expect(sectionByLabel["GGT 성별 기준"].sourceUrl).toContain("cntnts_sn=5531");
    expect(sectionByLabel["GGT 성별 기준"].lines.map((line) => line.label)).toEqual([
      "남성 GGT",
      "여성 GGT",
      "상승 확인",
    ]);
    expect(sectionByLabel["AST/ALT 간기능 기준"].sourceLabel).toBe("질병관리청 국가건강정보포털 간기능검사");
    expect(sectionByLabel["AST/ALT 간기능 기준"].sourceUrl).toContain("cntnts_sn=5444");
    expect(sectionByLabel["AST/ALT 간기능 기준"].lines.map((line) => line.label)).toEqual([
      "AST",
      "ALT",
      "상승 확인",
    ]);
    expect(sectionByLabel["알부민/총단백 기준"].sourceLabel).toBe(
      "질병관리청 국가건강정보포털 임상 화학 검사",
    );
    expect(sectionByLabel["알부민/총단백 기준"].sourceUrl).toContain("cntnts_sn=5531");
    expect(sectionByLabel["알부민/총단백 기준"].lines.map((line) => line.label)).toEqual([
      "알부민",
      "총단백",
      "낮음 확인",
    ]);
    expect(sectionByLabel["칼슘 기준"].sourceLabel).toBe("질병관리청 국가건강정보포털 임상 화학 검사");
    expect(sectionByLabel["칼슘 기준"].sourceUrl).toContain("cntnts_sn=5531");
    expect(sectionByLabel["칼슘 기준"].lines.map((line) => line.label)).toEqual([
      "Ca",
      "상승 확인",
      "감소 확인",
    ]);
    expect(sectionByLabel["인산 기준"].sourceLabel).toBe("질병관리청 국가건강정보포털 임상 화학 검사");
    expect(sectionByLabel["인산 기준"].sourceUrl).toContain("cntnts_sn=5531");
    expect(sectionByLabel["인산 기준"].lines.map((line) => line.label)).toEqual([
      "P",
      "상승 확인",
      "감소 확인",
    ]);
    expect(sectionByLabel["요산 기준"].sourceLabel).toBe("질병관리청 국가건강정보포털 임상 화학 검사");
    expect(sectionByLabel["요산 기준"].sourceUrl).toContain("cntnts_sn=5531");
    expect(sectionByLabel["요산 기준"].lines.map((line) => line.label)).toEqual([
      "요산",
      "상승 맥락",
      "결과지 우선",
    ]);
    expect(sectionByLabel["헤모글로빈 입력 보조"].sourceLabel).toBe("서울아산병원 혈색소 검사 참고치");
    expect(sectionByLabel["헤모글로빈 입력 보조"].sourceUrl).toContain("managementId=119");
    expect(sectionByLabel["헤모글로빈 입력 보조"].lines.map((line) => line.label)).toEqual([
      "남성 헤모글로빈",
      "여성 헤모글로빈",
      "결과지 우선",
    ]);
    expect(sectionByLabel["CBC 입력 보조"].sourceLabel).toBe("서울아산병원 전혈구검사 참고치");
    expect(sectionByLabel["CBC 입력 보조"].sourceUrl).toContain("managementId=126");
    expect(sectionByLabel["CBC 입력 보조"].lines.map((line) => line.label)).toEqual([
      "WBC",
      "남성 RBC",
      "여성 RBC",
      "남성 Hct",
      "여성 Hct",
      "PLT",
      "결과지 우선",
    ]);
    expect(sectionByLabel["ANC 감염 위험 기준"].sourceLabel).toBe("국가암정보센터 항암 부작용 증상 관리 지침");
    expect(sectionByLabel["ANC 감염 위험 기준"].sourceUrl).toContain("d402e586-c237-419d-ae6f-da36d3b97109.pdf");
    expect(sectionByLabel["ANC 감염 위험 기준"].lines.map((line) => line.label)).toEqual([
      "ANC 발열 기준",
      "항암 후 시기",
      "동반 확인",
    ]);
    expect(sectionByLabel["혈소판 출혈 위험 기준"].sourceLabel).toBe("국가암정보센터 항암 부작용 증상 관리 지침");
    expect(sectionByLabel["혈소판 출혈 위험 기준"].sourceUrl).toContain("d402e586-c237-419d-ae6f-da36d3b97109.pdf");
    expect(sectionByLabel["혈소판 출혈 위험 기준"].lines.map((line) => line.label)).toEqual([
      "출혈 예방 기준",
      "의료진 상담 기준",
      "응급 확인",
    ]);
    expect(sectionByLabel["체온·감염 연락 기준"].sourceLabel).toBe("국가암정보센터 감염 의료진 상담 기준");
    expect(sectionByLabel["체온·감염 연락 기준"].sourceUrl).toContain("S1T435C439");
    expect(sectionByLabel["체온·감염 연락 기준"].lines.map((line) => line.label)).toEqual([
      "발열·오한 연락",
      "동반 증상",
      "기록 항목",
    ]);
  });

  it("filters dense standards range sections for quick scanning without changing section order", () => {
    const sections = buildVitalStandardRangeSections();

    expect(healthStandardRangeFilterOptions.map((option) => option.id)).toEqual([
      "all",
      "vitals",
      "diabetes",
      "labs",
      "cancer",
    ]);
    expect(healthStandardRangeFilterOptions.find((option) => option.id === "labs")?.detail).toBe(
      "신기능·전해질·간기능·단백·칼슘·인산·요산·혈액",
    );
    expect(filterVitalStandardRangeSections(sections, "all").map((section) => section.label)).toEqual(
      sections.map((section) => section.label),
    );
    expect(filterVitalStandardRangeSections(sections, "vitals").map((section) => section.label)).toEqual([
      "BMI 기준",
      "허리둘레 기준",
      "혈압 기준",
      "저혈압 확인 기준",
      "당뇨 추적 혈당 목표",
      "저혈당 확인 기준",
      "현저한 고혈당 확인 기준",
      "혈당 선별 기준",
      "체온·감염 연락 기준",
    ]);
    expect(filterVitalStandardRangeSections(sections, "diabetes").map((section) => section.label)).toEqual([
      "당뇨 추적 혈당 목표",
      "저혈당 확인 기준",
      "현저한 고혈당 확인 기준",
      "혈당 선별 기준",
      "A1C 검사 기준",
      "지질 검사 기준",
      "HDL 성별 기준",
    ]);
    expect(filterVitalStandardRangeSections(sections, "labs").map((section) => section.label)).toEqual([
      "A1C 검사 기준",
      "BUN/Cr 신기능 기준",
      "eGFR 신장여과율 기준",
      "UACR 알부민뇨 기준",
      "Na/K 전해질 기준",
      "지질 검사 기준",
      "HDL 성별 기준",
      "GGT 성별 기준",
      "AST/ALT 간기능 기준",
      "알부민/총단백 기준",
      "칼슘 기준",
      "인산 기준",
      "요산 기준",
      "헤모글로빈 입력 보조",
      "CBC 입력 보조",
      "ANC 감염 위험 기준",
      "혈소판 출혈 위험 기준",
    ]);
    expect(filterVitalStandardRangeSections(sections, "cancer").map((section) => section.label)).toEqual([
      "ANC 감염 위험 기준",
      "혈소판 출혈 위험 기준",
      "체온·감염 연락 기준",
    ]);
  });

  it("summarizes the selected standards range filter for quick visual scanning", () => {
    const sections = buildVitalStandardRangeSections();
    const cancerSummary = buildHealthStandardRangeFilterSummary(sections, "cancer");
    const diabetesSummary = buildHealthStandardRangeFilterSummary(sections, "diabetes");

    expect(cancerSummary).toEqual([
      { id: "visible-sections", label: "표시", value: "3/26개 기준" },
      { id: "risk-lines", label: "주의", value: "7개 위험 강조 행" },
      { id: "sex-specific", label: "성별", value: "남녀 공통" },
      { id: "official-sources", label: "근거", value: "공식 출처 2개" },
    ]);
    expect(diabetesSummary).toEqual([
      { id: "visible-sections", label: "표시", value: "7/26개 기준" },
      { id: "risk-lines", label: "주의", value: "8개 위험 강조 행" },
      { id: "sex-specific", label: "성별", value: "성별 분리 1개" },
      { id: "official-sources", label: "근거", value: "공식 출처 5개" },
    ]);
    expect(formatHealthStandardRangeFilterCopyStatus("암환자", cancerSummary)).toBe(
      "암환자 기준 복사됨 · 표시 3/26 · 주의 7 · 남녀 공통 · 출처 2개",
    );
    expect(formatHealthStandardRangeFilterCopyStatus("당뇨·지질", diabetesSummary)).toBe(
      "당뇨·지질 기준 복사됨 · 표시 7/26 · 주의 8 · 성별 분리 1개 · 출처 5개",
    );
    expect(formatHealthStandardRangeFilterCopyDescription("암환자", cancerSummary)).toBe(
      "한국 성인 건강 기준 암환자 범위 복사 · 표시 3/26 · 주의 7 · 남녀 공통 · 출처 2개",
    );
    expect(formatHealthStandardRangeFilterCopyDescription("당뇨·지질", diabetesSummary)).toBe(
      "한국 성인 건강 기준 당뇨·지질 범위 복사 · 표시 7/26 · 주의 8 · 성별 분리 1개 · 출처 5개",
    );
  });

  it("formats standards clipboard text for the selected quick-filter category", () => {
    const labsText = formatHealthStandardsClipboardText("female", "labs");
    const cancerText = formatHealthStandardsClipboardText("female", "cancer");

    expect(labsText).toContain("선택 범위: 검사 · 17/26개 표시");
    expect(labsText).toContain("선택 범위 요약");
    expect(labsText).toContain("- 표시: 17/26개 기준");
    expect(labsText).toContain("- 주의: 21개 위험 강조 행");
    expect(labsText).toContain("- 성별: 성별 분리 4개");
    expect(labsText).toContain("- 근거: 공식 출처 9개");
    expect(labsText).toContain("- BUN/Cr 신기능 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(labsText).toContain("- eGFR 신장여과율 기준 · 근거: 질병관리청 국가건강정보포털 만성콩팥병");
    expect(labsText).toContain("- UACR 알부민뇨 기준 · 근거: 질병관리청 국가건강정보포털 만성콩팥병");
    expect(labsText).toContain("- GGT 성별 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(labsText).toContain("- 알부민/총단백 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(labsText).toContain("- 칼슘 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(labsText).toContain("  - Ca: 남녀 공통 · 8.8-10.5 mg/dL");
    expect(labsText).toContain("- 인산 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(labsText).toContain("  - P: 남녀 공통 · 성인 2.5-4.5 mg/dL");
    expect(labsText).toContain("- 요산 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(labsText).toContain("- CBC 입력 보조 · 근거: 서울아산병원 전혈구검사 참고치");
    expect(labsText).toContain("  - 여성 RBC: 여성 입력 보조 · 4.0-5.4 10^6/uL");
    expect(labsText).toContain("  - 여성 Hct: 여성 입력 보조 · 36-46%");
    expect(labsText).toContain("- ANC 감염 위험 기준 · 근거: 국가암정보센터 항암 부작용 증상 관리 지침");
    expect(labsText).not.toContain("- BMI 기준 · 근거:");
    expect(labsText).not.toContain("- 혈압 기준 · 근거:");
    expect(labsText).not.toContain("- 체온·감염 연락 기준 · 근거:");
    expect(labsText).not.toContain("[판정 적용] 한국 성인 BMI");

    expect(cancerText).toContain("선택 범위: 암환자 · 3/26개 표시");
    expect(cancerText).toContain("선택 범위 요약");
    expect(cancerText).toContain("- 표시: 3/26개 기준");
    expect(cancerText).toContain("- 주의: 7개 위험 강조 행");
    expect(cancerText).toContain("- 성별: 남녀 공통");
    expect(cancerText).toContain("- 근거: 공식 출처 2개");
    expect(cancerText).toContain("- ANC 감염 위험 기준 · 근거: 국가암정보센터 항암 부작용 증상 관리 지침");
    expect(cancerText).toContain("- 혈소판 출혈 위험 기준 · 근거: 국가암정보센터 항암 부작용 증상 관리 지침");
    expect(cancerText).toContain("- 체온·감염 연락 기준 · 근거: 국가암정보센터 감염 의료진 상담 기준");
    expect(cancerText).not.toContain("- A1C 검사 기준 · 근거:");
    expect(cancerText).not.toContain("[입력 보조] 지질 검사 공통 프리셋");
  });

  it("formats profile waist input helper notes by selected sex", () => {
    expect(formatProfileWaistStandardNote("female")).toBe(
      "여성 85cm 이상 · 대한비만학회 비만 진료지침 2022",
    );
    expect(formatProfileWaistStandardNote("male")).toBe(
      "남성 90cm 이상 · 대한비만학회 비만 진료지침 2022",
    );
    expect(formatProfileWaistStandardNote("other")).toBe(
      "남성 90cm/여성 85cm · 대한비만학회 비만 진료지침 2022",
    );
  });

  it("formats source-backed standards clipboard text for the current profile sex", () => {
    const femaleText = formatHealthStandardsClipboardText("female");
    const maleText = formatHealthStandardsClipboardText("male");
    const otherText = formatHealthStandardsClipboardText("other");

    expect(femaleText).toContain("[한국 성인 건강 기준]");
    expect(femaleText).toContain(`주의: ${koreanHealthStandardUseBoundary}`);
    expect(femaleText).toContain("성별 기준 요약");
    expect(femaleText).toContain("현재 프로필 성별 적용");
    expect(femaleText).toContain("허리둘레: 여성 85cm 이상");
    expect(femaleText).toContain("HDL-C: 여성 프리셋은 50 mg/dL 이상");
    expect(femaleText).toContain("GGT: 여성 프리셋은 8-35 IU/L");
    expect(femaleText).toContain("[판정 적용] 한국 성인 혈압");
    expect(femaleText).toContain("근거: 질병관리청 국가건강정보포털 고혈압");
    expect(femaleText).toContain("[판정 적용] 저혈압 확인 기준");
    expect(femaleText).toContain("근거: 질병관리청 국가건강정보포털 저혈압");
    expect(femaleText).toContain("[판정 적용] 저혈당 확인 기준");
    expect(femaleText).toContain("근거: 질병관리청 국가건강정보포털 급성 합병증_저혈당");
    expect(femaleText).toContain("[판정 적용] 현저한 고혈당 확인 기준");
    expect(femaleText).toContain("근거: 질병관리청 국가건강정보포털 고혈당");
    expect(femaleText).toContain(
      "신체계측·혈압·혈당·신기능·전해질·지질·간기능·단백·칼슘·인산·요산·혈액·체온 숫자 범위",
    );
    expect(femaleText).toContain("- BMI 기준 · 근거: 대한비만학회 비만 진료지침 2022");
    expect(femaleText).toContain("- 허리둘레 기준 · 근거: 대한비만학회 비만 진료지침 2022");
    expect(femaleText).toContain("- 혈압 기준 · 근거: 질병관리청 국가건강정보포털 고혈압");
    expect(femaleText).toContain("- 저혈압 확인 기준 · 근거: 질병관리청 국가건강정보포털 저혈압");
    expect(femaleText).toContain("- 당뇨 추적 혈당 목표 · 근거: 대한당뇨병학회 당뇨병 관리 목표");
    expect(femaleText).toContain("- 저혈당 확인 기준 · 근거: 질병관리청 국가건강정보포털 급성 합병증_저혈당");
    expect(femaleText).toContain("- 현저한 고혈당 확인 기준 · 근거: 질병관리청 국가건강정보포털 고혈당");
    expect(femaleText).toContain("- 혈당 선별 기준 · 근거: 질병관리청 국가건강정보포털 당뇨병");
    expect(femaleText).toContain("- A1C 검사 기준 · 근거: 질병관리청 국가건강정보포털 당뇨병");
    expect(femaleText).toContain("- BUN/Cr 신기능 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(femaleText).toContain("- eGFR 신장여과율 기준 · 근거: 질병관리청 국가건강정보포털 만성콩팥병");
    expect(femaleText).toContain("- UACR 알부민뇨 기준 · 근거: 질병관리청 국가건강정보포털 만성콩팥병");
    expect(femaleText).toContain("- Na/K 전해질 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(femaleText).toContain("- 지질 검사 기준 · 근거: 질병관리청 국가건강정보포털 이상지질혈증 관리");
    expect(femaleText).toContain("- HDL 성별 기준 · 근거: 대한당뇨병학회 당뇨병 관리 목표");
    expect(femaleText).toContain("- GGT 성별 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(femaleText).toContain("- AST/ALT 간기능 기준 · 근거: 질병관리청 국가건강정보포털 간기능검사");
    expect(femaleText).toContain("- 알부민/총단백 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(femaleText).toContain("- 칼슘 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(femaleText).toContain("- 인산 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(femaleText).toContain("- 요산 기준 · 근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(femaleText).toContain("- 헤모글로빈 입력 보조 · 근거: 서울아산병원 혈색소 검사 참고치");
    expect(femaleText).toContain("- CBC 입력 보조 · 근거: 서울아산병원 전혈구검사 참고치");
    expect(femaleText).toContain("- ANC 감염 위험 기준 · 근거: 국가암정보센터 항암 부작용 증상 관리 지침");
    expect(femaleText).toContain(
      "- 혈소판 출혈 위험 기준 · 근거: 국가암정보센터 항암 부작용 증상 관리 지침",
    );
    expect(femaleText).toContain("- 체온·감염 연락 기준 · 근거: 국가암정보센터 감염 의료진 상담 기준");
    expect(femaleText).toContain("  - 정상: 남녀 공통 · 18.5-22.9 kg/m²");
    expect(femaleText).toContain("  - 비만: 남녀 공통 · 1단계 25-29.9");
    expect(femaleText).toContain("  - 남성 복부비만: 남성 기준 · 90cm 이상");
    expect(femaleText).toContain("  - 여성 복부비만: 여성 기준 · 85cm 이상");
    expect(femaleText).toContain("  - 정상: 남녀 공통 · <120/<80 mmHg");
    expect(femaleText).toContain("  - 저혈압 가능: 남녀 공통 · 90/60 mmHg 이하");
    expect(femaleText).toContain("  - 동반 증상: 남녀 공통 · 어지러움");
    expect(femaleText).toContain("  - 식전/공복 목표: 남녀 공통 · 80-130 mg/dL");
    expect(femaleText).toContain("  - 공복: 남녀 공통 · 정상 <100");
    expect(femaleText).toContain("  - A1C 정상: 남녀 공통 · 당화혈색소 <5.7%");
    expect(femaleText).toContain("  - A1C 관리 목표: 남녀 공통 · 성인 2형 당뇨병 일반 목표 6.5% 미만");
    expect(femaleText).toContain("  - BUN: 남녀 공통 · 10-26 mg/dL");
    expect(femaleText).toContain("  - Cr: 남녀 공통 · 성인 0.7-1.4 mg/dL");
    expect(femaleText).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 탈수·근육량");
    expect(femaleText).toContain("  - 알부민: 남녀 공통 · 3.3-5.2 g/dL");
    expect(femaleText).toContain("  - 낮음 확인: 남녀 공통 · 단독 진단이 아니라 간질환·신장질환");
    expect(femaleText).toContain("  - Ca: 남녀 공통 · 8.8-10.5 mg/dL");
    expect(femaleText).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 뼈 전이 암");
    expect(femaleText).toContain("  - 감소 확인: 남녀 공통 · 부갑상선저하증·신부전");
    expect(femaleText).toContain("  - P: 남녀 공통 · 성인 2.5-4.5 mg/dL");
    expect(femaleText).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 신부전·부갑상선기능저하증");
    expect(femaleText).toContain("  - 감소 확인: 남녀 공통 · 고칼슘혈증·이뇨제");
    expect(femaleText).toContain("  - 요산: 남녀 공통 입력 보조 · 3-7 mg/dL");
    expect(femaleText).toContain("  - 상승 맥락: 남녀 공통 · 단독 진단이 아니라 전이암·다발골수종");
    expect(femaleText).toContain("  - 보존 범위: 남녀 공통 · 60 mL/min/1.73m² 이상이어도");
    expect(femaleText).toContain("  - 60 미만 지속: 남녀 공통 · 60 미만이 3개월 이상 지속되면");
    expect(femaleText).toContain("  - 동반 확인: 남녀 공통 · 알부민뇨·혈뇨·소변검사");
    expect(femaleText).toContain("  - A1 낮음: 남녀 공통 · 알부민뇨 30 mg/g 미만");
    expect(femaleText).toContain("  - A2 증가: 남녀 공통 · 30-300 mg/g 범위는 반복 정량검사");
    expect(femaleText).toContain("  - A3 고도 증가: 남녀 공통 · 300 mg/g 이상이면");
    expect(femaleText).toContain("  - Na: 남녀 공통 · 135-145 mmol/L");
    expect(femaleText).toContain("  - K: 남녀 공통 · 3.5-5.5 mmol/L");
    expect(femaleText).toContain("  - 변화 확인: 남녀 공통 · 단독 진단이 아니라 구토·설사·탈수");
    expect(femaleText).toContain("  - 적정: 남녀 공통 · 총콜레스테롤 <200");
    expect(femaleText).toContain("  - 높음: 남녀 공통 · 총콜레스테롤 240 이상");
    expect(femaleText).toContain("  - 남성 HDL: 남성 기준 · 40 mg/dL 이상");
    expect(femaleText).toContain("  - 여성 HDL: 여성 기준 · 50 mg/dL 이상");
    expect(femaleText).toContain("  - 낮음 확인: 성별 분리 · 남성 40 미만 또는 여성 50 미만");
    expect(femaleText).toContain("  - 남성 GGT: 남성 기준 · 11-63 IU/L");
    expect(femaleText).toContain("  - 여성 GGT: 여성 기준 · 8-35 IU/L");
    expect(femaleText).toContain("  - 상승 확인: 성별 분리 · 간담도·음주·약물 영향");
    expect(femaleText).toContain("  - AST: 남녀 공통 · 0-40 IU/L");
    expect(femaleText).toContain("  - ALT: 남녀 공통 · 0-40 IU/L");
    expect(femaleText).toContain("  - 상승 확인: 남녀 공통 · 단독 진단이 아니라 증상·약물·영상");
    expect(femaleText).toContain("  - 남성 헤모글로빈: 남성 입력 보조 · 13.0-17.0 g/dL");
    expect(femaleText).toContain("  - 여성 헤모글로빈: 여성 입력 보조 · 12.0-16.0 g/dL");
    expect(femaleText).toContain("  - 결과지 우선: 성별·검사실·치료 상태");
    expect(femaleText).toContain("  - WBC: 남녀 공통 · 4.0-10.0 10^3/uL");
    expect(femaleText).toContain("  - 여성 RBC: 여성 입력 보조 · 4.0-5.4 10^6/uL");
    expect(femaleText).toContain("  - 여성 Hct: 여성 입력 보조 · 36-46%");
    expect(femaleText).toContain("  - PLT: 남녀 공통 · 150-450 10^3/uL");
    expect(femaleText).toContain("  - ANC 발열 기준: 암환자 공통 · ANC <500 cells/mm²");
    expect(femaleText).toContain("  - 항암 후 시기: 암환자 공통 · 항암제 주사 후 보통 7-14일");
    expect(femaleText).toContain("  - 동반 확인: 암환자 공통 · 기침·호흡곤란");
    expect(femaleText).toContain("  - 출혈 예방 기준: 암환자 공통 · 혈소판 <75,000/mm³");
    expect(femaleText).toContain("  - 의료진 상담 기준: 암환자 공통 · 혈소판 <50,000/mm³ 수준");
    expect(femaleText).toContain("  - 응급 확인: 암환자 공통 · 10분 이상 압박해도 계속되는 출혈");
    expect(femaleText).toContain(
      "  - 발열·오한 연락: 암환자 공통 · 오한 또는 체온 38℃ 이상",
    );
    expect(femaleText).toContain("  - 기록 항목: 암환자 공통 · 체온, 측정 시간");
    expect(maleText).toContain("허리둘레: 남성 90cm 이상");
    expect(maleText).toContain("GGT: 남성 프리셋은 11-63 IU/L");
    expect(maleText).toContain("헤모글로빈: 남성 프리셋은 13.0-17.0 g/dL");
    expect(otherText).toContain("성별 선택 전에는 남성 90cm/여성 85cm");
    expect(otherText).toContain("GGT: 성별 선택 시 남성 11-63, 여성 8-35 IU/L");
  });

  it("builds profile-specific sex standard notes for the dashboard and exports", () => {
    const femaleNotes = buildProfileSexStandardNotes("female")
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const maleNotes = buildProfileSexStandardNotes("male")
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");
    const unspecifiedNotes = buildProfileSexStandardNotes("other")
      .map((item) => `${item.label}: ${item.detail}`)
      .join("\n");

    expect(femaleNotes).toContain(
      "혈압·혈당·신기능·전해질·단백·칼슘·인산·요산: 성인 남녀 공통 기준과 BUN/Cr·eGFR·UACR·Na/K·Alb·Ca·P·요산 입력 보조값",
    );
    expect(femaleNotes).toContain("여성 85cm");
    expect(femaleNotes).toContain("여성 프리셋은 50 mg/dL");
    expect(femaleNotes).toContain("여성 프리셋은 8-35 IU/L");
    expect(femaleNotes).toContain("12.0-16.0 g/dL");
    expect(femaleNotes).toContain("여성 RBC 4.0-5.4 10^6/uL, Hct 36-46%");
    expect(maleNotes).toContain("남성 90cm");
    expect(maleNotes).toContain("남성 프리셋은 40 mg/dL");
    expect(maleNotes).toContain("남성 프리셋은 11-63 IU/L");
    expect(maleNotes).toContain("13.0-17.0 g/dL");
    expect(maleNotes).toContain("남성 RBC 4.2-6.3 10^6/uL, Hct 38-53%");
    expect(unspecifiedNotes).toContain("남성 90cm/여성 85cm");
    expect(unspecifiedNotes).toContain("남성 11-63, 여성 8-35 IU/L");
    expect(unspecifiedNotes).toContain("RBC 남성 4.2-6.3/여성 4.0-5.4 10^6/uL");
  });

  it("builds compact profile metric sex-standard chips without repeating common standards", () => {
    const femaleChips = buildProfileMetricSexStandardChips("female");
    const maleChips = buildProfileMetricSexStandardChips("male");
    const unspecifiedChips = buildProfileMetricSexStandardChips("other");

    expect(femaleChips.map((item) => item.id)).toEqual([
      "waist",
      "hdl",
      "ggt",
      "hemoglobin",
      "cbc",
    ]);
    expect(femaleChips.map((item) => item.standardId)).toEqual([
      "waist",
      "hdl",
      "ggt",
      "hemoglobin",
      "cbc",
    ]);
    expect(femaleChips.map((item) => item.sourceLabel)).toEqual([
      "대한비만학회 비만 진료지침 2022",
      "대한당뇨병학회 당뇨병 관리 목표",
      "질병관리청 국가건강정보포털 임상 화학 검사",
      "서울아산병원 혈색소 검사 참고치",
      "서울아산병원 전혈구검사 참고치",
    ]);
    expect(femaleChips.every((item) => item.sourceUrl.startsWith("https://"))).toBe(true);
    expect(femaleChips.map((item) => `${item.label}: ${item.detail}`).join("\n")).toContain(
      "허리둘레: 여성 85cm 이상이면 복부비만 기준 해당",
    );
    expect(femaleChips.map((item) => `${item.label}: ${item.detail}`).join("\n")).toContain(
      "GGT: 여성 프리셋은 8-35 IU/L, 결과지 기준 우선",
    );
    expect(maleChips.map((item) => `${item.label}: ${item.detail}`).join("\n")).toContain(
      "허리둘레: 남성 90cm 이상이면 복부비만 기준 해당",
    );
    expect(maleChips.map((item) => `${item.label}: ${item.detail}`).join("\n")).toContain(
      "헤모글로빈: 남성 프리셋은 13.0-17.0 g/dL, 결과지 기준 우선",
    );
    expect(maleChips.map((item) => `${item.label}: ${item.detail}`).join("\n")).toContain(
      "RBC/Hct: 남성 RBC 4.2-6.3 10^6/uL, Hct 38-53%, 결과지 기준 우선",
    );
    expect(unspecifiedChips.map((item) => `${item.label}: ${item.detail}`).join("\n")).toContain(
      "허리둘레: 성별 선택 전에는 남성 90cm/여성 85cm를 함께 확인",
    );
  });

  it("formats profile metric sex-standard copy text with source evidence", () => {
    const femaleChips = buildProfileMetricSexStandardChips("female");

    expect(formatProfileMetricSexStandardCopyDescription("여성", femaleChips)).toBe(
      "프로필 성별 기준 복사 · 여성 · 5개 기준 · 근거 5개",
    );
    expect(formatProfileMetricSexStandardCopyStatus("여성", femaleChips)).toBe(
      "프로필 성별 기준 복사됨 · 여성 · 5개 기준 · 근거 5개",
    );

    const text = formatProfileMetricSexStandardClipboardText("여성", femaleChips);

    expect(text).toContain("[프로필 성별 적용 기준]");
    expect(text).toContain("성별: 여성");
    expect(text).toContain("요약: 여성 · 5개 기준 · 근거 5개");
    expect(text).toContain("- 허리둘레: 여성 85cm 이상이면 복부비만 기준 해당");
    expect(text).toContain("근거: 대한비만학회 비만 진료지침 2022");
    expect(text).toContain("- HDL-C: 여성 프리셋은 50 mg/dL 이상");
    expect(text).toContain("근거: 대한당뇨병학회 당뇨병 관리 목표");
    expect(text).toContain("- GGT: 여성 프리셋은 8-35 IU/L, 결과지 기준 우선");
    expect(text).toContain("근거: 질병관리청 국가건강정보포털 임상 화학 검사");
    expect(text).toContain("- 헤모글로빈: 여성 프리셋은 12.0-16.0 g/dL, 결과지 기준 우선");
    expect(text).toContain("근거: 서울아산병원 혈색소 검사 참고치");
    expect(text).toContain("- RBC/Hct: 여성 RBC 4.0-5.4 10^6/uL, Hct 36-46%, 결과지 기준 우선");
    expect(text).toContain("근거: 서울아산병원 전혈구검사 참고치");
  });
});
