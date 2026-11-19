"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isPublishedPointCategory, isPublishedPointType, mapPoints, pointLinkParam, type MapPoint } from "@/components/map/map-points";
import { readMapLocation } from "@/lib/map-location";
import { isMapPointId, isSuggestionId } from "@/lib/map-point-id";
import { createSessionClient, getMapAdminClient, isMapAdmin, readPublishedPoints } from "@/lib/supabase/map-server";

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

type AddPointResult = { point: MapPoint } | { error: string } | null;

export async function addPoint(_previous: AddPointResult, formData: FormData): Promise<AddPointResult> {
  const client = await getMapAdminClient();
  if (!client) return { error: "Pro přidání bodu se znovu přihlas jako správce." };

  const location = readMapLocation({ x: formData.get("x"), y: formData.get("y"), z: formData.get("z") });
  if (!location) return { error: "Vyber místo znovu přímo na mapě." };

  const rawName = formData.get("name");
  const rawDescription = formData.get("description");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
  const category = formData.get("category");
  const type = formData.get("type");
  if (!name || name.length > 120 || description.length > 3000 ||
    !isPublishedPointCategory(category) || !isPublishedPointType(type)) {
    return { error: "Zkontroluj název, popis, kategorii a typ bodu." };
  }

  const { data, error } = await client.from("map_admin_points")
    .insert({ name, description: description || null, category, type, x: location.x, y: location.y })
    .select("id,x,y")
    .single();
  if (error) {
    console.error("Could not save map_admin_points", error.code);
    if (error.code === "PGRST205" || error.code === "42P01") {
      return { error: "Ukládání bodů vyžaduje migraci databáze map_admin_points." };
    }
    return { error: "Bod se nepodařilo uložit. Zkus to znovu." };
  }

  revalidateMap();
  return { point: { id: `A${data.id}`, name, description, category, type, x: Number(data.x), y: Number(data.y) } };
}

export async function hidePoint(_previous: string | null, formData: FormData): Promise<string | null> {
  const client = await getMapAdminClient();
  if (!client) return "Pro skrytí bodu se znovu přihlas jako správce.";

  const pointId = formData.get(pointLinkParam);
  if (!isMapPointId(pointId)) {
    return "Bod se nepodařilo najít.";
  }
  const exists = pointId.startsWith("L")
    ? mapPoints.some(({ id }) => id === pointId)
    : (await readPublishedPoints(pointId))?.length;
  if (!exists) return "Bod se nepodařilo najít.";

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
  if (!isMapPointId(pointId)) redirect("/admin?stav=chyba");

  const { error } = await client.from("map_hidden_points").delete().eq("point_id", pointId);
  if (error) redirect("/admin?stav=chyba");

  revalidateMap();
  redirect("/admin?stav=obnoveno");
}

export async function reviewSuggestion(_previous: string | null, formData: FormData): Promise<string | null> {
  const client = await getMapAdminClient();
  if (!client) return "K posouzení návrhu se přihlas jako správce.";

  const id = formData.get("suggestionId");
  const decision = formData.get("decision");
  if (!isSuggestionId(id) || (decision !== "approved" && decision !== "rejected")) {
    return "Návrh se nepodařilo najít.";
  }

  let values: Record<string, string | number> = { suggestion_id: id, decision };
  if (decision === "approved") {
    const rawName = formData.get("name");
    const rawDescription = formData.get("description");
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
    const category = formData.get("category");
    const type = formData.get("type");
    if (!name || name.length > 120 || !description || description.length > 3000 ||
      !isPublishedPointCategory(category) || !isPublishedPointType(type)) {
      return "Doplň platný název, popis, kategorii a typ bodu.";
    }

    const { data: suggestion, error } = await client.from("map_suggestions").select("x,y").eq("id", id).maybeSingle();
    if (error || !suggestion) return "Souřadnice návrhu se nepodařilo načíst.";
    values = { ...values, name, description, category, type, x: Number(suggestion.x), y: Number(suggestion.y) };
  }

  const { error } = await client.from("map_suggestion_reviews").insert(values);
  if (error?.code === "23505") {
    revalidatePath("/admin");
    return "Návrh už byl vyřízený.";
  }
  if (error) return "Návrh se nepodařilo uložit. Zkus to znovu.";

  revalidateMap();
  return null;
}
