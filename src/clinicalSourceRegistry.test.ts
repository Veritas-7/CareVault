import { describe, expect, it } from "vitest";
import {
  auditClinicalSourceRegistry,
  clinicalSourceDomainPolicies,
  getClinicalSourceDomainPolicy,
  getClinicalSourceHost,
  isLocalUserEnteredRangeSource,
  listClinicalSourceRegistryItems,
} from "./clinicalSourceRegistry";

describe("clinicalSourceRegistry", () => {
  it("keeps clinical sources on approved official or public-health hosts", () => {
    const audit = auditClinicalSourceRegistry();

    expect(audit.errors).toEqual([]);
    expect(audit.warnings).toEqual([]);
    expect(audit.summary.total).toBeGreaterThan(70);
    expect(audit.summary.localUserRangeSources).toBe(1);
    expect(audit.summary.approvedHttpsSources).toBe(audit.summary.total - 1);

    const approvedHosts = new Set(clinicalSourceDomainPolicies.map((policy) => policy.host));
    const registryHosts = new Set(
      audit.items
        .filter((item) => !isLocalUserEnteredRangeSource(item.sourceUrl))
        .map((item) => getClinicalSourceHost(item.sourceUrl)),
    );
    expect([...registryHosts].sort()).toEqual([...approvedHosts].sort());
  });

  it("keeps source registry IDs unique and traceable to their source modules", () => {
    const items = listClinicalSourceRegistryItems();
    const registryIds = items.map((item) => item.registryId);

    expect(new Set(registryIds).size).toBe(items.length);
    expect(registryIds).toContain("health-standard:blood-pressure");
    expect(registryIds).toContain("health-standard:glucose-care");
    expect(registryIds).toContain("food-guidance:nccCervicalDiet");
  });

  it("keeps cervical cancer, hypertension, and diabetes source coverage explicit", () => {
    const items = listClinicalSourceRegistryItems();
    const byId = Object.fromEntries(items.map((item) => [item.registryId, item]));

    expect(byId["food-guidance:nccCervicalDiet"]).toMatchObject({
      sourceLabel: "국가암정보센터 자궁경부암 식생활",
      sourceUrl:
        "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    });
    expect(byId["health-standard:blood-pressure"]).toMatchObject({
      sourceLabel: "질병관리청 국가건강정보포털 고혈압",
    });
    expect(byId["health-standard:glucose-care"]).toMatchObject({
      sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
      sourceUrl: "https://www.diabetes.or.kr/general/info/treat/treat_01.php",
    });
  });

  it("treats user-entered lab ranges as a local sentinel, not an external source", () => {
    expect(isLocalUserEnteredRangeSource("local-user-entered-range")).toBe(true);
    expect(getClinicalSourceHost("local-user-entered-range")).toBe("local-user-entered-range");
    expect(getClinicalSourceDomainPolicy("local-user-entered-range")).toMatchObject({
      owner: "사용자 입력 검사실 기준 범위",
      sourceType: "local-user-range",
    });
  });
});
