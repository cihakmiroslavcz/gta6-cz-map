import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isPublishedPointCategory, isPublishedPointType, type MapPoint } from "@/components/map/map-points";
import { isSuggestionId, suggestionPointId } from "@/lib/map-point-id";
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

export async function readApprovedPoints(suggestionId?: string): Promise<MapPoint[] | null> {
  const client = createPublicClient();
  if (!client) return [];

  const points: MapPoint[] = [];
  const pageSize = 1000;
  let after: string | undefined;

  do {
    const query = client.from("map_suggestion_reviews")
      .select("suggestion_id,name,description,category,type,x,y")
      .eq("decision", "approved")
      .order("suggestion_id")
      .limit(pageSize);
    if (suggestionId) query.eq("suggestion_id", suggestionId);
    if (after) query.gt("suggestion_id", after);
    const { data, error } = await query;
    if (error) {
      // Keep serving the existing map until the review migration is applied.
      if (error.code === "PGRST205" || error.code === "42P01") return [];
      console.error("Could not read map_suggestion_reviews", error.code);
      return null;
    }

    for (const row of data) {
      if (!isSuggestionId(row.suggestion_id) || !isPublishedPointCategory(row.category) || !isPublishedPointType(row.type)) {
        continue;
      }
      points.push({
        id: suggestionPointId(row.suggestion_id),
        name: row.name,
        description: row.description,
        category: row.category,
        type: row.type,
        x: Number(row.x),
        y: Number(row.y),
      });
    }
    after = data.length === pageSize ? data.at(-1)?.suggestion_id : undefined;
  } while (after);

  return points;
}
