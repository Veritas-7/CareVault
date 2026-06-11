import {
  auditClinicalSourceRegistry,
  getClinicalSourceDomainPolicy,
  getClinicalSourceHost,
  type ClinicalSourceDomainPolicy,
  type ClinicalSourceRegistryAudit,
  type ClinicalSourceRegistryItem,
} from "./clinicalSourceRegistry";

export type ClinicalReviewPacketDomainSummary = {
  host: string;
  owner: string;
  registryIds: string[];
  sourceCount: number;
  sourceType: ClinicalSourceDomainPolicy["sourceType"] | "unapproved";
};

export type ClinicalReviewPacketSourceHighlight = {
  area?: ClinicalSourceRegistryItem["area"];
  registryId: string;
  sourceLabel?: string;
  sourceUrl?: string;
  status: "missing" | "present";
  title: string;
};

export type ClinicalReviewPacketRequiredCheck = {
  detail: string;
  id: string;
  label: string;
  status: "blocked" | "required";
};

export type ClinicalReviewPacket = {
  domainSummaries: ClinicalReviewPacketDomainSummary[];
  generatedBy: string;
  keySourceHighlights: ClinicalReviewPacketSourceHighlight[];
  purpose: string;
  registryAudit: ClinicalSourceRegistryAudit;
  remainingBlockers: string[];
  requiredChecks: ClinicalReviewPacketRequiredCheck[];
  summary: {
    approvedDomainCount: number;
    approvedHttpsSources: number;
    localUserRangeSources: number;
    registryErrorCount: number;
    registryWarningCount: number;
    totalSources: number;
  };
  title: string;
  useBoundary: string;
};

export const clinicalReviewPacketUseBoundary =
  "CareVault는 저장된 기록과 공식 출처를 진료 전 정리하는 앱입니다. "
  + "진단·처방·치료 지시를 생성하거나 약물 중단/증량/감량을 권하지 않습니다. "
  + "모든 임상 판단은 진료팀 확인 대상입니다.";

export const clinicalReviewPacketRequiredSourceIds = [
  {
    registryId: "food-guidance:nccCervicalDiet",
    title: "자궁경부암 식생활 공식 출처",
  },
  {
    registryId: "health-standard:blood-pressure",
    title: "고혈압 혈압 기준 공식 출처",
  },
  {
    registryId: "health-standard:glucose-care",
    title: "당뇨 관리 목표 공식 출처",
  },
] as const;

export function buildClinicalReviewPacketRequiredChecks(): ClinicalReviewPacketRequiredCheck[] {
  return [
    {
      detail:
        "CareVault의 출처 label, URL, 문구, 앱 내 질문 초안이 실제 진료 전 준비용으로 적절한지 "
        + "의료진 또는 임상 검토자가 확인해야 합니다.",
      id: "clinician-source-review",
      label: "clinician/source review required",
      status: "required",
    },
    {
      detail:
        "자궁경부암, 고혈압, 당뇨가 함께 있는 실제 환자 워크플로우에서 기록, 검색, export, "
        + "care-team question draft가 과잉 해석 없이 작동하는지 확인해야 합니다.",
      id: "real-workflow-review",
      label: "real patient workflow review required",
      status: "required",
    },
    {
      detail:
        "명령형 smoke harness는 준비되었지만 실제 사용자/private HWP/HWPX/HWPML 의료 문서 샘플이 "
        + "제공되지 않아 아직 실행되지 않았습니다.",
      id: "private-hwp-hwpx-sample-smoke",
      label: "real private HWP/HWPX sample smoke not executed",
      status: "blocked",
    },
  ];
}

export function summarizeClinicalSourceDomains(
  items: ClinicalSourceRegistryItem[],
): ClinicalReviewPacketDomainSummary[] {
  const summariesByHost = new Map<string, ClinicalReviewPacketDomainSummary>();

  for (const item of items) {
    const policy = getClinicalSourceDomainPolicy(item.sourceUrl);
    const host = policy?.host ?? (getClinicalSourceHost(item.sourceUrl) || "unapproved");
    const summary = summariesByHost.get(host) ?? {
      host,
      owner: policy?.owner ?? "승인되지 않은 출처 호스트",
      registryIds: [],
      sourceCount: 0,
      sourceType: policy?.sourceType ?? "unapproved",
    };

    summary.registryIds.push(item.registryId);
    summary.sourceCount += 1;
    summariesByHost.set(host, summary);
  }

  return [...summariesByHost.values()]
    .map((summary) => ({
      ...summary,
      registryIds: [...summary.registryIds].sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => {
      if (right.sourceCount !== left.sourceCount) return right.sourceCount - left.sourceCount;
      return left.owner.localeCompare(right.owner);
    });
}

export function buildClinicalReviewPacket(
  registryAudit: ClinicalSourceRegistryAudit = auditClinicalSourceRegistry(),
): ClinicalReviewPacket {
  const itemsById = new Map(registryAudit.items.map((item) => [item.registryId, item]));
  const domainSummaries = summarizeClinicalSourceDomains(registryAudit.items);
  const keySourceHighlights = clinicalReviewPacketRequiredSourceIds.map((requiredSource) => {
    const item = itemsById.get(requiredSource.registryId);
    if (!item) {
      return {
        registryId: requiredSource.registryId,
        status: "missing",
        title: requiredSource.title,
      } satisfies ClinicalReviewPacketSourceHighlight;
    }

    return {
      area: item.area,
      registryId: item.registryId,
      sourceLabel: item.sourceLabel,
      sourceUrl: item.sourceUrl,
      status: "present",
      title: requiredSource.title,
    } satisfies ClinicalReviewPacketSourceHighlight;
  });

  return {
    domainSummaries,
    generatedBy: "CareVault clinical source registry",
    keySourceHighlights,
    purpose:
      "Command-only packet for clinician/source reviewers to inspect CareVault's source coverage, "
      + "evidence boundaries, and remaining readiness blockers.",
    registryAudit,
    remainingBlockers: [
      "Real user/private HWP/HWPX sample smoke has not been executed because no private sample path was supplied.",
      "Clinician/source review on real patient workflows is still required before production medical readiness can be claimed.",
      "Browser/cmux UI QA is intentionally excluded in this session per user constraint.",
    ],
    requiredChecks: buildClinicalReviewPacketRequiredChecks(),
    summary: {
      approvedDomainCount: domainSummaries.filter((summary) => summary.sourceType !== "unapproved")
        .length,
      approvedHttpsSources: registryAudit.summary.approvedHttpsSources,
      localUserRangeSources: registryAudit.summary.localUserRangeSources,
      registryErrorCount: registryAudit.errors.length,
      registryWarningCount: registryAudit.warnings.length,
      totalSources: registryAudit.summary.total,
    },
    title: "CareVault Clinical Review Packet",
    useBoundary: clinicalReviewPacketUseBoundary,
  };
}

function formatIssueLines(issues: ClinicalSourceRegistryAudit["errors"]) {
  if (issues.length === 0) return ["- none"];
  return issues.map((issue) => `- ${issue.level}: ${issue.registryId} - ${issue.message}`);
}

function formatSourceHighlight(highlight: ClinicalReviewPacketSourceHighlight) {
  if (highlight.status === "missing") {
    return `- MISSING: ${highlight.title} (${highlight.registryId})`;
  }

  return `- ${highlight.title}: ${highlight.sourceLabel} - ${highlight.sourceUrl}`;
}

function formatDomainSummary(summary: ClinicalReviewPacketDomainSummary) {
  return `- ${summary.owner} (${summary.host}, ${summary.sourceType}): ${summary.sourceCount} sources`;
}

function formatRequiredCheck(check: ClinicalReviewPacketRequiredCheck) {
  return `- [ ] ${check.label} (${check.status}): ${check.detail}`;
}

export function formatClinicalReviewPacketMarkdown(
  packet: ClinicalReviewPacket = buildClinicalReviewPacket(),
) {
  return [
    `# ${packet.title}`,
    "",
    `Generated by: ${packet.generatedBy}`,
    "",
    "## Purpose",
    packet.purpose,
    "",
    "## Use Boundary",
    packet.useBoundary,
    "",
    "## Source Registry Summary",
    `- Total registry sources: ${packet.summary.totalSources}`,
    `- Approved HTTPS sources: ${packet.summary.approvedHttpsSources}`,
    `- Local user-entered lab range sentinels: ${packet.summary.localUserRangeSources}`,
    `- Approved domain groups: ${packet.summary.approvedDomainCount}`,
    `- Registry errors: ${packet.summary.registryErrorCount}`,
    `- Registry warnings: ${packet.summary.registryWarningCount}`,
    "",
    "## Key Source Coverage",
    ...packet.keySourceHighlights.map(formatSourceHighlight),
    "",
    "## Domain Summary",
    ...packet.domainSummaries.map(formatDomainSummary),
    "",
    "## Required Review Checks",
    ...packet.requiredChecks.map(formatRequiredCheck),
    "",
    "## Remaining Blockers",
    ...packet.remainingBlockers.map((blocker) => `- ${blocker}`),
    "",
    "## Registry Errors",
    ...formatIssueLines(packet.registryAudit.errors),
    "",
    "## Registry Warnings",
    ...formatIssueLines(packet.registryAudit.warnings),
  ].join("\n");
}
