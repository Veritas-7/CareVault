import { describe, expect, it } from "vitest";
import { localUserEnteredRangeSourceUrl } from "./clinicalSourceRegistry";
import {
  buildClinicalReviewPacket,
  clinicalReviewPacketRequiredSourceIds,
  formatClinicalReviewPacketMarkdown,
} from "./clinicalReviewPacket";

describe("clinicalReviewPacket", () => {
  it("packages the source registry into a clinician review input without claiming approval", () => {
    const packet = buildClinicalReviewPacket();
    const markdown = formatClinicalReviewPacketMarkdown(packet);

    expect(packet.registryAudit.errors).toEqual([]);
    expect(packet.registryAudit.warnings).toEqual([]);
    expect(packet.summary.totalSources).toBeGreaterThan(70);
    expect(packet.summary.localUserRangeSources).toBe(1);
    expect(packet.summary.approvedHttpsSources).toBe(packet.summary.totalSources - 1);
    expect(markdown).toContain("clinician/source review required");
    expect(markdown).toContain("real private HWP/HWPX sample smoke not executed");
    expect(markdown).toContain("Browser/cmux UI QA is intentionally excluded");
    expect(markdown).toContain("진단·처방·치료 지시를 생성하거나");
    expect(markdown).not.toContain("완료 승인");
    expect(markdown).not.toContain("진단합니다");
    expect(markdown).not.toContain("처방합니다");
    expect(markdown).not.toContain("치료합니다");
    expect(markdown).not.toContain("혈압약을 끊으세요");
    expect(markdown).not.toContain("인슐린 용량을 올리세요");
  });

  it("keeps cervical cancer, hypertension, and diabetes review highlights explicit", () => {
    const packet = buildClinicalReviewPacket();
    const highlightsById = Object.fromEntries(
      packet.keySourceHighlights.map((highlight) => [highlight.registryId, highlight]),
    );

    for (const requiredSource of clinicalReviewPacketRequiredSourceIds) {
      expect(highlightsById[requiredSource.registryId]).toMatchObject({
        registryId: requiredSource.registryId,
        status: "present",
        title: requiredSource.title,
      });
    }

    expect(highlightsById["food-guidance:nccCervicalDiet"]).toMatchObject({
      sourceLabel: "국가암정보센터 자궁경부암 식생활",
      sourceUrl:
        "https://www.cancer.go.kr/lay1/program/S1T211C223/cancer/view.do?cancer_seq=4877&menu_seq=4899",
    });
    expect(highlightsById["health-standard:blood-pressure"]).toMatchObject({
      sourceLabel: "질병관리청 국가건강정보포털 고혈압",
    });
    expect(highlightsById["health-standard:glucose-care"]).toMatchObject({
      sourceLabel: "대한당뇨병학회 당뇨병 관리 목표",
      sourceUrl: "https://www.diabetes.or.kr/general/info/treat/treat_01.php",
    });
  });

  it("summarizes approved source owners and keeps URLs HTTPS or local sentinel only", () => {
    const packet = buildClinicalReviewPacket();
    const owners = packet.domainSummaries.map((summary) => summary.owner);

    expect(owners).toContain("질병관리청 국가건강정보포털");
    expect(owners).toContain("국가암정보센터");
    expect(owners).toContain("대한당뇨병학회");
    expect(owners).toContain("사용자 입력 검사실 기준 범위");

    for (const item of packet.registryAudit.items) {
      if (item.sourceUrl === localUserEnteredRangeSourceUrl) {
        expect(item.sourceUrl).toBe(localUserEnteredRangeSourceUrl);
      } else {
        expect(item.sourceUrl).toMatch(/^https:\/\//);
      }
    }
  });
});
