// Makes the next ID for a list, e.g. nextId("zone", ["zone-1","zone-2"]) -> "zone-3".
export function nextId(prefix: string, existingIds: string[]): string {
  const numbers = existingIds
    .map((id) => Number(id.split("-").pop()))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `${prefix}-${max + 1}`;
}
