import { readPointClassification, type MapPoint } from "@/components/map/map-points";

export type SavePointResult = { point: MapPoint } | { error: string } | null;

export function readPointFields(formData: FormData) {
  const rawName = formData.get("name");
  const rawDescription = formData.get("description");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
  const classification = readPointClassification(formData.get("category"), formData.get("type"));
  if (!name || name.length > 120 || description.length > 3000 || !classification) {
    return null;
  }
  return { name, description: description || null, ...classification };
}

export function readVerificationSource(value: unknown) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!/^https?:\/\/\S+$/i.test(input) || input.length > 1000) return null;

  try {
    const url = new URL(input);
    return url.href.length <= 1000 && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
