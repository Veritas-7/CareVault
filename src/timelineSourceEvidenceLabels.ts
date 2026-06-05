type TimelineSourceEvidenceLabelInput = {
  date: string;
  position: number;
  title: string;
  sourceEvidenceTypeLabel?: string;
  sourceLabel: string;
};

export function formatTimelineSourceEvidenceLabel({
  date,
  position,
  title,
  sourceEvidenceTypeLabel,
  sourceLabel,
}: TimelineSourceEvidenceLabelInput) {
  const typeLabel = sourceEvidenceTypeLabel || "기록";
  return `${date} 최근 타임라인 ${position}번째 ${title} ${typeLabel} 근거 ${sourceLabel}`;
}

export function formatTimelineSourceEvidenceOpenLabel(
  input: TimelineSourceEvidenceLabelInput,
) {
  return `${formatTimelineSourceEvidenceLabel(input)} 열기`;
}
