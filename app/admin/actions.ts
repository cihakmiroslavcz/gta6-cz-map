"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pointLinkParam } from "@/components/map/map-points";
import { readMapLocation } from "@/lib/map-location";
import { readPointFields, readVerificationSource, type SavePointResult } from "@/lib/map-point-fields";
import { isMapPointId, isSuggestionId } from "@/lib/map-point-id";
import { createSessionClient, getMapAdminClient, isMapAdmin, readMapPoints } from "@/lib/supabase/map-server";

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

export async function addPoint(_previous: SavePointResult, formData: FormData): Promise<SavePointResult> {
  const client = await getMapAdminClient();
  if (!client) return { error: "Pro přidání bodu se znovu přihlas jako správce." };

  const location = readMapLocation({ x: formData.get("x"), y: formData.get("y"), z: formData.get("z") });
  if (!location) return { error: "Vyber místo znovu přímo na mapě." };

  const fields = readPointFields(formData);
  if (!fields) return { error: "Zkontroluj název, popis, kategorii a typ bodu." };
  const verificationSource = readVerificationSource(formData.get("verificationSource"));
  if (!verificationSource) return { error: "Přidej platný odkaz na doklad polohy ze hry." };

  const { data, error } = await client.from("map_admin_points")
    .insert({ ...fields, x: location.x, y: location.y, verification_source: verificationSource })
    .select("id,x,y")
    .single();
  if (error) {
    console.error("Could not save map_admin_points", error.code);
    if (error.code === "PGRST205" || error.code === "42P01") {
      return { error: "Ukládání bodů vyžaduje migraci databáze map_admin_points." };
    }
    if (error.code === "PGRST204" || error.code === "42703") {
      return { error: "Ukládání dokladu vyžaduje migraci databáze map_point_verification." };
    }
    return { error: "Bod se nepodařilo uložit. Zkus to znovu." };
  }

  revalidateMap();
  return {
    point: {
      ...fields,
      id: `A${data.id}`,
      description: fields.description ?? undefined,
      x: Number(data.x),
      y: Number(data.y),
      verificationSource,
    },
  };
}

export async function editPoint(_previous: SavePointResult, formData: FormData): Promise<SavePointResult> {
  const client = await getMapAdminClient();
  if (!client) return { error: "Pro úpravu bodu se znovu přihlas jako správce." };

  const pointId = formData.get(pointLinkParam);
  if (!isMapPointId(pointId)) return { error: "Bod se nepodařilo najít." };
  const fields = readPointFields(formData);
  if (!fields) return { error: "Zkontroluj název, popis, kategorii a typ bodu." };

  const points = await readMapPoints(pointId);
  if (!points) return { error: "Bod se nepodařilo načíst. Zkus to znovu." };
  const [point] = points;
  if (!point) return { error: "Bod se nepodařilo najít." };

  const { error } = await client.from("map_point_edits").upsert({ point_id: pointId, ...fields });
  if (error) {
    console.error("Could not save map_point_edits", error.code);
    if (error.code === "PGRST205" || error.code === "42P01") {
      return { error: "Úpravy bodů vyžadují migraci databáze map_point_edits." };
    }
    return { error: "Úpravu se nepodařilo uložit. Zkus to znovu." };
  }

  revalidateMap();
  return { point: { ...point, ...fields, description: fields.description ?? undefined } };
}

export async function hidePoint(_previous: string | null, formData: FormData): Promise<string | null> {
  const client = await getMapAdminClient();
  if (!client) return "Pro skrytí bodu se znovu přihlas jako správce.";

  const pointId = formData.get(pointLinkParam);
  if (!isMapPointId(pointId)) {
    return "Bod se nepodařilo najít.";
  }
  const points = await readMapPoints(pointId);
  if (!points?.length) return "Bod se nepodařilo najít.";

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
    const fields = readPointFields(formData);
    if (!fields?.description) {
      return "Doplň platný název, popis, kategorii a typ bodu.";
    }
    const verificationSource = readVerificationSource(formData.get("verificationSource"));
    if (!verificationSource) return "Přidej platný odkaz na doklad polohy ze hry.";

    const { data: suggestion, error } = await client.from("map_suggestions").select("x,y").eq("id", id).maybeSingle();
    if (error || !suggestion) return "Souřadnice návrhu se nepodařilo načíst.";
    values = {
      ...values,
      ...fields,
      description: fields.description,
      x: Number(suggestion.x),
      y: Number(suggestion.y),
      verification_source: verificationSource,
    };
  }

  const { error } = await client.from("map_suggestion_reviews").insert(values);
  if (error?.code === "23505") {
    revalidatePath("/admin");
    return "Návrh už byl vyřízený.";
  }
  if (error?.code === "PGRST204" || error?.code === "42703") {
    return "Ukládání dokladu vyžaduje migraci databáze map_point_verification.";
  }
  if (error) return "Návrh se nepodařilo uložit. Zkus to znovu.";

  revalidateMap();
  return null;
}
