import type { LabAssessment } from "./healthRules";
import { buildLabSourceEvidenceParts } from "./labSourceEvidence";

export type LabQuestionSource = {
  date: string;
  name: string;
  value: string;
  unit: string;
  lower: string;
  upper: string;
  note: string;
};

export type VisitQuestionDateSource = {
  date: string;
  nextDate?: string;
};

export function buildLabFollowupQuestionButtonLabels(
  labName: string,
  includesSourceEvidence: boolean,
) {
  const labelName = labName.trim() ? `${labName.trim()} 검사` : "검사 수치";
  const inclusionLabel = includesSourceEvidence ? "메모와 근거 포함" : "메모 포함";
  const actionLabel = `${labelName} 질문 추가 · ${inclusionLabel}`;

  return {
    ariaLabel: actionLabel,
    title: actionLabel,
  };
}

function formatLabValue(lab: LabQuestionSource) {
  return `${lab.name} ${lab.value}${lab.unit ? ` ${lab.unit}` : ""}`.trim();
}

function formatRange(lab: LabQuestionSource) {
  if (!lab.lower && !lab.upper) return "";
  const unit = lab.unit ? ` ${lab.unit}` : "";
  if (lab.lower && lab.upper) return `기준 ${lab.lower}-${lab.upper}${unit}`;
  if (lab.lower) return `기준 ${lab.lower}${unit} 이상`;
  return `기준 ${lab.upper}${unit} 이하`;
}

function compactNoteBody(noteBody: string) {
  return noteBody
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" / ");
}

function formatExistingLabNote(lab: LabQuestionSource) {
  const noteText = lab.note.trim();
  const evidence = buildLabSourceEvidenceParts(lab);
  if (!noteText && !evidence.sourceLabel) return "";

  const body = compactNoteBody(evidence.noteBody);
  const source = evidence.sourceLabel
    ? `출처: ${evidence.sourceLabel}${evidence.sourceUrl ? ` - ${evidence.sourceUrl}` : ""}`
    : "";

  if (!source) return body ? ` 기존 메모: ${body}` : "";

  return [` 기존 메모/근거: ${body || "출처 확인"}`, source].join("\n");
}

export function buildLabQuestionPrompt(lab: LabQuestionSource, assessment: LabAssessment) {
  const value = formatLabValue(lab);
  const range = formatRange(lab);
  const note = formatExistingLabNote(lab);

  if (assessment.flag === "low") {
    return `${lab.date} ${value}가 ${range || "입력 기준"}보다 낮게 기록됐습니다. 원인, 치료 일정 영향, 감염/식사/약 조정에서 주의할 점을 확인해야 할까요?${note}`;
  }

  if (assessment.flag === "high") {
    return `${lab.date} ${value}가 ${range || "입력 기준"}보다 높게 기록됐습니다. 추세 확인, 재검 필요성, 증상과의 관련성을 어떻게 봐야 할까요?${note}`;
  }

  if (assessment.flag === "unknown") {
    return `${lab.date} ${value}의 검사실 기준 범위를 아직 입력하지 않았습니다. 이 수치의 기준 범위와 다음 추적 시점을 확인해야 할까요?${note}`;
  }

  return `${lab.date} ${value}는 현재 입력 기준 범위 안입니다. 다음 추적 간격이나 함께 봐야 할 다른 수치를 확인해야 할까요?${note}`;
}

export function getNextQuestionDate(visits: VisitQuestionDateSource[], todayIso: string) {
  const futureDates = visits
    .flatMap((visit) => [visit.nextDate, visit.date])
    .filter((date): date is string => Boolean(date))
    .filter((date) => date >= todayIso)
    .sort();

  return futureDates[0] ?? todayIso;
}
