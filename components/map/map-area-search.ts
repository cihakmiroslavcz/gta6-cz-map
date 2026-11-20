import type { MapPoint } from "./map-points";

export type MapArea = {
  key: string;
  name: string;
  bounds: [[number, number], [number, number]];
  pointCount: number;
};

export function normalizeSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("cs-CZ")
    .trim()
    .replace(/\s+/g, " ");
}

export function indexMapAreas(points: readonly MapPoint[]): MapArea[] {
  const areas = new Map<string, MapArea>();

  for (const { location, x, y } of points) {
    const names = new Map(location?.split(",").map((part) => [normalizeSearch(part), part.trim()] as const));
    for (const [key, name] of names) {
      if (!key || key === "?") continue;
      const area = areas.get(key);
      if (!area) {
        areas.set(key, { key, name, bounds: [[y, x], [y, x]], pointCount: 1 });
        continue;
      }
      const [southWest, northEast] = area.bounds;
      southWest[0] = Math.min(southWest[0], y);
      southWest[1] = Math.min(southWest[1], x);
      northEast[0] = Math.max(northEast[0], y);
      northEast[1] = Math.max(northEast[1], x);
      area.pointCount += 1;
    }
  }

  return Array.from(areas.values());
}

export function searchMapAreas(areas: readonly MapArea[], term: string): MapArea[] {
  if (!term) return [];
  const words = term.split(" ");
  const rank = (key: string) => key === term ? 0 : key.startsWith(term) ? 1 : 2;
  return areas.filter(({ key }) => words.every((word) => key.includes(word)))
    .sort((a, b) => rank(a.key) - rank(b.key) || b.pointCount - a.pointCount || a.name.localeCompare(b.name, "cs"));
}
