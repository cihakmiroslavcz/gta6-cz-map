import type { MaterialIconName } from "@/components/MaterialIcon";
import type { MapPoint } from "./map-points";

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

const groups: readonly { id: string; label: string; icon: MaterialIconName; types: readonly MapFilterType[] }[] = [
  { id: "places", label: "Místa a příroda", icon: "map", types: [
    "attraction", "museum", "lighthouse", "naturalSite", "park", "lake", "waterway", "mountain", "hill", "ridge", "event",
  ] },
  { id: "shops", label: "Obchody a podniky", icon: "storefront", types: [
    "hairSalon", "tattoo", "clothingStore", "shoeStore", "electronicsStore", "supermarket", "liquorStore", "restaurant",
    "pawnshop", "gunShop", "motorcycleShop", "shop",
  ] },
  { id: "garages", label: "Autoservisy", icon: "car_repair", types: ["autoShop"] },
  { id: "services", label: "Služby", icon: "build", types: ["gasStation", "carWash", "pharmacy", "hotel", "service"] },
  { id: "activities", label: "Sport a aktivity", icon: "sports_tennis", types: [
    "racetrack", "gym", "golfCourse", "tennis", "volleyball", "stadium", "arena", "leisure",
  ] },
  { id: "collectibles", label: "Poklady a sběratelské předměty", icon: "sell", types: ["treasure"] },
  { id: "nightlife", label: "Zábava a noční život", icon: "nightlife", types: [
    "bar", "nightclub", "stripclub", "cinema", "casino", "ferrisWheel",
  ] },
  { id: "transport", label: "Doprava", icon: "directions_transit", types: [
    "airport", "marina", "trainStation", "metroStation", "busStop", "parking", "bridge", "tunnel", "transit",
  ] },
  { id: "buildings", label: "Budovy a infrastruktura", icon: "account_balance", types: [
    "police", "hospital", "publicBuilding", "church", "residential", "office", "industrial", "warehouse", "waterTower", "transmitter",
  ] },
];

export function getMapFilterGroups(points: readonly Pick<MapPoint, "type">[]) {
  const counts = new Map<MapFilterType, number>();
  for (const point of points) {
    const type = getMapFilterType(point.type);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  const visibleGroups = groups.flatMap(({ types, ...group }) => {
    const rows = types.flatMap((type) => {
      const count = counts.get(type);
      counts.delete(type);
      return count ? [{ type, count }] : [];
    });
    return rows.length ? [{ ...group, rows }] : [];
  });

  if (counts.size) {
    visibleGroups.push({ id: "other", label: "Ostatní", icon: "location_on", rows: Array.from(counts, ([type, count]) => ({ type, count })) });
  }
  return visibleGroups;
}
