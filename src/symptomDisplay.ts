import {
  formatSourceEvidenceList,
  parseSourceEvidence,
  type SourceEvidence,
} from "./sourceEvidence";

export type SymptomDisplaySource = {
  action: string;
  body: string;
};

export type SymptomDisplayParts = {
  body: string;
  compactSourceEvidence: string;
  sourceEvidence: string;
  sourceLabel: string;
  sourceUrl: string;
  sources: SourceEvidence[];
};

function mergeSymptomSources(...sourceLists: SourceEvidence[][]): SourceEvidence[] {
  const mergedSources: SourceEvidence[] = [];

  for (const sourceList of sourceLists) {
    for (const source of sourceList) {
      if (!source.sourceLabel.trim()) continue;
      if (
        mergedSources.some(
          (existingSource) =>
            existingSource.sourceLabel === source.sourceLabel
            && existingSource.sourceUrl === source.sourceUrl,
        )
      ) {
        continue;
      }
      mergedSources.push(source);
    }
  }

  return mergedSources;
}

export function buildSymptomDisplayParts(symptom: SymptomDisplaySource): SymptomDisplayParts {
  const primaryText = symptom.action || symptom.body;
  const primaryEvidence = parseSourceEvidence(primaryText);
  const secondaryText = symptom.action ? symptom.body : symptom.action;
  const secondaryEvidence = parseSourceEvidence(secondaryText);
  const sources = mergeSymptomSources(primaryEvidence.sources, secondaryEvidence.sources);
  const firstSource = sources[0];
  const sourceLabel = firstSource?.sourceLabel ?? "";
  const sourceUrl = firstSource?.sourceUrl ?? "";

  return {
    body: primaryEvidence.body || (primaryEvidence.sources.length ? "" : primaryText),
    compactSourceEvidence: sourceLabel ? `근거: ${sourceLabel}` : "",
    sourceEvidence: formatSourceEvidenceList(sources),
    sourceLabel,
    sources,
    sourceUrl,
  };
}
