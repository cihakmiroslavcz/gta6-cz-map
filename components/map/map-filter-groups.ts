import { getPointTypes, pointCategories, pointTypes, publishedPointCategories, type MapPoint } from "./map-points";

export type MapFilterType = Exclude<MapPoint["type"], "barberShop">;

export function getMapFilterType(type: MapPoint["type"]): MapFilterType {
  return type === "barberShop" ? "hairSalon" : type;
}

export function updateHiddenFilterTypes(hiddenTypes: ReadonlySet<MapFilterType>, types: readonly MapFilterType[], visible: boolean) {
  const updated = new Set(hiddenTypes);
  for (const type of types) {
    if (visible) updated.delete(type);
    else updated.add(type);
  }
  return updated;
}

export function getMapFilterGroups(points: readonly Pick<MapPoint, "type">[]) {
  const counts = new Map<MapFilterType, number>();
  if (points.length > 0) {
    for (const type of getPointTypes("robberies")) counts.set(getMapFilterType(type), 0);
  }
  for (const point of points) {
    const type = getMapFilterType(point.type);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  const rows = Array.from(counts, ([type, count]) => ({ type, count }))
    .sort((a, b) => pointTypes[a.type].label.localeCompare(pointTypes[b.type].label, "cs"));

  return [...publishedPointCategories, "uncategorized" as const].flatMap((id) => {
    const categoryRows = rows.filter(({ type }) => pointTypes[type].category === id);
    return categoryRows.length ? [{ id, ...pointCategories[id], rows: categoryRows }] : [];
  });
}
