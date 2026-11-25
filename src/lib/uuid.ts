const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Every row id in the API is a UUID. */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
