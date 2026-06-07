export type ParsedSourceEvidence = {
  body: string;
  sourceLabel: string;
  sourceUrl: string;
  sources: SourceEvidence[];
};

export type SourceEvidence = {
  sourceLabel: string;
  sourceUrl: string;
};

const sourceLineUrlPattern = /^출처:\s*(.+?)\s+-\s+(https?:\/\/\S+)\s*$/;
const sourceLineLabelPattern = /^출처:\s*(.+?)\s*$/;
const inlineSourceUrlPattern = /\s+출처:\s*(.+?)\s+-\s+(https?:\/\/\S+)\s*$/;
const inlineSourceLabelPattern = /\s+출처:\s*(.+?)\s*$/;

function appendSource(
  sources: SourceEvidence[],
  sourceLabel: string,
  sourceUrl: string,
) {
  const normalizedLabel = sourceLabel.trim();
  const normalizedUrl = sourceUrl.trim();
  if (!normalizedLabel) return;
  if (
    sources.some(
      (source) =>
        source.sourceLabel === normalizedLabel && source.sourceUrl === normalizedUrl,
    )
  ) {
    return;
  }
  sources.push({
    sourceLabel: normalizedLabel,
    sourceUrl: normalizedUrl,
  });
}

export function parseSourceEvidence(text: string): ParsedSourceEvidence {
  const lines = text.split(/\r?\n/);
  const bodyLines: string[] = [];
  const sources: SourceEvidence[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(sourceLineUrlPattern) ?? trimmed.match(sourceLineLabelPattern);
    if (match) {
      appendSource(sources, match[1], match[2] ?? "");
      continue;
    }
    const inlineMatch =
      line.match(inlineSourceUrlPattern) ?? line.match(inlineSourceLabelPattern);
    if (inlineMatch) {
      const body = line.slice(0, inlineMatch.index).trimEnd();
      appendSource(sources, inlineMatch[1], inlineMatch[2] ?? "");
      if (body) bodyLines.push(body);
      continue;
    }
    bodyLines.push(line);
  }

  const firstSource = sources[0];
  return {
    body: bodyLines.join("\n").trim(),
    sourceLabel: firstSource?.sourceLabel ?? "",
    sourceUrl: firstSource?.sourceUrl ?? "",
    sources,
  };
}

export function formatSourceEvidence(sourceLabel: string, sourceUrl: string) {
  if (!sourceLabel) return "";
  return `근거: ${sourceLabel}${sourceUrl ? ` (${sourceUrl})` : ""}`;
}

export function formatSourceEvidenceList(sources: SourceEvidence[]) {
  const formattedSources = sources
    .map((source) =>
      formatSourceEvidence(source.sourceLabel, source.sourceUrl).replace(/^근거:\s*/, ""),
    )
    .filter(Boolean);
  if (!formattedSources.length) return "";
  return `근거: ${formattedSources.join("; ")}`;
}

export function formatTextWithSourceEvidence(text: string) {
  const evidence = parseSourceEvidence(text);
  return [evidence.body, formatSourceEvidenceList(evidence.sources)]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" / ");
}
