export type DatedRecord = {
  date: string;
};

export type OrderedDatedRecord = DatedRecord & {
  order: number;
};

export function latestDatedItem<T extends DatedRecord>(items: readonly T[]) {
  return items
    .map((item, index) => ({ index, item }))
    .sort((a, b) => b.item.date.localeCompare(a.item.date) || b.index - a.index)[0]?.item;
}

export function latestDatedItemMatching<T extends DatedRecord>(
  items: readonly T[],
  matches: (item: T) => boolean,
) {
  return latestDatedItem(items.filter(matches));
}

export function sortDatedItemsNewestFirst<T extends OrderedDatedRecord>(items: readonly T[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order);
}
