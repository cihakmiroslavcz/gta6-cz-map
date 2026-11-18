export const worldHalfSize = 16384;
export const maxZoom = 5;
export const mapViewOnlyParam = "pohled";

export type MapLocation = {
  x: number;
  y: number;
  zoom: number;
};

export function readMapLocation(params: { x?: unknown; y?: unknown; z?: unknown }): MapLocation | null {
  const { x, y, z } = params;
  if (typeof x !== "string" || typeof y !== "string" || typeof z !== "string" || !x.trim() || !y.trim() || !z.trim()) {
    return null;
  }

  const location = { x: Number(x), y: Number(y), zoom: Number(z) };
  return isValidMapLocation(location) ? location : null;
}

export function isValidMapLocation({ x, y, zoom }: MapLocation) {
  return Number.isFinite(x) && Number.isFinite(y) &&
    Math.max(Math.abs(x), Math.abs(y)) <= worldHalfSize &&
    Number.isInteger(zoom) && zoom >= 0 && zoom <= maxZoom;
}

export function mapLocationParams({ x, y, zoom }: MapLocation) {
  return new URLSearchParams({ x: x.toFixed(3), y: y.toFixed(3), z: String(zoom) });
}
