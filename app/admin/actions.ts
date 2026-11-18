"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mapPoints, pointLinkParam } from "@/components/map/map-points";
import { createSessionClient, getMapAdminClient, isMapAdmin } from "@/lib/supabase/map-server";

export async function signIn(formData: FormData) {
  const client = await createSessionClient();
  const email = formData.get("email");
  const password = formData.get("password");
  if (!client || typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    redirect("/admin?stav=prihlaseni");
  }

  const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) redirect("/admin?stav=prihlaseni");
  if (!await isMapAdmin(client)) {
    await client.auth.signOut({ scope: "local" });
    redirect("/admin?stav=prihlaseni");
  }

  redirect("/admin");
}

export async function signOut() {
  const client = await createSessionClient();
  if (client) await client.auth.signOut({ scope: "local" });
  redirect("/admin");
}

function revalidateMap() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/nahlasit-chybu");
}

export async function hidePoint(_previous: string | null, formData: FormData): Promise<string | null> {
  const client = await getMapAdminClient();
  if (!client) return "Pro skrytí bodu se znovu přihlas jako správce.";

  const pointId = formData.get(pointLinkParam);
  if (typeof pointId !== "string" || !mapPoints.some(({ id }) => id === pointId)) {
    return "Bod se nepodařilo najít.";
  }

  const { error } = await client.from("map_hidden_points").upsert(
    { point_id: pointId },
    { onConflict: "point_id", ignoreDuplicates: true },
  );
  if (error) return "Bod se nepodařilo skrýt. Zkus to znovu.";

  revalidateMap();
  return null;
}

export async function restorePoint(formData: FormData) {
  const client = await getMapAdminClient();
  if (!client) redirect("/admin?stav=prihlaseni");

  const pointId = formData.get(pointLinkParam);
  if (typeof pointId !== "string" || !/^L\d+$/.test(pointId)) redirect("/admin?stav=chyba");

  const { error } = await client.from("map_hidden_points").delete().eq("point_id", pointId);
  if (error) redirect("/admin?stav=chyba");

  revalidateMap();
  redirect("/admin?stav=obnoveno");
}
