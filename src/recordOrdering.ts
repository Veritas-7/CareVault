export type DatedRecord = {
  date: string;
};

export type OrderedDatedRecord = DatedRecord & {
  order: number;
};

function getValidDateSortKey(date: string) {
  const trimmed = date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== trimmed
    ? ""
    : trimmed;
}

export function formatDatedRecordDisplayDate(date: string) {
  return getValidDateSortKey(date) || "날짜 미입력";
}

export function latestDatedItem<T extends DatedRecord>(items: readonly T[]) {
  return items
    .map((item, index) => ({ index, item }))
    .sort(
      (a, b) =>
        getValidDateSortKey(b.item.date).localeCompare(getValidDateSortKey(a.item.date)) ||
        b.index - a.index,
    )[0]?.item;
}

export function latestDatedItemMatching<T extends DatedRecord>(
  items: readonly T[],
  matches: (item: T) => boolean,
) {
  return latestDatedItem(items.filter(matches));
}

export function sortDatedItemsNewestFirst<T extends OrderedDatedRecord>(items: readonly T[]) {
  return [...items].sort(
    (a, b) =>
      getValidDateSortKey(b.date).localeCompare(getValidDateSortKey(a.date)) || b.order - a.order,
  );
}

export function sortDatedItemsOldestFirst<T extends OrderedDatedRecord>(items: readonly T[]) {
  return [...items].sort((a, b) => {
    const aDate = getValidDateSortKey(a.date);
    const bDate = getValidDateSortKey(b.date);

    if (aDate && bDate) return aDate.localeCompare(bDate) || a.order - b.order;
    if (aDate) return -1;
    if (bDate) return 1;
    return a.order - b.order;
  });
}
