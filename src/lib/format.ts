// Date and number formatting helpers (kept in one place so every page matches).

// Always show Bangladesh time. Pages rendered on the server (Vercel runs in UTC)
// and in the browser then show the same time.
const TIME_ZONE = "Asia/Dhaka";

export function formatDateTime(iso?: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso?: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ISO date -> "2026-11-25T14:30" for <input type="datetime-local"> (the user's own clock)
export function toDateTimeInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "725.5" or 725.5 -> "৳725.50"
export function formatTaka(amount: string | number): string {
  return `৳${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// "2026-11" -> "November 2026"
export function formatBillMonth(billMonth: string): string {
  const [year, month] = billMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
