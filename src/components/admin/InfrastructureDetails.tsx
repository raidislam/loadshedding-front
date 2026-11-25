"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, ArrowLeft, Building2, Map, Users, Zap } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { DetailList, DetailSkeleton } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { HierarchyBreadcrumb } from "@/components/shared/HierarchyBreadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { OUTAGE_STATUS, OUTAGE_TYPE } from "@/constants/labels";
import { useDetail } from "@/hooks/useApi";
import { api, ApiError, errorMessage } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Area, Feeder, Outage, Substation, Zone } from "@/types/api";

const linkClass = "font-medium text-primary hover:underline";

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={buttonVariants({ variant: "outline", size: "sm" })}>
      <ArrowLeft /> {label}
    </Link>
  );
}

// Loading / 404 / other error, shared by all four pages
function DetailState({ error, what, href }: { error: unknown; what: string; href: string }) {
  if (error instanceof ApiError && error.status === 404) {
    return (
      <Card>
        <EmptyState
          title={`${what} not found`}
          description="It may have been deleted."
          action={<BackLink href={href} label="Back to list" />}
        />
      </Card>
    );
  }
  return <p className="text-destructive">{errorMessage(error)}</p>;
}

// "How many?" using meta.total of a list with limit=1
function useCount(resource: string, query: Record<string, string>) {
  return useQuery({
    queryKey: [resource, "count", query],
    queryFn: async () => (await api<unknown[]>(`/${resource}`, { query: { ...query, limit: 1 } })).meta?.total ?? 0,
  });
}

// Latest outages under a zone / substation / feeder / area
function RecentOutages({ filter }: { filter: Record<string, string> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["outages", "list", { ...filter, limit: 5 }],
    queryFn: async () => (await api<Outage[]>("/outages", { query: { ...filter, limit: 5, sortBy: "startTime", sortOrder: "desc" } })).data,
  });

  const columns: Column<Outage>[] = [
    {
      header: "Outage",
      cell: (o) => (
        <Link href={`/admin/outages/${o.id}`} className={linkClass}>
          {o.title}
        </Link>
      ),
    },
    { header: "Area", cell: (o) => o.area.name },
    { header: "Type", cell: (o) => <StatusBadge {...OUTAGE_TYPE[o.type]} /> },
    { header: "Status", cell: (o) => <StatusBadge {...OUTAGE_STATUS[o.status]} /> },
    { header: "Start", cell: (o) => formatDateTime(o.startTime), className: "hidden md:table-cell" },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>Latest outages</CardTitle>
      </CardHeader>
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(o) => o.id}
        loading={isLoading}
        emptyTitle="No outages recorded"
        emptyDescription="Outages in this part of the network will appear here."
      />
    </Card>
  );
}

// ---------------- Zone ----------------
export function ZoneDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: zone, isLoading, error } = useDetail<Zone>("zones", id);
  const feeders = useCount("feeders", { zoneId: id });
  const areas = useCount("areas", { zoneId: id });

  if (isLoading) return <DetailSkeleton />;
  if (error || !zone) return <DetailState error={error} what="Zone" href="/admin/zones" />;

  const substations = zone.substations ?? [];
  const columns: Column<(typeof substations)[number]>[] = [
    {
      header: "Substation",
      cell: (s) => (
        <Link href={`/admin/substations/${s.id}`} className={linkClass}>
          {s.name}
        </Link>
      ),
    },
    { header: "Code", cell: (s) => s.code },
    { header: "Capacity", cell: (s) => (s.capacityMW ? `${s.capacityMW} MW` : "-") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb zone={zone} current="zone" />
        <PageHeader title={zone.name} description={zone.description ?? undefined} actions={<BackLink href="/admin/zones" label="All zones" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Substations" value={substations.length} icon={Building2} />
        <StatCard title="Feeders" value={feeders.data ?? "-"} icon={Zap} tone="warning" />
        <StatCard title="Areas" value={areas.data ?? "-"} icon={Map} tone="success" />
      </div>
      <DetailList
        title="Zone details"
        items={[
          { label: "Zone code", value: zone.code },
          { label: "Created", value: formatDate(zone.createdAt) },
        ]}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Substations in this zone</CardTitle>
        </CardHeader>
        <DataTable columns={columns} rows={substations} getRowId={(s) => s.id} emptyTitle="No substations yet" emptyDescription="Add one from the Substations page." />
      </Card>
      <RecentOutages filter={{ zoneId: zone.id }} />
    </div>
  );
}

// ---------------- Substation ----------------
export function SubstationDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: substation, isLoading, error } = useDetail<Substation>("substations", id);
  const areas = useCount("areas", { substationId: id });

  if (isLoading) return <DetailSkeleton />;
  if (error || !substation) return <DetailState error={error} what="Substation" href="/admin/substations" />;

  const feeders = substation.feeders ?? [];
  const columns: Column<(typeof feeders)[number]>[] = [
    {
      header: "Feeder",
      cell: (f) => (
        <Link href={`/admin/feeders/${f.id}`} className={linkClass}>
          {f.name}
        </Link>
      ),
    },
    { header: "Code", cell: (f) => f.code },
    { header: "Voltage", cell: (f) => (f.voltageKV ? `${f.voltageKV} kV` : "-") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb zone={substation.zone} substation={substation} current="substation" />
        <PageHeader title={substation.name} description={`Substation ${substation.code}`} actions={<BackLink href="/admin/substations" label="All substations" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Feeders" value={feeders.length} icon={Zap} tone="warning" />
        <StatCard title="Areas served" value={areas.data ?? "-"} icon={Map} tone="success" />
        <StatCard title="Capacity" value={substation.capacityMW ? `${substation.capacityMW} MW` : "-"} icon={Activity} />
      </div>
      <DetailList
        title="Substation details"
        items={[
          { label: "Code", value: substation.code },
          { label: "Zone", value: substation.zone ? <Link href={`/admin/zones/${substation.zone.id}`} className={linkClass}>{substation.zone.name}</Link> : "-" },
          { label: "Address", value: substation.address ?? "-" },
          { label: "Created", value: formatDate(substation.createdAt) },
        ]}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Feeders from this substation</CardTitle>
        </CardHeader>
        <DataTable columns={columns} rows={feeders} getRowId={(f) => f.id} emptyTitle="No feeders yet" emptyDescription="Add one from the Feeders page." />
      </Card>
      <RecentOutages filter={{ substationId: substation.id }} />
    </div>
  );
}

// ---------------- Feeder ----------------
export function FeederDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: feeder, isLoading, error } = useDetail<Feeder>("feeders", id);

  if (isLoading) return <DetailSkeleton />;
  if (error || !feeder) return <DetailState error={error} what="Feeder" href="/admin/feeders" />;

  const areas = feeder.areas ?? [];
  const columns: Column<(typeof areas)[number]>[] = [
    {
      header: "Area",
      cell: (a) => (
        <Link href={`/admin/areas/${a.id}`} className={linkClass}>
          {a.name}
        </Link>
      ),
    },
    { header: "Code", cell: (a) => a.code },
  ];

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb zone={feeder.substation?.zone} substation={feeder.substation} feeder={feeder} current="feeder" />
        <PageHeader title={feeder.name} description={`Feeder ${feeder.code}`} actions={<BackLink href="/admin/feeders" label="All feeders" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Connected areas" value={areas.length} icon={Map} tone="success" />
        <StatCard title="Voltage" value={feeder.voltageKV ? `${feeder.voltageKV} kV` : "-"} icon={Zap} tone="warning" />
      </div>
      <DetailList
        title="Feeder details"
        items={[
          { label: "Code", value: feeder.code },
          { label: "Substation", value: feeder.substation ? <Link href={`/admin/substations/${feeder.substation.id}`} className={linkClass}>{feeder.substation.name}</Link> : "-" },
          { label: "Zone", value: feeder.substation?.zone.name ?? "-" },
          { label: "Created", value: formatDate(feeder.createdAt) },
        ]}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Areas on this feeder</CardTitle>
        </CardHeader>
        <DataTable columns={columns} rows={areas} getRowId={(a) => a.id} emptyTitle="No areas yet" emptyDescription="Add one from the Areas page." />
      </Card>
      <RecentOutages filter={{ feederId: feeder.id }} />
    </div>
  );
}

// ---------------- Area ----------------
export function AreaDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: area, isLoading, error } = useDetail<Area>("areas", id);

  if (isLoading) return <DetailSkeleton />;
  if (error || !area) return <DetailState error={error} what="Area" href="/admin/areas" />;

  const { feeder } = area;
  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb zone={feeder.substation.zone} substation={feeder.substation} feeder={feeder} area={area} current="area" />
        <PageHeader title={area.name} description={`Area ${area.code}`} actions={<BackLink href="/admin/areas" label="All areas" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Customers" value={area._count?.customers ?? 0} icon={Users} />
        <StatCard title="Outages recorded" value={area._count?.outages ?? 0} icon={Activity} tone="danger" />
      </div>
      <DetailList
        title="Area details"
        items={[
          { label: "Code", value: area.code },
          { label: "Feeder", value: <Link href={`/admin/feeders/${feeder.id}`} className={linkClass}>{feeder.name}</Link> },
          { label: "Substation", value: <Link href={`/admin/substations/${feeder.substation.id}`} className={linkClass}>{feeder.substation.name}</Link> },
          { label: "Zone", value: <Link href={`/admin/zones/${feeder.substation.zone.id}`} className={linkClass}>{feeder.substation.zone.name}</Link> },
          { label: "Created", value: formatDate(area.createdAt) },
        ]}
      />
      <RecentOutages filter={{ areaId: area.id }} />
    </div>
  );
}
