export const baseMapStorageKey = "gta6-cz-map:base-map";
export const leonidaAssetRoot = "/maps/leonida/generated";

export type BaseMap = "community" | "official";
export type LeonidaVariant = 1 | 2 | 3;
export type LeonidaStatus = "loading" | "ready" | "unavailable";

export type LeonidaManifest = {
  width: number;
  height: number;
  tileSize: number;
  variants: LeonidaVariant[];
};

// Poster origin and width in Yanis zoom-zero pixels. Height follows the poster aspect ratio.
// Approximate fit from the northwest cape and southwest airfield.
export const leonidaAlignment = { left: 158, top: 157, width: 481 };

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export async function readLeonidaManifest(signal: AbortSignal): Promise<LeonidaManifest> {
  const response = await fetch(`${leonidaAssetRoot}/manifest.json`, { signal });
  if (!response.ok) throw new Error("Leonida manifest unavailable");

  const manifest: unknown = await response.json();
  if (!manifest || typeof manifest !== "object" ||
      !("version" in manifest) || manifest.version !== 1 ||
      !("width" in manifest) || !isPositiveInteger(manifest.width) ||
      !("height" in manifest) || !isPositiveInteger(manifest.height) ||
      !("tileSize" in manifest) || !isPositiveInteger(manifest.tileSize) ||
      !("variants" in manifest) || !Array.isArray(manifest.variants)) {
    throw new Error("Invalid Leonida manifest");
  }
  const { width, height, tileSize, variants: available } = manifest;
  const variants = ([1, 2, 3] as const).filter((factor) => available.includes(factor));
  if (variants[0] !== 1) throw new Error("Original Leonida level missing");

  return { width, height, tileSize, variants };
}
