"use server";

import { readPointClassification } from "@/components/map/map-points";
import { readMapLocation } from "@/lib/map-location";
import { createPublicClient } from "@/lib/supabase/map-server";

export type SuggestionResult = { saved: true } | { saved: false; error: string } | null;

export async function submitSuggestion(_previous: SuggestionResult, formData: FormData): Promise<SuggestionResult> {
  const location = readMapLocation({ x: formData.get("x"), y: formData.get("y"), z: formData.get("z") });
  const rawName = formData.get("name");
  const rawDescription = formData.get("description");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";

  if (!location) return { saved: false, error: "Vyber místo znovu přímo na mapě." };
  if (!name || name.length > 120 || !description || description.length > 3000) {
    return { saved: false, error: "Zkontroluj název místa a popis." };
  }

  const category = formData.get("category");
  const type = formData.get("type");
  const classification = readPointClassification(category, type);
  if ((category || type) && !classification) {
    return { saved: false, error: "Vyber typ místa, který patří do zvolené kategorie." };
  }

  const client = createPublicClient();
  if (!client) return { saved: false, error: "Ukládání návrhů zatím není připojené." };

  const { error } = await client.from("map_suggestions").insert({ name, description, ...location, ...classification });
  if (error) {
    console.error("Could not save map_suggestions", error.code);
    return { saved: false, error: "Návrh se nepodařilo uložit. Zkus to prosím znovu." };
  }

  return { saved: true };
}
