const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isSuggestionId(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export function suggestionPointId(id: string) {
  return `S${id}`;
}

export function isMapPointId(value: unknown): value is string {
  return typeof value === "string" &&
    (/^L\d+$/.test(value) || (value.startsWith("S") && isSuggestionId(value.slice(1))));
}
