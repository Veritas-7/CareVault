import { foodGuidanceSources } from "./healthRules";
import { koreanHealthStandardCoverage } from "./healthStandards";

export type ClinicalSourceArea = "food-guidance" | "health-standard";

export type ClinicalSourceDomainPolicy = {
  host: string;
  owner: string;
  sourceType:
    | "hospital-reference"
    | "international-public-health"
    | "korean-food-safety"
    | "korean-public-health"
    | "local-user-range"
    | "professional-society";
};

export type ClinicalSourceRegistryItem = {
  area: ClinicalSourceArea;
  registryId: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type ClinicalSourceRegistryIssue = {
  level: "error" | "warning";
  message: string;
  registryId: string;
};

export type ClinicalSourceRegistryAudit = {
  errors: ClinicalSourceRegistryIssue[];
  items: ClinicalSourceRegistryItem[];
  summary: {
    approvedHttpsSources: number;
    localUserRangeSources: number;
    total: number;
  };
  warnings: ClinicalSourceRegistryIssue[];
};

export const localUserEnteredRangeSourceUrl = "local-user-entered-range";

export const clinicalSourceDomainPolicies: ClinicalSourceDomainPolicy[] = [
  {
    host: "health.kdca.go.kr",
    owner: "질병관리청 국가건강정보포털",
    sourceType: "korean-public-health",
  },
  {
    host: "www.cancer.go.kr",
    owner: "국가암정보센터",
    sourceType: "korean-public-health",
  },
  {
    host: "cancer.go.kr",
    owner: "국가암정보센터",
    sourceType: "korean-public-health",
  },
  {
    host: "www.diabetes.or.kr",
    owner: "대한당뇨병학회",
    sourceType: "professional-society",
  },
  {
    host: "general.kosso.or.kr",
    owner: "대한비만학회",
    sourceType: "professional-society",
  },
  {
    host: "rso.amc.seoul.kr",
    owner: "서울아산병원 검사 참고치",
    sourceType: "hospital-reference",
  },
  {
    host: "ent.amc.seoul.kr",
    owner: "서울아산병원 검사 참고치",
    sourceType: "hospital-reference",
  },
  {
    host: "www.cdc.gov",
    owner: "CDC",
    sourceType: "international-public-health",
  },
  {
    host: "www.foodsafetykorea.go.kr",
    owner: "식품안전나라",
    sourceType: "korean-food-safety",
  },
  {
    host: "www.mfds.go.kr",
    owner: "식품의약품안전처",
    sourceType: "korean-food-safety",
  },
];

const clinicalSourceDomainPolicyByHost = new Map(
  clinicalSourceDomainPolicies.map((policy) => [policy.host, policy]),
);

export function isLocalUserEnteredRangeSource(sourceUrl: string) {
  return sourceUrl.trim() === localUserEnteredRangeSourceUrl;
}

export function getClinicalSourceHost(sourceUrl: string) {
  if (isLocalUserEnteredRangeSource(sourceUrl)) return "local-user-entered-range";
  try {
    return new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function getClinicalSourceDomainPolicy(sourceUrl: string) {
  if (isLocalUserEnteredRangeSource(sourceUrl)) {
    return {
      host: localUserEnteredRangeSourceUrl,
      owner: "사용자 입력 검사실 기준 범위",
      sourceType: "local-user-range",
    } satisfies ClinicalSourceDomainPolicy;
  }
  return clinicalSourceDomainPolicyByHost.get(getClinicalSourceHost(sourceUrl));
}

export function listClinicalSourceRegistryItems(): ClinicalSourceRegistryItem[] {
  const healthStandardSources = koreanHealthStandardCoverage.map((item) => ({
    area: "health-standard" as const,
    registryId: `health-standard:${item.id}`,
    sourceLabel: item.sourceLabel,
    sourceUrl: item.sourceUrl,
  }));
  const foodGuidanceSourceItems = Object.entries(foodGuidanceSources).map(([sourceId, source]) => ({
    area: "food-guidance" as const,
    registryId: `food-guidance:${sourceId}`,
    sourceLabel: source.label,
    sourceUrl: source.url,
  }));
  return [...healthStandardSources, ...foodGuidanceSourceItems].sort((left, right) =>
    left.registryId.localeCompare(right.registryId),
  );
}

function auditClinicalSourceRegistryItem(item: ClinicalSourceRegistryItem) {
  const issues: ClinicalSourceRegistryIssue[] = [];
  const sourceLabel = item.sourceLabel.trim();
  const sourceUrl = item.sourceUrl.trim();

  if (!sourceLabel) {
    issues.push({
      level: "error",
      message: "clinical source label is required",
      registryId: item.registryId,
    });
  }

  if (!sourceUrl) {
    issues.push({
      level: "error",
      message: "clinical source URL is required",
      registryId: item.registryId,
    });
    return issues;
  }

  if (isLocalUserEnteredRangeSource(sourceUrl)) return issues;

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    issues.push({
      level: "error",
      message: "clinical source URL must parse as a URL or the local range sentinel",
      registryId: item.registryId,
    });
    return issues;
  }

  if (url.protocol !== "https:") {
    issues.push({
      level: "error",
      message: "clinical source URL must use HTTPS",
      registryId: item.registryId,
    });
  }

  if (!getClinicalSourceDomainPolicy(sourceUrl)) {
    issues.push({
      level: "error",
      message: `clinical source host is not approved: ${url.hostname}`,
      registryId: item.registryId,
    });
  }

  return issues;
}

export function auditClinicalSourceRegistry(
  items: ClinicalSourceRegistryItem[] = listClinicalSourceRegistryItems(),
): ClinicalSourceRegistryAudit {
  const issues = items.flatMap(auditClinicalSourceRegistryItem);
  const localUserRangeSources = items.filter((item) =>
    isLocalUserEnteredRangeSource(item.sourceUrl),
  ).length;
  return {
    errors: issues.filter((issue) => issue.level === "error"),
    items,
    summary: {
      approvedHttpsSources: items.length - localUserRangeSources,
      localUserRangeSources,
      total: items.length,
    },
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}
