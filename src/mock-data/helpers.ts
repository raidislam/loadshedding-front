// Seed dates are created relative to "now" so the demo always looks current
// (for example "next scheduled outage" is always in the future).

export function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

// daysFromNow(1, 10) = tomorrow at 10:00 (local time)
export function daysFromNow(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
