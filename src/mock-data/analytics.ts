import type { MonthlyOutageStat } from "@/types";

// Past months are fixed demo numbers. Zone and type charts are calculated from live outage data.
export const monthlyOutageStats: MonthlyOutageStat[] = [
  { month: "Jun", scheduled: 14, unexpected: 9 },
  { month: "Jul", scheduled: 18, unexpected: 12 },
  { month: "Aug", scheduled: 16, unexpected: 15 },
  { month: "Sep", scheduled: 12, unexpected: 8 },
  { month: "Oct", scheduled: 15, unexpected: 10 },
  { month: "Nov", scheduled: 6, unexpected: 5 },
];
