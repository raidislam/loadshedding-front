"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { DetailList, DetailSkeleton } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { HierarchyBreadcrumb } from "@/components/shared/HierarchyBreadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OPERATIONAL_STATUS,
  OUTAGE_STATUS,
  OUTAGE_TYPE,
} from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { getAreas } from "@/services/areas";
import { getFeeders } from "@/services/feeders";
import { getOutages } from "@/services/outages";
import { getSubstations } from "@/services/substations";
import { getZones } from "@/services/zones";
import { Activity, Building2, Map, Users } from "lucide-react";
import type { Area, Feeder, Outage, Substation } from "@/types";

// All four detail pages need the whole network, so they share one loader.
async function loadNetwork() {
  const [zones, substations, feeders, areas, outages] = await Promise.all([
    getZones(),
    getSubstations(),
    getFeeders(),
    getAreas(),
    getOutages(),
  ]);
  return { zones, substations, feeders, areas, outages };
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      <ArrowLeft /> {label}
    </Link>
  );
}

function NotFound({ what, href }: { what: string; href: string }) {
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

const linkClass = "font-medium text-primary hover:underline";

// ---------------- Zone ----------------
export function ZoneDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useLoad(loadNetwork);

  if (loading) return <DetailSkeleton />;
  if (error || !data) return <p className="text-destructive">{error}</p>;
  const zone = data.zones.find((z) => z.id === id);
  if (!zone) return <NotFound what="Zone" href="/admin/zones" />;

  const substations = data.substations.filter((s) => s.zoneId === zone.id);
  const feeders = data.feeders.filter((f) =>
    substations.some((s) => s.id === f.substationId),
  );
  const areas = data.areas.filter((a) => a.zoneId === zone.id);
  const customers = areas.reduce((sum, a) => sum + a.customerCount, 0);

  const columns: Column<Substation>[] = [
    {
      header: "Substation",
      cell: (s) => (
        <Link href={`/admin/substations/${s.id}`} className={linkClass}>
          {s.name}
        </Link>
      ),
    },
    { header: "Code", cell: (s) => s.code },
    { header: "Capacity", cell: (s) => `${s.capacityMVA} MVA` },
    {
      header: "Feeders",
      cell: (s) => feeders.filter((f) => f.substationId === s.id).length,
    },
    {
      header: "Status",
      cell: (s) => <StatusBadge {...OPERATIONAL_STATUS[s.status]} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb zone={zone} current="zone" />
        <PageHeader
          title={zone.name}
          description={zone.description}
          actions={<BackLink href="/admin/zones" label="All zones" />}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Substations"
          value={substations.length}
          icon={Building2}
        />
        <StatCard
          title="Feeders"
          value={feeders.length}
          icon={Activity}
          tone="warning"
        />
        <StatCard
          title="Areas"
          value={areas.length}
          icon={Map}
          tone="success"
        />
        <StatCard
          title="Customers"
          value={formatNumber(customers)}
          icon={Users}
        />
      </div>
      <DetailList
        title="Zone details"
        items={[
          { label: "Zone code", value: zone.code },
          {
            label: "Status",
            value: <StatusBadge {...OPERATIONAL_STATUS[zone.status]} />,
          },
          { label: "Created", value: formatDate(zone.createdAt) },
          {
            label: "Outages recorded",
            value: data.outages.filter((o) => o.zoneId === zone.id).length,
          },
        ]}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Substations in this zone</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          rows={substations}
          getRowId={(s) => s.id}
          emptyTitle="No substations yet"
          emptyDescription="Add a substation from the Substations page."
        />
      </Card>
    </div>
  );
}

// ---------------- Substation ----------------
export function SubstationDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useLoad(loadNetwork);

  if (loading) return <DetailSkeleton />;
  if (error || !data) return <p className="text-destructive">{error}</p>;
  const substation = data.substations.find((s) => s.id === id);
  if (!substation)
    return <NotFound what="Substation" href="/admin/substations" />;

  const zone = data.zones.find((z) => z.id === substation.zoneId);
  const feeders = data.feeders.filter((f) => f.substationId === substation.id);
  const areaCount = (feederId: string) =>
    data.areas.filter((a) => a.feederId === feederId).length;

  const columns: Column<Feeder>[] = [
    {
      header: "Feeder",
      cell: (f) => (
        <Link href={`/admin/feeders/${f.id}`} className={linkClass}>
          {f.code}
        </Link>
      ),
    },
    { header: "Capacity", cell: (f) => `${f.capacityMW} MW` },
    { header: "Connected areas", cell: (f) => areaCount(f.id) },
    {
      header: "Status",
      cell: (f) => <StatusBadge {...OPERATIONAL_STATUS[f.status]} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb
          zone={zone}
          substation={substation}
          current="substation"
        />
        <PageHeader
          title={`${substation.name} Substation`}
          description={`Code ${substation.code}`}
          actions={
            <BackLink href="/admin/substations" label="All substations" />
          }
        />
      </div>
      <DetailList
        title="Substation details"
        items={[
          {
            label: "Distribution zone",
            value: zone ? (
              <Link href={`/admin/zones/${zone.id}`} className={linkClass}>
                {zone.name}
              </Link>
            ) : (
              "-"
            ),
          },
          { label: "Capacity", value: `${substation.capacityMVA} MVA` },
          {
            label: "Status",
            value: <StatusBadge {...OPERATIONAL_STATUS[substation.status]} />,
          },
          { label: "Connected feeders", value: feeders.length },
        ]}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Feeders from this substation</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          rows={feeders}
          getRowId={(f) => f.id}
          emptyTitle="No feeders yet"
          emptyDescription="Add a feeder from the Feeders page."
        />
      </Card>
    </div>
  );
}

// ---------------- Feeder ----------------
export function FeederDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useLoad(loadNetwork);

  if (loading) return <DetailSkeleton />;
  if (error || !data) return <p className="text-destructive">{error}</p>;
  const feeder = data.feeders.find((f) => f.id === id);
  if (!feeder) return <NotFound what="Feeder" href="/admin/feeders" />;

  const substation = data.substations.find((s) => s.id === feeder.substationId);
  const zone = data.zones.find((z) => z.id === substation?.zoneId);
  const areas = data.areas.filter((a) => a.feederId === feeder.id);

  const columns: Column<Area>[] = [
    {
      header: "Area",
      cell: (a) => (
        <Link href={`/admin/areas/${a.id}`} className={linkClass}>
          {a.name}
        </Link>
      ),
    },
    { header: "Code", cell: (a) => a.code },
    { header: "Customers", cell: (a) => formatNumber(a.customerCount) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb
          zone={zone}
          substation={substation}
          feeder={feeder}
          current="feeder"
        />
        <PageHeader
          title={`Feeder ${feeder.code}`}
          actions={<BackLink href="/admin/feeders" label="All feeders" />}
        />
      </div>
      <DetailList
        title="Feeder details"
        items={[
          {
            label: "Substation",
            value: substation ? (
              <Link
                href={`/admin/substations/${substation.id}`}
                className={linkClass}
              >
                {substation.name}
              </Link>
            ) : (
              "-"
            ),
          },
          { label: "Distribution zone", value: zone?.name ?? "-" },
          { label: "Capacity", value: `${feeder.capacityMW} MW` },
          {
            label: "Status",
            value: <StatusBadge {...OPERATIONAL_STATUS[feeder.status]} />,
          },
        ]}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Areas connected to this feeder</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          rows={areas}
          getRowId={(a) => a.id}
          emptyTitle="No areas connected"
          emptyDescription="Add an area from the Areas page."
        />
      </Card>
    </div>
  );
}

// ---------------- Area ----------------
export function AreaDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useLoad(loadNetwork);

  if (loading) return <DetailSkeleton />;
  if (error || !data) return <p className="text-destructive">{error}</p>;
  const area = data.areas.find((a) => a.id === id);
  if (!area) return <NotFound what="Area" href="/admin/areas" />;

  const zone = data.zones.find((z) => z.id === area.zoneId);
  const substation = data.substations.find((s) => s.id === area.substationId);
  const feeder = data.feeders.find((f) => f.id === area.feederId);
  const outages = data.outages.filter((o) => o.areaId === area.id);

  const columns: Column<Outage>[] = [
    {
      header: "Outage",
      cell: (o) => (
        <Link href={`/admin/outages/${o.id}`} className={linkClass}>
          {o.id}
        </Link>
      ),
    },
    { header: "Type", cell: (o) => <StatusBadge {...OUTAGE_TYPE[o.type]} /> },
    {
      header: "Status",
      cell: (o) => <StatusBadge {...OUTAGE_STATUS[o.status]} />,
    },
    { header: "Start time", cell: (o) => formatDateTime(o.startTime) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb
          zone={zone}
          substation={substation}
          feeder={feeder}
          area={area}
          current="area"
        />
        <PageHeader
          title={area.name}
          description={`Area code ${area.code}`}
          actions={<BackLink href="/admin/areas" label="All areas" />}
        />
      </div>
      <DetailList
        title="Area details"
        items={[
          { label: "Customers", value: formatNumber(area.customerCount) },
          { label: "Distribution zone", value: zone?.name ?? "-" },
          { label: "Substation", value: substation?.name ?? "-" },
          { label: "Feeder", value: feeder?.code ?? "-" },
        ]}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Outage history</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          rows={outages}
          getRowId={(o) => o.id}
          emptyTitle="No outages recorded"
          emptyDescription="This area has had no outages."
        />
      </Card>
    </div>
  );
}
