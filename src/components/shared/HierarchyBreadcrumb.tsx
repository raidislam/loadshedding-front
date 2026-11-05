import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Area, Feeder, Substation, Zone } from "@/types";

interface HierarchyBreadcrumbProps {
  zone?: Zone;
  substation?: Substation;
  feeder?: Feeder;
  area?: Area;
  // The item the user is currently looking at is shown as plain text, not a link.
  current?: "zone" | "substation" | "feeder" | "area";
}

// Power Authority > Zone > Substation > Feeder > Area
// Every level links to its own details page, so admins can move up and down the network.
export function HierarchyBreadcrumb({ zone, substation, feeder, area, current }: HierarchyBreadcrumbProps) {
  const crumbs: { label: string; href: string; isCurrent: boolean }[] = [
    { label: "Power Authority", href: "/admin/zones", isCurrent: false },
  ];
  if (zone) crumbs.push({ label: zone.name, href: `/admin/zones/${zone.id}`, isCurrent: current === "zone" });
  if (substation) crumbs.push({ label: substation.name, href: `/admin/substations/${substation.id}`, isCurrent: current === "substation" });
  if (feeder) crumbs.push({ label: feeder.code, href: `/admin/feeders/${feeder.id}`, isCurrent: current === "feeder" });
  if (area) crumbs.push({ label: area.name, href: `/admin/areas/${area.id}`, isCurrent: current === "area" });

  return (
    <nav aria-label="Network hierarchy" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" />}
            {c.isCurrent ? (
              <span aria-current="page" className="font-medium text-foreground">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-primary hover:underline">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
