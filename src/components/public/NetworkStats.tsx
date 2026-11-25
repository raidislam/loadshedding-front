import { Building2, House, MapPinned, UtilityPole } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getNetworkCounts } from "@/lib/server/publicApi";

// SERVER COMPONENT: live network size from the API (cached for a few minutes)
export async function NetworkStats() {
  const counts = await getNetworkCounts();

  const stats = [
    { label: "Distribution zones", value: counts.zones, icon: MapPinned },
    { label: "Substations", value: counts.substations, icon: Building2 },
    { label: "Feeders", value: counts.feeders, icon: UtilityPole },
    { label: "Service areas", value: counts.areas, icon: House },
  ];

  return (
    <StatsGrid>
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-3 rounded-xl p-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-electric/15 text-sky-300 ring-1 ring-electric/30">
            <s.icon className="size-5" />
          </span>
          <div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        </div>
      ))}
    </StatsGrid>
  );
}

// Shown by <Suspense> while the numbers load
export function NetworkStatsSkeleton() {
  return (
    <StatsGrid>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <Skeleton className="size-11 rounded-xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-10 bg-white/10" />
            <Skeleton className="h-3 w-24 bg-white/10" />
          </div>
        </div>
      ))}
    </StatsGrid>
  );
}

function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-[#0b1530]/80 p-3 shadow-2xl shadow-electric/10 backdrop-blur-xl md:grid-cols-4">
      {children}
    </div>
  );
}
