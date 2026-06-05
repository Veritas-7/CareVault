import {
  formatSourceEvidence,
  formatTextWithSourceEvidence,
  parseSourceEvidence,
} from "./sourceEvidence";
import { labPresets, type LabPresetId } from "./labPresets";

export type ParsedLabSourceEvidence = {
  noteBody: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type LabSourceEvidenceParts = ParsedLabSourceEvidence & {
  sourceOrigin: "none" | "note" | "preset";
  sourcePresetLabel: string;
};

export type LabSourceEvidenceInput = {
  name: string;
  note: string;
};

const labPresetNameAliases: Partial<Record<LabPresetId, string[]>> = {
  a1c: ["hba1c", "a1c", "당화혈색소"],
  albumin: ["albumin", "alb", "알부민"],
  alt: ["alt", "alanineaminotransferase", "알라닌아미노전이효소"],
  anc: ["anc", "absoluteneutrophilcount", "절대호중구수", "호중구수"],
  ast: ["ast", "aspartateaminotransferase", "아스파르테이트아미노전이효소"],
  bun: ["bun", "bloodureanitrogen", "요소질소"],
  calcium: ["calcium", "ca", "칼슘"],
  creatinine: ["creatinine", "cr", "크레아티닌"],
  egfr: ["egfr", "estimatedgfr", "추정사구체여과율", "사구체여과율"],
  "fasting-glucose": ["fpg", "fastingglucose", "공복혈당"],
  ggt: ["ggt", "gammagt", "감마지티피"],
  hematocrit: ["hct", "hematocrit", "헤마토크릿", "적혈구용적률"],
  "hdl-cholesterol": ["hdlc", "hdlcholesterol", "hdl", "hdl콜레스테롤"],
  hemoglobin: ["hgb", "hb", "hemoglobin", "헤모글로빈", "혈색소"],
  "ldl-cholesterol": ["ldlc", "ldlcholesterol", "ldl", "ldl콜레스테롤"],
  phosphate: ["phosphate", "p", "phosphorus", "인산", "인"],
  platelets: ["plt", "platelet", "platelets", "혈소판", "혈소판수"],
  potassium: ["potassium", "k", "칼륨"],
  "postprandial-glucose": ["pp2", "pp2glucose", "postprandialglucose", "식후2시간혈당", "식후혈당"],
  rbc: ["rbc", "redbloodcell", "redbloodcells", "적혈구", "적혈구수"],
  sodium: ["sodium", "na", "나트륨"],
  "total-cholesterol": ["totalcholesterol", "tc", "총콜레스테롤"],
  "total-protein": ["totalprotein", "tp", "총단백"],
  triglyceride: ["triglyceride", "tg", "중성지방"],
  "uric-acid": ["uricacid", "ua", "요산"],
  uacr: ["uacr", "urinealbumincreatinineratio", "소변알부민cr비", "알부민크레아티닌비"],
  wbc: ["wbc", "wbccount", "whitebloodcell", "whitebloodcells", "백혈구", "백혈구수"],
};

function normalizeLabName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "");
}

function aliasMatches(normalizedName: string, normalizedAlias: string) {
  if (!normalizedAlias) return false;
  if (normalizedName === normalizedAlias) return true;
  if (normalizedAlias.length < 3) return false;
  return normalizedName.includes(normalizedAlias);
}

export function resolveLabPresetSourceEvidence(labName: string) {
  const normalizedName = normalizeLabName(labName);
  if (!normalizedName) return null;

  for (const preset of labPresets) {
    const aliases = [
      preset.name,
      preset.label,
      ...(labPresetNameAliases[preset.id] ?? []),
    ].map(normalizeLabName);
    if (aliases.some((alias) => aliasMatches(normalizedName, alias))) {
      return {
        presetId: preset.id,
        presetLabel: preset.label,
        sourceLabel: preset.sourceLabel,
        sourceUrl: preset.sourceUrl,
      };
    }
  }

  return null;
}

export function parseLabSourceEvidence(note: string): ParsedLabSourceEvidence {
  const evidence = parseSourceEvidence(note);
  return {
    noteBody: evidence.body,
    sourceLabel: evidence.sourceLabel,
    sourceUrl: evidence.sourceUrl,
  };
}

export function buildLabSourceEvidenceParts(
  input: LabSourceEvidenceInput,
): LabSourceEvidenceParts {
  const parsed = parseLabSourceEvidence(input.note);
  if (parsed.sourceLabel) {
    return {
      ...parsed,
      sourceOrigin: "note",
      sourcePresetLabel: "",
    };
  }

  const presetEvidence = resolveLabPresetSourceEvidence(input.name);
  if (!presetEvidence) {
    return {
      ...parsed,
      sourceOrigin: "none",
      sourcePresetLabel: "",
    };
  }

  return {
    noteBody: parsed.noteBody,
    sourceLabel: presetEvidence.sourceLabel,
    sourceUrl: presetEvidence.sourceUrl,
    sourceOrigin: "preset",
    sourcePresetLabel: presetEvidence.presetLabel,
  };
}

export function formatLabSourceEvidence(sourceLabel: string, sourceUrl: string) {
  return formatSourceEvidence(sourceLabel, sourceUrl);
}

export function formatLabNoteWithSourceEvidence(note: string, labName = "") {
  if (!labName) return formatTextWithSourceEvidence(note);

  const evidence = buildLabSourceEvidenceParts({ name: labName, note });
  return [evidence.noteBody, formatLabSourceEvidence(evidence.sourceLabel, evidence.sourceUrl)]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" / ");
}
