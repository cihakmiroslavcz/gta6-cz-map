import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
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
