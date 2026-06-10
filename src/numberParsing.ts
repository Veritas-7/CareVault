const finiteNumberTextPattern =
  /^[+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?$/;

export function parseFiniteNumberText(
  value: string | undefined,
): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !finiteNumberTextPattern.test(trimmed)) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}
