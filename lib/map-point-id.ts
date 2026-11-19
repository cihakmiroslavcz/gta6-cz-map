const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export const isSuggestionId = isUuid;

export function suggestionPointId(id: string) {
  return `S${id}`;
}

export function isMapPointId(value: unknown): value is string {
  return typeof value === "string" &&
    (/^L\d+$/.test(value) || isPublishedPointId(value));
}

export function isPublishedPointId(value: unknown): value is string {
  return typeof value === "string" && /^[AS]/.test(value) && isUuid(value.slice(1));
}
