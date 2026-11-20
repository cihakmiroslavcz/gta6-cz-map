import type { SupabaseClient } from "@supabase/supabase-js";
import { getPointClassification, type MapPoint } from "@/components/map/map-points";

export const mapV2PointColumns = "id,name,description,type,x,y";

type MapV2PointRow = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  x: number;
  y: number;
};

export function toMapV2Point(row: MapV2PointRow): MapPoint | null {
  const classification = getPointClassification(row.type);
  if (!classification) return null;

  return {
    id: `V${row.id}`,
    name: row.name,
    description: row.description ?? undefined,
    ...classification,
    x: Number(row.x),
    y: Number(row.y),
  };
}

export async function readMapV2Access(client: SupabaseClient) {
  const { data, error } = await client.from("map_admins").select("manages_map_v2").maybeSingle();
  if (error) {
    console.error("Could not check map V2 access", error.code);
    if (error.code === "42703") return { error: "Mapa V2 vyžaduje databázovou migraci map_v2_points." };
    return { error: "Přístup k mapě V2 se nepodařilo ověřit. Zkus obnovit stránku." };
  }
  return { allowed: data?.manages_map_v2 === true };
}

export async function readMapV2Points(client: SupabaseClient): Promise<{ points: MapPoint[] } | { error: string }> {
  const points: MapPoint[] = [];
  let after: string | undefined;
  do {
    const query = client.from("map_v2_points").select(mapV2PointColumns).order("id").limit(1000);
    if (after) query.gt("id", after);
    const { data, error } = await query;
    if (error) {
      console.error("Could not read map_v2_points", error.code);
      if (error.code === "PGRST205" || error.code === "42P01") {
        return { error: "Mapa V2 vyžaduje databázovou migraci map_v2_points." };
      }
      return { error: "Body mapy V2 se nepodařilo načíst. Zkus obnovit stránku." };
    }

    for (const row of data) {
      const point = toMapV2Point(row);
      if (!point) return { error: `Bod ${row.name} má neznámý typ. Zkontroluj jeho zařazení v Supabase.` };
      points.push(point);
    }
    // Keep reading even if the project caps API responses below the requested limit.
    after = data.at(-1)?.id;
  } while (after);

  return { points };
}
