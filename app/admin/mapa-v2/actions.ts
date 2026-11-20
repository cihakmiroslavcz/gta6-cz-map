"use server";

import { revalidatePath } from "next/cache";
import { pointLinkParam } from "@/components/map/map-points";
import { mapV2Path, readMapLocation } from "@/lib/map-location";
import { readPointFields, type SavePointResult } from "@/lib/map-point-fields";
import { isMapV2PointId } from "@/lib/map-point-id";
import { getMapAdminClient } from "@/lib/supabase/map-server";
import { mapV2PointColumns, readMapV2Access, toMapV2Point } from "@/lib/supabase/map-v2";

export async function saveMapV2Point(_previous: SavePointResult, formData: FormData): Promise<SavePointResult> {
  const client = await getMapAdminClient();
  if (!client) return { error: "Pro uložení bodu do mapy V2 se přihlas jako správce." };
  const access = await readMapV2Access(client);
  if (!access.allowed) return { error: access.error ?? "Tvůj účet nemá přístup k mapě V2." };

  const pointId = formData.get(pointLinkParam);
  if (pointId !== null && !isMapV2PointId(pointId)) return { error: "Bod V2 se nepodařilo najít." };

  const location = readMapLocation({ x: formData.get("x"), y: formData.get("y"), z: "0" });
  if (!location) return { error: "Zkontroluj souřadnice bodu." };

  const fields = readPointFields(formData);
  if (!fields) return { error: "Zkontroluj název, popis, kategorii a typ bodu." };

  const { name, description, type } = fields;
  const { x, y } = location;
  const values = { name, description, type, x, y };
  const table = client.from("map_v2_points");
  const query = pointId ? table.update(values).eq("id", pointId.slice(1)) : table.insert(values);
  const { data, error } = await query.select(mapV2PointColumns).maybeSingle();

  if (error) {
    console.error("Could not save map_v2_points", error.code);
    if (error.code === "23502") {
      return { error: "Ukládání bodů bez zdroje vyžaduje migraci map_v2_optional_source." };
    }
    return { error: "Bod V2 se nepodařilo uložit. Zkus to znovu." };
  }
  if (!data) return { error: "Bod V2 se nepodařilo najít." };
  const point = toMapV2Point(data);
  if (!point) return { error: "Uložený bod V2 má neznámý typ." };

  revalidatePath(mapV2Path);
  return { point };
}
