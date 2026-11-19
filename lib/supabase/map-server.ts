import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isPublishedPointCategory, isPublishedPointType, type MapPoint } from "@/components/map/map-points";
import { isPublishedPointId, isUuid } from "@/lib/map-point-id";
import { sessionCookieOptions, supabaseConfig } from "./config";

export async function createSessionClient() {
  if (!supabaseConfig) return null;
  const store = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll: () => store.getAll(),
      setAll(entries) {
        try {
          for (const { name, value, options } of entries) store.set(name, value, options);
        } catch {
          // The proxy refreshes cookies before Server Components render.
        }
      },
    },
  });
}

export async function isMapAdmin(client: SupabaseClient) {
  const { data } = await client.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return false;

  const { data: admin } = await client.from("map_admins").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(admin);
}

export async function getMapAdminClient() {
  const client = await createSessionClient();
  return client && await isMapAdmin(client) ? client : null;
}

export function createPublicClient() {
  if (!supabaseConfig) return null;
  return createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
    },
  });
}

export async function readHiddenPointIds() {
  const client = createPublicClient();
  if (!client) return [];
  const { data, error } = await client.from("map_hidden_points").select("point_id");

  if (error) {
    console.error("Could not read map_hidden_points", error.code);
    return null;
  }

  return data.map(({ point_id }) => String(point_id));
}

async function readPointTable(client: SupabaseClient, prefix: "A" | "S", id?: string): Promise<MapPoint[] | null> {
  const table = prefix === "A" ? "map_admin_points" : "map_suggestion_reviews";
  const idColumn = prefix === "A" ? "id" : "suggestion_id";
  const idSelection = prefix === "A" ? "id" : "id:suggestion_id";
  const points: MapPoint[] = [];
  const pageSize = 1000;
  let after: string | undefined;

  do {
    const query = client.from(table)
      .select(`${idSelection},name,description,category,type,x,y`)
      .order(idColumn)
      .limit(pageSize);
    if (prefix === "S") query.eq("decision", "approved");
    if (id) query.eq(idColumn, id);
    if (after) query.gt(idColumn, after);
    const { data, error } = await query;
    if (error) {
      // Keep serving the existing map until the corresponding migration is applied.
      if (error.code === "PGRST205" || error.code === "42P01") return [];
      console.error(`Could not read ${table}`, error.code);
      return null;
    }

    for (const row of data) {
      const rowId = row.id;
      if (!isUuid(rowId) || !isPublishedPointCategory(row.category) || !isPublishedPointType(row.type)) {
        continue;
      }
      // Keep the published Barnacle Beauties point categorized before the database migration is applied.
      const legacyBarnacleBeauties = prefix === "S" && rowId === "93f1f9c4-dbe0-45d3-a597-fe4e8959519d"
        && row.category === "city" && row.type === "service";
      points.push({
        id: `${prefix}${rowId}`,
        name: row.name,
        description: row.description ?? undefined,
        category: legacyBarnacleBeauties ? "hairdresser" : row.category,
        type: legacyBarnacleBeauties ? "hairSalon" : row.type,
        x: Number(row.x),
        y: Number(row.y),
      });
    }
    after = data.length === pageSize ? data.at(-1)?.id : undefined;
  } while (after);

  return points;
}

export async function readPublishedPoints(pointId?: string): Promise<MapPoint[] | null> {
  const client = createPublicClient();
  if (!client) return [];
  if (pointId !== undefined) {
    if (!isPublishedPointId(pointId)) return [];
    return readPointTable(client, pointId.startsWith("A") ? "A" : "S", pointId.slice(1));
  }

  const [approvedPoints, adminPoints] = await Promise.all([
    readPointTable(client, "S"),
    readPointTable(client, "A"),
  ]);
  return approvedPoints && adminPoints ? [...approvedPoints, ...adminPoints] : null;
}
