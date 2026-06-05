export type ParsedSourceEvidence = {
  body: string;
  sourceLabel: string;
  sourceUrl: string;
};

const sourceLineUrlPattern = /^출처:\s*(.+?)\s+-\s+(https?:\/\/\S+)\s*$/;
const sourceLineLabelPattern = /^출처:\s*(.+?)\s*$/;
const inlineSourceUrlPattern = /\s+출처:\s*(.+?)\s+-\s+(https?:\/\/\S+)\s*$/;
const inlineSourceLabelPattern = /\s+출처:\s*(.+?)\s*$/;

export function parseSourceEvidence(text: string): ParsedSourceEvidence {
  const lines = text.split(/\r?\n/);
  let sourceLabel = "";
  let sourceUrl = "";
  const bodyLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(sourceLineUrlPattern) ?? trimmed.match(sourceLineLabelPattern);
    if (match && !sourceLabel) {
      sourceLabel = match[1].trim();
      sourceUrl = match[2]?.trim() ?? "";
      continue;
    }
    const inlineMatch =
      line.match(inlineSourceUrlPattern) ?? line.match(inlineSourceLabelPattern);
    if (inlineMatch && !sourceLabel) {
      const body = line.slice(0, inlineMatch.index).trimEnd();
      sourceLabel = inlineMatch[1].trim();
      sourceUrl = inlineMatch[2]?.trim() ?? "";
      if (body) bodyLines.push(body);
      continue;
    }
    bodyLines.push(line);
  }

  return {
    body: bodyLines.join("\n").trim(),
    sourceLabel,
    sourceUrl,
  };
}

export function formatSourceEvidence(sourceLabel: string, sourceUrl: string) {
  if (!sourceLabel) return "";
  return `근거: ${sourceLabel}${sourceUrl ? ` (${sourceUrl})` : ""}`;
}

export function formatTextWithSourceEvidence(text: string) {
  const evidence = parseSourceEvidence(text);
  return [evidence.body, formatSourceEvidence(evidence.sourceLabel, evidence.sourceUrl)]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" / ");
}
