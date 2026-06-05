export type CareActionEvidenceLink = {
  sourceLabel: string;
  sourceUrl: string;
};

export type CareActionVisibleDetailParts = {
  body: string;
  evidenceLinks: CareActionEvidenceLink[];
};

const careActionEvidenceGroupPattern =
  /(?:\s*\/\s*|\s*\()\s*근거:\s*((?:[^()]+?\s*\(https?:\/\/[^)]+\)(?:\s*;\s*)?)+)\)?/g;
const careActionEvidenceLinkPattern = /([^();]+?)\s*\((https?:\/\/[^)]+)\)/g;

export function buildCareActionVisibleDetailParts(detail: string): CareActionVisibleDetailParts {
  const evidenceGroups = Array.from(detail.matchAll(careActionEvidenceGroupPattern));
  if (!evidenceGroups.length) return { body: detail, evidenceLinks: [] };

  const evidenceLinks = evidenceGroups.flatMap((group) =>
    Array.from(group[1].matchAll(careActionEvidenceLinkPattern)).map((match) => ({
      sourceLabel: match[1].trim(),
      sourceUrl: match[2].trim(),
    })),
  );

  if (!evidenceLinks.length) return { body: detail, evidenceLinks: [] };

  const body = evidenceGroups
    .reduceRight((nextBody, group) => {
      const start = group.index ?? 0;
      return `${nextBody.slice(0, start)}${nextBody.slice(start + group[0].length)}`;
    }, detail)
    .replace(/\s*\/\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    body: body || detail,
    evidenceLinks,
  };
}
